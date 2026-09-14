# Timing card

One page. Print it. Keep it on the lectern.

**90 minutes. 14:55 → 16:25.** The buffer is eight minutes and it lives at the end.
If you are behind, the cut list is at the bottom — use it early, not at 16:20.

The trick that makes ninety minutes fit: **three prompts run while you talk.** 02 reads the
`.fig`, 04 writes the checker, 05 runs the loop. Get each one pasted *before* you start the
block it belongs to, then talk over it.

---

## Minute markers

| Clock | Elapsed | Block | Room is… | You must be… |
|---|---|---|---|---|
| 14:55 | 0:00 | **The case** | listening | On the finished site within 90 seconds |
| 15:03 | 0:08 | **Setup** | opening a terminal, cd into the repository, agent up | Asking for hands: who has a terminal open |
| 15:06 | 0:11 | | **pasting 01** (≈2 min) | On the terminal slide |
| 15:10 | 0:15 | **Design in** | **pasting 02** — it reads the `.fig` for 10–16 min | "Paste prompt 02 now" slide up *before* you speak |
| 15:20 | 0:25 | **Sprint 1** | reading 02's findings, answering point 6, then **03** | Timer visible |
| 15:32 | 0:37 | | | Two-minute warning, regardless |
| 15:35 | 0:40 | **The verifier** | **pasting 04** — it writes the checker, ≈8 min | "Paste prompt 04 now" slide up before you speak |
| 15:42 | 0:47 | **LIVE DEMO** | watching | Break contrast, show red, show green — under 3 min |
| 15:50 | 0:55 | **The loop, and workflows** | **pasting 05** — the loop runs alone | Loops running before you say another word |
| 16:05 | 1:10 | **Ship it** | **pasting 06**, then 07 if there is time | Shared URL board on the projector |
| 16:17 | 1:22 | **Honesty + Monday** | listening | — |
| 16:25 | 1:30 | Done | photographing the address | Closing slide up through questions |

**08 is not run in the room.** It is the whole workshop as one message, with `ultracode` and
subagents. Show it on the adversarial-review slide and tell them to take it home.

---

## The three sprints

**Sprint 1 — 15 min.** 02 has been reading the `.fig` since 0:15, so its findings arrive at
the start of the sprint — or a few minutes in; the Claude Code trial took sixteen. They read
the list, answer point 6, then run 03, which builds the whole page from docs/.
Success: something of theirs renders. Not: it passes anything.

**Sprint 2 — runs in the background.** Needs 04 to have finished: `npm run check` is created
there. Check by show of hands that two thirds have it looping before you move on.

**Sprint 3 — 12 min.** 06 deploys and then checks that the served page is the page that
passed. Everyone gets a URL on the board. Anyone done early: 07, try to break it.

---

## Before you start

- Finished site open in a tab — turbine-festival.netlify.app
- waysconf.szymonpaluch.com on the room's screen as people come in
- Terminal at a readable font size — **18pt minimum**, checked from the back row
- A failing `checks/report.md` from this repository already open in an editor, for the demo
- Shared URL board open and tested
- Phone hotspot on and tested
- **Record the live contrast demo** — there is no recording yet. Screen-record one clean
  run: change a class to the muted colour, `npm run check`, red, hand the report back,
  green. Without it, a dead wifi means skipping the demo.

---

## Cut list, in order

Use these the moment you are five minutes down, not at the end.

1. **"Why a fresh context beats a long one"** — the idea survives in "The whole loop is four sentences".
2. **"Where loops actually fail"** — say it is on the workshop page, under the ideas.
3. **The workflows block** — reduce to the two-shapes diagram and prompt 08 as take-home.
   Costs 4 minutes.
4. **The live demo** — show the failure report slide instead and move on. Costs 3 minutes.
5. **Sprint 3 down to a demo** — you deploy on screen, they run prompt 06 afterwards from
   the page. Costs 8 minutes. **Last resort**: the URL on the board is what people leave with.

**Never cut prompt 04.** Without it prompt 05 has nothing to run, and sprint 2 is dead for
the whole room. Cut the demo first.

Never cut: the fake-loop-vs-real-loop slide, prompt 04, or the honesty slide. Those three
are the talk.

---

## If it goes wrong

| What | Do |
|---|---|
| Prompt 02 still decoding at 0:35 for most of the room | Normal-ish — it is the long one. Start sprint 1 anyway; they read the findings when they land. |
| Someone's agent cannot decode the `.fig` after ten minutes | The ready-made pack is on the page. Put it in `design`, tell the agent to use it. |
| Claude Code asks before every command | Tell the room to pick the option that stops asking for that kind of command. |
| Wifi dies | Play the recording if you made one. Otherwise switch to reading the prompts page together. |
| An agent provider is down | Everyone to the other one. The prompts are identical on both. |
| The live demo fails | Say so, run it once more. If it fails twice, show the report slide and move on. Do not debug on stage. |
| More than five people stuck on the same thing | Stop the room, fix it together, cut sprint 1 to the hero. |
| Ten minutes over at 16:10 | Skip to deploy. The URL matters more than the workflows block. |
