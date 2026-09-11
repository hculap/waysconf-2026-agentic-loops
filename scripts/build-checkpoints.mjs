#!/usr/bin/env node
/**
 * Build the checkpoint branches.
 *
 *   node scripts/build-checkpoints.mjs            # dry run, prints what it would do
 *   node scripts/build-checkpoints.mjs --write    # actually create the branches
 *
 * A workshop where falling behind means falling out is a workshop that loses a third
 * of the room in the first twenty minutes. So every stage of the session exists as a
 * branch, and `git checkout step-3` puts anyone back with everybody else.
 *
 * The branches are generated rather than hand-curated, from one source: the finished
 * implementation on `solution`. Each step keeps the sections built by that point and
 * deletes the rest, so a participant on step-2 sees exactly the repository state they
 * would have had if they had built the first five sections themselves — no leftover
 * files from the answer, and no imports pointing at things that are not there.
 *
 * `main` is step-0. That matters: someone who clones the repository and does nothing
 * must get the starting line, not the finish.
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const WRITE = process.argv.includes('--write')

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

/**
 * The canonical section order, split into the stages the agenda actually has.
 * These match docs/CANON.md §7 and the timing card in deck/notes/TIMING.md.
 */
const STEPS = [
  {
    name: 'step-0',
    sections: [],
    title: 'Starter — nothing built',
    when: '0:08 in the agenda. Everyone starts here, including you.',
  },
  {
    name: 'step-1',
    sections: ['Nav', 'Hero'],
    title: 'Nav and hero',
    when: 'End of sprint 1, about 0:40.',
  },
  {
    name: 'step-2',
    sections: ['Nav', 'Hero', 'Ticker', 'Lineup', 'Programme'],
    title: 'Lineup and programme',
    when: 'Partway through the verifier block, about 0:50.',
  },
  {
    name: 'step-3',
    sections: ['Nav', 'Hero', 'Ticker', 'Lineup', 'Programme', 'Venue', 'Tickets', 'Faq', 'Newsletter', 'Footer'],
    title: 'Every section built',
    when: 'End of sprint 2, about 1:10. Gates are not all green yet.',
  },
]

const ALL_SECTIONS = STEPS[STEPS.length - 1].sections

/** Rewrite index.astro to import and render only the sections a step has built. */
function trimIndex(source, keep) {
  const kept = new Set(keep)

  const lines = source.split('\n').filter((line) => {
    const imp = line.match(/^import (\w+) from '\.\.\/sections\/\w+\.astro'$/)
    if (imp) return kept.has(imp[1])
    const render = line.match(/^\s*<(\w+)(\s+slot="\w+")?\s*\/>$/)
    if (render && ALL_SECTIONS.includes(render[1])) return kept.has(render[1])
    return true
  })

  return lines.join('\n')
}

const STARTER_INDEX = `---
/**
 * STARTER STATE.
 *
 * There is no festival page here yet. That is the point — building it is the
 * workshop. Your agent reads brief/BRIEF.md, brief/CONTENT.md and
 * brief/ACCEPTANCE.md, plus the design (Figma, or design/export/ if you have no
 * paid Figma seat), and fills this file in with the sections listed in
 * docs/CANON.md section 7.
 *
 * Run \`npm run check\` right now. Every gate will fail, and the report it writes
 * is your task list.
 */
import Base from '../layouts/Base.astro'

const sections = [
  'nav',
  'hero',
  'ticker',
  'lineup',
  'programme',
  'venue',
  'tickets',
  'faq',
  'newsletter',
  'footer',
]
---

<Base
  title="TURBINE — starter"
  description="Starter state for the TURBINE festival landing page. Nothing is built yet; run npm run check to see what is missing."
  ogTitle="TURBINE — starter"
  ogDescription="Starter state for the TURBINE festival landing page."
  ogImageAlt="The TURBINE workshop starter page."
>
  <section class="container-turbine py-24">
    <p class="font-mono text-sm text-accent-coolant">starter state</p>
    <h1 class="mt-4 font-display text-5xl font-bold tracking-[-0.02em]">Nothing is built yet.</h1>

    <p class="mt-6 max-w-[60ch] text-lg text-text-secondary">
      This page is the starting line. The ten sections below do not exist. Your job, and your
      agent's job, is to build them from the brief and the design until every gate passes.
    </p>

    <ol class="mt-10 grid max-w-[60ch] gap-2 font-mono text-sm text-text-secondary">
      {
        sections.map((name, i) => (
          <li class="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-surface px-4 py-3">
            <span class="text-text-secondary">{String(i + 1).padStart(2, '0')}</span>
            <span class="text-text-primary">{name}</span>
            <span class="ml-auto text-state-danger">missing</span>
          </li>
        ))
      }
    </ol>

    <p class="mt-10 max-w-[60ch] text-text-secondary">
      Start here:
      <code class="rounded-sm bg-bg-raised px-2 py-1 font-mono text-text-primary">npm run check</code>
      — then read
      <code class="rounded-sm bg-bg-raised px-2 py-1 font-mono text-text-primary">checks/report.md</code>.
    </p>
  </section>
</Base>
`

function applyStep(step, solutionIndex) {
  const indexPath = join(ROOT, 'src/pages/index.astro')

  if (step.sections.length === 0) {
    writeFileSync(indexPath, STARTER_INDEX)
  } else {
    writeFileSync(indexPath, trimIndex(solutionIndex, step.sections))
  }

  const removed = []
  for (const name of ALL_SECTIONS) {
    if (step.sections.includes(name)) continue
    const file = join(ROOT, 'src/sections', `${name}.astro`)
    if (existsSync(file)) {
      rmSync(file)
      removed.push(`src/sections/${name}.astro`)
    }
  }
  return removed
}

// ── Main ──────────────────────────────────────────────────────────────────────

const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
const dirty = git('status', '--porcelain')
if (dirty && WRITE) {
  console.error('Working tree is dirty. Commit or stash first.\n')
  console.error(dirty)
  process.exit(1)
}

const solutionIndex = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8')

console.log(`\nCheckpoints, generated from the finished implementation on ${branch}.\n`)
for (const step of STEPS) {
  const kept = step.sections.length ? step.sections.join(', ') : '(none)'
  console.log(`  ${step.name.padEnd(8)} ${step.title.padEnd(26)} keeps: ${kept}`)
}
console.log()

if (!WRITE) {
  console.log('Dry run. Pass --write to create the branches.\n')
  process.exit(0)
}

const startRef = git('rev-parse', 'HEAD')

for (const step of STEPS) {
  execFileSync('git', ['checkout', '-q', '-B', step.name, startRef], { cwd: ROOT })
  const removed = applyStep(step, solutionIndex)
  execFileSync('git', ['add', '-A'], { cwd: ROOT })
  execFileSync(
    'git',
    [
      '-c',
      'user.name=Szymon Paluch',
      'commit',
      '-q',
      '-m',
      `checkpoint ${step.name}: ${step.title}\n\n${step.when}\n\n` +
        (removed.length
          ? `Sections not yet built, removed from this checkpoint:\n${removed.map((r) => `  ${r}`).join('\n')}`
          : 'Every section is present.'),
      '--allow-empty',
    ],
    { cwd: ROOT },
  )
  console.log(`  created ${step.name}  (${removed.length} section file(s) removed)`)
}

execFileSync('git', ['checkout', '-q', branch], { cwd: ROOT })
console.log(`\nBack on ${branch}. Branches created: ${STEPS.map((s) => s.name).join(', ')}\n`)
