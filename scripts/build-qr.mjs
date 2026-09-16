#!/usr/bin/env node
/**
 * The QR codes on the hub, one per language.
 *
 *   node scripts/build-qr.mjs
 *
 * Generated once and committed as SVG, then inlined into the hub by build-guideline.mjs. The
 * site build itself therefore needs no QR library and makes no network request: a room full of
 * phones pointed at a projector is not the moment to discover that an image service is down.
 *
 * Black on white on purpose. The page is near-black, and inverted codes — light modules on a
 * dark ground — are read by some phone cameras and not others. A QR nobody can scan is worse
 * than no QR, because the room tries it for thirty seconds first.
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'guideline/src/qr')

let QRCode
try {
  QRCode = createRequire(import.meta.url)('qrcode')
} catch {
  console.error('FAIL — the qrcode package is not installed. Run: npm install --no-save qrcode')
  process.exit(1)
}

const CODES = [
  { name: 'en', url: 'https://waysconf.szymonpaluch.com/' },
  { name: 'pl', url: 'https://waysconf.szymonpaluch.com/pl/' },
]

await mkdir(OUT, { recursive: true })

for (const { name, url } of CODES) {
  const svg = await QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    color: { dark: '#0A0A0AFF', light: '#FFFFFFFF' },
  })

  // The generator emits a bare <svg> with no title. It is inlined into a page, so it needs a
  // name a screen reader can read out, and it must scale to whatever box the hub gives it.
  const titled = svg
    .replace('<svg ', `<svg role="img" aria-label="QR code for ${url}" `)
    .replace(/\swidth="[^"]*"|\sheight="[^"]*"/g, '')

  await writeFile(join(OUT, `${name}.svg`), `${titled.trim()}\n`)
  console.log(`wrote guideline/src/qr/${name}.svg  →  ${url}`)
}
