# evidence

What actually happened, recorded by programs rather than remembered afterwards.

A workshop that promises "the agent checks and fixes its own work" and has never measured whether it
does is a promise, not a demonstration. This directory is the difference.

| File | What it is |
|---|---|
| `INCIDENTS.md` | Every real failure hit while building this repository, written down at the time. Most of them are failures of the **verifier**, not of the page. |
| `dry-run-codex.md` / `.json` | A clean-room trial: the repository exactly as a participant receives it, in a fresh worktree, with Codex CLI pointed at it. Per-iteration timings, gate counts, which criteria each pass cleared, and whether the agent touched the verifier. |
| `dry-run-claude.md` / `.json` | The same trial with Claude Code, so the two are comparable. |
| `loop-run.md` | `loop/ralph.sh` executed end to end from `step-3`: 85 failures, one agent pass, all gates green, and the three files it was supposed to touch. |
| `determinism.md` | The same build checked twice. Identical verdicts; individual Lighthouse samples 14 points apart. Why the median of three exists. |
| `asset-generation.log` | One line per generated image: timestamp, model id, prompt hash, tier, output size, wall time, cost. What makes the image pack reproducible rather than merely repeatable. |

## How the trials are run

```bash
node scripts/dry-run.mjs --agent codex  --max 5 --from main
node scripts/dry-run.mjs --agent claude --max 5 --from main
```

`--from main` starts from the starter state, so the trial is the whole job: read the brief, read the
design, build ten sections, go green. `--from solution` starts from the finished page with a gate
failing, which measures repair rather than construction. Both are worth running; they answer different
questions.

The harness creates a fresh git worktree and runs `npm ci` in it. Nothing is shared with the working
copy — not `dist/`, not `node_modules/`, not a half-finished edit. "It worked on the machine that
already had everything" is exactly the failure a dry run exists to catch.

## What is measured, and what is not

Measured, by a program, with no model in the decision:

- wall-clock time per iteration, split between the verifier and the agent
- gates passed, failed and skipped, and the number of individual failures
- which acceptance criteria moved from failing to passing — and, more interestingly, which moved the
  other way
- whether the agent modified anything under `checks/`
- the size of the diff each pass produced

Not measured, and not measurable here: whether the resulting page is any good. No gate in this
repository has an opinion about that, and neither does this directory.

## Reading a trial honestly

The **regressed** column is the one to watch. A pass that clears three criteria and breaks one is not
obviously progress, and a loop that oscillates between two states will show it there before it shows
anywhere else.

A run that hits the iteration cap without going green is a result, not a crash. It usually means the
criteria contradict each other, or the brief never gave the agent the information a gate demands. Both
are findings about the *specification*, which is where most agent failures actually live.
