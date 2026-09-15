# 08 — The same job, as a workflow

Prompts 01 to 07 pasted as one message. The message is split into seven phases, numbered 01
to 07, and each phase contains the text of the prompt with the same number: phase 03 does what
prompt 03 does. The agent works through the phases in order on its own, and stops for you only
after phase 02 and wherever a rule says to stop and ask.

---

```text
ultracode. I want you to do a whole job in seven phases. Each phase is one of the seven
workshop prompts, in the same order, with the same words and the same rules. Work through
them on your own and do not skip ahead.

Use a dynamic workflow: inside a phase, spawn as many subagents as the work needs and run
them in parallel, deciding how many from what you find rather than from a number I gave
you — one per section, one per review lens, one per finding, whatever the phase calls for.
Merge their results before you leave the phase.

Because this is one run rather than seven messages, exactly two things change:
- In phase 03 you build the sections in parallel, one subagent each, instead of one
  after another.
- You stop and wait for me only where a phase tells you to: at the end of phase 02, and
  whenever a rule says to stop and ask. Everywhere else, keep going.

PHASE 01 — START

Set up a new website project in this folder.

Use Astro with Tailwind CSS. Static output — no React, Vue or Svelte, no server, no
database. Node is already installed.

Then start the development server and tell me the address to open in my browser.

Do not build any pages yet. Do not invent any content. The design comes next, and I want
the page to still be empty when it does.

While you work, tell me in one line what each command is doing. I have not used a terminal
before and I would like to follow along.

Before moving on: the development server is running and you have told me its address.

PHASE 02 — LOOK

Inside this project there is a folder called design with a .fig file in it. That is the
Figma file itself, saved with "Save local copy". It is not a picture: it is the whole
design as data — every text, colour, variable, component and photo.

Work from that one file and nothing else. Do not search this computer for the design, a
specification, reference images or anything else about this project: there is nothing else,
and whatever you find is not the design. If the file names something it does not contain,
put it under point 6 instead of going to look for it.

There is no tool that opens it, so decode it. What is known about the format:

- A .fig is a zip. The design is in canvas.fig inside it. thumbnail.png is only a small
  preview picture: do not work from it.
- canvas.fig starts with the bytes "fig-kiwi" and a version number, then chunks, each
  prefixed with its length. The first chunk is a schema in the kiwi binary format
  (github.com/evanw/kiwi); the second is the document, encoded with that schema. Each
  chunk is compressed, with raw deflate or with zstd.
- The images folder inside the zip holds the photos, named by the hash the fills use.
- Skip anything marked isSoftDeleted, and anything that belongs to something marked so.
  It was deleted in Figma and is still in the file. A variable inside a deleted collection
  is not marked itself — skip it too.
- Text inside a component can come from component properties and overrides. If every
  card of the same kind shows the same words, you are reading the component rather than
  the instances. Resolve that before you trust any copy.

You may install a package to do this; the network is available. Keep the decoded data and
the photos in a folder called design-data inside this project. Do not write any page code
yet.

Then write the design down as documentation, in a folder called docs, so that nobody — not
me, not you, not a fresh session — has to open the .fig again. Write each document as soon
as you have read that part of the file, not all of them at the end:

- docs/sections.md: every section, in the order they appear down the page, and what is in
  each one
- docs/colours.md: every colour, by its name in the design, with its exact value and what
  it is used for
- docs/typography.md: every font and text style, with size, weight, line height and letter
  spacing, and where each one is used
- docs/layout.md: every width the design covers, and the spacing, sizes, corner radii and
  columns at each width
- docs/components.md: every component, with its variants and states
- docs/copy.md: every piece of text, section by section, word for word, including alt text
  and labels that no frame shows
- docs/images.md: every image, with its file in design-data, where it is used, its size and
  its alt text

Copy every value exactly as the file has it: no rounding, no renaming. From now on these
documents are the design, and every later step reads them instead of the .fig. When a value
turns out to be missing, the fix is to add it to the right document first.

Then show me a list, and write point 6 of it into notes.md:

1. Every section, in the order they appear down the page.
2. Every colour, by its name from the design, with its exact value.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Each document you wrote in docs, and what is in it, one line each.
6. Anything the file disagrees with itself about, or does not tell you, and that you would
   otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the file shows a hover
state I have no values for" is more useful to me than a confident guess.

Then stop and wait for me to answer point 6.

Before moving on: every document in docs is written, notes.md exists, and I have answered point 6.

PHASE 03 — BUILD

Build the page now, from the design. Read docs and notes.md; do not decode the .fig again.

Build every section in docs/sections.md at the same time, one subagent per section, then
put them together in that order. Do not stop between sections to ask me. When it is done,
tell me which sections you built, one line each, and the address to open.

Rules, all of them non-negotiable:

- Every colour and every size comes from docs. If a value you need is not there, look for it
  in design-data; if it is there, add it to the right document first, then use it. If it is
  nowhere, do not choose one: it is a question for notes.md, below.
- Every word comes from docs/copy.md. Do not write copy. Do not improve copy. If a piece of
  text seems to be missing, write that into notes.md — do not fill the gap.
- Every photo comes from the design: use the images docs/images.md lists, never a
  placeholder.
- Nothing new goes into the page itself: no UI framework, no component library, no font or
  icon service. The page is made of Astro and Tailwind.
- The page must work with images that have not loaded and with JavaScript switched off.
  Anything clever is an addition on top of something that already works without it.

If the design does not tell you something, do not guess. Write the question into notes.md,
pick the reading you think is likeliest, tell me both, and carry on. I would rather correct
one assumption than discover six.

Before moving on: every section in docs/sections.md is built, and the project builds with no errors.

PHASE 04 — ARM

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

Before moving on: npm run check runs and reports something. It will be red. Good.

PHASE 05 — REPAIR

Run npm run check.

If it exits 0, stop and tell me — we are finished.

If it does not, read the report it wrote and fix what it names. Then run npm run check again.
Repeat until it exits 0.

Each round has three steps. Plan: take the first failure in the report and write one line
into notes.md: the failure, what you think causes it, and what you will change. Implement:
make that change. Verify: run npm run check.

Work in the order the report lists things. Fix the cause, not the symptom: if a colour is
wrong, use the one from the design, do not nudge it until the number moves. Make the
smallest change that clears each failure, and leave alone anything that was already
passing.

Three rules, and the first one matters more than the other two:

1. NEVER change the checker to make a check pass. Not a threshold, not a skipped assertion,
   not a rule switched off. If you genuinely believe a check is wrong, STOP, tell me which
   one and why, and change nothing.
2. Do not add anything new to the page, and do not invent text.
3. If the same failure survives three attempts, stop and tell me what you tried each time
   and what happened. Three failed repairs usually means the design is asking for two
   things that cannot both be true, and no fourth attempt will resolve that.

Write what you tried and what happened into notes.md as you go, so that a fresh session
could pick this up. Keep going on your own. Do not ask me to confirm each round.

Before moving on: npm run check exits 0.

PHASE 06 — SHIP

Put this on the internet.

Build the site, then deploy it to Netlify with the Netlify command line. It is installed and
I am signed in; if it says I am not, tell me what to do rather than doing it silently.

When it is live, do not just tell me it worked. Check:

- fetch the public URL and confirm it returns 200
- confirm the page it serves is the page you just built, not an older one — compare what
  comes back against what is in the dist folder
- run npm run check -- --url against the live URL, and show me the result

Then give me the URL on its own line so I can copy it.

Before moving on: the live URL returns 200, serves the page you built, and npm run check -- --url passes against it.

PHASE 07 — ATTACK

The checks pass. Now try to prove the page is still wrong.

You did not build this page. Judge it only by what a browser shows and what is in this
project, not by anything said earlier in this conversation.

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that the checker in this project cannot catch, and for each one
tell me:

- exactly which element, by what I would see on screen
- what is wrong with it
- why the checker missed it — what question does it ask that this slips past?

Look specifically where an automated check has no reach:

- text over a photograph or a gradient: an automated contrast check cannot compute that
  pair at all, and reports it as inconclusive rather than as a failure
- reading order for someone using a keyboard or a screen reader: technically valid and
  incoherent is a thing that exists
- alt text that is present, and useless
- a heading structure that looks like a hierarchy and is not one
- copy that passes every rule and still does not sound like the brand
- what happens at a width between the ones the design specifies — one nobody screenshotted
- anything that only breaks on the second visit, or with a slow connection

Before you tell me any of them, argue against each one yourself, from three angles:

  is it true      - go and look again, do not trust your first reading
  does it matter  - would a visitor notice, or only a checklist?
  is it handled   - is it already covered somewhere I have not looked?

In this phase, do it with subagents, each starting with a fresh context that has not seen
the page being built: one per place in the list above, looking in parallel, and then, for
every candidate they find, a separate subagent whose only job is to argue against it from
those three angles.

Report only the findings that survive all three. Default to discarding when you are
unsure, and tell me how many you threw away. Four real findings beat five with a guess in
them. If you cannot point at a specific element, it is not a finding.

Do not fix anything yet. I want to decide which of these are real first.

That is the end of the run.

Rules for the whole run:
- Announce each phase as you enter it, and say how many subagents you are using and why.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep docs and notes.md current as you go. If we have to start a fresh session, they are
  all it will have.
```

---

**Expected result.** The agent announces `PHASE 01 — START` and works without supervision.
It stops once, after phase 02, for your answer to point 6 of its list. At the end: a live
address and the findings from phase 07.

---

## Subagents

A subagent is a separate agent that the main agent starts for one part of the work. It
begins with an empty context: it knows only the task it was given, not the conversation so
far. The main agent collects what its subagents return.

## What differs from the seven prompts

- Phase 03 builds the sections of the page at the same time, one subagent per section, instead of one after another.
- Phase 07 runs the review with subagents: one per place to look, and a separate one to argue against each finding. Because each starts with an empty context, none of them saw the page being built.
- The run waits for you only after phase 02 and where a rule says to stop and ask.

`scripts/build-workflow-prompt.mjs` generates this prompt from prompts 01 to 07, and its
`--check` fails if they differ in anything else.

## `ultracode`

The first word of the prompt. Claude Code treats it as a signal that the task is large and
may use subagents. Codex has no such keyword. Keep the word on both tools: the sentence after
it, "spawn as many subagents as the work needs and run them in parallel", gives the same
instruction to either.

## Workflow patterns in this prompt

The workshop page describes six workflow patterns. This prompt uses three:

| Phase | Pattern | What happens |
|---|---|---|
| 03 | Fan out and synthesize | the work is split into parts done at the same time, one subagent per section, then merged into one page |
| 05 | Loop until done | plan, implement, verify, repeated until `npm run check` exits 0 |
| 07 | Adversarial verification | subagents with an empty context look for problems, separate subagents argue against each one |

The review in phase 07 runs alongside `npm run check`. The checker decides what can be
measured; the review looks for what cannot.

## Loop and workflow

| | **Loop** | **Workflow** |
|---|---|---|
| Shape | do this again until a condition holds | do these steps in order, with a condition between each |
| You define | the **exit condition** | the **phases** |
| Ends when | a program says yes | the last phase finishes |
| In this pack | prompt 05 | this prompt |

Phase 05 is a loop inside the workflow.

## Parameterise it

Change the phase list and you change the job:

> Phase 03 builds only the hero and the lineup. Leave the rest.

> Between phases 03 and 04, add a phase: show me each section as a screenshot at the
> narrowest width and wait for my approval.

> Skip phase 06. I am not deploying today.

> In phase 07, look only at widths the design does not specify.

## When to use it

- **The workflow**: you know the stages and want a result without supervising each step.
- **The seven prompts**: you are learning, want to steer, or expect to change the design halfway.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It announces phase 04 before phase 03 is built | `You skipped part of phase 03. Go back and finish it before phase 04.` |
| It does not wait after phase 02 | `Phase 02 said wait for my answer to point 6. Stop and show me notes.md.` |
| It gets vaguer around phase 05 | `Summarise the state into notes.md.` Then start a new session, paste this prompt again, and say `docs and notes.md have the state. Continue from phase 05.` |
| It declares the whole thing done | `Run npm run check and paste the last five lines, unedited.` |
| A phase fails and it continues anyway | `You were told to stop on a failed phase. What failed, and why did you continue?` |
| It builds the sections one at a time | `Phase 03 is independent sections. Build them in parallel, one subagent each.` |
| Phase 07 reports findings and discarded none | `How many candidates did you discard, and why?` |
| It starts twenty subagents for a small page | `Use as many as the work needs. Tell me the number and your reason before you start.` |
