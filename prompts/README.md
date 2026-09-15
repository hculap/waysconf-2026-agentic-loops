# The prompts

Eight messages to paste into a coding agent, Claude Code or Codex. Together they take an
empty repository to a website on the internet that the agent built, checked and corrected.

You need the Figma file, saved as `turbine.fig`, and these prompts. Open your agent in your
project folder, the empty repository you created before the workshop (`cd turbine`), and paste
the prompts in order. Paste each one whole: the rules inside a prompt matter as much as the
request.

## The order

Read the design, write the check, build, loop, deploy; then an optional review that deploys again.

| | Prompt | What it does |
|---|---|---|
| 01 | [Start](01-start.md) | Creates the Astro project, starts the development server, commits |
| 02 | [Look at the design](02-design.md) | Plans and builds a decoder, `npm run design`, that writes the Figma file as JSON into `design/data`; lists what it found; commits |
| 03 | [Write the checker first](03-checker.md) | Plans and writes `npm run check` from `design/data` before any page exists; it fails on the empty project; commits |
| 04 | [Build it](04-build.md) | Plans and builds the whole page from `design/data`, runs the check once; you review the page and it writes your review into `notes.md`; commits |
| 05 | [The loop](05-loop.md) | Plan a fix, make it, run the check; repeats until `npm run check` exits 0 and the review items are done; commits |
| 06 | [Ship it](06-deploy.md) | Creates the Netlify site and deploys without questions, runs the same check against the live address; commits |
| 07 | [Try to break it](07-review.md) | A review by an agent that did not build the page, on this machine; you choose what to fix; commits and deploys again |
| 08 | [The same job, as a workflow](08-workflow.md) | Prompts 01 to 07 as one message, with subagents |

## How to use them

- **Plan mode before 02, 03 and 04.** Each of these prompts starts with a plan that you approve before any file changes. Claude Code: press `Shift+Tab` until the footer shows *plan mode on*. Codex: type `/plan`.
- **Accept edits in 04 and 05.** So that the agent does not ask before every file change. Claude Code: in 04, choose *Yes, auto-accept edits* when you approve the plan; before 05, press `Shift+Tab` until the footer shows *accept edits on*. Codex: `/permissions`, and choose the option that lets it edit and run commands in this folder without asking.
- **Commands still ask.** Accept edits covers file changes only. The first time the agent runs a new kind of command, such as `npm run check`, `git commit` or `git push`, Claude Code asks: choose **Yes, and don't ask again for … commands**. In Codex, `git push` may still ask for network access: answer yes.
- **Commits are inside the prompts.** At the end of each step the agent commits with a message that says what the step did, and pushes to your GitHub repository.
- **`/clear` after every prompt.** `/clear` starts a new session with an empty context, in Claude Code and in Codex. The next prompt reads what it needs from files: `design/data`, the check report and `notes.md`.
- **Test-driven development.** Prompt 03 writes the check before prompt 04 builds the page. The check fails first, and the page is built and fixed until it passes.
- **Prompts 02 to 05 build on each other.** 03 needs `design/data` from 02, 04 and 05 need the checker from 03. If 02 or 03 does not finish in time, use the rescue pack for that step from the workshop page and continue: at RESCUE_TIME_1, anyone without `design/data` takes `design-data.zip` and goes on to 03; at RESCUE_TIME_2, anyone whose checker is broken takes `checker.zip`, which contains its own `design/data`, and goes on to 04. The last row of the table in 02 and in 03 says what to tell the agent.
- **The checker serves the page itself.** `npm run check` builds the site and serves it; it does not need a development server. When a prompt needs the page in a browser, the agent starts the server itself.

Every prompt has an **Expected result** and a table of what to say when something goes wrong.

## Prompt 08

Its seven phases are the seven prompts, phase for phase, with the differences listed in 08:
plans are written into `notes.md` instead of waiting for approval, there is no `/clear` between
phases, phase 04 builds the sections in parallel and reviews the page itself, phase 05 goes on
to phase 06 instead of ending the run, and phase 07 reviews with subagents that start with an
empty context, fixes what survives and deploys again to the same site.
`scripts/build-workflow-prompt.mjs` writes 08 from 01 to 07, so they cannot drift apart.
