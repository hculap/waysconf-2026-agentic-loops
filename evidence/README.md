# evidence

What actually happened, recorded by programs rather than remembered afterwards.

A workshop that promises "the agent checks and fixes its own work" and has never measured whether it
does is a promise, not a demonstration. This directory is the difference.

| File | What it is |
|---|---|
| `INCIDENTS.md` | Every real failure hit while building this repository, written down at the time. Most of them are failures of the **verifier**, not of the page. |
| `prompt-trial.md` / `prompt-trial-codex.json` | **The one that matters now.** The eight prompts run against Codex in an empty folder outside every repository — which is what a participant actually does. Per-prompt timings, what the agent wrote, and the checker it built for itself. |
| `fig-trial-claude-2026-09-14.md` | Prompt 02 given a saved Figma file and nothing else, in an empty folder: 16 minutes, 61 turns, twelve of twelve artist names, and the trap it fell into and climbed out of. Run with permissions bypassed, so the prompts a participant would see are not measured. |
| `guideline-gate.md` | The gate on the participant site, broken on purpose five ways to prove it notices. Includes the 38 axe *incomplete* nodes measured from pixels rather than trusted. |
| `dry-run-codex.md` / `.json` | A clean-room trial: the repository exactly as a participant receives it, in a fresh worktree, with Codex CLI pointed at it. Per-iteration timings, gate counts, which criteria each pass cleared, and whether the agent touched the verifier. |
| `dry-run-claude.md` / `.json` | The same trial with Claude Code, so the two are comparable. |
| `loop-run.md` | The bash version of the loop, executed end to end from `step-3`: 85 failures, one agent pass, all gates green, and the three files it was supposed to touch. The script itself is gone; the measurement stands. |
| `checkpoints.md` | Historical: every checkpoint branch built and, where the document made a behavioural claim, run through the verifier. The branches are gone; the measurement stands. |
| `determinism.md` | The same build checked twice. Identical verdicts; individual Lighthouse samples 14 points apart. Why the median of three exists. |
| `asset-generation.log` | One line per generated image: timestamp, model id, prompt hash, tier, output size, wall time, cost. What makes the image pack reproducible rather than merely repeatable. |

## How the trials are run

The prompt trial — the current one, because the prompts are now the whole workshop:

```bash
node scripts/test-prompts.mjs --agent codex
```

It works in an empty directory **outside this repository**. That detail is not fussiness: the first
version ran inside the repo, the agent found `../brief/CONTENT.md` one level up, and checked a hero
against the entire festival copy — 360 failures for content it had never been asked to build. A trial
that can reach the answer key measures the harness.

The gate on the participant site, and the proof it can fail:

```bash
npm run check:guideline
bash checks/guideline-negative-test.sh
```

`dry-run-codex.md`, `dry-run-claude.md`, `loop-run.md` and `checkpoints.md` are **historical**. They
measured the older shape of this workshop, in which participants cloned a repository with a verifier
and checkpoint branches already in it. `scripts/dry-run.mjs` and those branches were removed with the
rest of that shape; the numbers those files record still happened, and the reasoning in them is still
the reasoning.

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
