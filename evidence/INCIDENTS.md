# Incidents

Things that actually went wrong while building this workshop, written down at the time
rather than reconstructed afterwards.

They are here because a talk about systems that check their own work should be able to
show its own failures. Note how many of them are failures **of the verifier** rather than
of the page. That is the honest shape of this work: the oracle is the hard part, and a
broken oracle is more dangerous than no oracle, because it is confident.

---

## 1. The starter page failed its own accessibility gate

**Caught by:** the Lighthouse gate, the first time it was run, against the placeholder
page that ships as the starting state.

**What happened.** The starter listed the eleven sections still to be built and set the
list numbers in `color.text.muted`. Lighthouse returned accessibility **92**, against a
threshold of 100. The failing audit was contrast.

**Why it matters.** `color.text.muted` (`#6B7280`) measures **4.07:1** on the page
background, under the 4.5:1 that normal body text requires. `docs/CANON.md` §8 describes
this as a deliberate trap that a careless implementation will fall into — and the trap
caught the person who set it, in the first file they wrote, before any agent was
involved.

**Fix.** Moved to `color.text.secondary` (`#A7AEBB`, 8.9:1).

**The lesson.** The gate is not there to catch the agent. It is there to catch whoever is
writing, and that includes the person who believes they know the palette.

---

## 2. `PROMPTS.md` declared an aspect ratio the API does not have

**Caught by:** the parser in `scripts/generate-images.mjs`, on its first dry run.

**What happened.** The social-card entry declared `aspect="1.905:1"` — the Open Graph
ratio, correct as a description of the finished file. The image model accepts ten fixed
aspect ratios and that is not one of them. The same document, three sections earlier,
correctly said the image should be requested at 16:9 and centre-cropped.

**Why it matters.** Nothing was wrong with the *thinking*; the document contradicted
itself between a table and an attribute forty lines apart. That is exactly the class of
defect a human reviewer skims past and a parser cannot.

**Fix.** `aspect="16:9" crop="centre:2048x1075"`, matching the document's own table.

**The lesson.** The parser was written to reject a missing or non-numeric attribute
rather than default it. Had it defaulted, the hero would have been generated at 512px and
nobody would have known until the pixel diff started failing for reasons that looked like
something else.

---

## 3. An unbounded `fetch` hung the image generation for six minutes

**Caught by:** watching the log stop moving. Nothing in the code caught it, which is the
point of writing it down.

**What happened.** Generating the image pack, the eleventh request stopped responding.
The script had retry logic with exponential backoff and it never fired, because a `fetch`
with no timeout does not fail — it waits.

**Fix.** `signal: AbortSignal.timeout(180_000)`. The retry path then works as designed.

**The lesson.** "It is still running" and "it is stuck" look identical from outside. Every
step in a loop needs a deadline. This one came back twice more in this list.

---

## 4. The working name for the project was the name of a massacre

**Caught by:** a background check on the name before it went into any public artifact.

**What happened.** The festival was briefly going to be called NOVA. Nova is the name of
the electronic music festival attacked at Re'im on 7 October 2023, where at least 364
civilians were killed. A fictional electronic music festival called NOVA, in public
teaching material, at an international conference, would have been indefensible.

**Why it matters.** The name had already been chosen, agreed and written into a plan.

**Fix.** Renamed to TURBINE. `docs/CANON.md` §12 records the rejection so it cannot
come back.

**The lesson.** Not every check can be automated, and the ones that cannot are usually the
expensive ones. A gate that measures contrast will never tell you that the name is a
problem.

---

## 5. The verifier spent an entire run measuring somebody else's website

**This is the most important entry in this file.**

**Caught by:** reading a failure message that named a file the project has never had —
`/images/claude-certified-architect.webp`.

**What happened.** `checks/run.mjs` started `astro preview` on a fixed port, 4321, waited
for an HTTP 200, and then ran nine gates in a real browser against `http://localhost:4321`.

Something else on the machine was already listening on 4321: an unrelated Astro project.
The preview server could not bind. The health check asked only "did something answer with
a status below 500", and something did.

The run then produced **427 failures**, every one of them specific, correctly formatted,
citing real acceptance criteria and real CSS selectors, about a completely different
website. Two of those failures were the ones I started investigating: a missing image, and
a screenshot that exceeded Playwright's 10000px limit because the other site's pages are
long.

**Fix.** Two changes, and the second is the one that matters:

1. Take a port the operating system says is free, instead of a fixed one.
2. **Verify identity before measuring.** After the server answers, fetch the page and
   compare it byte-for-byte with `dist/index.html`. If it is not our build, every gate
   below it is meaningless, so the run fails immediately and says so.

**The lesson, and it is the whole talk in one paragraph.** A verifier that is confident
and wrong is worse than no verifier. Everything about that report looked like evidence:
the format, the criterion ids, the selectors, the counts. The one thing nobody had checked
was whether the thing being measured was the thing under test. *Before you trust a
measurement, make the measurement prove what it measured.*

---

## 6. The accessibility gate hung for seven minutes on a page with zero violations

**Caught by:** the gate's own design. It reports a check that did not finish as a
**failure**, never as a pass, so the run went red instead of quietly green.

**What happened.** `AC-15 axe-core at 390px` timed out at 420 seconds, and with it ten
other criteria were reported as "did not run to completion". Running axe against the same
page by hand took **1.6 seconds and found nothing**.

The gate waited for every image to decode before auditing — reasonable, since layout and
contrast depend on images. But the lineup portraits below the fold are `loading="lazy"`.
The browser never fetches them, so `img.complete` stays `false` and `img.decode()` never
settles. The gate was waiting for an image the browser had decided not to load.

**Fix.** Every wait is now raced against a deadline, and anything still outstanding is
recorded as a note on the gate rather than silently ignored. All ten a11y tests then
passed in 1.9 minutes.

**The lesson.** Two of them. First, the same unbounded-wait bug as incident 3, in a
different language, in a different file, written by a different author, three hours later.
Second: the gate's "a check that did not finish is a failure" rule is what made this
visible. Under the more natural "skip what you could not measure" rule, this would have
been eleven silent green criteria.

---

## 7. Lighthouse scored a perfect page zero, twice out of three times

**Caught by:** a median of `[0, 0, 80]` being reported as `0`.

**What happened.** A Lighthouse run that fails to load the page still returns a report,
with every category scored 0. The gate took the median of three runs to reduce noise —
which is right — but two of the three runs had lost a race against a Playwright session on
the same machine and were not measurements at all.

**Fix.** Discard runs with a `runtimeError`, or where every category is 0, and retry up to
five times for three usable runs. Fewer than two usable runs is a SKIP with a stated
reason, not a score. The number of discarded runs is printed rather than swallowed.

**The lesson.** A run that did not happen is not a measurement of zero. Averaging is only
noise reduction if every sample is a sample.

---

## 8. The baseline tool refused to let an agent move the target

**Not a failure. Included because it is what the rest of this file is for.**

`checks/baseline.mjs` regenerates the PNGs that AC-34 and AC-35 compare against — it
defines what "correct" looks like. It refuses to run when `stdin` is not a terminal or when
an agent or CI marker is present in the environment, on the grounds that an agent which can
move the target always hits it.

While finishing this repository, that guard fired. The baselines on disk were screenshots
of the *starter* page — a page that says "nothing is built yet" — so the visual gate was
reporting a 93% difference against the finished site.

The available options were to bypass the guard, or to delete the wrong baselines and let
the gate report `SKIP — no baseline, run npm run baseline`.

The wrong baselines were deleted. A gate that says "nobody has told me what correct looks
like yet" is honest. A green gate obtained by an agent re-recording the target is the
failure this entire repository exists to argue against, and it would have been trivially
easy to do it and never mention it.

**Someone has to run `npm run baseline` at a keyboard, look at the page, and say why.**
That is the design, not a limitation.
