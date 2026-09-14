#!/usr/bin/env node
/**
 * Build the data bundle the TURBINE Figma plugin runs on.
 *
 *   node scripts/build-figma-plugin.mjs
 *
 * Why this exists
 * ---------------
 * A Figma plugin runs in a sandbox with no filesystem and no network. It cannot
 * read design/tokens/tokens.json and it cannot read brief/CONTENT.md. If the
 * plugin is going to build a design file that matches the code, every value it
 * needs has to be carried into the sandbox with it — and carried mechanically,
 * because a value retyped by hand is a value that drifts.
 *
 * So this script does the reading. It parses the token file and the copy deck,
 * derives the Figma-side layer the spec describes, and writes the result to
 * figma-plugin/data.generated.js as a single frozen object:
 *
 *   const TURBINE_DATA = { tokens: {...}, content: {...} };
 *
 * figma-plugin/code.js then contains no literal colour, no literal size and no
 * literal string of copy. It contains structure.
 *
 * Sources, in authority order
 * ---------------------------
 *   docs/CANON.md            outranks everything; not parsed, but every value
 *                            below traces to it through one of the two files
 *                            that are parsed
 *   design/tokens/tokens.json colours, sizes, spacing, radii, breakpoints
 *   brief/CONTENT.md          every user-facing string
 *   design/FIGMA-SPEC.md      the Figma-side layer: line heights, tracking,
 *                             responsive modes, the seventeen text styles and
 *                             the per-breakpoint layout numbers
 *
 * The last of those four is the one exception to "nothing is retyped". tokens.json
 * deliberately does not tokenise line height, and FIGMA-SPEC §12 records the
 * Figma-only decisions (tablet gutter, leading scale, type-size names) as
 * assumptions rather than canon. Those values are declared below, in the FIGMA_SPEC
 * block, each one carrying the section it comes from. They are declared here rather
 * than in code.js so that there is still exactly one place to change them.
 *
 * Two outputs
 * -----------
 *   1. figma-plugin/data.generated.js — the bundle, reviewable and diffable.
 *   2. figma-plugin/code.js           — the same bundle injected between two
 *                                       markers at the top of the plugin source.
 *
 * The second output is not a design choice, it is a platform constraint: a Figma
 * manifest names exactly one `main` script and there is no import mechanism inside
 * the sandbox, so the data has to travel inside the file Figma loads. Only the
 * region between the markers is rewritten; the plugin logic below them is never
 * touched. If the markers are missing or duplicated the script refuses to write.
 *
 * Images
 * ------
 * The same constraint applies to the photographs. Every file brief/CONTENT.md §13
 * lists is read from design/assets/ and injected into code.js, base64-encoded, as
 * TURBINE_IMAGES, so the built Figma file carries real image fills and a participant
 * can export the assets from it. They go into code.js only: data.generated.js stays
 * a text file a person can review.
 */

import { readFile, writeFile, access } from 'node:fs/promises'
import { dirname, join, resolve, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const TOKENS_IN = join(ROOT, 'design/tokens/tokens.json')
const CONTENT_IN = join(ROOT, 'brief/CONTENT.md')
const ASSETS_IN = join(ROOT, 'design/assets')
const DATA_OUT = join(ROOT, 'figma-plugin/data.generated.js')
const CODE_OUT = join(ROOT, 'figma-plugin/code.js')

const BEGIN = '/* === BEGIN GENERATED DATA — scripts/build-figma-plugin.mjs === */'
const END = '/* === END GENERATED DATA === */'

const rel = (p) => relative(ROOT, p)

/* ==========================================================================
   1. Markdown reading
   ========================================================================== */

/** Split a markdown document on headings of one level. Text before the first is dropped. */
function splitByHeading(md, level) {
  const marker = '#'.repeat(level) + ' '
  const out = []
  let current = null
  for (const line of md.split('\n')) {
    if (line.startsWith(marker)) {
      current = { title: line.slice(marker.length).trim(), lines: [] }
      out.push(current)
    } else if (current) {
      current.lines.push(line)
    }
  }
  return out.map((s) => ({ title: s.title, body: s.lines.join('\n') }))
}

/** Every fenced block in order, as trimmed strings. CONTENT.md fences are verbatim copy. */
function fences(text) {
  const out = []
  const re = /^```[a-z]*\n([\s\S]*?)\n?^```[ \t]*$/gm
  let m
  while ((m = re.exec(text)) !== null) out.push(m[1])
  return out
}

/** The first fenced block that follows `label`. Throws if the label moved. */
function fenceAfter(text, label) {
  const i = text.indexOf(label)
  if (i < 0) throw new Error(`brief/CONTENT.md: label not found: ${JSON.stringify(label)}`)
  const found = fences(text.slice(i))
  if (found.length === 0) throw new Error(`brief/CONTENT.md: no fenced block after ${JSON.stringify(label)}`)
  return found[0]
}

/** Split a multi-line fenced block into its lines. */
const lines = (block) => block.split('\n').map((l) => l.trim()).filter(Boolean)

/** Strip the markdown a cell may be wrapped in, so `€45` becomes €45. */
function cell(raw) {
  let s = raw.trim()
  s = s.replace(/^\*\*(.*)\*\*$/s, '$1').trim()
  s = s.replace(/^`(.*)`$/s, '$1')
  return s.trim()
}

/** Every pipe table in order, as { header, rows }. */
function tables(text) {
  const groups = []
  let current = null
  for (const raw of text.split('\n')) {
    const line = raw.trim()
    if (line.startsWith('|') && line.endsWith('|') && line.length > 1) {
      if (!current) {
        current = []
        groups.push(current)
      }
      current.push(line)
    } else {
      current = null
    }
  }
  return groups.map(parseTable).filter(Boolean)
}

function parseTable(raw) {
  const rows = raw.map((line) => line.slice(1, -1).split('|').map(cell))
  const sep = rows.findIndex((r) => r.length > 0 && r.every((c) => /^:?-{2,}:?$/.test(c)))
  if (sep < 1) return null
  return { header: rows[sep - 1], rows: rows.slice(sep + 1) }
}

/** The table whose header starts with `first`, so a section with several tables is unambiguous. */
function tableWithHeader(text, first) {
  const found = tables(text).find((t) => t.header[0] === first)
  if (!found) throw new Error(`brief/CONTENT.md: no table with first column ${JSON.stringify(first)}`)
  return found
}

/** Field / Value tables, as a plain object keyed by the field name. */
function fieldTable(text) {
  const t = tableWithHeader(text, 'Field')
  const out = {}
  for (const row of t.rows) out[row[0]] = row[1]
  return out
}

function expect(condition, message) {
  if (!condition) throw new Error(message)
}

/* ==========================================================================
   2. Token reading — design/tokens/tokens.json
   ========================================================================== */

/** Walk the DTCG tree, yielding [dottedPath, token] for every leaf carrying a $value. */
function* leaves(node, path = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (value && typeof value === 'object') {
      if ('$value' in value) yield [[...path, key], value]
      else yield* leaves(value, [...path, key])
    }
  }
}

/** tokens.json dot path -> Figma variable name. FIGMA-SPEC §2.1: replace `.` with `/`, nothing else. */
const figmaName = (path) => path.join('/')

/** DTCG alias syntax: "{color.bg.base}" -> "color/bg/base", anything else -> null. */
function aliasTarget(value) {
  if (typeof value !== 'string') return null
  const m = /^\{([^}]+)\}$/.exec(value.trim())
  return m ? m[1].split('.').join('/') : null
}

const px = (v) => {
  const m = /^(-?[\d.]+)px$/.exec(String(v).trim())
  expect(m, `expected a px dimension, got ${JSON.stringify(v)}`)
  return Number(m[1])
}

const rem = (v) => {
  const m = /^(-?[\d.]+)rem$/.exec(String(v).trim())
  expect(m, `expected a rem dimension, got ${JSON.stringify(v)}`)
  return Number(m[1])
}

/** "#FF6A1A" -> { r, g, b } as floats 0-1, which is the only colour shape Figma accepts. */
function hexToRgb(hex) {
  const h = hex.replace('#', '')
  expect(/^[0-9a-fA-F]{6}$/.test(h), `expected a 6-digit hex, got ${JSON.stringify(hex)}`)
  return {
    r: Number((parseInt(h.slice(0, 2), 16) / 255).toFixed(6)),
    g: Number((parseInt(h.slice(2, 4), 16) / 255).toFixed(6)),
    b: Number((parseInt(h.slice(4, 6), 16) / 255).toFixed(6)),
  }
}

/* WCAG 2.x relative luminance and contrast, the maths in design/tokens/CONTRAST.md §1. */
const channel = (c8) => {
  const c = c8 / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const h = hex.replace('#', '')
  const r = channel(parseInt(h.slice(0, 2), 16))
  const g = channel(parseInt(h.slice(2, 4), 16))
  const b = channel(parseInt(h.slice(4, 6), 16))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(fg, bg) {
  const a = luminance(fg)
  const b = luminance(bg)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const verdict = (r) => (r >= 4.5 ? 'PASS-AA' : r >= 3 ? 'PASS-AA-LARGE' : 'FAIL')
const round2 = (n) => Math.round(n * 100) / 100

/* ==========================================================================
   3. The Figma-side layer — design/FIGMA-SPEC.md
   --------------------------------------------------------------------------
   Values the token file deliberately does not carry. Each one names its section.
   ========================================================================== */

const FIGMA_SPEC = {
  file: 'TURBINE — Landing page', // §0
  pages: ['Cover', 'Design system', 'Desktop 1440', 'Tablet 768', 'Exports'], // §1, mobile spliced in below
  pageOrder: ['Cover', 'Design system', 'Desktop 1440', 'Tablet 768', 'Mobile 390', 'Exports'], // §1

  /* §2.3 — line height, as the percentage Figma stores. */
  leading: [
    { name: 'leading/none', percent: 100, css: '1' },
    { name: 'leading/tight', percent: 108, css: '1.08' },
    { name: 'leading/snug', percent: 125, css: '1.25' },
    { name: 'leading/normal', percent: 150, css: '1.5' },
    { name: 'leading/relaxed', percent: 162, css: '1.625' },
  ],

  /* §2.3 — letter spacing. Figma stores em as a percentage of font size. */
  tracking: [
    { name: 'tracking/tight', em: -0.02, percent: -2, source: 'CANON §5, all display type' },
    { name: 'tracking/normal', em: 0, percent: 0, source: '—' },
    { name: 'tracking/wide', em: 0.06, percent: 6, source: 'FIGMA-SPEC §12, eyebrows and mono tags' },
    { name: 'tracking/wordmark', em: 0.18, percent: 18, source: 'CANON §5, wordmark lockup only' },
  ],

  /* §2.4 — fixed sizes with no counterpart in tokens.json. */
  scaleExtras: [
    { name: 'border/hairline', value: 1, description: 'Hairline stroke. FIGMA-SPEC §2.4.' },
    { name: 'border/focus', value: 2, description: 'Focus ring stroke. CANON §9 via FIGMA-SPEC §2.4.' },
    { name: 'size/touch-min', value: 24, description: 'CANON §9 minimum touch target.' },
    { name: 'size/tap-comfortable', value: 48, description: 'Used for every real control. FIGMA-SPEC §2.4.' },
  ],

  /* §2.5 — the only collection with more than one mode. */
  responsiveModes: ['Mobile 390', 'Tablet 768', 'Desktop 1440'],
  responsive: [
    { name: 'responsive/gutter', values: [24, 48, 48], note: 'CANON §6 fixes 24 and 48; the reference site uses 48 from 768 up' },
    { name: 'responsive/container-max', values: [342, 672, 1104], note: 'size/content-max (1200) includes the gutters, as on the reference site: 1200 − 2 × 48' },
    { name: 'responsive/section-pad-y', values: [64, 96, 128], note: 'space/16, space/24, space/32' },
    { name: 'responsive/grid-columns', values: [4, 8, 12], note: '' },
    { name: 'responsive/grid-gutter', values: [16, 24, 24], note: '' },
    { name: 'responsive/type/wordmark-hero', values: [40, 72, 96], alias: ['text/4xl', 'text/6xl', 'text/7xl'] },
    { name: 'responsive/type/section-h2', values: [32, 40, 56], alias: ['text/3xl', 'text/4xl', 'text/5xl'] },
    { name: 'responsive/type/subsection-h3', values: [24, 24, 32], alias: ['text/2xl', 'text/2xl', 'text/3xl'] },
    { name: 'responsive/type/lead', values: [18, 18, 20], alias: ['text/lg', 'text/lg', 'text/xl'] },
  ],

  /* §2.2 — the description Dev Mode hands to the model that writes the CSS. */
  variableDescriptions: {
    'color/text/muted':
      'Legal and footer only. 4.1:1 on bg/base — fails AA for body copy. Use text/secondary instead.',
  },

  /* §3 — seventeen text styles. `size` is either a fixed text/* variable or a responsive alias. */
  textStyles: [
    { name: 'Display/Wordmark-Hero', family: 'display', weight: 700, size: 'responsive/type/wordmark-hero', px: 96, leading: 'leading/none', tracking: 'tracking/wordmark', textCase: 'UPPER', usedBy: 'Hero h1' },
    { name: 'Display/Wordmark-Nav', family: 'display', weight: 700, size: 'text/xl', px: 20, leading: 'leading/snug', tracking: 'tracking/wordmark', textCase: 'UPPER', usedBy: 'Nav and footer lockup' },
    { name: 'Display/Section', family: 'display', weight: 700, size: 'responsive/type/section-h2', px: 56, leading: 'leading/tight', tracking: 'tracking/tight', textCase: 'ORIGINAL', usedBy: 'Every section h2' },
    { name: 'Display/Subsection', family: 'display', weight: 500, size: 'responsive/type/subsection-h3', px: 32, leading: 'leading/snug', tracking: 'tracking/tight', textCase: 'ORIGINAL', usedBy: 'h3, ticket tier, day heading' },
    { name: 'Display/Card-Title', family: 'display', weight: 500, size: 'text/xl', px: 20, leadingPercent: 130, tracking: 'tracking/tight', textCase: 'ORIGINAL', usedBy: 'Artist name, FAQ question' },
    { name: 'Display/Price', family: 'display', weight: 700, size: 'text/4xl', px: 40, leading: 'leading/tight', tracking: 'tracking/tight', textCase: 'ORIGINAL', usedBy: 'Ticket price' },
    { name: 'Body/Lead', family: 'body', weight: 400, size: 'responsive/type/lead', px: 20, leading: 'leading/relaxed', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Hero secondary line, section intro' },
    { name: 'Body/Base', family: 'body', weight: 400, size: 'text/base', px: 16, leading: 'leading/relaxed', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Default paragraph' },
    { name: 'Body/Base-Medium', family: 'body', weight: 500, size: 'text/base', px: 16, leading: 'leading/relaxed', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Nav link, emphasis' },
    { name: 'Body/Small', family: 'body', weight: 400, size: 'text/sm', px: 14, leading: 'leading/normal', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Card meta, captions, helper text' },
    { name: 'Body/Small-Medium', family: 'body', weight: 500, size: 'text/sm', px: 14, leading: 'leading/normal', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Tab label, table cell emphasis' },
    { name: 'Label/Eyebrow', family: 'body', weight: 600, size: 'text/xs', px: 12, leadingPercent: 133, tracking: 'tracking/wide', textCase: 'UPPER', usedBy: 'Section eyebrow' },
    { name: 'Label/Button', family: 'body', weight: 600, size: 'text/base', px: 16, leading: 'leading/normal', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Button md' },
    { name: 'Label/Button-Small', family: 'body', weight: 600, size: 'text/sm', px: 14, leadingPercent: 143, tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Button sm, nav CTA, tab' },
    { name: 'Mono/Time', family: 'mono', weight: 400, size: 'text/sm', px: 14, leadingPercent: 143, tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Timetable times, token names' },
    { name: 'Mono/Tag', family: 'mono', weight: 700, size: 'text/xs', px: 12, leadingPercent: 133, tracking: 'tracking/wide', textCase: 'UPPER', usedBy: 'Ticker tags, badges' },
    { name: 'Legal/Fine', family: 'body', weight: 400, size: 'text/xs', px: 12, leading: 'leading/normal', tracking: 'tracking/normal', textCase: 'ORIGINAL', usedBy: 'Footer legal, fiction disclaimer' },
  ],

  /* Weight -> Figma style name, in the order the plugin should try them. Figma ships
     Inter as "Semi Bold" with a space; the Google Fonts catalogue spells several
     families "SemiBold". Trying both costs nothing and saves a failed build. */
  styleCandidates: {
    400: ['Regular'],
    500: ['Medium'],
    600: ['Semi Bold', 'SemiBold', 'Medium'],
    700: ['Bold'],
  },

  /* §5, §6, §7 — one record per breakpoint. Everything the section builders need. */
  breakpoints: [
    {
      key: 'desktop',
      width: 1440,
      mode: 'Desktop 1440',
      frame: 'TURBINE / Desktop 1440',
      page: 'Desktop 1440',
      gutter: 48,
      sectionPadY: 128,
      /* The reference site reads CANON §6 "content max width 1200px" as 1200 including the
         gutters, so content is 1104 at 1440. Every width below is measured from that site. */
      container: 1104,
      gridColumns: 12,
      gridGutter: 24,
      type: { wordmarkHero: 96, sectionH2: 56, sectionH2Leading: 100, subsectionH3: 32, subsectionH3Leading: 120, lead: 20 },
      nav: { layout: 'full', height: 72, padX: 48, padY: 12, linkGap: 32, linkStyle: 'Body/Base-Medium' },
      hero: { height: 780, padX: 168, padTop: 160, padBottom: 96, gap: 32, ctaDirection: 'HORIZONTAL', ctaGap: 16, ctaFill: false },
      ticker: { height: 56, gap: 24 },
      lineup: { columns: 4, cardWidth: 258, cardSizing: 'FIXED', metaDirection: 'HORIZONTAL', headlinerNameSize: 24 },
      programme: { layout: 'table-row', showHead: true },
      venue: { direction: 'HORIZONTAL', columnWidth: 528, imageAspect: 4 / 3, mapWidth: 528, mapHeight: 320, travelColumns: 1 },
      tickets: { direction: 'HORIZONTAL', cardWidth: 352, cardSizing: 'FIXED', cardPad: 24, highlightPad: 32, comparisonCell: 120, comparison: 'table' },
      faq: { listWidth: 800, listSizing: 'FIXED', triggerPadY: 24, minHeight: 64, answerPadRight: 48 },
      newsletter: { width: 655, formWidth: 560, sizing: 'FIXED' },
      footer: { layout: 'wide', columnWidth: 156, columnGap: 24, brandWidth: 384 },
    },
    {
      key: 'tablet',
      width: 768,
      mode: 'Tablet 768',
      frame: 'TURBINE / Tablet 768',
      page: 'Tablet 768',
      gutter: 48,
      sectionPadY: 96,
      container: 672,
      gridColumns: 8,
      gridGutter: 24,
      type: { wordmarkHero: 72, sectionH2: 40, sectionH2Leading: 111.11, subsectionH3: 24, subsectionH3Leading: 133.33, lead: 18 },
      nav: { layout: 'full', height: 64, padX: 48, padY: 12, linkGap: 24, linkStyle: 'Body/Small-Medium' },
      hero: { height: 700, padX: 48, padTop: 120, padBottom: 64, gap: 32, ctaDirection: 'HORIZONTAL', ctaGap: 16, ctaFill: false },
      ticker: { height: 48, gap: 24 },
      lineup: { columns: 3, cardWidth: 208, cardSizing: 'FIXED', metaDirection: 'HORIZONTAL', headlinerNameSize: 24 },
      programme: { layout: 'table-row', showHead: true },
      venue: { direction: 'VERTICAL', columnWidth: 672, imageAspect: 16 / 9, mapWidth: 672, mapHeight: 280, travelColumns: 2 },
      tickets: { direction: 'VERTICAL', cardWidth: 480, cardSizing: 'FILL', cardPad: 24, highlightPad: 24, comparisonCell: 96, comparison: 'table' },
      faq: { listWidth: 672, listSizing: 'FILL', triggerPadY: 24, minHeight: 64, answerPadRight: 48 },
      newsletter: { width: 590, formWidth: 480, sizing: 'FIXED' },
      footer: { layout: 'stacked', columnWidth: 324, columnGap: 24, brandWidth: 672 },
    },
    {
      key: 'mobile',
      width: 390,
      mode: 'Mobile 390',
      frame: 'TURBINE / Mobile 390',
      page: 'Mobile 390',
      gutter: 24,
      sectionPadY: 64,
      container: 342,
      gridColumns: 4,
      gridGutter: 16,
      type: { wordmarkHero: 40, sectionH2: 32, sectionH2Leading: 120, subsectionH3: 24, subsectionH3Leading: 133.33, lead: 18 },
      nav: { layout: 'compact', height: 64, padX: 24, padY: 8, linkGap: 24, linkStyle: 'Body/Small-Medium' },
      hero: { height: 600, padX: 24, padTop: 96, padBottom: 64, gap: 16, ctaDirection: 'VERTICAL', ctaGap: 12, ctaFill: true },
      ticker: { height: 44, gap: 16 },
      lineup: { columns: 2, cardWidth: 163, cardSizing: 'FIXED', metaDirection: 'VERTICAL', headlinerNameSize: 16 },
      programme: { layout: 'stacked', showHead: false },
      venue: { direction: 'VERTICAL', columnWidth: 342, imageAspect: 4 / 3, mapWidth: 342, mapHeight: 200, travelColumns: 1 },
      tickets: { direction: 'VERTICAL', cardWidth: 342, cardSizing: 'FILL', cardPad: 16, highlightPad: 16, comparisonCell: 0, comparison: 'lists' },
      faq: { listWidth: 342, listSizing: 'FILL', triggerPadY: 16, minHeight: 56, answerPadRight: 0 },
      newsletter: { width: 342, formWidth: 342, sizing: 'FILL' },
      footer: { layout: 'compact', columnWidth: 163, columnGap: 16, brandWidth: 342 },
    },
  ],

  /* §8.1 — the slug is the Figma layer name, the section id and the export filename. */
  exportSections: ['nav', 'hero', 'ticker', 'lineup', 'programme', 'venue', 'tickets', 'faq', 'newsletter', 'footer'],

  /* §5.4 to §5.8 — the section eyebrows.
     These are the one set of visible strings on the composed page that brief/CONTENT.md
     does not carry: CONTENT.md owns the headings and the body copy, FIGMA-SPEC owns the
     eyebrow above each h2. They are listed here, with their section, so that the string
     on the page can be traced to a document rather than to someone's judgement. If the
     copy deck ever grows an eyebrow of its own, delete the line here and read it from
     CONTENT.md instead. */
  eyebrows: {
    lineup: 'Twelve artists',
    programme: 'Three nights',
    venue: 'The building',
    tickets: 'Three ways in',
    faq: 'Before you come',
  },

  /* §1.1 — the cover frame. */
  cover: {
    width: 1600,
    height: 960,
    padding: 128,
    gap: 32,
    subtitle: 'Landing page — design file',
    meta: '12–14 June 2027 · The Powerhouse, Hall E · Kraków',
    provenance:
      'Fictional festival. Teaching material for WaysConf 2026. Source of truth: docs/CANON.md',
  },

  /* §5.12 — the skip link lives as a component and is instanced, hidden, into each nav. */
  skipLink: { height: 40, padX: 16, padY: 12, top: 8 },

  /* §9 — the five interactive areas CANON §9 makes non-negotiable demands about. */
  annotations: [
    { target: 'section-nav', text: 'nav landmark, aria-label="Primary". Wordmark links to #top. Below 768 the links collapse behind a button whose accessible name toggles Open menu / Close menu.' },
    { target: 'lineup/tabs', text: 'role=tablist with aria-label="Filter the lineup by day". Each tab role=tab with aria-selected. The panel is lineup/grid. With JavaScript off the tabs are hidden and all twelve cards show.' },
    { target: 'programme/days', text: 'One table per day with a caption. th scope=col for the stage columns, th scope=row for the time. An empty cell carries a visually hidden "No set"; the visible em dash is aria-hidden.' },
    { target: 'faq/trigger', text: 'button, aria-expanded, aria-controls -> faq/answer id. Native details/summary satisfies this without script.' },
    { target: 'newsletter/form', text: 'Visible label above the input, never a placeholder standing in for it. Consent unchecked on load. Messages announced politely, never as an alert dialog.' },
  ],
}

/* ==========================================================================
   4. Assemble the token half of the bundle
   ========================================================================== */

function buildTokens(raw) {
  const byPath = new Map()
  for (const [path, token] of leaves(raw)) byPath.set(path.join('.'), { path, token })

  const colors = []
  const scale = []
  const size = []
  const family = []
  const weight = []
  const fontSet = new Map()

  for (const [dotted, { path, token }] of byPath) {
    const group = path[0]
    const name = figmaName(path)

    if (group === 'color') {
      const alias = aliasTarget(token.$value)
      const hex = alias ? byPath.get(alias.split('/').join('.')).token.$value : token.$value
      colors.push({
        name,
        hex,
        rgb: hexToRgb(hex),
        aliasOf: alias,
        description: FIGMA_SPEC.variableDescriptions[name] || token.$description || '',
      })
    } else if (group === 'spacing') {
      scale.push({ name: `space/${path[1]}`, value: px(token.$value), description: 'CANON §6 spacing scale.' })
    } else if (group === 'radius') {
      scale.push({ name: `radius/${path[1]}`, value: px(token.$value), description: token.$description || 'CANON §6 radius.' })
    } else if (group === 'breakpoint') {
      scale.push({ name: `breakpoint/${path[1]}`, value: px(token.$value), description: token.$description || 'CANON §6 breakpoint.' })
    } else if (dotted === 'layout.maxWidth') {
      scale.push({ name: 'size/content-max', value: px(token.$value), description: token.$description || 'CANON §6 content max width.' })
    } else if (group === 'typography' && path[1] === 'fontSize') {
      const r = rem(token.$value)
      size.push({ name: `text/${path[2]}`, value: r * 16, rem: r })
    } else if (group === 'typography' && path[1] === 'fontFamily') {
      family.push({ name: `font/${path[2]}`, value: token.$value[0], stack: token.$value, role: path[2] })
    } else if (group === 'typography' && path[1] === 'fontWeight') {
      weight.push({ name: `weight/${path[2]}`, value: token.$value, role: path[2] })
    }
  }

  expect(colors.length === 14, `expected 14 colour leaves in tokens.json, found ${colors.length}`)
  expect(size.length === 11, `expected 11 font sizes in tokens.json, found ${size.length}`)
  expect(family.length === 3, `expected 3 font families in tokens.json, found ${family.length}`)

  for (const extra of FIGMA_SPEC.scaleExtras) scale.push(extra)

  /* The styles the plugin must load before it may create a single text node. */
  const roleFamily = Object.fromEntries(family.map((f) => [f.role, f.value]))
  for (const style of FIGMA_SPEC.textStyles) {
    const fam = roleFamily[style.family]
    const key = `${fam}|${style.weight}`
    if (!fontSet.has(key)) {
      fontSet.set(key, { family: fam, weight: style.weight, candidates: FIGMA_SPEC.styleCandidates[style.weight] })
    }
  }

  return {
    color: colors.sort((a, b) => a.name.localeCompare(b.name)),
    scale,
    type: {
      family,
      weight: weight.sort((a, b) => a.value - b.value),
      size: size.sort((a, b) => a.value - b.value),
      leading: FIGMA_SPEC.leading,
      tracking: FIGMA_SPEC.tracking,
    },
    responsive: { modes: FIGMA_SPEC.responsiveModes, variables: FIGMA_SPEC.responsive },
    fonts: [...fontSet.values()],
    roleFamily,
  }
}

/** The proof sheet and the contrast matrix on the Design system page. Measured, not quoted. */
function buildContrast(colors) {
  const hex = Object.fromEntries(colors.map((c) => [c.name, c.hex]))
  const base = hex['color/bg/base']

  const swatches = colors
    .filter((c) => !c.aliasOf)
    .map((c) => {
      const ratio = c.name === 'color/bg/base' ? 1 : contrast(c.hex, base)
      return {
        name: c.name,
        hex: c.hex,
        ratio: round2(ratio),
        label: c.name === 'color/bg/base' ? 'the ground' : `${round2(ratio).toFixed(2)}:1 on bg/base · ${verdict(ratio)}`,
      }
    })

  /* FIGMA-SPEC §2.6: four known-good pairings and two known-bad ones, measured. */
  const pairs = [
    ['color/text/primary', 'color/bg/base', 'Pass'],
    ['color/text/primary', 'color/bg/surface', 'Pass'],
    ['color/text/secondary', 'color/bg/base', 'Pass'],
    ['color/bg/base', 'color/accent/sodium', 'Pass — this is the button'],
    ['color/text/muted', 'color/bg/base', 'Fail for body copy. Legal and footer only.'],
    ['#FFFFFF', 'color/accent/sodium', 'Fail. Never white on orange.'],
  ].map(([fg, bg, note]) => {
    const fgHex = fg.startsWith('#') ? fg : hex[fg]
    const bgHex = bg.startsWith('#') ? bg : hex[bg]
    const ratio = contrast(fgHex, bgHex)
    return {
      fg,
      bg,
      fgHex,
      bgHex,
      ratio: round2(ratio),
      verdict: verdict(ratio),
      note,
      label: `${fg.replace('color/', '')} on ${bg.replace('color/', '')}`,
    }
  })

  return { swatches, pairs }
}

/* ==========================================================================
   5. Assemble the content half of the bundle — brief/CONTENT.md
   ========================================================================== */

function buildContent(md) {
  const bySection = new Map()
  for (const s of splitByHeading(md, 2)) bySection.set(s.title.replace(/^\d+\.\s*/, ''), s.body)

  const section = (name) => {
    const body = bySection.get(name)
    expect(body !== undefined, `brief/CONTENT.md: section "${name}" not found`)
    return body
  }

  /* §1 Meta */
  const metaBody = section('Meta and social')
  const metaF = fences(metaBody)
  expect(metaF.length === 4, `§1 expected 4 fenced strings, found ${metaF.length}`)
  const meta = { title: metaF[0], description: metaF[1], ogTitle: metaF[2], ogDescription: metaF[3] }

  /* §2 Skip link */
  const skipLink = fences(section('Skip link'))[0]

  /* §3 Nav */
  const navBody = section('Nav')
  const navLinkTable = tableWithHeader(navBody, 'Order')
  const nav = {
    wordmark: 'TURBINE',
    wordmarkLabel: 'TURBINE — back to top',
    links: navLinkTable.rows.map((r) => ({ label: r[1], target: r[2] })),
    cta: { label: fences(navBody)[0], target: /Target: `([^`]+)`/.exec(navBody)[1] },
    landmark: 'Primary',
  }
  expect(nav.links.length === 4, `§3 expected 4 nav links, found ${nav.links.length}`)

  /* §4 Hero */
  const heroF = fences(section('Hero'))
  expect(heroF.length === 9, `§4 expected 9 fenced strings, found ${heroF.length}`)
  const hero = {
    eyebrow: heroF[0],
    wordmark: heroF[1],
    tagline: heroF[2],
    secondary: heroF[3],
    dates: heroF[4],
    venue: heroF[5],
    ctaPrimary: { label: heroF[6], target: '#tickets' },
    ctaSecondary: { label: heroF[7], target: '#lineup' },
    scrollCue: { label: heroF[8], accessibleName: 'Scroll down to the lineup', target: '#lineup' },
  }

  /* §5 Ticker */
  const tickerF = fences(section('Ticker'))
  expect(tickerF.length === 3, `§5 expected 3 fenced strings, found ${tickerF.length}`)
  const ticker = { tags: lines(tickerF[0]), separator: tickerF[1], accessibleText: tickerF[2] }
  expect(ticker.tags.length === 14, `§5 expected 14 ticker tags, found ${ticker.tags.length}`)

  /* §6 Lineup */
  const lineupBody = section('Lineup')
  const lineupF = fences(lineupBody)
  const tabTable = tableWithHeader(lineupBody, 'Visible')
  const statusTable = tableWithHeader(lineupBody, 'Tab')
  const artists = splitByHeading(lineupBody, 3).map((sub) => {
    const fields = fieldTable(sub.body)
    const [day, stage] = fields['Day and stage'].split('·').map((s) => s.trim())
    return {
      name: fields.Name,
      billing: fields.Billing,
      dayStage: fields['Day and stage'],
      day,
      stage,
      genre: fields.Genre,
      blurb: fences(sub.body)[0],
      slug: slugify(fields.Name),
    }
  })
  expect(artists.length === 12, `§6 expected 12 artists, found ${artists.length}`)
  const lineup = {
    heading: lineupF[0],
    intro: lineupF[1],
    tabsLabel: 'Filter the lineup by day',
    tabs: tabTable.rows.map((r) => ({ label: r[0], accessibleName: r[1], shows: r[2] })),
    status: Object.fromEntries(statusTable.rows.map((r) => [r[0], r[1]])),
    artists,
  }

  /* §7 Programme */
  const progBody = section('Programme')
  const progF = fences(progBody)
  const days = splitByHeading(progBody, 3).map((sub) => {
    const table = tableWithHeader(sub.body, 'Time')
    return {
      label: fences(sub.body)[0],
      doors: fenceAfter(sub.body, 'Doors line:'),
      daytime: sub.body.includes('Daytime line') ? fenceAfter(sub.body, 'Daytime line') : null,
      caption: fenceAfter(sub.body, 'Table caption'),
      columns: table.header,
      rows: table.rows.map((r) => ({ time: r[0], cells: r.slice(1) })),
      stacked: lines(fenceAfter(sub.body, 'Stacked mobile order')),
    }
  })
  expect(days.length === 3, `§7 expected 3 day blocks, found ${days.length}`)
  const programme = {
    heading: progF[0],
    intro: progF[1],
    days,
    note: fenceAfter(progBody, '**Note under the three day blocks:**'),
    emptyCell: '—',
    emptyCellAccessible: 'No set',
  }

  /* §8 Venue */
  const venueBody = section('Venue')
  const gettingHere = splitByHeading(venueBody, 3)[0]
  const travelTable = tableWithHeader(gettingHere.body, 'Term')
  const venue = {
    heading: fences(venueBody)[0],
    paragraphs: [
      fenceAfter(venueBody, '**Paragraph 1:**'),
      fenceAfter(venueBody, '**Paragraph 2:**'),
      fenceAfter(venueBody, '**Paragraph 3:**'),
    ],
    gettingHere: {
      heading: fences(gettingHere.body)[0],
      address: fenceAfter(gettingHere.body, 'Address line:'),
      travel: travelTable.rows.map((r) => ({ term: r[0], description: r[1] })),
      parking: fenceAfter(gettingHere.body, 'Line under the four entries:'),
      mapCaption: fenceAfter(gettingHere.body, '**Map caption**'),
      mapPlaceholder: 'MAP PLACEHOLDER',
    },
  }
  expect(venue.gettingHere.travel.length === 4, `§8 expected 4 travel entries, found ${venue.gettingHere.travel.length}`)

  /* §9 Tickets */
  const ticketBody = section('Tickets')
  const ticketF = fences(ticketBody)
  const ticketSubs = splitByHeading(ticketBody, 3)
  const cardSubs = ticketSubs.filter((s) => s.title.startsWith('Card '))
  const cards = cardSubs.map((sub, i) => {
    const fields = fieldTable(sub.body)
    return {
      name: fields.Name,
      price: fields.Price,
      priceSuffix: fields['Price suffix'],
      badge: fields.Badge === 'none' ? null : fields.Badge,
      includes: lines(fenceAfter(sub.body, 'Inclusion list:')),
      button: fenceAfter(sub.body, 'Button label:'),
      variant: i === 1 ? 'highlighted' : 'standard',
      target: 'https://tickets.turbine.fm/2027',
    }
  })
  expect(cards.length === 3, `§9 expected 3 ticket cards, found ${cards.length}`)
  const comparisonSub = ticketSubs.find((s) => s.title === 'Comparison list')
  const comparisonTable = tables(comparisonSub.body)[0]
  const tickets = {
    heading: ticketF[0],
    intro: ticketF[1],
    cards,
    comparison: {
      caption: fenceAfter(comparisonSub.body, 'Table caption:'),
      columns: comparisonTable.header.slice(1),
      rows: comparisonTable.rows.map((r) => ({ label: r[0], cells: r.slice(1) })),
    },
    accessNote: fences(ticketSubs.find((s) => s.title === 'Access note').body)[0],
    smallPrint: fences(ticketSubs.find((s) => s.title.startsWith('Small print')).body)[0],
  }

  /* §10 FAQ */
  const faqBody = section('FAQ')
  const faqF = fences(faqBody)
  const faqItems = splitByHeading(faqBody, 3).map((sub) => ({
    id: /id="([^"]+)"/.exec(sub.title)[1],
    question: fenceAfter(sub.body, 'Question:'),
    answer: fenceAfter(sub.body, 'Answer:'),
  }))
  expect(faqItems.length === 8, `§10 expected 8 questions, found ${faqItems.length}`)
  const faq = { heading: faqF[0], intro: faqF[1], items: faqItems }

  /* §11 Newsletter */
  const newsBody = section('Newsletter')
  const newsF = fences(newsBody)
  expect(newsF.length === 8, `§11 expected 8 fenced strings, found ${newsF.length}`)
  const messageTable = tableWithHeader(newsBody, 'Case')
  const newsletter = {
    heading: newsF[0],
    pitch: newsF[1],
    label: newsF[2],
    placeholder: newsF[3],
    consent: newsF[4],
    button: newsF[5],
    note: newsF[6],
    fixtureNote: newsF[7],
    messages: Object.fromEntries(messageTable.rows.map((r) => [r[0], r[1]])),
  }

  /* §12 Footer */
  const footBody = section('Footer')
  const footSubs = splitByHeading(footBody, 3)
  const columns = footSubs
    .filter((s) => /^Column \d$/.test(s.title))
    .map((sub) => ({
      heading: fences(sub.body)[0],
      links: tableWithHeader(sub.body, 'Label').rows.map((r) => ({ label: r[0], target: r[1] })),
    }))
  expect(columns.length === 4, `§12 expected 4 footer columns, found ${columns.length}`)
  const socialsSub = footSubs.find((s) => s.title === 'Socials')
  const legalSub = footSubs.find((s) => s.title === 'Legal lines')
  const legalF = fences(legalSub.body)
  expect(legalF.length === 3, `§12 expected 3 legal lines, found ${legalF.length}`)
  const footer = {
    heading: fences(footBody)[0],
    tagline: 'Three nights inside the machine',
    columns,
    socials: tableWithHeader(socialsSub.body, 'Accessible name').rows.map((r) => ({ label: r[0], target: r[1] })),
    legal: [legalF[0], legalF[1]],
    disclaimer: legalF[2],
  }

  /* §13 Images.
     Resolved by role, never by literal filename. The asset pack has already been
     renamed once — hero-hall-e.webp became hero-hall.jpg, the per-artist files
     gained a CANON-order number, the map stopped being an image at all — and a
     plugin that hard-codes those strings silently loses its alt text the next time
     somebody re-cuts the pack. Matching on the artist slug and on the role word
     survives a rename; a literal does not. */
  const imageBody = section('Image manifest and alt text')
  const altSub = splitByHeading(imageBody, 3).find((s) => s.title === 'Alt text')
  const alt = {}
  const altRe = /`([^`]+\.(?:webp|svg|jpg|jpeg|png))`[^\n]*:\s*\n+```\n([\s\S]*?)\n```/g
  let am
  while ((am = altRe.exec(altSub.body)) !== null) alt[am[1]] = am[2].trim()

  /* A decorative image is described in prose and must never be given a description,
     so it has no fenced block. It still belongs in the manifest, with an empty alt. */
  const decoRe = /`([^`]+\.(?:webp|svg|jpe?g|png))`[^\n]*decorative/gi
  let dm
  while ((dm = decoRe.exec(altSub.body)) !== null) alt[dm[1]] = ''

  const altKeys = Object.keys(alt)
  const claimed = new Set()
  const roleOf = (pattern, what) => {
    const key = altKeys.find((k) => pattern.test(k) && !claimed.has(k))
    expect(key, `§13: no image matching ${pattern} for the ${what}`)
    claimed.add(key)
    return { file: key, alt: alt[key] }
  }

  const artistImages = artists.map((artist) => {
    const key = altKeys.find((k) => k.indexOf(artist.slug) >= 0)
    expect(key, `§13: no image whose filename contains the slug "${artist.slug}" (${artist.name})`)
    claimed.add(key)
    return { slug: artist.slug, name: artist.name, file: key, alt: alt[key] }
  })

  const images = {
    hero: roleOf(/hero/i, 'hero'),
    venue: roleOf(/venue/i, 'venue image'),
    og: roleOf(/(^|[^a-z])og[-_.]/i, 'social card'),
    artists: artistImages,
    /* Anything left over is decorative or unplaced. §13 names two supplied files
       the design does not place; they are listed, not positioned. */
    other: altKeys.filter((k) => !claimed.has(k)).map((k) => ({ file: k, alt: alt[k] })),
    all: alt,
    manifest: tableWithHeader(imageBody, 'Path').rows.map((r) => ({ path: r[0], where: r[1], size: r[2] })),
    /* §13 is explicit that the venue map is a bordered placeholder box and not a
       file. Kept as a field so the plugin does not have to infer its absence. */
    map: altKeys.some((k) => /map/i.test(k)) ? roleOf(/map/i, 'map') : null,
  }
  expect(images.artists.length === 12, `§13 expected 12 artist images, matched ${images.artists.length}`)

  /* §14 Microcopy */
  const microTable = tableWithHeader(section('Interface microcopy and accessible names'), 'Where')
  const microcopy = microTable.rows.map((r) => ({ where: r[0], string: r[1], note: r[2] }))

  return {
    meta,
    skipLink,
    nav,
    hero,
    ticker,
    lineup,
    programme,
    venue,
    tickets,
    faq,
    newsletter,
    footer,
    images,
    microcopy,
  }
}

function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/* ==========================================================================
   6. Export manifest — FIGMA-SPEC §8.2, thirty-three files
   ========================================================================== */

function buildExports() {
  const widths = FIGMA_SPEC.breakpoints.map((b) => b.width).sort((a, b) => a - b)
  const rows = []
  for (const slug of FIGMA_SPEC.exportSections) {
    for (const width of widths) {
      rows.push({ layer: `section-${slug}`, suffix: `-${width}`, file: `section-${slug}-${width}.png` })
    }
  }
  for (const bp of [...FIGMA_SPEC.breakpoints].sort((a, b) => a.width - b.width)) {
    rows.push({ layer: bp.frame, suffix: `-${bp.width}`, file: `full-page-${bp.width}.png` })
  }
  expect(rows.length === 33, `FIGMA-SPEC §8.2 expects 33 export files, built ${rows.length}`)
  return { directory: 'design/export/', sections: FIGMA_SPEC.exportSections, widths, rows }
}

/* ==========================================================================
   7. Emit
   ========================================================================== */

const tokensRaw = JSON.parse(await readFile(TOKENS_IN, 'utf8'))
const contentRaw = await readFile(CONTENT_IN, 'utf8')

const tokens = buildTokens(tokensRaw)
const content = buildContent(contentRaw)

const data = {
  meta: {
    project: 'TURBINE',
    file: FIGMA_SPEC.file,
    generator: 'scripts/build-figma-plugin.mjs',
    sources: [rel(TOKENS_IN), rel(CONTENT_IN), 'design/FIGMA-SPEC.md', 'docs/CANON.md'],
    note: 'Generated file. Do not edit. Run: node scripts/build-figma-plugin.mjs',
  },
  tokens,
  contrast: buildContrast(tokens.color),
  textStyles: FIGMA_SPEC.textStyles.map((s) => ({
    ...s,
    figmaFamily: tokens.roleFamily[s.family],
    styleCandidates: FIGMA_SPEC.styleCandidates[s.weight],
  })),
  pages: FIGMA_SPEC.pageOrder,
  eyebrows: FIGMA_SPEC.eyebrows,
  cover: FIGMA_SPEC.cover,
  skipLink: FIGMA_SPEC.skipLink,
  breakpoints: FIGMA_SPEC.breakpoints,
  annotations: FIGMA_SPEC.annotations,
  exports: buildExports(),
  content,
}

const banner = [
  '/* ==========================================================================',
  '   GENERATED FILE — do not edit.',
  '',
  `   Generator: ${rel(new URL(import.meta.url).pathname)}`,
  '   Sources:   design/tokens/tokens.json, brief/CONTENT.md, design/FIGMA-SPEC.md',
  '   Regenerate: node scripts/build-figma-plugin.mjs',
  '',
  '   A Figma plugin sandbox has no filesystem and no network, so every value the',
  '   plugin needs is baked in here. figma-plugin/code.js reads this object and',
  '   contains no colour, no size and no line of copy of its own.',
  '   ========================================================================== */',
  '',
]

const body = `const TURBINE_DATA = ${JSON.stringify(data, null, 2)};\n`
const bundle = banner.join('\n') + body

await writeFile(DATA_OUT, bundle)

/* The §13 files, as bytes the sandbox can hand to figma.createImage. */
const images = {}
for (const file of Object.keys(content.images.all)) {
  let bytes
  try {
    bytes = await readFile(join(ASSETS_IN, file))
  } catch (error) {
    throw new Error(`brief/CONTENT.md §13 lists ${file}, but design/assets/${file} could not be read: ${error.message}`)
  }
  images[file] = bytes.toString('base64')
}
const imagesBody = `const TURBINE_IMAGES = ${JSON.stringify(images, null, 2)};\n`

/* Inject the same bundle into code.js, which is the file Figma actually loads. */
let injected = false
try {
  await access(CODE_OUT)
  const code = await readFile(CODE_OUT, 'utf8')
  const begins = code.split(BEGIN).length - 1
  const ends = code.split(END).length - 1
  if (begins !== 1 || ends !== 1) {
    throw new Error(
      `figma-plugin/code.js must contain exactly one BEGIN and one END marker (found ${begins} and ${ends}). Refusing to write.`
    )
  }
  const head = code.slice(0, code.indexOf(BEGIN) + BEGIN.length)
  const tail = code.slice(code.indexOf(END))
  await writeFile(CODE_OUT, `${head}\n${body}${imagesBody}${tail}`)
  injected = true
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

const counts = {
  colours: tokens.color.length,
  scale: tokens.scale.length,
  sizes: tokens.type.size.length,
  responsive: tokens.responsive.variables.length,
  textStyles: data.textStyles.length,
  artists: content.lineup.artists.length,
  faq: content.faq.items.length,
  exports: data.exports.rows.length,
  bytes: bundle.length,
  images: Object.keys(images).length,
  imageBytes: imagesBody.length,
}

console.log(`wrote ${rel(DATA_OUT)}`)
console.log(
  `  ${counts.colours} colour variables, ${counts.scale} scale variables, ${counts.sizes} type sizes, ` +
    `${counts.responsive} responsive variables`
)
console.log(
  `  ${counts.textStyles} text styles, ${counts.artists} artists, ${counts.faq} questions, ` +
    `${counts.exports} export targets, ${counts.bytes} bytes`
)
console.log(`  ${counts.images} images from design/assets, ${counts.imageBytes} bytes of base64 (code.js only)`)
console.log(injected ? `  injected into ${rel(CODE_OUT)}` : `  ${rel(CODE_OUT)} not present yet — nothing injected`)
