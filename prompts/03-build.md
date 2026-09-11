# 03 — Build it

Now it writes the page. Section by section, stopping after each one, so that you are
looking at a design review rather than a wall of output.

---

```text
Build the page now, from the design you just read.

One section at a time, in the order they appear down the page. After each section: reload
the page, tell me what you built in one sentence, and then STOP and wait for me to say
"next". Do not build two sections in one go, however small they look.

Rules, all of them non-negotiable:

- Every colour and every size comes from the design. If you find yourself choosing a
  value, stop and ask me instead.
- Every word comes from the content I gave you. Do not write copy. Do not improve copy.
  If a piece of text seems to be missing, ask — do not fill the gap.
- No new packages. Astro and Tailwind are what we have.
- The page must work with images that have not loaded and with JavaScript switched off.
  Anything clever is an addition on top of something that already works without it.

If the design does not tell you something, do not guess. Write the question down, pick the
reading you think is likeliest, tell me both, and carry on. I would rather correct one
assumption than discover six.
```

---

**What you should see.** One section. Then silence, and a question. Look at the page in
your browser. Compare it to the design on your other screen. Then say `next`, or say what
is wrong — in plain words, the way you would to a junior designer:

> The gap under the heading is too tight, and the orange is the wrong orange.

That is a perfectly good bug report. You do not need the vocabulary.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It builds the whole page in one burst | `Stop. Keep what you have. From now on, one section then wait for me.` |
| Text you have never seen before | `Where did that sentence come from? Replace it with the text from the content I gave you.` |
| A colour that is nearly right | `That is not the value in the design. Use the exact one and tell me which token it is.` |
| It says it is done and it clearly is not | `Which sections have you built, and which are still missing? List both.` |
| It gets slower and vaguer as it goes | It is running low on context. Say `Summarise where we are in three lines`, start a fresh session, paste the summary, and carry on. |

---

### Two things worth noticing while it works

**It is faster than you, and that is not the same as better.** Six sections will appear in
the time it takes you to properly look at one. The pause after each section exists so that
the reviewing keeps pace with the building. Use it.

**Nothing here has checked anything yet.** The page may look finished at the end of this
prompt. It has been judged by exactly one thing so far: your eyes, on your screen, at your
window size. Prompt 04 is where that changes.
