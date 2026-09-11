#!/usr/bin/env node
/**
 * Build the design pack — the one download a participant needs.
 *
 *   node scripts/build-design-pack.mjs [--url https://turbine-festival.netlify.app]
 *
 * There is no repository to clone in this workshop. A designer gets two things: the Figma
 * file, and this folder. Everything an agent needs to build the page without guessing is
 * in it, and nothing else is.
 *
 *   390.png 768.png 1440.png   the page as it should look, at the three widths
 *   tokens.json                every colour, size, spacing value and radius, by name
 *   content.md                 every word that appears on the page
 *   README.md                  what these files are, written for a person
 *
 * The PNGs are rendered from the reference implementation rather than exported from
 * Figma, and README.md says so. That is a real difference: it makes them a record of what
 * the page looked like when it worked, rather than a statement of what the design asks
 * for. Replacing them with Figma exports is a strict improvement and changes nothing else.
 */

import { chromium } from 'playwright-core'
import { mkdir, copyFile, writeFile, rm, readdir, stat } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'design-pack')
const argv = process.argv.slice(2)
const URL =
  (argv.includes('--url') && argv[argv.indexOf('--url') + 1]) || 'https://turbine-festival.netlify.app'

const WIDTHS = [390, 768, 1440]

/** Playwright refuses a capture region over 10000px, and this page is taller at 390. */
const MAX_STRIP = 9000

async function capture(page, width) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  if (total <= MAX_STRIP) {
    return page.screenshot({ fullPage: true, animations: 'disabled', caret: 'hide', type: 'png' })
  }

  const sharp = (await import('sharp')).default
  const strips = []
  for (let top = 0; top < total; top += MAX_STRIP) {
    const height = Math.min(MAX_STRIP, total - top)
    await page.setViewportSize({ width, height })
    await page.evaluate((y) => window.scrollTo(0, y), top)
    await page.waitForTimeout(150)
    strips.push({
      input: await page.screenshot({
        animations: 'disabled',
        caret: 'hide',
        type: 'png',
        clip: { x: 0, y: 0, width, height },
      }),
      top,
    })
  }
  await page.evaluate(() => window.scrollTo(0, 0))
  return sharp({
    create: { width, height: total, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(strips.map((s) => ({ input: s.input, top: s.top, left: 0 })))
    .png()
    .toBuffer()
}

async function main() {
  await rm(OUT, { recursive: true, force: true })
  await mkdir(OUT, { recursive: true })

  console.log(`\nBuilding the design pack from ${URL}\n`)

  const browser = await chromium.launch()
  try {
    for (const width of WIDTHS) {
      const ctx = await browser.newContext({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
        reducedMotion: 'reduce',
      })
      const page = await ctx.newPage()
      await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 })

      // Everything must have landed, or the PNG records a page mid-load.
      await page.evaluate(async () => {
        await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 5000))])
        await Promise.all(
          Array.from(document.images)
            .filter((i) => !i.complete)
            .map((i) => Promise.race([i.decode().catch(() => {}), new Promise((r) => setTimeout(r, 3000))])),
        )
      })
      await page.addStyleTag({
        content: '*,*::before,*::after{animation-duration:0s!important;transition-duration:0s!important}',
      })
      await page.waitForTimeout(400)

      const png = await capture(page, width)
      await writeFile(join(OUT, `${width}.png`), png)
      console.log(`  ${width}.png`.padEnd(16), `${(png.length / 1024).toFixed(0)} KB`)
      await ctx.close()
    }
  } finally {
    await browser.close()
  }

  await copyFile(join(ROOT, 'design/tokens/tokens.json'), join(OUT, 'tokens.json'))
  await copyFile(join(ROOT, 'brief/CONTENT.md'), join(OUT, 'content.md'))
  console.log('  tokens.json     copied')
  console.log('  content.md      copied')

  await writeFile(
    join(OUT, 'README.md'),
    `# TURBINE — design pack

Four files. Put this folder next to your project, so that \`design\` sits beside \`src\`, and
point your agent at it.

| File | What it is |
|---|---|
| \`390.png\`, \`768.png\`, \`1440.png\` | The page as it should look, at the three widths that matter |
| \`tokens.json\` | Every colour, text size, spacing value and radius, by name |
| \`content.md\` | Every word that appears on the page |

## Why a token file and not just the pictures

An agent given only a screenshot has to infer every colour and every measurement from
pixels, and it will be *nearly* right — an orange, some spacing. Nearly right is what
fails a contrast check and looks subtly off next to the real design.

Given \`tokens.json\`, it does not infer anything. \`#FF6A1A\` is in the file. That difference
is the single most useful thing in this folder, and it is why the second prompt asks the
agent to read all three files before writing a line.

## Where the pictures come from

They are renders of the reference implementation, captured at the three widths with fonts
loaded, images decoded and animations frozen — not exports from Figma.

Worth knowing the difference. A Figma export says *what the design asks for*. These say
*what the page looked like when it was correct*. For building and for comparing, they are
equivalent; for settling an argument about intent, open the Figma file.

## The words are not suggestions

\`content.md\` is every string on the page, and the prompts tell the agent not to write copy.
That is not pedantry: an agent left to invent text will produce competent, plausible,
entirely wrong marketing prose, and you will not notice until somebody reads it aloud.

TURBINE is a fictional festival. The artists, the venue and the copy are invented.
`,
  )
  console.log('  README.md       written')

  let bytes = 0
  for (const f of await readdir(OUT)) bytes += (await stat(join(OUT, f))).size
  console.log(`\ndesign-pack/ — ${(bytes / 1024 / 1024).toFixed(1)} MB, ${(await readdir(OUT)).length} files`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
