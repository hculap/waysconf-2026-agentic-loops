# 05 — The loop

In a new session, the agent runs the checker from prompt 03 (`npm run check`), reads the report
file it writes, fixes the first failure and runs the checker again, until it exits 0. Each
round has three steps: plan the fix, make it, run the checker. When the check passes, the agent
commits and pushes.

---

```text
Read notes.md. Then run npm run check.

If it exits 0, commit everything with a message that says the check passes, push, and tell
me we are finished.

If it does not, read the report it wrote and fix what it names. Then run npm run check again.
Repeat until it exits 0.

Each round has three steps. Plan: take the first failure in the report and write one line
into notes.md: the failure, what you think causes it, and what you will change. Implement:
make that change. Verify: run npm run check.

Work in the order the report lists things. Fix the cause, not the symptom: if a colour is
wrong, use the one from the design, do not nudge it until the number moves. Make the
smallest change that clears each failure, and leave alone anything that was already
passing.

Three rules, and the first one matters more than the other two:

1. NEVER change the checker to make a check pass. Not a threshold, not a skipped assertion,
   not a rule switched off. If you genuinely believe a check is wrong, STOP, tell me which
   one and why, and change nothing.
2. Do not add anything new to the page, and do not invent text.
3. If the same failure survives three attempts, stop and tell me what you tried each time
   and what happened. Three failed repairs usually means the design is asking for two
   things that cannot both be true, and no fourth attempt will resolve that.

Write what you tried and what happened into notes.md as you go, so that a fresh session
could pick this up. Keep going on your own. Do not ask me to confirm each round.
```

---

## Claude Code: `/goal`

Paste the prompt above first, then this line:

```text
/goal npm run check exits 0
```

The session does not end until the command exits 0: the command runs, and its exit code
decides. **Codex has no `/goal`.** There the prompt is the mechanism; if the agent stops
early, say `keep going`.

---

**Expected result.** Several rounds of plan, fix, check. The number of failures goes down,
can rise by one when a fix breaks something else, and goes down again. `notes.md` gets one
line per round. When `npm run check` exits 0, the agent commits and pushes.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| **It edited the checker** | `Put the checker back exactly as it was, and fix the page instead.` Then look at what it changed in the checker. |
| It stops after one round | `Keep going. Do not stop until npm run check exits 0.` Or use `/goal`. |
| The same failure keeps coming back | `You have tried that three times. Stop. Tell me what you tried and what happened each time.` |
| It says it is done but the check is red | `Run npm run check and paste the last five lines, unedited.` |
| It gets slower and vaguer | The context is full. Say `Write what is left into notes.md in ten lines`, type `/clear`, then paste this prompt again. |

---

### Why it is written this way

- The agent may never edit the checker. If it could, a pass would mean nothing.
- One line per round in `notes.md`, and the report on disk: a new session continues from the files.
- Three failed attempts at one failure means stop: usually two requirements that cannot both be true.
