#!/usr/bin/env node
/**
 * Download the three TURBINE typefaces and emit a self-hosted @font-face sheet.
 *
 *   node scripts/fetch-fonts.mjs
 *
 * The fonts are committed, so this only needs running if the set changes.
 *
 * Self-hosting is not a preference here, it is a requirement of two gates:
 *
 *   - The visual diff compares screenshots pixel by pixel. A webfont that arrives
 *     late, or does not arrive at all on conference wifi, changes every glyph on
 *     the page and the diff becomes noise.
 *   - AC-04 fails the build on any request that does not return below 400. A room
 *     of thirty laptops on a captive portal will produce those.
 *
 * Only the `latin` subset is kept. The page is English-only by CANON section 11.
 *
 * All three families are under the SIL Open Font License 1.1, which requires the
 * copyright notice and the licence text to travel with the font files. This script
 * therefore fetches each family's OFL text from the same project the woff2 comes
 * from, writes it beside the fonts, and repeats the copyright line in the sheet.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public/fonts')

// A desktop UA is required, otherwise Google Fonts serves ttf instead of woff2.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const FAMILIES = [
  {
    family: 'Space Grotesk',
    query: 'Space+Grotesk:wght@500;700',
    slug: 'space-grotesk',
    ofl: { dir: 'spacegrotesk', file: 'OFL-SpaceGrotesk.txt' },
  },
  {
    family: 'Inter',
    query: 'Inter:wght@400;500;600',
    slug: 'inter',
    ofl: { dir: 'inter', file: 'OFL-Inter.txt' },
  },
  {
    family: 'JetBrains Mono',
    query: 'JetBrains+Mono:wght@400;700',
    slug: 'jetbrains-mono',
    ofl: { dir: 'jetbrainsmono', file: 'OFL-JetBrainsMono.txt' },
  },
]

/** Google publishes the licence for every family it serves, in its own repository. */
const OFL_BASE = 'https://raw.githubusercontent.com/google/fonts/main/ofl'

/** The latin subset is the block whose unicode-range covers basic Latin. */
const LATIN_MARKER = 'U+0000-00FF'

/**
 * Fetch each family's OFL text, write it beside the fonts, and return the copyright
 * line out of each one. Verbatim: the upstream file is the notice, not a summary of it.
 */
async function fetchLicences() {
  const notices = []
  for (const { family, ofl } of FAMILIES) {
    const text = await (await fetch(`${OFL_BASE}/${ofl.dir}/OFL.txt`)).text()
    const copyright = text.split('\n').find((line) => line.startsWith('Copyright'))?.trim()
    if (!copyright) throw new Error(`no copyright line in the OFL text for ${family}`)
    await writeFile(join(OUT_DIR, ofl.file), text)
    console.log(`  ${ofl.file.padEnd(30)} ${(text.length / 1024).toFixed(0)} KB`)
    notices.push({ family, file: ofl.file, copyright })
  }
  return notices
}

/** Exported so the sheet header can be checked without re-downloading the fonts. */
export function buildSheetHeader(notices) {
  const lines = [
    '/* ==========================================================================',
    '   GENERATED FILE — do not edit.',
    '',
    '   Generator: scripts/fetch-fonts.mjs',
    '   Source:    Google Fonts, latin subset only, woff2',
    '',
    '   Self-hosted on purpose. See the header of the generator for why.',
    '',
    '   All three families are under the SIL Open Font License 1.1, which requires',
    '   the copyright notice and the licence to travel with the files. Both do:',
  ]
  for (const { family, file, copyright } of notices) {
    lines.push('')
    lines.push(`   ${family} — full licence text in ${file}`)
    lines.push(`   ${copyright}`)
  }
  lines.push('   ========================================================================== */')
  lines.push('')
  return lines
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  /** sha256 prefix -> filename, so identical variable-font payloads are written once. */
  const written = new Map()
  const sheet = buildSheetHeader(await fetchLicences())

  for (const { family, query, slug } of FAMILIES) {
    const cssUrl = `https://fonts.googleapis.com/css2?family=${query}&display=swap`
    const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text()

    // Split into @font-face blocks and keep the latin ones.
    const blocks = css.split('@font-face').slice(1)
    const latin = blocks.filter((b) => b.includes(LATIN_MARKER) && !b.includes('latin-ext'))

    if (latin.length === 0) {
      throw new Error(`no latin subset found for ${family}. Google Fonts changed its output.`)
    }

    for (const [i, block] of latin.entries()) {
      const url = block.match(/url\((https:\/\/[^)]+\.woff2)\)/)?.[1]
      const weight = block.match(/font-weight:\s*([^;]+);/)?.[1]?.trim() ?? '400'
      const style = block.match(/font-style:\s*([^;]+);/)?.[1]?.trim() ?? 'normal'
      const range = block.match(/unicode-range:\s*([^;]+);/)?.[1]?.trim()
      if (!url) throw new Error(`no woff2 url in a latin block for ${family}`)

      const bytes = Buffer.from(await (await fetch(url)).arrayBuffer())

      // Google serves one URL per requested weight, but for a variable font every
      // one of those URLs is the same file. Hash the bytes and write each distinct
      // file once, so three Inter weights cost 47 KB rather than 141 KB.
      const hash = createHash('sha256').update(bytes).digest('hex').slice(0, 8)
      let file = written.get(hash)
      if (!file) {
        file = latin.length === 1 ? `${slug}.woff2` : `${slug}-${hash}.woff2`
        await writeFile(join(OUT_DIR, file), bytes)
        written.set(hash, file)
        console.log(`  ${file.padEnd(30)} ${(bytes.length / 1024).toFixed(0)} KB  weight ${weight}`)
      } else {
        console.log(`  ${'(reuse)'.padEnd(30)} ${file}  weight ${weight}`)
      }

      sheet.push('@font-face {')
      sheet.push(`  font-family: '${family}';`)
      sheet.push(`  font-style: ${style};`)
      sheet.push(`  font-weight: ${weight};`)
      sheet.push('  font-display: swap;')
      sheet.push(`  src: url('/fonts/${file}') format('woff2');`)
      if (range) sheet.push(`  unicode-range: ${range};`)
      sheet.push('}')
      sheet.push('')
    }
  }

  await writeFile(join(OUT_DIR, 'fonts.css'), sheet.join('\n'))
  console.log(`\nwrote public/fonts/fonts.css`)
}

// Importable for the header check; still a script when it is the thing being run.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err)
    process.exit(1)
  })
}
