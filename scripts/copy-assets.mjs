#!/usr/bin/env node
/**
 * Copy the committed imagery from design/assets/ into public/images/.
 *
 *   node scripts/copy-assets.mjs
 *
 * Runs automatically as npm's `prebuild`, so `npm run build` cannot produce a dist/
 * whose <img> tags point at files that were never published (AC-51).
 *
 * design/ is read-only to the implementing agent and public/ is the served tree, so
 * the two need a bridge. A bridge and not a symlink: Netlify's build image does not
 * follow one out of the publish directory, and a broken image on the deployed page
 * is a class of failure no local check sees.
 *
 * The copy is idempotent. A file whose size and mtime already match is skipped, so
 * running this on every build costs nothing and the second run prints the same
 * summary as the first.
 */

import { mkdir, copyFile, readdir, stat, utimes } from 'node:fs/promises'
import { dirname, extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SOURCE = join(ROOT, 'design/assets')
const TARGET = join(ROOT, 'public/images')

/**
 * Extensions, not a filename list. design/assets/ also holds PROMPTS.md, which is
 * provenance for how the imagery was generated and has no business being served.
 */
const SERVED = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg'])

/**
 * utimes writes nanosecond precision and stat reads it back as a float, so a copy
 * that is byte-for-byte current can report an mtime a fraction of a millisecond
 * away from its source. Comparing exactly would mean copying every file on every
 * build and calling it a cache.
 */
const MTIME_TOLERANCE_MS = 2

async function statOrNull(path) {
  try {
    return await stat(path)
  } catch {
    return null
  }
}

async function main() {
  const source = await statOrNull(SOURCE)
  if (!source?.isDirectory()) {
    console.error(`copy-assets: ${relative(ROOT, SOURCE)} does not exist. Nothing to copy.`)
    process.exitCode = 1
    return
  }

  await mkdir(TARGET, { recursive: true })

  const entries = await readdir(SOURCE, { withFileTypes: true })
  let copied = 0
  let skipped = 0

  for (const entry of entries) {
    if (!entry.isFile() || !SERVED.has(extname(entry.name).toLowerCase())) continue

    const from = join(SOURCE, entry.name)
    const to = join(TARGET, entry.name)

    const [src, dest] = await Promise.all([stat(from), statOrNull(to)])
    if (dest && dest.size === src.size && Math.abs(dest.mtimeMs - src.mtimeMs) < MTIME_TOLERANCE_MS) {
      skipped++
      continue
    }

    await copyFile(from, to)
    // Carry the mtime across so the next run can tell a stale copy from a current
    // one without hashing every file.
    await utimes(to, src.atime, src.mtime)
    copied++
  }

  if (copied + skipped === 0) {
    console.error(`copy-assets: no images found in ${relative(ROOT, SOURCE)}.`)
    process.exitCode = 1
    return
  }

  console.log(
    `copy-assets: ${copied} copied, ${skipped} already current -> ${relative(ROOT, TARGET)}/`,
  )
}

await main()
