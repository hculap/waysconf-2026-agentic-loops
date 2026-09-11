#!/usr/bin/env node
/**
 * Does the participant site actually work when you use it?
 *
 *   node checks/guideline-behaviour.mjs [--site guideline]
 *   node checks/guideline-behaviour.mjs --url https://waysconf.szymonpaluch.com
 *
 * `checks/guideline.mjs` measures what the page looks like. This measures what it does,
 * because the two things that would silently rot are both interactive: the operating-system
 * picker that every instruction below it depends on, and the copy button on every command.
 *
 * A designer who clicks "Windows" and gets macOS instructions has been actively misled —
 * worse than no picker. A copy button that silently does nothing is worse than no button,
 * because they will paste whatever was in the clipboard before.
 *
 * ── Why --url exists, and why it is not optional ────────────────────────────────────
 *
 * The folder mode passed everything while the deployed site was completely broken. Netlify
 * serves `Content-Security-Policy: ... script-src 'self'`, which blocks inline scripts.
 * The page inlined its script, so in production the picker did nothing and not one copy
 * button worked — and the local check server, which sends no CSP, ran all of it happily.
 *
 * A check that does not reach the thing it claims to measure reports confidently either
 * way. So: --url drives the real deployment through the same assertions, and BOTH modes
 * now fail on any console error, which is what would have caught this on the first run.
 *
 * Nothing is skipped: if a step cannot run, that is a failure.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argSite = process.argv.includes('--site') && process.argv[process.argv.indexOf('--site') + 1]
const argUrl = process.argv.includes('--url') && process.argv[process.argv.indexOf('--url') + 1]
const SITE = argSite ? resolve(argSite) : join(ROOT, 'guideline')

const OSES = ['mac', 'windows', 'linux']
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.zip': 'application/zip',
  '.txt': 'text/plain; charset=utf-8',
}

const failures = []
const fail = (m) => failures.push(m)
const ok = (m) => console.log(`  ok   ${m}`)

let server = null
let base = argUrl ? argUrl.replace(/\/$/, '') : null

if (!base) {
  server = createServer(async (req, res) => {
    let path = decodeURIComponent(req.url.split('?')[0])
    if (path.endsWith('/')) path += 'index.html'
    try {
      const body = await readFile(join(SITE, path))
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
    }
  })
  await new Promise((r) => server.listen(0, '127.0.0.1', r))
  base = `http://127.0.0.1:${server.address().port}`
}
const closeServer = () => server?.close()

let browser
try {
  browser = await chromium.launch()
} catch (error) {
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  closeServer()
  process.exit(1)
}

/** Which [data-os] values are visible right now. */
const visibleOses = (page) =>
  page.evaluate(() =>
    [...new Set(
      [...document.querySelectorAll('[data-os]')]
        .filter((el) => !el.hidden && el.offsetParent !== null)
        .map((el) => el.getAttribute('data-os')),
    )].sort(),
  )

console.log(`Measuring ${argUrl ? 'the DEPLOYED site' : 'the local folder'}: ${base}\n`)

// ── the picker, with JavaScript ──────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base })
  const page = await context.newPage()

  // Anything the browser complains about is a failure. A Content-Security-Policy that
  // refuses the page's own script is reported here and nowhere else — the DOM looks
  // perfect, the styles are right, and nothing works.
  const consoleErrors = []
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()) })
  page.on('pageerror', (e) => consoleErrors.push(`uncaught: ${e.message}`))

  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(500)

  // Did OUR script run? An absence of errors is an inference; this is a measurement.
  const ready = await page.evaluate(() => document.documentElement.getAttribute('data-sp-ready'))
  if (ready === '1') ok('the page script ran')
  else fail('the page script did not run — everything interactive below this line is dead')

  // Our document must contain no inline <script>, because the host serves script-src 'self'
  // and would block it. Asserting the shape rather than the symptom means a future inline
  // script is caught here even if the host's CSP changes.
  const inlineScripts = await page.evaluate(
    () => [...document.querySelectorAll('script')].filter((s) => !s.src).length,
  )
  if (inlineScripts === 0) ok('no inline scripts of our own — nothing for a CSP to refuse')
  else fail(`${inlineScripts} inline <script> in our own page; script-src 'self' blocks those`)

  // With that established, an inline-script CSP violation can only come from something the
  // host injected. Reported rather than swallowed: it is not ours, and it is not invisible.
  const foreign = []
  for (const e of consoleErrors) {
    const isInlineCsp = /Content Security Policy/i.test(e) && /inline script/i.test(e)
    if (isInlineCsp && inlineScripts === 0) foreign.push(e)
    else fail(`the browser refused something: ${e.slice(0, 180)}`)
  }
  if (foreign.length) {
    console.log(`  note ${foreign.length} inline-script CSP violation(s), none from our markup —`)
    console.log('       the host injects its own HUD script and its own CSP then blocks it.')
  } else if (consoleErrors.length === 0) {
    ok('no console errors')
  }

  const groups = await page.locator('[data-os]').count()
  if (groups < 6) fail(`only ${groups} [data-os] blocks on the page — the picker has nothing to switch`)
  else ok(`${groups} [data-os] blocks found`)

  const start = await visibleOses(page)
  if (start.length !== 1) fail(`on load, ${start.length} operating systems are showing at once (${start.join(', ')})`)
  else ok(`on load exactly one is showing: ${start[0]}`)

  for (const os of OSES) {
    await page.locator(`.ospick label[for="os-${os}"]`).click()
    const shown = await visibleOses(page)
    if (shown.length === 1 && shown[0] === os) ok(`clicking ${os} shows ${os} and nothing else`)
    else fail(`clicking ${os} shows ${shown.join(', ') || 'nothing'} — a reader following this is misled`)

    const checked = await page.locator(`#os-${os}`).isChecked()
    if (!checked) fail(`clicking ${os} did not check its radio — the selection is invisible`)
  }

  // keyboard: the radios must be reachable and operable without a mouse
  await page.locator('#os-mac').focus()
  await page.keyboard.press('ArrowRight')
  const afterKey = await visibleOses(page)
  if (afterKey.length === 1 && afterKey[0] === 'windows') ok('arrow key moves the selection')
  else fail(`arrow key from macOS left ${afterKey.join(', ') || 'nothing'} showing, expected windows`)

  // the choice survives a reload
  await page.locator('.ospick label[for="os-linux"]').click()
  await page.reload({ waitUntil: 'networkidle' })
  const afterReload = await visibleOses(page)
  if (afterReload.length === 1 && afterReload[0] === 'linux') ok('the choice survives a reload')
  else fail(`after reload the page shows ${afterReload.join(', ') || 'nothing'}, not the chosen linux`)

  // ── every copy button copies its own command ──────────────────────────────
  await page.locator('.ospick label[for="os-mac"]').click()
  const buttons = await page.locator('.copy[data-for]').all()
  let tested = 0
  for (const button of buttons) {
    if (!(await button.isVisible())) continue
    const id = await button.getAttribute('data-for')
    const expected = (await page.locator(`#${id}`).innerText()).trim()
    if (!expected) {
      fail(`the copy button for #${id} points at an empty block`)
      continue
    }
    await page.evaluate(() => navigator.clipboard.writeText('nothing was copied'))
    await button.click()
    const got = (await page.evaluate(() => navigator.clipboard.readText())).trim()
    if (got === expected) tested++
    else fail(`copy button for "${expected.split('\n')[0].slice(0, 40)}" put ${JSON.stringify(got.slice(0, 40))} on the clipboard`)

    const label = await button.getAttribute('aria-label')
    if (!label || label === 'Copy') {
      fail(`a copy button's accessible name is ${JSON.stringify(label)} — every button on the page would read the same`)
    }
  }
  if (tested === 0) fail('no copy button was tested — a measurement of nothing is not a pass')
  else ok(`${tested} copy buttons put exactly their own command on the clipboard`)

  await context.close()
}

// ── the section rail, on both tabs ───────────────────────────────────────────
for (const path of ['/', '/workshop/']) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 30_000 })
  await page.waitForTimeout(400)

  const links = await page.locator('.toc a').all()
  if (links.length < 3) {
    fail(`${path}: the section rail has ${links.length} entries`)
    await context.close()
    continue
  }

  // every entry must point at a heading that exists, in document order
  const targets = await page.evaluate(() =>
    [...document.querySelectorAll('.toc a')].map((a) => {
      const el = document.getElementById(decodeURIComponent(a.hash.slice(1)))
      return { hash: a.hash, found: !!el, top: el ? el.getBoundingClientRect().top + window.scrollY : -1, text: a.textContent.trim() }
    }),
  )
  const missing = targets.filter((t) => !t.found)
  if (missing.length) fail(`${path}: ${missing.length} rail entries point at headings that do not exist`)
  const ordered = targets.every((t, i) => i === 0 || t.top >= targets[i - 1].top)
  if (!ordered) fail(`${path}: the rail is not in document order`)

  if (!missing.length && ordered) ok(`${path}: ${targets.length} rail entries, all real and in order`)

  // the mark must follow the scroll — check it at several depths, not one
  const probes = [0.25, 0.5, 0.8]
  const wrong = []
  for (const fraction of probes) {
    const expected = await page.evaluate((f) => {
      const y = (document.body.scrollHeight - window.innerHeight) * f
      window.scrollTo(0, y)
      return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => {
        const line = window.innerHeight / 3
        const heads = [...document.querySelectorAll('main h2[id]')]
        let want = heads[0]
        for (const h of heads) if (h.getBoundingClientRect().top <= line) want = h
        if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) want = heads[heads.length - 1]
        const current = document.querySelector('.toc a[aria-current]')
        r({ want: want ? want.id : null, got: current ? decodeURIComponent(current.hash.slice(1)) : null })
      })))
    }, fraction)
    if (expected.want !== expected.got) wrong.push(`at ${Math.round(fraction * 100)}% down: marked ${expected.got}, reading ${expected.want}`)
  }
  if (wrong.length) for (const w of wrong) fail(`${path}: the rail marks the wrong section — ${w}`)
  else ok(`${path}: the mark follows the scroll at ${probes.length} depths`)

  // exactly one marked, always
  const marked = await page.locator('.toc a[aria-current]').count()
  if (marked !== 1) fail(`${path}: ${marked} rail entries are marked current; exactly one should be`)

  // and clicking one goes there
  const third = page.locator('.toc a').nth(2)
  const hash = await third.getAttribute('href')
  await third.click()
  await page.waitForTimeout(500)
  const landed = await page.evaluate((h) => {
    const el = document.getElementById(decodeURIComponent(h.slice(1)))
    return el ? Math.abs(el.getBoundingClientRect().top) : Infinity
  }, hash)
  if (landed < 140) ok(`${path}: clicking an entry scrolls to its section`)
  else fail(`${path}: clicking ${hash} left its heading ${Math.round(landed)}px from the top`)

  await context.close()
}

// ── the picker, without JavaScript ───────────────────────────────────────────
{
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } })
  const page = await context.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30_000 })
  const shown = await visibleOses(page)
  if (shown.length === OSES.length) ok('with JavaScript off, all three systems are shown — nothing is lost')
  else fail(`with JavaScript off only ${shown.join(', ') || 'nothing'} is reachable; the rest is unreadable`)
  await context.close()
}

await browser.close()
closeServer()

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log(`\nPASS — ${argUrl ? 'live' : 'locally'}: the picker switches, the keyboard works, and every command copies itself`)
