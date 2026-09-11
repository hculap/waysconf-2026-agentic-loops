/**
 * CONTENT gate — AC-38 to AC-47 of brief/ACCEPTANCE.md.
 *
 * Decides whether the words on the page are the words that were commissioned, without
 * asking anyone's opinion about them. Two decisions shape everything below.
 *
 * 1. "Rendered text" here means a DOM traversal with CSS-generated content folded in,
 *    not `innerText`. `innerText` reports what is visible at this viewport in this
 *    state: a closed `<details>`, a card hidden by the active day filter and the mobile
 *    copy of the programme all disappear from it. Every one of those carries copy this
 *    gate is required to find, so a gate built on `innerText` would report copy as
 *    missing that is demonstrably present, and the loop would "fix" it by duplicating
 *    strings. `::before`/`::after` content is added because that is where a design
 *    legitimately puts the "·" separators CONTENT.md asks for. Whether copy is *visible*
 *    is the business of the a11y and visual gates, not this one.
 *
 * 2. Case and punctuation are compared; whitespace is not. brief/ACCEPTANCE.md says so
 *    in as many words at the head of the CONTENT family. `normalise` below is the whole
 *    of the licence this gate takes, and each fold in it is justified where it is made.
 *
 * Nothing in this file consults a model, and no check passes because it could not run:
 * a missing input (no brief/CONTENT.md, no dist, no page) is reported as a failure with
 * the reason, never skipped quietly.
 */

import { test } from '@playwright/test'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { Gate, ROOT } from '../lib/gate'

const gate = new Gate('content', 'Content', [
  'AC-38',
  'AC-39',
  'AC-40',
  'AC-41',
  'AC-42',
  'AC-43',
  'AC-44',
  'AC-45',
  'AC-46',
  'AC-47',
])

// ── Canon, transcribed ────────────────────────────────────────────────────────
// docs/CANON.md §2. Row numbers are quoted in AC-39 failure messages so a reader can
// put a finger on the line in the canon rather than searching for the artist.

interface CanonArtist {
  row: number
  name: string
  billing: string
  day: string
  stage: string
  genre: string
}

const ARTISTS: CanonArtist[] = [
  { row: 1, name: 'KASIMIR VOLT', billing: 'Headliner', day: 'Fri', stage: 'Turbine Hall', genre: 'Industrial techno' },
  { row: 2, name: 'Lena Orbis', billing: 'Headliner', day: 'Sat', stage: 'Turbine Hall', genre: 'Deep ambient' },
  { row: 3, name: 'NULLSET', billing: 'Headliner', day: 'Sun', stage: 'Turbine Hall', genre: 'Generative' },
  { row: 4, name: 'Auric Drift', billing: 'Main', day: 'Fri', stage: 'Boiler Room', genre: 'Drone' },
  { row: 5, name: 'Mara Teschke', billing: 'Main', day: 'Sat', stage: 'Boiler Room', genre: 'Modular live' },
  { row: 6, name: 'SUBSTATION 9', billing: 'Main', day: 'Sun', stage: 'Boiler Room', genre: 'Hardware techno' },
  { row: 7, name: 'Hiroko Vane', billing: 'Support', day: 'Fri', stage: 'Cooling Tower', genre: 'Field recording' },
  { row: 8, name: 'Cold Cathode', billing: 'Support', day: 'Sat', stage: 'Cooling Tower', genre: 'Dub techno' },
  { row: 9, name: 'Ilse Rüm', billing: 'Support', day: 'Sun', stage: 'Cooling Tower', genre: 'Neoclassical electronic' },
  { row: 10, name: 'TAPE DECAY', billing: 'Support', day: 'Fri', stage: 'Boiler Room', genre: 'Tape loops' },
  { row: 11, name: 'Odalys Ferrer', billing: 'Support', day: 'Sat', stage: 'Cooling Tower', genre: 'Percussive ambient' },
  { row: 12, name: 'VITRINE', billing: 'Support', day: 'Sun', stage: 'Boiler Room', genre: 'Glassy IDM' },
]

const ACCESS_NOTE =
  'Companion tickets for personal assistants are free. Write to access@turbine.fm and we will arrange it, no documentation required.'

const FICTION_DISCLAIMER =
  'TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental.'

/**
 * CANON §3. `places` is the state of `data-places-left` that each string belongs to;
 * AC-41 checks that the card's availability line agrees with its own attribute, which is
 * the only part of the sold-out behaviour that can be verified from a static page.
 */
const TIERS = [
  {
    key: 'single',
    name: 'Single Night',
    price: '€45',
    inclusions: ['One night, chosen at checkout', 'All three stages', 'Re-entry on the night'],
    popular: false,
  },
  {
    key: 'full',
    name: 'Full Pass',
    price: '€110',
    inclusions: [
      'All three nights, 12–14 June',
      'All three stages',
      'Re-entry on every night',
      '€25 less than three single nights',
    ],
    popular: true,
  },
  {
    key: 'workshop',
    name: 'Full Pass + Workshop',
    price: '€165',
    inclusions: [
      'Everything in the Full Pass',
      'Modular synthesis workshop, Saturday 14:00 – 17:00',
      'Led by Mara Teschke in the Boiler Room',
      '40 places',
    ],
    popular: false,
  },
] as const

const MOST_POPULAR = 'Most popular'
const LOW_PLACES_LINE = 'Fewer than 10 workshop places left.'
const SOLD_OUT_LINE = 'Workshop sold out. Full Pass is still available.'
const SOLD_OUT_BUTTON = 'Workshop sold out'

/**
 * AC-42. Each fact is compared against the rendered text with dashes intact — this is the
 * criterion that owns "12–14 June 2027" and the en dash in it, so it is the one place
 * where a hyphen must be reported rather than folded away.
 *
 * `accept` exists for exactly one fact. CANON §1 states the capacity as "4 000 per night";
 * CONTENT.md, which is the authority on strings, spells the same fact "Four thousand
 * people a night". A gate that demanded the digits would fail a page that copied the
 * commissioned copy correctly, which is a gate reporting its own disagreement with the
 * brief as a defect in the page.
 */
interface EventFact {
  field: string
  expected: string
  accept?: string[]
  /** Reports what the page says instead, so the message names the repair, not the absence. */
  nearMiss?: RegExp
}

const EVENT_FACTS: EventFact[] = [
  { field: 'name', expected: 'TURBINE' },
  { field: 'edition', expected: 'Fourth edition' },
  {
    field: 'dates',
    expected: '12–14 June 2027',
    nearMiss: /12\s*[-–—−~/]{1,2}\s*14\s+June\s+2027/,
  },
  { field: 'venue', expected: 'The Powerhouse, Hall E' },
  { field: 'city', expected: 'Kraków' },
  {
    field: 'capacity',
    expected: '4 000 per night',
    accept: ['4 000', '4000', 'Four thousand', 'four thousand'],
  },
  { field: 'stage 1', expected: 'Turbine Hall' },
  { field: 'stage 2', expected: 'Boiler Room' },
  { field: 'stage 3', expected: 'Cooling Tower' },
  { field: 'tagline', expected: 'Three nights inside the machine' },
  {
    field: 'secondary line',
    expected: 'Ambient, techno and modular sound in a hall built for power',
  },
]

/** AC-40. Word-boundary matched, so a class name like `.placeholder-card` is nobody's business. */
const PLACEHOLDER_TOKENS = [
  'lorem',
  'ipsum',
  'dolor sit',
  'TODO',
  'TBD',
  'FIXME',
  'placeholder',
  'your text here',
  'Artist Name',
]

/**
 * AC-45. CANON §10 bans the words themselves, so the pattern covers the inflections of
 * each banned word and nothing else: "elevated" is the same word for tone purposes and a
 * scan that only caught the bare stem would be evaded by accident within a day. It stops
 * short of derivations that mean something different — "elevation" is a fact about a
 * building, not marketing language, and a gate must be exactly as strict as its contract.
 */
const BANNED_WORDS = /\b(?:immersive|journeys?|unleash(?:es|ed|ing)?|elevat(?:e|es|ed|ing)|curated experiences?)\b/gi

// ── Normalisation ─────────────────────────────────────────────────────────────

/**
 * Both sides of every comparison in this file go through here.
 *
 * What is folded, and why none of it can hide a real defect:
 *
 *  - **NFC.** "Ilse Rüm" reaches the DOM as U+00FC from one editor and as u + U+0308 from
 *    another. Same word, same pixels, same screen reader output.
 *  - **Invisible characters** — soft hyphen, zero-width space/joiners, BOM. A hyphenation
 *    hint or a zero-width break inserted by a build step is not a change of copy.
 *  - **Quote characters.** CONTENT.md writes `hall's` with a straight apostrophe; a
 *    typographic build renders U+2019. Curly quotes, primes and guillemets fold to their
 *    ASCII equivalents on both sides, which is the single most common source of a false
 *    "this sentence is missing" report.
 *  - **Whitespace.** Every run of whitespace, including non-breaking, thin and ideographic
 *    spaces and newlines, becomes one space, then the string is trimmed. The markdown
 *    source wraps at 100 columns and the DOM wraps wherever the markup happens to break;
 *    neither is a fact about the copy.
 *  - **Dashes, only when `foldDashes` is set.** AC-42 compares with dashes intact because
 *    the en dash in "12–14 June 2027" is a criterion in its own right. Everywhere else a
 *    hyphen-for-en-dash would be reported as a whole missing sentence, sending the loop
 *    off to rewrite a paragraph when one character is wrong.
 *
 * What is never folded: **case**. brief/ACCEPTANCE.md, CONTENT family preamble:
 * "Whitespace is normalised; case and punctuation are not."
 */
function normalise(input: string, { foldDashes = true }: { foldDashes?: boolean } = {}): string {
  let s = input.normalize('NFC')
  s = s.replace(/[­​‌‍⁠﻿]/g, '')
  s = s.replace(/[‘’‚‛′ʼ]/g, "'")
  s = s.replace(/[“”„‟″«»]/g, '"')
  if (foldDashes) s = s.replace(/[‐‑‒–—―−﹘﹣－]/g, '-')
  s = s.replace(/\s+/g, ' ').trim()
  return s
}

type MatchKind = 'exact' | 'case' | 'near' | 'missing'

/**
 * Substring search that reports *how* it failed, because "not found" alone is a poor
 * repair prompt. A casing-only difference and a reworded sentence need different fixes,
 * and the loop should not have to guess which one it is looking at.
 */
function locate(haystack: string, needle: string): { kind: MatchKind; observed?: string } {
  if (!needle) return { kind: 'exact' }
  if (haystack.includes(needle)) return { kind: 'exact' }

  const lowerHay = haystack.toLowerCase()
  const caseIdx = lowerHay.indexOf(needle.toLowerCase())
  if (caseIdx >= 0) return { kind: 'case', observed: haystack.slice(caseIdx, caseIdx + needle.length) }

  // A long string that starts the same way and ends differently is an edited sentence.
  // Quoting the page's version of it turns the failure into a diff a person can read.
  const probeLength = 28
  if (needle.length > probeLength) {
    const probe = needle.slice(0, probeLength).toLowerCase()
    const nearIdx = lowerHay.indexOf(probe)
    if (nearIdx >= 0) {
      return { kind: 'near', observed: haystack.slice(nearIdx, nearIdx + needle.length + 24) }
    }
  }
  return { kind: 'missing' }
}

function truncate(s: string, max = 120): string {
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`
}

/** Key used to compare `data-day` / `data-stage` values. See the comment at AC-39. */
function slugKey(value: string): string {
  return value
    .normalize('NFC')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
}

function dayKey(value: string): string {
  const k = slugKey(value)
  if (k.startsWith('fri')) return 'fri'
  if (k.startsWith('sat')) return 'sat'
  if (k.startsWith('sun')) return 'sun'
  return k
}

// ── brief/CONTENT.md ──────────────────────────────────────────────────────────

interface CopyString {
  index: number
  line: number
  section: string
  text: string
}

/**
 * CONTENT.md marks its own copy: "Text in fenced blocks is verbatim — copy it character
 * for character". So the fenced blocks, and only the fenced blocks, are what AC-38 holds
 * the page to. Prose, tables and the indented heading-outline diagram in §15 are
 * instructions to the implementer, not strings to render, and a gate that demanded them
 * on the page would be unsatisfiable by a correct build.
 *
 * Every non-empty line inside a block is one string. Multi-line blocks in this file are
 * lists — ticker tags, inclusion lists, stacked programme rows — and single sentences are
 * never wrapped inside a fence, so line-per-string is exactly the file's own structure.
 */
function parseCopyStrings(markdown: string): CopyString[] {
  const lines = markdown.split(/\r?\n/)
  const out: CopyString[] = []
  let inFence = false
  let section = '(preamble)'
  let index = 0

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? ''
    if (/^\s*(?:```|~~~)/.test(raw)) {
      inFence = !inFence
      continue
    }
    if (!inFence) {
      const heading = /^##\s+(.*)$/.exec(raw)
      if (heading) section = (heading[1] ?? '').trim()
      continue
    }
    const text = raw.trim()
    if (!text) continue
    index++
    out.push({ index, line: i + 1, section, text })
  }
  return out
}

// ── The page ──────────────────────────────────────────────────────────────────

interface ScanItem {
  selector: string
  kind: string
  value: string
}

interface ArtistCard {
  selector: string
  name: string
  day: string | null
  stage: string | null
  text: string
}

interface TierCard {
  selector: string
  tier: string
  text: string
  placesLeft: string | null
  hasPlacesLeft: boolean
  controls: string[]
  controlsDisabled: string[]
}

interface ProgrammeCell {
  selector: string
  day: string | null
  stage: string | null
  text: string
}

interface Harvest {
  title: string
  text: string
  copyAttributes: ScanItem[]
  scan: ScanItem[]
  sections: Record<string, string>
  artists: ArtistCard[]
  artistScope: string
  tiers: TierCard[]
  faq: { present: boolean; summaries: number; expandables: number; basis: string }
  programme: { present: boolean; cells: ProgrammeCell[]; days: string[]; stages: string[] }
}

/**
 * One pass over the document, in the page, returning everything the criteria need.
 * It is one `evaluate` because every extra round trip is another chance for the page to
 * be in a different state between two reads, and a gate that flickers is worthless.
 */
function harvestPage(): Harvest {
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'HEAD'])
  const BLOCK = new Set([
    'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'BR', 'CAPTION', 'DD', 'DETAILS', 'DIV', 'DL', 'DT',
    'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER',
    'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION', 'SUMMARY', 'TABLE', 'TBODY', 'TD', 'TFOOT',
    'TH', 'THEAD', 'TR', 'UL',
  ])

  function selectorFor(el: Element | null): string {
    if (!el) return '(document)'
    const parts: string[] = []
    let cur: Element | null = el
    let depth = 0
    while (cur && depth < 5) {
      if (cur.id) {
        parts.unshift(`#${cur.id}`)
        break
      }
      const sectionName = cur.getAttribute('data-section')
      if (sectionName && cur !== el) {
        parts.unshift(`[data-section="${sectionName}"]`)
        break
      }
      let part = cur.tagName.toLowerCase()
      if (sectionName) part += `[data-section="${sectionName}"]`
      const artist = cur.getAttribute('data-artist')
      if (artist) part += `[data-artist="${artist}"]`
      const tier = cur.getAttribute('data-tier')
      if (tier) part += `[data-tier="${tier}"]`
      const classes = (cur.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean).slice(0, 2)
      if (classes.length && !artist && !tier) part += `.${classes.join('.')}`
      const parent: Element | null = cur.parentElement
      if (parent) {
        const sameTag = Array.from(parent.children).filter((c) => c.tagName === cur!.tagName)
        if (sameTag.length > 1) part += `:nth-of-type(${sameTag.indexOf(cur) + 1})`
      }
      parts.unshift(part)
      cur = cur.parentElement
      depth++
    }
    return parts.join(' > ')
  }

  /** CSS-generated text. A "·" separator set in `content` is copy the reader sees. */
  function pseudoText(el: Element, which: '::before' | '::after'): string {
    let raw: string
    try {
      raw = window.getComputedStyle(el, which).content
    } catch {
      return ''
    }
    if (!raw || raw === 'none' || raw === 'normal') return ''
    const quoted = raw.match(/"(?:[^"\\]|\\.)*"/g)
    if (!quoted) return ''
    return quoted.map((q) => q.slice(1, -1).replace(/\\(.)/g, '$1')).join('')
  }

  const scan: ScanItem[] = []

  function extract(root: Element | null, collectScan: boolean): string {
    if (!root) return ''
    let out = ''
    const walk = (node: Node): void => {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue ?? ''
        out += value
        if (collectScan && value.trim()) {
          scan.push({ selector: selectorFor(node.parentElement), kind: 'text', value })
        }
        return
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return
      const el = node as Element
      if (SKIP.has(el.tagName)) return
      const isBlock = BLOCK.has(el.tagName)
      if (isBlock) out += '\n'
      out += pseudoText(el, '::before')
      for (const child of Array.from(el.childNodes)) walk(child)
      out += pseudoText(el, '::after')
      if (isBlock) out += '\n'
    }
    walk(root)
    return out
  }

  const text = extract(document.body, true)

  /**
   * Attributes that carry commissioned copy. CONTENT.md puts real strings in `alt`
   * (§13), in the meta description (§1) and in the newsletter placeholder (§11), so a
   * text-only haystack would report those as missing on a page that has them right.
   * Whether an alt is a *good* alt is AC-22's problem.
   */
  const copyAttributes: ScanItem[] = []
  copyAttributes.push({ selector: 'head > title', kind: 'title', value: document.title })
  for (const meta of Array.from(document.querySelectorAll('meta[content]'))) {
    const name = meta.getAttribute('name') ?? meta.getAttribute('property') ?? 'meta'
    copyAttributes.push({
      selector: `head > meta[${meta.hasAttribute('name') ? 'name' : 'property'}="${name}"]`,
      kind: name,
      value: meta.getAttribute('content') ?? '',
    })
  }
  for (const attr of ['alt', 'aria-label', 'placeholder', 'title', 'aria-description']) {
    for (const el of Array.from(document.querySelectorAll(`[${attr}]`))) {
      const value = el.getAttribute(attr) ?? ''
      if (!value.trim()) continue
      copyAttributes.push({ selector: selectorFor(el), kind: attr, value })
    }
  }
  for (const el of Array.from(document.querySelectorAll('input[value], button[value]'))) {
    const value = el.getAttribute('value') ?? ''
    if (value.trim()) copyAttributes.push({ selector: selectorFor(el), kind: 'value', value })
  }

  const sections: Record<string, string> = {}
  for (const el of Array.from(document.querySelectorAll('[data-section]'))) {
    const name = el.getAttribute('data-section') ?? ''
    if (!name) continue
    // A duplicated section is AC-06's failure, not this gate's; concatenating keeps this
    // gate from reporting a second, confusing symptom of the same defect.
    sections[name] = (sections[name] ?? '') + '\n' + extract(el, false)
  }

  /**
   * `data-artist` belongs to lineup cards (the hook table in ACCEPTANCE.md). Scoping the
   * query to the lineup section means a page that also tags programme cells with the
   * artist name does not read as twenty-four artists.
   */
  const lineupRoot = document.querySelector('[data-section="lineup"]')
  const artistScope = lineupRoot ? '[data-section="lineup"]' : 'document'
  const artistRoot: ParentNode = lineupRoot ?? document
  const artists: ArtistCard[] = Array.from(artistRoot.querySelectorAll('[data-artist]')).map((el) => {
    const own = (name: string): string | null => {
      const direct = el.getAttribute(name)
      if (direct !== null) return direct
      const ancestor = el.closest(`[${name}]`)
      if (ancestor) return ancestor.getAttribute(name)
      const descendant = el.querySelector(`[${name}]`)
      return descendant ? descendant.getAttribute(name) : null
    }
    return {
      selector: selectorFor(el),
      name: el.getAttribute('data-artist') ?? '',
      day: own('data-day'),
      stage: own('data-stage'),
      text: extract(el, false),
    }
  })

  const tiers: TierCard[] = Array.from(document.querySelectorAll('[data-tier]')).map((el) => {
    const placesHolder = el.hasAttribute('data-places-left') ? el : el.querySelector('[data-places-left]')
    const controls = Array.from(el.querySelectorAll('a, button'))
    return {
      selector: selectorFor(el),
      tier: el.getAttribute('data-tier') ?? '',
      text: extract(el, false),
      placesLeft: placesHolder ? placesHolder.getAttribute('data-places-left') : null,
      hasPlacesLeft: placesHolder !== null,
      controls: controls.map((c) => extract(c, false)),
      controlsDisabled: controls
        .filter((c) => c.getAttribute('aria-disabled') === 'true' || c.hasAttribute('disabled'))
        .map((c) => extract(c, false)),
    }
  })

  const faqRoot = document.querySelector('[data-section="faq"]')
  const summaries = faqRoot ? faqRoot.querySelectorAll('summary').length : 0
  const expandables = faqRoot ? faqRoot.querySelectorAll('[aria-expanded]').length : 0

  const programmeRoot = document.querySelector('[data-section="programme"]')
  const cells: ProgrammeCell[] = programmeRoot
    ? Array.from(programmeRoot.querySelectorAll('[data-stage]')).map((el) => {
        const dayHost = el.hasAttribute('data-day') ? el : el.closest('[data-day]')
        return {
          selector: selectorFor(el),
          day: dayHost ? dayHost.getAttribute('data-day') : null,
          stage: el.getAttribute('data-stage'),
          text: extract(el, false),
        }
      })
    : []
  const dayValues = programmeRoot
    ? Array.from(programmeRoot.querySelectorAll('[data-day]')).map((el) => el.getAttribute('data-day') ?? '')
    : []
  const stageValues = cells.map((c) => c.stage ?? '')

  return {
    title: document.title,
    text,
    copyAttributes,
    scan,
    sections,
    artists,
    artistScope,
    tiers,
    faq: {
      present: faqRoot !== null,
      summaries,
      expandables,
      basis: summaries > 0 ? 'summary elements' : 'elements with aria-expanded',
    },
    programme: {
      present: programmeRoot !== null,
      cells,
      days: Array.from(new Set(dayValues.filter(Boolean))),
      stages: Array.from(new Set(stageValues.filter(Boolean))),
    },
  }
}

// ── AC-46: the NOVA scan on disk ──────────────────────────────────────────────

const NOVA = /\bnova\b/i

/**
 * AC-46 scopes itself deliberately, and the scope is the whole point of the criterion.
 * `NOVA` is quoted in docs/CANON.md §12 and in brief/ACCEPTANCE.md, because both explain
 * why it must not be used. A gate that failed on its own contract would teach the room
 * that gates are noise to be switched off, so those two files are out of scope by design
 * rather than by oversight.
 *
 * ACCEPTANCE.md names `site/src/**`; this repository root *is* the Astro project, so the
 * scope is src/, design/ and brief/CONTENT.md.
 */
const NOVA_DIRECTORIES = ['src', 'design']
const NOVA_FILES = ['brief/CONTENT.md']
const TEXT_EXTENSIONS = new Set([
  '.astro', '.css', '.html', '.js', '.json', '.jsx', '.md', '.mjs', '.cjs', '.svg', '.ts', '.tsx',
  '.txt', '.yaml', '.yml',
])
const SKIP_DIRECTORIES = new Set(['node_modules', 'dist', '.git', '.astro', '.results'])

function* walkTextFiles(dir: string): Generator<string> {
  let entries
  try {
    entries = readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      if (SKIP_DIRECTORIES.has(entry.name)) continue
      yield* walkTextFiles(full)
    } else if (entry.isFile() && TEXT_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
      yield full
    }
  }
}

// ── The gate ──────────────────────────────────────────────────────────────────

let completed = false

test('content', async ({ page }) => {
  test.setTimeout(120_000)

  // One fixed width. The DOM of a static page does not change with the viewport, and
  // pinning it keeps two runs of this gate on the same input.
  await page.setViewportSize({ width: 1440, height: 900 })

  let harvest: Harvest
  try {
    const response = await page.goto('/', { waitUntil: 'load' })
    if (!response || !response.ok()) {
      gate.fail({
        criterion: 'AC-38',
        message: `CONTENT: the page could not be loaded (HTTP ${response ? response.status() : 'no response'}). No content criterion was evaluated.`,
        where: page.url(),
        hint: 'Run npm run build, then npm run check. A gate that cannot read the page reports that, it does not pass.',
      })
      return
    }
    await page.waitForLoadState('networkidle').catch(() => {
      /* an idle timeout is not a content defect; the DOM is already parsed. */
    })
    harvest = await page.evaluate(harvestPage)
  } catch (error) {
    gate.fail({
      criterion: 'AC-38',
      message: `CONTENT: the page could not be read. No content criterion was evaluated. ${String(error).slice(0, 300)}`,
      where: page.url(),
    })
    return
  }

  // Two haystacks, one licence apart. `loose` folds dash variants, `strict` keeps them,
  // because AC-42 is the criterion that owns the en dash.
  const attributeText = harvest.copyAttributes.map((a) => a.value).join('\n')
  const looseText = normalise(`${harvest.text}\n${attributeText}`)
  const strictText = normalise(`${harvest.text}\n${attributeText}`, { foldDashes: false })
  const renderedOnly = normalise(harvest.text)

  // ── AC-38: every commissioned string is on the page ────────────────────────
  const contentMdPath = join(ROOT, 'brief/CONTENT.md')
  if (!existsSync(contentMdPath)) {
    gate.fail({
      criterion: 'AC-38',
      message: `AC-38 CONTENT: brief/CONTENT.md not found at ${contentMdPath}; the copy contract could not be read.`,
      where: 'brief/CONTENT.md',
    })
  } else {
    const copyStrings = parseCopyStrings(readFileSync(contentMdPath, 'utf8'))
    const seen = new Set<string>()
    let checked = 0

    for (const item of copyStrings) {
      const needle = normalise(item.text)
      if (!needle || seen.has(needle)) continue
      seen.add(needle)
      checked++

      const result = locate(looseText, needle)
      if (result.kind === 'exact') continue

      const failure = {
        criterion: 'AC-38',
        message: `AC-38 CONTENT: string ${item.index} from brief/CONTENT.md not found on the page: "${truncate(item.text)}"`,
        where: `brief/CONTENT.md:${item.line} (§${item.section})`,
        expected: item.text,
      }
      if (result.kind === 'case') {
        gate.fail({
          ...failure,
          actual: result.observed,
          hint: 'The page carries this string with different casing. CONTENT.md is verbatim, and ACCEPTANCE.md normalises whitespace but not case: put the exact characters in the DOM rather than relying on text-transform.',
        })
      } else if (result.kind === 'near') {
        gate.fail({
          ...failure,
          actual: truncate(result.observed ?? '', 200),
          hint: 'The page starts this string and then diverges. Do not paraphrase or shorten commissioned copy.',
        })
      } else {
        gate.fail(failure)
      }
    }
    gate.note(`AC-38: ${checked} distinct copy strings extracted from the fenced blocks of brief/CONTENT.md.`)
  }

  // ── AC-39: the twelve artists ──────────────────────────────────────────────
  if (harvest.artistScope === 'document') {
    gate.note('AC-39: no [data-section="lineup"] element, so [data-artist] was read from the whole document.')
  }
  const byName = new Map<string, ArtistCard[]>()
  for (const card of harvest.artists) {
    const key = normalise(card.name)
    byName.set(key, [...(byName.get(key) ?? []), card])
  }

  for (const artist of ARTISTS) {
    const canonRow = `CANON §2 row ${artist.row}: ${artist.day}, ${artist.stage}, ${artist.genre}`
    const key = normalise(artist.name)
    const cards = byName.get(key) ?? []

    if (cards.length === 0) {
      // A near match is worth naming: "KASIMIR Volt" and "Kasimir Volt" are different
      // defects from "this artist is not on the page at all".
      const loose = harvest.artists.find((c) => slugKey(c.name) === slugKey(artist.name))
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — no [data-artist] card with this exact spelling. ${canonRow}`,
        where: harvest.artistScope,
        expected: `[data-artist="${artist.name}"]`,
        actual: loose ? `[data-artist="${loose.name}"]` : 'no card',
        hint: loose ? 'A card with the same letters and different casing or spacing exists. CANON §2 spelling is exact.' : undefined,
      })
      continue
    }

    if (cards.length > 1) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — appears on ${cards.length} lineup cards. ${canonRow}`,
        where: cards.map((c) => c.selector).join(', '),
        expected: '1 card',
        actual: `${cards.length} cards`,
      })
    }

    const card = cards[0]!
    const cardText = normalise(card.text)

    if (card.name !== artist.name) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — data-artist reads "${card.name}". ${canonRow}`,
        where: card.selector,
        expected: artist.name,
        actual: card.name,
      })
    }

    const nameOnCard = locate(cardText, normalise(artist.name))
    if (nameOnCard.kind !== 'exact') {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — the name is not in the card's own text with this spelling. ${canonRow}`,
        where: card.selector,
        expected: artist.name,
        actual: nameOnCard.observed ?? 'not present in the card',
        hint: nameOnCard.kind === 'case' ? 'The card carries the name with different casing. Put the canonical spelling in the DOM, not in a text-transform.' : undefined,
      })
    }

    // `data-day` and `data-stage` are compared on a letters-and-digits key: CANON §2
    // writes "Fri" and "Turbine Hall", CONTENT.md §6 writes "Friday", and a slug is a
    // reasonable attribute encoding of either. The gate checks that the card claims the
    // right day and stage, which is the fact AC-39 is about; it does not invent a
    // spelling for an attribute value the contract left open.
    if (card.day === null) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — no data-day on the card or its ancestors. ${canonRow}`,
        where: card.selector,
        expected: `data-day="${artist.day}"`,
        actual: 'absent',
      })
    } else if (dayKey(card.day) !== dayKey(artist.day)) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — data-day is "${card.day}". ${canonRow}`,
        where: card.selector,
        expected: artist.day,
        actual: card.day,
      })
    }

    if (card.stage === null) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — no data-stage on the card or its ancestors. ${canonRow}`,
        where: card.selector,
        expected: `data-stage="${artist.stage}"`,
        actual: 'absent',
      })
    } else if (slugKey(card.stage) !== slugKey(artist.stage)) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — data-stage is "${card.stage}". ${canonRow}`,
        where: card.selector,
        expected: artist.stage,
        actual: card.stage,
      })
    }

    const genre = locate(cardText, normalise(artist.genre))
    if (genre.kind !== 'exact') {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${artist.name}" — genre tag "${artist.genre}" is not in the card text. ${canonRow}`,
        where: card.selector,
        expected: artist.genre,
        actual: genre.observed ?? 'not present in the card',
        hint: genre.kind === 'case' ? 'The genre is on the card with different casing. CANON §2 spelling is exact.' : undefined,
      })
    }
  }

  for (const card of harvest.artists) {
    const key = normalise(card.name)
    if (!ARTISTS.some((a) => normalise(a.name) === key)) {
      gate.fail({
        criterion: 'AC-39',
        message: `AC-39 CONTENT: artist "${card.name}" — not in CANON §2. The lineup is exactly the twelve artists in that table.`,
        where: card.selector,
        expected: 'one of the 12 canonical names',
        actual: card.name,
      })
    }
  }

  // ── AC-40: placeholder text ────────────────────────────────────────────────
  const scanSurface: ScanItem[] = [...harvest.scan, ...harvest.copyAttributes]
  for (const token of PLACEHOLDER_TOKENS) {
    const pattern = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
    for (const item of scanSurface) {
      const value = normalise(item.value)
      const match = pattern.exec(value)
      if (!match) continue
      gate.fail({
        criterion: 'AC-40',
        message: `AC-40 CONTENT: placeholder text "${match[0]}" found in ${item.selector}`,
        where: item.kind === 'text' ? item.selector : `${item.selector} [${item.kind}]`,
        actual: truncate(value, 160),
        hint: 'Every user-facing string is in brief/CONTENT.md. If one is missing there, that is a question, not a gap to fill.',
      })
    }
  }

  // ── AC-41: ticket tiers ────────────────────────────────────────────────────
  const tierExpectation = 'Expected Single Night €45, Full Pass €110 (flagged most popular), Full Pass + Workshop €165'
  const tierFail = (tier: string, problem: string, extra: Record<string, unknown> = {}): void => {
    gate.fail({
      criterion: 'AC-41',
      message: `AC-41 CONTENT: ticket tier "${tier}" — ${problem}. ${tierExpectation}`,
      ...extra,
    })
  }

  for (const spec of TIERS) {
    const matches = harvest.tiers.filter((t) => t.tier === spec.key)
    if (matches.length === 0) {
      tierFail(spec.name, `no [data-tier="${spec.key}"] card on the page`, {
        where: '[data-section="tickets"]',
        expected: `[data-tier="${spec.key}"]`,
        actual: harvest.tiers.length ? harvest.tiers.map((t) => `[data-tier="${t.tier}"]`).join(', ') : 'no ticket cards',
      })
      continue
    }
    if (matches.length > 1) {
      tierFail(spec.name, `${matches.length} cards carry data-tier="${spec.key}"`, {
        where: matches.map((m) => m.selector).join(', '),
        expected: '1 card',
        actual: `${matches.length} cards`,
      })
    }

    const card = matches[0]!
    const cardText = normalise(card.text)

    const nameMatch = locate(cardText, normalise(spec.name))
    if (nameMatch.kind !== 'exact') {
      tierFail(spec.name, `the tier name is not in the card text`, {
        where: card.selector,
        expected: spec.name,
        actual: nameMatch.observed ?? 'not present in the card',
      })
    }

    if (!cardText.includes(normalise(spec.price))) {
      tierFail(spec.name, `the price is not in the card text`, {
        where: card.selector,
        expected: spec.price,
        actual: truncate(cardText, 160),
      })
    }

    for (const inclusion of spec.inclusions) {
      const found = locate(cardText, normalise(inclusion))
      if (found.kind === 'exact') continue
      tierFail(spec.name, `inclusion "${inclusion}" is missing from the card`, {
        where: card.selector,
        expected: inclusion,
        actual: found.observed ?? 'not present in the card',
      })
    }

    // The badge is checked in both directions. A "most popular" flag on every card marks
    // nothing, so the absence of it on the other two is part of the criterion.
    const hasBadge = cardText.includes(normalise(MOST_POPULAR))
    if (spec.popular && !hasBadge) {
      tierFail(spec.name, `not flagged "${MOST_POPULAR}"`, {
        where: card.selector,
        expected: MOST_POPULAR,
        actual: 'no badge text in the card',
      })
    }
    if (!spec.popular && hasBadge) {
      tierFail(spec.name, `carries the "${MOST_POPULAR}" badge, which belongs to Full Pass alone`, {
        where: card.selector,
        expected: 'no badge',
        actual: MOST_POPULAR,
      })
    }

    if (spec.key !== 'workshop') continue

    // The sold-out warning must be driven by data-places-left, which means the attribute
    // has to exist and the card's text has to agree with it. This is the only part of the
    // three-state behaviour a static page can be held to, and it is worth holding: a
    // hard-coded warning is a string that will be wrong the first time the number moves.
    if (!card.hasPlacesLeft) {
      tierFail(spec.name, 'no data-places-left attribute, so the sold-out warning is not driven by anything', {
        where: card.selector,
        expected: 'data-places-left="{integer}"',
        actual: 'absent',
        hint: 'CANON §3: the sold-out warning appears below 10 places. CONTENT.md §9 gives the string for each state.',
      })
    } else {
      const raw = card.placesLeft ?? ''
      const places = Number.parseInt(raw, 10)
      if (!/^\d+$/.test(raw.trim())) {
        tierFail(spec.name, `data-places-left is "${raw}", which is not a non-negative integer`, {
          where: card.selector,
          expected: 'an integer from 0 to 40',
          actual: raw,
        })
      } else {
        const showsLow = cardText.includes(normalise(LOW_PLACES_LINE))
        const showsSoldOut = cardText.includes(normalise(SOLD_OUT_LINE))
        const buttonSoldOut = card.controls.some((c) => normalise(c).includes(normalise(SOLD_OUT_BUTTON)))

        if (places === 0) {
          if (!showsSoldOut) {
            tierFail(spec.name, `data-places-left="0" but the card does not say "${SOLD_OUT_LINE}"`, {
              where: card.selector,
              expected: SOLD_OUT_LINE,
              actual: 'no sold-out line',
            })
          }
          if (!buttonSoldOut) {
            tierFail(spec.name, `data-places-left="0" but no control reads "${SOLD_OUT_BUTTON}"`, {
              where: card.selector,
              expected: SOLD_OUT_BUTTON,
              actual: card.controls.map((c) => normalise(c)).join(' | ') || 'no controls',
            })
          } else if (!card.controlsDisabled.some((c) => normalise(c).includes(normalise(SOLD_OUT_BUTTON)))) {
            tierFail(spec.name, 'the sold-out button is not marked aria-disabled="true"', {
              where: card.selector,
              expected: 'aria-disabled="true", still focusable',
              actual: 'no aria-disabled on the sold-out control',
            })
          }
        } else if (places < 10) {
          if (!showsLow) {
            tierFail(spec.name, `data-places-left="${places}" but the card does not say "${LOW_PLACES_LINE}"`, {
              where: card.selector,
              expected: LOW_PLACES_LINE,
              actual: 'no low-places line',
            })
          }
          if (showsSoldOut) {
            tierFail(spec.name, `data-places-left="${places}" but the card shows the sold-out line`, {
              where: card.selector,
              expected: LOW_PLACES_LINE,
              actual: SOLD_OUT_LINE,
            })
          }
        } else {
          if (showsLow || showsSoldOut) {
            tierFail(spec.name, `data-places-left="${places}" but the card shows an availability warning`, {
              where: card.selector,
              expected: 'no availability line above 9 places left',
              actual: showsSoldOut ? SOLD_OUT_LINE : LOW_PLACES_LINE,
            })
          }
        }

        if (places < 10) {
          // CONTENT.md §9 says to ship the default state. Which integer ships is a content
          // decision the acceptance contract does not gate, so this is a note, not a
          // failure — a gate must not invent a requirement its own contract left open.
          gate.note(`AC-41: the workshop card ships with data-places-left="${places}". CONTENT.md §9 asks for the default state (10 or more).`)
        }
      }
    }
  }

  for (const card of harvest.tiers) {
    if (!TIERS.some((t) => t.key === card.tier)) {
      tierFail(card.tier || '(empty)', `data-tier="${card.tier}" is not one of single, full, workshop`, {
        where: card.selector,
        expected: 'single | full | workshop',
        actual: card.tier,
      })
    }
  }

  // ── AC-42: event facts ─────────────────────────────────────────────────────
  for (const fact of EVENT_FACTS) {
    const candidates = [fact.expected, ...(fact.accept ?? [])].map((c) => normalise(c, { foldDashes: false }))
    if (candidates.some((c) => strictText.includes(c))) continue

    let observed = 'not found in the rendered text'
    if (fact.nearMiss) {
      const near = fact.nearMiss.exec(strictText)
      if (near) observed = near[0]
    }
    if (observed === 'not found in the rendered text') {
      const loose = locate(looseText, normalise(fact.expected))
      if (loose.kind !== 'missing' && loose.observed) observed = truncate(loose.observed, 120)
    }

    gate.fail({
      criterion: 'AC-42',
      message: `AC-42 CONTENT: event fact "${fact.field}" reads "${observed}", canon says "${fact.expected}"`,
      where: 'rendered text',
      expected: fact.expected,
      actual: observed,
      hint: fact.field === 'dates' ? 'The separator is an en dash (U+2013), not a hyphen: 12–14 June 2027.' : undefined,
    })
  }

  // ── AC-43: access note, inside the tickets section ─────────────────────────
  const ticketsText = normalise(harvest.sections['tickets'] ?? '')
  const accessNote = normalise(ACCESS_NOTE)
  if (!ticketsText.includes(accessNote)) {
    const elsewhere = looseText.includes(accessNote)
    gate.fail({
      criterion: 'AC-43',
      message: `AC-43 CONTENT: access note missing from the tickets section. Expected verbatim: "${ACCESS_NOTE}"`,
      where: '[data-section="tickets"]',
      expected: ACCESS_NOTE,
      actual: harvest.sections['tickets'] === undefined
        ? 'there is no [data-section="tickets"] element'
        : elsewhere
          ? 'present on the page but outside the tickets section'
          : 'not present',
      hint: 'CONTENT.md §9 places it under the comparison list and above the small print, so it sits with the prices.',
    })
  }

  // ── AC-44: fiction disclaimer, in the footer ───────────────────────────────
  const footerText = normalise(harvest.sections['footer'] ?? '')
  const disclaimer = normalise(FICTION_DISCLAIMER)
  if (!footerText.includes(disclaimer)) {
    const partial = locate(footerText, disclaimer)
    gate.fail({
      criterion: 'AC-44',
      message: 'AC-44 CONTENT: fiction disclaimer missing or altered in the footer. Expected the CANON §1 wording verbatim',
      where: '[data-section="footer"]',
      expected: FICTION_DISCLAIMER,
      actual: harvest.sections['footer'] === undefined
        ? 'there is no [data-section="footer"] element'
        : partial.kind === 'missing'
          ? looseText.includes(disclaimer)
            ? 'present on the page but outside the footer'
            : 'not present'
          : truncate(partial.observed ?? '', 220),
    })
  }

  // ── AC-45: banned words and exclamation marks ──────────────────────────────
  const sentenceAround = (value: string, index: number, length: number): string => {
    const before = value.lastIndexOf('. ', index)
    const afterDot = value.indexOf('. ', index + length)
    const start = before === -1 ? 0 : before + 2
    const end = afterDot === -1 ? value.length : afterDot + 1
    return truncate(value.slice(start, end).trim(), 160)
  }

  let bannedHits = 0
  for (const item of scanSurface) {
    const value = normalise(item.value)
    BANNED_WORDS.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = BANNED_WORDS.exec(value)) !== null) {
      bannedHits++
      gate.fail({
        criterion: 'AC-45',
        message: `AC-45 CONTENT: banned token "${match[0]}" in ${item.selector}: "${sentenceAround(value, match.index, match[0].length)}"`,
        where: item.kind === 'text' ? item.selector : `${item.selector} [${item.kind}]`,
        hint: 'CANON §10 bans immersive, journey, unleash, elevate and curated experience. Use the copy in brief/CONTENT.md.',
      })
    }
    const bang = value.indexOf('!')
    if (bang >= 0) {
      bannedHits++
      gate.fail({
        criterion: 'AC-45',
        message: `AC-45 CONTENT: banned token "!" in ${item.selector}: "${sentenceAround(value, bang, 1)}"`,
        where: item.kind === 'text' ? item.selector : `${item.selector} [${item.kind}]`,
        hint: 'CANON §10: no exclamation marks anywhere on the page.',
      })
    }
  }

  // A banned word split across two elements is still on the page. Element-by-element
  // scanning would miss it, so the whole rendered text is checked as well and anything
  // the per-element pass did not already account for is reported without a selector.
  BANNED_WORDS.lastIndex = 0
  const wholePageHits = (looseText.match(BANNED_WORDS) ?? []).length + (looseText.split('!').length - 1)
  if (wholePageHits > bannedHits) {
    gate.fail({
      criterion: 'AC-45',
      message: `AC-45 CONTENT: banned token found in the rendered text but split across elements (${wholePageHits - bannedHits} occurrence(s) unaccounted for)`,
      where: 'rendered text',
      hint: 'Search the built HTML for immersive, journey, unleash, elevate, curated experience and "!".',
    })
  }

  // ── AC-46: NOVA ────────────────────────────────────────────────────────────
  const novaTargets: string[] = [
    ...NOVA_DIRECTORIES.flatMap((dir) => {
      const full = join(ROOT, dir)
      if (!existsSync(full)) {
        gate.fail({
          criterion: 'AC-46',
          message: `AC-46 CONTENT: ${dir}/ does not exist, so it could not be scanned for "NOVA". See CANON §12`,
          where: `${dir}/`,
        })
        return []
      }
      return Array.from(walkTextFiles(full))
    }),
    ...NOVA_FILES.map((f) => join(ROOT, f)).filter((f) => existsSync(f)),
  ]

  for (const file of novaTargets) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    for (let i = 0; i < lines.length; i++) {
      if (!NOVA.test(lines[i] ?? '')) continue
      gate.fail({
        criterion: 'AC-46',
        message: `AC-46 CONTENT: the string "NOVA" appears in ${relative(ROOT, file)}:${i + 1}. See CANON §12`,
        where: `${relative(ROOT, file)}:${i + 1}`,
        actual: truncate((lines[i] ?? '').trim(), 160),
      })
    }
  }
  for (const item of scanSurface) {
    if (!NOVA.test(item.value)) continue
    gate.fail({
      criterion: 'AC-46',
      message: `AC-46 CONTENT: the string "NOVA" appears in the rendered page at ${item.selector}. See CANON §12`,
      where: item.kind === 'text' ? item.selector : `${item.selector} [${item.kind}]`,
      actual: truncate(normalise(item.value), 160),
    })
  }
  gate.note('AC-46 scope: src/, design/, brief/CONTENT.md and the rendered page. docs/CANON.md §12 and brief/ACCEPTANCE.md quote the name in order to forbid it and are excluded on purpose.')

  // ── AC-47: eight questions, twelve sets ────────────────────────────────────
  const faqCount = harvest.faq.summaries > 0 ? harvest.faq.summaries : harvest.faq.expandables

  // Counted by matching the canon rather than by counting cells: CONTENT.md §7 renders
  // every set twice, once in the desktop table and once in the stacked mobile list, so a
  // cell count would read 24 on a correct page. Asking "is each of the twelve sets
  // listed, on the right day and the right stage" is the question AC-47 is actually about.
  const foundSets = ARTISTS.filter((artist) =>
    harvest.programme.cells.some(
      (cell) =>
        cell.stage !== null &&
        slugKey(cell.stage) === slugKey(artist.stage) &&
        cell.day !== null &&
        dayKey(cell.day) === dayKey(artist.day) &&
        normalise(cell.text).includes(normalise(artist.name)),
    ),
  )
  const days = new Set(harvest.programme.days.map(dayKey))
  const stages = new Set(harvest.programme.stages.map(slugKey))

  if (faqCount !== 8 || foundSets.length !== 12 || days.size !== 3 || stages.size !== 3) {
    const missing = ARTISTS.filter((a) => !foundSets.includes(a)).map((a) => `${a.name} (${a.day}, ${a.stage})`)
    gate.fail({
      criterion: 'AC-47',
      message: `AC-47 CONTENT: FAQ has ${faqCount} questions (expected 8); programme lists ${foundSets.length} of 12 sets across ${days.size} days and ${stages.size} stages`,
      where: '[data-section="faq"], [data-section="programme"]',
      expected: '8 questions; 12 sets across 3 days and 3 stages',
      actual: `${faqCount} questions; ${foundSets.length} sets, ${days.size} days, ${stages.size} stages`,
      hint: missing.length
        ? `Not found on the right day and stage: ${missing.join('; ')}. Programme cells carry data-day and data-stage (ACCEPTANCE.md, "The contract the page must expose").`
        : `FAQ questions were counted by ${harvest.faq.basis}.`,
    })
  }

  gate.note(`Counted ${harvest.artists.length} [data-artist] cards, ${harvest.tiers.length} [data-tier] cards, ${faqCount} FAQ questions, ${foundSets.length}/12 programme sets.`)
  completed = true
})

test.afterAll(() => {
  // A gate that dies half way through must not write "pass". If the body did not reach
  // its end and recorded nothing, that is a defect in the run, and it is reported as one.
  if (!completed && gate.failures.length === 0) {
    gate.fail({
      criterion: 'AC-38',
      message: 'CONTENT: the gate did not finish and recorded no result. Treat this as a failed run, not a pass.',
      where: 'checks/specs/content.spec.ts',
    })
  }
  gate.flush({
    completed,
    criteria: 'AC-38 to AC-47',
    contentSource: 'brief/CONTENT.md fenced blocks',
  })
})
