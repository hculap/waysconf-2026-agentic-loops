#!/usr/bin/env node
/**
 * Clean-room trial of the whole workshop.
 *
 *   node scripts/dry-run.mjs --agent claude --max 12
 *   node scripts/dry-run.mjs --agent codex  --max 12
 *
 * Takes the repository exactly as a participant receives it, puts it in a fresh git
 * worktree with no history and no notes, points one coding agent at it, and records
 * what actually happens. The output is evidence/dry-run-<agent>.md.
 *
 * This exists because a workshop that promises "the agent fixes its own work" and has
 * never measured whether it does is a promise, not a demonstration. Everything the
 * slides claim about how long this takes and how often it converges comes from here.
 *
 * What is measured, per iteration:
 *   - wall-clock time
 *   - how many gates passed, failed and skipped
 *   - how many individual failures the report listed
 *   - which acceptance criteria moved from failing to passing
 *   - whether the agent touched anything under checks/ (it must not)
 *   - the diff size it produced
 *
 * Nothing here asks a model whether the run went well.
 */

import { spawn } from 'node:child_process'
import { readFile, writeFile, mkdir, rm, access } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const argv = process.argv.slice(2)
const val = (f, d) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d
}
const has = (f) => argv.includes(f)

const AGENT = val('--agent', 'claude')
const MAX = Number(val('--max', 12))
const KEEP = has('--keep')
const FROM_REF = val('--from', 'HEAD')
const WORKTREE = join(ROOT, '.dry-run', AGENT)

function run(cmd, args, opts = {}) {
  return new Promise((res) => {
    const child = spawn(cmd, args, { shell: false, ...opts })
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
    child.on('close', (code) => res({ code: code ?? 1, stdout, stderr }))
    child.on('error', (e) => res({ code: 1, stdout, stderr: stderr + String(e) }))
  })
}

async function readReport(dir) {
  try {
    return JSON.parse(await readFile(join(dir, 'checks/report.json'), 'utf8'))
  } catch {
    return null
  }
}

/** Criteria that appear in at least one failure, across all gates. */
function failingCriteria(report) {
  if (!report) return new Set()
  const out = new Set()
  for (const g of report.gates ?? []) {
    for (const f of g.failures ?? []) if (f.criterion) out.add(f.criterion)
  }
  return out
}

/**
 * Counts for one iteration — or null, when there is no report to count.
 *
 * The first version of this returned zeros for a missing report. A run that was killed
 * then produced evidence claiming four clean iterations and fourteen criteria cleared,
 * because "no failures found" and "nothing looked" came out of this function
 * identically. An evidence harness that reads absence as success is worse than no
 * harness, and this is the fourth time this project has hit that shape — see
 * evidence/INCIDENTS.md.
 */
function gateCounts(report) {
  if (!report) return null
  const gates = report.gates ?? []
  return {
    pass: gates.filter((g) => g.status === 'pass').length,
    fail: gates.filter((g) => g.status === 'fail').length,
    skip: gates.filter((g) => g.status === 'skip').length,
    failures: gates.reduce((n, g) => n + (g.failures?.length ?? 0), 0),
  }
}

/**
 * Codex sandbox policy.
 *
 * `workspace-write` is the right default and the one a participant on a laptop should
 * use: the agent may write inside the project and nowhere else. On some Linux hosts the
 * sandbox cannot initialise at all — this repository was built on one, where every write
 * failed with "the execution sandbox failed, and direct file writing also failed" — so
 * the policy is overridable rather than hard-coded, and the override has to be typed
 * deliberately.
 *
 *   CODEX_SANDBOX=danger-full-access node scripts/dry-run.mjs --agent codex
 *
 * Only do that inside a throwaway worktree, which is exactly what this script creates.
 */
const CODEX_SANDBOX = process.env.CODEX_SANDBOX || 'workspace-write'

/**
 * Hard ceiling on one agent pass. A trial that runs overnight is not a trial, and an
 * agent that has gone quiet is indistinguishable from one that is thinking unless
 * something is counting.
 */
const AGENT_TIMEOUT_MS = Number(process.env.AGENT_TIMEOUT_MS || 30 * 60 * 1000)

const AGENT_INVOCATION = {
  claude: (prompt) => ['claude', ['-p', prompt, '--permission-mode', 'acceptEdits']],
  codex: (prompt) => ['codex', ['exec', '-s', CODEX_SANDBOX, prompt]],
}

async function main() {
  if (!AGENT_INVOCATION[AGENT]) {
    console.error(`Unknown agent "${AGENT}". Known: ${Object.keys(AGENT_INVOCATION).join(', ')}`)
    process.exit(1)
  }

  console.log(`\n── clean-room dry run · ${AGENT} · max ${MAX} iterations ──\n`)

  // A fresh worktree, so the trial cannot accidentally benefit from anything in the
  // working copy: no stale dist/, no notes, no half-finished edits.
  await rm(WORKTREE, { recursive: true, force: true })
  await run('git', ['worktree', 'prune'], { cwd: ROOT })
  const branch = `dry-run/${AGENT}`
  await run('git', ['branch', '-D', branch], { cwd: ROOT })
  const wt = await run('git', ['worktree', 'add', '-b', branch, WORKTREE, FROM_REF], { cwd: ROOT })
  if (wt.code !== 0) {
    console.error('Could not create the worktree:\n' + wt.stderr)
    process.exit(1)
  }
  console.log(`worktree: ${WORKTREE} (branch ${branch} from ${FROM_REF})`)

  // Participants run npm install; so do we. node_modules is not shared, because
  // "it worked on the machine that already had everything" is exactly the failure
  // mode a dry run exists to catch.
  console.log('installing dependencies')
  const t0 = Date.now()
  const install = await run('npm', ['ci', '--no-audit', '--no-fund'], { cwd: WORKTREE })
  const installSeconds = (Date.now() - t0) / 1000
  if (install.code !== 0) {
    console.error('npm ci failed:\n' + install.stderr.slice(-2000))
    process.exit(1)
  }
  console.log(`  ${installSeconds.toFixed(0)}s`)

  const prompt = await readFile(join(ROOT, 'loop/PROMPT.md'), 'utf8')
  const iterations = []
  let previousFailing = null
  let converged = false

  for (let i = 1; i <= MAX; i++) {
    console.log(`\n── iteration ${i}/${MAX} ─────────────────────────────`)

    const checkStart = Date.now()
    const check = await run('npm', ['run', '--silent', 'check'], { cwd: WORKTREE })
    const checkSeconds = (Date.now() - checkStart) / 1000
    const report = await readReport(WORKTREE)
    const counts = gateCounts(report)

    if (!counts) {
      // No report means the verifier did not finish — killed, crashed, or never started.
      // Stop. Continuing would compare this iteration against nothing and call the
      // difference progress.
      console.log(`  no report written; the verifier did not complete. Stopping.`)
      iterations.push({
        n: i,
        unmeasured: true,
        checkSeconds,
        checkExit: check.code,
        tail: (check.stdout + check.stderr).trim().split('\n').slice(-12).join('\n'),
      })
      break
    }

    const failing = failingCriteria(report)

    const cleared = previousFailing ? [...previousFailing].filter((c) => !failing.has(c)) : []
    const regressed = previousFailing ? [...failing].filter((c) => !previousFailing.has(c)) : []

    console.log(
      `  gates ${counts.pass} pass / ${counts.fail} fail / ${counts.skip} skip · ` +
        `${counts.failures} failures · ${checkSeconds.toFixed(0)}s`,
    )
    if (cleared.length) console.log(`  cleared: ${cleared.join(', ')}`)
    if (regressed.length) console.log(`  REGRESSED: ${regressed.join(', ')}`)

    if (check.code === 0) {
      console.log(`\n  all gates green after ${i - 1} agent pass(es)`)
      iterations.push({
        n: i,
        phase: 'verify',
        checkSeconds,
        counts,
        cleared,
        regressed,
        failingCriteria: [...failing],
      })
      converged = true
      break
    }

    // Hand the report back, unchanged. This is the whole mechanism.
    //
    // stdio's first slot is 'ignore' on purpose. Left as a pipe, the child gets an open
    // stdin that nothing ever writes to and nothing ever closes — and Codex, which reads
    // instructions from stdin when they are piped, waits for an EOF that never comes.
    // The symptom is a process that is alive, busy-looking, and has done nothing for an
    // hour. Third time this project has lost time to an unbounded wait; see
    // evidence/INCIDENTS.md.
    const [cmd, args] = AGENT_INVOCATION[AGENT](prompt)
    const agentStart = Date.now()
    const res = await run(cmd, args, {
      cwd: WORKTREE,
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: AGENT_TIMEOUT_MS,
      killSignal: 'SIGTERM',
    })
    const agentSeconds = (Date.now() - agentStart) / 1000
    console.log(`  agent ran ${agentSeconds.toFixed(0)}s, exit ${res.code}`)

    // Did it touch the verifier? This is the single most important integrity check
    // in the whole trial: an agent that edits the gates has not solved anything.
    const dirty = await run('git', ['status', '--porcelain'], { cwd: WORKTREE })
    const touchedChecks = dirty.stdout
      .split('\n')
      .map((l) => l.slice(3).trim())
      .filter((p) => p.startsWith('checks/') && !p.startsWith('checks/.') && !p.startsWith('checks/report'))

    const stat = await run('git', ['diff', '--shortstat', 'HEAD'], { cwd: WORKTREE })

    // An agent that exits 0 and changes nothing is not a pass, it is a no-op — and a
    // loop that cannot tell the two apart will happily run its cap doing nothing and
    // report the same failures every time as though it had tried.
    //
    // Observed here: a hook in the host environment refused the invocation, the CLI
    // exited 0 in five seconds, and the harness recorded a clean agent pass. The next
    // iteration then found the identical failures, which is the signature.
    const noOp = dirty.stdout.trim() === '' && agentSeconds < 30
    if (noOp) {
      console.log(
        `  the agent exited ${res.code} in ${agentSeconds.toFixed(0)}s and changed nothing. Stopping.`,
      )
      iterations.push({
        n: i,
        noOp: true,
        checkSeconds,
        agentSeconds,
        agentExit: res.code,
        counts,
        cleared,
        regressed,
        failingCriteria: [...failing],
        agentTail: (res.stdout + res.stderr).trim().split('\n').slice(-20).join('\n'),
      })
      break
    }

    if (touchedChecks.length) {
      console.log(`  ⚠ agent modified the verifier: ${touchedChecks.join(', ')}`)
    }

    await run('git', ['add', '-A'], { cwd: WORKTREE })
    await run('git', ['commit', '-q', '-m', `dry-run ${AGENT}: iteration ${i}`, '--allow-empty'], {
      cwd: WORKTREE,
    })

    iterations.push({
      n: i,
      checkSeconds,
      agentSeconds,
      agentExit: res.code,
      counts,
      cleared,
      regressed,
      failingCriteria: [...failing],
      touchedChecks,
      diffStat: stat.stdout.trim(),
      agentTail: (res.stdout + res.stderr).trim().split('\n').slice(-15).join('\n'),
    })

    previousFailing = failing
  }

  const totalSeconds = iterations.reduce(
    (n, it) => n + (it.checkSeconds ?? 0) + (it.agentSeconds ?? 0),
    0,
  )

  const evidence = {
    agent: AGENT,
    fromRef: FROM_REF,
    converged,
    agentPasses: iterations.filter((i) => i.agentSeconds !== undefined).length,
    installSeconds,
    totalSeconds,
    integrity: {
      verifierModified: iterations.some((i) => (i.touchedChecks ?? []).length > 0),
      offendingFiles: [...new Set(iterations.flatMap((i) => i.touchedChecks ?? []))],
    },
    iterations,
  }

  await mkdir(join(ROOT, 'evidence'), { recursive: true })
  await writeFile(
    join(ROOT, `evidence/dry-run-${AGENT}.json`),
    JSON.stringify(evidence, null, 2) + '\n',
  )
  await writeFile(join(ROOT, `evidence/dry-run-${AGENT}.md`), renderMarkdown(evidence))

  console.log(`\nwrote evidence/dry-run-${AGENT}.md`)
  if (!KEEP) {
    console.log(`worktree kept at ${WORKTREE} — remove with: git worktree remove --force .dry-run/${AGENT}`)
  }
}

function renderMarkdown(e) {
  const L = []
  L.push(`# Dry run — ${e.agent}`)
  L.push('')
  L.push(
    e.converged
      ? `Every gate passed after **${e.agentPasses} agent pass${e.agentPasses === 1 ? '' : 'es'}**.`
      : `**Did not converge** within the iteration cap. That is a result, not a crash.`,
  )
  L.push('')
  L.push(`Started from \`${e.fromRef}\` in a fresh git worktree with a clean \`npm ci\`.`)
  L.push('')
  L.push('| | |')
  L.push('|---|---|')
  L.push(`| Agent | \`${e.agent}\` |`)
  L.push(`| Dependency install | ${e.installSeconds.toFixed(0)}s |`)
  L.push(`| Total loop time | ${(e.totalSeconds / 60).toFixed(1)} min |`)
  L.push(`| Agent passes | ${e.agentPasses} |`)
  L.push(
    `| Verifier modified by the agent | ${e.integrity.verifierModified ? '**YES — ' + e.integrity.offendingFiles.join(', ') + '**' : 'no'} |`,
  )
  L.push('')
  L.push('## Iteration by iteration')
  L.push('')
  L.push('| # | gates pass/fail/skip | failures | check | agent | cleared | regressed | diff |')
  L.push('|---|---|---|---|---|---|---|---|')
  for (const it of e.iterations) {
    if (it.noOp) {
      L.push(
        `| ${it.n} | ${it.counts.pass}/${it.counts.fail}/${it.counts.skip} | ${it.counts.failures} | ` +
          `${(it.checkSeconds ?? 0).toFixed(0)}s | ${(it.agentSeconds ?? 0).toFixed(0)}s | — | — | **no-op — the agent exited ${it.agentExit} and changed nothing** |`,
      )
      continue
    }
    if (it.unmeasured) {
      L.push(
        `| ${it.n} | **not measured** | — | ${(it.checkSeconds ?? 0).toFixed(0)}s | — | — | — | verifier exited ${it.checkExit} without writing a report |`,
      )
      continue
    }
    L.push(
      `| ${it.n} | ${it.counts.pass}/${it.counts.fail}/${it.counts.skip} | ${it.counts.failures} | ` +
        `${(it.checkSeconds ?? 0).toFixed(0)}s | ${it.agentSeconds ? it.agentSeconds.toFixed(0) + 's' : '—'} | ` +
        `${it.cleared?.length ? it.cleared.join(' ') : '—'} | ` +
        `${it.regressed?.length ? '**' + it.regressed.join(' ') + '**' : '—'} | ` +
        `${it.diffStat || '—'} |`,
    )
  }
  L.push('')
  L.push('## What this does and does not show')
  L.push('')
  L.push('It shows how many passes the loop needed and which criteria each pass cleared, measured by a')
  L.push('program rather than reported by the agent. The "regressed" column is the one worth watching:')
  L.push('a pass that clears three criteria and breaks one is not obviously progress.')
  L.push('')
  L.push('It does not show whether the resulting page is any good. No gate in this repository has an')
  L.push('opinion about that.')
  L.push('')
  return L.join('\n')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
