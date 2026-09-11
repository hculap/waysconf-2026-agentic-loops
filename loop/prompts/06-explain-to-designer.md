# 06 — Explain what you did, to a designer

Explain what just happened in this repository to a product designer who has never opened a terminal.

They are not a beginner. They are better than you at the part of this that matters, and they have decided
whether a design is finished a thousand times. What they do not have is any reason to know what a build
step is, what a gate is, or why a page that looks right can still be failing.

Write under 400 words, in this shape:

1. **What got built**, in two sentences, in their language.
2. **How it was found to be wrong.** Name one real failure that actually happened — the criterion id, what
   the report said, and what was wrong on the page. One concrete failure teaches more than a description of
   the system.
3. **What fixed it**, and how many attempts it took.
4. **What the checks could not see.** Be specific and use `brief/ACCEPTANCE.md`, not a general disclaimer.
   Automated accessibility rules reach roughly a third of the standard. A pixel diff can tell you something
   moved, not whether it moved to a better place. Nothing in the repository has an opinion about whether
   the design is any good.
5. **What a person still has to do**, before this would be safe to ship to real people.

Rules:

- Every technical word gets one short definition the first time it appears, or does not appear.
- Name the actual files. `checks/report.md` is a thing they can open and read; "the validation layer" is
  not.
- No marketing language. No emoji. No exclamation marks. Short sentences.
- Say what you got wrong. Confidently describing a process that corrected you four times, without
  mentioning that it corrected you four times, is the failure mode this whole repository exists to argue
  against.
- If you cannot point at a file, a command or a line in a report for a claim, cut the claim.
- Do not describe what the system is capable of. Describe what it did, here, today.

Finish with one sentence: the smallest version of this a designer could set up on Monday for one screen
they already own.
