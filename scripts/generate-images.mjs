#!/usr/bin/env node
/**
 * Generate the TURBINE image pack with Google's Nano Banana Pro (gemini-3-pro-image).
 *
 * Source of truth is design/assets/prompts.json. design/assets/PROMPTS.md is the
 * human-readable companion and must agree with it — scripts/verify-prompts.mjs checks that.
 *
 *   node scripts/generate-images.mjs                 # generate everything missing
 *   node scripts/generate-images.mjs --force         # regenerate everything
 *   node scripts/generate-images.mjs --only hero     # generate ids matching a substring
 *   node scripts/generate-images.mjs --dry-run       # print what would be generated
 *
 * Requires GEMINI_API_KEY in the environment. Roughly USD 0.134 per image.
 */

import { readFile, writeFile, mkdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const MANIFEST = join(ROOT, 'design/assets/prompts.json')
const OUT_DIR = join(ROOT, 'design/assets')
const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const MODEL = 'gemini-3-pro-image'
const COST_PER_IMAGE_USD = 0.134

const args = process.argv.slice(2)
const FORCE = args.includes('--force')
const DRY_RUN = args.includes('--dry-run')
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null

const exists = async (p) => {
  try {
    const s = await stat(p)
    return s.size > 0
  } catch {
    return false
  }
}

/**
 * Pull the base64 image bytes out of whichever response shape the API returns.
 *
 * Verified against the live endpoint on 2026-09-11: the bytes arrive at
 *   steps[] -> type "model_output" -> content[] -> type "image" -> data
 * The documented `output_image` field was not present in the real response, so it is
 * checked first but not relied upon.
 */
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
  // generateContent shape (older), kept as a fallback so this script does not
  // become useless the moment the endpoint is versioned again.
  for (const cand of payload?.candidates ?? []) {
    for (const part of cand?.content?.parts ?? []) {
      if (part?.inlineData?.data) {
        return { data: part.inlineData.data, mime: part.inlineData.mimeType }
      }
    }
  }
  return null
}

async function generateOne(spec, apiKey) {
  const body = {
    model: MODEL,
    input: [{ type: 'text', text: spec.prompt }],
    response_format: {
      type: 'image',
      mime_type: spec.file.endsWith('.png') ? 'image/png' : 'image/jpeg',
      aspect_ratio: spec.aspect_ratio,
      image_size: spec.image_size,
    },
  }

  let lastError
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'x-goog-api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        // 429 and 5xx are worth retrying; 4xx otherwise is a real error in our request.
        if (res.status !== 429 && res.status < 500) {
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 400)}`)
        }
        lastError = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`)
      } else {
        const payload = await res.json()
        const image = extractImage(payload)
        if (!image) {
          throw new Error(
            `no image in response. Keys: ${Object.keys(payload).join(', ')}. ` +
              `Body starts: ${JSON.stringify(payload).slice(0, 400)}`,
          )
        }
        return Buffer.from(image.data, 'base64')
      }
    } catch (err) {
      lastError = err
      if (String(err.message).startsWith('HTTP 4') && !String(err.message).startsWith('HTTP 429')) {
        throw err
      }
    }
    const backoff = 2 ** attempt * 1000
    process.stdout.write(`    retry ${attempt}/4 in ${backoff / 1000}s — ${lastError?.message?.slice(0, 90)}\n`)
    await new Promise((r) => setTimeout(r, backoff))
  }
  throw lastError ?? new Error('generation failed')
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey && !DRY_RUN) {
    console.error('GEMINI_API_KEY is not set. Every image is already committed under')
    console.error('design/assets/, so you only need this to regenerate the pack.')
    process.exit(1)
  }

  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  await mkdir(OUT_DIR, { recursive: true })

  const queue = []
  for (const spec of manifest.images) {
    if (ONLY && !spec.id.includes(ONLY)) continue
    const out = join(OUT_DIR, spec.file)
    if (!FORCE && (await exists(out))) {
      console.log(`  skip   ${spec.file}  (already present)`)
      continue
    }
    queue.push({ spec, out })
  }

  if (queue.length === 0) {
    console.log('\nNothing to generate. Pass --force to regenerate.')
    return
  }

  console.log(
    `\n${queue.length} image(s) to generate — about USD ${(queue.length * COST_PER_IMAGE_USD).toFixed(2)}\n`,
  )

  if (DRY_RUN) {
    for (const { spec } of queue) {
      console.log(`  ${spec.file}  ${spec.aspect_ratio} ${spec.image_size}`)
      console.log(`    ${spec.prompt.slice(0, 160).replace(/\s+/g, ' ')}…\n`)
    }
    return
  }

  const failures = []
  let done = 0
  // Serial on purpose: the pack is small, and a burst of parallel requests is the
  // fastest way to meet a rate limit you then have to explain on stage.
  for (const { spec, out } of queue) {
    process.stdout.write(`  gen    ${spec.file} … `)
    try {
      const bytes = await generateOne(spec, apiKey)
      await writeFile(out, bytes)
      done++
      process.stdout.write(`ok (${(bytes.length / 1024).toFixed(0)} KB)\n`)
    } catch (err) {
      failures.push({ file: spec.file, error: err.message })
      process.stdout.write(`FAILED\n         ${err.message.slice(0, 200)}\n`)
    }
  }

  console.log(`\n${done}/${queue.length} generated.`)
  if (failures.length) {
    console.log('\nFailures:')
    for (const f of failures) console.log(`  ${f.file}: ${f.error.slice(0, 200)}`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
