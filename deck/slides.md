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
fonts:
  sans: Inter
  serif: Inter
  mono: JetBrains Mono
---

<style>
@import './style.css';
</style>

<div class="kicker">WaysConf 2026 · masterclass · 90 minutes</div>

# Build an AI that checks and fixes its own work

<p class="text-2xl mt-6" style="color: var(--turbine-text)">
Agentic loops in practice.
</p>

<p class="mt-10">
Szymon Paluch · CTO, Susteen<br>
<span style="color: var(--turbine-muted)">ROOM-PM · 16 September 2026</span>
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

<div class="mt-8 text-xl" style="color: var(--turbine-text)">

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

<p class="text-xl mt-8" style="color: var(--turbine-text-2)">
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
✓ 9/9 gates passed.

  Build            PASS
  Runtime          PASS
  Structure        PASS
  Accessibility    PASS
  Design tokens    PASS
  Visual fidelity  PASS
  Content          PASS
  Links            PASS
  Lighthouse       PASS
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

# Two doors, same room

<div class="cols mt-8">
<div>

### On your machine

```bash
gh repo create my-turbine \
  --template hculap/waysconf-2026-agentic-loops \
  --public --clone
cd my-turbine
npm install
npm run dev
```

Node 20.11 or newer. Nothing else.

</div>
<div>

### In your browser

**Use this template** → **Create a new repository**

**Code** → **Codespaces** → **Create codespace**

Three minutes. Node, both agents and the browser the gates need are already installed.

<p class="mt-4" style="color: var(--turbine-coolant)">
No install. No admin rights. Works on a locked-down work laptop.
</p>

</div>
</div>

<!--
Say out loud that the browser path is not the lesser path. People who pick it
because they have to will otherwise spend the session feeling behind.
-->

---

# GitHub, for people who have never used it

<div class="mt-6">

| You already know this as | GitHub calls it |
|---|---|
| A shared folder that remembers every version | a **repository** |
| Save, with a note about what changed | a **commit** |
| Duplicating a file so you can experiment safely | a **branch** |
| Sending your version back for review | a **pull request** |
| The folder your website is published from | **the thing Netlify reads** |

</div>

<p class="mt-8 text-xl">
For the next ninety minutes you need the first two. That is genuinely all.
</p>

<!--
Do not teach git. Teach the mental model and move on. docs/GITHUB-FOR-DESIGNERS.md
is in the repo for afterwards; say that it exists.
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

<p class="mt-4" style="color: var(--turbine-muted)">
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

<p class="text-2xl mt-10" style="color: var(--turbine-text)">
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

The official Figma MCP server needs a paid seat. On a free account it connects and then
declines to hand anything over.

</div>

<div class="cols mt-8">
<div>

### So the repository ships the design as data

```txt
design/export/    PNGs at 390, 768, 1440
design/tokens/    every colour, size, space
design/FIGMA-SPEC.md   the layout, in numbers
```

Nothing in this workshop is blocked by a free Figma account.

</div>
<div>

### And as a plugin that rebuilds the file

```txt
figma-plugin/
```

Run it inside Figma and it constructs the whole TURBINE file — variables, text styles,
components, every frame — from the same tokens the code uses.

</div>
</div>

<!--
The plugin is a genuinely nice thing to show for ten seconds. It also makes the
point that "the design file" and "the code" can have one source rather than two.
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
# 1. point your agent at the repo
claude          # or: codex

# 2. give it the first prompt
loop/prompts/01-plan.md

# 3. read the plan, then let it build
#    the nav and the hero
```

</div>
<div>

<p class="text-xl">Falling behind is normal and planned for.</p>

```bash
git checkout step-1
```

<p class="mt-6" style="color: var(--turbine-muted)">
Every stage of this session is a branch.<br>
CHECKPOINTS.md lists all six.
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

<p class="mt-4" style="color: var(--turbine-muted)">
Taste, prioritisation, judgement.
</p>

</div>
<div>

### Not fine

Is this correct.

Is it accessible.

Does it match the design.

Is it finished.

<p class="mt-4" style="color: var(--turbine-muted)">
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

# Nine gates, sixty criteria, no opinions

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
| Lighthouse | Performance, a11y, best practices, SEO | AC-52…55 |

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
**3. [AC-28] color.text.muted (#6B7280) used outside the footer legal block**

- Where: `section[data-section="lineup"] .artist-card p`
- Expected: `color.text.secondary (#A7AEBB)`
- Actual: `#6B7280` — 4.07:1 against #0A0B0D, minimum 4.5:1
- Hint: supporting copy uses text.secondary; muted is legal text only
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

<div class="mt-10 text-2xl" style="color: var(--turbine-text)">

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

<div class="mt-6">

I ran this before the conference, twice, in a fresh worktree with nothing shared — no
`node_modules`, no `dist`, no notes. One agent, pointed at `step-3`, which ships with two
deliberate mistakes.

</div>

<div class="mt-8">

| Codex CLI, from `step-3` | |
|---|---|
| Failures at the start | **86**, across the accessibility and design-token gates |
| Agent passes to green | **1** |
| Time in the agent | 520s |
| Time in the verifier | 172s, then 205s |
| Criteria cleared | AC-15, AC-23, AC-28, AC-29, AC-52, AC-53 |
| Anything regressed | none |
| **Verifier modified** | **no** |

</div>

<p class="mt-6" style="color: var(--turbine-muted)">
evidence/dry-run-codex.md — measured by a program, not reported by the agent
</p>

<p class="mt-2" style="color: var(--turbine-muted)">
The Claude Code trial did not run on my machine: a hook belonging to something else
refuses headless invocations. <b>That is recorded as a non-run, not as a gap</b> —
evidence/dry-run-claude.md.
</p>

<!--
Numbers come from evidence/dry-run-codex.md. Refill this table from that file before the
talk rather than from memory — the whole point of the slide is that it is measured.

The row that matters is the last one. Somebody always asks whether the agent cheats.

Say the Claude line out loud rather than skipping it. "I promised two agents and I am
showing you one, and here is exactly why" is worth more than a second column of numbers,
and it sets up the honesty slide at the end. If you run the trial on your laptop before
the conference, replace this with the second column and drop the caveat.
-->

---

# And here is what went wrong

<div class="mt-6 text-lg">

Twelve incidents while building this. **Eight were failures of the verifier or the harness, not of the page.**

</div>

<div class="mt-6">

| What | Why it is in the deck |
|---|---|
| Nine gates ran against **somebody else's website** for a whole run — 427 confident, correctly-formatted failures | A verifier that is confident and wrong is worse than none |
| **axe passed a blank page.** Zero violations, three breakpoints, green | A measurement of nothing looks exactly like a measurement of perfection |
| The loop hung for an hour on a stdin nobody closed | Third unbounded wait in one project |
| The **evidence harness fabricated** four clean iterations out of a killed run | Absence read as success — fourth time, and the only one that invented a table |

</div>

<p class="mt-6" style="color: var(--turbine-muted)">
evidence/INCIDENTS.md — all twelve, written down at the time
</p>

<!--
Do not rush this slide and do not apologise for it. It is the most credible thing in
the deck, and the "427 failures about someone else's site" story lands every time.

The punchline, if you want one: the guideline page we sent participants was quoting
that 427 as their expected output, until somebody noticed where the number came from.
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

```bash
bash loop/ralph.sh
```

<div class="mt-8 text-xl">

It will run for several minutes. Leave it. I will talk over it, and when it stops we will
look at what it did.

</div>

<div class="mt-6">

```bash
AGENT=codex bash loop/ralph.sh    # if you are on ChatGPT Plus
MAX=3 bash loop/ralph.sh          # if you would rather it stopped sooner
```

</div>

<!--
Give them ninety seconds to get it started. Check that at least two thirds of the
room has it running before you continue, by show of hands.
-->

---

# The whole loop

```bash
for i in $(seq 1 "$MAX"); do

  # the verifier runs FIRST: if the gates are green there is nothing to do,
  # and an agent asked to improve passing work will invent a reason
  if npm run --silent check; then
    echo "All gates passed on iteration $i."; exit 0
  fi

  # hand the report back, unchanged
  claude -p "$(cat loop/PROMPT.md)" --permission-mode acceptEdits

  # a commit per pass, so you can see exactly what each one did
  git add -A && git commit -q -m "loop: iteration $i"
done
```

<div class="mt-6 text-xl">
That is it. The rest of <code>ralph.sh</code> is guard rails.
</div>

<!--
Credit where it is due: this shape is Geoffrey Huntley's, widely known as the
"Ralph Wiggum" technique. Say so.

The three things that make it work, in order of how often they are missed:
  1. the exit condition is a program
  2. state is in files, so a fresh context is not a handicap
  3. there is a hard cap, so it cannot run all night
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

Reads `loop/PROGRESS.md` — what was already tried, and what it cost.

Reads the brief.

<p class="mt-4" style="color: var(--turbine-coolant)">
Notes on disk beat memory in context.
</p>

</div>
</div>

<!--
PROGRESS.md is the underrated artifact in this repo. It is how iteration 7 knows
that iteration 3 already tried the obvious thing and why it did not work.
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

<p class="text-xl" style="color: var(--turbine-coolant)">
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
| All sixty criteria pass | Nothing here has an opinion about whether the design is good |

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

<div class="mt-10" style="color: var(--turbine-text-2)">

The brief · every prompt I used · the verifier · the Figma plugin ·<br>
the evidence from both clean-room runs · these slides

</div>

<div class="mt-10">
<span style="color: var(--turbine-muted)">Questions. And then go and put your URL on the board.</span>
</div>

<!--
Hold the QR up for a slow ten seconds. People photograph it late.
-->
