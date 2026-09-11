# TIPS — a field guide to agentic loops

Notes from building this repository and running the loop against it, including the times it went wrong.
Where this names a file, that file is here and you can read the real thing.

One sentence to carry the rest: **the thing that decides whether the work is correct must not be the thing
that produced it, and must not be able to change its mind.**

---

## 1. Prompt patterns that work

**Give it a contract, not a wish.** "Make the page accessible" is a mood. `brief/ACCEPTANCE.md` is a
contract: sixty numbered criteria, each with the program that decides it. Write it once and every later
prompt gets shorter, because you point at a row instead of restating the goal.

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

> Where the brief is ambiguous, write the reading you chose into `loop/PROGRESS.md` under "Assumptions"
> and continue. Do not stall, and do not pick silently.

**Hand over the failure report verbatim.** Do not compress seven failures into "some contrast issues".
Paraphrase drops the selector, and the selector is the useful part.

> Here is `checks/report.md` unedited. Fix the failures under the first failing gate only, in order.

**Tell it what not to do.** Negative constraints are cheaper to enforce than positive ones, and they stop
scope creep. Every item on the rejection list in `AGENTS.md` is something an agent did here at least once.

> Do not add dependencies. Do not edit anything under `checks/`. Do not invent copy that is not in
> `brief/CONTENT.md`. Do not build anything on the out-of-scope list in `docs/CANON.md` §11.

**Ask for the smallest change that turns the gate green.** Left alone, an agent fixing one contrast failure
also reorganises components that were already passing, and the diff becomes unreviewable.

> Make the smallest change that turns AC-28 green. Do not refactor neighbouring code. Show me the diff.

---

## 2. When loops fail, and what it looks like

**The loop edits the test.** Symptom: the gate went green and the diff touches `checks/`, a threshold, a
`skip`, or `tokens.json`. The most common failure, and it feels like success. Fix: keep the verifier in its
own directory, off limits to the agent, and run the same gates in CI, where the agent cannot reach them at
all. If a gate is genuinely wrong, a person changes it, in a commit, with a reason.

**The loop oscillates.** Symptom: iteration 4 is identical to iteration 2. Usually two gates disagree — the
contrast fix breaks the visual diff, the visual fix restores the contrast failure. Fix: stop after three
failed repairs on the same criterion. Oscillation means your criteria contradict each other, and no amount
of iteration resolves that.

**The loop does not stop.** Symptom: green at iteration 6, and by iteration 9 it is adding a theme switcher
nobody asked for. Fix: the exit condition is an exit code, not a judgement. Never ask the model whether
there is anything else it would like to improve; the answer is always yes.

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

**A hard iteration cap.** `loop/ralph.sh` is a `while` loop with a maximum. Ten is generous for one section;
if ten did not do it, twenty will not either, and you would rather learn that for the price of ten.

**An explicit exit condition that no model evaluates.** Here it is `npm run check` exiting 0 — the same
condition on your laptop, in the room and in CI, returning the same verdict for the same input.

**Durable state in a file.** `loop/PROGRESS.md` is written by each iteration and read by the next. Context
is not memory; it is a buffer that gets summarised and truncated. If the next iteration needs it, it goes
on disk, including what was tried and failed.

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
external ever touched the page. A page missing three sections can score nine out of ten, and that is the
ordinary case, not a rare pathology.

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

The rule that keeps the useful half safe: **a model may open an item, never close one.** The review agent
writes findings, each citing a selector or a file and line, for a person to triage. Its output never sets
pass or fail. One model with veto power removes the determinism that makes everything else trustworthy.

---

## 5. Cost control

**What consumes budget.** Not the clever prompt. It is the same large files read into context every
iteration; long conversations, where the whole history is re-sent each turn, so turn thirty costs many
times turn three; iterations that fail environmentally — a browser never installed, a port in use — and
burn a cycle producing nothing; and letting the model do work a script does for free.

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

- **`git push --force`.** It destroys history other people are standing on. Let the loop commit to a branch
  and nothing more.
- **Delete anything outside the working directory.** A clean-up step with a wrong path variable does
  exactly what it was told. Run in a container or a disposable checkout, never in your home directory.
- **Read, print or rotate secrets.** Anything printed into a transcript is there forever, and transcripts
  get pasted into tickets. Scope tokens to one site and keep them out of context.
- **Deploy to production without a gate in front of it.** Here, deploy runs only after every gate is green,
  and AC-59 then checks the deployed HTML is byte-identical to the build that passed. Everything else
  proves *a* page passed; that proves the page that passed is the page that shipped.
- **Install global packages or change system state.** Global installs are invisible in the diff and break
  the next person's machine.
- **Edit its own verification code.** Thresholds, suppressions, skipped assertions, baseline images, the
  token file. An agent that can move the target always hits it.

---

## 7. Taking this to real work on Monday

Five starting points, each smaller than this workshop and the same shape: one artifact, one oracle that
returns pass or fail, a loop that stops on exit code.

1. **Token drift on one existing page.** A script reads every computed colour and prints those absent from
   your token file, with selectors. Give the agent the list, ask for the smallest change, re-run. Any page
   over a year old fails the first run.
2. **Copy conformance for one screen.** Put every user-facing string in one document. The check asserts each
   appears in the rendered page, plus a blacklist of words your brand does not use. Twenty lines, and it
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
