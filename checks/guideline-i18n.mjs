#!/usr/bin/env node
/**
 * Is the Polish site actually Polish?
 *
 *   node checks/guideline-i18n.mjs
 *
 * A second language fails in two quiet ways, and neither shows up in the accessibility gate
 * or the behaviour gate, because both pages are perfectly valid either way:
 *
 *   1. A string is added to one locale and not the other. The page renders with `undefined`
 *      where a sentence should be, or silently drops a card.
 *   2. A file is copied across as a placeholder and never translated. The Polish page is
 *      English, in Polish chrome, and looks entirely finished.
 *
 * The second one is the dangerous one: a half-translated page is worse than an untranslated
 * one, because nobody goes looking.
 *
 * So this compares the two locale files structurally, then measures how much of each Polish
 * page is actually in Polish — by counting Polish-only characters and a list of common
 * English function words that have no business in a Polish sentence.
 */

import { readFile, readdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const failures = []
const fail = (m) => failures.push(m)
const ok = (m) => console.log(`  ok   ${m}`)

// ── 1. the two locale files must have the same shape ────────────────────────

const shape = (value, path = '') => {
  if (Array.isArray(value)) return [`${path}[]:${value.length}`, ...value.flatMap((v, i) => shape(v, `${path}[${i}]`))]
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .flatMap((k) => shape(value[k], path ? `${path}.${k}` : k))
  }
  return [`${path}:${typeof value}`]
}

const en = (await import(join(ROOT, 'guideline/src/ui.en.mjs'))).default
const pl = (await import(join(ROOT, 'guideline/src/ui.pl.mjs'))).default

const enShape = shape(en)
const plShape = shape(pl)
const onlyEn = enShape.filter((k) => !plShape.includes(k))
const onlyPl = plShape.filter((k) => !enShape.includes(k))

// lang/base/name/other differ by design; everything else must match exactly
const expected = new Set(['lang:string', 'base:string', 'name:string', 'other.base:string', 'other.lang:string', 'other.name:string', 'switcherLabel:string'])
const unexpectedEn = onlyEn.filter((k) => !expected.has(k))
const unexpectedPl = onlyPl.filter((k) => !expected.has(k))

for (const k of unexpectedEn) fail(`ui.pl.mjs is missing ${k} — the Polish page will render undefined there`)
for (const k of unexpectedPl) fail(`ui.en.mjs is missing ${k}`)
if (unexpectedEn.length === 0 && unexpectedPl.length === 0) {
  ok(`the two locale files have the same shape (${enShape.length} leaves)`)
}

// ── 2. the Polish sources must not be English ───────────────────────────────

/**
 * Function words that appear constantly in English prose and essentially never inside a
 * Polish sentence. Counted as whole words, outside code blocks: a Polish page legitimately
 * contains `npm run check`, `Duplicate to your drafts` and a prompt or two in English.
 */
const ENGLISH = /\b(the|and|with|that|this|which|your|you|from|into|when|what|does|have|been|they|there|because|instead|rather|about|every|never|always|something|nothing)\b/gi
const POLISH = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g

/** Strip fenced code, inline code and HTML so only prose is judged. */
const prose = (md) =>
  md
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/https?:\/\/\S+/g, ' ')

const pairs = [
  ['guideline/src/preparation.md', 'guideline/src/preparation.pl.md'],
  ['guideline/src/ideas.md', 'guideline/src/ideas.pl.md'],
]

const enPrompts = (await readdir(join(ROOT, 'prompts'))).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
for (const f of enPrompts) pairs.push([`prompts/${f}`, `prompts/pl/${f}`])

for (const [enPath, plPath] of pairs) {
  let enText
  let plText
  try {
    enText = await readFile(join(ROOT, enPath), 'utf8')
    plText = await readFile(join(ROOT, plPath), 'utf8')
  } catch (error) {
    fail(`${plPath} is missing — the Polish build has nothing to read`)
    continue
  }

  if (plText.trim() === enText.trim()) {
    fail(`${plPath} is byte-identical to the English source — it was copied, not translated`)
    continue
  }

  const text = prose(plText)
  const words = text.split(/\s+/).filter((w) => w.length > 1).length
  const english = (text.match(ENGLISH) ?? []).length
  const polish = (text.match(POLISH) ?? []).length

  if (words < 40) {
    fail(`${plPath} has only ${words} words of prose — that is not a translation`)
    continue
  }
  if (polish < 20) {
    fail(`${plPath} contains ${polish} Polish characters in ${words} words — it is still English`)
    continue
  }
  const ratio = english / words
  if (ratio > 0.06) {
    fail(
      `${plPath}: ${english} English function words in ${words} words of prose (${(ratio * 100).toFixed(1)}%) — ` +
        'large parts of it were never translated',
    )
    continue
  }
  ok(`${plPath}  ${words} words, ${polish} Polish characters, ${english} English function words`)
}

// ── 3. every prompt exists in both languages ────────────────────────────────

const plPrompts = (await readdir(join(ROOT, 'prompts/pl')).catch(() => [])).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
if (plPrompts.join() !== enPrompts.join()) {
  fail(`prompts/pl has ${plPrompts.length} prompts and prompts/ has ${enPrompts.length}: ${plPrompts.join(' ')} vs ${enPrompts.join(' ')}`)
} else {
  ok(`${plPrompts.length} prompts in both languages, same file names`)
}

// ── 4. the diagrams are shared, and they are English ────────────────────────
//
// Reported on every run rather than quietly passing. The seven SVGs are hand-laid-out with
// fixed boxes, and Polish runs about 20% longer than English — "nine gates, real browser"
// becomes "dziewięć bramek, prawdziwa przeglądarka", 62% wider — so swapping the strings
// would push labels out of their boxes. Translating them properly means re-laying them out,
// which is design work, not a string table.
//
// The alt text IS translated: the diagrams are embedded as <img>, so the SVG's own <title>
// and <desc> are never exposed to assistive technology and the page's alt attribute is what
// a screen reader reads.
{
  const svgDir = join(ROOT, 'deck/diagrams')
  const svgs = (await readdir(svgDir)).filter((f) => f.endsWith('.svg'))
  let labels = 0
  for (const f of svgs) {
    const text = await readFile(join(svgDir, f), 'utf8')
    labels += [...text.matchAll(/<text[^>]*>([^<]+)<\/text>/g)].filter((m) => m[1].trim()).length
  }
  console.log(`  note ${svgs.length} diagrams, ${labels} labels, English on both sites — the alt text is translated, the pictures are not`)
}

if (failures.length) {
  console.log(`\nFAIL — ${failures.length} problem${failures.length === 1 ? '' : 's'}\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}
console.log('\nPASS — both locales have the same shape and the Polish pages are in Polish')
