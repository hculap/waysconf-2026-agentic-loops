# Timing card

One page. Print it. Keep it on the lectern.

**90 minutes. 14:55 → 16:25.** Every number below the line comes from one complete run of
prompts 01 to 07 with Claude Code on a clean machine (`node scripts/trial-workshop.mjs`,
15 September 2026, agent time only, plans approved as fast as a script can type).

| Prompt | Agent time | What it produced |
|---|---|---|
| 01 start | 3 min | Astro project, dev server, commit, push |
| 02 design | 23 min | plan 4, decoder 18, answers 1 · `npm run design`, seven JSON files, images |
| 03 checker | 20 min | plan 6, checker 14 · eight checks, red on the empty project, report file |
| 04 build | 24 min | plan 9, build 15 · the whole page, 2 of 8 checks still red |
| 05 loop | 4 min | two rounds green (13 a11y failures, then the skip link), stopped on the third |
| 06 deploy | 5 min | site created without questions, live URL, `check --url` against it |

**Seventy-nine minutes of agent time.** A person cannot do 02 and 03 in the room and still
reach a URL, so the rescue packs are the plan, not the fallback: at 15:30 everyone without
`design/data` takes `design-data.zip`, at 15:50 everyone without a working `npm run check`
takes `checker.zip`. Announce both from the stage, by the clock, whether or not anyone asks.

---

## Minute markers

| Clock | Elapsed | Block | Room is… | You must be… |
|---|---|---|---|---|
| 14:55 | 0:00 | **The case** | listening | On the finished site within 90 seconds |
| 15:03 | 0:08 | **Setup** | terminal, `cd turbine`, agent up, **01** | On "Plan mode: it cannot touch a file until you say so" |
| 15:08 | 0:13 | **Design in** | plan mode, **02**, approving the plan | "Plan mode, then prompt 02" slide up *before* you speak |
| 15:30 | 0:35 | **RESCUE 1** | `design-data.zip`, then `/clear` | Saying the clock time out loud, twice |
| 15:33 | 0:38 | **The verifier, tests first** | `/clear`, plan mode, **03**, approving | Live demo at 15:40, under 3 minutes |
| 15:50 | 0:55 | **RESCUE 2** | `checker.zip`, then `/clear` | Same again: by the clock, not by hands |
| 15:53 | 0:58 | **Sprint: build** | plan mode, **04**, then reviewing the page | Timer visible; circulating, not talking |
| 16:08 | 1:13 | **The loop + workflows** | Esc, commit, `/clear`, **05** running | Loops started before you say another word |
| 16:16 | 1:21 | **Ship it** | Esc, `/clear`, **06** deploys | Shared URL board on the projector |
| 16:22 | 1:27 | **Monday** | listening, URLs appearing | — |
| 16:25 | 1:30 | Done | photographing the address | Closing slide up through questions |

Everything conceptual now runs **while prompt 05 loops**, between 16:08 and 16:16: the real
loop against the fake one, who checks the work, the three tiers, multi-agent and adversarial
review, prompt 08, the two shapes, the six patterns. **Ten slides in eight minutes.** That is
forty-eight seconds each, so it only works if you have rehearsed it and if their loops are
running before you say a word. Reach for the cut list early in this block, not at the end of it.

**07 and 08 are homework.** 07 is the fresh-session review; 08 is the whole run as one
message. Show them, do not run them. For reference: 07 took **30 minutes** in the trial —
25 attacking, 5 fixing and redeploying — and it is the most interesting half hour of the
seven prompts. Tell them that, and tell them it is free to run while they make coffee.

---

## What the trial run did that you should tell them

**Prompt 05 stopped instead of passing.** Round 1 cleared thirteen axe failures (a `<ul>` given
`role="tabpanel"` had stopped being a list). Round 2 moved the skip link inside the `<nav>`.
Round 3 it would not do: the checker wanted copy from Figma layers that are switched off, and
both ways to green were lies — `sr-only` text telling a screen reader that the cheapest ticket
is "Most popular", or `hidden` elements nobody ever reaches. It wrote the argument into
`notes.md` and asked. If someone's agent does this, the answer is: *the layer is off, so the
text is not on the page. Change the check to ignore switched-off layers, and write in notes.md
that you did.*

**It found a real bug.** The mobile menu at 390px has five links the checker sees in the DOM and
never rendered after the menu opens. Nobody had looked at that width by hand.

**The live check failed on Netlify's own widget.** `check --url` went red on two contrast
failures in the HUD that Netlify injects at serve time — elements that are not in `dist`. The
agent said so and changed nothing. Use this if anyone asks what a checker costs you.

**It kept the checker.** No step edited `npm run check` to make a failure go away.

**Prompt 07 found what the checker cannot ask.** Asked for five findings, it reported four and
said how many it threw away. The best one: at phone width the tickets block has six `<h3>`s for
three tiers, three of them word-for-word repeats — because axe only asks whether a heading level
is skipped, and a copy check can only ever be helped by a second copy of a string. It also
caught the checker lying in the other direction: five "mobile links never render" failures that
are false, which it proved by opening the menu itself. Use that if anyone thinks a green check
is the finish line.

---

## Before you start

- Finished site open in a tab — turbine-festival.netlify.app
- waysconf.szymonpaluch.com on the room's screen as people come in
- Terminal at 18pt minimum, checked from the back row
- A failing `check-report.md` open in an editor, for the demo
- Shared URL board open and tested
- Phone hotspot on and tested
- **Recording of the contrast repair**, in case the demo fails or the wifi dies

---

## Cut list, in order

Use these the moment you are five minutes down, not at the end.

1. **"Why a fresh context beats a long one"** — the idea survives in "The whole loop is four sentences".
2. **Six workflow patterns** — the page has all six with drawings. Costs 3 minutes.
3. **"Three tiers of checking"** — the tiers are on the workshop page under the ideas, and
   "Who checks the work" already makes the distinction that matters. Costs 2 minutes.
4. **"When one agent is not enough" + "Adversarial review"** — prompt 07 carries the same idea
   and they take it home. Costs 3 minutes.
5. **The live demo** — show the failing report slide instead. Costs 3 minutes.
6. **Prompt 05 in the room** — deploy at 16:08 instead. Everyone still leaves with a URL,
   and the loop is the one thing they can finish at home from the page.

**Never cut prompt 03 or the rescue announcements.** Without a checker, 04 and 05 have
nothing to check against; without the rescue times, a third of the room silently falls out of
the workshop between 15:30 and 16:00.

Never cut: the fake-loop-vs-real-loop slide, or the deploy.

---

## If it goes wrong

| What | Do |
|---|---|
| Someone's decoder is still running at 15:30 | That is the normal case, not a failure. `design-data.zip`, `/clear`, prompt 03. |
| Someone's checker is broken at 15:50 | `checker.zip`, `/clear`, prompt 04. It carries the design data it was written against. |
| An agent asks before every command | Tell the room to choose "Yes, and don't ask again" once per kind of command, and to switch on accept edits before 05. |
| Claude Code asks to approve a plan and nobody understands it | Three things only: it writes files where the prompt says, it does not touch the checker, it is one script. Approve. |
| A page is not built by 16:08 | Esc, commit what exists, deploy it. A half-built page with a red report is the honest artefact. |
| The Netlify CLI fights someone | Drag `dist` onto app.netlify.com/drop, claim the site, then `netlify link --name <site>`. |
| Wifi dies | Play the recording. Then read the prompts page together and talk through what each step would do. |
| An agent provider is down | Everyone to the other one. The prompts are identical on both. |
| Ten minutes over at 16:10 | Skip 05. Go straight to deploy. The URL matters more than the loop. |
