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
 */

const gate = new Gate('runtime', 'Runtime', ['AC-03', 'AC-04'])

/**
 * ACCEPTANCE describes AC-04 as "the load and 2s idle". Deferred work — a font
 * swap, an IntersectionObserver firing on the ticker, a lazy image entering the
 * viewport — lands after load, and an error thrown there is exactly as broken as
 * one thrown during parse.
 */
const SETTLE_MS = 2_000

/** networkidle can legitimately never arrive. Cap it rather than burning the test timeout. */
const NETWORK_IDLE_TIMEOUT_MS = 15_000

interface RuntimeError {
  breakpoint: string
  width: number
  kind: 'console' | 'pageerror'
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
  count: number
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
  gate.flush({
    breakpoints: BREAKPOINTS.map((b) => b.width),
    settleMs: SETTLE_MS,
    consoleAllowlist: [],
  })
})

test('AC-03, AC-04 — the page loads clean at 390, 768 and 1440', async ({ browser }) => {
  // Three cold loads plus settle time each; the 60s default is too tight to be safe.
  test.setTimeout(150_000)

  const baseURL = test.info().project.use.baseURL ?? 'http://localhost:4321'

  const errors: RuntimeError[] = []
  const failedRequests: FailedRequest[] = []

  for (const bp of BREAKPOINTS) {
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

    const page: Page = await context.newPage()

    // Listeners before navigation, always. Attaching them after goto() resolves
    // loses everything the page logged while parsing, which is where the
    // interesting errors are.
    attachListeners(page, bp, errors, failedRequests)

    let navigationError: string | null = null
    try {
      await page.goto('/', { waitUntil: 'load' })
    } catch (err) {
      navigationError = String(err).split('\n')[0] ?? String(err)
    }

    if (navigationError) {
      // A page that will not load is a failure, never a skip. The orchestrator has
      // already proved the server answers before any spec runs, so if navigation
      // dies here it is the page or the build, not the environment.
      gate.fail({
        criterion: 'AC-04',
        message: `AC-04 BUILD: request to ${baseURL}/ failed during page load at ${bp.width}px: ${navigationError}`,
        where: `${baseURL}/ @ ${bp.width}px`,
        expected: 'a document response with status < 400',
        actual: navigationError,
      })
      await context.close()
      continue
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
    await context.close()
  }

  reportErrors(errors)
  reportFailedRequests(failedRequests)

  gate.note(
    `watched ${BREAKPOINTS.length} cold page loads: ${errors.length} runtime error(s), ${failedRequests.length} failing request(s)`,
  )
})

function attachListeners(
  page: Page,
  bp: (typeof BREAKPOINTS)[number],
  errors: RuntimeError[],
  failedRequests: FailedRequest[],
): void {
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() !== 'error') return
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
  // reports both here; neither reliably reaches the console listener.
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
    if (status < 400) return
    record(failedRequests, {
      breakpoint: bp.name,
      width: bp.width,
      url: response.url(),
      status,
      resourceType: response.request().resourceType(),
      count: 1,
    })
  })

  page.on('requestfailed', (request: Request) => {
    const reason = request.failure()?.errorText ?? 'unknown failure'
    // A request that never produced a status has not "returned a status below 400"
    // either, so it belongs to AC-04. ERR_ABORTED is the one exception: Chromium
    // emits it for cancelled speculative preloads that were never going to be used,
    // and failing on it would make the gate flicker. It is noted, not ignored.
    if (reason.includes('net::ERR_ABORTED')) {
      gate.note(`aborted request at ${bp.width}px (not counted against AC-04): ${request.url()} — ${reason}`)
      return
    }
    record(failedRequests, {
      breakpoint: bp.name,
      width: bp.width,
      url: request.url(),
      status: reason,
      resourceType: request.resourceType(),
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
 */
function reportErrors(errors: RuntimeError[]): void {
  const byWidth = new Map<number, RuntimeError[]>()
  for (const e of errors) {
    const bucket = byWidth.get(e.width) ?? []
    bucket.push(e)
    byWidth.set(e.width, bucket)
  }

  for (const [width, bucket] of [...byWidth.entries()].sort((a, b) => a[0] - b[0])) {
    bucket.forEach((e, i) => {
      const source = e.line === null ? e.url : `${e.url}:${e.line}`
      const message =
        e.kind === 'pageerror'
          ? `AC-03 BUILD: uncaught exception or unhandled rejection at ${width}px. Error ${i + 1} of ${bucket.length}: "${e.text}"`
          : `AC-03 BUILD: ${bucket.length} console error(s) at ${width}px. Error ${i + 1} of ${bucket.length}: "${e.text}" from ${source}`

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

function reportFailedRequests(failures: FailedRequest[]): void {
  for (const f of [...failures].sort((a, b) => a.width - b.width || a.url.localeCompare(b.url))) {
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
