#!/usr/bin/env node
/**
 * Build gate — AC-01, AC-02, AC-05.
 *
 *   node checks/gates/build.mjs [--no-build]
 *
 * Prints one JSON gate result on stdout, which checks/run.mjs folds into the report.
 * Progress goes to stderr, so stdout stays a single parseable object.
 *
 *   AC-01  `astro build` exits 0
 *   AC-02  `astro check` reports zero TypeScript errors
 *   AC-05  dist/ contains exactly one HTML file, index.html
 *
 * AC-03 (no console errors or unhandled rejections during load) and AC-04 (no network
 * response >= 400 during load) are the other half of the BUILD family. They need a live
 * browser at three viewports, so they live in checks/specs/runtime.spec.ts and report
 * under their own Gate. They are not missing from here; they are somewhere a Node script
 * cannot reach.
 *
 * The rule this file is built around: a criterion that could not be evaluated is a SKIP
 * with a stated reason, never a pass. `astro check` in particular exits 0 when
 * @astrojs/check is not installed — it prints "the packages are required" and gives up —
 * so a gate that trusted the exit code alone would report a green type check on a project
 * with no type checker at all. That is the exact failure mode this workshop is about.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, readdirSync } from 'node:fs'
import { dirname, join, posix, relative, sep } from 'node:path'
import { ROOT, STATUS } from '../lib/report.mjs'

const argv = process.argv.slice(2)

/** Mirrors `npm run check -- --no-build`: reuse the existing dist/ instead of rebuilding. */
const NO_BUILD = argv.includes('--no-build')

/**
 * Generous, but finite. A hung child is indistinguishable from a slow one until something
 * decides; an unbounded wait turns the whole loop into a hang with no report to read.
 */
const BUILD_TIMEOUT_MS = Number(process.env.CHECK_BUILD_TIMEOUT_MS || 300_000)
const TYPECHECK_TIMEOUT_MS = Number(process.env.CHECK_TYPECHECK_TIMEOUT_MS || 180_000)

const CRITERIA = ['AC-01', 'AC-02', 'AC-05']
const DIST = join(ROOT, 'dist')

const require_ = createRequire(join(ROOT, 'package.json'))

const failures = []
const notes = []
/** Criteria that could not be evaluated. Their presence downgrades the gate to SKIP. */
const unevaluated = []

const progress = (text) => process.stderr.write(`  ${text}\n`)

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * TypeScript's diagnostic formatter emits SGR colour codes unconditionally — it does not
 * consult isTTY — so anything that parses `astro check` output has to strip them first,
 * or every regex has to account for an escape sequence in the middle of a file path.
 */
const stripAnsi = (text) => text.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '')

/**
 * Run a Node entry point as a child process and collect everything it said.
 *
 * stdin is /dev/null on purpose. `astro check` offers to npm-install @astrojs/check when
 * it is missing, and an interactive prompt inside a gate would wait forever for an answer
 * nobody is there to give.
 */
function runNode(args, timeoutMs) {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const child = spawn(process.execPath, args, {
      cwd: ROOT,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    })

    let stdout = ''
    let stderr = ''
    let timedOut = false

    const timer = setTimeout(() => {
      timedOut = true
      child.kill('SIGKILL')
    }, timeoutMs)

    child.stdout.on('data', (d) => (stdout += d))
    child.stderr.on('data', (d) => (stderr += d))

    const finish = (code, spawnError) => {
      clearTimeout(timer)
      resolve({
        code,
        stdout: stripAnsi(stdout),
        stderr: stripAnsi(stderr),
        timedOut,
        spawnError,
        durationMs: Date.now() - startedAt,
      })
    }

    child.on('close', (code) => finish(code ?? 1))
    child.on('error', (err) => finish(1, String(err)))
  })
}

/**
 * Resolve the astro CLI through the project's own node_modules rather than shelling out to
 * npx. Two reasons: npx is a second resolution step that can pick a different astro, and a
 * missing astro then surfaces as an npx error instead of a fact the gate can report.
 * `astro/astro.js` is not in the package's exports map, so go via package.json + bin.
 */
function resolveAstroCli() {
  try {
    const manifestPath = require_.resolve('astro/package.json')
    const manifest = require_('astro/package.json')
    const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin?.astro
    if (!bin) return null
    const entry = join(dirname(manifestPath), bin)
    return existsSync(entry) ? entry : null
  } catch {
    return null
  }
}

/** True when the package resolves from the project root. Used to tell "absent" from "broken". */
function isInstalled(name) {
  try {
    require_.resolve(name)
    return true
  } catch {
    return false
  }
}

const STACK_NOISE = /^(at\s|Stack trace:|file:)/

/**
 * Astro prefixes every log line with the wall-clock time. Dropping it keeps the failure
 * message byte-identical between two runs over the same broken input, which is what lets
 * the loop tell "still the same error" from "a new error".
 */
const stripTimestamp = (line) => line.replace(/^\d{1,2}:\d{2}:\d{2}\s+/, '')

const VITE_BANNER = /\bBuild failed in\b/

/**
 * Pull the one line worth putting in the failure message out of a failed build.
 *
 * The last line of a failed `astro build` is a rollup stack frame pointing into
 * node_modules, which tells the loop nothing. The real error is the last `[ERROR]` marker
 * and the line or two under it, so prefer that and fall back to the last line that is not
 * stack noise.
 */
function extractLastError(text) {
  const lines = text
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l.trim() !== '')

  if (lines.length === 0) return ''

  const markerIndex = lines.map((l) => l.includes('[ERROR]')).lastIndexOf(true)
  const picked = []

  if (markerIndex >= 0) {
    picked.push(stripTimestamp(lines[markerIndex].trim()))
    for (const line of lines.slice(markerIndex + 1, markerIndex + 3)) {
      if (STACK_NOISE.test(line.trim())) break
      picked.push(stripTimestamp(line.trim()))
    }
    // vite's "Build failed in 648ms" banner names no cause and carries a duration that
    // changes every run, which would make an otherwise identical failure read as a new one.
    // Keep it only when nothing more specific followed it.
    if (picked.length > 1) {
      const withoutBanner = picked.filter((l) => !VITE_BANNER.test(l))
      if (withoutBanner.length) picked.splice(0, picked.length, ...withoutBanner)
    }
  } else {
    const lastUseful = [...lines].reverse().find((l) => !STACK_NOISE.test(l.trim()))
    picked.push(stripTimestamp((lastUseful ?? lines[lines.length - 1]).trim()))
  }

  return truncate(picked.join(' — '), 300)
}

const truncate = (text, max) => (text.length > max ? `${text.slice(0, max - 1)}…` : text)

/** Keep the tail, not the head: the cause is printed last, the banner is printed first. */
const tail = (text, lineCount) =>
  text
    .split('\n')
    .filter((l) => l.trim() !== '')
    .slice(-lineCount)
    .map((l) => stripTimestamp(l.trimEnd()))
    .join('\n')

const fenced = (text) => `\n\n\`\`\`\n${text}\n\`\`\``

// ── AC-01: astro build exits 0 ────────────────────────────────────────────────

async function checkBuild() {
  if (NO_BUILD) {
    // The flag says "do not run the build", so the exit code of the build is not a thing
    // this run knows. dist/ still has to exist, or there is nothing for the later gates to
    // read — that part is a fact and stays a hard failure.
    if (!existsSync(join(DIST, 'index.html'))) {
      failures.push({
        criterion: 'AC-01',
        message: 'dist/index.html does not exist and --no-build was passed.',
        where: 'dist/index.html',
        expected: 'an existing build to re-check',
        actual: 'no dist/index.html',
        hint: 'Drop --no-build, or run npm run build first.',
      })
      return { ran: false, ok: false }
    }
    unevaluated.push('AC-01')
    notes.push('AC-01 not evaluated: --no-build was passed, so astro build never ran. The existing dist/ was reused.')
    return { ran: false, ok: true }
  }

  const astroCli = resolveAstroCli()
  if (!astroCli) {
    // No astro, no build. This is absence of tooling, not a broken page.
    unevaluated.push('AC-01')
    notes.push('AC-01 not evaluated: the astro CLI could not be resolved from the project. Run npm install.')
    return { ran: false, ok: true }
  }

  progress('astro build')
  const result = await runNode([astroCli, 'build'], BUILD_TIMEOUT_MS)
  const output = `${result.stdout}\n${result.stderr}`

  if (result.timedOut) {
    failures.push({
      criterion: 'AC-01',
      message: `astro build did not finish within ${Math.round(BUILD_TIMEOUT_MS / 1000)}s and was killed.`,
      where: 'astro build',
      expected: 'exit code 0',
      actual: `killed after ${Math.round(result.durationMs / 1000)}s`,
      hint: `Build output (last 40 lines):${fenced(tail(output, 40))}`,
    })
    return { ran: true, ok: false, exitCode: null, durationMs: result.durationMs }
  }

  if (result.code !== 0) {
    const lastError = extractLastError(result.stderr) || extractLastError(result.stdout)
    failures.push({
      criterion: 'AC-01',
      message: `astro build exited ${result.code}.${lastError ? ` Last error: ${lastError}` : ''}`,
      where: 'astro build',
      expected: 'exit code 0',
      actual: `exit code ${result.code}`,
      hint: `Build output (last 40 lines):${fenced(tail(output, 40))}`,
    })
    return { ran: true, ok: false, exitCode: result.code, durationMs: result.durationMs }
  }

  // Exit 0 with no page emitted is still a failed build, whatever the exit code claims.
  if (!existsSync(join(DIST, 'index.html'))) {
    failures.push({
      criterion: 'AC-01',
      message: 'astro build exited 0 but produced no dist/index.html.',
      where: 'dist/',
      expected: 'dist/index.html',
      actual: existsSync(DIST) ? 'dist/ exists but has no index.html' : 'no dist/ directory',
    })
    return { ran: true, ok: false, exitCode: 0, durationMs: result.durationMs }
  }

  return { ran: true, ok: true, exitCode: 0, durationMs: result.durationMs }
}

// ── AC-02: astro check reports zero TypeScript errors ─────────────────────────

/**
 * `astro check` prints, per diagnostic:
 *
 *   src/pages/index.astro:12:5 - error ts(2322): Type 'string' is not assignable to 'number'.
 *
 * followed by a code frame, and then a summary block:
 *
 *   Result (5 files):
 *   - 2 errors
 *   - 0 warnings
 *   - 0 hints
 *
 * The summary is the count of record; the diagnostic lines supply the location. Parsing
 * both means a mismatch between them shows up instead of being averaged away.
 */
const DIAGNOSTIC = /^(.*?):(\d+):(\d+)\s+-\s+(error|warning|hint)\s+([^:]*):\s*(.*)$/

function parseCheckOutput(text) {
  const summaryIndex = text.lastIndexOf('Result (')
  const summary = summaryIndex >= 0 ? text.slice(summaryIndex) : null

  const count = (pattern) => {
    const match = summary?.match(pattern)
    return match ? Number(match[1]) : null
  }

  const diagnostics = []
  for (const rawLine of text.split('\n')) {
    const match = rawLine.trimEnd().match(DIAGNOSTIC)
    if (!match) continue
    diagnostics.push({
      file: match[1].trim(),
      line: Number(match[2]),
      col: Number(match[3]),
      severity: match[4],
      code: match[5].trim(),
      message: match[6].trim(),
    })
  }

  return {
    hasSummary: summary !== null,
    filesChecked: count(/Result \((\d+) files?\)/),
    errors: count(/-\s*(\d+)\s+errors?\b/),
    warnings: count(/-\s*(\d+)\s+warnings?\b/),
    hints: count(/-\s*(\d+)\s+hints?\b/),
    diagnostics,
  }
}

async function checkTypes() {
  const astroCli = resolveAstroCli()
  const missing = ['@astrojs/check', 'typescript'].filter((name) => !isInstalled(name))

  if (!astroCli || missing.length) {
    // astro exits 0 in this situation. Reporting a pass here would mean the gate is green
    // precisely because nothing checked anything.
    unevaluated.push('AC-02')
    notes.push(
      `AC-02 not evaluated: ${
        astroCli ? `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} not installed` : 'the astro CLI could not be resolved'
      }. astro check exits 0 when its dependencies are absent, so this is reported as unevaluated rather than passing. Run npm install.`,
    )
    return { ran: false }
  }

  progress('astro check')
  const result = await runNode([astroCli, 'check'], TYPECHECK_TIMEOUT_MS)
  const output = `${result.stdout}\n${result.stderr}`

  if (result.timedOut) {
    unevaluated.push('AC-02')
    notes.push(
      `AC-02 not evaluated: astro check did not finish within ${Math.round(TYPECHECK_TIMEOUT_MS / 1000)}s and was killed. ` +
        'No error count was produced, so nothing is claimed about the types.',
    )
    return { ran: true, timedOut: true, durationMs: result.durationMs }
  }

  const parsed = parseCheckOutput(output)

  // The "dependencies are required" path: exit 0, no summary, nothing checked.
  if (!parsed.hasSummary && output.includes('packages are required for this command')) {
    unevaluated.push('AC-02')
    notes.push('AC-02 not evaluated: astro check reported that @astrojs/check and typescript are required. Run npm install.')
    return { ran: true, durationMs: result.durationMs }
  }

  if (!parsed.hasSummary) {
    if (result.code === 0) {
      // Exit 0 and no diagnostics summary: the command did not do its job, and its exit
      // code is not evidence of anything. Do not convert silence into a pass.
      unevaluated.push('AC-02')
      notes.push(
        `AC-02 not evaluated: astro check exited 0 but printed no diagnostics summary, so the error count could not be read.${fenced(
          tail(output, 20),
        )}`,
      )
      return { ran: true, durationMs: result.durationMs }
    }

    // Nonzero and no summary: the type checker itself broke. That is a failing command,
    // not a missing one, and the loop needs to see it.
    failures.push({
      criterion: 'AC-02',
      message: `astro check exited ${result.code} without reporting a diagnostics summary.`,
      where: 'astro check',
      expected: '0 type error(s)',
      actual: `exit code ${result.code}, no "Result (n files)" summary`,
      hint: `astro check output (last 20 lines):${fenced(tail(output, 20))}`,
    })
    return { ran: true, durationMs: result.durationMs }
  }

  const errors = parsed.errors ?? 0
  const errorDiagnostics = parsed.diagnostics.filter((d) => d.severity === 'error')

  if (errors > 0) {
    // "First" means first reported. astro check prints diagnostics in a fixed order for a
    // given input, so this is stable across runs — idempotence matters more here than
    // picking the topmost line number.
    const first = errorDiagnostics[0]
    const location = first ? `${first.file}:${first.line}:${first.col} ${first.message}` : 'location not reported'

    failures.push({
      criterion: 'AC-02',
      message: `${errors} type error(s). First: ${location}`,
      where: first ? `${first.file}:${first.line}:${first.col}` : 'astro check',
      expected: '0 type error(s)',
      actual: `${errors} error(s) across ${parsed.filesChecked ?? '?'} file(s)`,
      hint: errorDiagnostics.length
        ? `All type errors (first 5):${fenced(
            errorDiagnostics
              .slice(0, 5)
              .map((d) => `${d.file}:${d.line}:${d.col} ${d.code}: ${d.message}`)
              .join('\n'),
          )}`
        : `astro check output (last 20 lines):${fenced(tail(output, 20))}`,
    })
  } else if (errorDiagnostics.length > 0) {
    // Summary and diagnostics disagree. Believe the worse of the two rather than the
    // convenient one.
    failures.push({
      criterion: 'AC-02',
      message: `${errorDiagnostics.length} type error(s). First: ${errorDiagnostics[0].file}:${errorDiagnostics[0].line}:${errorDiagnostics[0].col} ${errorDiagnostics[0].message}`,
      where: 'astro check',
      expected: '0 type error(s)',
      actual: `summary said 0 errors but ${errorDiagnostics.length} error diagnostic(s) were printed`,
    })
  }

  if ((parsed.warnings ?? 0) > 0) {
    // AC-02 is about errors. Warnings are worth surfacing and are not a failure.
    notes.push(`astro check also reported ${parsed.warnings} warning(s). AC-02 only gates errors.`)
  }

  return {
    ran: true,
    durationMs: result.durationMs,
    errors,
    warnings: parsed.warnings,
    hints: parsed.hints,
    filesChecked: parsed.filesChecked,
    exitCode: result.code,
  }
}

// ── AC-05: dist/ holds exactly one HTML file, index.html ──────────────────────

/** Recursive walk instead of a glob dependency: dist/ is small and this has no install cost. */
function collectHtmlFiles(dir) {
  const found = []
  if (!existsSync(dir)) return found

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...collectHtmlFiles(full))
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      // posix separators so the message reads the same on every machine
      found.push(relative(DIST, full).split(sep).join(posix.sep))
    }
  }
  return found.sort()
}

function checkSinglePage() {
  if (!existsSync(DIST)) {
    failures.push({
      criterion: 'AC-05',
      message: 'dist/ contains 0 HTML files, expected 1 (index.html). dist/ does not exist.',
      where: 'dist/',
      expected: 'exactly index.html',
      actual: 'no dist/ directory',
    })
    return { htmlFiles: [] }
  }

  const htmlFiles = collectHtmlFiles(DIST)
  const extra = htmlFiles.filter((f) => f !== 'index.html')
  const hasIndex = htmlFiles.includes('index.html')

  if (htmlFiles.length !== 1 || !hasIndex) {
    const shown = extra.slice(0, 10)
    const extraText = extra.length
      ? ` Extra: ${shown.join(', ')}${extra.length > shown.length ? `, and ${extra.length - shown.length} more` : ''}`
      : ''

    failures.push({
      criterion: 'AC-05',
      message:
        `dist/ contains ${htmlFiles.length} HTML file(s), expected 1 (index.html).` +
        extraText +
        (hasIndex ? '' : ' index.html is missing.'),
      where: 'dist/',
      expected: 'exactly index.html',
      actual: htmlFiles.length ? htmlFiles.join(', ') : 'no HTML files',
      // CANON §11: one page. Extra HTML files are how scope creep shows up on disk,
      // usually before anyone has agreed to it.
      hint: extra.length
        ? 'CANON §11 puts blog, news archive and artist detail pages out of scope. The deliverable is one page.'
        : undefined,
    })
  }

  return { htmlFiles }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function emit(payload) {
  process.stdout.write(JSON.stringify(payload))
}

function status() {
  if (failures.length) return STATUS.FAIL
  if (unevaluated.length) return STATUS.SKIP
  return STATUS.PASS
}

async function main() {
  const build = await checkBuild()

  // The type check runs even when the build failed. Type errors are frequently the reason
  // the build failed, and the loop should get both in one report rather than one per pass.
  const types = await checkTypes()

  const dist = checkSinglePage()

  if (!build.ok && dist.htmlFiles.length) {
    notes.push('The build did not succeed, so the dist/ contents AC-05 inspected may be left over from an earlier run.')
  }

  const gateStatus = status()

  emit({
    id: 'build',
    title: 'Build',
    status: gateStatus,
    criteria: CRITERIA,
    failures,
    notes,
    evidence: {
      build: { ran: build.ran, exitCode: build.exitCode ?? null, durationMs: build.durationMs ?? null },
      typecheck: {
        ran: Boolean(types.ran),
        errors: types.errors ?? null,
        warnings: types.warnings ?? null,
        hints: types.hints ?? null,
        filesChecked: types.filesChecked ?? null,
        durationMs: types.durationMs ?? null,
      },
      dist: { htmlFiles: dist.htmlFiles },
      unevaluated,
    },
  })

  // Exit 1 on failure so `npm run check:build` is usable on its own, the way every gate in
  // brief/ACCEPTANCE.md is described: a program that returns 0 or 1 and prints a message.
  // A SKIP is not a failure of the page, so it exits 0 with its reason in notes.
  process.exitCode = gateStatus === STATUS.FAIL ? 1 : 0
}

main().catch((err) => {
  // An unexpected throw means the gate did not reach a verdict. Say that, rather than
  // letting an empty failure list read as a pass.
  emit({
    id: 'build',
    title: 'Build',
    status: STATUS.SKIP,
    criteria: CRITERIA,
    failures,
    notes: [...notes, `The build gate threw before reaching a verdict: ${truncate(String(err), 300)}`],
    evidence: { unevaluated: CRITERIA },
  })
  process.exitCode = 0
})
