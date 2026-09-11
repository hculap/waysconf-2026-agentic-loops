# Build an AI that checks and fixes its own work

**WaysConf 2026 · masterclass · 16 September, 14:55, ROOM-PM · 90 minutes**
Szymon Paluch — [waysconf.com](https://www.waysconf.com/masterclass/build-an-ai-that-checks-and-fixes-its-own-work)

Most AI demos stop at *wow*: a nice-looking output that falls apart the moment it
meets a real requirement. This one does not stop there. In ninety minutes you will
put a coding agent in a loop with a verifier it cannot argue with, hand it a design,
and walk out with a website on the internet that it built and corrected itself.

The design is a fictional electronic music festival called **TURBINE**. The loop is:

```
  Figma design ──▶ brief ──▶ plan ──▶ code ──▶ ┌─ build     ─┐
                                    ▲          │ a11y       │
                                    │          │ tokens     │──▶ report.md
                                    │          │ visual     │        │
                                    └──────────┤ content    │        │
                                     repair    │ links      │        │
                                               └─ perf     ─┘        │
                                                      │              │
                                                  all green? ────────┘
                                                      │
                                                      ▼
                                                  deploy
```

The interesting part is not the arrow that generates code. It is the box that says
*no*.

---

## Before you arrive

**→ [Read the setup page](https://turbine-workshop.netlify.app) ←** — fifteen minutes,
four free accounts, one install. Do it at home. The room has thirty people and one
wifi network.

Short version of what you need:

| | | |
|---|---|---|
| **GitHub** | free | so you can take a copy of this repository and deploy from it |
| **One coding agent** | Claude Pro/Max **or** ChatGPT Plus | either works; every prompt here runs on both |
| **Netlify** | free | this is where your site ends up |
| **Figma** | free is fine | the design is also committed as PNGs and tokens, so a free account is not a limitation |

---

## Three ways to start

### 1. In your browser — nothing to install

Click **Use this template → Create a new repository**, then **Code → Codespaces →
Create codespace on main**. Everything is pre-installed: Node, both agents, the
browser the gates need. Give it three minutes on first boot.

### 2. On your own machine

```bash
gh repo create my-turbine --template hculap/waysconf-2026-agentic-loops --public --clone
cd my-turbine
npm install
npx playwright install chromium
npm run dev          # http://localhost:4321
```

Node 20.11 or newer. Nothing else.

### 3. Just reading

Start with [`docs/CANON.md`](docs/CANON.md) for what is being built, then
[`brief/ACCEPTANCE.md`](brief/ACCEPTANCE.md) for how "finished" is defined, then
[`loop/ralph.sh`](loop/ralph.sh) — the entire loop is twelve lines.

---

## What is in here

| Path | What it is |
|---|---|
| `docs/CANON.md` | Single source of truth: the festival, the palette, the rules |
| `brief/` | The client brief, every word of copy, and the acceptance criteria |
| `design/` | Figma spec, exported frames, design tokens, measured contrast matrix, generated imagery |
| `figma-plugin/` | A Figma plugin that builds the entire TURBINE design file from those tokens |
| `checks/` | **The verifier.** Nine gates, no model in any decision |
| `loop/` | The loop itself, every prompt used on stage, and two Workflow scripts |
| `src/` | The Astro site. In the starter it is empty on purpose |
| `deck/` | The slides, as markdown |
| `guideline/` | The setup page participants get beforehand |
| `evidence/` | What actually happened when we ran this end to end, twice, before the workshop |

---

## The one idea

A loop is only worth building if something in it can tell you **no** without asking
a language model for an opinion.

`npm run check` runs nine gates against the real rendered page in a real browser.
Every one of them returns pass or fail the same way every time. The agent never
grades its own homework; it reads `checks/report.md` and fixes what the report says
is broken.

Try it right now, before you have built anything:

```bash
npm run check
```

Everything fails, and the failures are your task list. That is the loop.

```bash
bash loop/ralph.sh        # or: AGENT=codex bash loop/ralph.sh
```

---

## Falling behind is fine

Every stage of the workshop is a branch. Jump to any of them:

```bash
git checkout step-3
```

See [`CHECKPOINTS.md`](CHECKPOINTS.md). Nobody gets stuck for more than one section.

---

## Honesty section

Things this repository does **not** claim:

- Automated accessibility tooling catches roughly 30–40% of real WCAG violations.
  A green a11y gate means no known defect, not an accessible page.
- A pixel diff detects that something changed. It has no idea whether the change
  was an improvement.
- None of these gates has an opinion about whether the design is any good.
- The adversarial review stage uses models to check models. It catches things the
  deterministic gates cannot, and it is the least reliable part of the pipeline.
  It is a second opinion, not an oracle.

Where a number appears in the slides or the docs, it was measured, and the thing
that measured it is in this repository.

---

## Licence

Code MIT, design and copy CC BY 4.0. See [`LICENSE`](LICENSE).
TURBINE is fictional; artists, copy and imagery are invented.
