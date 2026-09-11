import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')

/**
 * Where this run's gate results go.
 *
 * checks/run.mjs stamps CHECK_RUN_DIR with a directory unique to the run before it
 * spawns Playwright. Without that, every concurrent run shares one directory, and a
 * second browser session writing into it mid-aggregation gets folded into the first
 * run's report — which is how a report once came back describing a page from an
 * entirely different website. A verifier that can be contaminated by something else
 * on the machine is not a verifier. See evidence/INCIDENTS.md.
 *
 * The fallback path keeps a spec runnable on its own with `npx playwright test`.
 */
const GATE_DIR = process.env.CHECK_RUN_DIR
  ? join(process.env.CHECK_RUN_DIR, 'gates')
  : join(ROOT, 'checks/.results/gates')

export interface Failure {
  /** Acceptance criterion id from brief/ACCEPTANCE.md, e.g. "AC-14". */
  criterion?: string
  /** One sentence, imperative where possible, describing the defect. */
  message: string
  /** Selector, file path, breakpoint — wherever a human would go to look. */
  where?: string
  expected?: string | number
  actual?: string | number
  /** Only when there is a genuinely non-obvious next step. Never restate the message. */
  hint?: string
}

/**
 * Collects failures for one gate and writes them where checks/run.mjs will find them.
 *
 * A gate reports facts. If a check cannot run, that is a SKIP with a reason, never a
 * silent pass — a verifier that quietly disappears is worse than no verifier, because
 * you stop looking.
 */
export class Gate {
  readonly failures: Failure[] = []
  readonly notes: string[] = []
  readonly criteria: string[]
  private startedAt = Date.now()
  private skippedReason: string | null = null

  constructor(
    readonly id: string,
    readonly title: string,
    criteria: string[] = [],
  ) {
    this.criteria = criteria
  }

  fail(f: Failure): void {
    this.failures.push(f)
  }

  note(text: string): void {
    this.notes.push(text)
  }

  skip(reason: string): void {
    this.skippedReason = reason
  }

  /** Write the gate result to disk. Call this exactly once, in an afterAll hook. */
  flush(evidence: Record<string, unknown> = {}): void {
    mkdirSync(GATE_DIR, { recursive: true })
    const status = this.skippedReason ? 'skip' : this.failures.length === 0 ? 'pass' : 'fail'
    const payload = {
      id: this.id,
      title: this.title,
      status,
      criteria: this.criteria,
      failures: this.failures,
      notes: this.skippedReason ? [...this.notes, `skipped: ${this.skippedReason}`] : this.notes,
      durationMs: Date.now() - this.startedAt,
      evidence,
    }
    writeFileSync(join(GATE_DIR, `${this.id}.json`), JSON.stringify(payload, null, 2) + '\n')
  }
}

/** The three widths that are screenshotted, diffed and audited. Nothing else is. */
export const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
] as const

export type BreakpointName = (typeof BREAKPOINTS)[number]['name']
