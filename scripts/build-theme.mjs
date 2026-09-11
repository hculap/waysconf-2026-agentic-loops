#!/usr/bin/env node
/**
 * Generate src/styles/theme.generated.css from design/tokens/tokens.json.
 *
 *   node scripts/build-theme.mjs
 *
 * Why this exists: Tailwind 4 builds its utility classes from the values it finds
 * in an `@theme` block. Those values have to be literals — a `@theme` entry that
 * points at a custom property of the same name is a cycle, and one that points at a
 * different name is a second place where the palette is written down.
 *
 * So the palette is written down exactly once, in tokens.json, and this script
 * mechanically derives the Tailwind bridge from it. The output is committed so that
 * a clean checkout builds without running this first, and the token gate treats the
 * generated file as part of the token layer rather than as hard-coded colour.
 */

import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const IN = join(ROOT, 'design/tokens/tokens.json')
const OUT = join(ROOT, 'src/styles/theme.generated.css')

/** Walk the DTCG tree and yield [dottedPath, token] for every leaf that has a $value. */
function* leaves(node, path = []) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue
    if (value && typeof value === 'object') {
      if ('$value' in value) yield [[...path, key], value]
      else yield* leaves(value, [...path, key])
    }
  }
}

/** DTCG alias syntax: {color.bg.base} -> var(--color-bg-base) */
function deref(value) {
  if (typeof value !== 'string') return value
  return value.replace(/\{([^}]+)\}/g, (_, ref) => `var(--${ref.split('.').join('-')})`)
}

/**
 * DTCG composite shadow -> the CSS `box-shadow` order.
 *
 * tokens.json carries the three shadow steps as objects rather than strings so that
 * the token gate can read the `color` field on its own and accept it inside
 * `box-shadow` without making plain black a legal text colour. Tailwind needs the
 * composed string, so the composing happens here.
 */
function shadowValue(v) {
  const parts = [v.offsetX, v.offsetY, v.blur, v.spread, v.color]
  if (parts.some((p) => p === undefined)) {
    throw new Error(`shadow token is missing a field: ${JSON.stringify(v)}`)
  }
  return parts.map((p) => String(deref(p))).join(' ')
}

function cssValue(token) {
  const v = token.$value
  if (Array.isArray(v)) {
    // font stacks: quote any family containing a space
    return v.map((f) => (/\s/.test(f) ? `'${f}'` : f)).join(', ')
  }
  if (v !== null && typeof v === 'object') {
    // String(object) is "[object Object]", which is valid CSS syntax and invalid at
    // computed-value time, so it fails silently. Refuse instead.
    if (token.$type !== 'shadow') {
      throw new Error(`cannot serialise a composite $value of $type "${token.$type}": ${JSON.stringify(v)}`)
    }
    return shadowValue(v)
  }
  return String(deref(v))
}

/**
 * Map a token path onto the Tailwind 4 theme namespace that generates the
 * utilities we actually want. Anything not named here is still emitted by
 * tokens.css as a plain custom property, it just does not become a utility.
 */
function themeName(path) {
  const [group, ...rest] = path
  const tail = rest.join('-')

  if (group === 'color') return `--color-${tail}`
  if (group === 'spacing') return `--spacing-${tail}`
  if (group === 'radius') return `--radius-${tail}`
  if (group === 'shadow') return `--shadow-${tail}`
  if (group === 'breakpoint') return `--breakpoint-${tail}`

  if (group === 'typography') {
    const [kind, ...name] = rest
    const n = name.join('-')
    if (kind === 'fontFamily') return `--font-${n}`
    if (kind === 'fontSize') return `--text-${n}`
    if (kind === 'fontWeight') return `--font-weight-${n}`
    if (kind === 'letterSpacing') return `--tracking-${n}`
  }
  return null
}

const tokens = JSON.parse(await readFile(IN, 'utf8'))

const groups = new Map()
for (const [path, token] of leaves(tokens)) {
  if (path[0] === 'meta' || path[0] === 'layout') continue
  const name = themeName(path)
  if (!name) continue
  const group = path[0] === 'typography' ? `typography · ${path[1]}` : path[0]
  if (!groups.has(group)) groups.set(group, [])
  groups.get(group).push({ name, value: cssValue(token), comment: token.$description })
}

const lines = [
  '/* ==========================================================================',
  '   GENERATED FILE — do not edit.',
  '',
  '   Source:    design/tokens/tokens.json',
  '   Generator: scripts/build-theme.mjs',
  '   Regenerate: node scripts/build-theme.mjs',
  '',
  '   This is the bridge that turns design tokens into Tailwind utility classes.',
  '   It is the one place in src/ where colour literals are allowed to appear,',
  '   because they are copied mechanically from the token file rather than chosen.',
  '   ========================================================================== */',
  '',
  '@theme {',
]

for (const [group, entries] of groups) {
  lines.push('')
  lines.push(`  /* ${group} */`)
  for (const e of entries) {
    lines.push(`  ${e.name}: ${e.value};${e.comment ? ` /* ${e.comment} */` : ''}`)
  }
}

lines.push('}', '')

await writeFile(OUT, lines.join('\n'))
console.log(`wrote ${OUT.replace(ROOT + '/', '')} — ${[...groups.values()].flat().length} tokens`)
