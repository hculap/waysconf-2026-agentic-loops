# 05 — The loop

You have a page and you have something that can say no to it. This is the sentence that
puts them in a circle.

There is no script here, and there is nothing to install. The loop is a paragraph.

---

```text
Run npm run check.

If it exits 0, stop and tell me — we are finished.

If it does not, read check-report.md and fix what it names. Then run npm run check again.
Repeat until it exits 0.

Work in the order the report lists things. Fix the cause, not the symptom: if a colour is
wrong, use the one from the design, do not nudge it until the number moves. Make the
smallest change that clears each failure, and leave alone anything that was already
passing.

Three rules, and the first one matters more than the other two:

1. NEVER change check.mjs to make a check pass. Not a threshold, not a skipped assertion,
   not a rule switched off. If you genuinely believe a check is wrong, STOP, tell me which
   one and why, and change nothing.
2. Do not add packages, and do not invent text.
3. If the same failure survives three attempts, stop and tell me what you tried each time
   and what happened. Three failed repairs usually means the design is asking for two
   things that cannot both be true, and no fourth attempt will resolve that.

Keep going on your own. Do not ask me to confirm each round.
```

---

## Claude Code: make it stick

Claude Code has this built in. Instead of trusting the agent to keep going, you can make
it structurally unable to stop:

```text
/goal npm run check exits 0
```

The session will not end until that is true. Not "until the agent believes it is true" —
the command actually runs, and its exit code decides. Paste the prompt above first, then
the `/goal` line.

**Codex does not have this.** There, the paragraph is the mechanism: it works, it just
relies on the agent doing as it was told rather than on the harness enforcing it. Watch
the output and say `keep going` if it stops early.

---

**What you should see.** Several minutes of check → fix → check. The failure count comes
down. Somewhere in the middle it will probably go *up* by one — a fix that broke something
else — and then come down again.

Then:

```
✓ all checks passed
```

Nobody decided that. A program exited 0.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| **It edited `check.mjs`** | `Put the checker back exactly as it was, and fix the page instead.` Then look at what it changed — that is the most instructive thing that will happen to you today. |
| It stops after one round | `Keep going. Do not stop until npm run check exits 0.` Or use `/goal`. |
| The same failure keeps coming back | `You have tried that three times. Stop. Tell me what you tried and what happened each time.` |
| It says it is done but the check is red | `Run npm run check and paste the last five lines, unedited.` |
| It gets slower and vaguer | Context is filling. `Write what is left into notes.md in ten lines`, start a fresh session, paste the notes, continue. |

---

### The two things to take home

**Fresh beats long.** If you have to restart the session, you lose nothing as long as the
state is in files — the report and your notes. An agent with a short memory and good notes
outperforms one with a long conversation and none. That is why the checker writes
`check-report.md` to disk instead of only printing it.

**The rule is the design.** "Never change the checker" sounds like discipline. It is
architecture. The moment the thing being judged can edit the judge, every green result
afterwards means nothing — and it will still look exactly as reassuring.
