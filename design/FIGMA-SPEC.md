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
| 3 | `Desktop 1440` | Canonical composition | One frame, `TURBINE / Desktop 1440`, containing the 10 exported section frames |
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

`design/tokens/tokens.json` is the machine-readable token source. Figma variable names are derived from
it by a single mechanical rule, so that a string in one file can be found in the other by literal search.

```
tokens.json dot path        ->   Figma variable name
color.bg.base               ->   color/bg/base
text.xl                     ->   text/xl
space.6                     ->   space/6
radius.pill                 ->   radius/pill
responsive.gutter           ->   responsive/gutter
```

Rules, in full:

1. Replace `.` with `/`. Nothing else changes.
2. Keep the leading segment (`color/`, `space/`) even though the collection is already called Color or
   Scale. The redundancy is deliberate: the plugin does a literal match on the full path, and a variable
   named `bg/base` would not match `color.bg.base`.
3. All lowercase. Hyphens inside a segment are allowed (`content-max`), underscores and spaces are not.
4. British spelling appears in prose only. Every identifier is `color`, never `colour`. Two spellings of
   the same concept in one codebase is a bug waiting for a designer to file it.
5. A variable that does not exist in `tokens.json` does not exist in Figma, and the reverse. The pair is
   checked by `scripts/` in the token-diff gate; a mismatch fails the build.

If `design/tokens/tokens.json` has not been written yet, it must take the shape below, with the same
paths and the same values:

```json
{
  "color": { "bg": { "base": "#0A0B0D", "surface": "#131519", "raised": "#1C1F25" } },
  "space": { "1": 4, "2": 8, "3": 12 },
  "text":  { "xs": "0.75rem", "sm": "0.875rem" }
}
```

### 2.2 Collection `TURBINE / Color`

One mode, named `Dark`. There is no second mode. Type: `COLOR`. Every variable is published.

| Variable | Hex | Use (CANON §4) |
|---|---|---|
| `color/bg/base` | `#0A0B0D` | Page background |
| `color/bg/surface` | `#131519` | Cards, nav background |
| `color/bg/raised` | `#1C1F25` | Hover states, table header |
| `color/border/subtle` | `#2A2E36` | Hairlines, card borders |
| `color/border/strong` | `#3D434E` | Focus ring base, dividers |
| `color/text/primary` | `#F2F4F7` | Headings, body on dark |
| `color/text/secondary` | `#A7AEBB` | Supporting copy |
| `color/text/muted` | `#6B7280` | Legal and footer text only. Never body copy. |
| `color/accent/sodium` | `#FF6A1A` | Primary accent, CTAs |
| `color/accent/coolant` | `#2FE6D6` | Links, active tab, focus ring |
| `color/accent/arc` | `#7C5CFF` | Badges, marquee |
| `color/state/danger` | `#FF4D4D` | Sold out, errors |
| `color/state/success` | `#3DDC84` | Confirmation |

Set the Figma **description** field on `color/text/muted` to:
`Legal and footer only. 4.1:1 on bg/base — fails AA for body copy. Use text/secondary instead.`
The description is what the Dev Mode MCP server returns alongside the value, so it is the cheapest way
to put the warning in front of the model that will write the CSS.

**Hover and pressed states introduce no new colours.** CANON fixes thirteen colours and the file has
thirteen. A hover is a 10% `color/text/primary` overlay layer named `overlay/hover` inside the
component, not a fourteenth hex. This keeps the token-diff gate meaningful.

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
| `leading/relaxed` | 162% | 1.625 |

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

Below it, `tokens/contrast-matrix` — the four known-good pairings from CANON §4 marked pass, and the two
known-bad pairings from CANON §8 marked fail with the measured ratio:

| Pairing | Ratio | Verdict |
|---|---|---|
| `text/primary` on `bg/base` | high | Pass |
| `text/primary` on `bg/surface` | high | Pass |
| `text/secondary` on `bg/base` | high | Pass |
| `bg/base` on `accent/sodium` | high | Pass — this is the button |
| `text/muted` on `bg/base` | ~4.1:1 | **Fail** for body copy. Legal and footer only. |
| `#FFFFFF` on `accent/sodium` | ~2.9:1 | **Fail**. Never white on orange. |

The two failing rows stay in the file on purpose. They are the thing the accessibility gate will catch
later, and a designer who sees them here understands why the gate exists.

---

## 3. Text styles

Seventeen styles, named `Group/Role`. Figma sorts on the slash, so the four groups collapse neatly in
the panel.

Every style binds family, weight, size, line height and letter spacing to variables from
§2.3. No style carries a loose number. Four styles bind size to a `responsive/type/*` variable and
therefore resize with the frame mode; the rest are fixed.

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

Component properties: `Label` (text, default `Buy tickets`), `Show icon` (boolean, default false),
`Icon` (instance swap, shown when `Show icon` is true, 16×16, placed after the label).

Anatomy: horizontal auto-layout, gap `space/2` (8), align centre, hug both axes, radius `radius/pill`.

| Size | Text style | Padding Y | Padding X | Resulting height | Min width |
|---|---|---|---|---|---|
| `md` | `Label/Button` (16/24) | 12 | 28 | 48 | 120 |
| `sm` | `Label/Button-Small` (14/20) | 10 | 20 | 40 | 96 |

Both heights clear the 24px touch minimum in CANON §9 with room to spare.

| Variant | Fill | Stroke | Label colour |
|---|---|---|---|
| `primary` | `color/accent/sodium` | none | `color/bg/base` |
| `secondary` | none | 1px `color/border/strong` | `color/text/primary` |
| `ghost` | none | none | `color/accent/coolant` |

The primary label is `color/bg/base` on `color/accent/sodium`. This is a CANON §4 fixed pairing and the
single most common thing a model gets wrong: white on orange is 2.9:1 and fails. See CANON §8.

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
| `nav/links` | Horizontal auto-layout, gap `space/8` (32). Four links: Lineup, Programme, Venue, FAQ. `Body/Base-Medium`, `color/text/secondary`. Active link `color/accent/coolant` with a 2px bottom rule in the same colour. Each link has 12px vertical padding so the hit target reaches 48. |
| `nav/cta` | `Button` instance, `Variant=primary`, `Size=sm`, `Label=Buy tickets` |

`compact` — used at 390 only, per CANON §7 ("hamburger below 768"). Height 64. Wordmark left, a 48×48
menu button right (`Button` instance, `Variant=ghost`, `Size=sm`, icon only). `nav/links` is present in
the file but hidden, so the structure survives into the markup and the drawer is a CSS concern rather
than a missing element.

### 4.4 TabBar

Component set `TabBar`, one variant property `Active` with values `all` · `fri` · `sat` · `sun`.

Anatomy: horizontal auto-layout, gap `space/2` (8), hug, padding 4, fill `color/bg/surface`, radius
`radius/pill`. Contains four instances of the nested component `TabBar/Tab`.

`TabBar/Tab` — one variant property `State` with values `default` · `hover` · `focus` · `active`.
Horizontal auto-layout, padding 10/20, height 40, radius `radius/pill`, `Label/Button-Small`.

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

Component properties: `Name` (text), `Genre` (text), `Day` (text), `Stage` (text), `Portrait` (image
fill on `artist/portrait`).

Anatomy: vertical auto-layout, gap `space/3` (12), fill container width, hug height, padding 0, radius
`radius/md`, clip content on. Fill `color/bg/surface`, 1px `color/border/subtle`.

| Child | Spec |
|---|---|
| `artist/portrait` | Aspect ratio 4:5, fill container width, image fill, crop. At 282 wide this renders 282×352. |
| `artist/body` | Vertical auto-layout, gap `space/2` (8), padding `space/4` (16) |
| `artist/badge` | Present on `headliner` only. `Mono/Tag`, `color/bg/base` on `color/accent/arc`, padding 4/8, radius `radius/sm`, text `Headliner`. Absolutely positioned top-left of the portrait at 12/12. |
| `artist/name` | `Display/Card-Title`, `color/text/primary` |
| `artist/meta` | Horizontal auto-layout, gap `space/2`, wrap on. `Body/Small`, `color/text/secondary`. Reads `Fri · Turbine Hall`. |
| `artist/genre` | `Mono/Tag`, `color/accent/coolant` |

| Billing | Difference |
|---|---|
| `headliner` | Badge shown; `artist/name` overrides to 24px |
| `main` | No badge; name at 20px |
| `support` | No badge; name at 20px; `artist/genre` at `color/text/secondary` |

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
| `sold-out` | Border `color/border/subtle`; `ticket/price` in `color/text/secondary` with a strikethrough; a `Sold out` badge in `color/bg/base` on `color/state/danger`; CTA becomes `Variant=secondary`, `State=disabled`, `Label=Sold out` |

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
| `row/time` | Fixed 96 | `Mono/Time`, `color/accent/coolant` |
| `row/turbine-hall` | Fill | `Body/Base-Medium`, `color/text/primary` |
| `row/boiler-room` | Fill | `Body/Base-Medium`, `color/text/primary` |
| `row/cooling-tower` | Fill | `Body/Base-Medium`, `color/text/primary` |

An empty cell contains an em dash in `color/text/secondary`, not an empty text node. An empty node
collapses in auto-layout and breaks the column alignment.

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
| `faq/answer` | Shown in `expanded` only. `Body/Base`, `color/text/secondary`, padding bottom `space/6`, padding right `space/12` (48) so the measure stays under 80 characters. |

The trigger is the full-width row, not the chevron. A 24×24 chevron alone would technically satisfy the
touch minimum and would still be a poor target.

Add a Dev Mode annotation on `faq/trigger`: `button, aria-expanded, aria-controls -> faq/answer id`.
CANON §9 requires the accordion to be keyboard operable with correct ARIA, and the annotation is how the
requirement reaches the model that writes the markup.

### 4.9 Ticker

Component set `Ticker`, one variant property `Motion` with values `animated` · `static`.

Anatomy: fill container width, height 56, clip content on, fill `color/bg/raised`, 1px top and bottom
border `color/border/subtle`. Inside, `ticker/track` — horizontal auto-layout, gap `space/6` (24), align
centre, hug width.

`ticker/track` contains the twelve genre tags from CANON §2, each as `Mono/Tag` in `color/accent/arc`,
separated by a 4×4 dot in `color/border/strong`:

`INDUSTRIAL TECHNO · DEEP AMBIENT · GENERATIVE · DRONE · MODULAR LIVE · HARDWARE TECHNO ·
FIELD RECORDING · DUB TECHNO · NEOCLASSICAL ELECTRONIC · TAPE LOOPS · PERCUSSIVE AMBIENT · GLASSY IDM`

The full set is duplicated twice inside the track so the loop has something to scroll into.

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
| `footer/bottom` | Horizontal auto-layout, space between, align centre. Legal line left in `Legal/Fine`, `color/text/muted`; socials right as four 24×24 icons with 12px padding, `color/text/secondary`. |
| `footer/disclaimer` | Fill container width. `Legal/Fine`, `color/text/muted`. The exact CANON §1 disclaimer text. |

Column contents:

| Festival | Tickets | Info | Legal |
|---|---|---|---|
| Lineup | Single Night | Getting here | Terms |
| Programme | Full Pass | House rules | Privacy |
| Venue | Full Pass + Workshop | Lost and found | Accessibility statement |
| FAQ | Access and companions | Contact | Imprint |

`footer/disclaimer` and `footer/bottom` are the only two places in the entire file where
`color/text/muted` appears. Everywhere else it is a bug.

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

### 5.1 section-nav

| Property | Value |
|---|---|
| Height | 72, fixed |
| Layout | `Nav` instance, `Layout=full`, `Active=none`, fill container width |
| Padding | X 48, Y 12 |
| Fill | `color/bg/surface` |
| Position | Sticky at top of `TURBINE / Desktop 1440` |
| Skip link | `a11y/skip-link` absolutely positioned at 48 left, 8 top, hidden. See §5.12. |

### 5.2 section-hero

| Property | Value |
|---|---|
| Height | 780, fixed |
| Layout | Vertical auto-layout, gap `space/8` (32), align left, justify **end** |
| Padding | X 120, top 160, bottom 96 |
| Fill | Image `hero-hall-e.jpg`, crop, plus an overlay rectangle `hero/scrim` — linear gradient from `color/bg/base` at 90% (bottom) to `color/bg/base` at 20% (top) |

The scrim exists so the wordmark keeps its contrast over a photograph. Without it the contrast of the
`h1` depends on the image, which no tool can check and no reviewer can approve.

| Child | Content | Style |
|---|---|---|
| `hero/eyebrow` | `Fourth edition` | `Label/Eyebrow`, `color/accent/sodium` |
| `hero/wordmark` | `TURBINE` (the `h1`) | `Display/Wordmark-Hero` at 96, `color/text/primary` |
| `hero/tagline` | `Three nights inside the machine` | `Body/Lead`, `color/text/primary` |
| `hero/meta` | `12–14 June 2027 · The Powerhouse, Hall E · Kraków, Poland` | `Body/Base`, `color/text/secondary` |
| `hero/ctas` | Horizontal auto-layout, gap `space/4` (16) | `Button` primary md `Buy tickets`; `Button` secondary md `See the lineup` |
| `hero/scroll-cue` | 24×24 chevron, absolute, bottom 32, centre | `color/text/secondary`. Hidden under `prefers-reduced-motion`; annotate it. |

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
| `section-header` | Eyebrow `Twelve artists`; h2 `Lineup`; intro `Three stages, three nights. Every ticket reaches all of them.` |
| `lineup/tabs` | `TabBar` instance, `Active=all`, hug width, aligned left |
| `lineup/grid` | Horizontal auto-layout with wrap on, gap 24 both axes, fill container width. Twelve `ArtistCard` instances, fixed width 282. (1200 − 3×24) / 4 = 282, giving four per row and three rows. |

Card order follows the CANON §2 table, rows 1 to 12: KASIMIR VOLT, Lena Orbis, NULLSET, Auric Drift,
Mara Teschke, SUBSTATION 9, Hiroko Vane, Cold Cathode, Ilse Rüm, TAPE DECAY, Odalys Ferrer, VITRINE.
Billing variant per card follows the CANON billing column: rows 1–3 `headliner`, rows 4–6 `main`, rows
7–12 `support`.

Annotate `lineup/tabs`: `role=tablist, each tab role=tab with aria-selected, panel is lineup/grid`.

### 5.5 section-programme

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Three nights`; h2 `Programme`; intro `Doors at 19:00. Last set ends at 02:00.` |
| `programme/days` | Vertical auto-layout, gap `space/12` (48), fill container width |

Three `programme/day` frames — vertical auto-layout, gap `space/4` (16), fill container width:

| Part | Spec |
|---|---|
| `day/heading` | `Display/Subsection`, `color/text/primary`. `Friday 12 June`, `Saturday 13 June`, `Sunday 14 June`. |
| `day/table-head` | `TimetableRow` styling but a header row: fill `color/bg/raised`, `Label/Eyebrow`, `color/text/secondary`, cells `Time`, `Turbine Hall`, `Boiler Room`, `Cooling Tower`, radius `radius/sm` on the top corners |
| `day/rows` | Three `TimetableRow` instances, `Layout=table-row`, `Zebra` alternating false/true/false |

Row contents, derived from the CANON §2 day and stage columns. Support acts at 20:00, main at 22:00,
headliner at 00:00. Times are a scheduling assumption; day and stage are CANON and must not move.

**Friday 12 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 20:00 | — | TAPE DECAY | Hiroko Vane |
| 22:00 | — | Auric Drift | — |
| 00:00 | KASIMIR VOLT | — | — |

**Saturday 13 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 20:00 | — | — | Cold Cathode |
| 22:00 | — | Mara Teschke | Odalys Ferrer |
| 00:00 | Lena Orbis | — | — |

**Sunday 14 June**

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| 20:00 | — | VITRINE | Ilse Rüm |
| 22:00 | — | SUBSTATION 9 | — |
| 00:00 | NULLSET | — | — |

Annotate `programme/days`: `table with caption per day, th scope=col for stage columns, th scope=row for time`.

### 5.6 section-venue

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `The building`; h2 `Venue`; intro omitted |
| `venue/split` | Horizontal auto-layout, gap `space/12` (48), align start, fill container width |
| `venue/image` | Fill container (576), aspect 4:3, image `venue-hall-e.jpg`, radius `radius/md` |
| `venue/text` | Fill container (576), vertical auto-layout, gap `space/4` (16) |
| `venue/lower` | Horizontal auto-layout, gap `space/12` (48), fill container width, margin top `space/12` |
| `venue/travel` | Fill container (576), vertical auto-layout, gap `space/6` (24). Three items, each a vertical stack: label in `Label/Eyebrow` `color/text/secondary`, detail in `Body/Base` `color/text/primary`. Labels: `By tram`, `By bike`, `Parking`. |
| `venue/map` | Fill container (576), height 320, fill `color/bg/raised`, 1px `color/border/subtle`, radius `radius/md`. A static map placeholder with a centred `Mono/Tag` label `MAP PLACEHOLDER` in `color/text/secondary`. |

`venue/split` at 1200 with a 48 gap gives two 576 columns.

The map is a placeholder by design. CANON §11 rules out third-party embeds and trackers, and a Google
Maps iframe is both.

### 5.7 section-tickets

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Three ways in`; h2 `Tickets`; intro `One ticket, all three stages. Prices are per person and include booking fees.` |
| `tickets/cards` | Horizontal auto-layout, gap `space/6` (24), align stretch, fill container width. Three `TicketCard` instances at (1200 − 2×24) / 3 = 384. |
| `tickets/comparison` | Vertical auto-layout, gap 0, fill container width, 1px `color/border/subtle`, radius `radius/md`. Four rows, each a horizontal auto-layout with a feature label (fill) and three 120-wide cells carrying a check or an em dash. |
| `tickets/access` | Horizontal auto-layout, gap `space/4` (16), padding `space/6` (24), fill `color/bg/surface`, 1px `color/accent/coolant`, radius `radius/md`. A 24×24 icon plus the CANON §3 access note in `Body/Base`, `color/text/primary`. |

Card instances, in order:

| Position | Tier | Price | Variant | Badge |
|---|---|---|---|---|
| 1 | Single Night | €45 | `standard` | none |
| 2 | Full Pass | €110 | `highlighted` | `Most popular` |
| 3 | Full Pass + Workshop | €165 | `standard` | `40 places` |

Card copy from CANON §3: Single Night includes one night on all three stages, note `Choose your date at
checkout`. Full Pass includes all three nights. Full Pass + Workshop includes all three nights plus the
Saturday modular synthesis workshop, limited to 40 places.

Comparison rows: `All three stages`, `Three nights`, `Saturday workshop`, `Companion ticket`.

The access note is required near the pricing table by CANON §3 and its exact wording is fixed there. It
is not decoration and it is not moveable to the footer.

### 5.8 section-faq

| Child | Spec |
|---|---|
| `section-header` | Eyebrow `Before you come`; h2 `Questions` |
| `faq/list` | Vertical auto-layout, gap 0, width 800, centred in the container, top border 1px `color/border/subtle` |

Eight `FaqRow` instances. The first is `State=expanded`, the rest `collapsed`, so the composed frame
shows both states and the visual diff has something to compare against. Questions:

1. What time do doors open?
2. Is there re-entry between stages?
3. How do I get to Hall E?
4. Is the venue step-free?
5. Can I bring a camera?
6. Is there an age limit?
7. Are tickets transferable?
8. Where do I leave a coat?

Answer copy is owned by the brief. In the Figma file each answer is two sentences at most, set in
`Body/Base`, `color/text/secondary`, and written in the CANON §10 voice.

### 5.9 section-newsletter

| Property | Value |
|---|---|
| Fill | `color/bg/surface` |
| Padding | Y `responsive/section-pad-y` (128), X `responsive/gutter` (48) |
| Container | Width 560, centred, vertical auto-layout, gap `space/6` (24), align centre |

| Child | Spec |
|---|---|
| `newsletter/h2` | `Display/Subsection`, `color/text/primary`, centred. `Lineup updates, three or four times a year` |
| `newsletter/form` | Vertical auto-layout, gap `space/4` (16), fill container width |
| `newsletter/email` | `Input` instance, `Type=email`, `Label=Email address`, `Required=true` |
| `newsletter/consent` | `Input` instance, `Type=checkbox`, unchecked, label `Send me lineup and ticket updates. One click to stop.` |
| `newsletter/submit` | `Button`, `Variant=primary`, `Size=md`, `Label=Subscribe`, fill container width |
| `newsletter/note` | `Body/Small`, `color/text/secondary`. `No list sharing. No tracking pixels.` |

The consent box ships unchecked and the submit button says `Subscribe`, not `Yes, I want in`. CANON §11
rules out dark patterns by ruling out the things that need them, and a pre-ticked box is the one that
sneaks back in.

### 5.10 section-footer

`Footer` instance, `Layout=wide`, fill container width. Padding and internals as §4.10.

### 5.11 Vertical order and total height

| # | Section | Height at 1440 |
|---|---|---|
| 1 | `section-nav` | 72 (sticky) |
| 2 | `section-hero` | 780 |
| 3 | `section-ticker` | 56 |
| 4 | `section-lineup` | approx. 1660 |
| 5 | `section-programme` | approx. 1310 |
| 6 | `section-venue` | approx. 1290 |
| 7 | `section-tickets` | approx. 1360 |
| 8 | `section-faq` | approx. 1080 |
| 9 | `section-newsletter` | approx. 640 |
| 10 | `section-footer` | approx. 590 |

Heights after the ticker are the result of hugging content and will shift as copy lands. They are listed
so a build can be sanity-checked, not so they can be typed in. Do not set a fixed height on any section
below the ticker.

### 5.12 Skip link

`a11y/skip-link` — a component on `Design system`, instanced once into each viewport frame as the first
child of `section-nav`, absolutely positioned at left `responsive/gutter`, top 8.

Horizontal auto-layout, padding 12/16, height 40, fill `color/accent/coolant`, radius `radius/sm`, text
`Skip to content` in `Label/Button-Small`, `color/bg/base`.

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
| `section-nav` | `Nav` stays `Layout=full`. Height 72 → 64, padding X 32. Link gap 32 → 24, links drop to `Body/Small-Medium`. CANON §7 puts the hamburger *below* 768, so 768 keeps the full bar. |
| `section-hero` | Height 780 → 700. Padding X 120 → 32, top 120, bottom 64. Wordmark 96 → 72 by mode. `hero/ctas` stays horizontal. |
| `section-ticker` | Height 56 → 48 |
| `section-lineup` | Grid 4 columns → 3. Card width fixed 282 → fill container, giving (704 − 2×24) / 3 = 218.67. Portrait stays 4:5. Tabs unchanged. |
| `section-programme` | `row/time` 96 → 72. Stage cells fill, approx. 200 each. `Layout=table-row` retained. |
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
| `section-nav` | `Nav` switches to `Layout=compact`. Height 64, padding X 24. Wordmark left, 48×48 menu button right. `nav/links` present but hidden. |
| `section-hero` | Height 700 → 600. Padding X 24, top 96, bottom 64. Gap 32 → 16. Wordmark 40 by mode (roughly 240px wide, clearing the 342 container). `hero/meta` wraps to two lines. `hero/ctas` becomes vertical, gap 12, both buttons fill container width at height 48. |
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

### 8.2 The export list

Thirty-three files in `design/export/`. This list is what the visual diff gate expects; it is not a
suggestion and nothing may be added to the directory that is not on it.

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

The skip link is deliberately absent. It has no visual footprint in the composed frames, so a diff of it
would compare two empty rectangles. Its focused state is exported separately to
`design/assets/reference/state-skip-link-focused.png`, which the gate does not read.

### 8.3 Export settings

| Setting | Value | Why |
|---|---|---|
| Format | PNG | Lossless. A JPEG artefact reads as a layout difference. |
| Scale | **1x** | The PNG width must equal the CSS pixel width so a 1440 export is 1440px wide. Playwright must run with `deviceScaleFactor: 1` for the same reason. A 2x export against a 1x screenshot fails every comparison for a reason that has nothing to do with the design. |
| Suffix | none | Figma appends `@2x` style suffixes automatically at other scales. At 1x it appends nothing, which is what the filenames above assume. |
| Colour profile | sRGB | |
| Contents only | off | The frame's own background must be in the image, or every section exports onto transparency and diffs against a dark screenshot. |

Set these as persistent export settings on each of the thirteen source layers, then use a single
`Export` action. Do not export by hand-picking layers each time; the list drifts within two sessions.

### 8.4 Image assets

Source images live on the `Exports` page as individual frames and export to `design/assets/`.

| Frame | File | Size | Format |
|---|---|---|---|
| `asset/hero` | `hero-hall-e.jpg` | 2880×1560 | JPEG, quality 80 |
| `asset/venue` | `venue-hall-e.jpg` | 1600×1200 | JPEG, quality 80 |
| `asset/map` | `venue-map-placeholder.png` | 1152×640 | PNG |
| `asset/artist/<slug>` ×12 | `artist-<slug>.jpg` | 640×800 | JPEG, quality 80 |

Artist slugs, in CANON §2 order:

`kasimir-volt`, `lena-orbis`, `nullset`, `auric-drift`, `mara-teschke`, `substation-9`, `hiroko-vane`,
`cold-cathode`, `ilse-rum`, `tape-decay`, `odalys-ferrer`, `vitrine`.

Diacritics are stripped in filenames and only in filenames: `Ilse Rüm` is `artist-ilse-rum.jpg` on disk
and `Ilse Rüm` in every piece of visible text and every `alt` attribute. The same rule gives
`SUBSTATION 9` the slug `substation-9`.

Every image frame carries its `alt` text in the Figma layer description, because that is the field the
Dev Mode MCP server returns. Decorative images carry the literal string `alt=""`. CANON §9 requires
meaningful alt on all images, and the only reliable way to get it is for the designer to write it while
the image is in front of them.

### 8.5 What the diff gate does with these

For reference, so the export decisions above make sense: the gate screenshots each `data-section` at the
three widths with `deviceScaleFactor: 1`, resizes nothing, and compares against the matching
`section-<name>-<width>.png` with a per-pixel threshold of 0.1 and a failure budget of 2% of pixels.
Anti-aliasing on text and the sub-pixel line-height difference noted in §3 sit comfortably inside that
budget; a wrong colour, a wrong gap or a wrong font does not.

The three `full-page-<width>.png` files are compared with a looser 5% budget. Their job is to catch a
section in the wrong order or missing entirely, not to police pixels.

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
| **Dev Mode annotations on the five interactive areas** | `nav`, `lineup/tabs`, `programme/days`, `faq/trigger`, `newsletter/form`. These are the five places CANON §9 makes non-negotiable demands. |
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
5. **Muted grey for supporting copy.** `color/text/muted` on `color/bg/base` is 4.1:1 and fails AA. It
   is in the palette for legal text in the footer and nothing else. The accessibility gate will catch
   it, but catching it after the fact costs a loop iteration.
6. **White text on the orange button.** 2.9:1. The canonical pairing is near-black on orange, which
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
13. **Twelve portraits at twelve different aspect ratios.** The card crops them to 4:5 in Figma, the CSS
    does not, and the lineup grid becomes a staircase. Crop them in the file.
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
6. Build `TURBINE / Desktop 1440` section by section in the CANON §7 order.
7. Duplicate to `TURBINE / Tablet 768` and `TURBINE / Mobile 390`, set the frame mode, then apply only
   the deltas in §6 and §7. Do not rebuild.
8. Set the thirteen export settings in §8.3. Export once. Count the files: thirty-three.
9. Run the Dev Mode check in §9 against `section-tickets`.
10. Set `Ready for dev` on the three viewport frames.

---

## 12. Assumptions recorded here, not in CANON

Decisions this specification makes that CANON does not fix. Each is a candidate for promotion to CANON
if it turns out to matter, and each may be overridden without contradicting anything upstream.

| Decision | Value | Why |
|---|---|---|
| Tablet gutter | 32 | CANON fixes 24 mobile and 48 desktop; 32 is the step between |
| Set times | 20:00 / 22:00 / 00:00 | CANON fixes day and stage per artist but not time. Support, main, headliner. |
| Doors and curfew | 19:00 and 02:00 | Consistent with the set times above |
| FAQ questions | The eight in §5.8 | CANON fixes the count at eight, not the content |
| Footer column contents | The sixteen links in §4.10 | CANON fixes four columns, not their contents |
| Travel items | Tram, bike, parking | CANON requires travel info, unspecified |
| Line height scale | `leading/*`, five steps | CANON fixes the type scale and tracking, not leading |
| `tracking/wide` | +0.06em | CANON fixes -0.02em display and +0.18em wordmark only |
| Type size names | Tailwind ladder, `xs` to `7xl` | CANON gives eleven rem values with no names |
| Spacing names | Value ÷ 4, matching Tailwind | CANON gives ten px values with no names |
| Hover treatment | 10% `text/primary` overlay | Keeps the palette at exactly thirteen colours |
| Section heights | The estimates in §5.11 | Content-driven; listed for sanity checks only |
| Export scale | 1x | Required for dimensional parity with a `deviceScaleFactor: 1` screenshot |
| Diff thresholds | 2% section, 5% full page | Stated here so the export settings have a reason |
