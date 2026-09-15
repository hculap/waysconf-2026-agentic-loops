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
Timing card is in deck/notes/TIMING.md. Total 90 minutes, three hands-on sprints,
eight-minute buffer.

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

<div class="cols mt-8">
<div>

A landing page for a music festival that does not exist, built from a Figma file by an
agent you instructed, checked by a program that agent wrote and is not allowed to change,
fixed when it failed, and deployed to a URL you can send to someone.

<div class="mt-6">
<span class="verdict pass">exit 0</span>
</div>

</div>
<div>

### You leave with

A URL, live on the internet.

A folder: the page, and the checker that judged it.

Eight prompts that work on Monday, on something that is not a festival.

</div>
</div>

<!--
Switch to the browser here and show the real deployed site for about twenty seconds.
Scroll it. Then come back. Do not narrate the design; they can see it.

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

<div class="kicker">0:08 — 0:15</div>

# Setup
## An agent running in an empty folder

<!--
Hard stop at 0:15. Anyone not working by then goes to Codespaces, no discussion — the
click path is on the Before tab.
Ask for hands first: "who has a terminal open right now?" Send the rest to the browser
path immediately rather than one at a time.

The moment an agent is up, prompt 01 goes in. It takes about two minutes.
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

### And your empty repository

```bash
cd turbine      # made at home
claude          # or: codex
```

<p class="mt-6 text-xl">
It is <b>empty</b>, and there is no code to read.
</p>

<p class="mt-4" style="color: var(--sp-accent-2)">
Agent up? Paste <b>prompt 01</b> now.
</p>

</div>
</div>

<!--
Anyone who skipped the preparation page has no turbine repository: gh repo create turbine
--private --clone, then cd turbine. That page ends with a prompt that has the agent check the
whole setup — the people who ran it will not be the ones with their hands up.

Everyone downloads the same turbine.fig from the page; nobody needs a Figma account to take
part. The Figma link is for looking at the design, not for getting it out.
-->

---

# The terminal, in one slide

<div class="cols mt-6">
<div>

```bash
pwd                 # where am I
ls                  # what is here
cd turbine          # go in there
claude              # or: codex
```

<p class="mt-6">
<b>Ctrl+C</b> stops whatever is running.
</p>

</div>
<div>

It is a text field that runs programs.

It gives you no feedback while it works, which reads as "broken" and is almost always
"busy".

When a command finishes you get the prompt back. When you do not get the prompt back,
it is still going.

<p class="mt-4" style="color: var(--sp-fg-3)">
Full version: the Before tab, for your operating system
</p>

</div>
</div>

<!--
The "no feedback means busy" line is the one that saves you the most support
questions. Say it twice.
-->

---

# Every step runs the same way

<div class="mt-6">

| | What you do | Claude Code | Codex |
|---|---|---|---|
| 1. Plan | Switch to plan mode, paste the prompt, read the plan, approve it | `Shift+Tab` until *plan mode on* | `/plan` |
| 2. Implement | The agent builds what the plan says | | |
| 3. Commit | The agent commits the step and pushes it to your repository | written into the prompt | written into the prompt |
| 4. Clear | Empty the context before the next prompt | `/clear` | `/clear` |

</div>

<div class="mt-6 text-xl">
Prompts 02, 03 and 04 start in plan mode. The next prompt reads its state from files, not from the conversation.
</div>

<!--
Say this once, clearly, before prompt 02. It is the same four moves three times: the decoder,
the checker, the page. Clearing after each step is what keeps every step in a fresh context;
the commit is what makes every step undoable. Codex: /plan switches to Plan mode, /clear
starts a new chat. Claude Code: Shift+Tab cycles to plan mode, /clear empties the context.
-->

---
layout: section
class: section
---

<div class="kicker">0:15 — 0:25</div>

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
This is the longest thing any agent does all afternoon: sixteen minutes in the Claude Code
trial. Starting it now is what makes the checker block fit — it decodes while you talk about handing
over the file, and the findings are waiting when the checker block starts.

Claude Code in its default mode asks before each command. Tell the room to pick the option
that stops asking for that kind of command, or they will spend the time clicking yes.
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

<div class="cols mt-8">
<div>

### So you hand over the file

```txt
turbine.fig    from the workshop page
  canvas.fig   the whole document
  images/      every photo
```

Nothing in this workshop is blocked by a free Figma account.

</div>
<div>

### And the agent builds a decoder

It has never seen a `.fig`. It plans a decoder, writes it, runs `npm run design`, and fixes
it until twelve cards carry twelve names. The result stays in the project as JSON, for the
checker and for the page.

</div>
</div>

<!--
This is the moment to say the file is enough: one download, and nobody needs a Figma account to use it.

The plugin in figma-plugin/ built this file from the same tokens the code uses. Worth
ten seconds if someone asks where the file came from, not a slide.
-->

---
layout: section
class: section
---

<div class="kicker">0:25 — 0:40 · tests first</div>

# The verifier
## Written before the page

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
About eight minutes. A check that passes on an empty page is not checking anything. It commits; then <code>/clear</code>.
</p>

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

The page is built against that report, then fixed until the check passes.

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
495 seconds in the Codex trial. It runs through the next slides and the live demo.

Prompt 04 builds against this check and prompt 05 loops on it: npm run check is created here.
Do not skip it to save time — cut the demo before you cut this.
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
context where it decided everything, grading itself. In the workshop, prompt 06 is the third
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

# The reference site: ten gates, no opinions

<div class="mt-4">

| Gate | What it decides | Criteria |
|---|---|---|
| Build | It compiles, no type errors, one page out | AC-01…05 |
| Runtime | No console errors, no failed requests | AC-03…04 |
| Structure | Sections, headings, landmarks, skip link, ids | AC-06…14 |
| Accessibility | axe clean at three widths, focus, keyboard, motion | AC-15…25 |
| Design tokens | Every colour and size came from the design | AC-26…33 |
| Visual fidelity | Pixels match the design, within a stated budget | AC-34…37 |
| Content | The real copy, all twelve artists, no placeholders | AC-38…47 |
| Links | Nothing points at nothing | AC-48…51 |
| Lighthouse | Performance, a11y, best practices, SEO, and five budgets | AC-52…56 |
| **Text over images** | **The contrast axe refuses to judge** | **AC-61** |

</div>

<!--
Do not read the table. Let them read it while you say: every one of these returns
pass or fail the same way every time, and none of them asks a model anything.

Theirs, being written right now in prompt 03, is smaller. It should be. The shape is the
same: a program, the same answer twice, a report a stranger can act on.
-->

---

# Watch it catch something real

<div class="mt-8 text-xl">

The palette has a trap in it, on purpose.

</div>

<div class="cols mt-6">
<div>

```txt
color.text.muted   #6B7280
color.bg.base      #0A0B0D
```

<div class="mt-4">
<span class="verdict fail">4.07 : 1</span>
</div>

<p class="mt-4">Under the 4.5:1 that body text requires.</p>

</div>
<div>

```txt
color.text.secondary  #A7AEBB
color.bg.base         #0A0B0D
```

<div class="mt-4">
<span class="verdict pass">8.9 : 1</span>
</div>

<p class="mt-4">Ask any model for "a muted grey for supporting copy" and watch which one it reaches for.</p>

</div>
</div>

<!--
LIVE DEMO. This is the money shot of the whole session.

  1. change one class to text-text-muted
  2. npm run check
  3. show the red, and read the failure message out loud — it names the criterion,
     the selector, the measured ratio and the required one
  4. paste checks/report.md back to the agent
  5. show the green

Rehearse this until it takes under three minutes.

There is no recording of this demo yet. Make one before the talk — deck/notes/TIMING.md,
"Before you start". Without it, a dead wifi means skipping the demo and showing the
report file instead, which still makes the point.
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

# The rule that holds it all up

<div class="mt-10 text-2xl" style="color: var(--sp-fg)">

The agent may never edit the verifier.

</div>

<div class="mt-8 text-xl">

It is in prompt 05, in capitals, and it comes first:

</div>

<div class="mt-6">

```text
1. NEVER change the checker to make a check pass. Not a threshold,
   not a skipped assertion, not a rule switched off. If you believe
   a check is wrong, STOP, tell me which one and why.
```

</div>

<!--
Somebody always asks whether the agent tries. Answer with the evidence slide two
along, not with an opinion.
-->

---

# Here is what actually happened

<div class="mt-4">

These prompts, an **empty folder** outside every repository, nothing else.

</div>

<div class="mt-4">

| Prompt | Agent | Result |
|---|---|---|
| 01 — a project exists | Codex | **107 s** |
| 02 — reads the `.fig` | Claude Code | **16 min** — 12/12 names, every colour, all widths |
| 03 — a hero from the design | Codex | **41 s** |
| 04 — **writes its own checker** | Codex | **495 s** — 264 lines, tests unasked |
| 05 — the loop runs | Codex | **46 s** |

</div>

<p class="mt-4" style="color: var(--sp-accent-2)">
Unasked, 04 treated axe's <em>incomplete</em> results as failures — from one sentence:
<b>&ldquo;a check that cannot run is a failure, never a skip&rdquo;</b>.
</p>

<!--
Numbers come from evidence/prompt-trial.md (Codex: 01, 03, 04, 05) and
evidence/fig-trial-claude-2026-09-14.md (Claude Code: 02). Refill the table from those
files, not from memory — the whole point of the slide is that it is measured.

Say the caveats out loud, because they are what make the numbers credible:
- two agents, one prompt each; nobody has run the whole sequence end to end on one agent
- the Claude run bypassed permission prompts; a participant will be asked before each
  command, and prompt 02 is sixty commands
- 02's fell into the component-text trap first — nine cards read "KASIMIR VOLT" — then
  noticed and fixed it itself

The 04 line is the one that matters. Nobody asked for the incomplete-results decision; it
fell out of one sentence. That is the argument for writing the standard into the prompt
rather than trusting the agent to hold it.
-->

---

# And here is what went wrong

<div class="mt-6 text-lg">

Thirteen incidents while building this. **Nine were failures of the verifier or the harness, not of the page.**

</div>

<div class="mt-6">

| What | Why it is in the deck |
|---|---|
| Nine gates ran against **somebody else's website** for a whole run — 427 confident, correctly-formatted failures | A verifier that is confident and wrong is worse than none |
| **axe passed a blank page.** Zero violations, three breakpoints, green | A measurement of nothing looks exactly like a measurement of perfection |
| The loop hung for an hour on a stdin nobody closed | Third unbounded wait in one project |
| The **evidence harness fabricated** four clean iterations out of a killed run | Absence read as success — fourth time, and the only one that invented a table |
| The gate was green and **the hero was illegible** — five of nine pieces of text below the legal minimum | axe does not fail text over a photograph. It marks it *incomplete* |

</div>

<p class="mt-6" style="color: var(--sp-fg-3)">
evidence/INCIDENTS.md — all thirteen, written down at the time
</p>

<!--
Do not rush this slide and do not apologise for it. It is the most credible thing in
the deck, and the "427 failures about someone else's site" story lands every time.

The last row is the one to end on, because it is the only one a careful person could
not have avoided. Everything above it was a bug. That one was the tool working exactly
as documented, and the documentation being somewhere nobody reads.
-->

---
layout: section
class: section
---

<div class="kicker">0:40 — 0:55 · sprint 1</div>

# Build the page

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
Every prompt stands alone. A half-built page with a working checker teaches more than
a finished page with none.
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
layout: section
class: section
---

<div class="kicker">0:55 — 1:10 · sprint 2 runs in the background</div>

# The loop, and workflows

<!--
Start them looping FIRST, then talk. Their machines work while they listen; that
is where the fifteen minutes comes from.
-->

---

# Start your loop now, then listen

<div class="mt-4 text-xl">
<code>/clear</code>, then paste <b>prompt 05</b>. Then leave it alone — I will talk over it, and when it
stops we will look at what it did.
</div>

<div class="mt-6">

```text
Run npm run check. If it exits 0, stop and tell me.
If it does not, read the report it wrote, fix what it names,
run it again. Repeat until it exits 0.

NEVER change the checker to make a check pass.
```

</div>

<div class="mt-6 text-xl">
On Claude Code you can make it structural instead of trusted:
</div>

```text
/goal npm run check exits 0
```

<p class="mt-4" style="color: var(--sp-accent-2)">
The session cannot end until that command actually exits 0. Codex has no equivalent —
there, the paragraph is the mechanism.
</p>

<!--
Give them ninety seconds to get it started. Check that at least two thirds of the
room has it running before you continue, by show of hands.
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

Point at phase 05 and say: a loop lives inside a workflow. Then at 03 and 07: a phase can run
several agents at once. That is the next slide.
-->

---

# Six workflow patterns

<div class="mt-2">
  <img src="/diagrams/08-workflow-patterns.svg" alt="classify and act, fan out and synthesize, adversarial verification, generate and filter, tournament, loop until done" class="w-full" style="max-height: 430px !important; object-fit: contain">
</div>

<!--
Prompt 08 uses three: fan out and synthesize in phase 04, loop until done in phase 05,
adversarial verification in phase 06. The other three are for later: classify and act routes
different kinds of task, generate and filter gives options, tournament picks between complete
attempts. Each one, with when to use it, is on the workshop page.
-->

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

Reads the brief.

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

# When one agent is not enough

<div class="mt-6">
  <img src="/diagrams/05-dynamic-workflow.svg" alt="fan out across lenses, then a refutation panel per finding, then a majority filter" class="w-full">
</div>

<!--
The shape, not the API: many finders each with a different lens, then for each
finding a small panel whose instruction is to destroy it, then only the survivors.

This repository was built this way. Say that — it is more convincing than the diagram.
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
That is <b>prompt 08</b>: prompts 01–07 as one message, phase for phase, word for word.
Take it home. Today, <b>prompt 06</b> in a new session is the one-agent version, before you deploy.
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
and phase 06 runs its reviewers as subagents with a fresh context. A script writes 08 from 01–07, so the two cannot drift apart.
-->

---
layout: section
class: section
---

<div class="kicker">1:10 — 1:22 · sprint 3</div>

# Review, then ship

---

# Break it, then deploy it

<div class="mt-6 text-xl">

<code>/clear</code>, then **prompt 06**. An agent that never saw the build tries to break the page. Pick the findings that are real; it fixes them, and the check still passes.

</div>

<div class="mt-6 text-xl">

<code>/clear</code>, then **prompt 07**, the last step. It builds, deploys to Netlify, and checks that the page the
server returns is the page that passed.

</div>

<div class="mt-6 text-xl">

It asks you to pick or create a site. Take the URL it prints.

</div>

<div class="mt-8">

<p class="text-xl" style="color: var(--sp-accent-2)">
Put your URL on the board. We are going to look at all of them.
</p>

</div>

<!--
Have the shared board open on the projector. Thirty URLs appearing one at a time
is the best ending this session has, and it costs nothing to arrange.

If Netlify CLI auth is fighting someone, dragging the build folder onto netlify.com works
with no CLI at all.

Short on time: skip prompt 06 and deploy. The URL on the board matters more.
-->

---

# The gate was green. The hero was illegible.

<div class="mt-6 text-lg">

Zero axe violations. Three breakpoints. Six page states. Twice, deterministically.
Lighthouse accessibility **100**.

</div>

<div class="cols mt-6">
<div>

Then I measured the hero by hand — screenshot the page with every glyph made transparent,
sample the brightest patch behind each line, compute the real ratio.

| Text | Measured |
|---|---|
| "Fourth edition" | <span class="verdict fail">2.94:1</span> |
| "Ambient, techno and modular…" | <span class="verdict fail">3.02:1</span> |
| "The Powerhouse, Hall E" | <span class="verdict fail">4.25:1</span> |
| "Friday 12 – Sunday 14 June" | <span class="verdict fail">4.41:1</span> |

</div>
<div>

### Why axe said nothing

It does not evaluate text over a background image. It does not fail it — it marks the pair
**incomplete**, and in a zero-violations gate that is indistinguishable from correct.

Reading the CSS would not have found it either. The background there is a photograph, two
scrims and a gradient composited together. No computed style says what colour that is.

<p class="mt-4" style="color: var(--sp-accent-2)">
So it became AC-61, and there are sixty-one criteria now instead of sixty.
</p>

</div>
</div>

<!--
This is the strongest slide in the deck and the one to slow down on.

The gate was not lying. It was answering a narrower question than the word PASS suggests,
and nobody had written down which question. That is the entire argument, found inside this
repository's own verifier, on the most prominent element of the page.

If someone asks how it was found: the repo's own asset checker flagged that 4.47% of tiles
in the lower half of the hero photograph were too bright for white text. That is a check on
the *image*. Whether it mattered on the *page* took a separate measurement.

The fix took two attempts. The first darkened the whole frame and erased the photograph —
worth mentioning, because "make the gate green" and "make the page good" pulled in opposite
directions for about ten minutes.
-->

---
layout: section
class: section
---

<div class="kicker">1:22 — 1:30</div>

# What this does not do

---

# Honesty

<div class="mt-8">

| The claim | The limit |
|---|---|
| The a11y gate is green | Automated rules reach maybe 30–40% of real WCAG failures |
| The pixel diff passes | It saw no change. It has no idea whether a change would be better |
| Adversarial review found nothing | A review finds what it looks for. It runs beside the program, never instead of it |
| All sixty-one criteria pass | Nothing here has an opinion about whether the design is good |

</div>

<div class="mt-8 text-xl">
Green means <b>no known defect</b>. It has never meant finished.
</div>

<!--
Do not soften this. A room of designers will trust the rest of the talk more
because of this slide, not less.
-->

---

# Where loops actually fail

<div class="cols mt-6">
<div>

**It edits the test.** The gate goes green and nothing was fixed. Forbid it in writing,
and check that the file did not change.

**It oscillates.** Two wrong states, alternating. Usually two criteria that contradict
each other. Cap the iterations and read the log.

**It keeps going after it is done.** Run the verifier *first*, every pass.

</div>
<div>

**It runs out of context mid-task.** Put the state in a file.

**It reports success without running anything.** Only believe the exit code.

**It hangs.** Not failing, just waiting. Every step needs a deadline — this project hung
three times: six minutes, seven, and an hour.

</div>
</div>

<!--
Each of these has a line in docs/TIPS.md with the symptom and the fix. Tell them
that, rather than reading the slide.
-->

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
