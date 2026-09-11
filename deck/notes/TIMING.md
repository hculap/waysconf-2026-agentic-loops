# Timing card

One page. Print it. Keep it on the lectern.

**90 minutes. 14:55 → 16:25.** The buffer is eight minutes and it lives at the end.
If you are behind, the cut list is at the bottom — use it early, not at 16:20.

---

## Minute markers

| Clock | Elapsed | Block | You must be… |
|---|---|---|---|
| 14:55 | 0:00 | **The case** | On the finished site in a browser within 90 seconds |
| 15:00 | 0:05 | The loop diagram | Pointing at the return arrow |
| 15:03 | 0:08 | **Checkpoint 0** | Asking for hands: who has a terminal open |
| 15:06 | 0:11 | GitHub + terminal | Two slides, six minutes, no detours |
| 15:10 | 0:15 | **Design in** | Everyone has a prompt in front of an agent. Hard gate. |
| 15:15 | 0:20 | MCP + the honest Figma bit | — |
| 15:20 | 0:25 | **Sprint 1 starts** | Prompt 01 on screen, timer visible |
| 15:33 | 0:38 | Two-minute warning | Regardless of where anyone is |
| 15:35 | 0:40 | **The verifier** | — |
| 15:42 | 0:47 | **LIVE DEMO: break contrast, fix it** | Rehearsed, under three minutes |
| 15:50 | 0:55 | **Sprint 2 starts** | Loops running before you say another word |
| 15:52 | 0:57 | The loop, in twelve lines | Their machines are working |
| 16:00 | 1:05 | Workflows + adversarial review | — |
| 16:05 | 1:10 | **Sprint 3: deploy** | Shared board on the projector |
| 16:17 | 1:22 | **Honesty + failures** | — |
| 16:25 | 1:30 | Done | QR on screen, held for ten seconds |

---

## The three sprints

**Sprint 1 — 15 min.** They plan and build the nav and hero.
Success: something of theirs renders. Not: it passes gates.

**Sprint 2 — runs in the background.** Start it at 0:55, keep talking. This is where the
fifteen minutes comes from. Check by show of hands that two thirds have it running before
you move on.

**Sprint 3 — 12 min.** Deploy. Everyone gets a URL on the board.

---

## Before you start

- Finished site open in a tab
- Terminal at a readable font size — **18pt minimum**, checked from the back row
- `checks/report.md` from a failing run already open in an editor
- Shared URL board open and tested
- Phone hotspot on and tested
- `evidence/loop-repair.mp4` ready to play if the wifi dies
- Repo QR on screen as people come in

---

## Cut list, in order

Use these the moment you are five minutes down, not at the end.

1. **"Why a fresh context beats a long one"** — the idea survives in the ralph.sh slide.
2. **"Where loops actually fail"** — point at `docs/TIPS.md` instead.
3. **The workflows block** — reduce to the diagram and one sentence. Costs 4 minutes.
4. **Sprint 1 down to the hero only** — announce it as a change, so nobody thinks they
   are behind.
5. **Sprint 3 down to a demo** — you deploy on screen, they do it afterwards from
   `CHECKPOINTS.md`. Costs 8 minutes. **This is the last resort**, because the URL on
   the board is the thing people leave with.

Never cut: the fake-loop-vs-real-loop slide, the live contrast repair, or the honesty
slide. Those three are the talk.

---

## If it goes wrong

| What | Do |
|---|---|
| Wifi dies | Play `evidence/loop-repair.mp4`, switch the session to reading the repo together |
| An agent provider is down | Everyone to the other one. If both, the recording and a walkthrough of the gates |
| The live demo fails | Say so, then run it again once. If it fails twice, play the recording and move on. Do not debug on stage. |
| More than five people stuck on the same thing | Stop the room, fix it together, cut sprint 1 to the hero |
| You are ten minutes over at 16:10 | Skip to deploy. The URL matters more than the workflows block. |
