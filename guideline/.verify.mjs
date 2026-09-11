/**
 * Throwaway verifier for guideline/index.html. Not part of the project's gates.
 * Run: node guideline/.verify.mjs
 */
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const url = 'file://' + path.join(here, 'index.html')

const widths = [390, 768, 1440]
let failures = 0
const fail = (m) => {
  failures++
  console.log('  FAIL ' + m)
}
const ok = (m) => console.log('  ok   ' + m)

const browser = await chromium.launch()
const context = await browser.newContext()

const foreign = []
context.on('request', (r) => {
  if (!r.url().startsWith('file://') && !r.url().startsWith('data:')) foreign.push(r.url())
})

const page = await context.newPage()
const consoleErrors = []
page.on('console', (m) => {
  if (m.type() === 'error') consoleErrors.push(m.text())
})
page.on('pageerror', (e) => consoleErrors.push(String(e)))

await page.setViewportSize({ width: 1440, height: 1000 })
const response = await page.goto(url, { waitUntil: 'load' })
console.log('\n== load ==')
console.log('  status', response ? response.status() : 'file')

console.log('\n== structure ==')
const structure = await page.evaluate(() => {
  const sel = (s) => Array.from(document.querySelectorAll(s))
  return {
    lang: document.documentElement.lang,
    title: document.title,
    description: document.querySelector('meta[name="description"]')?.content?.length ?? 0,
    h1: sel('h1').map((h) => h.textContent.trim()),
    headingOrder: sel('h1,h2,h3,h4').map((h) => Number(h.tagName[1])),
    banner: sel('header').length,
    main: sel('main').length,
    contentinfo: sel('footer').length,
    navs: sel('nav').map((n) => n.getAttribute('aria-label')),
    firstFocusable: (() => {
      const f = document.querySelector(
        'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])'
      )
      return f ? f.outerHTML.slice(0, 60) : null
    })(),
    images: sel('img').map((i) => i.getAttribute('alt')),
    svgs: sel('svg').length,
    fontFamilies: getComputedStyle(document.body).fontFamily,
    bg: getComputedStyle(document.body).backgroundColor,
  }
})
console.log('  lang:', structure.lang)
console.log('  title:', structure.title)
console.log('  body font:', structure.fontFamilies)
console.log('  body bg:', structure.bg)
structure.lang === 'en' ? ok('lang="en"') : fail('lang is ' + structure.lang)
structure.h1.length === 1 ? ok('exactly one h1: ' + structure.h1[0]) : fail(structure.h1.length + ' h1 elements')
structure.banner === 1 ? ok('one <header> banner') : fail(structure.banner + ' headers')
structure.main === 1 ? ok('one <main>') : fail(structure.main + ' mains')
structure.contentinfo === 1 ? ok('one <footer> contentinfo') : fail(structure.contentinfo + ' footers')
structure.navs.every(Boolean) ? ok('every nav has aria-label: ' + JSON.stringify(structure.navs)) : fail('unlabelled nav')
structure.firstFocusable && structure.firstFocusable.includes('skip-link')
  ? ok('skip link is first focusable')
  : fail('first focusable is ' + structure.firstFocusable)
structure.description >= 50 && structure.description <= 300
  ? ok('meta description length ' + structure.description)
  : fail('meta description length ' + structure.description)

// heading order: no level skipped
let prev = 0
let skip = null
for (const lvl of structure.headingOrder) {
  if (prev && lvl > prev + 1) skip = `${prev} -> ${lvl}`
  prev = lvl
}
skip ? fail('heading level skipped: ' + skip) : ok('no skipped heading levels (' + structure.headingOrder.join(',') + ')')
structure.images.length === 0
  ? ok('no <img> elements (nothing to get alt wrong on)')
  : structure.images.every((a) => a !== null)
    ? ok('every img has an alt attribute')
    : fail('img without alt')

console.log('\n== anchors ==')
const anchors = await page.evaluate(() => {
  const out = { internal: [], missing: [], external: [], mailto: [], emptyText: [] }
  for (const a of document.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href')
    if (!a.textContent.trim() && !a.getAttribute('aria-label')) out.emptyText.push(href)
    if (href.startsWith('#')) {
      out.internal.push(href)
      if (!document.getElementById(href.slice(1))) out.missing.push(href)
    } else if (href.startsWith('mailto:')) out.mailto.push(href)
    else out.external.push(href)
  }
  return out
})
console.log('  internal anchors:', [...new Set(anchors.internal)].join(' '))
anchors.missing.length === 0
  ? ok(anchors.internal.length + ' internal anchors, all resolve')
  : fail('unresolved anchors: ' + anchors.missing.join(', '))
anchors.emptyText.length === 0 ? ok('every link has discernible text') : fail('empty link text: ' + anchors.emptyText)
console.log('  external:', [...new Set(anchors.external)].join('\n              '))
console.log('  mailto:', anchors.mailto.join(', '))

console.log('\n== progressive enhancement / js ==')
const js = await page.evaluate(() => ({
  copyButtons: document.querySelectorAll('.code__copy:not([hidden])').length,
  totalCode: document.querySelectorAll('.code').length,
  tablistVisible: !document.querySelector('[data-tablist]').hidden,
  visiblePanels: Array.from(document.querySelectorAll('.os-panel')).filter((p) => !p.hidden).length,
  selectedTab: document.querySelector('[aria-selected="true"]')?.textContent,
  tabRoles: Array.from(document.querySelectorAll('[data-tab]')).map((t) => t.getAttribute('role')),
  panelRoles: Array.from(document.querySelectorAll('.os-panel')).map((p) => p.getAttribute('role')),
  progress: document.querySelector('[data-progress]')?.textContent,
  details: document.querySelectorAll('.faq details').length,
}))
console.log(' ', JSON.stringify(js))
js.copyButtons === js.totalCode ? ok(js.totalCode + ' copy buttons enabled') : fail('copy buttons ' + js.copyButtons + '/' + js.totalCode)
js.visiblePanels === 1 ? ok('one OS panel visible, tabs active') : fail(js.visiblePanels + ' panels visible')
js.details >= 8 ? ok(js.details + ' FAQ entries') : fail('only ' + js.details + ' FAQ entries')

// keyboard: arrow key moves the tab
await page.locator('[data-tab="os-macos"]').focus()
await page.keyboard.press('ArrowRight')
const afterArrow = await page.evaluate(() => document.querySelector('[aria-selected="true"]').textContent.trim())
afterArrow === 'Windows' ? ok('ArrowRight moves tab selection to Windows') : fail('arrow key selection: ' + afterArrow)

// checkbox persistence
await page.locator('[data-tick="github"]').check()
const progressText = await page.locator('[data-progress]').textContent()
progressText.startsWith('1 of 4') ? ok('checklist progress: ' + progressText) : fail('progress reads ' + progressText)

console.log('\n== no external requests ==')
foreign.length === 0 ? ok('zero non-local requests') : fail('requested: ' + foreign.join(', '))
consoleErrors.length === 0 ? ok('no console errors') : fail('console: ' + consoleErrors.join(' | '))

console.log('\n== javascript disabled ==')
const noJs = await browser.newContext({ javaScriptEnabled: false })
const noJsPage = await noJs.newPage()
await noJsPage.setViewportSize({ width: 390, height: 900 })
await noJsPage.goto(url)
const noJsState = await noJsPage.evaluate(() => ({
  visiblePanels: Array.from(document.querySelectorAll('.os-panel')).filter(
    (p) => p.offsetParent !== null
  ).length,
  copyVisible: document.querySelectorAll('.code__copy:not([hidden])').length,
  commands: Array.from(document.querySelectorAll('.code code')).length,
  progressHidden: document.querySelector('[data-progress]').hidden,
}))
console.log(' ', JSON.stringify(noJsState))
noJsState.visiblePanels === 3 ? ok('all three OS blocks readable without JS') : fail('panels without JS: ' + noJsState.visiblePanels)
noJsState.copyVisible === 0 ? ok('copy buttons stay hidden without JS') : fail('dangling copy buttons')
await noJs.close()

console.log('\n== responsive + axe ==')
for (const width of widths) {
  await page.setViewportSize({ width, height: 1000 })
  await page.waitForTimeout(150)
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth
  )
  overflow <= 0 ? ok(width + 'px: no horizontal overflow') : fail(width + 'px: overflows by ' + overflow + 'px')

  const wide = await page.evaluate((w) => {
    const bad = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width > w + 1 && getComputedStyle(el).overflowX !== 'auto' && !el.closest('[aria-hidden="true"]')) {
        bad.push(el.tagName + '.' + (el.className || '').toString().slice(0, 30) + ' = ' + Math.round(r.width))
      }
    }
    return bad.slice(0, 5)
  }, width)
  wide.length === 0 ? ok(width + 'px: no element wider than viewport') : fail(width + 'px: ' + wide.join(' | '))

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze()
  const serious = results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
  const minor = results.violations.filter((v) => !['serious', 'critical'].includes(v.impact))
  serious.length === 0
    ? ok(width + 'px: axe, zero serious or critical violations')
    : fail(
        width +
          'px: ' +
          serious.map((v) => `${v.id} (${v.impact}) ${v.nodes.length}x :: ${v.nodes[0].target}`).join(' | ')
      )
  if (minor.length) {
    console.log('  note ' + width + 'px minor/moderate: ' + minor.map((v) => `${v.id} (${v.impact}) ${v.nodes[0].target}`).join(' | '))
  }

  // open every FAQ entry and re-run axe on the expanded state
  await page.evaluate(() => document.querySelectorAll('.faq details').forEach((d) => (d.open = true)))
  const expanded = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  const expandedSerious = expanded.violations.filter((v) => ['serious', 'critical'].includes(v.impact))
  expandedSerious.length === 0
    ? ok(width + 'px: axe with every FAQ open, clean')
    : fail(width + 'px expanded: ' + expandedSerious.map((v) => v.id + ' ' + v.nodes[0].target).join(' | '))
  await page.evaluate(() => document.querySelectorAll('.faq details').forEach((d, i) => (d.open = i === 0)))

  await page.screenshot({
    path: path.join(here, `.shot-${width}.png`),
    fullPage: width !== 1440,
  })
}

console.log('\n== focus visibility ==')
await page.setViewportSize({ width: 1440, height: 1000 })
await page.reload()
const focusProbe = await page.evaluate(() => {
  const out = []
  const targets = ['.skip-link', '.site__nav a', '.btn--primary', '.tab', '.code__copy', '.faq summary', 'input[type=checkbox]']
  for (const t of targets) {
    const el = document.querySelector(t)
    if (!el) {
      out.push([t, 'MISSING'])
      continue
    }
    el.focus()
    const cs = getComputedStyle(el)
    out.push([t, cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor])
  }
  return out
})
for (const [t, v] of focusProbe) console.log('  ' + t.padEnd(24) + v)

console.log('\n== touch targets (390px) ==')
await page.setViewportSize({ width: 390, height: 900 })
const small = await page.evaluate(() => {
  const bad = []
  for (const el of document.querySelectorAll('a[href], button, input, summary')) {
    if (el.closest('[hidden]') || el.offsetParent === null) continue
    const r = el.getBoundingClientRect()
    if (r.width < 24 || r.height < 24) bad.push(el.tagName + ' "' + el.textContent.trim().slice(0, 24) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height))
  }
  return bad
})
small.length === 0 ? ok('every visible control is at least 24x24') : fail('small targets: ' + small.join(' | '))

console.log('\n== reduced motion ==')
const rm = await browser.newContext({ reducedMotion: 'reduce' })
const rmPage = await rm.newPage()
await rmPage.goto(url)
const rotor = await rmPage.evaluate(() => {
  const el = document.querySelector('.hero__rotor')
  const cs = getComputedStyle(el)
  return { duration: cs.animationDuration, iteration: cs.animationIterationCount }
})
console.log(' ', JSON.stringify(rotor))
parseFloat(rotor.duration) < 0.1 ? ok('rotor frozen under prefers-reduced-motion') : fail('rotor still animating: ' + rotor.duration)
await rm.close()

await browser.close()
console.log('\n' + (failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'))
process.exit(failures === 0 ? 0 : 1)
