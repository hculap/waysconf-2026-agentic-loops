import { test } from '@playwright/test'
import type { BrowserContext, ConsoleMessage, Page, Request, Response } from '@playwright/test'
import { Gate, BREAKPOINTS } from '../lib/gate'

/**
 * Runtime gate — AC-03 and AC-04 from brief/ACCEPTANCE.md.
 *
 *   AC-03  loading the page produces no console errors and no unhandled rejections
 *          at 390, 768 and 1440. The allowlist is empty, on purpose: the moment a
 *          gate grows an allowlist it stops being a gate and becomes a preference.
 *   AC-04  every network request made during load returns a status below 400.
 *
 * The two criteria live in one spec because they are two readings of the same
 * observation — one page load, watched from two angles. Splitting them would mean
 * loading the page six times to learn the same thing.
 *
 * Three properties this file holds itself to, because a runtime gate is the easiest
 * one in the suite to satisfy vacuously:
 *
 *   1. Nothing passes by default. Every observation this gate claims to have made is
 *      recorded as made. A breakpoint the spec never reached is reported as a failure
 *      at flush time, never left to look like a clean load. The verdict is written in
 *      afterAll from module-level state, so a throw anywhere in the test body still
 *      reports everything observed up to that point.
 *   2. The observation channel is itself checked. Playwright's `console` and
 *      `pageerror` events come from the page's native console binding and from
 *      Chromium's default error reporting — a page can silence both in two lines. An
 *      in-page recorder installed before any page script cross-checks them, and a
 *      replaced console.error is an AC-03 failure rather than a quiet zero.
 *   3. Teardown is tooling, not evidence. A browser context that will not close is a
 *      note; it never decides AC-03 or AC-04, and it never discards what was watched.
 */

const CRITERIA = ['AC-03', 'AC-04'] as const

const gate = new Gate('runtime', 'Runtime', [...CRITERIA])

/**
 * ACCEPTANCE describes AC-04 as "the load and 2s idle". Deferred work — a font
 * swap, an IntersectionObserver firing on the ticker, a lazy image entering the
 * viewport — lands after load, and an error thrown there is exactly as broken as
 * one thrown during parse.
 */
const SETTLE_MS = 2_000

/** networkidle can legitimately never arrive. Cap it rather than burning the test timeout. */
const NETWORK_IDLE_TIMEOUT_MS = 15_000

/** Console levels Chromium reports at error severity. `assert` is one of them. */
const ERROR_CONSOLE_TYPES = new Set(['error', 'assert'])

/** Console methods whose identity is checked. Replacing any of them blinds this gate. */
const WATCHED_CONSOLE_LEVELS = ['error', 'warn', 'assert'] as const
type ConsoleLevel = (typeof WATCHED_CONSOLE_LEVELS)[number]

interface RuntimeError {
  breakpoint: string
  width: number
  /**
   * `console` and `pageerror` come from Playwright's listeners. `suppressed` is an
   * error the page hid from those listeners and that only the in-page recorder saw.
   */
  kind: 'console' | 'pageerror' | 'suppressed'
  text: string
  url: string
  line: number | null
  detail?: string
}

interface FailedRequest {
  breakpoint: string
  width: number
  url: string
  status: number | string
  resourceType: string
  /** The main document request, which the navigation-error branch may already own. */
  isNavigation: boolean
  count: number
}

/** A request Chromium cancelled. Whether that is a defect is decided after the load. */
interface AbortedRequest {
  breakpoint: string
  width: number
  url: string
  reason: string
  resourceType: string
  isNavigation: boolean
}

// ── In-page recorder ──────────────────────────────────────────────────────────

interface RuntimeProbe {
  /** The console methods as they were before any page script could touch them. */
  natives: Record<ConsoleLevel, unknown>
  /** Uncaught script errors, caught before any page handler can preventDefault them. */
  scriptErrors: string[]
  /** Unhandled promise rejections, same. */
  rejections: string[]
}

interface ProbeReading {
  tampered: ConsoleLevel[]
  scriptErrors: string[]
  rejections: string[]
}

declare global {
  interface Window {
    __turbineRuntimeProbe?: RuntimeProbe
  }
}

/**
 * Installed before any page script runs, in every frame.
 *
 * Playwright's `console` event is emitted when the *native* console method is called,
 * so `console.error = function () {}` in the page makes every later console.error
 * invisible to the gate — it does not silence an error, it silences the observer. The
 * same is true of `pageerror`: a handler that calls preventDefault() on `error` or
 * `unhandledrejection` stops Chromium reporting the exception, and the gate then sees
 * a clean load. Both were verified against this Playwright version.
 *
 * So this records the two events in the capture phase, registered first, where a later
 * page handler's preventDefault() cannot reach it, and it keeps a reference to the real
 * console methods so their replacement can be detected rather than believed.
 *
 * It is best-effort, not a sandbox: page script that specifically targets
 * `__turbineRuntimeProbe` can still empty the arrays. It is aimed at the realistic
 * failure — an agent told to "clean up console noise" writing `console.error = () => {}`
 * — not at an adversary who knows this file. The limit is stated in the gate notes.
 */
function installRuntimeProbe(): void {
  const probe = {
    natives: {
      error: console.error,
      warn: console.warn,
      assert: console.assert,
    },
    scriptErrors: [] as string[],
    rejections: [] as string[],
  }

  // Non-writable and non-configurable so a page assignment to the same name cannot
  // quietly swap the recorder for an empty one.
  Object.defineProperty(window, '__turbineRuntimeProbe', {
    value: probe,
    writable: false,
    configurable: false,
    enumerable: false,
  })

  window.addEventListener(
    'error',
    (event: Event) => {
      // A failed subresource dispatches a plain Event at the element; only an
      // ErrorEvent is a script error. Counting the former here would invent a
      // discrepancy against `pageerror`, which never reports resource failures —
      // those belong to AC-04 and are already counted there.
      if (!(event instanceof ErrorEvent)) return
      probe.scriptErrors.push(event.message || String(event.error))
    },
    true,
  )

  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      probe.rejections.push(String(event.reason))
    },
    true,
  )
}

async function readProbe(page: Page): Promise<ProbeReading | null> {
  return page.evaluate((levels: readonly ConsoleLevel[]) => {
    const probe = window.__turbineRuntimeProbe
    if (!probe) return null
    const tampered: ConsoleLevel[] = []
    for (const level of levels) {
      const current: unknown = console[level]
      if (current !== probe.natives[level]) {
        tampered.push(level)
        continue
      }
      // Belt and braces: a wrapper installed before this script ran would pass the
      // identity check but is still not the native binding Playwright listens to.
      if (!Function.prototype.toString.call(current as () => void).includes('[native code]')) {
        tampered.push(level)
      }
    }
    return { tampered, scriptErrors: probe.scriptErrors.slice(), rejections: probe.rejections.slice() }
  }, WATCHED_CONSOLE_LEVELS)
}

// ── Gate state ────────────────────────────────────────────────────────────────

/**
 * Module scope, not test scope, and reported from afterAll rather than from the end of
 * the test body.
 *
 * The test used to end with the two report functions, which meant any throw before them
 * — a goto timeout, a page.evaluate rejecting, the trace-artifact ENOENT that
 * `context.close()` raises on this stack while tracing is armed — discarded every
 * observation and flushed `status: "pass", failures: []`. checks/run.mjs folds the JSON
 * in without reading Playwright's exit code, so a crashed gate came back green. Holding
 * the observations here makes the report survive the crash, and `watched` makes the
 * crash itself visible.
 */
const errors: RuntimeError[] = []
const failedRequests: FailedRequest[] = []
const abortedRequests: AbortedRequest[] = []

/** Widths whose load was watched end to end. Anything missing was never measured. */
const watched = new Set<number>()
/** Widths whose navigation failed outright: AC-04 already owns those, in one line. */
const navigationFailed = new Map<number, string>()
/** Per width, every URL that did return a status below 400 during that load. */
const succeededUrls = new Map<number, Set<string>>()

const evidence: Record<string, unknown> = {
  breakpoints: BREAKPOINTS.map((b) => b.width),
  settleMs: SETTLE_MS,
  consoleAllowlist: [],
  consoleTypesCounted: [...ERROR_CONSOLE_TYPES],
}

/**
 * One test, not three. playwright.config.ts sets fullyParallel, which is free to
 * spread the tests of a file across worker processes — and each worker would then
 * hold its own Gate instance and overwrite the same gate JSON on flush. Serial
 * mode plus a single test keeps every observation in one process, so the report
 * the loop reads back contains all of them.
 */
test.describe.configure({ mode: 'serial' })

test.afterAll(() => {
  reportErrors()
  reportFailedRequests()
  reportAbortedRequests()
  reportUnwatchedBreakpoints()

  evidence.watchedWidths = [...watched].sort((a, b) => a - b)
  evidence.errorCount = errors.length
  evidence.failedRequestCount = failedRequests.length
  evidence.abortedRequestCount = abortedRequests.length

  gate.note(
    `watched ${watched.size} of ${BREAKPOINTS.length} cold page loads: ${errors.length} runtime error(s), ` +
      `${failedRequests.length} failing request(s), ${abortedRequests.length} cancelled request(s)`,
  )
  gate.note(
    'AC-03 is observed through Playwright\'s console and pageerror events, cross-checked against a recorder ' +
      'installed in the page before any page script. That recorder catches errors a page handler suppressed with ' +
      'preventDefault, and detects a replaced console method — but page script that targets the recorder by name ' +
      'can still empty it, and console output inside a Web Worker or a cross-origin frame is not observed at all.',
  )

  gate.flush(evidence)
})

test('AC-03, AC-04 — the page loads clean at 390, 768 and 1440', async ({ browser }) => {
  // Three cold loads plus settle time each; the 60s default is too tight to be safe.
  test.setTimeout(150_000)

  const baseURL = test.info().project.use.baseURL ?? 'http://localhost:4321'
  evidence.baseURL = baseURL

  for (const bp of BREAKPOINTS) {
    // Every breakpoint is attempted even if an earlier one threw. Losing 1440 because
    // 390 could not tear its context down would hide whatever 1440 had to say, and the
    // loop would then repair one width at a time.
    try {
      await watchOneLoad(browser, bp, baseURL)
    } catch (err) {
      // The observations made before the throw are already in the module-level arrays
      // and will still be reported. What is lost is the rest of this breakpoint, and
      // that is what the failure below says.
      gate.fail({
        criterion: 'AC-03',
        message:
          `AC-03 BUILD: watching the page load at ${bp.width}px did not finish, so nothing is known about ` +
          `console errors or unhandled rejections there: ${firstLine(err)}`,
        where: `${baseURL}/ @ ${bp.width}px`,
        expected: 'one complete, observed page load',
        actual: firstLine(err),
        hint: 'A check that could not run is reported as a failure on purpose. Fix the gate or the environment, then re-run.',
      })
    }
  }
})

/** One cold load at one width, watched from listeners attached before navigation. */
async function watchOneLoad(
  browser: import('@playwright/test').Browser,
  bp: (typeof BREAKPOINTS)[number],
  baseURL: string,
): Promise<void> {
  // A fresh context per breakpoint, not one page resized three times. Reusing a
  // context would serve the second and third loads from the HTTP cache, so a 404
  // on a font or an image would be observed once and silently missed twice — the
  // gate would then depend on which breakpoint happened to run first.
  const context: BrowserContext = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'no-preference',
    baseURL,
  })

  try {
    const page: Page = await context.newPage()

    // Before newPage would be too late for the page's own init script ordering, and
    // after goto would be too late for everything. This is the only correct moment.
    await page.addInitScript(installRuntimeProbe)

    // Listeners before navigation, always. Attaching them after goto() resolves
    // loses everything the page logged while parsing, which is where the
    // interesting errors are.
    attachListeners(page, bp)

    let navigationError: string | null = null
    try {
      await page.goto('/', { waitUntil: 'load' })
    } catch (err) {
      navigationError = firstLine(err)
    }

    if (navigationError) {
      // A page that will not load is a failure, never a skip. The orchestrator has
      // already proved the server answers before any spec runs, so if navigation
      // dies here it is the page or the build, not the environment.
      navigationFailed.set(bp.width, navigationError)
      gate.fail({
        criterion: 'AC-04',
        message: `AC-04 BUILD: request to ${baseURL}/ failed during page load at ${bp.width}px: ${navigationError}`,
        where: `${baseURL}/ @ ${bp.width}px`,
        expected: 'a document response with status < 400',
        actual: navigationError,
      })
      return
    }

    try {
      await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS })
    } catch {
      // Not a defect this gate owns — but the loop should know the window it watched
      // was bounded, otherwise a late request looks like it was never made.
      gate.note(
        `network never went idle within ${NETWORK_IDLE_TIMEOUT_MS}ms at ${bp.width}px; observed the first ${NETWORK_IDLE_TIMEOUT_MS + SETTLE_MS}ms of the load instead`,
      )
    }

    await page.waitForTimeout(SETTLE_MS)

    // Read the in-page recorder before the context goes away, and while the page is
    // still the one that was watched.
    crossCheckProbe(await readProbe(page), bp)

    watched.add(bp.width)
  } finally {
    // Teardown is tooling. On @playwright/test 1.63 with `trace: 'retain-on-failure'`
    // armed, closing several contexts inside one test intermittently throws ENOENT
    // while copying trace artifacts — a fault in the recorder, not in the page. It
    // used to abort the test before anything was reported. It is a note now, and the
    // verdict comes from the loads that were actually watched.
    try {
      await context.close()
    } catch (err) {
      gate.note(`browser context teardown at ${bp.width}px failed (tooling, not the page): ${firstLine(err)}`)
    }
  }
}

/**
 * Compares what the page recorded against what Playwright's listeners saw.
 *
 * A mismatch is not noise: it means an error happened and the gate's normal channel did
 * not carry it. Unpaired records are reported as AC-03 failures in their own right, and
 * a replaced console method is reported even when nothing was logged through it, because
 * "no errors observed" through a channel that cannot observe is not a pass.
 */
function crossCheckProbe(reading: ProbeReading | null, bp: (typeof BREAKPOINTS)[number]): void {
  if (!reading) {
    gate.fail({
      criterion: 'AC-03',
      message:
        `AC-03 BUILD: the gate's in-page error recorder was missing at ${bp.width}px, so console errors and ` +
        `unhandled rejections could not be observed there`,
      where: `@ ${bp.width}px`,
      expected: 'window.__turbineRuntimeProbe installed before page script',
      actual: 'absent',
      hint: 'An unobservable page is a failure, never a pass. Check addInitScript and any page script that writes to window.',
    })
    return
  }

  for (const level of reading.tampered) {
    gate.fail({
      criterion: 'AC-03',
      message:
        `AC-03 BUILD: console.${level} has been replaced by page script at ${bp.width}px; the gate cannot ` +
        `observe errors logged through it`,
      where: `console.${level} @ ${bp.width}px`,
      expected: 'the native console binding, untouched',
      actual: 'replaced by page script',
      hint: 'Remove the assignment to console.' + level + '. Silencing the console hides errors from users and from this gate; fix what is logging instead.',
    })
  }

  // Pair each in-page record against one unused pageerror the listener saw, so a defect
  // observed both ways produces one line and only genuinely hidden ones produce extra.
  const listenerTexts = errors
    .filter((e) => e.width === bp.width && e.kind === 'pageerror')
    .map((e) => e.text)
  const used = new Array<boolean>(listenerTexts.length).fill(false)

  const inPage = [
    ...reading.scriptErrors.map((text) => ({ label: 'uncaught exception', text })),
    ...reading.rejections.map((text) => ({ label: 'unhandled rejection', text })),
  ]

  for (const record of inPage) {
    const normalised = normalise(record.text)
    const matchIndex = listenerTexts.findIndex(
      (text, i) =>
        !used[i] && (normalise(text).includes(normalised) || normalised.includes(normalise(text))),
    )
    if (matchIndex >= 0) {
      used[matchIndex] = true
      continue
    }
    errors.push({
      breakpoint: bp.name,
      width: bp.width,
      kind: 'suppressed',
      text: `${record.label}: ${record.text}`,
      url: '(page)',
      line: null,
      detail:
        'Seen by the gate\'s in-page recorder but not by Playwright\'s pageerror event, which means a page ' +
        'handler called preventDefault() on the error or unhandledrejection event.',
    })
  }
}

const normalise = (text: string): string => text.replace(/\s+/g, ' ').trim()

const firstLine = (err: unknown): string => {
  const text = err instanceof Error ? `${err.name}: ${err.message}` : String(err)
  return text.split('\n')[0]?.slice(0, 300) ?? text.slice(0, 300)
}

function attachListeners(page: Page, bp: (typeof BREAKPOINTS)[number]): void {
  page.on('console', (msg: ConsoleMessage) => {
    // `assert` as well as `error`: Chromium reports a failed console.assert at error
    // severity and Playwright types it as its own kind. Filtering on 'error' alone let
    // a real error-level message through as a clean load.
    if (!ERROR_CONSOLE_TYPES.has(msg.type())) return
    const loc = msg.location()
    errors.push({
      breakpoint: bp.name,
      width: bp.width,
      kind: 'console',
      text: msg.text(),
      url: loc.url || '(no source)',
      line: typeof loc.lineNumber === 'number' ? loc.lineNumber : null,
    })
  })

  // pageerror covers uncaught exceptions and unhandled promise rejections. Chromium
  // reports both here — unless the page suppresses them, which crossCheckProbe catches.
  page.on('pageerror', (err: Error) => {
    errors.push({
      breakpoint: bp.name,
      width: bp.width,
      kind: 'pageerror',
      text: `${err.name}: ${err.message}`,
      url: '(page)',
      line: null,
      detail: err.stack?.split('\n').slice(0, 4).join('\n'),
    })
  })

  page.on('response', (response: Response) => {
    const status = response.status()
    if (status < 400) {
      // Remembered so a cancelled duplicate of a URL that did load can be told apart
      // from a cancelled request that never returned anything at all.
      const bucket = succeededUrls.get(bp.width) ?? new Set<string>()
      bucket.add(response.url())
      succeededUrls.set(bp.width, bucket)
      return
    }
    record(failedRequests, {
      breakpoint: bp.name,
      width: bp.width,
      url: response.url(),
      status,
      resourceType: response.request().resourceType(),
      isNavigation: response.request().isNavigationRequest(),
      count: 1,
    })
  })

  page.on('requestfailed', (request: Request) => {
    const reason = request.failure()?.errorText ?? 'unknown failure'
    // A request that never produced a status has not "returned a status below 400"
    // either, so it belongs to AC-04. ERR_ABORTED is held back for a moment rather
    // than exempted: whether it is a defect depends on whether the same URL also
    // came back successfully during this load, and that is not known yet.
    if (reason.includes('net::ERR_ABORTED')) {
      abortedRequests.push({
        breakpoint: bp.name,
        width: bp.width,
        url: request.url(),
        reason,
        resourceType: request.resourceType(),
        isNavigation: request.isNavigationRequest(),
      })
      return
    }
    record(failedRequests, {
      breakpoint: bp.name,
      width: bp.width,
      url: request.url(),
      status: reason,
      resourceType: request.resourceType(),
      isNavigation: request.isNavigationRequest(),
      count: 1,
    })
  })
}

/**
 * Collapse repeats of the same URL at the same breakpoint. A stylesheet referenced
 * from three places produces three identical 404s, and three identical lines in the
 * report describe one defect while looking like three.
 */
function record(sink: FailedRequest[], entry: FailedRequest): void {
  const existing = sink.find(
    (f) => f.url === entry.url && f.status === entry.status && f.width === entry.width,
  )
  if (existing) {
    existing.count++
    return
  }
  sink.push(entry)
}

/**
 * Every error, not the first one. The point of the loop is that one repair pass can
 * fix several things; a gate that reports only the first defect forces ten
 * iterations where two would do.
 *
 * Sorted by a stable key rather than by arrival order. A console error and a resource
 * error race each other within one load, so unsorted output swapped "Error 1 of 2" and
 * "Error 2 of 2" between runs of the identical page — the verdict was idempotent but
 * checks/report.md, which is what goes back into the loop, was not.
 */
function reportErrors(): void {
  const byWidth = new Map<number, RuntimeError[]>()
  for (const e of errors) {
    const bucket = byWidth.get(e.width) ?? []
    bucket.push(e)
    byWidth.set(e.width, bucket)
  }

  for (const [width, bucket] of [...byWidth.entries()].sort((a, b) => a[0] - b[0])) {
    const ordered = [...bucket].sort(
      (a, b) =>
        a.kind.localeCompare(b.kind) ||
        a.url.localeCompare(b.url) ||
        (a.line ?? -1) - (b.line ?? -1) ||
        a.text.localeCompare(b.text),
    )

    ordered.forEach((e, i) => {
      const source = e.line === null ? e.url : `${e.url}:${e.line}`
      const position = `Error ${i + 1} of ${ordered.length}`
      const message =
        e.kind === 'pageerror'
          ? `AC-03 BUILD: uncaught exception or unhandled rejection at ${width}px. ${position}: "${e.text}"`
          : e.kind === 'suppressed'
            ? `AC-03 BUILD: an ${e.text.split(':')[0]} at ${width}px was hidden from the gate's listeners by a page handler. ${position}: "${e.text}"`
            : `AC-03 BUILD: ${ordered.length} console error(s) at ${width}px. ${position}: "${e.text}" from ${source}`

      gate.fail({
        criterion: 'AC-03',
        message,
        where: `${e.url} @ ${width}px`,
        expected: '0 console errors and 0 unhandled rejections',
        actual: `${e.kind}: ${e.text}`,
        hint: e.detail,
      })
    })
  }
}

function reportFailedRequests(): void {
  const reportable = failedRequests.filter(
    // The navigation-error branch has already reported this exact failure once, with
    // the same url and the same reason. Two lines for one dead server describe one
    // defect as if it were two, and the repair prompt then carries six.
    (f) => !(f.isNavigation && navigationFailed.has(f.width)),
  )

  for (const f of reportable.sort((a, b) => a.width - b.width || a.url.localeCompare(b.url))) {
    gate.fail({
      criterion: 'AC-04',
      message:
        `AC-04 BUILD: request to ${f.url} returned ${f.status} during page load at ${f.width}px` +
        (f.count > 1 ? ` (${f.count} times)` : ''),
      where: `${f.url} @ ${f.width}px (${f.resourceType})`,
      expected: 'status < 400',
      actual: String(f.status),
    })
  }
}

/**
 * AC-04 is "every network request made during load returns a status below 400", and a
 * cancelled request returned nothing at all.
 *
 * The one honest exemption is a duplicate: Chromium cancels one of two in-flight
 * requests for the same URL — a preload racing the real use is the common case — and
 * that URL did come back below 400, on the other request. Everything else fails. The
 * previous substring test on the reason exempted any cancelled request of any type,
 * which turned a fetch to a missing endpoint, or an <img> removed before it settled,
 * into a note inside a green report.
 */
function reportAbortedRequests(): void {
  const ordered = [...abortedRequests].sort((a, b) => a.width - b.width || a.url.localeCompare(b.url))

  for (const a of ordered) {
    if (a.isNavigation && navigationFailed.has(a.width)) continue

    if (succeededUrls.get(a.width)?.has(a.url)) {
      gate.note(
        `cancelled request at ${a.width}px not counted against AC-04: ${a.url} (${a.resourceType}) — ${a.reason}; ` +
          `the same URL also returned a status below 400 during that load`,
      )
      continue
    }

    gate.fail({
      criterion: 'AC-04',
      message: `AC-04 BUILD: request to ${a.url} returned ${a.reason} during page load at ${a.width}px`,
      where: `${a.url} @ ${a.width}px (${a.resourceType})`,
      expected: 'status < 400',
      actual: a.reason,
      hint: 'The request was cancelled and no response for this URL arrived during the load. Remove the request, or let it complete.',
    })
  }
}

/**
 * The completion guard.
 *
 * A breakpoint is accounted for if its load was watched end to end, or if navigation
 * failed there — that failure is already reported, once, and explains the silence.
 * Anything else means the spec died before it measured that width, and the only honest
 * thing to write about a measurement that was never taken is a failure.
 */
function reportUnwatchedBreakpoints(): void {
  const missing = BREAKPOINTS.filter((bp) => !watched.has(bp.width) && !navigationFailed.has(bp.width))
  if (missing.length === 0) return

  const widths = missing.map((bp) => `${bp.width}px`).join(', ')
  for (const criterion of CRITERIA) {
    gate.fail({
      criterion,
      message:
        `${criterion} BUILD: the page was never watched at ${widths}, so nothing is known about it there. ` +
        `Treated as a failure, never as a pass.`,
      where: 'checks/specs/runtime.spec.ts',
      expected: `${BREAKPOINTS.length} watched page loads`,
      actual: `${watched.size} watched`,
      hint: 'Usually a Playwright timeout, a browser that would not start, or a teardown error. Re-run with --reporter=list to see where the spec stopped.',
    })
  }
}
