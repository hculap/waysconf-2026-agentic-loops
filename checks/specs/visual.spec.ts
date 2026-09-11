/**
 * VISUAL gate — AC-34, AC-35, AC-36, AC-37.
 *
 * Reads  the rendered page at 390, 768 and 1440, plus the PNG baselines in design/export/.
 * Writes checks/.results/gates/visual.json, and a diff image per failed comparison in checks/.diff/.
 *
 * Three decisions shape this file, and all three are about determinism rather than strictness.
 *
 * 1. AC-37 is evaluated before anything is compared. A screenshot taken while a webfont is still
 *    swapping, or while a hero photograph is still decoding, differs from the baseline by an amount
 *    that has nothing to do with the page. Reporting that number as a percentage is worse than
 *    reporting nothing, because it looks like evidence. So the preconditions are asserted first, and
 *    a comparison that cannot be trusted is never made.
 *
 * 2. Every capture happens in a context this file builds itself — viewport, deviceScaleFactor 1,
 *    reduced motion, dark scheme — rather than inheriting playwright.config.ts. That config is shared
 *    with gates that have different needs; a pixel diff must not silently change meaning because
 *    somebody adjusted a default for the a11y spec.
 *
 * 3. The hero comparison (AC-35) crops the hero out of the full-page capture instead of taking a
 *    second screenshot of the element. One capture means one page state: an element screenshot
 *    scrolls the element into view, which can re-trigger lazy loading and scroll-linked effects and
 *    produce a hero that never coexisted with the full page it is supposed to be part of.
 *
 * A missing baseline is a SKIP, never a pass and never a failure: nobody has told this gate what
 * correct looks like yet. A missing *page region* when the baseline exists is a failure, because then
 * the design has a hero and the page does not.
 *
 * This gate never calls expect(). It records every defect at every breakpoint and reports them all
 * together, so one iteration of the loop can fix three things instead of one.
 */

import { test, type Page } from '@playwright/test'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join, relative } from 'node:path'
import pixelmatch from 'pixelmatch'
import sharp from 'sharp'
import { Gate, BREAKPOINTS, ROOT } from '../lib/gate'

const gate = new Gate('visual', 'Visual fidelity', ['AC-34', 'AC-35', 'AC-36', 'AC-37'])

const EXPORT_DIR = join(ROOT, 'design/export')
const DIFF_DIR = join(ROOT, 'checks/.diff')

/** pixelmatch colour-distance tolerance. 0 counts every antialiased glyph edge; see ACCEPTANCE. */
const MATCH_THRESHOLD = 0.1
/** Share of pixels allowed to differ, as percentages, because that is how the failures are phrased. */
const FULL_PAGE_BUDGET_PCT = 1.5
const HERO_BUDGET_PCT = 0.5

const HERO_SELECTOR = '[data-section="hero"]'

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

interface Preconditions {
  fontsReady: boolean
  fontStatus: string
  imagesDecoded: number
  imagesTotal: number
  animationsFrozen: boolean
  runningAnimations: string[]
  undecodedImages: string[]
}

interface Overflow {
  scrollWidth: number
  clientWidth: number
  offender: { selector: string; right: number; width: number } | null
  clippedOnly: boolean
}

interface Box {
  x: number
  y: number
  width: number
  height: number
}

interface Comparison {
  mismatched: number
  totalPixels: number
  pct: number
  actualSize: string
  baselineSize: string
  sizeMismatch: boolean
}

/** Relative paths read better in a report than eighty characters of absolute path. */
const rel = (p: string) => relative(ROOT, p).split('\\').join('/')

const fixed2 = (n: number) => n.toFixed(2)

/**
 * Baseline filename candidates, most canonical first.
 *
 * brief/ACCEPTANCE.md names design/export/{390,768,1440}.png; design/FIGMA-SPEC.md §8.1 names the same
 * images full-page-{width}.png and the sections section-{slug}-{width}.png. Both spellings are accepted
 * so that a straight Figma export and `npm run baseline` both land somewhere this gate looks, and the
 * SKIP message names every path that was tried so nobody has to guess which one was meant.
 */
const fullPageCandidates = (width: number) => [`${width}.png`, `full-page-${width}.png`]
const heroCandidates = (width: number) => [`section-hero-${width}.png`, `hero-${width}.png`]

function resolveBaseline(candidates: string[]): string | null {
  for (const name of candidates) {
    const path = join(EXPORT_DIR, name)
    if (existsSync(path)) return path
  }
  return null
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

  await page.evaluate(async () => {
    await Promise.allSettled(Array.from(document.images).map((i) => i.decode().catch(() => undefined)))

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
async function readPreconditions(page: Page): Promise<Preconditions> {
  const fontsReady = await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 5_000)),
    ]),
  )

  const rest = await page.evaluate(() => {
    const images = Array.from(document.images)
    const decoded = images.filter((i) => i.complete && i.naturalWidth > 0)
    const undecoded = images
      .filter((i) => !(i.complete && i.naturalWidth > 0))
      .map((i) => i.currentSrc || i.src || '(no src)')
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
      imagesDecoded: decoded.length,
      imagesTotal: images.length,
      runningAnimations: running,
      undecodedImages: undecoded,
    }
  })

  return {
    fontsReady: fontsReady && rest.fontStatus === 'loaded',
    animationsFrozen: rest.runningAnimations.length === 0,
    ...rest,
  }
}

/**
 * AC-36. scrollWidth vs clientWidth is the ground truth; the element scan exists only to name a
 * culprit in the message, because "the page is 14px too wide" is not a repair instruction.
 *
 * Elements inside a clipped or scrollable subtree are excluded from the scan: a marquee that is 3000px
 * wide inside `overflow: hidden` is the design, not the bug, and naming it would send the loop to fix
 * the wrong element. The measurement is taken with scrollbars already hidden so the number is the same
 * on a machine with overlay scrollbars and on one with classic ones.
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

    const isClipped = (el: Element): boolean => {
      let parent = el.parentElement
      while (parent && parent !== root) {
        if (getComputedStyle(parent).overflowX !== 'visible') return true
        parent = parent.parentElement
      }
      return false
    }

    let offender: { selector: string; right: number; width: number } | null = null
    let sawClippedOffender = false

    for (const el of Array.from(document.querySelectorAll('body *'))) {
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) continue
      const right = rect.right + window.scrollX
      if (right <= clientWidth + 1) continue
      if (isClipped(el)) {
        sawClippedOffender = true
        continue
      }
      if (!offender || right > offender.right) {
        offender = { selector: describe(el), right: Math.round(right), width: Math.round(rect.width) }
      }
    }

    return {
      scrollWidth: root.scrollWidth,
      clientWidth,
      offender,
      clippedOnly: offender === null && sawClippedOffender,
    }
  })
}

/** Page coordinates of a region, read with the page at scroll origin so they match the capture. */
async function boxOf(page: Page, selector: string): Promise<Box | null> {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const rect = el.getBoundingClientRect()
    return {
      x: rect.x + window.scrollX,
      y: rect.y + window.scrollY,
      width: rect.width,
      height: rect.height,
    }
  }, selector)
}

/** Decode to raw RGBA, optionally padded out to a larger canvas with transparent pixels. */
async function rawRgba(input: Buffer | string, pad?: { width: number; height: number }) {
  const meta = await sharp(input).metadata()
  const naturalWidth = meta.width ?? 0
  const naturalHeight = meta.height ?? 0

  let pipeline = sharp(input).ensureAlpha()
  if (pad && (pad.width > naturalWidth || pad.height > naturalHeight)) {
    pipeline = pipeline.extend({
      top: 0,
      left: 0,
      right: Math.max(0, pad.width - naturalWidth),
      bottom: Math.max(0, pad.height - naturalHeight),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
  }

  const { data, info } = await pipeline.raw().toBuffer({ resolveWithObject: true })
  if (info.channels !== 4) throw new Error(`expected RGBA, got ${info.channels} channels`)
  return { data, width: info.width, height: info.height, naturalWidth, naturalHeight }
}

/**
 * Compare one capture against one baseline.
 *
 * Different dimensions are a real difference, not an error: a page that grew a section is exactly what
 * this gate is for. Both images are padded onto the union canvas so pixelmatch can run at all, every
 * pixel that exists in only one of them counts as a mismatch, and the size difference is reported
 * separately so the message can say "this got taller" rather than only "47% of pixels differ".
 */
async function compareToBaseline(args: {
  actual: Buffer
  baselinePath: string
  diffPath: string
}): Promise<Comparison> {
  const actualMeta = await sharp(args.actual).metadata()
  const baselineMeta = await sharp(args.baselinePath).metadata()

  const width = Math.max(actualMeta.width ?? 0, baselineMeta.width ?? 0)
  const height = Math.max(actualMeta.height ?? 0, baselineMeta.height ?? 0)

  const a = await rawRgba(args.actual, { width, height })
  const b = await rawRgba(args.baselinePath, { width, height })

  const diff = Buffer.alloc(width * height * 4)
  const mismatched = pixelmatch(a.data, b.data, diff, width, height, { threshold: MATCH_THRESHOLD })
  const totalPixels = width * height

  mkdirSync(DIFF_DIR, { recursive: true })
  await sharp(diff, { raw: { width, height, channels: 4 } })
    .png()
    .toFile(args.diffPath)

  return {
    mismatched,
    totalPixels,
    pct: totalPixels === 0 ? 100 : (mismatched / totalPixels) * 100,
    actualSize: `${a.naturalWidth}x${a.naturalHeight}`,
    baselineSize: `${b.naturalWidth}x${b.naturalHeight}`,
    sizeMismatch: a.naturalWidth !== b.naturalWidth || a.naturalHeight !== b.naturalHeight,
  }
}

function describeOffender(overflow: Overflow): string {
  if (overflow.offender) return `${overflow.offender.selector} extends to ${overflow.offender.right}px`
  if (overflow.clippedOnly) {
    return 'no unclipped element extends past the viewport; the overflow comes from a clipped or scrollable subtree'
  }
  return 'no single element extends past the viewport; look for a margin, a transform or a negative offset'
}

// ── The gate ──────────────────────────────────────────────────────────────────

/** One test, so that one worker owns the gate and flushes it exactly once even under fullyParallel. */
test('visual fidelity at 390, 768 and 1440', async ({ browser, baseURL }) => {
  test.setTimeout(180_000)

  // Stale diffs are misleading evidence: a participant opens a PNG from a previous run and spends ten
  // minutes arguing with a failure that no longer exists.
  rmSync(DIFF_DIR, { recursive: true, force: true })
  mkdirSync(DIFF_DIR, { recursive: true })

  const missingBaselines: string[] = []
  const evidence: Record<string, unknown> = {}

  try {
    for (const bp of BREAKPOINTS) {
      await test.step(`${bp.width}px`, async () => {
        const record: Record<string, unknown> = {}
        evidence[String(bp.width)] = record

        const context = await browser.newContext({
          baseURL,
          viewport: { width: bp.width, height: bp.height },
          deviceScaleFactor: 1,
          colorScheme: 'dark',
          reducedMotion: 'reduce',
          forcedColors: 'none',
        })
        const page = await context.newPage()

        try {
          await page.goto('/', { waitUntil: 'load' })
          // networkidle is a heuristic, so it is bounded and its failure is not fatal: AC-37 below is
          // the real assertion about whether the page had finished arriving.
          await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined)
          await prepareForCapture(page)

          // ── AC-37 ────────────────────────────────────────────────────────────
          const pre = await readPreconditions(page)
          record.preconditions = pre
          const preconditionsHold =
            pre.fontsReady && pre.imagesDecoded === pre.imagesTotal && pre.animationsFrozen

          if (!preconditionsHold) {
            gate.fail({
              criterion: 'AC-37',
              message:
                `VISUAL: capture preconditions not met at ${bp.width}px — fonts ready ${pre.fontsReady}, ` +
                `images decoded ${pre.imagesDecoded}/${pre.imagesTotal}, animations frozen ${pre.animationsFrozen}. ` +
                `No comparison was made.`,
              where: `${bp.width}px`,
              expected: 'fonts ready true, every image decoded, animations frozen true',
              actual:
                `fonts ${pre.fontStatus}, ${pre.imagesDecoded}/${pre.imagesTotal} images decoded, ` +
                `${pre.runningAnimations.length} animation(s) still running`,
              hint: [
                pre.undecodedImages.length ? `Undecoded: ${pre.undecodedImages.join(', ')}.` : '',
                pre.runningAnimations.length ? `Still running: ${pre.runningAnimations.join(', ')}.` : '',
                !pre.fontsReady
                  ? 'document.fonts.ready did not resolve within 5s — check that every @font-face actually loads.'
                  : '',
              ]
                .filter(Boolean)
                .join(' '),
            })
          }

          // ── AC-36 ────────────────────────────────────────────────────────────
          // A layout measurement, not a pixel comparison, so it runs whether or not AC-37 held: knowing
          // the page is 40px too wide is useful even when the fonts never loaded.
          const overflow = await measureOverflow(page)
          record.overflow = overflow

          if (overflow.scrollWidth > overflow.clientWidth + 1) {
            gate.fail({
              criterion: 'AC-36',
              message:
                `VISUAL: horizontal overflow at ${bp.width}px — scrollWidth ${overflow.scrollWidth}px ` +
                `exceeds viewport ${overflow.clientWidth}px. Widest offender: ${describeOffender(overflow)}`,
              where: overflow.offender?.selector ?? `${bp.width}px`,
              expected: `scrollWidth <= ${overflow.clientWidth + 1}px`,
              actual: `${overflow.scrollWidth}px`,
            })
          }

          // AC-37's whole point: a comparison is not attempted against a capture known to be bad.
          if (!preconditionsHold) return

          // ── AC-34 ────────────────────────────────────────────────────────────
          const fullPageShot = await page.screenshot({
            fullPage: true,
            animations: 'disabled',
            caret: 'hide',
            scale: 'css',
            type: 'png',
          })

          const fullBaseline = resolveBaseline(fullPageCandidates(bp.width))
          if (!fullBaseline) {
            const tried = fullPageCandidates(bp.width)
              .map((n) => `design/export/${n}`)
              .join(' or ')
            missingBaselines.push(tried)
            record.fullPage = { status: 'skipped', reason: `no baseline at ${tried}` }
            gate.note(`AC-34 not verified at ${bp.width}px: no baseline at ${tried}. Run: npm run baseline`)
          } else {
            const diffPath = join(DIFF_DIR, `${bp.width}-diff.png`)
            const cmp = await compareToBaseline({ actual: fullPageShot, baselinePath: fullBaseline, diffPath })
            const over = cmp.pct > FULL_PAGE_BUDGET_PCT
            record.fullPage = { baseline: rel(fullBaseline), ...cmp, budgetPct: FULL_PAGE_BUDGET_PCT, over }

            if (over) {
              gate.fail({
                criterion: 'AC-34',
                message:
                  `VISUAL: ${bp.width}px differs from ${rel(fullBaseline)} by ${fixed2(cmp.pct)}% of pixels ` +
                  `(budget ${FULL_PAGE_BUDGET_PCT}%). Diff: ${rel(diffPath)}`,
                where: `${bp.width}px`,
                expected: `<= ${FULL_PAGE_BUDGET_PCT}% of pixels`,
                actual: `${fixed2(cmp.pct)}% (${cmp.mismatched.toLocaleString('en-US')} of ${cmp.totalPixels.toLocaleString('en-US')} pixels)`,
                hint: cmp.sizeMismatch
                  ? `Page is ${cmp.actualSize}, baseline is ${cmp.baselineSize}. The size difference alone accounts for part of that percentage — open the diff before chasing colours.`
                  : `Open ${rel(diffPath)}: the highlighted pixels are what moved.`,
              })
            } else {
              // Nothing is left behind for a pass, so a diff image that exists is always one worth opening.
              rmSync(diffPath, { force: true })
            }
          }

          // ── AC-35 ────────────────────────────────────────────────────────────
          const heroBaseline = resolveBaseline(heroCandidates(bp.width))
          if (!heroBaseline) {
            const tried = heroCandidates(bp.width)
              .map((n) => `design/export/${n}`)
              .join(' or ')
            missingBaselines.push(tried)
            record.hero = { status: 'skipped', reason: `no baseline at ${tried}` }
            gate.note(`AC-35 not verified at ${bp.width}px: no baseline at ${tried}. Run: npm run baseline`)
            return
          }

          // The baseline exists, so the design has a hero. A page without one is a defect rather than a
          // setup problem, and it is reported here instead of being quietly skipped.
          const heroBox = await boxOf(page, HERO_SELECTOR)
          if (!heroBox || heroBox.width < 1 || heroBox.height < 1) {
            const observed = heroBox
              ? `${Math.round(heroBox.width)}x${Math.round(heroBox.height)}`
              : 'no match'
            gate.fail({
              criterion: 'AC-35',
              message:
                `VISUAL: hero at ${bp.width}px could not be captured — ${HERO_SELECTOR} ` +
                `${heroBox ? `has no area (${observed})` : 'is not in the DOM'}, but ${rel(heroBaseline)} ` +
                `exists. No comparison was made.`,
              where: `${HERO_SELECTOR} at ${bp.width}px`,
              expected: `a rendered element matching ${HERO_SELECTOR}`,
              actual: observed,
            })
            record.hero = { status: 'failed', reason: 'hero region not renderable' }
            return
          }

          const shotMeta = await sharp(fullPageShot).metadata()
          const left = Math.max(0, Math.round(heroBox.x))
          const top = Math.max(0, Math.round(heroBox.y))
          const cropWidth = Math.max(1, Math.min(Math.round(heroBox.width), (shotMeta.width ?? 0) - left))
          const cropHeight = Math.max(1, Math.min(Math.round(heroBox.height), (shotMeta.height ?? 0) - top))
          const heroShot = await sharp(fullPageShot)
            .extract({ left, top, width: cropWidth, height: cropHeight })
            .png()
            .toBuffer()

          const heroDiffPath = join(DIFF_DIR, `${bp.width}-hero-diff.png`)
          const heroCmp = await compareToBaseline({
            actual: heroShot,
            baselinePath: heroBaseline,
            diffPath: heroDiffPath,
          })
          const heroOver = heroCmp.pct > HERO_BUDGET_PCT
          record.hero = { baseline: rel(heroBaseline), ...heroCmp, budgetPct: HERO_BUDGET_PCT, over: heroOver }

          if (heroOver) {
            gate.fail({
              criterion: 'AC-35',
              message:
                `VISUAL: hero at ${bp.width}px differs by ${fixed2(heroCmp.pct)}% ` +
                `(budget ${HERO_BUDGET_PCT}%). Diff: ${rel(heroDiffPath)}`,
              where: `${HERO_SELECTOR} at ${bp.width}px`,
              expected: `<= ${HERO_BUDGET_PCT}% of pixels against ${rel(heroBaseline)}`,
              actual: `${fixed2(heroCmp.pct)}% (${heroCmp.mismatched.toLocaleString('en-US')} of ${heroCmp.totalPixels.toLocaleString('en-US')} pixels)`,
              hint: heroCmp.sizeMismatch
                ? `Hero is ${heroCmp.actualSize}, baseline is ${heroCmp.baselineSize}. The region changed size, so start with its height and padding.`
                : 'The hero carries the wordmark: check type size and letter-spacing before anything else.',
            })
          } else {
            rmSync(heroDiffPath, { force: true })
          }
        } finally {
          // Closing a context is cleanup, not measurement: it can fail over a trace file that another
          // process removed, and that must not turn into a verdict about the page. It is recorded
          // rather than swallowed, because a gate that hides things it saw is the wrong kind of gate.
          await context.close().catch((err: unknown) => {
            gate.note(`closing the ${bp.width}px context threw: ${String(err).slice(0, 200)}`)
          })
        }
      })
    }
  } catch (err) {
    // An exception is not an excuse to report nothing. A gate that cannot finish must not look green.
    gate.fail({
      message: `VISUAL: the gate did not finish — ${String(err).slice(0, 400)}`,
      hint: 'This is a failure of the check itself, not necessarily of the page. Fix the gate, then re-run.',
    })
    throw err
  } finally {
    evidence.missingBaselines = missingBaselines
    evidence.budgets = {
      fullPagePct: FULL_PAGE_BUDGET_PCT,
      heroPct: HERO_BUDGET_PCT,
      matchThreshold: MATCH_THRESHOLD,
    }
    evidence.diffDir = rel(DIFF_DIR)

    if (missingBaselines.length) {
      const reason =
        `${missingBaselines.length} baseline image(s) missing from design/export/ ` +
        `(${missingBaselines.join('; ')}), so AC-34/AC-35 made no comparison there. Run: npm run baseline`
      if (gate.failures.length === 0) {
        // No baseline means nobody has said what correct looks like yet. Calling that a pass would let
        // an unverified page through under a green tick, which is the one thing a verifier may not do.
        gate.skip(reason)
      } else {
        gate.note(reason)
      }
    }

    gate.flush(evidence)
  }
})
