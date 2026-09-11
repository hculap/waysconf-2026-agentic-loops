#!/usr/bin/env node
/**
 * Build the printable handout — one A5 card per participant.
 *
 *   node scripts/build-handout.mjs
 *
 * Emits docs/handout/index.html, which prints to A5 landscape. Print it double-sided
 * on A4 and cut, or hand out A5 directly.
 *
 * The QR codes are generated here rather than pasted in as images, so that changing a
 * URL is a one-line edit and never leaves a card pointing at a dead link. They are
 * inlined as SVG: a printed card that depends on a CDN is a card that fails to print
 * on conference wifi.
 */

import QRCode from 'qrcode'
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'docs/handout')

const LINKS = [
  {
    label: 'Workshop repo',
    hint: 'Everything. Start here.',
    url: 'https://github.com/hculap/waysconf-2026-agentic-loops',
  },
  {
    label: 'Setup page',
    hint: 'Accounts and installs.',
    url: 'https://turbine-workshop.netlify.app',
  },
  {
    label: 'The slides',
    hint: 'Including the ones I skipped.',
    url: 'https://turbine-deck.netlify.app',
  },
  {
    label: 'The finished site',
    hint: 'What the loop built.',
    url: 'https://turbine-festival.netlify.app',
  },
]

/** Rendered at a size that survives a phone camera at arm's length under bad lighting. */
async function qr(url) {
  return QRCode.toString(url, {
    type: 'svg',
    margin: 0,
    errorCorrectionLevel: 'M',
    color: { dark: '#0A0B0D', light: '#0000' },
  })
}

const cards = await Promise.all(
  LINKS.map(async (l) => ({ ...l, svg: (await qr(l.url)).replace('<svg', '<svg class="qr"') })),
)

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>TURBINE — workshop handout</title>
<style>
  /* Printed on paper, so this is the one artefact in the repository that is not dark. */
  @page { size: A5 landscape; margin: 0; }

  :root {
    --ink: #0A0B0D;
    --ink-2: #4A5160;
    --sodium: #FF6A1A;
    --rule: #C9CDD6;
  }

  * { box-sizing: border-box; }

  body {
    margin: 0;
    background: #E6E8EC;
    font-family: 'Inter', -apple-system, 'Segoe UI', system-ui, sans-serif;
    color: var(--ink);
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .card {
    width: 210mm;
    height: 148mm;
    padding: 12mm 14mm;
    background: #fff;
    margin: 8mm auto;
    display: grid;
    grid-template-rows: auto 1fr auto;
    page-break-after: always;
  }

  header { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1.5pt solid var(--ink); padding-bottom: 3mm; }

  .wordmark { font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700; letter-spacing: 0.18em; font-size: 15pt; color: var(--sodium); }
  .session { font-size: 8.5pt; color: var(--ink-2); text-align: right; line-height: 1.4; }

  h1 { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 19pt; line-height: 1.1; margin: 6mm 0 2mm; letter-spacing: -0.02em; }
  .lede { font-size: 9.5pt; color: var(--ink-2); max-width: 105mm; line-height: 1.45; margin: 0 0 5mm; }

  .links { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6mm; }
  .link { text-align: center; }
  .qr { width: 26mm; height: 26mm; display: block; margin: 0 auto 2mm; }
  .link b { display: block; font-size: 9pt; }
  .link span { display: block; font-size: 7.5pt; color: var(--ink-2); line-height: 1.3; }

  footer { border-top: 1pt solid var(--rule); padding-top: 3mm; display: flex; justify-content: space-between; align-items: flex-end; font-size: 8pt; color: var(--ink-2); }

  .commands { font-family: 'JetBrains Mono', ui-monospace, monospace; font-size: 8pt; line-height: 1.75; }
  .commands b { color: var(--ink); font-weight: 700; }

  /* Back of the card: the five things worth remembering after the room empties. */
  .back h2 { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 13pt; margin: 0 0 3mm; letter-spacing: -0.01em; }
  .back ol { margin: 0; padding-left: 5mm; font-size: 9pt; line-height: 1.5; color: var(--ink-2); }
  .back li { margin-bottom: 2.5mm; }
  .back li b { color: var(--ink); }
  .cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; }

  @media screen { .card { box-shadow: 0 2mm 8mm rgba(0,0,0,.18); } }
  @media print { body { background: #fff; } .card { margin: 0; box-shadow: none; } }
</style>
</head>
<body>

<section class="card">
  <header>
    <span class="wordmark">TURBINE</span>
    <span class="session">
      Build an AI that checks and fixes its own work<br>
      WaysConf 2026 · 16 September · ROOM-PM · Szymon Paluch
    </span>
  </header>

  <div>
    <h1>Everything from today, in four squares.</h1>
    <p class="lede">
      The repository has the brief, the design, every prompt I used on stage, the verifier, and the
      evidence from the two clean-room runs I did before the conference. Take it to work on Monday.
    </p>

    <div class="links">
      ${cards
        .map(
          (c) => `<div class="link">
        ${c.svg}
        <b>${c.label}</b>
        <span>${c.hint}</span>
      </div>`,
        )
        .join('\n      ')}
    </div>
  </div>

  <footer>
    <div class="commands">
      <b>npm run check</b> &nbsp;run every gate<br>
      <b>bash loop/ralph.sh</b> &nbsp;run the loop<br>
      <b>git checkout step-3</b> &nbsp;catch up
    </div>
    <div style="text-align:right">
      Code MIT · design &amp; copy CC BY 4.0<br>
      TURBINE is fictional.
    </div>
  </footer>
</section>

<section class="card back">
  <header>
    <span class="wordmark">TURBINE</span>
    <span class="session">The part worth remembering</span>
  </header>

  <div>
    <h1>Five things, and the first one is the whole talk.</h1>
    <div class="cols2">
      <ol>
        <li><b>A loop needs an oracle.</b> Something that returns pass or fail identically every time,
          with no model in the decision. Without it you have a model agreeing with itself in a circle.</li>
        <li><b>Generator and verifier must be different things.</b> The moment the thing doing the work
          can edit the thing judging the work, you have nothing.</li>
        <li><b>State goes in files, not in the conversation.</b> A fresh context that reads good notes
          beats a long context that remembers badly.</li>
      </ol>
      <ol start="4">
        <li><b>Give it the design, not a picture of the design.</b> Colours and spacing handed over as
          data are never guessed. That difference is measurable, which is why there is a gate for it.</li>
        <li><b>Be honest about what the gates miss.</b> Automated a11y tooling reaches maybe 30–40% of
          real WCAG failures. A pixel diff sees change, not improvement. Nothing here knows whether the
          design is good.</li>
      </ol>
    </div>
  </div>

  <footer>
    <div>Questions afterwards: the repository has an issues tab, and I read it.</div>
    <div style="text-align:right">hculap/waysconf-2026-agentic-loops</div>
  </footer>
</section>

</body>
</html>
`

await mkdir(OUT, { recursive: true })
await writeFile(join(OUT, 'index.html'), html)
console.log(`wrote docs/handout/index.html — ${cards.length} QR codes, 2 sides, A5 landscape`)
console.log('Print from a browser: A5, landscape, background graphics on, margins none.')
