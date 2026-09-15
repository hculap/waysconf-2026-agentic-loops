# Timing card

One page. Print it. Keep it on the lectern.

**90 minutes. 14:55 → 16:25.** The buffer is eight minutes and it lives at the end.
If you are behind, the cut list is at the bottom — use it early, not at 16:20.

The trick that makes ninety minutes fit: **three prompts run while you talk.** 02 builds the
decoder, 03 writes the checker, 05 runs the loop. Get each one pasted *before* you start the
block it belongs to, then talk over it.

**The order is tests first, deploy last:** export from the .fig (02) → the verifier (03) → the
page (04) → the loop (05) → review (06) → deploy (07). Prompts 02, 03 and 04 start in plan mode;
every prompt ends with a commit and push; the room types /clear before the next one.

---

## Minute markers

| Clock | Elapsed | Block | Room is… | You must be… |
|---|---|---|---|---|
| 14:55 | 0:00 | **The case** | listening | On the finished site within 90 seconds |
| 15:03 | 0:08 | **Setup** | opening a terminal, cd into the repository, agent up | On "Every step runs the same way" |
| 15:06 | 0:11 | | **pasting 01** (≈2 min), then /clear | On the terminal slide |
| 15:10 | 0:15 | **Design in** | **plan mode + 02** — plan, then the decoder runs 10–16 min | "Plan mode, then prompt 02" slide up *before* you speak |
| 15:20 | 0:25 | **The verifier, tests first** | answering 02's point 6, /clear, **plan mode + 03** — ≈8 min, red on the empty page | "Plan mode, then prompt 03" slide up before you speak |
| 15:28 | 0:33 | **LIVE DEMO** | watching | Break contrast, show red, show green — under 3 min |
| 15:35 | 0:40 | **Sprint 1: build** | /clear, **plan mode + 04**, then reviewing the page | Timer visible |
| 15:47 | 0:52 | | | Two-minute warning, regardless |
| 15:50 | 0:55 | **The loop, and workflows** | /clear, **pasting 05** — the loop runs alone | Loops running before you say another word |
| 16:05 | 1:10 | **Review, then ship** | /clear + **06** (review), /clear + **07** (deploy) | Shared URL board on the projector |
| 16:17 | 1:22 | **Honesty + Monday** | listening | — |
| 16:25 | 1:30 | Done | photographing the address | Closing slide up through questions |

**08 is not run in the room.** It is the whole workshop as one message, with `ultracode` and
subagents. Show it on the adversarial-review slide and tell them to take it home.

---

## The three sprints

**Sprint 1, build — 15 min.** The checker from 03 exists and is red. 04 plans the page from
design/data, builds all of it and runs the check once: fewer failures, still red. They review the
page beside Figma, section by section. Success: something of theirs renders and the report shrank.

**Sprint 2 — runs in the background.** Needs 03 to have finished: npm run check is created
there. Check by show of hands that two thirds have 05 looping before you move on.

**Sprint 3, review and ship — 12 min.** 06 in a fresh session attacks the page; they fix what is
real. 07 deploys and checks that the served page is the page that passed. Everyone gets a URL on
the board. Short on time: skip 06.

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
5. **Sprint 3 down to deploy only** — skip prompt 06, everyone runs 07. Costs 6 minutes. **Last resort
   for the URL**: you deploy on screen, they run prompt 07 afterwards from the page.

**Never cut prompt 03.** Without it prompts 04 and 05 have nothing to check against, and
sprint 2 is dead for the whole room. Cut the demo first.

Never cut: the fake-loop-vs-real-loop slide, prompt 03, or the honesty slide. Those three
are the talk.

---

## If it goes wrong

| What | Do |
|---|---|
| Prompt 02 still decoding at 0:35 for most of the room | Normal-ish — it is the long one. Start sprint 1 anyway; they read the findings when they land. |
| Someone's decoder still fails after ten minutes | Tell them to download turbine.fig again and restart prompt 02 with /clear; if it fails twice, pair them with a neighbour's design/data. |
| Claude Code asks before every command | Tell the room to pick the option that stops asking for that kind of command. |
| Wifi dies | Play the recording if you made one. Otherwise switch to reading the prompts page together. |
| An agent provider is down | Everyone to the other one. The prompts are identical on both. |
| The live demo fails | Say so, run it once more. If it fails twice, show the report slide and move on. Do not debug on stage. |
| More than five people stuck on the same thing | Stop the room, fix it together, cut sprint 1 to the hero. |
| Ten minutes over at 16:10 | Skip to deploy. The URL matters more than the workflows block. |
