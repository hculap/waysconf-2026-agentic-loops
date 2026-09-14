# 03 — Build it

Now it writes the page. Section by section, stopping after each one, so that you are
looking at a design review rather than a wall of output.

---

```text
Build the page now, from the design. Read design-data and notes.md; do not decode the .fig
again.

One section at a time, in the order in notes.md. After each section, tell me in one
sentence what you built, and then STOP and wait for me to say "next". Do not build two
sections in one go, however small they look.

Rules, all of them non-negotiable:

- Every colour and every size comes from the design. If you find yourself choosing a
  value, stop and ask me instead.
- Every word comes from the design. Do not write copy. Do not improve copy. If a piece of
  text seems to be missing, ask — do not fill the gap.
- Every photo comes from the design: use the images you decoded, never a placeholder.
- Nothing new goes into the page itself: no UI framework, no component library, no font or
  icon service. The page is made of Astro and Tailwind.
- The page must work with images that have not loaded and with JavaScript switched off.
  Anything clever is an addition on top of something that already works without it.

If the design does not tell you something, do not guess. Write the question into notes.md,
pick the reading you think is likeliest, tell me both, and carry on. I would rather correct
one assumption than discover six.
```

---

**What you should see.** One section. Then silence, and a question. Reload the page in
your browser. Compare it to the design in Figma. Then say `next`, or say what is wrong —
in plain words, the way you would to a junior designer:

> The gap under the heading is too tight, and the orange is the wrong orange.

That is a perfectly good bug report. You do not need the vocabulary.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It builds the whole page in one burst | `Stop. Keep what you have. From now on, one section then wait for me.` |
| Text you have never seen before | `Where did that sentence come from? Replace it with the text from the design.` |
| A grey box where a photo should be | `Use the image from the design for that. It is in design-data.` |
| A colour that is nearly right | `That is not the value in the design. Use the exact one and tell me which variable it is.` |
| It starts decoding the .fig again | `Stop. Everything you need is in design-data and notes.md already.` |
| It says it is done and it clearly is not | `Which sections have you built, and which are still missing? List both.` |
| It gets slower and vaguer as it goes | It is running low on context. Say `Update notes.md with where we are`, start a fresh session, say `Read notes.md and continue building`, and carry on. |

---

### Two things worth noticing while it works

**It is faster than you, and that is not the same as better.** Six sections will appear in
the time it takes you to properly look at one. The pause after each section exists so that
the reviewing keeps pace with the building. Use it.

**Nothing here has checked anything yet.** The page may look finished at the end of this
prompt. It has been judged by exactly one thing so far: your eyes, on your screen, at your
window size. Prompt 04 is where that changes.
