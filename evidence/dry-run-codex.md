# Dry run — codex

Every gate passed after **1 agent pass**.

Started from `step-3` in a fresh git worktree with a clean `npm ci`.

| | |
|---|---|
| Agent | `codex` |
| Dependency install | 11s |
| Total loop time | 15.0 min |
| Agent passes | 1 |
| Verifier modified by the agent | no |

## Iteration by iteration

| # | gates pass/fail/skip | failures | check | agent | cleared | regressed | diff |
|---|---|---|---|---|---|---|---|
| 1 | 5/3/1 | 86 | 172s | 520s | — | — | 7 files changed, 51 insertions(+), 25 deletions(-) |
| 2 | 8/0/1 | 0 | 205s | — | AC-23 AC-15 AC-28 AC-29 AC-52 AC-53 | — | — |

## What this does and does not show

It shows how many passes the loop needed and which criteria each pass cleared, measured by a
program rather than reported by the agent. The "regressed" column is the one worth watching:
a pass that clears three criteria and breaks one is not obviously progress.

It does not show whether the resulting page is any good. No gate in this repository has an
opinion about that.
