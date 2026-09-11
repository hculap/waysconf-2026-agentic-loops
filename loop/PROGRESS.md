# Progress

This file is the loop's memory. Each iteration reads it, then appends to it.

It exists because context does not survive. An agent that ran for forty minutes and
then hit its context limit knows nothing on the next pass, and an agent that is
handed a very long conversation reasons worse than one handed a short, well-written
note. So: findings go in files, not in the chat.

Write for a stranger. That stranger is you, ten minutes from now, with none of this
in your head.

---

## How to append

Add a new block at the bottom. Do not rewrite history — a wrong turn that is
recorded is worth more than a tidy file, because it stops the next iteration
walking into it.

```
## Iteration N — YYYY-MM-DD HH:MM

**Changed.** What you actually edited, in one or two lines.

**Cleared.** Which gate failures you believe are now green, by criterion id.

**Still failing.** What the report still shows, and your reading of why.

**Tried and rejected.** Anything you attempted that did not work. Say what the
symptom was, not just "did not work".

**Assumptions.** Anything ambiguous in the brief that you had to decide for
yourself. These are the notes that turn into questions for the client.
```

---

## Iteration 0 — starter state

**Changed.** Nothing. This is where everyone begins.

**Cleared.** Nothing.

**Still failing.** All of it. `src/pages/index.astro` renders a placeholder that
lists the eleven canonical sections and marks each one missing. The layout,
the token bridge, the fonts and the verifier are in place; the page is not.

**Tried and rejected.** —

**Assumptions.** —
