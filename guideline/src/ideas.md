# The ideas

Everything on the slides, on one page, so you can read it back afterwards instead of
photographing a screen. The pictures are the same ones on the wall, and they are yours to
reuse.

---

## The ninety minutes

::diagram:06-ninety-minutes::

Three hands-on stretches, and the middle one runs on your machine while I talk over it.
Nothing here needs the previous thing to have worked — **every prompt stands alone**, and
falling behind costs you nothing but the part you skipped.

**What you leave with:** a URL that is live on the internet, a folder containing a page and
a program that checks it, and eight prompts that work on Monday against something that is
not a festival site.

---

## Most AI demos stop at *wow*

A prompt goes in. Something impressive comes out. Everyone claps. Then somebody asks a
question the demo was not built to survive:

*Does it match the design? Is the contrast legal? Does it work on a phone? Is that the
actual copy, or copy it invented?*

No answer. Not a wrong answer — **no mechanism capable of producing one.**

> A loop is only worth building if something in it can say **no** without asking a language
> model for permission.

---

## The loop

::diagram:01-the-loop::

The interesting part is not the arrow that generates code. It is the box that refuses.

The arrow going back is driven by a **file** — a report a program wrote — not by the
agent's impression of its own work. That is the whole difference.

---

## A real loop and a fake one

::diagram:02-fake-loop-vs-real-loop::

The fake loop feels productive. It produces sentences like *"I have reviewed my work and
improved it"*, which are indistinguishable from the real thing right up until something
external disagrees.

The same model writes the same page in both diagrams. What changes is **who is allowed to
say no.**

---

## Where self-assessment is fine, and where it is not

| Fine | Not fine |
|---|---|
| Is this sentence any good | Is this correct |
| Which of these five findings matters most | Is this accessible |
| Does this read as the same brand | Does this match the design |
| Is the hierarchy clear | Is it finished |

The left column has no external truth to check against, so a thoughtful opinion is the best
instrument available. The right column has one — so use it, and do not accept an opinion
instead.

---

## Two shapes

::diagram:07-loop-vs-workflow::

**A loop** is *do this again until a condition holds*. You define the exit condition.
→ prompt 05, and `/goal` in Claude Code.

**A workflow** is *do these things, in this order, with a bar between each*. You define the
phases and what has to be true before the next one starts. → prompt 08.

Neither is a script. Both are things you **say** — which is why changing one is a sentence
rather than an edit, a test run and a redeploy.

They nest. The workflow gets you from nothing to nearly-right; a loop inside one of its
phases closes the last gap.

---

## Plan first, and read the plan

The cheapest correction in the whole loop is the one made before any code exists.

In **Claude Code**, press `Shift+Tab` until the footer says *plan mode on*. It cannot edit
anything until you approve. In **Codex**, ask for the plan and refuse to accept code until
you have read it:

```text
Do not write any code yet. Tell me what you found and what you intend to build,
section by section, and wait.
```

That is what prompt 02 is. It writes nothing at all — it looks at the design and reports
back. A designer reading three paragraphs and saying *"no, the lineup comes before the
tickets"* has just saved twenty minutes of confident, wrong building.

> The best time to catch a misunderstanding is while it is still a sentence.

---

## Three tiers of checking

::diagram:03-verification-tiers::

The bottom tier is cheap, certain and narrow. The top tier catches what the others cannot
and is the least reliable thing in the stack. Neither replaces the other, and a system with
only the top tier is a system that agrees with itself.

---

## The failure report is the interface

This is the part people skip, and it is the part that makes the loop work. What comes back
from the checker is a **file**, and it is written for two readers at once: a person at 2am,
and an agent that has no memory of the last iteration.

```md
**3. [AC-28] color.text.muted (#6B7280) used outside the footer legal block**

- Where: section[data-section="lineup"] .artist-card p
- Expected: color.text.secondary (#A7AEBB)
- Actual: #6B7280 — 4.07:1 against #0A0B0D, minimum 4.5:1
- Hint: supporting copy uses text.secondary; muted is legal text only
```

No model wrote that. A program measured it and printed it. Every line of it is something an
agent can act on without guessing: which criterion, which element, what was expected, what
was actually there.

Compare it with what a model says about its own work — *"I've improved the contrast in the
lineup section"* — and you can see the difference between a report and a reassurance.

**The rule that holds all of it up:** the agent may never edit the checker. Say it out loud
in the prompt, and mean it. The moment the thing being judged can edit the judge, every
green result after that means nothing.

---

## Why a fresh context beats a long one

A context window is a buffer, not a memory. Forty minutes in, it holds three abandoned
approaches, the original brief from sixty thousand tokens ago, and every wrong turn the loop
already took — and the model keeps weighting its own earlier reasoning.

| A long conversation | A fresh pass |
|---|---|
| Remembers everything, badly | Reads `check-report.md` — the current failures |
| Weights its own old reasoning | Reads `notes.md` — what was already tried, and what it cost |
| Gets vaguer and slower | Reads the design notes |

So when it starts drifting:

```text
Write what is left to do into notes.md, in ten lines. What you tried, what worked,
what did not, and why.
```

Then start a fresh session, paste `notes.md`, and carry on. **Notes on disk beat memory in
context.** It is how iteration 7 knows that iteration 3 already tried the obvious thing.

---

## Giving the agent the design, not a picture of it

::diagram:04-mcp-topology::

An agent given a screenshot infers every colour and every measurement from pixels. It will
be *nearly* right — an orange, some spacing — and nearly right is what fails a contrast
check and looks subtly wrong beside the real design.

Given the token file, it infers nothing. `#FF6A1A` is in the file.

That is the entire argument for connecting an agent to Figma, or for handing it
`tokens.json`. **MCP** is just the standard way to make that connection: a coding agent
calling tools that are not inside it — a design file, a browser, a deploy target.

---

## When one agent is not enough

::diagram:05-dynamic-workflow::

The top tier of that pyramid is a model checking a model, and a model asked *"is this
good?"* will say yes. The fix is structural: **several passes with different jobs, and a
round whose only purpose is to argue the findings down.**

One pass looks for design problems, one for accessibility, one for copy. Every candidate
must cite a specific element — a claim that cannot point at something is discarded unread.
Then each finding goes back out to be *refuted*, and only what survives is reported.

Prompt 07 is the one-agent version of exactly this, collapsed into a single message: look
through several lenses, then argue against each finding from three angles — **is it true,
does it matter, is it already handled** — before saying it out loud. Weaker than three
independent agents, and it needs nothing installed.

It is still the least reliable thing you will do all day. It is worth doing because the
alternative is not looking.

---

## Shipping: the page that shipped must be the page that passed

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

It asks you to sign in, then to pick or create a site, then prints a URL. That URL is the
point of the whole ninety minutes.

One more step, and it is the one nobody does:

```text
Fetch the URL you just deployed and compare what the server returned with the page in
dist/. If they differ, tell me exactly how.
```

Everything before this proves that *a* page passed. Only that proves the page that passed is
the page that shipped. They come apart more often than you would think — a stale build, the
wrong folder, a host that injects its own markup.

---

## The thing that will happen to you

The accessibility check on the reference page for this workshop was green. Zero violations,
three widths, twice in a row. Perfect Lighthouse score.

Five of the nine pieces of text in the hero were **below the legal contrast minimum**
against the photograph behind them. The largest, first, most-read text on the page.

The reason: axe does not evaluate text over a background image. It does not fail it — it
marks the pair *incomplete*, and in a check whose rule is "zero violations", incomplete is
indistinguishable from correct.

Reading the CSS would not have found it either. The background there was a photograph, two
translucent overlays and a gradient composited together, and no line of CSS anywhere says
what colour that comes out as.

**Green means no known defect. Knowing where your checks stop is the job.**

---

## Where loops actually fail

| It looks like | It is | What to do |
|---|---|---|
| The check goes green and nothing was fixed | The agent edited the check | Say so, restore it, and read the diff — it is the most instructive thing you will see all day |
| Two wrong states, alternating | Two requirements that cannot both be true | Stop it. The contradiction is in the brief, not the code |
| It keeps going after it is done | Nothing runs the check *first* | Check before you fix, every round |
| It gets vaguer and slower | Context is full | Write the state to a file, start fresh, paste the file |
| "It works now" and it does not | It is reporting, not measuring | Only believe the exit code |
| Nothing at all, for a long time | It is waiting on something with no deadline | Every step needs a time limit. This project lost an hour to it three separate times |

---

## What happened when I ran these prompts

Not a rehearsed demo. An empty folder outside every repository, Codex, the prompts pasted in
order, nothing else in scope.

| Prompt | Time | What came out |
|---|---|---|
| 01 — start | 107s | an Astro + Tailwind project, dev server running |
| 03 — build | 41s | the hero, from the values it was given |
| 04 — **write the checker** | 495s | `check.mjs`, 264 lines — plus tests for the checker and a document explaining it, neither of which was asked for |
| 05 — the loop | 46s | ran, and stopped for the right reason |

Eleven minutes, unattended, from nothing. The decision worth noticing is one nobody asked
for: it chose to treat axe's *incomplete* results as failures. That came out of a single
sentence in prompt 04 — **"a check that cannot run is a failure, never a skip"** — and it is
the exact blind spot described above, which took a person an afternoon to find by hand.

---

## And what went wrong building this

Thirteen incidents. Nine were failures of the *verifier* or the harness, not of the page.

| What happened | Why it is worth your time |
|---|---|
| Nine gates ran against **somebody else's website** for a whole run — 427 confident, correctly formatted failures | A verifier that is confident and wrong is worse than none |
| **axe passed a blank page.** Zero violations, three widths, green | A measurement of nothing looks exactly like a measurement of perfection |
| A loop hung for an hour on an input nobody closed | Every step needs a deadline. Third time in one project |
| The evidence harness **invented four clean iterations** out of a run that was killed | Absence read as success — and the only one that produced a table |
| The gate was green and the hero was illegible | The tool working exactly as documented, with the documentation somewhere nobody reads |

The pattern under all of them is one sentence: **absence of a result is not a passing
result.** Write that into your checker before you write anything else.

---

## Take this to work on Monday

Do not start with a whole landing page. Start with **one gate**.

1. Pick the check your team already does by hand and resents.
2. Make it a program that exits 0 or 1.
3. Put its output somewhere an agent can read — a file, not a terminal it has to remember.
4. *Only then* put an agent in front of it.

> The loop is the easy part. The oracle is the work.

---

## The honest part

- Automated accessibility tooling reaches roughly **30–40%** of what WCAG actually
  requires. Green means *no known defect*, never *accessible*.
- A pixel comparison detects that something changed. It has no idea whether the change was
  an improvement.
- Nothing in any of this has an opinion about whether the design is good.
- Prompt 07 uses a model to check a model. It catches what the programs cannot, and it is
  the least reliable part of the whole thing. A second opinion, not an oracle.
