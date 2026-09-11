# Incidents

Things that actually went wrong while building this workshop, written down at the time
rather than reconstructed afterwards.

They are here because a talk about systems that check their own work should be able to
show its own failures. Every one of these was caught by something other than someone's
opinion that the work looked fine.

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

**The lesson for the room.** The gate is not there to catch the agent. It is there to
catch whoever is writing, and that includes the person who believes they know the palette.

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

**The lesson for the room.** The parser was written to reject a missing or non-numeric
attribute rather than default it. Had it defaulted, the hero would have been generated at
512px and nobody would have known until the pixel diff started failing for reasons that
looked like something else.

---

## 3. An unbounded `fetch` hung the image generation for six minutes

**Caught by:** watching the log stop moving. Nothing in the code caught it, which is the
point of writing it down.

**What happened.** Generating the eighteen-image pack, the eleventh request stopped
responding. The script had retry logic with exponential backoff and it never fired,
because a `fetch` with no timeout does not fail — it waits. The run sat on one request
with no output and no error.

**Why it matters.** This is the failure mode of every unattended loop. The guard rails in
`loop/ralph.sh` are about the agent doing something wrong; this was the harness doing
nothing at all, which is harder to notice because it looks like patience.

**Fix.** `signal: AbortSignal.timeout(180_000)` on the request. The retry path then works
as designed, and the worst case is bounded at four attempts.

**The lesson for the room.** "It is still running" and "it is stuck" look identical from
outside. Every step in a loop needs a deadline, and a loop with no deadline anywhere in it
will eventually stop at 3am and be discovered at 9am.

---

## 4. The working name for the project was the name of a massacre

**Caught by:** a background check on the name before it went into any public artifact.

**What happened.** The festival was briefly going to be called NOVA. Nova is the name of
the electronic music festival attacked at Re'im on 7 October 2023, where at least 364
civilians were killed — the deadliest attack on a concert in history. A fictional
electronic music festival called NOVA, in public teaching material, at an international
conference, would have been indefensible.

**Why it matters.** The name had already been chosen, agreed and written into a plan. It
would have propagated into the Figma file, the repository, the slides and thirty
participants' forks before anyone looked it up.

**Fix.** Renamed to TURBINE. Nothing else about the concept changed.
`docs/CANON.md` §12 records the rejection so it cannot come back.

**The lesson for the room.** Not every check can be automated, and the ones that cannot
are usually the expensive ones. A gate that measures contrast will never tell you that
the name is a problem.
