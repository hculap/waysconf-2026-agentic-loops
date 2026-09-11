# TURBINE — computed contrast matrix

Every number on this page was computed from the hex values in
[`tokens.json`](./tokens.json), which are the colours fixed by
[`docs/CANON.md` section 4](../../docs/CANON.md). Nothing here is estimated.
The reproduction script is in the appendix; run it and you should get these
figures to the last decimal.

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

Two independent implementations were written, one in Python and one in
JavaScript, and their unrounded outputs agree on all 40 text pairings and all
24 non-text pairings.

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
background tokens plus every accent and state colour, because on this site all
five of those are used as filled backgrounds — buttons, badges, the sold-out
pill, the ticker. Two inks that are not text tokens are included because CANON
requires one of them and models reach for the other: `bg.base` used as dark ink
on a fill, and plain white.

| ink \ surface | `bg.base`<br>`#0A0B0D` | `bg.surface`<br>`#131519` | `bg.raised`<br>`#1C1F25` | `accent.sodium`<br>`#FF6A1A` | `accent.coolant`<br>`#2FE6D6` | `accent.arc`<br>`#7C5CFF` | `state.danger`<br>`#FF4D4D` | `state.success`<br>`#3DDC84` |
|---|---|---|---|---|---|---|---|---|
| `text.primary` `#F2F4F7` | **17.87** PASS-AA | **16.59** PASS-AA | **14.98** PASS-AA | **2.60** FAIL | **1.42** FAIL | **3.94** PASS-AA-LARGE | **2.97** FAIL | **1.62** FAIL |
| `text.secondary` `#A7AEBB` | **8.83** PASS-AA | **8.19** PASS-AA | **7.40** PASS-AA | **1.28** FAIL | **1.42** FAIL | **1.95** FAIL | **1.47** FAIL | **1.25** FAIL |
| `text.muted` `#6B7280` | **4.07** PASS-AA-LARGE | **3.78** PASS-AA-LARGE | **3.41** PASS-AA-LARGE | **1.69** FAIL | **3.09** PASS-AA-LARGE | **1.11** FAIL | **1.48** FAIL | **2.71** FAIL |
| `bg.base` as ink `#0A0B0D` | **1.00** FAIL | **1.08** FAIL | **1.19** FAIL | **6.87** PASS-AA | **12.57** PASS-AA | **4.53** PASS-AA | **6.02** PASS-AA | **11.03** PASS-AA |
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
  border-radius: var(--radius-sm);
}
```

---

## 5. The deliberate traps

CANON section 8 names two. Measuring the whole matrix turns up three more. All
five are real; none is staged.

### Trap 1 — `text.muted` on `bg.base` — CANON section 8

**Measured: 4.07:1.** CANON describes this as "roughly 4.1:1"; the exact value
is 4.07260731, which rounds to 4.07. Confirmed.

- Normal body text needs 4.5:1. **Fails, by 0.43.**
- Large text needs 3:1. Passes.

The nuance matters on stage. `text.muted` is not a catastrophe of a colour, it
is a near miss, which is exactly why it survives review by eye and why a model
asked for "a muted grey for supporting copy" picks it almost every time. axe
will flag it only where the computed font size is below the large-text
threshold, so the report comes back with a handful of specific nodes rather
than a wall of red. The fix is one token: move to `text.secondary`, which is
8.83:1 on the same background.

It is worse on the lighter surfaces, not better: 3.78:1 on `bg.surface` and
3.41:1 on `bg.raised`. Card copy is the most likely place for it to appear and
the least forgiving.

CANON's own use for it — legal and footer text — is still a call the team is
making knowingly, and it still fails 4.5:1 at body size. Footer legal copy set
in `text.muted` is a genuine axe finding, not an exemption.

### Trap 2 — white on `accent.sodium` — CANON section 8

**Measured: 2.87:1.** CANON describes this as "about 2.9:1"; the exact value is
2.86551331, which rounds to 2.87. Confirmed.

- **Fails at every size.** It does not even clear the 3:1 large-text bar, and
  it misses the 3:1 non-text bar too, so a white icon on a sodium button is
  also a failure.
- The canonical pairing, `bg.base` on `accent.sodium`, measures **6.87:1** and
  passes comfortably.

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

---

## 6. What the validation step should assert

These are the assertions the a11y gate in the loop is checking, stated as
numbers so a failure report can be compared against something:

1. No text node combines a foreground and background from the FAIL cells in
   section 3.
2. `text.muted` appears only on nodes whose computed font size clears the
   large-text threshold — and CANON restricts it further, to legal and footer
   text.
3. No white (`#FFFFFF`, `#FFF`, `white`, `rgb(255 255 255)`) on any accent or
   state fill.
4. Every `:focus-visible` indicator reaches 3:1 against the surface behind it.
   `border.strong` alone does not.
5. Re-run this document whenever a colour changes in Figma. The numbers are
   quoted in the deck; a stale matrix is worse than none.

---

## Appendix — reproduce these numbers

```python
import math

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

def verdict(r):
    return "PASS-AA" if r >= 4.5 else "PASS-AA-LARGE" if r >= 3.0 else "FAIL"

print(round(ratio("#6B7280", "#0A0B0D"), 2), verdict(ratio("#6B7280", "#0A0B0D")))
# 4.07 PASS-AA-LARGE   -> fails as body copy
print(round(ratio("#FFFFFF", "#FF6A1A"), 2), verdict(ratio("#FFFFFF", "#FF6A1A")))
# 2.87 FAIL
print(round(ratio("#0A0B0D", "#FF6A1A"), 2), verdict(ratio("#0A0B0D", "#FF6A1A")))
# 6.87 PASS-AA
```

Computed 2026-09-11 against `design/tokens/tokens.json`.
