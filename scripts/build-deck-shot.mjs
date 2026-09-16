#!/usr/bin/env node
/**
 * Photograph the top of the finished festival site for the deck.
 *
 *   node scripts/build-deck-shot.mjs [--url https://turbine-festival.netlify.app/]
 *
 * Slide 5 promises a URL the room can open. A screenshot is not that promise, it is the
 * fallback for the moment the conference wifi is not there — so it is taken from the LIVE
 * site by default, and the run prints the address it photographed. If the picture and the
 * live page ever disagree, the picture is the lie, and the only fix is to run this again.
 *
 * Written to deck/public/shots/, which the deck serves itself; nothing is fetched at runtime.
 */

import { mkdir, stat } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const arg = (n, f) => (process.argv.includes(n) ? process.argv[process.argv.indexOf(n) + 1] : f)
const URL_ = arg('--url', 'https://turbine-festival.netlify.app/')
const OUT = join(ROOT, 'deck/public/shots')

// 16:9 of the hero, at the deck's own canvas ratio, so the slide does not have to crop it.
const WIDTH = 1440
const HEIGHT = 810

await mkdir(OUT, { recursive: true })
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT }, deviceScaleFactor: 2 })

const response = await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60_000 })
if (!response?.ok()) {
  console.error(`FAIL — ${URL_} returned ${response?.status() ?? 'nothing'}. Not writing a screenshot of an error page.`)
  await browser.close()
  process.exit(1)
}

// The ticker scrolls and the hero fades in. Stop both, or the picture is a random frame.
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(500)

// JPEG, not PNG: this is a photograph of a photograph, and the PNG was 2.6 MB. The deck is
// carried on a laptop into a room whose wifi is not to be trusted; every megabyte is one the
// projector has to load from disk before the first slide.
const file = join(OUT, 'turbine-hero.jpg')
await page.screenshot({ path: file, type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } })
await browser.close()

const size = (await stat(file)).size
console.log(`wrote deck/public/shots/turbine-hero.jpg  ${WIDTH}×${HEIGHT} @2x, ${(size / 1024).toFixed(0)} kB  from ${URL_}`)
