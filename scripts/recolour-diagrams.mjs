#!/usr/bin/env node
/**
 * Move the diagrams from the TURBINE palette onto the speaker's brand.
 *
 *   node scripts/recolour-diagrams.mjs [--check]
 *
 * The seven SVGs in deck/diagrams/ are drawn by hand and appear in two places — the deck
 * and the participant site — both of which now carry szymonpaluch.com's identity. They
 * were originally drawn in TURBINE's colours, which belong to the fictional client.
 *
 * The mapping below is by ROLE, not by hue. The brand has two hues where the diagrams had
 * five, so two decisions had to be made rather than looked up:
 *
 *   - sodium orange was the primary accent; emerald takes it, because emerald is what the
 *     brand means by "this is the important one".
 *   - success green and sodium would then collide, so a gate passing becomes emerald 400 —
 *     lighter, in-family, and legible as a state rather than as the brand.
 *   - coolant cyan and arc purple were structural distinctions (the workflow column, the
 *     secondary lane). Both become amber, which is the only other hue the brand has;
 *     where that would merge two things on one diagram, amber 400 separates them.
 *
 * `--check` exits non-zero if any TURBINE colour is still present, so this cannot silently
 * half-apply. Runs in place, and is idempotent.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIR = join(ROOT, 'deck/diagrams')

/** TURBINE value → brand value, keyed by what the colour was doing. */
const MAP = {
  // surfaces
  '#0A0B0D': '#0A0A0A', // page
  '#131519': '#161616', // card
  '#1C1F25': '#1F1F1F', // raised
  '#2A2E36': '#2E2E2E', // hairline
  '#3D434E': '#3F3F46', // divider
  // text
  '#F2F4F7': '#FFFFFF', // primary
  '#A7AEBB': '#9CA3AF', // secondary
  '#6B7280': '#71717A', // the TURBINE trap colour; decorative here, one use
  // meaning
  '#FF6A1A': '#10B981', // sodium  → the primary accent
  '#3DDC84': '#34D399', // success → a gate passing
  '#2FE6D6': '#F59E0B', // coolant → the secondary lane
  '#7C5CFF': '#FBBF24', // arc     → the workflow column
  '#FF4D4D': '#F87171', // danger  → a check failing
}

const files = (await readdir(DIR)).filter((f) => f.endsWith('.svg')).sort()
const check = process.argv.includes('--check')
let touched = 0
const leftovers = []

for (const file of files) {
  const path = join(DIR, file)
  const before = await readFile(path, 'utf8')
  // Colours are rewritten ONLY where they are paint — an attribute value or a style
  // declaration. Never inside <text>. The first version replaced every hex in the file,
  // including the ones the diagrams QUOTE: the loop diagram's example report reads
  // "#6B7280 on .card__genre … 4.07:1", and after recolouring it read "#71717A … 4.07:1"
  // and "#FFFFFF on #10B981 … 2.87:1" — numbers that are true of the old colours and false
  // of the new ones, on a slide and on the participant site, looking entirely authoritative.
  const recolour = (hex) => MAP[hex.toUpperCase()] ?? hex
  let after = before
    .replace(/((?:fill|stroke|stop-color|flood-color|lighting-color|color)=")(#[0-9a-fA-F]{6})(")/g,
      (_, a, hex, b) => a + recolour(hex) + b)
    .replace(/(style="[^"]*")/g, (style) => style.replace(/#[0-9a-fA-F]{6}/g, recolour))

  // Only paint counts as stale. A TURBINE hex inside <text> is a quotation, and is correct.
  const paint = [
    ...after.matchAll(/(?:fill|stroke|stop-color|flood-color|lighting-color|color)="(#[0-9a-fA-F]{6})"/g),
    ...[...after.matchAll(/style="([^"]*)"/g)].flatMap((m) => [...m[1].matchAll(/(#[0-9a-fA-F]{6})/g)]),
  ].map((m) => m[1].toUpperCase())
  const stale = [...new Set(paint)].filter((c) => c in MAP)
  if (stale.length) leftovers.push(`${file}: ${stale.join(' ')}`)

  if (after !== before) {
    touched++
    if (!check) await writeFile(path, after)
  }
  const counts = [...after.matchAll(/#[0-9a-fA-F]{6}/g)].length
  console.log(`  ${file.padEnd(34)} ${after === before ? 'unchanged' : 'recoloured'}  ${counts} colour refs`)
}

if (leftovers.length) {
  console.log('\nFAIL — TURBINE colours still present:')
  for (const l of leftovers) console.log(`  - ${l}`)
  process.exit(1)
}

console.log(
  check
    ? `\n${touched === 0 ? 'PASS — every diagram is already on the brand palette' : `FAIL — ${touched} diagram(s) would change`}`
    : `\n${touched} of ${files.length} diagrams rewritten`,
)
if (check && touched > 0) process.exit(1)
