#!/usr/bin/env node
/**
 * Put the deck and the finished festival site under waysconf.szymonpaluch.com.
 *
 *   node scripts/build-subpaths.mjs
 *
 * The participant site is a hub with four doors: before the workshop, the workshop, the
 * slides, and the site they are going to build. All four live on one address — /deck/ and
 * /site/ are real folders on it, not redirects to two other Netlify projects, so a link the
 * speaker hands out stays on the domain people already have.
 *
 * Both are single-page builds that assume they own the root of their host, so neither can
 * simply be copied into a subfolder:
 *
 *   deck  Slidev supports this directly: --base /deck/ prefixes every asset, and the history
 *         routes (/deck/12) are served by a rewrite in guideline/_redirects.
 *
 *   site  Astro's base prefixes what Astro emits (/_astro/…), but the festival's source also
 *         writes /images/…, /fonts/… and /favicon.svg by hand. Those are rewritten here, in
 *         the copy, after the build. The reference source and its own build, which
 *         checks/ measures, are never touched: this is a second output, not a second site.
 *
 * Output goes to guideline/deck/ and guideline/site/, which are build artifacts and ignored
 * by git. checks/guideline-subpaths.mjs loads both and fails on any request that 404s.
 */

import { spawnSync } from 'node:child_process'
import { readFile, writeFile, rm, readdir, mkdir, cp } from 'node:fs/promises'
import { join, resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'guideline')

const run = (cmd, args, cwd) => {
  const r = spawnSync(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' })
  if (r.status !== 0) {
    throw new Error(`${cmd} ${args.join(' ')} failed in ${cwd}\n${(r.stderr || r.stdout).slice(-2000)}`)
  }
  return r.stdout
}

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(
    entries.map((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])),
  )
  return nested.flat()
}

// ── deck ─────────────────────────────────────────────────────────────────────
{
  const dest = join(OUT, 'deck')
  await rm(dest, { recursive: true, force: true })
  run('npm', ['run', 'sync:diagrams'], join(ROOT, 'deck'))
  run('npx', ['slidev', 'build', 'slides.md', '--base', '/deck/', '--out', dest], join(ROOT, 'deck'))
  const files = await walk(dest)
  console.log(`  deck  → guideline/deck/   ${files.length} files, base /deck/`)
}

// ── festival site ────────────────────────────────────────────────────────────
{
  const tmp = join(ROOT, '.astro-subpath')
  const dest = join(OUT, 'site')
  await rm(tmp, { recursive: true, force: true })
  await rm(dest, { recursive: true, force: true })

  // Astro's JS API merges this over astro.config.mjs, so the only differences from the
  // reference build are the base and where the files land.
  const { build } = await import(join(ROOT, 'node_modules/astro/dist/core/index.js'))
  await build({ root: ROOT, base: '/site/', outDir: tmp, logLevel: 'error' })

  // Rewrite the root-absolute references the source writes by hand. Anything already under
  // /site/, protocol-relative (//) or a full URL is left alone.
  const ROOTED = /((?:href|src|content|poster|action)=["']|srcset=["'][^"']*?|url\(\s*["']?)\/(?!\/|site\/)/g
  const SRCSET_ITEM = /(,\s*)\/(?!\/|site\/)/g
  let rewritten = 0
  for (const file of await walk(tmp)) {
    if (!['.html', '.css', '.js', '.xml', '.webmanifest', '.json'].includes(extname(file))) continue
    const before = await readFile(file, 'utf8')
    let after = before.replace(ROOTED, (_, lead) => `${lead}/site/`)
    after = after.replace(/srcset=["'][^"']*["']/g, (attr) => attr.replace(SRCSET_ITEM, '$1/site/'))
    if (after !== before) {
      rewritten++
      await writeFile(file, after)
    }
  }

  await mkdir(dest, { recursive: true })
  await cp(tmp, dest, { recursive: true })
  await rm(tmp, { recursive: true, force: true })
  const files = await walk(dest)
  console.log(`  site  → guideline/site/   ${files.length} files, base /site/, ${rewritten} files had hand-written root paths rewritten`)
}

console.log('\nNext: node scripts/build-guideline.mjs, then node checks/guideline-subpaths.mjs')
