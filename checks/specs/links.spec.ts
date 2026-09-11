/**
 * LINKS gate — AC-48 to AC-51 of brief/ACCEPTANCE.md.
 *
 * Internal integrity only. External URLs are collected and printed, never requested:
 * CANON §11 lets the ticket CTAs and the footer small print point at a fictional domain
 * that does not resolve, and a gate must not fail on a condition the brief allows. It
 * must also not go and knock on somebody's server thirty times during a workshop.
 *
 * What "resolves" means here is deliberately literal. An anchor resolves if an element
 * with that id exists in the document; an IDREF resolves if the id exists; an asset
 * resolves if the file is on disk in dist/. None of those three questions needs an
 * opinion, and none of them is allowed to pass because the check could not be made —
 * a missing dist/ is reported as the failure it is, not skipped.
 */

import { test } from '@playwright/test'
import { existsSync, statSync } from 'node:fs'
import { join, normalize, sep } from 'node:path'
import { Gate, ROOT } from '../lib/gate'

const gate = new Gate('links', 'Links and assets', ['AC-48', 'AC-49', 'AC-50', 'AC-51'])

const DIST = join(ROOT, 'dist')

/**
 * IDREF attributes, with the elements each one is legal on.
 *
 * `for` and `form` are scoped to their owning elements on purpose: `for` is an IDREF only
 * on `<label>` and `<output>`, and a stray `for` on a `<div>` is a different defect
 * (probably a React habit) that this criterion does not own. `aria-labelledby`,
 * `aria-describedby` and `aria-controls` are ID *lists*, so each token is resolved
 * separately — one bad token in a list of three is still a broken reference.
 */
interface IdrefSpec {
  attribute: string
  selector: string
  list: boolean
}

const IDREF_ATTRIBUTES: IdrefSpec[] = [
  { attribute: 'aria-controls', selector: '[aria-controls]', list: true },
  { attribute: 'aria-labelledby', selector: '[aria-labelledby]', list: true },
  { attribute: 'aria-describedby', selector: '[aria-describedby]', list: true },
  { attribute: 'for', selector: 'label[for], output[for]', list: false },
  {
    attribute: 'form',
    selector: 'button[form], fieldset[form], input[form], label[form], object[form], output[form], select[form], textarea[form]',
    list: false,
  },
]

/**
 * Attributes that point at a file the browser will fetch. `a[href]` is not in this list:
 * an anchor href is a destination, not an asset, and the ones on this page are fragments,
 * mailto: links and the deliberately dead external URLs from CONTENT.md §16.
 */
interface AssetSpec {
  selector: string
  attribute: string
}

const ASSET_ATTRIBUTES: AssetSpec[] = [
  { selector: 'img[src]', attribute: 'src' },
  { selector: 'script[src]', attribute: 'src' },
  { selector: 'source[src]', attribute: 'src' },
  { selector: 'audio[src]', attribute: 'src' },
  { selector: 'video[src]', attribute: 'src' },
  { selector: 'video[poster]', attribute: 'poster' },
  { selector: 'iframe[src]', attribute: 'src' },
  { selector: 'embed[src]', attribute: 'src' },
  { selector: 'track[src]', attribute: 'src' },
  { selector: 'input[type="image"][src]', attribute: 'src' },
  { selector: 'object[data]', attribute: 'data' },
  { selector: 'link[href]', attribute: 'href' },
  { selector: 'use[href]', attribute: 'href' },
]

interface AnchorRef {
  selector: string
  href: string
  raw: string
  /** Percent-decoded, because `#faq-r%C3%BCm` and `#faq-rüm` are the same target. */
  fragment: string
  exists: boolean
}

interface IdrefIssue {
  selector: string
  attribute: string
  value: string
  token: string
}

interface AssetRef {
  selector: string
  origin: 'attribute' | 'srcset' | 'css url()' | 'inline style'
  attribute: string
  raw: string
  resolved: string | null
  sameOrigin: boolean
  scheme: string
}

interface LinkHarvest {
  pageOrigin: string
  anchors: AnchorRef[]
  badHrefs: { selector: string; href: string | null }[]
  idrefs: IdrefIssue[]
  assets: AssetRef[]
  unreadableStylesheets: { href: string; reason: string }[]
  idCount: number
}

/**
 * One pass over the document, in the page. Everything that needs the DOM happens here;
 * everything that needs the filesystem happens in Node afterwards. The attribute tables
 * are passed in rather than repeated here, so there is one place to read what this gate
 * considers an IDREF and what it considers an asset.
 */
function harvestLinks(specs: { idrefs: IdrefSpec[]; assets: AssetSpec[] }): LinkHarvest {
  function selectorFor(el: Element | null): string {
    if (!el) return '(document)'
    const parts: string[] = []
    let cur: Element | null = el
    let depth = 0
    while (cur && depth < 5) {
      if (cur.id) {
        parts.unshift(`#${cur.id}`)
        break
      }
      const sectionName = cur.getAttribute('data-section')
      if (sectionName && cur !== el) {
        parts.unshift(`[data-section="${sectionName}"]`)
        break
      }
      let part = cur.tagName.toLowerCase()
      if (sectionName) part += `[data-section="${sectionName}"]`
      const classes = (cur.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
      if (classes.length) part += `.${classes.join('.')}`
      const parent: Element | null = cur.parentElement
      if (parent) {
        const sameTag = Array.from(parent.children).filter((c) => c.tagName === cur!.tagName)
        if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(cur) + 1})`
      }
      parts.unshift(part)
      cur = cur.parentElement
      depth++
    }
    return parts.join(' > ')
  }

  const pageOrigin = window.location.origin

  // ── AC-48 and AC-49: anchors ───────────────────────────────────────────────
  const anchors: { selector: string; href: string; raw: string; fragment: string }[] = []
  const badHrefs: { selector: string; href: string | null }[] = []

  for (const el of Array.from(document.querySelectorAll('a, area'))) {
    const raw = el.getAttribute('href')
    if (raw === null) {
      badHrefs.push({ selector: selectorFor(el), href: null })
      continue
    }
    const trimmed = raw.trim()
    if (trimmed === '' || trimmed === '#' || /^javascript:/i.test(trimmed)) {
      badHrefs.push({ selector: selectorFor(el), href: raw })
      continue
    }
    if (trimmed.startsWith('#')) {
      anchors.push({
        selector: selectorFor(el),
        href: trimmed,
        raw,
        fragment: trimmed.slice(1),
      })
    }
  }

  // ── AC-50: IDREFs ──────────────────────────────────────────────────────────
  const ids = new Set<string>()
  for (const el of Array.from(document.querySelectorAll('[id]'))) {
    const id = el.getAttribute('id')
    if (id) ids.add(id)
  }
  // The HTML spec also lets a named anchor be a fragment target. Legacy, but valid, and
  // a gate should not report a working link as broken.
  const names = new Set<string>()
  for (const el of Array.from(document.querySelectorAll('a[name]'))) {
    const name = el.getAttribute('name')
    if (name) names.add(name)
  }

  const idrefs: IdrefIssue[] = []
  for (const spec of specs.idrefs) {
    for (const el of Array.from(document.querySelectorAll(spec.selector))) {
      const value = el.getAttribute(spec.attribute) ?? ''
      const tokens = spec.list ? value.trim().split(/\s+/).filter(Boolean) : [value.trim()].filter(Boolean)
      if (tokens.length === 0) {
        idrefs.push({ selector: selectorFor(el), attribute: spec.attribute, value, token: '' })
        continue
      }
      for (const token of tokens) {
        if (!ids.has(token)) {
          idrefs.push({ selector: selectorFor(el), attribute: spec.attribute, value, token })
        }
      }
    }
  }

  // ── AC-51: assets ──────────────────────────────────────────────────────────
  const assets: AssetRef[] = []

  const pushRef = (
    selector: string,
    origin: AssetRef['origin'],
    attribute: string,
    raw: string,
    base: string,
  ): void => {
    const value = raw.trim()
    if (!value) return
    const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value)?.[1]?.toLowerCase() ?? ''
    // Inline data, blob URLs and non-fetching schemes have no file behind them.
    if (['data', 'blob', 'mailto', 'tel', 'javascript', 'about'].includes(scheme)) return
    if (value.startsWith('#')) return
    let resolved: string | null = null
    let sameOrigin = false
    try {
      const url = new URL(value, base)
      sameOrigin = url.origin === pageOrigin
      resolved = url.href
    } catch {
      resolved = null
    }
    assets.push({ selector, origin, attribute, raw: value, resolved, sameOrigin, scheme })
  }

  for (const spec of specs.assets) {
    for (const el of Array.from(document.querySelectorAll(spec.selector))) {
      pushRef(selectorFor(el), 'attribute', spec.attribute, el.getAttribute(spec.attribute) ?? '', document.baseURI)
    }
  }

  // srcset is a comma-separated list of "url descriptor" pairs. Splitting on commas alone
  // would cut data: URIs in half, which is why the descriptor is stripped per candidate
  // after splitting on commas that are followed by a plausible URL start.
  for (const el of Array.from(document.querySelectorAll('img[srcset], source[srcset]'))) {
    const value = el.getAttribute('srcset') ?? ''
    for (const candidate of value.split(/\s*,\s*(?![^(]*\))/)) {
      const url = candidate.trim().split(/\s+/)[0] ?? ''
      pushRef(selectorFor(el), 'srcset', 'srcset', url, document.baseURI)
    }
  }

  for (const el of Array.from(document.querySelectorAll('[style]'))) {
    const style = el.getAttribute('style') ?? ''
    for (const match of Array.from(style.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi))) {
      pushRef(selectorFor(el), 'inline style', 'style', match[2] ?? '', document.baseURI)
    }
  }

  // Stylesheet url() references. Same-origin sheets are readable through the CSSOM; a
  // cross-origin sheet throws on .cssRules and is reported rather than ignored, because
  // "we could not look" is not the same as "there is nothing wrong".
  const unreadableStylesheets: { href: string; reason: string }[] = []
  const readRules = (rules: CSSRuleList, base: string, label: string): void => {
    for (const rule of Array.from(rules)) {
      const nested = (rule as CSSGroupingRule).cssRules
      if (nested) {
        readRules(nested, base, label)
        continue
      }
      const text = rule.cssText ?? ''
      for (const match of Array.from(text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi))) {
        pushRef(label, 'css url()', 'url()', match[2] ?? '', base)
      }
    }
  }

  for (const sheet of Array.from(document.styleSheets)) {
    const href = sheet.href ?? '(inline <style>)'
    try {
      const rules = sheet.cssRules
      if (!rules) {
        unreadableStylesheets.push({ href, reason: 'cssRules was null' })
        continue
      }
      readRules(rules, sheet.href ?? document.baseURI, href)
    } catch (error) {
      unreadableStylesheets.push({ href, reason: String(error).slice(0, 160) })
    }
  }

  // Fragment resolution happens here, where the document is, so that AC-48 compares
  // against the same id set AC-50 used.
  const resolvedAnchors: AnchorRef[] = anchors.map((a) => {
    let decoded = a.fragment
    try {
      decoded = decodeURIComponent(a.fragment)
    } catch {
      /* a malformed escape is reported as an unresolved fragment below */
    }
    const exists = ids.has(a.fragment) || ids.has(decoded) || names.has(a.fragment) || names.has(decoded)
    return { ...a, fragment: decoded, exists }
  })

  return {
    pageOrigin,
    anchors: resolvedAnchors,
    badHrefs,
    idrefs,
    assets,
    unreadableStylesheets,
    idCount: ids.size,
  }
}

/**
 * Map a same-origin URL onto a file in dist/.
 *
 * `astro preview` serves dist/ at the root, so the pathname is the path on disk. A
 * directory path gets index.html appended, which is what the server does and what
 * astro.config.mjs `build.format: 'directory'` produces.
 */
function distPathFor(href: string): { path: string; exists: boolean } | null {
  let url: URL
  try {
    url = new URL(href)
  } catch {
    return null
  }
  let pathname: string
  try {
    pathname = decodeURIComponent(url.pathname)
  } catch {
    pathname = url.pathname
  }
  const relative = pathname.replace(/^\/+/, '')
  // Refuse to walk out of dist/ with ../ segments: a reference that escapes the build
  // output does not exist in it, whatever the filesystem says.
  const candidate = normalize(join(DIST, relative))
  if (candidate !== DIST && !candidate.startsWith(DIST + sep)) {
    return { path: candidate, exists: false }
  }
  if (existsSync(candidate)) {
    try {
      if (statSync(candidate).isDirectory()) {
        const index = join(candidate, 'index.html')
        return { path: index, exists: existsSync(index) }
      }
    } catch {
      return { path: candidate, exists: false }
    }
    return { path: candidate, exists: true }
  }
  return { path: candidate, exists: false }
}

let completed = false

test('links', async ({ page }) => {
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 1440, height: 900 })

  let harvest: LinkHarvest
  try {
    const response = await page.goto('/', { waitUntil: 'load' })
    if (!response || !response.ok()) {
      gate.fail({
        criterion: 'AC-48',
        message: `LINKS: the page could not be loaded (HTTP ${response ? response.status() : 'no response'}). No link criterion was evaluated.`,
        where: page.url(),
      })
      return
    }
    await page.waitForLoadState('networkidle').catch(() => {
      /* idle timeouts are not link defects; the DOM is parsed by now. */
    })
    // Stylesheets have to be parsed before the CSSOM can be walked for url() references.
    // document.fonts.ready settles only once style resolution has finished, which is the
    // cheapest honest signal that the sheets are in.
    await page.evaluate(() => document.fonts.ready.then(() => true)).catch(() => {
      /* no font loading API, or no fonts: the harvest below is still valid. */
    })

    harvest = await page.evaluate(harvestLinks, { idrefs: IDREF_ATTRIBUTES, assets: ASSET_ATTRIBUTES })
    if (harvest.unreadableStylesheets.length) {
      // A sheet that is still loading and a sheet that cannot be read look identical for
      // one frame. Gates must be idempotent (ACCEPTANCE.md), so the harvest is repeated
      // once after a pause: a genuinely cross-origin sheet is still unreadable, a slow
      // one is not, and the second reading is the one that gets reported.
      await page.waitForTimeout(500)
      harvest = await page.evaluate(harvestLinks, { idrefs: IDREF_ATTRIBUTES, assets: ASSET_ATTRIBUTES })
    }
  } catch (error) {
    gate.fail({
      criterion: 'AC-48',
      message: `LINKS: the page could not be read. No link criterion was evaluated. ${String(error).slice(0, 300)}`,
      where: page.url(),
    })
    return
  }

  // ── AC-48: in-page anchors ─────────────────────────────────────────────────
  for (const anchor of harvest.anchors) {
    if (anchor.exists) continue
    // "#top" is the one fragment that resolves without an element: the HTML spec makes it
    // the top of the document. CONTENT.md §3 points the wordmark there, so failing it
    // would be the gate disagreeing with the brief about a link that works.
    if (anchor.fragment.toLowerCase() === 'top') {
      gate.note('AC-48: href="#top" resolves to the top of the document per the HTML fragment rules, with or without an element of that id. Accepted.')
      continue
    }
    gate.fail({
      criterion: 'AC-48',
      message: `AC-48 LINKS: <a href="${anchor.raw}"> in ${anchor.selector} points to an id that does not exist`,
      where: anchor.selector,
      expected: `an element with id="${anchor.fragment}"`,
      actual: 'no such id in the document',
    })
  }

  // ── AC-49: empty and placeholder hrefs ─────────────────────────────────────
  for (const bad of harvest.badHrefs) {
    gate.fail({
      criterion: 'AC-49',
      message: `AC-49 LINKS: <a> in ${bad.selector} has href="${bad.href ?? ''}". Empty, "#" and javascript: hrefs are not allowed`,
      where: bad.selector,
      expected: 'a fragment, a mailto: address, or an absolute URL',
      actual: bad.href === null ? 'no href attribute' : bad.href,
      hint: bad.href === null
        ? 'An <a> without href is not a link and is not focusable. Use a <button> if it performs an action.'
        : 'CONTENT.md §16 lists every link on the page and its target.',
    })
  }

  // ── AC-50: IDREF attributes ────────────────────────────────────────────────
  for (const issue of harvest.idrefs) {
    gate.fail({
      criterion: 'AC-50',
      message: `AC-50 LINKS: ${issue.attribute}="${issue.token}" on ${issue.selector} references an id that does not exist`,
      where: issue.selector,
      expected: `an element with id="${issue.token}"`,
      actual: issue.token === '' ? `${issue.attribute}="${issue.value}" (no id tokens)` : 'no such id in the document',
    })
  }
  gate.note(`AC-50: checked ${IDREF_ATTRIBUTES.map((a) => a.attribute).join(', ')} against ${harvest.idCount} ids in the document.`)

  // ── AC-51: local assets exist in dist/ ─────────────────────────────────────
  if (!existsSync(DIST)) {
    // Not a skip. The criterion is that every referenced asset exists in dist/; if there
    // is no dist/, none of them does, and that is true rather than unknown.
    gate.fail({
      criterion: 'AC-51',
      message: `AC-51 LINKS: dist/ does not exist at ${DIST}, so no referenced asset can be in it`,
      where: 'dist/',
      hint: 'Run npm run build before npm run check.',
    })
  } else {
    const external: string[] = []
    const seen = new Set<string>()
    let localChecked = 0

    for (const asset of harvest.assets) {
      if (asset.resolved === null) {
        gate.fail({
          criterion: 'AC-51',
          message: `AC-51 LINKS: asset ${asset.raw} referenced by ${asset.selector} is not a resolvable URL`,
          where: `${asset.selector} [${asset.attribute}]`,
          actual: asset.raw,
        })
        continue
      }
      if (!asset.sameOrigin) {
        external.push(`${asset.resolved} (${asset.selector})`)
        continue
      }
      const key = `${asset.selector}|${asset.resolved}`
      if (seen.has(key)) continue
      seen.add(key)

      const target = distPathFor(asset.resolved)
      if (!target) continue
      localChecked++
      if (target.exists) continue

      gate.fail({
        criterion: 'AC-51',
        message: `AC-51 LINKS: asset ${asset.raw} referenced by ${asset.selector} is missing from dist/ (resolved to ${target.path})`,
        where: `${asset.selector} [${asset.origin}]`,
        expected: target.path,
        actual: 'no such file',
        hint: 'Static files belong in public/, which the build copies into dist/. design/ is not served.',
      })
    }

    for (const sheet of harvest.unreadableStylesheets) {
      gate.fail({
        criterion: 'AC-51',
        message: `AC-51 LINKS: stylesheet ${sheet.href} could not be read, so its url() references were not verified (${sheet.reason})`,
        where: sheet.href,
        hint: 'A cross-origin stylesheet is also a CANON §11 violation: no third-party assets. Self-host it and the references become checkable.',
      })
    }

    // External URLs are collected and printed, never requested. CANON §11 allows them to
    // be dead, so a gate that fetched them would fail on a condition the brief permits —
    // and would make the verifier depend on somebody else's uptime.
    if (external.length) {
      gate.note(`AC-51: ${external.length} external reference(s), not requested: ${Array.from(new Set(external)).join(', ')}`)
    }
    gate.note(`AC-51: ${localChecked} local asset reference(s) resolved against ${DIST}.`)
  }

  gate.note(`Checked ${harvest.anchors.length} in-page anchor(s), ${harvest.assets.length} asset reference(s).`)
  completed = true
})

test.afterAll(() => {
  // The same guard as every other gate: a run that did not finish is a failed run, not a
  // green one. Silence is the one result a verifier is never allowed to report as a pass.
  if (!completed && gate.failures.length === 0) {
    gate.fail({
      criterion: 'AC-48',
      message: 'LINKS: the gate did not finish and recorded no result. Treat this as a failed run, not a pass.',
      where: 'checks/specs/links.spec.ts',
    })
  }
  gate.flush({
    completed,
    criteria: 'AC-48 to AC-51',
    distRoot: DIST,
  })
})
