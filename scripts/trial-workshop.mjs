#!/usr/bin/env node
/**
 * Run the whole workshop, prompts 01 to 07, with a real agent in an empty repository, and time
 * every step.
 *
 *   node scripts/trial-workshop.mjs --agent claude --dir <empty scratch dir> [--site turbine-trial-claude]
 *   node scripts/trial-workshop.mjs --agent codex  --dir <empty scratch dir> [--site turbine-trial-codex]
 *
 * It does what a participant does, as closely as a script can:
 *   - the repository is an empty git repository with a remote (a bare repository beside it, so
 *     the trial does not create repositories on anyone's GitHub account)
 *   - turbine.fig is copied into design/ before prompt 02
 *   - prompts 02, 03 and 04 run in two turns: the plan (Claude Code in plan mode; Codex told by
 *     the prompt itself to wait), then "approved" — the time between the two is the participant
 *     reading the plan, and is reported separately as zero, because a script does not read
 *   - point 6 of prompt 02 is answered with the fallback sentence from the prompt's own prose
 *   - every prompt starts a new session, which is what /clear does
 *   - prompt 07's second block ("Fix findings…") is sent to the same session as its first
 *
 * A participant has none of the operator's own setup, so neither does the agent here. Claude Code runs
 * without user settings (hooks, plugins, permissions), without skills or MCP servers, and without any
 * CLAUDE.md or rules file outside the trial repository: every ancestor directory's CLAUDE.md and
 * ~/.claude are excluded by path. The project's own CLAUDE.md, if the Astro template writes one, stays.
 *
 * Permissions are never bypassed. Claude Code runs in accept-edits mode with Bash allowed, the
 * mode the prompts tell participants to switch on. Codex runs in its workspace-write sandbox with
 * network access, writable only inside the trial directory.
 *
 * The one deviation from the room: prompt 06 would name the Netlify site after the GitHub user,
 * and two trials on one account would collide, so the site name is given.
 *
 * After each step the script measures the result itself, without asking the agent: files on
 * disk, commits, the exit code of npm run check, and the live URL. Results are written to
 * <dir>/trial.json after every step, so a run that dies still leaves its numbers.
 */

import { spawn, spawnSync } from 'node:child_process'
import { readFile, writeFile, mkdir, readdir, copyFile, access } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback)
const AGENT = arg('--agent')
const DIR = resolve(arg('--dir', ''))
const SITE = arg('--site', `turbine-trial-${AGENT}`)
const ONLY = arg('--only', '01,02,03,04,05,06,07').split(',')
const STEP_TIMEOUT = Number(arg('--timeout-min', '45')) * 60_000
if (!['claude', 'codex'].includes(AGENT) || !arg('--dir')) {
  console.error('usage: --agent claude|codex --dir <empty dir>')
  process.exit(2)
}

const REPO = join(DIR, 'turbine')
const REMOTE = join(DIR, 'remote.git')
const LOGS = join(DIR, 'logs')
const results = { agent: AGENT, started: new Date().toISOString(), site: SITE, steps: [] }
const save = () => writeFile(join(DIR, 'trial.json'), JSON.stringify(results, null, 2))
const now = () => Date.now()
const log = (m) => console.log(`[${new Date().toISOString().slice(11, 19)}] ${AGENT}: ${m}`)

// ── prompts, straight from the files participants copy ───────────────────────
async function promptBlocks(n) {
  const file = (await readdir(join(ROOT, 'prompts'))).find((f) => f.startsWith(`${n}-`))
  const md = await readFile(join(ROOT, 'prompts', file), 'utf8')
  return { file, blocks: [...md.matchAll(/```text\n([\s\S]*?)\n```/g)].map((m) => m[1]) }
}

// ── one agent turn ───────────────────────────────────────────────────────────
function run(cmd, args, { cwd, logName, env = {} }) {
  return new Promise((done) => {
    const t0 = now()
    const out = []
    const child = spawn(cmd, args, { cwd, env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.on('data', (d) => out.push(d))
    child.stderr.on('data', (d) => out.push(d))
    const timer = setTimeout(() => { child.kill('SIGTERM'); setTimeout(() => child.kill('SIGKILL'), 10_000) }, STEP_TIMEOUT)
    child.on('close', async (code, signal) => {
      clearTimeout(timer)
      const text = Buffer.concat(out).toString('utf8')
      await writeFile(join(LOGS, `${logName}.log`), text)
      done({ code, signal, ms: now() - t0, text, timedOut: signal === 'SIGTERM' || signal === 'SIGKILL' })
    })
  })
}

const NPM_ENV = { npm_config_cache: join(DIR, '.npm-cache'), CI: '1', BROWSER: 'none' }

/** Every CLAUDE.md above the trial repository, and the operator's ~/.claude, kept out of the agent's context. */
function isolation() {
  const home = process.env.HOME
  const excludes = [`${home}/.claude/**`, `${home}/CLAUDE.md`]
  for (let d = DIR; d.length > 1; d = dirname(d)) excludes.push(`${d}/CLAUDE.md`, `${d}/.claude/**`)
  return ['--setting-sources', 'project,local', '--settings', JSON.stringify({ claudeMdExcludes: excludes }),
    '--disable-slash-commands', '--strict-mcp-config']
}

async function claudeTurn(prompt, { session, plan, logName }) {
  const args = ['-p', prompt, '--output-format', 'json', '--allowedTools', 'Bash', 'WebFetch', 'WebSearch',
    '--permission-mode', plan ? 'plan' : 'acceptEdits', ...isolation()]
  if (session) args.push('--resume', session)
  const r = await run('claude', args, { cwd: REPO, logName, env: NPM_ENV })
  let json = {}
  try { json = JSON.parse(r.text.slice(r.text.indexOf('{'))) } catch {}
  return { ...r, session: json.session_id ?? session, cost: json.total_cost_usd ?? null, turns: json.num_turns ?? null, models: Object.keys(json.modelUsage ?? {}), result: json.result ?? '' }
}

const CODEX_CFG = () => [
  '-c', 'sandbox_mode="workspace-write"',
  '-c', 'sandbox_workspace_write.network_access=true',
  '-c', `sandbox_workspace_write.writable_roots=["${DIR}"]`,
  '-c', 'approval_policy="never"',
]

async function codexTurn(prompt, { session, logName }) {
  const last = join(LOGS, `${logName}.last.txt`)
  const args = session
    ? ['exec', 'resume', ...CODEX_CFG(), '--json', '-o', last, session, prompt]
    : ['exec', ...CODEX_CFG(), '--json', '-C', REPO, '-o', last, prompt]
  const r = await run('codex', args, { cwd: REPO, logName, env: NPM_ENV })
  const id = session ?? (r.text.match(/"(?:thread_id|session_id|conversation_id)"\s*:\s*"([0-9a-f-]{36})"/) ?? [])[1] ?? null
  let result = ''
  try { result = await readFile(last, 'utf8') } catch {}
  return { ...r, session: id, cost: null, turns: null, result }
}

const turn = (prompt, o) => (AGENT === 'claude' ? claudeTurn(prompt, o) : codexTurn(prompt, o))

// ── what the script measures itself ──────────────────────────────────────────
const sh = (cmd, args, opts = {}) => spawnSync(cmd, args, { cwd: REPO, encoding: 'utf8', timeout: 15 * 60_000, env: { ...process.env, ...NPM_ENV }, ...opts })
const exists = (p) => access(join(REPO, p)).then(() => true, () => false)
async function facts() {
  const commits = Number(sh('git', ['rev-list', '--count', 'HEAD']).stdout.trim() || 0)
  const pushed = Number(spawnSync('git', ['--git-dir', REMOTE, 'rev-list', '--count', '--all'], { encoding: 'utf8' }).stdout.trim() || 0)
  let pkg = {}
  try { pkg = JSON.parse(await readFile(join(REPO, 'package.json'), 'utf8')) } catch {}
  let dataFiles = []
  try { dataFiles = (await readdir(join(REPO, 'design/data'))).filter((f) => f.endsWith('.json')) } catch {}
  return { commits, pushed, scripts: Object.keys(pkg.scripts ?? {}), designData: dataFiles, notes: await exists('notes.md') }
}
function measureCheck() {
  const t0 = now()
  const r = sh('npm', ['run', 'check'])
  const tail = `${r.stdout ?? ''}\n${r.stderr ?? ''}`.trim().split('\n').slice(-6).join('\n')
  return { exit: r.status, ms: now() - t0, timedOut: r.error?.code === 'ETIMEDOUT', tail }
}

// ── the workshop ─────────────────────────────────────────────────────────────
const POINT6 = 'For anything I have not answered: pick the likeliest reading, write it into notes.md as an assumption, and carry on.'
const APPROVE = 'The plan is approved. Go ahead.'
const REVIEW = 'I looked at the page beside the design and have nothing to add. Write that into notes.md under "Design review", then commit and push.'

async function step(n, body) {
  if (!ONLY.includes(n)) return
  const { file, blocks } = await promptBlocks(n)
  log(`step ${n} (${file}) starts`)
  const record = { step: n, file, turns: [], started: new Date().toISOString() }
  results.steps.push(record)
  const t0 = now()
  try {
    await body(blocks, record)
  } catch (error) {
    record.error = String(error)
  }
  record.agentMs = record.turns.reduce((a, t) => a + t.ms, 0)
  record.wallMs = now() - t0
  record.facts = await facts()
  await save()
  log(`step ${n} done: agent ${(record.agentMs / 60000).toFixed(1)} min, commits ${record.facts.commits}, pushed ${record.facts.pushed}`)
}

const addTurn = (record, name, r) => {
  record.turns.push({ name, ms: r.ms, code: r.code, timedOut: r.timedOut, cost: r.cost, agentTurns: r.turns, models: r.models, result: r.result.slice(-1500) })
  return r
}

async function main() {
  await mkdir(REPO, { recursive: true })
  await mkdir(LOGS, { recursive: true })
  if (!(await exists('.git'))) {
    spawnSync('git', ['init', '--bare', '-b', 'main', REMOTE])
    sh('git', ['init', '-b', 'main'])
    sh('git', ['remote', 'add', 'origin', REMOTE])
  }

  await step('01', async ([p], rec) => {
    addTurn(rec, 'prompt', await turn(p, { logName: '01' }))
  })

  await step('02', async ([p], rec) => {
    await mkdir(join(REPO, 'design'), { recursive: true })
    await copyFile(join(ROOT, 'guideline/turbine.fig'), join(REPO, 'design/turbine.fig'))
    const plan = addTurn(rec, 'plan', await turn(p, { plan: true, logName: '02-plan' }))
    const build = addTurn(rec, 'implement', await turn(APPROVE, { session: plan.session, logName: '02-implement' }))
    addTurn(rec, 'point 6 and commit', await turn(POINT6, { session: build.session, logName: '02-answer' }))
  })

  await step('03', async ([p], rec) => {
    const plan = addTurn(rec, 'plan', await turn(p, { plan: true, logName: '03-plan' }))
    addTurn(rec, 'implement', await turn(APPROVE, { session: plan.session, logName: '03-implement' }))
    rec.check = measureCheck()
    rec.expect = 'non-zero: there is no page yet'
  })

  await step('04', async ([p], rec) => {
    const plan = addTurn(rec, 'plan', await turn(p, { plan: true, logName: '04-plan' }))
    const build = addTurn(rec, 'implement', await turn(APPROVE, { session: plan.session, logName: '04-implement' }))
    // The participant looks at the page and reports; the script has no eyes, so it reports nothing new.
    addTurn(rec, 'review and commit', await turn(REVIEW, { session: build.session, logName: '04-review' }))
    rec.check = measureCheck()
  })

  await step('05', async ([p], rec) => {
    addTurn(rec, 'loop', await turn(p, { logName: '05' }))
    rec.check = measureCheck()
    rec.expect = '0'
  })

  await step('06', async ([p], rec) => {
    const trial = `${p}\n\n(For this trial run only: use the site name ${SITE}.)`
    const r = addTurn(rec, 'deploy', await turn(trial, { logName: '06' }))
    const url = (r.result.match(/https:\/\/[a-z0-9-]+\.netlify\.app\S*/i) ?? [])[0]?.replace(/[).,`*]+$/, '')
    rec.url = url ?? null
    if (url) rec.live = spawnSync('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', url], { encoding: 'utf8' }).stdout
  })

  await step('07', async ([p, fix], rec) => {
    const review = addTurn(rec, 'review', await turn(p, { logName: '07-review' }))
    addTurn(rec, 'fix and redeploy', await turn(`Fix findings 1 and 2.\n${fix}`, { session: review.session, logName: '07-fix' }))
    rec.check = measureCheck()
  })

  results.finished = new Date().toISOString()
  await save()
  log('finished')
}

main().catch(async (e) => { results.fatal = String(e); await save(); console.error(e); process.exit(1) })
