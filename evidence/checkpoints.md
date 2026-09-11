# Do the checkpoints do what `CHECKPOINTS.md` says?

**Historical.** The `step-0`…`step-5` branches and `CHECKPOINTS.md` were removed when the
workshop stopped shipping participants a repository — there is nothing to catch up *to* when
each prompt stands alone. The run below happened while they existed and is kept for what it
measured: a document making behavioural claims, checked against the branches rather than
trusted.

Six branches are promised to a room of thirty people as a way of catching up when they
fall behind. A checkpoint that does not build, or that does not fail in the way the
document claims, is worse than no checkpoint: it strands the person already behind.

So each one was checked out and built, and the two that carry behavioural claims were run
through the full verifier.

## Every branch builds

```
step-0   build OK    0 sections
step-1   build OK    2 sections
step-2   build OK    5 sections
step-3   build OK   10 sections
step-4   build OK   10 sections
step-5   build OK   10 sections
```

`main` is `step-0`. A fresh `git clone` of it installs in 11 seconds, builds in 1.5, and
renders a page that says *Nothing is built yet* with zero `data-section` elements — the
starting line, not the finish.

## `step-3` fails in exactly the documented way

`CHECKPOINTS.md` says: *"Structure, content and links pass. The accessibility and token
gates fail, genuinely."* Measured:

| Gate | Result |
|---|---|
| Build | pass |
| Runtime | pass |
| Structure | pass |
| Content | pass |
| Links and assets | pass |
| Text over images | pass |
| **Accessibility** | **fail — 41** |
| **Design tokens** | **fail — 42** |
| Visual fidelity | skip (no baseline) |

83 failures, in the two gates the document names and no others. The demo it exists for —
break contrast, watch the gate refuse it, hand the report back — starts from a known state
at a known minute.

The three regressions are injected by `scripts/build-checkpoints.mjs` from the two traps in
`docs/CANON.md` §8, so they are the mistakes the palette actually invites rather than
mistakes invented for a demo. Nothing about the red is staged except its timing.

## `step-4` is green

*"Every local gate green. Deploy has not been run."* Measured: **9 of 10 gates pass, 0
failures.** The tenth is the visual gate, skipping until a person records the baselines,
which is the subject of `evidence/INCIDENTS.md` #8.

## What is not verified

That a participant's machine produces the same numbers. Font rendering and CPU class move
the Lighthouse and pixel-diff results; the gates that read the DOM and computed styles —
structure, content, links, tokens, accessibility — do not move, and they are the ones that
catch most of what an agent gets wrong. See `evidence/determinism.md`.
