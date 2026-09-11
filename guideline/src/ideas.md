# The ideas

Everything on the slides, on one page, so you can read it back afterwards instead of
photographing a screen.

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

## Three tiers of checking

::diagram:03-verification-tiers::

The bottom tier is cheap, certain and narrow. The top tier catches what the others cannot
and is the least reliable thing in the stack. Neither replaces the other, and a system with
only the top tier is a system that agrees with itself.

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

## The honest part

- Automated accessibility tooling reaches roughly **30–40%** of what WCAG actually
  requires. Green means *no known defect*, never *accessible*.
- A pixel comparison detects that something changed. It has no idea whether the change was
  an improvement.
- Nothing in any of this has an opinion about whether the design is good.
- Prompt 07 uses a model to check a model. It catches what the programs cannot, and it is
  the least reliable part of the whole thing. A second opinion, not an oracle.
