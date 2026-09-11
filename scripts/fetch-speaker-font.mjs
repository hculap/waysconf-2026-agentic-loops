#!/usr/bin/env node
/**
 * Download Playfair Display, the display face of szymonpaluch.com.
 *
 *   node scripts/fetch-speaker-font.mjs
 *
 * The deck and the participant site carry the speaker's brand, not TURBINE's. TURBINE is
 * the fictional client whose site gets built on stage; its three faces stay in
 * `public/fonts/` and are fetched by `scripts/fetch-fonts.mjs`. This one face is the
 * difference between the two identities, and it goes to the two places that need it:
 *
 *   deck/public/fonts/
 *   guideline/fonts/
 *
 * Self-hosted for the same reason as everything else here — a webfont that does not
 * arrive on conference wifi changes every glyph on the page, and the gate on the
 * participant site fails any request that does not return below 400.
 *
 * Playfair Display is under the SIL Open Font License 1.1, which requires the copyright
 * notice and the licence text to travel with the file. Both are written beside it.
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// A desktop UA is required, otherwise Google Fonts serves ttf instead of woff2.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const FAMILY = 'Playfair Display'
const QUERY = 'Playfair+Display:wght@400;700'
const OFL_URL = 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/OFL.txt'
const TARGETS = ['deck/public/fonts', 'guideline/fonts']

// Subsets are separate @font-face blocks. The latin one is identified by its
// unicode-range, not by the /* latin */ comment, which is not part of any block.
const LATIN_MARKER = 'U+0000-00FF'

const get = async (url, headers = {}) => {
  const res = await fetch(url, { headers, signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`)
  return res
}

// ── licence ───────────────────────────────────────────────────────────────────
const ofl = await (await get(OFL_URL)).text()
const copyright = ofl.split('\n').find((l) => l.startsWith('Copyright'))
if (!copyright) throw new Error('no copyright line in the OFL text — the file moved or changed shape')

for (const target of TARGETS) {
  await mkdir(join(ROOT, target), { recursive: true })
  await writeFile(join(ROOT, target, 'OFL-PlayfairDisplay.txt'), ofl)
}

// ── the faces ─────────────────────────────────────────────────────────────────
const css = await (
  await get(`https://fonts.googleapis.com/css2?family=${QUERY}&display=swap`, { 'User-Agent': UA })
).text()

const latin = css
  .split('@font-face')
  .slice(1)
  .filter((b) => b.includes(LATIN_MARKER) && !b.includes('latin-ext'))

if (latin.length === 0) throw new Error('no latin subset found. Google Fonts changed its output.')

// Google serves Playfair Display as one variable file covering the whole 400-700 axis, so
// every weight block points at the same woff2. Writing it once and declaring the range is the
// honest shape; two identical files would be 37 KB of nothing.
const urls = new Set()
const weights = []
for (const block of latin) {
  const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1]
  const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() ?? '400'
  if (!url) throw new Error(`no woff2 url in the latin block for weight ${weight}`)
  urls.add(url)
  weights.push(weight)
}
if (urls.size !== 1) {
  throw new Error(`expected one variable file, got ${urls.size}. Declare each weight separately.`)
}

const bytes = Buffer.from(await (await get([...urls][0])).arrayBuffer())
if (bytes.length < 10_000) throw new Error(`the woff2 is ${bytes.length} bytes — that is not a font`)

for (const target of TARGETS) {
  await writeFile(join(ROOT, target, 'playfair-display.woff2'), bytes)
  console.log(`  ${target}/playfair-display.woff2  ${(bytes.length / 1024).toFixed(1)} KB  weights ${weights.join(', ')}`)
}

console.log(`\n${FAMILY} — ${copyright}`)
console.log('The @font-face blocks live in deck/style.css and guideline/fonts/fonts.css.')
