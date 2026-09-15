# 04 — Build it

The agent plans the page, builds all of it from `design/data` in one run, then runs the checker
from prompt 03 once and shows what still fails.

## Before you paste

Switch to plan mode, as before prompts 02 and 03. Claude Code: `Shift+Tab` until the footer
shows *plan mode on*. Codex: `/plan`.

---

```text
Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Build the page now, from the design. Read design/data and notes.md; do not decode the .fig
again.

Your plan must list the sections in the order of design/data/sections.json, and say which
colours, text styles, layout values, copy and images each one uses.

Build the whole page in one go: every section in design/data/sections.json, in that order. Do
not stop between sections to ask me. When it is done, tell me which sections you built, one
line each, and the address to open.

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

Then commit everything with a message that says what this step did, and push. Tell me the
step is done, so I can clear the session.
```

---

**Expected result.** First, a plan: the sections in order and what each uses from
`design/data`. Approve it or correct it. Then a few minutes of work, the list of sections it
built and the address. Then one run of `npm run check`: fewer failures than after prompt 03,
usually not zero. Then a commit, pushed.

Open the page beside the design in Figma and review it one section at a time. Report each
problem in plain words, for example:

> The gap under the heading is too tight, and the orange is the wrong orange.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It writes code before showing a plan | `Stop. Show me the plan first and wait for my approval.` |
| It stops after one section and asks | `Do not wait for me. Build the whole page, then show me.` |
| It starts fixing the failures | `Stop. Run the check once and show me the result. Fixing is the next step.` |
| It changes the checker | `Put the checker back exactly as it was. The page changes, the checker does not.` |
| Text you have never seen before | `Where did that sentence come from? Replace it with the text in design/data/copy.json.` |
| A grey box where a photo should be | `Use the image design/data/images.json lists for that.` |
| A colour that is nearly right | `That is not the value in design/data/colours.json. Use the exact one and tell me its name.` |
| It starts decoding the .fig again | `Stop. Everything you need is in design/data and notes.md.` |
| It says it is done and it clearly is not | `Which sections have you built, and which are still missing? List both.` |
| It gets slower and vaguer | The context is full. Say `Update notes.md with where we are`, type `/clear`, then say `Read design/data and notes.md and continue building`. |

---

### Why it is written this way

- Every value comes from `design/data`: a value the agent picks itself is one the checker reports.
- The check runs once and nothing is fixed: fixing is prompt 05, in a new session, in a loop.
- Questions go into `notes.md`: the agent keeps building, and you correct its assumptions afterwards.
