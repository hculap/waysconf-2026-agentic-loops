# TURBINE — image generation script

Every photographic image in the TURBINE design pack is generated from this file. There are no
hand-picked stock photographs and no images whose origin is unrecorded. Each entry below gives a
filename, exact output dimensions, the generation parameters, the full prompt, and the alt text the page
will ship with.

Two files in `design/assets/` come from somewhere else and say so here rather than being quietly absent:
the two overlay textures, which are arithmetic rather than photography and are produced by
`scripts/generate-textures.mjs`, for the reasons §5 gives. The static map placeholder `docs/CANON.md` §7
requires in the Venue section is not in this file either, because it is not an image at all:
`design/FIGMA-SPEC.md` §5.6 draws it as a bordered box with a label, since `docs/CANON.md` §11 rules out
an embedded map.

**This file is the manifest.** The filenames, pixel dimensions, formats and alt text given below are the
ones the pack ships and the ones `brief/CONTENT.md` §13 repeats for the implementing agent; where the two
disagree, this file is the one that produced the bytes. `scripts/copy-assets.mjs` copies every image in
`design/assets/` into `public/images/` as a `prebuild` step, so the served path of any file named here is
`/images/<filename>` — which is where `src/layouts/Base.astro` points `og:image`.

Target model: **Nano Banana Pro**, model id `gemini-3-pro-image`, Google Gemini API.

All facts about the festival come from [`docs/CANON.md`](../../docs/CANON.md). Nothing in this file
invents a lineup detail, a date, a price or a colour. The subject matter is a 1928 coal power station in
Kraków, three nights in June 2027, twelve fictional artists.

---

## 1. Method

### 1.1 One preamble, repeated verbatim

Every prompt in this file opens with the same block of text. It fixes palette, light, grain, and the
prohibitions, so that sixteen separate API calls return images that look like they came from one
photographer on one night. The preamble is written out in full inside each fenced block rather than
referenced, because each block is sent to the API exactly as it appears here. A prompt that depends on
text somewhere else in the document is a prompt that breaks the first time someone copies it.

This is the shared preamble:

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.
```

The per-image instruction follows the preamble in the same block, separated by a blank line.

### 1.2 Why no text in the images

Text baked into a picture is text that cannot be translated, cannot be selected, cannot be resized by the
reader, cannot be found by search, and cannot be read aloud by a screen reader. It also cannot be checked:
the axe-core and contrast gates in `checks/` see the DOM — the page's real text and the styles computed
for it — and not pixels, so a wordmark painted into a JPEG passes every automated test while failing
every real user who needs it to be larger.

So the images carry light and material only. The wordmark, the dates, the venue, the ticket prices and
the calls to action are all DOM elements rendered over the image with a CSS scrim behind them. That is
why several prompts below ask for a quiet, near-black region in a specific part of the frame: the layout
needs somewhere to put words, and the contrast ratio of `color.text.primary` (`#F2F4F7`) over that region
has to clear 4.5:1 the same as any other body text on the page.

The rule is worth stating to participants in one line: **if a human has to read it, it has to be text on
the page, not paint in the picture.**

The rule is about the page, and the social card is the image that has no page around it. A share preview
is fetched as a flat bitmap and drawn by Slack, LinkedIn, X or iMessage, where there is no DOM to render
over it and no CSS to scrim it. §6 explains what that means for `og-card.jpg`, and it is an application
of the rule rather than an exception to it.

### 1.3 SynthID

Nano Banana Pro embeds **SynthID**, Google's invisible watermark, in every image it returns. It survives
resizing, cropping and re-encoding, and it is detectable with Google's own tooling. Two consequences for
this workshop:

- The assets in `design/assets/` are traceably synthetic. That is intended, and the fiction disclaimer
  required by `docs/CANON.md` §1 covers it in `CREDITS.md` and the site footer.
- Do not present these images as photographs of a real venue, and do not strip metadata in an attempt to
  hide their origin. The watermark is not metadata, and the attempt would be the interesting part of the
  story rather than the image.

The visible provenance line lives in `CREDITS.md`. This file records the prompts; that file records what
the reader is looking at.

### 1.4 Cost

Nano Banana Pro is billed per generated image, at roughly **USD 0.134** per image at the 1K and 2K output
tiers. The set here is 16 images:

| Group | Count | Tier | Approx. cost |
|---|---:|---|---:|
| Hero | 1 | 4K | 0.24 |
| Venue | 2 | 2K | 0.27 |
| Artist portraits | 12 | 1K | 1.61 |
| Social card | 1 | 2K | 0.13 |
| **Total** | **16** | | **≈ USD 2.25** |

The two textures are not in this table. They are generated procedurally and cost nothing — see §5.

At a flat 0.134 per image the fifteen non-hero entries come to about **USD 2.01**; the hero is the only entry rendered at the 4K
tier, which costs more (roughly USD 0.24). Neither figure is the number to budget with. In practice a
pack like this takes two to four passes before the grid reads as a set, so plan on **USD 6 to 10** for a
full build from scratch, and near zero afterwards because the outputs are committed.

Cost is per *returned* image, so a `--dry-run` costs nothing and `--only` costs one image for every id it
matches: `--only artist-07-hiroko-vane` is one call at about USD 0.13, and the glob `--only "artist-*"` is
twelve of them at about USD 1.61. Regenerating the whole set to fix one portrait is the expensive mistake.

### 1.5 Output tiers, cropping and exact dimensions

The model emits at fixed tiers (1K, 2K, 4K) for a chosen aspect ratio; it does not emit arbitrary pixel
sizes. The generation script therefore requests the nearest tier at the correct aspect ratio and resizes
down to the exact target with `sharp`, using Lanczos. Downscaling is safe. Upscaling is not, so no target
is larger than the tier it comes from.

| File | Target | Aspect | Requested | Post-process |
|---|---|---|---|---|
| `hero-hall.jpg` | 2400×1350 | 16:9 | 16:9, 4K (3840×2160) | resize to 2400×1350, JPEG q82, progressive |
| `venue-exterior.jpg` | 1600×1200 | 4:3 | 4:3, 2K (2048×1536) | resize to 1600×1200, JPEG q82 |
| `venue-detail.jpg` | 1600×1200 | 4:3 | 4:3, 2K (2048×1536) | resize to 1600×1200, JPEG q82 |
| `artist-01…12-*.jpg` | 800×800 | 1:1 | 1:1, 1K (1024×1024) | resize to 800×800, JPEG q80 |
| `og-card.jpg` | 1200×630 | 16:9 requested, 1.905:1 delivered | 16:9, 2K (2048×1152) | centre-crop to 2048×1075, resize to 1200×630, JPEG q85 |

1200×630 is not an aspect ratio the model offers, which is why the social card is generated wide and
cropped. One frame of reference for that, since the numbers are easy to mix up: the crop from 2048×1152
to 2048×1075 removes 38 px from the top and 38 px from the bottom of the **generated** frame, and the
prompt asks for the top and bottom five percent of that frame — about 58 px — to be clear of anything
important. The margin is deliberate and it is stated once, in the generated frame's pixels, not in the
1200×630 output's.

The two textures used to be the awkward case here, for a reason worth keeping: generative models do not
produce seamlessly tileable output on request, whatever the prompt says. They are no longer generated at
all. The model refused both on a recitation filter, and the refusal turned out to be a favour —
`scripts/generate-textures.mjs` produces better files deterministically, in a fraction of the bytes.
See §5.

### 1.6 Alt text policy

`docs/CANON.md` §9 requires meaningful `alt` on every image and `alt=""` on decorative ones. The alt text
given for each image below is the text the page ships, with one qualification worth showing participants:

- The **artist portraits** sit inside cards whose heading already contains the artist's name. The alt text
  below therefore describes the picture and does not repeat the name. Repeating it makes a screen reader
  announce the name twice in a row, which is noise, not accessibility.
- The **textures** are decorative overlays and are applied as CSS backgrounds, so they never appear as an
  `<img>` and never need alt at all. The strings below are documentation, not markup.
- The **social card** string goes in `og:image:alt`, not in an `alt` attribute.

An alt string here is also the shot brief: it describes the picture that was actually generated, and if a
file does not show what its alt text describes, the file is wrong, not the string. `brief/CONTENT.md` §13
carries the same strings for the implementing agent, who never reads this file; they are written once,
here, next to the prompt that produced the image.

### 1.7 The safe area, checked in code

One image in the pack has text placed over it at render time. `hero-hall.jpg` carries the wordmark, the
dates, the venue and two buttons across its lower half, so that region has to stay dark enough for
`color.text.primary` (`#F2F4F7`) to clear 4.5:1 over it *before* the CSS scrim is applied. The social card
is not in this list, and §6 says why.

A constraint is only machine-checkable if the decision procedure is written down. "Sample the region and
take the worst-case contrast" is not a specification: on this hero, the brightest pixel gives 0.91:1, the
mean gives 11.46:1, the 99th percentile gives 1.80:1 and the 95th gives 4.70:1. Four readings of the same
sentence, two verdicts. So the rule is arithmetic, and `scripts/check-image-safe-areas.mjs` implements
exactly this and nothing else:

1. Take the region — for the hero, the lower half of the frame.
2. Divide it into 16 × 16 px tiles; the remainder strip at the right and bottom edges forms narrower
   tiles rather than being discarded.
3. For each tile compute the mean of the per-pixel WCAG relative luminance — the mean of the luminances,
   not the luminance of the mean colour.
4. Contrast against `#F2F4F7` is `(0.8983 + 0.05) / (L + 0.05)`.
5. The region **passes** when at most 2% of tiles fall below 4.5:1 *and* no single tile falls below 3:1.

16 px is about the area a glyph stem covers at the sizes used over this image, so a tile is roughly one
letter's worth of background. The 2% allowance exists because a headline never covers a whole region; the
3:1 floor stops that allowance being spent on one blown highlight sitting directly under a word. The
script exits non-zero and prints both measured numbers and both thresholds, so the figure a repair prompt
has to beat travels with the failure instead of living only here.

A regenerated hero that comes back brighter than the last one fails the gate before it ever reaches the
page, which is the whole argument of the workshop applied to an asset pipeline.

### 1.8 Machine-readable markers

Each image below is wrapped in HTML comments that the generation script parses. The comments are invisible
in rendered Markdown and are the contract between this document and `scripts/generate-images.mjs`:

```text
<!-- gen:begin id="…" file="…" width="…" height="…" aspect="…" tier="…" crop="…" format="…" quality="…" -->
…metadata table, then one fenced block of type text holding the prompt…
<!-- gen:end -->
```

The script takes the **first** `text` fenced block between the markers as the prompt, verbatim, including
the preamble. Editing a prompt here changes what gets generated; there is no second copy of the prompt in
the script. The script records a SHA-256 of each prompt in `design/assets/manifest.json`, so a changed
prompt is visible in a diff and an unchanged prompt does not get regenerated unless `--force` is passed.

Two parsing rules, both of which the example above will break if they are ignored. The parser must strip
fenced blocks before it looks for markers, otherwise the illustrative opening marker inside the fenced
example is read as a nineteenth image. And it must reject any entry whose attributes are not all present and
numeric where numbers are expected, rather than guessing a default. A correct run finds exactly **16**
entries; `--dry-run` prints the count, and any other number means the parse is wrong, not the file.

---

## 2. Hero

<!-- gen:begin id="hero-hall" file="hero-hall.jpg" width="2400" height="1350" aspect="16:9" tier="4K" crop="none" format="jpg" quality="82" -->

### `hero-hall.jpg`

| | |
|---|---|
| Output | 2400 × 1350 px |
| Aspect ratio | 16:9 |
| Generated at | 16:9, 4K tier (3840 × 2160), downscaled |
| Used in | Section 3, Hero — full-bleed background behind the wordmark, dates, venue and two CTAs |
| Constraint | Lower half must pass the §1.7 safe-area check |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

The interior of a decommissioned 1928 coal-fired power station at night. A vast turbine hall: riveted
steel roof trusses eighteen metres overhead, a travelling crane rail running the length of one wall, a
row of dead generator housings down the centre of the floor like beached whales, oil-stained concrete,
brick piers, tall arched steel-framed windows showing only black. Sodium work lamps rigged high on the
brick piers throw hard orange pools across the upper walls and the roof trusses, well above the heads of
the crowd; everything beyond their reach falls to black. A thin cyan haze fills the upper volume of the
hall and catches the light in visible shafts. Several hundred people stand in the middle distance, all
facing away from the camera, entirely unlit, reading as flat dark silhouettes with no visible faces and
no detail. Wide shot from a raised position at the back of the hall, 24mm equivalent, camera level and
square to the room, the far end of the hall dissolving into darkness. Keep the bottom half of the frame
quiet and close to black: floor, haze and silhouette only, with no bright element, no busy detail and no
pool of lamplight anywhere in it. Practical light only, no stage rig, no video wall, no lasers, no
strobes, no smoke machines aimed at the camera.
```

**Alt text:** `The interior of a vast disused turbine hall at night, steel roof trusses overhead, a crowd standing in silhouette under orange work lamps and cyan haze.`

<!-- gen:end -->

---

## 3. Venue

<!-- gen:begin id="venue-exterior" file="venue-exterior.jpg" width="1600" height="1200" aspect="4:3" tier="2K" crop="none" format="jpg" quality="82" -->

### `venue-exterior.jpg`

| | |
|---|---|
| Output | 1600 × 1200 px |
| Aspect ratio | 4:3 |
| Generated at | 4:3, 2K tier (2048 × 1536), downscaled |
| Used in | Section 7, Venue — left column of the two-column block |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

The exterior of a 1928 brick-and-steel coal-fired power station at blue hour, photographed from across an
empty yard. A long industrial hall in dark red brick with tall arched steel-framed windows, several panes
missing, heavy riveted steel lintels, a square brick chimney to one side and the flared concrete lip of a
cooling tower behind it. The sky is a deep even blue, cloudless, the last of the light behind the roofline.
Sodium-orange light leaks out through the window openings from inside the hall, the only warm source in
the frame; cool blue fills every shadow. Wet concrete in the foreground holding a dim reflection of the
windows. Straight-on architectural framing, 35mm equivalent, verticals corrected, the building occupying
the middle band of the frame with sky above and yard below. No vehicles, no people, no street furniture,
no banners, no signage of any kind, no visible modern additions.
```

**Alt text:** `A long brick power station with tall arched windows at blue hour, orange light leaking from inside, a chimney and cooling tower behind it.`

<!-- gen:end -->

<!-- gen:begin id="venue-detail" file="venue-detail.jpg" width="1600" height="1200" aspect="4:3" tier="2K" crop="none" format="jpg" quality="82" -->

### `venue-detail.jpg`

| | |
|---|---|
| Output | 1600 × 1200 px |
| Aspect ratio | 4:3 |
| Generated at | 4:3, 2K tier (2048 × 1536), downscaled |
| Used in | Nowhere on the page. `docs/CANON.md` §7 gives the Venue section one image slot and `venue-exterior.jpg` holds it; this is the alternate, kept so the slot can be re-cast without another API call |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Extreme close detail of old industrial fabric inside a power station. A riveted steel plate girder fills
the left of the frame, each dome-headed rivet catching a hard sodium highlight along its upper edge, the
paint chalked and flaking to bare metal and light surface rust. Bolted to it, a run of galvanised cable
tray carrying a thick bundle of armoured cables, the tray's perforations going soft as they recede. A
single work lamp out of frame to the left provides all the light; the right of the frame falls away into
charcoal and black with a faint cyan cast. Shallow depth of field, 85mm equivalent at f/1.8, the plane of
focus on the nearest three rivets and the front edge of the cable tray, everything behind them dissolving
into smooth bokeh. Dust visible on the horizontal surfaces. No tools, no people, no hands, no labels, no
warning stickers, no painted markings, no numbers stencilled on the metal.
```

**Alt text:** `Close view of a riveted steel girder and a run of cable tray, lit from one side, the background falling out of focus.`

<!-- gen:end -->

---

## 4. Artist portraits

Twelve images, one per artist in the canonical order of `docs/CANON.md` §2. All are 800 × 800, generated
at the 1:1 1K tier and downscaled. They share one treatment so the lineup grid reads as a set: square
crop, a single hard light source, a near-black ground, the same film grain, no text, no identifiable face.

Square is a decision, not a default, and it has to be the same decision on both sides of the handover.
`design/FIGMA-SPEC.md` §5.4 sets `artist/portrait` to an aspect ratio of 1:1 "matching the supplied
800 × 800 files", so the card shows the whole master and crops nothing. Keep the two in step: a slot at
any other ratio silently throws away part of every composition below, and the compositions here spend
their negative space deliberately — a subject held low, a subject at the edge, a lattice floating in the
middle sixty percent. If the card ratio ever changes, these twelve prompts change with it in the same
commit, or the lineup grid becomes the staircase `design/FIGMA-SPEC.md` §10 warns about.

Within that treatment, framing and colour emphasis are deliberately varied so twelve cards in a row do not
look like twelve versions of one card. The plan is fixed in advance rather than left to chance:

| # | File | Genre tag | Subject approach | Framing | Colour emphasis |
|---|---|---|---|---|---|
| 01 | `artist-01-kasimir-volt.jpg` | Industrial techno | Figure, silhouette | Chest-up, centred | Sodium |
| 02 | `artist-02-lena-orbis.jpg` | Deep ambient | Figure, dissolved in fog | Small, low in frame | Coolant |
| 03 | `artist-03-nullset.jpg` | Generative | Abstract, light lattice | Centred, geometric | Violet and coolant |
| 04 | `artist-04-auric-drift.jpg` | Drone | Figure at frame edge | Off-centre, tall negative space | Sodium |
| 05 | `artist-05-mara-teschke.jpg` | Modular live | Hands only | Tight, close | Sodium key, cyan fill |
| 06 | `artist-06-substation-9.jpg` | Hardware techno | Figure from behind | Wide, full back | Near-monochrome, sodium rim |
| 07 | `artist-07-hiroko-vane.jpg` | Field recording | Figure against pale panel | Small, high negative space | Coolant |
| 08 | `artist-08-cold-cathode.jpg` | Dub techno | Figure behind glass | Tight, smeared | Coolant and violet |
| 09 | `artist-09-ilse-rum.jpg` | Neoclassical electronic | One hand at rest | Tight, shallow focus | Sodium, very low key |
| 10 | `artist-10-tape-decay.jpg` | Tape loops | Abstract, moving tape | Macro, diagonal | Sodium, warm dust |
| 11 | `artist-11-odalys-ferrer.jpg` | Percussive ambient | Figure in motion | Mid-frame, long exposure | Sodium and violet |
| 12 | `artist-12-vitrine.jpg` | Glassy IDM | Abstract, stacked glass | Centred, architectural | Coolant |

Six are sodium-led, four coolant-led, one near-monochrome, one violet-led. Seven carry a figure, two carry
only hands, three are abstract. Filename slugs are ASCII-folded: `Ilse Rüm` becomes `ilse-rum`, and
`SUBSTATION 9` becomes `substation-9`.

<!-- gen:begin id="artist-01-kasimir-volt" file="artist-01-kasimir-volt.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-01-kasimir-volt.jpg` — KASIMIR VOLT, industrial techno

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Headliner, Friday, Turbine Hall |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for an industrial techno artist. A single human figure seen chest-up and dead centre,
rendered as a hard black silhouette against a wall of thick smoke. One sodium-orange work lamp sits
directly behind the head, blowing out to a small hot core and burning an orange rim along the shoulders
and the top of the skull. The face is turned into full shadow and carries no features at all, no eyes, no
mouth, no skin tone, no hair detail. Smoke is dense and slow-moving, orange where the lamp reaches it,
falling to near-black at the corners of the frame. Heavy, static, frontal composition, 50mm equivalent,
the subject filling the middle third. No microphone, no headphones, no equipment, no clothing detail, no
jewellery, no tattoos, no text, no watermark, no likeness of any real person.
```

**Alt text:** `A figure in hard silhouette against dense smoke, rimmed by a single orange lamp directly behind the head.`

<!-- gen:end -->

<!-- gen:begin id="artist-02-lena-orbis" file="artist-02-lena-orbis.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-02-lena-orbis.jpg` — Lena Orbis, deep ambient

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Headliner, Saturday, Turbine Hall |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a deep ambient artist. A single standing figure, small in the frame and placed low
and slightly left, almost entirely dissolved into a volume of cold cyan fog that fills the whole square.
Only the crown of the head and one shoulder resolve as marginally darker shapes; the outline is soft and
uncertain everywhere, with no face, no features and no skin visible. The contrast range is deliberately
narrow, mid-dark throughout, no true black and no highlight, the image sitting in a quiet grey-cyan band.
Empty fog occupies the upper two thirds of the frame. A single faint sodium point far behind the figure,
small and unfocused, the only warm element. 85mm equivalent, very shallow apparent depth, heavy
atmospheric diffusion. No equipment, no furniture, no horizon, no architecture, no text, no watermark,
no likeness of any real person.
```

**Alt text:** `A standing figure almost entirely dissolved into cold cyan fog, low and small in an otherwise empty frame.`

<!-- gen:end -->

<!-- gen:begin id="artist-03-nullset" file="artist-03-nullset.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-03-nullset.jpg` — NULLSET, generative

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Headliner, Sunday, Turbine Hall |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square abstract image standing in for a generative music artist, no human figure of any kind. A long-
exposure photograph of a fine lattice of light drawn in dark empty space: hundreds of hairline strokes in
coolant cyan and violet, arranged as a dense, slightly irregular grid that thins and frays toward the
edges of the frame, as though a rule were running out of instructions. The lattice is centred and roughly
fills the middle sixty percent of the square, floating in true black with nothing behind it. Lines vary in
brightness; a few are brighter and appear to hover in front of the rest. One weak sodium-orange stroke
crosses the lattice off-axis. Photographic, not a rendered illustration: visible grain, slight bloom on
the brightest strokes only, the softness of real light on film. No object, no surface, no reflection, no
device, no screen, no text, no numbers, no glyphs, no watermark.
```

**Alt text:** `A fine lattice of cyan and violet light lines drawn in empty black space, fraying toward the edges.`

<!-- gen:end -->

<!-- gen:begin id="artist-04-auric-drift" file="artist-04-auric-drift.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-04-auric-drift.jpg` — Auric Drift, drone

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Main, Friday, Boiler Room |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a drone artist. A tall, narrow column of sodium-orange light falls the full height of
the frame slightly right of centre, a shaft from a high opening striking a concrete wall inside a dark
shaft-like industrial space. Dust drifts through it. At the extreme left edge of the frame, one human
shoulder and the back of a head enter the picture in near-total shadow, cropped hard by the frame, turned
fully away from the camera, no face, no jaw, no profile, no eye and no feature of any kind visible at any
point, no more than a dark interruption of the background. The rest of the square is unbroken black and
deep charcoal, weighted heavily to the top: more than half the image is empty. Static, vertical, patient
composition, 35mm equivalent, no movement. No equipment, no ground
plane, no ceiling, no architecture beyond the one lit wall, no text, no watermark, no likeness of any real
person.
```

**Alt text:** `A tall shaft of orange light falling down a dark concrete wall, with a shoulder in shadow entering from the left.`

<!-- gen:end -->

<!-- gen:begin id="artist-05-mara-teschke" file="artist-05-mara-teschke.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-05-mara-teschke.jpg` — Mara Teschke, modular live

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Main, Saturday, Boiler Room |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a modular synthesis artist. Two hands, and nothing else of the body, working across a
dense bank of patch sockets: fingers holding one cable, another cable mid-plug, a tangle of thin patch
leads crossing the frame in shallow arcs. The panel is brushed dark metal, its knobs and jacks catching
hard specular edges. Everything above the wrists is cut off by the top of the frame and lost in black, so
no arm, torso, face or clothing is visible. A single sodium-orange work lamp from the upper left is the
key light, raking across the knuckles and the top of the panel; a weak coolant-cyan fill from the lower
right separates the cables from the background. Skin is in deep shadow and carries no identifying detail.
Tight framing, 50mm equivalent at close focus, plane of focus on the near hand, the far end of the panel
soft. No labels, no scale markings, no printed legends on the panel, no numbers, no text, no watermark, no
likeness of any real person.
```

**Alt text:** `Two hands patching cables into a dark modular synthesiser panel under a single orange lamp.`

<!-- gen:end -->

<!-- gen:begin id="artist-06-substation-9" file="artist-06-substation-9.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-06-substation-9.jpg` — SUBSTATION 9, hardware techno

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Main, Sunday, Boiler Room |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a hardware techno artist. A single figure photographed from directly behind, standing
square to a floor-to-ceiling wall of old electrical switchgear: rows of porcelain insulators, bakelite
handles, bus bars and relay cabinets receding into darkness. The figure occupies the lower centre of the
frame from the waist up, seen entirely as a dark mass, the back of the head and both shoulders read as
shape only, no face possible, no hair detail, no clothing texture. The image is almost monochrome, a
charcoal and black study with almost no colour at all, except for one hard sodium-orange rim running down
the left edge of the figure and along the top of the nearest cabinet, where a work lamp out of frame
catches them. Wide, symmetrical, frontal composition, 35mm equivalent, deep focus so the switchgear stays
legible all the way back. No dials with visible numbers, no nameplates, no warning labels, no stencilled
markings, no text, no watermark, no likeness of any real person.
```

**Alt text:** `A figure seen from behind facing a wall of old electrical switchgear, edged by a single orange rim light.`

<!-- gen:end -->

<!-- gen:begin id="artist-07-hiroko-vane" file="artist-07-hiroko-vane.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-07-hiroko-vane.jpg` — Hiroko Vane, field recording

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Friday, Cooling Tower |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a field recording artist. A single large frosted industrial window panel fills most of
the frame, glowing an even, pale coolant cyan, the brightest image in this set but still well short of
white. Against it, a small figure stands in the lower right, seen in flat silhouette from the side, one
arm raised holding a slender pole upward and out of frame, the outline unmistakable as a person reaching
up but carrying no face, no features and no detail of any kind. The upper left two thirds of the square is
empty glowing panel with faint mullion shadows and dust on the glass. Cold, quiet, high negative space,
50mm equivalent, straight-on. A single dull sodium reflection low in the frame anchors the palette. No
equipment detail, no cables, no floor, no furniture, no text, no watermark, no likeness of any real
person.
```

**Alt text:** `A small silhouetted figure holding a pole aloft against a large, evenly glowing pale cyan window panel.`

<!-- gen:end -->

<!-- gen:begin id="artist-08-cold-cathode" file="artist-08-cold-cathode.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-08-cold-cathode.jpg` — Cold Cathode, dub techno

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Saturday, Cooling Tower |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a dub techno artist. A figure standing close behind a sheet of heavily fogged, wired
safety glass, photographed through it, so the whole body is smeared and abstracted: the head resolves as a
soft dark oval with no face, no eyes and no features, the shoulders as two vanishing slopes, the rest
lost. A single cold cathode tube fitting behind the figure throws coolant cyan through the glass and
blooms wide in the condensation; a violet reflection sits in the upper right corner of the pane. Beads of
water on the near surface catch tiny points of light and are the only sharp elements in the image. The
frame is tight, head-and-shoulders, the figure filling the centre, everything past the glass falling to
black. 85mm equivalent, focus held on the glass surface rather than on the figure. No door frame, no
handle, no fittings, no room detail, no text, no watermark, no likeness of any real person.
```

**Alt text:** `A figure smeared and abstracted behind fogged wired safety glass, backlit by a cyan tube light.`

<!-- gen:end -->

<!-- gen:begin id="artist-09-ilse-rum" file="artist-09-ilse-rum.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-09-ilse-rum.jpg` — Ilse Rüm, neoclassical electronic

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Sunday, Cooling Tower |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a neoclassical electronic artist. One hand at rest, palm down and fingers slightly
curled, lying still across the black keys of an upright piano-style keyboard whose white keys have yellowed
to bone. Nothing else of the body appears; the wrist leaves the frame at the right edge into complete
darkness, so there is no arm, no clothing, no face. A single low sodium-orange source from the left grazes
the knuckles and the front edge of the keys, leaving the far end of the keyboard unlit. The image is very
low key overall, more than two thirds of it in shadow, and almost entirely warm: no cyan anywhere except a
barely perceptible cool cast in the deepest shadow. Very shallow depth of field, 85mm equivalent at f/1.4,
focus on the second and third knuckles only, the keys receding immediately out of focus. Stillness is the
subject. No sheet music, no maker's name on the fallboard, no brand mark, no lettering, no numbers, no
text, no watermark, no likeness of any real person.
```

**Alt text:** `A single hand resting still on the keys of an old piano keyboard, lit warmly from one side, the rest in darkness.`

<!-- gen:end -->

<!-- gen:begin id="artist-10-tape-decay" file="artist-10-tape-decay.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-10-tape-decay.jpg` — TAPE DECAY, tape loops

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Friday, Boiler Room |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square abstract image standing in for a tape loop artist, no human figure and no hands. Macro view of a
long loop of quarter-inch magnetic tape strung between two spools and a tension arm, running diagonally
across the frame from lower left to upper right. The tape's backing is matte brown-black; its edge catches
a continuous thin sodium-orange highlight along its whole length. One spool is spinning and reads as
motion blur; the tape itself is sharp where it passes the head. Creases and a splice are visible, and the
oxide is visibly worn in patches. Dust hangs in the light. Background is undifferentiated black with a
single soft cyan reflection far behind. Extreme close focus, 100mm macro equivalent at f/2.8, plane of
focus on the near run of tape only. Warm, dusty, mechanical. No machine housing, no controls, no labels on
the spools, no handwriting on the splice, no text, no numbers, no watermark.
```

**Alt text:** `A loop of magnetic tape running diagonally between spools, its edge catching an orange highlight, one spool blurred by motion.`

<!-- gen:end -->

<!-- gen:begin id="artist-11-odalys-ferrer" file="artist-11-odalys-ferrer.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-11-odalys-ferrer.jpg` — Odalys Ferrer, percussive ambient

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Saturday, Cooling Tower |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square portrait for a percussive ambient artist. A half-second exposure of a figure mid-strike: the torso
is a dark, roughly stable mass in the centre of the frame, while one arm sweeps through the picture as a
continuous smear of motion, the hand unresolvable. Where the arm crosses the light it drags a ribbon of
sodium orange behind it; a fainter violet trail sits under it from a second, weaker source. The head is
tilted down and away, entirely in shadow, no face and no features. In front of the figure, the dull metal
rims of two large found-object percussion surfaces catch hard orange ellipses of light. The background is
pure black. Mid-frame composition, 50mm equivalent, tripod steady so only the subject smears, the
stationary metal sharp. Physical, kinetic, unposed. No drum hardware branding, no stands with visible
fittings, no text, no watermark, no likeness of any real person.
```

**Alt text:** `A long-exposure frame of a figure mid-strike, one arm smeared into an orange trail above the lit rims of metal percussion.`

<!-- gen:end -->

<!-- gen:begin id="artist-12-vitrine" file="artist-12-vitrine.jpg" width="800" height="800" aspect="1:1" tier="1K" crop="none" format="jpg" quality="80" -->

### `artist-12-vitrine.jpg` — VITRINE, glassy IDM

| | |
|---|---|
| Output | 800 × 800 px · 1:1 · generated at 1K |
| Billing | Support, Sunday, Boiler Room |

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

Square abstract image standing in for a glassy IDM artist, no human figure. Eight or nine sheets of thick
plate glass stacked upright and slightly fanned, photographed end-on so the viewer looks straight into
their exposed edges. Each edge glows coolant cyan where a single light source strikes it from the left,
the green-blue of real glass in section, brightest at the front sheet and stepping darker into the stack.
Fine chips, scratches and internal bubbles are visible in the front edge. Thin violet refraction fringes
appear where the light bends. The stack is centred and architectural, filling the middle of the square,
sitting on a dark concrete surface in a black room. Cold, precise, mineral. 85mm equivalent, focus on the
front two edges, the rear of the stack falling soft. No frame, no rack, no hardware, no reflection of a
room, no text, no watermark, no likeness of any real person.
```

**Alt text:** `The exposed edges of stacked plate glass sheets glowing cyan under a single side light, with faint violet refraction.`

<!-- gen:end -->

---

## 5. Textures

**These two are not generated by the model. They are produced procedurally by
`scripts/generate-textures.mjs`, and this section records why.**

Both were originally specified here as prompts, alongside the photographic assets. The model refused both,
returning `Image generation blocked due to copyright/recitation` — a filter being cautious about regular
patterns rather than a real rights question. The refusal was worth acting on anyway, because asking a large
image model for procedural noise was the wrong tool from the start:

| | Model | Procedural |
|---|---|---|
| Seamless tiling | must be checked, and often fails | true by construction |
| Determinism | two runs give two different files | byte-identical from a seed |
| Size | ~900 KB of incompressible noise at 1024 | 57 KB grain, 35 KB scanline at 256 |
| Provenance | SynthID watermark, needs a credit line | sixty lines of arithmetic |

The targets changed with the method:

| File | Output | Method |
|---|---|---|
| `texture-grain.png` | 256 × 256, tiles | four averaged samples of a seeded mulberry32 PRNG, giving a roughly normal distribution rather than television static; pattern carried entirely in alpha |
| `texture-scanline.png` | 256 × 256, tiles | 4 px period with raised-cosine soft edges so it does not alias when scaled, plus faint per-pixel jitter so it does not read as a CSS repeating gradient |

Both are white with the pattern in the alpha channel, so they multiply over any surface without
contributing a colour of their own. Both are decorative and carry no alt text in markup.
`texture-grain.png` is applied as a CSS background over `color.bg.base` at low opacity;
`texture-scanline.png` is a companion the current design does not place, which `brief/CONTENT.md` §13
says plainly rather than inviting the implementing agent to find it a home.

```bash
node scripts/generate-textures.mjs
```

The wider point is worth keeping: **not every asset in a generative pipeline should be generated.** The two
files here that a model could not make are the two that a hundred lines of code makes better.

---

## 6. Social card

<!-- gen:begin id="og-card" file="og-card.jpg" width="1200" height="630" aspect="16:9" tier="2K" crop="centre:2048x1075" format="jpg" quality="85" -->

### `og-card.jpg`

| | |
|---|---|
| Output | 1200 × 630 px |
| Aspect ratio | 1.905:1 (the Open Graph standard) |
| Generated at | 16:9, 2K tier (2048 × 1152), centre-cropped to 2048 × 1075, downscaled |
| Used in | `og:image` and `twitter:image`, served from `/images/og-card.jpg` |

This card carries no words, and nothing is drawn over it. A share preview is not a page: Slack, LinkedIn,
X and iMessage fetch the file and paint it as a flat bitmap, with no DOM to put an element in and no CSS
to scrim it. The festival name, the dates and the venue travel alongside it in `og:title` and
`og:description`, which every one of those platforms renders as real text next to the picture —
selectable, translatable, resizable, and read aloud correctly. That is the §1.2 rule applied rather than
suspended, and it is worth saying out loud to a room that expects a share card to be a poster.

So the composition is a composition. The left side is empty and near-black because the picture wants its
weight on one side, not because a wordmark is going there, and there is no safe-area gate on this file —
§1.7 covers the hero alone. The prompt keeps everything of interest clear of the top and bottom edges so
the 16:9 to 1.905:1 crop is harmless.

```text
TURBINE house style. Photographic, low-key, documentary rather than advertising. The palette is
restricted to near-black #0A0B0D, deep charcoal #131519, sodium-lamp orange #FF6A1A and a cold coolant
cyan #2FE6D6, with violet #7C5CFF used only as a trace; no other saturated colour anywhere in the frame.
Light is practical and single-source: a work lamp, a sodium flood, a cold window, a tube fitting. Deep
protected shadows, highlights that hold detail, fine 35mm film grain, slight sensor noise in the blacks.
No HDR, no bloom, no lens flare, no colour grading toward teal-and-orange cliché, no glossy advertising
finish. Absolutely no text, letters, numbers, signage, logos, watermarks, captions or subtitles anywhere
in the image. No recognisable individual, no identifiable face, no likeness of any real person.

A wide, strongly asymmetric composition inside a decommissioned coal power station at night, weighted
entirely to the right. The left sixty percent of the frame is near-black and almost empty: haze,
a faint suggestion of a concrete floor, no object, no edge, no highlight, no detail that draws the eye,
holding a flat very dark tone throughout. The right forty percent carries the whole subject: the flank of
a single enormous turbine casing, riveted and paint-worn, lit hard from the right by one sodium-orange
flood so that its curve turns from bright orange through deep amber into black exactly where it meets the
empty left side. A cyan haze drifts across the upper right. The transition from lit metal to darkness is
gradual and smooth, with no hard vertical line down the middle of the picture. Keep the top and bottom
five percent of the frame free of anything important, because the image will be cropped there. 35mm
equivalent, camera level. No people, no crowd, no stage, no lighting rig, no text, no watermark.
```

**Alt text (`og:image:alt`):** `The curved flank of a huge riveted turbine casing lit orange from one side, the rest of the frame falling away into darkness.`

<!-- gen:end -->

---

## 7. Acceptance checks

Run before the pack is considered done:

```bash
npm run check:assets        # node scripts/check-assets.mjs
```

The first five are automated by that script, which prints every number it measured, pass or fail. The
last two need a person. It is an author-time gate and is deliberately not wired into `checks/run.mjs`:
nothing it measures can be fixed by editing the site, only by editing a prompt here and regenerating.

1. **Dimensions.** Every file matches the exact pixel size declared above. No exceptions, because the
   Playwright screenshot diff will otherwise drift for reasons that have nothing to do with the code.
2. **Weight.** `hero-hall.jpg` under 400 KB, each venue image under 200 KB, `og-card.jpg` under 200 KB,
   each portrait under 120 KB, `texture-grain.png` under 64 KB and `texture-scanline.png` under 40 KB.
   Every one of those numbers was measured from the encode the pipeline actually produces and then given
   headroom — the current maxima are 246 KB, 181 KB, 57 KB, 89 KB, 57 KB and 35 KB. A budget the pipeline
   cannot meet is not a gate, it is a regeneration loop that never terminates, which is worth saying in a
   workshop about loops. Lighthouse performance is a gate in `checks/`, and an unoptimised hero is the
   usual reason it fails.
3. **Safe area.** `hero-hall.jpg` passes `scripts/check-image-safe-areas.mjs` under the tile rule in §1.7.
4. **Tiling.** Both textures are seamless in both axes: the wrap-around edge pair differs no more than
   three times as much as a typical interior neighbour pair. Comparing the two edges to each other alone
   proves nothing — in fine grain every adjacent column pair is different.
5. **No matte.** The model occasionally returns a photograph mounted on a white card instead of a
   photograph. It survives a thumbnail and ruins a full-bleed hero or a card that crops. The check fails
   any image whose 4 px border is flat (standard deviation under 4) and more than 40 levels lighter than
   the picture inside it. Only a light border counts: this pack is low-key, and a flat near-black edge is
   the house style.
6. **No text, no faces.** Open all sixteen at full size and look. Image models produce plausible-looking
   lettering on signage and equipment even when told not to, and it is usually small, usually in the
   background, and usually gibberish. They also resolve a silhouette into a readable face given half a
   chance, which the preamble forbids and no gate here can measure. Any image with a glyph or a face in it
   is regenerated, not retouched.
7. **The grid.** Put the twelve portraits side by side at 800 px, which is the whole frame the 1:1 card
   shows, and check two things at once: that they read as one set, and that no two are interchangeable.
   If three of them are the same silhouette against the same smoke, go back to the variation matrix in §4
   and push the framing further apart.

### 7.1 What the gate says today

Honest state of the committed pack, as `npm run check:assets` reports it. Five of fifty-six checks fail,
and all five need an API key and a regeneration rather than an edit:

| Failing | Why | Fix |
|---|---|---|
| `artist-04`, `artist-06`, `artist-07`, `artist-12` | returned as a photograph on a white mount: a flat 255 border, standard deviation under 0.5 | regenerate, about USD 0.54 |
| `hero-hall.jpg` safe area | 4.47% of lower-half tiles below 4.5:1 against a 2% allowance, darkest-case tile 1.09:1 | the prompt asked for sodium pools across the floor and then demanded the floor be near-black. Fixed above: the lamps are now rigged high on the piers and every pool stays in the upper half. Regenerate, about USD 0.24 |

`artist-04`'s prompt also changed, for a defect no gate here can measure: the returned image resolved its
shadowed shoulder into a readable face, which the preamble forbids and check 6 catches only by eye. The
prompt now refuses the profile explicitly. It is in the same regeneration.

Three of those prompts changed in this pass, so the script already queues them — `--dry-run` reports
three to generate at about USD 0.51. The other three failures are a bad roll of the dice against an
unchanged prompt, so they need `--force`. Note that `--only` takes one id or one glob and `*` is its only
wildcard: every other regular-expression character is escaped, so a character class does not work here.

```bash
node scripts/generate-images.mjs --all                                 # hero, artist-04, og-card
node scripts/generate-images.mjs --only artist-06-substation-9 --force
node scripts/generate-images.mjs --only artist-07-hiroko-vane  --force
node scripts/generate-images.mjs --only artist-12-vitrine      --force
npm run check:assets
```

About USD 0.91 in total, and the last line is how you know it worked.

This section exists rather than being tidied away because the alternative is thirty people finding it in
the room. A gate whose failures are written down is doing its job; a pack that claims to be done because
nobody ran the gate is the failure this workshop is about.

---

## 8. Regenerating

The generation script reads this file, so edit the prompt here and run the script; there is no second copy
to keep in sync.

From the repository root:

```bash
export GEMINI_API_KEY="…"          # never commit this. `.env.example` shows where it goes,
                                   # and `.gitignore` already excludes `.env`
node scripts/generate-images.mjs --all
```

Useful variants:

```bash
# See what would be generated, and the cost, without calling the API. Free.
node scripts/generate-images.mjs --all --dry-run

# Regenerate one image after editing its prompt above. One API call, about USD 0.13.
node scripts/generate-images.mjs --only artist-07-hiroko-vane

# Regenerate a group.
node scripts/generate-images.mjs --only "artist-*"

# Force a rebuild even though the prompt hash has not changed, for example after
# changing a post-processing step rather than a prompt.
node scripts/generate-images.mjs --only hero-hall --force

# Rewrite design/assets/manifest.json from the files on disk without generating anything.
node scripts/generate-images.mjs --manifest
```

There is an npm alias for the common case:

```bash
npm run gen:images        # equivalent to: node scripts/generate-images.mjs --all
```

Behaviour worth knowing before you run it:

- By default the script **skips** any image whose file already exists and whose prompt hash matches
  `design/assets/manifest.json`. Running `--all` on a clean checkout therefore costs nothing, except for
  entries whose prompt has been edited since the last run — right now that is the three in §7.1, about
  USD 0.51. `--dry-run` always tells you the number before you spend it.
- Generated files are committed to the repository. Workshop participants must not need an API key, a
  billing account or a network round trip to build the site.
- Every successful generation appends one tab-separated line to `evidence/asset-generation.log`:
  timestamp, model id, image id, prompt hash, tier, output dimensions, output size in bytes, elapsed
  seconds, and the list price of that tier from the table in §1.4. The API does not report a cost, so that
  last field is arithmetic, not a receipt. A `--dry-run`, a `--manifest` run and a failed call write
  nothing. The log is committed — `.gitignore` excludes `*.log` and then re-admits `evidence/*.log` — and
  it is what makes the pack reproducible rather than merely repeatable.
- The API is not deterministic. Two runs of the same prompt return different images. If a portrait is
  replaced, the Playwright baseline screenshots for the lineup section have to be re-approved, so
  regenerate deliberately and not as a reflex.

---

## 9. Provenance

Every image in `design/assets/` is synthetic. Sixteen of the eighteen were generated by
`gemini-3-pro-image` from the prompts in this file and carry a SynthID watermark; the two textures were
written by `scripts/generate-textures.mjs`, with no model involved and so no watermark to carry (§5).
The building, the crowd, the equipment and the twelve artists do not exist. As required by `docs/CANON.md` §1, `CREDITS.md` and the site footer both carry the line:

> TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names,
> imagery and copy are invented. Any resemblance to a real event or performer is coincidental.
