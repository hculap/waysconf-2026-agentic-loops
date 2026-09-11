/**
 * VISUAL gate — AC-34, AC-35, AC-36, AC-37.
 *
 * Reads  the rendered page at 390, 768 and 1440, plus the PNG baselines in design/export/.
 * Writes checks/.results/gates/visual.json, and a diff image per failed comparison in checks/.diff/.
 *
 * Five decisions shape this file, and all five are about a gate that cannot be satisfied by output
 * that is actually wrong.
 *
 * 1. AC-37 is evaluated before anything is compared. A screenshot taken while a webfont is still
 *    swapping, or while the hero photograph is still decoding, differs from the baseline by an amount
 *    that has nothing to do with the page. Reporting that number as a percentage is worse than
 *    reporting nothing, because it looks like evidence. So the preconditions are asserted first, and
 *    a comparison that cannot be trusted is never made. "Images" here means every image the page
 *    paints — CSS background-image, video posters and SVG <image> as well as <img> — because a hero
 *    photograph set as a background is still what the diff is about, and `document.images` cannot see
 *    it. A page with no <img> at all used to satisfy this criterion with "0/0".
 *
 * 2. Every capture happens in a context this file builds itself — viewport, deviceScaleFactor 1,
 *    reduced motion, dark scheme — rather than inheriting playwright.config.ts. That config is shared
 *    with gates that have different needs; a pixel diff must not silently change meaning because
 *    somebody adjusted a default for the a11y spec. For the same reason the gate checks that the
 *    document it photographed is the one in dist/, instead of trusting whatever answers on the port.
 *
 * 3. The hero comparison (AC-35) crops the hero out of the full-page capture instead of taking a
 *    second screenshot of the element. One capture means one page state: an element screenshot
 *    scrolls the element into view, which can re-trigger lazy loading and scroll-linked effects and
 *    produce a hero that never coexisted with the full page it is supposed to be part of.
 *
 * 4. Every breakpoint runs inside its own try/catch, and the gate result is flushed from an afterAll
 *    hook rather than from the test body. An exception at 390 used to abandon 768 and 1440 entirely,
 *    and a Playwright timeout used to leave no result file at all — which checks/run.mjs read as
 *    "this family had nothing to say" rather than "this family never ran".
 *
 * 5. What the gate expects is declared, not discovered. The required baseline set is a constant, so a
 *    deleted PNG reads as "the reference is gone" rather than as "there was nothing to compare".
 *
 * A missing baseline is a SKIP, never a pass and never a failure: nobody has told this gate what
 * correct looks like yet. The comparisons that did run keep their verdicts in the evidence, and
 * checks/lib/report.mjs will not call a run green while a blocking gate is skipped. A missing *page
 * region* when the baseline exists is a failure, because then the design has a hero and the page does
 * not.
 *
 * This gate never calls expect(). It records every defect at every breakpoint and reports them all
 * together, so one iteration of the loop can fix three things instead of one.
 */

import { test, type Browser, type Page } from '@playwright/test'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import sharp from 'sharp'
import { Gate, BREAKPOINTS, ROOT } from '../lib/gate'
import {
  FULL_PAGE_BUDGET_PCT,
  HERO_BUDGET_PCT,
  INCLUDE_AA,
  MATCH_THRESHOLD,
  MANIFEST_NAME,
  compareToBaseline,
  fullPageVerdict,
  heroVerdict,
  manifestVerdict,
  readManifest,
  sha256OfFile,
  type BaselineManifest,
} from '../lib/visual-compare'

const gate = new Gate('visual', 'Visual fidelity', ['AC-34', 'AC-35', 'AC-36', 'AC-37'])

const EXPORT_DIR = join(ROOT, 'design/export')
const DIFF_DIR = join(ROOT, 'checks/.diff')
const DIST_INDEX = join(ROOT, 'dist/index.html')

const HERO_SELECTOR = '[data-section="hero"]'

/**
 * A hero smaller than this is not a hero, it is a decoy.
 *
 * The old guard was "width or height below 1px", which a 1x1 element placed before the real hero
 * clears — and the AC-35 crop then follows the decoy and reports a loud failure about the wrong
 * element. 100 CSS px is far below any hero in design/FIGMA-SPEC.md and far above anything a spacer
 * or a tracking pixel would be.
 */
const MIN_HERO_PX = 100

/** The command that actually records a baseline from this state. See checks/baseline.mjs. */
const BASELINE_COMMAND = 'npm run baseline -- --yes --reason "<why the target moved>"'

/**
 * Baseline filename candidates, most canonical first.
 *
 * brief/ACCEPTANCE.md names design/export/{390,768,1440}.png; design/FIGMA-SPEC.md §8.1 names the same
 * images full-page-{width}.png and the sections section-{slug}-{width}.png. Both spellings are accepted
 * so that a straight Figma export and `npm run baseline` both land somewhere this gate looks, and the
 * message names every path that was tried so nobody has to guess which one was meant.
 */
const fullPageCandidates = (width: number) => [`${width}.png`, `full-page-${width}.png`]
const heroCandidates = (width: number) => [`section-hero-${width}.png`, `hero-${width}.png`]

/**
 * The baseline set this gate expects to exist, declared rather than inferred from what is on disk.
 *
 * Absence has to read as "the reference is gone", not as "there was nothing to compare": deleting one
 * PNG used to remove one breakpoint's verdict and leave the run green.
 */
const REQUIRED_BASELINES = BREAKPOINTS.flatMap((bp) => [
  { criterion: 'AC-34', kind: 'full page', width: bp.width, candidates: fullPageCandidates(bp.width) },
  { criterion: 'AC-35', kind: 'hero', width: bp.width, candidates: heroCandidates(bp.width) },
])

/**
 * Capture conditions, as CSS.
 *
 * MUST stay identical to the copy in checks/baseline.mjs. A baseline captured under different freeze
 * rules is not comparable with anything this gate produces, and the resulting percentage would be a
 * measurement of the two scripts disagreeing rather than of the page being wrong.
 *
 * Durations go to zero rather than play-state going to paused: a finite animation then lands on its
 * final frame — what a visitor sees a moment after load — instead of on its first, which for a
 * fade-in would be an invisible element.
 *
 * Scrollbars are hidden because their width differs between platforms, and a 15px layout shift on one
 * machine and not another is exactly the kind of unreproducible diff that teaches people to distrust
 * the gate.
 */
const CAPTURE_CSS = `
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
    caret-color: transparent !important;
  }
  html {
    scroll-behavior: auto !important;
    scrollbar-width: none !important;
  }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
`

interface ImageryResult {
  total: number
  decoded: number
  failed: string[]
  imgElements: number
  cssAndMedia: number
}

interface Preconditions {
  fontsReady: boolean
  fontStatus: string
  fontFaceErrors: string[]
  imagesDecoded: number
  imagesTotal: number
  imgElements: number
  cssAndMediaSources: number
  animationsFrozen: boolean
  runningAnimations: string[]
  undecodedImages: string[]
  badResponses: string[]
}

interface ClippedOffender {
  selector: string
  right: number
  width: number
  clipper: string
  clipOverflowX: string
}

interface Overflow {
  scrollWidth: number
  clientWidth: number
  offender: { selector: string; right: number; width: number } | null
  rootClipped: ClippedOffender | null
  innerClipped: ClippedOffender | null
  scrollableClipped: number
  rootOverflowX: string
  bodyOverflowX: string
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

/** Relative paths read better in a report than eighty characters of absolute path. */
const rel = (p: string) => relative(ROOT, p).split('\\').join('/')

function resolveBaseline(candidates: string[]): string | null {
  for (const name of candidates) {
    const path = join(EXPORT_DIR, name)
    if (existsSync(path)) return path
  }
  return null
}

/**
 * Every image source the page paints, collected in the browser.
 *
 * document.images sees <img> and nothing else. design/FIGMA-SPEC.md §7.6 fills the hero with a
 * photograph and a scrim, which is an ordinary thing to implement as a CSS background — and a hero
 * whose photograph had not decoded used to satisfy AC-37 and then be compared as though it had.
 */
const COLLECT_IMAGERY = (): string[] => {
  const urls = new Set<string>()

  const addUrlsFrom = (value: string | null | undefined) => {
    if (!value || value === 'none') return
    for (const match of value.matchAll(/url\((['"]?)([^'")]+)\1\)/g)) {
      const raw = match[2]?.trim()
      // data: URIs arrive with the document and cannot 404; there is nothing to wait for.
      if (!raw || raw.startsWith('data:')) continue
      try {
        urls.add(new URL(raw, location.href).href)
      } catch {
        /* an unparseable url() is a stylesheet bug, not an image this gate can wait for */
      }
    }
  }

  for (const el of Array.from(document.querySelectorAll('*'))) {
    const style = getComputedStyle(el)
    addUrlsFrom(style.backgroundImage)
    addUrlsFrom(style.borderImageSource)
    addUrlsFrom(getComputedStyle(el, '::before').backgroundImage)
    addUrlsFrom(getComputedStyle(el, '::after').backgroundImage)

    if (el instanceof HTMLVideoElement && el.poster) addUrlsFrom(`url("${el.poster}")`)
    if (el.tagName.toLowerCase() === 'image') {
      const href = el.getAttribute('href') ?? el.getAttribute('xlink:href')
      if (href) addUrlsFrom(`url("${href}")`)
    }
  }

  return Array.from(urls)
}

/**
 * Decode everything the page paints, and report what refused.
 *
 * decode() is the test rather than a resource-timing lookup because a 200 carrying a broken body
 * still fails to decode, and that is precisely the state that produces a blank rectangle in a
 * screenshot and an unexplained percentage in the report.
 */
const DECODE_IMAGERY = async (urls: string[]): Promise<ImageryResult> => {
  const elementImages = Array.from(document.images)
  const failed: string[] = []

  const elementResults = await Promise.all(
    elementImages.map(async (img) => {
      try {
        await img.decode()
        return true
      } catch {
        failed.push(img.currentSrc || img.src || '(no src)')
        return false
      }
    }),
  )

  const cssResults = await Promise.all(
    urls.map(async (url) => {
      try {
        const probe = new Image()
        probe.src = url
        await Promise.race([
          probe.decode(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('decode timed out')), 10_000)),
        ])
        return true
      } catch {
        failed.push(url)
        return false
      }
    }),
  )

  const decoded = elementResults.filter(Boolean).length + cssResults.filter(Boolean).length

  return {
    total: elementImages.length + urls.length,
    decoded,
    failed: failed.slice(0, 5),
    imgElements: elementImages.length,
    cssAndMedia: urls.length,
  }
}

/**
 * Put the page into the one state this gate is allowed to photograph.
 *
 * The scroll sweep exists because lazy-loaded images below the fold are not guaranteed to be fetched
 * by a full-page capture: Chromium grabs the whole document in one shot without ever laying out the
 * lower viewports, so a `loading="lazy"` image can end up as a blank rectangle in the screenshot and a
 * 4% diff in the report. Scrolling to the bottom and back forces every one of them to start, and the
 * wait afterwards lets them finish. Animations are frozen *after* the sweep, because scroll-linked and
 * IntersectionObserver-driven animations only start once their element has been on screen.
 */
async function prepareForCapture(page: Page): Promise<void> {
  await page.addStyleTag({ content: CAPTURE_CSS })

  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight)
    const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await frame()
    }
    window.scrollTo(0, 0)
    await frame()
  })

  // Bounded: a stalled image is a finding for AC-37, not a reason to hang the run until the timeout.
  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 10_000 })
    .catch(() => undefined)

  // Backgrounds, posters and SVG images are waited for here too. Waiting only on document.images is
  // how a hero photograph declared in CSS ends up half-painted in a capture nobody questions.
  const imagerySources = await page.evaluate(COLLECT_IMAGERY)
  await page.evaluate(DECODE_IMAGERY, imagerySources).catch(() => undefined)

  await page.evaluate(async () => {
    // CSS cannot reach animations started through element.animate(). Infinite ones are pinned to their
    // first frame — the same choice Playwright's animations: 'disabled' makes — and finite ones are run
    // to their end state, which is where the page settles for a visitor.
    for (const animation of document.getAnimations()) {
      const timing = animation.effect?.getComputedTiming()
      if (timing && timing.iterations === Infinity) {
        animation.currentTime = 0
        animation.pause()
      } else {
        try {
          animation.finish()
        } catch {
          animation.pause()
        }
      }
    }

    // A stray focus ring is a real difference against a baseline captured with nothing focused.
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  })
}

/** AC-37. Reads, never fixes: this is the evidence that the screenshot about to be taken means something. */
async function readPreconditions(page: Page, badResponses: string[]): Promise<Preconditions> {
  const fontsReady = await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
    ]),
  )

  const imagerySources = await page.evaluate(COLLECT_IMAGERY)
  const imagery = await page.evaluate(DECODE_IMAGERY, imagerySources)

  const rest = await page.evaluate(() => {
    // document.fonts.status reaches "loaded" once nothing is pending, including when a @font-face file
    // 404s. The aggregate is therefore not evidence that the fonts arrived; the individual faces are.
    const fontFaceErrors = Array.from(document.fonts)
      .filter((face) => face.status === 'error')
      .map((face) => `${face.family} ${face.style} ${face.weight}`)
      .slice(0, 5)

    const running = document
      .getAnimations()
      .filter((a) => a.playState === 'running')
      .map((a) => {
        const target = (a.effect as KeyframeEffect | null)?.target
        const name = (a as unknown as { animationName?: string }).animationName ?? a.constructor.name
        const tag = target instanceof Element ? target.tagName.toLowerCase() : 'unknown'
        return `${name} on <${tag}>`
      })
      .slice(0, 5)

    return {
      fontStatus: document.fonts.status as string,
      fontFaceErrors,
      runningAnimations: running,
    }
  })

  return {
    fontsReady: fontsReady && rest.fontStatus === 'loaded' && rest.fontFaceErrors.length === 0,
    fontStatus: rest.fontStatus,
    fontFaceErrors: rest.fontFaceErrors,
    imagesDecoded: imagery.decoded,
    imagesTotal: imagery.total,
    imgElements: imagery.imgElements,
    cssAndMediaSources: imagery.cssAndMedia,
    animationsFrozen: rest.runningAnimations.length === 0,
    runningAnimations: rest.runningAnimations,
    undecodedImages: imagery.failed,
    badResponses: badResponses.slice(0, 5),
  }
}

/**
 * AC-36. Two independent signals, because one of them can be silenced without fixing anything.
 *
 * `scrollWidth > clientWidth` is the ground truth for a page that scrolls sideways. It is also
 * answered by `html, body { overflow-x: hidden }`, which does not move the content back on screen —
 * it stops the browser from admitting the content is off it. So the element scan is a verdict of its
 * own for anything clipped at the document root, not merely decoration for the message.
 *
 * Clipping *below* the root is reported as a note instead. A marquee 3000px wide inside its own
 * `overflow: hidden` is the design (src/sections/Ticker.astro), and a horizontally scrollable table
 * the reader can actually reach is a legitimate responsive pattern. What that leaves uncovered is
 * stated in the note itself: this gate cannot tell a designed clip from a hidden layout bug below the
 * document root.
 */
async function measureOverflow(page: Page): Promise<Overflow> {
  return page.evaluate(() => {
    const root = document.documentElement
    const clientWidth = root.clientWidth

    const describe = (el: Element): string => {
      let selector = el.tagName.toLowerCase()
      if (el.id) selector += `#${el.id}`
      const classes = (el.getAttribute('class') ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 3)
      if (classes.length) selector += `.${classes.join('.')}`
      const section = el.closest('[data-section]')?.getAttribute('data-section')
      return section ? `[data-section="${section}"] ${selector}` : selector
    }

    const nearestClipper = (el: Element) => {
      let node = el.parentElement
      while (node) {
        const style = getComputedStyle(node)
        if (style.overflowX !== 'visible') {
          return {
            selector: describe(node),
            overflowX: style.overflowX,
            // A scroll container the reader can reach is not a hiding place: the content is still
            // available. A gate that failed on it would be failing on a responsive table.
            scrollable:
              (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
              node.scrollWidth > node.clientWidth + 1,
            isRoot: node === root || node === document.body,
          }
        }
        node = node.parentElement
      }
      return null
    }

    type Offender = { selector: string; right: number; width: number }
    type Clipped = Offender & { clipper: string; clipOverflowX: string }

    let offender: Offender | null = null
    let rootClipped: Clipped | null = null
    let innerClipped: Clipped | null = null
    let scrollableClipped = 0

    // html and body are in the scan: `body { min-width: 1200px }` at 390 is a real cause, and a scan
    // over `body *` alone could not name it, so the message pointed away from the defect.
    const targets: Element[] = [root, document.body, ...Array.from(document.querySelectorAll('body *'))]

    for (const el of targets) {
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      const right = rect.right + window.scrollX
      if (right <= clientWidth + 1) continue

      const entry: Offender = {
        selector: describe(el),
        right: Math.round(right),
        width: Math.round(rect.width),
      }
      const clip = nearestClipper(el)

      if (!clip) {
        if (!offender || right > offender.right) offender = entry
        continue
      }
      if (clip.scrollable) {
        scrollableClipped++
        continue
      }

      const clipped: Clipped = { ...entry, clipper: clip.selector, clipOverflowX: clip.overflowX }
      if (clip.isRoot) {
        if (!rootClipped || right > rootClipped.right) rootClipped = clipped
      } else if (!innerClipped || right > innerClipped.right) {
        innerClipped = clipped
      }
    }

    return {
      scrollWidth: root.scrollWidth,
      clientWidth,
      offender,
      rootClipped,
      innerClipped,
      scrollableClipped,
      rootOverflowX: getComputedStyle(root).overflowX,
      bodyOverflowX: getComputedStyle(document.body).overflowX,
    }
  })
}

/** Page coordinates of every match, read with the page at scroll origin so they match the capture. */
async function boxesOf(page: Page, selector: string): Promise<Box[]> {
  return page.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll(sel)).map((el) => {
        const rect = el.getBoundingClientRect()
        return {
          x: rect.x + window.scrollX,
          y: rect.y + window.scrollY,
          width: rect.width,
          height: rect.height,
        }
      }),
    selector,
  )
}

const sameBox = (a: Box, b: Box) =>
  Math.abs(a.x - b.x) <= 1 &&
  Math.abs(a.y - b.y) <= 1 &&
  Math.abs(a.width - b.width) <= 1 &&
  Math.abs(a.height - b.height) <= 1

const describeBox = (b: Box) =>
  `${Math.round(b.width)}x${Math.round(b.height)} at (${Math.round(b.x)}, ${Math.round(b.y)})`

function describeOffender(overflow: Overflow): string {
  if (overflow.offender) return `${overflow.offender.selector} extends to ${overflow.offender.right}px`
  if (overflow.rootClipped) {
    return `${overflow.rootClipped.selector} extends to ${overflow.rootClipped.right}px, clipped by ${overflow.rootClipped.clipper}`
  }
  if (overflow.innerClipped) {
    return (
      `no unclipped element extends past the viewport; the widest clipped one is ` +
      `${overflow.innerClipped.selector} inside ${overflow.innerClipped.clipper} ` +
      `(overflow-x: ${overflow.innerClipped.clipOverflowX})`
    )
  }
  return 'no single element extends past the viewport; look for a margin, a transform or a negative offset'
}

/**
 * One capture of the whole page, with strip stitching only as a fallback.
 *
 * Chromium captures a 13 378px page at `scale: 'css'` on this machine — measured, not assumed — so a
 * single screenshot is the normal path and must stay the normal path: every strip below is taken at a
 * resized viewport, which changes vh-based sizing and sticky positioning, and checks/baseline.mjs
 * records its baselines in one shot. A stitched capture is therefore not strictly comparable with the
 * baseline it is diffed against. It exists because a gate that throws reports nothing at all, and a
 * diff carrying a stated caveat beats no verdict; the caller turns `stitched` into a note.
 */
async function captureFullPage(
  page: Page,
  bp: (typeof BREAKPOINTS)[number],
): Promise<{ buffer: Buffer; stitched: boolean }> {
  const shotOptions = { animations: 'disabled', caret: 'hide', scale: 'css', type: 'png' } as const

  try {
    return { buffer: await page.screenshot({ fullPage: true, ...shotOptions }), stitched: false }
  } catch (err) {
    gate.note(
      `the single full-page capture at ${bp.width}px failed (${String(err).slice(0, 160)}), so the page was ` +
        `photographed in strips and stitched. A stitched capture is taken at resized viewports and is not ` +
        `strictly comparable with a one-shot baseline.`,
    )
  }

  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  const stripHeight = 9_000
  const strips: { input: Buffer; top: number }[] = []

  try {
    for (let top = 0; top < total; top += stripHeight) {
      const height = Math.min(stripHeight, total - top)
      await page.setViewportSize({ width: bp.width, height })
      await page.evaluate((y) => window.scrollTo(0, y), top)
      // One beat for the scroll to settle. Sticky headers re-paint on scroll, and a capture taken
      // mid-paint puts a half-drawn nav in the middle of the stitched image.
      await page.waitForTimeout(120)
      strips.push({
        input: await page.screenshot({ clip: { x: 0, y: 0, width: bp.width, height }, ...shotOptions }),
        top,
      })
    }
  } finally {
    // The viewport has to go back, or everything measured after this point — the hero box, the
    // overflow numbers in a re-read — describes a page at a size no visitor ever sees.
    await page.setViewportSize({ width: bp.width, height: bp.height })
    await page.evaluate(() => window.scrollTo(0, 0))
  }

  const buffer = await sharp({
    create: { width: bp.width, height: total, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(strips.map((s) => ({ input: s.input, top: s.top, left: 0 })))
    .png()
    .toBuffer()

  return { buffer, stitched: true }
}

// ── Gate-wide state, so that afterAll can flush whatever the run managed to measure ───────────────

const evidence: Record<string, unknown> = {}
const missingBaselines: string[] = []

/**
 * The result is written from afterAll, not from the test body.
 *
 * A Playwright timeout unwinds the test without running the body's own `finally`, and a gate that
 * writes no file at all is not read by checks/run.mjs as a failure — the family simply disappears
 * from the report and the run stays green. A gate passing by default because it could not run is the
 * one thing a verifier may not do.
 */
test.afterAll(() => {
  evidence.requiredBaselines = REQUIRED_BASELINES.map(
    (r) => `design/export/${r.candidates[0]} (${r.criterion}, ${r.kind} @ ${r.width}px)`,
  )
  evidence.missingBaselines = missingBaselines
  evidence.budgets = {
    fullPagePct: FULL_PAGE_BUDGET_PCT,
    heroPct: HERO_BUDGET_PCT,
    matchThreshold: MATCH_THRESHOLD,
    includeAntialiasedPixels: INCLUDE_AA,
  }
  evidence.diffDir = rel(DIFF_DIR)

  if (missingBaselines.length) {
    const reason =
      `${missingBaselines.length} of ${REQUIRED_BASELINES.length} required baseline image(s) are missing from ` +
      `design/export/ (${missingBaselines.join('; ')}), so those comparisons were never made. The verdicts that ` +
      `were reached are in this gate's evidence, per breakpoint. Recording a baseline is a person's decision, ` +
      `not the loop's: ${BASELINE_COMMAND}`
    if (gate.failures.length === 0) {
      // No baseline means nobody has said what correct looks like yet. Calling that a pass would let an
      // unverified page through under a green tick, which is the one thing a verifier may not do — and
      // checks/lib/report.mjs will not report a run as ok while a blocking gate is skipped.
      gate.skip(reason)
    } else {
      gate.note(reason)
    }
  }

  gate.flush(evidence)
})

// ── The gate ──────────────────────────────────────────────────────────────────

/** One test, so that one worker owns the gate and flushes it exactly once even under fullyParallel. */
test('visual fidelity at 390, 768 and 1440', async ({ browser, baseURL }) => {
  // Three full-page captures of a long page, each decoded to raw RGBA and diffed, is not a fast test.
  // The budget is generous because a timeout costs the whole family's verdict.
  test.setTimeout(240_000)

  // Stale diffs are misleading evidence: a participant opens a PNG from a previous run and spends ten
  // minutes arguing with a failure that no longer exists.
  rmSync(DIFF_DIR, { recursive: true, force: true })
  mkdirSync(DIFF_DIR, { recursive: true })

  const url = baseURL ?? process.env.CHECK_BASE_URL ?? 'http://localhost:4321'

  const manifest = readManifest(EXPORT_DIR)
  evidence.baselineManifest = manifest
    ? {
        generatedAt: manifest.generatedAt,
        reason: manifest.reason,
        files: Object.keys(manifest.baselines ?? {}).length,
      }
    : null
  if (!manifest) {
    gate.note(
      `design/export/${MANIFEST_NAME} does not exist, so the baselines carry no recorded reason and this gate ` +
        `cannot tell a designer's export from a silent re-baseline. The sha256 of every baseline it read is in ` +
        `this gate's evidence, which is what makes a moved target visible in a diff.`,
    )
  }

  await assertServedPageIsTheBuild(url)

  for (const bp of BREAKPOINTS) {
    const record: Record<string, unknown> = {}
    evidence[String(bp.width)] = record
    try {
      await test.step(`${bp.width}px`, () => measureBreakpoint(browser, url, bp, record, manifest))
    } catch (err) {
      // One breakpoint that threw costs one breakpoint. It used to cost the two after it as well: the
      // loop was handed "the gate did not finish" instead of three widths' worth of repair work.
      record.error = String(err).slice(0, 400)
      gate.fail({
        criterion: 'AC-34',
        message:
          `AC-34 VISUAL: the gate could not finish at ${bp.width}px — ${String(err).slice(0, 300)}. ` +
          `AC-34 and AC-35 have no verdict at this width.`,
        where: `${bp.width}px`,
        hint: 'This is a failure of the check itself, not necessarily of the page. Fix the gate, then re-run.',
      })
    }
  }
})

/**
 * AC-37, the precondition nobody thinks to assert: that the thing being photographed is the thing
 * that was built.
 *
 * playwright.config.ts reuses whatever already answers on the port, so a forgotten dev server — or
 * anything else listening on :4321 — is photographed, diffed and reported as this build. That is not
 * hypothetical: it happened on the machine this check was written on, and the page that came back
 * belonged to a different project entirely.
 */
async function assertServedPageIsTheBuild(url: string): Promise<void> {
  let host = ''
  try {
    host = new URL(url).hostname
  } catch {
    /* handled by the note below */
  }
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '::1'

  if (!isLocal || !existsSync(DIST_INDEX)) {
    gate.note(
      `page identity was not checked: ${isLocal ? 'dist/index.html does not exist' : `${url} is not a local preview`}. ` +
        `The gate compared whatever that URL served. AC-59 is the criterion that ties a deployed page to dist/.`,
    )
    return
  }

  const localSha = createHash('sha256').update(readFileSync(DIST_INDEX)).digest('hex')
  let servedSha: string
  try {
    const response = await fetch(url, { redirect: 'follow' })
    servedSha = createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex')
  } catch (err) {
    gate.note(`page identity was not checked: fetching ${url} threw ${String(err).slice(0, 120)}`)
    return
  }

  evidence.pageIdentity = { url, servedSha, localSha, match: servedSha === localSha }
  if (servedSha === localSha) return

  gate.fail({
    criterion: 'AC-37',
    message:
      `AC-37 VISUAL: capture preconditions not met — the document served at ${url} is not dist/index.html ` +
      `(served sha256 ${servedSha.slice(0, 12)}, dist ${localSha.slice(0, 12)}). Every comparison in this gate ` +
      `was made against a page this build did not produce.`,
    where: url,
    expected: `sha256 ${localSha.slice(0, 12)} (dist/index.html)`,
    actual: `sha256 ${servedSha.slice(0, 12)}`,
    hint: 'Something else is answering on that port, or dist/ was rebuilt after the server started. Stop it, rebuild, re-run.',
  })
}

/** Everything measured at one width. Throws only on a genuine gate fault; the caller records that. */
async function measureBreakpoint(
  browser: Browser,
  url: string,
  bp: (typeof BREAKPOINTS)[number],
  record: Record<string, unknown>,
  manifest: BaselineManifest | null,
): Promise<void> {
  const status: Record<string, string> = {}
  record.status = status

  const context = await browser.newContext({
    baseURL: url,
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    forcedColors: 'none',
  })
  const page = await context.newPage()

  /**
   * Same-origin requests that failed during load.
   *
   * checks/baseline.mjs has treated this as fatal since the day a content-hashed stylesheet 404'd
   * mid-capture and a picture of an unstyled page was written as the definition of correct. This gate
   * had no such listener, so it would have compared against that picture and reported a percentage as
   * though the difference were about the design.
   */
  const badResponses: string[] = []
  const origin = (() => {
    try {
      return new URL(url).origin
    } catch {
      return ''
    }
  })()
  const sameOrigin = (candidate: string) => !origin || candidate.startsWith(origin)
  page.on('response', (response) => {
    if (response.status() >= 400 && sameOrigin(response.url())) {
      badResponses.push(`${response.status()} ${response.url()}`)
    }
  })
  page.on('requestfailed', (request) => {
    if (sameOrigin(request.url())) {
      badResponses.push(`failed ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
    }
  })

  try {
    await page.goto('/', { waitUntil: 'load' })
    // networkidle is a heuristic, so it is bounded and its failure is not fatal: AC-37 below is the
    // real assertion about whether the page had finished arriving.
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined)
    await prepareForCapture(page)

    // ── AC-37 ──────────────────────────────────────────────────────────────────
    const pre = await readPreconditions(page, badResponses)
    record.preconditions = pre
    const preconditionsHold =
      pre.fontsReady &&
      pre.imagesDecoded === pre.imagesTotal &&
      pre.animationsFrozen &&
      pre.badResponses.length === 0

    if (!preconditionsHold) {
      status['AC-37'] = 'fail'
      gate.fail({
        criterion: 'AC-37',
        message:
          `AC-37 VISUAL: capture preconditions not met at ${bp.width}px — fonts ready ${pre.fontsReady}, ` +
          `images decoded ${pre.imagesDecoded}/${pre.imagesTotal}, animations frozen ${pre.animationsFrozen}` +
          (pre.badResponses.length ? `, ${pre.badResponses.length} failed request(s) during load` : '') +
          `. No comparison was made.`,
        where: `${bp.width}px`,
        expected: 'fonts ready true, every image decoded, animations frozen true, no failed same-origin request',
        actual:
          `fonts ${pre.fontStatus}${pre.fontFaceErrors.length ? ` (${pre.fontFaceErrors.length} face(s) in error)` : ''}, ` +
          `${pre.imagesDecoded}/${pre.imagesTotal} images decoded ` +
          `(${pre.imgElements} <img>, ${pre.cssAndMediaSources} CSS/poster/SVG source(s)), ` +
          `${pre.runningAnimations.length} animation(s) still running, ${pre.badResponses.length} bad response(s)`,
        hint: [
          pre.undecodedImages.length ? `Did not decode: ${pre.undecodedImages.join(', ')}.` : '',
          pre.fontFaceErrors.length ? `@font-face in error: ${pre.fontFaceErrors.join(', ')}.` : '',
          pre.runningAnimations.length ? `Still running: ${pre.runningAnimations.join(', ')}.` : '',
          pre.badResponses.length ? `Failed during load: ${pre.badResponses.join(', ')}.` : '',
          !pre.fontsReady && !pre.fontFaceErrors.length
            ? 'document.fonts.ready did not resolve within 5s — check that every @font-face actually loads.'
            : '',
        ]
          .filter(Boolean)
          .join(' '),
      })
    } else {
      status['AC-37'] = 'pass'
    }

    // A page with no imagery at all satisfies "every image decoded" vacuously. That is not AC-37's
    // question — whether the page should carry a photograph is CONTENT's (AC-38 matches the §13 alt
    // strings, AC-22 reads them) — but it must not be reported as though it were evidence.
    if (pre.imagesTotal === 0) {
      gate.note(
        `AC-37 at ${bp.width}px: the page paints no images at all, so "images decoded 0/0" holds vacuously. ` +
          `CANON §4 gives the hero a photograph; AC-38 and AC-22 are the criteria that require it to exist.`,
      )
    }

    // ── AC-36 ──────────────────────────────────────────────────────────────────
    // A layout measurement, not a pixel comparison, so it runs whether or not AC-37 held: knowing the
    // page is 40px too wide is useful even when the fonts never loaded.
    const overflow = await measureOverflow(page)
    record.overflow = overflow

    if (overflow.scrollWidth > overflow.clientWidth + 1) {
      status['AC-36'] = 'fail'
      gate.fail({
        criterion: 'AC-36',
        message:
          `AC-36 VISUAL: horizontal overflow at ${bp.width}px — scrollWidth ${overflow.scrollWidth}px ` +
          `exceeds viewport ${overflow.clientWidth}px. Widest offender: ${describeOffender(overflow)}`,
        where: overflow.offender?.selector ?? `${bp.width}px`,
        expected: `scrollWidth <= ${overflow.clientWidth + 1}px`,
        actual: `${overflow.scrollWidth}px`,
      })
    } else if (overflow.rootClipped) {
      // scrollWidth is quiet because the root clips, not because the content fits. This is the standard
      // fake fix for mobile overflow, and it leaves the content cut off and unreachable.
      status['AC-36'] = 'fail'
      gate.fail({
        criterion: 'AC-36',
        message:
          `AC-36 VISUAL: horizontal overflow at ${bp.width}px — ${overflow.rootClipped.selector} extends to ` +
          `${overflow.rootClipped.right}px past the ${overflow.clientWidth}px viewport, and ` +
          `${overflow.rootClipped.clipper} hides it with overflow-x: ${overflow.rootClipped.clipOverflowX}, so ` +
          `scrollWidth reports ${overflow.scrollWidth}px. Clipping at the document root removes the measurement, ` +
          `not the overflow.`,
        where: overflow.rootClipped.selector,
        expected: `every right edge within ${overflow.clientWidth + 1}px, without clipping at html or body`,
        actual: `${overflow.rootClipped.right}px, clipped by ${overflow.rootClipped.clipper}`,
        hint: 'Fix the element that is too wide, then take the overflow-x off html/body.',
      })
    } else {
      status['AC-36'] = 'pass'
      if (overflow.innerClipped) {
        // Recorded even though it passes: the gate saw content beyond the viewport and decided not to
        // fail on it, and that decision belongs in the report rather than only in this file.
        gate.note(
          `AC-36 at ${bp.width}px: ${overflow.innerClipped.selector} extends to ${overflow.innerClipped.right}px, ` +
            `clipped by ${overflow.innerClipped.clipper} (overflow-x: ${overflow.innerClipped.clipOverflowX}). ` +
            `Clipping below the document root is treated as design — a marquee is the intended case — so this is ` +
            `not a failure. AC-36 cannot tell a designed clip from a hidden layout bug below the root; a person has to.`,
        )
      }
      if (overflow.scrollableClipped) {
        gate.note(
          `AC-36 at ${bp.width}px: ${overflow.scrollableClipped} element(s) overflow inside a horizontal scroll ` +
            `container the reader can reach, which is a responsive pattern rather than a defect.`,
        )
      }
    }

    // AC-37's whole point: a comparison is not attempted against a capture known to be bad.
    if (!preconditionsHold) {
      status['AC-34'] = 'not run'
      status['AC-35'] = 'not run'
      record.fullPage = { status: 'not run', reason: 'AC-37 did not hold' }
      record.hero = { status: 'not run', reason: 'AC-37 did not hold' }
      return
    }

    // The hero box is read BEFORE the capture and again after it. The crop indexes into pixels taken
    // at one moment, and coordinates read at another moment can point somewhere else entirely.
    const heroBoxesBefore = await boxesOf(page, HERO_SELECTOR)

    // ── AC-34 ──────────────────────────────────────────────────────────────────
    const { buffer: fullPageShot, stitched } = await captureFullPage(page, bp)
    record.stitchedCapture = stitched

    await compareFullPage(bp, fullPageShot, record, status, manifest)
    await compareHero(page, bp, fullPageShot, heroBoxesBefore, record, status, manifest)
  } finally {
    // Closing a context is cleanup, not measurement: it can fail over a trace file that another
    // process removed, and that must not turn into a verdict about the page. It is recorded rather
    // than swallowed, because a gate that hides things it saw is the wrong kind of gate.
    await context.close().catch((err: unknown) => {
      gate.note(`closing the ${bp.width}px context threw: ${String(err).slice(0, 200)}`)
    })
  }
}

/** AC-34 at one width. */
async function compareFullPage(
  bp: (typeof BREAKPOINTS)[number],
  shot: Buffer,
  record: Record<string, unknown>,
  status: Record<string, string>,
  manifest: BaselineManifest | null,
): Promise<void> {
  const baseline = resolveBaseline(fullPageCandidates(bp.width))
  if (!baseline) {
    const tried = fullPageCandidates(bp.width)
      .map((n) => `design/export/${n}`)
      .join(' or ')
    missingBaselines.push(tried)
    status['AC-34'] = 'skip'
    record.fullPage = { status: 'skipped', reason: `no baseline at ${tried}` }
    gate.note(
      `AC-34 not verified at ${bp.width}px: no baseline at ${tried}. Recording one is a person's decision, ` +
        `not the loop's: ${BASELINE_COMMAND}`,
    )
    return
  }

  const fileName = baseline.split('/').pop() ?? ''
  const sha = sha256OfFile(baseline)
  const tampered = manifestVerdict({
    criterion: 'AC-34',
    baselineRel: rel(baseline),
    fileName,
    manifest,
    actualSha: sha,
  })
  if (tampered) gate.fail(tampered)

  const diffPath = join(DIFF_DIR, `${bp.width}-diff.png`)
  const cmp = await compareToBaseline({ actual: shot, baselinePath: baseline, diffPath })
  const verdict = fullPageVerdict({
    viewport: bp.width,
    baselineRel: rel(baseline),
    diffRel: rel(diffPath),
    cmp,
  })

  record.fullPage = {
    baseline: rel(baseline),
    baselineSha256: sha,
    ...cmp,
    diffPath: rel(diffPath),
    budgetPct: FULL_PAGE_BUDGET_PCT,
    over: verdict !== null,
  }

  if (verdict) {
    status['AC-34'] = 'fail'
    gate.fail(verdict)
  } else {
    status['AC-34'] = tampered ? 'fail' : 'pass'
    // Nothing is left behind for a pass, so a diff image that exists is always one worth opening.
    rmSync(diffPath, { force: true })
  }
}

/** AC-35 at one width, cropped out of the full-page capture. */
async function compareHero(
  page: Page,
  bp: (typeof BREAKPOINTS)[number],
  shot: Buffer,
  boxesBefore: Box[],
  record: Record<string, unknown>,
  status: Record<string, string>,
  manifest: BaselineManifest | null,
): Promise<void> {
  const baseline = resolveBaseline(heroCandidates(bp.width))
  if (!baseline) {
    const tried = heroCandidates(bp.width)
      .map((n) => `design/export/${n}`)
      .join(' or ')
    missingBaselines.push(tried)
    status['AC-35'] = 'skip'
    record.hero = { status: 'skipped', reason: `no baseline at ${tried}` }
    gate.note(
      `AC-35 not verified at ${bp.width}px: no baseline at ${tried}. A hero baseline is a section crop, which ` +
        `only a full re-capture produces: ${BASELINE_COMMAND}`,
    )
    return
  }

  const fail = (failure: Parameters<typeof gate.fail>[0], reason: string) => {
    status['AC-35'] = 'fail'
    record.hero = { status: 'failed', reason }
    gate.fail(failure)
  }

  // The baseline exists, so the design has a hero. A page without one — or with several — is a defect
  // rather than a setup problem, and it is reported here instead of being quietly skipped.
  if (boxesBefore.length > 1) {
    fail(
      {
        criterion: 'AC-35',
        message:
          `AC-35 VISUAL: hero at ${bp.width}px is ambiguous — ${HERO_SELECTOR} matches ${boxesBefore.length} ` +
          `elements (${boxesBefore.map(describeBox).join('; ')}). The crop would follow whichever comes first in ` +
          `the DOM. No comparison was made.`,
        where: `${HERO_SELECTOR} at ${bp.width}px`,
        expected: `exactly one element matching ${HERO_SELECTOR}`,
        actual: `${boxesBefore.length} elements`,
      },
      'more than one hero',
    )
    return
  }

  const boxBefore = boxesBefore[0]
  if (!boxBefore || boxBefore.width < MIN_HERO_PX || boxBefore.height < MIN_HERO_PX) {
    const observed = boxBefore ? describeBox(boxBefore) : 'no match'
    fail(
      {
        criterion: 'AC-35',
        message:
          `AC-35 VISUAL: hero at ${bp.width}px could not be captured — ${HERO_SELECTOR} ` +
          `${boxBefore ? `is ${observed}, below the ${MIN_HERO_PX}x${MIN_HERO_PX} minimum` : 'is not in the DOM'}, ` +
          `but ${rel(baseline)} exists. No comparison was made.`,
        where: `${HERO_SELECTOR} at ${bp.width}px`,
        expected: `a rendered element matching ${HERO_SELECTOR}, at least ${MIN_HERO_PX}x${MIN_HERO_PX} CSS px`,
        actual: observed,
      },
      'hero region not renderable',
    )
    return
  }

  const boxesAfter = await boxesOf(page, HERO_SELECTOR)
  const boxAfter = boxesAfter[0]
  if (!boxAfter || boxesAfter.length !== boxesBefore.length || !sameBox(boxBefore, boxAfter)) {
    fail(
      {
        criterion: 'AC-35',
        message:
          `AC-35 VISUAL: hero at ${bp.width}px moved while the page was being photographed — ` +
          `${describeBox(boxBefore)} before the capture, ${boxAfter ? describeBox(boxAfter) : 'no match'} after. ` +
          `Cropping with either set of coordinates would index pixels from the other state. No comparison was made.`,
        where: `${HERO_SELECTOR} at ${bp.width}px`,
        expected: 'a hero box unchanged across the capture',
        actual: `${describeBox(boxBefore)} then ${boxAfter ? describeBox(boxAfter) : 'no match'}`,
        hint: 'Something was still loading or laying out. AC-37 covers the usual causes: a late image, a late font.',
      },
      'hero box changed during capture',
    )
    return
  }

  const shotMeta = await sharp(shot).metadata()
  const shotWidth = shotMeta.width ?? 0
  const shotHeight = shotMeta.height ?? 0
  const left = Math.max(0, Math.round(boxBefore.x))
  const top = Math.max(0, Math.round(boxBefore.y))
  const requestedWidth = Math.round(boxBefore.width)
  const requestedHeight = Math.round(boxBefore.height)
  const cropWidth = Math.max(1, Math.min(requestedWidth, shotWidth - left))
  const cropHeight = Math.max(1, Math.min(requestedHeight, shotHeight - top))
  // Silent clamping made a truncated region look like a whole one. If the hero does not fit inside the
  // capture, the comparison covers part of it, and the report has to say so.
  const clamped = cropWidth !== requestedWidth || cropHeight !== requestedHeight

  const heroShot = await sharp(shot).extract({ left, top, width: cropWidth, height: cropHeight }).png().toBuffer()

  const fileName = baseline.split('/').pop() ?? ''
  const sha = sha256OfFile(baseline)
  const tampered = manifestVerdict({
    criterion: 'AC-35',
    baselineRel: rel(baseline),
    fileName,
    manifest,
    actualSha: sha,
  })
  if (tampered) gate.fail(tampered)

  const diffPath = join(DIFF_DIR, `${bp.width}-hero-diff.png`)
  const cmp = await compareToBaseline({ actual: heroShot, baselinePath: baseline, diffPath })
  const verdict = heroVerdict({
    viewport: bp.width,
    selector: HERO_SELECTOR,
    baselineRel: rel(baseline),
    diffRel: rel(diffPath),
    cmp,
  })

  record.hero = {
    baseline: rel(baseline),
    baselineSha256: sha,
    ...cmp,
    diffPath: rel(diffPath),
    budgetPct: HERO_BUDGET_PCT,
    over: verdict !== null,
    crop: { left, top, requestedWidth, requestedHeight, cropWidth, cropHeight, clamped },
  }

  if (clamped) {
    gate.note(
      `AC-35 at ${bp.width}px: the hero box is ${requestedWidth}x${requestedHeight} but only ` +
        `${cropWidth}x${cropHeight} of it lies inside the ${shotWidth}x${shotHeight} capture, so the comparison ` +
        `covers part of the region.`,
    )
  }

  if (verdict) {
    status['AC-35'] = 'fail'
    gate.fail(
      clamped
        ? {
            ...verdict,
            hint: `${verdict.hint ?? ''} The crop was clamped to the capture, so part of the hero was not compared.`.trim(),
          }
        : verdict,
    )
  } else {
    status['AC-35'] = tampered ? 'fail' : 'pass'
    rmSync(diffPath, { force: true })
  }
}
