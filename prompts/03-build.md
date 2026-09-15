# 03 — Build it

The agent builds the whole page from the documents in `docs`, in one run, and gives you the
local address.

---

```text
Build the page now, from the design. Read docs and notes.md; do not decode the .fig again.

Build the whole page in one go: every section in docs/sections.md, in that order. Do not
stop between sections to ask me. When it is done, tell me which sections you built, one line
each, and the address to open.

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
```

---

**Expected result.** A few minutes of work, then a list of the sections it built and the
address. Open the page beside the design in Figma and review it one section at a time.
Report each problem in plain words, for example:

> The gap under the heading is too tight, and the orange is the wrong orange.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It stops after one section and asks | `Do not wait for me. Build the whole page, then show me.` |
| Text you have never seen before | `Where did that sentence come from? Replace it with the text in docs/copy.md.` |
| A grey box where a photo should be | `Use the image docs/images.md lists for that.` |
| A colour that is nearly right | `That is not the value in docs/colours.md. Use the exact one and tell me its name.` |
| It starts decoding the .fig again | `Stop. Everything you need is in docs and notes.md.` |
| It needs a value the documents do not have | `Find it in design-data, add it to the right document in docs, then use it.` |
| It says it is done and it clearly is not | `Which sections have you built, and which are still missing? List both.` |
| It gets slower and vaguer | The context is full. Say `Update notes.md with where we are`, start a new session, say `Read docs and notes.md and continue building`. |

---

### Why it is written this way

- Every value comes from `docs`: a value the agent picks itself is one the checker from prompt 04 will report.
- Questions go into `notes.md`: the agent keeps building, and you correct its assumptions afterwards.
- Nothing is checked yet. The only review so far is yours.
