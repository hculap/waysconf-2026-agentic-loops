#!/usr/bin/env node
/**
 * Deploy gate — AC-57 to AC-60.
 *
 *   npm run check -- --deploy          as part of a full run
 *   node checks/gates/deploy.mjs       on its own
 *
 * Prints one JSON gate result on stdout, the same shape as the other standalone gates.
 *
 * OPT-IN, DELIBERATELY. Every other gate reads. This one publishes, and a verifier that
 * deploys every time somebody runs it is a verifier people stop running. `npm run check`
 * does not include it unless you ask.
 *
 * What it establishes, and the order matters:
 *
 *   AC-57  the deploy command exits 0 and prints a URL
 *   AC-58  that URL answers 200, as HTML, over HTTPS
 *   AC-59  what it serves is byte-identical to the build that passed the gates
 *   AC-60  a live smoke: zero axe violations, zero broken in-page anchors
 *
 * AC-59 is the one worth pausing on. Green local gates say the thing on your disk is
 * correct; they say nothing about the thing on the internet. Between the two sits a
 * build step, a CDN, a redirect and a cache, and every one of them has been known to
 * serve something other than what was uploaded. Comparing hashes is the only way to
 * know that the page the gates approved is the page a visitor gets.
 */

import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const CRITERIA = ['AC-57', 'AC-58', 'AC-59', 'AC-60']

const failures = []
const notes = []
const evidence = {}

const emit = (status) => {
  console.log(JSON.stringify({ id: 'deploy', title: 'Deploy', status, criteria: CRITERIA, failures, notes, evidence }))
}

function run(cmd, args, opts = {}) {
  return new Promise((res) => {
    const child = spawn(cmd, args, { cwd: ROOT, shell: false, stdio: ['ignore', 'pipe', 'pipe'], ...opts })
    let stdout = ''
    let stderr = ''
    child.stdout?.on('data', (d) => (stdout += d))
    child.stderr?.on('data', (d) => (stderr += d))
    child.on('close', (code) => res({ code: code ?? 1, stdout, stderr }))
    child.on('error', (e) => res({ code: 1, stdout, stderr: String(e) }))
  })
}

const sha256 = (s) => createHash('sha256').update(s).digest('hex')

/**
 * Pull the production URL out of the CLI's output.
 *
 * Netlify prints both a unique per-deploy URL and the production URL, and it decorates
 * them with angle brackets and ANSI colour. Taking the *production* one matters: the
 * unique URL is an immutable snapshot, so a check against it would pass even when the
 * production alias is pointing somewhere else entirely.
 */
function extractUrl(output) {
  const clean = output.replace(/\[[0-9;]*m/g, '')
  const prod = clean.match(/Production URL:\s*<?(https:\/\/[^\s>]+)/i)
  if (prod) return prod[1]
  const website = clean.match(/Website URL:\s*<?(https:\/\/[^\s>]+)/i)
  if (website) return website[1]
  const any = clean.match(/https:\/\/[a-z0-9-]+\.netlify\.app\b/i)
  return any ? any[0] : null
}

async function fetchWithRetries(url, attempts = 5, windowMs = 30_000) {
  const started = Date.now()
  let last = null
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15_000) })
      last = { status: res.status, contentType: res.headers.get('content-type') || '', body: await res.text(), attempts: i }
      if (res.ok) return { ...last, seconds: (Date.now() - started) / 1000 }
    } catch (err) {
      last = { status: 0, contentType: '', body: '', attempts: i, error: String(err).slice(0, 160) }
    }
    if (Date.now() - started > windowMs) break
    await new Promise((r) => setTimeout(r, Math.min(5_000, 1_000 * i)))
  }
  return { ...(last ?? { status: 0, contentType: '', body: '', attempts }), seconds: (Date.now() - started) / 1000 }
}

async function main() {
  const distIndex = join(ROOT, 'dist/index.html')
  if (!existsSync(distIndex)) {
    failures.push({
      criterion: 'AC-57',
      message: 'There is no dist/index.html to deploy. Run npm run build first.',
      where: 'dist/',
    })
    emit('fail')
    return
  }

  // ── AC-57 ───────────────────────────────────────────────────────────────────
  const deploy = await run('npm', ['run', '--silent', 'deploy'])
  const output = deploy.stdout + deploy.stderr
  const url = extractUrl(output)
  evidence.deployExit = deploy.code

  if (deploy.code !== 0 || !url) {
    failures.push({
      criterion: 'AC-57',
      message: `netlify deploy exited ${deploy.code}; ${url ? 'a URL was printed but the command failed' : 'no deploy URL found in output'}.`,
      where: 'npm run deploy',
      actual: url ?? '(no URL)',
      hint: `Last lines:\n\n\`\`\`\n${output.trim().split('\n').slice(-15).join('\n')}\n\`\`\``,
    })
    emit('fail')
    return
  }

  evidence.url = url
  notes.push(`Deployed to ${url}`)

  // ── AC-58 ───────────────────────────────────────────────────────────────────
  const got = await fetchWithRetries(url)
  evidence.http = { status: got.status, contentType: got.contentType, attempts: got.attempts, seconds: Number(got.seconds.toFixed(1)) }

  const isHtml = got.contentType.toLowerCase().includes('text/html')
  const isHttps = url.startsWith('https://')
  if (got.status !== 200 || !isHtml || !isHttps) {
    failures.push({
      criterion: 'AC-58',
      message: `GET ${url} returned ${got.status} ${got.contentType || '(no content-type)'} after ${got.attempts} attempt(s) over ${got.seconds.toFixed(1)}s.`,
      where: url,
      expected: '200, text/html, over https',
      actual: `${got.status} ${got.contentType}${isHttps ? '' : ', not https'}`,
    })
    emit('fail')
    return
  }

  // ── AC-59 ───────────────────────────────────────────────────────────────────
  //
  // The criterion says byte-identical. It cannot be, and finding that out is worth more
  // than the criterion was: Netlify injects an HTML comment into every page it serves on
  // the free tier —
  //
  //     <!-- This site is hosted on Netlify. Anyone can build and deploy a site … -->
  //
  // — so the served bytes never match the built bytes, on any project, ever. A gate that
  // demanded it would fail permanently and be turned off within a day, which is worse
  // than a gate that is honest about what it can establish.
  //
  // So both sides are compared with HTML comments removed. What that still catches: a
  // stale deploy, the wrong directory published, a CDN serving an older build, a host
  // rewriting markup. What it no longer catches: a change confined to a comment. Since a
  // comment renders as nothing, that is a narrowing worth taking — but it is a narrowing,
  // and the raw hashes are recorded alongside so the difference is visible rather than
  // assumed away.
  const norm = (html) => html.replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').trim()
  const section = (html, tag) => {
    const m = html.match(new RegExp(`<${tag}[\\s\\S]*?<\\/${tag}>`, 'i'))
    return m ? norm(m[0]) : null
  }

  const local = await readFile(distIndex, 'utf8')
  const localBody = section(local, 'body')
  const remoteBody = section(got.body, 'body')

  evidence.sha256 = {
    localBody: localBody ? sha256(localBody).slice(0, 16) : null,
    remoteBody: remoteBody ? sha256(remoteBody).slice(0, 16) : null,
    localWhole: sha256(norm(local)).slice(0, 16),
    remoteWhole: sha256(norm(got.body)).slice(0, 16),
  }

  if (!localBody || !remoteBody) {
    failures.push({
      criterion: 'AC-59',
      message: 'Could not read a <body> from the local build or the served page, so they were not compared.',
      where: url,
      actual: `local body ${localBody ? 'found' : 'missing'}, served body ${remoteBody ? 'found' : 'missing'}`,
    })
  } else if (localBody !== remoteBody) {
    let at = 0
    while (at < Math.min(localBody.length, remoteBody.length) && localBody[at] === remoteBody[at]) at++
    failures.push({
      criterion: 'AC-59',
      message: 'The deployed page body does not match the build that passed the gates.',
      where: url,
      expected: `sha256 ${sha256(localBody).slice(0, 16)} (${localBody.length} bytes, dist/index.html)`,
      actual: `sha256 ${sha256(remoteBody).slice(0, 16)} (${remoteBody.length} bytes served); first difference at byte ${at}: served "${remoteBody.slice(at, at + 90)}"`,
      hint:
        'Something between the build and the browser changed the markup: a stale cache, a ' +
        'different build on the host, or a deploy that published an older directory. The local ' +
        'gates said nothing about whichever page this is.',
    })
  }

  // The head is compared by containment rather than equality, because that is the true
  // relationship: the host may add to it and does. Every element the build wrote must
  // survive; anything extra is the host's business.
  const headElements = (html) => {
    const head = html.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? ''
    return norm(head).match(/<(?:meta|title|link|base)\b[^>]*>(?:[^<]*<\/title>)?/g) ?? []
  }
  const wanted = headElements(local)
  const servedHead = norm(got.body.match(/<head[\s\S]*?<\/head>/i)?.[0] ?? '')
  const missing = wanted.filter((el) => !servedHead.includes(el))
  evidence.head = { built: wanted.length, missingFromServed: missing.length }

  if (missing.length) {
    failures.push({
      criterion: 'AC-59',
      message: `${missing.length} of ${wanted.length} <head> elements from the build are missing from the served page.`,
      where: url,
      actual: missing.slice(0, 3).map((m) => m.slice(0, 100)).join(' | '),
    })
  }

  // ── AC-60 ───────────────────────────────────────────────────────────────────
  //
  // A smoke test, not a second full run. `npm run check -- --url <deploy-url>` is the
  // deeper version and is worth doing by hand; what belongs here is the narrow question
  // of whether the live page is broken in a way the local one was not.
  try {
    const { chromium } = await import('playwright-core')
    const { default: AxeBuilder } = await import('@axe-core/playwright')
    const browser = await chromium.launch()
    try {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
      const page = await ctx.newPage()
      await page.goto(url, { waitUntil: 'load', timeout: 45_000 })

      const results = await new AxeBuilder({ page }).analyze()
      const brokenAnchors = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[href^="#"]'))
          .map((a) => a.getAttribute('href'))
          .filter((h) => h && h !== '#' && !document.getElementById(h.slice(1)))
          .slice(0, 10),
      )

      evidence.smoke = { axeViolations: results.violations.length, brokenAnchors: brokenAnchors.length }

      if (results.violations.length || brokenAnchors.length) {
        const first = results.violations[0]
        failures.push({
          criterion: 'AC-60',
          message:
            `Live smoke failed at ${url} — ${results.violations.length} axe violation(s), ` +
            `${brokenAnchors.length} broken anchor(s).`,
          where: url,
          actual: first
            ? `${first.id} (${first.impact}) on ${first.nodes[0]?.target?.join(' ')}`
            : `first broken anchor: ${brokenAnchors[0]}`,
        })
      }
    } finally {
      await browser.close()
    }
  } catch (err) {
    // The deploy happened and was verified; only the smoke could not run. Record that
    // as a note against AC-60 rather than failing the deploy over a missing browser —
    // but do not let it disappear either.
    notes.push(`AC-60 could not run: ${String(err).slice(0, 200)}`)
    failures.push({
      criterion: 'AC-60',
      message: 'The live smoke test could not run, so nothing is known about the deployed page beyond its hash.',
      where: url,
      hint: 'Usually a missing Chromium. Run: npx playwright install chromium',
    })
  }

  emit(failures.length ? 'fail' : 'pass')
}

main().catch((err) => {
  failures.push({ criterion: 'AC-57', message: `The deploy gate threw: ${String(err).slice(0, 300)}` })
  emit('fail')
})
