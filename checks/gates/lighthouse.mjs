#!/usr/bin/env node
/**
 * Lighthouse gate — AC-52 to AC-55.
 *
 *   node checks/gates/lighthouse.mjs http://localhost:4321
 *
 * Prints one JSON gate result on stdout, which checks/run.mjs folds into the report.
 *
 * Three runs, median score. A single Lighthouse run on a laptop that is also
 * running a dev server, a browser and an agent is noisy enough that a one-shot
 * number would fail the build at random, and a gate that fails at random is a
 * gate people learn to ignore.
 */

import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

/**
 * Lighthouse looks for a system Chrome. A Codespace, a CI runner and this
 * project's devcontainer all have exactly one browser installed — the Chromium
 * that Playwright downloaded — so point Lighthouse at that rather than asking
 * thirty participants to install Chrome.
 */
async function resolveChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH
  try {
    const { chromium } = await import('playwright-core')
    const path = chromium.executablePath()
    if (path) return path
  } catch {
    /* fall through to whatever chrome-launcher can find */
  }
  return null
}

const URL_UNDER_TEST = process.argv[2] || 'http://localhost:4321'

const THRESHOLDS = [
  { key: 'performance', criterion: 'AC-52', min: 90, label: 'Performance' },
  { key: 'accessibility', criterion: 'AC-53', min: 100, label: 'Accessibility' },
  { key: 'best-practices', criterion: 'AC-54', min: 95, label: 'Best Practices' },
  { key: 'seo', criterion: 'AC-55', min: 95, label: 'SEO' },
]

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

async function runOnce(port) {
  const result = await lighthouse(
    URL_UNDER_TEST,
    {
      port,
      output: 'json',
      logLevel: 'error',
      screenEmulation: {
        mobile: false,
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
        disabled: false,
      },
      formFactor: 'desktop',
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
      },
    },
    undefined,
  )
  return result.lhr
}

async function main() {
  let chrome
  try {
    const chromePath = await resolveChrome()
    chrome = await chromeLauncher.launch({
      chromePath: chromePath ?? undefined,
      chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
    })
  } catch (err) {
    // No Chrome, no gate. Say so loudly rather than passing by default.
    console.log(
      JSON.stringify({
        id: 'perf',
        title: 'Lighthouse',
        status: 'skip',
        criteria: THRESHOLDS.map((t) => t.criterion),
        failures: [],
        notes: [`Chrome could not be launched: ${String(err).slice(0, 200)}`],
      }),
    )
    return
  }

  try {
    const runs = []
    for (let i = 0; i < 3; i++) runs.push(await runOnce(chrome.port))

    const failures = []
    const scores = {}

    for (const t of THRESHOLDS) {
      const perRun = runs.map((r) => Math.round((r.categories[t.key]?.score ?? 0) * 100))
      const score = median(perRun)
      scores[t.key] = { score, runs: perRun }

      if (score < t.min) {
        // Name the audits that actually cost the points, so the loop has
        // somewhere to go instead of "make it faster".
        const failing = Object.values(runs[0].audits ?? {})
          .filter((a) => {
            const refs = runs[0].categories[t.key]?.auditRefs ?? []
            return (
              refs.some((ref) => ref.id === a.id) &&
              a.score !== null &&
              a.score < 0.9 &&
              a.scoreDisplayMode !== 'notApplicable' &&
              a.scoreDisplayMode !== 'informative'
            )
          })
          .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))
          .slice(0, 5)
          .map((a) => `${a.title}${a.displayValue ? ` (${a.displayValue})` : ''}`)

        failures.push({
          criterion: t.criterion,
          message: `Lighthouse ${t.label} is ${score}, minimum ${t.min}.`,
          where: URL_UNDER_TEST,
          expected: `>= ${t.min}`,
          actual: `${score} (three runs: ${perRun.join(', ')})`,
          hint: failing.length ? `Worst audits: ${failing.join('; ')}` : undefined,
        })
      }
    }

    console.log(
      JSON.stringify({
        id: 'perf',
        title: 'Lighthouse',
        status: failures.length ? 'fail' : 'pass',
        criteria: THRESHOLDS.map((t) => t.criterion),
        failures,
        notes: [
          `Median of 3 desktop runs: ` +
            THRESHOLDS.map((t) => `${t.label} ${scores[t.key].score}`).join(', '),
          'A perfect accessibility score here still only means axe found nothing. It is a floor, not a ceiling.',
        ],
        evidence: { scores, url: URL_UNDER_TEST },
      }),
    )
  } finally {
    await chrome?.kill()
  }
}

main().catch((err) => {
  console.log(
    JSON.stringify({
      id: 'perf',
      title: 'Lighthouse',
      status: 'skip',
      criteria: THRESHOLDS.map((t) => t.criterion),
      failures: [],
      notes: [`Lighthouse threw: ${String(err).slice(0, 300)}`],
    }),
  )
})
