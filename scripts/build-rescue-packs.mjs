#!/usr/bin/env node
/**
 * Build the two rescue packs from a complete trial run of the prompts.
 *
 *   node scripts/build-rescue-packs.mjs --repo <trial repository> [--out guideline]
 *
 * A participant whose step does not finish in time downloads the pack for that step and
 * carries on with the next prompt. A pack is exactly what that step produced in a real run,
 * taken from its commits rather than from a copy of the whole folder, so it cannot bring
 * anything a later step made:
 *
 *   design-data.zip   everything prompt 02 committed: the decoder, design/data, design/images
 *   checker.zip       everything prompts 02 and 03 committed: the checker only makes sense
 *                     with the design data it was written against, so it carries that too
 *
 * package.json is never inside a pack — unzipping would overwrite the participant's own.
 * Instead each pack has a RESCUE.md that lists the npm scripts and dependencies the step
 * added, and the agent adds them. The steps are found by the commits the trial script
 * recorded (trial.json beside the repository).
 */

import { spawnSync } from 'node:child_process'
import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, f) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : f)
const REPO = resolve(arg('--repo', ''))
const OUT = resolve(arg('--out', join(ROOT, 'guideline')))
if (!arg('--repo')) { console.error('usage: --repo <trial repository>'); process.exit(2) }

const git = (...args) => {
  const r = spawnSync('git', args, { cwd: REPO, encoding: 'utf8' })
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`)
  return r.stdout.trim()
}

// ── which commits belong to which step ───────────────────────────────────────
// A run that was interrupted and resumed leaves one results file per stretch: trial-01.json, trial-02.json, trial.json.
const runs = []
for (const f of (await readdir(dirname(REPO))).filter((f) => /^trial(-\d+)?\.json$/.test(f)).sort()) {
  runs.push(JSON.parse(await readFile(join(dirname(REPO), f), 'utf8')))
}
const countAfter = (step) => {
  const s = runs.flatMap((r) => r.steps).find((x) => x.step === step && !x.error && x.facts)
  if (!s) throw new Error(`the trial has no successful step ${step}`)
  return s.facts.commits
}
const commits = git('rev-list', '--reverse', 'HEAD').split('\n')
const at = (n) => commits[n - 1]
const c01 = at(countAfter('01'))
const c02 = at(countAfter('02'))
const c03 = at(countAfter('03'))

const changed = (from, to) =>
  git('diff', '--name-only', '--diff-filter=AM', from, to)
    .split('\n')
    .filter(Boolean)
    .filter((f) => !/^(package(-lock)?\.json|notes\.md|\.gitignore)$/.test(f) && !f.endsWith('.fig'))

const pkgAt = (rev) => JSON.parse(git('show', `${rev}:package.json`))
const addedBetween = (from, to) => {
  const a = pkgAt(from)
  const b = pkgAt(to)
  const pick = (key) => Object.entries(b[key] ?? {}).filter(([k, v]) => a[key]?.[k] !== v)
  return { scripts: pick('scripts'), dependencies: pick('dependencies'), devDependencies: pick('devDependencies') }
}

async function pack(name, from, to, nextPrompt, extraNote) {
  const files = changed(from, to)
  const added = addedBetween(from, to)
  const dir = join(dirname(REPO), `pack-${name}`)
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  for (const f of files) {
    await mkdir(join(dir, dirname(f)), { recursive: true })
    // maxBuffer: spawnSync stops at 1 MB by default and returns the file cut short, silently.
    const shown = spawnSync('git', ['show', `${to}:${f}`], { cwd: REPO, maxBuffer: 512 * 1024 * 1024 })
    if (shown.status !== 0 || shown.error) throw new Error(`git show ${f}: ${shown.error ?? shown.stderr}`)
    await writeFile(join(dir, f), shown.stdout)
  }
  const list = (entries) => entries.map(([k, v]) => `- \`${k}\`: \`${v}\``).join('\n') || '- none'
  const install = [...added.dependencies.map(([k, v]) => `${k}@${v}`)]
  const installDev = [...added.devDependencies.map(([k, v]) => `${k}@${v}`)]
  await writeFile(join(dir, 'RESCUE.md'), `# Rescue pack: ${name}

Made from a complete run of the workshop prompts. It replaces the step before prompt ${nextPrompt}.

## For the agent

1. Copy every file in this pack into the project, keeping the folders. Replace files with the same path.
2. Add these scripts to package.json (keep the ones already there):
${list(added.scripts)}
3. Install:
${install.length ? `   \`npm install ${install.join(' ')}\`` : '   no runtime dependencies'}
${installDev.length ? `   \`npm install --save-dev ${installDev.join(' ')}\`` : '   no development dependencies'}
${extraNote ? `4. ${extraNote}\n` : ''}
Then commit with the message "Rescue pack: ${name}" and push. Tell the person to type /clear and paste prompt ${nextPrompt}.

## Files

${files.map((f) => `- ${f}`).join('\n')}
`)
  const zip = join(OUT, `${name}.zip`)
  await rm(zip, { force: true })
  const z = spawnSync('zip', ['-qr', '-X', zip, '.'], { cwd: dir, encoding: 'utf8' })
  if (z.status !== 0) throw new Error(`zip failed: ${z.stderr}`)
  const size = Number(spawnSync('stat', ['-c', '%s', zip], { encoding: 'utf8' }).stdout.trim())
  console.log(`${name}.zip  ${files.length} files, ${(size / 1024 / 1024).toFixed(1)} MB, scripts: ${added.scripts.map(([k]) => k).join(', ') || 'none'}`)
}

await pack('design-data', c01, c02, '03')
await pack('checker', c01, c03, '04', 'If Playwright asks for a browser, run `npx playwright install chromium`.')
