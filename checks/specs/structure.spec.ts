import { test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { Gate, BREAKPOINTS } from '../lib/gate'

/**
 * Structure gate — AC-06 to AC-14 from brief/ACCEPTANCE.md.
 *
 * Pure DOM and accessibility-tree assertions. Nothing in here looks at a pixel, a
 * colour or a computed size, because a document outline that is wrong is wrong at
 * every width and a gate that re-checks it three times only triples the runtime.
 *
 * Everything is read from the hooks brief/ACCEPTANCE.md contracts the page to
 * expose — [data-section] and #main — and from standard HTML semantics. No class
 * names, no copy matching: those belong to other gates and would make this one
 * fail for reasons it does not own.
 */

const gate = new Gate('structure', 'Structure', [
  'AC-06',
  'AC-07',
  'AC-08',
  'AC-09',
  'AC-10',
  'AC-11',
  'AC-12',
  'AC-13',
  'AC-14',
])

/**
 * CANON §7 numbers eleven page sections, but the first of them is the skip link,
 * which brief/ACCEPTANCE.md separately requires to be the first *focusable*
 * element rather than a section — that is AC-10's job, and it is checked there
 * against #main.
 *
 * The hook table in ACCEPTANCE lists "skip-link" among the legal [data-section]
 * values, so a page may legitimately tag it and a page may legitimately not. The
 * resolution that cannot be wrong either way: require these ten content sections,
 * once each, in this order, and allow an optional data-section="skip-link" in
 * front of them. Hard-coding 11 and reading [data-section] would fail every
 * correct page forever, which is the one failure mode a verifier must not have.
 */
const CANONICAL_SECTIONS = [
  'nav',
  'hero',
  'ticker',
  'lineup',
  'programme',
  'venue',
  'tickets',
  'faq',
  'newsletter',
  'footer',
] as const

/** The skip link target, fixed by the hook contract in brief/ACCEPTANCE.md. */
const SKIP_TARGET = 'main'

/** CONTENT §3: the wordmark is a link to #top, not one of the four nav links. */
const WORDMARK_HREF = '#top'

/** CONTENT §3: the ticket CTA is the nav anchor that targets the tickets section. */
const CTA_HREF = '#tickets'

const EXPECTED_NAV_LINKS = 4
const EXPECTED_NAV_CTAS = 1

const TITLE_MAX = 60
const WORDMARK = 'TURBINE'
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 160

/** The document outline does not change with viewport; read it once, at desktop. */
const VIEWPORT = BREAKPOINTS.find((b) => b.name === 'desktop') ?? BREAKPOINTS[BREAKPOINTS.length - 1]!

interface Snapshot {
  sections: { name: string; selector: string }[]
  h1s: { text: string; selector: string }[]
  headings: { level: number; text: string; selector: string }[]
  lang: string | null
  title: string
  description: string | null
  navAnchors: {
    selector: string
    text: string
    hrefAttr: string | null
    hash: string | null
    targetExists: boolean
    targetSection: string | null
  }[]
  duplicateIds: { id: string; count: number; selectors: string[] }[]
  landmarkSelectors: Record<string, string[]>
  unnamedRegions: string[]
  skipTargetExists: boolean
}

/**
 * One test, serial. playwright.config.ts sets fullyParallel, which may place the
 * tests of one file in different worker processes — and each process would hold
 * its own Gate and overwrite the same JSON on flush, so the report would show
 * whichever worker finished last. Keeping it to a single test keeps every failure
 * in one file.
 */
test.describe.configure({ mode: 'serial' })

test.afterAll(() => {
  gate.flush({
    viewport: VIEWPORT.width,
    canonicalSections: [...CANONICAL_SECTIONS],
  })
})

test('AC-06..AC-14 — document structure, landmarks and head', async ({ page }) => {
  await page.setViewportSize({ width: VIEWPORT.width, height: VIEWPORT.height })
  await page.goto('/', { waitUntil: 'load' })

  const snapshot = await readSnapshot(page)

  checkSections(snapshot) // AC-06
  checkSingleH1(snapshot) // AC-07
  checkHeadingLevels(snapshot) // AC-08
  await checkLandmarks(page, snapshot) // AC-09
  await checkSkipLink(page, snapshot) // AC-10
  checkLang(snapshot) // AC-11
  checkHead(snapshot) // AC-12
  checkNav(snapshot) // AC-13
  checkDuplicateIds(snapshot) // AC-14

  gate.note(
    `CANON §7 lists 11 sections; the first is the skip link, which is not a [data-section] and is covered by AC-10. ` +
      `AC-06 therefore checks ${CANONICAL_SECTIONS.length} [data-section] values, plus an optional leading "skip-link".`,
  )
})

// ── AC-06 ─────────────────────────────────────────────────────────────────────

function checkSections(s: Snapshot): void {
  const observedRaw = s.sections.map((x) => x.name)

  // An optional data-section="skip-link" may lead the list. Anywhere else it is a
  // defect in DOM order, because the skip link has to come before everything.
  const skipIndexes = observedRaw.map((n, i) => (n === 'skip-link' ? i : -1)).filter((i) => i >= 0)
  for (const i of skipIndexes) {
    if (i !== 0) {
      gate.fail({
        criterion: 'AC-06',
        message: `AC-06 STRUCTURE: data-section="skip-link" is at position ${i + 1}, expected position 1 (before every other section)`,
        where: s.sections[i]?.selector,
        expected: 'first [data-section] in DOM order, or no data-section at all',
        actual: `position ${i + 1} of ${observedRaw.length}`,
      })
    }
  }

  const observed = observedRaw.filter((n) => n !== 'skip-link')
  const canonical = [...CANONICAL_SECTIONS] as string[]

  for (const name of new Set(observed)) {
    const count = observed.filter((n) => n === name).length
    if (count > 1) {
      const selectors = s.sections.filter((x) => x.name === name).map((x) => x.selector)
      gate.fail({
        criterion: 'AC-06',
        message: `AC-06 STRUCTURE: section "${name}" appears ${count} times, expected once: ${selectors.join(', ')}`,
        where: selectors.join(', '),
        expected: '1',
        actual: String(count),
      })
    }
    if (!canonical.includes(name)) {
      gate.fail({
        criterion: 'AC-06',
        message: `AC-06 STRUCTURE: unknown section "${name}". Canonical sections are: ${canonical.join(', ')}`,
        where: s.sections.find((x) => x.name === name)?.selector,
        expected: canonical.join(', '),
        actual: name,
      })
    }
  }

  for (const name of canonical) {
    if (!observed.includes(name)) {
      gate.fail({
        criterion: 'AC-06',
        message: `AC-06 STRUCTURE: section "${name}" is missing. Expected [data-section="${name}"] in CANON §7 order`,
        where: 'document',
        expected: `[data-section="${name}"]`,
        actual: 'absent',
      })
    }
  }

  // The order failure is reported once, at the first divergence, because every
  // position after a missing section is off by one and listing them all would bury
  // the one fact that matters.
  const limit = Math.max(observed.length, canonical.length)
  for (let i = 0; i < limit; i++) {
    const expected = canonical[i]
    const found = observed[i]
    if (expected === found) continue
    gate.fail({
      criterion: 'AC-06',
      message:
        `AC-06 STRUCTURE: expected ${canonical.length} sections in canonical order, found ${observed.length}. ` +
        `First mismatch at position ${i + 1}: expected "${expected ?? '(nothing more)'}", found "${found ?? '(nothing)'}"`,
      where: (found !== undefined ? s.sections.find((x) => x.name === found)?.selector : undefined) ?? 'document',
      expected: canonical.join(' → '),
      actual: observed.join(' → ') || '(no [data-section] elements)',
    })
    break
  }
}

// ── AC-07 ─────────────────────────────────────────────────────────────────────

function checkSingleH1(s: Snapshot): void {
  if (s.h1s.length === 1) return
  const texts = s.h1s.length ? s.h1s.map((h) => `"${h.text}"`).join(', ') : '(none)'
  gate.fail({
    criterion: 'AC-07',
    message: `AC-07 STRUCTURE: found ${s.h1s.length} <h1> elements, expected 1: ${texts}`,
    where: s.h1s.map((h) => h.selector).join(', ') || 'document',
    expected: 1,
    actual: s.h1s.length,
  })
}

// ── AC-08 ─────────────────────────────────────────────────────────────────────

function checkHeadingLevels(s: Snapshot): void {
  // Every skip is reported, not just the first. A page that jumps h1 → h3 in two
  // places has two edits to make, and the loop should get both in one pass.
  for (let i = 1; i < s.headings.length; i++) {
    const prev = s.headings[i - 1]!
    const next = s.headings[i]!
    if (next.level - prev.level <= 1) continue
    gate.fail({
      criterion: 'AC-08',
      message: `AC-08 STRUCTURE: heading level skipped — <h${prev.level}> "${prev.text}" is followed by <h${next.level}> "${next.text}"`,
      where: next.selector,
      expected: `at most <h${prev.level + 1}>`,
      actual: `<h${next.level}>`,
    })
  }
}

// ── AC-09 ─────────────────────────────────────────────────────────────────────

async function checkLandmarks(page: Page, s: Snapshot): Promise<void> {
  // Counted through Playwright's accessibility-tree queries rather than by tag
  // name, because <header> is only a banner when it is not nested inside another
  // sectioning element, and aria-hidden removes a landmark from the tree entirely.
  // Querying the tree gets both of those right for free.
  const counts = {
    banner: await page.getByRole('banner').count(),
    navigation: await page.getByRole('navigation').count(),
    main: await page.getByRole('main').count(),
    contentinfo: await page.getByRole('contentinfo').count(),
  }

  const unnamed = s.unnamedRegions.length ? s.unnamedRegions.join(', ') : 'none'

  for (const [role, n] of Object.entries(counts)) {
    if (n === 1) continue
    gate.fail({
      criterion: 'AC-09',
      message: `AC-09 STRUCTURE: landmark ${role} count is ${n}, expected 1. Unnamed region(s): ${unnamed}`,
      where: s.landmarkSelectors[role]?.join(', ') || 'document',
      expected: 1,
      actual: n,
    })
  }

  if (counts.banner === 1 && counts.navigation === 1) {
    const navInsideBanner = await page.getByRole('banner').getByRole('navigation').count()
    if (navInsideBanner !== 1) {
      gate.fail({
        criterion: 'AC-09',
        message: `AC-09 STRUCTURE: the navigation landmark is not inside the banner landmark. Unnamed region(s): ${unnamed}`,
        where: s.landmarkSelectors['navigation']?.join(', ') || 'document',
        expected: 'one navigation landmark nested inside the banner',
        actual: `${navInsideBanner} navigation landmark(s) inside the banner`,
      })
    }
  }

  if (s.unnamedRegions.length) {
    // Deliberately computed from the DOM, not from getByRole('region'): an unnamed
    // <section> is mapped to role generic, so a tree query would only ever return
    // regions that already have a name and this check could never go red.
    gate.fail({
      criterion: 'AC-09',
      message: `AC-09 STRUCTURE: landmark region count is ${s.unnamedRegions.length}, expected 0 without an accessible name. Unnamed region(s): ${unnamed}`,
      where: unnamed,
      expected: 'every <section> / [role="region"] labelled with aria-label or aria-labelledby',
      actual: `${s.unnamedRegions.length} unnamed`,
    })
  }
}

// ── AC-10 ─────────────────────────────────────────────────────────────────────

async function checkSkipLink(page: Page, s: Snapshot): Promise<void> {
  // Focus the body, press Tab once, look at what has focus. This is the only way to
  // learn what a keyboard user actually reaches first: DOM order is not focus
  // order once tabindex, hidden, disabled or a dialog are involved.
  await page.evaluate(() => document.body.focus())
  await page.keyboard.press('Tab')

  const first = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return null
    const anchor = el instanceof HTMLAnchorElement ? el : null
    const describe = (node: Element): string => {
      const id = node.id ? `#${node.id}` : ''
      const cls = Array.from(node.classList).slice(0, 2).map((c) => `.${c}`).join('')
      return `${node.tagName.toLowerCase()}${id}${cls}`
    }
    return {
      selector: describe(el),
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' '),
      isAnchor: anchor !== null,
      hrefAttr: anchor?.getAttribute('href') ?? null,
      hash: anchor ? new URL(anchor.href, document.baseURI).hash : null,
    }
  })

  const failure = (selector: string, text: string, actual: string) => {
    gate.fail({
      criterion: 'AC-10',
      message: `AC-10 STRUCTURE: first focusable element is ${selector} ("${text}"), expected a skip link whose href resolves to #${SKIP_TARGET}`,
      where: selector,
      expected: `<a href="#${SKIP_TARGET}">`,
      actual,
    })
  }

  if (!first) {
    failure('(nothing)', '', 'Tab from <body> moved focus nowhere; the document has no focusable element')
    return
  }

  if (!first.isAnchor || first.hash !== `#${SKIP_TARGET}`) {
    failure(first.selector, first.text, first.hrefAttr === null ? `${first.selector} is not a link` : `href="${first.hrefAttr}"`)
    return
  }

  // The link is right; now prove the destination is real. A skip link that points at
  // nothing is worse than no skip link, because it looks like a pass.
  if (!s.skipTargetExists) {
    failure(first.selector, first.text, `href="${first.hrefAttr}" but no element has id="${SKIP_TARGET}"`)
  }
}

// ── AC-11 ─────────────────────────────────────────────────────────────────────

function checkLang(s: Snapshot): void {
  const value = s.lang ?? ''
  if (value.trim().toLowerCase() === 'en') return
  gate.fail({
    criterion: 'AC-11',
    message: `AC-11 STRUCTURE: <html lang> is "${value}", expected "en"`,
    where: '<html>',
    expected: 'en',
    actual: value || '(absent)',
  })
}

// ── AC-12 ─────────────────────────────────────────────────────────────────────

function checkHead(s: Snapshot): void {
  const title = s.title
  // Code points, not UTF-16 units: the canonical title carries en and em dashes and
  // a "60 characters" budget that counts surrogate halves is not a character budget.
  const titleLength = Array.from(title).length
  const containsWordmark = title.includes(WORDMARK)

  const description = s.description
  const descriptionLength = description === null ? 0 : Array.from(description).length

  const titleOk = titleLength > 0 && titleLength <= TITLE_MAX && containsWordmark
  const descriptionOk =
    description !== null && descriptionLength >= DESCRIPTION_MIN && descriptionLength <= DESCRIPTION_MAX

  if (titleOk && descriptionOk) return

  gate.fail({
    criterion: 'AC-12',
    message:
      `AC-12 STRUCTURE: title "${title}" is ${titleLength} chars and ` +
      `${containsWordmark ? `contains "${WORDMARK}"` : `does not contain "${WORDMARK}"`}; ` +
      `description is ${description === null ? 'absent' : `${descriptionLength} chars`}. ` +
      `Required: title ≤ ${TITLE_MAX} chars containing "${WORDMARK}", description ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} chars`,
    where: '<head>',
    expected: `title ≤ ${TITLE_MAX} chars containing "${WORDMARK}"; description ${DESCRIPTION_MIN}–${DESCRIPTION_MAX} chars`,
    actual: `title ${titleLength} chars, description ${description === null ? 'absent' : `${descriptionLength} chars`}`,
  })
}

// ── AC-13 ─────────────────────────────────────────────────────────────────────

function checkNav(s: Snapshot): void {
  const anchors = s.navAnchors

  // Below 768 the same four links and the same CTA collapse behind a hamburger, and
  // an implementation is free to render that drawer as a second copy of the markup.
  // "Exposes 4 links plus 1 CTA" is therefore counted over distinct destinations:
  // duplicating a link does not add a destination, and it is noted below so the
  // duplication is still visible.
  const seen = new Set<string>()
  const distinct = anchors.filter((a) => {
    const key = a.hrefAttr ?? `(no href) ${a.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  if (distinct.length !== anchors.length) {
    gate.note(
      `nav contains ${anchors.length} anchors resolving to ${distinct.length} distinct destinations (a mobile drawer duplicating the desktop links is the usual reason)`,
    )
  }

  const wordmark = distinct.filter((a) => a.hash === WORDMARK_HREF)
  const ctas = distinct.filter((a) => a.hash === CTA_HREF)
  const links = distinct.filter((a) => a.hash !== WORDMARK_HREF && a.hash !== CTA_HREF)

  // Unresolved covers both shapes of broken: a fragment with no matching id, and an
  // anchor that is not an in-page fragment at all — neither resolves to a section id.
  const unresolved = distinct.filter((a) => !a.hash || !a.targetExists)

  const misdirected = distinct.filter((a) => {
    if (!a.hash || !a.targetExists) return false
    const name = a.hash.slice(1)
    // Only canonical section names are held to this. #top and #main are document
    // anchors by CONTENT §16, not sections, and demanding a [data-section] on them
    // would be inventing a requirement the brief does not make.
    if (!(CANONICAL_SECTIONS as readonly string[]).includes(name)) return false
    return a.targetSection !== name
  })

  const countsWrong = links.length !== EXPECTED_NAV_LINKS || ctas.length !== EXPECTED_NAV_CTAS

  if (countsWrong || unresolved.length) {
    const hrefs = unresolved.length
      ? unresolved.map((a) => `"${a.hrefAttr ?? '(no href)'}" (${a.selector})`).join(', ')
      : 'none'
    gate.fail({
      criterion: 'AC-13',
      message: `AC-13 STRUCTURE: nav exposes ${links.length} links and ${ctas.length} CTA(s), expected ${EXPECTED_NAV_LINKS} and ${EXPECTED_NAV_CTAS}. Unresolved target(s): ${hrefs}`,
      where: '[data-section="nav"]',
      expected: `${EXPECTED_NAV_LINKS} links + ${EXPECTED_NAV_CTAS} CTA to ${CTA_HREF}, every href resolving to an existing id`,
      actual:
        distinct.map((a) => a.hrefAttr ?? '(no href)').join(', ') +
        (wordmark.length ? ` (wordmark ${WORDMARK_HREF} excluded from both counts)` : ''),
      hint:
        wordmark.length === 0
          ? `No nav anchor targets ${WORDMARK_HREF}. CONTENT §3 puts the wordmark there, and this gate excludes it from the four links.`
          : undefined,
    })
  }

  for (const a of misdirected) {
    gate.fail({
      criterion: 'AC-13',
      message: `AC-13 STRUCTURE: nav link "${a.hrefAttr}" resolves to an element outside [data-section="${a.hash!.slice(1)}"]. Every nav link must resolve to a section id`,
      where: a.selector,
      expected: `an element inside [data-section="${a.hash!.slice(1)}"]`,
      actual: a.targetSection ? `inside [data-section="${a.targetSection}"]` : 'outside every [data-section]',
    })
  }
}

// ── AC-14 ─────────────────────────────────────────────────────────────────────

function checkDuplicateIds(s: Snapshot): void {
  for (const dup of s.duplicateIds) {
    gate.fail({
      criterion: 'AC-14',
      message: `AC-14 STRUCTURE: duplicate id "${dup.id}" used ${dup.count} times: ${dup.selectors.join(', ')}`,
      where: dup.selectors.join(', '),
      expected: '1',
      actual: dup.count,
    })
  }
}

// ── Reading the page ──────────────────────────────────────────────────────────

/**
 * One pass over the DOM for everything that is a plain read. Nine round trips to
 * the page would be nine chances for the two halves of a check to disagree about
 * what the document looked like.
 */
async function readSnapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(
    ({ skipTarget }) => {
      const describe = (node: Element): string => {
        const id = node.id ? `#${CSS.escape(node.id)}` : ''
        const section = node.getAttribute('data-section')
        const cls = Array.from(node.classList)
          .slice(0, 2)
          .map((c) => `.${CSS.escape(c)}`)
          .join('')
        const tag = node.tagName.toLowerCase()
        if (id) return `${tag}${id}`
        if (section) return `${tag}[data-section="${section}"]`
        if (cls) return `${tag}${cls}`
        const parent = node.parentElement
        if (!parent) return tag
        const sameTag = Array.from(parent.children).filter((c) => c.tagName === node.tagName)
        return sameTag.length > 1 ? `${tag}:nth-of-type(${sameTag.indexOf(node) + 1})` : tag
      }

      const textOf = (node: Element): string =>
        (node.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 120)

      const sections = Array.from(document.querySelectorAll('[data-section]')).map((el) => ({
        name: el.getAttribute('data-section') ?? '',
        selector: describe(el),
      }))

      const h1s = Array.from(document.querySelectorAll('h1')).map((el) => ({
        text: textOf(el),
        selector: describe(el),
      }))

      // [role="heading"][aria-level] is included alongside h1-h6 because a page that
      // reaches for it can skip a level exactly the same way, and a gate that only
      // knows about native tags would call that page clean.
      const headings = Array.from(
        document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]'),
      ).map((el) => {
        const native = /^H([1-6])$/.exec(el.tagName)
        const ariaLevel = Number(el.getAttribute('aria-level'))
        const level = native ? Number(native[1]) : Number.isFinite(ariaLevel) ? ariaLevel : 0
        return { level, text: textOf(el), selector: describe(el) }
      })

      const navAnchors = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('[data-section="nav"] a'),
      ).map((a) => {
        const hrefAttr = a.getAttribute('href')
        let hash: string | null = null
        try {
          const url = new URL(a.href, document.baseURI)
          const here = new URL(document.baseURI)
          // Only same-document fragments count as in-page targets.
          hash = url.pathname === here.pathname && url.hash ? url.hash : null
        } catch {
          hash = null
        }
        const target = hash ? document.getElementById(hash.slice(1)) : null
        return {
          selector: describe(a),
          text: textOf(a),
          hrefAttr,
          hash,
          targetExists: target !== null,
          targetSection: target?.closest('[data-section]')?.getAttribute('data-section') ?? null,
        }
      })

      const idBuckets = new Map<string, Element[]>()
      for (const el of Array.from(document.querySelectorAll('[id]'))) {
        const id = el.getAttribute('id') ?? ''
        const bucket = idBuckets.get(id) ?? []
        bucket.push(el)
        idBuckets.set(id, bucket)
      }
      const duplicateIds = Array.from(idBuckets.entries())
        .filter(([, els]) => els.length > 1)
        .map(([id, els]) => ({ id, count: els.length, selectors: els.map(describe) }))

      // Landmark selectors are for the failure message only; the counts that decide
      // AC-09 come from the accessibility tree on the Playwright side.
      const landmarkSelectors: Record<string, string[]> = {
        banner: Array.from(document.querySelectorAll('header, [role="banner"]')).map(describe),
        navigation: Array.from(document.querySelectorAll('nav, [role="navigation"]')).map(describe),
        main: Array.from(document.querySelectorAll('main, [role="main"]')).map(describe),
        contentinfo: Array.from(document.querySelectorAll('footer, [role="contentinfo"]')).map(describe),
      }

      const hasAccessibleName = (el: Element): boolean => {
        const labelledby = el.getAttribute('aria-labelledby')
        if (labelledby) {
          const named = labelledby
            .split(/\s+/)
            .filter(Boolean)
            .some((id) => (document.getElementById(id)?.textContent ?? '').trim().length > 0)
          if (named) return true
        }
        if ((el.getAttribute('aria-label') ?? '').trim().length > 0) return true
        if ((el.getAttribute('title') ?? '').trim().length > 0) return true
        return false
      }

      const unnamedRegions = Array.from(document.querySelectorAll('section, [role="region"]'))
        .filter((el) => !hasAccessibleName(el))
        .map(describe)

      return {
        sections,
        h1s,
        headings,
        lang: document.documentElement.getAttribute('lang'),
        title: document.title,
        description:
          document.querySelector<HTMLMetaElement>('meta[name="description"]')?.getAttribute('content') ?? null,
        navAnchors,
        duplicateIds,
        landmarkSelectors,
        unnamedRegions,
        skipTargetExists: document.getElementById(skipTarget) !== null,
      }
    },
    { skipTarget: SKIP_TARGET },
  )
}
