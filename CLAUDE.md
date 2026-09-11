# TURBINE — Claude Code instructions

The project rules live in one file, shared with every other agent. Read it now:

@AGENTS.md

Everything below is specific to Claude Code. It does not replace anything above.

## Plan mode

Start with plan mode (`Shift+Tab` until the footer says *plan mode on*). Explore the repository, read
`docs/CANON.md` and `brief/`, and write a plan naming each section you will build and the acceptance
criteria it satisfies. Present it before editing anything. The plan being read by a human before any code
exists is the cheapest correction in the whole loop.

## The loop

Two ways to run it, and they teach the same idea:

- `bash loop/ralph.sh` — the minimal version. A bash `for` loop, a prompt file, a progress file, a hard
  iteration cap, and `npm run check` as the exit condition. Twelve lines you can read in one sitting.
- `/loop` — the built-in skill, when you want Claude Code to pace itself between iterations.

Both stop on the same signal: the gates go green, or the cap is reached. Neither of them asks the model
whether it is finished.

## Workflows

`loop/workflows/` holds two scripts for the Workflow tool:

- `build-sections.mjs` — fans out one agent per page section, then verifies each independently.
- `adversarial-review.mjs` — finds candidate defects, then sends every candidate to a panel of
  independent reviewers whose instruction is to *refute* it. Only findings that survive the panel reach
  the report. This is the part of the pipeline that catches what the deterministic gates cannot.

## Subagents

`.claude/agents/` defines three reviewers with deliberately narrow remits:

| Agent | Looks for |
|---|---|
| `design-critic` | Fidelity to the Figma design and the token system; spacing, hierarchy, rhythm |
| `a11y-auditor` | What axe cannot see: focus order, ARIA correctness, keyboard traps, meaningful alt text |
| `copy-checker` | Copy that drifted from `brief/CONTENT.md`, and tone violations from `docs/CANON.md` §10 |

Use them after the deterministic gates are green, not instead of them.

## MCP servers

See `loop/MCP.md` for the exact `claude mcp add` commands for Figma, Playwright and Netlify, and for what
to do when you do not have a paid Figma seat. The fallback path — `design/export/` plus
`design/tokens/tokens.json` — is fully supported and is not a second-class route through this workshop.
