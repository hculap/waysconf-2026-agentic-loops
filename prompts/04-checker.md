# 04 — Write the checker

**This is the workshop.** Everything before it was getting a page onto a screen. Everything
after it depends on what happens here.

You are about to ask the agent to build the thing that will judge its own work — and then,
in the next prompt, forbid it from ever touching that thing again.

Notice what this prompt does *not* say. It does not name a colour, a width, a font size or
a section. All of that is in the design, and the agent read the design in prompt 02. A
prompt that repeats the design has two copies of the truth, and the day they disagree is
the day the checker starts lying.

---

```text
Now write a program that checks your own work against the design.

It must be a program, not an opinion. It runs, it looks at the real page in a real
browser, and it exits with code 0 if everything is right and a non-zero code if anything
is wrong. It never asks a language model anything, it never asks me anything, and it
gives the same answer twice on the same page.

Make "npm run check" run it. Install whatever you need to drive a real browser and to
test accessibility. These are tools for checking; none of them goes into the page.

By default it checks the site running on this machine. It must also take an address —
npm run check -- --url https://… — and run the same checks against that page instead, so
that later it can judge the live site too.

Derive what to check from the documents in docs, not from me. At minimum it must decide, against the
page as a browser actually renders it rather than against the source:

1. that the project builds, with no errors
2. that loading the page produces no errors in the browser console
3. that every section the design defines is present, and in the order the design gives
4. that it is accessible, at every width the design specifies
5. that every colour the page paints is one the design defines — anything else fails
6. that every piece of copy in the design appears on the page
7. that nothing overflows sideways at the narrowest width the design specifies
8. that every image has alt text, and that it is not the filename

When something fails, the report must say four things: what failed, where on the page,
what the design says it should be, and what was actually there. "Contrast issue on the
page" is useless. Naming the element, the expected value, the measured value and the
threshold is the whole job.

Write the report to a file as well as printing it, because in the next step I am going to
hand that file straight back to you. Tell me what you called it.

Two rules about the checker itself:

- If a check cannot run — the browser will not start, the page will not load,
  a document in docs is missing — that is a FAILURE, never a pass and never a silent skip. A
  check that did not happen must not look like a check that succeeded.
- Do not make the checks lenient so that they pass. I am expecting this to fail. If it
  passes first time I will assume it is not checking anything.

When it is written, run it and show me the output.
```

---

**What you should see.** Red. Quite a lot of it.

That is the correct outcome and it is worth sitting with for a second. A page you were
fairly happy with two minutes ago has just been told, by a program, exactly what is wrong
with it — with element names and measured numbers.

You did not tell it which numbers. It went and got them from the design.

---

### Why this prompt names nothing specific

Every check in that list is a *question*, and the answer lives in the design file. Ask for
"zero accessibility violations at every width the design specifies" and the agent has to go
and find out what those widths are. Ask for them by number and you have quietly moved the
design into the prompt, where nobody will remember to update it.

This is the same reason the prompt does not name a testing library or a file name. Those
are the agent's decisions, and the agent is better at them than a message written in
advance for a machine that might be either of two different tools.

What the prompt *does* fix is the part no tool can decide for you:

- it must be a program, and its answer must not come from a model
- the report is for a reader who was not there — element, expected, actual, threshold
- a check that cannot run is a failure
- lenient checks are worse than no checks
- it takes an address, because prompt 06 is going to point it at the live site

### The sentence that does the most work

> A check that cannot run is a FAILURE, never a pass and never a silent skip.

In a trial run of these prompts, an agent given that one line decided on its own to treat
its accessibility tool's *inconclusive* results as failures rather than passes. That
decision catches a whole class of defect that a "zero violations" gate cannot see, and
nobody asked for it. It fell out of one sentence about what absence means.
