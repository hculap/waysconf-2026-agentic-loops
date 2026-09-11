#!/usr/bin/env node
/**
 * Turn prompts/*.md into the page a participant actually uses.
 *
 *   node scripts/build-prompts-page.mjs
 *
 * Writes guideline/prompts/index.html — one page, seven prompts, a copy button on each.
 * No repository to clone and no file to open in an editor: the design is a Figma link, the
 * prompts are this page, and everything else the agent makes for itself.
 *
 * The markdown files are the source. This only renders them, so a prompt is never edited
 * in two places — which is the failure that would matter most here, since a prompt that
 * differs between the page and the repository is a prompt nobody can debug.
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'prompts')
const OUT = join(ROOT, 'guideline/prompts')

const FIGMA_URL = process.env.FIGMA_URL || '#figma-link-goes-here'
const PACK_URL = process.env.PACK_URL || '/design-pack.zip'

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * A small markdown renderer, deliberately not a library.
 *
 * It handles exactly what these seven files use: headings, paragraphs, fenced blocks,
 * tables, lists, blockquotes, bold, and inline code. Anything it does not know about it
 * passes through escaped, which fails visibly rather than silently.
 */
function render(md) {
  const lines = md.split('\n')
  const out = []
  let i = 0
  let promptIndex = 0

  const inline = (t) =>
    esc(t)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')

  while (i < lines.length) {
    const line = lines[i]

    // fenced block
    if (/^```/.test(line)) {
      const lang = line.slice(3).trim()
      const body = []
      i++
      while (i < lines.length && !/^```/.test(lines[i])) body.push(lines[i++])
      i++
      if (lang === 'text') {
        promptIndex++
        const id = `p${promptIndex}`
        out.push(
          `<div class="prompt">` +
            `<div class="prompt__bar"><span class="prompt__label">Paste this to your agent</span>` +
            `<button class="copy" type="button" data-for="${id}">Copy</button></div>` +
            `<pre id="${id}"><code>${esc(body.join('\n'))}</code></pre></div>`,
        )
      } else {
        out.push(`<pre class="plain"><code>${esc(body.join('\n'))}</code></pre>`)
      }
      continue
    }

    // table
    if (/^\|/.test(line) && /^\|[\s:|-]+\|$/.test(lines[i + 1] ?? '')) {
      const head = line.split('|').slice(1, -1).map((c) => c.trim())
      i += 2
      const rows = []
      while (i < lines.length && /^\|/.test(lines[i])) {
        rows.push(lines[i].split('|').slice(1, -1).map((c) => c.trim()))
        i++
      }
      out.push(
        `<table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead>` +
          `<tbody>${rows
            .map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`,
      )
      continue
    }

    // heading
    // Every heading inside a prompt file renders as h3. The section title above it is the
    // h2, so mapping ## to h3 and ### to h4 would skip a level wherever a file opens with
    // ### — which all seven of them do. Flat is correct here; clever is not.
    const h = line.match(/^(#{1,4})\s+(.*)$/)
    if (h) {
      out.push(`<h3>${inline(h[2])}</h3>`)
      i++
      continue
    }

    // blockquote
    if (/^>\s?/.test(line)) {
      const body = []
      while (i < lines.length && /^>\s?/.test(lines[i])) body.push(lines[i++].replace(/^>\s?/, ''))
      out.push(`<blockquote>${inline(body.join(' '))}</blockquote>`)
      continue
    }

    // list
    if (/^\s*[-*]\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''))
        i++
      }
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`)
      continue
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      const items = []
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''))
        i++
      }
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`)
      continue
    }

    // horizontal rule
    if (/^---+$/.test(line)) {
      out.push('<hr>')
      i++
      continue
    }

    if (!line.trim()) {
      i++
      continue
    }

    // paragraph
    const body = []
    while (i < lines.length && lines[i].trim() && !/^(#{1,4}\s|```|\||>|\s*[-*]\s|\s*\d+\.\s|---+$)/.test(lines[i])) {
      body.push(lines[i++])
    }
    out.push(`<p>${inline(body.join(' '))}</p>`)
  }

  return out.join('\n')
}

const CSS = `
:root{
  --bg:#0A0B0D; --surface:#131519; --raised:#1C1F25;
  --line:#2A2E36; --line-2:#3D434E;
  --fg:#F2F4F7; --fg-2:#A7AEBB; --muted:#6B7280;
  --sodium:#FF6A1A; --coolant:#2FE6D6; --arc:#7C5CFF;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;background:var(--bg);color:var(--fg);
  font:400 17px/1.6 Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
  -webkit-font-smoothing:antialiased;
}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition-duration:.01ms!important;animation-duration:.01ms!important}}
:focus-visible{outline:2px solid var(--coolant);outline-offset:2px}
.skip{position:absolute;left:16px;top:16px;z-index:99;transform:translateY(-200%);background:var(--sodium);color:var(--bg);padding:12px 16px;border-radius:8px;font-weight:600;text-decoration:none;transition:transform .15s}
.skip:focus{transform:none}
.wrap{max-width:820px;margin:0 auto;padding-inline:24px}
@media(min-width:768px){.wrap{padding-inline:48px}}

header.top{border-bottom:1px solid var(--line);background:var(--surface);position:sticky;top:0;z-index:10}
.top .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-block:16px}
.wordmark{font-family:'Space Grotesk',system-ui,sans-serif;font-weight:700;letter-spacing:.18em;color:var(--sodium);font-size:15px}
.top nav{display:flex;gap:18px;overflow-x:auto;font-size:14px}
.top nav a{color:var(--fg-2);text-decoration:none;white-space:nowrap}
.top nav a:hover{color:var(--fg)}

h1{font-family:'Space Grotesk',system-ui,sans-serif;font-size:clamp(34px,6vw,56px);line-height:1.05;letter-spacing:-.02em;margin:48px 0 16px}
h2{font-family:'Space Grotesk',system-ui,sans-serif;font-size:clamp(24px,4vw,34px);line-height:1.15;letter-spacing:-.02em;margin:8px 0 12px}
h3{font-family:'Space Grotesk',system-ui,sans-serif;font-size:20px;margin:28px 0 8px}
h4{font-size:16px;color:var(--coolant);margin:20px 0 6px;text-transform:none}
p,li{color:var(--fg-2)}
strong{color:var(--fg);font-weight:600}
a{color:var(--coolant)}
hr{border:0;border-top:1px solid var(--line);margin:28px 0}
code{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:.88em;background:var(--raised);color:var(--fg);padding:.12em .38em;border-radius:4px}
blockquote{border-left:3px solid var(--sodium);background:var(--surface);margin:18px 0;padding:14px 18px;border-radius:0 8px 8px 0}
blockquote p{color:var(--fg);margin:0}
table{width:100%;border-collapse:collapse;margin:16px 0;font-size:15px}
th{text-align:left;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--coolant);border-bottom:1px solid var(--line-2);padding:8px 10px}
td{border-bottom:1px solid var(--line);padding:9px 10px;color:var(--fg-2);vertical-align:top}

.lede{font-size:20px;color:var(--fg);max-width:62ch}
.need{display:grid;gap:16px;margin:28px 0 8px}
@media(min-width:768px){.need{grid-template-columns:1fr 1fr}}
.need a{display:block;border:1px solid var(--line);background:var(--surface);border-radius:12px;padding:20px;text-decoration:none;color:inherit}
.need a:hover{border-color:var(--line-2)}
.need b{display:block;font-family:'Space Grotesk',system-ui,sans-serif;font-size:19px;color:var(--fg);margin-bottom:4px}
.need span{display:block;color:var(--fg-2);font-size:15px}
.need em{display:block;margin-top:10px;color:var(--coolant);font-style:normal;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.06em;text-transform:uppercase}

.step{border-top:1px solid var(--line);padding-top:36px;margin-top:44px}
.step__no{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:12px;letter-spacing:.08em;color:var(--coolant);text-transform:uppercase}

.prompt{border:1px solid var(--line-2);border-radius:12px;overflow:hidden;margin:18px 0;background:var(--surface)}
.prompt__bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 14px;background:var(--raised);border-bottom:1px solid var(--line)}
.prompt__label{font-family:'JetBrains Mono',ui-monospace,monospace;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:var(--fg-2)}
.copy{font:600 13px/1 Inter,system-ui,sans-serif;background:var(--sodium);color:var(--bg);border:0;border-radius:6px;padding:8px 14px;cursor:pointer;min-height:32px}
.copy:hover{filter:brightness(1.08)}
.copy[data-done]{background:#3DDC84}
pre{margin:0;padding:18px;overflow-x:auto}
pre code{background:none;padding:0;font-size:14px;line-height:1.62;color:var(--fg);white-space:pre-wrap;word-break:break-word}
pre.plain{background:var(--surface);border:1px solid var(--line);border-radius:10px;margin:14px 0}

footer{border-top:1px solid var(--line);margin-top:64px;padding-block:36px 56px}
footer p{font-size:14px}
.legal{color:var(--fg-2);font-size:13px}
`

const JS = `
document.querySelectorAll('.copy').forEach(function(btn){
  btn.addEventListener('click', function(){
    var pre = document.getElementById(btn.dataset.for);
    if (!pre) return;
    var text = pre.innerText;
    var done = function(){
      btn.textContent = 'Copied';
      btn.setAttribute('data-done','');
      setTimeout(function(){ btn.textContent = 'Copy'; btn.removeAttribute('data-done'); }, 1600);
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function(){ fallback(text, done); });
    } else { fallback(text, done); }
  });
});
function fallback(text, done){
  var ta = document.createElement('textarea');
  ta.value = text; ta.setAttribute('readonly','');
  ta.style.position='absolute'; ta.style.left='-9999px';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); done(); } catch(e) {}
  document.body.removeChild(ta);
}
`

async function main() {
  const files = (await readdir(SRC)).filter((f) => /^\d\d-.*\.md$/.test(f)).sort()
  const sections = []

  for (const f of files) {
    const md = await readFile(join(SRC, f), 'utf8')
    const title = md.match(/^#\s+(.*)$/m)?.[1] ?? f
    const [, no, rest] = title.match(/^(\d+)\s*—\s*(.*)$/) ?? [null, f.slice(0, 2), title]
    const body = render(md.replace(/^#\s+.*$/m, ''))
    sections.push({ id: `step-${no}`, no, title: rest, body })
  }

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>The prompts — Build an AI that checks and fixes its own work</title>
<meta name="description" content="Seven prompts that take an empty folder to a website an agent built, checked and corrected by itself. WaysConf 2026 masterclass.">
<meta name="theme-color" content="#0A0B0D">
<link rel="stylesheet" href="../fonts/fonts.css">
<style>${CSS}</style>
</head>
<body>
<a class="skip" href="#main">Skip to main content</a>

<header class="top">
  <div class="wrap">
    <span class="wordmark">TURBINE</span>
    <nav aria-label="The seven prompts">
      ${sections.map((s) => `<a href="#${s.id}">${s.no}</a>`).join('')}
    </nav>
  </div>
</header>

<main id="main" tabindex="-1">
<div class="wrap">

  <h1>The prompts</h1>

  <p class="lede">Seven things to say to a coding agent. Start in an empty folder, finish
  with a website on the internet that the agent built, checked and corrected by itself.</p>

  <div class="need">
    <a href="${FIGMA_URL}">
      <b>The design</b>
      <span>The TURBINE file in Figma. Open it, look at it, keep it on your second screen.</span>
      <em>Open in Figma</em>
    </a>
    <a href="${PACK_URL}" download>
      <b>The design pack</b>
      <span>The same design as files: three PNGs, every colour and size, every word. Use this if Figma will not talk to your agent.</span>
      <em>Download · 7 MB</em>
    </a>
  </div>

  <p>Those two and this page. There is nothing to clone and no code to read —
  <strong>everything else, the agent makes for itself.</strong></p>

  <p>Paste each prompt whole. The rules in them matter as much as the request, and cutting
  a prompt down to its first sentence is the commonest way to get a disappointing answer.</p>

  ${sections
    .map(
      (s) => `<section class="step" id="${s.id}">
  <p class="step__no">Prompt ${s.no}</p>
  <h2>${esc(s.title)}</h2>
  ${s.body}
</section>`,
    )
    .join('\n')}

</div>
</main>

<footer>
  <div class="wrap">
    <p><strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 ·
    Szymon Paluch</p>
    <p class="legal">TURBINE is a fictional festival created as teaching material. Artist
    names, imagery and copy are invented. Any resemblance to a real event or performer is
    coincidental.</p>
  </div>
</footer>

<script>${JS}</script>
</body>
</html>
`

  await mkdir(OUT, { recursive: true })
  await writeFile(join(OUT, 'index.html'), html)
  console.log(`wrote guideline/prompts/index.html — ${sections.length} prompts, ${(html.length / 1024).toFixed(0)} KB`)
  if (FIGMA_URL.startsWith('#')) {
    console.log('\n  NOTE: no Figma URL yet. Rebuild with FIGMA_URL=... once the file is published.')
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
