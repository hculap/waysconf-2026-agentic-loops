#!/usr/bin/env node
/**
 * Where design/tokens/speaker.css comes from, and whether it still holds.
 *
 *   node scripts/read-brand.mjs              read the live site's computed styles
 *   node scripts/read-brand.mjs --contrast   measure every pairing the token file permits
 *
 * The deck and the participant site carry szymonpaluch.com's identity. Copying a palette
 * by eye off a screenshot is how you end up "nearly right" — an almost-green, a spacing
 * that is close — so the values in speaker.css were read out of a browser instead, and
 * this script is that reading, kept runnable.
 *
 * `--contrast` is the half that matters afterwards. It parses the token file, measures
 * every text-on-surface pairing it permits, and exits non-zero if any of them is below
 * AA. The table in speaker.css is generated from this output, not written by hand.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SITE = 'https://szymonpaluch.com/'
const TOKENS = join(ROOT, 'design/tokens/speaker.css')
const AA = 4.5

// ── contrast ──────────────────────────────────────────────────────────────────

const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
const luminance = (c) => {
  const [r, g, b] = c.map((v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const contrast = (a, b) => {
  const [hi, lo] = [luminance(rgb(a)), luminance(rgb(b))].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

async function measure() {
  const css = await readFile(TOKENS, 'utf8')
  const token = (name) => {
    const v = css.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1]
    if (!v) throw new Error(`--${name} is not in speaker.css, or is not a plain hex`)
    return v
  }

  const surfaces = ['sp-bg', 'sp-surface', 'sp-raised'].map((n) => [n, token(n)])
  const inks = ['sp-fg', 'sp-fg-2', 'sp-fg-3', 'sp-accent', 'sp-accent-2', 'sp-amber', 'sp-amber-2', 'sp-danger']
    .map((n) => [n, token(n)])
  const fills = ['sp-accent', 'sp-amber'].map((n) => [n, token(n)])
  const onAccent = token('sp-on-accent')

  const failures = []
  for (const [sName, s] of surfaces) {
    console.log(`\non --${sName} (${s.toUpperCase()})`)
    for (const [iName, i] of inks) {
      const r = contrast(i, s)
      if (r < AA) failures.push(`--${iName} on --${sName}: ${r.toFixed(2)}:1`)
      console.log(`  --${iName.padEnd(13)} ${i.toUpperCase()}  ${r.toFixed(2).padStart(6)}:1  ${r >= AA ? 'PASS-AA' : 'FAIL'}`)
    }
  }

  console.log('\nink on fills')
  for (const [fName, f] of fills) {
    const ok = contrast(onAccent, f)
    const white = contrast('#ffffff', f)
    if (ok < AA) failures.push(`--sp-on-accent on --${fName}: ${ok.toFixed(2)}:1`)
    console.log(`  --sp-on-accent on --${fName.padEnd(10)} ${ok.toFixed(2).padStart(6)}:1  ${ok >= AA ? 'PASS-AA' : 'FAIL'}`)
    console.log(`  #FFFFFF        on --${fName.padEnd(10)} ${white.toFixed(2).padStart(6)}:1  ${white >= AA ? 'PASS-AA' : 'FAIL — do not'}`)
  }

  if (failures.length) {
    console.log(`\nFAIL — ${failures.length} pairing(s) the token file permits are below ${AA}:1\n`)
    for (const f of failures) console.log(`  - ${f}`)
    process.exit(1)
  }
  console.log(`\nPASS — every pairing speaker.css permits is at or above ${AA}:1`)
}

// ── reading the live site ─────────────────────────────────────────────────────

async function read() {
  const { chromium } = await import('playwright-core')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    const response = await page.goto(SITE, { waitUntil: 'networkidle', timeout: 60_000 })
    if (!response?.ok()) throw new Error(`${SITE} returned ${response?.status() ?? 'nothing'}`)

    const report = await page.evaluate(() => {
      const tally = (prop) => {
        const counts = new Map()
        for (const n of document.querySelectorAll('*')) {
          const v = getComputedStyle(n)[prop]
          if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'none') continue
          counts.set(v, (counts.get(v) ?? 0) + 1)
        }
        return [...counts].sort((a, b) => b[1] - a[1]).slice(0, 8)
      }
      const pick = (sel) => {
        const el = document.querySelector(sel)
        if (!el) return null
        const s = getComputedStyle(el)
        return { font: s.fontFamily, size: s.fontSize, weight: s.fontWeight, color: s.color, background: s.backgroundColor, radius: s.borderRadius }
      }
      return {
        body: pick('body'),
        h1: pick('h1'),
        button: pick('a[class*="bg-"], button'),
        backgrounds: tally('backgroundColor'),
        colors: tally('color'),
        fonts: tally('fontFamily'),
        radii: tally('borderRadius'),
      }
    })

    const out = join(ROOT, 'design/tokens/brand-reading.json')
    await writeFile(out, JSON.stringify({ read: new Date().toISOString(), site: SITE, ...report }, null, 2))
    console.log(JSON.stringify(report, null, 2))
    console.log(`\nwrote ${out.replace(ROOT + '/', '')}`)
    console.log('Compare against design/tokens/speaker.css by hand — this script does not edit it.')
  } finally {
    await browser.close()
  }
}

await (process.argv.includes('--contrast') ? measure() : read())
