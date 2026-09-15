# TURBINE — Claude Code instructions

The project rules live in one file, shared with every other agent. Read it now:

@AGENTS.md

Everything below is specific to Claude Code and to *this* repository — the speaker's
workspace. It is not what a workshop participant does.

## What a participant does, so you do not confuse the two

A participant never opens this repository. They clone an empty GitHub repository of their
own, download the Figma file as `turbine.fig`, and paste `prompts/`: eight messages that take
that empty repository to a deployed site. The agent they run writes its own project, its own
decoder for the `.fig`, its own checker (prompt 03) and its own page. Nothing here is cloned.
If a step runs out of time, a rescue pack from the workshop page lets them carry on:
`design-data.zip` instead of prompt 02, `checker.zip` instead of prompt 03.

If you are changing anything under `prompts/`, remember it will be read by a designer who
has never used a terminal, and that the participant site is generated from it by
`node scripts/build-guideline.mjs` — never edit the HTML by hand.

## Plan mode

Start with plan mode (`Shift+Tab` until the footer says *plan mode on*) for anything that
touches more than one file. Explore, read `docs/CANON.md` and `brief/`, and present a plan
before editing. A plan read by a human before any code exists is the cheapest correction in
the whole loop, which is also why prompts 02, 03 and 04 start with a plan.

## The loop, here

The workshop teaches the loop as a sentence and as `/goal`. In this repository the same
thing applies to the reference site:

```
/goal npm run check exits 0
```

`/goal` sets a condition. After each turn a separate model checks whether the condition is
met, and Claude keeps working until it is. That model judges from the conversation, so run
`npm run check` and show its exit code; saying it would pass is not the same thing.

`checks/` is the verifier for the reference implementation in `src/`. It has ten gates and
sixty-one criteria in `brief/ACCEPTANCE.md`, and it is **not** what participants use: they
write their own in prompt 03, before the page exists, which is the entire point of that prompt.

**Never edit anything under `checks/` to make a gate pass.** If you believe a gate is
wrong, stop and say so. Changing the verifier to agree with the generator is the exact
failure this workshop exists to demonstrate, and it has been caught happening here before —
see `evidence/INCIDENTS.md`.

## Generated files, and what regenerates them

| File | Generator |
|---|---|
| `src/styles/theme.generated.css` | `node scripts/build-theme.mjs` |
| `guideline/index.html` (hub), `guideline/preparation/`, `guideline/workshop/`, and the same under `guideline/pl/` | `node scripts/build-guideline.mjs` |
| the ```text block in `prompts/08-workflow.md` and `prompts/pl/08-workflow.md` | `node scripts/build-workflow-prompt.mjs` — built from prompts 01–07; `--check` fails on drift |
| `deck/diagrams/08-*.svg` | `node scripts/build-pattern-diagrams.mjs` |
| `design-pack/` | `node scripts/build-design-pack.mjs` |
| `figma-plugin/data.generated.js` | `node scripts/build-figma-plugin.mjs` |
| `public/fonts/` | `node scripts/fetch-fonts.mjs` |
| `public/images/` | `node scripts/copy-assets.mjs`, run as `prebuild` |
| `docs/handout/index.html` | `node scripts/build-handout.mjs` |

Editing any of them by hand puts the repository in a state where the next build silently
reverts your change.

## MCP servers

`docs/CONNECTING-FIGMA.md` has the verified `claude mcp add` commands for Figma, Playwright
and Netlify, for work in this repository. Participants use no MCP server: their agent reads
`turbine.fig` directly.
