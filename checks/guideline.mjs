#!/usr/bin/env node
/**
 * The gate for the participant site — `guideline/`, the only thing a designer opens.
 *
 *   node checks/guideline.mjs
 *
 * Both tabs, both widths. Exits 0 or 1 and prints why, the same contract as every gate in
 * `brief/ACCEPTANCE.md`. It is deliberately separate from `npm run check`: that one measures
 * the reference festival site, this one measures the pages we hand to thirty people.
 *
 * Two things here are the whole workshop in miniature, and both were learned the hard way:
 *
 *   1. A check that cannot run is a FAILURE. If the browser will not start, a page will not
 *      load, or an image never decodes inside its deadline, this exits 1. Nothing is skipped
 *      quietly, and every wait has a deadline — an unbounded wait cost this project an hour,
 *      three separate times.
 *
 *   2. axe's `incomplete` is not a pass. axe cannot judge contrast it cannot compute — text
 *      over a photograph, or a cell clipped by a scroll container — and reports `incomplete`,
 *      which in a zero-violations gate is indistinguishable from correct. That blind spot is
 *      incident 13 in evidence/INCIDENTS.md and criterion AC-61. So every incomplete
 *      colour-contrast node is measured here from the painted pixels, and an incomplete that
 *      cannot be measured is a failure like any other.
 */
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { AxeBuilder } from '@axe-core/playwright'
import { PNG } from 'pngjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
// --site lets the gate be pointed at a deliberately broken copy, which is how it was
// proved capable of failing. A gate nobody has watched fail is a gate nobody should trust.
const SITE = (process.argv.includes('--site') && resolve(process.argv[process.argv.indexOf('--site') + 1])) || join(ROOT, 'guideline')

const PAGES = ['/', '/workshop/']
const WIDTHS = [390, 1440]
const IMAGE_DEADLINE_MS = 15_000
const NAV_DEADLINE_MS = 30_000
const AA_BODY = 4.5

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
}

// ── contrast, from pixels ─────────────────────────────────────────────────────

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
 * The measured ratio between an element's dominant colour and the colour furthest from it.
 * No CSS is read: on a page where the background may be an image, a gradient and two
 * translucent overlays composited together, no line of CSS says what colour comes out.
 */
async function measuredContrast(locator) {
  const png = PNG.sync.read(await locator.screenshot())
  const counts = new Map()
  for (let i = 0; i < png.data.length; i += 4) {
    const key = `${png.data[i]},${png.data[i + 1]},${png.data[i + 2]}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const total = png.width * png.height
  if (total === 0) return null

  const ranked = [...counts].sort((a, b) => b[1] - a[1])
  const background = ranked[0][0].split(',').map(Number)
  // Anti-aliasing produces hundreds of one-off shades; only colours covering a real share of
  // the element are treated as ink.
  const ink = ranked.filter(([, n]) => n / total > 0.002).map(([k]) => k.split(',').map(Number))
  const text = ink.reduce((best, p) => (contrast(p, background) > contrast(best, background) ? p : best), background)
  return { ratio: contrast(text, background), background, text }
}

// ── the server ────────────────────────────────────────────────────────────────

async function serve(dir) {
  const server = createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0])
    if (path.endsWith('/')) path += 'index.html'
    try {
      const body = await readFile(join(dir, path))
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  return { url: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }
}

// ── one page, one width ───────────────────────────────────────────────────────

async function audit(browser, base, path, width, fail) {
  const where = `${path} @ ${width}`
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
  const page = await context.newPage()

  const badRequests = []
  page.on('response', (r) => {
    if (r.status() >= 400) badRequests.push(`${r.status()} ${r.url()}`)
  })

  const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: NAV_DEADLINE_MS })
  if (!response?.ok()) {
    fail(`${where}: page did not load — HTTP ${response?.status() ?? 'no response'}`)
    await context.close()
    return null
  }

  // A page with nothing on it passes every rule ever written. Guard first.
  const presence = await page.evaluate(() => ({
    children: document.body.children.length,
    focusable: document.querySelectorAll('a[href], button, [tabindex="0"]').length,
    text: document.body.innerText.trim().length,
  }))
  if (presence.children === 0 || presence.focusable === 0 || presence.text < 500) {
    fail(
      `${where}: nothing to measure — ${presence.children} body children, ${presence.focusable} focusable, ` +
        `${presence.text} characters. A measurement of nothing is not a pass`,
    )
    await context.close()
    return null
  }

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  for (const v of results.violations) {
    fail(`${where}: axe ${v.id} — ${v.help} (${v.nodes.length} node${v.nodes.length === 1 ? '' : 's'})`)
    for (const node of v.nodes.slice(0, 3)) fail(`${where}:   ${node.target.join(' ')}`)
  }

  // Every incomplete is resolved by measurement or it is a failure. This is AC-61.
  let measured = 0
  for (const item of results.incomplete) {
    for (const node of item.nodes) {
      const selector = node.target.join(' ')
      if (item.id !== 'color-contrast') {
        fail(`${where}: axe could not decide ${item.id} on ${selector}, and nothing here can measure it`)
        continue
      }
      const locator = page.locator(selector).first()
      let result = null
      try {
        await locator.scrollIntoViewIfNeeded({ timeout: 5_000 })
        // Cells clipped by a horizontal scroller are what axe could not compute; bring the
        // element fully inside its scroller before photographing it.
        await page.evaluate((sel) => {
          const el = document.querySelector(sel)
          const box = el?.closest('[class*="scroll"]')
          if (el && box && box.scrollWidth > box.clientWidth) {
            box.scrollLeft = el.offsetLeft + el.offsetWidth - box.clientWidth + 8
          }
        }, selector)
        result = await measuredContrast(locator)
      } catch (error) {
        fail(`${where}: could not measure the incomplete contrast on ${selector} — ${error.message}`)
        continue
      }
      if (!result) {
        fail(`${where}: measured nothing for ${selector} — an element with no pixels is not a pass`)
        continue
      }
      measured++
      if (result.ratio < AA_BODY) {
        fail(
          `${where}: ${selector} measures ${result.ratio.toFixed(2)}:1 ` +
            `(rgb(${result.text}) on rgb(${result.background})), minimum ${AA_BODY}`,
        )
      }
    }
  }

  // Walk the page so lazy images below the fold are actually requested, then wait for each
  // of them against a deadline. It decodes, or it is a failure.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  const images = await page.evaluate(async (deadline) => {
    const stalled = []
    await Promise.all(
      [...document.images].map(async (img) => {
        if (img.complete && img.naturalWidth > 0) return
        const state = await Promise.race([
          img.decode().then(() => 'ok', () => 'error'),
          new Promise((r) => setTimeout(() => r('timed out'), deadline)),
        ])
        if (state !== 'ok' || img.naturalWidth === 0) stalled.push(`${img.currentSrc || img.src} (${state})`)
      }),
    )
    return { stalled, total: document.images.length }
  }, IMAGE_DEADLINE_MS)
  for (const src of images.stalled) fail(`${where}: image never decoded — ${src}`)

  const missingAlt = await page.evaluate(() =>
    [...document.images].filter((i) => i.alt === null || i.alt === undefined).map((i) => i.src))
  for (const src of missingAlt) fail(`${where}: image has no alt attribute at all — ${src}`)

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  )
  if (overflow > 0) fail(`${where}: the page scrolls sideways by ${overflow}px`)

  for (const r of badRequests) fail(`${where}: request failed — ${r}`)

  await context.close()
  return {
    violations: results.violations.length,
    incomplete: results.incomplete.length,
    measured,
    passes: results.passes.length,
    images: images.total,
  }
}

// ── run ───────────────────────────────────────────────────────────────────────

const failures = []
const fail = (message) => failures.push(message)

const server = await serve(SITE)
let browser
try {
  browser = await chromium.launch()
} catch (error) {
  // The one place a missing browser could look like a pass. It does not.
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  server.close()
  process.exit(1)
}

console.log(`Checking guideline/ at ${server.url}\n`)

for (const path of PAGES) {
  for (const width of WIDTHS) {
    const row = await audit(browser, server.url, path, width, fail)
    if (!row) {
      console.log(`  ${path} @ ${width}  not measured`)
      continue
    }
    console.log(
      `  ${path} @ ${width}  ${row.violations} violations · ${row.incomplete} incomplete ` +
        `(${row.measured} measured) · ${row.passes} rules passed · ${row.images} images`,
    )
  }
}

await browser.close()
server.close()

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}

console.log('\nPASS — both tabs, both widths, every incomplete measured')
