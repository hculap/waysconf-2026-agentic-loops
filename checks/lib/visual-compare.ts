/**
 * The pixel arithmetic behind AC-34 and AC-35, and the failure messages it produces.
 *
 * This lives beside the gate rather than inside checks/specs/visual.spec.ts for one reason:
 * `checks/fixtures/visual/` has to be able to drive the comparison against a deliberately wrong
 * baseline and assert the exact message that comes back. ACCEPTANCE.md's third consequence — a gate
 * that has never gone red is indistinguishable from a gate that does nothing — can only be satisfied
 * by a fixture that calls the same code the gate calls.
 *
 * Three decisions in here are the difference between a measurement and a number that looks like one.
 *
 * 1. **No sharp.extend().** The previous version padded both images onto the union canvas with
 *    `extend()`, which validates every edge as an integer between 0 and 10000 and throws above that.
 *    A page that grew by more than 10 000px — the ordinary first state of this workshop, where a built
 *    page meets a baseline captured from the starter — did not produce a diff percentage, it produced
 *    an exception that killed the whole gate. The canvases here are plain buffers with rows copied
 *    into them, so there is no ceiling.
 *
 * 2. **Pixels that exist in only one of the two images count as differing.** Padding with transparent
 *    pixels and letting pixelmatch blend them against white made added area read as "matching" when it
 *    happened to be pale, while simultaneously inflating the denominator — so a page that grew a tall
 *    light-coloured region scored *better* than one that did not. Counting the non-overlapping area as
 *    100% different removes both halves of that: growth costs, and it costs in proportion to how much
 *    of the page it is.
 *
 * 3. **includeAA is true.** pixelmatch's default silently drops every pixel its heuristic reads as
 *    antialiased, which is a second, undeclared tolerance stacked on top of the 0.1 colour threshold
 *    ACCEPTANCE.md actually specifies — and it discounts exactly the defects the 0.5% hero budget
 *    exists to catch: a wrong letter-spacing, a shifted hairline, a changed border colour. The
 *    declared tolerance is the threshold and nothing else.
 */

import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import pixelmatch from 'pixelmatch'
import sharp from 'sharp'
import type { Failure } from './gate'

/** pixelmatch colour-distance tolerance. 0 counts every antialiased glyph edge; see ACCEPTANCE.md. */
export const MATCH_THRESHOLD = 0.1
/** Share of pixels allowed to differ, as percentages, because that is how the failures are phrased. */
export const FULL_PAGE_BUDGET_PCT = 1.5
export const HERO_BUDGET_PCT = 0.5
/** See decision 3 in the file header. Declared here so it appears in the gate's evidence. */
export const INCLUDE_AA = true

/** Filename of the record baseline.mjs writes beside the PNGs it produced. */
export const MANIFEST_NAME = 'manifest.json'

export interface RegionStats {
  width: number
  height: number
  mismatched: number
  totalPixels: number
  pct: number
}

export interface Comparison {
  actualWidth: number
  actualHeight: number
  baselineWidth: number
  baselineHeight: number
  actualSize: string
  baselineSize: string
  widthMismatch: boolean
  heightMismatch: boolean
  sizeMismatch: boolean
  /** The region both images have — the only place a pixel can be compared with another pixel. */
  intersection: RegionStats
  /** Intersection mismatches plus every pixel that exists in only one image. The budget reads this. */
  union: RegionStats
  /** Shorthand for union.pct: the number the budget is measured against. */
  pct: number
  diffPath: string
}

interface Raw {
  data: Buffer
  width: number
  height: number
}

const fixed2 = (n: number) => n.toFixed(2)

async function decodeRgba(input: Buffer | string): Promise<Raw> {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  if (info.channels !== 4) throw new Error(`expected RGBA, got ${info.channels} channels`)
  return { data, width: info.width, height: info.height }
}

/** Top-left w×h region of a raw RGBA buffer, copied row by row. No image library, no size limits. */
function cropTopLeft(src: Raw, width: number, height: number): Buffer {
  const out = Buffer.alloc(width * height * 4)
  const srcRowBytes = src.width * 4
  const outRowBytes = width * 4
  for (let y = 0; y < height; y++) {
    src.data.copy(out, y * outRowBytes, y * srcRowBytes, y * srcRowBytes + outRowBytes)
  }
  return out
}

/**
 * Compare one capture against one baseline.
 *
 * The diff image is drawn on the union canvas: pixelmatch's own output for the overlapping region,
 * and flat magenta for area that exists in only one of the two images, so "the page got taller" is
 * visible at a glance rather than inferred from a percentage.
 */
export async function compareToBaseline(args: {
  actual: Buffer
  baselinePath: string
  diffPath: string
}): Promise<Comparison> {
  const [a, b] = await Promise.all([decodeRgba(args.actual), decodeRgba(args.baselinePath)])

  const iw = Math.min(a.width, b.width)
  const ih = Math.min(a.height, b.height)
  const uw = Math.max(a.width, b.width)
  const uh = Math.max(a.height, b.height)

  const intersectionPixels = iw * ih
  const unionPixels = uw * uh
  const onlyInOne = unionPixels - intersectionPixels

  let intersectionMismatched = 0
  let intersectionDiff: Buffer | null = null

  if (intersectionPixels > 0) {
    const ai = a.width === iw && a.height === ih ? a.data : cropTopLeft(a, iw, ih)
    const bi = b.width === iw && b.height === ih ? b.data : cropTopLeft(b, iw, ih)
    intersectionDiff = Buffer.alloc(intersectionPixels * 4)
    intersectionMismatched = pixelmatch(ai, bi, intersectionDiff, iw, ih, {
      threshold: MATCH_THRESHOLD,
      includeAA: INCLUDE_AA,
    })
  }

  // Union canvas, pre-filled with the "this area exists in only one image" colour.
  const diffCanvas = Buffer.alloc(unionPixels * 4)
  for (let i = 0; i < unionPixels; i++) {
    diffCanvas[i * 4] = 255
    diffCanvas[i * 4 + 1] = 0
    diffCanvas[i * 4 + 2] = 255
    diffCanvas[i * 4 + 3] = 255
  }
  if (intersectionDiff) {
    for (let y = 0; y < ih; y++) {
      intersectionDiff.copy(diffCanvas, (y * uw) * 4, y * iw * 4, y * iw * 4 + iw * 4)
    }
  }

  mkdirSync(dirname(args.diffPath), { recursive: true })
  await sharp(diffCanvas, { raw: { width: uw, height: uh, channels: 4 } })
    .png()
    .toFile(args.diffPath)

  const unionMismatched = intersectionMismatched + onlyInOne

  return {
    actualWidth: a.width,
    actualHeight: a.height,
    baselineWidth: b.width,
    baselineHeight: b.height,
    actualSize: `${a.width}x${a.height}`,
    baselineSize: `${b.width}x${b.height}`,
    widthMismatch: a.width !== b.width,
    heightMismatch: a.height !== b.height,
    sizeMismatch: a.width !== b.width || a.height !== b.height,
    intersection: {
      width: iw,
      height: ih,
      mismatched: intersectionMismatched,
      totalPixels: intersectionPixels,
      pct: intersectionPixels === 0 ? 100 : (intersectionMismatched / intersectionPixels) * 100,
    },
    union: {
      width: uw,
      height: uh,
      mismatched: unionMismatched,
      totalPixels: unionPixels,
      pct: unionPixels === 0 ? 100 : (unionMismatched / unionPixels) * 100,
    },
    pct: unionPixels === 0 ? 100 : (unionMismatched / unionPixels) * 100,
    diffPath: args.diffPath,
  }
}

/** The clause that turns "47% of pixels differ" into something a person can act on. */
function sizeClause(cmp: Comparison): string {
  const onlyInOne = cmp.union.totalPixels - cmp.intersection.totalPixels
  const onlyPct = cmp.union.totalPixels === 0 ? 100 : (onlyInOne / cmp.union.totalPixels) * 100
  return (
    ` The capture is ${cmp.actualSize} and the baseline is ${cmp.baselineSize}: ` +
    `${fixed2(onlyPct)}% of that figure is area that exists in only one of them, and the region they ` +
    `share differs by ${fixed2(cmp.intersection.pct)}%.`
  )
}

function counts(region: RegionStats): string {
  return `${region.mismatched.toLocaleString('en-US')} of ${region.totalPixels.toLocaleString('en-US')} pixels`
}

/**
 * AC-34's verdict, or null when the capture is inside budget.
 *
 * A width mismatch is reported without a percentage. The capture width is the viewport width by
 * construction, so a baseline of another width is not a stricter or looser comparison — it is a
 * comparison with something else, and quoting a number for it would dress an accident as evidence.
 */
export function fullPageVerdict(args: {
  viewport: number
  baselineRel: string
  diffRel: string
  cmp: Comparison
}): Failure | null {
  const { viewport, baselineRel, diffRel, cmp } = args

  if (cmp.widthMismatch) {
    return {
      criterion: 'AC-34',
      message:
        `AC-34 VISUAL: ${viewport}px cannot be compared with ${baselineRel} — the capture is ` +
        `${cmp.actualSize} and the baseline is ${cmp.baselineSize}. A baseline of a different width is a ` +
        `picture of a different measurement, so no percentage is quoted. Diff: ${diffRel}`,
      where: `${viewport}px`,
      expected: `a baseline ${viewport}px wide`,
      actual: `${baselineRel} is ${cmp.baselineSize}`,
      hint: 'Either the baseline was captured at another viewport, or the wrong file is in design/export/.',
    }
  }

  if (cmp.pct <= FULL_PAGE_BUDGET_PCT) return null

  return {
    criterion: 'AC-34',
    message:
      `AC-34 VISUAL: ${viewport}px differs from ${baselineRel} by ${fixed2(cmp.pct)}% of pixels ` +
      `(budget ${FULL_PAGE_BUDGET_PCT}%). Diff: ${diffRel}` +
      (cmp.heightMismatch ? sizeClause(cmp) : ''),
    where: `${viewport}px`,
    expected: `<= ${FULL_PAGE_BUDGET_PCT}% of pixels`,
    actual: `${fixed2(cmp.pct)}% (${counts(cmp.union)})`,
    hint: cmp.heightMismatch
      ? `The page changed height. In ${diffRel}, magenta is area that exists in only one of the two images.`
      : `Open ${diffRel}: the highlighted pixels are what moved.`,
  }
}

/** AC-35's verdict, or null when the hero crop is inside budget. */
export function heroVerdict(args: {
  viewport: number
  selector: string
  baselineRel: string
  diffRel: string
  cmp: Comparison
}): Failure | null {
  const { viewport, selector, baselineRel, diffRel, cmp } = args

  if (cmp.widthMismatch) {
    return {
      criterion: 'AC-35',
      message:
        `AC-35 VISUAL: hero at ${viewport}px cannot be compared with ${baselineRel} — the crop is ` +
        `${cmp.actualSize} and the baseline is ${cmp.baselineSize}. A hero of a different width is a ` +
        `different region, so no percentage is quoted. Diff: ${diffRel}`,
      where: `${selector} at ${viewport}px`,
      expected: `a hero crop the width of ${baselineRel} (${cmp.baselineSize})`,
      actual: cmp.actualSize,
      hint: 'The hero box changed width, or the baseline belongs to another breakpoint.',
    }
  }

  if (cmp.pct <= HERO_BUDGET_PCT) return null

  return {
    criterion: 'AC-35',
    message:
      `AC-35 VISUAL: hero at ${viewport}px differs by ${fixed2(cmp.pct)}% ` +
      `(budget ${HERO_BUDGET_PCT}%). Diff: ${diffRel}` +
      (cmp.heightMismatch ? sizeClause(cmp) : ''),
    where: `${selector} at ${viewport}px`,
    expected: `<= ${HERO_BUDGET_PCT}% of pixels against ${baselineRel}`,
    actual: `${fixed2(cmp.pct)}% (${counts(cmp.union)})`,
    hint: cmp.heightMismatch
      ? 'The hero region changed size, so start with its height and padding.'
      : 'The hero carries the wordmark: check type size and letter-spacing before anything else.',
  }
}

// ── The baseline manifest ─────────────────────────────────────────────────────

export interface ManifestEntry {
  sha256: string
  width: number
  height: number
}

export interface BaselineManifest {
  generatedAt: string
  reason: string
  tool: string
  baselines: Record<string, ManifestEntry>
}

export function sha256OfFile(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

/** Null when there is no manifest — an unsigned baseline set is a note, not a verdict. */
export function readManifest(exportDir: string): BaselineManifest | null {
  const path = join(exportDir, MANIFEST_NAME)
  if (!existsSync(path)) return null
  try {
    const parsed = JSON.parse(readFileSync(path, 'utf8')) as BaselineManifest
    return parsed && typeof parsed === 'object' && parsed.baselines ? parsed : null
  } catch {
    return null
  }
}

/**
 * AC-34/AC-35 verdict on the *reference* rather than the page.
 *
 * `npm run baseline` records a sha256 and a human-written reason for every file it writes. A baseline
 * whose bytes no longer match that record was changed by something else, and the record of why —
 * the thing that makes a moved target auditable — does not exist for it. The comparison still runs;
 * what this reports is that nobody signed off on what it is comparing against.
 */
export function manifestVerdict(args: {
  criterion: 'AC-34' | 'AC-35'
  baselineRel: string
  fileName: string
  manifest: BaselineManifest | null
  actualSha: string
}): Failure | null {
  const { criterion, baselineRel, fileName, manifest, actualSha } = args
  const entry = manifest?.baselines?.[fileName]
  if (!entry || typeof entry.sha256 !== 'string') return null
  if (entry.sha256 === actualSha) return null

  return {
    criterion,
    message:
      `${criterion} VISUAL: ${baselineRel} is not the baseline recorded in design/export/${MANIFEST_NAME} — ` +
      `its sha256 is ${actualSha.slice(0, 12)}, the manifest records ${entry.sha256.slice(0, 12)}. ` +
      `The comparison below is against a reference no one signed off.`,
    where: baselineRel,
    expected: `sha256 ${entry.sha256.slice(0, 12)} (${entry.width}x${entry.height}), reason: ${manifest?.reason ?? 'unknown'}`,
    actual: `sha256 ${actualSha.slice(0, 12)}`,
    hint: 'Restore the committed baseline, or re-record it with npm run baseline -- --yes --reason "..." so the change carries a reason.',
  }
}
