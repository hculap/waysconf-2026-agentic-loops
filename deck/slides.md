---
theme: default
title: Build an AI that checks and fixes its own work
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
the repo QR should be on the room's screen as people come in.
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

A landing page for a music festival that does not exist, built from a Figma design by
an agent you instructed, checked by a verifier that does not care what the agent thinks,
fixed by the agent when it failed, and deployed to a URL you can send to someone.

<div class="mt-6">
<span class="verdict pass">all gates green</span>
</div>

</div>
<div>

```bash
npm run check
```

```txt
✓ 10/10 gates passed.

  Build             PASS
  Runtime           PASS
  Structure         PASS
  Accessibility     PASS
  Design tokens     PASS
  Visual fidelity   PASS
  Content           PASS
  Links             PASS
  Text over images  PASS
  Lighthouse        PASS
```

</div>
</div>

<!--
Switch to the browser here and show the real deployed site for about twenty seconds.
Scroll it. Then come back. Do not narrate the design; they can see it.
-->

---

# The loop

<div class="mt-6">
  <img src="/diagrams/01-the-loop.svg" alt="generate, verify, repair, gate, deploy" class="w-full">
</div>

<!--
Point at the arrow going back. Say: that arrow is driven by a file, not by a feeling.
-->

---
layout: section
class: section
---

<div class="kicker">0:08 — 0:15</div>

# Checkpoint 0
## Everyone gets a working environment

<!--
Hard stop at 0:15. Anyone not working by then goes to Codespaces, no discussion.
Ask for hands first: "who has a terminal open right now?" Send the rest to the
browser path immediately rather than one at a time.
-->

---

# You need two things

<div class="cols mt-8">
<div>

### The design

The TURBINE file in Figma, saved as one **`.fig`** that your agent reads by itself. No
Figma account? The same file is on the page.

### The prompts

<p class="mt-2" style="color: var(--sp-accent-2)">
waysconf.szymonpaluch.com
</p>

Eight of them, with a copy button on each.

</div>
<div>

### And an empty folder

```bash
mkdir turbine && cd turbine
claude          # or: codex
```

<p class="mt-6 text-xl">
There is <b>nothing to clone</b> and no code to read.
</p>

<p class="mt-4" style="color: var(--sp-accent-2)">
The project, the page, and the program that checks the page — the agent makes all
three for itself.
</p>

</div>
</div>

<!--
Say out loud that the browser path is not the lesser path. People who pick it
because they have to will otherwise spend the session feeling behind.
-->

---

# Two shapes, and neither is a script

<div class="mt-4">
  <img src="/diagrams/07-loop-vs-workflow.svg" alt="A loop defined by its exit condition, beside a workflow defined by its phases" class="w-full">
</div>

<!--
This is the slide people will still be using in a year, when the tools have all
changed names.

A loop: you define the exit condition. A workflow: you define the phases and the bar
between them. Both are things you SAY. That is why changing one is a sentence rather
than an edit, a test run and a redeploy.

Point at phase 4 and say: a loop lives inside a workflow. That nesting is the usual
arrangement and nobody draws it.
-->

---

# The terminal, in one slide

<div class="cols mt-6">
<div>

```bash
pwd                 # where am I
ls                  # what is here
cd my-turbine       # go in there
npm run dev         # start the site
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
Full version: docs/TERMINAL-IN-TEN-MINUTES.md
</p>

</div>
</div>

<!--
The "no feedback means busy" line is the one that saves you the most support
questions. Say it twice.
-->

---
layout: section
class: section
---

<div class="kicker">0:15 — 0:25</div>

# Design in, not screenshots in

---

# MCP, in one sentence

<p class="text-2xl mt-10" style="color: var(--sp-fg)">
A standard way for a coding agent to call tools that are not inside it.
</p>

<div class="mt-10">
  <img src="/diagrams/04-mcp-topology.svg" alt="agent connected to Figma, a browser and a deploy target, over a shared repository" class="w-full">
</div>

<!--
Resist explaining the protocol. Nobody in this room needs the protocol. They need
to know that the agent can now read the actual design instead of a picture of it.
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

### The design itself

Colours arrive as values.
Spacing arrives as numbers.

```json
"color": {
  "accent": {
    "sodium": { "$value": "#FF6A1A" }
  }
}
```

Nothing is guessed, so nothing is guessed wrong.

<div class="mt-6"><span class="verdict pass">token gate passes</span></div>

</div>
</div>

<!--
This is the slide the designers in the room came for. Spend a moment on it.
Then be honest about the Figma seat requirement on the next slide — they will
find out anyway, and finding out from you costs nothing.
-->

---

# The honest bit about Figma

<div class="mt-8 text-xl">

The official Figma MCP server needs a paid seat, and even then it runs on a budget. On a
free account that budget is 20 calls a month — gone before the design is read.

</div>

<div class="cols mt-8">
<div>

### So you hand over the file

```txt
File → Save local copy → turbine.fig
  canvas.fig   the whole document
  images/      every photo
```

Nothing in this workshop is blocked by a free Figma account.

</div>
<div>

### And the agent decodes it

It has never seen a `.fig`. It writes a decoder, reads what comes out, and tries again
until twelve cards carry twelve names — the first loop of the day. It may install a
package to do it, so let it use the network.

</div>
</div>

<!--
This is the moment to say the file is enough. Figma's own limits: Starter 20 MCP calls
a month; View or Collab seats 6 a month on paid plans; Dev or Full 200 a day on
Professional, 600 on Organization. A page read takes dozens.

The plugin in figma-plugin/ built this file from the same tokens the code uses. Worth
ten seconds if someone asks where the file came from, not a slide.
-->

---
layout: section
class: section
---

<div class="kicker">0:25 — 0:40 · sprint 1</div>

# Plan first, then build

---

# Read the plan before it writes the code

<div class="mt-8 text-xl">

Plan mode is the cheapest correction in the entire loop. A wrong assumption costs one
sentence to fix here, and twenty minutes of generated code to fix later.

</div>

```bash
# Claude Code: Shift+Tab until the footer says "plan mode on"
# Codex CLI:   ask for a plan and refuse to accept code until you have read it
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

```bash
mkdir turbine && cd turbine
claude          # or: codex
```

Then, from the prompts page:

<p class="mt-2 text-xl">
<b>01</b> start &nbsp;→&nbsp; <b>02</b> look at the design &nbsp;→&nbsp; <b>03</b> build
</p>

<p class="mt-4" style="color: var(--sp-accent-2)">
Prompt 02 writes nothing. Read what it says it found before you let it near a file.
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
At 0:37 give a two-minute warning regardless of where anyone is.
-->

---
layout: section
class: section
---

<div class="kicker">0:40 — 0:55</div>

# The verifier
## The only part that matters

---

# A real loop and a fake one

<div class="mt-6">
  <img src="/diagrams/02-fake-loop-vs-real-loop.svg" alt="a model grading its own output, beside a model judged by a separate program" class="w-full">
</div>

<!--
Do not rush this. It is the second most important slide in the deck.

The fake loop feels productive. It produces text that says "I have reviewed my work
and improved it", which is indistinguishable from the real thing until something
external disagrees.
-->

---

# Where self-assessment is fine, and where it is not

<div class="cols mt-8">
<div>

### Fine

Is this sentence any good.

Which of these five findings matters most.

Does this read as the same brand.

Is the hierarchy clear.

<p class="mt-4" style="color: var(--sp-fg-3)">
Taste, prioritisation, judgement.
</p>

</div>
<div>

### Not fine

Is this correct.

Is it accessible.

Does it match the design.

Is it finished.

<p class="mt-4" style="color: var(--sp-fg-3)">
Anything with an external truth.<br>
Use the external truth.
</p>

</div>
</div>

<!--
People will push back here, usually with "but the model is very good at this now".
The answer is not that it is bad at it. The answer is that it has no way to be
reliably right, and you have no way to tell which time it was.
-->

---

# Three tiers of checking

<div class="mt-6">
  <img src="/diagrams/03-verification-tiers.svg" alt="deterministic gates, measured comparison, adversarial review" class="w-full">
</div>

<!--
Bottom tier: cheap, certain, narrow.
Middle tier: measurable but needs interpretation.
Top tier: catches what the others cannot, least reliable, never the only gate.
-->

---

# Ten gates, sixty-one criteria, no opinions

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

Rehearse this until it takes under three minutes. If the room's wifi is gone, the
recording is at evidence/loop-repair.mp4.
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

It is written into `AGENTS.md`. It is checked in the dry-run harness. If an agent modifies
anything under `checks/`, the run is recorded as compromised regardless of what the gates
then say.

</div>

<div class="mt-8">

```txt
| Verifier modified by the agent | no |
```

</div>

<!--
Somebody always asks whether the agent tries. Answer with the evidence slide two
along, not with an opinion.
-->

---

# Here is what actually happened

<div class="mt-4">

These prompts, an **empty folder** outside every repository, Codex. Exactly what you have
in front of you now.

</div>

<div class="mt-6">

| Codex CLI, empty folder | |
|---|---|
| 01 — a project exists | **107s** |
| 03 — a hero, from the values given | **41s** |
| 04 — **the agent writes its own checker** | **495s** |
| 05 — the loop runs | **46s** |
| What 04 produced | `check.mjs`, 264 lines — plus tests for it and a document explaining it, unasked |
| What it decided alone | to treat axe's *incomplete* results as failures |

</div>

<p class="mt-4" style="color: var(--sp-accent-2)">
That last row came out of one sentence in the prompt: <b>&ldquo;a check that cannot run is a
failure, never a skip&rdquo;</b>. Finding it by hand cost me an afternoon.
</p>

<!--
The Claude Code line is deliberately NOT on the slide — it was 150px of overflow and
checks/deck.mjs failed the slide for it. Say it out loud instead; it is in the notes
below and it is worth more spoken than read.
-->

<!--
Numbers come from evidence/prompt-trial.md. Refill this table from that file before the
talk rather than from memory — the whole point of the slide is that it is measured.

The row that matters is the last one. Nobody asked for the incomplete-results decision;
it fell out of one sentence in prompt 04. That is the argument for writing the standard
into the prompt rather than trusting the agent to hold it.

Say the Claude line out loud rather than skipping it. "I promised two agents and I am
showing you one, and here is exactly why" is worth more than a second column of numbers,
and it sets up the honesty slide at the end. If you run the trial on your laptop before
the conference, replace this with the second column and drop the caveat.
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

<div class="kicker">0:55 — 1:10 · sprint 2 runs in the background</div>

# The loop, and workflows

<!--
Start them looping FIRST, then talk. Their machines work while they listen; that
is where the fifteen minutes comes from.
-->

---

# Start your loop now, then listen

<div class="mt-4 text-xl">
Paste <b>prompt 05</b>. Then leave it alone — I will talk over it, and when it stops we
will look at what it did.
</div>

<div class="mt-6">

```text
Run npm run check. If it exits 0, stop and tell me.
If it does not, read check-report.md, fix what it names, run it again.
Repeat until it exits 0.

NEVER change check.mjs to make a check pass.
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

Reads `checks/report.md` — the current failures.

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

<div class="mt-8">

```js
const votes = await parallel(LENSES.map(lens => () =>
  agent(`Try to refute: ${finding}. Default to refuted if uncertain.`,
        { schema: VERDICT })))

const survives = votes.filter(v => !v.refuted).length >= 2
```

</div>

<div class="mt-8 text-xl">
A reviewer asked to find problems finds problems. A reviewer asked to destroy a
specific claim either destroys it or fails to.
</div>

<!--
This is the tier that catches what no gate can: copy that drifted, a focus order
that is valid and incoherent, a name that is a massacre.

That last one is real. It is in evidence/INCIDENTS.md and it is worth telling.
-->

---
layout: section
class: section
---

<div class="kicker">1:10 — 1:22 · sprint 3</div>

# Ship it

---

# Deploy

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

<div class="mt-8 text-xl">

It will ask you to sign in, then to pick or create a site. Take the URL it prints.

</div>

<div class="mt-8">

<p class="text-xl" style="color: var(--sp-accent-2)">
Put your URL on the board. We are going to look at all of them.
</p>

</div>

<!--
Have the shared board open on the projector. Thirty URLs appearing one at a time
is the best ending this session has, and it costs nothing to arrange.

If Netlify CLI auth is fighting someone, the Netlify MCP server can do it, and
dragging the dist/ folder onto netlify.com works with no CLI at all.
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
| Adversarial review found nothing | Models checking models. Least reliable tier, never the only one |
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

**It hangs.** Not failing, just waiting. Every step needs a deadline — this repository
lost six minutes to exactly that, and it is written down.

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

<div class="mt-8 text-xl">

`github.com/hculap/waysconf-2026-agentic-loops`

</div>

<div class="mt-10" style="color: var(--sp-fg-2)">

The brief · every prompt I used · the verifier · the Figma plugin ·<br>
the evidence from both clean-room runs · these slides

</div>

<div class="mt-10">
<span style="color: var(--sp-fg-3)">Questions. And then go and put your URL on the board.</span>
</div>

<!--
Hold the QR up for a slow ten seconds. People photograph it late.
-->
