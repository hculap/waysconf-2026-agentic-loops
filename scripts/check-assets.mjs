#!/usr/bin/env node
/**
 * Acceptance checks for the image pack in design/assets/.
 *
 *   node scripts/check-assets.mjs        (npm run check:assets)
 *
 * This is the automated half of design/assets/PROMPTS.md §7. It runs against the
 * files on disk and prints every number it measured, pass or fail, so a repair
 * prompt can carry the threshold it has to beat.
 *
 * It is an author-time gate, not a page gate: it is deliberately not wired into
 * checks/run.mjs, because nothing it measures can be fixed by editing the site.
 * A failure here is fixed by editing a prompt and regenerating an image.
 *
 * Checks, in the order §7 lists them:
 *   1. Dimensions — every file is the exact size its gen:begin marker declares.
 *   2. Weight     — per-file byte budgets.
 *   3. Safe area  — scripts/check-image-safe-areas.mjs.
 *   4. Tiling     — the two textures are seamless in both axes.
 *   5. No matte   — the model did not return a framed or letterboxed print.
 */

import sharp from 'sharp'
import { readFile, stat } from 'node:fs/promises'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkSafeAreas } from './check-image-safe-areas.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const ASSETS = join(ROOT, 'design/assets')
const PROMPTS = join(ASSETS, 'PROMPTS.md')

const KB = 1024

/**
 * Byte budgets, in kilobytes. Every number here was measured from the encode the
 * pipeline actually produces and then given headroom, rather than picked because
 * it sounded disciplined. A budget no output can meet is not a gate, it is a
 * regeneration loop that never terminates.
 */
const WEIGHT_BUDGET_KB = {
  'hero-hall.jpg': 400,
  'venue-exterior.jpg': 200,
  'venue-detail.jpg': 200,
  'og-card.jpg': 200,
  'texture-grain.png': 64,
  'texture-scanline.png': 40,
  portrait: 120,
}

/** The two textures are procedural (§5) and have no gen:begin marker. */
const TEXTURES = [
  { file: 'texture-grain.png', width: 256, height: 256 },
  { file: 'texture-scanline.png', width: 256, height: 256 },
]

const results = []
const record = (check, name, pass, detail) => results.push({ check, name, pass, detail })

// ── Parse the markers, with fences stripped first (PROMPTS.md §1.8) ───────────

function parseMarkers(markdown) {
  const lines = markdown.split('\n')
  const entries = []
  let inFence = false

  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const begin = line.match(/<!--\s*gen:begin\s+(.*?)\s*-->/)
    if (!begin) continue

    const attrs = {}
    for (const m of begin[1].matchAll(/(\w+)="([^"]*)"/g)) attrs[m[1]] = m[2]
    entries.push({
      id: attrs.id,
      file: attrs.file,
      width: Number(attrs.width),
      height: Number(attrs.height),
    })
  }
  return entries
}

// ── 1 and 2: dimensions and weight ───────────────────────────────────────────

function budgetFor(file) {
  if (file in WEIGHT_BUDGET_KB) return WEIGHT_BUDGET_KB[file]
  if (file.startsWith('artist-')) return WEIGHT_BUDGET_KB.portrait
  return null
}

async function checkFile(entry) {
  const path = join(ASSETS, entry.file)

  let info
  try {
    info = await stat(path)
  } catch {
    record('dimensions', entry.file, false, 'file is missing from design/assets/')
    return null
  }

  const meta = await sharp(path).metadata()
  const actual = `${meta.width}x${meta.height}`
  const declared = `${entry.width}x${entry.height}`
  record(
    'dimensions',
    entry.file,
    actual === declared,
    actual === declared ? actual : `${actual}, declared ${declared}`,
  )

  const budget = budgetFor(entry.file)
  const kb = info.size / KB
  if (budget !== null) {
    record(
      'weight',
      entry.file,
      kb <= budget,
      `${kb.toFixed(1)} KB of ${budget} KB`,
    )
  }

  return path
}

// ── 4: tiling ────────────────────────────────────────────────────────────────

/**
 * A tile is seamless when the wrap-around edge pair is no more different than a
 * typical interior neighbour pair. Comparing the two edges to each other on its
 * own says nothing: in fine grain, every pair of adjacent columns is different.
 * So the rule is a ratio, and 3x is the line.
 */
async function checkTiling(file) {
  const path = join(ASSETS, file)
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: W, height: H, channels: C } = info
  const at = (x, y) => data[(y * W + x) * C + (C - 1)] // alpha carries the pattern

  const meanAbs = (pairs) => pairs.reduce((n, v) => n + v, 0) / pairs.length

  const colPairDiff = (x1, x2) => {
    const d = []
    for (let y = 0; y < H; y++) d.push(Math.abs(at(x1, y) - at(x2, y)))
    return meanAbs(d)
  }
  const rowPairDiff = (y1, y2) => {
    const d = []
    for (let x = 0; x < W; x++) d.push(Math.abs(at(x, y1) - at(x, y2)))
    return meanAbs(d)
  }

  const interiorCols = []
  for (let x = 1; x < W - 2; x++) interiorCols.push(colPairDiff(x, x + 1))
  const interiorRows = []
  for (let y = 1; y < H - 2; y++) interiorRows.push(rowPairDiff(y, y + 1))

  const typicalCol = meanAbs(interiorCols)
  const typicalRow = meanAbs(interiorRows)
  const seamX = colPairDiff(W - 1, 0)
  const seamY = rowPairDiff(H - 1, 0)

  const okX = seamX <= typicalCol * 3
  const okY = seamY <= typicalRow * 3
  record(
    'tiling',
    file,
    okX && okY,
    `horizontal seam ${seamX.toFixed(2)} against a typical ${typicalCol.toFixed(2)}; ` +
      `vertical seam ${seamY.toFixed(2)} against ${typicalRow.toFixed(2)}; limit is 3x`,
  )
}

// ── 5: no matte ──────────────────────────────────────────────────────────────

/**
 * Image models sometimes return a photograph mounted on a white card rather than a
 * photograph. It looks fine in a thumbnail and ruins a full-bleed hero or a card
 * that crops. The tell is a border that is flat and much lighter than the picture
 * inside it: a real frame edge varies. Only a light border counts — every image in
 * this pack is low-key, and a flat near-black edge is the house style, not a matte.
 */
const MATTE_RING_PX = 4
const MATTE_FLATNESS = 4 // max standard deviation across the ring
const MATTE_SEPARATION = 40 // min amount the ring must be lighter than the picture

async function checkMatte(file) {
  const { data, info } = await sharp(join(ASSETS, file))
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width: W, height: H, channels: C } = info
  const grey = (x, y) => {
    const i = (y * W + x) * C
    return (data[i] + data[i + 1] + data[i + 2]) / 3
  }

  const ring = []
  let interior = 0
  let interiorN = 0
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const onRing =
        x < MATTE_RING_PX || x >= W - MATTE_RING_PX || y < MATTE_RING_PX || y >= H - MATTE_RING_PX
      if (onRing) ring.push(grey(x, y))
      else {
        interior += grey(x, y)
        interiorN++
      }
    }
  }

  const ringMean = ring.reduce((n, v) => n + v, 0) / ring.length
  const ringSd = Math.sqrt(ring.reduce((n, v) => n + (v - ringMean) ** 2, 0) / ring.length)
  const interiorMean = interior / interiorN
  const matted = ringSd < MATTE_FLATNESS && ringMean - interiorMean > MATTE_SEPARATION

  record(
    'matte',
    file,
    !matted,
    `border mean ${ringMean.toFixed(1)} (sd ${ringSd.toFixed(1)}) against picture mean ` +
      `${interiorMean.toFixed(1)}` + (matted ? ' — the model returned a mounted print' : ''),
  )
}

// ── Run ──────────────────────────────────────────────────────────────────────

const markdown = await readFile(PROMPTS, 'utf8')
const entries = parseMarkers(markdown)

if (entries.length !== 16) {
  record('parse', 'PROMPTS.md', false, `found ${entries.length} gen:begin entries, expected 16`)
} else {
  record('parse', 'PROMPTS.md', true, '16 entries')
}

for (const entry of entries) {
  const path = await checkFile(entry)
  if (path && entry.file.endsWith('.jpg')) await checkMatte(entry.file)
}

for (const texture of TEXTURES) {
  await checkFile(texture)
  await checkTiling(texture.file)
}

for (const r of await checkSafeAreas()) {
  record(
    'safe area',
    `${r.file} (${r.label})`,
    r.pass,
    r.error ??
      `${(r.failFraction * 100).toFixed(2)}% of tiles below 4.5:1 (allowed 2%), ` +
        `darkest-case tile ${r.worst.toFixed(2)}:1 (floor 3:1)`,
  )
}

const failures = results.filter((r) => !r.pass)

console.log('')
for (const r of results) {
  console.log(`${r.pass ? 'pass' : 'FAIL'}  ${r.check.padEnd(11)} ${r.name.padEnd(30)} ${r.detail}`)
}
console.log('')

if (failures.length) {
  console.error(
    `${failures.length} of ${results.length} asset checks failed. ` +
      `Fix the prompt in design/assets/PROMPTS.md and regenerate; do not retouch the file.`,
  )
  process.exitCode = 1
} else {
  console.log(`All ${results.length} asset checks passed.`)
}
