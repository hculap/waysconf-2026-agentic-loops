/**
 * WCAG 2.x contrast maths.
 *
 * Shared by the tokens gate (AC-29) and the a11y gate (AC-17), so the two can never
 * disagree about a ratio. The numbers this file produces are reproducible against
 * design/tokens/CONTRAST.md, which was computed with the same formula — if a gate
 * ever prints a ratio that the matrix does not contain, one of the two is wrong and
 * that is worth knowing.
 *
 * Everything here is total and side-effect free. Unparseable input throws rather than
 * returning NaN: a NaN ratio silently satisfies every `< threshold` comparison, which
 * is exactly the kind of quiet pass this whole verifier exists to prevent.
 */

export interface Rgba {
  /** 0-255 */
  r: number
  /** 0-255 */
  g: number
  /** 0-255 */
  b: number
  /** 0-1 */
  a: number
}

/**
 * The handful of CSS named colours worth supporting. Computed styles always come back
 * as rgb()/rgba(), so this only matters when a check reads an author stylesheet or a
 * literal out of markup.
 */
const NAMED: Record<string, string> = {
  transparent: 'rgba(0, 0, 0, 0)',
  white: '#FFFFFF',
  black: '#000000',
}

/** Accepts #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb()/rgba() in comma or space syntax, and a few names. */
export function parseCssColor(value: string): Rgba | null {
  const input = value.trim().toLowerCase()
  if (!input) return null

  const named = NAMED[input]
  if (named) return parseCssColor(named)

  if (input.startsWith('#')) {
    const hex = input.slice(1)
    const expand = (s: string) => parseInt(s.length === 1 ? s + s : s, 16)
    if (hex.length === 3 || hex.length === 4) {
      const parts = hex.split('')
      const [r, g, b, a] = parts as [string, string, string, string?]
      return { r: expand(r), g: expand(g), b: expand(b), a: a === undefined ? 1 : expand(a) / 255 }
    }
    if (hex.length === 6 || hex.length === 8) {
      if (!/^[0-9a-f]+$/.test(hex)) return null
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
      }
    }
    return null
  }

  const fn = input.match(/^rgba?\(([^)]+)\)$/)
  if (!fn || !fn[1]) return null
  const parts = fn[1]
    .replace(/\//g, ' ')
    .split(/[\s,]+/)
    .filter(Boolean)
  if (parts.length < 3) return null
  const channel = (raw: string): number => {
    const n = parseFloat(raw)
    if (Number.isNaN(n)) return NaN
    return raw.includes('%') ? (n / 100) * 255 : n
  }
  const r = channel(parts[0] as string)
  const g = channel(parts[1] as string)
  const b = channel(parts[2] as string)
  if ([r, g, b].some(Number.isNaN)) return null
  let a = 1
  if (parts.length > 3) {
    const rawAlpha = parts[3] as string
    const parsed = parseFloat(rawAlpha)
    if (Number.isNaN(parsed)) return null
    a = rawAlpha.includes('%') ? parsed / 100 : parsed
  }
  return { r, g, b, a }
}

function coerce(value: string | Rgba): Rgba {
  if (typeof value !== 'string') return value
  const parsed = parseCssColor(value)
  if (!parsed) throw new TypeError(`Not a colour this parser understands: "${value}"`)
  return parsed
}

const clamp255 = (n: number) => Math.min(255, Math.max(0, Math.round(n)))

/** Normalised uppercase #RRGGBB. Alpha is dropped: every caller here compares hues, not opacity. */
export function toHex(value: string | Rgba): string {
  const { r, g, b } = coerce(value)
  return '#' + [r, g, b].map((c) => clamp255(c).toString(16).padStart(2, '0')).join('').toUpperCase()
}

/** Composite a translucent colour over an opaque one, so a ratio is measured against what is seen. */
export function flatten(fg: string | Rgba, bg: string | Rgba): Rgba {
  const f = coerce(fg)
  const b = coerce(bg)
  return {
    r: f.r * f.a + b.r * (1 - f.a),
    g: f.g * f.a + b.g * (1 - f.a),
    b: f.b * f.a + b.b * (1 - f.a),
    a: 1,
  }
}

/** WCAG 2.x relative luminance, sRGB. See design/tokens/CONTRAST.md section 1. */
export function relativeLuminance(value: string | Rgba): number {
  const { r, g, b } = coerce(value)
  const lin = (c8: number) => {
    const c = clamp255(c8) / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

/**
 * Contrast ratio, 1 to 21. Order does not matter.
 *
 * Translucent input is composited over the other colour first, because the ratio that
 * matters is the one a person sees, not the one the declared value implies.
 */
export function contrastRatio(a: string | Rgba, b: string | Rgba): number {
  let top = coerce(a)
  const bottom = coerce(b)
  if (top.a < 1) top = flatten(top, bottom)
  const la = relativeLuminance(top)
  const lb = relativeLuminance(bottom)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** WCAG 2.2 AA thresholds, so no gate has to write the numbers down twice. */
export const AA_NORMAL_TEXT = 4.5
export const AA_LARGE_TEXT = 3
export const AA_NON_TEXT = 3
