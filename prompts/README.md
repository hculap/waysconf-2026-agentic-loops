# The prompts

Eight messages to paste into a coding agent, Claude Code or Codex. Together they take an
empty repository to a website on the internet that the agent built, checked and corrected.

You need the Figma file, saved as `turbine.fig`, and these prompts. Open your agent in your
project folder, the empty repository you created before the workshop (`cd turbine`), and paste
the prompts in order. Paste each one whole: the rules inside a prompt matter as much as the
request.

## The order

The stages end with deployment: read the design, write the check, build, loop, review, deploy.

| | Prompt | What it does |
|---|---|---|
| 01 | [Start](01-start.md) | Creates the Astro project, starts the development server, commits |
| 02 | [Look at the design](02-design.md) | Plans and builds a decoder, `npm run design`, that writes the Figma file as JSON into `design/data`; lists what it found; commits |
| 03 | [Write the checker first](03-checker.md) | Plans and writes `npm run check` from `design/data` before any page exists; it fails on the empty project; commits |
| 04 | [Build it](04-build.md) | Plans and builds the whole page from `design/data`, runs the check once; commits |
| 05 | [The loop](05-loop.md) | Plan a fix, make it, run the check; repeats until `npm run check` exits 0; commits |
| 06 | [Try to break it](06-review.md) | A review by an agent that did not build the page; you choose what to fix; commits |
| 07 | [Ship it](07-deploy.md) | Deploys to Netlify and runs the same check against the live address; commits |
| 08 | [The same job, as a workflow](08-workflow.md) | Prompts 01 to 07 as one message, with subagents |

## How to use them

- **Plan mode before 02, 03 and 04.** Each of these prompts starts with a plan that you approve before any file changes. Claude Code: press `Shift+Tab` until the footer shows *plan mode on*. Codex: type `/plan`.
- **Commits are inside the prompts.** At the end of each step the agent commits with a message that says what the step did, and pushes to your GitHub repository.
- **`/clear` after 01, 02, 03, 04 and 05, and before 06 and 07.** `/clear` starts a new session with an empty context, in Claude Code and in Codex. The next prompt reads what it needs from files: `design/data`, the check report and `notes.md`.
- **Test-driven development.** Prompt 03 writes the check before prompt 04 builds the page. The check fails first, and the page is built and fixed until it passes.

Every prompt has an **Expected result** and a table of what to say when something goes wrong.

## Prompt 08

Its seven phases are the seven prompts, in the same words. What differs, and 08 says so: plans
are written into `notes.md` instead of waiting for approval, there is no `/clear` between
phases, phase 04 builds the sections in parallel, and phase 06 reviews with subagents that
start with an empty context and fixes what survives. `scripts/build-workflow-prompt.mjs` writes
08 from 01 to 07, so they cannot drift apart.
