# 08 — The same job, as a workflow

You have just run seven prompts by hand. You were the thing between them: you read the
output, you decided it was good enough, you pasted the next one.

That role is describable. **Phases, what happens in each, and what has to be true before
the next one starts** — write those down and the agent runs the sequence itself.

No script. No tool. It is a message.

---

```text
I want you to do a whole job, in phases I define. Work through them in order, on your own,
and do not skip ahead.

PHASE 1 — LOOK
Read the design: design/tokens.json, design/content.md, and the three PNGs in design/.
Write what you found into notes.md: every section in order, every colour by name, every
text size, and a list of anything the design does not tell you.
Do not write any code in this phase.
Before moving on: show me notes.md and wait for me to say "go".

PHASE 2 — BUILD
Build the page section by section, in the order from notes.md. Colours and sizes only
from tokens.json. Words only from content.md. No new packages except the two named in
phase 3.
Before moving on: the site builds with no errors.

PHASE 3 — ARM
Write check.mjs: a program that opens the real page in a real browser and exits 0 or
non-zero. It must check the sections, zero axe violations at 390/768/1440, that every
colour is one from tokens.json, that every string from content.md is on the page, and
that nothing overflows sideways at 390. Wire it to "npm run check". You may install
Playwright and @axe-core/playwright here.
A check that cannot run is a failure, never a skip.
Before moving on: npm run check runs and reports something. It will be red. Good.

PHASE 4 — REPAIR
Loop: run npm run check, read check-report.md, fix what it names, run it again. Repeat
until it exits 0.
NEVER edit check.mjs to make a check pass. If you believe a check is wrong, stop and tell
me which and why.
Before moving on: npm run check exits 0.

PHASE 5 — SHIP
Build and deploy to Netlify. Then fetch the live URL and prove the page it serves is the
page that passed phase 4.
Before moving on: the live URL returns 200 and serves what you built.

PHASE 6 — ATTACK
Find five things wrong with the page that check.mjs cannot see. For each one, argue
against it yourself from three angles before you tell me — is it true, does it matter, is
it already handled — and only report the ones that survive your own argument.
Do not fix anything. Give me the list.

Rules for the whole run:
- Announce each phase as you enter it.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep notes.md current as you go. If you run out of room and we have to start fresh,
  notes.md is all the next session will have.
```

---

**What you should see.** `PHASE 1 — LOOK` and then work, unattended, for a long time. It
will stop at the two places you told it to stop, and nowhere else.

---

## Loop and workflow are different things

People use the words interchangeably. They are not the same shape, and knowing which one
you need is most of the skill.

| Aspect | **Loop** | **Workflow** |
|---|---|---|
| Shape | Do this again until a condition holds | Do these things, in this order, with a bar between each |
| You define | the **exit condition** | the **phases** |
| Ends when | a program says yes | the last phase finishes |
| Good for | converging on correctness | work with stages that depend on each other |
| In this pack | prompt 05 | this prompt |

Phase 4 above is a loop, living inside a workflow. That is the usual arrangement: the
workflow gets you from nothing to nearly-right, and a loop inside one phase closes the
last gap.

---

## Parameterise it

The phase list is the program. Change it and you have changed the job, without writing a
line of anything:

> Phase 2 builds only the hero and the lineup. Leave the rest.

> Between phase 2 and 3, add a phase: show me each section as a screenshot at 390 and
> wait for my approval.

> Skip phase 5. I am not deploying today.

> In phase 6, look only at what happens between 480 and 620 pixels wide.

That is what "no script needed" means in practice. A script would have to be edited,
tested and re-run. This gets edited in the sentence you were about to say anyway.

---

## When to reach for this, and when not

**Use the workflow** when you know the shape of the work and want to walk away: it is
long, the stages are real, and you would rather come back to a result than babysit.

**Use the seven prompts** when you are learning, when you want to steer, or when the design
is unclear and you expect to change your mind halfway. Every stop is a chance to disagree,
and disagreeing early is cheaper than everything else in this session.

The first time you do a piece of work, do it by hand. The second time, you know what the
phases are.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It announces phase 3 without doing phase 2 | `You skipped phase 2. Go back and finish it before phase 3.` |
| It blows through the "wait for me" bar | `Phase 1 said wait. Stop and show me notes.md.` |
| It gets vaguer around phase 4 | `Summarise the state into notes.md.` Then start a fresh session, paste notes.md, and say `Continue from phase 4.` |
| It declares the whole thing done | `Run npm run check and paste the last five lines, unedited.` |
| A phase fails and it continues anyway | `You were told to stop on a failed phase. What failed, and why did you continue?` |
