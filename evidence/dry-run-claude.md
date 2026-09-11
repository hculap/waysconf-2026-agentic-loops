# Dry run — claude

**Historical.** This trial measured the older shape of the workshop, where participants
cloned a repository that already contained a verifier and checkpoint branches. They no
longer do. The current trial — the prompts, in an empty folder — is `prompt-trial.md`.

**This trial did not run.** Not "ran and failed" — did not run, and this file exists so
that absence is recorded rather than left as a gap somebody fills in with an assumption.

## What happened

The harness created the worktree, installed dependencies, ran the verifier, and got a
clean measurement: **5 gates pass, 3 fail, 1 skip, 85 failures, 174 seconds** — the
expected state of `step-3`.

It then invoked the agent, which returned in **5 seconds with exit code 0 and changed
nothing**:

```
UserPromptSubmit operation blocked by hook:
Dashboard turn tracking: Claude hook session identity mismatch
```

A hook configured on the machine this repository was built on — part of an unrelated
dashboard that tracks conversation turns — refuses any headless `claude -p` invocation
whose session identity it does not recognise. It is not a property of this repository, of
Claude Code, or of the loop. It is a property of one laptop.

## Why the file says this instead of nothing

The first version of the harness recorded that pass as a normal iteration: exit 0, five
seconds, no diff. The next iteration would have found the identical 85 failures, and the
one after that, until the cap — four "agent passes" that never happened, in a table that
looked like a measurement.

So the harness now detects it. An agent that exits 0 and changes nothing in under thirty
seconds is a **no-op**, not a pass, and the run stops and says so. That is the fifth time
in this project that something had to learn the difference between *not failing* and *not
happening* — see `evidence/INCIDENTS.md`.

## How to produce the real thing

On any machine without that hook — a participant's laptop, a Codespace, a clean checkout:

```bash
node scripts/dry-run.mjs --agent claude --max 4 --from step-3
```

It takes about fifteen minutes and writes over this file. Until someone runs it, the only
measured agent trial in this repository is the Codex one in `evidence/dry-run-codex.md`,
and the slides should say "Codex" rather than "the agents".

## What the Codex trial establishes, and what it does not

It establishes that **an** agent, given this brief, this design and this verifier, repairs
86 real failures in one pass without touching the gates. That is the claim the workshop
makes, and it is now measured once.

It does not establish that two agents behave alike, that the result is reproducible across
runs, or that a different model would converge at all. Anyone quoting a number from this
directory should quote which agent produced it.
