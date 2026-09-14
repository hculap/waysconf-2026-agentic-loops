#!/usr/bin/env node
/**
 * What can an agent actually read out of a Figma file or a Figma export?
 *
 *   node checks/handoff.mjs path/to/turbine.fig
 *   node checks/handoff.mjs path/to/export.zip
 *   node checks/handoff.mjs path/to/design-folder
 *
 * The workshop hands a designer a couple of clicks — Save local copy, or select the frames
 * and Export as SVG — and then asks an agent to build from the result. Whether that result
 * is usable is not
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
import { existsSync } from 'node:fs'
import { readFile, readdir, stat } from 'node:fs/promises'
import { join, extname, resolve, basename } from 'node:path'
import { listFig, readFig } from './lib/fig.mjs'

const target = process.argv[2]
if (!target) {
  console.error('usage: node checks/handoff.mjs <file.fig | export.zip | design-folder>')
  process.exit(2)
}
const path = resolve(target)

const MIN_COLOURS = 4
const MIN_WORDS = 40

const addWords = (words, text) => {
  for (const w of String(text).split(/\s+/)) {
    const clean = w.replace(/[^\p{L}\p{N}'’-]/gu, '')
    if (clean.length > 1) words.add(clean.toLowerCase())
  }
}

// ── a .fig ───────────────────────────────────────────────────────────────────

/**
 * A file handed to someone must stand on its own. "CANON §6", "See CONTRAST.md" or
 * "img src=design/assets/…" in a description or an annotation points at a document the
 * reader does not have, and an agent dutifully lists every one as something the design does
 * not tell it. Site paths ("/images/og.jpg") and URLs are the page's own and do not count.
 */
const OUTSIDE = [
  /§\s?\d/,
  /\b[A-Z][A-Z-]{2,}\s+section\s+\d/,
  /(?<![\w/:.@-])[\w-]+\.mdx?\b/,
  /(?<![\w/:.@-])(?:[\w-]+\/)+[\w.-]+\.(?:md|json|css|js|mjs|ts|tsx|astro|html|jpe?g|png|svg|webp|txt|csv|ya?ml)\b/,
]

/** Every string a reader of the file can see: layer text, descriptions, annotations, plugin notes. */
function readableStrings(node) {
  const out = []
  const add = (value) => typeof value === 'string' && value && out.push(value)
  add(node.textData?.characters)
  add(node.description)
  for (const a of node.annotations ?? []) add(a.label)
  for (const d of node.pluginData ?? []) add(d.value)
  for (const a of node.componentPropAssignments ?? []) add(a.varValue?.value?.textDataValue?.characters)
  for (const o of node.symbolData?.symbolOverrides ?? []) {
    add(o.textData?.characters)
    for (const a of o.annotations ?? []) add(a.label)
    for (const d of o.pluginData ?? []) add(d.value)
  }
  return out
}

const hex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase()

/**
 * The saved Figma file itself. Nothing was exported, so nothing can have been flattened on
 * the way out: the question is only whether the document decodes and has the design in it.
 * @returns {number} the exit code
 */
function reportFig() {
  let fig
  try {
    if (!existsSync(path)) throw new Error(`${target} does not exist`)
    fig = readFig(path)
  } catch (error) {
    console.log(`Reading ${basename(path)}\n`)
    console.log(`FAIL — the file does not decode\n\n  - ${error.message}`)
    return 1
  }
  const guid = (g) => `${g.sessionID}:${g.localID}`
  // Deleting a collection soft-deletes the collection but not its variables, so a variable
  // is live only if the collection it belongs to is. Everything else follows its own flag.
  const liveSets = new Set(
    fig.nodes.filter((node) => node.type === 'VARIABLE_SET' && !node.isSoftDeleted).map((set) => guid(set.guid)),
  )
  const isLive = (node) =>
    !node.isSoftDeleted &&
    (node.type !== 'VARIABLE' || Boolean(node.variableSetID?.guid && liveSets.has(guid(node.variableSetID.guid))))
  const live = fig.nodes.filter(isLive)
  const deleted = fig.nodes.filter((node) => !isLive(node))
  const of = (type) => live.filter((node) => node.type === type)
  const words = new Set()
  const colours = new Set()

  for (const node of live) {
    if (node.textData) addWords(words, node.textData.characters)
    for (const a of node.componentPropAssignments ?? []) {
      if (a.varValue?.value?.textDataValue) addWords(words, a.varValue.value.textDataValue.characters)
    }
    for (const o of node.symbolData?.symbolOverrides ?? []) {
      if (o.textData) addWords(words, o.textData.characters)
    }
    for (const paint of [...(node.fillPaints ?? []), ...(node.strokePaints ?? [])]) {
      if (paint.type === 'SOLID' && paint.visible !== false && paint.color) colours.add(hex(paint.color))
    }
    for (const entry of node.variableDataValues?.entries ?? []) {
      if (entry.variableData?.value?.colorValue) colours.add(hex(entry.variableData.value.colorValue))
    }
  }

  const pages = of('CANVAS').filter((page) => !page.internalOnly)
  const variables = of('VARIABLE')
  const images = fig.entries.filter((name) => name.startsWith('images/'))
  // Text wired to a component property. A reader that ignores the wiring sees every
  // instance of a card with the component's sample text — twelve cards, one artist.
  const propText = of('TEXT').filter((node) =>
    (node.parameterConsumptionMap?.entries ?? []).some((e) => e.variableField === 'TEXT_DATA' && e.variableData?.value?.propRefValue))
  const fileName = fig.meta?.file_name ?? '(no meta.json)'
  const pointsOutside = (nodes) => {
    const found = new Map()
    for (const node of nodes) {
      for (const text of readableStrings(node)) {
        if (OUTSIDE.some((pattern) => pattern.test(text))) found.set(text, (found.get(text) ?? 0) + 1)
      }
    }
    return found
  }
  const outside = pointsOutside(live)
  // Deleted history is not the design, but it is still in the file, and still readable.
  const staleOutside = pointsOutside(deleted)

  console.log(`Reading ${basename(path)}  —  a Figma file, format version ${fig.version}\n`)
  console.log(`  file name        ${fileName}`)
  console.log(`  pages            ${pages.length}  (${pages.map((page) => page.name).join(', ')})`)
  console.log(`  text layers      ${of('TEXT').length}`)
  console.log(`  distinct words   ${words.size}`)
  console.log(`  distinct colours ${colours.size}${colours.size ? `  (${[...colours].slice(0, 6).join(' ')}${colours.size > 6 ? ' …' : ''})` : ''}`)
  console.log(`  variables        ${variables.length} in ${liveSets.size} collection(s)`)
  console.log(`  components       ${of('SYMBOL').length}, placed ${of('INSTANCE').length} times`)
  console.log(`  images           ${images.length}`)
  console.log(`  deleted history  ${deleted.length} node(s)${staleOutside.size ? `, ${staleOutside.size} distinct text(s) in it pointing outside the file` : ''}`)
  console.log(`  outside refs     ${outside.size} distinct text(s) point at documents that are not in the file`)
  if (propText.length) {
    console.log(`  property text    ${propText.length} text layer(s) take their words from a component property — read the instances, not the component`)
  }

  const failures = []
  if (of('TEXT').length === 0) failures.push('the document has no text layers at all.')
  if (words.size < MIN_WORDS) failures.push(`only ${words.size} distinct words in the whole file — the copy is not in here.`)
  if (colours.size < MIN_COLOURS) failures.push(`only ${colours.size} distinct colours — the design values are not in here.`)
  if (deleted.length) {
    failures.push(
      `the file carries ${deleted.length} deleted node(s) of history — ${fig.nodes.filter((node) => node.isSoftDeleted).length} marked ` +
        `isSoftDeleted, the rest variables of deleted collections${staleOutside.size ? `, ${staleOutside.size} of their texts still pointing outside the file` : ''}. ` +
        'A file you hand out must be the design and nothing else. Build it once into a new, empty Figma file and Save local copy from there.',
    )
  }
  if (outside.size) {
    const examples = [...outside.keys()].slice(0, 8).map((text) => `      ${JSON.stringify(text.length > 110 ? text.slice(0, 110) + '…' : text)}`)
    failures.push(
      `${outside.size} distinct text(s) in the file point at documents that are not in it. An agent lists each one ` +
        `as something the design does not tell it. Write the rule itself into the file instead:\n${examples.join('\n')}` +
        (outside.size > 8 ? `\n      … and ${outside.size - 8} more` : ''),
    )
  }
  if (fileName === 'Untitled') {
    console.log('\n  note: the file is still called "Untitled". Rename it in Figma before handing it out.')
  }

  if (failures.length) {
    console.log(`\nFAIL — an agent would have to guess\n`)
    for (const f of failures) console.log(`  - ${f}`)
    return 1
  }
  console.log('\nPASS — the file decodes, the copy is text, the colours are values')
  return 0
}

const looksLikeFig = async () => {
  if (extname(path).toLowerCase() === '.fig') return true
  const info = await stat(path).catch(() => null)
  if (!info || info.isDirectory()) return false
  try {
    return listFig(path).includes('canvas.fig')
  } catch {
    return false
  }
}

if (await looksLikeFig()) process.exit(reportFig())

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


for (const svg of svgs) {
  harvest(svg.text)
  const texts = [...svg.text.matchAll(/<text[\s>][\s\S]*?<\/text>/g)]
  textNodes += texts.length
  for (const t of texts) addWords(words, t[0].replace(/<[^>]+>/g, ' '))
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
  addWords(words, f.text.replace(/<[^>]+>/g, ' '))
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
