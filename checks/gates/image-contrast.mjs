#!/usr/bin/env node
/**
 * AC-61 — contrast for text that sits over a picture.
 *
 *   node scripts/check-text-over-image.mjs [url]
 *
 * Prints one JSON gate result on stdout, the same shape as the other standalone gates.
 *
 * WHY THIS EXISTS, AND IT IS THE WHOLE POINT OF THE WORKSHOP IN MINIATURE
 *
 * axe-core cannot evaluate the contrast of text drawn over a background image. It does
 * not report a violation; it reports the pair as *incomplete* and moves on. So the
 * accessibility gate can be green — zero violations, three breakpoints, six states —
 * while the largest, first, most-read text on the page is illegible.
 *
 * That is exactly what happened here. The hero passed AC-15 with five of its nine text
 * elements below AA against the photograph behind them, and it took a person sampling
 * pixels to find it. This file is that person, written down.
 *
 * HOW IT MEASURES
 *
 * Reading the CSS is not enough: the effective background of hero text is a photograph,
 * two translucent scrims and a gradient composited together, and no computed style says
 * what colour that is. So:
 *
 *   1. find every text element inside a section that has a background image
 *   2. record each one's colour, box, font size and weight
 *   3. make all the text in that section transparent, leaving every background intact
 *   4. screenshot, and for each box take the WORST 4x4 tile — the brightest patch a
 *      glyph could land on, not the average, because the average is what makes a page
 *      look fine and reads badly
 *   5. compute the real WCAG ratio and compare against 4.5:1, or 3:1 for large text
 *
 * Elements with their own opaque background are skipped and said so: a button's fill is
 * the thing behind its label, axe measures that correctly, and rounded corners otherwise
 * put the page background inside the sampled box and produce a false failure.
 */

import sharp from 'sharp'
import { chromium } from 'playwright-core'

const URL_UNDER_TEST = process.argv[2] || 'http://localhost:4321'
const BREAKPOINTS = [390, 768, 1440]
const TILE = 4

const srgb = (c) => {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}
const luminance = (r, g, b) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b)
const contrast = (a, b) => {
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

const failures = []
const notes = []
const evidence = { measured: 0, skipped: 0, worst: null }

async function main() {
  const browser = await chromium.launch()
  try {
    for (const width of BREAKPOINTS) {
      const ctx = await browser.newContext({
        viewport: { width, height: 1000 },
        deviceScaleFactor: 1,
        colorScheme: 'dark',
      })
      const page = await ctx.newPage()
      await page.goto(URL_UNDER_TEST, { waitUntil: 'networkidle', timeout: 45_000 })
      await page.evaluate(() => document.fonts.ready).catch(() => undefined)
      await page.waitForTimeout(400)

      // Which sections actually paint a picture behind their text?
      const targets = await page.evaluate(() => {
        const opaque = (c) => {
          const m = String(c).match(/[\d.]+/g)
          return !!m && (m.length < 4 || Number(m[3]) > 0.9)
        }
        const sections = Array.from(document.querySelectorAll('[data-section]')).filter((s) =>
          s.querySelector('img') && getComputedStyle(s).position !== 'static',
        )
        const out = []
        for (const section of sections) {
          const name = section.getAttribute('data-section')
          for (const el of section.querySelectorAll('h1,h2,h3,p,a,span,li')) {
            const text = (el.textContent || '').trim()
            if (!text) continue
            if (el.querySelector('h1,h2,h3,p,a,span,li')) continue // leaves only
            const r = el.getBoundingClientRect()
            if (r.width < 4 || r.height < 4 || r.top > 1000) continue
            const cs = getComputedStyle(el)
            out.push({
              section: name,
              text: text.slice(0, 40).replace(/\s+/g, ' '),
              x: Math.round(r.x),
              y: Math.round(r.y),
              w: Math.round(r.width),
              h: Math.round(r.height),
              color: cs.color,
              size: parseFloat(cs.fontSize),
              weight: Number(cs.fontWeight) || 400,
              hasOwnBackground: opaque(cs.backgroundColor),
            })
          }
        }
        return out
      })

      if (targets.length === 0) {
        notes.push(`No text over an image found at ${width}px.`)
        await ctx.close()
        continue
      }

      // Hide the glyphs, keep every background exactly as it is.
      await page.addStyleTag({
        content: '[data-section] * { color: transparent !important; text-shadow: none !important; }',
      })
      await page.waitForTimeout(250)
      const shot = await page.screenshot({ clip: { x: 0, y: 0, width, height: 1000 } })
      const img = sharp(shot)

      for (const t of targets) {
        if (t.hasOwnBackground) {
          evidence.skipped++
          continue
        }
        const region = await img
          .clone()
          .extract({
            left: Math.max(0, t.x),
            top: Math.max(0, t.y),
            width: Math.max(1, Math.min(t.w, width - Math.max(0, t.x))),
            height: Math.max(1, Math.min(t.h, 1000 - Math.max(0, t.y))),
          })
          .raw()
          .toBuffer({ resolveWithObject: true })

        const rgb = (t.color.match(/[\d.]+/g) || [255, 255, 255]).map(Number)
        const fg = luminance(rgb[0], rgb[1], rgb[2])

        const { data, info } = region
        let worst = Infinity
        for (let ty = 0; ty < info.height; ty += TILE) {
          for (let tx = 0; tx < info.width; tx += TILE) {
            let sum = 0
            let n = 0
            for (let y = ty; y < Math.min(ty + TILE, info.height); y++) {
              for (let x = tx; x < Math.min(tx + TILE, info.width); x++) {
                const i = (y * info.width + x) * info.channels
                sum += luminance(data[i], data[i + 1], data[i + 2])
                n++
              }
            }
            const r = contrast(fg, sum / n)
            if (r < worst) worst = r
          }
        }

        evidence.measured++
        const large = t.size >= 24 || (t.size >= 18.66 && t.weight >= 700)
        const required = large ? 3 : 4.5

        if (!evidence.worst || worst < evidence.worst.ratio) {
          evidence.worst = { ratio: Number(worst.toFixed(2)), text: t.text, width }
        }

        if (worst < required) {
          failures.push({
            criterion: 'AC-61',
            message: `Text over an image is below AA: "${t.text}" measures ${worst.toFixed(2)}:1 at ${width}px, minimum ${required}:1.`,
            where: `[data-section="${t.section}"] — ${Math.round(t.size)}px ${t.weight}`,
            expected: `>= ${required}:1`,
            actual: `${worst.toFixed(2)}:1 against the brightest ${TILE}x${TILE} patch behind it`,
            hint:
              'axe reports text over a background image as incomplete rather than failing, so the ' +
              'a11y gate will not catch this. Darken the scrim over the text column; do not lighten ' +
              'the text, which is already at text.primary.',
          })
        }
      }

      await ctx.close()
    }

    notes.push(
      `${evidence.measured} text elements measured over images, ${evidence.skipped} skipped for having their own opaque background.`,
    )
    notes.push(
      'axe cannot evaluate contrast over a background image — it marks the pair incomplete. This gate is that gap.',
    )

    console.log(
      JSON.stringify({
        id: 'imagecontrast',
        title: 'Text over images',
        status: failures.length ? 'fail' : 'pass',
        criteria: ['AC-61'],
        failures,
        notes,
        evidence,
      }),
    )
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.log(
    JSON.stringify({
      id: 'imagecontrast',
      title: 'Text over images',
      status: 'fail',
      criteria: ['AC-61'],
      failures: [
        {
          criterion: 'AC-61',
          message: `The gate did not finish, so nothing is known about text over images: ${String(err).slice(0, 200)}`,
        },
      ],
      notes: [],
      evidence: {},
    }),
  )
})
