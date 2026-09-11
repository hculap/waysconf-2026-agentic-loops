# Workflows

Two scripts that put more than one agent on the TURBINE page at the same time, in a shape
decided in advance by code rather than in the moment by a model.

You do not need either of them to finish this workshop. `loop/ralph.sh` builds the whole site on
its own. These exist because two jobs in this project have a shape a single agent handles badly,
and seeing why is worth more than the scripts are.

---

## What a workflow is

A **workflow** is a small JavaScript file that hires agents.

That is the whole idea. The script does not write code, review anything or have an opinion. It
decides *how many* agents run, *what each one is asked*, *what happens to their answers*, and
*when the whole thing stops*. The agents do the work; the script is the org chart.

```js
export const meta = { name: 'build-sections', description: '...', phases: [ ... ] }

phase('Build')
const results = await parallel(
  SECTIONS.map(section => () => agent(`Build the ${section.title} section.`, { schema: BUILD }))
)
log(`${results.filter(Boolean).length} sections built.`)
```

Four things are worth noticing in those five lines, because they are the whole API:

| | |
|---|---|
| `agent(prompt, opts)` | Hire one agent. It gets a fresh context and reads the repository itself. With a `schema` it has to answer in a fixed shape, so the next line of code can rely on the answer. |
| `parallel(thunks)` | Run several at once and **wait for all of them**. A barrier. |
| `pipeline(items, ...stages)` | Push each item through every stage **independently**. No waiting. |
| `phase` / `log` | What you see while it runs. |

The interesting distinction is the middle two, and it is the one most people get wrong the first
time. `parallel` is a queue at a till: everyone waits for the slowest person before anyone moves.
`pipeline` is eleven separate tills. If your items genuinely do not need each other — and page
sections do not — the second one is not a nicety, it is correctness about time.

There is one restriction worth knowing because it looks arbitrary until it does not: a workflow
script cannot call `Date.now()`, `Math.random()` or `new Date()`. Those make a run
unreproducible, and a run that cannot be reproduced cannot be resumed after it dies. In exchange
you get resume, which on conference wifi is a fair trade.

---

## When a workflow beats a single agent

**Three reasons, and if none of them applies, use one agent.**

1. **Coverage.** The work splits into pieces that do not need each other. Eleven page sections.
   Forty files to migrate. Six review lenses. One agent does these in sequence and forgets the
   beginning by the end; eleven agents each hold one piece in full.

2. **Independence.** You want opinions that did not influence each other. Three reviewers who
   each saw the other two's notes converge on one view fast, and that view is the first one that
   was written down. Three who never met disagree, and the disagreement is the useful part.

3. **A stopping rule that is not a feeling.** "Keep looking until two rounds turn up nothing new"
   is a `while` loop. "Have you found everything?" is a question with one answer, and the answer
   is always yes.

**When it does not.** A workflow is the wrong tool at least as often as it is the right one:

- **Anything sequential.** If step two needs to have read step one's output, a workflow is a
  slower, more expensive way to write a function call.
- **Small work.** Twenty-four agents to fix a typo is not thoroughness.
- **Work you have not scoped yet.** You need the list before you can fan out over it. Explore
  first with one agent, then run the workflow over what it found.
- **Anything a program can decide.** This is the one this repository cares about. `npm run check`
  answers in seconds, the same way every time, and cannot be talked out of it. Any question you
  could hand to a program should go to the program, and no fleet of agents improves on that.

---

## The two scripts

### `build-sections.mjs` — eleven sections, eleven agents

CANON section 7 fixes eleven sections and they barely touch each other. The nav does not need to
know how the FAQ accordion is wired. That is what a fan-out is for.

```
Scaffold ──▶ Build ──────▶ Verify ──┐
  one         eleven        eleven  │
  agent       agents        agents  ├──▶ Integrate ──▶ npm run check
                                    │      one agent
   (each section flows through      │
    build → verify on its own,      │
    without waiting for the rest) ──┘
```

Each section agent owns a disjoint set of files — one section file, plus any component or script
only that section uses — so eleven agents writing at once never collide. That is also why none of
them needs an isolated git worktree, an expensive feature this script deliberately does not use.
Each is handed only the acceptance criteria that apply to it, which is between five and eleven rows
of `brief/ACCEPTANCE.md` rather than all sixty.

What nobody owns is the shared layer, because it already ships: `Button`, `Section`,
`SectionHeading` and `Tag` are committed, each with a header comment recording the gate decision
behind it, and `nav.ts`, `tabs.ts` and `accordion.ts` are committed with the markup they expect
written out. The scaffold phase writes one file, `VisuallyHidden.astro`, and spends the rest of its
prompt telling the eleven what is already there.

Then the self-verify stage reads the section back with fresh eyes and repairs what it finds. What
it is allowed to decide is narrow on purpose: greps and file reads, nothing that needs a browser,
because the page is not assembled yet and the other ten agents are still writing. Everything it
cannot settle it names and leaves alone.

**The barrier question, which is the point of the script.** The obvious way to write build-then-
verify is two `parallel` calls. It is wrong twice. It makes the skip-link verifier wait for the
programme builder, which is the longest job on the page. And it delays every repair until the
slowest builder finishes, so a section that was written wrong sits written wrong for minutes.
Shortening the distance between a mistake and the thing that catches it is what this entire
workshop is about, and a barrier there lengthens it for nothing. The script has two barriers and
both earn it: the scaffold, because every builder consumes it, and the integration, because
mounting eleven sections in order genuinely needs all eleven.

At the end it runs `npm run build` and `npm run check`, and that report is the only verdict in
the run. Eleven agents saying their section is correct is eleven claims. The exit code is a fact.

### `adversarial-review.mjs` — the one that matters

Read the last section of `brief/ACCEPTANCE.md` before this script. Sixty criteria, and the most
honest page in the repository is the one listing what they miss: alt text that is present and
wrong, ARIA that is valid and lying, a heading outline that nests perfectly and says nothing, text
over a photograph where axe reports nothing because it cannot resolve the background, copy that
passes the banned-word list and fails the ear.

This script reviews the part the gates gave up on. Which means it is a model checking a model, and
that makes it the least reliable thing in this repository. Its shape is an argument about how to
make that useful anyway.

```
  round, until two rounds in a row turn up nothing new
    │
    ├─ six finders, in parallel, each with a different lens
    │    correctness · accessibility beyond axe · design fidelity
    │    copy and tone · performance · security of the loop
    │
    ├─ drop anything that cites no selector and no file:line
    ├─ drop anything already raised this run        ← plain code, no agent
    │
    ├─ every survivor goes to three verifiers who are told to REFUTE it
    │    evidence · authority · redundancy
    │    uncertain counts as refuted
    │
    └─ a finding lives if at least two of three fail to kill it
```

Four decisions in that diagram are worth more than the code:

**Six different questions, not six copies of one.** Six agents asked "review this page" return
roughly the same answer six times. Each lens here is aimed at a specific paragraph of what
`brief/ACCEPTANCE.md` admits the gates cannot see. The sixth lens, *security of the loop*, has no
gate at all: it goes looking for evidence that the generator moved the measure — an edit under
`checks/`, a token file changed so an off-palette colour became on-palette, a pixel baseline
quietly updated, an axe rule disabled, a dependency added. An agent under pressure to turn a gate
green has two ways to do it and only one of them is building the page.

**Finders are optimists, verifiers are not.** One agent asked to find problems *and* only report
real ones is being asked to be both, and it resolves the conflict by being neither. Splitting the
roles lets the finder be reckless, which is when finders are useful.

**The default is refuted.** A verifier that cannot settle the question votes to kill. So does one
that crashes. This pipeline is built to miss real defects rather than invent fake ones, and that
is the right direction to be wrong in: the report is triaged by hand by someone with limited time,
and after two findings that turn out to be nothing they stop reading it, at which point every
finding is missed.

**Deduplication runs against everything ever raised, not against what survived.** This is the
subtle one, and getting it backwards is the difference between a loop that converges in three
rounds and one that never converges at all. A finding the panel refuted was plausible enough to
raise in the first place, and nothing about the page changed when it was refuted. So next round,
the same lens looks at the same page and raises it again. If the "already seen" set held only
confirmed findings, that one counts as fresh, three more verifiers are hired to refute it a second
time, and the round is never dry. Raising a claim is what records it. Surviving is a separate
question, tracked separately.

The cost of that choice is real and the script says so: a finding refuted in round one is never
reconsidered, so a wrong refutation is permanent for the run.

It writes the survivors to **`checks/adversarial-report.md`**, in the same shape as
`checks/report.md` — the same numbered items, the same Where / Expected / Actual / Hint bullets —
so the same repair prompt works on either file once you point it at this one — `loop/PROMPT.md`
step 1 names `checks/report.md` by path, so an unedited copy of it reads the gate report and not
this one. Two differences, both
deliberate: the summary table says OPEN and CLEAN rather than FAIL and PASS, and the file ends by
stating that it decides neither. `brief/ACCEPTANCE.md` is unambiguous that nothing a model writes
may set pass or fail, and a file printing FAIL in a table is setting it, whatever its footer says.

---

## Running them

Workflows are run by the agent, not from a shell, and the ability to run one is a setting: dynamic
workflows have to be enabled under `/config`, and some organisation policies switch them off
entirely. If yours is off you will get *Dynamic workflows are not enabled for this session* and
neither script will run. Nothing in the workshop depends on them — `loop/ralph.sh` uses no
workflows — so read the two scripts instead and carry on. When they are enabled, the tool asks for
confirmation before it spends any agents, and the dialog names the script and what it will do.

In Claude Code, ask:

```
Run the workflow at loop/workflows/build-sections.mjs
Run loop/workflows/adversarial-review.mjs
```

or call the tool directly:

```js
Workflow({ scriptPath: 'loop/workflows/build-sections.mjs' })

Workflow({ scriptPath: 'loop/workflows/adversarial-review.mjs',
           args: { maxRounds: 3, focus: 'tickets' } })
```

`adversarial-review.mjs` takes three optional arguments: `maxRounds` (default 6), `focus` to
confine the review to one section, and `startedAt` to stamp the report with a timestamp from
outside the script.

**Order matters.** `build-sections.mjs` expects the starter state, so run it before the loop, not
after. `adversarial-review.mjs` expects `dist/` to exist and refuses to run without it — reviewing
`src/` instead of the built page is how a reviewer produces confident findings about a page that
never ships. Run it *after* `npm run check` is green, because green means no known defect, and
that is exactly when the unknown ones are what is left.

The phase tree fills in as the run goes, and `/workflows` lists the agents underneath it. Each run
prints a `runId`; if something dies, relaunching with `{ scriptPath, resumeFromRunId }` replays
every agent call that has not changed from cache and only re-runs the rest.

Neither script is wired into `npm run check`, `loop/ralph.sh` or CI, and neither can turn a gate
green or red. They are a second pair of eyes, invoked on purpose.

One practical snag worth knowing before it costs you five minutes in the room.
`checks/adversarial-report.md` is not in `.gitignore` — unlike `checks/report.md`, which is — so
after a review the working tree is dirty, and `loop/ralph.sh` refuses to start on a dirty tree by
design, so that you can always `git reset --hard` your way out of an unattended loop. Commit the
report or delete it before you run the loop again.

---

## What they cost

**Agent counts are exact.** They were counted by executing both scripts against stubbed agents,
which exercises the real control flow without spending anything:

| Run | Agents | Made of |
|---|---|---|
| `build-sections.mjs` | **24**, always | 1 scaffold + 11 build + 11 verify + 1 integrate |
| `adversarial-review.mjs`, nothing found | **14** | 1 prepare + 12 finders (two dry rounds) + 1 writer |
| `adversarial-review.mjs`, one productive round | **23** | 1 + 18 finders + 3 verifiers + 1 |
| `adversarial-review.mjs`, 6 rounds at one finding per lens per round | **146** | 1 + 36 finders + 108 verifiers + 1 |

The formula for the second script is `1 + 6R + 3F + 1`, where `R` is rounds and `F` is the number
of findings that survived deduplication and reached a panel. Verifiers dominate the bill, which is
the argument for doing deduplication in code: every duplicate caught by a `Set` is three agents
not hired.

**That last row is an illustration, not a ceiling.** `R` is capped at six. `F` is not capped at
all: nothing in the script bounds how many findings a lens may return, and six agents told to argue
that a page is wrong routinely return more than one each. The same stub harness gives 254 agents at
two findings per lens per round, 362 at three and 902 at eight, at which point the only thing left
to stop it is the runtime's backstop of 1000 agents per workflow. If you want a real ceiling, set a
token target for the turn, or edit `MAX_ROUNDS` down before you run it.

**Token cost is an estimate, and we have not measured it.** What can be measured is the reading:
`docs/CANON.md`, `brief/BRIEF.md`, `brief/ACCEPTANCE.md` and `brief/CONTENT.md` come to about
95 KB of markdown together, and `design/FIGMA-SPEC.md` is another 83 KB — measure it yourself with
`cat docs/CANON.md brief/BRIEF.md brief/ACCEPTANCE.md brief/CONTENT.md | wc -c`, because these
files get edited and the number moves. At the usual four-bytes-per-token rule of thumb — an
approximation, not a measurement — a finder that reads the first four spends somewhere above twenty
thousand input tokens before it looks at the page. Twelve
finders over two rounds is a few hundred thousand input tokens, most of it cacheable because the
prompts repeat. Output is far smaller: a structured list of findings is hundreds of tokens.

If you want a real number rather than an estimate, run `/cost` after a run. If you want a ceiling,
give the turn a token target and the script will stop rounds early and say so in the report rather
than run past it.

Wall clock, for planning a 90-minute session: both are minutes rather than seconds, and
`build-sections.mjs` is bounded by its slowest section plus the build and the full gate run at the
end. Neither is something to start five minutes before you need the result.

---

## What they cannot do

- **They do not decide anything.** `npm run check` decides. If these two disagree with the gates,
  the gates are right, and if you ever find yourself editing a gate because a review agent
  complained, that is the failure this repository was built to demonstrate.
- **They do not replace the ten minutes with a keyboard.** Keyboard only, start to finish, mouse
  out of reach. One screen reader over the tabs, the accordion and the form. The page at 320px and
  at 200% zoom. The copy read aloud. `brief/ACCEPTANCE.md` is explicit that this finds things the
  entire automated suite cannot, and it is still true with six agents in the room.
- **They are not complete, and the reports say so.** A capped review announces that it stopped
  while still finding things. A panel that refutes on uncertainty misses real defects. Absence
  from `checks/adversarial-report.md` is not evidence of anything.
- **They have no opinion about whether the design is good.** Neither does anything else in this
  repository. That part is still yours.

---

## Reading the scripts

They are commented for reading rather than for maintenance, and the comments are where the
argument lives. If you read one thing, read these two blocks:

- `build-sections.mjs` — *WHY pipeline() AND NOT parallel() BETWEEN THESE TWO STAGES*
- `adversarial-review.mjs` — *WHY DEDUP RUNS AGAINST EVERYTHING SEEN, NOT AGAINST WHAT WAS
  CONFIRMED*

Both files parse under `node --check`, which is also the reason neither ends with a `return`
statement: top-level `return` is legal inside the Workflow runtime and illegal in a plain ES
module, and being able to check the file is worth more than the keyword.

That trade has a consequence, and it is the kind this repository does not get to leave unsaid:
**neither script returns anything to the Workflow tool.** The runtime splices the script body into
an async function, where a trailing expression is evaluated and thrown away, so the `summary`
object at the bottom of each file never reaches the caller. Both scripts `log()` it in full
instead, which is why the last thing each one prints is the whole summary as JSON. Read it there.

```bash
node --check loop/workflows/build-sections.mjs
node --check loop/workflows/adversarial-review.mjs
```
