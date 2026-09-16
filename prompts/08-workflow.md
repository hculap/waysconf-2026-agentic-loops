# 08 — The same job, as a workflow

Prompts 01 to 07 pasted as one message, phase for phase, with the differences listed below.
The message is split into seven phases, numbered 01 to 07, and each phase contains the text of
the prompt with the same number: phase 03 does what prompt 03 does. The agent works through the
phases in order on its own, and stops for you only after phase 02 and wherever a rule says to
stop and ask.

## Before you paste

You need a new, empty GitHub repository cloned on your computer, and `turbine.fig`. Open a
terminal, go into the repository folder and start your agent in a new session, in normal mode,
not plan mode:

```bash
cd turbine
claude
```

With Codex, type `codex` instead of `claude`. The phases that ask for a plan write it into
`notes.md` and continue.

In Claude Code, type `/effort ultracode` first. The prompt starts with the keyword `ultracode`,
which turns on a multi-agent workflow for that one message only; `/effort ultracode` keeps it on
for the whole session, including your answer to point 6. More under `ultracode` below.

Phase 01 creates the project in this folder, and the run goes straight on to phase 02, which
reads `turbine.fig` from a folder called `design`. Create the `design` folder, put `turbine.fig`
into it, and tell the agent to leave it alone in phase 01: paste the prompt below, press
Shift+Enter for a new line, type `The design folder is already in this project. Leave it alone
in phase 01.` and press Enter.

---

```text
ultracode. I want you to do a whole job in seven phases. Each phase is one of the seven
workshop prompts, in the same order, with the same words and the same rules. Work through
them on your own and do not skip ahead.

Use a dynamic workflow: inside a phase, spawn as many subagents as the work needs and run
them in parallel, deciding how many from what you find rather than from a number I gave
you — one per section, one per review lens, one per finding, whatever the phase calls for.
Merge their results before you leave the phase.

Because this is one run rather than seven messages, these things change:
- You stop and wait for me only at the end of phase 02, for my answer to point 6, and
  wherever a rule says to stop and ask. Where a phase says to show me a plan and wait for
  my approval, write the plan into notes.md and carry on.
- Where a phase says I will clear the session, do not stop: start the next phase by reading
  notes.md and design/data again.
- In phase 04 you build the sections in parallel, one subagent each, instead of one after
  another, and you review the page against design/data yourself instead of waiting for my
  review.
- Phase 05 is not the end of the run: when npm run check exits 0, continue to phase 06.
- In phase 07 the review is done by subagents that start with a fresh context, and you fix
  the findings that survive without waiting for me to choose.

PHASE 01 — START

Set up a new website project in this folder.

First make sure this folder is a git repository that pushes to GitHub, because every step
after this one commits its work and pushes it.

1. Run gh auth status. If I am not signed in, stop and tell me.
2. Run gh repo view turbine. If a repository called turbine already exists on my account,
   make this folder a git repository whose origin remote is that repository, and pull
   whatever is already in it.
3. If there is no turbine repository, create one from this folder: git init -b main if this
   is not a git repository yet, then
   gh repo create turbine --private --source . --remote origin
4. Tell me in one line what you found and what you did.

Then set up the site itself.

Use Astro with Tailwind CSS. Static output — no React, Vue or Svelte, no server, no
database. Node is already installed.

Then start the development server and tell me the address to open in my browser.

Do not build any pages yet. Do not invent any content. The design comes next, and I want
the page to still be empty when it does.

While you work, tell me in one line what each command is doing. I have not used a terminal
before and I would like to follow along.

Then commit everything with a message that says what this step did, and push. Tell me the
step is done, so I can clear the session.

Before moving on: the development server is running and you have told me its address.

PHASE 02 — LOOK

Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Inside this project there is a folder called design with a .fig file in it. That is the
Figma file itself, as Figma saves it. It is not a picture: it is the whole
design as data — every text, colour, variable, component and photo.

Work from that one file and nothing else. Do not search this computer for the design, a
specification, reference images or anything else about this project: there is nothing else,
and whatever you find is not the design. If the file names something it does not contain,
put it under point 6 instead of going to look for it.

What I want is a tool, not a one-off decode: a script in this project that reads the .fig in
design and writes the design data that the page and the checker will need. Make
"npm run design" run it. Running it again on a new .fig must refresh the data, so that nobody
has to decode or export the design by hand again.

Keep the decoder small: one script, no test suite for the decoder, no extra tooling. Stop
working on it as soon as the seven JSON files and the images are written.

There is no program that opens a .fig, so the script decodes it itself. What is known about
the format:

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

The script may use a package; the network is available. Do not write any page code.

The script writes JSON files into design/data, and the photos into design/images:

- design/data/sections.json: every section, in the order they appear down the page, and
  what is in each one
- design/data/colours.json: every colour, by its name in the design, with its exact value
  and where it is used
- design/data/typography.json: every text style, with font, size, weight, line height and
  letter spacing, and where each one is used
- design/data/layout.json: every width the design covers, and the spacing, sizes, corner
  radii and columns at each width
- design/data/components.json: every component, with its variants and states
- design/data/copy.json: every piece of text, section by section, word for word, including
  alt text and labels that no frame shows
- design/data/images.json: every image, with its file in design/images, where it is used,
  its size and its alt text

Every value is copied exactly as the file has it: no rounding, no renaming. From now on
design/data is the design. Every later step reads it instead of the .fig, and the checker
tests the page against it. If a value turns out to be missing, the fix goes into the script,
and then npm run design runs again.

Your plan must say how the script reads the file, which package it uses if any, and the
shape of each JSON file.

After I approve the plan, write the script, run npm run design, then show me a list and
write point 6 of it into notes.md:

1. Every section, in the order they appear down the page, and the name on every artist card.
2. Every colour, by its name from the design, with its exact value.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Each file in design/data, and what is in it, one line each.
6. Anything the file disagrees with itself about, or does not tell you, and that you would
   otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the file shows a hover
state I have no values for" is more useful to me than a confident guess.

Then stop and wait for me to answer point 6.

When I have answered point 6, write my answers into notes.md. Then commit everything with a
message that says what this step did, and push. Tell me the step is done, so I can clear the
session.

Before moving on: npm run design has written design/data, notes.md exists, and I have answered point 6.

PHASE 03 — ARM

Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Now write a program that checks the page against the design, before the page exists.

It must be a program, not an opinion. It runs, it looks at the real page in a real
browser, and it exits with code 0 if everything is right and a non-zero code if anything
is wrong. It never asks a language model anything, it never asks me anything, and it
gives the same answer twice on the same page.

Make "npm run check" run it. Install whatever you need to drive a real browser and to
test accessibility. These are tools for checking; none of them goes into the page.

By default it builds the site and serves the built files itself, and checks that page. It
must not depend on a development server someone else started. It must also take an address —
npm run check -- --url https://… — and run the same checks against that page instead, so
that later it can judge the live site too.

Derive what to check from design/data, not from me. There is no page to look at yet: every
check comes from the design. At minimum it must decide, against the page as a browser
actually renders it rather than against the source:

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

Write the report to a file as well as printing it, because later I am going to hand that
file straight back to you. Tell me what you called it.

Three rules about the checker itself:

- If a check cannot run — the browser will not start, the page will not load,
  design/data is missing — that is a FAILURE, never a pass and never a silent skip. A
  check that did not happen must not look like a check that succeeded.
- An accessibility result marked incomplete, such as text over a photo or a gradient, is
  not a pass. Measure the contrast from the rendered pixels behind that text, and fail only
  if the measured ratio is below the threshold, or if it cannot be measured.
- Do not make the checks lenient so that they pass.

Your plan must list each check, what it reads from design/data, and how it measures.

There is no page yet. When the checker is written, run it now against the project as it is:
it must fail, and the report must say why. A check that passes on an empty page is not
checking anything.

Then commit everything with a message that says what this step did, and push. Tell me the
step is done, so I can clear the session.

Before moving on: npm run check runs, and it fails on the project as it is.

PHASE 04 — BUILD

Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Build the page now, from the design. Read design/data and notes.md; do not decode the .fig
again.

Your plan must list the sections in the order of design/data/sections.json, and say which
colours, text styles, layout values, copy and images each one uses.

Build every section in design/data/sections.json at the same time, one subagent per section,
then put them together in that order. Do not stop between sections to ask me. When it is done,
tell me which sections you built, one line each, and the address to open.

If you need to see the page in a browser and the development server is not running, start it
yourself and give me the address.

Rules, all of them non-negotiable:

- Every colour and every size comes from design/data. If a value you need is not there,
  check whether the script behind npm run design misses it; if it does, fix the script and
  run it again. If the design does not have it, do not choose one: it is a question for
  notes.md, below.
- Every word comes from design/data/copy.json. Do not write copy. Do not improve copy. If a
  piece of text seems to be missing, write that into notes.md; do not fill the gap.
- Every photo comes from the design: use the images design/data/images.json lists, never a
  placeholder.
- Nothing new goes into the page itself: no UI framework, no component library, no font or
  icon service. The page is made of Astro and Tailwind.
- The page must work with images that have not loaded and with JavaScript switched off.
  Anything clever is an addition on top of something that already works without it.

If the design does not tell you something, do not guess. Write the question into notes.md,
pick the reading you think is likeliest, tell me both, and carry on. I would rather correct
one assumption than discover six.

When the page is built, run npm run check once and show me how many checks fail and which.
Do not fix them yet, and do not change the checker.

Then review the page yourself: compare what the browser shows with design/data, and write
every difference into notes.md under "Design review". Do not fix anything yet. Then commit
everything with a message that says what this step did, and push.

Before moving on: every section in design/data/sections.json is built, the project builds with no errors, and notes.md has a "Design review" section.

PHASE 05 — REPAIR

Read notes.md. Then run npm run check.

The items under "Design review" in notes.md are the differences you found in phase 04.
Treat the ones that design/data supports like failures in the report and fix them too. For
each one design/data does not support, write one line into notes.md saying so, and leave it.

If npm run check exits 0 and no Design review item that design/data supports is left, commit
everything with a message that says the check passes, push, and continue to phase 06.

Otherwise, read the report the check wrote and fix what it names. Then run npm run check
again. Repeat until it exits 0 and the Design review items are done.

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
2. Do not add anything the design does not have, and do not invent text.
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

This project has no Netlify site yet. Create it and deploy in one command, without
interactive questions: netlify deploy --prod --dir=dist --site-name turbine-<my GitHub
username>. Find my username with gh api user --jq .login. If that name is taken, add a
short suffix and run it again.

When it is live, do not just tell me it worked. Check:

- fetch the public URL and confirm it returns 200
- confirm the page it serves is the page you just built, not an older one — compare what
  comes back against what is in the dist folder
- run npm run check -- --url against the live URL, and show me the result

Write the site name and the live address into notes.md. Then commit anything that changed
with a message that says what this step did, and push.

Then give me the URL on its own line so I can copy it.

Before moving on: the live URL returns 200, serves the page you built, and npm run check -- --url passes against it.

PHASE 07 — ATTACK

Whatever npm run check says right now, try to prove the page is wrong.

You did not build this page. Judge it only by what a browser shows and what is in this
project, not by anything said earlier in this conversation.

Look at the page on this machine. If the development server is not running, start it yourself
and give me the address.

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that the checker in this project cannot catch, and for each one
tell me:

- exactly which element, by what I would see on screen
- what is wrong with it
- why the checker missed it — what question does it ask that this slips past?

Look specifically where an automated check has no reach:

- text over a photograph or a gradient: an accessibility tool cannot compute that pair and
  marks it incomplete; the checker in this project may measure it from the pixels, so look
  at what it actually measured there
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

Then fix the findings that survived and run npm run check again; it must still exit 0.
Write the findings and what you fixed into notes.md, commit everything with a message that
says which findings were fixed, and push. Then deploy again to the same site with
netlify deploy --prod --dir=dist --site <the site name in notes.md>, and run
npm run check -- --url against the live address.

That is the end of the run: the findings that survived are fixed, npm run check still exits 0, the page is deployed again, and npm run check -- --url passes against the live address.

Rules for the whole run:
- Announce each phase as you enter it, and say how many subagents you are using and why.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep notes.md current as you go. If we have to start a fresh session, notes.md and
  design/data are all it will have.
```

---

**Expected result.** The agent announces `PHASE 01 — START` and works without supervision.
It stops once, after phase 02, for your answer to point 6 of its list. Along the way:
`npm run design`, `npm run check` failing on the empty project, the page and the agent's own
design review, the loop until the check passes, a commit after each of those, a live address,
and at the end the review, its fixes and a second deploy to the same site.

---

## Subagents

A subagent is a separate agent that the main agent starts for one part of the work. It
begins with an empty context: it knows only the task it was given, not the conversation so
far. The main agent collects what its subagents return.

## What differs from the seven prompts

- The run waits for you only after phase 02 and where a rule says to stop and ask.
- Plans are not shown for approval. In the seven prompts you switch to plan mode before 02, 03 and 04 and approve each plan; here each of those phases writes its plan into `notes.md` and continues.
- There is no `/clear` between phases. Each phase starts by reading `notes.md` and `design/data` again.
- Phase 04 builds the sections of the page at the same time, one subagent per section, instead of one after another.
- Phase 04 does not wait for your review of the page: the agent compares the page with `design/data` itself and writes the differences into `notes.md` under "Design review".
- Phase 05 does not end the run: when `npm run check` exits 0, the agent continues to phase 06.
- Phase 07 runs the review with subagents: one per place to look, and a separate one to argue against each finding. Each starts with an empty context, so none of them saw the page being built. The agent fixes the findings that survive without waiting for you to choose, then deploys again to the site named in `notes.md`, with `--site`.

`scripts/build-workflow-prompt.mjs` generates this prompt from prompts 01 to 07, and its
`--check` fails if they differ in anything else.

## `ultracode`

The first word of the prompt. In Claude Code, `ultracode` opts only the message it is typed in
into a multi-agent workflow, and only if your Claude subscription includes dynamic workflows.
The run stops after phase 02 for your answer to point 6, and that answer is a new message. To
keep the workflow for the whole run, type `/effort ultracode` before you paste, or start your
answer to point 6 with `ultracode.`

Codex has no such keyword. Keep the word on both tools: the sentence after it, "spawn as many
subagents as the work needs and run them in parallel", gives the same instruction to either.

## Workflow patterns in this prompt

The workshop page describes six workflow patterns. This prompt uses three:

| Phase | Pattern | What happens |
|---|---|---|
| 04 | Fan out and synthesize | the page is split into sections built at the same time, one subagent per section, then merged into one page |
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

> Phase 04 builds only the hero and the lineup. Leave the rest.

> Between phases 04 and 05, add a phase: show me each section as a screenshot at the
> narrowest width and wait for my approval.

> Skip phase 06 and deploy only once, at the end of phase 07.

> In phase 07, look only at widths the design does not specify.

## When to use it

- **The workflow**: you know the stages and want a result without supervising each step.
- **The seven prompts**: you are learning, want to approve each plan, or expect to change the design halfway.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| Phase 01 says the directory is not empty | `Leave the design folder alone and set up the project around it.` |
| It announces phase 04 before `npm run check` exists | `You skipped phase 03. The check comes first. Go back and write it.` |
| `npm run check` passes in phase 03 | `The check passed on an empty project. It is not checking anything. Fix the checker before phase 04.` |
| It does not wait after phase 02 | `Phase 02 said wait for my answer to point 6. Stop and show me notes.md.` |
| It waits for plan approval in phase 03 or 04 | `Write the plan into notes.md and carry on.` |
| It waits for your review in phase 04 | `Compare the page with design/data yourself, write the differences into notes.md under "Design review", and carry on.` |
| It stops after phase 05 and says it is finished | `Phase 05 is not the end. Continue to phase 06.` |
| It gets vaguer around phase 05 | `Summarise the state into notes.md.` Then type `/clear`, paste this prompt again, and say `notes.md and design/data have the state. Continue from phase 05.` |
| It declares the whole thing done | `Run npm run check and paste the last five lines, unedited.` |
| A phase fails and it continues anyway | `You were told to stop on a failed phase. What failed, and why did you continue?` |
| It builds the sections one at a time | `Phase 04 is independent sections. Build them in parallel, one subagent each.` |
| Phase 07 reports findings and discarded none | `How many candidates did you discard, and why?` |
| It starts twenty subagents for a small page | `Use as many as the work needs. Tell me the number and your reason before you start.` |
