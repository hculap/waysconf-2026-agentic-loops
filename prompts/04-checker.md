# 04 — Write the checker

The agent writes `npm run check`: a program that tests the page in a real browser against the
documents in `docs` and writes a report file. The prompt names no colour, width or section;
the agent takes them from the design.

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

**Expected result.** The checker runs and fails, with a list of failures. Each failure names
the element, the expected value, the measured value and the threshold. A checker that passes
on its first run is not checking anything.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It passes on the first run | `It passed first time. Show me which checks ran and what each one measured.` |
| A check is skipped or marked incomplete | `A check that cannot run is a failure. Make it fail and say why it could not run.` |
| The report says "contrast issue" with no details | `Every failure needs the element, the expected value, the measured value and the threshold.` |
| It asks which testing library to use | `Your choice. Pick one that drives a real browser and tests accessibility.` |
| `npm run check -- --url https://example.com` does nothing different | `The checker must accept --url and run the same checks against that address.` |

---

### Why it is written this way

- A program, not an opinion: exit code 0 or not, the same answer on every run, no language model involved.
- A check that cannot run is a failure: accessibility tools report text over images as "incomplete", and a rule of "zero violations" would otherwise count that as a pass.
- It takes `--url`: prompt 06 runs the same checks against the live site.
