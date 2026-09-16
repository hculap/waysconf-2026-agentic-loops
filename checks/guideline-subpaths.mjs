#!/usr/bin/env node
/**
 * Do the deck and the festival site actually work under waysconf.szymonpaluch.com?
 *
 *   node checks/guideline-subpaths.mjs
 *   node checks/guideline-subpaths.mjs --url https://waysconf.szymonpaluch.com
 *
 * Both were built to own the root of their host and are served from /deck/ and /site/ here
 * (scripts/build-subpaths.mjs). The way that goes wrong is silent: the HTML loads, returns
 * 200, and every asset that still points at /fonts/… or /_astro/… 404s — a page with no
 * styles, no fonts and no scripts that nonetheless "loaded".
 *
 * So this loads real pages in a browser and fails on any request that does not come back
 * below 400, any console error, and any page with nothing on it. The local server mimics
 * what guideline/_redirects tells Netlify to do: /deck/anything serves /deck/index.html.
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = join(ROOT, 'guideline')
const argUrl = process.argv.includes('--url') && process.argv[process.argv.indexOf('--url') + 1]

// ":last" is resolved from the deck itself before the run. It used to be a number here, and
// that is how this line came to claim it was measuring "the last slide" while the deck had
// shrunk and the route was quietly falling back to slide 1 — a check that passes on the wrong
// thing, which is the failure this whole repository is about.
const PAGES = [
  ['/deck/1', 'the first slide'],
  ['/deck/6', 'a slide with a diagram (the loop)'],
  ['/deck/:last', 'the last slide, by its history route'],
  ['/site/', 'the festival site'],
]

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.json': 'application/json', '.txt': 'text/plain', '.xml': 'application/xml', '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
}

const KNOWN = /inline script|Failed to patch FloatingVue|Wake Lock permission/i

const failures = []
const fail = (m) => failures.push(m)
const ok = (m) => console.log(`  ok   ${m}`)

let server = null
let base = argUrl ? argUrl.replace(/\/$/, '') : null
if (!base) {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0])
    let file = join(SITE, path)
    const isDir = await stat(file).then((s) => s.isDirectory()).catch(() => false)
    if (path.endsWith('/') || isDir) file = join(file, 'index.html')
    try {
      const body = await readFile(file)
      res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' })
      return res.end(body)
    } catch {}
    // the SPA rewrite from guideline/_redirects
    if (path.startsWith('/deck/') && !extname(path)) {
      res.writeHead(200, { 'content-type': TYPES['.html'] })
      return res.end(await readFile(join(SITE, 'deck/index.html')))
    }
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('not found')
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
}

let browser
try {
  browser = await chromium.launch()
} catch (error) {
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  server?.close()
  process.exit(1)
}

console.log(`Measuring ${argUrl ? 'the DEPLOYED site' : 'the local folder'}: ${base}\n`)

// How many slides does the deck have? Ask the deck, never a number typed in this file.
const counterOf = (page) =>
  page.evaluate(() => {
    const m = document.body.innerText.match(/(\d+)\s*\/\s*(\d+)\s*$/m)
    return m ? { current: Number(m[1]), total: Number(m[2]) } : null
  })

let slideCount = 0
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  await page.goto(`${base}/deck/1`, { waitUntil: 'networkidle', timeout: 45_000 }).catch(() => {})
  await page.waitForTimeout(800)
  slideCount = (await counterOf(page))?.total ?? 0
  await context.close()
}
if (!slideCount) {
  console.error('FAIL — the deck does not say how many slides it has, so "the last slide" cannot be found.')
  await browser.close()
  server?.close()
  process.exit(1)
}
for (const entry of PAGES) if (entry[0] === '/deck/:last') entry[0] = `/deck/${slideCount}`

for (const [path, what] of PAGES) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()
  const bad = []
  const errors = []
  page.on('response', (r) => { if (r.status() >= 400) bad.push(`${r.status()} ${new URL(r.url()).pathname}`) })
  page.on('requestfailed', (r) => bad.push(`failed ${new URL(r.url()).pathname}`))
  page.on('console', (m) => {
    // Named, not blanket: Netlify's HUD tripping its own CSP; Slidev's own FloatingVue patch,
    // which fails identically on the root-based deck at turbine-deck.netlify.app; and the Wake
    // Lock the presenter view asks for, which a headless browser always denies.
    if (m.type() === 'error' && !KNOWN.test(m.text())) errors.push(m.text())
  })
  // The Wake Lock refusal arrives as an unhandled rejection, not a console line.
  page.on('pageerror', (e) => { if (!KNOWN.test(e.message)) errors.push(e.message) })

  const response = await page.goto(base + path, { waitUntil: 'networkidle', timeout: 45_000 }).catch((e) => {
    fail(`${path}: did not load — ${e.message.split('\n')[0]}`)
    return null
  })
  if (!response) { await context.close(); continue }
  if (!response.ok()) fail(`${path}: HTTP ${response.status()}`)
  await page.waitForTimeout(800)

  const shape = await page.evaluate(() => ({
    text: document.body.innerText.trim().length,
    styled: getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)',
    fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    images: [...document.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth > 0 && i.getBoundingClientRect().width > 100).length,
  }))

  const before = failures.length
  for (const b of [...new Set(bad)]) fail(`${path}: ${b}`)
  for (const e of errors) fail(`${path}: console — ${e.slice(0, 160)}`)
  if (shape.text < 20) fail(`${path}: nothing on the page (${shape.text} characters)`)
  // A route named for a diagram has to show one: otherwise a removed slide shifts the numbers
  // and this line keeps passing on whatever slide now sits there.
  if (/diagram/.test(what) && shape.images === 0) fail(`${path}: ${what}, but no image is showing`)
  // …and the route called "the last slide" has to BE the last slide, not whatever the deck
  // falls back to when the number is past the end.
  if (/last slide/.test(what)) {
    const counter = await counterOf(page)
    if (!counter) fail(`${path}: the slide has no counter, so there is no proof this is the last one`)
    else if (counter.current !== slideCount) fail(`${path}: shows slide ${counter.current} of ${counter.total}, not the last one`)
  }
  if (!shape.styled) fail(`${path}: the page has no background — its stylesheet did not arrive`)
  if (failures.length === before) {
    ok(`${path}  ${what} — ${shape.text} characters, fonts loaded: ${[...new Set(shape.fonts)].join(', ') || 'none'}`)
  }
  await context.close()
}

await browser.close()
server?.close()

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log('\nPASS — the deck and the festival site load under their paths, with every asset')
