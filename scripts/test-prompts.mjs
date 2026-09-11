#!/usr/bin/env node
/**
 * Run the prompt pack against a real agent, in a real empty folder.
 *
 *   node scripts/test-prompts.mjs --agent codex
 *   node scripts/test-prompts.mjs --agent codex --only 01,04,05
 *
 * The prompts in prompts/ are the entire workshop now. Claiming they work without ever
 * having run them would be the exact failure this workshop is about, so this does what a
 * participant does: an empty directory, one agent, the prompts pasted in order, and a
 * record of what actually came out.
 *
 * It records, per prompt: wall time, exit code, whether the agent wrote anything at all,
 * and which of the expected artefacts exist afterwards. Nothing here asks a model whether
 * the run went well.
 */

import { spawn } from 'node:child_process'
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const argv = process.argv.slice(2)
const val = (f, d) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : d
}

const AGENT = val('--agent', 'codex')
const ONLY = val('--only', null)?.split(',').map((s) => s.trim())
const SANDBOX = process.env.CODEX_SANDBOX || 'workspace-write'
const TIMEOUT_MS = Number(process.env.PROMPT_TIMEOUT_MS || 20 * 60 * 1000)
/**
 * Outside the repository, deliberately.
 *
 * The first run of this put the folder at .prompt-test inside the project, and the agent
 * found ../brief/CONTENT.md one level up and checked the page against the whole festival
 * copy — 360 failures for content it had never been asked to build. A participant starts
 * in an empty directory with nothing above it, so the trial has to as well, or it is
 * measuring the harness.
 */
const WORKDIR = process.env.PROMPT_WORKDIR || join(ROOT, '..', '.turbine-prompt-trial')

/**
 * What each prompt is supposed to leave behind. Not "did the agent say it worked" —
 * does the file exist on disk.
 */
const STEPS = [
  {
    id: '01',
    file: 'prompts/01-start.md',
    expect: ['package.json', 'astro.config.mjs'],
    note: 'an Astro project exists',
  },
  {
    id: '03',
    file: null,
    inline: `Build a single section at the top of the page, and nothing else.

It is the hero of a festival website. Use exactly these values and exactly this text:

  background  #0A0B0D
  heading     #F2F4F7, 56px, bold
  body        #A7AEBB, 18px
  button fill #FF6A1A with #0A0B0D text

  heading:  TURBINE
  under it: Three nights inside the machine
  body:     Ambient, techno and modular sound in a hall built for power.
  button:   Get tickets

Do not add anything that is not listed above. No packages.`,
    expect: ['src/pages/index.astro'],
    note: 'a page with a hero exists',
  },
  {
    id: '04',
    file: 'prompts/04-checker.md',
    expect: ['check.mjs'],
    note: 'a checker exists and npm run check is wired',
  },
  {
    id: '05',
    file: 'prompts/05-loop.md',
    expect: ['check.mjs'],
    note: 'the loop ran',
  },
]

/** Strip the prose around the prompt: take the first fenced block of the file. */
function extractPrompt(markdown) {
  const m = markdown.match(/```text\n([\s\S]*?)```/)
  if (!m) throw new Error('no ```text block found')
  return m[1].trim()
}

function run(cmd, args, opts = {}) {
  return new Promise((res) => {
    const child = spawn(cmd, args, {
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: TIMEOUT_MS,
      ...opts,
    })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => (stdout += d))
    child.stderr?.on('data', (d) => (stderr += d))
    child.on('close', (code) => res({ code: code ?? 1, stdout, stderr }))
    child.on('error', (e) => res({ code: 1, stdout, stderr: String(e) }))
  })
}

const invoke = {
  // --skip-git-repo-check stands in for the trust prompt a participant answers by hand.
  // Without it Codex refuses an empty folder outright: "Not inside a trusted directory".
  codex: (p) => ['codex', ['exec', '-s', SANDBOX, '--skip-git-repo-check', p]],
  claude: (p) => ['claude', ['-p', p, '--permission-mode', 'acceptEdits']],
}

async function fileCount(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true })
    return entries.filter((e) => !e.name.startsWith('.') && e.name !== 'node_modules').length
  } catch {
    return 0
  }
}

async function main() {
  if (!invoke[AGENT]) {
    console.error(`Unknown agent "${AGENT}"`)
    process.exit(1)
  }

  await rm(WORKDIR, { recursive: true, force: true })
  await mkdir(WORKDIR, { recursive: true })

  console.log(`\n── prompt pack trial · ${AGENT} · empty folder ──\n`)
  console.log(`workdir: ${WORKDIR}\n`)

  const results = []
  for (const step of STEPS) {
    if (ONLY && !ONLY.includes(step.id)) continue

    const prompt = step.inline ?? extractPrompt(await readFile(join(ROOT, step.file), 'utf8'))
    const before = await fileCount(WORKDIR)

    process.stdout.write(`  ${step.id}  ${step.note.padEnd(40)} `)
    const t0 = Date.now()
    const [cmd, args] = invoke[AGENT](prompt)
    const res = await run(cmd, args, { cwd: WORKDIR })
    const seconds = (Date.now() - t0) / 1000
    const after = await fileCount(WORKDIR)

    const present = step.expect.filter((f) => existsSync(join(WORKDIR, f)))
    const missing = step.expect.filter((f) => !existsSync(join(WORKDIR, f)))
    const ok = missing.length === 0

    console.log(
      `${ok ? 'ok  ' : 'MISS'} ${seconds.toFixed(0)}s  exit ${res.code}  files ${before}→${after}` +
        (missing.length ? `  missing: ${missing.join(', ')}` : ''),
    )

    results.push({
      id: step.id,
      note: step.note,
      seconds: Number(seconds.toFixed(0)),
      exit: res.code,
      filesBefore: before,
      filesAfter: after,
      expected: step.expect,
      present,
      missing,
      tail: (res.stdout + res.stderr).trim().split('\n').slice(-25).join('\n'),
    })

    if (!ok) {
      console.log(`      last lines:\n        ${results.at(-1).tail.split('\n').slice(-6).join('\n        ')}`)
    }
  }

  // Does the thing the agent built actually run?
  let finalCheck = null
  if (existsSync(join(WORKDIR, 'check.mjs'))) {
    process.stdout.write(`\n  running the checker the agent wrote … `)
    const r = await run('npm', ['run', '--silent', 'check'], { cwd: WORKDIR })
    finalCheck = { exit: r.code, tail: (r.stdout + r.stderr).trim().split('\n').slice(-15).join('\n') }
    console.log(`exit ${r.code}`)
  }

  await mkdir(join(ROOT, 'evidence'), { recursive: true })
  await writeFile(
    join(ROOT, `evidence/prompt-trial-${AGENT}.json`),
    JSON.stringify({ agent: AGENT, steps: results, finalCheck }, null, 2) + '\n',
  )
  console.log(`\nwrote evidence/prompt-trial-${AGENT}.json`)
  console.log(`workdir kept at ${WORKDIR} — look at what it built`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
