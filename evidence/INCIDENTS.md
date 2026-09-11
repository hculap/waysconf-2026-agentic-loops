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


---

## 9. The accessibility gate passed a blank page

**Caught by:** the criteria that assert *presence*. Not by axe.

**What happened.** A gate run under load produced five failures with a strange shape:
"there is no `[data-section="lineup"]` on the page", "no `[data-section="faq"]`", "the
page exposes no tabbable element at all". The structure and content gates in the same run
had just confirmed all ten sections were present.

The page had failed to load in those tests — an empty document. And **axe reported zero
violations on it, at all three breakpoints, which is a pass.**

**Why it matters.** This is the failure this repository exists to argue about, sitting
inside this repository's own verifier. Zero violations is not the same as passing when
there was nothing to violate. Had the a11y gate contained only the axe check, the run
would have gone green over nothing.

**Fix.** Before auditing, the gate now asserts that a page exists — body children, text,
at least one focusable element — and refuses to audit a blank one, loudly.

**The lesson.** Every gate needs to answer "did I actually look at something?" before it
answers "was it correct?". A measurement of nothing reads exactly like a measurement of
something perfect.

---

## 10. The loop hung for an hour on an open stdin

**Caught by:** noticing that a process alive for an hour had not written a single file,
and that Codex had not even opened a session log.

**What happened.** `codex exec` reads its instructions from stdin when stdin is a pipe.
Node's `spawn` gives a child an open stdin pipe by default. Nothing ever wrote to it and
nothing ever closed it, so Codex waited for an EOF that never arrived — alive, consuming
no CPU, producing no output, no error, and no session file.

**Fix.** `stdio: ['ignore', …]` in the harness, `< /dev/null` in `loop/ralph.sh`, for
every agent, and a thirty-minute ceiling on any single agent pass.

**The lesson.** This is the third unbounded wait in this project, after the image-generation
fetch and the accessibility gate's image decode. Three different files, three different
authors, three different languages, one shape. **Anything that waits needs a deadline**, and
the reason it keeps happening is that a hang is the one failure that produces no evidence
of itself.

---

## 11. The evidence harness manufactured evidence

**The worst one, and it is in the tool whose entire job is honesty.**

**Caught by:** reading the output and not believing it.

**What happened.** A trial was killed part-way through. `evidence/dry-run-codex.md` was
written anyway, and it said:

    | 2 | 0/0/0 | 0 | 4s | 11s | AC-18 AC-19 AC-24 AC-38 AC-39 AC-41 AC-42 AC-43 AC-44 AC-47 … |

Four clean iterations. Zero failures. Fourteen acceptance criteria cleared in one pass.

None of it happened. `npm run check` had not run, so there was no report; `gateCounts()`
returned zeros for a missing report; and the harness computed "criteria that were failing
before and are not failing now" by diffing one absence against another. Every number in
that table was the shape of nothing.

**Fix.** A missing report is now an explicit `not measured` row and stops the run. The
fabricated file was deleted rather than kept with a caveat attached.

**The lesson.** Fourth instance in this project of **absence being read as success**, and
the only one where the output was not merely wrong but *fabricated in the format of
evidence* — a table, a unit, a criterion id, a trend. Everything that makes a number
believable was present except the measurement.

If a single sentence survives this whole workshop, it should probably be this one: a system
that cannot distinguish "it passed" from "I did not look" will eventually tell you it
passed.


---

## 12. An agent that did nothing, recorded as an agent that worked

**Caught by:** a five-second agent pass with a zero exit code and an empty diff.

**What happened.** The second clean-room trial, with Claude Code instead of Codex, invoked
the agent and got this back in five seconds:

    UserPromptSubmit operation blocked by hook:
    Dashboard turn tracking: Claude hook session identity mismatch

A hook belonging to an unrelated dashboard on the host machine refuses headless
`claude -p` invocations it does not recognise. Nothing to do with the repository, the
agent, or the loop — a property of one laptop.

The harness recorded it as a normal iteration: exit 0, five seconds, no changes. It would
have gone on to do that three more times, and written a table of four agent passes that
never happened.

**Fix.** An agent that exits 0 and changes nothing in under thirty seconds is now a
**no-op**: the run stops, the iteration is labelled as such, and the agent's last twenty
lines of output are kept so the reason is visible. `evidence/dry-run-claude.md` records
the non-run rather than leaving a gap.

**Not fixed, deliberately.** The hook belongs to the machine's owner and was left alone.
Disabling somebody's environment to make your own measurement succeed is how you get a
measurement of your own configuration.

**The lesson.** Fifth instance in this project of the same confusion, and the most
instructive, because this time the failure was *upstream of the agent entirely*. "Exit 0"
means the process ended, nothing more. A loop needs to know the difference between an
agent that considered the problem and declined to act, and an agent that was never
allowed to read the prompt. Only one of those is worth iterating on.


---

## 13. The accessibility gate was green, and the hero was illegible

**The best one. If you only read one entry in this file, read this one.**

**Caught by:** `scripts/check-assets.mjs`, the repository's own asset checker, reporting
that 4.47% of the tiles in the lower half of `hero-hall.jpg` were too bright for white
text — and then by measuring the rendered page to find out whether that mattered.

**What happened.** The accessibility gate was passing. Zero axe violations, three
breakpoints, six page states, twice in a row. Lighthouse accessibility 100.

Then the hero text was measured directly: screenshot the page with every glyph made
transparent, sample the brightest 4×4 patch behind each text element, compute the real
WCAG ratio. Five of the nine text elements in the hero were below AA:

| Element | Measured | Required |
|---|---|---|
| "Fourth edition" | 2.94:1 | 4.5:1 |
| "Ambient, techno and modular sound…" | 3.02:1 | 4.5:1 |
| "Three nights inside the machine" (1440) | 3.92:1 | 4.5:1 |
| "The Powerhouse, Hall E · Kraków" | 4.25:1 | 4.5:1 |
| "Friday 12 – Sunday 14 June 2027" | 4.41:1 | 4.5:1 |

The largest, first, most-read text on the page. On a page whose entire palette was
designed around a contrast trap, in a repository built to argue that verification is the
hard part.

**Why axe said nothing.** axe-core does not evaluate contrast for text over a background
image. It does not fail such a pair — it marks it **incomplete** and moves on. In a gate
whose threshold is "zero violations", incomplete is indistinguishable from correct.

Reading the CSS would not have found it either. The effective background of that text is a
photograph, two translucent scrims and a gradient composited together, and no computed
style anywhere says what colour that is. The only way to know is to look at the pixels.

**Fix, in two attempts, and the first one was worse.** Darkening the whole frame bought the
contrast and erased the photograph — a hero of a turbine hall in which you could no longer
see the turbine hall. The second attempt puts a flat wash under the text at 390, where the
copy spans the frame, and a left-to-right gradient above 768, where the copy occupies the
left half and the crowd occupies the right. Worst measured ratio is now 5.26:1, and the
hall is still there.

**And then it became a gate.** `checks/gates/image-contrast.mjs`, AC-61, runs on every
build: it measures 21 text elements over images at three breakpoints and skips the 3 that
have their own opaque background. The repository has sixty-one criteria now instead of
sixty, because a review found a hole in the contract rather than in the code.

**The lesson, and it is the whole talk.** *Green means no known defect.* This gate was
green, twice, deterministically, on a page with five real accessibility failures in its
most prominent element — and it was not lying. It was answering a narrower question than
anyone reading the word PASS would assume it was answering.

Every gate has an edge. The work is knowing where yours is, and writing that down next to
the number.
