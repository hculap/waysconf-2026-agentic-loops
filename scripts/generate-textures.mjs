#!/usr/bin/env node
/**
 * Generate the two overlay textures procedurally.
 *
 *   node scripts/generate-textures.mjs
 *
 * These were originally specified as image-model prompts alongside the photographic
 * assets. The model refused both, returning a recitation/copyright block — which, for a
 * request that amounts to "fine noise" and "thin horizontal lines", is a filter being
 * cautious about patterns rather than a real rights problem.
 *
 * Asking a large image model for procedural noise was the wrong tool anyway. Sixty lines
 * of arithmetic produce a better result: exactly tileable, deterministic, a few kilobytes
 * instead of a few hundred, identical on every machine, and with no provenance question
 * to answer in CREDITS.md.
 *
 * Both outputs are white with the pattern carried entirely in the alpha channel, so they
 * multiply over any surface without contributing a colour of their own.
 */

import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'design/assets')
const SIZE = 256

/**
 * mulberry32 — a small, fast, seeded PRNG.
 * Seeded on purpose: the grain has to be byte-identical on every machine, or the pixel
 * diff gate starts failing for reasons that have nothing to do with the page.
 */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** White pixels; the pattern lives in alpha. */
function toRGBA(alpha) {
  const rgba = Buffer.alloc(SIZE * SIZE * 4)
  for (let i = 0; i < SIZE * SIZE; i++) {
    rgba[i * 4] = 255
    rgba[i * 4 + 1] = 255
    rgba[i * 4 + 2] = 255
    rgba[i * 4 + 3] = alpha[i]
  }
  return rgba
}

/**
 * Film grain. Per-pixel noise is tileable by construction — there is no spatial
 * structure to break at the seam.
 *
 * The distribution is the interesting part: a flat random byte reads as television
 * static. Averaging four samples approximates a normal distribution, which is what
 * film grain actually looks like, and then the range is compressed so the texture
 * sits at a usable opacity rather than needing to be dialled down in CSS.
 */
function grain() {
  const rand = rng(0x7b17e5)
  const alpha = new Uint8Array(SIZE * SIZE)
  for (let i = 0; i < alpha.length; i++) {
    const n = (rand() + rand() + rand() + rand()) / 4
    alpha[i] = Math.round(Math.min(255, Math.max(0, (n - 0.5) * 2 * 26 + 26)))
  }
  return alpha
}

/**
 * Scanlines. A 4px period over 256 divides exactly, so the tile repeats seamlessly
 * in both directions.
 *
 * Hard-edged lines alias badly the moment the element is scaled or sits on a
 * fractional pixel boundary, so the edges are softened with a raised cosine. A very
 * faint vertical variation stops the result reading as a CSS repeating-linear-gradient,
 * which is what it would otherwise look like.
 */
function scanlines() {
  const rand = rng(0x5ca41)
  const period = 4
  const alpha = new Uint8Array(SIZE * SIZE)
  for (let y = 0; y < SIZE; y++) {
    const phase = (y % period) / period
    const base = (1 - Math.cos(phase * Math.PI * 2)) / 2
    for (let x = 0; x < SIZE; x++) {
      const jitter = (rand() - 0.5) * 6
      alpha[y * SIZE + x] = Math.round(Math.min(255, Math.max(0, base * 34 + jitter)))
    }
  }
  return alpha
}

async function write(name, alpha) {
  const png = await sharp(toRGBA(alpha), { raw: { width: SIZE, height: SIZE, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toBuffer()
  await writeFile(join(OUT, name), png)
  const stats = await sharp(png).stats()
  console.log(
    `  ${name.padEnd(24)} ${(png.length / 1024).toFixed(1).padStart(6)} KB  ` +
      `mean alpha ${stats.channels[3].mean.toFixed(1)}`,
  )
}

await mkdir(OUT, { recursive: true })
console.log('\nGenerating procedural textures at 256x256, tileable, alpha-only:\n')
await write('texture-grain.png', grain())
await write('texture-scanline.png', scanlines())
console.log('\nDeterministic: the same seeds produce byte-identical files on any machine.')
