#!/usr/bin/env node
/**
 * Does the participant site actually work when you use it?
 *
 *   node checks/guideline-behaviour.mjs [--site guideline]
 *
 * `checks/guideline.mjs` measures what the page looks like. This measures what it does,
 * because the two things that would silently rot are both interactive: the operating-system
 * picker that every instruction below it depends on, and the copy button on every command.
 *
 * A designer who clicks "Windows" and gets macOS instructions has been actively misled —
 * worse than no picker. A copy button that silently does nothing is worse than no button,
 * because they will paste whatever was in the clipboard before.
 *
 * Every assertion is made against a real browser with a real clipboard. Nothing is skipped:
 * if a step cannot run, that is a failure.
 */

import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join, extname, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argSite = process.argv.includes('--site') && process.argv[process.argv.indexOf('--site') + 1]
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

const server = createServer(async (req, res) => {
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
const base = `http://127.0.0.1:${server.address().port}`

let browser
try {
  browser = await chromium.launch()
} catch (error) {
  console.error(`FAIL — the browser would not start, so nothing was measured: ${error.message}`)
  server.close()
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

console.log(`Using guideline/ at ${base}\n`)

// ── the picker, with JavaScript ──────────────────────────────────────────────
{
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: base })
  const page = await context.newPage()
  await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 30_000 })

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
server.close()

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log('\nPASS — the picker switches, the keyboard works, and every command copies itself')
