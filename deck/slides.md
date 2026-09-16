---
theme: default
title: Build an AI that checks and fixes its own work
# Local, not Slidev's default on cdn.jsdelivr.net: both Netlify sites serve img-src 'self', so the
# default is blocked and logs a CSP error on every slide.
favicon: /favicon.svg
info: |
  WaysConf 2026 masterclass. Agentic loops in practice:
  Figma design in, a verified, deployed website out.
author: Szymon Paluch
class: text-left
highlighter: shiki
lineNumbers: false
drawings:
  persist: false
transition: none
mdc: true
css: unocss
# The deck is dark-only. Without this, Slidev follows the viewer's OS setting and
# Shiki renders its LIGHT palette over a hardcoded dark background — dark grey code
# on near-black, which is what a projector in a bright room shows you at 09:00.
colorSchema: dark
fonts:
  sans: Inter
  serif: Playfair Display
  mono: JetBrains Mono
  # All four faces are in deck/public/fonts and declared in style.css. Listing them
  # as local stops Slidev fetching anything from Google at build or at runtime —
  # conference wifi is not a dependency this deck is allowed to have.
  local: Inter, Playfair Display, Space Grotesk, JetBrains Mono
---

<style>
@import './style.css';
</style>

<div class="kicker">WaysConf 2026 · masterclass · 90 minutes</div>

# Build an AI that checks and fixes its own work

<p class="text-2xl mt-6" style="color: var(--sp-fg)">
Agentic loops in practice.
</p>

<p class="mt-10">
Szymon Paluch · CTO, Susteen<br>
<span style="color: var(--sp-fg-3)">ROOM-PM · 16 September 2026</span>
</p>

<!--
Timing card is in deck/notes/TIMING.md. Total 90 minutes, three hands-on sprints. There is no
buffer: the cut list in the timing card is the buffer.

Before you start: the finished site should already be open in a browser tab, and
waysconf.szymonpaluch.com should be on the room's screen as people come in.
-->

---
layout: section
class: section
---

<div class="kicker">0:00 — 0:08</div>

# The case

<!-- Eight minutes. Do not overrun this; the setup checkpoint is unforgiving. -->

---

# Most AI demos stop here

<div class="mt-8 text-xl">

A prompt goes in. Something impressive comes out. Everyone claps.

Then someone asks a question the demo was not built to survive:

</div>

<div class="mt-8 text-xl" style="color: var(--sp-fg)">

*Does it match the design?*

*Is the contrast legal?*

*Does it work on a phone?*

*Is that the actual copy, or copy it invented?*

</div>

<div class="mt-10">
<span class="verdict fail">no answer</span>
</div>

<!--
Do not be snide about this. Half the room has shipped one of these demos and is
proud of it. The point is not that the demo was bad; the point is that nothing in
it could say no.
-->

---
layout: center
---

# This is a talk about the word *no*

<p class="text-xl mt-8" style="color: var(--sp-fg-2)">
A loop is only worth building if something in it can refuse<br>
the work without asking a language model for an opinion.
</p>

<!--
This is the thesis slide. Everything after it is evidence.
If you only land one sentence in ninety minutes, land this one.
-->

---

# What you will have at 16:25

<div class="cols mt-6" style="grid-template-columns: 1.15fr 1fr; gap: 1.6rem">
<div>

<a href="https://turbine-festival.netlify.app/" target="_blank" rel="noopener">
  <img src="/shots/turbine-hero.jpg" alt="The finished TURBINE festival page: the wordmark over a dark
  photograph of an industrial hall, the dates, and two buttons." style="border-radius: 10px; border: 1px solid var(--sp-line); max-height: 300px" />
</a>

<p class="mt-3">
<a href="https://turbine-festival.netlify.app/" target="_blank" rel="noopener"><b>turbine-festival.netlify.app</b> ↗</a>
<span style="color: var(--sp-fg-3)"> — open it, it is a real address</span>
</p>

</div>
<div>

Built from a Figma file by an agent you instructed, checked by a program that agent wrote and
is not allowed to change, fixed when it failed, and deployed to a URL you can send to someone.

### You leave with

A URL, live on the internet. A folder: the page, and the checker that judged it. Eight prompts
that work on Monday, on something that is not a festival.

<div class="mt-4">
<span class="verdict pass">exit 0</span>
</div>

</div>
</div>

<!--
Click the picture — it opens the real site in a new tab. Scroll it for about twenty seconds,
then come back. Do not narrate the design; they can see it.

The screenshot is there so this slide still works when the conference wifi does not. It is
taken from the live site by scripts/build-deck-shot.mjs; if the two ever disagree, run it again.

Their checker will be smaller than this repository's ten gates, and it should be. It is
the one they wrote themselves, in prompt 03.
-->

---

# The loop

<div class="mt-6">
  <img src="/diagrams/01-the-loop.svg" alt="plan, implement, verify, repeated until the check exits 0, then deploy" class="w-full">
</div>

<!--
Three steps. Plan: what to change and why. Implement: generate the first time, fix every
time after. Verify: a program, exit 0 or 1. Point at the arrow going back: it carries a file,
and the next plan starts from that file.
-->

---
layout: section
class: section
---

<div class="kicker">0:08 — 0:13</div>

# Setup
## An agent running in an empty folder

<!--
Hard stop at 0:13. Anyone not working by then goes to Codespaces, no discussion — the
click path is on the Preparation page.
Ask for hands first: "who has a terminal open right now?" Send the rest to the browser
path immediately rather than one at a time.

The moment an agent is up, prompt 01 goes in. It takes about two minutes.
-->

---

# The terminal, in one slide

<div class="mt-5" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem">
<div>

### macOS

<kbd>Cmd</kbd> + <kbd>Space</kbd>, type **Terminal**, <kbd>Enter</kbd>.

<p class="mt-2" style="color: var(--sp-fg-3)">Paste with <kbd>Cmd</kbd> + <kbd>V</kbd></p>

</div>
<div>

### Windows

<kbd>Win</kbd>, type **PowerShell**, open **Windows PowerShell**. Not Command Prompt.

<p class="mt-2" style="color: var(--sp-fg-3)">Paste with <kbd>Ctrl</kbd> + <kbd>V</kbd></p>

</div>
<div>

### Linux

<kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>, or search for **Terminal**.

<p class="mt-2" style="color: var(--sp-fg-3)">Paste with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd></p>

</div>
</div>

<div class="cols mt-5">
<div>

```bash
pwd                 # where am I
ls                  # what is here
cd turbine          # go in there
claude              # or: codex
```

</div>
<div>

No feedback while it works reads as "broken" and is almost always **"busy"**. You know a
command has finished when the cursor line comes back.

<p class="mt-3">
<b>Esc</b> stops the agent. <b>Ctrl+C</b> twice closes it: <code>claude --continue</code> brings it back.
</p>

</div>
</div>

<!--
The "no feedback means busy" line is the one that saves you the most support
questions. Say it twice.

Windows: it must be PowerShell. Command Prompt has no ls, no pwd and a different quoting
rule, and someone will be stuck on it for ten minutes without saying anything.

The same three routes, with pictures, are on the Preparation page under Open a terminal.
-->

---

# You need two things

<div class="cols mt-8">
<div>

### The design

**`turbine.fig`**, downloaded from the page — the file your agent reads. The same page
opens the design in Figma, to look at.

### The prompts

<p class="mt-2" style="color: var(--sp-accent-2)">
waysconf.szymonpaluch.com
</p>

Eight of them, with a copy button on each.

</div>
<div>

### And an empty folder

```bash
cd turbine      # made at home
claude          # or: codex
```

<p class="mt-4">
No <code>turbine</code> folder? Make one: <code>mkdir turbine</code>, then <code>cd turbine</code>. Prompt 01 creates the GitHub repository for you.
</p>

<p class="mt-4 text-xl" style="color: var(--sp-accent-2)">
Agent up? Paste <b>prompt 01</b> now.
</p>

</div>
</div>

<!--
Anyone who skipped the preparation page has no turbine repository, and that is now handled in
the prompt rather than from the stage: mkdir turbine, cd turbine, paste prompt 01, and its first
four lines check gh auth, look for a turbine repository on their account and create one if there
is none. Do not read those four lines out. Just say "prompt 01 makes the repository if you do
not have one" and move on.

Everyone downloads the same turbine.fig from the page; nobody needs a Figma account to take
part. The Figma link is for looking at the design, not for getting it out.
-->

---

# 01 — Start

<div class="mt-5">
<PromptCard n="01" />
</div>

<p class="mt-5 text-xl">
No plan mode for this one. It checks your GitHub repository — <b>and creates it if you do not have one</b> — then makes the project, starts the development server, commits and pushes.
</p>

<p class="mt-3" style="color: var(--sp-fg-3)">
Every prompt is on the page with its own Copy button. Nothing here is typed by hand.
</p>

<!--
Leave this up while they paste. The only thing to say out loud: it will ask before it runs a
command — choose the option that stops it asking for that kind of command, once.

If someone reads the whole prompt and asks why it is so specific about Astro and Tailwind: a
prompt that names its stack gets one project; a prompt that does not gets an argument about
frameworks. Say that and move on.
-->


---

# Plan mode: it cannot touch a file until you say so

<div class="mt-5">

| | What you do | Claude Code | Codex |
|---|---|---|---|
| **Plan mode** | Switch it on **before** you paste. The agent researches and writes a plan. **It changes nothing.** | `Shift+Tab` until *plan mode on* | `/plan` |
| Approve | Read the plan, correct it in plain words, approve it. Now it builds | *Yes, auto-accept edits* | `/permissions` |
| Commit | The agent commits the step and pushes it to your repository | written into the prompt | written into the prompt |
| Clear | Empty the context before the next prompt | `/clear` | `/clear` |

</div>

<div class="mt-5 text-xl">
A wrong plan costs one sentence to fix. The same mistake found after it has written forty files costs the step.
</div>

<!--
This slide is about plan mode. Say which prompts use it — 02, 03 and 04, the three that build
something new — out loud rather than putting it on the slide; they will see it on each card
anyway, and a number on a slide invites the question of why, in the middle of the setup block.

Telling thirty people to use plan mode for everything costs a minute per prompt and teaches
them that the plan is a ceremony rather than a decision.

Clearing after each step is what keeps every step in a fresh context; the commit is what makes
every step undoable. Codex: /plan switches to Plan mode, /clear starts a new chat. Claude Code:
Shift+Tab cycles to plan mode, /clear empties the context.
-->

---

# Read the plan before it writes the code

<div class="mt-8 text-xl">

Plan mode is the cheapest correction in the entire loop. A wrong assumption costs one
sentence to fix here, and twenty minutes of generated code to fix later.

</div>

```bash
# Claude Code: Shift+Tab until the footer says "plan mode on"
# Codex:       /plan
```

<div class="mt-8">

Then read it. Actually read it. The plan is where you find out it misunderstood the brief.

</div>

<!--
Show a real plan on screen. Point at one line you would have changed. That single
gesture teaches more than the slide.
-->

---
layout: section
class: section
---

<div class="kicker">0:13 — 0:38 · prompt 02 runs while we talk</div>

# Design in, not screenshots in

---

# Plan mode, then prompt 02

<div class="mt-6 text-xl">

Put `turbine.fig` in `design/` inside your project. Switch to **plan mode**, paste **prompt 02**, read the plan, approve it.

</div>

<div class="cols mt-8">
<div>

### What it builds

A decoder in your project: `npm run design`. It reads the `.fig` and writes the design as
JSON in `design/data/`: sections, colours, typography, layout, components, copy, images.

The checker and the page both read those files. Nobody decodes or exports the design again.

</div>
<div>

### What you do

Approve the plan, then wait ten to fifteen minutes. Let it use the network if it asks.

<p class="mt-4" style="color: var(--sp-accent-2)">
It writes no page. It stops with a list and its open questions (point 6). Answer them; it commits and pushes. Then <code>/clear</code>.
</p>

</div>
</div>

<!--
This is the longest thing any agent does all afternoon: twenty-three minutes in the trial, and
that was Opus with the plan approved instantly. Start it now, talk over it, and call the rescue
pack at 15:30 whether or not anyone asks — most of the room will still be decoding.

Claude Code in its default mode asks before each command. Tell the room to pick the option
that stops asking for that kind of command, or they will spend the time clicking yes.
-->

---

# 02 — Look at the design

<div class="mt-5">
<PromptCard n="02" />
</div>

<p class="mt-5 text-xl">
Read the plan for three things: it is a script <code>npm run design</code> runs, it writes JSON into <code>design/data</code>, it writes no page code.
</p>

<!--
Point at the third sentence of the preview — "work from that one file and nothing else". That
line exists because an agent asked to find a design will find something: a screenshot, an old
export, a README. Then it builds from that and the page is subtly not the design.

Point 6 is the open questions. It is the part people skip, and it is where the decoder tells
you what the .fig does not answer.
-->

---

# Two ways to hand over a design

<div class="cols mt-8">
<div>

### A screenshot

The agent looks at pixels and infers.

The orange becomes *an* orange.

The spacing becomes *some* spacing.

It looks roughly right.

<div class="mt-6"><span class="verdict fail">token gate fails</span></div>

</div>
<div>

### The file itself

Colours arrive as values.
Spacing arrives as numbers.

```txt
TURBINE / Color
  accent/sodium     #FF6A1A
  text/secondary    #A7AEBB
  text/muted        #6B7280
```

Nothing is guessed, so nothing is guessed wrong.

<div class="mt-6"><span class="verdict pass">token gate passes</span></div>

</div>
</div>

<!--
This is the slide the designers in the room came for. Spend a moment on it.
-->

---

# The file, and what happens to it

<div class="mt-4">
  <img src="/diagrams/04-decoder-at-work.svg" alt="turbine.fig is unpacked, the document is read, the design data is pulled out and written as seven JSON files; then npm run design is run and its output checked, and a wrong result sends the agent back to fix the decoder" class="w-full">
</div>

<p class="mt-3 text-lg">
Your agent has never seen a <code>.fig</code>. It is <b>writing a program to read one</b>, right now, while I talk.
</p>

<!--
Talk over the picture; it is the only thing on screen for the next few minutes and their
machines are doing exactly this.

Left to right, slowly: it is a ZIP, so the first thing it does is unpack it. Then it walks the
document the way you would walk a Figma file — pages, frames, layers, variables. Then it pulls
out the seven things the page and the checker need, and writes them as JSON.

Then point at the amber loop and make the point of the whole workshop: it does not stop when
the script runs. It stops when it has LOOKED at what came out. Twelve artist cards must carry
twelve different names — the first trial run produced twelve copies of "KASIMIR VOLT", because
a component's default text is easier to find than each instance's override. The decoder was
wrong, not the file.

This is the moment to say the file is enough: one download, nobody needs a Figma account.
-->

---
layout: section
class: section
---

<div class="kicker">0:38 — 0:58 · tests first</div>

# The verifier
## Written before the page

---

# Why a fresh context beats a long one

<div class="cols mt-8">
<div>

### One long conversation

Forty minutes of history.

Three abandoned approaches still in context.

The original brief, sixty thousand tokens ago.

Reasoning gets worse as it fills.

</div>
<div>

### A fresh context each pass

Reads the report — the current failures.

Reads `notes.md` — what was already tried, and what it cost.

Reads design/data.

<p class="mt-4" style="color: var(--sp-accent-2)">
Notes on disk beat memory in context.
</p>

</div>
</div>

<!--
notes.md is the underrated artifact in the whole method, and the one nobody demos.
It is how iteration 7 knows that iteration 3 already tried the obvious thing and why
it did not work. Prompts 05 and 08 both tell the agent to keep it.
-->

---

# Plan mode, then prompt 03

<div class="mt-6 text-xl">

Answer 02's open questions first. Then `/clear`, switch to **plan mode**, paste **prompt 03**.

</div>

<div class="mt-6 text-xl">

Your agent plans and writes `npm run check` from `design/data/`, before any page exists, and
runs it on the empty project.

</div>

<div class="mt-6">
<span class="verdict fail">it must be red</span>
</div>

<p class="mt-6" style="color: var(--sp-fg-3)">
Twenty minutes in the trial. A check that passes on an empty page is not checking anything. It commits; then <code>/clear</code>.
</p>

---

# 03 — Write the checker first

<div class="mt-5">
<PromptCard n="03" />
</div>

<p class="mt-5 text-xl">
The rule at the end of this prompt is the one that matters: <b>never change the checker to make a check pass.</b>
</p>

<!--
This is the prompt to read a few lines of out loud, because it is the one that makes the
workshop different from a demo. It asks for a check written from the design data while there
is no page, and it says what to do when the agent thinks a check is wrong: stop and say so.

Last night that sentence did real work. Prompt 05 hit a check it believed was wrong, and
instead of writing hidden text to satisfy it, it stopped and asked. That slide is coming.
-->

---

# Tests first

<div class="cols mt-8">
<div>

### Red

The check is written from the design data and run on the empty project.

It fails. The report lists everything the page does not have yet.

<div class="mt-4"><span class="verdict fail">prompt 03</span></div>

</div>
<div>

### Green

The page is built from the design data, then fixed against that report until the check passes.

<div class="mt-4"><span class="verdict pass">prompts 04 and 05</span></div>

</div>
</div>

<div class="mt-8 text-xl">
A check written after the page describes the page. A check written first can only describe the design.
</div>

<!--
Test-driven development, in one sentence: write the test before the code. Here the test is the
whole checker, and the code is the whole page. The point for this room: if the agent writes the
page first, its checker will quietly agree with whatever it built.
-->

<!--
Twenty minutes in the trial: six planning, fourteen writing. It runs through the next slides and
the live demo, and the rescue pack lands at 15:50 for everyone it did not finish for.

Prompt 04 builds against this check and prompt 05 loops on it: npm run check is created here.
Do not skip it to save time — cut the demo before you cut this.
-->

---

# The reference site: ten gates, no opinions

<div class="mt-4">

| Gate | What it decides |
|---|---|
| Build | It compiles, no type errors, one page out |
| Runtime | No console errors, no failed requests |
| Structure | Sections, headings, landmarks, skip link, ids |
| Accessibility | axe clean at three widths, focus, keyboard, motion |
| Design tokens | Every colour and size came from the design |
| Visual fidelity | Pixels match the design, within a stated budget |
| Content | The real copy, all twelve artists, no placeholders |
| Links | Nothing points at nothing |
| Lighthouse | Performance, a11y, best practices, SEO, and five budgets |
| **Text over images** | **The contrast axe refuses to judge** |

</div>

<!--
Do not read the table. Let them read it while you say: every one of these returns
pass or fail the same way every time, and none of them asks a model anything.

Theirs, being written right now in prompt 03, is smaller. It should be. The shape is the
same: a program, the same answer twice, a report a stranger can act on.
-->

---

# The failure report is the interface

```md
**3. [check 07] a colour on the page is not in the design**

- Where: the supporting line inside each card in the lineup section
- Expected: the design's "text / secondary"
- Actual: the design's "text / muted" — measured 4.07:1 against the page background,
          and body text needs 4.5:1
- Hint: muted is defined for legal and footer text only
```

<div class="mt-8 text-xl">

No model wrote that. A program measured it and printed it.

The agent's next iteration starts by reading this file.

</div>

<!--
The design decision worth naming: the report is written for two readers at once,
a person at 2am and an agent with no memory of the last iteration. That is why it
carries the criterion id, the selector, the expected value and the measured one.
-->

---
layout: section
class: section
---

<div class="kicker">0:58 — 1:13 · sprint 1</div>

# Build the page


---

# Your turn — 15 minutes

<div class="cols mt-8">
<div>

### 1. Plan mode, prompt 04

<p class="mt-2">
It plans the page from <code>design/data/</code>, builds all of it, and runs the check once. Still red, with fewer failures.
</p>

### 2. Review it

<p class="mt-2">
Beside Figma, one section at a time. Say what is wrong in plain words. Then it commits, and you <code>/clear</code>.
</p>

</div>
<div>

<p class="text-xl">Falling behind cannot hurt you.</p>

<blockquote>
Stop where you are. Leave whatever is unfinished. I want to move on.
</blockquote>

<p class="mt-4" style="color: var(--sp-fg-2)">
Prompts 02 to 05 build on each other. Behind at the rescue time? Take the pack from the page and go on.
</p>

</div>
</div>

<!--
Circulate. Do not answer architecture questions now; answer setup questions.
The commonest stuck state: a checker still being written at 0:42. Let it finish; prompt 04 needs
it. Anyone whose page is not built by 0:53 goes on to prompt 05 anyway: the loop builds what is missing.

At 0:52 give a two-minute warning regardless of where anyone is.
-->

---

# 04 — Build it

<div class="mt-5">
<PromptCard n="04" />
</div>

<p class="mt-5 text-xl">
It builds the page from <code>design/data</code>, not from a screenshot and not from taste. Then it runs the check once and stops.
</p>

<!--
Twenty-four minutes in the trial, and it does not stop being red. That is the point: 04
builds, 05 repairs. An agent that reports a green check here has either built very little or
changed the checker.

While it runs, review the page beside Figma and say what is wrong in plain words. The prompt
writes your review into notes.md before it commits, so prompt 05 can read it after the clear.
-->

---
layout: section
class: section
---

<div class="kicker">1:13 — 1:21 · the loop runs while we talk</div>

# The loop, and workflows

<!--
Start them looping FIRST, then talk. Their machines work while they listen; that
is where the fifteen minutes comes from.
-->

---

# Start your loop now, then listen

<div class="mt-3 text-xl">
<code>/clear</code>, paste it, then leave it alone. I will talk over it; when it stops, it commits.
</div>

<div class="mt-3">
<PromptCard n="05" />
</div>

<div class="mt-4 text-lg">
Both agents also have a goal command — <code>/goal npm run check exits 0</code>. A separate check judges
it after every turn and the agent keeps going until it is met; the exit code still decides. Stop early with <code>/goal clear</code>.
</div>

<!--
Give them ninety seconds to get it started. Check that at least two thirds of the
room has it running before you continue, by show of hands.

Say the stop rule out loud now, because nobody will be looking at a slide when it matters: if
the check is still red at the end of this block, press Esc, /clear, and go on to prompt 06. A
red page with a URL beats a green page nobody can open.
-->

---

# The whole loop is four sentences

<div class="mt-6">

| | |
|---|---|
| **Check first** | Run the check *before* you fix anything. An agent asked to improve passing work will find a reason. |
| **Hand back the report** | Unchanged. The file a program wrote, not your summary of it. |
| **Never touch the checker** | The moment the thing being judged can edit the judge, every green result afterwards means nothing. |
| **Stop on a program** | Not when it feels finished. When something exits 0. |

</div>

<p class="mt-8 text-xl">
No script. Nothing to install. You can say this to any agent, today.
</p>

<!--
Credit where it is due: this shape is Geoffrey Huntley's, widely known as the
"Ralph Wiggum" technique — a shell loop feeding a prompt file to an agent forever.

What changed is that you no longer need the shell loop. Say the four sentences, or use
/goal, and the harness holds it for you.

The three things that make it work, in order of how often they are missed:
  1. the exit condition is a program
  2. state is in files, so a fresh context is not a handicap
  3. there is a limit, so it cannot run all night
-->

---

# A real loop and a fake one

<div class="mt-6">
  <img src="/diagrams/02-fake-loop-vs-real-loop.svg" alt="the same agent grading its own work, beside a program and a fresh-context adversarial review checking the page in parallel" class="w-full">
</div>

<!--
Do not rush this. It is the second most important slide in the deck.

An agent can check work. The fake loop is the same agent, in the same context, asked whether
its own work is good: it repeats the reasoning that produced it. The real loop runs two checks
side by side: the program for what can be measured, and agents with a fresh context, told to
attack, for what cannot. Both go into one report.
-->

---

# Who checks the work

<div class="mt-8">

| Who checks | Good for |
|---|---|
| The same agent, same context | Nothing. It repeats its own reasoning |
| A program: `npm run check` | Anything with an exact answer: sections, colours, copy, contrast |
| Fresh-context agents, told to attack | What a program cannot measure: reading order, alt text, text over photos, tone |

</div>

<div class="mt-8 text-xl">
Run the last two <b>side by side</b>. One report. It ships when the report is empty.
</div>

<!--
The objection is usually "but the model is very good at reviewing now". Agreed, and that is
the third row. What does not work is the first row: the agent that did the work, in the
context where it decided everything, grading itself. In the room the page is deployed first so
everyone has an address, and the review's fixes are deployed again. In the workshop, prompt 07 is the third
row, pasted in a new session.
-->

---

# Three tiers of checking

<div class="mt-6">
  <img src="/diagrams/03-verification-tiers.svg" alt="deterministic gates, measured comparison, adversarial review" class="w-full">
</div>

<!--
Bottom tier: cheap, certain, narrow.
Middle tier: measurable but needs interpretation.
Top tier: fresh-context agents attack the page; it runs alongside the program, and what survives goes into the same report.
-->

---

# When one agent is not enough

<div class="mt-6">
  <img src="/diagrams/05-dynamic-workflow.svg" alt="fan out across lenses, then a refutation panel per finding, then a majority filter" class="w-full">
</div>

<!--
The shape, not the API: many finders each with a different lens, then for each
finding a small panel whose instruction is to destroy it, then only the survivors.

This repository's review was built this way: three refuters per finding and a majority. Prompt 08
is lighter: one refuting subagent per finding. Say both — the diagram is the full version.
-->

---

# Adversarial review

<div class="mt-8 text-xl">

The instruction is not "review this".

The instruction is **"refute this, and default to refuted if you are unsure"**.

</div>

<div class="mt-6">

```text
ultracode. … inside a phase, spawn as many subagents as the work
needs and run them in parallel, deciding how many from what you find

PHASE 07 — ATTACK
… for every candidate they find, a separate subagent whose only
job is to argue against it from those three angles.
```

</div>

<div class="mt-6 text-lg">
That is <b>prompt 08</b>: prompts 01–07 as one message, phase for phase, with the differences it lists.
Take it home. Today, <b>prompt 07</b> in a new session, after the deploy, is the one-agent version.
</div>

<!--
This is the tier that catches what no gate can: copy that drifted, a focus order
that is valid and incoherent, a name that is a massacre.

That last one is real. It is in evidence/INCIDENTS.md and it is worth telling.

`ultracode` is a Claude Code keyword that unlocks multi-agent orchestration. Codex has no
equivalent; the word is harmless there, and the sentence after it does the work on both.

Say the 1:1 out loud: phase 03 of prompt 08 is prompt 03. Everything they did by hand today
is in it, in the same words. The differences are named in 08: plans go into notes.md instead of
waiting for approval, there is no /clear between phases, phase 04 builds sections in parallel,
and phase 07 runs its reviewers as subagents with a fresh context. A script writes 08 from 01–07, so the two cannot drift apart.
-->

---

# 08 — The same job, as a workflow

<div class="mt-5">
<PromptCard n="08" />
</div>

<p class="mt-5 text-xl">
Everything you did today, in one message. Use it on Monday on something that is not a festival.
</p>

<!--
Do not read this one. Show it, say it is long on purpose, and point at the Copy button: a
workflow prompt is long because every phase names its own exit condition, and a phase without
one is where a loop runs forever.

It is generated from prompts 01 to 07 by a script that fails the build if the two drift apart —
which is the same idea as the checker, applied to the teaching material.
-->

---

# Two shapes, and neither is a script

<div class="mt-4">
  <img src="/diagrams/07-loop-vs-workflow.svg" alt="the loop of plan, implement and verify, beside the seven phases of prompt 08, three of which branch" class="w-full">
</div>

<!--
This is the slide people will still be using in a year, when the tools have all
changed names.

A loop: you define the exit condition. A workflow: you define the phases and the bar
between them. Both are things you SAY. That is why changing one is a sentence rather
than an edit, a test run and a redeploy.

Point at phase 05 and say: a loop lives inside a workflow. Then at 04 and 07: a phase can run
several agents at once. That is the next slide.
-->

---

# Six workflow patterns

<div class="mt-2">
  <img src="/diagrams/08-workflow-patterns.svg" alt="classify and act, fan out and synthesize, adversarial verification, generate and filter, tournament, loop until done" class="w-full" style="max-height: 430px !important; object-fit: contain">
</div>

<!--
Prompt 08 uses three: fan out and synthesize in phase 04, loop until done in phase 05,
adversarial verification in phase 07. The other three are for later: classify and act routes
different kinds of task, generate and filter gives options, tournament picks between complete
attempts. Each one, with when to use it, is on the workshop page.
-->

---
layout: section
class: section
---

<div class="kicker">1:21 — 1:27 · sprint 3</div>

# Ship, then break it

---

# Deploy it, then try to break it

<div class="mt-6 text-xl">

<code>/clear</code>, then **prompt 06**. It builds, creates your Netlify site without asking questions, deploys, and checks that the page the
server returns is the page that passed. Take the URL it prints.

</div>

<div class="mt-6 text-xl">

**Prompt 07 is tonight's.** An agent that never saw the build tries to break the page. You pick the findings that are real; it fixes them, the check still passes, and it deploys again. Half an hour, and you do not have to watch it.

</div>

<div class="mt-8">

<p class="text-xl" style="color: var(--sp-accent-2)">
Put your URL on the board. We are going to look at all of them.
</p>

</div>

<!--
Have the shared board open on the projector. Thirty URLs appearing one at a time
is the best ending this session has, and it costs nothing to arrange.

Sell 07 properly, because it is the prompt they are most likely to actually run at home: in
the trial it took 30 minutes and found four things no check in the project could ask about —
including six third-level headings for three ticket tiers, which axe passes because no level
is skipped and a copy check cannot fail on a duplicate.

If the Netlify CLI keeps failing for someone: drag the dist folder onto app.netlify.com/drop.
-->

---

# 06 — Ship it

<div class="mt-5">
<PromptCard n="06" />
</div>

<p class="mt-5 text-xl">
The last line is the one that makes it a check and not a hope: run the same checker <b>against the address the server returns</b>.
</p>

<!--
Five minutes in the trial, no questions asked, site created by the CLI. It also caught
something worth repeating: the live run went red on two contrast failures inside the widget
Netlify injects when it serves a page — elements that are not in dist. The agent said so and
changed nothing. A deployed page is not the page you built until something has compared them.
-->

---

# 07 — Try to break it

<div class="mt-5">
<PromptCard n="07" />
</div>

<p class="mt-5 text-xl">
Tonight, not now. Thirty minutes, a context that never saw the build, and a brief to <b>attack</b>.
</p>

<!--
Sell this one. It is the cheapest thing on the list and the one that finds what no checker can
ask about: last night, six third-level headings for three ticket tiers at phone width, three of
them word-for-word repeats. axe passes it because no heading level is skipped, and a copy check
can only ever be helped by a duplicate string.

Note the three questions in the middle of the prompt — is it true, does it matter, is it
handled. Asked for five findings it returned four and said how many it threw away. That is what
an argument-first brief buys you.
-->


---
layout: section
class: section
---

<div class="kicker">1:27 — 1:30</div>

# What this does not do

---

# Take this to work on Monday

<div class="mt-8 text-xl">

Do not start with a whole landing page. Start with one gate.

</div>

<div class="mt-6">

1. Pick the check your team already does by hand and resents.
2. Make it a program that exits 0 or 1.
3. Put the failure output somewhere an agent can read.
4. Only then put an agent in front of it.

</div>

<div class="mt-8 text-xl">

The loop is the easy part. The oracle is the work.

</div>

---
layout: center
class: cover
---

<div class="kicker">Everything from today</div>

# <span class="wordmark">TURBINE</span>

<div class="mt-8 text-2xl" style="color: var(--sp-accent)">

waysconf.szymonpaluch.com

</div>

<div class="mt-8" style="color: var(--sp-fg-2)">

The eight prompts, in English and Polish · the `.fig` · these slides<br>
and the repository, with the checker and the evidence:
`github.com/hculap/waysconf-2026-agentic-loops`

</div>

<div class="mt-10">
<span style="color: var(--sp-fg-3)">Questions. And then go and put your URL on the board.</span>
</div>

<!--
Leave this slide up through the questions. Read the address out loud once — people
photograph it late.
-->
