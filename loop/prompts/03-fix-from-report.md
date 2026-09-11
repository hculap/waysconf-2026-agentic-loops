# 03 — Fix what the report says

The gates have run and something failed. Your task list is `checks/report.md`.

Read it now, from disk, as it stands. Do not work from what you remember of an earlier run, and do not
re-derive the failures by reasoning about the code. If, and only if, a report appears after the
`--- REPORT ---` line at the end of this prompt, treat that text as the report and do not read the file.

Every item in it is numbered and carries the criterion it violates, where it is, what was expected and what
was found. That is the repair instruction, and it is more specific than anything you would work out by
looking around.

How to work:

1. **Fix one gate family at a time**, and pick the family by this order rather than by where it sits in the
   report: BUILD, STRUCTURE, RUNTIME, LINKS, CONTENT, TOKENS, A11Y, VISUAL, PERF. The report prints its
   failing families alphabetically, which is not a repair order — a section that is missing fails STRUCTURE
   and also poisons the a11y, token and pixel numbers underneath it, so fixing STRUCTURE first often clears
   several later items at once. Within the family you chose, work the items in the order the report lists
   them.
2. **Fix the cause, not the symptom.** A contrast failure is fixed by moving to a pairing marked
   `PASS-AA` in `design/tokens/CONTRAST.md`, not by nudging a hex until the number moves. `PASS-AA-LARGE`
   is not a pass: it applies only to type at 24 px or above, or 18.66 px bold.
3. **Make the smallest change that turns the item green.** Do not refactor code that was already passing.
4. **One item at a time.** Change, build, re-check, then the next.

Then:

```bash
npm run build
npm run check
```

Read the new report. Append to `loop/PROGRESS.md`: what you changed and why, which criterion ids you
cleared, what is still red and your reading of why, anything you tried that did not work and what the
symptom was, and any assumption you had to make. Write it for someone who was not here, because the next
iteration will not have your context.

Do not:

- Do not edit anything under `checks/`. Not a threshold, not a skipped assertion, not a suppressed rule,
  not `design/tokens/tokens.json`, not a baseline image. If you believe a gate is genuinely wrong, stop,
  write which one and why in `loop/PROGRESS.md`, and change nothing.
- Do not add a dependency.
- Do not invent copy. Every string is in `brief/CONTENT.md`.
- Do not claim a gate passes without having run it.

If the same criterion has now failed three times for the same reason, stop. Write down what you tried and
what happened each time, and hand it back. Three failed repairs usually means the criteria contradict each
other, and no further iteration resolves that.

--- REPORT ---

<nothing here by default: the agent reads checks/report.md. Paste a report below this line to override it.>
