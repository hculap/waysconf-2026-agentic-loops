#!/usr/bin/env node
/**
 * The gate for the deck. Every slide, measured rather than flicked through.
 *
 *   node checks/deck.mjs [--site deck/dist]
 *
 * A deck is a thing you look at, so "I looked at it" feels like verification and is not.
 * Forty-one slides is more than anyone reviews carefully twice, and the two defects this
 * catches are both invisible in the editor and fatal on a projector:
 *
 *   1. CONTENT THAT DOES NOT FIT. Slidev scales a fixed canvas to the screen, so an
 *      overflowing slide does not scroll — it is cut off, and the sentence you end on is
 *      the one nobody sees.
 *
 *   2. TEXT NOBODY CAN READ. Measured from the painted pixels, not from the CSS, because
 *      the CSS does not know what the syntax highlighter decided. Slidev renders Shiki's
 *      LIGHT palette whenever the viewer's OS is in light mode unless `colorSchema: dark`
 *      is set — which is how this deck had dark grey code on near-black without a single
 *      line of its own stylesheet being wrong.
 *
 * Exits 0 or 1, prints what it found, and skips nothing: a slide that will not render is
 * a failure, never an absence.
 *
 * ── How the measurement works, and two ways it did not ──────────────────────────────
 *
 * Measuring text colour off a screen is harder than it looks, and this gate got it wrong
 * twice before it got it right. Both wrong versions produced confident, specific,
 * correctly-formatted failures, which is the only reason they are documented here:
 *
 *   v1  photographed the whole element and took the colour furthest from the dominant
 *       one. On a bordered <pre> that is the 1px border; on a <th> it is the rule
 *       underneath. 23 failures, all of them facts about the measurement.
 *
 *   v2  photographed each line of text via a Range. Better, but syntax highlighting
 *       spreads the ink over a dozen token colours, each a few percent of the box, and
 *       a line that is mostly indentation has almost no ink at all — so the winner was
 *       whichever anti-aliasing fringe happened to clear the threshold. 12 failures,
 *       again all of them about the measurement.
 *
 *   v3  photographed the element's content box — no border, no padding. Right for a
 *       paragraph, wrong for a <th> holding "TEXT": the content box is most of a column,
 *       four letters are a fraction of a percent of it, and the threshold lands on a
 *       fringe again. 6 of its 14 failures were that.
 *
 *   v4  this one. Photograph the union of the text-node rects — tight around the glyphs,
 *       no border, no padding, no empty column width — build a histogram, take the modal
 *       colour as the background, then walk the other colours in order of contrast and
 *       take the first whose cumulative share reaches INK_MASS. A fringe cannot reach it;
 *       the body of a glyph can.
 *
 * The lesson is the one the workshop is about: a check that does not actually reach the
 * thing it claims to measure reports confidently either way.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { PNG } from 'pngjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argSite = process.argv.includes('--site') && process.argv[process.argv.indexOf('--site') + 1]
const DIST = argSite ? resolve(argSite) : join(ROOT, 'deck/dist')

const AA_LARGE = 3 // slide text is 20px and up throughout; large-text AA is the right bar
const INK_MASS = 0.03 // a colour must cover 3% of the glyph box before it counts as ink
const BLANK_RATIO = 1.15 // below this, nothing in the box is distinguishable from the ground
const NAV_DEADLINE_MS = 30_000
const OVERFLOW_SLACK = 2 // px, for sub-pixel rounding in the scaled canvas

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.json': 'application/json',
}

const luminance = ([r, g, b]) => {
  const c = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

/**
 * The box the GLYPHS occupy, in viewport coordinates.
 *
 * A Range over the element's text nodes gives one rect per rendered line; their union is
 * tight around the text and contains no border, no padding and no empty column width.
 * That last part matters: the content box of a <th> holding "TEXT" is most of a column,
 * so four letters are a fraction of a percent of it and any threshold lands on an
 * anti-aliasing fringe instead of on a letter.
 */
const glyphBox = (el) =>
  el.evaluate((node) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
    for (let t = walk.nextNode(); t; t = walk.nextNode()) {
      if (!t.nodeValue.trim()) continue
      const range = document.createRange()
      range.selectNodeContents(t)
      for (const r of range.getClientRects()) {
        if (r.width < 1 || r.height < 1) continue
        x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y)
        x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom)
      }
    }
    if (x0 === Infinity) return null
    return { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }
  })

async function measure(page, box) {
  const clip = {
    x: Math.max(0, Math.round(box.x)),
    y: Math.max(0, Math.round(box.y)),
    width: Math.round(box.width),
    height: Math.round(box.height),
  }
  if (clip.width < 6 || clip.height < 6) return null

  const png = PNG.sync.read(await page.screenshot({ clip }))
  const total = png.width * png.height
  if (total === 0) return null

  const counts = new Map()
  for (let i = 0; i < png.data.length; i += 4) {
    const k = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`
    counts.set(k, (counts.get(k) ?? 0) + 1)
  }
  const entries = [...counts].map(([k, n]) => [k.split(',').map(Number), n])
  const ground = entries.reduce((best, e) => (e[1] > best[1] ? e : best))[0]

  // Walk the colours in order of how far they are from the ground. The first one whose
  // cumulative share reaches INK_MASS is the ink: a fringe cannot get there, a glyph can.
  const byContrast = entries
    .filter(([c]) => c.join() !== ground.join())
    .map(([c, n]) => [c, n, contrast(c, ground)])
    .sort((a, b) => b[2] - a[2])

  let mass = 0
  for (const [colour, n, ratio] of byContrast) {
    mass += n
    if (mass / total >= INK_MASS) return { ratio, fg: colour, bg: ground, inkShare: mass / total }
  }
  return { ratio: 1, fg: ground, bg: ground, inkShare: mass / total, blank: true }
}

// SPA: every unknown path falls back to index.html.
const server = createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0])
  if (path.endsWith('/')) path += 'index.html'
  try {
    const body = await readFile(join(DIST, path))
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
    res.end(body)
  } catch {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    res.end(await readFile(join(DIST, 'index.html')))
  }
})
await new Promise((r) => server.listen(0, '127.0.0.1', r))
const base = `http://127.0.0.1:${server.address().port}`

const failures = []
let browser
try {
  browser = await chromium.launch()
} catch (error) {
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  server.close()
  process.exit(1)
}

const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 })
const badRequests = []
page.on('response', (r) => {
  if (r.status() >= 400) badRequests.push(`${r.status()} ${r.url()}`)
})

// How many slides are there? Ask the build, do not hardcode it.
await page.goto(`${base}/1`, { waitUntil: 'networkidle', timeout: NAV_DEADLINE_MS })
const slideCount =
  (await page.evaluate(() => Number(document.body.innerText.match(/\/\s*(\d+)\s*$/m)?.[1]) || 0)) ||
  Number(process.env.DECK_SLIDES) ||
  0
if (!slideCount) {
  console.error('FAIL — could not work out how many slides the deck has. Refusing to check "some" of them.')
  await browser.close()
  server.close()
  process.exit(1)
}

console.log(`Checking ${slideCount} slides at ${base}\n`)

let overflowing = 0
let measured = 0
let worst = { ratio: Infinity, where: null }

for (let n = 1; n <= slideCount; n++) {
  const response = await page.goto(`${base}/${n}`, { waitUntil: 'networkidle', timeout: NAV_DEADLINE_MS })
  if (!response?.ok()) {
    failures.push(`slide ${n}: did not load — HTTP ${response?.status() ?? 'no response'}`)
    continue
  }
  await page.waitForTimeout(250)

  // #slide-content is the fixed canvas Slidev scales to the screen. It is the element
  // that clips, so it is the element to ask. (.slidev-layout is 0x0 here — several of
  // them exist and the first is a hidden stub, which is why an earlier version of this
  // gate reported "0 slides overflow" while a slide was losing its last three lines.)
  const canvas = page.locator('#slide-content').first()
  if ((await canvas.count()) === 0) {
    failures.push(`slide ${n}: no #slide-content rendered — the slide is not there`)
    continue
  }

  // 1. does it fit?
  //
  // The canvas has overflow:hidden, so anything past clientHeight is not scrolled to —
  // it is simply not shown. On a projector that is a sentence nobody in the room reads.
  const box = await canvas.evaluate((el) => ({
    over: el.scrollHeight - el.clientHeight,
    overX: el.scrollWidth - el.clientWidth,
  }))
  if (box.over > OVERFLOW_SLACK) {
    overflowing++
    failures.push(`slide ${n}: content runs ${box.over}px past the bottom of the canvas and is clipped`)
  }
  if (box.overX > OVERFLOW_SLACK) {
    failures.push(`slide ${n}: content runs ${box.overX}px past the right edge and is clipped`)
  }

  // 2. can it be read?
  const samples = await page.locator('.slidev-layout :is(p, li, td, th, pre, h1, h2, h3, blockquote)').all()
  let onThisSlide = 0
  for (const el of samples) {
    if (!(await el.isVisible())) continue
    const text = (await el.innerText()).trim()
    if (text.length < 3) continue

    let m = null
    try {
      const box = await glyphBox(el)
      if (!box) continue // an element whose text is all whitespace
      m = await measure(page, box)
    } catch {
      continue // an inline element with no box of its own
    }
    if (!m) continue

    const label = text.replace(/\s+/g, ' ').slice(0, 46)
    if (m.blank || m.ratio < BLANK_RATIO) {
      failures.push(`slide ${n}: "${label}" has text in the DOM and nothing distinguishable on screen`)
      continue
    }
    onThisSlide++
    measured++
    if (m.ratio < worst.ratio) worst = { ratio: m.ratio, where: `slide ${n}: "${label}"` }
    if (m.ratio < AA_LARGE) {
      failures.push(
        `slide ${n}: "${label}" measures ${m.ratio.toFixed(2)}:1 ` +
          `(rgb(${m.fg}) on rgb(${m.bg})), minimum ${AA_LARGE} for text this size`,
      )
    }
  }
  if (samples.length > 0 && onThisSlide === 0) {
    failures.push(`slide ${n}: nothing was measured — a slide nothing looked at is not a slide that passed`)
  }

  if (n % 10 === 0 || n === slideCount) console.log(`  ${n}/${slideCount} slides`)
}

// 3. did anything fail to arrive? A missing font silently changes every glyph.
for (const r of badRequests) failures.push(`request failed — ${r}`)

await browser.close()
server.close()

console.log(`\n  pieces of text measured: ${measured}`)
console.log(`  slides that overflow:    ${overflowing}`)
console.log(`  worst measured text:     ${worst.ratio === Infinity ? 'nothing measured' : `${worst.ratio.toFixed(2)}:1 — ${worst.where}`}`)

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log('\nPASS — every slide fits, and every measured piece of text is legible')
