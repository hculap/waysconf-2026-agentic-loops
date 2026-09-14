# 03 — Build it

Now it writes the page: all of it, in one go. Then you review it, section by section, at your
own pace. The building does not need you; the reviewing does.

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

**What you should see.** A few minutes of work, then a list of sections and an address. Open
it. Put it beside the design in Figma and go down the page one section at a time. For each
thing that is wrong, say so — in plain words, the way you would to a junior designer:

> The gap under the heading is too tight, and the orange is the wrong orange.

That is a perfectly good bug report. You do not need the vocabulary. Send them one at a time
or several in one message; either works.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It stops after one section and asks | `Do not wait for me. Build the whole page, then show me.` |
| Text you have never seen before | `Where did that sentence come from? Replace it with the text in docs/copy.md.` |
| A grey box where a photo should be | `Use the image docs/images.md lists for that.` |
| A colour that is nearly right | `That is not the value in docs/colours.md. Use the exact one and tell me its name.` |
| It starts decoding the .fig again | `Stop. Everything you need is in docs and notes.md.` |
| It needs a value the documents do not have | `Find it in design-data, add it to the right document in docs, then use it.` |
| It says it is done and it clearly is not | `Which sections have you built, and which are still missing? List both.` |
| It gets slower and vaguer as it goes | It is running low on context. Say `Update notes.md with where we are`, start a fresh session, say `Read docs and notes.md and continue building`, and carry on. |

---

### Two things worth noticing while it works

**It is faster than you, and that is not the same as better.** The whole page appears in the
time it takes you to properly look at one section. Do not let the speed of the building set
the pace of the looking: take the sections one at a time, and say what is wrong before you
move to the next.

**Nothing here has checked anything yet.** The page may look finished at the end of this
prompt. It has been judged by exactly one thing so far: your eyes, on your screen, at your
window size. Prompt 04 is where that changes.
