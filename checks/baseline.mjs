#!/usr/bin/env node
/**
 * Baseline generator for the VISUAL gate (AC-34, AC-35).
 *
 *   npm run baseline -- --yes --reason "the hero crop changed in Figma"
 *   npm run baseline -- --yes --reason "..." --url http://localhost:4321
 *
 * What this script produces is the definition of "correct" for AC-34 and AC-35. That makes it the one
 * tool in checks/ that can turn a failing page green without changing a single pixel of the page, which
 * is precisely the move the whole workshop argues against. So it is deliberately loud, it refuses to
 * write anything without --yes and a written reason, and it prints what it did in enough detail that a
 * re-baseline shows up in a terminal scrollback and in a diff.
 *
 * The guard used to be `if (files already exist && !--yes) refuse`, which protected files rather than
 * the act of defining correct: `rm design/export/*.png && npm run baseline` walked straight past it and
 * wrote a fresh definition of correct from the current build, exit code 0. So the confirmation is now
 * unconditional, it is refused outright when nobody is at the keyboard, and every file written is
 * recorded in design/export/manifest.json with its sha256 and the reason given — which is what lets the
 * gate say "this baseline is not the one anybody signed off" instead of silently comparing against it.
 *
 * It serves dist/ itself, on an ephemeral port, rather than reusing whatever happens to be running on
 * 4321. A baseline captured against a stale dev server is a trap that costs an afternoon.
 *
 * It writes nothing until every capture has succeeded and every capture precondition has held. A
 * half-written baseline set is worse than no baseline set: the gate would compare three breakpoints
 * against two states of the page and report the difference as a defect.
 */

import { chromium } from '@playwright/test'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST_DIR = join(ROOT, 'dist')
const EXPORT_DIR = join(ROOT, 'design/export')
const MANIFEST_PATH = join(EXPORT_DIR, 'manifest.json')

/** A reason has to say something. Twelve characters is not a high bar; "update" should not clear it. */
const MIN_REASON_LENGTH = 12

/**
 * Environment that means an agent, not a person, is holding the keyboard.
 *
 * loop/ralph.sh runs the agent with --permission-mode acceptEdits and commits whatever it produced, so
 * "the loop cannot move the target" has to be enforced by something the loop runs into, not by a line
 * in a prompt. These are the markers the runners in this repository set, plus the usual CI ones.
 */
const AGENT_MARKERS = [
  'CI',
  'CONTINUOUS_INTEGRATION',
  'GITHUB_ACTIONS',
  'CLAUDE_CODE',
  'CLAUDECODE',
  'CLAUDE_CODE_ENTRYPOINT',
  'CODEX_SANDBOX',
  'RALPH_LOOP',
]

/** The section the design needs a picture of: AC-35 compares design/export/section-hero-{w}.png. */
const REQUIRED_SECTION = 'hero'

/**
 * Duplicated from checks/lib/gate.ts on purpose: that file is TypeScript and this one has to run under
 * plain `node` with no build step. If the widths there ever change, change them here in the same commit
 * or the gate will compare 1440 against a baseline captured at something else.
 */
const BREAKPOINTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
]

/**
 * MUST stay identical to CAPTURE_CSS in checks/specs/visual.spec.ts.
 *
 * The baseline and the gate have to photograph the page under the same rules. If they do not, the
 * percentage the gate reports measures the disagreement between these two files rather than anything
 * about the page, and no amount of fixing the page will move it.
 */
const CAPTURE_CSS = `
  *, *::before, *::after {
    animation-delay: 0s !important;
    animation-duration: 0s !important;
    animation-iteration-count: 1 !important;
    transition-delay: 0s !important;
    transition-duration: 0s !important;
    caret-color: transparent !important;
  }
  html {
    scroll-behavior: auto !important;
    scrollbar-width: none !important;
  }
  ::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
`

/** The skip link has no visual footprint in the composed frames — design/FIGMA-SPEC.md §8.2. */
const SECTIONS_WITHOUT_A_PICTURE = new Set(['skip-link'])

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
}

// ── CLI ───────────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2)
const has = (name) => argv.includes(name)
const valueOf = (name, fallback = null) => {
  const i = argv.indexOf(name)
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : fallback
}

if (has('--help') || has('-h')) {
  console.log(
    [
      'Regenerate the visual baselines in design/export/ from the current build.',
      '',
      'Usage: node checks/baseline.mjs --yes --reason "<why>" [options]',
      '',
      '  --yes            confirm that you are redefining what AC-34 and AC-35 mean by correct.',
      '                   Required whether or not baselines already exist: deleting them first is not',
      '                   a way around the question.',
      '  --reason <text>  why the target is moving. Recorded in design/export/manifest.json and printed.',
      '  --url <url>      capture an already-running server instead of serving dist/',
      '  --only <widths>  comma-separated subset of 390,768,1440',
      '  --help           this text',
      '',
      'Refused outright when stdin is not a terminal, or when an agent/CI marker is set in the',
      'environment. Recording a baseline is a decision a person makes after looking at the page.',
      '',
      'Files written, per width W in 390, 768, 1440:',
      '  design/export/W.png                  full page — what AC-34 compares against',
      '  design/export/section-<slug>-W.png   one per [data-section] — section-hero-W.png is AC-35',
      '  design/export/manifest.json          sha256 and reason for every file above',
    ].join('\n'),
  )
  process.exit(0)
}

const CONFIRMED = has('--yes')
const REASON = (valueOf('--reason') ?? '').trim()
const REMOTE_URL = valueOf('--url')
const ONLY = valueOf('--only')
  ? valueOf('--only')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isFinite(n))
  : null
const TARGET_BREAKPOINTS = ONLY ? BREAKPOINTS.filter((b) => ONLY.includes(b.width)) : BREAKPOINTS

// ── The warning ───────────────────────────────────────────────────────────────

function printWarning() {
  const line = '='.repeat(78)
  console.log(line)
  console.log('  REGENERATING THE VISUAL BASELINES')
  console.log(line)
  console.log('')
  console.log('  design/export/ is what AC-34 and AC-35 mean by "correct". Rewriting it from the')
  console.log('  current build makes the current build correct by definition: a page that fails the')
  console.log('  visual gate today will pass it the moment you run this, without one pixel of the')
  console.log('  page having changed.')
  console.log('')
  console.log('  That is a decision for a person who has looked at the page, not for the loop.')
  console.log('  Legitimate reasons: the design changed, or these baselines have never existed.')
  console.log('  Not a legitimate reason: the gate is red and you would like it to be green.')
  console.log('')
  console.log(line)
  console.log('')
}

// ── A static server for dist/ ─────────────────────────────────────────────────

/**
 * Small on purpose. astro preview would also work, but it needs a free fixed port and a second process
 * whose readiness has to be polled; this serves the exact bytes in dist/ on a port the OS picks, so two
 * people can run it at once and neither can accidentally capture the other's dev server.
 */
function serveDist() {
  return new Promise((resolvePromise, rejectPromise) => {
    const server = createServer((req, res) => {
      const urlPath = decodeURIComponent((req.url ?? '/').split('?')[0].split('#')[0])
      let filePath = join(DIST_DIR, urlPath)

      // Refuse anything that climbed out of dist/ — this server only ever publishes the build.
      if (!resolve(filePath).startsWith(DIST_DIR + sep) && resolve(filePath) !== DIST_DIR) {
        res.writeHead(403).end('forbidden')
        return
      }

      if (existsSync(filePath) && statSync(filePath).isDirectory()) filePath = join(filePath, 'index.html')
      if (!existsSync(filePath)) {
        res.writeHead(404, { 'content-type': 'text/plain' }).end('not found')
        return
      }

      const body = readFileSync(filePath)
      res.writeHead(200, {
        'content-type': MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
        'content-length': body.length,
        'cache-control': 'no-store',
      })
      res.end(body)
    })

    server.on('error', rejectPromise)
    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      resolvePromise({ server, url: `http://127.0.0.1:${address.port}` })
    })
  })
}

// ── Capture ───────────────────────────────────────────────────────────────────

/** Identical in intent to prepareForCapture() in checks/specs/visual.spec.ts. Keep the two in step. */
async function prepareForCapture(page) {
  await page.addStyleTag({ content: CAPTURE_CSS })

  await page.evaluate(async () => {
    const step = Math.max(200, window.innerHeight)
    const frame = () => new Promise((r) => requestAnimationFrame(() => r()))
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await frame()
    }
    window.scrollTo(0, 0)
    await frame()
  })

  await page
    .waitForFunction(() => Array.from(document.images).every((i) => i.complete), null, { timeout: 10_000 })
    .catch(() => undefined)

  await page.evaluate(async () => {
    await Promise.allSettled(Array.from(document.images).map((i) => i.decode().catch(() => undefined)))
    for (const animation of document.getAnimations()) {
      const timing = animation.effect?.getComputedTiming()
      if (timing && timing.iterations === Infinity) {
        animation.currentTime = 0
        animation.pause()
      } else {
        try {
          animation.finish()
        } catch {
          animation.pause()
        }
      }
    }
    const active = document.activeElement
    if (active instanceof HTMLElement) active.blur()
    await new Promise((r) => requestAnimationFrame(() => r()))
  })
}

/** The same reading AC-37 takes. A baseline captured mid-font-swap poisons every future run. */
async function readPreconditions(page) {
  const fontsReady = await page.evaluate(() =>
    Promise.race([
      document.fonts.ready.then(() => true),
      new Promise((r) => setTimeout(() => r(false), 5_000)),
    ]),
  )
  const rest = await page.evaluate(() => {
    const images = Array.from(document.images)
    return {
      fontStatus: document.fonts.status,
      imagesDecoded: images.filter((i) => i.complete && i.naturalWidth > 0).length,
      imagesTotal: images.length,
      running: document.getAnimations().filter((a) => a.playState === 'running').length,
    }
  })
  return {
    fontsReady: fontsReady && rest.fontStatus === 'loaded',
    imagesDecoded: rest.imagesDecoded,
    imagesTotal: rest.imagesTotal,
    animationsFrozen: rest.running === 0,
    runningAnimations: rest.running,
    fontStatus: rest.fontStatus,
  }
}

/** Page-coordinate boxes for every [data-section], in DOM order. */
async function sectionBoxes(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-section]')).map((el) => {
      const rect = el.getBoundingClientRect()
      return {
        slug: el.getAttribute('data-section') ?? '',
        x: rect.x + window.scrollX,
        y: rect.y + window.scrollY,
        width: rect.width,
        height: rect.height,
      }
    }),
  )
}

async function captureBreakpoint(browser, baseUrl, bp) {
  const context = await browser.newContext({
    viewport: { width: bp.width, height: bp.height },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
    forcedColors: 'none',
  })
  const page = await context.newPage()

  /**
   * Every request the page made, and what it got back.
   *
   * Learned the hard way: rebuild dist/ while this script is running and the capture lands in the
   * window where index.html exists but its content-hashed stylesheet does not. The page then renders
   * unstyled, the screenshot succeeds, the preconditions all hold — fonts loaded, no images, nothing
   * animating — and a picture of an unstyled page is written as the definition of correct. Nothing
   * downstream would ever tell you. A 404 during load is therefore fatal here.
   */
  const badResponses = []
  page.on('response', (response) => {
    if (response.status() >= 400) badResponses.push(`${response.status()} ${response.url()}`)
  })
  page.on('requestfailed', (request) => {
    badResponses.push(`failed ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`)
  })

  try {
    await page.goto(baseUrl, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => undefined)
    await prepareForCapture(page)

    if (badResponses.length) {
      throw new Error(
        `${badResponses.length} request(s) failed while loading at ${bp.width}px: ${badResponses.slice(0, 5).join('; ')}. ` +
          `The page did not render completely, so this capture is not a baseline. ` +
          `If dist/ was rebuilt while this ran, rebuild and try again.`,
      )
    }

    const pre = await readPreconditions(page)
    if (!pre.fontsReady || pre.imagesDecoded !== pre.imagesTotal || !pre.animationsFrozen) {
      throw new Error(
        `capture preconditions not met at ${bp.width}px — fonts ready ${pre.fontsReady} (${pre.fontStatus}), ` +
          `images decoded ${pre.imagesDecoded}/${pre.imagesTotal}, animations frozen ${pre.animationsFrozen}. ` +
          `Refusing to write a baseline from a capture the gate itself would reject.`,
      )
    }

    const fullPage = await page.screenshot({
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      scale: 'css',
      type: 'png',
    })
    const meta = await sharp(fullPage).metadata()

    const writes = [
      {
        // AC-34 reads design/export/{width}.png. design/FIGMA-SPEC.md §8.1 calls the same image
        // full-page-{width}.png; the gate accepts either, and this writes the name the contract uses.
        path: join(EXPORT_DIR, `${bp.width}.png`),
        buffer: fullPage,
        width: meta.width ?? 0,
        height: meta.height ?? 0,
        label: `full page @ ${bp.width}`,
      },
    ]

    const skipped = []
    const boxes = await sectionBoxes(page)

    for (const box of boxes) {
      if (!box.slug) continue
      if (SECTIONS_WITHOUT_A_PICTURE.has(box.slug)) {
        skipped.push(`${box.slug} (no visual footprint, FIGMA-SPEC §8.2)`)
        continue
      }
      if (box.width < 2 || box.height < 2) {
        skipped.push(`${box.slug} (${Math.round(box.width)}x${Math.round(box.height)}, nothing to capture)`)
        continue
      }

      // Cropped out of the full-page capture rather than screenshotted separately, so every section
      // baseline comes from the one page state — the same reason checks/specs/visual.spec.ts crops.
      const left = Math.max(0, Math.round(box.x))
      const top = Math.max(0, Math.round(box.y))
      const width = Math.max(1, Math.min(Math.round(box.width), (meta.width ?? 0) - left))
      const height = Math.max(1, Math.min(Math.round(box.height), (meta.height ?? 0) - top))
      const buffer = await sharp(fullPage).extract({ left, top, width, height }).png().toBuffer()

      writes.push({
        path: join(EXPORT_DIR, `section-${box.slug}-${bp.width}.png`),
        buffer,
        width,
        height,
        label: `${box.slug} @ ${bp.width}`,
      })
    }

    return { writes, skipped, slugs: boxes.map((b) => b.slug).filter(Boolean), preconditions: pre }
  } finally {
    await context.close()
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  printWarning()

  if (!REMOTE_URL && !existsSync(join(DIST_DIR, 'index.html'))) {
    console.error('ERROR: dist/index.html does not exist. Run `npm run build` first.')
    process.exit(1)
  }
  if (TARGET_BREAKPOINTS.length === 0) {
    console.error(`ERROR: --only matched no breakpoint. Valid widths: ${BREAKPOINTS.map((b) => b.width).join(', ')}`)
    process.exit(1)
  }

  mkdirSync(EXPORT_DIR, { recursive: true })
  const existing = readdirSync(EXPORT_DIR).filter((f) => f.toLowerCase().endsWith('.png'))

  /**
   * The confirmation is unconditional.
   *
   * The previous guard fired only when PNGs were already on disk, which protected the files and not
   * the decision: two commands — `rm design/export/*.png`, then `npm run baseline` — wrote a brand-new
   * definition of correct from the current build, printed warnings, and exited 0. An empty directory is
   * not consent.
   */
  if (!CONFIRMED || REASON.length < MIN_REASON_LENGTH) {
    console.error('REFUSING TO WRITE: recording a baseline redefines what AC-34 and AC-35 call correct.')
    console.error('')
    console.error(
      existing.length
        ? `design/export/ currently holds ${existing.length} PNG baseline(s); they would be replaced where names collide.`
        : 'design/export/ currently holds no PNG baseline, so this run would define the first one.',
    )
    console.error('')
    if (!CONFIRMED) console.error('  missing --yes')
    if (REASON.length < MIN_REASON_LENGTH) {
      console.error(
        REASON.length
          ? `  --reason "${REASON}" is ${REASON.length} characters; at least ${MIN_REASON_LENGTH} are required`
          : `  missing --reason "<why the target is moving>" (at least ${MIN_REASON_LENGTH} characters)`,
      )
    }
    console.error('')
    console.error('  npm run baseline -- --yes --reason "the hero crop changed in Figma"')
    console.error('')
    process.exit(1)
  }

  /**
   * And it has to be a person giving it.
   *
   * An agent running under loop/ralph.sh can type any flag it likes; what it cannot do is be at a
   * terminal. This is a speed bump rather than a security boundary — everything under checks/ is
   * off limits to the implementing agent by AGENTS.md, and this is what that rule looks like when it
   * is enforced by code instead of by a paragraph.
   */
  const marker = AGENT_MARKERS.find((name) => process.env[name])
  if (marker || !process.stdin.isTTY) {
    console.error('REFUSING TO WRITE: nobody is at the keyboard.')
    console.error('')
    console.error(
      marker
        ? `  ${marker} is set in the environment, which means this is a CI or agent run.`
        : '  stdin is not a terminal, so this is a script, a pipe or an agent rather than a person.',
    )
    console.error('')
    console.error('  A baseline is a human decision made after looking at the page. An agent that can move')
    console.error('  the target always hits it, which is the failure this repository exists to demonstrate.')
    console.error('  Run this yourself, in a terminal, and put the reason in the commit message too.')
    console.error('')
    process.exit(1)
  }

  console.log(`reason: ${REASON}`)
  console.log('')
  if (existing.length) {
    console.log(`--yes given: ${existing.length} existing PNG baseline(s) will be replaced where names collide.`)
    console.log('')
  }

  let server = null
  let browser = null

  try {
    let baseUrl = REMOTE_URL
    if (!baseUrl) {
      const served = await serveDist()
      server = served.server
      baseUrl = served.url
      console.log(`serving dist/ on ${baseUrl}`)
    } else {
      console.log(`capturing ${baseUrl} (given with --url; dist/ is not being served)`)
    }

    browser = await chromium.launch()

    const planned = []
    const slugsSeen = new Set()

    for (const bp of TARGET_BREAKPOINTS) {
      console.log(`capturing ${bp.width}x${bp.height} ...`)
      const result = await captureBreakpoint(browser, baseUrl, bp)
      planned.push(...result.writes)
      for (const slug of result.slugs) slugsSeen.add(slug)
      for (const s of result.skipped) console.log(`  skipped ${s}`)
      if (result.slugs.length === 0) {
        console.log('  WARNING: this page exposes no [data-section] elements.')
        console.log('  WARNING: only a full-page baseline was captured, and it is a picture of an unbuilt page.')
        console.log('  WARNING: AC-35 will stay unverifiable until the hero section exists and you re-run this.')
      }
    }

    // Everything captured cleanly, so it is safe to touch the directory.
    for (const write of planned) {
      writeFileSync(write.path, write.buffer)
    }

    console.log('')
    console.log(`wrote ${planned.length} file(s) to design/export/`)
    for (const write of planned) {
      const kb = (write.buffer.length / 1024).toFixed(0)
      console.log(`  ${relative(ROOT, write.path)}  ${write.width}x${write.height}  ${kb} KB`)
    }

    const written = new Set(planned.map((w) => w.path.split(sep).pop()))
    const stale = readdirSync(EXPORT_DIR).filter((f) => f.toLowerCase().endsWith('.png') && !written.has(f))
    if (stale.length) {
      console.log('')
      console.log(`NOTE: ${stale.length} PNG(s) in design/export/ were not written by this run and were left alone:`)
      for (const f of stale.slice(0, 12)) console.log(`  design/export/${f}`)
      if (stale.length > 12) console.log(`  ... and ${stale.length - 12} more`)
      console.log('If they belong to sections that no longer exist, delete them by hand — this script will not.')
    }

    console.log('')
    console.log(`These ${planned.length} file(s) are now what AC-34 and AC-35 compare the page against.`)
    console.log(
      `${slugsSeen.size} distinct [data-section] value(s) were seen${slugsSeen.size ? `: ${[...slugsSeen].join(', ')}` : ''}. ` +
        `Commit the result with a message that says why.`,
    )
    console.log('')
  } finally {
    await browser?.close()
    server?.close()
  }
}

main().catch((err) => {
  console.error('')
  console.error(`BASELINE FAILED: ${err?.message ?? err}`)
  console.error('Nothing was written. design/export/ is unchanged.')
  console.error('')
  process.exit(1)
})
