# Glossary

Plain-language definitions of every term used in this workshop. No prior terminal or GitHub experience
is assumed. Entries are alphabetical; each says what the thing is and where it turns up here.

Anything in `monospace` is a command you can type, a file you can open, or a value written the way the
project writes it. `<angle brackets>` mark a placeholder you replace.

---

## A

**Accessibility gate** — The part of `npm run check` that fails the run when the page breaks
accessibility rules. In this workshop: the check the session is built around. Once your page is built, structure and
content have gone green and this one is still red, because the TURBINE palette contains a grey that
fails contrast on purpose.

**Adversarial review** — A review in which every candidate defect is handed to reviewers instructed to
refute it, so only findings that survive get reported. In this workshop:
prompt 07, run after the checks that are programs
rather than judgements — are green.

**Agent** — A model that can act rather than only answer: it reads files, runs commands, and reacts to
what comes back. In this workshop: the agent writes the site, runs the gates, and reads its own failure
report.

**Agentic loop** — Build, check, read the failure, fix, check again, until a program says it is done. In
this workshop: this is the entire subject. Prompt 05 is the whole of it: a paragraph
wrapped in guard rails and comments.

**Astro** — A website framework that turns the files in `src/` into finished HTML. In this workshop: it
builds the TURBINE page. `npm run build` is Astro running. No React, Vue or Svelte is involved.

**axe-core** — An open-source library that inspects a rendered page and reports accessibility violations
with rule names and element selectors. In this workshop: it runs inside Playwright, and its output
becomes the repair instruction for the next iteration.

## B

**Branch** — A named line of work inside a repository, so changes can be made without disturbing the
main version. In this workshop: you can stay on `main` the whole time; CI runs the gates on every branch
anyway.

**Build** — The step that turns source files into the finished site in `dist/`. In this workshop:
`npm run build`. Nothing is checked or deployed until it succeeds.

## C

**CLS (Cumulative Layout Shift)** — How much the page jumps around while it loads, as one number. In this
workshop: `brief/ACCEPTANCE.md` AC-56 budgets it at 0.10 or less, which in practice means images and fonts
that reserve their space before they arrive.

**Checkout** — Switching the files in front of you to a different branch or saved point. In this
workshop: you never need one. Every prompt stands alone, so falling behind means pasting the
next prompt rather than recovering a state.

**Chromium** — The open-source browser that Chrome is built from. In this workshop: the browser
Playwright drives and Lighthouse measures, already installed in your Codespace.

**CI (continuous integration)** — A server that runs your checks again, automatically, after every push.
In this workshop: `.github/workflows/checks.yml` runs `npm run check` on GitHub, so the verifier also
exists somewhere you cannot quietly edit it.

**CLI (command-line interface)** — A program you drive by typing its name and options instead of
clicking. In this workshop: `claude`, `codex`, `npm`, `git` and `netlify` are all CLIs.

**Clone** — Making your own local copy of a repository, history included. In this workshop: Codespaces
does it for you, and that is the path most of the room takes.

**Codespaces** — A ready-made computer running in GitHub's cloud that you open in a browser tab. In this
workshop: most people work there, so almost nobody spends the session installing Node, Chromium or
Playwright. Working on your own machine is supported — see the README.

**Coding agent** — An agent specialised in working inside a code repository: reading files, editing
them, running the build. In this workshop: Claude Code or Codex, whichever you signed into.

**Command** — One instruction typed into the terminal and run by pressing Enter. In this workshop:
`npm run check` is a command. Options go after it, and with `npm run` they need a `--` separator first or
npm keeps them for itself: `npm run check -- --skip-perf`.

**Commit** — A saved snapshot of the repository with a short message describing the change. In this
workshop: commit whenever the gates go green, so there is always a state worth returning to.

**Context window** — How much text a model can hold at once: instructions, files, command output and the
conversation so far. In this workshop: long gate reports fill it quickly, which is why `loop/PROGRESS.md`
exists.

**Contrast ratio** — A number between 1 and 21 describing how far a text colour sits from its
background. In this workshop: body text needs at least 4.5:1. Every measured TURBINE pairing is listed in
`design/tokens/CONTRAST.md`.

## D

**Deploy** — Publishing the built site so it has a public address. In this workshop: `npm run deploy`,
and only once `npm run check` has exited 0. Nothing in the command enforces that order; deploying an
unverified build is the one step a `git reset` cannot undo.

**Design token** — A named design decision stored as data, such as `color.accent.sodium = #FF6A1A`,
rather than a hex code retyped in twenty places. In this workshop: `design/tokens/tokens.json` is the
source, and a gate fails any colour that is not in it.

**Dev server** — A local program that serves the site while you edit and refreshes the browser. In this
workshop: `npm run dev`, on port 4321. It serves your source files, not the built output.

**Devcontainer** — A file describing the exact machine a project needs: base image, tools, versions,
editor extensions. In this workshop: `.devcontainer/devcontainer.json` is the reason your Codespace
arrives with everything already installed.

**Directory** — A folder. In this workshop: `src/` holds the site, `checks/` holds the verifier,
`design/` holds tokens and exports. The trailing slash is convention, not part of the name.

**DOM** — The page's real text and structure as the browser holds it, as opposed to the pixels finally
painted on screen. A heading in the DOM can be selected, translated, resized and read aloud; the same
words painted into a photograph cannot. In this workshop: the a11y and contrast gates read the DOM, which
is why `design/assets/PROMPTS.md` keeps every word out of the imagery.

## E

**Exit code** — The number a program returns when it finishes. Zero means it succeeded; anything else
means it failed, and the number says which way. In this workshop: `npm run check` exits 0 only when every
check passed, and that number — not a sentence from a model — is what the loop in prompt 05 reads to decide
whether to stop.

## F

**Figma Dev Mode** — The Figma view that exposes measurements, variables and generated code for a
selection instead of editing tools. In this workshop: the handover point for spacing and token values.
Without a paid seat you lose nothing here: `design/FIGMA-SPEC.md` carries the measurements frame by
frame, `design/tokens/` carries the values and `design/export/` carries the reference screenshots.
`docs/CONNECTING-FIGMA.md` has a route to the live file that works on a free account.

## G

**Gate** — A program that reads the built site and returns pass or fail with a message naming the
location and the expected value. In this workshop: gates decide when the work is done. No model gets a
vote.

**Git** — The tool that records a project's history as a series of commits. In this workshop: it sits
underneath clone, branch, commit, checkout and push. Four commands are enough to get through the day.

**GitHub** — A website that hosts repositories and runs services around them: copies, reviews, CI,
Codespaces. In this workshop: the project lives there, and your Codespace opens from there.

## L

**LCP (Largest Contentful Paint)** — The moment the biggest thing on the first screen — usually the hero
image or headline — has finished drawing. In this workshop: `brief/ACCEPTANCE.md` AC-56 budgets it at 2.5
seconds on Lighthouse's throttled phone profile, which is the point a visitor stops feeling they are waiting.

**Lighthouse** — Google's automated page audit, scoring performance, accessibility, best practice and
SEO out of 100. In this workshop: one gate, run against a local preview of the built site, and the
slowest one to finish.

**Landmark** — An HTML element that names a region of the page for assistive technology: `header`,
`nav`, `main`, `footer`, `aside`. In this workshop: a screen reader user jumps between landmarks the way
a sighted reader skims headings, and the structure gate checks they are present.

**Linter** — A program that reads code and flags mistakes and rule violations without running it. In
this workshop: the structure and token gates behave like linters, but for the rendered page rather than
the source.

**localhost** — The name a machine uses for itself. In this workshop: `http://localhost:4321` is the dev
server on whichever machine is running it — usually your Codespace, which forwards the address to a tab in
your browser. Nobody else reaches it unless you make that forwarded port public.

## M

**MCP (Model Context Protocol)** — A standard way to give an agent real access to an outside system
instead of a description of one. In this workshop: how the agent reaches Figma, a browser and Netlify.

**MCP server** — A small program that exposes one system's abilities over MCP. In this workshop:
`docs/CONNECTING-FIGMA.md` has the exact `claude mcp add` commands for the Figma, Playwright and Netlify servers.

**Model** — The trained system that produces the text, such as Claude or GPT, usually offered in several
sizes. In this workshop: the model is one component. The loop, the gates and the prompts around it are
the rest.

## N

**Netlify** — A hosting service that takes a folder of built files and serves it at a public URL. In
this workshop: the deploy target. Deploying sits outside `npm run check`; what follows it is AC-57 to
AC-60 in `brief/ACCEPTANCE.md` — the URL has to return 200 with `content-type: text/html`, and the HTML it
serves has to hash identical to the build that passed.

**Node** — The program that runs JavaScript outside a browser. In this workshop: what actually executes
`npm`, Astro, the gates and every other `.mjs` file here.

**npm** — Node's package manager and task runner. In this workshop: `npm install` fetches dependencies
and `npm run <name>` runs one of the scripts listed in `package.json`.

## P

**Package** — A reusable piece of code published so others can install it. In this workshop: Astro,
Tailwind, Playwright and axe-core are packages. They are named in `package.json` and unpacked into
`node_modules/`.

**Path** — The address of a file or folder, such as `design/tokens/tokens.json`. In this workshop: gate
messages carry paths so the agent knows exactly where to go. A leading `/` means from the root of the
disk.

**Pixel diff** — Comparing two screenshots pixel by pixel and counting how many differ. In this
workshop: the `pixelmatch` package does the counting, and too many changed pixels fails the visual gate.

**Plan mode** — A mode in which the agent explores and writes a plan but cannot edit anything. In this
workshop: start here. A human reading the plan before any code exists is the cheapest correction in the
whole loop.

**Playwright** — A tool that drives a real browser from code: open the page, click, type, take a
screenshot, read what is on screen. In this workshop: it is how the gates see the page the way a visitor
would, rather than by reading the HTML. `checks/specs/` holds what it runs, axe-core runs inside it, and
it is why your Codespace arrives with Chromium installed.

**Port** — A numbered door on a machine, so several programs can serve at once without colliding. In
this workshop: 4321 is the dev server. Your Codespace forwards it so a browser tab can reach it.

**Progressive enhancement** — Building so the page works without JavaScript, then adding JavaScript to
make it nicer. In this workshop: with scripts off, all twelve artists are still visible and every FAQ
answer still readable; the filter tabs and the accordion are the enhancement.

**Prompt** — The instructions the model is working from, including the files it has been told to obey.
In this workshop: `AGENTS.md` and `docs/CANON.md` are prompts that apply on every turn, not one-off
messages.

**Pull request** — A proposal to merge one branch into another, carrying a diff and a discussion. In
this workshop: optional. CI runs the gates on it, so a reviewer sees pass or fail before merging
anything.

**Push** — Sending your local commits up to GitHub. In this workshop: pushing starts CI, so the gates
run again on a machine that is not yours and cannot be persuaded.

## R

**Repository** — A project folder whose entire history is tracked, plus its settings. In this workshop:
everything you touch lives in one repository, and the repository is the unit the agent reads.

## S

**Static site** — A site made of pre-built HTML, CSS and images, with no server logic when someone
visits. In this workshop: TURBINE is one. No database, no backend, no accounts — see `docs/CANON.md` §11.
"Static output" is the Astro setting that produces it: the whole page is written to `dist/` at build
time, and what deploys is those files.

**Subagent** — A separate agent with a narrow remit and its own context, called by the main one. In this
workshop: `design-critic`, `a11y-auditor` and `copy-checker`, used after the deterministic gates are
green rather than instead of them.

## T

**Tailwind** — A CSS framework where styling is applied as small utility classes in the markup. In this
workshop: its theme is fed from `src/styles/theme.generated.css`, which `scripts/build-theme.mjs` writes
out of `design/tokens/tokens.json`, so a utility resolves to a canonical TURBINE value instead of a
guessed hex.

**TBT (Total Blocking Time)** — How long the page spends unable to answer a tap or a key press while it
loads, because scripts are busy. In this workshop: `brief/ACCEPTANCE.md` AC-56 budgets it at 200ms, which a
page with this little JavaScript should never come close to.

**Template repository** — A repository marked as a starting point, so anyone can generate their own copy
in one click. In this workshop: how each participant gets a private TURBINE repository with a history of
their own.

**Terminal (shell)** — The window where you type commands; the shell is the program inside it reading
them. In this workshop: where `npm run check` runs, and where the agent runs. Ordinary programs,
ordinary text output.

**Test** — Code that runs other code and asserts a specific result. In this workshop: the Playwright
specs under `checks/specs/` are tests used as verification of the page, not a test suite for its own
sake.

**Token (model)** — The fragments of words a model actually reads and is billed in, roughly four
characters each in English. In this workshop: why pasting one failing section beats pasting a whole
report. Unrelated to a design token.

**Tool call** — The model asking for something to be done — read this file, take this screenshot, run
this command — and getting the result back. In this workshop: every edit the agent makes and every gate
it runs is a tool call.

## V

**Verifier** — The code that decides whether the work is correct, written before the work and separate
from it. In this workshop: everything under `checks/`, off limits to the agent. Changing the verifier to
agree with the generator is the failure this workshop exists to show.

**Visual regression** — Checking that a change did not alter the appearance of the page where it was not
supposed to. In this workshop: screenshots at 390, 768 and 1440 px, compared against the reference
images in `design/export/`. Those ship rendered from the reference build rather than exported from Figma,
so today the gate asks whether your build matches the reference build — `design/export/README.md` explains
why that distinction matters.

## W

**WCAG** — The Web Content Accessibility Guidelines, the standard nearly every accessibility rule refers
back to. In this workshop: the target is WCAG 2.2 AA, and the accessibility gate fails anything short of
it.

**Workflow** — A scripted sequence of agent steps in which some steps fan out to several agents working
in parallel, and every step is checked, instead of one long conversation. In this workshop:
Prompt 08 is one, written in words rather than in code: phases you define, and a bar the agent may not cross until each is met.
