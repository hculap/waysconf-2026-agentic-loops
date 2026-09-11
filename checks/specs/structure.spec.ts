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
 *
 * Two rules this file holds itself to, both learned the hard way:
 *
 *   1. Nothing passes by default. Every criterion records that it ran; anything that
 *      did not run is reported as a failure at flush time. `gate.flush()` writes
 *      `status: "pass"` whenever the failure list is empty, and checks/run.mjs folds
 *      that JSON in without reading Playwright's exit code — so a spec that died at
 *      `page.goto` used to come back green for a page it never loaded.
 *   2. A check asks for what the criterion says, not for something adjacent that is
 *      easier to write. A false failure costs the loop three repair attempts and then
 *      stops it; it is not the safe side to err on.
 */

const CRITERIA = ['AC-06', 'AC-07', 'AC-08', 'AC-09', 'AC-10', 'AC-11', 'AC-12', 'AC-13', 'AC-14'] as const

const gate = new Gate('structure', 'Structure', [...CRITERIA])

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
 *
 * The failure message carries the contract's number as well as this one, so a
 * participant can trace the line back to the AC-06 row instead of finding a count
 * that appears nowhere in brief/ACCEPTANCE.md.
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

/** What the AC-06 row in brief/ACCEPTANCE.md counts: the ten above plus the skip link. */
const CONTRACT_SECTION_COUNT = CANONICAL_SECTIONS.length + 1

/** The skip link target, fixed by the hook contract in brief/ACCEPTANCE.md. */
const SKIP_TARGET = 'main'

/** CONTENT §3: the wordmark is a link to #top, not one of the four nav links. */
const WORDMARK_HREF = '#top'

/** CONTENT §3: the ticket CTA is the nav anchor that targets the tickets section. */
const CTA_HREF = '#tickets'

/**
 * The two fragments CONTENT §16 lists that are document anchors rather than sections.
 * An explicit two-item allowlist, not "any fragment that is not a canonical name":
 * the wide form exempted every made-up fragment from AC-13's "resolves to a section
 * id" clause, so a nav of four links into four empty spans in the footer passed.
 */
const DOCUMENT_ANCHORS = [WORDMARK_HREF, `#${SKIP_TARGET}`] as const

const EXPECTED_NAV_LINKS = 4
const EXPECTED_NAV_CTAS = 1

const TITLE_MAX = 60
const WORDMARK = 'TURBINE'
const DESCRIPTION_MIN = 50
const DESCRIPTION_MAX = 160

/** The document outline does not change with viewport; read it once, at desktop. */
const VIEWPORT = BREAKPOINTS.find((b) => b.name === 'desktop') ?? BREAKPOINTS[BREAKPOINTS.length - 1]!

interface NavAnchor {
  selector: string
  text: string
  hrefAttr: string | null
  /** Set only for a fragment in this very document. A link off-site resolves to null. */
  hash: string | null
  targetExists: boolean
  /** The data-section value on the target element itself, if it carries one. */
  targetOwnSection: string | null
  /** The data-section of the nearest ancestor section, for the failure message. */
  targetSection: string | null
  /** What the fragment actually lands on, e.g. `span#x1`, for the failure message. */
  targetDescription: string | null
}

interface Snapshot {
  sections: { name: string; selector: string }[]
  h1s: { text: string; selector: string }[]
  headings: { level: number; text: string; selector: string }[]
  /** Headings dropped from the outline because nobody perceives them. Reported as a note. */
  hiddenHeadings: { level: number; text: string; selector: string; reason: string }[]
  lang: string | null
  title: string
  description: string | null
  navAnchors: NavAnchor[]
  duplicateIds: { id: string; count: number; selectors: string[] }[]
  landmarkSelectors: Record<string, string[]>
  /** Elements that really are regions in the accessibility tree and carry no name. */
  unnamedRegions: string[]
  /** Plain unnamed <section> elements, which map to `generic` and are legal. A note. */
  unnamedSections: string[]
  skipTarget: { selector: string; tag: string; role: string | null; isMainLandmark: boolean } | null
}

/** Criteria that ran to completion. Anything missing at flush time never ran. */
const completed = new Set<string>()

const evidence: Record<string, unknown> = {
  viewport: VIEWPORT.width,
  canonicalSections: [...CANONICAL_SECTIONS],
  contractSectionCount: CONTRACT_SECTION_COUNT,
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
  // Anything that never finished is reported as a failure. A criterion that silently
  // did not run is the one failure mode that would make this whole gate worthless:
  // the status written here is "pass" whenever nothing was recorded, and the
  // orchestrator does not look at Playwright's exit code to tell the difference.
  for (const criterion of CRITERIA) {
    if (completed.has(criterion)) continue
    gate.fail({
      criterion,
      message: `${criterion} STRUCTURE: this check did not run to completion, so nothing is known about it. Treated as a failure, never as a pass.`,
      where: 'checks/specs/structure.spec.ts',
      hint: 'Usually a Playwright timeout or a page that would not load. Re-run with --reporter=list to see where the spec stopped.',
    })
  }

  gate.flush(evidence)
})

test('AC-06..AC-14 — document structure, landmarks and head', async ({ page }) => {
  let snapshot: Snapshot

  try {
    await page.setViewportSize({ width: VIEWPORT.width, height: VIEWPORT.height })
    await page.goto('/', { waitUntil: 'load' })
    snapshot = await readSnapshot(page)
  } catch (err) {
    // Nothing was read, so nothing is known — about any of the nine criteria. Say so
    // once per criterion, mark them accounted for so the flush guard does not repeat
    // it, and rethrow so Playwright's own exit code reflects the failure too.
    for (const criterion of CRITERIA) {
      completed.add(criterion)
      gate.fail({
        criterion,
        message: `${criterion} STRUCTURE: the page could not be read at ${VIEWPORT.width}px, so nothing is known about it: ${errorText(err)}`,
        where: 'document',
        expected: 'a loaded page to inspect',
        actual: errorText(err),
        hint: 'A check that cannot run proves nothing. This is reported as a failure on purpose.',
      })
    }
    throw err
  }

  evidence.headingsInOutline = snapshot.headings.length
  evidence.headingsIgnored = snapshot.hiddenHeadings.length

  await guarded('AC-06', 'canonical sections', () => checkSections(snapshot))
  await guarded('AC-07', 'single h1', () => checkSingleH1(snapshot))
  await guarded('AC-08', 'heading levels', () => checkHeadingLevels(snapshot))
  await guarded('AC-09', 'landmarks', () => checkLandmarks(page, snapshot))
  await guarded('AC-10', 'skip link', () => checkSkipLink(page, snapshot))
  await guarded('AC-11', 'html lang', () => checkLang(snapshot))
  await guarded('AC-12', 'head metadata', () => checkHead(snapshot))
  await guarded('AC-13', 'nav destinations', () => checkNav(snapshot))
  await guarded('AC-14', 'duplicate ids', () => checkDuplicateIds(snapshot))

  gate.note(
    `CANON §7 lists ${CONTRACT_SECTION_COUNT} sections; the first is the skip link, which is not a [data-section] and is covered by AC-10. ` +
      `AC-06 therefore checks ${CANONICAL_SECTIONS.length} [data-section] values, plus an optional leading "skip-link".`,
  )

  if (snapshot.hiddenHeadings.length) {
    gate.note(
      `AC-08 read the outline a user perceives: ${snapshot.hiddenHeadings.length} heading(s) are in the DOM but not ` +
        `rendered or not exposed, and were left out — ` +
        snapshot.hiddenHeadings.map((h) => `<h${h.level}> "${h.text}" (${h.selector}, ${h.reason})`).join('; ') +
        '. A hidden heading cannot be used to bridge a level skip.',
    )
  }

  if (snapshot.unnamedSections.length) {
    gate.note(
      `${snapshot.unnamedSections.length} <section> element(s) carry no accessible name and therefore map to role ` +
        `generic, not region: ${snapshot.unnamedSections.join(', ')}. AC-09 requires a name of every *region*, so ` +
        'these are legal — src/components/Section.astro documents leaving a section unnamed as the deliberate ' +
        'alternative to shipping an anonymous region. Named only if a landmark is wanted there.',
    )
  }
})

const errorText = (err: unknown): string =>
  (err instanceof Error ? err.message : String(err)).split('\n').slice(0, 3).join(' ').slice(0, 300)

/**
 * Runs one criterion's checks. A thrown error becomes a reported failure rather than an
 * aborted run: the point of the gate is to say what is wrong, and "the check exploded"
 * is something being wrong. It is never a pass, and it never stops the checks after it —
 * one repair pass should be able to fix several criteria at once.
 */
async function guarded(criterion: string, label: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    completed.add(criterion)
  } catch (err) {
    gate.fail({
      criterion,
      message: `${criterion} STRUCTURE: the ${label} check could not complete: ${errorText(err)}`,
      where: label,
      hint: 'A check that cannot run proves nothing. This is reported as a failure on purpose.',
    })
    completed.add(criterion)
  }
}

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
        `AC-06 STRUCTURE: expected ${CONTRACT_SECTION_COUNT} sections in canonical order ` +
        `(${canonical.length} [data-section] values plus the skip link, which AC-10 checks), found ${observed.length}. ` +
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
  //
  // s.headings is the outline a user or a screen reader gets, not every heading tag in
  // the file: see readSnapshot. Walking the DOM blindly made `<h2 hidden>spacer</h2>`
  // between an h1 and an h3 the cheapest possible repair for a real AC-08 failure, and
  // the cheapest repair is the one an agent finds.
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
    // The clause is "every region has an accessible name", and only an element that is
    // actually a region is held to it — an explicit role="region". A plain <section>
    // with no name is not a region at all; it maps to `generic`, and demanding a label
    // on it would red-line markup the contract permits and add a landmark to the
    // screen-reader rotor for every band of content on the page. Those are noted
    // instead, in the test body.
    gate.fail({
      criterion: 'AC-09',
      message: `AC-09 STRUCTURE: landmark region count is ${s.unnamedRegions.length}, expected 0 without an accessible name. Unnamed region(s): ${unnamed}`,
      where: unnamed,
      expected: 'every [role="region"] labelled with aria-label or aria-labelledby',
      actual: `${s.unnamedRegions.length} unnamed`,
      hint: 'Either give the region a name, or drop role="region" so the element is not a landmark.',
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
    // Same-document or nothing. `new URL(a.href).hash` alone accepts
    // https://example.com/other-page#main, which satisfies "resolves to #main" and
    // sends a keyboard user off the site on the very first Tab.
    let hash: string | null = null
    if (anchor) {
      try {
        const url = new URL(anchor.href, document.baseURI)
        const here = new URL(document.baseURI)
        const sameDocument =
          url.origin === here.origin && url.pathname === here.pathname && url.search === here.search
        hash = sameDocument && url.hash ? url.hash : null
      } catch {
        hash = null
      }
    }
    return {
      selector: describe(el),
      text: (el.textContent ?? '').trim().replace(/\s+/g, ' '),
      isAnchor: anchor !== null,
      hrefAttr: anchor?.getAttribute('href') ?? null,
      resolvedHref: anchor?.href ?? null,
      hash,
    }
  })

  const failure = (selector: string, text: string, actual: string) => {
    gate.fail({
      criterion: 'AC-10',
      message: `AC-10 STRUCTURE: first focusable element is ${selector} ("${text}"), expected a skip link whose href resolves to #${SKIP_TARGET}`,
      where: selector,
      expected: `<a href="#${SKIP_TARGET}"> pointing at the <main> element`,
      actual,
    })
  }

  if (!first) {
    failure('(nothing)', '', 'Tab from <body> moved focus nowhere; the document has no focusable element')
    return
  }

  if (!first.isAnchor) {
    failure(first.selector, first.text, `${first.selector} is not a link`)
    return
  }

  if (first.hash !== `#${SKIP_TARGET}`) {
    // The raw href, not the computed hash: an off-site link ending in #main resolves
    // to no in-page fragment at all, and the repair prompt needs to show where it goes.
    failure(
      first.selector,
      first.text,
      `href="${first.hrefAttr ?? '(absent)'}"${first.resolvedHref && first.hrefAttr !== first.resolvedHref ? ` (resolves to ${first.resolvedHref})` : ''}`,
    )
    return
  }

  // The link is right; now prove the destination is real, and is the destination the
  // hook contract names. "#main on the <main> element" is the whole point: a skip link
  // that lands on a decoy <span> in the footer moves a keyboard user past the content
  // rather than to it, and only the id was ever checked.
  if (!s.skipTarget) {
    failure(first.selector, first.text, `href="${first.hrefAttr}" but no element has id="${SKIP_TARGET}"`)
    return
  }

  if (!s.skipTarget.isMainLandmark) {
    failure(
      first.selector,
      first.text,
      `href="${first.hrefAttr}" resolves to <${s.skipTarget.tag}> (${s.skipTarget.selector})` +
        `${s.skipTarget.role ? ` with role="${s.skipTarget.role}"` : ''}, expected the <main> element`,
    )
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
  // "Exposes 4 links plus 1 CTA" is therefore counted over distinct *destinations* —
  // which is where the fragment resolves to, not how the href happens to be spelled.
  // Keying on the raw attribute counted `#lineup` and `/#lineup` as two destinations
  // and failed a nav that exposes four.
  const seen = new Set<string>()
  const distinct = anchors.filter((a) => {
    const key = a.hash ?? a.hrefAttr ?? `(no href) ${a.text}`
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

  // "Every nav link resolves to a section id" read literally: the element the fragment
  // lands on carries [data-section]. The old rule exempted every fragment whose name
  // was not itself a canonical section name, which let four links into four empty
  // spans pass — nothing was unresolved and nothing was misdirected.
  const misdirected = distinct.filter((a) => {
    if (!a.hash || !a.targetExists) return false
    if ((DOCUMENT_ANCHORS as readonly string[]).includes(a.hash)) return false
    const name = a.hash.slice(1)
    if (a.targetOwnSection === null) return true
    return (CANONICAL_SECTIONS as readonly string[]).includes(name) && a.targetOwnSection !== name
  })

  const countsWrong = links.length !== EXPECTED_NAV_LINKS || ctas.length !== EXPECTED_NAV_CTAS

  if (countsWrong || unresolved.length) {
    const hrefs = unresolved.length
      ? unresolved.map((a) => `"${a.hrefAttr ?? '(no href)'}" (${a.selector})`).join(', ')
      : 'none'
    // With nothing unresolved, "expected 4 and 1" alone names no location to go and
    // look at. List what was counted, so the repair has somewhere to start.
    const counted = links.length
      ? ` Counted as links: ${links.map((a) => `"${a.hrefAttr ?? '(no href)'}" (${a.selector})`).join(', ')}.`
      : ' No anchor in [data-section="nav"] was counted as a link.'
    gate.fail({
      criterion: 'AC-13',
      message:
        `AC-13 STRUCTURE: nav exposes ${links.length} links and ${ctas.length} CTA(s), expected ${EXPECTED_NAV_LINKS} and ${EXPECTED_NAV_CTAS}. ` +
        `Unresolved target(s): ${hrefs}.${counted}`,
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
    const name = a.hash!.slice(1)
    const isCanonical = (CANONICAL_SECTIONS as readonly string[]).includes(name)
    gate.fail({
      criterion: 'AC-13',
      message:
        `AC-13 STRUCTURE: nav link "${a.hrefAttr}" resolves to ${a.targetDescription ?? 'an element'}` +
        `${a.targetSection ? ` inside [data-section="${a.targetSection}"]` : ' outside every [data-section]'}, ` +
        `which is not a section id. Every nav link must resolve to an element carrying [data-section]` +
        `${isCanonical ? `, and "#${name}" must resolve to [data-section="${name}"]` : ''}`,
      where: a.selector,
      expected: isCanonical ? `[data-section="${name}"]` : 'an element carrying [data-section]',
      actual: a.targetOwnSection
        ? `[data-section="${a.targetOwnSection}"]`
        : `${a.targetDescription ?? 'an element'}${a.targetSection ? ` inside [data-section="${a.targetSection}"]` : ' outside every [data-section]'}`,
      hint: `CONTENT §16 lists ${DOCUMENT_ANCHORS.join(' and ')} as the only in-page anchors that are not sections.`,
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

      /**
       * Why a heading can be absent from the outline this gate validates.
       *
       * AC-08 is about the outline a person perceives. A heading that is not rendered
       * and not in the accessibility tree is in nobody's outline, so counting it lets
       * an invisible element bridge a level skip that every user still experiences.
       */
      const hiddenReason = (el: HTMLElement): string | null => {
        if (el.closest('[aria-hidden="true"]')) return 'inside aria-hidden'
        if (el.closest('[hidden]')) return 'hidden attribute'
        if (el.getClientRects().length === 0) return 'not rendered'
        if (getComputedStyle(el).visibility === 'hidden') return 'visibility:hidden'
        return null
      }

      // [role="heading"][aria-level] is included alongside h1-h6 because a page that
      // reaches for it can skip a level exactly the same way, and a gate that only
      // knows about native tags would call that page clean.
      const allHeadings = Array.from(
        document.querySelectorAll<HTMLElement>('h1, h2, h3, h4, h5, h6, [role="heading"][aria-level]'),
      ).map((el) => {
        const native = /^H([1-6])$/.exec(el.tagName)
        const ariaLevel = Number(el.getAttribute('aria-level'))
        const level = native ? Number(native[1]) : Number.isFinite(ariaLevel) ? ariaLevel : 0
        return { level, text: textOf(el), selector: describe(el), reason: hiddenReason(el) }
      })

      const headings = allHeadings
        .filter((h) => h.reason === null)
        .map(({ level, text, selector }) => ({ level, text, selector }))
      const hiddenHeadings = allHeadings
        .filter((h) => h.reason !== null)
        .map(({ level, text, selector, reason }) => ({ level, text, selector, reason: reason! }))

      const here = new URL(document.baseURI)
      /** A fragment counts only when following it stays on this very document. */
      const sameDocumentHash = (a: HTMLAnchorElement): string | null => {
        try {
          const url = new URL(a.href, document.baseURI)
          const sameDocument =
            url.origin === here.origin && url.pathname === here.pathname && url.search === here.search
          return sameDocument && url.hash ? url.hash : null
        } catch {
          return null
        }
      }

      const navAnchors = Array.from(
        document.querySelectorAll<HTMLAnchorElement>('[data-section="nav"] a'),
      ).map((a) => {
        const hrefAttr = a.getAttribute('href')
        const hash = sameDocumentHash(a)
        const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
        return {
          selector: describe(a),
          text: textOf(a),
          hrefAttr,
          hash,
          targetExists: target !== null,
          targetOwnSection: target?.getAttribute('data-section') ?? null,
          targetSection: target?.closest('[data-section]')?.getAttribute('data-section') ?? null,
          targetDescription: target ? `<${target.tagName.toLowerCase()}> ${describe(target)}` : null,
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

      // An explicit role="region" is a landmark whether or not it is named, so an
      // unnamed one is the defect AC-09 describes. A bare <section> without a name is
      // mapped to `generic` by HTML-AAM and is not a region at all — reported
      // separately as a note, never as an AC-09 failure.
      const unnamedRegions = Array.from(document.querySelectorAll('[role="region"]'))
        .filter((el) => !hasAccessibleName(el))
        .map(describe)

      const unnamedSections = Array.from(document.querySelectorAll('section:not([role])'))
        .filter((el) => !hasAccessibleName(el))
        .map(describe)

      const skip = document.getElementById(skipTarget)
      const skipRole = skip?.getAttribute('role') ?? null

      return {
        sections,
        h1s,
        headings,
        hiddenHeadings,
        lang: document.documentElement.getAttribute('lang'),
        title: document.title,
        description:
          document.querySelector<HTMLMetaElement>('meta[name="description"]')?.getAttribute('content') ?? null,
        navAnchors,
        duplicateIds,
        landmarkSelectors,
        unnamedRegions,
        unnamedSections,
        skipTarget: skip
          ? {
              selector: describe(skip),
              tag: skip.tagName.toLowerCase(),
              role: skipRole,
              // The hook contract is "#main on the <main> element". An id on a decoy
              // div satisfies getElementById and moves nobody to the main landmark.
              isMainLandmark: (skip.tagName === 'MAIN' && skipRole === null) || skipRole === 'main',
            }
          : null,
      }
    },
    { skipTarget: SKIP_TARGET },
  )
}
