# TURBINE — Claude Code instructions

The project rules live in one file, shared with every other agent. Read it now:

@AGENTS.md

Everything below is specific to Claude Code and to *this* repository — the speaker's
workspace. It is not what a workshop participant does.

## What a participant does, so you do not confuse the two

A participant never opens this repository. They get the Figma file, a design pack, and
`prompts/` — eight messages that take an empty folder to a deployed site. The agent they
run writes its own project, its own page and its own checker. Nothing here is cloned.

If you are changing anything under `prompts/`, remember it will be read by a designer who
has never used a terminal, and that `guideline/prompts/index.html` is generated from it by
`node scripts/build-prompts-page.mjs` — never edit the HTML by hand.

## Plan mode

Start with plan mode (`Shift+Tab` until the footer says *plan mode on*) for anything that
touches more than one file. Explore, read `docs/CANON.md` and `brief/`, and present a plan
before editing. A plan read by a human before any code exists is the cheapest correction in
the whole loop — which is also the point of prompt 02.

## The loop, here

The workshop teaches the loop as a sentence and as `/goal`. In this repository the same
thing applies to the reference site:

```
/goal npm run check exits 0
```

The session will not end until that command actually exits 0. Not until you believe it
would — it runs.

`checks/` is the verifier for the reference implementation in `src/`. It has ten gates and
sixty-one criteria in `brief/ACCEPTANCE.md`, and it is **not** what participants use: they
write their own in prompt 04, which is the entire point of that prompt.

**Never edit anything under `checks/` to make a gate pass.** If you believe a gate is
wrong, stop and say so. Changing the verifier to agree with the generator is the exact
failure this workshop exists to demonstrate, and it has been caught happening here before —
see `evidence/INCIDENTS.md`.

## Generated files, and what regenerates them

| File | Generator |
|---|---|
| `src/styles/theme.generated.css` | `node scripts/build-theme.mjs` |
| `guideline/prompts/index.html` | `node scripts/build-prompts-page.mjs` |
| `design-pack/` | `node scripts/build-design-pack.mjs` |
| `figma-plugin/data.generated.js` | `node scripts/build-figma-plugin.mjs` |
| `public/fonts/` | `node scripts/fetch-fonts.mjs` |
| `public/images/` | `node scripts/copy-assets.mjs`, run as `prebuild` |
| `docs/handout/index.html` | `node scripts/build-handout.mjs` |

Editing any of them by hand puts the repository in a state where the next build silently
reverts your change.

## MCP servers

`docs/CONNECTING-FIGMA.md` has the verified `claude mcp add` commands for Figma, Playwright
and Netlify, and says plainly what happens without a paid Figma seat. The design pack is
the other route and is not a second-class one.
