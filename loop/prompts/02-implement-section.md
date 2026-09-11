# 02 — Implement one section

Build exactly one section of the TURBINE landing page:

**Section: `<SECTION>`**

Replace `<SECTION>` with one canonical name before you send this: `skip-link`, `nav`, `hero`, `ticker`,
`lineup`, `programme`, `venue`, `tickets`, `faq`, `newsletter` or `footer`. One name. Not two, not "the
rest of them".

Read only what this section needs:

- `docs/CANON.md` §7 for where it sits, and §4 to §6 for the system it is built from.
- `brief/CONTENT.md` for every string in it. Copy them character for character, including the en dashes,
  middots, euro signs and diacritics. If a string you need is not there, stop and ask; do not write copy.
- `design/FIGMA-SPEC.md` §5 for its layout, and §6 and §7 for what changes at 768 and 390.
- `brief/ACCEPTANCE.md` for the criteria it must satisfy, and for the table headed *The contract the page
  must expose*. Every `data-` attribute in that table that applies to this section is required: the gates
  are allowed to depend on nothing else, so a missing hook reads as a missing section.
- `design/export/` if it has PNGs in it. If Figma is connected, read the node for this section instead.

Then build it, and nothing else.

Constraints:

- Touch only the files this section needs. Do not refactor, tidy or improve a neighbouring section that is
  already passing.
- No colour, size, spacing or radius literals in your markup. Values come from the tokens, through the
  Tailwind theme that `scripts/build-theme.mjs` generates.
- No new dependencies. No UI framework. Plain TypeScript for behaviour, progressively enhanced: with
  JavaScript off, every artist is visible and every FAQ answer readable.
- Nothing from the out-of-scope list in `docs/CANON.md` §11.
- Do not edit anything under `checks/`.

When the section is built:

```bash
npm run build
npm run check
```

Then report, in this order: the files you changed; which criteria you believe are now green and why; which
are still red and what the report says about them; anything you assumed. Append the same to
`loop/PROGRESS.md` under a new iteration heading.

Do not tell me a gate passes unless you ran it and read the result. If the build failed, say the build
failed. A section that does not pass its gates is not finished, and you do not move on to the next one.
