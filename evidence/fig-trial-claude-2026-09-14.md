# Prompt 02 on a .fig — Claude Code, 2026-09-14

One run of the Route B prompt from `prompts/02-design.md`, pasted whole, with nothing else.

| | |
|---|---|
| Agent | Claude Code 2.1.270, `claude -p`, default model |
| Folder | `../.turbine-fig-trial/claude/turbine`, empty, beside the repository; `../design/turbine.fig` next to it |
| The file | `guideline/turbine.fig` — fig-kiwi version 106, schema raw deflate, document zstd, 2,512 nodes, 137 soft-deleted |
| Permissions | `--permission-mode bypassPermissions`. **A participant in the default mode is asked before each command; this run does not measure that.** |
| Network | allowed |
| Wall time | 974 s (16 min 14 s) |
| Turns | 61, of which 60 shell commands |
| Cost | $8.99 API-equivalent |
| Installed | `kiwi-schema`, `fzstd`, `pako` |
| Wrote | `design-data/`: decoder, decoded document, one resolved tree per page, copy by width, tokens, a README |

Scored by a program against the file, not by reading the answer:

| Check | Result |
|---|---|
| All twelve artist names in the answer | 12 / 12 |
| Exact colour values (`#FF6A1A`, `#0A0B0D`, `#2FE6D6`, `#7C5CFF`, `#6B7280`) | all present |
| Widths 1440, 768, 390 | all present |
| Worked from `thumbnail.png` | no — listed while unzipping, never read |
| Paths outside the trial folder | none |

It fell into the component-text trap on its first pass — nine cards at 390 read "KASIMIR VOLT" — noticed,
and fixed it by resolving component properties and overrides, then checked every resolved text layer
against the character counts Figma stores (1,425 match, 0 disagree). It also found a trap the prompt did
not name: variables inside deleted collections are not themselves marked deleted. The prompt now names it.

Codex was not run: the account had reached its usage limit.

---

## The agent's answer, verbatim

I decoded the file into `design-data/`, and every piece of copy below is checked against what Figma itself rendered. I resolved each instance's properties and overrides and compared the result to the character counts Figma stored for each text layer: 1,425 match and 0 disagree. On my first pass nine cards at 390 all read "KASIMIR VOLT"; that was my reading being wrong, not the file, and it's fixed. Nothing I report comes from deleted layers or `thumbnail.png`.

**What's in `design-data/`:** the unzipped file (`raw/`), the full decoded document (`document.json`), one clean tree per page (`resolved/`), all copy by width (`copy-by-width.json`), the design tokens (`tokens.json`), readable outlines (`outlines/`), and a `README.md` with the command to rebuild it all. No page code yet.

**Decoding details.** The file is fig-kiwi version 106. The schema chunk is raw deflate and the document is zstd. There are 2,512 nodes, 137 of them soft-deleted. There is also a trap: 277 variables sit in 18 deleted variable sets but are not marked deleted themselves. Only four sets are live: Color, Type, Scale and Responsive.

---

## 1. Sections, top to bottom
There are three page frames: Desktop 1440, Tablet 768 and Mobile 390. All three have the same order:

0. Skip link: "Skip to main content", invisible (opacity 0) until focused.
1. `section-nav`
2. `section-hero`
3. `section-ticker`: a genre marquee, edge to edge.
4. `section-lineup`
5. `section-programme`
6. `section-venue`
7. `section-tickets`
8. `section-faq`
9. `section-newsletter`
10. `section-footer`

The other pages are Cover, Design system (tokens, contrast, type specimen, 11 components) and Exports (an export list, images with alt text, and "content the frames do not show").

## 2. Colours (one mode, "Dark")
| Name | Value | Used for |
|---|---|---|
| color/bg/base | #0A0B0D | Page background and five section backgrounds. Also the text on every accent fill: button labels, active tab, badges, skip link. |
| color/bg/surface | #131519 | Nav bar, newsletter and footer backgrounds, artist cards, standard ticket cards, tab track, input field, access box, tier cards at 390 |
| color/bg/raised | #1C1F25 | Hero background under the photo, ticker strip, table header, zebra rows, Full Pass card, map placeholder, comparison header, disabled buttons |
| color/border/subtle | #2A2E36 | All hairlines: nav, ticker, cards, table rows, FAQ rows, comparison table, input, footer divider, map |
| color/border/strong | #3D434E | Secondary button border, checkbox border, ticker dots |
| color/text/primary | #F2F4F7 | Headings, hero text, artist names, FAQ questions, travel copy, access note, footer links, input label |
| color/text/secondary | #A7AEBB | Intros, paragraphs, card meta, nav links, captions, table header, empty table cells, placeholder and helper text, social icon placeholders |
| color/text/muted | #6B7280 | Footer legal lines and disclaimer only |
| color/accent/sodium | #FF6A1A | Primary buttons, all eyebrows, prices, Full Pass 2px border and "Most popular" badge, tier eyebrows at 390 |
| color/accent/coolant | #2FE6D6 | Set times, workshop line, venue address, genre text on headliner and main cards, active tab, active nav link and its 2px rule, focus rings, FAQ chevrons, ticks, access box border, skip link, "Menu" label, checked checkbox |
| color/accent/arc | #7C5CFF | Ticker tags, "Headliner" badge |
| color/state/danger | #FF4D4D | Input error border, message and icon; sold-out badge (component only) |
| color/state/success | #3DDC84 | "Pass" labels on the contrast sheet only; never on the page |
| color/text/on-accent | alias of bg/base | Never applied anywhere |

Two colours are not tokens:
- **#FFFFFF:** only in the contrast demo.
- **Hero scrim:** a gradient of #0A0B0D, from 20% at the top to 90% at the bottom, typed in rather than taken from a token.

## 3. Text sizes
Fonts are Space Grotesk (Medium, Bold), Inter (Regular, Medium, Semi Bold) and JetBrains Mono (Regular, Bold). Line heights are shown as multiples of the size.

- **96 / 72 / 40** (at 1440 / 768 / 390): hero "TURBINE". Bold, 1.0, +18% letter spacing, uppercase.
- **56 / 40 / 32:** every section h2 and the newsletter h2. Bold, −2%. Line height 1.0 / 1.111 / 1.2.
- **40:** ticket prices (Display/Price, 1.08), at all widths.
- **32:** at 1440, day headings and "Getting here" (1.2) and ticket tiers (1.25).
- **24:** at 768 and 390, day headings and "Getting here" (1.333) and ticket tiers (1.25). At 1440 and 768, headliner artist names (1.3).
- **20:**
  - At 1440: intros, hero tagline and second line, newsletter pitch (1.62).
  - At 1440 and 768: main and support artist names (1.3).
  - At all widths: FAQ questions (1.3), and the nav and footer wordmark (1.25, +18%).
- **18:** at 768 and 390, intros, hero tagline and second line, pitch (1.62).
- **16:**
  - Regular: paragraphs, travel, parking, FAQ answers, ticket includes, access note, input value, hero venue.
  - Medium: hero dates, nav links at 1440, table cells, comparison labels, artist in the 390 programme.
  - Semi Bold: medium button labels.
  - All artist names at 390.
- **14:**
  - Inter: blurbs, day/stage, captions, notes, status line, footer links, helper text, input label, comparison lines at 390; nav links at 768 and 390; small button and tab labels (1.43).
  - Mono: doors, set times, address (1.43).
- **12:** eyebrows (Semi Bold, uppercase, +6%), mono tags (ticker, badges, genres, map label; Bold, uppercase, +6%), legal text (1.5).

## 4. Widths
**Frames are 1440, 768 and 390**, matching the three breakpoint tokens. Nothing is designed in between or above 1440. The cover is 1600.

| | 1440 | 768 | 390 |
|---|---|---|---|
| Gutter / content width | 48 / 1104 | 48 / 672 | 24 / 342 |
| Section padding (top and bottom) | 128 | 96 | 64 |
| Nav height | 72 | 64 | 64 |
| Hero height | 780 | 700 | 600 |
| Ticker height | 56 | 48 | 44 |
| Lineup columns (gap) | 4 (24) | 3 (24) | 2 (16) |
| Programme | 4-column table | 4-column table | stacked rows |
| Ticket cards | 3 across | stacked, max 480 | stacked, full width |
| Comparison | table | table | one list per tier |
| FAQ list | 800, centred | 672 | 342 |
| Newsletter form | 560 | 480 | 342 |
| Nav | full | full | "Menu" button |
| Footer | wide | stacked | two columns |

## 5. Copy, section by section
**Nav.**
- Wordmark: TURBINE.
- Links: Lineup, Programme, Venue, Questions.
- Button: Tickets. At 390 the links are hidden and the button reads "Menu".

**Hero.**
- Eyebrow: Fourth edition
- h1: TURBINE
- Tagline: Three nights inside the machine
- Second line: Ambient, techno and modular sound in a hall built for power.
- Dates: Friday 12 – Sunday 14 June 2027
- Venue: The Powerhouse, Hall E · Kraków
- Buttons: Get tickets · See the lineup
- Scroll cue: Scroll

**Ticker.** INDUSTRIAL TECHNO · DEEP AMBIENT · DRONE · CONCRETE AND STEEL · MODULAR LIVE · HARDWARE TECHNO · FIELD RECORDING · TAPE LOOPS · DUB TECHNO · SODIUM LIGHT · NEOCLASSICAL ELECTRONIC · PERCUSSIVE AMBIENT · GENERATIVE · GLASSY IDM. The list repeats twice.

Screen-reader text: "Genres across the three nights: industrial techno, deep ambient, drone, modular live, hardware techno, field recording, tape loops, dub techno, neoclassical electronic, percussive ambient, generative and glassy IDM. Between them, two words for the room: concrete and steel, sodium light."

**Lineup.**
- Eyebrow: Twelve artists
- h2: Lineup
- Intro: "Twelve artists over three nights. Four a night, one stage at a time. Nothing you want to hear runs against anything else you want to hear."
- Tabs: All / Fri / Sat / Sun. Accessible names: "All twelve artists", "Friday 12 June", "Saturday 13 June", "Sunday 14 June".
- Status line: "Showing all twelve artists." Filtered versions read "Showing four artists playing Friday 12 June." (and the same for Saturday and Sunday).

Cards (name — day · stage — genre — blurb):
- *Headliner* **KASIMIR VOLT** — Friday · Turbine Hall — Industrial techno — "Kick drums built to move the air in a room this size, played loud enough that the roof trusses answer back."
- *Headliner* **Lena Orbis** — Saturday · Turbine Hall — Deep ambient — "Chords held until the hall's eight-second reverb becomes part of the chord."
- *Headliner* **NULLSET** — Sunday · Turbine Hall — Generative — "A patch that writes the set while it plays, so nobody in the hall has heard it before, including NULLSET."
- **Auric Drift** — Friday · Boiler Room — Drone — "Sustained low end that arrives through the floor and reaches your ears second."
- **Mara Teschke** — Saturday · Boiler Room — Modular live — "Everything patched on stage, with the cables, the mistakes and the recoveries all audible."
- **SUBSTATION 9** — Sunday · Boiler Room — Hardware techno — "Three drum machines, no laptop, and a hi-hat that cuts through brick like a spanner dropped on pipework."
- **Hiroko Vane** — Friday · Cooling Tower — Field recording — "Tape of harbours, lifts and transformer hum, mixed until the recordings and the tower sound like one place."
- **Cold Cathode** — Saturday · Cooling Tower — Dub techno — "One chord, a spring reverb and a long delay; the concrete does the rest of the work."
- **Ilse Rüm** — Sunday · Cooling Tower — Neoclassical electronic — "Piano and cello through tape delay, played at the volume of a conversation."
- **TAPE DECAY** — Friday · Boiler Room — Tape loops — "Four reel-to-reel machines running spliced loops that wear out audibly before the set ends."
- **Odalys Ferrer** — Saturday · Cooling Tower — Percussive ambient — "Drums and metal bowls recorded in the room, then played back into it until the two blur."
- **VITRINE** — Sunday · Boiler Room — Glassy IDM — "Brittle high-register rhythms that sound like something small breaking, slowed down."

**Programme.**
- Eyebrow: Three nights
- h2: Programme
- Intro: "One stage plays at a time. The night opens in the Cooling Tower, moves down to the Boiler Room and finishes on the main floor. Changeovers take fifteen minutes and the walk between stages takes about four."
- Table headers: Time · Turbine Hall · Boiler Room · Cooling Tower. Empty cells show "—", with a hidden "No set".
- Each day has a caption: "Friday 12 June, set times by stage" (same pattern for Saturday and Sunday).

| Day | Hours | Sets |
|---|---|---|
| Friday 12 June | Doors 19:00 · Last set ends 04:00 · Hall clears 04:30 | 19:30 – 21:00 Cooling Tower, Hiroko Vane · 21:15 – 22:45 Boiler Room, TAPE DECAY · 23:00 – 00:45 Boiler Room, Auric Drift · 01:00 – 04:00 Turbine Hall, KASIMIR VOLT |
| Saturday 13 June | Doors 19:00 · Last set ends 04:00 · Hall clears 04:30 | 19:30 – 21:00 Cooling Tower, Odalys Ferrer · 21:15 – 23:00 Cooling Tower, Cold Cathode · 23:15 – 01:00 Boiler Room, Mara Teschke · 01:15 – 04:00 Turbine Hall, Lena Orbis |
| Sunday 14 June | Doors 17:30 · Last set ends 02:00 · Hall clears 02:30 | 18:00 – 19:30 Cooling Tower, Ilse Rüm · 19:45 – 21:15 Boiler Room, VITRINE · 21:30 – 23:15 Boiler Room, SUBSTATION 9 · 23:30 – 02:00 Turbine Hall, NULLSET |

Saturday also has a workshop line: "14:00 – 17:00 · Boiler Room · Modular synthesis workshop with Mara Teschke. Full Pass + Workshop only, 40 places." New line: "Workshop entry from 13:30 at the gate. The hall opens to everyone at 19:00."

Note under the tables: "All times are Central European Summer Time. Set times can move. Anything that changes is posted at the gate and here."

**Venue.**
- Eyebrow: The building
- h2: The Powerhouse, Hall E

Paragraphs:
1. "Hall E has not made electricity since 1998. For three nights it makes something else. The building went up in 1928 to burn coal for the city; Hall E held the turbines, and their concrete plinths are still set into the floor. The main stage goes up between them."
2. "The three rooms are not versions of one room. The Turbine Hall is the main floor: twenty-six metres up to the roof trusses and about eight seconds of reverb, which is why the slow sets are programmed here and not downstairs. The Boiler Room is two levels below ground — brick vaults, a low ceiling, iron furnace doors along one wall, and heat the crowd makes and the building keeps. The Cooling Tower is a forty-metre concrete shell with a ring of seating at the base and a deck closing the top. It is the quietest room on site, and the loudest thing in it is usually the room."
3. "Four thousand people a night, across all three. The hall is not heated and it holds the cold: about fourteen degrees on the floor at three in the morning, in June. Bring a layer, and bring ear protection."

Getting here:
- h3: Getting here
- Address: "The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków"
- TRAM: "Trams 9, 14 and 22 stop at Elektrownia, 200 metres from the gate. The last tram into the centre leaves at 23:10; after that the night line 62 runs every forty minutes until 04:40."
- TRAIN: "Kraków Główny is twenty minutes away on tram 14, or a 35-minute walk along the river."
- BIKE: "Three hundred covered racks inside the gate, lit and staffed until thirty minutes after the last set."
- ACCESSIBILITY: "Step-free from the gate to all three stages. A lift serves the Boiler Room and the Cooling Tower balcony, and the Turbine Hall has a raised viewing platform with its own bar and toilet. Accessible toilets on every level."
- Parking: "There is no parking on site and the streets around it are permit-only. The drop-off point is on the corner of ul. Kotłowa and ul. Węglowa, fifty metres from the gate."

Map: a box labelled "MAP PLACEHOLDER", captioned "Hall E, the gate on ul. Kotłowa, and the Elektrownia tram stop two streets north. The river runs along the southern edge of the site."

**Tickets.**
- Eyebrow: Three ways in
- h2: Tickets
- Intro: "Three ways in. The price you see is the price you pay: no booking fee, no service charge, and no tier that expires while you are reading this."

Cards:
- **Single Night:** €45, "one night". Includes: One night, chosen at checkout / All three stages / Re-entry on the night. Button: "Choose a night".
- **Full Pass:** badge "Most popular". €110, "three nights". Includes: All three nights, 12–14 June / All three stages / Re-entry on every night / €25 less than three single nights. Button: "Get a Full Pass".
- **Full Pass + Workshop:** €165, "three nights and the workshop". Includes: Everything in the Full Pass / Modular synthesis workshop, Saturday 14:00 – 17:00 / Led by Mara Teschke in the Boiler Room / 40 places. Button: "Get a Full Pass and workshop".
- Every card ends with "Every ticket is 18+. Bring photo ID."

Comparison (Single Night / Full Pass / Full Pass + Workshop):
- Price: €45 / €110 / €165
- Nights: One, chosen at checkout / Three / Three
- Stages: All three ×3
- Re-entry on the night: Yes ×3
- Saturday workshop: No / No / Yes, 40 places
- Companion ticket: Free ×3
- Booking fee: None ×3

Access box: "Companion tickets for personal assistants are free. Write to access@turbine.fm and we will arrange it, no documentation required."

Small print: "Every ticket is 18+. Bring photo ID."

Not used on the page: a sold-out card variant (badge "Sold out", button "Workshop sold out").

**FAQ.**
- Eyebrow: Before you come
- h2: Questions
- Intro: "Eight things people write to us about."

The first question is shown open.
1. **What time does it start and finish?** "Doors at 19:00 on Friday and Saturday, 17:30 on Sunday. The last set ends at 04:00 on Friday and Saturday and at 02:00 on Sunday, and the hall clears half an hour later. Full set times are in the programme above."
2. **Is there an age limit?** "Yes. Eighteen and over, on every night and in the workshop. We check photo ID at the gate and we do not make exceptions."
3. **Can I leave and come back?** "Yes, on the same night, with your wristband. The gate stops readmitting at 02:00 on Friday and Saturday and at 00:30 on Sunday. The yard between the gate and the hall is the smoking area, so you do not have to leave the site for that."
4. **What is the site like if I have access needs?** "Step-free from the gate to all three stages. A lift serves the Boiler Room and the Cooling Tower balcony. The Turbine Hall has a raised viewing platform with its own bar and toilet. Accessible toilets on every level. A quiet room next to the gate stays open all night with the sound at conversation level, and ear defenders are free at the info desk. There is haze on all three stages and strobe in the Turbine Hall after midnight. Companion tickets for personal assistants are free: write to access@turbine.fm."
5. **What should I bring?** "Photo ID, your ticket on a phone or on paper, and ear protection. Bring a layer as well: the hall is unheated and sits at about fourteen degrees at three in the morning, in June. Leave glass, professional cameras and anything larger than a small rucksack at home."
6. **Is the site cashless?** "The bars and the merchandise stand take cards and phones only. If you would rather not use a card, the desk by the gate turns cash into a festival card with no fee, and refunds the balance in cash on the same night."
7. **What happens if it rains?** "Nothing changes. All three stages are under cover and so is the queue. The only open ground is the yard between the gate and the hall, and that is forty metres."
8. **Are there lockers?** "Nine hundred of them by the gate, €5 a night, large enough for a coat and a rucksack. They open and close as often as you like on the same wristband. The staffed cloakroom next to them takes coats until thirty minutes after the last set."

**Newsletter.**
- h2: Three emails a year
- Pitch: "Changes to set times, and the dates for the fifth edition. Nothing else."
- Field label: "Email address". Placeholder: "name@example.com". Helper: "We do not sell the list and we do not share it."
- Checkbox: "Yes, send me TURBINE festival email. Every message has an unsubscribe link."
- Button: Sign up
- Note: "This page is a teaching fixture. The form sends nothing and stores nothing."
- Messages (Exports page only):
  - Empty: "Enter your email address."
  - Invalid: "That does not look like an email address. Check it and try again."
  - Box not ticked: "Tick the box to confirm you want the email."
  - Success: "You are on the list. We will write when there is something to say."

**Footer.**
- Wordmark TURBINE, tagline "Three nights inside the machine".
- FESTIVAL: Lineup, Programme, Venue, Tickets.
- VISIT: Getting here, Accessibility, What to bring, Lockers and cloakroom.
- CONTACT: hello@turbine.fm, access@turbine.fm, Three emails a year, Questions.
- SMALL PRINT: Terms of entry, Privacy, House rules, Credits.
- Legal lines: "© 2027 TURBINE · The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków" and "Fourth edition · 12–14 June 2027 · 18+".
- Disclaimer: "TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental."
- Socials: Instagram, Bandcamp, Mastodon.
- Hidden heading: "Site footer".

**Document head (Exports page).**
- Title: "TURBINE — 12–14 June 2027 — Hall E, Kraków"
- Meta description: "Three nights of ambient, techno and modular sound in a power station that stopped making electricity in 1998. Kraków, 12–14 June 2027."
- og:title: "TURBINE — Three nights inside the machine"
- og:description: "Ambient, techno and modular sound in a hall built for power. Twelve artists, three stages, three nights. Kraków, 12–14 June 2027."
- og:image: og-card.jpg, with its alt text.

All image alt texts are on the Exports page and in `resolved/exports.json`.

---

## 6. Where the file contradicts itself, or leaves you to guess

**States I have no values for**
1. **Button hover.** Every hover variant (primary, secondary, ghost) adds a fully opaque layer in text/primary over the whole button, on top of the label. As stored, hover is a near-white pill with the label hidden. The opacity that was clearly intended is missing, so I don't know the hover colour.
2. **No hover, pressed or visited state** for nav links, footer links, artist cards, ticket cards or FAQ rows. Tabs have a hover, but it only turns the label text/primary, with no background.
3. **No link styling.** The coolant token's description says "links", but access@turbine.fm in body copy is plain text with no colour or underline.
4. **No open mobile menu.** Only the closed "Menu" text button exists. There is no panel and no icon, yet the Exports page calls it "Hamburger".
5. **Ticker motion is undefined.** Speed, direction and looping are missing. The "static" variant, described as "a real variant, not a note", is identical to the animated one: the same 4,388px row, clipped at the left. What reduced motion should look like is still a guess.
6. **Scroll-cue motion.** The note says its motion "stops under prefers-reduced-motion", but no motion is defined.
7. **FAQ transition.** Only the open and closed looks exist; the open/close movement isn't specified.
8. **Unbuilt screens.**
   - The Fri, Sat and Sun filtered lineups are never laid out.
   - The newsletter success, empty and box-not-ticked messages have text but no placement or styling; only the invalid-email error is drawn as a component.
9. **Undecided caption.** Programme table captions are marked "may be visually hidden".
10. **Unspecified links.** The link targets for the nav links and the nav "Tickets" button aren't annotated; the footer and hero links are.
11. **Focus ring spacing.** The 2px coolant ring sits 4px outside the button, but its stroke is centred on that edge, so the visible gap (about 3px) is ambiguous. Nav links and footer links have no focus design at all.

**Widths**

12. **Tablet and mobile values aren't tokens.** The Responsive token set has one mode only, "Desktop 1440". The tablet and mobile values are typed directly onto layers:
    - gutter 24
    - section padding 96 and 64
    - h2 at 40 and 32
    - h3 at 24
    - lead text at 18
    - hero at 72 and 40

    Some of these layers have a broken, empty font-size link. `section-pad-y` names space/16, 24 and 32 in its description but holds only 128.
13. **Nothing between the frames.** When does the lineup go from 2 to 3 to 4 columns? What happens above 1440?
14. **Hero photo crop.** The photo layer has grown far larger than its section: 2444×1204 inside 1440×780, 1340×1116 inside 768×700, 632×940 inside 390×600. It is pinned to the top left and clipped, so the visible crop is off-centre and the intended focal point is unknown. The darkening gradient stretched with it, so the visible bottom edge reaches about 65% dark, not the stated 90%.
15. **Venue photo ratio.** It is 4:3 at 1440 and 390 but 16:9 at 768.
16. **Uneven card heights.** Cards in one lineup row differ (533, 512, 533, 507 at 1440), which contradicts the note "so the grid does not become a staircase".
17. **Grid gap at 390** is 16, but the grid-gutter token is 24.
18. **Footer order.** Social icons come after the legal lines at 1440 and before them at 768 and 390.
19. **FAQ widths.** The list is 800 and centred at 1440 but full width at 768. The answer's 48px right padding drops to 0 at 390.
20. **390 programme rows.** Zebra striping disappears at 390. Two Saturday rows wrap the artist onto a second line while other rows don't.

**Type**

21. **Headings don't match their styles.**
    - All h2s are detached from Display/Section: the style says 1.08 line height, the headings use 1.0.
    - Day headings and "Getting here" use 32 at 1.2; Display/Subsection, which names "day heading", says 1.25.
    - Ticket tiers use the style.
22. **Headliner names.** They are 24px with no style and no size token (text/2xl exists but is never applied). At 390 every name, headliner or not, is 16, so only the badge shows billing.
23. **Style descriptions vs actual use.** Nav links use Body/Base-Medium ("Nav link") at 1440 but Body/Small-Medium at 768 and 390. Body/Small-Medium says "Tab label", but tabs use Label/Button-Small.
24. **Line-height rounding.** The tokens say relaxed is 162% in Figma or 1.625 in CSS; the styles store 1.62. That is 32.4px against 32.5px at 20px, so pick one. The 1.33 and 1.43 line heights match no line-height token.
25. **Artist name casing.** Five names are typed in capitals (KASIMIR VOLT, NULLSET, SUBSTATION 9, TAPE DECAY, VITRINE) and seven in mixed case. It's probably deliberate, but nothing says so.

**Colour and contrast**

26. **Ticker tags** are arc on raised: 3.80:1 at 12px. The file only quotes arc on bg/base (4.53:1).
27. **Footer legal text** is muted on surface: 3.78:1 at 12px. The file quotes 4.07:1 on bg/base, calls it "PASS-AA-LARGE", and uses it at 12px.
28. **Programme table text colour follows the column.** Artist names in the Turbine Hall and Boiler Room columns are grey (text/secondary). The Cooling Tower column is white, dashes included. The "em dash, No set" note is still attached to cells that now hold names.
29. **Secondary buttons are 2px taller.** They measure 50 (small: 42) against primary's 48 (40), because the border adds height. The two hero buttons don't line up.
30. **Unused token.** text/on-accent is defined as "the text colour on accent" but is never used; everything uses bg/base directly.

**Content and assets**

31. **Badges.** Main and support cards have no badge, yet their notes say 'Billing badge reads "Main"' and '"Support"'. Genre text is coolant on headliner and main cards but grey on support cards, with no explanation.
32. **Duplicated copy.** The tickets eyebrow "Three ways in" repeats the first sentence of the intro. "Every ticket is 18+. Bring photo ID." appears four times.
33. **Venue vs programme.** The venue text says slow sets play in the Turbine Hall "and not downstairs", but Friday ends there with Kasimir Volt's industrial techno.
34. **Grain texture.** `texture-grain.png` is listed under "every image the page uses" but isn't placed anywhere, so its use, opacity and blend are unknown.
35. **Placeholder icons.** The social, access and error icons are plain 14px circles. There are no real glyphs for Instagram, Bandcamp or Mastodon, and no menu icon.
36. **Documents not in the file.** Notes cite CANON.md, CONTENT.md, FIGMA-SPEC and CONTRAST.md section numbers; none of these documents are in the .fig.
37. **Container width.** The container token is 1104, while size/content-max is 1200. A deleted older version of the container token was 1200.