#!/usr/bin/env node
/**
 * Draw the six workflow patterns, in the speaker's dark style.
 *
 *   node scripts/build-pattern-diagrams.mjs
 *
 * One drawing per pattern, and one sheet with all six. Both come from the same panel
 * functions below, so the sheet on the slide and the pictures on the workshop page cannot
 * disagree about what a pattern looks like.
 *
 *   deck/diagrams/08-workflow-patterns.svg        all six, 3 × 2
 *   deck/diagrams/08-pattern-<n>-<slug>.svg       one each, for the workshop page
 */

import { writeFile } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'deck/diagrams')

const C = {
  bg: '#0A0A0A', panel: '#161616', line: '#2E2E2E', fg: '#FFFFFF', fg2: '#D1D5DB', fg3: '#9CA3AF',
  dim: '#6B7280', accent: '#10B981', accent2: '#34D399',
}
const FONT = "Inter, system-ui, -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif"

const PW = 600 // panel width
const PH = 440 // panel height

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// ── primitives, all in panel coordinates ─────────────────────────────────────

const text = (x, y, s, { size = 18, fill = C.fg3, anchor = 'middle', weight = 400 } = {}) =>
  `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}">${esc(s)}</text>`

const circle = (cx, cy, r, { stroke = C.fg2, fill = C.bg, width = 3 } = {}) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`

const box = (x, y, w, h, { stroke = C.fg2, fill = C.bg, width = 3, dash = '' } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`

const diamond = (cx, cy, s, { stroke = C.fg2, fill = C.bg, width = 3 } = {}) =>
  `<polygon points="${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${width}"/>`

/** A straight arrow, trimmed at both ends so it stops at the shapes rather than inside them. */
const arrow = (x1, y1, x2, y2, { from = 0, to = 0, color = C.fg3, width = 2.5, both = false, dash = '' } = {}) => {
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const ax = x1 + ux * from
  const ay = y1 + uy * from
  const bx = x2 - ux * (to + 2)
  const by = y2 - uy * (to + 2)
  const id = markerId(color)
  return `<line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="${bx.toFixed(1)}" y2="${by.toFixed(1)}" stroke="${color}" stroke-width="${width}"${dash ? ` stroke-dasharray="${dash}"` : ''} marker-end="url(#${id})"${both ? ` marker-start="url(#${id}-start)"` : ''}/>`
}

const COLORS = [C.fg3, C.dim, C.accent, C.fg2]
const markerId = (color) => `ah-${COLORS.indexOf(color)}`
const MARKERS = COLORS.map(
  (color, i) =>
    `<marker id="ah-${i}" viewBox="0 0 12 10" refX="11" refY="5" markerWidth="14" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L12 5 L0 10 Z" fill="${color}"/></marker>` +
    `<marker id="ah-${i}-start" viewBox="0 0 12 10" refX="1" refY="5" markerWidth="14" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto"><path d="M12 0 L0 5 L12 10 Z" fill="${color}"/></marker>`,
).join('\n    ')

// ── the six panels ───────────────────────────────────────────────────────────

const PATTERNS = [
  {
    n: 1,
    slug: 'classify-and-act',
    title: 'Classify and act',
    desc: 'A task goes to a classifier, which sends it to exactly one of three specialised agents. The chosen path is highlighted; the other two stay grey.',
    draw: () => [
      box(40, 200, 100, 56), text(90, 235, 'task', { fill: C.fg, size: 20 }),
      arrow(140, 228, 198, 228),
      diamond(240, 228, 42),
      text(240, 300, 'classifier'),
      arrow(282, 228, 440, 130, { to: 26, color: C.dim }),
      arrow(282, 228, 440, 228, { to: 26, color: C.accent, width: 4 }),
      arrow(282, 228, 440, 326, { to: 26, color: C.dim }),
      circle(440, 130, 24, { stroke: C.dim }), text(478, 136, 'agent A', { anchor: 'start', fill: C.fg3 }),
      circle(440, 228, 24, { stroke: C.accent }), text(478, 234, 'agent B', { anchor: 'start', fill: C.fg }),
      circle(440, 326, 24, { stroke: C.dim }), text(478, 332, 'agent C', { anchor: 'start', fill: C.fg3 }),
    ],
  },
  {
    n: 2,
    slug: 'fan-out-and-synthesize',
    title: 'Fan out and synthesize',
    desc: 'A task is split into four parts handled by parallel agents; their results meet at a bar and are merged into one result.',
    draw: () => {
      const ys = [135, 200, 265, 330]
      return [
        box(40, 205, 100, 56), text(90, 240, 'task', { fill: C.fg, size: 20 }),
        ...ys.map((y) => arrow(140, 233, 300, y, { to: 20 })),
        ...ys.map((y) => circle(300, y, 20)),
        ...ys.map((y) => arrow(300, y, 410, 233 + (y - 233) * 0.55, { from: 20, to: 4 })),
        `<rect x="410" y="120" width="10" height="225" rx="5" fill="${C.accent}"/>`,
        arrow(420, 233, 505, 233, { to: 34 }),
        circle(505, 233, 34, { stroke: C.fg }),
        text(505, 300, 'synthesize'),
        text(300, 372, 'parallel agents'),
      ]
    },
  },
  {
    n: 3,
    slug: 'adversarial-verification',
    title: 'Adversarial verification',
    desc: 'One worker produces a result; three independent verifiers with fresh context each try to break it and send findings back.',
    draw: () => {
      const ys = [140, 233, 326]
      return [
        circle(150, 233, 32, { stroke: C.fg }),
        text(150, 296, 'worker'),
        ...ys.map((y) => arrow(150, 233, 460, y, { from: 32, to: 24, both: true, color: C.fg3 })),
        ...ys.map((y) => circle(460, y, 24, { stroke: C.accent })),
        text(460, 104, 'verifiers', { fill: C.accent2 }),
        text(460, 378, 'fresh context, told to attack', { size: 16 }),
      ]
    },
  },
  {
    n: 4,
    slug: 'generate-and-filter',
    title: 'Generate and filter',
    desc: 'Three generators produce six ideas; a filter with a rubric and deduplication keeps the best two and discards the rest.',
    draw: () => {
      const gens = [150, 233, 316]
      const ideas = [118, 164, 210, 256, 302, 348]
      return [
        text(60, 100, 'generators', { anchor: 'start' }),
        ...gens.map((y) => circle(70, y, 20)),
        ...ideas.map((y, i) => arrow(70, gens[Math.floor(i / 2)], 150, y + 14, { from: 20, to: 2 })),
        ...ideas.map((y) => box(152, y, 50, 28, { width: 2.5 })),
        text(177, 396, 'ideas'),
        ...ideas.map((y) => arrow(202, y + 14, 270, 233, { to: 4 })),
        box(272, 190, 150, 86, { stroke: C.accent }),
        text(347, 227, 'filter', { fill: C.accent2, size: 20, weight: 700 }),
        text(347, 254, 'rubric + dedupe', { fill: C.accent2, size: 16 }),
        arrow(422, 215, 482, 160, { to: 2, color: C.accent, width: 3.5 }),
        box(484, 120, 60, 30, { stroke: C.accent }), box(484, 158, 60, 30, { stroke: C.accent }),
        text(514, 106, 'best', { fill: C.fg }),
        arrow(422, 256, 482, 305, { to: 2, color: C.dim, dash: '5 5' }),
        box(484, 300, 60, 30, { stroke: C.dim, dash: '5 5' }),
        text(514, 358, 'discarded'),
      ]
    },
  },
  {
    n: 5,
    slug: 'tournament',
    title: 'Tournament',
    desc: 'Four attempts are compared in pairs by two judges; the two winners meet a final judge, which picks one winner.',
    draw: () => {
      const att = [140, 198, 282, 340]
      return [
        text(55, 112, 'attempts', { anchor: 'start' }),
        ...att.map((y) => circle(75, y, 20)),
        arrow(75, 140, 220, 169, { from: 20, to: 32 }), arrow(75, 198, 220, 169, { from: 20, to: 32 }),
        arrow(75, 282, 220, 311, { from: 20, to: 32 }), arrow(75, 340, 220, 311, { from: 20, to: 32 }),
        diamond(220, 169, 32, { stroke: C.accent }), diamond(220, 311, 32, { stroke: C.accent }),
        text(250, 116, 'pairwise judges', { fill: C.accent2 }),
        arrow(220, 169, 365, 240, { from: 32, to: 32 }), arrow(220, 311, 365, 240, { from: 32, to: 32 }),
        diamond(365, 240, 32, { stroke: C.accent }),
        text(365, 300, 'final'),
        arrow(397, 240, 450, 240, { to: 2 }),
        box(452, 214, 110, 52, { stroke: C.fg }),
        text(507, 247, 'winner', { fill: C.fg, size: 20 }),
      ]
    },
  },
  {
    n: 6,
    slug: 'loop-until-done',
    title: 'Loop until done',
    desc: 'An agent runs, then a check asks whether there are new findings. If yes, another round starts; if no, the loop ends.',
    draw: () => [
      circle(110, 250, 32, { stroke: C.fg }),
      text(110, 312, 'agent'),
      arrow(142, 250, 288, 250),
      diamond(330, 250, 42),
      text(330, 326, 'new findings?'),
      arrow(372, 250, 490, 250, { to: 2 }),
      text(430, 236, 'no'),
      `<rect x="492" y="226" width="48" height="48" fill="${C.fg}"/>`,
      text(516, 312, 'done'),
      `<path d="M330 208 C 300 120, 150 120, 118 206" fill="none" stroke="${C.accent}" stroke-width="3.5" marker-end="url(#${markerId(C.accent)})"/>`,
      text(224, 128, 'yes: another round', { fill: C.accent2 }),
    ],
  },
]

const panel = (p, x, y) => `<g transform="translate(${x} ${y})">
    <rect x="0" y="0" width="${PW}" height="${PH}" rx="14" fill="${C.panel}" stroke="${C.line}" stroke-width="2"/>
    <rect x="28" y="26" width="38" height="38" rx="6" fill="${C.accent}"/>
    ${text(47, 53, String(p.n), { fill: C.bg, size: 22, weight: 700 })}
    ${text(82, 54, p.title, { fill: C.fg, size: 26, weight: 700, anchor: 'start' })}
    <line x1="28" y1="82" x2="${PW - 28}" y2="82" stroke="${C.line}" stroke-width="2"/>
    ${p.draw().join('\n    ')}
  </g>`

const svg = ({ w, h, title, desc, body }) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d">
  <title id="t">${esc(title)}</title>
  <desc id="d">${esc(desc)}</desc>
  <defs>
    ${MARKERS}
  </defs>
  <rect x="0" y="0" width="${w}" height="${h}" fill="${C.bg}"/>
  <g font-family="${FONT}">
  ${body}
  </g>
</svg>
`

// ── write ────────────────────────────────────────────────────────────────────

const GAP = 30
const M = 60
const sheetW = M * 2 + PW * 3 + GAP * 2
const sheetH = 150 + PH * 2 + GAP + M
const sheet = svg({
  w: sheetW,
  h: sheetH,
  title: 'Six workflow patterns',
  desc: PATTERNS.map((p) => `${p.n}. ${p.title}: ${p.desc}`).join(' '),
  body: [
    text(M, 92, 'Six workflow patterns', { fill: C.fg, size: 44, weight: 700, anchor: 'start' }),
    ...PATTERNS.map((p, i) => panel(p, M + (i % 3) * (PW + GAP), 130 + Math.floor(i / 3) * (PH + GAP))),
  ].join('\n  '),
})
await writeFile(join(OUT, '08-workflow-patterns.svg'), sheet)

for (const p of PATTERNS) {
  const file = `08-pattern-${p.n}-${p.slug}.svg`
  await writeFile(join(OUT, file), svg({ w: PW, h: PH, title: p.title, desc: p.desc, body: panel(p, 0, 0) }))
}
console.log(`wrote 08-workflow-patterns.svg (${sheetW} × ${sheetH}) and ${PATTERNS.length} single-pattern drawings`)
