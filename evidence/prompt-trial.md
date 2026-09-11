# Do the prompts work?

The prompts are the whole workshop now. Claiming they work without running them would be
the exact failure this session is about, so they were run: an empty folder outside this
repository, Codex CLI, the prompts pasted in order, nothing else in scope.

```bash
node scripts/test-prompts.mjs --agent codex
```

## What happened

| Prompt | Time | Exit | Files | Result |
|---|---|---|---|---|
| 01 — start | **107s** | 0 | 0 → 6 | an Astro + Tailwind project, dev server running |
| 03 — build | **41s** | 0 | 6 → 6 | the hero, from the values it was given |
| 04 — **write the checker** | **495s** | 0 | 6 → 10 | `check.mjs`, 264 lines — plus `check.test.mjs` and `CHECKING.md`, neither of which was asked for |
| 05 — the loop | **46s** | 0 | 10 → 10 | ran, and stopped for the right reason |

Eleven minutes, unattended, from nothing.

## What it built, unprompted

Prompt 04 says what to check and forbids leniency. It does not say how. The agent produced
a checker that:

- reports **PASS / FAIL per check**, each with what it was looking for and what it found
- runs axe at 390, 768 and 1440 — and in **keyboard-focus states as well as the initial one**
- treats axe's `incomplete` results as failures: `0 violations; 0 incomplete; 23 rules passed`
- reads every painted pixel and lists the distinct colours per element, with coordinates
- checks console errors, failed requests, section order, content presence and alt text
- **wrote its own tests for the checker**, and a document explaining it

The `incomplete` decision is the one worth pausing on. axe does not fail text over a
background image; it marks the pair *incomplete* and moves on, and in a "zero violations"
gate that is indistinguishable from correct. It took a person an afternoon to find that on
the reference site — see `INCIDENTS.md` #13. Here it fell out of one sentence in the prompt:

> A check that cannot run is a failure, never a skip.

## The failures are the harness, and they are the right failures

The final run exits 1, with entries like:

```
| FAIL | Section order | / at 1440px | Ordered section list from check-design.json
        | check-design.json: ENOENT: no such file or directory
```

The trial skipped prompt 02, so there was no design pack in the folder. The checker was
built to read the design from files, could not find them, and **reported that as a failure
rather than skipping the check** — which is precisely the behaviour the prompt demands and
the opposite of what most hand-written checkers do.

A participant who runs prompt 02 has those files. The trial did not, and the checker said
so instead of quietly passing.

## Two real findings about the participant experience

**Codex refuses an empty folder.** `Not inside a trusted directory and
--skip-git-repo-check was not specified.` A designer opening Codex in a brand-new folder
meets this as the very first thing that happens. It is a permission prompt in interactive
use — answer yes — but it needed saying, and prompt 01 now says it.

**An agent will reach outside the folder.** The first version of this trial put the work
directory *inside* this repository. The agent found `../brief/CONTENT.md` one level up and
checked the hero against the entire festival copy: 360 failures for content it had never
been asked to build. Resourceful, and completely wrong. The trial now runs outside the
repository, because otherwise it measures the harness.

## What this does not show

One agent, one run, an abbreviated sequence — prompts 02, 06, 07 and 08 were not part of
it. It does not establish a success rate, and it says nothing about how the prompts behave
in the hands of somebody who has never used a terminal, which is the population that
matters.

The claim it does support is narrow and worth having: **given these prompts and nothing
else, an agent goes from an empty folder to a page and a working, strict, self-written
verifier in about eleven minutes.**
