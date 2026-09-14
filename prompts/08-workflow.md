# 08 — The same job, as a workflow

You have just run seven prompts by hand. You were the thing between them: you read the
output, you decided it was good enough, you pasted the next one.

**Phase 01 is prompt 01, phase 07 is prompt 07, and the words are the same.** Anything you
learned from a prompt is true of its phase. Two things change because it is one run instead
of seven messages, and the prompt says both out loud.

That role is describable. **Phases, what happens in each, and what has to be true before
the next one starts** — write those down and the agent runs the sequence itself.

No script. No tool. It is a message.

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

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that your checker cannot catch, and for each one tell me:

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

In this phase, do it with subagents: one per place in the list above, looking in
parallel, and then, for every candidate they find, a separate subagent whose only job is
to argue against it from those three angles.

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

**What you should see.** `PHASE 01 — START`, and then work, unattended, for a long time.
It stops for you once, after phase 02, to hear your answer to point 6 — and otherwise only
if a rule tells it to stop and ask.

---

## The two words at the top

**`ultracode`** is a keyword Claude Code recognises: it signals that the request is large
and structural, and it is what unlocks multi-agent orchestration for the run. **Codex has
no equivalent** — no keyword, no flag. Leave the word in anyway. On Codex it is one
harmless token at the start of a long instruction, and the sentence after it does the real
work on both tools:

> spawn as many subagents as the work needs and run them in parallel, deciding how many
> from what you find

That is the instruction. The keyword is a shortcut on one tool, not the mechanism.

**Why fan out at all.** Six sections built one after another is six times the wall-clock of
six built at once, and the sections do not depend on each other. The same is true of review
lenses: a pass looking for accessibility problems and a pass looking for copy drift share
nothing, and running them in one context means each one carries the other's noise.

**Where it earns its keep is phase 07.** A single agent asked "is this page good?" will say
yes. Several agents with different lenses produce candidates, and a separate agent whose
only job is to *refute* each candidate removes the ones that do not survive. Find, then
attack, then keep what is left. That is a different shape from asking once and believing
the answer, and it is the only part of this pack where a model checks a model.

**It is also the least reliable part of the run.** More agents is more confident output,
not more correct output. The deterministic checker from phase 04 is what decides; phase 07
opens items for a person to judge.

---

## Loop and workflow are different things

People use the words interchangeably. They are not the same shape, and knowing which one
you need is most of the skill.

| Aspect | **Loop** | **Workflow** |
|---|---|---|
| Shape | Do this again until a condition holds | Do these things, in this order, with a bar between each |
| You define | the **exit condition** | the **phases** |
| Ends when | a program says yes | the last phase finishes |
| Good for | converging on correctness | work with stages that depend on each other |
| In this pack | prompt 05 | this prompt |

Phase 05 above is a loop, living inside a workflow. That is the usual arrangement: the
workflow gets you from nothing to nearly-right, and a loop inside one phase closes the
last gap.

---

## Parameterise it

The phase list is the program. Change it and you have changed the job, without writing a
line of anything:

> Phase 03 builds only the hero and the lineup. Leave the rest.

> Between phases 03 and 04, add a phase: show me each section as a screenshot at the
> narrowest width and wait for my approval.

> Skip phase 06. I am not deploying today.

> In phase 07, use six lenses instead of three, and look only at widths the design does
> not specify.

That is what "no script needed" means in practice. A script would have to be edited,
tested and re-run. This gets edited in the sentence you were about to say anyway.

---

## When to reach for this, and when not

**Use the workflow** when you know the shape of the work and want to walk away: it is
long, the stages are real, and you would rather come back to a result than babysit.

**Use the seven prompts** when you are learning, when you want to steer, or when the design
is unclear and you expect to change your mind halfway. Every stop is a chance to disagree,
and disagreeing early is cheaper than everything else in this session.

The first time you do a piece of work, do it by hand. The second time, you know what the
phases are.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It announces phase 04 before phase 03 is built | `You skipped part of phase 03. Go back and finish it before phase 04.` |
| It blows through the "wait for me" bar | `Phase 02 said wait for my answer to point 6. Stop and show me notes.md.` |
| It gets vaguer around phase 05 | `Summarise the state into notes.md.` Then start a fresh session, paste this prompt again, and say `docs and notes.md have the state. Continue from phase 05.` |
| It declares the whole thing done | `Run npm run check and paste the last five lines, unedited.` |
| A phase fails and it continues anyway | `You were told to stop on a failed phase. What failed, and why did you continue?` |
| It builds the sections one at a time | `Phase 03 is independent sections. Build them in parallel, one subagent each.` |
| Phase 07 reports five findings and all five are real | Good, and suspicious. `How many candidates did you discard, and why?` A refutation round that refutes nothing did not happen. |
| It spawns twenty subagents for a small page | `Use as many as the work needs. Tell me the number and your reason before you start.` |
