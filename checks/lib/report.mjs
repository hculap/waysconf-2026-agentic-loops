/**
 * The report is the only thing the loop reads back.
 *
 * Two audiences, one file each:
 *   checks/report.json — machine readable, stable shape, what tooling parses
 *   checks/report.md   — what you paste into an agent, or read yourself at 2am
 *
 * Design rule for everything in here: a gate result is a fact, not an opinion.
 * No gate is allowed to return "probably fine".
 */

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

export const STATUS = {
  PASS: 'pass',
  FAIL: 'fail',
  SKIP: 'skip',
}

export function gateResult({ id, title, status, criteria = [], failures = [], notes = [], durationMs = 0, evidence = {} }) {
  return { id, title, status, criteria, failures, notes, durationMs, evidence }
}

export function summarise(gates) {
  const failed = gates.filter((g) => g.status === STATUS.FAIL)
  const skipped = gates.filter((g) => g.status === STATUS.SKIP)
  const passed = gates.filter((g) => g.status === STATUS.PASS)
  const failureCount = gates.reduce((n, g) => n + (g.failures?.length ?? 0), 0)
  return {
    ok: failed.length === 0,
    total: gates.length,
    passed: passed.length,
    failed: failed.length,
    skipped: skipped.length,
    failureCount,
  }
}

function renderMarkdown(gates, summary, meta) {
  const lines = []
  const icon = (s) => (s === STATUS.PASS ? 'PASS' : s === STATUS.FAIL ? 'FAIL' : 'SKIP')

  lines.push('# Gate report')
  lines.push('')
  lines.push(
    summary.ok
      ? `**All ${summary.total} gates passed.** Nothing to fix.`
      : `**${summary.failed} of ${summary.total} gates failed**, with ${summary.failureCount} individual failure${summary.failureCount === 1 ? '' : 's'}.`,
  )
  lines.push('')
  lines.push(`Run at ${meta.startedAt} · took ${(meta.durationMs / 1000).toFixed(1)}s · base URL ${meta.baseUrl}`)
  lines.push('')

  lines.push('| Gate | Result | Failures |')
  lines.push('|---|---|---|')
  for (const g of gates) {
    lines.push(`| ${g.title} | ${icon(g.status)} | ${g.failures?.length ?? 0} |`)
  }
  lines.push('')

  if (!summary.ok) {
    lines.push('---')
    lines.push('')
    lines.push('## What to fix')
    lines.push('')
    lines.push('Each item below names the acceptance criterion it violates. Fix the page, not the gate.')
    lines.push('')
    let n = 0
    for (const g of gates.filter((x) => x.status === STATUS.FAIL)) {
      lines.push(`### ${g.title}`)
      lines.push('')
      for (const f of g.failures ?? []) {
        n++
        lines.push(`**${n}. ${f.criterion ? `[${f.criterion}] ` : ''}${f.message}**`)
        lines.push('')
        if (f.where) lines.push(`- Where: ${f.where}`)
        if (f.expected !== undefined) lines.push(`- Expected: \`${f.expected}\``)
        if (f.actual !== undefined) lines.push(`- Actual: \`${f.actual}\``)
        if (f.hint) lines.push(`- Hint: ${f.hint}`)
        lines.push('')
      }
    }
  }

  const allNotes = gates.flatMap((g) => (g.notes ?? []).map((t) => `- ${g.title}: ${t}`))
  if (allNotes.length) {
    lines.push('---')
    lines.push('')
    lines.push('## Notes')
    lines.push('')
    lines.push(...allNotes)
    lines.push('')
  }

  lines.push('---')
  lines.push('')
  lines.push('## What these gates do not catch')
  lines.push('')
  lines.push(
    'Automated accessibility tooling detects roughly 30-40% of real WCAG violations. A pixel diff can tell you',
  )
  lines.push(
    'that something moved but not whether the new position is better. None of these gates has an opinion about',
  )
  lines.push(
    'whether the page is any good. Green here means "no known defect", not "finished" — see brief/ACCEPTANCE.md.',
  )
  lines.push('')

  return lines.join('\n')
}

export async function writeReport(gates, meta) {
  const summary = summarise(gates)
  const json = {
    schemaVersion: 1,
    summary,
    meta,
    gates,
  }
  await mkdir(join(ROOT, 'checks'), { recursive: true })
  await writeFile(join(ROOT, 'checks/report.json'), JSON.stringify(json, null, 2) + '\n')
  await writeFile(join(ROOT, 'checks/report.md'), renderMarkdown(gates, summary, meta))
  return summary
}
