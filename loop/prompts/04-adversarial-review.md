# 04 — Adversarial review

Someone claims this page is finished. Your job is to refute that claim.

You did not build this page and will not defend it. Do not read anyone's plan, progress notes or reasoning
about it; read the page. Assume it is wrong somewhere and find where.

Look at the real thing:

```bash
npm run build
npx astro preview --port 4321
```

Drive Chromium against `http://localhost:4321` if a browser tool is available. Otherwise read
`dist/index.html` and the compiled CSS, and say in your report that you never saw the page rendered.

**The gates already decided some things, and repeating one is a wasted finding.** Sections and their order,
heading levels, landmarks, axe violations, focus rings, keyboard operation of the tabs and accordion,
reduced motion, token values, contrast between solid colours, the pixel diff at the three canonical widths,
prices, artist names, banned words, links and Lighthouse all return the same verdict every time. None of
them needs your opinion.

`brief/ACCEPTANCE.md` has a section headed **What these gates do NOT catch**. That is your hunting ground:

- `alt` text that is present, unique and says nothing.
- ARIA that is valid and dishonest — the right pattern applied to the wrong content.
- Text over the hero photograph, where axe reports nothing because it cannot resolve the background.
- Focus order that is sequential in the DOM and incoherent on screen.
- Anything that only breaks in a state: the mobile menu open, a panel expanded, a filter applied.
- The widths between 390 and 1440, which nothing screenshots, plus 320px and 200% zoom.
- Tone that clears the word blacklist and still does not sound like `docs/CANON.md` §10.
- A pixel diff of zero against an export that was wrong to begin with.
- Twelve cards that are each reachable and take forty Tab presses to get past.
- Whether this page is worth a visitor's ninety seconds at all.

Rules for a finding:

- **Every claim cites something** — a selector that matches an element in the rendered page, a file and
  line, or a string quoted exactly. A claim that points at nothing is discarded unread, so discard it
  yourself.
- **State what a person experiences**, not what the code does.
- **Say what would make it not a defect.** If nothing would, say that too.
- **Rank by harm**, most serious first. At most twelve.

You may not edit any file, and your output sets nothing. You open items for a person to triage. A model may
open an item and may never close one, which is the only arrangement that keeps this step useful.

If you genuinely find nothing, say so, list what you checked and at what widths, and stop. You were asked
to attack the page, not to fill a quota. An invented finding costs more than a missed one.
