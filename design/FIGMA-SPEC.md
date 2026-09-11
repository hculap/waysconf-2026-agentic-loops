# TURBINE — Figma build specification

Build specification for the Figma file `TURBINE — Landing page`. It is the first artefact in the agentic
loop: everything downstream (brief, plan, code, visual diff) reads from the file this document describes.

**Two readers, one document.** A designer builds the file by hand from it. A Figma plugin
(`figma-plugin/`) builds the same file programmatically from it. Every number below is therefore literal.
Where a value is a design decision rather than a fact, it is still stated as a single number, because a
range cannot be executed.

**Authority.** `docs/CANON.md` outranks this file. If the two disagree, CANON wins and this file is
wrong. Nothing here invents a fact CANON already fixes: the lineup, prices, colours, type families,
spacing scale, breakpoints, section order and accessibility bar all come from CANON verbatim.

**Scope reminder.** One page, dark theme only, no light mode, no theme switcher, no checkout, no CMS,
no artist detail pages. See CANON §11.

---

## 0. Ground rules

| Rule | Value |
|---|---|
| Figma file name | `TURBINE — Landing page` |
| Units | CSS pixels. 1 Figma px = 1 CSS px. Never scale a frame to fit a screen. |
| Theme | Dark only. There is no light mode and no second colour mode. |
| Rounding | Every spacing, padding and gap value is an integer from the spacing scale. No `23`, no `25`. |
| Fractions | Column widths produced by a stretch grid may be fractional (73.5, 218.67). That is expected. Hand-typed values may not. |
| Text | Live text, always. Never an outlined vector, never a flattened image of a heading. |
| Colour | Bound variable, always. A raw hex in a fill is a build error, not a shortcut. |
| Naming | Layer names match the DOM they will become. See §9. |
| Language | English. `lang="en"`. No i18n. |

---

## 1. File and page structure

Six pages, in this order. The order matters: the plugin creates them by index, and the designer reads
them left to right as a narrative.

| # | Page | Purpose | Contains |
|---|---|---|---|
| 1 | `Cover` | Thumbnail and provenance | One 1600×960 frame, `cover` |
| 2 | `Design system` | Tokens, type, components | Variable proof sheet, 17 text style specimens, all 10 component sets, contrast matrix |
| 3 | `Desktop 1440` | Canonical composition | One frame, `TURBINE / Desktop 1440`, containing the 11 section frames, 10 of which export |
| 4 | `Tablet 768` | Tablet deltas | One frame, `TURBINE / Tablet 768` |
| 5 | `Mobile 390` | Mobile deltas | One frame, `TURBINE / Mobile 390` |
| 6 | `Exports` | Export manifest and source assets | Manifest table frame plus the image asset frames listed in §8.4 |

Page names are exact, including capitalisation and the space in `Design system`. The plugin matches on
the string.

### 1.1 Cover frame

`cover` — 1600×960, fill `color/bg/base`, vertical auto-layout, padding 128, gap `space/8` (32),
align left, justify bottom.

| Layer | Style | Content |
|---|---|---|
| `cover/wordmark` | `Display/Wordmark-Hero` at 96, fill `color/text/primary` | `TURBINE` |
| `cover/subtitle` | `Body/Lead`, fill `color/accent/sodium` | `Landing page — design file` |
| `cover/meta` | `Mono/Time`, fill `color/text/secondary` | `12–14 June 2027 · The Powerhouse, Hall E · Kraków` |
| `cover/provenance` | `Legal/Fine`, fill `color/text/muted` | `Fictional festival. Teaching material for WaysConf 2026. Source of truth: docs/CANON.md` |

Set this frame as the file thumbnail.

### 1.2 Viewport frames

| Page | Frame name | Width | Height | Layout | Fill |
|---|---|---|---|---|---|
| Desktop 1440 | `TURBINE / Desktop 1440` | 1440 | Hug | Vertical auto-layout, gap 0, padding 0 | `color/bg/base` |
| Tablet 768 | `TURBINE / Tablet 768` | 768 | Hug | Vertical auto-layout, gap 0, padding 0 | `color/bg/base` |
| Mobile 390 | `TURBINE / Mobile 390` | 390 | Hug | Vertical auto-layout, gap 0, padding 0 | `color/bg/base` |

Gap is 0 because each section owns its own vertical padding. Two sources of vertical rhythm is one
too many, and the CSS will only have one.

Each viewport frame is set to the matching mode of the `TURBINE / Responsive` variable collection
(§2.5). Setting the mode is what makes the type and gutters resize; nothing is retyped per breakpoint.

`Ready for dev` status is set on these three frames and on nothing else.

---

## 2. Figma Variables

### 2.1 Naming convention

`design/tokens/tokens.json` is the machine-readable token source. It is committed, and it is W3C DTCG
shaped: every leaf carries a `$value` and a `$type`. Figma variable names are derived from its dot paths
group by group. The translation is short enough to state in full, and `buildTokens()` in
`scripts/build-figma-plugin.mjs` is its executable form.

```
tokens.json dot path                ->   Figma variable name
color.bg.base                       ->   color/bg/base           (all of color.* maps 1:1)
radius.pill                         ->   radius/pill             (all of radius.* maps 1:1)
breakpoint.tablet                   ->   breakpoint/tablet       (all of breakpoint.* maps 1:1)
spacing.6                           ->   space/6
typography.fontSize.xl              ->   text/xl
typography.fontFamily.display       ->   font/display
typography.fontWeight.regular       ->   weight/regular
typography.letterSpacing.display    ->   tracking/tight
typography.letterSpacing.wordmark   ->   tracking/wordmark
typography.letterSpacing.normal     ->   tracking/normal
layout.maxWidth                     ->   size/content-max
layout.gutter.mobile / .desktop     ->   the Mobile 390 / Desktop 1440 modes of responsive/gutter
```

Rules, in full:

1. Only the group prefix is rewritten; the leaf key crosses unchanged. `spacing.6` is `space/6`, not
   `spacing/6`, and `typography.fontSize.xl` is `text/xl`, not `typography/fontSize/xl`. A blanket
   dot-to-slash substitution is not the rule and never was — it holds for three groups out of eight. The
   table above is the whole of it, so a value can still be found in either file by reading one line.
2. Keep the leading segment (`color/`, `space/`) even though the collection is already called Color or
   Scale. The redundancy is deliberate: a variable named `bg/base` would not be found by anyone
   searching for `color.bg.base`.
3. All lowercase. Hyphens inside a segment are allowed (`content-max`), underscores and spaces are not.
4. British spelling appears in prose only. Every identifier is `color`, never `colour`. Two spellings of
   the same concept in one codebase is a bug waiting for a designer to file it.
5. Parity holds over the intersection of the two files, not over either one whole, because they do not
   cover the same ground: `tokens.json` carries only what CANON fixes. Two carve-outs, both named and
   both closed:
   - **Figma only**, each recorded as an assumption in §12: the five `leading/*` steps, `tracking/wide`,
     `border/hairline`, `border/focus`, `size/touch-min`, `size/tap-comfortable`, and all nine
     `responsive/*` variables.
   - **`tokens.json` only**: the `shadow` group, which the token file itself declares an implementation
     extension with no Figma counterpart and excludes from the name diff.

   Everything else exists on both sides, under the names in the table above.
   `scripts/build-figma-plugin.mjs` asserts the counts when it generates the plugin bundle — fourteen
   colour leaves, eleven type sizes, three families — and refuses to write if they move. The TOKENS gate
   is a separate program doing a different job: `checks/specs/tokens.spec.ts`, AC-26 to AC-33, checks the
   compiled CSS against `tokens.json`.

### 2.2 Collection `TURBINE / Color`

One mode, named `Dark`. There is no second mode. Type: `COLOR`. Every variable is published.

| Variable | Hex | Use (CANON §4) |
|---|---|---|
| `color/bg/base` | `#0A0B0D` | Page background |
| `color/bg/surface` | `#131519` | Cards, nav background |
| `color/bg/raised` | `#1C1F25` | Hover states, table header |
| `color/border/subtle` | `#2A2E36` | Hairlines, card borders |
| `color/border/strong` | `#3D434E` | Dividers, and the dark offset under a focus ring |
| `color/text/primary` | `#F2F4F7` | Headings, body on dark |
| `color/text/secondary` | `#A7AEBB` | Supporting copy |
| `color/text/muted` | `#6B7280` | Trap. Never body copy, and not the footer legal copy either. See below and §4.10. |
| `color/text/on-accent` | `#0A0B0D` | Alias of `color/bg/base`. Ink on every accent and state fill |
| `color/accent/sodium` | `#FF6A1A` | Primary accent, CTAs |
| `color/accent/coolant` | `#2FE6D6` | Links, active tab, focus ring |
| `color/accent/arc` | `#7C5CFF` | Badges, marquee |
| `color/state/danger` | `#FF4D4D` | Sold out, errors |
| `color/state/success` | `#3DDC84` | Confirmation |

Every contrast ratio quoted anywhere in this file is computed in `design/tokens/CONTRAST.md`, which is
the source for all of them and which opens by saying that nothing in it is estimated. Two variables carry
a Figma **description**, because the description is what the Dev Mode MCP server returns alongside the
value and is therefore the cheapest way to put a warning in front of the model that will write the CSS.

`color/text/muted`:
`Trap. 4.07:1 on bg/base and 3.78:1 on bg/surface, both under the 4.5:1 normal-text bar. No composed
frame uses it; the footer legal block is set in text/secondary. See CONTRAST.md section 5, Trap 1.`

`color/border/strong`:
`Dividers, and the dark offset under a focus ring. 1.98:1 on bg/base — never the visible focus stroke.
Use accent/coolant.`

CANON §4 labels `border/strong` "focus ring base", which reads as an instruction and is not one. The
visible focus stroke in this file is always `color/accent/coolant` — 12.57:1 on `bg/base`, against a 3:1
requirement — and `border/strong` is only the dark offset underneath it. §4 says the same thing about
components; §2.2 and §4 have to agree on the page, or someone reads one of them alone and ships a ring
at 1.98:1.

**Hover and pressed states introduce no new colours.** CANON fixes thirteen colours; the file has those
thirteen plus one alias, `color/text/on-accent`, which resolves to `color/bg/base` and introduces no new
hex. `tokens.json` carries the alias too, and `scripts/build-figma-plugin.mjs` asserts fourteen colour
leaves, so a file built with thirteen is missing one. A hover is a 10% `color/text/primary` overlay layer
named `overlay/hover` inside the component, not a fourteenth colour. This keeps the token-diff gate
meaningful.

### 2.3 Collection `TURBINE / Type`

One mode, named `Default`.

Font family, type `STRING`:

| Variable | Value | Weights available (CANON §5) |
|---|---|---|
| `font/display` | `Space Grotesk` | 500, 700 |
| `font/body` | `Inter` | 400, 500, 600 |
| `font/mono` | `JetBrains Mono` | 400, 700 |

Font weight, type `FLOAT`:

| Variable | Value |
|---|---|
| `weight/regular` | 400 |
| `weight/medium` | 500 |
| `weight/semibold` | 600 |
| `weight/bold` | 700 |

Font size, type `FLOAT`, in px. The rem column is the CANON scale; the names follow Tailwind so that
`text/xl` in Figma is `text-xl` in the markup with no translation table.

| Variable | rem | px |
|---|---|---|
| `text/xs` | 0.75 | 12 |
| `text/sm` | 0.875 | 14 |
| `text/base` | 1 | 16 |
| `text/lg` | 1.125 | 18 |
| `text/xl` | 1.25 | 20 |
| `text/2xl` | 1.5 | 24 |
| `text/3xl` | 2 | 32 |
| `text/4xl` | 2.5 | 40 |
| `text/5xl` | 3.5 | 56 |
| `text/6xl` | 4.5 | 72 |
| `text/7xl` | 6 | 96 |

Line height, type `FLOAT`, expressed as a percentage in Figma and unitless in CSS:

| Variable | Figma % | CSS |
|---|---|---|
| `leading/none` | 100% | 1 |
| `leading/tight` | 108% | 1.08 |
| `leading/snug` | 125% | 1.25 |
| `leading/normal` | 150% | 1.5 |
| `leading/relaxed` | 162% | 1.62 |

Letter spacing, type `FLOAT`, in em:

| Variable | Value | Source |
|---|---|---|
| `tracking/tight` | `-0.02em` | CANON §5, all display type |
| `tracking/normal` | `0em` | — |
| `tracking/wide` | `0.06em` | Eyebrows, mono tags |
| `tracking/wordmark` | `0.18em` | CANON §5, wordmark lockup only |

### 2.4 Collection `TURBINE / Scale`

One mode, named `Default`. Type `FLOAT`, px.

Spacing (CANON §6). The number in the name is the value divided by 4, matching Tailwind's `0.25rem`
step, so `space/6` is 24px and is `p-6` in the markup.

| Variable | px | Variable | px |
|---|---|---|---|
| `space/1` | 4 | `space/8` | 32 |
| `space/2` | 8 | `space/12` | 48 |
| `space/3` | 12 | `space/16` | 64 |
| `space/4` | 16 | `space/24` | 96 |
| `space/6` | 24 | `space/32` | 128 |

There is no `space/5`, `space/7`, `space/9`, `space/10` or `space/11`. The scale has ten steps and no
more. If a layout wants 20px, the layout is wrong.

Radius (CANON §6):

| Variable | px |
|---|---|
| `radius/none` | 0 |
| `radius/sm` | 4 |
| `radius/md` | 8 |
| `radius/lg` | 16 |
| `radius/pill` | 999 |

Border width:

| Variable | px |
|---|---|
| `border/hairline` | 1 |
| `border/focus` | 2 |

Fixed sizes:

| Variable | px | Note |
|---|---|---|
| `size/content-max` | 1200 | CANON §6 content max width |
| `size/touch-min` | 24 | CANON §9 minimum touch target |
| `size/tap-comfortable` | 48 | Used for every real control |
| `breakpoint/mobile` | 390 | CANON §6 |
| `breakpoint/tablet` | 768 | CANON §6 |
| `breakpoint/desktop` | 1440 | CANON §6 |

### 2.5 Collection `TURBINE / Responsive`

Three modes: `Mobile 390`, `Tablet 768`, `Desktop 1440`. This is the only collection with more than one
mode, and it is what makes the three viewport frames differ without a single duplicated text layer.

| Variable | Mobile 390 | Tablet 768 | Desktop 1440 | Note |
|---|---|---|---|---|
| `responsive/gutter` | 24 | 32 | 48 | CANON §6 fixes 24 and 48; 32 is the tablet step |
| `responsive/container-max` | 342 | 704 | 1200 | Viewport minus two gutters, capped at `size/content-max` |
| `responsive/section-pad-y` | 64 | 96 | 128 | `space/16`, `space/24`, `space/32` |
| `responsive/grid-columns` | 4 | 8 | 12 | |
| `responsive/grid-gutter` | 16 | 24 | 24 | |
| `responsive/type/wordmark-hero` | 40 | 72 | 96 | `text/4xl`, `text/6xl`, `text/7xl` |
| `responsive/type/section-h2` | 32 | 40 | 56 | `text/3xl`, `text/4xl`, `text/5xl` |
| `responsive/type/subsection-h3` | 24 | 24 | 32 | `text/2xl`, `text/2xl`, `text/3xl` |
| `responsive/type/lead` | 18 | 18 | 20 | `text/lg`, `text/lg`, `text/xl` |

The four `responsive/type/*` variables alias the fixed `text/*` variables rather than carrying loose
numbers, so a change to the scale propagates once.

### 2.6 Variable proof sheet

On `Design system`, a frame `tokens/proof` — 1200 wide, vertical auto-layout, gap `space/8`, padding
`space/12`. One swatch row per colour: a 64×64 rounded rectangle (`radius/md`) with the fill bound, the
variable name in `Mono/Time`, the hex in `Mono/Time` at `color/text/secondary`, and the measured
contrast against `color/bg/base` in `Body/Small`.

Below it, `tokens/contrast-matrix` — the four known-good pairings from CANON §4 marked pass, and the
traps marked fail. Every ratio is copied from `design/tokens/CONTRAST.md` §3 and §4. Type the measured
number: a word like "high" cannot be printed into a text layer by a plugin and cannot be checked by a
reader.

| Pairing | Ratio | Verdict |
|---|---|---|
| `text/primary` on `bg/base` | 17.87:1 | Pass |
| `text/primary` on `bg/surface` | 16.59:1 | Pass |
| `text/secondary` on `bg/base` | 8.83:1 | Pass |
| `bg/base` on `accent/sodium` | 6.87:1 | Pass — this is the button |
| `text/muted` on `bg/base` | 4.07:1 | **Fail** for body copy. CANON §8. |
| `#FFFFFF` on `accent/sodium` | 2.87:1 | **Fail**. Never white on orange. CANON §8. |
| `text/primary` on `accent/arc` | 3.94:1 | **Fail** below 24px. Arc takes `bg/base` ink only. |
| `#FFFFFF` on `state/danger` | 3.27:1 | **Fail** for a pill label. Use `bg/base`. |

CANON §8 names the first two traps. CONTRAST.md §5 measures three more, and the two added here are the
ones this file can actually produce: the ticker runs on `accent/arc` (§4.9) and the sold-out pill on
`state/danger` (§4.6). The failing rows stay in the file on purpose. They are the thing the accessibility
gate will catch later, and a designer who sees them here understands why the gate exists.

---

## 3. Text styles

Seventeen styles, named `Group/Role`. Figma sorts on the slash, so the five groups — Display, Body,
Label, Mono and Legal — collapse neatly in the panel.

Every style binds family, weight, size and letter spacing to variables from §2.3, and binds line height
to a `leading/*` variable wherever the scale has a step for it. Five do not: `Display/Card-Title` at
130%, `Label/Eyebrow` and `Mono/Tag` at 133%, and `Label/Button-Small` and `Mono/Time` at 143% carry a
literal percentage, because the five-step leading scale has no step there and growing the scale by three
steps to serve five styles costs more than it saves. Those five are the only loose numbers in the file,
and §12 records them. Four styles bind size to a `responsive/type/*` variable and therefore resize with
the frame mode; the rest are fixed.

| Style | Family | Weight | Size (px) | Line height | Letter spacing | Case | Used by |
|---|---|---|---|---|---|---|---|
| `Display/Wordmark-Hero` | Space Grotesk | 700 | `responsive/type/wordmark-hero` (96 / 72 / 40) | `leading/none` 100% | `tracking/wordmark` +0.18em | Uppercase | Hero `h1` |
| `Display/Wordmark-Nav` | Space Grotesk | 700 | 20 | `leading/snug` 125% | `tracking/wordmark` +0.18em | Uppercase | Nav and footer lockup |
| `Display/Section` | Space Grotesk | 700 | `responsive/type/section-h2` (56 / 40 / 32) | `leading/tight` 108% | `tracking/tight` -0.02em | Sentence | Every section `h2` |
| `Display/Subsection` | Space Grotesk | 500 | `responsive/type/subsection-h3` (32 / 24 / 24) | `leading/snug` 125% | `tracking/tight` -0.02em | Sentence | `h3`, ticket tier, day heading |
| `Display/Card-Title` | Space Grotesk | 500 | 20 | 130% | `tracking/tight` -0.02em | Sentence | Artist name, FAQ question |
| `Display/Price` | Space Grotesk | 700 | 40 | `leading/tight` 108% | `tracking/tight` -0.02em | — | Ticket price. Tabular figures on. |
| `Body/Lead` | Inter | 400 | `responsive/type/lead` (20 / 18 / 18) | `leading/relaxed` 162% | `tracking/normal` | Sentence | Hero secondary line, section intro |
| `Body/Base` | Inter | 400 | 16 | `leading/relaxed` 162% | `tracking/normal` | Sentence | Default paragraph |
| `Body/Base-Medium` | Inter | 500 | 16 | `leading/relaxed` 162% | `tracking/normal` | Sentence | Nav link, emphasis |
| `Body/Small` | Inter | 400 | 14 | `leading/normal` 150% | `tracking/normal` | Sentence | Card meta, captions, helper text |
| `Body/Small-Medium` | Inter | 500 | 14 | `leading/normal` 150% | `tracking/normal` | Sentence | Tab label, table cell emphasis |
| `Label/Eyebrow` | Inter | 600 | 12 | 133% | `tracking/wide` +0.06em | Uppercase | Section eyebrow |
| `Label/Button` | Inter | 600 | 16 | `leading/normal` 150% | `tracking/normal` | Sentence | Button md |
| `Label/Button-Small` | Inter | 600 | 14 | 143% | `tracking/normal` | Sentence | Button sm, nav CTA, tab |
| `Mono/Time` | JetBrains Mono | 400 | 14 | 143% | `tracking/normal` | — | Timetable times, token names |
| `Mono/Tag` | JetBrains Mono | 700 | 12 | 133% | `tracking/wide` +0.06em | Uppercase | Ticker tags, badges |
| `Legal/Fine` | Inter | 400 | 12 | `leading/normal` 150% | `tracking/normal` | Sentence | Footer legal, fiction disclaimer |

Notes that matter downstream:

- **Uppercase is set as a text-case property on the style, not typed in caps.** `TURBINE` is the one
  exception: the wordmark is a proper noun in all caps per CANON §1, so it is typed that way and the
  style adds letter spacing only. Everything else typed in caps breaks a screen reader and breaks the
  copy when the brief changes it.
- `Legal/Fine` is the only style whose specimen on the Design system page is shown in
  `color/text/muted`. Every other specimen uses `color/text/primary` or `color/text/secondary`.
- Line heights above are the resolved percentages. Where a percentage produces a fractional px at a
  given size, Figma rounds; the CSS uses the unitless value and may differ by a sub-pixel. The visual
  diff threshold in §8.5 absorbs this.

### 3.1 Type specimen frame

`type/specimen` on `Design system` — 1200 wide, vertical auto-layout, gap `space/12`, padding
`space/12`. One row per style: style name in `Mono/Time` at `color/text/secondary`, then the specimen
string `Hall E has not made electricity since 1998` set in the style, then the resolved
family / weight / size / line height / tracking in `Body/Small` at `color/text/secondary`.

---

## 4. Components

Ten component sets, all on `Design system`, all published, all built from auto-layout frames. None is a
group. Layout order on the page: Button, Input, Nav, TabBar, ArtistCard, TicketCard, TimetableRow,
FaqRow, Ticker, Footer.

Conventions for every component set:

- Variant property names are capitalised single words: `Variant`, `State`, `Size`, `Layout`, `Active`.
- Variant values are lowercase, hyphenated: `primary`, `sold-out`, `table-row`.
- Text and boolean properties are capitalised and readable: `Label`, `Show icon`.
- The `default` / `md` / `standard` combination is always the first variant in the set.
- Focus states use a 2px `color/accent/coolant` stroke, offset 2px outside the shape. Coolant on
  `bg/base` clears the 3:1 non-text requirement in CANON §9 comfortably, and it is the only focus
  treatment in the file.
- Hover is an `overlay/hover` layer: `color/text/primary` at 10% opacity, filling the component. It
  introduces no new token.

### 4.1 Button

Component set `Button`. Three variant properties, 24 variants.

| Property | Values |
|---|---|
| `Variant` | `primary` · `secondary` · `ghost` |
| `State` | `default` · `hover` · `focus` · `disabled` |
| `Size` | `md` · `sm` |

Component properties: `Label` (text, default `Get tickets`), `Show label` (boolean, default true),
`Show icon` (boolean, default false), `Icon` (instance swap, shown when `Show icon` is true, 16×16,
placed after the label).

Anatomy: horizontal auto-layout, gap `space/2` (8), align centre, hug both axes, radius `radius/pill`.

| Size | Text style | Padding Y | Padding X | Resulting height | Min width |
|---|---|---|---|---|---|
| `md` | `Label/Button` (16/24) | 12 | 24 | 48 | 120 |
| `sm` | `Label/Button-Small` (14/20) | 8 | 16 | 36 | 96 |

Every padding here is a step on the `space/*` scale, which §0 requires and which `brief/ACCEPTANCE.md`
AC-32 enforces on the compiled CSS to ±0.5px. A button padded 28 or 20 fails the TOKENS gate on every
single run, and the loop has no legal repair for it, because the design would be mandating a value the
verifier forbids.

When `Show label` is false the frame stops hugging and becomes a square: fixed 48×48, padding `space/3`
(12) on all four sides around a 24×24 icon, no min width. That is the one icon-only control in the file
and it is the compact nav's menu button (§4.3).

Both heights clear the 24px touch minimum in CANON §9 with room to spare.

| Variant | Fill | Stroke | Label colour |
|---|---|---|---|
| `primary` | `color/accent/sodium` | none | `color/bg/base` |
| `secondary` | none | 1px `color/border/strong` | `color/text/primary` |
| `ghost` | none | none | `color/accent/coolant` |

The primary label is `color/bg/base` on `color/accent/sodium`. This is a CANON §4 fixed pairing and the
single most common thing a model gets wrong: white on orange is 2.87:1 and fails. See CANON §8.

| State | Change |
|---|---|
| `default` | As above |
| `hover` | Add `overlay/hover` (`color/text/primary` at 10%). `ghost` additionally underlines the label. |
| `focus` | Default fill plus 2px `color/accent/coolant` stroke, 2px outside offset. The focus ring is on top of the hover overlay if both apply. |
| `disabled` | Fill `color/bg/raised`, no stroke, label `color/text/secondary`. Opacity stays at 100% so the contrast remains computable by axe. |

Never express disabled as `opacity: 0.4`. A tool cannot measure the contrast of a composited opacity and
neither can a person.

### 4.2 Input

Component set `Input`. Two variant properties, 15 variants.

| Property | Values |
|---|---|
| `Type` | `text` · `email` · `checkbox` |
| `State` | `default` · `focus` · `filled` · `error` · `disabled` |

Component properties: `Label` (text), `Placeholder` (text), `Helper` (text), `Error message` (text),
`Required` (boolean, default false).

`text` and `email` anatomy: vertical auto-layout, gap `space/2` (8), fill container width.

| Part | Spec |
|---|---|
| Label | `Body/Small-Medium`, `color/text/primary`. Always present and always visible. No placeholder-as-label. |
| Field | Height 48, horizontal auto-layout, padding 12/16, fill `color/bg/surface`, 1px `color/border/subtle`, radius `radius/sm` |
| Value text | `Body/Base`, `color/text/primary` |
| Placeholder text | `Body/Base`, `color/text/secondary`. Never `color/text/muted`. |
| Helper | `Body/Small`, `color/text/secondary` |

`checkbox` anatomy: horizontal auto-layout, gap `space/3` (12), align start. Box 24×24, radius
`radius/sm`, 1px `color/border/strong`; checked fill `color/accent/coolant` with a `color/bg/base`
tick. Label `Body/Small`, `color/text/secondary`, fill container. The whole row is the hit target and is
at least 24px tall.

| State | Change |
|---|---|
| `focus` | 2px `color/accent/coolant` stroke, 2px outside offset |
| `error` | 1px `color/state/danger` border plus an error message row in `Body/Small`, `color/state/danger`, with a 16×16 warning icon. The message is text, never colour alone. |
| `disabled` | Fill `color/bg/base`, border `color/border/subtle`, text `color/text/secondary` |

### 4.3 Nav

Component set `Nav`. Two variant properties, 10 variants.

| Property | Values |
|---|---|
| `Layout` | `full` · `compact` |
| `Active` | `none` · `lineup` · `programme` · `venue` · `faq` |

`full` — used at 1440 and 768. Height 72 (1440) / 64 (768). Horizontal auto-layout, space between,
align centre, padding X `responsive/gutter`, padding Y 12. Fill `color/bg/surface`, bottom border 1px
`color/border/subtle`. Sticky at top.

| Child | Spec |
|---|---|
| `nav/wordmark` | `Display/Wordmark-Nav`, `color/text/primary`, link to `#top` |
| `nav/links` | Horizontal auto-layout, gap `space/8` (32). Four links, labels and targets from `brief/CONTENT.md` §3 — the fourth reads `Questions`, not `FAQ`, though its target is still `#faq`. `Body/Base-Medium`, `color/text/secondary`. Active link `color/accent/coolant` with a 2px bottom rule in the same colour. Each link is a fixed 48-high row with its label centred. |
| `nav/cta` | `Button` instance, `Variant=primary`, `Size=sm`, `Label` from `brief/CONTENT.md` §3 (`Tickets`) |

A fixed 48-high row rather than "12px of padding above and below": `Body/Base-Medium` is Inter 16 at
`leading/relaxed` 162%, so its line box is 25.92px and 12 + 25.92 + 12 is 49.92, not 48. Two pixels of
nav height is absorbed by no budget — the baseline and the screenshot end up different sizes and
pixelmatch cannot compare them at all. Centring inside a fixed row gives exactly 48 and declares no
padding for AC-32 to reject.

`compact` — used at 390 only, per CANON §7 ("hamburger below 768"). Height 64. Wordmark left, the 48×48
menu button right: a `Button` instance, `Variant=ghost`, `Size=sm`, `Show label` false, `Show icon`
true, which is the square icon-only form defined in §4.1. `nav/links` is present in the file but hidden,
so the structure survives into the markup and the drawer is a CSS concern rather than a missing element.

Add a Dev Mode annotation on the `Nav` component set: `nav landmark, aria-label="Primary". The wordmark
links to #top with the accessible name "TURBINE — back to top". Below 768 the links and the CTA collapse
behind a button whose accessible name toggles Open menu / Close menu.` CANON §9 and `brief/CONTENT.md`
§14 are both specific here, and the annotation is how that reaches the markup.

### 4.4 TabBar

Component set `TabBar`, one variant property `Active` with values `all` · `fri` · `sat` · `sun`.

Anatomy: horizontal auto-layout, gap `space/2` (8), hug, padding 4, fill `color/bg/surface`, radius
`radius/pill`. Contains four instances of the nested component `TabBar/Tab`.

`TabBar/Tab` — one variant property `State` with values `default` · `hover` · `focus` · `active`.
Horizontal auto-layout, padding `space/2` / `space/4` (8/16), fixed height 40 with the label centred,
radius `radius/pill`, `Label/Button-Small`. 10 and 20 are not steps on the spacing scale and AC-32
rejects both; the four extra pixels of height come from the fixed height, not from off-scale padding.

| State | Fill | Label |
|---|---|---|
| `default` | none | `color/text/secondary` |
| `hover` | `color/bg/raised` | `color/text/primary` |
| `focus` | none, plus 2px `color/accent/coolant` stroke at 2px offset | `color/text/primary` |
| `active` | `color/accent/coolant` | `color/bg/base` |

The active tab is a filled pill, not a colour change alone, because colour alone does not survive a
colour-vision check. CANON §9 requires the tab set to be keyboard operable; the `focus` variant is what
tells the implementation there is a visible ring to build.

### 4.5 ArtistCard

Component set `ArtistCard`, one variant property `Billing` with values `headliner` · `main` · `support`.

Component properties: `Name` (text), `Genre` (text), `Day` (text), `Stage` (text), `Blurb` (text),
`Billing label` (text), `Portrait` (image fill on `artist/portrait`).

Anatomy: vertical auto-layout, gap `space/3` (12), fill container width, hug height, padding 0, radius
`radius/md`, clip content on. Fill `color/bg/surface`, 1px `color/border/subtle`.

| Child | Spec |
|---|---|
| `artist/portrait` | Aspect ratio 1:1, matching the supplied 800 × 800 files, fill container width, image fill, crop. At 282 wide this renders 282×282. |
| `artist/body` | Vertical auto-layout, gap `space/2` (8), padding `space/4` (16) |
| `artist/badge` | Present on all three billings. `Mono/Tag`, `color/bg/base` on `color/accent/arc`, padding 4/8, radius `radius/sm`. The text comes from `Billing label` and reads `Headliner`, `Main` or `Support`, the exact words `brief/CONTENT.md` §6 fixes for every card. Absolutely positioned top-left of the portrait at 12/12. |
| `artist/name` | `Display/Card-Title`, `color/text/primary` |
| `artist/meta` | Horizontal auto-layout, gap `space/2`, wrap on. `Body/Small`, `color/text/secondary`. Formatted `<Day> · <Stage>` with the day spelled out, as `brief/CONTENT.md` §6 sets it: `Friday · Turbine Hall`, not `Fri · Turbine Hall`. |
| `artist/genre` | `Mono/Tag`, `color/accent/coolant` |
| `artist/blurb` | `Body/Small`, `color/text/secondary`, fill container. One sentence per card, from `brief/CONTENT.md` §6. AC-38 matches all twelve verbatim, so a card with nowhere to put the sentence cannot pass the content gate. |

| Billing | Difference |
|---|---|
| `headliner` | `Billing label` = `Headliner`; `artist/name` overrides to 24px |
| `main` | `Billing label` = `Main`; name at 20px |
| `support` | `Billing label` = `Support`; name at 20px; `artist/genre` at `color/text/secondary` |

Hover on the whole card: `overlay/hover` over the portrait only, plus border to `color/border/strong`.

### 4.6 TicketCard

Component set `TicketCard`, one variant property `Variant` with values `standard` · `highlighted` ·
`sold-out`.

Component properties: `Tier` (text), `Price` (text), `Includes` (text), `Note` (text),
`Show badge` (boolean), `Badge label` (text).

Anatomy: vertical auto-layout, gap `space/4` (16), fill container width, hug height, padding `space/6`
(24), radius `radius/lg`, fill `color/bg/surface`, 1px `color/border/subtle`.

| Child | Spec |
|---|---|
| `ticket/badge` | Shown when `Show badge` true. `Mono/Tag`, `color/bg/base` on `color/accent/sodium`, padding 4/8, radius `radius/sm` |
| `ticket/tier` | `Display/Subsection`, `color/text/primary` |
| `ticket/price` | `Display/Price`, `color/accent/sodium`. Currency and amount in one text node so a screen reader reads `€45` as one thing. |
| `ticket/includes` | `Body/Base`, `color/text/secondary` |
| `ticket/note` | `Body/Small`, `color/text/secondary` |
| `ticket/cta` | `Button` instance, `Variant=primary`, `Size=md`, fill container width |

| Variant | Difference |
|---|---|
| `standard` | As above |
| `highlighted` | Border 2px `color/accent/sodium`; fill `color/bg/raised`; badge shown with `Badge label = Most popular`; card is 16px taller through padding `space/8` (32) |
| `sold-out` | Border `color/border/subtle`; `ticket/price` in `color/text/secondary` with a strikethrough; a `Sold out` badge in `color/bg/base` on `color/state/danger`; CTA becomes `Variant=secondary`, `Label=Workshop sold out`. Not `State=disabled`: `brief/CONTENT.md` §14 keeps it focusable and marks it `aria-disabled="true"`, so a keyboard user can still reach the control that explains why they cannot buy |

CANON §3 fixes the three tiers: Single Night €45, Full Pass €110 (highlight this card), Full Pass +
Workshop €165. The `sold-out` variant exists because the workshop tier is limited to 40 places and shows
a warning below 10; it is documented on the Design system page and is not used on the composed page.

### 4.7 TimetableRow

Component set `TimetableRow`, one variant property `Layout` with values `table-row` · `stacked`, plus
a boolean property `Zebra` (default false).

Component properties: `Time` (text), `Turbine Hall` (text), `Boiler Room` (text), `Cooling Tower` (text).

`table-row` — horizontal auto-layout, fill container width, align centre, padding 16/`space/4`, gap
`space/6` (24), bottom border 1px `color/border/subtle`. Fill `color/bg/raised` when `Zebra` is true.

| Cell | Width at 1440 | Style |
|---|---|---|
| `row/time` | Fixed 128 | `Mono/Time`, `color/accent/coolant` |
| `row/turbine-hall` | Fill | `Body/Base-Medium`, `color/text/primary` |
| `row/boiler-room` | Fill | `Body/Base-Medium`, `color/text/primary` |
| `row/cooling-tower` | Fill | `Body/Base-Medium`, `color/text/primary` |

128 rather than 96 because the cell holds a range, not a start time. `brief/CONTENT.md` §7 sets times
like `19:30 – 21:00`: thirteen characters of JetBrains Mono at 14px, about 109px, which a 96 column clips
and a 72 column destroys.

An empty cell contains an em dash in `color/text/secondary`, not an empty text node. An empty node
collapses in auto-layout and breaks the column alignment. The dash is decorative and the cell also
carries the visually hidden string `No set`, per `brief/CONTENT.md` §7.

`stacked` — used at 390. Vertical auto-layout, gap `space/2` (8), padding `space/4`, bottom border 1px
`color/border/subtle`. Time on its own line in `Mono/Time`, then one line per non-empty stage reading
`Turbine Hall — KASIMIR VOLT` in `Body/Small`, stage name in `color/text/secondary` and artist in
`color/text/primary`. Empty stages are omitted entirely in this layout.

### 4.8 FaqRow

Component set `FaqRow`, one variant property `State` with values `collapsed` · `expanded`.

Component properties: `Question` (text), `Answer` (text).

Anatomy: vertical auto-layout, fill container width, gap 0, bottom border 1px `color/border/subtle`.

| Child | Spec |
|---|---|
| `faq/trigger` | Horizontal auto-layout, space between, align centre, fill container width, padding Y `space/6` (24), gap `space/4`. Minimum height 64. |
| `faq/question` | `Display/Card-Title`, `color/text/primary`, fill container |
| `faq/chevron` | 24×24 vector, `color/accent/coolant`. Rotated 180° in `expanded`. |
| `faq/answer` | Shown in `expanded` only. `Body/Base`, `color/text/secondary`, padding bottom `space/6`, padding right `space/12` (48) so the answer clears the chevron column and does not run to the same edge as the question. |

The trigger is the full-width row, not the chevron. A 24×24 chevron alone would technically satisfy the
touch minimum and would still be a poor target.

Add a Dev Mode annotation on `faq/trigger`: `details/summary, or a button with aria-expanded and
aria-controls -> faq/answer id if built custom`. `brief/CONTENT.md` §10 specifies native `<details>` and
`<summary>`, which satisfy both the keyboard requirement in CANON §9 and the no-JavaScript requirement in
`brief/BRIEF.md` §6 without a line of script. The annotation is how that reaches the model that writes
the markup.

### 4.9 Ticker

Component set `Ticker`, one variant property `Motion` with values `animated` · `static`.

Anatomy: fill container width, height 56, clip content on, fill `color/bg/raised`, 1px top and bottom
border `color/border/subtle`. Inside, `ticker/track` — horizontal auto-layout, gap `space/6` (24), align
centre, hug width.

`ticker/track` contains the tags from `brief/CONTENT.md` §5 — the twelve CANON §2 genres plus two
textures of the room — in that order, each as `Mono/Tag` in `color/text/primary`, separated by a 4×4 dot
in `color/accent/arc`:

`INDUSTRIAL TECHNO · DEEP AMBIENT · DRONE · CONCRETE AND STEEL · MODULAR LIVE · HARDWARE TECHNO ·
FIELD RECORDING · TAPE LOOPS · DUB TECHNO · SODIUM LIGHT · NEOCLASSICAL ELECTRONIC ·
PERCUSSIVE AMBIENT · GENERATIVE · GLASSY IDM`

The tags are ink, so they take `color/text/primary`: 14.98:1 on `color/bg/raised`. `Mono/Tag` is 12px,
which is normal text under WCAG however bold it is, and `color/accent/arc` on `color/bg/raised` measures
3.80:1 — over the 3:1 non-text bar, which is why it is right for the separator dots, and under the 4.5:1
text bar, which is why it cannot be the tag colour. CONTRAST.md §5, Trap 3 states the rule: arc is a fill
that takes `bg/base` ink, never ink itself. Arc stays in the marquee, as CANON §4 asks, as the thing
between the words.

The full set is duplicated twice inside the track so the loop has something to scroll into. The animated
strip is `aria-hidden`; the visually hidden sentence in `brief/CONTENT.md` §5 is its accessible
equivalent and sits beside it.

| Variant | Meaning |
|---|---|
| `animated` | Track translated left; the CSS animates it |
| `static` | Track at origin, no animation. This is the `prefers-reduced-motion: reduce` rendering required by CANON §9 and it is a real variant, not a note. |

The `static` variant is what the implementation reads to build the reduced-motion branch. If it is not
in the file, the model invents whether reduced motion means slower, paused or absent.

### 4.10 Footer

Component `Footer`, one variant property `Layout` with values `wide` · `stacked`.

Component properties: none. The four link columns are real nested frames, not properties, because their
content is fixed.

`wide` — used at 1440. Fill `color/bg/surface`, top border 1px `color/border/subtle`, padding Y `space/24`
(96), padding X `responsive/gutter`. Inside, a container at `responsive/container-max`, vertical
auto-layout, gap `space/12` (48).

| Row | Spec |
|---|---|
| `footer/top` | Horizontal auto-layout, gap `space/6` (24), align start. First child `footer/brand` fixed 384; then four `footer/column` frames fixed 180 each. 384 + 4×180 + 4×24 = 1200. |
| `footer/brand` | Wordmark in `Display/Wordmark-Nav`, then the tagline `Three nights inside the machine` in `Body/Small`, `color/text/secondary` |
| `footer/column` | Vertical auto-layout, gap `space/3` (12). Heading in `Label/Eyebrow`, `color/text/secondary`; four links in `Body/Small`, `color/text/primary`, each with 8px vertical padding. |
| `footer/divider` | 1px rule, `color/border/subtle`, fill container width |
| `footer/bottom` | Horizontal auto-layout, space between, align centre. The first two legal lines left in `Legal/Fine`, `color/text/secondary`; socials right as three 24×24 icons with 12px padding, `color/text/secondary`. `brief/CONTENT.md` §12 fixes three socials, not four, and three legal lines — the third is the fiction disclaimer below. |
| `footer/disclaimer` | Fill container width. `Legal/Fine`, `color/text/secondary`. The exact CANON §1 disclaimer text. |

Column headings and links, verbatim from `brief/CONTENT.md` §12, which also fixes every target:

| Festival | Visit | Contact | Small print |
|---|---|---|---|
| Lineup | Getting here | hello@turbine.fm | Terms of entry |
| Programme | Accessibility | access@turbine.fm | Privacy |
| Venue | What to bring | Three emails a year | House rules |
| Tickets | Lockers and cloakroom | Questions | Credits |

Three of the Visit links point at FAQ item ids — `#faq-accessibility`, `#faq-bring`, `#faq-lockers` —
which is why §5.8 keeps CONTENT.md's ids rather than numbering the accordion itself.

Both rows were `color/text/muted` until the contrast matrix was computed. `Legal/Fine` is 12px, so
muted legal copy measures 4.07:1 on `bg/base` and 3.78:1 on `bg/surface` — normal text as far as axe
is concerned, and a `color-contrast` violation against ACCEPTANCE AC-15, which is blocking and admits
no exemption for small print. AC-28 permits `color/text/muted` inside `[data-legal]`; it does not
require it. So the shipped page uses `color/text/secondary` here and renders `color/text/muted`
nowhere. See `design/tokens/CONTRAST.md` §5, Trap 1.

`color/text/muted` still exists as a variable and still appears on the cover frame, on its own
specimen and in the proof sheet, because those are the places where showing the trap is the point.
Anywhere in the three viewport frames it is a bug.

`stacked` — used at 768 and 390. `footer/top` becomes a wrapped grid: brand full width, then the four
columns in a 2×2 arrangement, column width 340 at 768 and 163 at 390, gap `space/6` / `space/4`.
`footer/bottom` stacks vertically, gap `space/4`, socials first.

---

## 5. Layout at 1440

Grid on `TURBINE / Desktop 1440`: 12 columns, stretch, gutter 24, margin 120. Column width is
(1200 − 11×24) / 12 = 78. Margin 120 rather than the 48 gutter because the content is capped at
`size/content-max` 1200 and centred; 48 only binds below 1296px viewport width.

Every section follows one shell:

```
section-<name>            fill 1440, vertical auto-layout, gap 0,
                          padding Y = responsive/section-pad-y (128),
                          padding X = responsive/gutter (48),
                          fill = color/bg/base unless stated
  container               fill container, max width 1200, centred,
                          vertical auto-layout, gap space/12 (48)
    section-header        vertical auto-layout, gap space/3 (12)
      eyebrow             Label/Eyebrow, color/accent/sodium
      h2                  Display/Section, color/text/primary
      intro               Body/Lead, color/text/secondary, max width 720
    <section content>
```

Max width on an auto-layout child is a real Figma property. Use it. Do not fake a 1200 container with
a fixed-width frame that stops resizing the moment someone drags the section.

Nav, Hero, Ticker and Footer override the shell where noted.

**Who owns the strings.** `brief/CONTENT.md` owns every heading, intro, label, answer and alt attribute
on the composed page, and `brief/BRIEF.md` says a missing string is a question rather than a gap to fill.
The one exception is the eyebrow above each `h2`: CONTENT.md carries none, this file fixes the five, and
§12 records them so the string on the page traces to a document rather than to someone's judgement.
Everything else below quotes CONTENT.md or points at the section of it that holds the copy. Where the two
files have disagreed, CONTENT.md has won, because that is the file the CONTENT gate reads.

### 5.0 section-skip-link

| Property | Value |
|---|---|
| Height | 0 in a composed frame; the instance inside is hidden until focused |
| Layout | One `a11y/skip-link` instance, absolutely positioned at left `responsive/gutter`, top 8. See §5.12. |
| Fill | none |
| Position | The first child of `TURBINE / Desktop 1440`, above `section-nav` |

The skip link is a section in its own right, not a child of the nav. CANON §7 lists it as section 1, and
`brief/ACCEPTANCE.md` AC-06 reads the eleven `[data-section]` elements in DOM order beginning with
`skip-link`; nesting it inside `section-nav` yields ten and fails with *expected 11 sections in canonical
order, found 10*. It is the one section with no export — §8.2 gives the reason.

### 5.1 section-nav

| Property | Value |
|---|---|
| Height | 72, fixed |
| Layout | `Nav` instance, `Layout=full`, `Active=none`, fill container width |
| Padding and fill | As §4.3. The `Nav` component already carries both. Declaring them again here insets the wordmark 96px from the edge at 1440 and puts the nav out of line with every other section; §5.10 defers to §4.10 the same way, and that is the pattern. |
| Position | Sticky at top of `TURBINE / Desktop 1440` |

### 5.2 section-hero

| Property | Value |
|---|---|
| Height | 780, fixed |
| Layout | Vertical auto-layout, gap `space/8` (32), align left, justify **end**. The children sit in a container at `responsive/container-max` (1200), centred, exactly as the §5 shell does. |
| Padding | X `responsive/gutter` (48), top `space/32` (128), bottom `space/24` (96) |
| Fill | Image `hero-hall.jpg`, crop, plus an overlay rectangle `hero/scrim` — linear gradient from `color/bg/base` at 90% (bottom) to `color/bg/base` at 20% (top) |

The scrim exists so the wordmark keeps its contrast over a photograph. Without it the contrast of the
`h1` depends on the image, which no tool can check and no reviewer can approve.

The gutter plus a 1200 container puts the wordmark 120px from the frame edge at 1440, which is where the
hand-typed `X 120` used to put it. 120 and 160 are not steps on the spacing scale, and AC-32 fails any
declared padding that is not; deriving the offset from the container instead of typing it keeps the
number and passes the gate.

| Child | Content | Style |
|---|---|---|
| `hero/eyebrow` | `Fourth edition` | `Label/Eyebrow`, `color/accent/sodium` |
| `hero/wordmark` | The `h1`, on two lines: `TURBINE`, then `hero/tagline` nested inside it | `Display/Wordmark-Hero` at 96, `color/text/primary` |
| `hero/tagline` | `Three nights inside the machine` | A child of `hero/wordmark`, not a sibling. `Body/Lead`, `color/text/primary` |
| `hero/secondary` | `Ambient, techno and modular sound in a hall built for power.` | `Body/Lead`, `color/text/secondary` |
| `hero/dates` | `Friday 12 – Sunday 14 June 2027` | `Body/Base`, `color/text/secondary` |
| `hero/venue` | `The Powerhouse, Hall E · Kraków` | `Body/Base`, `color/text/secondary` |
| `hero/ctas` | Horizontal auto-layout, gap `space/4` (16) | `Button` primary md `Get tickets` to `#tickets`; `Button` secondary md `See the lineup` to `#lineup` |
| `hero/scroll-cue` | Visible text `Scroll` beside a 24×24 chevron, absolute, bottom 32, centre | `Body/Small`, `color/text/secondary`. A link to `#lineup`; the chevron is decorative. Motion stops under `prefers-reduced-motion`; annotate it. |

Every string here is `brief/CONTENT.md` §4 verbatim. The hero is the one region with a 0.5% pixel budget
(`brief/ACCEPTANCE.md` AC-35), the tightest number in the pipeline, so it is also the region where a
paraphrase costs most: a hero built from a different element count cannot land inside it. The tagline
nests inside the `h1` because CONTENT.md puts it there in a `<span>`, which makes the heading's
accessible name read `TURBINE Three nights inside the machine`. As a sibling it would change the
accessible name of the only `h1` on the page.

The wordmark at 96px with +0.18em tracking measures roughly 578px wide. It fits the 1200 container with
no risk of a line break, which is why 96 is the top of the scale rather than something larger.

There is exactly one `h1` in the file and it is `hero/wordmark`. CANON §9.

### 5.3 section-ticker

| Property | Value |
|---|---|
| Height | 56, fixed |
| Layout | `Ticker` instance, `Motion=animated`, full bleed 1440 |
| Padding | X 0. This section ignores the gutter on purpose; the marquee runs edge to edge. |

### 5.4 section-lineup

Shell as above. Container gap `space/12` (48).

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Twelve artists`; h2 and intro from `brief/CONTENT.md` §6 |
| `lineup/tabs` | `TabBar` instance, `Active=all`, hug width, aligned left |
| `lineup/status` | A text node under the tabs. `Body/Small`, `color/text/secondary`. The four strings are in `brief/CONTENT.md` §6; it is `aria-live="polite"` and is rewritten on every filter change. |
| `lineup/grid` | Horizontal auto-layout with wrap on, gap 24 both axes, fill container width. Twelve `ArtistCard` instances, fixed width 282. (1200 − 3×24) / 4 = 282, giving four per row and three rows. |

Card order follows the CANON §2 table, rows 1 to 12: KASIMIR VOLT, Lena Orbis, NULLSET, Auric Drift,
Mara Teschke, SUBSTATION 9, Hiroko Vane, Cold Cathode, Ilse Rüm, TAPE DECAY, Odalys Ferrer, VITRINE.
Billing variant per card follows the CANON billing column: rows 1–3 `headliner`, rows 4–6 `main`, rows
7–12 `support`.

Annotate `lineup/tabs`: `role=tablist, each tab role=tab with aria-selected, panel is lineup/grid`.

### 5.5 section-programme

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Three nights`; h2 `Programme`; intro from `brief/CONTENT.md` §7 |
| `programme/days` | Vertical auto-layout, gap `space/12` (48), fill container width |
| `programme/note` | Below the days. `Body/Small`, `color/text/secondary`. The times-can-move note in `brief/CONTENT.md` §7. |

Three `programme/day` frames — vertical auto-layout, gap `space/4` (16), fill container width:

| Part | Spec |
|---|---|
| `day/heading` | `Display/Subsection`, `color/text/primary`. `Friday 12 June`, `Saturday 13 June`, `Sunday 14 June`. |
| `day/doors` | `Mono/Time`, `color/text/secondary`. One per day, from `brief/CONTENT.md` §7. Friday and Saturday read `Doors 19:00 · Last set ends 04:00 · Hall clears 04:30`; Sunday is a different day and reads `Doors 17:30 · Last set ends 02:00 · Hall clears 02:30`. |
| `day/daytime` | Saturday only, above the table. `Body/Small`, `color/text/secondary`. The 14:00 – 17:00 modular synthesis workshop line in `brief/CONTENT.md` §7. |
| `day/caption` | The table caption for that day from `brief/CONTENT.md` §7. Visually hidden is acceptable, so in the composed frames it sits at 0% opacity and its visible state lives on `Design system`. |
| `day/table-head` | `TimetableRow` styling but a header row: fill `color/bg/raised`, `Label/Eyebrow`, `color/text/secondary`, cells `Time`, `Turbine Hall`, `Boiler Room`, `Cooling Tower`, radius `radius/sm` on the top corners |
| `day/rows` | Four `TimetableRow` instances, `Layout=table-row`, `Zebra` alternating false/true/false/true |

Row contents are `brief/CONTENT.md` §7 verbatim: four sets a night, one stage at a time, with real ranges
rather than start times. Do not regenerate them from CANON §2. CANON fixes each artist's day and stage and
says nothing about time, and a rule like "support at 20:00, main at 22:00, headliner at 00:00" cannot be
satisfied: Cold Cathode and Odalys Ferrer are both support, both on Saturday, both on Cooling Tower, so the
rule puts two sets in one slot on one stage. CONTENT.md's lineup intro promises that nothing you want to
hear runs against anything else you want to hear, and a timetable with a clash printed under that sentence
is exactly the failure this workshop exists to demonstrate.

**Friday 12 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 19:30 – 21:00 | — | — | Hiroko Vane |
| 21:15 – 22:45 | — | TAPE DECAY | — |
| 23:00 – 00:45 | — | Auric Drift | — |
| 01:00 – 04:00 | KASIMIR VOLT | — | — |

**Saturday 13 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 19:30 – 21:00 | — | — | Odalys Ferrer |
| 21:15 – 23:00 | — | — | Cold Cathode |
| 23:15 – 01:00 | — | Mara Teschke | — |
| 01:15 – 04:00 | Lena Orbis | — | — |

**Sunday 14 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 18:00 – 19:30 | — | — | Ilse Rüm |
| 19:45 – 21:15 | — | VITRINE | — |
| 21:30 – 23:15 | — | SUBSTATION 9 | — |
| 23:30 – 02:00 | NULLSET | — | — |

Annotate `programme/days`: `table with caption per day, th scope=col for stage columns, th scope=row for time`.

### 5.6 section-venue

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `The building`; h2 `The Powerhouse, Hall E` from `brief/CONTENT.md` §8. `Venue` is the section slug and the nav label, not the heading. No intro: CONTENT.md puts three paragraphs in `venue/text` instead. |
| `venue/split` | Horizontal auto-layout, gap `space/12` (48), align start, fill container width |
| `venue/image` | Fill container (576), aspect 4:3, image `venue-exterior.jpg`, radius `radius/md` |
| `venue/text` | Fill container (576), vertical auto-layout, gap `space/4` (16). The three paragraphs in `brief/CONTENT.md` §8, `Body/Base`, `color/text/secondary`. |
| `venue/lower` | Horizontal auto-layout, gap `space/12` (48), fill container width, margin top `space/12` |
| `venue/travel` | Fill container (576), vertical auto-layout, gap `space/6` (24). An `h3` `Getting here`, the address line, then four items, each a vertical stack: term in `Label/Eyebrow` `color/text/secondary`, description in `Body/Base` `color/text/primary`. Terms, descriptions and the line about parking are `brief/CONTENT.md` §8: `Tram`, `Train`, `Bike`, `Accessibility`. |
| `venue/map` | Fill container (576), height 320, fill `color/bg/raised`, 1px `color/border/subtle`, radius `radius/md`. A static map placeholder built in Figma, with a centred `Mono/Tag` label `MAP PLACEHOLDER` in `color/text/secondary` and the map caption from `brief/CONTENT.md` §8 below it in `Body/Small`. |

`venue/split` at 1200 with a 48 gap gives two 576 columns.

The map is a placeholder by design. CANON §11 rules out third-party embeds and trackers, and a Google
Maps iframe is both.

### 5.7 section-tickets

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Three ways in`; h2 `Tickets`; intro from `brief/CONTENT.md` §9 |
| `tickets/cards` | Horizontal auto-layout, gap `space/6` (24), align stretch, fill container width. Three `TicketCard` instances at (1200 − 2×24) / 3 = 384. |
| `tickets/comparison` | Vertical auto-layout, gap 0, fill container width, 1px `color/border/subtle`, radius `radius/md`. Seven rows and a caption, from `brief/CONTENT.md` §9 — each row a horizontal auto-layout with a feature label (fill) and three 120-wide cells. The cells carry the words CONTENT.md gives them, not ticks: `Yes`, `No` and `Free` survive a screen reader, and a tick glyph does not. |
| `tickets/access` | Horizontal auto-layout, gap `space/4` (16), padding `space/6` (24), fill `color/bg/surface`, 1px `color/accent/coolant`, radius `radius/md`. A 24×24 icon plus the CANON §3 access note in `Body/Base`, `color/text/primary`. |

Card instances, in order:

| Position | Tier | Price | Variant | Badge |
|---|---|---|---|---|
| 1 | Single Night | €45 | `standard` | none |
| 2 | Full Pass | €110 | `highlighted` | `Most popular` |
| 3 | Full Pass + Workshop | €165 | `standard` | none |

Prices and tiers are CANON §3. Every string inside the cards — the price suffix, the inclusion list, the
button label and the workshop availability line — is `brief/CONTENT.md` §9, including the fact that only
card 2 carries a badge and that each button has its own label rather than three identical ones.

The access note is required near the pricing table by CANON §3 and its exact wording is fixed there. It
is not decoration and it is not moveable to the footer.

### 5.8 section-faq

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Before you come`; h2 and intro from `brief/CONTENT.md` §10 |
| `faq/list` | Vertical auto-layout, gap 0, width 800, centred in the container, top border 1px `color/border/subtle` |

Eight `FaqRow` instances, **all `State=collapsed`**, in the order `brief/CONTENT.md` §10 fixes and
carrying its questions and its ids:

| # | id | Question |
|---|---|---|
| 1 | `faq-times` | What time does it start and finish? |
| 2 | `faq-age` | Is there an age limit? |
| 3 | `faq-reentry` | Can I leave and come back? |
| 4 | `faq-accessibility` | What is the site like if I have access needs? |
| 5 | `faq-bring` | What should I bring? |
| 6 | `faq-cashless` | Is the site cashless? |
| 7 | `faq-weather` | What happens if it rains? |
| 8 | `faq-lockers` | Are there lockers? |

The ids are not decoration. The footer's Visit column links to three of them (§4.10), so renaming one
breaks a link the LINKS gate resolves.

All eight are collapsed because CONTENT.md ships them collapsed on load, and the composed frame is the
baseline the visual gate compares the shipped page against. An expanded first row would put an open
answer in the baseline that the page never renders, and the FAQ would differ at every breakpoint on every
run — a permanent red with no repair available to the loop. The `expanded` variant is shown once, on
`Design system`, which is where a component gallery belongs.

Answer copy is owned by the brief and is not restated here. In the Figma file each answer is set in
`Body/Base`, `color/text/secondary`, from `brief/CONTENT.md` §10.

### 5.9 section-newsletter

| Property | Value |
|---|---|
| Fill | `color/bg/surface` |
| Padding | Y `responsive/section-pad-y` (128), X `responsive/gutter` (48) |
| Container | Width 560, centred, vertical auto-layout, gap `space/6` (24), align centre |

| Child | Spec |
|---|---|
| `newsletter/h2` | An `h2`, styled `Display/Subsection` because the section is a 560-wide centred column rather than a full-width band. `color/text/primary`, centred. `Three emails a year`, from `brief/CONTENT.md` §11. |
| `newsletter/pitch` | `Body/Base`, `color/text/secondary`, centred. The one-line pitch in `brief/CONTENT.md` §11. |
| `newsletter/form` | Vertical auto-layout, gap `space/4` (16), fill container width |
| `newsletter/email` | `Input` instance, `Type=email`, `Required=true`. Label and placeholder from `brief/CONTENT.md` §11. |
| `newsletter/consent` | `Input` instance, `Type=checkbox`, unchecked. Label from `brief/CONTENT.md` §11. |
| `newsletter/submit` | `Button`, `Variant=primary`, `Size=md`, fill container width. Label from `brief/CONTENT.md` §11 (`Sign up`). |
| `newsletter/note` | `Body/Small`, `color/text/secondary`. The line under the form and the fixture note, both from `brief/CONTENT.md` §11. |

Add a Dev Mode annotation on `newsletter/form`: `visible label above every input, never a placeholder
standing in for one. Consent unchecked on load and never pre-selected by script. Validation and
confirmation messages announced with aria-live=polite, never as an alert dialog.`

The consent box ships unchecked and the submit button says `Sign up`, not `Yes, I want in`. CANON §11
rules out dark patterns by ruling out the things that need them, and a pre-ticked box is the one that
sneaks back in.

### 5.10 section-footer

`Footer` instance, `Layout=wide`, fill container width. Padding and internals as §4.10.

### 5.11 Vertical order and total height

| # | Section | Height at 1440 |
|---|---|---|
| 1 | `section-skip-link` | 0 (hidden until focused) |
| 2 | `section-nav` | 72 (sticky) |
| 3 | `section-hero` | 780 |
| 4 | `section-ticker` | 56 |
| 5 | `section-lineup` | approx. 1900 |
| 6 | `section-programme` | approx. 1560 |
| 7 | `section-venue` | approx. 1290 |
| 8 | `section-tickets` | approx. 1360 |
| 9 | `section-faq` | approx. 1080 |
| 10 | `section-newsletter` | approx. 640 |
| 11 | `section-footer` | approx. 590 |

Eleven sections, matching CANON §7 and the eleven `[data-section]` values AC-06 reads. Lineup and
programme are taller than they were: the card gained a sentence (§4.5) and each day gained a fourth row,
a doors line and a caption (§5.5).

Heights after the ticker are the result of hugging content and will shift as copy lands. They are listed
so a build can be sanity-checked, not so they can be typed in. Do not set a fixed height on any section
below the ticker.

### 5.12 Skip link

`a11y/skip-link` — a component on `Design system`, instanced once into each viewport frame inside
`section-skip-link` (§5.0), which is the first child of the frame and sits above `section-nav`.
Absolutely positioned at left `responsive/gutter`, top 8.

Horizontal auto-layout, padding 12/16, height 40, fill `color/accent/coolant`, radius `radius/sm`, text
`Skip to main content` in `Label/Button-Small`, `color/bg/base`. That string is `brief/CONTENT.md` §2 and
§14 verbatim, and its target is `#main`.

In the composed frames the instance is set to 0% opacity and named `a11y/skip-link (hidden until
focused)`. The visible state lives on `Design system`. CANON §9 requires it as the first focusable
element; leaving it out of the file is the reason implementations forget it.

---

## 6. Deltas at 768

Frame `TURBINE / Tablet 768`, mode `Tablet 768`. Grid: 8 columns, stretch, gutter 24, margin 32.
Column width (704 − 7×24) / 8 = 67.

Everything not listed here is unchanged. The mode switch already handles gutter 32, section padding 96,
and the four responsive type sizes.

| Section | Change at 768 |
|---|---|
| `section-nav` | `Nav` stays `Layout=full`. Height 72 → 64. Padding and fill stay inside the component (§4.3) and the gutter follows the frame mode; nothing is redeclared on the wrapper. Link gap 32 → 24, links drop to `Body/Small-Medium`. CANON §7 puts the hamburger *below* 768, so 768 keeps the full bar. |
| `section-hero` | Height 780 → 700. Padding X follows `responsive/gutter` (32) with the container capped at 704, so nothing is retyped; padding top 128 → 96 (`space/24`), bottom 64. Wordmark 96 → 72 by mode. `hero/ctas` stays horizontal. |
| `section-ticker` | Height 56 → 48 |
| `section-lineup` | Grid 4 columns → 3. Card width fixed 282 → fill container, giving (704 − 2×24) / 3 = 218.67. Portrait stays 4:5. Tabs unchanged. |
| `section-programme` | `row/time` 128 → 112, which still holds `19:30 – 21:00`. Stage cells fill, approx. 190 each. `Layout=table-row` retained. The doors line, the Saturday daytime line and the caption carry over unchanged. |
| `section-venue` | `venue/split` and `venue/lower` become vertical. Image full width 704, aspect 16:9. Map full width 704 × 280. Travel items become a 2-column wrapped row. |
| `section-tickets` | Cards stack vertically, gap `space/4` (16), each fill container with max width 480, centred. `highlighted` keeps its 2px sodium border but loses the extra padding. Comparison table cells 120 → 96. |
| `section-faq` | `faq/list` width 800 → fill container (704) |
| `section-newsletter` | Container 560 → 480 |
| `section-footer` | `Layout=wide` → `stacked`. Brand full width, four columns as a 2×2 grid at 340 wide, gap 24. |

---

## 7. Deltas at 390

Frame `TURBINE / Mobile 390`, mode `Mobile 390`. Grid: 4 columns, stretch, gutter 16, margin 24.
Column width (342 − 3×16) / 4 = 73.5.

| Section | Change at 390 |
|---|---|
| `section-nav` | `Nav` switches to `Layout=compact`. Height 64; padding follows the mode gutter inside the component. Wordmark left, the 48×48 icon-only menu button of §4.3 right. `nav/links` present but hidden. |
| `section-hero` | Height 700 → 600. Padding X follows the mode gutter (24), top 96, bottom 64. Gap 32 → 16. Wordmark 40 by mode (roughly 240px wide, clearing the 342 container). `hero/dates` and `hero/venue` each keep their own line. `hero/ctas` becomes vertical, gap 12, both buttons fill container width at height 48. |
| `section-ticker` | Height 48 → 44. Tag gap 24 → 16. |
| `section-lineup` | Grid 3 columns → 2. Card width (342 − 16) / 2 = 163. `artist/name` overrides to 16 for `headliner` as well; `artist/meta` stacks vertically. Tabs scroll horizontally with a 24px bleed to the right edge to signal there is more. |
| `section-programme` | `TimetableRow` switches to `Layout=stacked`. `day/table-head` is hidden; the stage name moves inside each row. Empty stages are omitted rather than shown as an em dash. |
| `section-venue` | Image 342, aspect 4:3. Travel items one per row. Map 342 × 200. |
| `section-tickets` | Cards stacked, fill container width, padding `space/6` → `space/4` (16). Comparison table becomes three stacked per-tier lists, one per card, because a four-column table does not survive 342px. |
| `section-faq` | `faq/list` fill container (342). `faq/trigger` padding Y 24 → 16, minimum height 56. `faq/answer` right padding 48 → 0. |
| `section-newsletter` | Container 480 → fill (342). Submit button full width. |
| `section-footer` | `Layout=stacked`. Columns 2×2 at 163 wide, gap 16. `footer/bottom` vertical, socials above legal. |

Section vertical padding is 64 everywhere at 390 through `responsive/section-pad-y`. Do not reduce it
further per section; an inconsistent rhythm at mobile is the first thing that shows up in the diff.

Mobile frames are 390 wide. Not 375, not 393, not 360. CANON §6 fixes the three widths that are
screenshotted and diffed, and a frame at any other width produces a diff that can never pass.

---

## 8. Exports

### 8.0 The participant's export, and why it is SVG

A workshop participant does not receive this file's exports. They **duplicate the published file to
their own drafts, select the frames, export, and hand their agent the zip Figma gives them.** Three
clicks, all of them ones a designer already knows, and no plugin.

For that zip to be worth anything it has to come out as **SVG as well as PNG**, and the export
settings saved on the layers are what decides that for them.

A PNG is a picture of the design. An agent reading one infers every colour from pixels and every
measurement from edges, and it will be *nearly* right — an orange, some spacing — which is precisely
what fails a token check and looks subtly wrong beside the real thing. A Figma SVG export keeps every
string as a `<text>` node and every fill as a literal value. There is nothing left to infer, and no
plugin, no Dev Mode seat and no MCP connection is involved.

Two consequences for this file:

- **Every layer that carries a persistent PNG export setting also carries an SVG one.** Same layers,
  same names, two formats. A participant selecting the frames and pressing Export gets both.
- **"Outline text" must be off** on every SVG export setting. It turns each word into a path, which
  looks identical and leaves the copy unreadable to anything without eyes. It is the single failure
  of this route and it is silent.

The `Design system` page matters here as much as the viewport pages. Exported as SVG, the variable
proof sheet (§2.6) and the type specimens (§3.1) carry every token name beside its value as real
text — which is how the agent gets the palette without anyone shipping a `tokens.json`.

**Verify the export once, with a program, before the link goes to thirty people:**

```bash
node checks/handoff.mjs ~/Downloads/turbine-export.zip
```

It reports how much of the export is readable as data and exits non-zero if an agent would have to
guess: no SVG at all, text flattened to outlines, too few distinct colours, or no copy. A zip that
looks fine in Finder and is useless to an agent looks exactly like one that is not, which is the
reason this is a program and not a glance.

### 8.1 Naming convention

Two patterns, no others:

```
section-<section>-<width>.png     one per section, per breakpoint
full-page-<width>.png             one per breakpoint
```

- `<section>` is the lowercase slug from the section frame name with the `section-` prefix removed:
  `nav`, `hero`, `ticker`, `lineup`, `programme`, `venue`, `tickets`, `faq`, `newsletter`, `footer`.
- `<width>` is `390`, `768` or `1440`. No `@2x`, no `mobile`, no `sm`.
- The slug is identical to the `id` attribute on the corresponding `<section>` element in the markup and
  to the `data-section` value Playwright uses to locate it. One string, three places. If the Figma layer
  is renamed, the markup and the test are renamed in the same commit.
- The visual gate resolves two spellings for each baseline it reads, in this order: the full page as
  `<width>.png` then `full-page-<width>.png`, the hero as `section-hero-<width>.png` then
  `hero-<width>.png`. Both work on purpose. `brief/ACCEPTANCE.md` AC-34 names
  `design/export/{390,768,1440}.png` and `npm run baseline` writes those; a straight Figma export writes
  the names above. The three files committed today are the `<width>.png` form, produced by
  `npm run baseline` from the reference build — `design/export/README.md` says so, and says what the
  difference means.

### 8.2 The export list

Thirty-three files in `design/export/`. Three of them are read by a gate, and it is worth being exact
about which. `brief/ACCEPTANCE.md` AC-34 compares each full-page screenshot against the full-page
baseline for that width, and AC-35 compares the hero region against `section-hero-<width>.png`. There is
no per-section criterion anywhere in ACCEPTANCE, so the remaining twenty-seven section PNGs are review
material rather than gate input: they are what lets a person say *which* part moved when AC-34 goes red,
and they earn their place for that alone. The directory also carries its own `README.md`, which is not an
export and is not on this list.

| Source layer | Files |
|---|---|
| `section-nav` | `section-nav-390.png`, `section-nav-768.png`, `section-nav-1440.png` |
| `section-hero` | `section-hero-390.png`, `section-hero-768.png`, `section-hero-1440.png` |
| `section-ticker` | `section-ticker-390.png`, `section-ticker-768.png`, `section-ticker-1440.png` |
| `section-lineup` | `section-lineup-390.png`, `section-lineup-768.png`, `section-lineup-1440.png` |
| `section-programme` | `section-programme-390.png`, `section-programme-768.png`, `section-programme-1440.png` |
| `section-venue` | `section-venue-390.png`, `section-venue-768.png`, `section-venue-1440.png` |
| `section-tickets` | `section-tickets-390.png`, `section-tickets-768.png`, `section-tickets-1440.png` |
| `section-faq` | `section-faq-390.png`, `section-faq-768.png`, `section-faq-1440.png` |
| `section-newsletter` | `section-newsletter-390.png`, `section-newsletter-768.png`, `section-newsletter-1440.png` |
| `section-footer` | `section-footer-390.png`, `section-footer-768.png`, `section-footer-1440.png` |
| `TURBINE / Mobile 390` | `full-page-390.png` |
| `TURBINE / Tablet 768` | `full-page-768.png` |
| `TURBINE / Desktop 1440` | `full-page-1440.png` |

`section-skip-link` is deliberately absent from the list. It has no visual footprint in the composed
frames, so a diff of it would compare two empty rectangles. Its focused state is not exported either: it
lives visibly on the `Design system` page (§5.12), where a reviewer can see it without a gate reading it.
`design/assets/` is not an alternative home for it — that directory is generated, not exported (§8.4).

### 8.3 Export settings

| Setting | Value | Why |
|---|---|---|
| Format | PNG | Lossless. A JPEG artefact reads as a layout difference. |
| Scale | **1x** | The PNG width must equal the CSS pixel width so a 1440 export is 1440px wide. Playwright must run with `deviceScaleFactor: 1` for the same reason. A 2x export against a 1x screenshot fails every comparison for a reason that has nothing to do with the design. |
| Suffix | `-1440` on every layer on the `Desktop 1440` page, `-768` on `Tablet 768`, `-390` on `Mobile 390` | A Figma export is named layer name + suffix. A layer called `section-nav` with no suffix exports as `section-nav.png`, and the three pages each hold a `section-nav`, so with no suffix they collide on one filename and two of the three are lost. The suffix is where the width in §8.2's filenames comes from; it is not reserved for `@2x`. |
| Colour profile | sRGB | |
| Contents only | off | The frame's own background must be in the image, or every section exports onto transparency and diffs against a dark screenshot. |

Set these as persistent export settings on each of the thirty-three source layers — ten section frames
on each of the three viewport pages, plus the three viewport frames themselves — then use a single
`Export` action. Thirty-three layers, thirty-three files, one action. Do not export by hand-picking
layers each time; the list drifts within two sessions.

### 8.4 Image assets

Figma exports no image. The pack is generated from `design/assets/PROMPTS.md` by
`scripts/generate-images.mjs`, committed to `design/assets/`, and listed with exact dimensions in
`design/assets/manifest.json`; `brief/CONTENT.md` §13 carries the alt text for each file. The frames on
the `Exports` page place those files as image fills and must not rename them.

| Frame | File | Size | Format |
|---|---|---|---|
| `asset/hero` | `hero-hall.jpg` | 2400×1350 | JPEG |
| `asset/venue` | `venue-exterior.jpg` | 1600×1200 | JPEG |
| `asset/venue-detail` | `venue-detail.jpg` | 1600×1200 | JPEG |
| `asset/artist/<nn>-<slug>` ×12 | `artist-01-kasimir-volt.jpg` … `artist-12-vitrine.jpg` | 800×800 | JPEG |
| `asset/og` | `og-card.jpg` | 1200×630 | JPEG |
| `asset/texture/<name>` ×2 | `texture-grain.png`, `texture-scanline.png` | 256×256 | PNG |

There is no map file. The static map placeholder in §5.6 is a bordered box with a label, not an image,
and CANON §11 rules out the real thing because every embeddable map is a third-party request.

Filenames are numbered in CANON §2 order and carry the artist slug. Diacritics are stripped in
filenames and only in filenames: `Ilse Rüm` is `artist-09-ilse-rum.jpg` on disk and `Ilse Rüm` in every
piece of visible text. The same rule gives `SUBSTATION 9` the slug `substation-9`.

Every image frame carries its `alt` text in the Figma layer description, because that is the field the
Dev Mode MCP server returns. Decorative images carry the literal string `alt=""`. CANON §9 requires
meaningful alt on all images, and the only reliable way to get it is for the designer to write it while
the image is in front of them.

### 8.5 What the diff gate does with these

For reference, so the export decisions above make sense. The budgets belong to `brief/ACCEPTANCE.md` and
are quoted here, not set here:

- **AC-34** — a full-page screenshot at 390, 768 and 1440, taken with `deviceScaleFactor: 1` and resized
  by nothing, may differ from the full-page baseline by at most **1.5% of pixels**, at a per-pixel match
  threshold of **0.1**.
- **AC-35** — the hero region, clipped out of that same capture rather than shot separately, may differ
  by at most **0.5%**. It is the tightest number in the pipeline, which is why §5.2 takes its strings and
  its element count from `brief/CONTENT.md` §4 rather than paraphrasing them.

Anti-aliasing on text and the sub-pixel line-height difference noted in §3 sit comfortably inside 1.5%; a
wrong colour, a wrong gap or a wrong font does not. There is no per-section budget, because there is no
per-section criterion — the twenty-seven section PNGs are read by a person, not by a program.

---

## 9. Dev Mode readiness

The Figma MCP server returns a structured description of the selected node. What it returns is only as
good as the file. The following must be true before the loop is pointed at a node.

**Select and share the right node.** The loop is given a node link per section
(`?node-id=` from the section frame's right-click → Copy link to selection), not a link to the whole
page. A whole-page selection returns thousands of nodes and the model summarises rather than reads.

| Requirement | What breaks without it |
|---|---|
| **Every layer named after what it becomes** | `Frame 427` and `Group 12` return as `Frame427` and the model invents a class name. `section-tickets` returns as `section-tickets` and the model writes `<section id="tickets">`. |
| **Variables bound, never raw hex** | `get_variable_defs` returns nothing for a raw fill. The model emits `#FF6A1A` inline and the token-diff gate fails on the first run. A bound fill returns `color/accent/sodium` and the model writes `bg-accent-sodium`. |
| **Auto-layout everywhere** | A fixed-position child returns as x/y coordinates. The model writes `position: absolute` and the layout dies at the first breakpoint. Auto-layout returns as direction, gap, padding and alignment, which is flex. |
| **Components, not groups** | A group returns as a pile of rectangles. A component instance returns a name, a variant set and its property values, which is a React or Astro component with props. |
| **Text styles applied, no local overrides** | A local override returns as a loose number. Ten loose numbers and the model stops believing there is a type scale. |
| **Variant names match the code's prop values** | `Variant=primary` becomes `variant="primary"` with no translation. `Variant=Primary Orange Big` becomes an invented enum. |
| **Max-width set on containers** | Without it the model has no way to know the content caps at 1200 and hard-codes 1200 as a fixed width. |
| **Layer descriptions carry the semantics a picture cannot** | Alt text, ARIA roles, heading levels, focus order. A picture of an accordion does not say `aria-expanded`. |
| **Dev Mode annotations on the five interactive areas** | `Nav` (§4.3), `lineup/tabs` (§5.4), `programme/days` (§5.5), `faq/trigger` (§4.8), `newsletter/form` (§5.9). These are the five places CANON §9 makes non-negotiable demands, and each annotation's exact wording is given where the component is defined, so a plugin has a string to write and a designer has nothing to invent. `hero/scroll-cue` (§5.2) carries a sixth, on reduced motion. |
| **`Ready for dev` on the three viewport frames only** | Marking everything ready is the same as marking nothing. |
| **No hidden work-in-progress layers inside exported frames** | Hidden layers still return in the node tree. The model builds a `display: none` element nobody asked for. |
| **Images have real image fills, not placeholder rectangles** | `get_image` returns the fill. A grey rectangle named `image` returns a grey rectangle. |

A practical check before handing the file to the loop: select `section-tickets`, ask the MCP server for
its variable definitions, and confirm the response names `color/accent/sodium`, `space/6`, `radius/lg`
and `text/base`. If it returns hex values, the file is not ready and no amount of prompting will fix it.

---

## 10. Common mistakes that break design-to-code

Aimed at the designer building the file. Every one of these has been observed to produce a wrong
implementation that nobody could blame on the model.

1. **Grouping instead of auto-layout.** A group is a bag of coordinates. Auto-layout is flexbox with a
   different name. Select the layers and press Shift+A until nothing is left ungrouped.
2. **Typing a hex into a fill.** It takes four seconds and costs the whole token pipeline. If the colour
   you want is not a variable, the answer is that the design wants a colour the system does not have,
   and that is a conversation, not a keystroke.
3. **Spacing by eye.** 23px and 25px are not on the scale. They become `gap: 23px` in the CSS, then a
   reviewer asks why, and there is no answer. Use `space/6`.
4. **A separate artboard for the hover state.** It is a variant. An artboard called `Button hover` is
   invisible to the component API and the model will not find it, so the site ships with no hover.
5. **Muted grey for supporting copy.** `color/text/muted` on `color/bg/base` is 4.07:1 and fails AA, and
   3.78:1 on `color/bg/surface`, where it is worse rather than better. It is in the palette because it is
   the colour a model reaches for, and no composed frame uses it — not even the footer legal block, see
   §4.10. The accessibility gate will catch it, but catching it after the fact costs a loop iteration.
   `color/text/secondary` is 8.83:1 on the same background.
6. **White text on the orange button.** 2.87:1. The canonical pairing is near-black on orange, which
   looks unusual for about a day and then looks correct.
7. **Text set in caps by typing in caps.** Use the text-case property. Typed caps reach the markup as
   typed caps, a screen reader spells them out letter by letter, and the copy cannot be changed without
   retyping it.
8. **Outlining text to "keep the look".** Outlined text is a vector. It is not searchable, not
   selectable, not translatable, not readable by assistive technology, and it exports as a shape the
   model turns into an SVG heading.
9. **One 4000px-tall frame called `Desktop`.** The diff gate works per section. A single frame produces
   one enormous comparison where a 2px shift in the nav and a missing footer look identical.
10. **A mobile frame at 375.** The three diffed widths are 390, 768 and 1440. A 375 frame produces a
    diff that cannot pass, and the loop will spend an iteration trying to make the code wrong enough to
    match it.
11. **Detached instances.** A detached instance looks the same and behaves like a snowflake. The model
    sees a unique layout and writes unique markup for it. Check the layers panel for the broken-link
    icon before handing over.
12. **Placeholder copy left in place.** Lorem ipsum ships. `Artist name` ships. Whatever is in the text
    layer is what appears on the live site, because the model has no way to know you meant to replace it.
13. **Twelve portraits at twelve different aspect ratios.** The card crops them in Figma, the CSS does
    not, and the lineup grid becomes a staircase. The twelve supplied portraits are all 800×800, which is
    why `artist/portrait` is 1:1 (§4.5) and nothing is cropped. If a replacement ever arrives at another
    ratio, crop it in the file rather than letting the card do it.
14. **Naming the Figma layer one thing and the section `id` another.** `Tickets Section Final` in Figma,
    `#tickets` in the markup, `section-tickets-1440.png` on disk. Pick the slug once and use it three
    times.

---

## 11. Build order

For a designer working by hand or a plugin working by script, this order avoids rework:

1. Create the six pages.
2. Create the four variable collections and every variable in §2. Nothing visual yet.
3. Create the seventeen text styles in §3, binding each property to a variable.
4. Build the ten component sets in §4 on `Design system`, plus `a11y/skip-link`.
5. Build the token proof sheet and type specimen. Read the contrast matrix before continuing.
6. Build `TURBINE / Desktop 1440` section by section in the CANON §7 order — eleven frames,
   `section-skip-link` first.
7. Duplicate to `TURBINE / Tablet 768` and `TURBINE / Mobile 390`, set the frame mode, then apply only
   the deltas in §6 and §7. Do not rebuild.
8. Set the export settings in §8.3 on all thirty-three source layers, each with its page's suffix.
   Export once. Count the files: thirty-three.
9. Run the Dev Mode check in §9 against `section-tickets`.
10. Set `Ready for dev` on the three viewport frames.

---

## 12. Assumptions recorded here, not in CANON

Decisions this specification makes that CANON does not fix. Each is a candidate for promotion to CANON
if it turns out to matter, and each may be overridden without contradicting anything upstream.

| Decision | Value | Why |
|---|---|---|
| Tablet gutter | 32 | CANON fixes 24 mobile and 48 desktop; 32 is the step between |
| Section eyebrows | `Twelve artists`, `Three nights`, `The building`, `Three ways in`, `Before you come` | The one set of visible strings `brief/CONTENT.md` does not carry. Everything else in §5 is CONTENT.md's. |
| Line height scale | `leading/*`, five steps | CANON fixes the type scale and tracking, not leading |
| Off-scale line heights | 130%, 133% and 143% on the five styles named in §3 | The five-step scale has no step there; typed as literals rather than grown for five styles |
| `tracking/wide` | +0.06em | CANON fixes -0.02em display and +0.18em wordmark only |
| Type size names | Tailwind ladder, `xs` to `7xl` | CANON gives eleven rem values with no names |
| Spacing names | Value ÷ 4, matching Tailwind | CANON gives ten px values with no names |
| Figma-only collections | `border/*`, `size/*`, `responsive/*` | Needed to build the file, not fixed by CANON, so absent from `tokens.json` by §2.1 rule 5 |
| Hover treatment | 10% `text/primary` overlay | Keeps the palette at thirteen colours plus the one alias |
| Section heights | The estimates in §5.11 | Content-driven; listed for sanity checks only |
| Export scale | 1x | Required for dimensional parity with a `deviceScaleFactor: 1` screenshot |

Five entries that used to be on this list have been removed, because they were never this file's to
decide. **Set times and doors**, **the eight FAQ questions**, **the footer link inventory** and **the
travel items** are all fixed in `brief/CONTENT.md`; §5 points at it, and the CONTENT gate matches its
strings against the rendered page. **The diff thresholds** are fixed in `brief/ACCEPTANCE.md` AC-34 and
AC-35, and §8.5 quotes them rather than restating them. Recording another file's decision as your own
assumption is an invitation to the next reader to override it, which is how two artifacts in one
repository end up saying different things to the same agent.
