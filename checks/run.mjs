#!/usr/bin/env node
/**
 * The verifier.
 *
 *   npm run check
 *
 * Builds the site, serves it, runs every gate against the real rendered page, and
 * writes checks/report.md and checks/report.json. Exits 0 only if every gate passed.
 *
 * This file, and everything else under checks/, is off limits to the implementing
 * agent. The whole idea being demonstrated is that the thing which decides whether
 * the work is correct must not be the thing that produced the work.
 *
 * Flags:
 *   --no-build      use the existing dist/ instead of rebuilding
 *   --skip-perf     skip Lighthouse (it is the slow one)
 *   --only <ids>    comma-separated gate ids to run, e.g. --only a11y,tokens
 *   --url <url>     check a deployed URL instead of a local preview
 */

import { spawn } from 'node:child_process'
import { readdir, readFile, rm, mkdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, STATUS, gateResult, writeReport } from './lib/report.mjs'

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(name)
const value = (name, fallback = null) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const NO_BUILD = flag('--no-build')
const SKIP_PERF = flag('--skip-perf')
const ONLY = value('--only') ? value('--only').split(',').map((s) => s.trim()) : null
const REMOTE_URL = value('--url')
const PORT = Number(process.env.CHECK_PORT || 4321)
const BASE_URL = REMOTE_URL || `http://localhost:${PORT}`

const GATE_DIR = join(ROOT, 'checks/.results/gates')
const started = Date.now()
const startedAt = new Date().toISOString()

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: ROOT, shell: false, ...opts })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => {
      stdout += d
      if (opts.echo) process.stdout.write(d)
    })
    child.stderr?.on('data', (d) => {
      stderr += d
      if (opts.echo) process.stderr.write(d)
    })
    child.on('close', (code) => resolve({ code: code ?? 1, stdout, stderr }))
    child.on('error', (err) => resolve({ code: 1, stdout, stderr: stderr + String(err) }))
  })
}

async function waitForServer(url, timeoutMs = 60_000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(url, { redirect: 'manual' })
      if (res.status < 500) return true
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 300))
  }
  return false
}

function shouldRun(id) {
  return !ONLY || ONLY.includes(id)
}

// ── Gate: build ───────────────────────────────────────────────────────────────

async function buildGate() {
  if (NO_BUILD) {
    return gateResult({
      id: 'build',
      title: 'Build',
      status: existsSync(join(ROOT, 'dist/index.html')) ? STATUS.PASS : STATUS.FAIL,
      criteria: ['AC-01'],
      failures: existsSync(join(ROOT, 'dist/index.html'))
        ? []
        : [{ criterion: 'AC-01', message: 'dist/index.html does not exist and --no-build was passed.' }],
      notes: ['--no-build: reused the existing dist/'],
    })
  }

  const t0 = Date.now()
  console.log('› building')
  const { code, stdout, stderr } = await run('npx', ['astro', 'build'])
  const output = `${stdout}\n${stderr}`
  const failures = []

  if (code !== 0) {
    // Keep the tail rather than the head: the actual error is almost always last.
    const tail = output.trim().split('\n').slice(-40).join('\n')
    failures.push({
      criterion: 'AC-01',
      message: 'astro build failed.',
      where: 'npx astro build',
      actual: `exit code ${code}`,
      hint: `Build output (last 40 lines):\n\n\`\`\`\n${tail}\n\`\`\``,
    })
  }

  if (!existsSync(join(ROOT, 'dist/index.html'))) {
    failures.push({
      criterion: 'AC-01',
      message: 'The build produced no dist/index.html.',
      where: 'dist/',
    })
  }

  return gateResult({
    id: 'build',
    title: 'Build',
    status: failures.length ? STATUS.FAIL : STATUS.PASS,
    criteria: ['AC-01'],
    failures,
    durationMs: Date.now() - t0,
  })
}

// ── Gate: Lighthouse ──────────────────────────────────────────────────────────

async function perfGate(url) {
  const t0 = Date.now()
  console.log('› lighthouse')
  const { code, stdout, stderr } = await run('node', ['checks/gates/lighthouse.mjs', url])
  if (code !== 0 && !stdout.trim().startsWith('{')) {
    return gateResult({
      id: 'perf',
      title: 'Lighthouse',
      status: STATUS.SKIP,
      criteria: ['AC-40', 'AC-41'],
      notes: [`Lighthouse could not run: ${(stderr || stdout).trim().split('\n').slice(-3).join(' ')}`],
      durationMs: Date.now() - t0,
    })
  }
  try {
    const parsed = JSON.parse(stdout.slice(stdout.indexOf('{')))
    return gateResult({ ...parsed, durationMs: Date.now() - t0 })
  } catch (err) {
    return gateResult({
      id: 'perf',
      title: 'Lighthouse',
      status: STATUS.SKIP,
      notes: [`Could not parse Lighthouse output: ${String(err).slice(0, 200)}`],
      durationMs: Date.now() - t0,
    })
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  await rm(GATE_DIR, { recursive: true, force: true })
  await mkdir(GATE_DIR, { recursive: true })

  const gates = []

  if (shouldRun('build') && !REMOTE_URL) {
    const g = await buildGate()
    gates.push(g)
    if (g.status === STATUS.FAIL) {
      // Nothing downstream can mean anything if the site did not build.
      console.log('\n✗ build failed — skipping the rest\n')
      const summary = await writeReport(gates, {
        startedAt,
        durationMs: Date.now() - started,
        baseUrl: BASE_URL,
        aborted: 'build',
      })
      report(summary)
      process.exit(1)
    }
  }

  let server = null
  if (!REMOTE_URL) {
    console.log(`› serving dist/ on :${PORT}`)
    server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
      cwd: ROOT,
      stdio: 'ignore',
      detached: false,
    })
    const up = await waitForServer(BASE_URL)
    if (!up) {
      server.kill()
      gates.push(
        gateResult({
          id: 'serve',
          title: 'Preview server',
          status: STATUS.FAIL,
          failures: [{ message: `The preview server never answered on ${BASE_URL}.` }],
        }),
      )
      const summary = await writeReport(gates, {
        startedAt,
        durationMs: Date.now() - started,
        baseUrl: BASE_URL,
      })
      report(summary)
      process.exit(1)
    }
  }

  try {
    console.log('› running gates against', BASE_URL)
    const pwArgs = ['playwright', 'test']
    if (ONLY) pwArgs.push(...ONLY.map((id) => `checks/specs/${id}.spec.ts`).filter((p) => existsSync(join(ROOT, p))))
    const pw = await run('npx', pwArgs, {
      env: { ...process.env, CHECK_BASE_URL: BASE_URL },
    })

    const files = existsSync(GATE_DIR) ? await readdir(GATE_DIR) : []
    for (const f of files.filter((f) => f.endsWith('.json')).sort()) {
      gates.push(JSON.parse(await readFile(join(GATE_DIR, f), 'utf8')))
    }

    if (files.length === 0) {
      gates.push(
        gateResult({
          id: 'specs',
          title: 'Browser gates',
          status: STATUS.FAIL,
          failures: [
            {
              message: 'No gate wrote a result. The Playwright run itself failed.',
              hint: `Last lines of output:\n\n\`\`\`\n${(pw.stdout + pw.stderr).trim().split('\n').slice(-25).join('\n')}\n\`\`\``,
            },
          ],
        }),
      )
    }

    if (!SKIP_PERF && shouldRun('perf')) {
      gates.push(await perfGate(BASE_URL))
    }
  } finally {
    if (server) server.kill('SIGTERM')
  }

  const summary = await writeReport(gates, {
    startedAt,
    durationMs: Date.now() - started,
    baseUrl: BASE_URL,
  })
  report(summary)
  process.exit(summary.ok ? 0 : 1)
}

function report(summary) {
  console.log('')
  if (summary.ok) {
    console.log(`✓ ${summary.passed}/${summary.total} gates passed.`)
  } else {
    console.log(
      `✗ ${summary.failed}/${summary.total} gates failed — ${summary.failureCount} failure${summary.failureCount === 1 ? '' : 's'}.`,
    )
    console.log('  Read checks/report.md, then fix the page. Do not edit checks/.')
  }
  console.log('')
}

main().catch(async (err) => {
  console.error(err)
  process.exit(1)
})
