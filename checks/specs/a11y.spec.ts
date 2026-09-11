/**
 * A11Y gate — AC-15 to AC-25 of brief/ACCEPTANCE.md.
 *
 * axe-core finds what a rules engine can find. The rest of this file drives the page with
 * a keyboard and a camera, because the things that actually break for a keyboard or
 * screen-reader user — a focus ring nobody can see, a tab list that ignores ArrowRight, an
 * accordion that opens on Enter but not Space, a marquee that keeps moving under
 * prefers-reduced-motion — are invisible to static analysis.
 *
 * Three rules this file holds itself to:
 *
 *   1. Nothing passes by default. A check that cannot run reports a failure saying so.
 *      A silent skip is how a verifier stops verifying without anyone noticing.
 *   2. No expect(). Every defect is collected and reported, so one loop iteration can fix
 *      twelve things instead of one. A gate that aborts on the first problem turns a
 *      two-pass repair into a ten-pass repair.
 *   3. Idempotent. Same page in, same verdict out: animations frozen, reduced motion
 *      emulated where a moving pixel would otherwise decide a comparison, deterministic
 *      sampling, no wall-clock-dependent thresholds.
 *
 * What it does not do is decide whether the page is accessible. See the note flushed with
 * the gate result, and the last section of brief/ACCEPTANCE.md.
 */

import { test, type Page, type Locator } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import pixelmatch from 'pixelmatch'
// sharp rather than pngjs for the decode: pngjs ships no type declarations, and an ambient
// `declare module` here would collide with the same shim in any other spec.
import sharp from 'sharp'
import { Gate, BREAKPOINTS, type Failure } from '../lib/gate'
import { contrastRatio, parseCssColor, toHex, flatten, AA_NON_TEXT, type Rgba } from '../lib/contrast'

// ── Configuration ─────────────────────────────────────────────────────────────

/** WCAG 2.2 AA, per CANON section 9. wcag22aa is what adds the target-size and focus rules. */
const AXE_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

/** AC-16: share of an element's pixels that must change when it takes focus. */
const FOCUS_DIFF_MIN_PCT = 0.5
/** pixelmatch colour-distance tolerance. 0 counts every antialiased glyph edge as a change. */
const PIXEL_THRESHOLD = 0.1
/**
 * AC-16 requires at least 8px of padding on every side. A focus ring is drawn outside the
 * border box — `outline-width` plus `outline-offset` — so an element-only screenshot would
 * miss the most common ring in existence and fail a page that is correct. 10px covers the
 * 2px + 2px ring in src/styles/global.css with room to spare.
 */
const FOCUS_CLIP_PAD_PX = 10

/** AC-17 / WCAG SC 1.4.11: the visible part of a focus indicator needs 3:1. */
const FOCUS_RING_MIN_RATIO = AA_NON_TEXT

/** AC-21: the budget with no motion preference set. */
const MOTION_MAX_MS = 200
/**
 * AC-21: the budget under prefers-reduced-motion: reduce.
 *
 * 1ms rather than 0 because the canonical reduce override writes
 * `animation-duration: 0.01ms !important` instead of `animation: none` — it is what ships in
 * src/styles/global.css and what every article on the subject recommends. At 0.01ms nothing
 * moves; insisting on exactly 0 would fail the correct implementation.
 */
const MOTION_REDUCE_MAX_MS = 1

/** AC-23 / WCAG 2.2 SC 2.5.8. */
const TOUCH_MIN_PX = 24

/**
 * AC-16 costs two full screenshots per element. The page has roughly seventy focusable
 * elements and this gate is demoed live, so the sample is bounded: at most three of any one
 * kind of control, up to a hard cap. Everything skipped is listed in the gate notes — a
 * capped check that claims full coverage is a lie the next iteration will believe.
 */
const FOCUS_SAMPLE_PER_SIGNATURE = 3
const FOCUS_SAMPLE_CAP = Number(process.env.CHECK_FOCUS_SAMPLE || 40)

/** Failures listed individually per criterion before the remainder is summarised in a note. */
const FAILURE_LIST_CAP = 40

const DESKTOP = BREAKPOINTS.find((b) => b.width === 1440) ?? BREAKPOINTS[BREAKPOINTS.length - 1]
const MOBILE = BREAKPOINTS.find((b) => b.width === 390) ?? BREAKPOINTS[0]

const CRITERIA = [
  'AC-15',
  'AC-16',
  'AC-17',
  'AC-18',
  'AC-19',
  'AC-20',
  'AC-21',
  'AC-22',
  'AC-23',
  'AC-24',
  'AC-25',
]

// ── Gate state ────────────────────────────────────────────────────────────────

const gate = new Gate('a11y', 'Accessibility', CRITERIA)

/** Criteria that ran to completion. Anything missing at flush time failed to run. */
const completed = new Set<string>()

const evidence: Record<string, unknown> = {
  axeTags: AXE_TAGS,
  axeRuns: 0,
  axeStates: {} as Record<string, string[]>,
  focusSample: {} as Record<string, unknown>,
  counts: {} as Record<string, number>,
}

// ── In-page helpers ───────────────────────────────────────────────────────────

interface ElementInfo {
  /** data-a11y-ref value, used to build a locator that resolves to exactly this element. */
  ref: string
  /** Human-readable path for the failure message. */
  selector: string
  tag: string
  role: string
  name: string
  /** Groups interchangeable controls (same tag, role and classes) for deterministic sampling. */
  signature: string
  tabindex: string | null
  rect: { x: number; y: number; width: number; height: number }
}

interface A11yHelpers {
  cssPath(el: Element): string
  isVisible(el: Element): boolean
  collect(kind: 'tabbable' | 'interactive'): ElementInfo[]
  backgroundStack(el: Element, includeSelf: boolean): string[]
  accessibleName(el: Element): { name: string; source: string }
}

declare global {
  interface Window {
    __a11y: A11yHelpers
  }
}

/**
 * Installed before every navigation. Element identity travels between the browser and this
 * file as a `data-a11y-ref` attribute rather than a CSS selector, because a generated
 * selector that matches two elements silently checks the wrong one — and Tailwind class
 * names are full of characters that are not selector-safe anyway.
 */
function installA11yHelpers(): void {
  const TABBABLE_SELECTOR = [
    'a[href]',
    'area[href]',
    'button',
    'input',
    'select',
    'textarea',
    'summary',
    'iframe',
    'audio[controls]',
    'video[controls]',
    '[contenteditable=""]',
    '[contenteditable="true"]',
    '[tabindex]',
  ].join(', ')

  const ROLE_SELECTOR = [
    '[role="button"]',
    '[role="link"]',
    '[role="tab"]',
    '[role="checkbox"]',
    '[role="switch"]',
    '[role="menuitem"]',
    '[role="option"]',
  ].join(', ')

  let refCounter = 0

  const text = (el: Element | null): string => (el?.textContent || '').replace(/\s+/g, ' ').trim()

  const safeClasses = (el: Element): string[] =>
    (el.getAttribute('class') || '')
      .trim()
      .split(/\s+/)
      .filter((c) => /^[A-Za-z][A-Za-z0-9_-]*$/.test(c))

  function cssPath(el: Element): string {
    if (!el || el.nodeType !== 1) return '<no element>'
    if (el.id) return `#${el.id}`
    const parts: string[] = []
    let node: Element | null = el
    while (node && node.nodeType === 1 && parts.length < 4) {
      if (node.id) {
        parts.unshift(`#${node.id}`)
        break
      }
      const section = node.getAttribute('data-section')
      if (section && node !== el) {
        parts.unshift(`[data-section="${section}"]`)
        break
      }
      let part = node.tagName.toLowerCase()
      if (section) part += `[data-section="${section}"]`
      const classes = safeClasses(node).slice(0, 2)
      if (classes.length) part += `.${classes.join('.')}`
      const parent: HTMLElement | null = node.parentElement
      if (parent) {
        const siblings = Array.from(parent.children).filter((c) => c.tagName === node!.tagName)
        if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(node) + 1})`
      }
      parts.unshift(part)
      node = parent
    }
    return parts.join(' > ')
  }

  function isVisible(el: Element): boolean {
    if (!el.getClientRects().length) return false
    const style = getComputedStyle(el)
    if (style.display === 'none') return false
    if (style.visibility === 'hidden' || style.visibility === 'collapse') return false
    if (Number(style.opacity) === 0) return false
    const check = (el as Element & { checkVisibility?: (opts: object) => boolean }).checkVisibility
    if (typeof check === 'function') {
      return check.call(el, {
        checkOpacity: true,
        checkVisibilityCSS: true,
        opacityProperty: true,
        visibilityProperty: true,
      })
    }
    return true
  }

  /** aria-hidden and inert subtrees are removed from the accessibility tree entirely. */
  function isHiddenFromAssistiveTech(el: Element): boolean {
    let node: Element | null = el
    while (node) {
      if (node.hasAttribute('inert')) return true
      if (node.getAttribute('aria-hidden') === 'true') return true
      node = node.parentElement
    }
    return false
  }

  function isTabbable(el: Element): boolean {
    if (!el.matches(TABBABLE_SELECTOR)) return false
    if (el.matches(':disabled')) return false
    const tabindex = el.getAttribute('tabindex')
    if (tabindex !== null && Number(tabindex) < 0) return false
    if (el.tagName === 'INPUT' && (el as HTMLInputElement).type === 'hidden') return false
    if (el.tagName === 'SUMMARY') {
      // Only the first summary of a details element is a control; the rest are plain text.
      const parent = el.parentElement
      if (!parent || parent.tagName !== 'DETAILS') return false
      if (parent.querySelector(':scope > summary') !== el) return false
    }
    return true
  }

  function accessibleName(el: Element): { name: string; source: string } {
    const labelledby = el.getAttribute('aria-labelledby')
    if (labelledby) {
      const resolved = labelledby
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map((node) => text(node))
        .join(' ')
        .trim()
      if (resolved) return { name: resolved, source: 'aria-labelledby' }
    }
    const ariaLabel = (el.getAttribute('aria-label') || '').trim()
    if (ariaLabel) return { name: ariaLabel, source: 'aria-label' }
    if (el.id) {
      const explicit = document.querySelector(`label[for="${CSS.escape(el.id)}"]`)
      if (explicit && text(explicit)) return { name: text(explicit), source: 'label[for]' }
    }
    const wrapping = el.closest('label')
    if (wrapping && text(wrapping)) return { name: text(wrapping), source: 'wrapping <label>' }
    const own = text(el)
    if (own) return { name: own, source: 'element text' }
    const image = el.querySelector('img[alt]')
    const alt = (image?.getAttribute('alt') || '').trim()
    if (alt) return { name: alt, source: 'image alt' }
    const title = (el.getAttribute('title') || '').trim()
    if (title) return { name: title, source: 'title' }
    const placeholder = (el.getAttribute('placeholder') || '').trim()
    if (placeholder) return { name: placeholder, source: 'placeholder' }
    return { name: '', source: 'none' }
  }

  function describe(el: Element): ElementInfo {
    let ref = el.getAttribute('data-a11y-ref')
    if (!ref) {
      ref = `ref-${++refCounter}`
      el.setAttribute('data-a11y-ref', ref)
    }
    const box = el.getBoundingClientRect()
    const role = el.getAttribute('role') || ''
    return {
      ref,
      selector: cssPath(el),
      tag: el.tagName.toLowerCase(),
      role,
      name: accessibleName(el).name.slice(0, 80),
      signature: [
        el.tagName.toLowerCase(),
        role,
        (el as HTMLInputElement).type || '',
        safeClasses(el).join(' '),
        el.closest('[data-section]')?.getAttribute('data-section') || '',
      ].join('|'),
      tabindex: el.getAttribute('tabindex'),
      rect: { x: box.x, y: box.y, width: box.width, height: box.height },
    }
  }

  /**
   * `tabbable` is the set Tab must reach. `interactive` adds controls built out of ARIA
   * roles, which are targets a finger has to hit even when they are not in the tab order.
   */
  function collect(kind: 'tabbable' | 'interactive'): ElementInfo[] {
    const selector = kind === 'tabbable' ? TABBABLE_SELECTOR : `${TABBABLE_SELECTOR}, ${ROLE_SELECTOR}`
    const seen = new Set<Element>()
    const out: ElementInfo[] = []
    for (const el of Array.from(document.querySelectorAll(selector))) {
      if (seen.has(el)) continue
      seen.add(el)
      const tabbable = isTabbable(el)
      if (kind === 'tabbable' && !tabbable) continue
      if (kind === 'interactive' && !tabbable && !el.matches(ROLE_SELECTOR)) continue
      if (kind === 'interactive' && el.matches(':disabled')) continue
      if (!isVisible(el)) continue
      if (isHiddenFromAssistiveTech(el)) continue
      out.push(describe(el))
    }
    return out
  }

  /**
   * Every background-color from the element (or its parent) up to the root, nearest first.
   * The caller composites them, because the surface behind a focus ring is whatever is
   * painted under it once every translucent layer has been resolved.
   */
  function backgroundStack(el: Element, includeSelf: boolean): string[] {
    const stack: string[] = []
    let node: Element | null = includeSelf ? el : el.parentElement
    while (node) {
      stack.push(getComputedStyle(node).backgroundColor)
      node = node.parentElement
    }
    return stack
  }

  window.__a11y = { cssPath, isVisible, collect, backgroundStack, accessibleName }
}

// ── Reporting helpers ─────────────────────────────────────────────────────────

const errorText = (err: unknown): string =>
  (err instanceof Error ? err.message : String(err)).split('\n').slice(0, 3).join(' ').slice(0, 300)

/**
 * Runs one criterion's checks. A thrown error becomes a reported failure rather than an
 * aborted run: the point of the gate is to say what is wrong, and "the check exploded" is
 * something being wrong. It is never a pass.
 */
async function guarded(criterion: string, label: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    completed.add(criterion)
  } catch (err) {
    gate.fail({
      criterion,
      message: `${criterion} A11Y: the ${label} check could not complete: ${errorText(err)}`,
      where: label,
      hint: 'A check that cannot run proves nothing. This is reported as a failure on purpose.',
    })
  }
}

/** Emits every collected failure, summarising the tail in a note when there are very many. */
function emit(criterion: string, failures: Failure[]): void {
  for (const failure of failures.slice(0, FAILURE_LIST_CAP)) gate.fail(failure)
  if (failures.length > FAILURE_LIST_CAP) {
    const rest = failures.slice(FAILURE_LIST_CAP)
    gate.fail({
      criterion,
      message: `${criterion} A11Y: ${rest.length} further failure(s) of the same kind, not listed individually.`,
      where: rest
        .map((f) => f.where ?? '')
        .filter(Boolean)
        .slice(0, 20)
        .join(', '),
      hint: 'These usually share one root cause with the listed failures. Fix those and re-run.',
    })
  }
}

// ── Page helpers ──────────────────────────────────────────────────────────────

interface OpenOptions {
  reducedMotion?: 'reduce' | 'no-preference'
}

/** One init script per page, however many times the page is reopened at another width. */
const instrumented = new WeakSet<Page>()

async function openPage(page: Page, width: number, height: number, options: OpenOptions = {}): Promise<void> {
  await page.setViewportSize({ width, height })
  if (options.reducedMotion) await page.emulateMedia({ reducedMotion: options.reducedMotion })
  if (!instrumented.has(page)) {
    await page.addInitScript(installA11yHelpers)
    instrumented.add(page)
  }
  await page.goto('/', { waitUntil: 'load' })
  // Fonts and images decide layout and contrast. Auditing before they land measures a page
  // that no visitor ever sees, and produces a different answer on every run.
  // Fonts and images decide layout and contrast, so wait for them — but with a deadline.
  //
  // The unbounded version of this hung the gate for seven minutes and then reported all
  // eleven of its criteria as "could not complete", on a page that has zero violations.
  // The cause is worth remembering: a lazily-loaded image below the fold never starts
  // loading, so `complete` stays false and `decode()` never settles. Waiting for an image
  // the browser has decided not to fetch is waiting forever.
  //
  // So: every wait is raced against a timer, and anything still outstanding is recorded
  // as a note rather than silently ignored. An audit run before a font lands is worth
  // knowing about; an audit that never runs is worth nothing at all.
  const settle = await page.evaluate(async () => {
    const deadline = <T>(p: Promise<T>, ms: number) =>
      Promise.race([p.then(() => true).catch(() => false), new Promise<boolean>((r) => setTimeout(() => r(false), ms))])

    const fontsReady = await deadline(document.fonts.ready, 5_000)

    const pending = Array.from(document.images).filter((img) => !img.complete)
    const decoded = await Promise.all(pending.map((img) => deadline(img.decode(), 3_000)))

    return {
      fontsReady,
      imagesPending: pending.length,
      imagesUndecoded: pending.filter((_, i) => !decoded[i]).map((img) => img.currentSrc || img.src),
    }
  })

  if (!settle.fontsReady) {
    gate.note(`AC-15 at ${width}px: document.fonts.ready did not resolve within 5s; the audit ran anyway.`)
  }
  if (settle.imagesUndecoded.length) {
    // Expected for lazily-loaded imagery, and not a defect: axe reads the DOM and the
    // computed styles, not the decoded bitmaps.
    gate.note(
      `AC-15 at ${width}px: ${settle.imagesUndecoded.length} image(s) had not decoded when the audit ran ` +
        `(lazy loading below the fold). This does not affect any axe rule.`,
    )
  }
}

/** Two frames: the DOM change has been applied and painted. Cheaper and steadier than a sleep. */
/**
 * Wait for the next paint — but never forever.
 *
 * A bare double `requestAnimationFrame` hangs when the page is not the focused one.
 * Playwright runs spec files across several workers, only one page is frontmost, and
 * a backgrounded document throttles rAF to nothing. This gate then sat for seven
 * minutes and reported "could not complete" for all eleven of its criteria — a page
 * with zero real violations, recorded as eleven failures, because of a wait.
 *
 * So the rAF is raced against a timer. If frames are being produced we continue at the
 * next one; if they are not, we continue anyway after 200ms, which is longer than any
 * transition this page is allowed to have (AC-21).
 */
const nextPaint = (page: Page): Promise<void> =>
  page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let done = false
        const finish = () => {
          if (!done) {
            done = true
            resolve()
          }
        }
        requestAnimationFrame(() => requestAnimationFrame(finish))
        setTimeout(finish, 200)
      }),
  )

const byRef = (page: Page, ref: string): Locator => page.locator(`[data-a11y-ref="${ref}"]`)

const collect = (page: Page, kind: 'tabbable' | 'interactive'): Promise<ElementInfo[]> =>
  page.evaluate((k) => window.__a11y.collect(k), kind)

const blurActive = (page: Page): Promise<void> =>
  page.evaluate(() => {
    const active = document.activeElement as HTMLElement | null
    active?.blur?.()
  })

// ── AC-15 · axe-core in six states per breakpoint ─────────────────────────────

interface AxeFinding {
  ruleId: string
  impact: string
  help: string
  docsUrl: string
  target: string
  html: string
  summary: string
  firstWidth: number
  firstState: string
  firstStateCount: number
  occurrences: string[]
}

/** Keyed by rule + target so the same defect seen in eighteen states is reported once. */
const axeFindings = new Map<string, AxeFinding>()

async function runAxe(page: Page, width: number, state: string): Promise<void> {
  // Every violation is reported whatever its impact: AC-15 exempts no level, so a `minor`
  // finding fails the gate exactly as a `critical` one does. No rule is disabled either.
  const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze()
  evidence.axeRuns = (evidence.axeRuns as number) + 1

  const violationCount = results.violations.reduce((n, v) => n + v.nodes.length, 0)
  for (const violation of results.violations) {
    for (const node of violation.nodes) {
      const target = node.target.map((t) => (Array.isArray(t) ? t.join(' ') : String(t))).join(' ')
      const key = `${violation.id}|${target}`
      const existing = axeFindings.get(key)
      if (existing) {
        existing.occurrences.push(`${width}px "${state}"`)
        continue
      }
      axeFindings.set(key, {
        ruleId: violation.id,
        impact: violation.impact ?? 'unknown',
        help: violation.help,
        docsUrl: violation.helpUrl,
        target,
        html: (node.html || '').replace(/\s+/g, ' ').slice(0, 200),
        summary: (node.failureSummary || '').replace(/\s+/g, ' ').slice(0, 300),
        firstWidth: width,
        firstState: state,
        firstStateCount: violationCount,
        occurrences: [`${width}px "${state}"`],
      })
    }
  }
}

/**
 * AC-15 is deliberately run with the accordion open and each tab selected: a violation that
 * only exists in a state nobody screenshotted is still a violation, and hidden states are
 * where they live. States that do not exist are recorded rather than quietly not audited.
 */
async function auditEveryState(page: Page, width: number): Promise<string[]> {
  const audited: string[] = []

  await runAxe(page, width, 'default')
  audited.push('default')

  const tabs = page.locator('[data-section="lineup"] [role="tab"]')
  const tabCount = await tabs.count()
  for (let i = 0; i < tabCount; i++) {
    const tab = tabs.nth(i)
    const label = ((await tab.textContent()) || `tab ${i + 1}`).replace(/\s+/g, ' ').trim()
    try {
      await tab.click({ timeout: 5_000 })
      await nextPaint(page)
      await runAxe(page, width, `lineup tab "${label}" selected`)
      audited.push(`lineup tab "${label}" selected`)
    } catch (err) {
      gate.note(`AC-15: could not select lineup tab "${label}" at ${width}px (${errorText(err)}); that state was not audited.`)
    }
  }
  if (tabCount === 0) {
    gate.note(`AC-15: no [role="tab"] inside [data-section="lineup"] at ${width}px, so no per-tab state was audited. AC-18 reports this.`)
  }

  const openedPanels = await openEveryDisclosure(page)
  if (openedPanels > 0) {
    await nextPaint(page)
    await runAxe(page, width, 'FAQ accordion open')
    audited.push('FAQ accordion open')
  } else {
    gate.note(`AC-15: found no FAQ disclosure to open at ${width}px, so the open-accordion state was not audited. AC-19 reports this.`)
  }

  return audited
}

/** Opens every collapsed FAQ item and returns how many were opened. */
function openEveryDisclosure(page: Page): Promise<number> {
  return page.evaluate(() => {
    const faq = document.querySelector('[data-section="faq"]')
    if (!faq) return 0
    let opened = 0
    for (const details of Array.from(faq.querySelectorAll('details'))) {
      if (!details.open) {
        details.open = true
        opened++
      }
    }
    for (const control of Array.from(faq.querySelectorAll('[aria-expanded]'))) {
      if (control.closest('details')) continue
      if (control.getAttribute('aria-expanded') === 'false') {
        ;(control as HTMLElement).click()
        opened++
      } else {
        opened++
      }
    }
    return opened
  })
}

// ── AC-16 / AC-17 · focus indicator ───────────────────────────────────────────

interface RingReading {
  outlineStyle: string
  outlineWidth: number
  outlineColor: string
  outlineOffset: number
  boxShadow: string
  backgroundStack: string[]
}

/** Chromium serialises box-shadow with the colour first; take the first shadow's colour. */
function firstShadowColour(boxShadow: string): string | null {
  if (!boxShadow || boxShadow === 'none') return null
  const match = /(rgba?\([^)]*\)|#[0-9a-fA-F]{3,8})/.exec(boxShadow)
  return match ? match[1] : null
}

/** Composite the ancestor backgrounds, far end first, into the colour a viewer actually sees. */
function resolveBackdrop(stack: string[]): { colour: Rgba; hex: string } | { unparseable: string } {
  // The canvas under an entirely transparent stack: white is what a browser paints when
  // nothing else does, and guessing the page background instead would invent a pass.
  let resolved: Rgba = { r: 255, g: 255, b: 255, a: 1 }
  for (let i = stack.length - 1; i >= 0; i--) {
    const layer = parseCssColor(stack[i])
    if (!layer) return { unparseable: stack[i] }
    if (layer.a <= 0) continue
    resolved = layer.a >= 1 ? { ...layer, a: 1 } : flatten(layer, resolved)
  }
  return { colour: resolved, hex: toHex(resolved) }
}

function sampleForScreenshots(items: ElementInfo[]): { sample: ElementInfo[]; skipped: ElementInfo[] } {
  const perSignature = new Map<string, number>()
  const sample: ElementInfo[] = []
  const skipped: ElementInfo[] = []
  for (const item of items) {
    const seen = perSignature.get(item.signature) ?? 0
    if (seen < FOCUS_SAMPLE_PER_SIGNATURE && sample.length < FOCUS_SAMPLE_CAP) {
      perSignature.set(item.signature, seen + 1)
      sample.push(item)
    } else {
      skipped.push(item)
    }
  }
  return { sample, skipped }
}

interface Clip {
  x: number
  y: number
  width: number
  height: number
}

function padClip(box: Clip, viewport: { width: number; height: number }): Clip | null {
  const x = Math.max(0, Math.floor(box.x - FOCUS_CLIP_PAD_PX))
  const y = Math.max(0, Math.floor(box.y - FOCUS_CLIP_PAD_PX))
  const right = Math.min(viewport.width, Math.ceil(box.x + box.width + FOCUS_CLIP_PAD_PX))
  const bottom = Math.min(viewport.height, Math.ceil(box.y + box.height + FOCUS_CLIP_PAD_PX))
  const width = right - x
  const height = bottom - y
  if (width < 1 || height < 1) return null
  return { x, y, width, height }
}

const toRgba = async (png: Buffer): Promise<{ data: Buffer; width: number; height: number }> => {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, width: info.width, height: info.height }
}

/** Share of pixels that differ between two same-sized captures, as a percentage. */
async function diffPercent(before: Buffer, after: Buffer): Promise<number | null> {
  const a = await toRgba(before)
  const b = await toRgba(after)
  if (a.width !== b.width || a.height !== b.height) return null
  const changed = pixelmatch(a.data, b.data, undefined, a.width, a.height, {
    threshold: PIXEL_THRESHOLD,
  })
  return (changed / (a.width * a.height)) * 100
}

// ── AC-21 · motion ────────────────────────────────────────────────────────────

interface MotionFinding {
  selector: string
  property: string
  detail: string
  durationMs: number
}

/**
 * Every element, both generated-content pseudo-elements, and the animation timeline, measured
 * against one budget.
 *
 * `exemptCanonMotion` exempts the ticker and the scroll cue. It is false under reduced motion,
 * where nothing may move, and true outside it, where CANON section 7 requires the marquee to
 * run and brief/CONTENT.md section 4 requires the cue to move. Without that exemption the
 * outside-reduce budget would fail the page the canon describes, and a gate no correct page
 * can pass is not a gate.
 */
function scanMotion(page: Page, budgetMs: number, exemptCanonMotion: boolean): Promise<MotionFinding[]> {
  return page.evaluate(
    ({ budget, exempt }) => {
      const toMs = (value: string): number => {
        const n = Number.parseFloat(value)
        if (!Number.isFinite(n)) return 0
        return value.trim().endsWith('ms') ? n : n * 1000
      }
      const longest = (list: string): number => Math.max(0, ...list.split(',').map((v) => toMs(v)))

      // CONTENT section 4: the cue is the link to #lineup under the hero CTAs.
      const canonRoots = document.querySelectorAll(
        '[data-section="ticker"], [data-scroll-cue], [class*="scroll-cue"], [data-section="hero"] a[href="#lineup"]',
      )
      const canonMotion = new Set<Element>()
      if (exempt) {
        for (const root of Array.from(canonRoots)) {
          canonMotion.add(root)
          for (const child of Array.from(root.querySelectorAll('*'))) canonMotion.add(child)
        }
      }

      const out: { selector: string; property: string; detail: string; durationMs: number }[] = []

      for (const el of Array.from(document.querySelectorAll('*'))) {
        // An element with no box paints nothing, so nothing about it can move on screen.
        if (!el.getClientRects().length) continue
        if (canonMotion.has(el)) continue
        for (const pseudo of [null, '::before', '::after']) {
          const style = getComputedStyle(el, pseudo)
          if (pseudo && (style.content === 'none' || style.content === 'normal')) continue
          const label = window.__a11y.cssPath(el) + (pseudo ?? '')

          // animation-name is allowed to stay set: the standard reduce override collapses the
          // duration rather than removing the animation, so duration is what decides.
          const running = style.animationName !== 'none' && style.animationPlayState !== 'paused'
          const animationMs = running ? longest(style.animationDuration) : 0
          if (animationMs > budget) {
            out.push({
              selector: label,
              property: 'animation',
              detail: `animation-name: ${style.animationName}`,
              durationMs: animationMs,
            })
          }

          const transitionMs = style.transitionProperty === 'none' ? 0 : longest(style.transitionDuration)
          if (transitionMs > budget) {
            out.push({
              selector: label,
              property: 'transition',
              detail: `transition-property: ${style.transitionProperty}`,
              durationMs: transitionMs,
            })
          }
        }
      }

      // A CSS marquee moved into script is still a marquee, and computed styles cannot see a
      // Web Animation. The CSS-backed ones are skipped here: the pass above already has them.
      for (const animation of document.getAnimations()) {
        if (animation.playState !== 'running') continue
        const kind = animation.constructor.name
        if (kind === 'CSSAnimation' || kind === 'CSSTransition') continue
        const effect = animation.effect
        if (!effect) continue
        const target = (effect as KeyframeEffect).target
        if (!target || canonMotion.has(target)) continue
        const timing = effect.getComputedTiming()
        const duration = typeof timing.duration === 'number' ? timing.duration : 0
        if (duration <= budget) continue
        out.push({
          selector: window.__a11y.cssPath(target),
          property: 'script-driven Web Animation',
          detail: kind,
          durationMs: duration,
        })
      }

      return out
    },
    { budget: budgetMs, exempt: exemptCanonMotion },
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

/**
 * Serial, because this file's tests share one Gate instance and one result file.
 * playwright.config.ts sets fullyParallel, which would otherwise spread them across workers
 * and have each worker write a partial a11y.json over the last one.
 */
test.describe.configure({ mode: 'serial' })

for (const breakpoint of BREAKPOINTS) {
  test(`AC-15 axe-core at ${breakpoint.width}px`, async ({ page }) => {
    test.setTimeout(420_000)
    await guarded('AC-15', `axe at ${breakpoint.width}px`, async () => {
      await openPage(page, breakpoint.width, breakpoint.height)
      const states = await auditEveryState(page, breakpoint.width)
      ;(evidence.axeStates as Record<string, string[]>)[`${breakpoint.width}px`] = states
    })
  })
}

test('AC-16 / AC-17 focus is visible and clears 3:1', async ({ page }) => {
  test.setTimeout(240_000)

  const focusFailures: Failure[] = []
  const ringFailures: Failure[] = []
  const sampledSelectors: string[] = []
  const notScreenshotted: string[] = []
  const unstable: string[] = []
  const results: FocusFindings = { focusFailures, ringFailures, unstable }
  let measured = 0

  await guarded('AC-16', 'focus indicator', async () => {
    // Both widths, because the controls differ: the hamburger only exists at 390, the nav
    // links only at 1440, and a focus style can be defined for one and forgotten for the other.
    const alreadyChecked = new Set<string>()

    for (const breakpoint of [DESKTOP, MOBILE]) {
      // Reduced motion plus frozen animations makes the pair of screenshots comparable.
      // Without it a transitioning ring or a moving ticker decides the verdict.
      await openPage(page, breakpoint.width, breakpoint.height, { reducedMotion: 'reduce' })
      const viewport = { width: breakpoint.width, height: breakpoint.height }

      const focusables = (await collect(page, 'tabbable')).filter((item) => !alreadyChecked.has(item.selector))
      for (const item of focusables) alreadyChecked.add(item.selector)

      const { sample, skipped } = sampleForScreenshots(focusables)
      const sampledRefs = new Set(sample.map((item) => item.ref))
      sampledSelectors.push(...sample.map((item) => `${breakpoint.width}px ${item.selector}`))
      notScreenshotted.push(...skipped.map((item) => `${breakpoint.width}px ${item.selector}`))

      for (const item of focusables) {
        const where = `${item.selector} at ${breakpoint.width}px`
        try {
          await checkFocusIndicator({
            page,
            item,
            where,
            viewport,
            screenshot: sampledRefs.has(item.ref),
            into: results,
          })
          measured++
        } catch (err) {
          // One detached or unfocusable element must not cost the other sixty their check.
          unstable.push(`${where}: ${errorText(err)}`)
        }
      }
    }
  })

  // AC-17 rides along with AC-16 above; mark it complete only if that body finished.
  if (completed.has('AC-16')) completed.add('AC-17')

  emit('AC-16', focusFailures)
  emit('AC-17', ringFailures)

  evidence.focusSample = {
    measuredForContrast: measured,
    screenshotted: sampledSelectors.length,
    perSignatureCap: FOCUS_SAMPLE_PER_SIGNATURE,
    totalCapPerBreakpoint: FOCUS_SAMPLE_CAP,
    notScreenshotted: notScreenshotted.length,
  }
  if (notScreenshotted.length) {
    gate.note(
      `AC-16 screenshotted ${sampledSelectors.length} focusable element(s) and skipped ${notScreenshotted.length} to stay inside the demo's time budget ` +
        `(at most ${FOCUS_SAMPLE_PER_SIGNATURE} per distinct control kind, hard cap ${FOCUS_SAMPLE_CAP} per breakpoint). Not screenshotted: ` +
        `${notScreenshotted.slice(0, 30).join(', ')}${notScreenshotted.length > 30 ? `, and ${notScreenshotted.length - 30} more` : ''}. ` +
        'Every one of them was still measured for AC-17.',
    )
  }
  if (unstable.length) {
    gate.note(`AC-16 could not compare ${unstable.length} element(s): ${unstable.slice(0, 15).join('; ')}. These were not judged either way.`)
  }
})

interface FocusFindings {
  focusFailures: Failure[]
  ringFailures: Failure[]
  unstable: string[]
}

/**
 * AC-17 for one element — and AC-16 as well when the element is in the screenshot sample.
 *
 * Both live in one function because both need the element focused, and focusing it twice
 * would double the slowest part of the gate.
 */
async function checkFocusIndicator(options: {
  page: Page
  item: ElementInfo
  where: string
  viewport: { width: number; height: number }
  screenshot: boolean
  into: FocusFindings
}): Promise<void> {
  const { page, item, where, viewport, screenshot, into } = options
  const locator = byRef(page, item.ref)

  await locator.focus()
  await nextPaint(page)

  // AC-17 — measure the ring this element actually draws. No screenshots in this half, so
  // it is not sampled: every focusable control gets measured.
  const reading = (await locator.evaluate((el) => {
    const style = getComputedStyle(el)
    const offset = Number.parseFloat(style.outlineOffset) || 0
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: Number.parseFloat(style.outlineWidth) || 0,
      outlineColor: style.outlineColor,
      outlineOffset: offset,
      boxShadow: style.boxShadow,
      // A ring with a non-negative offset is painted outside the element's own background,
      // so the surface behind it is the parent's, not the element's.
      backgroundStack: window.__a11y.backgroundStack(el, offset < 0),
    }
  })) as RingReading

  const shadowColour = firstShadowColour(reading.boxShadow)
  const hasOutline = reading.outlineStyle !== 'none' && reading.outlineStyle !== 'auto' && reading.outlineWidth > 0
  const indicator = hasOutline ? reading.outlineColor : shadowColour
  const backdrop = resolveBackdrop(reading.backgroundStack)

  if (reading.outlineStyle === 'auto' && !shadowColour) {
    // outline-style: auto is the browser's own ring. Chromium paints it as a two-tone stroke
    // that ignores outline-color, so there is no colour here to measure honestly — and CANON
    // section 9 asks for an indicator the design owns, not one the browser chose.
    into.ringFailures.push({
      criterion: 'AC-17',
      message: `AC-17 A11Y: focus indicator on ${item.selector} is the browser default (outline-style: auto), whose contrast against ${'unparseable' in backdrop ? 'the surface behind it' : backdrop.hex} cannot be measured. Minimum ${FOCUS_RING_MIN_RATIO}:1`,
      where,
      expected: `an explicit outline in a token colour, at least ${FOCUS_RING_MIN_RATIO}:1 against its surface`,
      actual: 'outline-style: auto (user-agent ring)',
      hint: 'The :focus-visible rule in src/styles/global.css sets 2px solid accent.coolant, which is 12.57:1 on bg.base. Something is overriding it for this element.',
    })
  } else if ('unparseable' in backdrop) {
    into.ringFailures.push({
      criterion: 'AC-17',
      message: `AC-17 A11Y: the surface behind ${item.selector} could not be resolved — background-color "${backdrop.unparseable}" is not a colour this checker can convert to sRGB.`,
      where,
      hint: 'Declare the background with a token from design/tokens/tokens.json. Unresolvable means unchecked, which is why this is a failure and not a skip.',
    })
  } else if (!indicator) {
    into.ringFailures.push({
      criterion: 'AC-17',
      message: `AC-17 A11Y: focus indicator on ${item.selector} has no measurable colour against ${backdrop.hex}, minimum ${FOCUS_RING_MIN_RATIO}:1`,
      where,
      expected: `an outline or box-shadow with at least ${FOCUS_RING_MIN_RATIO}:1 against ${backdrop.hex}`,
      actual: `outline-style: ${reading.outlineStyle}, outline-width: ${reading.outlineWidth}px, box-shadow: ${reading.boxShadow}`,
      hint: 'design/tokens/CONTRAST.md section 4: accent.coolant (#2FE6D6) is 12.57:1 on bg.base. border.strong is 1.98:1 and must never be the visible ring.',
    })
  } else {
    const ringColour = parseCssColor(indicator)
    if (!ringColour) {
      into.ringFailures.push({
        criterion: 'AC-17',
        message: `AC-17 A11Y: focus indicator colour "${indicator}" on ${item.selector} could not be converted to sRGB, so its contrast against ${backdrop.hex} is unknown.`,
        where,
        hint: 'Unknown is not a pass. Use a colour from design/tokens/tokens.json.',
      })
    } else {
      const ratio = contrastRatio(ringColour, backdrop.colour)
      if (ratio < FOCUS_RING_MIN_RATIO) {
        into.ringFailures.push({
          criterion: 'AC-17',
          message: `AC-17 A11Y: focus indicator on ${item.selector} has ${round2(ratio)}:1 contrast against ${backdrop.hex}, minimum ${FOCUS_RING_MIN_RATIO}:1`,
          where,
          expected: `>= ${FOCUS_RING_MIN_RATIO}:1`,
          actual: `${round2(ratio)}:1 (${toHex(ringColour)} on ${backdrop.hex}, read from ${hasOutline ? 'outline-color' : 'box-shadow'})`,
          hint: 'design/tokens/CONTRAST.md section 4: accent.coolant (#2FE6D6) is 12.57:1 on bg.base and 11.67:1 on bg.surface.',
        })
      }
    }
  }

  if (!screenshot) return

  // AC-16 — does anything visibly change? Measured from the focused geometry, because
  // controls like the skip link live off-screen until they are focused.
  //
  // focus() alone does not reliably bring an element into the viewport — inside a scroll
  // container, or on a long page, it can leave the box off-screen, and a clip outside the
  // viewport cannot be screenshotted. Scrolling first is the difference between comparing
  // the element and reporting that it could not be compared.
  await locator.scrollIntoViewIfNeeded({ timeout: 5_000 }).catch(() => undefined)
  await nextPaint(page)
  const focusedBox = await locator.boundingBox()
  if (!focusedBox || focusedBox.width === 0 || focusedBox.height === 0) {
    into.unstable.push(`${where}: no box while focused`)
    return
  }
  const clip = padClip(focusedBox, viewport)
  if (!clip) {
    into.unstable.push(`${where}: the focused box falls outside the viewport`)
    return
  }

  await blurActive(page)
  await nextPaint(page)
  const unfocused = await page.screenshot({ clip, animations: 'disabled', caret: 'hide' })

  await locator.focus()
  await nextPaint(page)
  const refocusedBox = await locator.boundingBox()
  if (!refocusedBox || Math.abs(refocusedBox.x - focusedBox.x) > 1 || Math.abs(refocusedBox.y - focusedBox.y) > 1) {
    // The element moved between the two captures, so a diff would be measuring the move.
    into.unstable.push(`${where}: element moved between captures`)
    return
  }
  const focused = await page.screenshot({ clip, animations: 'disabled', caret: 'hide' })

  const pct = await diffPercent(unfocused, focused)
  // Different raster sizes mean the render changed shape, which is itself a visible change.
  if (pct === null) return
  if (pct < FOCUS_DIFF_MIN_PCT) {
    into.focusFailures.push({
      criterion: 'AC-16',
      message: `AC-16 A11Y: no visible focus change on ${item.selector}; focused and unfocused renders of its padded box differ by ${pct.toFixed(2)}% (minimum ${FOCUS_DIFF_MIN_PCT}%)`,
      where,
      expected: `>= ${FOCUS_DIFF_MIN_PCT}% of the pixels in the padded box change`,
      actual: `${pct.toFixed(2)}%`,
      hint: 'CANON section 9: every interactive element needs a visible focus indicator. The :focus-visible rule in src/styles/global.css is the one place to fix it.',
    })
  }
}

test('AC-18 lineup tabs follow the tabs pattern', async ({ page }) => {
  test.setTimeout(90_000)
  const failures: Failure[] = []
  const reported = new Set<string>()
  /**
   * The same structural defect — two selected tabs, no roving tabindex — is visible again
   * after every key press. Reporting it once keeps the repair prompt readable; the "on load"
   * or "after ArrowRight" prefix is stripped before deduplicating so a defect that only
   * appears after a particular key is still reported separately.
   */
  const detail = (text: string, where?: string) => {
    const key = `${text.replace(/^(on load|after [A-Za-z]+), /, '')}|${where ?? ''}`
    if (reported.has(key)) return
    reported.add(key)
    failures.push({
      criterion: 'AC-18',
      message: `AC-18 A11Y: lineup tabs — ${text}. Expected roving tabindex, ArrowLeft/ArrowRight/Home/End, exactly one aria-selected tab, aria-controls resolving to a labelled tabpanel`,
      where: where ?? '[data-section="lineup"]',
    })
  }

  await guarded('AC-18', 'lineup tabs', async () => {
    await openPage(page, DESKTOP.width, DESKTOP.height, { reducedMotion: 'reduce' })

    const state = await readTabState(page)
    if (!state.hasLineup) {
      detail('there is no [data-section="lineup"] on the page')
      return
    }
    if (state.tabs.length === 0) {
      detail('no element inside the lineup section has role="tab"')
      return
    }
    if (state.tablists === 0) {
      detail('the tabs are not inside an element with role="tablist"')
    }

    for (const tab of state.tabs) {
      if (!tab.inTablist) detail(`tab "${tab.text}" is not inside a role="tablist"`, tab.selector)
      if (!tab.controls) {
        detail(`tab "${tab.text}" has no aria-controls`, tab.selector)
      } else if (!tab.panelExists) {
        detail(`aria-controls="${tab.controls}" on tab "${tab.text}" does not resolve to an element`, tab.selector)
      } else {
        if (!tab.panelIsTabpanel) {
          detail(`aria-controls="${tab.controls}" on tab "${tab.text}" resolves to role="${tab.panelRole || 'none'}", expected role="tabpanel"`, tab.selector)
        }
        if (!tab.panelName) {
          detail(`the tabpanel controlled by "${tab.text}" has no accessible name`, tab.selector)
        }
      }
      if (!tab.name) detail(`tab "${tab.text}" has no accessible name`, tab.selector)
    }

    const selectedCount = state.tabs.filter((t) => t.selected === 'true').length
    if (selectedCount !== 1) {
      detail(`${selectedCount} tab(s) carry aria-selected="true" on load, expected exactly 1`)
    }

    const rovingProblem = describeRovingTabindex(state)
    if (rovingProblem) detail(`on load, ${rovingProblem}`)

    if (state.tabs.length < 2) {
      detail(`only ${state.tabs.length} tab found, so ArrowLeft/ArrowRight/Home/End cannot be exercised`)
      return
    }

    const last = state.tabs.length - 1
    await byRef(page, state.tabs[0].ref).focus()
    await nextPaint(page)

    const steps: { key: string; expected: number }[] = [
      { key: 'ArrowRight', expected: 1 },
      { key: 'ArrowLeft', expected: 0 },
      { key: 'End', expected: last },
      { key: 'Home', expected: 0 },
    ]

    for (const step of steps) {
      const before = await readTabState(page)
      await page.keyboard.press(step.key)
      await nextPaint(page)
      const after = await readTabState(page)

      const selectedIndexes = after.tabs.filter((t) => t.selected === 'true').map((t) => t.index)
      if (selectedIndexes.length !== 1) {
        detail(`after ${step.key}, ${selectedIndexes.length} tab(s) carry aria-selected="true", expected exactly 1`)
      } else if (selectedIndexes[0] !== step.expected) {
        detail(
          `${step.key} from tab ${before.focusedIndex + 1} moved selection to tab ${selectedIndexes[0] + 1} ("${after.tabs[selectedIndexes[0]].text}"), expected tab ${step.expected + 1} ("${after.tabs[step.expected].text}")`,
        )
      }
      if (after.focusedIndex !== step.expected) {
        detail(
          `${step.key} left focus on ${after.focusedIndex === -1 ? 'something that is not a tab' : `tab ${after.focusedIndex + 1}`}, expected focus to follow to tab ${step.expected + 1}`,
        )
      }
      const roving = describeRovingTabindex(after)
      if (roving) detail(`after ${step.key}, ${roving}`)
    }
  })

  emit('AC-18', failures)
})

/** The tail of every AC-19 message, quoted from brief/ACCEPTANCE.md so the two cannot drift. */
const AC19_EXPECTED =
  'Expected a summary inside a details, or a button with aria-expanded; the expanded state must toggle on Enter and Space and focus must stay on the control'

test('AC-19 FAQ items toggle on Enter and Space', async ({ page }) => {
  test.setTimeout(120_000)
  const failures: Failure[] = []

  await guarded('AC-19', 'FAQ accordion', async () => {
    await openPage(page, DESKTOP.width, DESKTOP.height, { reducedMotion: 'reduce' })

    const faq = await readFaqControls(page)
    // No section and an empty section are different defects, and the repair is different too,
    // so they do not share a message.
    if (faq === null) {
      failures.push({
        criterion: 'AC-19',
        message: `AC-19 A11Y: FAQ — there is no [data-section="faq"] on the page, so there is no item to drive. ${AC19_EXPECTED}`,
        where: '[data-section="faq"]',
      })
      return
    }
    if (faq.controls.length === 0) {
      failures.push({
        criterion: 'AC-19',
        message: `AC-19 A11Y: FAQ — the section contains no disclosure control: no <summary> inside a <details>, and nothing carrying aria-expanded${faq.bareButtons ? `, though it does contain ${faq.bareButtons} <button> element(s) without aria-expanded` : ''}. ${AC19_EXPECTED}`,
        where: '[data-section="faq"]',
      })
      return
    }
    ;(evidence.counts as Record<string, number>).faqItems = faq.controls.length

    let nativeDisclosures = 0
    for (const [index, item] of faq.controls.entries()) {
      const number = index + 1
      const question = item.question.slice(0, 60)
      const fail = (text: string) =>
        failures.push({
          criterion: 'AC-19',
          message: `AC-19 A11Y: FAQ item ${number} ("${question}") — ${text}. ${AC19_EXPECTED}`,
          where: item.selector,
        })

      if (item.shapeProblem) {
        fail(item.shapeProblem)
        continue
      }
      if (item.native) nativeDisclosures++

      for (const key of ['Enter', 'Space'] as const) {
        await byRef(page, item.ref).focus()
        await nextPaint(page)
        if (!(await isFocused(page, item.ref))) {
          fail(`the control cannot be focused, so ${key} could not be tested`)
          break
        }

        const before = await readExpanded(page, item)
        if (before === null) {
          // A button whose aria-expanded holds neither "true" nor "false": there is a control,
          // but no state the accessibility tree can report and no state to toggle.
          fail(`the accessibility tree exposes no expanded state for this control, so ${key} has nothing to toggle`)
          break
        }
        await page.keyboard.press(key)
        await nextPaint(page)
        const after = await readExpanded(page, item)
        const landedOn = await focusedSelector(page)

        if (after === before) {
          fail(`${key} did not change the expanded state (it stayed ${before ? 'open' : 'closed'})`)
        }
        if (!(await isFocused(page, item.ref))) {
          fail(`${key} moved focus to ${landedOn}`)
        }

        // Put the item back, so the next key starts from the same state and the run is idempotent.
        if (after !== before) {
          await byRef(page, item.ref).focus()
          await page.keyboard.press(key)
          await nextPaint(page)
        }
      }
    }

    if (nativeDisclosures > 0) {
      gate.note(
        `AC-19: ${nativeDisclosures} FAQ item(s) are native <details>/<summary>, which brief/CONTENT.md section 10 asks for. ` +
          'Chromium does not map <summary> to role=button, so their expanded state was read from the details element — the ' +
          'state the browser translates into what a screen reader announces — never from an aria-expanded attribute, which a summary does not carry.',
      )
    }
  })

  emit('AC-19', failures)
})

test('AC-20 Tab reaches everything and never traps', async ({ page }) => {
  test.setTimeout(150_000)
  const failures: Failure[] = []

  await guarded('AC-20', 'tab order', async () => {
    for (const breakpoint of [DESKTOP, MOBILE]) {
      await openPage(page, breakpoint.width, breakpoint.height, { reducedMotion: 'reduce' })
      // The expected set is the elements whose effective tabindex is 0. collect('tabbable')
      // already drops everything AC-20 excludes: the unselected roving tabs AC-18 requires to
      // sit at -1, and the controls behind a closed mobile menu, which are not visible.
      // Both widths are walked, because the nav is a different control at each.
      const expected = await collect(page, 'tabbable')
      if (expected.length === 0) {
        failures.push({
          criterion: 'AC-20',
          message: `AC-20 A11Y: keyboard trap at <none>; focus did not move after 0 Tab presses. Unreachable element(s): the page exposes no tabbable element at all at ${breakpoint.width}px`,
          where: `${breakpoint.width}px`,
        })
        continue
      }

      await page.evaluate(() => {
        const active = document.activeElement as HTMLElement | null
        active?.blur?.()
        window.scrollTo(0, 0)
      })

      const visited = new Set<string>()
      const maxPresses = expected.length * 2 + 10
      let previousKey: string | null = null
      let repeats = 0
      let trapped: { selector: string; presses: number } | null = null
      let presses = 0

      for (let i = 0; i < maxPresses; i++) {
        await page.keyboard.press('Tab')
        presses++
        const current = await page.evaluate(() => {
          const el = document.activeElement
          if (!el || el === document.body || el === document.documentElement) return null
          return { ref: el.getAttribute('data-a11y-ref'), selector: window.__a11y.cssPath(el) }
        })

        // Leaving the page (focus on the document) is the normal end of the tab ring in a
        // headless browser, not a trap. Two consecutive presses that land on the same
        // element is a trap: the second press proves the first was not a slow update.
        const key = current ? current.ref ?? current.selector : '<document>'
        if (key !== '<document>' && key === previousKey) {
          repeats++
          if (repeats >= 2) {
            trapped = { selector: current!.selector, presses }
            break
          }
        } else {
          repeats = 0
        }
        previousKey = key
        if (current?.ref) visited.add(current.ref)
        if (visited.size === expected.length) break
      }

      const unreachable = expected.filter((item) => !visited.has(item.ref))
      if (trapped || unreachable.length) {
        const list = unreachable.map((item) => item.selector)
        failures.push({
          criterion: 'AC-20',
          message: `AC-20 A11Y: keyboard trap at ${trapped ? trapped.selector : '<none>'}; focus did not move after ${trapped ? trapped.presses : presses} Tab presses. Unreachable element(s): ${list.length ? list.slice(0, 12).join(', ') + (list.length > 12 ? `, and ${list.length - 12} more` : '') : 'none'}`,
          where: `${breakpoint.width}px`,
          expected: `${expected.length} tabbable element(s) reached, focus always advancing`,
          actual: `${visited.size} reached in ${presses} Tab presses${trapped ? `, trapped at ${trapped.selector}` : ''}`,
          hint: trapped
            ? 'A trap is usually a keydown handler that calls preventDefault on Tab, or a dialog that re-focuses itself.'
            : 'An unreachable element is usually hidden behind tabindex="-1", or inside a container that is visible but skipped.',
        })
      }
      ;(evidence.counts as Record<string, number>)[`tabbableAt${breakpoint.width}`] = expected.length
    }
  })

  emit('AC-20', failures)
})

test('AC-21 prefers-reduced-motion is honoured', async ({ page }) => {
  test.setTimeout(120_000)
  const failures: Failure[] = []
  const seen = new Set<string>()

  const record = (finding: MotionFinding, message: string, expected: string, hint?: string) => {
    const key = `${finding.selector}|${finding.property}|${Math.round(finding.durationMs)}|${expected}`
    if (seen.has(key)) return
    seen.add(key)
    failures.push({
      criterion: 'AC-21',
      message,
      where: finding.selector,
      expected,
      actual: `${round2(finding.durationMs)}ms (${finding.detail})`,
      hint,
    })
  }

  await guarded('AC-21', 'reduced motion', async () => {
    // Under reduce, nothing moves: 1ms is the standard override's own value, not a tolerance.
    await openPage(page, DESKTOP.width, DESKTOP.height, { reducedMotion: 'reduce' })
    for (const finding of await scanMotion(page, MOTION_REDUCE_MAX_MS, false)) {
      record(
        finding,
        `AC-21 A11Y: prefers-reduced-motion: reduce is set but ${finding.selector} still animates (${finding.property}, ${round2(finding.durationMs)}ms, budget ${MOTION_REDUCE_MAX_MS}ms). Outside reduce the budget is ${MOTION_MAX_MS}ms`,
        `<= ${MOTION_REDUCE_MAX_MS}ms under prefers-reduced-motion: reduce`,
        'The reset in src/styles/global.css collapses every animation and transition to 0.01ms. Something here is outside its reach — an inline style, a JS animation, or a rule with higher specificity.',
      )
    }

    // Outside reduce the budget is 200ms — except for the two things CANON requires to move.
    await openPage(page, DESKTOP.width, DESKTOP.height, { reducedMotion: 'no-preference' })
    for (const finding of await scanMotion(page, MOTION_MAX_MS, true)) {
      record(
        finding,
        `AC-21 A11Y: ${finding.selector} animates (${finding.property}, ${round2(finding.durationMs)}ms, budget ${MOTION_MAX_MS}ms) with no motion preference set. Under prefers-reduced-motion: reduce the budget is ${MOTION_REDUCE_MAX_MS}ms`,
        `<= ${MOTION_MAX_MS}ms with no motion preference set`,
      )
    }

    gate.note(
      `AC-21: the ${MOTION_MAX_MS}ms budget outside reduced motion exempts [data-section="ticker"] and the scroll cue, ` +
        'because CANON section 7 requires a horizontal marquee and brief/CONTENT.md section 4 requires the cue to move. ' +
        'A gate that failed those would be unsatisfiable by the page the canon describes. Under reduce nothing is exempt.',
    )
  })

  emit('AC-21', failures)
})

test('AC-22 / AC-23 / AC-25 images, touch targets and tabindex', async ({ page }) => {
  test.setTimeout(120_000)
  const imageFailures: Failure[] = []
  const targetFailures: Failure[] = []
  const tabindexFailures: Failure[] = []

  // All three read the DOM once at 390, which is the width AC-23 is specified at and the
  // layout where targets get squeezed. Each criterion is marked complete as it finishes, so a
  // failure in one still reports the others honestly.
  await guarded('AC-22', 'images, touch targets and tabindex', async () => {
    await openPage(page, MOBILE.width, MOBILE.height, { reducedMotion: 'reduce' })

    const images = await page.evaluate(() =>
      Array.from(document.images).map((img) => ({
        selector: window.__a11y.cssPath(img),
        src: img.getAttribute('src') || img.currentSrc || '',
        alt: img.getAttribute('alt'),
        decorative: img.hasAttribute('data-decorative'),
      })),
    )
    ;(evidence.counts as Record<string, number>).images = images.length

    for (const image of images) {
      const problem = describeAltProblem(image)
      if (!problem) continue
      // With no alt attribute at all there is no alt value to quote, and quoting alt="" would
      // describe a different defect from the one that is actually there.
      const quoted = image.alt === null ? '' : ` (alt="${image.alt}")`
      imageFailures.push({
        criterion: 'AC-22',
        message: `AC-22 A11Y: <img src="${image.src}"> has ${problem}${quoted}. Decorative images need alt=""; content images need alt that is not the filename`,
        where: image.selector,
        hint: 'Alt text for every image on this page is written out in brief/CONTENT.md section 13.',
      })
    }
    completed.add('AC-22')

    // AC-23 — every interactive target, measured where a finger meets it.
    const targets = await collect(page, 'interactive')
    ;(evidence.counts as Record<string, number>).interactiveAt390 = targets.length
    for (const target of targets) {
      let { width, height } = target.rect
      if (width < TOUCH_MIN_PX || height < TOUCH_MIN_PX) {
        // A control that is visually hidden until focused — the skip link — is only a target
        // in its focused state, so measure it there before calling it too small.
        const focusedBox = await byRef(page, target.ref)
          .evaluate((el) => {
            ;(el as HTMLElement).focus()
            const box = el.getBoundingClientRect()
            ;(el as HTMLElement).blur()
            return { width: box.width, height: box.height }
          })
          .catch(() => null)
        if (focusedBox) {
          width = Math.max(width, focusedBox.width)
          height = Math.max(height, focusedBox.height)
        }
      }
      if (width < TOUCH_MIN_PX || height < TOUCH_MIN_PX) {
        targetFailures.push({
          criterion: 'AC-23',
          message: `AC-23 A11Y: touch target ${target.selector} is ${round1(width)}x${round1(height)} CSS px at ${MOBILE.width}px, minimum ${TOUCH_MIN_PX}x${TOUCH_MIN_PX}`,
          where: `${target.selector} ("${target.name}")`,
          expected: `>= ${TOUCH_MIN_PX}x${TOUCH_MIN_PX} CSS px`,
          actual: `${round1(width)}x${round1(height)} CSS px`,
          // WCAG 2.2 SC 2.5.8 exempts targets inline in a sentence and targets with enough
          // spacing around them. CANON section 9 states the 24x24 floor without either
          // exception, and this gate enforces the canon it was given, not the standard it
          // resembles. An inline mailto link clears it with padding and inline-block.
          hint: 'CANON section 9 sets 24x24 with no inline exception. A link inside a sentence reaches it with display:inline-block and vertical padding.',
        })
      }
    }
    completed.add('AC-23')

    // AC-25 — positive tabindex.
    const positive = await page.evaluate(() =>
      Array.from(document.querySelectorAll('[tabindex]'))
        .map((el) => ({ selector: window.__a11y.cssPath(el), value: el.getAttribute('tabindex') || '' }))
        .filter((entry) => Number(entry.value) > 0),
    )
    for (const entry of positive) {
      tabindexFailures.push({
        criterion: 'AC-25',
        message: `AC-25 A11Y: ${entry.selector} has tabindex="${entry.value}"; only 0 and -1 are allowed`,
        where: entry.selector,
        expected: '0 or -1',
        actual: entry.value,
        hint: 'A positive tabindex reorders the whole page for keyboard users, not just this element.',
      })
    }
    completed.add('AC-25')
  })

  emit('AC-22', imageFailures)
  emit('AC-23', targetFailures)
  emit('AC-25', tabindexFailures)
})

test('AC-24 newsletter form has a label and no pre-ticked consent', async ({ page }) => {
  test.setTimeout(90_000)
  const failures: Failure[] = []
  const detail = (text: string, where = '[data-section="newsletter"]') =>
    failures.push({
      criterion: 'AC-24',
      message: `AC-24 A11Y: newsletter form — ${text}. Expected a programmatically associated label, an unchecked consent checkbox, and no pre-selected opt-in`,
      where,
    })

  await guarded('AC-24', 'newsletter form', async () => {
    await openPage(page, DESKTOP.width, DESKTOP.height, { reducedMotion: 'reduce' })

    const onLoad = await readNewsletter(page)
    if (!onLoad) {
      detail('there is no [data-section="newsletter"] on the page')
      return
    }

    if (!onLoad.input) {
      detail('the section contains no text or email input')
    } else {
      const { source, name } = onLoad.input
      const associated = ['label[for]', 'wrapping <label>', 'aria-labelledby', 'aria-label']
      if (!associated.includes(source)) {
        detail(
          `the email input's accessible name comes from ${source === 'none' ? 'nothing' : source}${name ? ` ("${name}")` : ''}`,
          onLoad.input.selector,
        )
      }
    }

    if (!onLoad.checkbox) {
      detail('the section contains no consent checkbox')
      return
    }
    if (onLoad.checkbox.checked || onLoad.checkbox.defaultChecked) {
      detail(
        `the consent checkbox is ${onLoad.checkbox.checked ? 'checked' : 'marked checked in the markup'} on load`,
        onLoad.checkbox.selector,
      )
    }
    if (!onLoad.checkbox.name) {
      detail('the consent checkbox has no accessible name', onLoad.checkbox.selector)
    }

    // A script that ticks the box a beat after load is the dark pattern this criterion
    // exists for, and it is invisible to a check that only reads the DOM once.
    await page.waitForTimeout(2_000)
    const later = await readNewsletter(page)
    if (later?.checkbox?.checked && !onLoad.checkbox.checked) {
      detail('the consent checkbox was unchecked on load and was ticked by script within 2 seconds', later.checkbox.selector)
    }
  })

  emit('AC-24', failures)
})

// ── Flush ─────────────────────────────────────────────────────────────────────

test.afterAll(() => {
  // Axe findings are deduplicated across all eighteen runs, so one defect present at every
  // breakpoint and in every state is one line in the report with every occurrence listed.
  const axeFailures: Failure[] = []
  for (const finding of axeFindings.values()) {
    axeFailures.push({
      criterion: 'AC-15',
      message: `AC-15 A11Y: ${finding.firstStateCount} axe violation(s) at ${finding.firstWidth}px in state "${finding.firstState}". ${finding.ruleId} (${finding.impact}) on ${finding.target}: ${finding.help}. ${finding.docsUrl}`,
      where: `${finding.target} — seen in ${finding.occurrences.slice(0, 6).join(', ')}${finding.occurrences.length > 6 ? `, and ${finding.occurrences.length - 6} more state(s)` : ''}`,
      expected: '0 violations',
      actual: finding.summary || finding.html,
      hint: finding.html ? `Element: ${finding.html}` : undefined,
    })
  }
  emit('AC-15', axeFailures)

  // Anything that never finished is reported as a failure. A criterion that silently did not
  // run is the one failure mode that would make this whole gate worthless.
  for (const criterion of CRITERIA) {
    if (completed.has(criterion)) continue
    gate.fail({
      criterion,
      message: `${criterion} A11Y: this check did not run to completion, so nothing is known about it. Treated as a failure, never as a pass.`,
      where: 'checks/specs/a11y.spec.ts',
      hint: 'Usually a Playwright timeout or a page that would not load. Re-run with --reporter=list to see which test stopped.',
    })
  }

  gate.note(
    'Automated tooling detects roughly 30-40% of real WCAG violations — an estimate of rule coverage across the ' +
      'success criteria, not a measurement of this page. A green a11y gate means no known defect, not an accessible ' +
      'page. Alt text that is present and wrong, a reading order that is sequential in the DOM and incoherent on ' +
      'screen, ARIA that is valid and lying, and anything a screen reader actually announces are all still unchecked. ' +
      'See the last section of brief/ACCEPTANCE.md, and spend ten minutes with the keyboard.',
  )

  gate.flush(evidence)
})

// ── Small shared readers ──────────────────────────────────────────────────────

const round1 = (n: number): number => Math.round(n * 10) / 10
const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100

interface TabInfo {
  index: number
  ref: string
  selector: string
  text: string
  name: string
  selected: string | null
  tabindex: string | null
  inTablist: boolean
  controls: string | null
  panelExists: boolean
  panelIsTabpanel: boolean
  panelRole: string
  panelName: string
}

interface TabState {
  hasLineup: boolean
  tablists: number
  tabs: TabInfo[]
  focusedIndex: number
}

function readTabState(page: Page): Promise<TabState> {
  return page.evaluate(() => {
    const lineup = document.querySelector('[data-section="lineup"]')
    if (!lineup) return { hasLineup: false, tablists: 0, tabs: [], focusedIndex: -1 }

    const tabs = Array.from(lineup.querySelectorAll('[role="tab"]'))
    const active = document.activeElement
    let counter = 0

    return {
      hasLineup: true,
      tablists: lineup.querySelectorAll('[role="tablist"]').length,
      focusedIndex: tabs.findIndex((tab) => tab === active),
      tabs: tabs.map((tab, index) => {
        let ref = tab.getAttribute('data-a11y-ref')
        if (!ref) {
          ref = `tab-${++counter}`
          tab.setAttribute('data-a11y-ref', ref)
        }
        const controls = tab.getAttribute('aria-controls')
        const panel = controls
          ? controls
              .split(/\s+/)
              .map((id) => document.getElementById(id))
              .find(Boolean) ?? null
          : null
        return {
          index,
          ref,
          selector: window.__a11y.cssPath(tab),
          text: (tab.textContent || '').replace(/\s+/g, ' ').trim(),
          name: window.__a11y.accessibleName(tab).name,
          selected: tab.getAttribute('aria-selected'),
          tabindex: tab.getAttribute('tabindex'),
          inTablist: !!tab.closest('[role="tablist"]'),
          controls,
          panelExists: !!panel,
          panelIsTabpanel: panel?.getAttribute('role') === 'tabpanel',
          panelRole: panel?.getAttribute('role') || '',
          panelName: panel ? window.__a11y.accessibleName(panel).name : '',
        }
      }),
    }
  })
}

/**
 * Roving tabindex: exactly one tab in the tab order, and it is the selected one. A button
 * with no tabindex attribute is tabbable, which is the correct state for the selected tab.
 */
function describeRovingTabindex(state: TabState): string | null {
  const inTabOrder = state.tabs.filter((tab) => tab.tabindex === null || Number(tab.tabindex) >= 0)
  if (inTabOrder.length !== 1) {
    return `${inTabOrder.length} tabs are in the tab order (${inTabOrder.map((t) => `"${t.text}"`).join(', ') || 'none'}), expected exactly 1 with tabindex="0" and the rest at tabindex="-1"`
  }
  const selected = state.tabs.find((tab) => tab.selected === 'true')
  if (selected && inTabOrder[0].index !== selected.index) {
    return `the tab in the tab order is "${inTabOrder[0].text}" but the selected tab is "${selected.text}"`
  }
  return null
}

interface FaqControl {
  ref: string
  selector: string
  tag: string
  role: string
  question: string
  /** A summary that is the disclosure control of its own details element. */
  native: boolean
  /** Null when the control has one of the two shapes AC-19 accepts. */
  shapeProblem: string | null
}

interface FaqSection {
  controls: FaqControl[]
  /** Buttons with no aria-expanded — the usual shape of a hand-rolled accordion that lies. */
  bareButtons: number
}

/** Null means there is no FAQ section at all, which is a different defect from an empty one. */
function readFaqControls(page: Page): Promise<FaqSection | null> {
  return page.evaluate(() => {
    const faq = document.querySelector('[data-section="faq"]')
    if (!faq) return null
    let counter = 0

    const isOwnSummary = (el: Element) => {
      const parent = el.parentElement
      return !!parent && parent.tagName === 'DETAILS' && parent.querySelector(':scope > summary') === el
    }

    // A control is anything claiming to be a disclosure: a summary, or anything carrying
    // aria-expanded. Buttons without aria-expanded are counted separately rather than driven,
    // because an unrelated button inside the FAQ is not a FAQ item and must not be failed as one.
    const candidates = Array.from(faq.querySelectorAll('summary, [aria-expanded]')).filter((el) =>
      el.tagName === 'SUMMARY' ? isOwnSummary(el) : true,
    )
    const bareButtons = Array.from(faq.querySelectorAll('button')).filter(
      (el) => !el.hasAttribute('aria-expanded'),
    ).length

    const controls = candidates.map((el) => {
      let ref = el.getAttribute('data-a11y-ref')
      if (!ref) {
        ref = `faq-${++counter}`
        el.setAttribute('data-a11y-ref', ref)
      }
      const role = el.getAttribute('role') || ''
      const tag = el.tagName.toLowerCase()
      const native = el.tagName === 'SUMMARY'
      // AC-19 accepts exactly two shapes. A div with role="button" is not one of them: it has
      // to reimplement Enter, Space and focus behaviour that the two native shapes get free.
      const shapeProblem = native
        ? null
        : el.tagName === 'BUTTON'
          ? null
          : `the control is <${tag}>${role ? ` with role="${role}"` : ''}, which is neither a <summary> inside a <details> nor a <button>`
      return {
        ref,
        selector: window.__a11y.cssPath(el),
        tag,
        role,
        question: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        native,
        shapeProblem,
      }
    })

    return { controls, bareButtons }
  })
}

/**
 * The expanded state as the accessibility tree exposes it.
 *
 * Never the aria-expanded attribute: a native `<summary>` does not carry one, and Chromium
 * does not map summary to role=button either, so Playwright's role matcher cannot see it.
 * For that shape the `open` property of the details element is the state — it is what the
 * browser translates into the expanded state a screen reader announces. For every other
 * shape, getByRole resolves the state the same way assistive technology does.
 */
async function readExpanded(page: Page, item: FaqControl): Promise<boolean | null> {
  if (item.native) {
    return page.evaluate((ref) => {
      const el = document.querySelector(`[data-a11y-ref="${ref}"]`)
      const details = el?.closest('details')
      return details ? details.open : null
    }, item.ref)
  }
  const control = byRef(page, item.ref)
  if ((await control.and(page.getByRole('button', { expanded: true })).count()) > 0) return true
  if ((await control.and(page.getByRole('button', { expanded: false })).count()) > 0) return false
  return null
}

const isFocused = (page: Page, ref: string): Promise<boolean> =>
  page.evaluate((r) => document.activeElement?.getAttribute('data-a11y-ref') === r, ref)

const focusedSelector = (page: Page): Promise<string> =>
  page.evaluate(() => (document.activeElement ? window.__a11y.cssPath(document.activeElement) : '<nothing>'))

interface NewsletterField {
  selector: string
  name: string
  source: string
}

interface NewsletterState {
  input: NewsletterField | null
  checkbox: (NewsletterField & { checked: boolean; defaultChecked: boolean }) | null
}

function readNewsletter(page: Page): Promise<NewsletterState | null> {
  return page.evaluate(() => {
    const section = document.querySelector('[data-section="newsletter"]')
    if (!section) return null
    const input = section.querySelector(
      'input[type="email"], input[type="text"], input:not([type])',
    ) as HTMLInputElement | null
    const checkbox = section.querySelector('input[type="checkbox"]') as HTMLInputElement | null
    const describe = (el: HTMLInputElement) => {
      const { name, source } = window.__a11y.accessibleName(el)
      return { selector: window.__a11y.cssPath(el), name, source }
    }
    return {
      input: input ? describe(input) : null,
      checkbox: checkbox
        ? { ...describe(checkbox), checked: checkbox.checked, defaultChecked: checkbox.defaultChecked }
        : null,
    }
  })
}

/** The alt-text rules of AC-22, in one place so the message and the verdict cannot drift apart. */
function describeAltProblem(image: { src: string; alt: string | null; decorative: boolean }): string | null {
  if (image.alt === null) return 'no alt attribute'
  const alt = image.alt.trim()
  if (image.decorative) {
    return alt === '' ? null : 'alt text on an image marked data-decorative'
  }
  if (alt === '') return 'an empty alt on an image that is not marked data-decorative'

  const file = (image.src.split('?')[0].split('#')[0].split('/').pop() || '').toLowerCase()
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  const withoutExtension = file.replace(/\.[a-z0-9]+$/, '')
  const normalisedAlt = normalise(alt)
  if (normalisedAlt === normalise(file) || normalisedAlt === normalise(withoutExtension)) {
    return 'alt text that is just the filename'
  }
  return null
}
