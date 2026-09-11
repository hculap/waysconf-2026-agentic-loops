# TIPS — a field guide to agentic loops

Notes from building this repository and running the loop against it, including the times it went wrong.
Where this names a file, that file is here and you can read the real thing — except `checks/report.md`,
which `npm run check` writes on its first run. Terms this takes for granted are in `docs/GLOSSARY.md`.

One sentence to carry the rest: **the thing that decides whether the work is correct must not be the thing
that produced it, and must not be able to change its mind.**

---

## 1. Prompt patterns that work

**Give it a contract, not a wish.** "Make the page accessible" is a mood. `brief/ACCEPTANCE.md` is a
contract: sixty numbered criteria, and for all but the last five the program that decides it. Write it
once and every later prompt gets shorter, because you point at a row instead of restating the goal. The
five without a program are the performance budgets and the deploy family, and that gap is legible only
because every other row names one.

> Build the tickets section so that AC-41, AC-43 and AC-29 pass. Do not touch any other section.

**Write the failure message before you write the check.** If you cannot say what the failure will read
like, the criterion is not ready. That message is the repair prompt. Compare "contrast too low" with:

> AC-28 TOKENS: color.text.muted (#6B7280) used on `.artist-card__genre` outside the footer legal block.
> Supporting copy uses color.text.secondary (#A7AEBB).

The first sends the agent exploring. The second has an address on it.

**Point at files, do not paste them.** A pasted document lands in the conversation, where it decays, gets
summarised, and costs money on every later turn. A path stays readable in iteration nine.

> Read `docs/CANON.md` §4 and `design/tokens/CONTRAST.md`, then fix the two contrast failures in
> `checks/report.md`. Do not summarise those files back to me.

**Ask for a plan before code, and read it.** A plan takes ninety seconds to check; the code it would have
produced takes an afternoon. Nearly every serious misunderstanding is visible in the plan: wrong section
order, an invented artist, a decision to "start simple" that drops six requirements.

> Before editing anything: list the sections you will build, in canonical order, and the acceptance
> criteria each satisfies. Stop after the plan.

**Make it state its assumptions in writing.** Ambiguity is not the enemy; silent resolution of it is.

> Where the brief is ambiguous, write the reading you chose into `notes.md` under "Assumptions" and
> continue. Do not stall, and do not pick silently.

**Hand over the failure report verbatim.** Do not compress seven failures into "some contrast issues".
Paraphrase drops the selector, and the selector is the useful part.

> Here is `checks/report.md` unedited. Fix the failures under the first failing gate only, in order.

**Tell it what not to do.** Negative constraints are cheaper to enforce than positive ones, and they stop
scope creep. Most items on the rejection list in `AGENTS.md` are things an agent did here at least once.
The exception is the NOVA line, which came from a human naming decision — `evidence/INCIDENTS.md` §4
explains why no gate would have caught it.

> Do not add dependencies. Do not edit anything under `checks/`. Do not invent copy that is not in
> `brief/CONTENT.md`. Do not build anything on the out-of-scope list in `docs/CANON.md` §11.

**Ask for the smallest change that turns the gate green.** Left alone, an agent fixing one contrast failure
also reorganises components that were already passing, and the diff becomes unreviewable.

> Make the smallest change that turns AC-28 green. Do not refactor neighbouring code. Show me the diff.

---

## 2. When loops fail, and what it looks like

**The loop edits the test.** Symptom: the gate went green and the diff touches `checks/`, a threshold, a
`skip`, or `tokens.json`. The most common failure, and it feels like success. Fix: keep the verifier in its
own file and say so in the prompt in as many words — prompt 05 stops the
run when anything under `checks/` or `.github/` has changed — then run the same gates in CI, where the
agent is not the one running them. If a gate is genuinely wrong, a person changes it, in a commit, with a
reason.

**The loop oscillates.** Symptom: iteration 4 is identical to iteration 2. Usually two gates disagree — the
contrast fix breaks the visual diff, the visual fix restores the contrast failure. Fix: stop after three
failed repairs on the same criterion. Oscillation means your criteria contradict each other, and no amount
of iteration resolves that.

**The loop does not stop.** Symptom: green at iteration 6, and by iteration 9 it is adding a theme switcher
nobody asked for. Fix: the exit condition is an exit code — the number a program returns when it finishes,
where zero means pass — not a judgement. Never ask the model whether there is anything else it would like
to improve; the answer is always yes.

**Context exhaustion mid-loop.** Symptom: quality falls off a cliff once the conversation gets long. It
re-derives what it established an hour ago and re-solves a solved problem. Fix: durable state in a file and
a fresh context per iteration, as in §3.

**Success reported, nothing run.** Symptom: "I have fixed the contrast issues and all gates now pass", with
no command anywhere in the transcript. Fix: never accept a claim, only an artifact. Better, run the gates
in CI, so the report is not produced by the thing being graded.

**Silent partial completion.** Symptom: eight of eleven sections built, the summary says the page is done,
nothing says three are missing. The quietest failure mode, and the reason AC-06 counts sections rather than
trusting the account of them. Fix: make completeness countable.

---

## 3. Bounding a loop

**A hard iteration cap.** Say it in the prompt: *"stop after ten rounds and tell me where you got to"*.
Ten is generous for one section; if ten
did not do it, twenty-four will not either, and you would rather learn that for the price of twelve.

**An explicit exit condition that no model evaluates.** Here it is `npm run check` exiting 0 — the same
condition on your laptop, in the room and in CI. One caveat, and it has the shape of the failures in §2: a
gate that cannot run reports SKIP, and a skip does not turn the run red. `--skip-perf`, or a machine where
Lighthouse finds no browser to launch, leaves AC-52 to AC-55 unmeasured and the run green. CI installs
Chromium for that reason — it runs the family a laptop can quietly drop.

**Durable state in a file.** `notes.md` is written by each iteration and read by the next — prompts 05 and
08 both say so. Context is not memory; it is a buffer that gets summarised and truncated. If the next
iteration needs it, it goes on disk, including what was tried and failed.

**A fresh context each iteration, usually.** A long context carries every wrong turn the loop already took,
and the model keeps weighting its own earlier reasoning. A fresh context with the canon, the progress file
and the failure report has the facts and none of the flailing. Long contexts are for exploration; short
repeated ones are for repair.

---

## 4. Real loop versus fake loop

If you take one thing from the ninety minutes, take this.

A **real loop** has an external oracle: a program that reads the artifact and returns pass or fail. Same
input, same verdict, every time. It was written before the artifact, does not know how the artifact was
made, and cannot be argued with. No model takes part in that decision.

A **fake loop** asks the model to grade its own output. "Review your work and fix any issues." "Does this
meet the requirements?" "Rate this against the brief out of ten."

The fake loop feels productive. You get a confident report with severity levels and a percentage; issues
are found and fixed; the tone is one of rigour. What is happening is that the distribution which produced
the page is being asked to sample criticism of it, then a response to that criticism. It will find
something, because you asked it to, and it will declare victory, because you asked that too. Nothing
external ever touched the page. A page missing three sections can score nine out of ten, and nothing
about the arrangement makes that a rare pathology.

The tell: **ask what would have to be true for the loop to say "fail" forever.** If the answer is "the
model would have to keep deciding it is not good enough", the loop is fake.

Self-assessment is genuinely useful, and precisely bounded.

- **Useful:** taste and hierarchy, prose and tone, generating candidate defects, prioritising a long list
  of real findings, explaining a failure, proposing a fix. The adversarial review here does exactly this,
  hunting what the gates cannot see — alt text that is present and meaningless, ARIA that is valid and
  dishonest, contrast over photography.
- **Not useful:** correctness, compliance, completeness, and "is it done". A model cannot tell you whether
  the build passed, whether all twelve artists are on the page, or whether the deployed HTML matches the
  build that passed the gates.

The rule that keeps the useful half safe: **a model may open an item, never close one against the page.**
The review agent writes findings, each citing a selector or a file and line, for a person to triage. It may
kill its own candidates before you ever see them — that is what the refutation panel described in
prompt 07 is for — but its output never sets pass or fail. One model with veto power
removes the determinism that makes everything else trustworthy.

---

## 5. Cost control

**What consumes budget.** Not the clever prompt. Four things do. The same large files read into context
every iteration. Long conversations, where the whole history is re-sent each turn, so turn thirty costs
many times turn three. Iterations that fail environmentally — a browser never installed, a port in use —
and burn a cycle producing nothing. And letting the model do work a script does for free.

**Keeping an overnight run from burning money.** Set an iteration cap and a wall-clock deadline, and have
both kill the loop rather than warn. Run cheap gates first and stop at the first failing family, so a
broken build never pays for a Lighthouse run. Skip the slow gate in the inner loop and run it once before
deploy. Leave the loop somewhere you can kill it from your phone.

**Why small tasks beat one large one.** The context you carry is the context you pay for, on every turn.
One section touches four files; the whole page touches forty. A small task that fails costs a small retry
and you keep the sections that passed. A large one that fails at 80% costs the whole run and is harder to
diagnose.

---

## 6. Things never to let a loop do unattended

- **`git push --force`.** It destroys history other people are standing on. Let the loop commit and nothing
  more: commit before you start a long unattended run, so that `git reset --hard` is always a way back.
- **Delete anything outside the working directory.** A clean-up step with a wrong path variable does
  exactly what it was told. Run in a container or a disposable checkout, never in your home directory.
- **Read, print or rotate secrets.** Anything printed into a transcript is there forever, and transcripts
  get pasted into tickets. Scope tokens to one site and keep them out of context.
- **Deploy to production without a gate in front of it.** Here, deploy is a separate step with a green
  `npm run check` as its precondition, and AC-59 then compares the sha256 of the fetched page against the
  build that passed. Everything else proves *a* page passed; that proves the page that passed is the page
  that shipped. Note what it costs: in this repository that precondition lives in
  `prompts/06-deploy.md` as an instruction rather than a program, and an instruction is the weaker of the
  two things this page is about.
- **Install global packages or change system state.** Global installs are invisible in the diff and break
  the next person's machine.
- **Edit its own verification code.** Thresholds, suppressions, skipped assertions, baseline images, the
  token file. An agent that can move the target always hits it.

---

## 7. Taking this to real work on Monday

Five starting points, each smaller than this workshop and the same shape: one artifact, one oracle that
returns pass or fail, a loop that stops on exit code.

1. **Token drift on one existing page.** A script reads every computed colour and prints those absent from
   your token file, with selectors. Give the agent the list, ask for the smallest change, re-run. Most pages
   over a year old fail the first run.
2. **Copy conformance for one screen.** Put every user-facing string in one document. The check asserts each
   appears in the rendered page, plus a list of words your brand does not use. Twenty lines, and it
   catches what normally surfaces in review three days later.
3. **An accessibility floor on five URLs.** Run axe against your five most-visited pages with a budget of
   zero serious or critical violations. Green is not "accessible" — automated rules reach perhaps a third of
   WCAG — but it is a floor that cannot silently drop.
4. **Research write-up integrity.** If you publish findings with quotes, assert that every quoted string
   appears verbatim in a transcript and every participant ID exists in the roster. A misattributed quote is
   the research equivalent of a broken build.
5. **Release-note completeness.** Export the tickets in a release and assert each has an acceptance
   criterion, an owner and a line in the notes. Thirty lines of code turn a recurring Friday argument into
   an exit code.

For any of these, the test is the question from §4: what would have to be true for it to keep saying fail?
If the honest answer involves a model's opinion, go back and write the script.
