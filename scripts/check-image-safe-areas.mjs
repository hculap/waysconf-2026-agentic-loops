#!/usr/bin/env node
/**
 * Check that the region of an image which carries text at render time is dark
 * enough for `color.text.primary` (#F2F4F7) to sit on it.
 *
 *   node scripts/check-image-safe-areas.mjs
 *
 * The rule is arithmetic on purpose. "Sample the region and take the worst-case
 * contrast" is not a specification: the brightest pixel, the mean and the 99th
 * percentile give three different verdicts on the same file, so two competent
 * implementations disagree and the gate becomes an opinion. What follows is the
 * whole decision procedure, and it is the same one stated in
 * design/assets/PROMPTS.md §1.7.
 *
 *   1. Take the declared region of the image, in pixels.
 *   2. Divide it into 16 x 16 px tiles, left to right and top to bottom. The
 *      remainder strip at the right and bottom edges forms narrower tiles rather
 *      than being discarded.
 *   3. For each tile compute the mean of the per-pixel WCAG relative luminance
 *      (the mean of the luminances, not the luminance of the mean colour).
 *   4. Contrast against #F2F4F7 is (0.8983 + 0.05) / (L + 0.05).
 *   5. The region PASSES when at most 2% of tiles fall below 4.5:1 and no single
 *      tile falls below 3:1.
 *
 * 16 px is roughly the smallest area a glyph stem covers at the sizes used over
 * these images, so a tile is about "one letter's worth of background". The 2%
 * allowance exists because a caption never covers a whole region, and the 3:1
 * floor stops that allowance being spent on one blown highlight sitting under a
 * word.
 *
 * Thresholds are printed on failure, so the number a repair prompt has to beat
 * travels with the failure rather than living only in the documentation.
 */

import sharp from 'sharp'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'design/assets')

const TEXT_HEX = '#F2F4F7'
const TILE = 16
const MIN_RATIO = 4.5
const FLOOR_RATIO = 3
const MAX_FAIL_FRACTION = 0.02

/**
 * Regions are fractions of the image, so they survive a change of output size.
 * `hero-hall.jpg` carries the wordmark, the dates, the venue and two buttons
 * across its lower half.
 */
export const REGIONS = [
  {
    file: 'hero-hall.jpg',
    label: 'lower half',
    region: { x: 0, y: 0.5, w: 1, h: 0.5 },
  },
]

/** WCAG 2.2 relative luminance of one sRGB channel triple. */
function luminance(r, g, b) {
  const lin = (c) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

const TEXT_L = luminance(
  parseInt(TEXT_HEX.slice(1, 3), 16),
  parseInt(TEXT_HEX.slice(3, 5), 16),
  parseInt(TEXT_HEX.slice(5, 7), 16),
)

const contrast = (l) => (TEXT_L + 0.05) / (l + 0.05)

/** The mean luminance a tile may not exceed to clear `ratio` against the text colour. */
const maxLuminanceFor = (ratio) => (TEXT_L + 0.05) / ratio - 0.05

export async function measure(path, region) {
  const img = sharp(path, { failOn: 'error' })
  const meta = await img.metadata()

  const left = Math.round(region.x * meta.width)
  const top = Math.round(region.y * meta.height)
  const width = Math.round(region.w * meta.width)
  const height = Math.round(region.h * meta.height)

  const { data, info } = await img
    .extract({ left, top, width, height })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const ch = info.channels
  const tiles = []

  for (let ty = 0; ty < info.height; ty += TILE) {
    for (let tx = 0; tx < info.width; tx += TILE) {
      const th = Math.min(TILE, info.height - ty)
      const tw = Math.min(TILE, info.width - tx)
      let sum = 0
      for (let y = ty; y < ty + th; y++) {
        for (let x = tx; x < tx + tw; x++) {
          const i = (y * info.width + x) * ch
          sum += luminance(data[i], data[i + 1], data[i + 2])
        }
      }
      tiles.push(sum / (th * tw))
    }
  }

  const ratios = tiles.map(contrast)
  const below = ratios.filter((r) => r < MIN_RATIO).length
  const worst = Math.min(...ratios)

  return {
    dimensions: `${meta.width}x${meta.height}`,
    regionPx: `${width}x${height} at ${left},${top}`,
    tiles: tiles.length,
    below,
    failFraction: below / tiles.length,
    worst,
    pass: below / tiles.length <= MAX_FAIL_FRACTION && worst >= FLOOR_RATIO,
  }
}

export async function checkSafeAreas(regions = REGIONS) {
  const results = []
  for (const entry of regions) {
    const path = join(ASSETS, entry.file)
    try {
      results.push({ ...entry, ...(await measure(path, entry.region)) })
    } catch (error) {
      results.push({ ...entry, pass: false, error: error.message })
    }
  }
  return results
}

function report(results) {
  let failed = 0
  for (const r of results) {
    if (r.error) {
      console.log(`FAIL  ${r.file} (${r.label}) — ${r.error}`)
      failed++
      continue
    }
    const line =
      `${r.pass ? 'pass' : 'FAIL'}  ${r.file} (${r.label}) — ` +
      `${r.tiles} tiles of ${TILE}x${TILE} over ${r.regionPx}; ` +
      `${(r.failFraction * 100).toFixed(2)}% below ${MIN_RATIO}:1 ` +
      `(allowed ${(MAX_FAIL_FRACTION * 100).toFixed(0)}%), ` +
      `darkest-case tile ${r.worst.toFixed(2)}:1 (floor ${FLOOR_RATIO}:1)`
    console.log(line)
    if (!r.pass) {
      failed++
      console.log(
        `      A tile clears ${MIN_RATIO}:1 against ${TEXT_HEX} at mean relative luminance ` +
          `${maxLuminanceFor(MIN_RATIO).toFixed(4)} or below, and ${FLOOR_RATIO}:1 at ` +
          `${maxLuminanceFor(FLOOR_RATIO).toFixed(4)}. Darken the region in the prompt, ` +
          `not in the CSS scrim: the scrim is applied on top of whatever this measures.`,
      )
    }
  }
  return failed
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = await checkSafeAreas()
  const failed = report(results)
  if (failed) {
    console.error(`\n${failed} safe-area check(s) failed.`)
    process.exitCode = 1
  }
}
