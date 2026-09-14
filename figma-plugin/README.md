# TURBINE — build design file

A Figma plugin that constructs the TURBINE design file from the same tokens and the same copy the
code reads, so the design is reproducible rather than drawn by hand and hoped to match.

The point is narrow and worth stating plainly. A design-to-code loop only works if the design is
the upstream source of truth. The moment a colour in Figma is a hex somebody typed, the token check
in the loop is comparing a file against a habit. Running this plugin produces a file where every
fill is a bound variable, every heading is a text style, every card is a component, and every string
came out of `brief/CONTENT.md` — which is exactly the file the Dev Mode MCP server can describe back
to a coding agent without either of them guessing.

**This is one of two supported routes to the design.** The other is `design/export/`, the committed
PNGs and the token JSON. Neither is a fallback for the other. If you have a Figma account and want to
see the loop read a live design, run the plugin. If you do not, the exports are the design, the gates
compare against them, and nothing downstream is degraded. Workshop participants who have never opened
Figma lose nothing by taking the second route.

---

## What has and has not been verified

Everything else in this repository is checked by a program. This is not, and saying so is more useful
than pretending otherwise.

**Verified, mechanically:**

- `code.js` and `data.generated.js` parse (`node --check`).
- `data.generated.js` evaluates and contains the full token set, all twelve canonical artists, and
  every section of `brief/CONTENT.md`.
- The data file is generated from `design/tokens/tokens.json` by `scripts/build-figma-plugin.mjs`, so
  no value in it was typed by hand.
- `manifest.json` matches the fields the Figma plugin manifest requires, and declares no network access.

**Not verified: the plugin has not been run inside Figma.** It was written on a Linux server with no
Figma desktop app, against the published Plugin API, and no one has watched it build a file. The Plugin
API is asynchronous in places where getting it wrong produces a plausible-looking failure — fonts that
were not loaded before a text node is created being the usual one — so expect to fix something the
first time you run it.

That is the honest state. If this were code the gates covered, it would say `PASS` or `FAIL`; it is not,
so it says neither. Run it, and if it breaks, the fix belongs in this repository.

---

## Install it

Figma **desktop app** only — the browser version cannot load a plugin from disk.

1. Clone or download this repository.
2. Open the Figma desktop app and create a **new, empty design file**.
3. Menu → **Plugins → Development → Import plugin from manifest…**
4. Choose `figma-plugin/manifest.json`.
5. Menu → **Plugins → Development → TURBINE — build design file**.
6. Press **Build design file**.

That is the whole install. The plugin appears under Development for you only; nothing is published
and nothing leaves your machine. The manifest declares `networkAccess: { allowedDomains: ["none"] }`,
which means Figma will block the plugin from making any network request at all — there is nothing to
review and nothing to trust.

If Figma reports that the manifest needs a `documentAccess` field, add this line and re-import:

```json
"documentAccess": "dynamic-page",
```

The plugin already uses the asynchronous page and style APIs that mode requires, so nothing else
changes.

### It needs three fonts

Space Grotesk, Inter and JetBrains Mono, all from Google Fonts and all available in a normal Figma
account. If one is missing the plugin does not stop: it substitutes the nearest Inter weight, writes
a warning into the panel log naming the substitution, and carries on. A file built with a substituted
display face will not match the exported PNGs, so install the font and press Build again.

---

## What it creates

About three thousand layers across six pages, in the order `design/FIGMA-SPEC.md` §1 fixes.

| Page | What lands there |
|---|---|
| `Cover` | The 1600×960 cover frame, set as the file thumbnail |
| `Design system` | The token proof sheet, the measured contrast matrix, seventeen type specimens, and all ten component sets plus the skip link |
| `Desktop 1440` | `TURBINE / Desktop 1440` — the ten exported section frames, composed |
| `Tablet 768` | The same sections at 768, with the §6 deltas applied |
| `Mobile 390` | The same sections at 390, with the §7 deltas applied |
| `Exports` | The thirty-three-file export manifest; the sixteen images with their alt text, each set to export at its original width under its own file name; and `exports/content`, every string the frames do not show |

Underneath that:

- **Four variable collections, 73 variables.** `TURBINE / Color` (fourteen, one `Dark` mode),
  `TURBINE / Type`, `TURBINE / Scale`, and `TURBINE / Responsive` — the only collection with more
  than one mode. Setting the mode on a viewport frame is what resizes the type and the gutters; no
  text layer is duplicated per breakpoint.
  On a plan that allows one mode per collection (Figma's free plan does, and says
  `Limited to 1 modes only`), the build does not stop: `TURBINE / Responsive` keeps the single
  `Desktop 1440` mode, the Tablet and Mobile frames get their gutters, section padding and lead
  sizes written as plain values instead, and the panel logs one warning saying so. The frames should
  look the same; the difference is that those values in the tablet and mobile frames are not variables,
  and the lead text there loses its `Body/Lead` style link.
- **Seventeen text styles**, each binding family, weight and size to a variable. Line height and
  letter spacing are percentages written on the style: Figma reads a number variable bound to either
  as pixels, so binding `leading/tight` (108) gives 108px leading instead of 108%.
- **Ten component sets and 75 components**: Button (24 variants), Input (15), Nav (10), TabBar (4)
  with its nested Tab (4), ArtistCard (3), TicketCard (3), TimetableRow (4), FaqRow (2), Ticker (2),
  Footer (3: `wide`, `stacked`, `compact`), and the `a11y/skip-link` component.
- **Measured from the reference site, not only from the spec.** Content is 1104 wide at 1440 and
  672 at 768 (CANON §6's 1200 read as including the 48px gutters, and 48 at tablet rather than
  FIGMA-SPEC's 32); artist cards 258 / 208 / 163; ticket cards 352; h2 leading 100% / 111% / 120%
  and h3 120% / 133%; four even programme columns; a one-line programme row at 390; a footer whose
  link columns sit two across at 768 and 390. `design/FIGMA-SPEC.md` §4, §6 and §12 still describe
  the earlier numbers.
- **`exports/content`**: the document head, the seventeen accessible names and hidden labels, the
  lineup tab status lines, the newsletter messages, the programme as it reads at 390, and all eight
  FAQ answers. None of them is visible in a composed frame, so an SVG export of the sections alone
  would lose them — export this frame too.
- **The real images.** The sixteen files `brief/CONTENT.md` §13 lists are read from
  `design/assets/` by `node scripts/build-figma-plugin.mjs` and injected into `code.js` as base64,
  which is why that file is about 1.7 MB. The hero, the venue and all twelve artist portraits are
  image fills, so the file — and anything exported from it — carries the photographs, not grey
  boxes. On the `Exports` page, select the sixteen images and press Export to get the files back
  by name. Figma re-encodes them on export: the dimensions match `design/assets/`, the file bytes
  and JPEG compression will not.
- **Export settings already applied** to all thirty-three source layers: PNG, 1×, sRGB, contents-only
  off. You do not pick layers by hand.
- **Dev Mode annotations** on the five interactive areas CANON §9 makes non-negotiable demands about
  — nav, lineup tabs, programme tables, FAQ trigger, newsletter form — plus alt text on every image
  frame, because a picture of an accordion does not say `aria-expanded`.

**Time:** a minute or two on a recent laptop. The fifteen hundred text nodes are the slow part; the
progress line in the panel names the step it is on. Everything the plugin makes is one undo step, so
if you dislike the result, press Cmd/Ctrl+Z once.

Run it in an **empty file**. If it finds a `Design system` page it stops and asks you to tick
**Replace existing**, which clears the previous build — pages, collections and styles — before
rebuilding.

---

## Afterwards

1. **Rename the file** to `TURBINE — Landing page`. The plugin cannot rename the file it is running
   inside.
2. **Check Dev Mode reads it.** Switch to Dev Mode, select `section-tickets`, and ask for its
   variables. You should get back `color/accent/sodium`, `space/6`, `radius/lg`, `text/base`. If you
   get hex values, the file is not ready and no amount of prompting will fix that.
3. **Publish** the file if you want the MCP server to reach it: Share → make the file accessible,
   then copy a node link per section (right-click the section frame → Copy link to selection). The
   loop is given a node link per section, not a link to the whole page — a whole-page selection
   returns thousands of nodes and the model summarises instead of reading.
4. **Export**, if you are regenerating the visual baselines. Every source layer already carries its
   settings, so one Export action produces the lot. See the note on filenames below.
5. `Ready for dev` is set on the three viewport frames and on nothing else.

---

## Two things the sandbox cannot do, stated rather than hidden

**Images are placeholders.** A Figma plugin has no filesystem and no network, so it cannot load
`design/assets/hero-hall.jpg` and put it in a fill. Every image position is built as a correctly
sized, correctly cropped, correctly named frame carrying the real filename and the real alt text as a
Dev Mode annotation. Dropping the fourteen placed files in is a designer's two minutes, and each
frame says which file belongs in it. Everything else about the file — layout, type, colour,
components, variables — is complete.

The filenames are resolved by role rather than by literal string: the hero is whichever image in
`brief/CONTENT.md` §13 has *hero* in its name, and an artist portrait is whichever one contains that
artist's slug. The asset pack has already been re-cut once during this project, and a plugin that
hard-codes `hero-hall-e.webp` quietly loses its alt text the day somebody renames it to
`hero-hall.jpg`. If §13 renames a file again, re-run the generator and the plugin follows.

**Three of the thirty-three exports need renaming.** Figma builds an export filename from the layer
name plus the suffix. The thirty section exports come out right, because `section-hero` plus `-1440`
is `section-hero-1440.png`, which is the name `checks/specs/visual.spec.ts` looks for. The three
full-page exports come from frames named `TURBINE / Desktop 1440`, and a slash in a Figma layer name
creates a folder, so they land as `Desktop 1440-1440.png` inside a `TURBINE` folder and have to be
renamed. Rename them to `full-page-1440.png` and its two siblings: the visual gate accepts both that
spelling and the bare `1440.png` that `npm run baseline` writes, and prints every path it tried when
it finds neither. The manifest on the `Exports` page lists all thirty-three source layers against
their target filenames so nothing has to be worked out twice.

---

## How the data gets in

`code.js` contains no colour, no size and no line of copy. It reads one object, `TURBINE_DATA`,
generated by:

```bash
node scripts/build-figma-plugin.mjs
```

That script parses `design/tokens/tokens.json` and `brief/CONTENT.md`, derives the Figma-side layer
that `design/FIGMA-SPEC.md` specifies, computes the contrast ratios on the proof sheet from the hex
values rather than copying them out of `CONTRAST.md`, and writes `figma-plugin/data.generated.js`.
It then injects that same bundle into `code.js` between two markers, because a Figma manifest names
exactly one `main` script and the sandbox has no way to load a second file. Only the marked region is
rewritten.

The script is strict on purpose. If a heading moves in `CONTENT.md`, or a fenced block disappears, or
the artist count stops being twelve, it throws and names the section. A copy deck that has drifted
from the design file should fail loudly, not quietly produce a file with a stale price in it.

Re-run it whenever `tokens.json` or `CONTENT.md` changes, then re-import the plugin in Figma —
Figma caches the plugin source, so **Plugins → Development → Import plugin from manifest…** again, or
close and reopen the file.

### The files

| File | What it is |
|---|---|
| `manifest.json` | Plugin manifest. No network access. |
| `code.js` | The plugin main thread. ES5 syntax throughout, with `async`/`await` as the one unavoidable exception — every font load, page switch and style application in the Figma API is asynchronous. |
| `data.generated.js` | Generated. Tokens and copy, one frozen object. Do not edit. |
| `ui.html` | The panel. Inline CSS in the TURBINE palette, no external resources. |

One rule inside `code.js` is worth knowing if you go reading: there is exactly one
`figma.createText()` call in the whole file, inside the `text()` helper, and it sets `fontName` from
a registry that `loadFonts()` fills before anything is drawn. That is how the plugin guarantees the
awaited `figma.loadFontAsync` the Figma API demands before any text node is touched — not by
remembering to do it in ninety places, but by there only being one place.
