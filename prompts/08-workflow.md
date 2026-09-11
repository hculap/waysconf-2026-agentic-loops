# 08 — The same job, as a workflow

You have just run seven prompts by hand. You were the thing between them: you read the
output, you decided it was good enough, you pasted the next one.

That role is describable. **Phases, what happens in each, and what has to be true before
the next one starts** — write those down and the agent runs the sequence itself.

No script. No tool. It is a message.

---

```text
ultracode. I want you to do a whole job, in phases I define. Work through them in order,
on your own, and do not skip ahead.

Use a dynamic workflow: inside a phase, spawn as many subagents as the work needs and run
them in parallel, deciding how many from what you find rather than from a number I gave
you. One per section, one per review lens, one per finding — whatever the phase calls for.
Merge their results before you leave the phase.

PHASE 1 — LOOK
Read the design. Write what you found into notes.md: every section in order, every colour
by name, every text size, and a list of anything the design does not tell you.
Do not write any code in this phase.
Before moving on: show me notes.md and wait for me to say "go".

PHASE 2 — BUILD
Build the page section by section, in the order from notes.md. One subagent per section,
in parallel. Colours, sizes and words only from the design — invent nothing.
Before moving on: the project builds with no errors.

PHASE 3 — ARM
Write a program that opens the real page in a real browser and exits 0 or non-zero,
checking everything the design defines: the sections and their order, accessibility at
every width the design specifies, that every painted colour is one the design defines,
that every piece of copy is present, and that nothing overflows sideways at the narrowest
width. Wire it to "npm run check". Install whatever you need to drive a browser.
A check that cannot run is a failure, never a skip.
Before moving on: npm run check runs and reports something. It will be red. Good.

PHASE 4 — REPAIR
Loop: run npm run check, read the report, fix what it names, run it again. Repeat until it
exits 0.
NEVER edit the checker to make a check pass. If you believe a check is wrong, stop and
tell me which and why.
Before moving on: npm run check exits 0.

PHASE 5 — SHIP
Build and deploy. Then fetch the live URL and prove the page it serves is the page that
passed phase 4.
Before moving on: the live URL returns 200 and serves what you built.

PHASE 6 — ATTACK
Spawn several subagents with different lenses — design, accessibility, copy, whatever else
you judge worth a pass — and have each look for what the checker structurally cannot see.
Then send every candidate finding to a separate subagent whose only instruction is to
argue that it is wrong. Report only the findings that survive that argument, and tell me
how many you discarded.
Do not fix anything. Give me the list.

Rules for the whole run:
- Announce each phase as you enter it, and say how many subagents you are using and why.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep notes.md current as you go. If you run out of room and we have to start fresh,
  notes.md is all the next session will have.
```

---

**What you should see.** `PHASE 1 — LOOK` and then work, unattended, for a long time. It
will stop at the two places you told it to stop, and nowhere else.

---

## The two words at the top

**`ultracode`** is a keyword Claude Code recognises: it signals that the request is large
and structural, and it is what unlocks multi-agent orchestration for the run. **Codex has
no equivalent** — no keyword, no flag. Leave the word in anyway. On Codex it is one
harmless token at the start of a long instruction, and the sentence after it does the real
work on both tools:

> spawn as many subagents as the work needs and run them in parallel, deciding how many
> from what you find

That is the instruction. The keyword is a shortcut on one tool, not the mechanism.

**Why fan out at all.** Six sections built one after another is six times the wall-clock of
six built at once, and the sections do not depend on each other. The same is true of review
lenses: a pass looking for accessibility problems and a pass looking for copy drift share
nothing, and running them in one context means each one carries the other's noise.

**Where it earns its keep is phase 6.** A single agent asked "is this page good?" will say
yes. Several agents with different lenses produce candidates, and a separate agent whose
only job is to *refute* each candidate removes the ones that do not survive. Find, then
attack, then keep what is left. That is a different shape from asking once and believing
the answer, and it is the only part of this pack where a model checks a model.

**It is also the least reliable part of the run.** More agents is more confident output,
not more correct output. The deterministic checker in phase 3 is what decides; phase 6
opens items for a person to judge.

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

> Between phase 2 and 3, add a phase: show me each section as a screenshot at the
> narrowest width and wait for my approval.

> Skip phase 5. I am not deploying today.

> In phase 6, use six lenses instead of three, and look only at widths the design does
> not specify.

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
| It works through everything one at a time | `Phase 2 is six independent sections. Run them in parallel, one subagent each.` |
| Phase 6 reports five findings and all five are real | Good, and suspicious. `How many candidates did you discard, and why?` A refutation round that refutes nothing did not happen. |
| It spawns twenty subagents for a small page | `Use as many as the work needs. Tell me the number and your reason before you start.` |
