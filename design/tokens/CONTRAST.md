# TURBINE — computed contrast matrix

Every number on this page was computed from the hex values in
[`tokens.json`](./tokens.json), which are the colours fixed by
[`docs/CANON.md` section 4](../../docs/CANON.md). Nothing here is estimated.
The appendix reproduces the three ratios CANON quotes;
[`checks/lib/contrast.ts`](../../checks/lib/contrast.ts) is the same formula in
the form the gates use, and runs over any pair on this page.

Target, per CANON section 9: **WCAG 2.2 AA** — 4.5:1 for normal text, 3:1 for
large text and for non-text boundaries.

---

## 1. Method

WCAG 2.x relative luminance, sRGB:

```
c_srgb = c8 / 255
c_lin  = c_srgb / 12.92                      if c_srgb <= 0.03928
         ((c_srgb + 0.055) / 1.055) ** 2.4   otherwise

L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
```

Contrast ratio between two colours:

```
(L_lighter + 0.05) / (L_darker + 0.05)
```

Two implementations of this formula live in the repository — the Python in the
appendix, and the TypeScript in `checks/lib/contrast.ts` that the tokens gate
(AC-29) and the a11y gate (AC-17) share — and their unrounded outputs agree on
all 40 text pairings and all 24 non-text pairings.

**Rounding.** Ratios are displayed to two decimal places, rounded half-up, the
same convention the WebAIM contrast checker uses. Every PASS/FAIL verdict is
computed from the unrounded value, never from the displayed one. No ratio in
this palette falls within 0.005 of a threshold, so the two can never disagree.

**Verdicts.**

| Label | Meaning |
|---|---|
| `PASS-AA` | ≥ 4.5:1 — usable for normal body text and for anything else |
| `PASS-AA-LARGE` | ≥ 3:1 and < 4.5:1 — large text only (≥ 24px, or ≥ 18.66px bold) and non-text boundaries |
| `FAIL` | < 3:1 — not usable for text at any size |

`PASS-AA-LARGE` is not a pass. It is a narrow exemption for headline-sized
type. Treat it as a failure anywhere a paragraph might end up.

---

## 2. Relative luminance of every colour

| Token | Hex | Relative luminance |
|---|---|---|
| `color.bg.base` | `#0A0B0D` | 0.00332933 |
| `color.bg.surface` | `#131519` | 0.00744965 |
| `color.bg.raised` | `#1C1F25` | 0.01360421 |
| `color.border.subtle` | `#2A2E36` | 0.02712573 |
| `color.border.strong` | `#3D434E` | 0.05556468 |
| `color.text.primary` | `#F2F4F7` | 0.90294013 |
| `color.text.secondary` | `#A7AEBB` | 0.42075450 |
| `color.text.muted` | `#6B7280` | 0.16718940 |
| `color.accent.sodium` | `#FF6A1A` | 0.31642650 |
| `color.accent.coolant` | `#2FE6D6` | 0.62053006 |
| `color.accent.arc` | `#7C5CFF` | 0.19159378 |
| `color.state.danger` | `#FF4D4D` | 0.27103576 |
| `color.state.success` | `#3DDC84` | 0.53844442 |
| *(white, not a token)* | `#FFFFFF` | 1.00000000 |

---

## 3. Text contrast matrix

Rows are ink. Columns are the surface the ink sits on. Scope: the three
background tokens plus every accent and state colour. Four of those five are
used as filled backgrounds — buttons, badges, the sold-out pill, the ticker.
`state.success` is measured for completeness: CANON section 4 defines it, and
nothing in the design currently fills with it. Two inks are included that are
not swatches — `text.on-accent`, the alias of `bg.base` that CANON requires on
every accent and state fill, and plain white, which is what a model reaches for
instead.

| ink \ surface | `bg.base`<br>`#0A0B0D` | `bg.surface`<br>`#131519` | `bg.raised`<br>`#1C1F25` | `accent.sodium`<br>`#FF6A1A` | `accent.coolant`<br>`#2FE6D6` | `accent.arc`<br>`#7C5CFF` | `state.danger`<br>`#FF4D4D` | `state.success`<br>`#3DDC84` |
|---|---|---|---|---|---|---|---|---|
| `text.primary` `#F2F4F7` | **17.87** PASS-AA | **16.59** PASS-AA | **14.98** PASS-AA | **2.60** FAIL | **1.42** FAIL | **3.94** PASS-AA-LARGE | **2.97** FAIL | **1.62** FAIL |
| `text.secondary` `#A7AEBB` | **8.83** PASS-AA | **8.19** PASS-AA | **7.40** PASS-AA | **1.28** FAIL | **1.42** FAIL | **1.95** FAIL | **1.47** FAIL | **1.25** FAIL |
| `text.muted` `#6B7280` | **4.07** PASS-AA-LARGE | **3.78** PASS-AA-LARGE | **3.41** PASS-AA-LARGE | **1.69** FAIL | **3.09** PASS-AA-LARGE | **1.11** FAIL | **1.48** FAIL | **2.71** FAIL |
| `text.on-accent` = `{color.bg.base}` `#0A0B0D` | **1.00** FAIL | **1.08** FAIL | **1.19** FAIL | **6.87** PASS-AA | **12.57** PASS-AA | **4.53** PASS-AA | **6.02** PASS-AA | **11.03** PASS-AA |
| white `#FFFFFF` | **19.69** PASS-AA | **18.28** PASS-AA | **16.51** PASS-AA | **2.87** FAIL | **1.57** FAIL | **4.35** PASS-AA-LARGE | **3.27** PASS-AA-LARGE | **1.78** FAIL |

Read the bottom two rows together and the rule for this palette falls out:
**light ink on dark surfaces, dark ink on coloured fills.** Every mixed case
either fails outright or survives only at headline size.

### The four pairings CANON fixes for body text

| Pairing | Ratio | Verdict |
|---|---|---|
| `text.primary` on `bg.base` | 17.87:1 | PASS-AA |
| `text.primary` on `bg.surface` | 16.59:1 | PASS-AA |
| `text.secondary` on `bg.base` | 8.83:1 | PASS-AA |
| `bg.base` on `accent.sodium` | 6.87:1 | PASS-AA |

All four confirmed with margin. There is no reason to leave this set.

CANON words the fourth as `bg.base` on `accent.sodium`. The token file gives
that ink its own name, `color.text.on-accent`, aliased to `bg.base` for exactly
this use. Same colour, and the alias is the one to write: `var(--color-text-on-accent)`
says why the value was chosen, `var(--color-bg-base)` does not.

---

## 4. Non-text contrast: UI boundaries and focus indicators

WCAG 2.2 SC 1.4.11 requires 3:1 for the visual boundary of a control and for
the part of a focus indicator that makes it visible. Same maths, different
threshold.

| Colour | on `bg.base` | on `bg.surface` | on `bg.raised` |
|---|---|---|---|
| `border.subtle` `#2A2E36` | **1.45** FAIL | **1.34** FAIL | **1.21** FAIL |
| `border.strong` `#3D434E` | **1.98** FAIL | **1.84** FAIL | **1.66** FAIL |
| `accent.sodium` `#FF6A1A` | **6.87** PASS | **6.38** PASS | **5.76** PASS |
| `accent.coolant` `#2FE6D6` | **12.57** PASS | **11.67** PASS | **10.54** PASS |
| `accent.arc` `#7C5CFF` | **4.53** PASS | **4.21** PASS | **3.80** PASS |
| `state.danger` `#FF4D4D` | **6.02** PASS | **5.59** PASS | **5.05** PASS |
| `state.success` `#3DDC84` | **11.03** PASS | **10.24** PASS | **9.25** PASS |
| `text.primary` `#F2F4F7` | **17.87** PASS | **16.59** PASS | **14.98** PASS |

**Both border tokens fail the 3:1 bar on every surface.** That is fine for what
CANON gives them — hairlines and dividers are decoration, and decoration is
exempt. It is not fine for the thing CANON section 4 calls `border.strong`:
*focus ring base*. At 1.98:1 on `bg.base` a ring drawn only in `border.strong`
is invisible to the standard and close to invisible in a bright room, and it
would breach CANON section 9, which requires every focus indicator to reach
3:1 against its background.

Those two statements are not in conflict. `border.strong` is the **base** of
the ring — the dark offset that separates it from the content underneath. The
visible stroke has to be a colour that passes. Use `accent.coolant`: 12.57:1 on
`bg.base` and 11.67:1 on `bg.surface`, the widest margin in the palette, and it
is already the interaction colour for links and the active tab.

```css
:focus-visible {
  outline: 2px solid var(--color-accent-coolant); /* 12.57:1 on bg.base */
  outline-offset: 2px;
}
```

No `border-radius` in that rule. An outline already follows the corner radius
the element has, so a `border-radius` declaration here would not round the ring
— it would overwrite the element's own geometry for as long as it is focused,
snapping the pill-shaped day filters and ticket badges to whatever value was
declared the moment somebody tabs onto them. AC-16 would not catch it either:
the deformation is itself a pixel change, so it satisfies the 0.5% difference
AC-16 asks for, on an element that might have no visible ring at all.

---

## 5. The deliberate traps

CANON section 8 names two. Measuring the whole matrix turns up three more. All
five are real; none is staged.

### Trap 1 — `text.muted` on `bg.base` — CANON section 8

**Measured: 4.07:1.** CANON describes this as "roughly 4.1:1"; the exact value
is 4.07260731, which rounds to 4.07. Confirmed.

- Normal body text needs 4.5:1. **Fails, by 0.43.**
- Large text needs 3:1. Passes.

The nuance matters on stage. `text.muted` is not a catastrophe. It is a near
miss, which is why it survives review by eye, and why a model asked for "a
muted grey for supporting copy" picks it almost every time. axe
will flag it only where the computed font size is below the large-text
threshold, so the report comes back with a handful of specific nodes rather
than a wall of red. The fix is one token: move to `text.secondary`, which is
8.83:1 on the same background.

It is worse on the lighter surfaces, not better: 3.78:1 on `bg.surface` and
3.41:1 on `bg.raised`. Card copy is the most likely place for it to appear and
the least forgiving.

That leaves CANON's own permitted use — legal and footer text — as the one case
this document has to settle rather than observe, because two blocking criteria
pull against each other. `Legal/Fine` is Inter 400 at 12px (FIGMA-SPEC §3), so
muted legal copy measures 4.07:1 on `bg.base` and 3.78:1 on `bg.surface`:
normal text by axe's reckoning, and a real `color-contrast` violation. AC-15
requires zero axe violations and is blocking. AC-28 *permits* `text.muted`
inside `[data-legal]`; it does not require it.

**The decision: the built page renders `text.muted` nowhere.** The footer legal
line and the CANON §1 fiction disclaimer are set in `text.secondary` — 8.83:1
on `bg.base`, 8.19:1 on `bg.surface`. AC-28 is then satisfied because no
element carries the token, AC-15 stays green, and CANON section 9's 4.5:1 body
bar is met. That is the only reading that satisfies all three, because WCAG
offers no exemption for small legal type and inventing one here would teach the
opposite of what this repository is for. The token stays in the palette: it is
the colour a model reaches for, and reaching for it has to fail.

### Trap 2 — white on `accent.sodium` — CANON section 8

**Measured: 2.87:1.** CANON describes this as "about 2.9:1"; the exact value is
2.86551331, which rounds to 2.87. Confirmed.

- **Fails at every size.** It does not even clear the 3:1 large-text bar, and
  it misses the 3:1 non-text bar too, so a white icon on a sodium button is
  also a failure.
- The canonical pairing, `text.on-accent` on `accent.sodium`, measures
  **6.87:1** and passes comfortably. `text.on-accent` is the alias of `bg.base`;
  it is the name to write on the button, because it records the reason.

White text on a saturated orange button is the single most common thing a model
gets wrong in this palette, because white-on-brand-colour is the default shape
of a CTA almost everywhere else. Orange is the trap: it is bright enough that
white looks plausible and measures terribly.

### Trap 3 — anything light on `accent.arc`

Badges and the marquee use `accent.arc` `#7C5CFF`. It is the darkest of the
three accents, so light ink nearly works and does not:

- `text.primary` on `accent.arc`: **3.94:1** — large text only.
- white on `accent.arc`: **4.35:1** — still short of 4.5:1. Missing by 0.15.
- `bg.base` on `accent.arc`: **4.53:1** — passes by 0.03.

The passing option has almost no margin. Darken `accent.arc` by a couple of
percent in Figma and the dark-ink pairing drops below 4.5:1 as well. Badge text
is small by nature, so treat `accent.arc` as a fill that only takes `bg.base`
ink, and re-run this matrix if the swatch ever moves.

### Trap 4 — white on `state.danger`

The sold-out pill on the Full Pass + Workshop card is where this lands.

- white on `state.danger`: **3.27:1** — large text only, fails for a pill label.
- `bg.base` on `state.danger`: **6.02:1** — passes.

### Trap 5 — `text.muted` on `accent.coolant`

**3.09:1.** Large text only, and it is the one combination in the whole matrix
where two mid-tone colours land just above the 3:1 line by accident. It should
never be built; it is listed because a token-swapping agent can produce it
without anyone choosing it.

### Which of the five a gate can actually catch

Two of them. AC-28 collects every element whose computed `color` is the muted
token, and AC-29 finds every element whose background resolves to `#FF6A1A`.
Traps 3, 4 and 5 have no criterion of their own, and axe will not close the gap:
white on `accent.arc` (4.35:1) and white on `state.danger` (3.27:1) both land in
the large-text band, which is where the warning in section 1 bites — a badge
built white-on-arc at 24px ships green. Those three are caught by review, not by
the loop. Closing that gap means widening AC-29 in `brief/ACCEPTANCE.md` from
one hex to every accent and state fill, which is a change to the verifier, and
therefore a decision for a person.

---

## 6. What the validation step should assert

This section prescribes. It is not a report on what the verifier does today, so
each item names the criterion in `brief/ACCEPTANCE.md` that implements it, or
says plainly that nothing does. Read the two files side by side and they should
diff cleanly by criterion id.

1. No text node combines a foreground and background from the FAIL cells in
   section 3. **No criterion enumerates these cells.** AC-15 runs axe, which
   catches a FAIL pairing wherever the computed font size puts it below axe's
   own threshold, and AC-26 checks that every painted colour is in the palette —
   between them they cover most of it, but a FAIL cell used at headline size is
   caught by neither.
2. `text.muted` appears nowhere on the page. **AC-28 (TOKENS)**, which collects
   every element whose computed `color` is the muted token and checks ancestry
   against `[data-legal]`. Ancestry only: there is no font-size condition in it,
   and under Trap 1's decision no element carries the token at all.
3. No white (`#FFFFFF`, `#FFF`, `white`, `rgb(255 255 255)`) on any accent or
   state fill. **AC-29 (TOKENS) covers `accent.sodium` only** — it finds
   elements whose background resolves to `#FF6A1A`. White on `accent.arc` and on
   `state.danger` is caught, if at all, by AC-15's generic axe contrast rule,
   which passes both at large sizes.
4. Every `:focus-visible` indicator reaches 3:1 against the surface behind it.
   **AC-17 (A11Y)**, which reads the ring colour and the adjacent background and
   computes the ratio. `border.strong` alone does not clear it.

And one instruction that is not an assertion, because no program makes it:
re-run this document whenever a colour changes in Figma. The numbers are quoted
in the deck, and a stale matrix is worse than none.

---

## Appendix — reproduce these numbers

```python
from decimal import Decimal, ROUND_HALF_UP

def srgb_to_lin(c8):
    c = c8 / 255
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

def luminance(hexstr):
    h = hexstr.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return 0.2126 * srgb_to_lin(r) + 0.7152 * srgb_to_lin(g) + 0.0722 * srgb_to_lin(b)

def ratio(fg, bg):
    a, b = luminance(fg), luminance(bg)
    return (max(a, b) + 0.05) / (min(a, b) + 0.05)

def show(r):
    # Half-up, per section 1. Python's built-in round() is half-to-even and would
    # disagree with the printed figures on a value ending in exactly 5.
    return Decimal(r).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def verdict(r):
    return "PASS-AA" if r >= 4.5 else "PASS-AA-LARGE" if r >= 3.0 else "FAIL"

for fg, bg in [("#6B7280", "#0A0B0D"), ("#FFFFFF", "#FF6A1A"), ("#0A0B0D", "#FF6A1A")]:
    print(fg, "on", bg, show(ratio(fg, bg)), verdict(ratio(fg, bg)))

# #6B7280 on #0A0B0D 4.07 PASS-AA-LARGE   -> fails as body copy
# #FFFFFF on #FF6A1A 2.87 FAIL
# #0A0B0D on #FF6A1A 6.87 PASS-AA
```

Those are the three ratios CANON quotes. Sections 2, 3 and 4 are the same three
functions over every pair in the palette; `checks/lib/contrast.ts` computes them
the way the gates do, and agrees with this script to floating-point noise across
all fourteen luminances and all sixty-four pairings.

Computed 2026-09-11 against `design/tokens/tokens.json`.
