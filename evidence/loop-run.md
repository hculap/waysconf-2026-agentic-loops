# `loop/ralph.sh`, run end to end

**Historical.** `loop/ralph.sh` was a twelve-line bash loop — check, hand the report back,
commit, repeat — and it was removed when the workshop stopped shipping participants a
repository. Participants now say the loop instead, or use `/goal`; see `prompts/05-loop.md`.
This page is kept because the run below actually happened, and because the mechanism it
measures is the one the sentence describes.

```
$ git worktree add .ralph-test step-3
$ cd .ralph-test && npm ci
$ AGENT=codex MAX=2 bash loop/ralph.sh
```

## What happened

```
Loop starting at dd5516f with codex, at most 2 iterations.
Transcripts: loop/.runs/20260911-133603

──── iteration 1/2 ────────────────────────────────────────────────
85 failure(s). Handing the report back to codex.
──── iteration 2/2 ────────────────────────────────────────────────
All gates passed on iteration 2.

Changed since dd5516f:
 loop/.runs/20260911-133603/report-1.md | 668 +++++++++++++++++++++++++++++++++
 loop/PROGRESS.md                       |  14 +
 src/components/Button.astro            |   2 +-
 src/sections/Programme.astro           |  16 +-
 src/sections/Tickets.astro             |  12 +-
 5 files changed, 697 insertions(+), 15 deletions(-)

exit 0
```

## What that shows, precisely

**The loop terminated on a program, not on a judgement.** Iteration 2 ran `npm run check`
first, it exited 0, and the loop stopped. The agent was never asked whether it had
finished, and was never invoked a second time.

**It changed the three files that were wrong and nothing else.** `step-3` ships with three
deliberate regressions — `Button.astro` (near-white on the sodium fill), `Programme.astro`
and `Tickets.astro` (muted grey as body copy). Those are the three source files in the
diff. Thirty-odd other files were available to touch and were not.

**It wrote down what it did.** Fourteen lines appended to `loop/PROGRESS.md`, which is the
only channel by which one iteration tells the next anything, because the next iteration
does not share its context.

**It did not touch the verifier.** `ralph.sh` refuses to commit an iteration that modified
anything under `checks/` or `.github/`, and stops for a person. That guard did not fire,
which is the outcome, not the absence of a test — `evidence/dry-run-codex.md` reports the
same integrity check independently.

## What it does not show

One run, one agent, one starting state. It does not establish a success rate, a median, or
that a different model behaves the same way. The honest summary is: *the loop as written
converged from this state, once, in one pass* — which is the claim the workshop makes, and
is now measured rather than asserted.

The full failure report the agent worked from is preserved at
`loop/.runs/20260911-133603/report-1.md` inside the throwaway worktree; the same 85
failures are reproducible at any time with `git checkout step-3 && npm run check`.
