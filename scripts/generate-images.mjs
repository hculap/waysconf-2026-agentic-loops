#!/usr/bin/env node
/**
 * Generate the TURBINE image pack with Nano Banana Pro (gemini-3-pro-image).
 *
 * There is exactly one copy of every prompt, and it lives in design/assets/PROMPTS.md.
 * This script parses that document rather than holding its own copy, because the one
 * thing guaranteed to go wrong with a two-copy setup is that the copy nobody reads is
 * the one that runs.
 *
 * The contract is defined in PROMPTS.md §1.8:
 *
 *   <!-- gen:begin id="…" file="…" width="…" height="…" aspect="…" tier="…"
 *                  crop="…" format="…" quality="…" -->
 *   …prose, a metadata table, then ONE fenced ```text block holding the prompt…
 *   <!-- gen:end -->
 *
 * Two parsing rules that the document itself calls out, both load-bearing:
 *
 *   1. Fenced blocks are stripped before markers are located. PROMPTS.md contains an
 *      illustrative marker inside a fenced example; a naive parser finds 17 entries
 *      where there are 16.
 *   2. An entry with a missing or non-numeric attribute is rejected outright rather
 *      than defaulted. A silently-defaulted 512px hero is worse than a crash.
 *
 * Usage:
 *   node scripts/generate-images.mjs --dry-run        parse and report, generate nothing
 *   node scripts/generate-images.mjs --all            generate everything not already current
 *   node scripts/generate-images.mjs --only hero-hall generate matching ids (glob-ish)
 *   node scripts/generate-images.mjs --force          ignore the prompt-hash cache
 *   node scripts/generate-images.mjs --manifest       rewrite the manifest from disk, no calls
 *
 * Requires GEMINI_API_KEY. Every generated file is committed, so participants never
 * need a key, a billing account or a network round trip.
 */

import { readFile, writeFile, mkdir, appendFile, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PROMPTS_MD = join(ROOT, 'design/assets/PROMPTS.md')
const OUT_DIR = join(ROOT, 'design/assets')
const MANIFEST = join(OUT_DIR, 'manifest.json')
const LOG = join(ROOT, 'evidence/asset-generation.log')

const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const MODEL = 'gemini-3-pro-image'
const EXPECTED_ENTRIES = 16

/** Verified against the live API on 2026-09-11. '512px' is rejected; '512' is not. */
const VALID_TIERS = new Set(['512', '1K', '2K', '4K'])
const VALID_ASPECTS = new Set(['1:1', '3:2', '2:3', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9'])

/** Published price per image at the time of writing, by tier. */
const COST_BY_TIER = { '512': 0.134, '1K': 0.134, '2K': 0.134, '4K': 0.24 }

const argv = process.argv.slice(2)
const has = (f) => argv.includes(f)
const val = (f, d = null) => {
  const i = argv.indexOf(f)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : d
}

const DRY_RUN = has('--dry-run')
const FORCE = has('--force')
const MANIFEST_ONLY = has('--manifest')
const ONLY = val('--only')

// ── Parsing ───────────────────────────────────────────────────────────────────

/**
 * Replace every fenced block with a placeholder of the same line count, remembering
 * its content. Line counts are preserved so that error messages can still cite a
 * real line number in PROMPTS.md.
 */
function extractFences(markdown) {
  const lines = markdown.split('\n')
  const out = []
  const fences = []
  let open = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fenceMatch = line.match(/^\s*```(\w*)\s*$/)

    if (!open && fenceMatch) {
      open = { lang: fenceMatch[1] || '', startLine: i, body: [] }
      out.push(`<<FENCE:${fences.length}>>`)
      continue
    }
    if (open && fenceMatch) {
      fences.push({ lang: open.lang, body: open.body.join('\n'), line: open.startLine + 1 })
      out.push('')
      open = null
      continue
    }
    if (open) {
      open.body.push(line)
      out.push('')
      continue
    }
    out.push(line)
  }

  if (open) throw new Error(`Unterminated fenced block opened at PROMPTS.md:${open.startLine + 1}`)
  return { stripped: out.join('\n'), fences }
}

function parseAttributes(raw, lineNo) {
  const attrs = {}
  for (const m of raw.matchAll(/(\w+)="([^"]*)"/g)) attrs[m[1]] = m[2]

  const required = ['id', 'file', 'width', 'height', 'aspect', 'tier', 'crop', 'format', 'quality']
  const missing = required.filter((k) => !(k in attrs))
  if (missing.length) {
    throw new Error(`PROMPTS.md:${lineNo} — gen:begin is missing ${missing.join(', ')}`)
  }

  for (const k of ['width', 'height', 'quality']) {
    if (!/^\d+$/.test(attrs[k])) {
      throw new Error(`PROMPTS.md:${lineNo} — ${k}="${attrs[k]}" is not a number`)
    }
    attrs[k] = Number(attrs[k])
  }

  if (!VALID_TIERS.has(attrs.tier)) {
    throw new Error(
      `PROMPTS.md:${lineNo} — tier="${attrs.tier}" is not one of ${[...VALID_TIERS].join(', ')}`,
    )
  }
  if (!VALID_ASPECTS.has(attrs.aspect)) {
    throw new Error(
      `PROMPTS.md:${lineNo} — aspect="${attrs.aspect}" is not supported by ${MODEL}`,
    )
  }
  if (!['jpg', 'png'].includes(attrs.format)) {
    throw new Error(`PROMPTS.md:${lineNo} — format="${attrs.format}" must be jpg or png`)
  }
  return attrs
}

function parsePrompts(markdown) {
  const { stripped, fences } = extractFences(markdown)
  const lines = stripped.split('\n')

  const entries = []
  let current = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    const begin = line.match(/<!--\s*gen:begin\s+(.*?)\s*-->/)
    if (begin) {
      if (current) throw new Error(`PROMPTS.md:${i + 1} — gen:begin inside an open entry`)
      current = { attrs: parseAttributes(begin[1], i + 1), fenceIdx: [] }
      continue
    }

    if (current) {
      const fence = line.match(/^<<FENCE:(\d+)>>$/)
      if (fence) current.fenceIdx.push(Number(fence[1]))

      if (/<!--\s*gen:end\s*-->/.test(line)) {
        const textFence = current.fenceIdx.map((n) => fences[n]).find((f) => f.lang === 'text')
        if (!textFence) {
          throw new Error(
            `PROMPTS.md — entry "${current.attrs.id}" has no \`\`\`text block holding its prompt`,
          )
        }
        const prompt = textFence.body.trim()
        entries.push({
          ...current.attrs,
          prompt,
          promptHash: createHash('sha256').update(prompt).digest('hex'),
        })
        current = null
      }
    }
  }

  if (current) throw new Error(`PROMPTS.md — gen:begin for "${current.attrs.id}" was never closed`)

  const ids = entries.map((e) => e.id)
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i)
  if (dupes.length) throw new Error(`PROMPTS.md — duplicate ids: ${[...new Set(dupes)].join(', ')}`)

  return entries
}

// ── Generation ────────────────────────────────────────────────────────────────

function extractImage(payload) {
  if (payload?.output_image?.data) {
    return { data: payload.output_image.data, mime: payload.output_image.mime_type }
  }
  for (const step of payload?.steps ?? []) {
    for (const item of step?.content ?? []) {
      if (item?.type === 'image' && item?.data) return { data: item.data, mime: item.mime_type }
    }
    for (const out of step?.output ?? []) {
      if (out?.type === 'image' && out?.data) return { data: out.data, mime: out.mime_type }
    }
  }
  return null
}

async function callModel(entry, apiKey) {
  const body = {
    model: MODEL,
    input: [{ type: 'text', text: entry.prompt }],
    response_format: {
      type: 'image',
      mime_type: 'image/jpeg',
      aspect_ratio: entry.aspect,
      image_size: entry.tier,
    },
  }

  let lastError
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      // A fetch with no timeout is how an unattended loop turns into an unattended
      // hang. Observed in practice: one request to this endpoint stopped responding
      // and the whole run sat on it indefinitely. 4K images take around 40s, so 180s
      // is generous and still bounded.
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180_000),
      })
      if (res.ok) {
        const image = extractImage(await res.json())
        if (!image) throw new Error('response contained no image')
        return Buffer.from(image.data, 'base64')
      }
      const text = (await res.text()).slice(0, 300)
      if (res.status !== 429 && res.status < 500) throw new Error(`HTTP ${res.status}: ${text}`)
      lastError = new Error(`HTTP ${res.status}: ${text}`)
    } catch (err) {
      if (/HTTP 4(?!29)/.test(err.message)) throw err
      lastError = err
    }
    const backoff = 2 ** attempt * 1000
    process.stdout.write(`\n         retry ${attempt}/4 in ${backoff / 1000}s — ${lastError.message.slice(0, 80)}`)
    await new Promise((r) => setTimeout(r, backoff))
  }
  throw lastError
}

/**
 * Post-process to the exact target the design expects. The model returns a tier,
 * not a size, so every file goes through here — the visual diff gate compares against
 * design/export/ and a 2048px hero where a 2400px hero was specified is a diff.
 */
async function postProcess(bytes, entry) {
  let img = sharp(bytes, { failOn: 'error' })

  if (entry.crop && entry.crop !== 'none') {
    // crop="centre:W×H" — centre-crop to that box before resizing.
    const m = entry.crop.match(/centre:(\d+)[x×](\d+)/i)
    if (!m) {
      // PROMPTS.md §1.8: reject an attribute we cannot read rather than guessing a
      // default. Falling through here would silently ignore the declared crop and
      // leave `fit: 'cover'` to produce a plausible-looking file from a broken
      // marker, which is the worst of both outcomes.
      throw new Error(
        `${entry.id}: crop="${entry.crop}" is not understood. ` +
          `Use crop="none" or crop="centre:WIDTHxHEIGHT".`,
      )
    }
    const meta = await img.metadata()
    const [cw, ch] = [Number(m[1]), Number(m[2])]
    img = img.extract({
      left: Math.max(0, Math.round((meta.width - cw) / 2)),
      top: Math.max(0, Math.round((meta.height - ch) / 2)),
      width: Math.min(cw, meta.width),
      height: Math.min(ch, meta.height),
    })
  }

  img = img.resize(entry.width, entry.height, { fit: 'cover', position: 'centre' })

  if (entry.format === 'png') {
    // Textures are overlays: greyscale, with luminance moved into the alpha channel
    // so they multiply over any surface without carrying a colour of their own.
    const grey = await img.greyscale().raw().toBuffer({ resolveWithObject: true })
    const { data, info } = grey
    const rgba = Buffer.alloc(info.width * info.height * 4)
    for (let i = 0; i < info.width * info.height; i++) {
      rgba[i * 4] = 255
      rgba[i * 4 + 1] = 255
      rgba[i * 4 + 2] = 255
      rgba[i * 4 + 3] = data[i * info.channels]
    }
    return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer()
  }

  return img.jpeg({ quality: entry.quality, progressive: true, mozjpeg: true }).toBuffer()
}

// ── Manifest and log ──────────────────────────────────────────────────────────

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST, 'utf8'))
  } catch {
    return { model: MODEL, images: {} }
  }
}

async function logGeneration(line) {
  await mkdir(dirname(LOG), { recursive: true })
  await appendFile(LOG, line + '\n')
}

const fileExists = async (p) => {
  try {
    return (await stat(p)).size > 0
  } catch {
    return false
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const entries = parsePrompts(await readFile(PROMPTS_MD, 'utf8'))

  console.log(`\nParsed ${entries.length} entries from design/assets/PROMPTS.md`)
  if (entries.length !== EXPECTED_ENTRIES) {
    console.error(
      `\nExpected ${EXPECTED_ENTRIES} entries, found ${entries.length}.\n` +
        `PROMPTS.md §1.8 says a different number means the parse is wrong, not the file.\n` +
        `Ids found: ${entries.map((e) => e.id).join(', ')}`,
    )
    process.exit(1)
  }

  const manifest = await readManifest()

  if (MANIFEST_ONLY) {
    manifest.model = MODEL
    for (const e of entries) {
      manifest.images[e.id] = {
        file: e.file,
        width: e.width,
        height: e.height,
        aspect: e.aspect,
        tier: e.tier,
        format: e.format,
        promptHash: e.promptHash,
        present: await fileExists(join(OUT_DIR, e.file)),
      }
    }
    await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
    console.log(`Rewrote ${MANIFEST.replace(ROOT + '/', '')} from disk. No images generated.`)
    return
  }

  const selected = entries.filter((e) => {
    if (!ONLY) return true
    const pattern = new RegExp('^' + ONLY.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$')
    return pattern.test(e.id)
  })

  const queue = []
  for (const e of selected) {
    const out = join(OUT_DIR, e.file)
    const known = manifest.images?.[e.id]
    const current = (await fileExists(out)) && known?.promptHash === e.promptHash
    if (current && !FORCE) continue
    queue.push(e)
  }

  const cost = queue.reduce((n, e) => n + (COST_BY_TIER[e.tier] ?? 0.134), 0)
  console.log(
    `${queue.length} to generate, ${selected.length - queue.length} already current` +
      (queue.length ? ` — about USD ${cost.toFixed(2)}` : ''),
  )

  if (DRY_RUN) {
    for (const e of queue) {
      console.log(
        `  ${e.id.padEnd(26)} ${String(e.width).padStart(4)}x${String(e.height).padEnd(4)} ` +
          `${e.aspect.padEnd(5)} ${e.tier.padEnd(3)} ${e.format}  prompt ${e.promptHash.slice(0, 8)} ` +
          `(${e.prompt.length} chars)`,
      )
    }
    return
  }
  if (queue.length === 0) return

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('\nGEMINI_API_KEY is not set. Every image is already committed under design/assets/,')
    console.error('so this is only needed to regenerate the pack.')
    process.exit(1)
  }

  await mkdir(OUT_DIR, { recursive: true })
  const failures = []
  let done = 0

  // Serial on purpose. The pack is small, and a burst of parallel requests is the
  // quickest route to a rate limit you then have to explain from the stage.
  for (const e of queue) {
    process.stdout.write(`  ${e.id.padEnd(26)} `)
    const t0 = process.hrtime.bigint()
    try {
      const raw = await callModel(e, apiKey)
      const processed = await postProcess(raw, e)
      await writeFile(join(OUT_DIR, e.file), processed)

      const meta = await sharp(processed).metadata()
      if (meta.width !== e.width || meta.height !== e.height) {
        throw new Error(`post-process produced ${meta.width}x${meta.height}, expected ${e.width}x${e.height}`)
      }

      const seconds = Number(process.hrtime.bigint() - t0) / 1e9
      manifest.images[e.id] = {
        file: e.file,
        width: e.width,
        height: e.height,
        aspect: e.aspect,
        tier: e.tier,
        format: e.format,
        promptHash: e.promptHash,
        bytes: processed.length,
        present: true,
      }
      await logGeneration(
        [
          new Date().toISOString(),
          MODEL,
          e.id,
          e.promptHash.slice(0, 16),
          e.tier,
          `${e.width}x${e.height}`,
          `${processed.length}B`,
          `${seconds.toFixed(1)}s`,
          `USD~${(COST_BY_TIER[e.tier] ?? 0.134).toFixed(3)}`,
        ].join('\t'),
      )
      done++
      process.stdout.write(`ok  ${(processed.length / 1024).toFixed(0)} KB  ${seconds.toFixed(1)}s\n`)
    } catch (err) {
      failures.push({ id: e.id, error: err.message })
      process.stdout.write(`FAILED\n         ${err.message.slice(0, 220)}\n`)
    }
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
  console.log(`\n${done}/${queue.length} generated. Manifest and evidence log updated.`)

  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  ${f.id}: ${f.error.slice(0, 220)}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('\n' + err.message)
  process.exit(1)
})
