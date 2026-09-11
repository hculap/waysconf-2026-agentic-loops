import { test } from '@playwright/test'
import type { Page } from '@playwright/test'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { Gate, BREAKPOINTS, ROOT } from '../lib/gate'
import { contrastRatio, parseCssColor, toHex } from '../lib/contrast'

/**
 * Tokens gate — AC-26 to AC-33 from brief/ACCEPTANCE.md.
 *
 * This is the gate that turns "the agent used the real design" from a matter of taste
 * into a measurement. Every value it accepts is read out of design/tokens/tokens.json at
 * runtime: there is no palette, no type scale and no spacing scale written down in this
 * file. A verifier that carries its own copy of the thing it verifies will one day
 * disagree with it, and then it is enforcing history instead of the design.
 *
 * Three habits run through the whole file:
 *
 *   1. Nothing aborts. Every criterion collects every defect it can see, so one loop
 *      iteration can fix a whole class of problems rather than one instance of it.
 *   2. Inherited properties — colour and the three font properties — are judged where
 *      text is actually painted and reported where the value is declared. Reading them
 *      off every element would fail <html> for the UA default nothing ever paints, and
 *      reading them only off the elements that change them would miss a wrapper whose
 *      children inherit its mistake.
 *   3. Identical defects are reported once, with the other affected selectors in the
 *      hint, because one bad declaration is one repair.
 */

const gate = new Gate('tokens', 'Design tokens', [
  'AC-26',
  'AC-27',
  'AC-28',
  'AC-29',
  'AC-30',
  'AC-31',
  'AC-32',
  'AC-33',
])

// ── Tokens: the only source of allowed values ─────────────────────────────────

interface DtcgToken {
  $value: unknown
  $type?: string
  $description?: string
}

const TOKENS_PATH = 'design/tokens/tokens.json'
const tokensRaw = JSON.parse(readFileSync(join(ROOT, TOKENS_PATH), 'utf8')) as Record<string, unknown>

/** Walk the DTCG tree and yield every leaf that carries a $value, with its dotted path. */
function* tokenLeaves(node: Record<string, unknown>, path: string[] = []): Generator<[string, DtcgToken]> {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (!value || typeof value !== 'object') continue
    const record = value as Record<string, unknown>
    if ('$value' in record) yield [[...path, key].join('.'), record as unknown as DtcgToken]
    else yield* tokenLeaves(record, [...path, key])
  }
}

function tokenAt(path: string): DtcgToken | null {
  let node: unknown = tokensRaw
  for (const segment of path.split('.')) {
    if (!node || typeof node !== 'object') return null
    node = (node as Record<string, unknown>)[segment]
  }
  return node && typeof node === 'object' && '$value' in (node as Record<string, unknown>)
    ? (node as unknown as DtcgToken)
    : null
}

/** DTCG alias syntax: "{color.bg.base}" points at another token's value. */
function resolveTokenValue(value: unknown, depth = 0): unknown {
  if (typeof value !== 'string' || depth > 8) return value
  const alias = value.match(/^\{([^}]+)\}$/)
  if (!alias || !alias[1]) return value
  const target = tokenAt(alias[1])
  return target ? resolveTokenValue(target.$value, depth + 1) : value
}

/**
 * rem is resolved against 16px, the CSS initial font size, rather than against the page's
 * own root font size. brief/ACCEPTANCE.md fixes the type scale in px — 12, 14, 16, 18, 20,
 * 24, 32, 40, 56, 72, 96 — so a page that moves the root size moves every rem off that
 * scale. That is a real defect and has to be reported as one, not absorbed by a gate that
 * quietly rescales itself to whatever it finds.
 */
const CSS_INITIAL_ROOT_PX = 16

function dimensionToPx(value: unknown): number | null {
  const resolved = resolveTokenValue(value)
  if (typeof resolved === 'number') return resolved
  if (typeof resolved !== 'string') return null
  const match = resolved.trim().match(/^(-?[\d.]+)(px|rem|em)?$/)
  if (!match || !match[1]) return null
  const n = parseFloat(match[1])
  if (Number.isNaN(n)) return null
  return match[2] === 'rem' || match[2] === 'em' ? n * CSS_INITIAL_ROOT_PX : n
}

interface ColourToken {
  path: string
  hex: string
}

function colourTokensUnder(group: string, pick: (t: DtcgToken) => unknown): ColourToken[] {
  const node = tokensRaw[group]
  if (!node || typeof node !== 'object') return []
  const out: ColourToken[] = []
  for (const [path, token] of tokenLeaves(node as Record<string, unknown>, [group])) {
    const value = resolveTokenValue(pick(token))
    if (typeof value !== 'string') continue
    const parsed = parseCssColor(value)
    if (parsed) out.push({ path, hex: toHex(parsed) })
  }
  // Sorted so two tokens that share a hex always produce the same "nearest token"
  // answer. A gate that names a different token on the second run is a gate people
  // stop believing.
  return out.sort((a, b) => a.path.localeCompare(b.path))
}

/** Every colour CANON fixes. Legal on any painted property. */
const PALETTE = colourTokensUnder('color', (t) => t.$value)

/**
 * The shadow group is an implementation extension (tokens.json meta.extension) and its
 * colours are plain black at low alpha. They are accepted inside box-shadow only: folding
 * them into the palette would quietly make #000000 a legal text colour.
 */
const SHADOW_COLOURS = colourTokensUnder('shadow', (t) => {
  const v = t.$value
  return v && typeof v === 'object' ? (v as Record<string, unknown>)['color'] : null
})

const typographyNode = (tokensRaw['typography'] as Record<string, unknown> | undefined) ?? {}

const TYPE_SCALE_PX = [...tokenLeaves(typographyNode, ['typography'])]
  .filter(([path]) => path.startsWith('typography.fontSize.'))
  .map(([, token]) => dimensionToPx(token.$value))
  .filter((n): n is number => n !== null)
  .sort((a, b) => a - b)

const SPACING_SCALE_PX = [...tokenLeaves((tokensRaw['spacing'] as Record<string, unknown>) ?? {}, ['spacing'])]
  .map(([, token]) => dimensionToPx(token.$value))
  .filter((n): n is number => n !== null)
  .sort((a, b) => a - b)

const RADIUS_SCALE_PX = [...tokenLeaves((tokensRaw['radius'] as Record<string, unknown>) ?? {}, ['radius'])]
  .map(([, token]) => dimensionToPx(token.$value))
  .filter((n): n is number => n !== null)
  .sort((a, b) => a - b)

interface FamilyToken {
  /** Token key: display, body, mono. */
  key: string
  /** Head of the declared stack, which is the family that actually gets used. */
  head: string
  weights: number[]
}

function readFontFamilies(): FamilyToken[] {
  const families = typographyNode['fontFamily'] as Record<string, unknown> | undefined
  if (!families) return []
  const out: FamilyToken[] = []
  for (const [key, value] of Object.entries(families)) {
    if (key.startsWith('$') || !value || typeof value !== 'object') continue
    const stack = (value as DtcgToken).$value
    const head = Array.isArray(stack) ? String(stack[0] ?? '') : String(stack ?? '')
    if (head) out.push({ key, head: head.replace(/^['"]|['"]$/g, ''), weights: [] })
  }
  return out
}

/**
 * CANON §5 allows a different set of weights per family — Space Grotesk 500/700, Inter
 * 400/500/600, JetBrains Mono 400/700. tokens.json carries that mapping only inside each
 * weight token's $description ("Available in body and mono."), so it is parsed from there
 * rather than retyped here. If the parse comes up empty the gate says so in a note and
 * narrows to the union of declared weights: less than the criterion asks for, but stated
 * out loud instead of silently skipped.
 */
function readFontWeights(families: FamilyToken[]): { perFamilyDerived: boolean; allWeights: number[] } {
  const weights = typographyNode['fontWeight'] as Record<string, unknown> | undefined
  const allWeights: number[] = []
  if (weights) {
    for (const [key, value] of Object.entries(weights)) {
      if (key.startsWith('$') || !value || typeof value !== 'object') continue
      const token = value as DtcgToken
      const weight = typeof token.$value === 'number' ? token.$value : parseInt(String(token.$value), 10)
      if (Number.isNaN(weight)) continue
      allWeights.push(weight)
      const available = String(token.$description ?? '').match(/available in ([^.]+)/i)
      if (!available || !available[1]) continue
      for (const family of families) {
        if (new RegExp(`\\b${family.key}\\b`, 'i').test(available[1])) family.weights.push(weight)
      }
    }
  }
  for (const family of families) family.weights.sort((a, b) => a - b)
  return {
    perFamilyDerived: families.length > 0 && families.every((f) => f.weights.length > 0),
    allWeights: allWeights.sort((a, b) => a - b),
  }
}

const FONT_FAMILIES = readFontFamilies()
const { perFamilyDerived: PER_FAMILY_WEIGHTS, allWeights: ALL_WEIGHTS } = readFontWeights(FONT_FAMILIES)

const LAYOUT_MAX_WIDTH = dimensionToPx(tokenAt('layout.maxWidth')?.$value) ?? 1200
const GUTTER_MOBILE = dimensionToPx(tokenAt('layout.gutter.mobile')?.$value) ?? 24
const GUTTER_DESKTOP = dimensionToPx(tokenAt('layout.gutter.desktop')?.$value) ?? 48

const MUTED = PALETTE.find((c) => c.path === 'color.text.muted')
const SECONDARY = PALETTE.find((c) => c.path === 'color.text.secondary')
const SODIUM = PALETTE.find((c) => c.path === 'color.accent.sodium')
const BG_BASE = PALETTE.find((c) => c.path === 'color.bg.base')

const MOBILE = BREAKPOINTS.find((b) => b.name === 'mobile') ?? BREAKPOINTS[0]!
const DESKTOP = BREAKPOINTS.find((b) => b.name === 'desktop') ?? BREAKPOINTS[BREAKPOINTS.length - 1]!

/** Sub-pixel rounding tolerance, fixed by AC-32. Reused for the container geometry. */
const TOLERANCE_PX = 0.5

const px = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100))

// ── Failure grouping ──────────────────────────────────────────────────────────

interface DefectDetail {
  message: string
  expected?: string | number
  actual?: string | number
  hint?: string
}

interface DefectRecord {
  selectors: string[]
  breakpoints: Set<string>
  detail: (selector: string) => DefectDetail
}

/**
 * One defect, however many elements and breakpoints show it. The key decides what counts
 * as the same defect: always the wrong value plus the place it is declared, never the
 * element that merely inherited it.
 */
class DefectLog {
  private readonly byKey = new Map<string, DefectRecord>()

  add(key: string, selector: string, breakpoint: string, detail: DefectRecord['detail']): void {
    const existing = this.byKey.get(key)
    if (existing) {
      if (!existing.selectors.includes(selector)) existing.selectors.push(selector)
      existing.breakpoints.add(breakpoint)
      return
    }
    this.byKey.set(key, { selectors: [selector], breakpoints: new Set([breakpoint]), detail })
  }

  flushInto(criterion: string, limit = 40): void {
    const records = [...this.byKey.entries()].sort(([a], [b]) => a.localeCompare(b))
    for (const [, record] of records.slice(0, limit)) {
      const first = record.selectors[0] ?? 'unknown element'
      const detail = record.detail(first)
      const others = record.selectors.slice(1)
      const alsoOn = others.length
        ? `Also on ${others.length} more element${others.length === 1 ? '' : 's'}: ${others.slice(0, 5).join(', ')}${others.length > 5 ? ', ...' : ''}`
        : ''
      const widths = [...record.breakpoints].sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      gate.fail({
        criterion,
        message: detail.message,
        where: `${first} @ ${widths.join(', ')}`,
        expected: detail.expected,
        actual: detail.actual,
        hint: [detail.hint, alsoOn].filter(Boolean).join(' ') || undefined,
      })
    }
    if (records.length > limit) {
      gate.fail({
        criterion,
        message: `${records.length - limit} further distinct ${criterion} defects were found and are not listed individually.`,
        hint: 'Fix the ones above and re-run; the rest will be printed once there is room for them.',
      })
    }
  }
}

// ── Colour helpers ────────────────────────────────────────────────────────────

interface ParsedColour {
  hex: string
  alpha: number
}

/** A value the gate is not expected to resolve: it names a paint server, not a colour. */
const NOT_A_COLOUR = /^(none|url\(|context-|inherit|initial|unset|currentcolor)/i

function readColour(reading: ColourReading): ParsedColour | null {
  if (!reading.srgb) return null
  const parsed = parseCssColor(reading.srgb)
  if (!parsed) return null
  return { hex: toHex(parsed), alpha: parsed.a }
}

/**
 * Nearest palette entry, by the redmean distance approximation. Plain RGB distance names a
 * technically closest swatch that often looks nothing like the offending colour, and the
 * whole point of naming a token in the message is that the repair should be obvious.
 */
function nearestToken(hex: string, palette: ColourToken[]): ColourToken | null {
  const target = parseCssColor(hex)
  if (!target || palette.length === 0) return null
  let best: ColourToken | null = null
  let bestDistance = Number.POSITIVE_INFINITY
  for (const token of palette) {
    const candidate = parseCssColor(token.hex)
    if (!candidate) continue
    const rMean = (target.r + candidate.r) / 2
    const dr = target.r - candidate.r
    const dg = target.g - candidate.g
    const db = target.b - candidate.b
    const distance = Math.sqrt((2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db)
    if (distance < bestDistance) {
      bestDistance = distance
      best = token
    }
  }
  return best
}

function nearest(value: number, scale: number[]): number {
  return scale.reduce((closest, n) => (Math.abs(n - value) < Math.abs(closest - value) ? n : closest), scale[0] ?? value)
}

/**
 * `padding: 10px` reaches the computed style as four identical longhands, and reporting it
 * four times describes one mistake as four repairs. Where every side of a group carries the
 * same value, the group is reported under the shorthand the author actually wrote.
 */
const LONGHAND_GROUPS: { shorthand: string; sides: string[] }[] = [
  { shorthand: 'margin', sides: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'] },
  { shorthand: 'padding', sides: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] },
  { shorthand: 'gap', sides: ['row-gap', 'column-gap'] },
  {
    shorthand: 'border-radius',
    sides: [
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ],
  },
  {
    shorthand: 'border-color',
    sides: ['border-top-color', 'border-right-color', 'border-bottom-color', 'border-left-color'],
  },
]

function collapseLonghands<T>(values: Record<string, T>, same: (a: T, b: T) => boolean): Record<string, T> {
  const out: Record<string, T> = { ...values }
  for (const group of LONGHAND_GROUPS) {
    const present = group.sides.filter((side) => side in out)
    if (present.length !== group.sides.length) continue
    const first = out[group.sides[0] as string] as T
    if (!group.sides.every((side) => same(out[side] as T, first))) continue
    for (const side of group.sides) delete out[side]
    out[group.shorthand] = first
  }
  return out
}

const collapseBoxLonghands = (values: Record<string, string>) => collapseLonghands(values, (a, b) => a === b)

const collapseColourLonghands = (values: Record<string, ColourReading>) =>
  collapseLonghands(values, (a, b) => a.srgb === b.srgb && a.raw === b.raw)

// ── The page snapshot ─────────────────────────────────────────────────────────

/** An element that paints text, with the origin of each inherited value it uses. */
interface TextPaint {
  sel: string
  color: ColourReading
  colorOrigin: string
  fontFamily: string
  fontFamilyOrigin: string
  fontWeight: string
  fontWeightOrigin: string
  fontSize: string
  fontSizeOrigin: string
  inLegal: boolean
  effectiveBg: ColourReading | null
  effectiveBgHasImage: boolean
}

/**
 * One painted colour. `srgb` is the value converted to sRGB by the browser itself; `raw`
 * is what the computed style said. They differ whenever the page paints in a colour space
 * that is not sRGB — Tailwind 4's default palette is oklch — and `srgb` is empty when even
 * the browser could not resolve the value, which is a reportable fact, not a skip.
 */
interface ColourReading {
  srgb: string
  raw: string
}

/** An element, with the colours it paints itself and the box values it was told to use. */
interface ElementSnapshot {
  sel: string
  /** Non-inherited painted colours, keyed by the CSS property AC-26 names. */
  colours: Record<string, ColourReading>
  shadowColours: ColourReading[]
  /** Declared, non-initial box values: property -> computed value. */
  box: Record<string, string>
}

interface ContainerSnapshot {
  sel: string
  width: number
  left: number
  maxWidth: number | null
  paddingLeft: number
  paddingRight: number
  boxSizing: string
}

interface PageSnapshot {
  elements: ElementSnapshot[]
  texts: TextPaint[]
  containers: ContainerSnapshot[]
  rootFontSizePx: number
  direction: string
  writingMode: string
  stylesheets: { total: number; inaccessible: number; declaringRules: number }
}

/**
 * Everything the gate needs from one rendered page, read in a single pass.
 *
 * The subtle part is `box`. AC-32 must ignore sizes "produced by flex or grid distribution
 * rather than declared", so the collector works out which box properties the stylesheets
 * actually declare for an element — by walking the CSSOM and matching selectors — and
 * reports the computed value only for those. Distribution (space-between, stretch, fr
 * tracks, alignment) never appears as a declaration, so it is excluded by construction.
 * Auto margins are the one case that is both declared and distributed, and they are
 * dropped explicitly.
 */
async function readSnapshot(page: Page): Promise<PageSnapshot> {
  return page.evaluate(() => {
    const PHYSICAL_BOX_PROPS = [
      'margin-top',
      'margin-right',
      'margin-bottom',
      'margin-left',
      'padding-top',
      'padding-right',
      'padding-bottom',
      'padding-left',
      'row-gap',
      'column-gap',
      'border-top-left-radius',
      'border-top-right-radius',
      'border-bottom-right-radius',
      'border-bottom-left-radius',
    ]

    // The CSSOM reports `margin-inline: auto` as margin-inline-start/end and never as
    // margin-left/right, so logical longhands have to be mapped by hand. The mapping
    // assumes horizontal-tb and ltr; the snapshot reports both so the gate can say so
    // rather than assume it.
    const LOGICAL_BOX_PROPS: Record<string, string> = {
      'margin-inline-start': 'margin-left',
      'margin-inline-end': 'margin-right',
      'margin-block-start': 'margin-top',
      'margin-block-end': 'margin-bottom',
      'padding-inline-start': 'padding-left',
      'padding-inline-end': 'padding-right',
      'padding-block-start': 'padding-top',
      'padding-block-end': 'padding-bottom',
      'border-start-start-radius': 'border-top-left-radius',
      'border-start-end-radius': 'border-top-right-radius',
      'border-end-start-radius': 'border-bottom-left-radius',
      'border-end-end-radius': 'border-bottom-right-radius',
    }

    // Rules that only apply in a state this gate is not driving. Their declarations say
    // nothing about the page at rest, and counting them would attribute a hover padding to
    // an element that is not hovered.
    const STATE_SELECTOR = /:(?:hover|focus|focus-visible|focus-within|active|target|visited|checked|disabled|placeholder-shown)\b/

    const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'HEAD', 'TEMPLATE', 'NOSCRIPT', 'BASE'])
    const SVG_NS = 'http://www.w3.org/2000/svg'

    interface AnyRule {
      style?: CSSStyleDeclaration
      selectorText?: string
      cssRules?: CSSRuleList
      media?: MediaList
      conditionText?: string
    }

    interface DeclaringRule {
      sel: string
      props: Record<string, string>
      conditionMatches: boolean
    }

    const declaringRules: DeclaringRule[] = []
    let inaccessibleSheets = 0
    let totalSheets = 0

    const groupMatches = (rule: AnyRule): boolean => {
      if (rule.media) {
        try {
          return window.matchMedia(rule.media.mediaText).matches
        } catch {
          return true
        }
      }
      if (rule.conditionText && typeof CSS !== 'undefined' && typeof CSS.supports === 'function') {
        try {
          return CSS.supports(rule.conditionText)
        } catch {
          return true
        }
      }
      return true
    }

    // A nested rule's selectorText is relative ("&:hover"), which querySelectorAll cannot
    // resolve. Rewriting & as :is(parent) keeps the match honest; a nested selector with no
    // & is a descendant of its parent.
    const resolveNested = (selector: string, parent: string | null): string => {
      if (!parent) return selector
      return selector
        .split(',')
        .map((part) => {
          const trimmed = part.trim()
          return trimmed.includes('&') ? trimmed.replace(/&/g, `:is(${parent})`) : `:is(${parent}) ${trimmed}`
        })
        .join(', ')
    }

    const collectProps = (style: CSSStyleDeclaration): Record<string, string> | null => {
      const props: Record<string, string> = {}
      for (const name of Array.from(style)) {
        const physical = PHYSICAL_BOX_PROPS.indexOf(name) >= 0 ? name : LOGICAL_BOX_PROPS[name]
        if (!physical) continue
        // A shorthand written with var() stores the longhand names but no longhand value,
        // so this string is often empty. That is fine: the value itself is read from the
        // computed style later, and the raw string is only needed to spot `auto`.
        props[physical] = style.getPropertyValue(name).trim()
      }
      return Object.keys(props).length ? props : null
    }

    const walkRules = (rules: CSSRuleList, parentSelector: string | null, conditionMatches: boolean): void => {
      for (const raw of Array.from(rules)) {
        const rule = raw as unknown as AnyRule
        let selector = parentSelector
        if (rule.style && typeof rule.selectorText === 'string') {
          selector = resolveNested(rule.selectorText, parentSelector)
          if (!STATE_SELECTOR.test(selector) && selector.indexOf('::') === -1) {
            const props = collectProps(rule.style)
            if (props) declaringRules.push({ sel: selector, props, conditionMatches })
          }
        }
        if (rule.cssRules && rule.cssRules.length) {
          const childCondition = rule.style ? conditionMatches : conditionMatches && groupMatches(rule)
          walkRules(rule.cssRules, selector, childCondition)
        }
      }
    }

    for (const sheet of Array.from(document.styleSheets)) {
      totalSheets++
      try {
        walkRules(sheet.cssRules, null, true)
      } catch {
        // Cross-origin stylesheet. Counted, never shrugged off: the gate reports it.
        inaccessibleSheets++
      }
    }

    interface DeclaredEntry {
      declared: boolean
      auto: boolean
    }

    const declaredByElement = new Map<Element, Record<string, DeclaredEntry>>()
    const markDeclared = (el: Element, prop: string, raw: string, conditionMatches: boolean) => {
      let record = declaredByElement.get(el)
      if (!record) {
        record = {}
        declaredByElement.set(el, record)
      }
      const entry = record[prop] ?? { declared: false, auto: false }
      entry.declared = true
      // Only an `auto` that can apply right now excludes the property. An auto margin in a
      // media query that does not match is not what produced the value on screen.
      if (conditionMatches && /(^|\s)auto(\s|$)/.test(raw)) entry.auto = true
      record[prop] = entry
    }

    for (const rule of declaringRules) {
      let nodes: NodeListOf<Element>
      try {
        nodes = document.querySelectorAll(rule.sel)
      } catch {
        continue
      }
      for (const node of Array.from(nodes)) {
        for (const prop of Object.keys(rule.props)) {
          markDeclared(node, prop, rule.props[prop] ?? '', rule.conditionMatches)
        }
      }
    }

    const styleCache = new Map<Element, CSSStyleDeclaration>()
    const styleOf = (el: Element): CSSStyleDeclaration => {
      let cs = styleCache.get(el)
      if (!cs) {
        cs = getComputedStyle(el)
        styleCache.set(el, cs)
      }
      return cs
    }

    const cssPath = (el: Element): string => {
      if (el === document.body) return 'body'
      if (el === document.documentElement) return 'html'
      const parts: string[] = []
      let node: Element | null = el
      while (node && node !== document.body && parts.length < 5) {
        if (node.id) {
          parts.unshift(`#${node.id}`)
          break
        }
        const section = node.getAttribute('data-section')
        if (section) {
          parts.unshift(`[data-section="${section}"]`)
          break
        }
        let part = node.tagName.toLowerCase()
        const classes = (node.getAttribute('class') ?? '').trim().split(/\s+/).filter(Boolean)
        // Tailwind class soup makes a class-based selector unreadable, so only a plain
        // component-looking class earns a place in the path.
        const named = classes.find((c) => /^[a-z][a-z0-9-]{1,23}$/i.test(c))
        if (named) part += `.${named}`
        const current: Element = node
        const parent: Element | null = node.parentElement
        if (parent) {
          const siblings = Array.from(parent.children).filter((c) => c.tagName === current.tagName)
          if (siblings.length > 1) part += `:nth-of-type(${siblings.indexOf(current) + 1})`
        }
        parts.unshift(part)
        node = node.parentElement
      }
      return parts.join(' > ')
    }

    /**
     * Colour values reach Node as sRGB, converted by the engine that paints them.
     *
     * Chromium keeps a computed colour in the space it was written in: oklch(), oklab(),
     * lch() and color(srgb ...) all survive into getComputedStyle, and Tailwind 4's default
     * palette is oklch throughout. A Node-side parser that only understands hex and rgb()
     * would skip every one of them, and skipping is indistinguishable from passing. A 1x1
     * canvas is the browser's own converter and gets the exact bytes the page paints.
     */
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    // Any colour that is not this one leaves fillStyle changed; a value the engine rejects
    // leaves it untouched, which is how an unparseable value is detected rather than
    // mistaken for black.
    const SENTINEL = '#010203'
    const PLAIN_COLOUR = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|transparent)$/i

    const toSrgb = (value: string): string => {
      const v = value.trim()
      if (!v) return ''
      if (PLAIN_COLOUR.test(v)) return v
      if (!ctx) return ''
      ctx.fillStyle = SENTINEL
      try {
        ctx.fillStyle = v
      } catch {
        return ''
      }
      if (ctx.fillStyle === SENTINEL && v.replace(/\s+/g, '').toLowerCase() !== SENTINEL) return ''
      ctx.clearRect(0, 0, 1, 1)
      ctx.fillRect(0, 0, 1, 1)
      const data = ctx.getImageData(0, 0, 1, 1).data
      return `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${((data[3] ?? 255) / 255).toFixed(3)})`
    }

    const readColour = (value: string): ColourReading => ({ srgb: toSrgb(value), raw: value.trim() })

    const isTransparent = (reading: ColourReading): boolean => {
      const value = reading.srgb || reading.raw
      const match = value.match(/rgba?\(([^)]+)\)/)
      if (!match || !match[1]) return value.trim() === 'transparent'
      const parts = match[1].replace(/\//g, ' ').split(/[\s,]+/).filter(Boolean)
      return parts.length > 3 && parseFloat(parts[3] as string) === 0
    }

    /**
     * Computed box-shadow serialises each layer with its colour first, but the colour may be
     * any CSS colour function, so the layers are tokenised and every token the engine
     * accepts as a colour is returned. Lengths and the `inset` keyword are rejected by the
     * same test, which is why it can be applied blindly.
     */
    const shadowColours = (shadow: string): ColourReading[] => {
      const out: ColourReading[] = []
      let depth = 0
      let token = ''
      const tokens: string[] = []
      for (const char of shadow) {
        if (char === '(') depth++
        if (char === ')') depth--
        if (depth === 0 && (char === ' ' || char === ',')) {
          if (token) tokens.push(token)
          token = ''
          continue
        }
        token += char
      }
      if (token) tokens.push(token)
      for (const candidate of tokens) {
        if (/^-?[\d.]/.test(candidate) || candidate === 'inset' || candidate === 'none') continue
        const srgb = toSrgb(candidate)
        if (srgb) out.push({ srgb, raw: candidate })
      }
      return out
    }

    /**
     * The element a computed value comes from: walk up while the parent computes the same
     * value. That is where the declaration lives, and therefore where the repair goes.
     */
    const originOf = (el: Element, property: string): Element => {
      const value = styleOf(el).getPropertyValue(property)
      let node: Element = el
      while (node.parentElement && styleOf(node.parentElement).getPropertyValue(property) === value) {
        node = node.parentElement
      }
      return node
    }

    const elements: ElementSnapshot[] = []
    const texts: TextPaint[] = []

    const all: Element[] = [document.documentElement, document.body, ...Array.from(document.body.querySelectorAll('*'))]

    for (const el of all) {
      if (SKIP_TAGS.has(el.tagName.toUpperCase())) continue
      const cs = styleOf(el)

      const colours: Record<string, ColourReading> = {}
      const background = readColour(cs.backgroundColor)
      if (!isTransparent(background)) colours['background-color'] = background

      // A border colour is only painted if there is a border to paint. Chromium reports the
      // resolved currentColor for a zero-width, style:none border on every element on the
      // page, and reporting those would bury every real defect.
      for (const side of ['top', 'right', 'bottom', 'left']) {
        const width = parseFloat(cs.getPropertyValue(`border-${side}-width`))
        const style = cs.getPropertyValue(`border-${side}-style`)
        if (width > 0 && style !== 'none' && style !== 'hidden') {
          colours[`border-${side}-color`] = readColour(cs.getPropertyValue(`border-${side}-color`))
        }
      }

      if (parseFloat(cs.outlineWidth) > 0 && cs.outlineStyle !== 'none') {
        colours['outline-color'] = readColour(cs.outlineColor)
      }

      // fill and stroke are read for SVG elements only: a plain div comes back as
      // fill rgb(0, 0, 0), the initial value, which is painted on nothing.
      if (el.namespaceURI === SVG_NS) {
        if (cs.fill && cs.fill !== 'none') colours['fill'] = readColour(cs.fill)
        const strokeWidth = parseFloat(cs.strokeWidth)
        if (cs.stroke && cs.stroke !== 'none' && (Number.isNaN(strokeWidth) || strokeWidth > 0)) {
          colours['stroke'] = readColour(cs.stroke)
        }
      }

      const box: Record<string, string> = {}
      const declared = declaredByElement.get(el) ?? {}
      // Inline styles are part of the cascade too and never show up in the CSSOM scan.
      if (el instanceof HTMLElement) {
        for (const name of Array.from(el.style)) {
          const physical = PHYSICAL_BOX_PROPS.indexOf(name) >= 0 ? name : LOGICAL_BOX_PROPS[name]
          if (!physical) continue
          const raw = el.style.getPropertyValue(name).trim()
          const entry = declared[physical] ?? { declared: false, auto: false }
          entry.declared = true
          if (/(^|\s)auto(\s|$)/.test(raw)) entry.auto = true
          declared[physical] = entry
        }
      }
      for (const [prop, entry] of Object.entries(declared)) {
        if (!entry.declared || entry.auto) continue
        const value = cs.getPropertyValue(prop).trim()
        if (!value || value === 'normal' || value === 'auto') continue
        if (parseFloat(value) === 0) continue
        box[prop] = value
      }

      elements.push({
        sel: cssPath(el),
        colours,
        shadowColours: cs.boxShadow && cs.boxShadow !== 'none' ? shadowColours(cs.boxShadow) : [],
        box,
      })

      // Does this element paint text of its own? Child text nodes, or a form control that
      // renders its value or placeholder. Anything else inherits colour and type for
      // nothing, and judging it would fail <html> for a UA default nobody can see.
      const tag = el.tagName.toUpperCase()
      const control = el as HTMLInputElement
      const paintsText =
        Array.from(el.childNodes).some((n) => n.nodeType === Node.TEXT_NODE && (n.textContent ?? '').trim().length > 0) ||
        ((tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') &&
          ((control.value ?? '').length > 0 || (control.placeholder ?? '').length > 0))

      if (!paintsText) continue

      let effectiveBg: ColourReading | null = null
      let effectiveBgHasImage = false
      for (let node: Element | null = el; node; node = node.parentElement) {
        const style = styleOf(node)
        if (style.backgroundImage && style.backgroundImage !== 'none') effectiveBgHasImage = true
        const nodeBackground = readColour(style.backgroundColor)
        if (!isTransparent(nodeBackground)) {
          effectiveBg = nodeBackground
          break
        }
      }

      texts.push({
        sel: cssPath(el),
        color: readColour(cs.color),
        colorOrigin: cssPath(originOf(el, 'color')),
        fontFamily: cs.fontFamily,
        fontFamilyOrigin: cssPath(originOf(el, 'font-family')),
        fontWeight: cs.fontWeight,
        fontWeightOrigin: cssPath(originOf(el, 'font-weight')),
        fontSize: cs.fontSize,
        fontSizeOrigin: cssPath(originOf(el, 'font-size')),
        inLegal: !!el.closest('[data-legal]'),
        effectiveBg,
        effectiveBgHasImage,
      })
    }

    // Container candidates. An element counts if it is width-constrained (a finite px
    // max-width) or optically centred inside its parent with a gap on both sides — the two
    // ways a content band is actually built. A band nested inside another band is dropped,
    // so a 60ch paragraph inside the page container is never mistaken for the container.
    interface ContainerCandidate extends ContainerSnapshot {
      el: Element
    }

    const candidateSet = new Set<Element>()
    const candidates: ContainerCandidate[] = []

    for (const el of Array.from(document.body.querySelectorAll('*'))) {
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0) continue
      const cs = styleOf(el)
      if (cs.display === 'inline') continue
      const maxWidthRaw = cs.maxWidth
      const maxWidth = maxWidthRaw.endsWith('px') ? parseFloat(maxWidthRaw) : null

      let centred = false
      const parent = el.parentElement
      if (parent) {
        const parentRect = parent.getBoundingClientRect()
        const parentCs = styleOf(parent)
        const innerLeft = parentRect.left + (parseFloat(parentCs.paddingLeft) || 0)
        const innerRight = parentRect.right - (parseFloat(parentCs.paddingRight) || 0)
        const gapLeft = rect.left - innerLeft
        const gapRight = innerRight - rect.right
        centred = gapLeft > 1 && gapRight > 1 && Math.abs(gapLeft - gapRight) < 1
      }

      if (maxWidth === null && !centred) continue
      candidateSet.add(el)
      candidates.push({
        el,
        sel: cssPath(el),
        width: rect.width,
        left: rect.left,
        maxWidth,
        paddingLeft: parseFloat(cs.paddingLeft) || 0,
        paddingRight: parseFloat(cs.paddingRight) || 0,
        boxSizing: cs.boxSizing,
      })
    }

    const containers: ContainerSnapshot[] = candidates
      .filter((c) => {
        for (let node = c.el.parentElement; node; node = node.parentElement) {
          if (candidateSet.has(node)) return false
        }
        return true
      })
      .map(({ el: _el, ...rest }) => rest)

    const rootCs = styleOf(document.documentElement)

    return {
      elements,
      texts,
      containers,
      rootFontSizePx: parseFloat(rootCs.fontSize),
      direction: rootCs.direction,
      writingMode: rootCs.writingMode,
      stylesheets: { total: totalSheets, inaccessible: inaccessibleSheets, declaringRules: declaringRules.length },
    }
  })
}

// ── AC-26: every painted colour is in the palette ─────────────────────────────

function checkPaintedColours(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  const offPalette = (property: string, hex: string, selector: string, palette: ColourToken[]) => {
    const near = nearestToken(hex, palette)
    log.add(`${property}|${hex}`, selector, breakpoint, (sel) => ({
      message:
        `off-palette colour ${hex} on ${sel} (${property}). ` +
        `Nearest token: ${near ? `${near.path} ${near.hex}` : `none — ${TOKENS_PATH} declares no colours`}`,
      expected: near ? `${near.path} (${near.hex})` : `a colour from ${TOKENS_PATH}`,
      actual: hex,
      hint: `Every colour the page paints must appear in ${TOKENS_PATH}.`,
    }))
  }

  /**
   * A value neither the browser nor this gate could turn into an sRGB colour is reported,
   * not skipped. "The gate could not read it" and "the gate read it and it was fine" are
   * different facts, and only one of them is a pass.
   */
  const unresolved = (property: string, reading: ColourReading, selector: string) => {
    if (NOT_A_COLOUR.test(reading.raw)) return
    log.add(`unresolved|${property}|${reading.raw}`, selector, breakpoint, (sel) => ({
      message: `colour "${reading.raw}" on ${sel} (${property}) could not be resolved to an sRGB colour, so it could not be checked against the palette.`,
      expected: `a colour from ${TOKENS_PATH}`,
      actual: reading.raw,
      hint: 'This is reported rather than ignored: an unreadable value is not a passing one.',
    }))
  }

  const judge = (property: string, reading: ColourReading, selector: string, palette: ColourToken[]) => {
    const colour = readColour(reading)
    if (!colour) {
      unresolved(property, reading, selector)
      return
    }
    if (colour.alpha === 0) return
    if (palette.some((t) => t.hex === colour.hex)) return
    offPalette(property, colour.hex, selector, palette)
  }

  for (const el of snapshot.elements) {
    for (const [property, reading] of Object.entries(collapseColourLonghands(el.colours))) {
      judge(property, reading, el.sel, PALETTE)
    }
    // A shadow may use a palette colour or one of the derived shadow tokens.
    for (const reading of el.shadowColours) {
      judge('box-shadow', reading, el.sel, [...PALETTE, ...SHADOW_COLOURS])
    }
  }

  // `color` is judged only where text is painted, and keyed by where it is declared.
  for (const text of snapshot.texts) {
    judge('color', text.color, text.colorOrigin, PALETTE)
  }
}

// ── AC-27: no colour literal outside the token layer ──────────────────────────

/** Generated from tokens.json by scripts/build-theme.mjs: the intended bridge, not a choice. */
const TOKEN_LAYER = ['src/styles/theme.generated.css']

const TEXT_EXTENSIONS = new Set([
  '.astro',
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.css',
  '.scss',
  '.json',
  '.svg',
  '.html',
  '.md',
  '.txt',
])

function listSourceFiles(dir: string, acc: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return acc
  }
  for (const entry of entries.sort()) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) listSourceFiles(full, acc)
    else if (TEXT_EXTENSIONS.has(entry.slice(entry.lastIndexOf('.')).toLowerCase())) acc.push(full)
  }
  return acc
}

/** `href="#tickets"` and `url(#gradient)` are fragment references, not colours. */
const FRAGMENT_CONTEXT = /(?:href|xlink:href|src|action|formaction)\s*=\s*["'`]?$|url\(\s*["']?$/i

function checkColourLiterals(): { scanned: number; found: number } {
  const files = listSourceFiles(join(ROOT, 'src'))
  const literals: { file: string; line: number; value: string }[] = []

  for (const file of files) {
    const rel = relative(ROOT, file).split(sep).join('/')
    if (TOKEN_LAYER.includes(rel)) continue
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        for (const match of line.matchAll(/#([0-9a-fA-F]+)\b/g)) {
          const digits = match[1] ?? ''
          if (![3, 4, 6, 8].includes(digits.length)) continue
          if (FRAGMENT_CONTEXT.test(line.slice(0, match.index))) continue
          literals.push({ file: rel, line: index + 1, value: match[0] })
        }
        for (const match of line.matchAll(/\b(rgba?|hsla?)\s*\(/gi)) {
          literals.push({ file: rel, line: index + 1, value: `${match[1]}(` })
        }
      })
  }

  const LIMIT = 30
  for (const literal of literals.slice(0, LIMIT)) {
    gate.fail({
      criterion: 'AC-27',
      message: `hard-coded colour ${literal.value} in ${literal.file}:${literal.line}. Colours may only be declared in ${TOKENS_PATH}`,
      where: `${literal.file}:${literal.line}`,
      expected: `a token from ${TOKENS_PATH}, referenced as var(--color-...)`,
      actual: literal.value,
    })
  }
  if (literals.length > LIMIT) {
    gate.fail({
      criterion: 'AC-27',
      message: `${literals.length - LIMIT} further colour literals in src/ are not listed individually.`,
      hint: `Files affected: ${[...new Set(literals.slice(LIMIT).map((l) => l.file))].join(', ')}`,
    })
  }

  return { scanned: files.length, found: literals.length }
}

// ── AC-28: text.muted only inside [data-legal] ────────────────────────────────

function checkMutedUsage(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  const muted = MUTED
  if (!muted) return
  const secondary = SECONDARY?.hex ?? 'color.text.secondary'

  for (const text of snapshot.texts) {
    if (text.inLegal) continue
    const colour = readColour(text.color)
    if (!colour || colour.hex !== muted.hex) continue
    log.add(`muted|${text.colorOrigin}`, text.sel, breakpoint, (sel) => ({
      message:
        `color.text.muted (${muted.hex}) used on ${sel} outside the footer legal block. ` +
        `Supporting copy uses color.text.secondary (${secondary})`,
      expected: `color.text.secondary ${secondary}`,
      actual: `color.text.muted ${muted.hex}`,
      hint:
        `${muted.hex} measures 4.07:1 on bg.base and fails as body text; it is permitted only inside [data-legal]. ` +
        `Declared on ${text.colorOrigin}.`,
    }))
  }
}

// ── AC-29: text on accent.sodium is bg.base, never white ──────────────────────

function checkSodiumForeground(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  const sodium = SODIUM
  const ink = BG_BASE
  if (!sodium || !ink) return
  const canonicalRatio = contrastRatio(ink.hex, sodium.hex).toFixed(2)

  for (const text of snapshot.texts) {
    if (!text.effectiveBg || text.effectiveBgHasImage) continue
    const background = readColour(text.effectiveBg)
    if (!background || background.hex !== sodium.hex) continue
    const foreground = readColour(text.color)
    if (!foreground || foreground.hex === ink.hex) continue
    const ratio = contrastRatio(foreground.hex, background.hex).toFixed(2)
    log.add(`sodium|${foreground.hex}|${text.colorOrigin}`, text.sel, breakpoint, (sel) => ({
      message:
        `${foreground.hex} on ${background.hex} at ${sel} gives ${ratio}:1. ` +
        `On accent.sodium (${sodium.hex}) the canonical foreground is bg.base (${ink.hex})`,
      expected: `bg.base ${ink.hex} (${canonicalRatio}:1)`,
      actual: `${foreground.hex} (${ratio}:1)`,
      hint: `Declared on ${text.colorOrigin}.`,
    }))
  }
}

// ── AC-30: only the three declared families, at the declared weights ──────────

function checkFonts(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  if (FONT_FAMILIES.length === 0) return
  const allowed = FONT_FAMILIES.map((f) => `${f.head} ${(PER_FAMILY_WEIGHTS ? f.weights : ALL_WEIGHTS).join('/')}`).join(', ')

  for (const text of snapshot.texts) {
    const head = (text.fontFamily.split(',')[0] ?? '').trim().replace(/^['"]|['"]$/g, '')
    const weight = parseInt(text.fontWeight, 10)
    const family = FONT_FAMILIES.find((f) => f.head.toLowerCase() === head.toLowerCase())

    if (!family) {
      log.add(`family|${head}|${text.fontFamilyOrigin}`, text.sel, breakpoint, (sel) => ({
        message: `font-family "${head}" weight ${text.fontWeight} on ${sel} is not declared. Allowed: ${allowed}`,
        expected: FONT_FAMILIES.map((f) => f.head).join(', '),
        actual: head,
        hint:
          `The head of the stack is the family that actually gets used, so a fallback at the head means the token stack ` +
          `was not applied. Declared on ${text.fontFamilyOrigin}.`,
      }))
      continue
    }

    const allowedWeights = PER_FAMILY_WEIGHTS ? family.weights : ALL_WEIGHTS
    if (!Number.isNaN(weight) && allowedWeights.length > 0 && !allowedWeights.includes(weight)) {
      log.add(`weight|${head}|${weight}|${text.fontWeightOrigin}`, text.sel, breakpoint, (sel) => ({
        message: `font-family "${head}" weight ${weight} on ${sel} is not declared. Allowed: ${allowed}`,
        expected: `${head} ${allowedWeights.join('/')}`,
        actual: `${head} ${weight}`,
        hint: `Declared on ${text.fontWeightOrigin}.`,
      }))
    }
  }
}

// ── AC-31: every computed font-size is on the type scale ──────────────────────

function checkTypeScale(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  if (TYPE_SCALE_PX.length === 0) return
  for (const text of snapshot.texts) {
    const value = parseFloat(text.fontSize)
    if (Number.isNaN(value)) continue
    // AC-31 rounds to 0.5px before matching, so sub-pixel rasterisation does not become a
    // defect while a genuinely different step still does.
    const rounded = Math.round(value * 2) / 2
    if (TYPE_SCALE_PX.includes(rounded)) continue
    const near = nearest(rounded, TYPE_SCALE_PX)
    log.add(`size|${rounded}|${text.fontSizeOrigin}`, text.sel, breakpoint, (sel) => ({
      message: `font-size ${px(rounded)}px on ${sel} is off scale. Nearest allowed: ${px(near)}px`,
      expected: `${TYPE_SCALE_PX.map(px).join(', ')} px`,
      actual: `${px(rounded)}px`,
      hint: `Declared on ${text.fontSizeOrigin}.`,
    }))
  }
}

// ── AC-32: declared box values snap to their scale ────────────────────────────

const scaleForProperty = (property: string): { name: string; values: number[] } =>
  property.endsWith('radius') ? { name: 'radius', values: RADIUS_SCALE_PX } : { name: 'spacing', values: SPACING_SCALE_PX }

function checkBoxScales(snapshot: PageSnapshot, breakpoint: string, log: DefectLog): void {
  for (const el of snapshot.elements) {
    for (const [property, rawValue] of Object.entries(collapseBoxLonghands(el.box))) {
      const scale = scaleForProperty(property)
      if (scale.values.length === 0) continue
      const scaleText = scale.values.map(px).join(', ')

      const value = parseFloat(rawValue)
      if (Number.isNaN(value) || !rawValue.endsWith('px')) {
        // A percentage radius (50% for a circle) or any other non-px value cannot sit on a
        // px scale. Report it as written rather than inventing a number for it.
        log.add(`box|${property}|${rawValue}`, el.sel, breakpoint, (sel) => ({
          message: `${property} is ${rawValue} on ${sel}, not on the ${scale.name} scale (${scaleText}). Nearest: n/a`,
          expected: `${scaleText} px`,
          actual: rawValue,
          hint: 'A percentage cannot be checked against a px scale; use a scale step.',
        }))
        continue
      }

      // Negative margins are a legitimate technique and CANON fixes magnitudes, not signs,
      // so the step is checked on the absolute value.
      const magnitude = Math.abs(value)
      if (scale.values.some((step) => Math.abs(step - magnitude) <= TOLERANCE_PX)) continue
      const near = nearest(magnitude, scale.values)
      log.add(`box|${property}|${value}`, el.sel, breakpoint, (sel) => ({
        message: `${property} is ${px(value)}px on ${sel}, not on the ${scale.name} scale (${scaleText}). Nearest: ${px(near)}px`,
        expected: `${scaleText} px`,
        actual: `${px(value)}px`,
      }))
    }
  }
}

// ── AC-33: the content container ──────────────────────────────────────────────

const containerExpectation =
  `Expected max-width ${px(LAYOUT_MAX_WIDTH)}px, ` +
  `gutter ${px(GUTTER_MOBILE)}px at ${MOBILE.width} and ${px(GUTTER_DESKTOP)}px at ${DESKTOP.width}`

/**
 * What AC-33 actually measured, recorded whether it passed or failed. A container check
 * that passes because it found nothing to look at and one that passes because the geometry
 * is right are indistinguishable in a report that only prints failures.
 */
const containerEvidence: Record<string, unknown>[] = []

function checkContainer(snapshot: PageSnapshot, viewport: number, expectedGutter: number): void {
  // Bands narrower than half the viewport are components, not the page container.
  const containers = snapshot.containers.filter((c) => c.width >= viewport / 2)

  containerEvidence.push({
    viewport,
    expectedGutter,
    measured: containers.map((c) => ({
      selector: c.sel,
      width: Math.round(c.width * 100) / 100,
      maxWidth: c.maxWidth,
      paddingInline: [c.paddingLeft, c.paddingRight],
    })),
  })

  if (containers.length === 0) {
    gate.fail({
      criterion: 'AC-33',
      message:
        `no content container found at ${viewport}px: no element inside <body> is width-constrained or centred as a ` +
        `content band. ${containerExpectation}`,
      where: `${viewport}px`,
      expected: `a block with max-width ${px(LAYOUT_MAX_WIDTH)}px`,
      actual: 'none',
      hint: 'The gate looks for the outermost block that has a finite px max-width, or that is centred with equal space on both sides.',
    })
    return
  }

  const seen = new Set<string>()
  for (const container of containers) {
    const signature = [container.maxWidth, container.width, container.paddingLeft, container.paddingRight]
      .map((n) => (n === null ? 'none' : n.toFixed(1)))
      .join('|')
    if (seen.has(signature)) continue
    seen.add(signature)

    const problems: string[] = []
    if (container.maxWidth !== null && Math.abs(container.maxWidth - LAYOUT_MAX_WIDTH) > TOLERANCE_PX) {
      problems.push(`max-width is ${px(container.maxWidth)}px, expected ${px(LAYOUT_MAX_WIDTH)}px`)
    }
    if (container.width > LAYOUT_MAX_WIDTH + TOLERANCE_PX) {
      problems.push(`the band renders ${px(container.width)}px wide, over the ${px(LAYOUT_MAX_WIDTH)}px cap`)
    }
    if (Math.abs(container.paddingLeft - expectedGutter) > TOLERANCE_PX) {
      problems.push(`left gutter is ${px(container.paddingLeft)}px, expected ${px(expectedGutter)}px`)
    }
    if (Math.abs(container.paddingRight - expectedGutter) > TOLERANCE_PX) {
      problems.push(`right gutter is ${px(container.paddingRight)}px, expected ${px(expectedGutter)}px`)
    }
    if (problems.length === 0) continue

    gate.fail({
      criterion: 'AC-33',
      message:
        `content container is ${px(container.width)}px wide with ${px(container.paddingLeft)}px gutters at ${viewport}px. ` +
        containerExpectation,
      where: `${container.sel} @ ${viewport}px`,
      expected: `max-width ${px(LAYOUT_MAX_WIDTH)}px, padding-inline ${px(expectedGutter)}px`,
      actual:
        `width ${px(container.width)}px, ` +
        `max-width ${container.maxWidth === null ? 'none' : `${px(container.maxWidth)}px`}, ` +
        `padding-inline ${px(container.paddingLeft)}px / ${px(container.paddingRight)}px`,
      hint: `${problems.join('; ')}. The gutter is the container's own padding-inline; box-sizing is ${container.boxSizing}.`,
    })
  }
}

// ── The run ───────────────────────────────────────────────────────────────────

/**
 * One test, serial. playwright.config.ts sets fullyParallel, which is free to run the
 * tests of one file in different worker processes; each would hold its own Gate and
 * overwrite the same JSON, so the report would keep whichever finished last.
 */
test.describe.configure({ mode: 'serial' })

let completed = false

test.afterAll(() => {
  if (!completed) {
    // A gate that threw has proved nothing. Saying so is the only honest status: an empty
    // failure list would otherwise be written out as a pass.
    gate.skip('the tokens gate did not finish — see the Playwright error above. No criterion was proved.')
  }
  gate.flush({
    breakpoints: BREAKPOINTS.map((b) => b.width),
    tokenFile: TOKENS_PATH,
    palette: PALETTE.map((c) => `${c.path} ${c.hex}`),
    typeScalePx: TYPE_SCALE_PX,
    spacingScalePx: SPACING_SCALE_PX,
    radiusScalePx: RADIUS_SCALE_PX,
    fontFamilies: FONT_FAMILIES.map((f) => ({ token: f.key, family: f.head, weights: f.weights })),
    layout: { maxWidth: LAYOUT_MAX_WIDTH, gutterMobile: GUTTER_MOBILE, gutterDesktop: GUTTER_DESKTOP },
    containers: containerEvidence,
  })
})

test('AC-26..AC-33 — the page is built from the design tokens', async ({ page }) => {
  // Three full-page style walks plus a CSSOM scan each; the 60s default is too tight.
  test.setTimeout(180_000)

  const colourLog = new DefectLog()
  const mutedLog = new DefectLog()
  const sodiumLog = new DefectLog()
  const fontLog = new DefectLog()
  const typeLog = new DefectLog()
  const boxLog = new DefectLog()

  let elementsInspected = 0
  let textsInspected = 0
  let totalSheets = 0
  let inaccessibleSheets = 0
  let declaringRules = 0
  let rootFontSize = CSS_INITIAL_ROOT_PX
  let logicalAssumptionHolds = true

  for (const breakpoint of BREAKPOINTS) {
    await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height })
    await page.goto('/', { waitUntil: 'load' })
    // Webfont loading does not change a computed colour or font-size, but waiting means the
    // container is measured against the final layout rather than a fallback one.
    await page.evaluate(() => document.fonts.ready.then(() => undefined))

    const snapshot = await readSnapshot(page)
    elementsInspected = Math.max(elementsInspected, snapshot.elements.length)
    textsInspected = Math.max(textsInspected, snapshot.texts.length)
    totalSheets = Math.max(totalSheets, snapshot.stylesheets.total)
    inaccessibleSheets = Math.max(inaccessibleSheets, snapshot.stylesheets.inaccessible)
    declaringRules = Math.max(declaringRules, snapshot.stylesheets.declaringRules)
    rootFontSize = snapshot.rootFontSizePx
    if (snapshot.direction !== 'ltr' || snapshot.writingMode !== 'horizontal-tb') logicalAssumptionHolds = false

    // Everything is read at all three widths: a responsive override is a place a defect can
    // hide, and CANON fixes the same palette and the same scales at every width.
    const label = `${breakpoint.width}px`
    checkPaintedColours(snapshot, label, colourLog) // AC-26
    checkMutedUsage(snapshot, label, mutedLog) // AC-28
    checkSodiumForeground(snapshot, label, sodiumLog) // AC-29
    checkFonts(snapshot, label, fontLog) // AC-30
    checkTypeScale(snapshot, label, typeLog) // AC-31
    checkBoxScales(snapshot, label, boxLog) // AC-32

    // AC-33 fixes a gutter at 390 and at 1440 only. CANON §6 does not fix one at 768 and
    // brief/ACCEPTANCE.md says so explicitly, so nothing is asserted there.
    if (breakpoint.width === MOBILE.width) checkContainer(snapshot, MOBILE.width, GUTTER_MOBILE)
    if (breakpoint.width === DESKTOP.width) checkContainer(snapshot, DESKTOP.width, GUTTER_DESKTOP)
  }

  colourLog.flushInto('AC-26')
  const literals = checkColourLiterals() // AC-27
  mutedLog.flushInto('AC-28')
  sodiumLog.flushInto('AC-29')
  fontLog.flushInto('AC-30')
  typeLog.flushInto('AC-31')
  boxLog.flushInto('AC-32')

  if (inaccessibleSheets > 0 && inaccessibleSheets === totalSheets) {
    // Nothing was read, so nothing was checked. Reported as a failure rather than a pass,
    // because "the gate could not look" and "the gate looked and found nothing" are
    // different facts and only one of them is good news.
    gate.fail({
      criterion: 'AC-32',
      message: 'AC-32 could not be evaluated: no stylesheet could be read, so no declared box value was verified.',
      where: 'document.styleSheets',
      hint: 'Serve the CSS same-origin and re-run. This is not a pass.',
    })
  }

  // ── Notes: how this gate decided, in the report rather than only in the source ──

  gate.note(
    `AC-32 measures only the box values a stylesheet or an inline style actually declares for an element ` +
      `(${declaringRules} declaring rules across ${totalSheets} stylesheet(s)). Sizes produced by flex or grid ` +
      `distribution — space-between, stretch, fr tracks, alignment — never appear as declarations and are excluded by ` +
      `construction. Auto margins are both declared and distributed, so they are dropped explicitly. Not measured: ` +
      `pseudo-element box values, values that apply only in :hover, :focus or :active, and user-agent defaults, which ` +
      `the page did not choose.`,
  )

  if (inaccessibleSheets > 0) {
    gate.note(
      `${inaccessibleSheets} of ${totalSheets} stylesheets could not be read (cross-origin), so any box value declared ` +
        `only there was not checked by AC-32.`,
    )
  }

  gate.note(
    `AC-33 identifies the content container as the outermost block inside <body> that is either width-constrained with a ` +
      `finite px max-width or centred with equal space on both sides, and at least half the viewport wide. The gutter is ` +
      `that element's own padding-inline, which is what CANON §6 fixes at ${px(GUTTER_MOBILE)}px mobile and ` +
      `${px(GUTTER_DESKTOP)}px desktop. No gutter is asserted at 768px: CANON does not fix one.`,
  )

  gate.note(
    `AC-26 reads the properties brief/ACCEPTANCE.md names — color, background-color, the four border colours, ` +
      `outline-color, fill, stroke and the colours inside box-shadow — after converting each one to sRGB in the browser, ` +
      `so a page painted in oklch or color-mix is measured rather than skipped. It does not see colours inside ` +
      `background-image gradients, in pseudo-elements (::before, ::after, ::placeholder, ::selection), or inside images ` +
      `and canvases. A gradient written in src/ is still caught by AC-27; one built entirely from var() references to ` +
      `tokens is on-palette anyway.`,
  )

  gate.note(
    `AC-27 scanned ${literals.scanned} file(s) under src/ for hex, rgb( and hsl( literals, excluding ` +
      `${TOKEN_LAYER.join(', ')}, which scripts/build-theme.mjs generates from ${TOKENS_PATH}. It does not flag named CSS ` +
      `colours such as "white": a painted white is caught by AC-26 instead, at the element that paints it.`,
  )

  if (Math.abs(rootFontSize - CSS_INITIAL_ROOT_PX) > 0.01) {
    gate.note(
      `The document root font-size is ${px(rootFontSize)}px, not ${CSS_INITIAL_ROOT_PX}px. AC-31 converts the rem type ` +
        `scale in ${TOKENS_PATH} at ${CSS_INITIAL_ROOT_PX}px, the CSS initial value, because brief/ACCEPTANCE.md fixes the ` +
        `scale in px — so every rem-sized step on this page is shifted off it.`,
    )
  }

  if (!logicalAssumptionHolds) {
    gate.note(
      'The page is not horizontal-tb ltr, so the mapping from logical box properties (margin-inline-start and friends) to ' +
        'physical sides may name the wrong side in an AC-32 message. The values themselves are the computed ones and are ' +
        'still correct.',
    )
  }

  if (!PER_FAMILY_WEIGHTS) {
    gate.note(
      `AC-30 could not derive the per-family weight table from ${TOKENS_PATH}, so it checked weights against the union of ` +
        `declared weights (${ALL_WEIGHTS.join(', ')}) rather than the weights declared for each family. That is narrower ` +
        `than the criterion, and it is said here rather than passed over in silence.`,
    )
  }

  gate.note(
    `${elementsInspected} elements inspected per breakpoint, ${textsInspected} of which paint text. Colour and the three ` +
      `font properties inherit, so they are judged where text is painted and reported once, at the element where the ` +
      `value is declared, with the rest listed in the hint.`,
  )

  completed = true
})
