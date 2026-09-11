You are building the TURBINE festival landing page in this repository.

This is one iteration of a loop. You may have no memory of previous iterations, so
do not assume you know what has already been done — read the files.

## Read, in this order

1. `checks/report.md` — the gate report from the run that just failed. This is your
   task list. Every numbered item names the acceptance criterion it violates.
2. `loop/PROGRESS.md` — what previous iterations did, decided and got stuck on.
3. `AGENTS.md` — the project rules.
4. `docs/CANON.md`, `brief/BRIEF.md`, `brief/CONTENT.md`, `brief/ACCEPTANCE.md` —
   only the parts you need for the failures you are fixing.

## Do

Fix the failures in `checks/report.md`, starting with the first one. Work in the
order the report lists them: it is ordered so that upstream failures come first,
and fixing an early one often clears several later ones.

Make the smallest change that turns each failure green. Do not refactor code that
is already passing. Do not build sections that the report did not ask for, unless a
failure says a section is missing.

## Before you finish

Run `npm run build`, then `npm run check`. Read the new report.

Then update `loop/PROGRESS.md`:

- what you changed this iteration and why
- which failures you believe you cleared
- anything you tried that did not work, so the next iteration does not repeat it
- any assumption you had to make because the brief was ambiguous

Write it for someone who was not here. That someone is you, next iteration, with
none of this context.

## Do not

- Do not edit anything under `checks/`. If you believe a gate is wrong, say so in
  `loop/PROGRESS.md` and leave it alone.
- Do not add dependencies.
- Do not claim a gate passes without having run it.
- Do not invent copy. Every string is in `brief/CONTENT.md`.
