#!/usr/bin/env node
/**
 * Build gate — AC-01, AC-02, AC-05.
 *
 *   node checks/gates/build.mjs [--no-build]
 *
 * Prints one JSON gate result on stdout, which checks/run.mjs folds into the report.
 * Progress goes to stderr, so stdout stays a single parseable object.
 *
 *   AC-01  the shipped build (`npm run build`: prebuild hook, then `astro build`) exits 0
 *   AC-02  `astro check` reports zero TypeScript errors across src/
 *   AC-05  dist/ contains exactly one servable HTML page, index.html
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
 *
 * Three corollaries, each of which used to be a hole in this file:
 *
 *   1. A SKIP is not free. `npm run check:build` exits non-zero for a SKIP as well as a
 *      FAIL, because "nobody checked" and "checked and fine" must not be the same exit
 *      code to a loop whose stopping condition is an exit code. Only a full PASS exits 0.
 *
 *   2. A blocking criterion that the repository disabled is a FAIL, not a SKIP. A declared
 *      devDependency that does not resolve, a type check that timed out, a tsconfig that
 *      no longer covers src/ — those are defects in the deliverable. SKIP is reserved for
 *      causes outside the repository, and for `--no-build`, which is the operator saying
 *      "do not measure this".
 *
 *   3. AC-02 asserts the shape of the check, not only its output. `astro check` prints
 *      "Result (0 files): - 0 errors" and exits 0 when the project config matches nothing,
 *      so an error count alone is evidence of nothing. This gate type-checks src/ under a
 *      config it writes itself, counts the files it expects to be checked, and refuses a
 *      verdict that covers fewer files than src/ contains.
 */

import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, readdirSync, readlinkSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, posix, relative, sep } from 'node:path'
import { ROOT, STATUS } from '../lib/report.mjs'

const argv = process.argv.slice(2)

/** Mirrors `npm run check -- --no-build`: reuse the existing dist/ instead of rebuilding. */
const NO_BUILD = argv.includes('--no-build')

/**
 * Generous, but finite. A hung child is indistinguishable from a slow one until something
 * decides; an unbounded wait turns the whole loop into a hang with no report to read.
 *
 * The override is read defensively. `CHECK_TYPECHECK_TIMEOUT_MS=1` used to be a way to
 * make AC-02 stop blocking — the check was SIGKILLed and the criterion went unevaluated.
 * A timeout is now a failure, so shrinking this only turns the gate red; a garbage value
 * falls back to the default rather than to setTimeout(NaN), which fires immediately.
 */
const positiveMs = (raw, fallback) => {
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}
const BUILD_TIMEOUT_MS = positiveMs(process.env.CHECK_BUILD_TIMEOUT_MS, 300_000)
const TYPECHECK_TIMEOUT_MS = positiveMs(process.env.CHECK_TYPECHECK_TIMEOUT_MS, 180_000)

const CRITERIA = ['AC-01', 'AC-02', 'AC-05']
const DIST = join(ROOT, 'dist')
const SRC = join(ROOT, 'src')

/** The command netlify.toml runs, and the one package.json documents. See checkShippedBuild(). */
const SHIPPED_BUILD_SCRIPT = 'astro build'

const require_ = createRequire(join(ROOT, 'package.json'))

const failures = []
const notes = []
/** Criteria that could not be evaluated. Their presence downgrades the gate to SKIP. */
const unevaluated = []

/**
 * Criteria that reached a verdict — pass, fail, or a stated skip. The catch-all at the
 * bottom needs this: a criterion that was still being evaluated when the process died is
 * not unevaluated in the ordinary sense, it is unknown after a defect, and the difference
 * has to survive into the report.
 */
const settled = new Set()

/** Partial results, filled in as each phase finishes, so a throw still reports what was learned. */
const evidence = {
  build: { ran: false, exitCode: null, durationMs: null },
  typecheck: { ran: false, errors: null, warnings: null, hints: null, filesChecked: null, expectedFiles: null, tsconfig: null, durationMs: null },
  dist: { htmlFiles: [] },
  unevaluated,
}

const progress = (text) => process.stderr.write(`  ${text}\n`)

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * TypeScript's diagnostic formatter emits SGR colour codes unconditionally — it does not
 * consult isTTY — so anything that parses `astro check` output has to strip them first,
 * or every regex has to account for an escape sequence in the middle of a file path.
 */
const stripAnsi = (text) => text.replace(/\[[0-?]*[ -/]*[@-~]/g, '')

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

const toPosix = (path) => path.split(sep).join(posix.sep)

/**
 * tsconfig.json is JSON with comments — astro's own presets ship them, and hand-edited
 * configs collect them. JSON.parse refuses both, and a config this gate cannot read must
 * not silently become a config this gate stops asserting on.
 */
function stripJsonComments(text) {
  let out = ''
  let inString = false
  let inLine = false
  let inBlock = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    const next = text[i + 1]

    if (inLine) {
      if (ch === '\n') {
        inLine = false
        out += ch
      }
      continue
    }
    if (inBlock) {
      if (ch === '*' && next === '/') {
        inBlock = false
        i++
      }
      continue
    }
    if (inString) {
      out += ch
      if (ch === '\\') {
        out += next ?? ''
        i++
      } else if (ch === '"') {
        inString = false
      }
      continue
    }
    if (ch === '"') {
      inString = true
      out += ch
      continue
    }
    if (ch === '/' && next === '/') {
      inLine = true
      i++
      continue
    }
    if (ch === '/' && next === '*') {
      inBlock = true
      i++
      continue
    }
    out += ch
  }

  // Trailing commas are legal in tsconfig and illegal in JSON.
  return out.replace(/,(\s*[}\]])/g, '$1')
}

function readJsonFile(path) {
  try {
    return { ok: true, value: JSON.parse(stripJsonComments(readFileSync(path, 'utf8'))) }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}

/**
 * tsconfig-style glob to RegExp: `**` spans path segments, `*` and `?` do not. Used to ask
 * whether an `exclude` entry would take a src/ file out of the type check — the cheapest
 * way to turn a red AC-02 green is to stop checking the file that is red.
 */
function globToRegExp(pattern) {
  let source = '^'
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '*') {
      if (pattern[i + 1] === '*') {
        // `**/` may match zero segments, which is why the slash is swallowed here.
        if (pattern[i + 2] === '/') {
          source += '(?:[^/]*/)*'
          i += 2
        } else {
          source += '.*'
          i += 1
        }
      } else {
        source += '[^/]*'
      }
    } else if (ch === '?') {
      source += '[^/]'
    } else {
      source += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`${source}$`)
}

/** tsconfig treats a bare directory name as "everything under it", not as a literal file. */
function patternCovers(pattern, file) {
  const normalised = pattern.replace(/^\.\//, '').replace(/\/+$/, '')
  if (!normalised) return false
  if (file === normalised || file.startsWith(`${normalised}/`)) return true
  return globToRegExp(normalised).test(file)
}

const SOURCE_EXT = /\.(ts|tsx|astro)$/i

/**
 * Every file AC-02 speaks for. The gate enumerates these itself rather than asking the
 * project how many files it thinks exist, because the project's answer is the thing under
 * test: `astro check` reporting "0 files" is a green run over nothing at all.
 */
function collectSourceFiles(dir = SRC) {
  const found = []
  if (!existsSync(dir)) return found
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      found.push(...collectSourceFiles(full))
    } else if (entry.isFile() && SOURCE_EXT.test(entry.name)) {
      found.push(toPosix(relative(ROOT, full)))
    }
  }
  return found.sort()
}

/** Newest mtime under a file or directory, or 0 when it does not exist. */
function newestMtimeMs(path) {
  let stats
  try {
    stats = statSync(path)
  } catch {
    return 0
  }
  if (!stats.isDirectory()) return stats.mtimeMs

  let newest = stats.mtimeMs
  let entries
  try {
    entries = readdirSync(path, { withFileTypes: true })
  } catch {
    return newest
  }
  for (const entry of entries) {
    newest = Math.max(newest, newestMtimeMs(join(path, entry.name)))
  }
  return newest
}

// ── AC-01: the shipped build exits 0 ──────────────────────────────────────────

/**
 * The build that ships is `npm run build`, which netlify.toml names as the site's build
 * command. npm runs the `prebuild` hook first, and that hook is what copies design/assets
 * into public/images. A gate that invokes the astro binary directly skips the hook, so it
 * would certify a dist/ the deploy would never produce — green here, broken image on the
 * live site, and a repair prompt pointing at the markup instead of at the missing copy.
 *
 * So: read the shipped scripts, refuse to proceed if they no longer describe the command
 * this gate knows how to reproduce, and run the hooks in the order npm would.
 */
function readShippedBuild() {
  const manifest = readJsonFile(join(ROOT, 'package.json'))
  if (!manifest.ok) {
    failures.push({
      criterion: 'AC-01',
      message: `package.json could not be parsed, so the shipped build command is unknown: ${truncate(manifest.error, 200)}`,
      where: 'package.json',
      expected: 'readable JSON declaring scripts.build',
      actual: 'unparseable',
    })
    return null
  }

  const scripts = manifest.value?.scripts ?? {}
  const shape = { build: scripts.build ?? null, prebuild: scripts.prebuild ?? null, postbuild: scripts.postbuild ?? null }
  let usable = true

  if (shape.build !== SHIPPED_BUILD_SCRIPT) {
    failures.push({
      criterion: 'AC-01',
      message: `package.json scripts.build is ${shape.build === null ? 'missing' : `"${shape.build}"`}, not "${SHIPPED_BUILD_SCRIPT}". The gate and the deploy would run different commands.`,
      where: 'package.json scripts.build',
      expected: `"${SHIPPED_BUILD_SCRIPT}"`,
      actual: shape.build === null ? 'no build script' : `"${shape.build}"`,
      hint: 'netlify.toml runs `npm run build`. AC-01 only means something while that is the command this gate reproduces.',
    })
    usable = false
  }

  if (shape.postbuild !== null) {
    failures.push({
      criterion: 'AC-01',
      message: `package.json declares a postbuild script ("${shape.postbuild}"), which this gate does not run. The verified dist/ and the shipped dist/ would differ.`,
      where: 'package.json scripts.postbuild',
      expected: 'no postbuild hook',
      actual: `"${shape.postbuild}"`,
    })
    usable = false
  }

  // Deliberately narrow: `node <script>` is the only hook shape this gate can run without a
  // shell. Anything else is not refused because it is wrong, but because the gate can no
  // longer claim to have run what the deploy runs, and that claim is the whole of AC-01.
  let prebuildArgs = null
  if (shape.prebuild !== null) {
    const match = /^node\s+([^\s&|;]+)$/.exec(shape.prebuild.trim())
    if (!match) {
      failures.push({
        criterion: 'AC-01',
        message: `package.json scripts.prebuild is "${shape.prebuild}", which this gate cannot reproduce. AC-01 would then certify a build the deploy does not run.`,
        where: 'package.json scripts.prebuild',
        expected: 'a hook of the form `node <script>`',
        actual: `"${shape.prebuild}"`,
      })
      usable = false
    } else {
      prebuildArgs = [join(ROOT, match[1])]
    }
  }

  return { ...shape, prebuildArgs, usable }
}

/**
 * Under --no-build nothing in this run ties dist/ to src/. That is a real gap, and the
 * honest half of it is checkable: if any source is newer than the page that was supposedly
 * built from it, the dist/ every downstream gate is about to score is stale, and saying so
 * is a fact rather than a guess.
 *
 * mtime ordering proves staleness, not provenance. A hand-written dist/index.html with a
 * recent timestamp passes this and is still not a build — which is why AC-01 stays
 * unevaluated here rather than passing.
 */
const PROVENANCE_INPUTS = ['src', 'public', 'astro.config.mjs', 'package.json', 'tsconfig.json']

function checkDistFreshness() {
  const builtAt = newestMtimeMs(join(DIST, 'index.html'))
  let newestInput = 0
  let newestInputName = null

  for (const input of PROVENANCE_INPUTS) {
    const mtime = newestMtimeMs(join(ROOT, input))
    if (mtime > newestInput) {
      newestInput = mtime
      newestInputName = input
    }
  }

  if (newestInput > builtAt) {
    failures.push({
      criterion: 'AC-01',
      message: `dist/index.html is older than its sources: ${newestInputName} changed after the last build. --no-build would check a stale page.`,
      where: 'dist/index.html',
      expected: 'a dist/ at least as new as src/, public/ and the config',
      actual: `dist/index.html ${new Date(builtAt).toISOString()}, ${newestInputName} ${new Date(newestInput).toISOString()}`,
      hint: 'Drop --no-build, or run npm run build first.',
    })
    return false
  }
  return true
}

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

    if (!checkDistFreshness()) return { ran: false, ok: false }

    unevaluated.push('AC-01')
    notes.push(
      'AC-01 not evaluated: --no-build was passed, so the build never ran and nothing in this run ties dist/ to src/. ' +
        'dist/ is at least as new as its sources, which rules out a stale page but does not prove one was built from them. ' +
        'The gate exits non-zero for this, because an unevaluated blocking criterion is not a pass.',
    )
    return { ran: false, ok: true }
  }

  const astroCli = resolveAstroCli()
  if (!astroCli) {
    // astro is a declared dependency of this repository. Its absence is a defect in the
    // deliverable, not a fact about the machine, so it is a failure rather than a skip:
    // a skip here used to be a way to make AC-01 stop blocking.
    failures.push({
      criterion: 'AC-01',
      message: 'The astro CLI could not be resolved from the project, so the build could not run.',
      where: 'node_modules/astro',
      expected: 'astro resolvable from the project root (it is a dependency in package.json)',
      actual: 'not resolvable',
      hint: 'Run npm install.',
    })
    return { ran: false, ok: false }
  }

  const shipped = readShippedBuild()
  if (!shipped || !shipped.usable) return { ran: false, ok: false, shipped }

  if (shipped.prebuildArgs) {
    progress(`npm prebuild (${shipped.prebuild})`)
    const pre = await runNode(shipped.prebuildArgs, BUILD_TIMEOUT_MS)
    const preOutput = `${pre.stdout}\n${pre.stderr}`
    if (pre.timedOut || pre.code !== 0) {
      failures.push({
        criterion: 'AC-01',
        message: `npm run build failed in its prebuild step (${shipped.prebuild}): ${
          pre.timedOut ? `killed after ${Math.round(pre.durationMs / 1000)}s` : `exit code ${pre.code}`
        }.`,
        where: shipped.prebuild,
        expected: 'exit code 0',
        actual: pre.timedOut ? 'killed on timeout' : `exit code ${pre.code}`,
        hint: `prebuild output (last 20 lines):${fenced(tail(preOutput, 20))}`,
      })
      return { ran: false, ok: false, shipped }
    }
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
    return { ran: true, ok: false, exitCode: null, durationMs: result.durationMs, shipped }
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
    return { ran: true, ok: false, exitCode: result.code, durationMs: result.durationMs, shipped }
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
    return { ran: true, ok: false, exitCode: 0, durationMs: result.durationMs, shipped }
  }

  return { ran: true, ok: true, exitCode: 0, durationMs: result.durationMs, shipped }
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
 *
 * The error code is optional in the pattern, and a second pattern covers tsc's own
 * `file(line,col): error TS2322:` wording. A diagnostic the gate cannot parse must not
 * become a diagnostic the gate did not see: the parse degrades to red, never to green.
 */
const DIAGNOSTIC = /^(.*?):(\d+):(\d+)\s+-\s+(error|warning|hint)\b\s*(?:([^:]*):)?\s*(.*)$/
const TSC_DIAGNOSTIC = /^(.*?)\((\d+),(\d+)\):\s+(error|warning)\s+(TS\d+):\s*(.*)$/

/** Exactly the line @astrojs/check prints, anchored, so a substring elsewhere cannot pose as it. */
const SUMMARY_HEAD = /^Result \((\d+) files?\):$/

/**
 * Parse the summary from the tail of the child's own stdout.
 *
 * Two deliberate narrowings. First, stdout only: the gate used to scan stdout and stderr
 * concatenated, and because stderr was appended after all of stdout, anything the project
 * wrote to stderr during the check — astro.config.mjs runs as project code — landed after
 * the real summary and won. Second, the last *anchored* summary head rather than the last
 * occurrence of a substring, and the counts are read only from the block directly under
 * it. @astrojs/check prints this block with console.info, i.e. stdout, as its final act.
 *
 * Diagnostics are read from stdout and stderr together, because a diagnostic can only add
 * a failure, never remove one. A forged diagnostic line makes the gate redder; a forged
 * summary is caught by the exit-code cross-check in checkTypes().
 */
function parseCheckOutput(stdout, combined) {
  const lines = stdout.split('\n').map((l) => l.trimEnd())

  let headIndex = -1
  let filesChecked = null
  for (let i = lines.length - 1; i >= 0; i--) {
    const match = SUMMARY_HEAD.exec(lines[i].trim())
    if (match) {
      headIndex = i
      filesChecked = Number(match[1])
      break
    }
  }

  let errors = null
  let warnings = null
  let hints = null

  if (headIndex >= 0) {
    for (const line of lines.slice(headIndex + 1, headIndex + 6)) {
      const trimmed = line.trim()
      if (!trimmed.startsWith('-')) break
      const errorMatch = /^-\s*(\d+)\s+errors?\b/.exec(trimmed)
      const warningMatch = /^-\s*(\d+)\s+warnings?\b/.exec(trimmed)
      const hintMatch = /^-\s*(\d+)\s+hints?\b/.exec(trimmed)
      if (errorMatch) errors = Number(errorMatch[1])
      if (warningMatch) warnings = Number(warningMatch[1])
      if (hintMatch) hints = Number(hintMatch[1])
    }
  }

  const diagnostics = []
  for (const rawLine of combined.split('\n')) {
    const line = rawLine.trimEnd()
    const match = DIAGNOSTIC.exec(line)
    if (match) {
      diagnostics.push({
        file: match[1].trim(),
        line: Number(match[2]),
        col: Number(match[3]),
        severity: match[4],
        code: (match[5] ?? '').trim(),
        message: match[6].trim(),
      })
      continue
    }
    const tscMatch = TSC_DIAGNOSTIC.exec(line)
    if (tscMatch) {
      diagnostics.push({
        file: tscMatch[1].trim(),
        line: Number(tscMatch[2]),
        col: Number(tscMatch[3]),
        severity: tscMatch[4],
        code: tscMatch[5],
        message: tscMatch[6].trim(),
      })
    }
  }

  return { hasSummary: headIndex >= 0, filesChecked, errors, warnings, hints, diagnostics }
}

/**
 * Suppression directives are type errors that were hidden rather than fixed, and no
 * tsconfig — not even one this gate writes — sees past them. One line of comment turns a
 * red file green, so each one is reported with its location.
 */
const SUPPRESSION = /(^|[^A-Za-z0-9_$])@ts-(nocheck|ignore|expect-error)\b/

function scanSuppressions(sourceFiles) {
  const found = []
  for (const file of sourceFiles) {
    let text
    try {
      text = readFileSync(join(ROOT, file), 'utf8')
    } catch {
      continue
    }
    const lines = text.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const match = SUPPRESSION.exec(lines[i])
      if (match) found.push({ file, line: i + 1, directive: `@ts-${match[2]}` })
    }
  }
  return found
}

/**
 * The project's tsconfig.json still decides what a human, an editor and a bare
 * `astro check` see, so it is asserted even though AC-02 no longer depends on it. The
 * three things that matter are the three cheapest ways to make a red type check green:
 * drop the strict preset, exclude the file that will not compile, empty the include list.
 */
const STRICT_PRESETS = ['astro/tsconfigs/strict', 'astro/tsconfigs/strictest']

function checkTsconfig(sourceFiles) {
  const path = join(ROOT, 'tsconfig.json')
  if (!existsSync(path)) {
    failures.push({
      criterion: 'AC-02',
      message: 'tsconfig.json does not exist. Without it the Astro language server falls back to inferring a project, which only globs **/*.astro and silently stops checking every .ts file.',
      where: 'tsconfig.json',
      expected: `a tsconfig.json extending ${STRICT_PRESETS[0]}`,
      actual: 'no tsconfig.json',
    })
    return { present: false }
  }

  const parsed = readJsonFile(path)
  if (!parsed.ok) {
    failures.push({
      criterion: 'AC-02',
      message: `tsconfig.json could not be parsed: ${truncate(parsed.error, 200)}`,
      where: 'tsconfig.json',
      expected: 'readable JSON',
      actual: 'unparseable',
    })
    return { present: true }
  }

  const config = parsed.value ?? {}
  const extendsList = Array.isArray(config.extends) ? config.extends : config.extends ? [config.extends] : []

  if (!extendsList.some((entry) => STRICT_PRESETS.includes(entry))) {
    failures.push({
      criterion: 'AC-02',
      message: `tsconfig.json no longer extends ${STRICT_PRESETS[0]}. Loosening the project's strictness is not a way to reach zero type errors.`,
      where: 'tsconfig.json extends',
      expected: `extends includes "${STRICT_PRESETS[0]}"`,
      actual: extendsList.length ? extendsList.join(', ') : 'no extends',
    })
  }

  const excludes = Array.isArray(config.exclude) ? config.exclude : []
  for (const pattern of excludes) {
    if (typeof pattern !== 'string') continue
    const hit = sourceFiles.find((file) => patternCovers(pattern, file))
    if (hit) {
      failures.push({
        criterion: 'AC-02',
        message: `tsconfig.json excludes "${pattern}", which takes ${hit} out of the project's own type check.`,
        where: 'tsconfig.json exclude',
        expected: 'no exclude entry covering src/',
        actual: `"${pattern}" matches ${hit}`,
        hint: 'Excluding the file that does not compile is not the same as making it compile.',
      })
    }
  }

  if (Array.isArray(config.include)) {
    const covered = sourceFiles.filter((file) => config.include.some((pattern) => typeof pattern === 'string' && patternCovers(pattern, file)))
    if (sourceFiles.length && covered.length === 0) {
      failures.push({
        criterion: 'AC-02',
        message: `tsconfig.json include covers none of the ${sourceFiles.length} source file(s) under src/, so the project's own type check reads an empty program.`,
        where: 'tsconfig.json include',
        expected: 'include covering src/**',
        actual: config.include.length ? config.include.join(', ') : 'empty include',
      })
    }
  }

  return { present: true, extends: extendsList, exclude: excludes }
}

/**
 * The config AC-02 actually runs under, written fresh on every run from code that lives in
 * checks/ and is therefore off limits to the implementing agent.
 *
 * It extends the project's tsconfig so that legitimate project settings — path aliases,
 * `types`, allowJs — still apply, then puts the strict preset after it and re-states the
 * strict flags locally, so that an explicit weakening in the project config cannot survive.
 * include is fixed to src/ plus the generated Astro types: it is the scope of the criterion,
 * and it is not the project's to narrow.
 */
function writeScopedTsconfig(hasProjectTsconfig) {
  const dir = join(ROOT, 'checks/.results')
  mkdirSync(dir, { recursive: true })
  // Scoped by pid for the same reason checks/run.mjs scopes its results directory: two runs
  // on one machine must not share a file one of them is in the middle of writing.
  const path = join(dir, `tsconfig.ac02.${process.pid}.json`)

  const compilerOptions = { strict: true, strictNullChecks: true, noEmit: true }
  // Without the project config there is nothing to supply Astro's ambient types, and every
  // `import.meta.env` would read as an error the page did not cause.
  if (!hasProjectTsconfig) compilerOptions.types = ['astro/client']

  writeFileSync(
    path,
    `${JSON.stringify(
      {
        extends: hasProjectTsconfig ? ['../../tsconfig.json', STRICT_PRESETS[0]] : [STRICT_PRESETS[0]],
        compilerOptions,
        include: ['../../.astro/types.d.ts', '../../src/**/*.ts', '../../src/**/*.tsx', '../../src/**/*.astro'],
        exclude: [],
      },
      null,
      2,
    )}\n`,
  )

  return path
}

async function checkTypes() {
  const sourceFiles = collectSourceFiles()
  evidence.typecheck.expectedFiles = sourceFiles.length

  // An empty src/ is the limit case of a narrowed check: zero errors over zero files. The
  // deliverable is a page, so there is always something to check.
  if (sourceFiles.length === 0) {
    failures.push({
      criterion: 'AC-02',
      message: 'No .ts, .tsx or .astro files were found under src/, so there is nothing for astro check to verify.',
      where: 'src/',
      expected: 'at least one source file under src/',
      actual: 'src/ is empty or missing',
    })
    return { ran: false }
  }

  for (const hit of scanSuppressions(sourceFiles)) {
    failures.push({
      criterion: 'AC-02',
      message: `${hit.directive} at ${hit.file}:${hit.line} hides a type error instead of fixing it.`,
      where: `${hit.file}:${hit.line}`,
      expected: 'no @ts-nocheck, @ts-ignore or @ts-expect-error under src/',
      actual: hit.directive,
      hint: 'A suppressed error is still an error; astro check counts the file and reports nothing.',
    })
  }

  const tsconfig = checkTsconfig(sourceFiles)

  const astroCli = resolveAstroCli()
  const missing = ['@astrojs/check', 'typescript'].filter((name) => !isInstalled(name))

  if (!astroCli || missing.length) {
    // astro check exits 0 in this situation, so trusting it would report a green type check
    // on a project with no type checker. These are all declared dependencies of this
    // repository, which makes their absence a defect in the deliverable and a failure —
    // not a skip that would quietly stop AC-02 from blocking.
    const what = astroCli ? `${missing.join(' and ')} ${missing.length === 1 ? 'is' : 'are'} not installed` : 'the astro CLI could not be resolved'
    failures.push({
      criterion: 'AC-02',
      message: `astro check could not run: ${what}. astro check exits 0 when its dependencies are absent, so this is a failure rather than a pass.`,
      where: 'node_modules',
      expected: '@astrojs/check, typescript and astro resolvable from the project root',
      actual: astroCli ? `missing: ${missing.join(', ')}` : 'astro not resolvable',
      hint: 'Run npm install. All three are declared in package.json.',
    })
    return { ran: false }
  }

  const tsconfigPath = toPosix(relative(ROOT, writeScopedTsconfig(tsconfig.present)))
  evidence.typecheck.tsconfig = tsconfigPath

  progress('astro check (src/)')
  const result = await runNode([astroCli, 'check', '--tsconfig', tsconfigPath], TYPECHECK_TIMEOUT_MS)
  const combined = `${result.stdout}\n${result.stderr}`

  notes.push(
    `AC-02 type-checks the ${sourceFiles.length} file(s) under src/ against ${STRICT_PRESETS[0]}, using a config this gate writes on every run. ` +
      'It does not cover checks/, scripts/, deck/ or figma-plugin/: the verifier\'s own TypeScript is not the page\'s defect, and a repair prompt must never name a read-only file.',
  )

  if (result.timedOut) {
    // A killed check produced no count, and an unevaluated blocking criterion that exits 0
    // is indistinguishable from a pass. The timeout is tunable from the environment, which
    // is exactly why exceeding it has to be red rather than quiet.
    failures.push({
      criterion: 'AC-02',
      message: `astro check did not finish within ${Math.round(TYPECHECK_TIMEOUT_MS / 1000)}s and was killed, so no error count exists.`,
      where: 'astro check',
      expected: `a diagnostics summary within ${Math.round(TYPECHECK_TIMEOUT_MS / 1000)}s`,
      actual: `killed after ${Math.round(result.durationMs / 1000)}s`,
      hint: 'Raise CHECK_TYPECHECK_TIMEOUT_MS if the project genuinely got bigger; do not read this as a pass.',
    })
    return { ran: true, timedOut: true, durationMs: result.durationMs, exitCode: null }
  }

  const parsed = parseCheckOutput(result.stdout, combined)
  const base = { ran: true, durationMs: result.durationMs, exitCode: result.code, filesChecked: parsed.filesChecked }

  // The "dependencies are required" path: exit 0, no summary, nothing checked.
  if (!parsed.hasSummary && combined.includes('packages are required for this command')) {
    failures.push({
      criterion: 'AC-02',
      message: 'astro check reported that @astrojs/check and typescript are required, and checked nothing.',
      where: 'astro check',
      expected: '0 type error(s) over src/',
      actual: 'the type checker refused to run',
      hint: 'Run npm install.',
    })
    return base
  }

  if (!parsed.hasSummary) {
    if (result.code === 0) {
      // Exit 0 and no diagnostics summary: the command did not do its job, and its exit
      // code is not evidence of anything. Do not convert silence into a pass.
      unevaluated.push('AC-02')
      notes.push(
        `AC-02 not evaluated: astro check exited 0 but printed no diagnostics summary, so the error count could not be read.${fenced(
          tail(combined, 20),
        )}`,
      )
      return base
    }

    // Nonzero and no summary: the type checker itself broke. That is a failing command,
    // not a missing one, and the loop needs to see it.
    failures.push({
      criterion: 'AC-02',
      message: `astro check exited ${result.code} without reporting a diagnostics summary.`,
      where: 'astro check',
      expected: '0 type error(s)',
      actual: `exit code ${result.code}, no "Result (n files)" summary`,
      hint: `astro check output (last 20 lines):${fenced(tail(combined, 20))}`,
    })
    return base
  }

  const errorDiagnostics = parsed.diagnostics.filter((d) => d.severity === 'error')

  // Scope first, count second. "Result (0 files): - 0 errors" is what a project that checks
  // nothing prints, and reading the count off it is how a repository with a live type error
  // ships a green AC-02. The expected floor is this gate's own walk of src/, so narrowing
  // the checked set is a reportable fact rather than a silent pass.
  if (parsed.filesChecked === null) {
    unevaluated.push('AC-02')
    notes.push(
      `AC-02 not evaluated: astro check printed a summary whose file count could not be read, so the scope of the check is unknown.${fenced(
        tail(result.stdout, 20),
      )}`,
    )
    return base
  }

  if (parsed.filesChecked < sourceFiles.length) {
    failures.push({
      criterion: 'AC-02',
      message: `astro check looked at ${parsed.filesChecked} file(s), but src/ contains ${sourceFiles.length}. A verdict over fewer files than the page has is not a verdict on the page.`,
      where: 'astro check',
      expected: `at least ${sourceFiles.length} file(s) checked`,
      actual: `${parsed.filesChecked} file(s) checked`,
      hint:
        parsed.filesChecked === 0
          ? 'Zero files checked means nothing was type-checked at all — check that src/ still holds the page and that .astro/types.d.ts was generated.'
          : `Source files this gate expects to be covered:${fenced(sourceFiles.slice(0, 20).join('\n'))}`,
    })
  }

  if (parsed.errors === null) {
    // A summary this gate cannot read is not a zero. It used to become one via `?? 0`,
    // which meant a wording change in @astrojs/check would have turned every run green.
    if (result.code !== 0) {
      failures.push({
        criterion: 'AC-02',
        message: `astro check exited ${result.code} and printed a summary whose error count could not be parsed.`,
        where: 'astro check',
        expected: '0 type error(s)',
        actual: `exit code ${result.code}, unreadable error count`,
        hint: `astro check output (last 20 lines):${fenced(tail(result.stdout, 20))}`,
      })
      return base
    }
    unevaluated.push('AC-02')
    notes.push(
      `AC-02 not evaluated: astro check printed a summary whose error count could not be parsed.${fenced(tail(result.stdout, 20))}`,
    )
    return base
  }

  const errors = parsed.errors

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
      actual: `${errors} error(s) across ${parsed.filesChecked} file(s)`,
      hint: errorDiagnostics.length
        ? `All type errors (first 5):${fenced(
            errorDiagnostics
              .slice(0, 5)
              .map((d) => `${d.file}:${d.line}:${d.col} ${d.code ? `${d.code}: ` : ''}${d.message}`)
              .join('\n'),
          )}`
        : `astro check output (last 20 lines):${fenced(tail(combined, 20))}`,
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
  } else if (result.code !== 0) {
    // The exit code is a second, independent signal: @astrojs/check exits non-zero exactly
    // when it counted an error. A zero-error summary beside a non-zero exit means one of
    // the two is lying, and the gate is not entitled to pick the comfortable one.
    failures.push({
      criterion: 'AC-02',
      message: `astro check reported 0 errors but exited ${result.code}. The summary and the exit code disagree, so the error count cannot be trusted.`,
      where: 'astro check',
      expected: 'exit code 0 alongside a 0-error summary',
      actual: `exit code ${result.code}, summary "0 errors"`,
      hint: `astro check output (last 20 lines):${fenced(tail(combined, 20))}`,
    })
  }

  if ((parsed.warnings ?? 0) > 0) {
    // AC-02 is about errors. Warnings are worth surfacing and are not a failure.
    notes.push(`astro check also reported ${parsed.warnings} warning(s). AC-02 only gates errors.`)
  }

  return { ...base, errors, warnings: parsed.warnings, hints: parsed.hints }
}

// ── AC-05: dist/ holds exactly one servable HTML page, index.html ─────────────

/**
 * Every extension a static host will serve as text/html. Counting only `.html` meant a
 * second page shipped as `news.htm` was invisible to AC-05 while `astro preview` and
 * Netlify both served it — scope creep that the scope gate could not see.
 */
const HTML_EXT = /\.(html?|xhtml|shtml)$/i

/**
 * Recursive walk instead of a glob dependency: dist/ is small and this has no install cost.
 *
 * Classification is by statSync, which follows symlinks, not by Dirent: a Dirent for a
 * symlink answers false to both isFile() and isDirectory(), so a symlinked page and a
 * symlinked directory of pages were neither counted nor walked. realpath seeds a visited
 * set so a link that points at its own ancestor terminates instead of recursing forever.
 *
 * Errors are collected rather than thrown. An unreadable directory inside the publish root
 * is a defect in its own right, and a throw here used to escape into the catch-all and
 * convert an already-recorded failure into a skip.
 */
function collectHtmlFiles(dir, state) {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch (err) {
    state.unreadable.push({ path: toPosix(relative(DIST, dir)), reason: truncate(String(err), 200) })
    return state
  }

  // Sorted, because readdir order is filesystem order. When the same page is reachable both
  // directly and through a symlinked directory, the walk must name it the same way twice or
  // the failure message changes between machines, and an idempotent gate is the whole deal.
  entries.sort((a, b) => a.name.localeCompare(b.name))

  for (const entry of entries) {
    const full = join(dir, entry.name)
    const rel = toPosix(relative(DIST, full))
    const linkTarget = entry.isSymbolicLink() ? readlinkSafe(full) : null

    let stats
    try {
      stats = statSync(full)
    } catch {
      // statSync follows the link, so a failure here on a symlink means it dangles.
      state.broken.push({ path: rel, target: linkTarget })
      continue
    }

    if (stats.isDirectory()) {
      let real
      try {
        real = realpathSync(full)
      } catch {
        state.broken.push({ path: rel, target: linkTarget })
        continue
      }
      if (state.visited.has(real)) continue
      state.visited.add(real)
      collectHtmlFiles(full, state)
    } else if (stats.isFile() && HTML_EXT.test(entry.name)) {
      state.files.push({ path: rel, target: linkTarget })
    }
  }

  return state
}

function readlinkSafe(path) {
  try {
    return toPosix(readlinkSync(path))
  } catch {
    return null
  }
}

const describe = (file) => (file.target ? `${file.path} (symlink -> ${file.target})` : file.path)

function checkSinglePage(buildRan) {
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

  const state = { files: [], broken: [], unreadable: [], visited: new Set() }
  try {
    state.visited.add(realpathSync(DIST))
  } catch {
    /* fall through; the walk reports what it cannot read */
  }
  collectHtmlFiles(DIST, state)

  for (const entry of state.unreadable) {
    failures.push({
      criterion: 'AC-05',
      message: `dist/${entry.path} could not be read, so the page count cannot be established.`,
      where: `dist/${entry.path}`,
      expected: 'a readable publish directory',
      actual: entry.reason,
    })
  }

  for (const entry of state.broken) {
    failures.push({
      criterion: 'AC-05',
      message: `dist/${entry.path} is a broken symlink${entry.target ? ` (-> ${entry.target})` : ''}, which ships as a 404.`,
      where: `dist/${entry.path}`,
      expected: 'no dangling symlinks in the publish directory',
      actual: entry.target ? `dangling symlink -> ${entry.target}` : 'dangling symlink',
    })
  }

  const htmlFiles = state.files.sort((a, b) => a.path.localeCompare(b.path))
  const paths = htmlFiles.map(describe)
  const extra = htmlFiles.filter((f) => f.path !== 'index.html' || f.target !== null)
  const hasIndex = htmlFiles.some((f) => f.path === 'index.html' && f.target === null)

  if (htmlFiles.length !== 1 || !hasIndex) {
    const shown = extra.slice(0, 10).map(describe)
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
      actual: paths.length ? paths.join(', ') : 'no HTML files',
      // CANON §11: one page. Extra HTML files are how scope creep shows up on disk,
      // usually before anyone has agreed to it.
      hint: extra.length
        ? 'CANON §11 puts blog, news archive and artist detail pages out of scope. The deliverable is one page.'
        : undefined,
    })
  } else if (!buildRan) {
    // Nothing in this run built the directory that was just inspected, so "exactly one page"
    // is a fact about a folder rather than about the deliverable. A defect found here is
    // still a defect and still fails above; only the clean result is withheld.
    unevaluated.push('AC-05')
    notes.push(
      'AC-05 found no extra pages, but this run did not build dist/, so the folder it counted is not known to come from src/. ' +
        'A clean count over an unverified directory is not evidence.',
    )
  }

  return { htmlFiles: paths, brokenSymlinks: state.broken.length, unreadable: state.unreadable.length }
}

// ── Main ──────────────────────────────────────────────────────────────────────

function emit(payload) {
  process.stdout.write(JSON.stringify(payload))
}

/**
 * One place decides the verdict, and the crash handler routes through it too. The old
 * catch-all hardcoded SKIP while passing the already-collected failures along, so a throw
 * after a recorded failure produced a payload that carried a criterion-tagged defect and
 * declared itself not-a-failure: report.md counts skips as passed and prints "What to fix"
 * only for FAIL gates, so the failure was written to disk and rendered nowhere.
 */
function status() {
  if (failures.length) return STATUS.FAIL
  if (unevaluated.length) return STATUS.SKIP
  return STATUS.PASS
}

function finish(extraNotes = []) {
  const gateStatus = status()

  emit({
    id: 'build',
    title: 'Build',
    status: gateStatus,
    criteria: CRITERIA,
    failures,
    notes: [...notes, ...extraNotes],
    evidence,
  })

  // Exit 1 on failure so `npm run check:build` is usable on its own, the way every gate in
  // brief/ACCEPTANCE.md is described: a program that returns 0 or 1 and prints a message.
  //
  // A SKIP exits 1 as well. These criteria are blocking, checks/run.mjs aborts only on
  // FAIL, and loop/ralph.sh stops on an exit code — so a skip that exited 0 was a pass with
  // better manners, and every unevaluated path in this file was a way to stop AC-01 or
  // AC-02 blocking. Only a real PASS exits 0.
  process.exitCode = gateStatus === STATUS.PASS ? 0 : 1
}

async function main() {
  const build = await checkBuild()
  settled.add('AC-01')
  evidence.build = { ran: build.ran, exitCode: build.exitCode ?? null, durationMs: build.durationMs ?? null }
  if (build.shipped) {
    evidence.build.shippedScripts = { build: build.shipped.build, prebuild: build.shipped.prebuild, postbuild: build.shipped.postbuild }
  }

  // The type check runs even when the build failed. Type errors are frequently the reason
  // the build failed, and the loop should get both in one report rather than one per pass.
  const types = await checkTypes()
  settled.add('AC-02')
  evidence.typecheck = {
    ran: Boolean(types.ran),
    errors: types.errors ?? null,
    warnings: types.warnings ?? null,
    hints: types.hints ?? null,
    filesChecked: types.filesChecked ?? null,
    expectedFiles: evidence.typecheck.expectedFiles,
    tsconfig: evidence.typecheck.tsconfig ?? null,
    exitCode: types.exitCode ?? null,
    durationMs: types.durationMs ?? null,
  }

  const dist = checkSinglePage(build.ran && build.ok)
  settled.add('AC-05')
  evidence.dist = dist

  if (!build.ok && dist.htmlFiles.length) {
    notes.push('The build did not succeed, so the dist/ contents AC-05 inspected may be left over from an earlier run.')
  }

  finish()
}

main().catch((err) => {
  // An unexpected throw means some criteria never reached a verdict. Say which ones, and
  // let status() decide: a crash does not retract a failure that was already recorded, and
  // a gate carrying failures is a FAIL whatever killed it.
  const stranded = CRITERIA.filter((c) => !settled.has(c) && !unevaluated.includes(c))
  unevaluated.push(...stranded)

  finish([
    `The build gate threw before reaching a verdict on ${stranded.length ? stranded.join(', ') : 'the remaining criteria'}: ${truncate(String(err), 300)}`,
  ])
})
