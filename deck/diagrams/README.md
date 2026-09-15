# Deck diagrams

Six hand-authored SVGs. Five of them are embedded in `deck/slides.md` and go behind a speaker on a
projector; the sixth is the session map. Several are also worth embedding in the docs, so each one has
to survive being scaled down to a figure in a markdown file and blown up to three metres wide in a room
where the back row is fifteen metres away.

Nothing here is generated. Open any of them in a text editor and the geometry is readable.

---

## Where each one goes

| File | Slide in `deck/slides.md` | Section, elapsed |
|---|---|---|
| `01-the-loop.svg` | **The loop** | 0:00 — 0:08 · The case |
| `02-fake-loop-vs-real-loop.svg` | **A real loop and a fake one** | 0:40 — 0:55 · The verifier |
| `03-verification-tiers.svg` | **Three tiers of checking** | 0:40 — 0:55 · The verifier |
| `05-dynamic-workflow.svg` | **When one agent is not enough** | 0:55 — 1:10 · The loop, and workflows |
| `07-loop-vs-workflow.svg` | **Two shapes, and neither is a script** | 0:55 — 1:10 · The loop, and workflows |
| `08-workflow-patterns.svg` | **Six workflow patterns** | 0:55 — 1:10 · The loop, and workflows |
| `08-pattern-<n>-<slug>.svg` | not on a slide: one per pattern, on the workshop page | — |

The timings above are the section kickers in `deck/slides.md`, which match `deck/notes/TIMING.md`.
The schedule itself is a table on the workshop page, not a drawing.

The `08-*` files are generated: `node scripts/build-pattern-diagrams.mjs`. Edit the script, not the SVGs.

`slides.md` references them as `/diagrams/<file>.svg`, and Slidev serves static files only from
`deck/public/`. The source stays here; `npm run dev`, `present`, `build` and `export` in `deck/` each
run `sync:diagrams` first, which copies `diagrams/*.svg` into `deck/public/diagrams/`. That copy is
generated and gitignored. If you start Slidev with a bare `slidev slides.md` rather than through
`npm run`, run `npm run sync:diagrams` yourself or all five slides render a broken image.

---

## The diagrams

### `01-the-loop.svg` — 1600 × 900

**The idea:** the check is written first and fails; then a loop of three steps, plan, implement and verify, and the step that decides is a program.

Plan states a hypothesis: what to change, and why. Implement writes the code: it generates the page the
first time and fixes it every time after, so generate and repair are one step with different input.
Verify runs `npm run check`. Exit 0 leads to deploy, the only way out; exit 1 writes `report.md`, and the
arrow back to plan carries that file. The return path is a document written by a program, not the
model's opinion.

**What not to claim from it:** the picture shows the mechanism, not that it converges. A loop that cannot
go green is still a loop, and one that runs out of attempts ends red.

---

### `02-fake-loop-vs-real-loop.svg` — 1600 × 960

**The idea:** an agent can check work; the same agent, in the same context, grading itself cannot.

Left, the fake loop: an agent writes the page, the same agent with the same context grades it, and the
grade goes back into the loop. One dashed boundary, nothing external. Right, the real loop: the page goes
to two checks at once. The verifier is a program, `npm run check`, exit 0 or 1, off limits to the agent.
The adversarial review is several agents with a fresh context, told to attack, with a separate agent
refuting each finding. Failures and surviving findings go into one report; an empty report ships.

**What to say over it:** the variable is not the model. It is whether whoever says "done" shares the
context that did the work.

---

### `03-verification-tiers.svg` — 1600 × 980

**The idea:** three kinds of checking, stacked by how much you can trust them, each annotated with what
it cannot see.

Widest at the bottom: deterministic gates — build, runtime, structure, a11y, tokens, content, links,
perf — which return an exit code and in which no model takes part. Above them, measurable comparison:
the pixel diff at the three canonical widths, against `design/export/`, still blocking but judged
against a budget — 1.5% of pixels, 0.5% in the hero — rather than a rule. The tokens gate is not up
there with it: AC-26 to AC-33 are exact-match rules, and they belong in the tier below. Narrowest at
the top, and drawn with a dashed outline because it never blocks: adversarial review, models refuting
models.

The footer says what `checks/run.mjs` does, which is not a cascade: the build gate runs first and
alone, the seven browser specs run in one parallel Playwright invocation, and Lighthouse runs last.
The pixel diff does not wait for the tokens or a11y gates to be green. Only the top tier waits for
anything.

Every tier carries a **catches** list and a **cannot** list. The cannot lists are the reason the diagram
exists; a tier drawn without its limits is an advertisement.

**Also worth embedding in:** `brief/ACCEPTANCE.md`, above *What these gates do NOT catch*.

**What not to claim from it:** the 30-to-40-per-cent figure in the footnote is the commonly cited
estimate of automated rule coverage across WCAG in general. It is not a measurement of the TURBINE page,
and the diagram says so in the same breath.

---

### `05-dynamic-workflow.svg` — 1800 × 1000

**The idea:** a workflow that fans out, argues with itself, and filters — with items moving at their own
pace rather than in lockstep.

One finder per lens: `design`, `a11y` and `copy`. The three lenses return different numbers of candidate
findings — three, four and two — and every candidate is a citation, because a claim that cannot point at
something is discarded unread. Each finding then goes to the same three refuters, whose only instruction
is to argue that it is wrong. The result is a matrix: one row per finding, one column per refuter, green
where the finding stood and red where it was refuted. A majority filter passes the five that survived two
of three, each leaving at its own height.

The staggered row counts and the independent exits are the argument. There is no barrier between stages,
and a lens that found two things does not hold up a lens that found four.

**What a participant runs is the one-agent version of this.** `prompts/07-review.md` collapses the fan-out
into a single message: look through several lenses, then argue against each finding from three angles
before reporting it. Same structure — find, refute, filter — with one agent playing every role, which is
weaker and needs nothing installed. Draw the diagram, then say that.

**Also worth embedding in:** `docs/GLOSSARY.md` under *Adversarial review*.

**What not to claim from it:** this is the least reliable part of the pipeline. Nothing on the slide sets
pass or fail; it opens items for a person to triage.

---

### `07-loop-vs-workflow.svg` — 1600 × 1000

**The idea:** the two shapes, and that a workflow branches.

Left, the loop of `01` drawn vertically with its exit condition. Right, the seven phases of prompt 08 in the
workshop order, tests first and deploy last (START, LOOK, ARM, BUILD, REPAIR, ATTACK, SHIP), with the bar
between each and the phases that branch: 02 waits for an answer, 04 fans out to one agent per section and
merges, 05 is the loop, 06 sends the page to fresh-context reviewers and every finding to a refuter.

---

### `08-workflow-patterns.svg` — 1980 × 1120, and `08-pattern-<n>-<slug>.svg` — 600 × 440

**The idea:** six ways to arrange agents inside a workflow: classify and act, fan out and synthesize,
adversarial verification, generate and filter, tournament, loop until done. The sheet is the slide; the
six single panels illustrate each pattern on the workshop page. Both come from one script.

---

## Rules every diagram here follows

Anything added to this directory later should match, or the deck stops looking like one deck.

| Rule | Why |
|---|---|
| `viewBox` set, plus `width`/`height` | Scales cleanly into slides and into markdown at any size |
| `<title>` and `<desc>`, `role="img"`, `aria-labelledby` | The figure has to work for someone who cannot see it. The `desc` describes the mechanism, not the shapes |
| Colours only from `design/tokens/tokens.json` | The workshop fails a page for an off-palette hex. Its own slides do not get an exemption |
| Nothing below 16px at natural size | Everything here is 17px or larger; body labels are 19 to 22px, titles 38 to 40px |
| Generic font stacks, no webfonts, no `@import` | Renders identically on a borrowed laptop with no network |
| Flat fills, no gradients | Gradients band and muddy on a projector, and they survive PDF export badly |
| Full-bleed `#0A0B0D` background | Legible on the dark TURBINE ground and on anything else |
| `color.text.muted` (`#6B7280`) never used as paint | It is the deliberate contrast trap from CANON §8. Using it here would be a poor joke |

The one place `#6B7280` appears is as a string inside the failure message quoted in `01`, which is the
gate complaining about it. That is the trap being reported, not the trap being used.

### Colour semantics, shared across all six

Reading one diagram should teach you how to read the next.

| Token | Hex | What it means in these diagrams |
|---|---|---|
| `accent.sodium` | `#FF6A1A` | The model, and anything the model produces or is asked to do |
| `accent.coolant` | `#2FE6D6` | Verification: gates, the verifier, evidence, boundaries the agent may not cross |
| `accent.arc` | `#7C5CFF` | The design, and the contract that came before the work |
| `state.success` | `#3DDC84` | Passing, surviving, shipping |
| `state.danger` | `#FF4D4D` | Failing, refuted, the return path |
| `text.primary` | `#F2F4F7` | Titles, and the one sentence that carries the point |
| `text.secondary` | `#A7AEBB` | Structure, annotation, neutral flow |

Dark ink (`#0A0B0D`) on every filled accent or state colour, never white. White on sodium measures
2.87:1 and fails; the canonical pairing measures 6.87:1. `design/tokens/CONTRAST.md` has the matrix.

---

## Rendering and checking

```bash
# one PNG, at whatever width the deck export wants
rsvg-convert -w 2400 01-the-loop.svg -o 01-the-loop.png

# all six
for f in *.svg; do rsvg-convert -w 2400 "$f" -o "${f%.svg}.png"; done
```

Each file was checked three ways before it was handed over: parsed by a strict XML parser that is not
the renderer, rendered by `rsvg-convert` 2.58, and read back as an image to confirm that no label
collides with anything and that the small type is still type and not a smudge. The colour, type-size,
`viewBox`, `title`, `desc` and font-stack rules in the table above were checked by script against
`design/tokens/tokens.json`, which is the same file the token gate reads. The script reads the colour
attributes; it cannot see what a fill composites to, and `06` tints two shapes by laying a token hex
over another at reduced opacity. Those two were measured by hand instead: dark ink on the Sprint 2
hatch is 5.7:1, against 6.87:1 on flat sodium.

That is more ceremony than six pictures normally get. It is also the subject of the workshop, so the
slides may as well be held to it.
