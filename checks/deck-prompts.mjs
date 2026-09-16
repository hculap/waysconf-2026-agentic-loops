#!/usr/bin/env node
/**
 * The gate for the prompt cards in the deck.
 *
 *   node checks/deck-prompts.mjs [--site deck/dist]
 *   node checks/deck-prompts.mjs --url https://waysconf.szymonpaluch.com/deck
 *
 * A Copy button is a promise made to thirty people at once, and it is the kind of promise that
 * fails silently: the button still animates, the clipboard still holds whatever was there
 * before, and the room pastes the previous slide's text into an agent. So this does not read
 * the markup and conclude — it clicks every button in a browser, reads the clipboard back, and
 * compares it byte for byte with the prompt file the workshop page serves.
 *
 * It checks four things per prompt:
 *   1. the card is on a slide at all
 *   2. Copy puts the WHOLE prompt on the clipboard, identical to prompts/NN-*.md
 *   3. the preview on screen is a true prefix of that text — not a paraphrase that drifted
 *   4. "Full text" points at that prompt's section on the workshop page, in a new tab
 *
 * Exits 0 or 1. A prompt that cannot be found is a failure, never an absence.
 */

import { createServer } from 'node:http'
import { readFile, readdir } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, f) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : f)
const SITE = resolve(ROOT, arg('--site', 'deck/dist'))
const PAGE = 'https://waysconf.szymonpaluch.com/workshop/'

const TYPES = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ico': 'image/x-icon',
}

/** The first ```text block of a prompt file — the one a participant pastes. */
function firstTextBlock(md) {
  const lines = md.split('\n')
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() !== '```text') continue
    const body = []
    for (i++; i < lines.length && !lines[i].startsWith('```'); i++) body.push(lines[i])
    return body.join('\n').trim()
  }
  return null
}

// ── what the prompts actually say ────────────────────────────────────────────
const files = (await readdir(join(ROOT, 'prompts'))).filter((f) => /^0\d-.*\.md$/.test(f)).sort()
const expected = new Map()
for (const f of files) {
  const text = firstTextBlock(await readFile(join(ROOT, 'prompts', f), 'utf8'))
  if (!text) {
    console.error(`FAIL — prompts/${f} has no \`\`\`text block, so there is nothing for a card to copy.`)
    process.exit(1)
  }
  expected.set(f.slice(0, 2), text)
}
if (expected.size !== 8) {
  console.error(`FAIL — expected eight prompts, found ${expected.size}. Not checking "most" of them.`)
  process.exit(1)
}

// ── serve the built deck, unless we were pointed at a deployed one ───────────
// The speaker clicks these buttons on the deployed deck under /deck/, not on deck/dist, and a
// wrong base path is exactly the kind of thing that only shows up there.
const LIVE = arg('--url')
const server = LIVE ? null : createServer(async (req, res) => {
  const path = decodeURIComponent(req.url.split('?')[0])
  try {
    const body = await readFile(join(SITE, path))
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    // A deck is a single page application: any route it does not have a file for is a slide.
    try {
      res.writeHead(200, { 'content-type': 'text/html' })
      res.end(await readFile(join(SITE, 'index.html')))
    } catch {
      res.writeHead(404).end('not found')
    }
  }
})
if (server) await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = LIVE ? LIVE.replace(/\/$/, '') : `http://127.0.0.1:${server.address().port}`
const close = () => server?.close()

let browser
try {
  browser = await chromium.launch()
} catch (error) {
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  close()
  process.exit(1)
}

// 127.0.0.1 is a secure context, which is what the clipboard API needs.
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } })
await context.grantPermissions(['clipboard-read', 'clipboard-write'])
const page = await context.newPage()

// ── how many slides, and which of them carry a card ──────────────────────────
await page.goto(`${base}/1`, { waitUntil: 'networkidle', timeout: 60_000 })
const slides =
  (await page.evaluate(() => Number(document.body.innerText.match(/\/\s*(\d+)\s*$/m)?.[1]) || 0)) ||
  Number(process.env.DECK_SLIDES) ||
  0
if (!slides) {
  console.error('FAIL — could not work out how many slides the deck has. Refusing to check "some" of them.')
  await browser.close()
  close()
  process.exit(1)
}

console.log(`Looking for eight prompt cards across ${slides} slides at ${base}\n`)

const failures = []
const found = new Map()

for (let n = 1; n <= slides; n++) {
  await page.goto(`${base}/${n}`, { waitUntil: 'networkidle', timeout: 60_000 })
  // Slidev keeps neighbouring slides in the DOM, hidden. Only the one on screen is this route's.
  const cards = page.locator('.promptcard:visible')
  const count = await cards.count()
  for (let c = 0; c < count; c++) {
    const card = cards.nth(c)
    const id = (await card.locator('.promptcard__id').innerText()).trim()
    const number = id.replace(/\D/g, '').padStart(2, '0')
    if (found.has(number)) {
      failures.push(`prompt ${number} has a card on slide ${found.get(number).slide} and again on slide ${n}`)
      continue
    }

    const want = expected.get(number)
    if (!want) {
      failures.push(`slide ${n}: a card says "${id}", and prompts/ has no prompt ${number}`)
      continue
    }

    // 1. the preview on screen is really the opening of the prompt
    const preview = (await card.locator('.promptcard__body').innerText()).replace(/\s+$/, '')
    const prefix = want.split('\n').slice(0, preview.split('\n').length).join('\n').replace(/\s+$/, '')
    if (preview !== prefix) {
      failures.push(`prompt ${number} (slide ${n}): the preview is not the opening of prompts/ — it has drifted`)
    }

    // 2. the link goes to that prompt's section, in a new tab
    const link = card.locator('.promptcard__link')
    const href = await link.getAttribute('href')
    const target = await link.getAttribute('target')
    const rel = (await link.getAttribute('rel')) ?? ''
    if (href !== `${PAGE}#p${number}`) failures.push(`prompt ${number} (slide ${n}): the link goes to ${href}, not ${PAGE}#p${number}`)
    if (target !== '_blank') failures.push(`prompt ${number} (slide ${n}): the link does not open in a new tab`)
    if (!/noopener/.test(rel)) failures.push(`prompt ${number} (slide ${n}): the link is missing rel="noopener"`)

    // 3. the button actually copies, and copies all of it
    await page.evaluate(() => navigator.clipboard.writeText('clipboard was not written'))
    await card.locator('.promptcard__copy').click()
    await page.waitForTimeout(150)
    const got = await page.evaluate(() => navigator.clipboard.readText())
    if (got !== want) {
      const why =
        got === 'clipboard was not written'
          ? 'the button did not write to the clipboard at all'
          : `copied ${got.length} characters, the prompt is ${want.length}`
      failures.push(`prompt ${number} (slide ${n}): Copy is wrong — ${why}`)
    }

    found.set(number, { slide: n, lines: want.split('\n').length })
  }
}

for (const number of expected.keys()) {
  if (!found.has(number)) failures.push(`prompt ${number} has no card on any slide`)
}

for (const [number, where] of [...found.entries()].sort()) {
  console.log(`  ok   prompt ${number} on slide ${where.slide} — copies all ${where.lines} lines, links to ${PAGE}#p${number}`)
}

await browser.close()
close()

if (failures.length) {
  console.error(`\nFAIL — ${failures.length} problem${failures.length > 1 ? 's' : ''}\n`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(`\nPASS — all eight prompts are on a slide, each Copy button holds the whole prompt, each link opens its section`)
