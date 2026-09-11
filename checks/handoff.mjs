#!/usr/bin/env node
/**
 * What can an agent actually read out of a Figma export?
 *
 *   node checks/handoff.mjs path/to/export.zip
 *   node checks/handoff.mjs path/to/design-folder
 *
 * The workshop hands a designer three clicks — select the frames, Export as SVG, unzip —
 * and then asks an agent to build from the result. Whether that result is usable is not
 * obvious by looking at it: a folder of exports looks equally fine whether the text inside
 * is real text or was flattened into outlines on the way out, and the failure only shows up
 * twenty minutes later as invented copy and colours that are *nearly* right.
 *
 * So this measures the export instead of trusting it. It reports what is in there and exits
 * non-zero if an agent would have to guess.
 *
 * Run it once on the real export before handing the link to thirty people.
 */

import { execFileSync } from 'node:child_process'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, extname, resolve, basename } from 'node:path'

const target = process.argv[2]
if (!target) {
  console.error('usage: node checks/handoff.mjs <export.zip | design-folder>')
  process.exit(2)
}
const path = resolve(target)

const MIN_COLOURS = 4
const MIN_WORDS = 40

// ── read either shape ────────────────────────────────────────────────────────

/** @returns {Promise<{name: string, text: string}[]>} every text-ish file in the export */
async function contents() {
  const info = await stat(path).catch(() => null)
  if (!info) throw new Error(`${target} does not exist`)

  if (info.isDirectory()) {
    const out = []
    const walk = async (dir) => {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const p = join(dir, entry.name)
        if (entry.isDirectory()) await walk(p)
        else out.push({ name: p.slice(path.length + 1), text: await readFile(p, 'utf8').catch(() => '') })
      }
    }
    await walk(path)
    return out
  }

  // A zip. `unzip` is used rather than a dependency: this runs on a designer's machine too.
  let listing
  try {
    listing = execFileSync('unzip', ['-Z1', path], { encoding: 'utf8' })
  } catch (error) {
    throw new Error(`could not open ${basename(path)} as a zip — ${error.message.split('\n')[0]}`)
  }
  const names = listing.split('\n').map((n) => n.trim()).filter((n) => n && !n.endsWith('/'))
  return names.map((name) => {
    let text = ''
    if (['.svg', '.txt', '.md', '.json', '.csv'].includes(extname(name).toLowerCase())) {
      try {
        text = execFileSync('unzip', ['-p', path, name], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
      } catch {
        text = ''
      }
    }
    return { name, text }
  })
}

// ── measure ──────────────────────────────────────────────────────────────────

const files = await contents()
if (files.length === 0) {
  console.error(`FAIL — ${basename(path)} is empty. Nothing was exported.`)
  process.exit(1)
}

const svgs = files.filter((f) => extname(f.name).toLowerCase() === '.svg')
const images = files.filter((f) => ['.png', '.jpg', '.jpeg', '.webp'].includes(extname(f.name).toLowerCase()))
const others = files.filter((f) => !svgs.includes(f) && !images.includes(f))

const colours = new Set()
const words = new Set()
let textNodes = 0
let outlinedHint = 0

const harvest = (text) => {
  for (const m of text.matchAll(/#[0-9a-fA-F]{6}\b/g)) colours.add(m[0].toUpperCase())
  for (const m of text.matchAll(/rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/g)) colours.add(m[0].replace(/\s+/g, ''))
}

const addWords = (text) => {
  for (const w of text.split(/\s+/)) {
    const clean = w.replace(/[^\p{L}\p{N}'’-]/gu, '')
    if (clean.length > 1) words.add(clean.toLowerCase())
  }
}

for (const svg of svgs) {
  harvest(svg.text)
  const texts = [...svg.text.matchAll(/<text[\s>][\s\S]*?<\/text>/g)]
  textNodes += texts.length
  for (const t of texts) addWords(t[0].replace(/<[^>]+>/g, ' '))
  // A file full of paths and no text is the signature of "outline text" being ticked.
  if (texts.length === 0 && (svg.text.match(/<path/g) ?? []).length > 20) outlinedHint++
}

// A hand-assembled pack carries its values in a token file and its copy in a text file
// rather than inside the SVGs, and that is just as readable to an agent. Counting only the
// SVGs told the ready-made pack it was useless, which was a fact about this checker.
const dataFiles = others.filter((f) =>
  ['.json', '.md', '.txt', '.csv'].includes(extname(f.name).toLowerCase()) && f.text.length > 0)
for (const f of dataFiles) {
  harvest(f.text)
  addWords(f.text.replace(/<[^>]+>/g, ' '))
}

console.log(`Reading ${basename(path)}\n`)
console.log(`  files            ${files.length}`)
console.log(`  SVG              ${svgs.length}`)
console.log(`  images           ${images.length}`)
console.log(`  other            ${others.length}${others.length ? `  (${others.slice(0, 4).map((f) => f.name).join(', ')}${others.length > 4 ? ', …' : ''})` : ''}`)
console.log(`  readable as data ${svgs.length + dataFiles.length}  (${svgs.length} SVG + ${dataFiles.length} text/token file${dataFiles.length === 1 ? '' : 's'})`)
console.log(`  text nodes       ${textNodes}`)
console.log(`  distinct words   ${words.size}`)
console.log(`  distinct colours ${colours.size}${colours.size ? `  (${[...colours].slice(0, 6).join(' ')}${colours.size > 6 ? ' …' : ''})` : ''}`)

const failures = []

// What matters is not the file format, it is whether the values and the words are readable
// as data from something in here. SVG is how a Figma export carries them; a hand-made pack
// carries them in a token file. Either is fine. Neither is not.
if (svgs.length === 0 && dataFiles.length === 0) {
  failures.push(
    images.length > 0
      ? `${images.length} images and nothing else. An agent given only pictures infers every colour and ` +
        'measurement from pixels, and "nearly right" is what fails a contrast check. Export SVG as well.'
      : 'nothing in here can be read as data — no SVG, no token file, no copy file.',
  )
}

if (svgs.length > 0 && textNodes === 0 && dataFiles.length === 0) {
  failures.push(
    'the SVGs contain no <text> at all. Every word has been flattened into shapes — ' +
      '"outline text" was ticked on the way out. Untick it and export again.',
  )
} else if (outlinedHint > 0) {
  failures.push(
    `${outlinedHint} SVG file(s) are all paths and no text. Those frames came out outlined; ` +
      'their copy is unreadable to anything but an eye.',
  )
}

if (words.size < MIN_WORDS) {
  failures.push(`only ${words.size} distinct words in the whole export — the copy is not in here.`)
}

if (colours.size < MIN_COLOURS) {
  failures.push(`only ${colours.size} distinct colours — the design values did not come out with the frames.`)
}

if (failures.length) {
  console.log(`\nFAIL — an agent would have to guess\n`)
  for (const f of failures) console.log(`  - ${f}`)
  process.exit(1)
}

console.log('\nPASS — the copy is text, the colours are values, and nothing has to be inferred')
