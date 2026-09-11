# TURBINE — landing page brief

**For:** the implementing agent. **From:** TURBINE festival, Kraków.

**Authority:** `docs/CANON.md` is the source of truth for every fact about the festival. Where this brief
and CANON disagree, CANON wins. Where this brief and the design disagree, this brief wins. Where this
brief and `brief/CONTENT.md` disagree about a string or a link target, CONTENT.md wins. A fact that is in
neither CANON nor `brief/CONTENT.md` is a question for us, not a gap for you to fill: write the question
and the reading you chose in `notes.md`, mark that section blocked, and carry on. Do not invent
the fact, and do not stop the loop waiting for an answer.

Any term here that is new to you is defined in plain language in `docs/GLOSSARY.md`.

---

## 1. The client

TURBINE is an electronic music festival in Kraków: three nights of ambient, techno and modular sound in
Hall E of The Powerhouse, a coal power station that stopped making electricity in 1998. The fourth edition
runs 12–14 June 2027, 4 000 people a night across three stages, twelve artists. The design is finished and
the lineup is locked. We are asking you to build the landing page at `turbine.fm`: one static page, eleven
sections, dark theme only, WCAG 2.2 AA, deployed to Netlify. Everything you need is in this repository.
Build what is specified; do not decide what it says.

## 2. Who reads the page

Most visitors arrive on a phone, from a link a friend sent, with about ninety seconds of attention. They
want six things: what this is, when, where, who is playing, what a ticket costs, and how to get one. A
second group already holds a ticket and returns for the programme grid, to find a set time on a small
screen in a loud room. A third has access needs and is deciding whether the event is possible for them at
all; for them the companion-ticket note near the pricing is the deciding fact, not fine print.

## 3. Goals, ranked

When two goals conflict, the lower-numbered one wins.

1. **The facts are right.** Observable: name, dates, venue, city, all twelve artists with day and stage,
   and all three prices appear in the rendered HTML and match `docs/CANON.md` exactly.
2. **Everyone can use it.** Observable: zero axe violations at 390, 768 and 1440 px, in every state the
   gate tests; every interactive element operable by keyboard with a visible focus ring; ticker frozen
   under `prefers-reduced-motion`.
3. **It matches the design.** Observable: no colour, spacing, radius or font size the page computes at
   the three canonical widths falls outside `design/tokens/tokens.json`, and screenshots at those widths
   match `design/export/` within the budget in `brief/ACCEPTANCE.md` AC-34 and AC-35.
4. **It sounds like TURBINE.** Observable: every string in `brief/CONTENT.md` appears on the page, and no
   banned word from CANON §10 appears on it.
5. **It is fast on a phone.** Observable: the Lighthouse gate passes on the mobile profile.

## 4. Page sections, in canonical order

Build all eleven, in this order. None may be dropped, merged or reordered.

1. **Skip link** — first focusable element on the page; visually hidden until focused.
2. **Nav** — sticky; wordmark left, four section links, ticket CTA right; hamburger below 768 px.
3. **Hero** — full-bleed image, wordmark, dates, venue, two CTAs, scroll cue; carries the only `h1`.
4. **Ticker** — horizontal marquee of genre tags; freezes under `prefers-reduced-motion`.
5. **Lineup** — twelve artist cards with portraits and a day filter (All / Fri / Sat / Sun).
6. **Programme** — three days by three stages; a table on desktop, stacked blocks on mobile.
7. **Venue** — two columns, image and text, plus travel information and a static map placeholder.
8. **Tickets** — three tier cards, a comparison list, and the access note, placed near the prices.
9. **FAQ** — eight questions in a keyboard-operable accordion.
10. **Newsletter** — email field and an unchecked consent checkbox, no dark patterns.
11. **Footer** — four link columns, socials, legal, and the fiction disclaimer from CANON §1.

## 5. Where the content comes from

| You need | Read | Contract |
|---|---|---|
| Facts | `docs/CANON.md` | Authoritative over everything, including this brief. |
| Copy | `brief/CONTENT.md` | Every user-facing string: headings, body, labels, alt text, FAQ answers. A missing string is a question for us: record it in `notes.md` and do not write copy. |
| Tokens | `design/tokens/tokens.json` | The only source of colour, spacing, radius, type scale and breakpoints. Custom properties reach the page through `design/tokens/tokens.css`; Tailwind's utilities come from `src/styles/theme.generated.css`. Both are generated from `tokens.json` by `node scripts/build-theme.mjs`, and neither is edited by hand. No raw hex, px or rem in components. Use only pairings marked `PASS-AA` in `design/tokens/CONTRAST.md`; `PASS-AA-LARGE` is not a pass, it is an exemption for type at 24 px or above, or 18.66 px bold. |
| Imagery | `design/assets/` | Already generated and committed, under the filenames `design/assets/manifest.json` lists; `brief/CONTENT.md` §13 carries the alt text for each. `npm run build` copies them into `public/images/` for you. Do not hotlink, substitute or generate images. If a file the manifest lists is not there, stop and record it in `notes.md`. |
| Layout and spacing | `design/FIGMA-SPEC.md` | The design stated literally: every frame, grid, component and section, with numbers. §5 covers 1440, §6 768, §7 390. Authoritative for anything the tokens do not fix, and the file to read when you cannot open Figma. |
| The design, if you have a seat | Figma (optional) | The same design, drawn. `figma-plugin/` builds it from the tokens. Nothing in it is needed to pass a gate. |
| Baseline | `design/export/` | Full-page renders of the reference build at 390, 768 and 1440, regenerated with `npm run baseline`. The visual gate diffs your screenshots against them. They answer whether your build matches the reference build, not whether it matches the design; for layout intent, read `design/FIGMA-SPEC.md`. |

Two token pairings are traps, fixed by CANON §4: supporting copy uses `color.text.secondary`, never
`color.text.muted`; the sodium button uses dark text on orange, never white.

## 6. Technical constraints

- **Astro 5**, static output. **Tailwind CSS 4** through `@tailwindcss/vite`, themed from the generated
  `src/styles/theme.generated.css`.
- **No UI framework.** No React, Vue, Svelte or Solid. Nav, lineup filter and FAQ accordion are plain
  TypeScript, progressively enhanced: with JavaScript off, all twelve artists are visible and every FAQ
  answer readable.
- **No backend.** No API routes, no server rendering, no database, no runtime environment variables. The
  newsletter form submits nowhere and confirms inline; the nav CTA and the hero primary CTA link to
  `#tickets`, and the three ticket card buttons use the dead external URL in `brief/CONTENT.md` §16.
- **No new dependencies, no third-party requests at runtime.** Everything the page needs is in
  `package.json`; fonts are self-hosted Space Grotesk, Inter and JetBrains Mono. The Netlify CLI is the
  one exception, and it never runs in the page: `npm run deploy` reaches it through `npx`.
- **Images** carry explicit width and height, lazy-load below the fold, and stay inside the AC-56
  budgets: total transfer at most 1500 KB, largest single image at most 400 KB.
- **Netlify:** `npm run build`, then `npm run deploy`, publishing `dist/`. Deploying needs an account
  once: run `npx netlify login`, or put `NETLIFY_AUTH_TOKEN` in the environment. See `.env.example`.

## 7. Definition of done

**`npm run check` exits 0, and the deploy gate is green.** That is the whole definition — not your reading
of the code, not the page looking right in a browser. On failure it writes `checks/report.md`, and that
report is the input to your next iteration. `brief/ACCEPTANCE.md` maps every criterion to its gate and
carries the exact thresholds.

The nine gates:

1. **build** — `astro build` completes with no errors.
2. **structure** — the eleven canonical sections present, in order; one `h1`, no skipped heading levels,
   landmark regions present, `lang="en"`.
3. **content** — every string in `brief/CONTENT.md` appears on the page; no placeholder text, no banned
   words. It checks that the canonical copy is present, not that nothing else is: copy you invented is
   caught by the copy-checker agent and by the human pass, not by this gate.
4. **tokens** — every colour, spacing, radius and font size the page computes at the three widths
   resolves to `design/tokens/tokens.json`, and no colour literal is written outside the token layer.
   Stray values fail by name and location.
5. **links** — every internal anchor resolves to a section that exists.
6. **a11y** — axe-core (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) at 390, 768 and 1440 px,
   in the default state, with each lineup tab selected and with the accordion open: zero violations at
   any severity (AC-15), plus the keyboard and focus criteria AC-16 to AC-25.
7. **visual** — full-page screenshots at the three widths, diffed against `design/export/` within the
   AC-34 and AC-35 budgets.
8. **perf** — Lighthouse on the mobile profile, scores and metric budgets per `brief/ACCEPTANCE.md`.
9. **deploy** — runs once the other eight are green: `netlify deploy --prod` succeeds, the published URL
   returns 200 as HTML, the deployed HTML is byte-identical to the build that passed, and a live axe and
   anchor run at 1440 is clean (AC-57 to AC-60).

## 8. Not included

Out of scope means: do not build it, do not scaffold it, do not leave a placeholder for it.

- **No commerce.** No checkout, cart, payment or ticket inventory. The nav CTA and the hero primary CTA
  link to `#tickets`; the three ticket card buttons use the dead external URL in `brief/CONTENT.md` §16.
- **No CMS, database, backend or API route.** Content is files in this repository.
- **No login, accounts or user state.** Nothing persists between visits.
- **No cookie banner, analytics or third-party script.** Nothing to consent to, so nothing to ask.
- **No light theme, no theme switcher.** Dark is the only theme; do not add a `prefers-color-scheme` branch.
- **No internationalisation.** English only, `lang="en"`, no language switcher, no translation scaffolding.
- **No second page.** No blog, news archive, artist pages or routing. One URL, eleven sections, anchor links.
- **Not the early working name.** The name this project carried before TURBINE is recorded in CANON §12
  with the reason it was dropped. Read that section. It must not appear in the page, the code, comments,
  file names or commits.

## 9. How to work

Plan before you build. Write the short plan AGENTS.md asks for — sections in canonical order, and the
criteria each one satisfies — into `notes.md` before your first edit. When a person is driving,
wait for them to agree it; when you are running unattended, record your assumptions and proceed. Keep
`notes.md` current either way; the next iteration will not share your context.

Build one section at a time, in canonical order. After each: `npm run build`, then `npm run check`. A
section that does not pass its gates is not finished, and you do not move on.

When a gate fails, read `checks/report.md` and address the failures it names, one at a time, as named. Fix
the cause, not the symptom: a contrast failure is fixed by moving to a pairing marked `PASS-AA` in
`design/tokens/CONTRAST.md`, not by nudging a hex until the number moves. Make the smallest change that
turns the gate green. If the same criterion id fails three times for the same reason, stop and write what
you tried, and what happened each time, into `notes.md`.

**Never edit anything under `checks/` to make a gate pass.** Thresholds, rule suppressions, skipped
assertions and edits to `tokens.json` are off limits. The gates are our acceptance criteria in executable
form. If you believe one is genuinely wrong, stop and say so — changing the verifier to agree with the
generator is the failure this project exists to demonstrate.
