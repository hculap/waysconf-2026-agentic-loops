# TURBINE — acceptance criteria

> Companion to `docs/CANON.md`. Canon defines what is true about the festival. This file defines what
> has to be true about the page, and exactly which program decides it.

## The rule this file exists to teach

**A criterion that needs a model to judge it is not a criterion. It is an opinion with a ticket number.**

Every row below is enforced by a program that reads the built site, returns exit code `0` or `1`, and
prints a message. No language model takes part in any pass or fail decision. The generator writes the
page; the verifier is separate code, written before the page, that does not know how the page was made
and cannot be talked out of a result.

Three consequences shape the whole document:

1. **If you cannot write the failure message before you write the check, the criterion is not ready.**
   The message is not a log line. It is the repair prompt that goes back into the loop, so it must name
   the location and the expected value, not just the disappointment.
2. **Gates must be idempotent.** Run twice on unchanged input, get the identical verdict. A gate that
   flickers is a bug in the gate, not in the site, and it must be fixed before it is trusted.
3. **Gates are tested too.** Each check must ship with a deliberately broken fixture in `checks/fixtures/`
   that it fails. A gate that has never gone red is indistinguishable from a gate that does nothing, so a
   gate whose fixture does not exist yet is not finished.

Notation: `{braces}` are values substituted at runtime. Every message is prefixed with its criterion ID
so a failure can be traced back to this file without searching.

---

## Running the gates

```bash
npm run build          # produces dist/
npm run check          # BUILD through PERF, against dist/. It never deploys.
npm run check -- --only tokens,visual        # one or more gate ids, comma-separated
npm run baseline       # rewrites design/export/. A person's decision, never the loop's.
npm run deploy         # publishes dist/. Run it only once npm run check has exited 0.
npm run check -- --url https://<site>.netlify.app   # the post-deploy smoke run, AC-58 to AC-60
```

The gate ids `--only` accepts are `build`, `structure`, `a11y`, `tokens`, `visual`, `content`, `links`
and `perf`. `npm run check` invokes `checks/run.mjs`, which runs the build gate, serves `dist/`, hands the
browser gates to Playwright and folds every result into one report.

| Family | File | What it reads | Blocking |
|---|---|---|---|
| BUILD | `checks/gates/build.mjs` (AC-01, AC-02, AC-05) and `checks/specs/runtime.spec.ts` (AC-03, AC-04) | build process, `dist/`, page load | yes |
| STRUCTURE | `checks/specs/structure.spec.ts` | rendered DOM | yes |
| A11Y | `checks/specs/a11y.spec.ts` | rendered DOM via axe-core and keyboard driving | yes |
| TOKENS | `checks/specs/tokens.spec.ts` | computed styles plus `design/tokens/tokens.json` | yes |
| VISUAL | `checks/specs/visual.spec.ts` | screenshots against `design/export/` | yes |
| CONTENT | `checks/specs/content.spec.ts` | rendered text plus `brief/CONTENT.md` | yes |
| LINKS | `checks/specs/links.spec.ts` | rendered DOM plus `dist/` | yes |
| PERF | `checks/gates/lighthouse.mjs` | Lighthouse run against a local preview server | yes |
| DEPLOY | `npm run deploy`, then `npm run check -- --url {deploy-url}` | the public URL | after check, not inside it |

BUILD runs first and alone: nothing measured downstream means anything if the site did not build. The
browser families then run under Playwright, which schedules them in parallel, so the order of the table is
the order of the criterion ids — an order for reading, not a cost ranking and not an execution sequence.
`checks/report.md` lists its failing families alphabetically, which is not a repair order either;
`loop/prompts/03-fix-from-report.md` carries that. The loop repairs **one failing family at a time**, and
re-runs from the top. Three failed repair attempts on the same criterion stop the loop and hand the
problem to a person. That limit is an instruction to the agent, in `loop/prompts/03-fix-from-report.md`,
rather than a counter in `loop/ralph.sh`, which bounds the number of iterations and nothing else. It
exists because an agent that cannot fix something in three tries is usually not fixing the thing the
message describes.

Each gate writes `checks/.results/gates/{id}.json` through `checks/lib/gate.ts`, and `checks/run.mjs`
folds those files into `checks/report.json` and `checks/report.md`:

```json
{ "id": "tokens", "title": "Design tokens", "status": "fail", "criteria": ["AC-26"], "failures": [
  { "criterion": "AC-26", "message": "off-palette colour #8A8F98 on .card__meta (color)",
    "where": ".card__meta", "expected": "color.text.secondary (#A7AEBB)", "actual": "#8A8F98" }
] }
```

`checks/report.md`, not the terminal output, is the loop's input. Human-readable and machine-readable are
the same artifact here on purpose: `report.json` carries the same failures, in the same order, for
anything that needs to parse them.

---

## The contract the page must expose

Deterministic verification needs stable handles. The page is required to provide these, and the gates are
allowed to depend on nothing else:

| Hook | Meaning |
|---|---|
| `data-section="skip-link \| nav \| hero \| ticker \| lineup \| programme \| venue \| tickets \| faq \| newsletter \| footer"` | One per canonical section, in DOM order |
| `data-artist="{name}"` on each lineup card | Exact name from CANON §2 |
| `data-day` / `data-stage` on artist cards and programme cells | Values from CANON §2 |
| `data-tier="single \| full \| workshop"` on ticket cards | CANON §3 |
| `data-places-left="{n}"` on `[data-tier="workshop"]` | Workshop places remaining. `10` or more is the shipped default and shows no availability line; below 10 shows the low-places line; `0` shows the sold-out line and the sold-out button. Strings in CONTENT.md §9 |
| `data-legal` on the footer legal block | The footer legal copy, and the only place `color.text.muted` is permitted — a ceiling, not an instruction: see the note under TOKENS |
| `data-decorative` on images that carry no meaning | These, and only these, may have `alt=""` |
| `#main` on the `<main>` element | Skip link target |

Adding a hook is a design decision, not a workaround. If a gate needs a selector the page does not want to
give it, the criterion is wrong or the markup is.

---

## BUILD

`checks/gates/build.mjs` for AC-01, AC-02 and AC-05; `checks/specs/runtime.spec.ts` for AC-03 and AC-04,
which need a browser. Runs the real build, then loads `dist/index.html` in Chromium at all three canonical
widths and listens.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-01 | `astro build` completes with exit code 0 | `checks/gates/build.mjs` runs the build and reads its exit code | `AC-01 BUILD: astro build exited {code}. Last error: {stderr_tail}` |
| AC-02 | `astro check` reports zero TypeScript errors | `checks/gates/build.mjs` parses the diagnostics summary | `AC-02 BUILD: {n} type error(s). First: {file}:{line}:{col} {message}` |
| AC-03 | Loading the page produces no console errors and no unhandled rejections at 390, 768 and 1440 | Playwright `console` and `pageerror` listeners, empty allowlist | `AC-03 BUILD: {n} console error(s) at {width}px. First: "{text}" from {url}:{line}` |
| AC-04 | Every network request made during load returns a status below 400 | Playwright `response` listener over the load and 2s idle | `AC-04 BUILD: request to {url} returned {status} during page load at {width}px` |
| AC-05 | The build output is a single HTML page | `checks/gates/build.mjs` globs `dist/**/*.html` and expects exactly `index.html` | `AC-05 BUILD: dist/ contains {n} HTML files, expected 1 (index.html). Extra: {paths}` |

AC-05 enforces CANON §11. Out-of-scope rules are worth gating, because scope creep arrives as extra files
long before it arrives as a conversation.

---

## STRUCTURE

`checks/specs/structure.spec.ts`. Pure DOM assertions, no styling involved.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-06 | All 11 canonical sections are present, once each, in CANON §7 order | Reads `[data-section]` in DOM order and compares to the fixed list | `AC-06 STRUCTURE: expected 11 sections in canonical order, found {n}. First mismatch at position {i}: expected "{expected}", found "{found}"` |
| AC-07 | The document contains exactly one `h1` | `document.querySelectorAll('h1')` | `AC-07 STRUCTURE: found {n} <h1> elements, expected 1: {texts}` |
| AC-08 | Heading levels never skip a level going down | Walks headings in DOM order, asserts each level is at most one deeper than the previous | `AC-08 STRUCTURE: heading level skipped — <h{from}> "{text}" is followed by <h{to}> "{nextText}"` |
| AC-09 | Landmarks: exactly one `banner`, one `navigation` inside it, one `main`, one `contentinfo`; every `region` has an accessible name | Accessibility tree query per role | `AC-09 STRUCTURE: landmark {role} count is {n}, expected {expected}. Unnamed region(s): {selectors}` |
| AC-10 | The skip link is the first focusable element and its target exists | Presses Tab once from `document.body`, reads `document.activeElement` and resolves its `href` | `AC-10 STRUCTURE: first focusable element is {selector} ("{text}"), expected a skip link whose href resolves to #main` |
| AC-11 | `<html lang="en">` | Attribute read | `AC-11 STRUCTURE: <html lang> is "{value}", expected "en"` |
| AC-12 | Title is at most 60 characters and contains `TURBINE`; meta description is 50 to 160 characters | Head parse | `AC-12 STRUCTURE: title "{title}" is {n} chars and {contains / does not contain} "TURBINE"; description is {m} chars. Required: title ≤ 60 chars containing "TURBINE", description 50–160 chars` |
| AC-13 | Nav exposes exactly 4 section links plus 1 ticket CTA, not counting the wordmark link to `#top`, and every nav link resolves to a section id | Counts distinct destinations among `[data-section="nav"] a`: the anchor targeting `#tickets` is the CTA, the anchor targeting `#top` is the wordmark and counts as neither, the rest are links. Resolves each fragment; a mobile drawer repeating the same hrefs adds no destination | `AC-13 STRUCTURE: nav exposes {n} links and {m} CTA(s), expected 4 and 1. Unresolved target(s): {hrefs}` |
| AC-14 | No `id` value appears twice | Collects all ids, counts duplicates | `AC-14 STRUCTURE: duplicate id "{id}" used {n} times: {selectors}` |

---

## A11Y

`checks/specs/a11y.spec.ts`. axe-core with tags `wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`, plus keyboard
driving that axe cannot do. Target is WCAG 2.2 AA, per CANON §9.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-15 | Zero axe violations at 390, 768 and 1440, in the default state, with each lineup tab selected, and with the FAQ accordion open | axe-core run six times per breakpoint (default, each of the four tabs, accordion open). No impact level is exempt: `minor` and `moderate` fail the gate exactly as `serious` and `critical` do | `AC-15 A11Y: {n} axe violation(s) at {width}px in state "{state}". {ruleId} ({impact}) on {selector}: {help}. {docsUrl}` |
| AC-16 | Every interactive element changes appearance when focused | Screenshots each focusable element unfocused and focused, clipped to its bounding box padded by at least 8px on every side so that `outline-width` and `outline-offset` fall inside the compared area, and requires at least 0.5% of the pixels in that padded box to differ | `AC-16 A11Y: no visible focus change on {selector}; focused and unfocused renders of its padded box differ by {pct}% (minimum 0.5%)` |
| AC-17 | The focus indicator has at least 3:1 contrast against the surface behind it | Reads the focus ring colour and the adjacent background, computes the ratio | `AC-17 A11Y: focus indicator on {selector} has {ratio}:1 contrast against {bgHex}, minimum 3:1` |
| AC-18 | Lineup tabs follow the tabs pattern: roving tabindex, ArrowLeft/ArrowRight/Home/End move selection, exactly one `aria-selected="true"`, `aria-controls` resolves to a labelled panel | Playwright keyboard driving with assertions after each press | `AC-18 A11Y: lineup tabs — {detail}. Expected roving tabindex, ArrowLeft/ArrowRight/Home/End, exactly one aria-selected tab, aria-controls resolving to a labelled tabpanel` |
| AC-19 | Every FAQ item is a `summary` inside a `details`, or a `button` carrying `aria-expanded`; the expanded state exposed in the accessibility tree toggles on both Enter and Space, and focus stays on the control | Drives all 8 items with both keys, reading the expanded state through the accessibility tree — `getByRole(…, { expanded })`, backed by the `open` attribute for `details` — never by reading the `aria-expanded` attribute directly, which a native `summary` does not carry | `AC-19 A11Y: FAQ item {i} ("{question}") — {detail}. Expected a summary inside a details, or a button with aria-expanded; the expanded state must toggle on Enter and Space and focus must stay on the control` |
| AC-20 | Tab reaches every tabbable element and never traps focus | Tabs through the page, asserts focus advances, and compares the visited set against the elements whose effective `tabindex` is 0 — excluding the roving-tabindex members AC-18 requires to be `-1` while unselected, and the controls behind the closed mobile menu | `AC-20 A11Y: keyboard trap at {selector}; focus did not move after {n} Tab presses. Unreachable element(s): {selectors}` |
| AC-21 | Under `prefers-reduced-motion: reduce` no element animates or transitions for longer than 1ms; outside it nothing exceeds 200ms | Emulates the media feature and reads computed `animation-duration` and `transition-duration` on every element. `animation-name` may stay set: the standard reduce override collapses the duration rather than removing the animation, so duration is what decides | `AC-21 A11Y: prefers-reduced-motion: reduce is set but {selector} still animates ({property}, {duration}ms, budget 1ms). Outside reduce the budget is 200ms` |
| AC-22 | Every `img` has an `alt` attribute; `[data-decorative]` images have `alt=""`; all others have alt text that is not the filename and not empty | DOM read plus filename comparison | `AC-22 A11Y: <img src="{src}"> has {problem} (alt="{alt}"). Decorative images need alt=""; content images need alt that is not the filename` |
| AC-23 | Every interactive target is at least 24×24 CSS px at 390 | Bounding boxes of all focusable elements at mobile width | `AC-23 A11Y: touch target {selector} is {w}x{h} CSS px at 390px, minimum 24x24` |
| AC-24 | The newsletter input has a programmatically associated label; the consent checkbox is unchecked on load and is not pre-selected by script | Accessibility tree plus `checked` state after load and after 2s | `AC-24 A11Y: newsletter form — {detail}. Expected a programmatically associated label, an unchecked consent checkbox, and no pre-selected opt-in` |
| AC-25 | No element carries a positive `tabindex` | DOM query for `[tabindex]` with value > 0 | `AC-25 A11Y: {selector} has tabindex="{value}"; only 0 and -1 are allowed` |

AC-15 is deliberately run with the accordion open and each tab selected. A violation that only exists in a
state nobody screenshotted is still a violation, and hidden states are where they live.

---

## TOKENS

`checks/specs/tokens.spec.ts`. Walks every element in the rendered page, reads computed style, and checks
each value against `design/tokens/tokens.json`. This is the gate that makes the design system enforceable
rather than aspirational.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-26 | Every colour the page paints appears in `tokens.json` | Computed `color`, `background-color`, `border-*-color`, `outline-color`, `fill`, `stroke`, `box-shadow`; converted to sRGB hex, alpha ignored in the comparison; fully transparent values skipped. `box-shadow` colours are matched against the palette plus the `shadow` group, which `tokens.json` declares an implementation extension outside CANON | `AC-26 TOKENS: off-palette colour {hex} on {selector} ({property}). Nearest token: {token} {tokenHex}` |
| AC-27 | No colour literal is written anywhere outside the token layer | Scans for hex, `rgb(`, `hsl(` across `src/**`, excluding the generated theme layer `src/styles/theme.generated.css`. A scan root that does not exist, or that yields no files, fails the gate rather than passing on an empty result | `AC-27 TOKENS: hard-coded colour {value} in {file}:{line}. Colours may only be declared in design/tokens/tokens.json` |
| AC-28 | `color.text.muted` (`#6B7280`) is used only inside `[data-legal]` | Collects every element whose computed `color` is the muted token, checks ancestry | `AC-28 TOKENS: color.text.muted (#6B7280) used on {selector} outside the footer legal block. Supporting copy uses color.text.secondary (#A7AEBB)` |
| AC-29 | Text on `accent.sodium` is `bg.base`, never white | Finds elements whose background resolves to `#FF6A1A`, reads foreground, computes ratio | `AC-29 TOKENS: {fgHex} on {bgHex} at {selector} gives {ratio}:1. On accent.sodium (#FF6A1A) the canonical foreground is bg.base (#0A0B0D)` |
| AC-30 | Only Space Grotesk, Inter and JetBrains Mono are used, at the declared weights | Computed `font-family` head of stack and `font-weight` | `AC-30 TOKENS: font-family "{family}" weight {weight} on {selector} is not declared. Allowed: Space Grotesk 500/700, Inter 400/500/600, JetBrains Mono 400/700` |
| AC-31 | Every computed `font-size` is on the type scale | Rounds to 0.5px, matches against 12, 14, 16, 18, 20, 24, 32, 40, 56, 72, 96 | `AC-31 TOKENS: font-size {px}px on {selector} is off scale. Nearest allowed: {nearest}px` |
| AC-32 | Every declared `margin`, `padding`, `gap` and `border-radius` snaps to its scale | Computed values, tolerance ±0.5px for sub-pixel rounding; sizes produced by flex or grid distribution are excluded | `AC-32 TOKENS: {property} is {px}px on {selector}, not on the {scaleName} scale ({scaleValues}). Nearest: {nearest}px` |
| AC-33 | Content container is capped at 1200px with 24px gutters at 390 and 48px gutters at 1440 | Bounding box of the container at each width | `AC-33 TOKENS: content container is {width}px wide with {gutter}px gutters at {viewport}px. Expected max-width 1200px, gutter 24px at 390 and 48px at 1440` |

AC-33 does not check the 768 gutter, because CANON §6 does not fix one. A gate must not invent a
requirement the canon left open; that is how verifiers start lying.

AC-28 and AC-29 are the two traps described in CANON §8. They exist as their own criteria, separate from
axe, because axe reports them as generic contrast failures and the loop then fixes them by nudging a hex
value. These messages name the token to move to, so the repair lands inside the system instead of next
to it.

AC-28 is a ceiling, not an instruction. `[data-legal]` is the only place `color.text.muted` may appear; it
does not follow that it has to appear there. `#6B7280` on `#0A0B0D` measures 4.07:1 (`design/tokens/CONTRAST.md`
§5, Trap 1), which clears the 3:1 bar for large text and misses the 4.5:1 bar for everything else, so legal
copy set in muted at body size is a real `color-contrast` violation and fails AC-15. CONTRAST.md says it in
as many words: a genuine axe finding, not an exemption. Footer legal copy therefore uses
`color.text.secondary` unless it is set at 24px, or 18.66px bold, or larger.

---

## VISUAL

`checks/specs/visual.spec.ts`. Playwright screenshots compared against `design/export/` with pixelmatch.

**Capture conditions**, fixed so the comparison means something: Chromium only, `deviceScaleFactor: 1`,
`prefers-reduced-motion: reduce`, `animations: "disabled"`, scrollbars hidden, `document.fonts.ready`
awaited, every `img.complete`, and a fixed image set from `design/assets/`. Two of these being wrong is
the usual explanation for a visual diff that nobody can reproduce.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-34 | Full-page screenshots at 390, 768 and 1440 differ from the design export by no more than **1.5% of pixels**, at a per-pixel match threshold of **0.1** | pixelmatch against `design/export/{390,768,1440}.png` | `AC-34 VISUAL: {viewport}px differs from design/export/{file} by {pct}% of pixels (budget 1.5%). Diff: checks/.diff/{viewport}-diff.png` |
| AC-35 | The hero region differs by no more than **0.5% of pixels** at each breakpoint | Same comparison, clipped to `[data-section="hero"]` | `AC-35 VISUAL: hero at {viewport}px differs by {pct}% (budget 0.5%). Diff: checks/.diff/{viewport}-hero-diff.png` |
| AC-36 | No horizontal overflow at any breakpoint | `documentElement.scrollWidth <= clientWidth + 1`, plus a scan for elements whose right edge exceeds the viewport | `AC-36 VISUAL: horizontal overflow at {viewport}px — scrollWidth {sw}px exceeds viewport {vw}px. Widest offender: {selector} extends to {right}px` |
| AC-37 | Capture preconditions held when the screenshot was taken | Asserted immediately before capture; the gate fails rather than comparing a bad screenshot | `AC-37 VISUAL: capture preconditions not met at {viewport}px — fonts ready {bool}, images decoded {n}/{m}, animations frozen {bool}. No comparison was made` |

A missing baseline is not a failure and not a pass. If `design/export/` holds no PNG for a width, AC-34 and
AC-35 report skip with the reason, and the report says which comparison was never made, because nobody has
told the gate what correct looks like yet. Run `npm run baseline` to record one.

A visual failure has exactly two legitimate resolutions: fix the page, or update the baseline with
`npm run baseline`, which refuses to overwrite an existing baseline without `--yes` and prints what it
replaced. The record of who changed the target and why is the commit: the three PNGs land in the diff, and
the reason belongs in the commit message. Updating a baseline is a human decision. The loop is not allowed
to make it, because an agent that can move the target always hits it.

---

## CONTENT

`checks/specs/content.spec.ts`. Compares rendered text against `brief/CONTENT.md` and CANON. Whitespace is
normalised; case and punctuation are not.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-38 | Every string marked as copy in `brief/CONTENT.md` appears in the rendered page | Extracts the fenced copy blocks and matches each line, whitespace normalised, against the rendered text **plus the copy-bearing attributes**: `<title>`, `meta[content]`, `alt`, `aria-label`, `placeholder`, `title`, `value`. The §1 meta strings and the §13 alt strings live in those attributes and are never body text | `AC-38 CONTENT: string {i} from brief/CONTENT.md not found on the page: "{string}"` |
| AC-39 | All 12 artists appear with exact spelling and casing, each with the correct day, stage and genre tag | Reads `[data-artist]` cards, compares to the CANON §2 table | `AC-39 CONTENT: artist "{name}" — {problem}. CANON §2 row {i}: {day}, {stage}, {genre}` |
| AC-40 | No placeholder text anywhere | Case-insensitive scan for `lorem`, `ipsum`, `dolor sit`, `TODO`, `TBD`, `FIXME`, `placeholder`, `your text here`, `Artist Name` | `AC-40 CONTENT: placeholder text "{match}" found in {selector}` |
| AC-41 | The three ticket tiers show the canonical prices and inclusions, Full Pass is flagged as most popular, and the sold-out warning is driven by `data-places-left` | Reads `[data-tier]` cards | `AC-41 CONTENT: ticket tier "{tier}" — {problem}. Expected Single Night €45, Full Pass €110 (flagged most popular), Full Pass + Workshop €165, and an availability line that agrees with data-places-left` |
| AC-42 | Event facts match canon exactly: dates `12–14 June 2027` with an en dash, venue, city, capacity, three stage names, fourth edition, tagline, secondary line | Exact string comparison per field, dashes intact. Capacity is the one fact CONTENT.md renders in words rather than digits, so `Four thousand people a night` is accepted for CANON’s `4 000 per night`: CONTENT.md is the authority on strings, and a gate that demanded the digits would fail a page that copied the commissioned copy correctly | `AC-42 CONTENT: event fact "{field}" reads "{observed}", canon says "{expected}"` |
| AC-43 | The access note appears inside the tickets section | Verbatim match within `[data-section="tickets"]` | `AC-43 CONTENT: access note missing from the tickets section. Expected verbatim: "Companion tickets for personal assistants are free. Write to access@turbine.fm and we will arrange it, no documentation required."` |
| AC-44 | The fiction disclaimer appears in the footer, unaltered | Verbatim match within `[data-section="footer"]` | `AC-44 CONTENT: fiction disclaimer missing or altered in the footer. Expected the CANON §1 wording verbatim` |
| AC-45 | None of the banned words appear, and no exclamation mark appears in rendered text | Word-boundary scan for `immersive`, `journey`, `unleash`, `elevate`, `curated experience`, plus `!` | `AC-45 CONTENT: banned token "{word}" in {selector}: "{sentence}"` |
| AC-46 | The string `NOVA` appears nowhere in `src/`, `design/`, `brief/CONTENT.md` or the rendered page | Case-insensitive word-boundary scan over that scope; a missing scan root is reported as a failure, so this gate can never pass by finding nothing in a directory that is not there | `AC-46 CONTENT: the string "NOVA" appears in {file}:{line}. See CANON §12` |
| AC-47 | The FAQ has exactly 8 questions and the programme lists all 12 sets across 3 days and 3 stages | Counts accordion items; matches each of the 12 canon sets by name against the `[data-day]` × `[data-stage]` programme cells. CONTENT.md §7 renders the programme twice, as a table and as a stacked list, so cells are matched rather than counted | `AC-47 CONTENT: FAQ has {n} questions (expected 8); programme lists {m} of 12 sets across {d} days and {s} stages` |

AC-46 scopes itself deliberately. `NOVA` is quoted in `docs/CANON.md` and in this file, and a gate that
fails on its own rule teaches participants to disable gates.

---

## LINKS

`checks/specs/links.spec.ts`. Internal integrity only. External URLs are collected and printed, never requested,
because CANON §11 permits ticket CTAs to point at a dead external URL and a gate must not fail on a
condition the brief allows.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-48 | Every in-page anchor resolves to an element that exists | Collects `a[href^="#"]`, resolves each id | `AC-48 LINKS: <a href="{href}"> in {selector} points to an id that does not exist` |
| AC-49 | No empty or placeholder hrefs | Rejects `href=""`, `href="#"`, `javascript:`, and `href` missing on `<a>` | `AC-49 LINKS: <a> in {selector} has href="{href}". Empty, "#" and javascript: hrefs are not allowed` |
| AC-50 | Every IDREF attribute points at an existing id | Checks `aria-controls`, `aria-labelledby`, `aria-describedby`, `for`, `form` | `AC-50 LINKS: {attribute}="{id}" on {selector} references an id that does not exist` |
| AC-51 | Every local asset referenced by the page exists in `dist/` | Resolves `src`, `srcset`, `href`, and `url()` references against the build output | `AC-51 LINKS: asset {url} referenced by {selector} is missing from dist/ (resolved to {resolvedPath})` |

---

## PERF

`checks/gates/lighthouse.mjs`. Lighthouse 12.x, pinned. Default mobile emulation, simulated throttling, three
runs, **median** taken. Run against `npm run preview` on localhost, not against the internet, so the
result measures the page rather than the conference wifi.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-52 | Performance score ≥ **90** | Median of 3 | `AC-52 PERF: Lighthouse performance {score} (median of 3), minimum 90. Worst audit: {audit} at {value}` |
| AC-53 | Accessibility score = **100** | Median of 3 | `AC-53 PERF: Lighthouse accessibility {score}, required 100. Failing audits: {audits}` |
| AC-54 | Best Practices score ≥ **95** | Median of 3 | `AC-54 PERF: Lighthouse best-practices {score}, minimum 95. Failing audits: {audits}` |
| AC-55 | SEO score ≥ **95** | Median of 3 | `AC-55 PERF: Lighthouse SEO {score}, minimum 95. Failing audits: {audits}` |
| AC-56 | Budgets: LCP (Largest Contentful Paint — when the main image or heading finishes drawing) ≤ **2.5s**, CLS (Cumulative Layout Shift — how much the page jumps while it loads) ≤ **0.10**, TBT (Total Blocking Time — how long the page ignores taps) ≤ **200ms**, total transfer ≤ **1500 KB**, largest single image ≤ **400 KB** | Read from the same Lighthouse run | `AC-56 PERF: budget exceeded — {metric} is {value}, budget {budget}` |

### Why these numbers and not 100

**Performance 90.** The canon mandates three Google Fonts families and a full-bleed hero photograph of a
power station. On Lighthouse's throttled mobile profile that costs real milliseconds. A threshold of 100
would be satisfied only by deleting the type system or the hero, which means the gate would be enforcing
the opposite of the design. 90 is the bottom of Lighthouse's green band: high enough that a genuinely slow
page fails, low enough that the page the design asks for can pass.

**Accessibility 100.** This one is at 100 because it is nearly free. Lighthouse's scored accessibility
audits are drawn from axe, so a green AC-15 normally means a green AC-53. The two are not identical, and it
is worth knowing where they part: Lighthouse scores some rules that AC-15's WCAG tag filter excludes, and it
renders one emulated width in one state where AC-15 audits three widths in six. When they disagree, compare
the failing audit's viewport and state against AC-15's before concluding the page is at fault. What this
score is not: a measure of accessibility. See the last section.

**Best Practices 95 and SEO 95.** These categories contain few audits, so a single environment-driven
failure moves the score several points. A Chrome deprecation warning introduced between the rehearsal and
the room, or a canonical-URL audit reacting to the Netlify preview domain, would turn the loop red for a
reason no participant can fix in 90 minutes. Five points of slack absorbs one such surprise and nothing
more: two failing audits still fails.

**The budgets are the real gate.** A category score is a weighted, rounded proxy. AC-56 states the numbers
that describe what a visitor experiences, and it is the row to look at first when AC-52 fails. Largest
Contentful Paint at 2.5s and Cumulative Layout Shift at 0.10 are the Core Web Vitals "good" thresholds;
Total Blocking Time at 200ms is Lighthouse's own good band; the transfer budgets are set just above what the
design needs, so adding an unoptimised image trips them immediately.

### Why 1.5% and 0.5% for pixels

Zero is not achievable and pretending otherwise trains people to ignore the gate. Font rasterisation
differs between the renderer that produced `design/export/` and Chromium, sub-pixel layout differs between
machines, and image decoding is not bit-identical across platforms. Those differences land at roughly
0.2–0.6% of a full-page screenshot in practice.

1.5% sits above that floor and below the smallest change anyone cares about: a reflowed paragraph, a card
that dropped to the next row, a section that lost its padding all exceed it comfortably. The hero gets
0.5% because it is one screen rather than a whole page, so the same absolute error is a larger proportion,
and because it carries the wordmark, where a two-pixel letter-spacing mistake should be caught rather than
averaged away.

The per-pixel threshold of 0.1 is pixelmatch's colour-distance tolerance. It ignores antialiasing on glyph
edges and catches an actual colour change. Setting it to 0 counts every antialiased edge as a difference,
and the gate then fails on everything, which is the same as failing on nothing.

---

## DEPLOY

Not part of `npm run check`, and not a file under `checks/`. AC-57 is `npm run deploy`. AC-58 and AC-59
are a fetch of the published URL, and AC-60 is `npm run check -- --url {deploy-url}`, the same gates re-run
against the published page. All four run only once `npm run check` has exited 0 against the local build,
which is the whole of what "only deploy what passed" means here: the verification command verifies and
nothing else, and no run of it can publish anything.

| ID | Criterion | Gate | Failure message |
|---|---|---|---|
| AC-57 | `npm run deploy` — `npx netlify deploy --prod --dir=dist` — exits 0 and prints a deploy URL | Exit code plus URL extraction from stdout | `AC-57 DEPLOY: netlify deploy exited {code}; no deploy URL found in output. Last line: {stderr_tail}` |
| AC-58 | The public URL returns 200 with `content-type: text/html` over HTTPS | GET with 5 retries over 30s | `AC-58 DEPLOY: GET {url} returned {status} {contentType} after {n} attempts over {seconds}s` |
| AC-59 | The deployed page is the build that passed the gates: its `<body>` is identical, and every `<head>` element the build wrote is present | sha256 of the normalised `<body>` on both sides, plus containment of each built `<head>` element in the served `<head>`. Whole-document hashes are recorded alongside | `AC-59 DEPLOY: deployed index.html sha256 {remote} does not match local dist/index.html {local}` |
| AC-60 | A smoke run against the live URL finds zero axe violations and zero broken internal anchors | `npm run check -- --url {deploy-url}` re-runs axe and the link check against the public URL at 1440 | `AC-60 DEPLOY: live smoke failed at {url} — {n} axe violation(s), {m} broken anchor(s). First: {detail}` |

AC-59 originally said **byte-identical**, and it was wrong — twice, which is the interesting part.

The first correction: Netlify injects an HTML comment into every page it serves, so the served bytes
never equal the built bytes on any project, on any deploy. Stripping comments before hashing seemed
to fix it. It did not — the gate still failed.

The second correction, found by diffing the two documents rather than by reasoning about them:
Netlify also injects two `<meta>` tags into `<head>`. Measured on this project, the host adds 408
bytes that the build never wrote.

What is actually true, and what the gate now checks:

- the served `<body>` is **byte-identical** to the built `<body>`, normalised for whitespace —
  measured at 101,998 bytes on both sides, sha256 `e6a8d42201d00c7e`
- every one of the 19 `<head>` elements the build wrote is **present** in the served `<head>`

Containment, not equality, is the true relationship for the head: the host may add to it and does.
That still catches a stale deploy, the wrong directory published, a CDN serving an older build, or a
host rewriting markup — which is everything the criterion was for.

Worth stating plainly, because it is the honest version of the story this workshop tells: the first
attempt at this criterion was unachievable, the second was still wrong, and the only reason either
was discovered is that the gate was run against a real deployment instead of being reasoned about.
A criterion nobody has executed is a wish.

AC-59 is the criterion that is usually missing. Everything else proves that a page somewhere passed. This
proves that the page that passed is the page that shipped.

---

## What these gates do NOT catch

This is the part to read twice. Everything above is worth building, and it is worth being precise about
how far it reaches.

### Accessibility

Automated rules catch, by the estimate usually quoted from WebAIM's and Deque's rule-coverage analyses,
**30 to 40 percent of WCAG success criteria** — the share of the standard that has a machine test at all,
across the standard in general, not a measurement of this page. The higher figures vendors publish count
issues found on typical pages, which is a different quantity: one rule firing a thousand times is a thousand
issues and one criterion. The rest of the standard has no machine test and never will, because the remaining
criteria are about meaning. Specifically, a fully green run above is still consistent with:

- `alt` text that is present, unique, and wrong. "Image of a person" passes AC-22.
- Headings that nest perfectly and say nothing. AC-08 checks the number, not the sentence.
- A focus order that is sequential in the DOM and incoherent on screen, because CSS grid reordered the
  cards. Axe does not compare visual order to reading order.
- ARIA that is valid and lying. AC-18 checks that the tabs behave like tabs. It cannot tell you that this
  content should never have been tabs.
- Text over the hero photograph. Axe skips contrast where it cannot resolve a background, so the one place
  contrast is most likely to be wrong is the one place it reports nothing.
- Anything a screen reader actually announces. Order, verbosity, live region timing, whether the day filter
  tells a user that the list changed. None of it is tested here.
- Reflow at 320px and 200% zoom, and text spacing overrides. Three fixed widths are not responsive testing.
- Motion that honours the media query and still makes someone ill at the default setting.
- Twelve artist cards that are each reachable, and take forty Tab presses to get past.

### Visual

A pixel diff detects that something changed. It cannot say what is wrong, which of the two images is
correct, or whether the difference matters. A 0% diff against a bad export is a pass. Masked regions hide
regressions as effectively as they hide noise. And the gate says nothing about the breakpoints between
390, 768 and 1440, where layouts actually break.

### Tokens and content

AC-26 through AC-33 prove the page used the palette. They say nothing about whether it used it well:
hierarchy, rhythm, emphasis, how much sodium orange is too much on one screen. A page can be 100 percent
on-token and illegible.

AC-45 catches "immersive" because it is on a list. It does not catch a sentence that is merely limp, copy
in the wrong section, or a headline that is technically canonical and lands badly. Tone is checked here by
a banned-word list, which is the crudest instrument in the file.

### Performance and deployment

Lighthouse is lab data from one emulated device on one simulated network. It is not field data, and a
median of three runs is a smaller claim than it sounds. AC-58 proves a server returned 200. It does not
prove the page worked for a person on a train with a screen reader and a slow connection.

### And the obvious one

**Nothing above judges whether the design is good.** Not whether the hero says "1928 power station" or
"any nightclub". Not whether 12 cards should have been a list. Not whether the page is worth the visitor's
attention. Every gate in this file can be green on a page nobody should ship.

---

## What still needs a person

Two roles, and neither of them is allowed to move a gate.

**A human pass, before the deploy gate runs.** Keyboard only, start to finish, with the mouse physically
out of reach. One screen reader over the tabs, the accordion and the newsletter form. The page at 320px and
at 200% zoom. The copy read aloud, which is the fastest test of tone anyone has invented. Ten minutes of
this finds things the entire suite above cannot.

**An adversarial review agent, structurally separate from the generator.** Different prompt, no access to
the generator's reasoning or its plan, pointed at the rendered DOM and `docs/CANON.md` with one
instruction: argue that this page is wrong. Its useful targets are exactly the list above — alt text that
is present and meaningless, ARIA that is valid and dishonest, contrast over imagery, tone that passes the
banned-word list and fails the ear.

Two constraints make it safe to keep in the loop:

1. **Every claim must cite a selector or a file and line.** A criticism that cannot point at something is
   discarded unread.
2. **Its output never sets pass or fail.** It opens items in `checks/adversarial-report.md`, in the shape
   of `checks/report.md`, for a person to triage. Determinism is the property that makes the rest of this
   file trustworthy, and one model with veto power removes it.

The pattern to take home is smaller than the toolchain: **the thing that checks the work must not be the
thing that did the work, and it must not be able to change its mind.** Sixty automated criteria and a
quiet ten minutes with the keyboard are a better pair than either alone, and far better than a model asked
politely whether it is happy with what it produced.
