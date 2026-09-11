# Build an AI that checks and fixes its own work

**WaysConf 2026 · masterclass · 16 September, 14:55, ROOM-PM · 90 minutes**
Szymon Paluch — [waysconf.com](https://www.waysconf.com/masterclass/build-an-ai-that-checks-and-fixes-its-own-work)

Most AI demos stop at *wow*: a nice-looking output that falls apart the moment it meets a
real requirement. In ninety minutes you will put a coding agent in a loop with a checker it
is not allowed to argue with, hand it a design, and walk out with a website on the internet
that it built and corrected itself.

---

## If you are attending

You need **two things**. Neither of them is code.

| | |
|---|---|
| **The design** | The TURBINE file in Figma, plus a [design pack](design-pack/) — the same design as three PNGs, every colour and size, and every word |
| **[The prompts](https://waysconf.szymonpaluch.com/workshop/)** | Eight things to say to your agent, with a copy button on each |

There is **nothing to clone**, no script to run and no code to read. You start in an empty
folder. Everything else — the project, the page, and the program that checks the page —
the agent makes for itself.

Before the day: **[the setup page](https://waysconf.szymonpaluch.com)**. Four free
accounts, fifteen minutes, much easier at home than on conference wifi.

---

## The two shapes

Almost everything people build on top of coding agents is one of two shapes, and both are
things you *say* rather than things you install.

**A loop** — *do this again until a condition holds.* You define the exit condition; the
agent keeps going until a program, not an opinion, says it is met.
→ [prompt 05](prompts/05-loop.md)

**A workflow** — *do these things, in this order, with a bar between each.* You define the
phases and what has to be true before the next one starts.
→ [prompt 08](prompts/08-workflow.md)

They nest: the workflow gets you from nothing to nearly-right, and a loop inside one of its
phases closes the last gap. Seeing which one a piece of work wants is most of the skill,
and it is the part that survives whichever tool you are using next year.

---

## The one idea

Prompt 03 asks the agent to build something. Prompt 04 asks it to build **the thing that
decides whether prompt 03 worked** — and prompt 05 then forbids it from touching that thing
ever again.

> A loop is only worth building if something in it can say **no** without asking a language
> model for permission.

A model asked "is this good?" will say yes, warmly and at length, and it will sound the
same whether the answer is true or not. A program asked the same question exits 0 or it
does not.

---

## What is in this repository

The repository is for the speaker and for anyone curious afterwards. **A participant never
opens it.**

| Path | What it is |
|---|---|
| `prompts/` | The eight prompts, in markdown. The page participants use is generated from these. |
| `design-pack/` | The download: three PNGs, `tokens.json`, `content.md` |
| `guideline/` | The setup page, and the prompts page built from `prompts/` |
| `design/` | Tokens, the Figma build spec, the generated imagery and the prompts that made it |
| `figma-plugin/` | A Figma plugin that constructs the TURBINE file from the same tokens the code uses |
| `src/`, `public/` | The reference implementation — what the design pack is rendered from, and what is live |
| `checks/` | The verifier for *that* reference site. Not part of the workshop: participants write their own in prompt 04. |
| `deck/` | The slides, as markdown |
| `evidence/` | **What actually happened when this was built and tested.** Start with `INCIDENTS.md`. |

---

## Evidence, not claims

Everything the slides assert was measured, and the thing that measured it is in here.

- `evidence/INCIDENTS.md` — thirteen real failures hit while building this. **Nine were
  failures of the verifier, not of the page.** One run had nine gates producing 427
  confident, correctly-formatted failures about somebody else's website.
- `evidence/prompt-trial-codex.json` — the prompt pack run against a real agent in a real
  empty folder. Prompt 04 produced a 296-line checker in 568 seconds, and it independently
  decided to treat axe's *incomplete* results as failures — the exact blind spot that took
  a person an afternoon to find by hand.
- `evidence/determinism.md` — the same build checked twice. Identical verdicts; individual
  Lighthouse samples fourteen points apart.
- `evidence/dry-run-claude.md` — a trial that **did not run**, recorded as a non-run rather
  than left as a gap.

---

## Honesty section

- Automated accessibility tooling reaches roughly 30–40% of what WCAG actually requires. A
  green gate means *no known defect*, never *accessible*.
- A pixel diff detects that something changed. It has no idea whether the change was an
  improvement.
- Nothing here has an opinion about whether the design is any good.
- Prompt 07 uses a model to check a model. It catches what the deterministic checks cannot,
  and it is the least reliable part of the whole thing. A second opinion, not an oracle.

The most useful thing in this repository is the list of ways its own verifier was wrong.

---

## Licence

Code MIT, design and copy CC BY 4.0, the three typefaces under the SIL Open Font License.
See [`LICENSE`](LICENSE). TURBINE is fictional; artists, copy and imagery are invented.
