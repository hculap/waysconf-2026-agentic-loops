# Does the gate on the participant site actually catch anything?

`checks/guideline.mjs` measures the two pages a participant opens — `guideline/index.html`
(**Before**) and `guideline/workshop/index.html` (**During**) — at 390 and 1440. It is
separate from `npm run check`, which measures the reference festival site.

A gate nobody has watched fail is a gate nobody should trust, so it was broken on purpose,
five different ways, one at a time, each in a throwaway copy of the site.

```bash
npm run check:guideline              # the real pages
bash checks/guideline-negative-test.sh   # five deliberate breakages
```

## The clean run

```
  / @ 390            0 violations · 0 incomplete (0 measured)  · 17 rules passed · 1 image
  / @ 1440           0 violations · 0 incomplete (0 measured)  · 17 rules passed · 1 image
  /workshop/ @ 390   0 violations · 1 incomplete (38 measured) · 22 rules passed · 7 images
  /workshop/ @ 1440  0 violations · 0 incomplete (0 measured)  · 21 rules passed · 7 images

PASS — both tabs, both widths, every incomplete measured
```

**The one incomplete is the point of the whole gate.** At 390 the comparison tables scroll
sideways inside their container, and axe cannot compute a background for the cells the
container clips: `Element's background color could not be determined because it's partially
obscured by another element`. That is `incomplete`, not a violation — which in a
zero-violations gate is indistinguishable from a pass, and is exactly how five pieces of
hero text sat below the legal minimum on the reference site for a day (INCIDENTS #13,
AC-61).

So the gate measures every incomplete contrast node itself, from the painted pixels: scroll
the element fully into its container, photograph it, take the dominant colour as background
and the colour furthest from it as ink. All 38 nodes measure **8.83:1** against
`rgb(10,11,13)` — far above the 4.5:1 minimum. An incomplete that could *not* be measured
would be a failure like any other.

## The five breakages

| Broken on purpose | Caught | What the gate said |
|---|---|---|
| Body text set to `#2a2d33` | yes | `axe color-contrast — 154 nodes`, first at `.lede` |
| Every `alt` attribute stripped | yes | `axe image-alt — Images must have alternative text` |
| One diagram file deleted | yes | `image never decoded (error)` **and** `request failed — 404` |
| `min-width: 1200px` on the wrapper | yes | `the page scrolls sideways by 810px` |
| The During page emptied to `<body></body>` | yes | `nothing to measure — 0 body children, 0 focusable, 0 characters` |

Two of those deserve a note.

**The empty page.** axe reports zero violations on `<body></body>` and always will; a
measurement of nothing looks exactly like a measurement of perfection. The presence guard
runs before axe does, and it checks three things rather than one, because a page can have
children and no text.

**The deleted diagram** was caught twice, by two independent signals — the decode failure
and the 404. That redundancy is deliberate: a lazy image below the fold that is simply never
requested produces neither, which is why the gate scrolls the whole page first and then
waits on every image against a 15-second deadline. A wait without a deadline is how this
project hung three times — six minutes, seven minutes and an hour (INCIDENTS #3, #6, #10).

## What this does not show

The negative test proves the gate notices five specific kinds of damage. It says nothing
about the kinds nobody thought to break — and the first version of the test script itself
appended CSS to a stylesheet the pages do not load, so every failure it reported was a fact
about the test rather than about the gate. Both "MISSED" lines it printed were wrong.

That is worth keeping in writing, because it is the same error one level up: **a check that
does not actually reach the thing it claims to measure reports confidently either way.**
