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

import { mkdir, copyFile, readdir, stat, utimes, writeFile } from 'node:fs/promises'
import sharp from 'sharp'
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
 * Served width, where it should differ from the source.
 *
 * `design/assets/` holds the masters at the sizes `design/assets/PROMPTS.md` commissions.
 * What the page needs is a different question, and it is a measured one: the artist
 * portraits render at 161, 206 and 256 CSS px at the three breakpoints, so an 800px file
 * ships roughly three times the pixels anyone sees. Lighthouse priced that at 674 KiB
 * and it cost the performance gate four points.
 *
 * 512 covers the widest render at 2× device pixel ratio, with nothing left over. The
 * master stays at 800 — this is a serving decision, not an edit to the design pack, and
 * regenerating the pack does not undo it.
 *
 * Anything not listed here is copied through untouched: the hero renders full-bleed at
 * 1440 and the venue images at 672, so their masters are already the right size.
 */
const SERVE_AT = [{ match: /^artist-\d+-/, width: 512, quality: 80 }]

/**
 * Files that need more than one served width.
 *
 * The hero is full-bleed, so it renders at 390, 768 or 1440 CSS px depending on the
 * device — and a phone downloading the 2400px master to paint 390 of them is most of
 * what stands between this page and a passing performance gate. One file cannot be
 * right for all three, so three exist and the browser picks.
 *
 * Each variant is written as `<stem>-<width><ext>`, which is the naming the `srcset` in
 * src/sections/Hero.astro expects. The unsuffixed master is copied through as well, as
 * the `src` fallback.
 */
const SRCSET_AT = [{ match: /^hero-hall\./, widths: [800, 1440, 2400], quality: 78 }]

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
  let resized = 0
  let skipped = 0

  for (const entry of entries) {
    if (!entry.isFile() || !SERVED.has(extname(entry.name).toLowerCase())) continue

    const from = join(SOURCE, entry.name)
    const to = join(TARGET, entry.name)

    const [src, dest] = await Promise.all([stat(from), statOrNull(to)])
    const willResize = SERVE_AT.some((r) => r.match.test(entry.name))
    // A resized file is deliberately a different size from its source, so only the
    // mtime can say whether it is current. An untouched copy is checked on both.
    const current =
      dest &&
      Math.abs(dest.mtimeMs - src.mtimeMs) < MTIME_TOLERANCE_MS &&
      (willResize || dest.size === src.size)
    if (current) {
      skipped++
      continue
    }

    const srcset = SRCSET_AT.find((r) => r.match.test(entry.name))
    if (srcset) {
      const ext = extname(entry.name)
      const stem = entry.name.slice(0, -ext.length)
      for (const w of srcset.widths) {
        const variant = join(TARGET, `${stem}-${w}${ext}`)
        const out = await sharp(from)
          .resize({ width: w, withoutEnlargement: true })
          .jpeg({ quality: srcset.quality, progressive: true, mozjpeg: true })
          .toBuffer()
        await writeFile(variant, out)
        await utimes(variant, src.atime, src.mtime)
        resized++
      }
    }

    const rule = SERVE_AT.find((r) => r.match.test(entry.name))
    if (rule) {
      const out = await sharp(from)
        .resize(rule.width, rule.width, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: rule.quality, progressive: true, mozjpeg: true })
        .toBuffer()
      await writeFile(to, out)
      resized++
    } else {
      await copyFile(from, to)
      copied++
    }
    // Carry the mtime across so the next run can tell a stale copy from a current
    // one without hashing every file. A resized file is smaller than its source, so
    // the size comparison above already refuses to treat it as current — the mtime
    // is what makes the second run cheap.
    await utimes(to, src.atime, src.mtime)
  }

  if (copied + resized + skipped === 0) {
    console.error(`copy-assets: no images found in ${relative(ROOT, SOURCE)}.`)
    process.exitCode = 1
    return
  }

  console.log(
    `copy-assets: ${copied} copied, ${resized} resized for serving, ${skipped} already current ` +
      `-> ${relative(ROOT, TARGET)}/`,
  )
}

await main()
