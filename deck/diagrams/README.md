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
| `04-mcp-topology.svg` | **MCP, in one sentence** | 0:15 — 0:25 · Design in, not screenshots in |
| `02-fake-loop-vs-real-loop.svg` | **A real loop and a fake one** | 0:40 — 0:55 · The verifier |
| `03-verification-tiers.svg` | **Three tiers of checking** | 0:40 — 0:55 · The verifier |
| `05-dynamic-workflow.svg` | **When one agent is not enough** | 0:55 — 1:10 · The loop, and workflows |
| `06-ninety-minutes.svg` | not on a slide — speaker and participant asset | the whole session |

The timings above are the section kickers in `deck/slides.md`, which match `deck/notes/TIMING.md`.
If either of those moves, `06` has to move with it: it is the only diagram here that encodes the
schedule, and a timeline that disagrees with the timing card is worse than no timeline.

`slides.md` references them as `/diagrams/<file>.svg`, and Slidev serves static files only from
`deck/public/`. The source stays here; `npm run dev`, `present`, `build` and `export` in `deck/` each
run `sync:diagrams` first, which copies `diagrams/*.svg` into `deck/public/diagrams/`. That copy is
generated and gitignored. If you start Slidev with a bare `slidev slides.md` rather than through
`npm run`, run `npm run sync:diagrams` yourself or all five slides render a broken image.

---

## The diagrams

### `01-the-loop.svg` — 1600 × 900

**The idea:** a loop is four steps and one exit, and the step that decides is a program.

Generate, verify, gate, repair, with deploy as the only way out. The arrow that goes backwards leaves
a document — `checks/report.md`, shown holding two real failure messages with the measured ratios from
`design/tokens/CONTRAST.md` — rather than leaving the model's opinion. That is the whole point of the
drawing: the return path carries a file, and the file was written by something that cannot be argued
with.

**Also worth embedding in:** `README.md`, beside the ASCII loop; `docs/TIPS.md` §3.

**What not to claim from it:** the picture shows the mechanism, not that the mechanism converges. A
loop that cannot go green is still a loop, and `loop/ralph.sh` exits 1 when it runs out of iterations.

---

### `02-fake-loop-vs-real-loop.svg` — 1600 × 960

**The idea:** the asymmetry, carried by the shape rather than by a caption.

Left, the fake loop: a model writes a page, the same model is asked to grade it, and the grade comes
out drawn in the same orange fill as the model that produced it. A dashed boundary encloses the whole
arrangement and nothing crosses it. Right, the real loop: the identical model writes the identical
page, and then the work crosses a hard line into a separate column where a verifier, fed by a contract
written before the page existed, returns `exit 0` or `exit 1`.

Both sides open with the same two boxes at the same size in the same colour, deliberately. The model is
not the variable.

**Also worth embedding in:** `docs/TIPS.md` §4.

**What to say over it:** the test from TIPS — ask what would have to be true for the loop to say *fail*
forever. On the left the answer is "the model would have to keep deciding it is not good enough".
`deck/notes/TIMING.md` lists this slide as one of the three that must never be cut.

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

### `04-mcp-topology.svg` — 1600 × 980

**The idea:** MCP is not magic, it is three connections, and the arrows carry different things.

The agent sits in the middle. Figma is above left and the arrow from it is violet and labelled **design
data** — frames, variables, measured spacing, with the committed export pack named as the route that
works without a paid seat. A browser driven by Playwright is above right, with two teal arrows: one out
carrying instructions, one back carrying **evidence**. Netlify is on the right and its green arrow
carries **the deployment**, after the gates and not before. Underneath all of it, spanning the full
width, is the repository: the agent writes in `src/`, `public/` and `loop/`, and only reads `design/`,
`brief/` and `checks/`. `checks/` is the one it may never write, which is the rule the slide exists to
plant.

The legend distinguishes the three payloads. The line at the top right is the honest one: no MCP server
takes part in a pass or fail decision.

**Also worth embedding in:** `loop/MCP.md`, at the top.

---

### `05-dynamic-workflow.svg` — 1800 × 1000

**The idea:** a workflow that fans out, argues with itself, and filters — with items moving at their own
pace rather than in lockstep.

One finder per lens: `design`, `a11y` and `copy` — three of the six lenses declared in
`loop/workflows/adversarial-review.mjs`, drawn for one round of the up-to-six it runs. The subagents in
`.claude/agents/` carry similar names and are a different mechanism; this script does not invoke them.
The three lenses return different numbers of candidate findings — three, four and two — and every
candidate is a citation, because a claim that cannot point at something is discarded unread. Each finding
then goes to the same three refuters, whose only instruction is to argue that it is wrong. The result is
a matrix: one row per finding, one column per refuter, green where the finding stood and red where it
was refuted. A majority filter passes the five findings that survived two of three, each leaving at its
own height, into `checks/adversarial-report.md`.

The staggered row counts and the independent exits are the argument. There is no barrier between stages,
and a lens that found two things does not hold up a lens that found four.

**Also worth embedding in:** `CLAUDE.md` under *Workflows*; `docs/GLOSSARY.md` under *Adversarial
review*. The script it describes is `loop/workflows/adversarial-review.mjs`.

**What not to claim from it:** this is the least reliable part of the pipeline. Nothing on the slide sets
pass or fail; it opens items for a person to triage.

---

### `06-ninety-minutes.svg` — 1800 × 700

**The idea:** where the ninety minutes go, and which parts are hands-on.

Two lanes against a 0-to-90-minute axis. The upper lane is the eight blocks of the deck, in the order
and at the elapsed times its section kickers give. The lower lane is what runs on each person's machine:
sprint 1 from 0:25, fifteen minutes to plan and build the nav and hero; sprint 3 from 1:10, twelve
minutes to deploy. Sprint 2 is hatched and bracketed, because from 0:55 to 1:10 it occupies exactly the
same span as *The loop, and workflows* on stage. That is where its fifteen minutes come from, and it is
the scheduling trick the session depends on, so it is drawn rather than mentioned.

Checkpoint marks sit at the end of each sprint — `step-1`, `step-4` and `step-5`, which are the
branches [`CHECKPOINTS.md`](../../CHECKPOINTS.md) §2 expects at 0:40, 1:10 and 1:22. They are not
sprint numbers. A participant who falls behind reads a branch name off this timeline and checks it
out, so if §2 changes, these three labels change with it. A bracket under the last block marks where
the eight-minute buffer lives.

**Not a slide.** It is the lectern and participant view of the session: print it next to
`deck/notes/TIMING.md`, and use it in `README.md` or the setup page in `guideline/` so people arrive
knowing when they will be typing.

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
