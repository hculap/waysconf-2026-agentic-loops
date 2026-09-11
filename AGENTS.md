# TURBINE — agent instructions

You are building a single-page marketing site for **TURBINE**, a fictional electronic music festival.
This repository is teaching material for a conference masterclass about agentic loops, so how you work
here matters as much as what you produce.

## Read these first, in this order

1. `docs/CANON.md` — the single source of truth. Festival facts, colour tokens, typography, section
   order, accessibility bar, tone of voice, and an explicit out-of-scope list. If anything you are about
   to write disagrees with this file, this file wins.
2. `brief/BRIEF.md` — what the client asked for.
3. `brief/ACCEPTANCE.md` — how "done" is defined. Every criterion maps to an automated gate.
4. `brief/CONTENT.md` — every string that appears on the page. Do not invent copy; it is all here.

## The one rule that matters

**You do not decide whether your work is correct. The gates decide.**

Run `npm run check`. It exits 0 or it does not. When it does not, it writes `checks/report.md`, and that
report — not your impression of your own output — is the input to your next iteration.

Corollary, and this is not negotiable: **never edit anything under `checks/` to make a gate pass.**
If you believe a gate is genuinely wrong, stop and say so in your response. Changing the verifier to
agree with the generator is the exact failure this workshop exists to demonstrate.

## Stack

- **Astro 5**, static output. No React, Vue, Svelte or any UI framework.
- **Tailwind CSS 4**, configured through `@tailwindcss/vite`. Theme values come from
  `design/tokens/tokens.css`, which is hand-maintained alongside `design/tokens/tokens.json`, and
  from `src/styles/theme.generated.css`, which `node scripts/build-theme.mjs` writes from it.
- Plain TypeScript for the small amount of client-side behaviour that is needed (lineup tabs, FAQ
  accordion, mobile nav). Progressive enhancement: the page must be readable and complete with
  JavaScript disabled.
- No backend, no API routes, no database, no third-party scripts.

## Where things go

```
src/
  layouts/Base.astro        page shell: <head>, fonts, skip link, landmarks
  components/               reusable pieces (Button, ArtistCard, TicketCard, FaqRow, ...)
  sections/                 one file per canonical page section, in CANON order
  styles/global.css         imports tokens.css and tailwind, nothing else
  scripts/                  small progressive-enhancement modules
  data/                     structured content parsed from brief/CONTENT.md
public/                     static assets served as-is; images land in public/images/
design/                     tokens, Figma spec, exports, generated imagery — READ ONLY for you
checks/                     the verifier — READ ONLY for you
```

## How to work

1. **Plan before you build.** Produce a short written plan naming the sections you will build, in order,
   and the acceptance criteria each one satisfies. Do not start editing until the plan is agreed.
2. **Build one section at a time.** After each section: `npm run build`, then `npm run check`. A section
   that does not pass its gates is not finished, and you do not move on.
3. **Feed failures back verbatim.** When a gate fails, read `checks/report.md` and address the specific
   failures it names. Do not guess at what might be wrong.
4. **Make the smallest change that turns the gate green.** Resist rewriting neighbouring code that was
   already passing.
5. **Record progress in `loop/PROGRESS.md`.** Anything you learn that the next iteration needs belongs in
   that file, because the next iteration may not share your context.
6. **State your assumptions.** If the brief is ambiguous, write down the reading you chose and carry on;
   do not stall, and do not silently pick one.

## Accessibility is a build requirement, not a polish step

The palette is deliberately hostile to careless colour choices. `color.text.muted` is a legal-footer
colour and fails contrast as body text. White on the sodium accent fails; near-black on sodium passes.
See `design/tokens/CONTRAST.md` for the measured ratios and use pairings that are marked `PASS-AA`.
`PASS-AA-LARGE` is not a pass: it is an exemption for type at 24 px or above, or 18.66 px bold.

Every interactive element needs a visible focus indicator. The lineup tabs and the FAQ accordion must be
fully keyboard operable with correct ARIA. The ticker and any transition longer than 200 ms must respect
`prefers-reduced-motion`.

## Images

All imagery is already generated and committed under `design/assets/`, with alt text in
`brief/CONTENT.md`. Copy what you need into `public/images/`. Do not hotlink external images, do not use
placeholder services, and do not generate new images.

## Deploy

`npm run build` then `npm run deploy`. The deploy gate expects the resulting public URL to return 200.

## Things that will make a reviewer reject your work

- Editing `checks/` so a gate passes
- Inventing copy that is not in `brief/CONTENT.md`
- Hard-coded hex colours that are not in `design/tokens/tokens.json`
- Claiming the build passes without having run it
- Adding a dependency that is not already in `package.json`
- Building anything on the out-of-scope list in `docs/CANON.md`
- Using the string "NOVA" anywhere — see `docs/CANON.md` §12
