# TURBINE — page copy

**For:** the implementing agent. **Authority:** `docs/CANON.md` wins over this file on any fact.
This file wins over your judgement on any string.

Every user-facing word on the TURBINE landing page is in this document. If a string you need is not
here, that is a question for us, not a gap for you to fill: do not write copy, do not paraphrase, do
not shorten a line to make it fit. Text in fenced blocks is verbatim — copy it character for
character, including the en dashes (`–`), the middots (`·`), the euro signs and the diacritic in
*Ilse Rüm*.

This file specifies **words only**. Colour, type size, spacing and layout come from
`design/tokens/tokens.json` and the design, never from here.

**Tone rules that govern every line below** (CANON §10): spare, concrete, physical. Short sentences.
The building is talked about as much as the music. The words *immersive*, *journey*, *unleash*,
*elevate* and *curated experience* appear nowhere on the page, and neither does an exclamation mark.

## Contents

1. [Meta and social](#1-meta-and-social)
2. [Skip link](#2-skip-link)
3. [Nav](#3-nav)
4. [Hero](#4-hero)
5. [Ticker](#5-ticker)
6. [Lineup](#6-lineup)
7. [Programme](#7-programme)
8. [Venue](#8-venue)
9. [Tickets](#9-tickets)
10. [FAQ](#10-faq)
11. [Newsletter](#11-newsletter)
12. [Footer](#12-footer)
13. [Image manifest and alt text](#13-image-manifest-and-alt-text)
14. [Interface microcopy and accessible names](#14-interface-microcopy-and-accessible-names)
15. [Heading outline](#15-heading-outline)
16. [Link inventory](#16-link-inventory)

---

## 1. Meta and social

**Page title** (42 characters):

```
TURBINE — 12–14 June 2027 — Hall E, Kraków
```

**Meta description** (134 characters):

```
Three nights of ambient, techno and modular sound in a power station that stopped making electricity in 1998. Kraków, 12–14 June 2027.
```

**Open Graph title:**

```
TURBINE — Three nights inside the machine
```

**Open Graph description:**

```
Ambient, techno and modular sound in a hall built for power. Twelve artists, three stages, three nights. Kraków, 12–14 June 2027.
```

Remaining head values:

| Field | Value |
|---|---|
| `lang` | `en` |
| `og:type` | `website` |
| `og:url` and canonical | `https://turbine.fm/` |
| `og:site_name` | `TURBINE` |
| `og:locale` | `en_GB` |
| `og:image` | `/og-turbine.jpg` — 1200 × 630, alt text in §13 |
| `twitter:card` | `summary_large_image` |

No other meta tags: no analytics, no site-verification tokens, no third-party embeds (brief §8).

---

## 2. Skip link

First focusable element on the page. Visually hidden until it receives focus.

```
Skip to main content
```

Target: `#main`.

---

## 3. Nav

Wordmark left, four links, ticket CTA right. Below 768 px the four links and the CTA collapse behind
a hamburger button.

**Wordmark:** live text, never an image — `TURBINE`, all caps. It links to `#top` and its accessible
name is `TURBINE — back to top`.

| Order | Label | Target |
|---|---|---|
| 1 | `Lineup` | `#lineup` |
| 2 | `Programme` | `#programme` |
| 3 | `Venue` | `#venue` |
| 4 | `Questions` | `#faq` |

**Ticket CTA** (primary button):

```
Tickets
```

Target: `#tickets`.

The hamburger has no visible label; its accessible name is `Open menu` when the menu is closed and
`Close menu` when it is open. The nav landmark is labelled `Primary`.

---

## 4. Hero

Full-bleed image behind the type. Carries the only `h1` on the page.

**Eyebrow**, above the wordmark:

```
Fourth edition
```

**Wordmark lockup** — this is the `h1`, set on two lines:

```
TURBINE
```

```
Three nights inside the machine
```

The second line sits inside the `h1` in a `<span>`, so the heading's accessible name reads
`TURBINE Three nights inside the machine`.

**Secondary line**, below the lockup:

```
Ambient, techno and modular sound in a hall built for power.
```

**Dates line:**

```
Friday 12 – Sunday 14 June 2027
```

**Venue line:**

```
The Powerhouse, Hall E · Kraków
```

**Primary CTA**, target `#tickets`:

```
Get tickets
```

**Secondary CTA**, target `#lineup`:

```
See the lineup
```

**Scroll cue** — visible text under the CTAs, beside a downward chevron:

```
Scroll
```

The chevron is decorative (`aria-hidden="true"`). The cue is a link to `#lineup` with the accessible
name `Scroll down to the lineup`. Its motion stops under `prefers-reduced-motion`.

---

## 5. Ticker

A horizontal marquee. Fourteen tags in this order, looping. Twelve are the genre tags from CANON §2;
two are textures of the room.

```
INDUSTRIAL TECHNO
DEEP AMBIENT
DRONE
CONCRETE AND STEEL
MODULAR LIVE
HARDWARE TECHNO
FIELD RECORDING
TAPE LOOPS
DUB TECHNO
SODIUM LIGHT
NEOCLASSICAL ELECTRONIC
PERCUSSIVE AMBIENT
GENERATIVE
GLASSY IDM
```

Separator between every pair of tags, including across the loop seam:

```
·
```

**Accessibility.** The tags are duplicated in the DOM to make the loop seamless, so the animated
strip is `aria-hidden="true"` and this sentence sits beside it, visually hidden, as the accessible
equivalent:

```
Genres across the three nights: industrial techno, deep ambient, drone, modular live, hardware techno, field recording, tape loops, dub techno, neoclassical electronic, percussive ambient, generative and glassy IDM.
```

Under `prefers-reduced-motion: reduce` the strip does not animate. The tags stay still and the strip
moves only if the reader scrolls it.

---

## 6. Lineup

**Heading** (`h2`, section `id="lineup"`):

```
Lineup
```

**Intro:**

```
Twelve artists over three nights. Four a night, one stage at a time. Nothing you want to hear runs against anything else you want to hear.
```

**Filter tabs.** Four, with `All` selected on load. The visible label comes first; the accessible
name is set with `aria-label`, because `Fri` on its own says too little.

| Visible | Accessible name | Shows |
|---|---|---|
| `All` | `All twelve artists` | 12 cards |
| `Fri` | `Friday 12 June` | 4 cards |
| `Sat` | `Saturday 13 June` | 4 cards |
| `Sun` | `Sunday 14 June` | 4 cards |

**Status line** under the tabs, `aria-live="polite"`, rewritten on every filter change:

| Tab | String |
|---|---|
| All | `Showing all twelve artists.` |
| Fri | `Showing four artists playing Friday 12 June.` |
| Sat | `Showing four artists playing Saturday 13 June.` |
| Sun | `Showing four artists playing Sunday 14 June.` |

**Cards.** Twelve, in the CANON §2 order below. Each card carries a portrait, the artist name
(`h3`), a billing badge, a day-and-stage line formatted `<Day> · <Stage>`, a genre tag and one
sentence. Billing badges read `Headliner`, `Main` and `Support`, exactly those words.

### 1. KASIMIR VOLT

| Field | Value |
|---|---|
| Name | `KASIMIR VOLT` |
| Billing | `Headliner` |
| Day and stage | `Friday · Turbine Hall` |
| Genre | `Industrial techno` |

```
Kick drums built to move the air in a room this size, played loud enough that the roof trusses answer back.
```

### 2. Lena Orbis

| Field | Value |
|---|---|
| Name | `Lena Orbis` |
| Billing | `Headliner` |
| Day and stage | `Saturday · Turbine Hall` |
| Genre | `Deep ambient` |

```
Chords held until the hall's eight-second reverb becomes part of the chord.
```

### 3. NULLSET

| Field | Value |
|---|---|
| Name | `NULLSET` |
| Billing | `Headliner` |
| Day and stage | `Sunday · Turbine Hall` |
| Genre | `Generative` |

```
A patch that writes the set while it plays, so nobody in the hall has heard it before, including NULLSET.
```

### 4. Auric Drift

| Field | Value |
|---|---|
| Name | `Auric Drift` |
| Billing | `Main` |
| Day and stage | `Friday · Boiler Room` |
| Genre | `Drone` |

```
Sustained low end that arrives through the floor and reaches your ears second.
```

### 5. Mara Teschke

| Field | Value |
|---|---|
| Name | `Mara Teschke` |
| Billing | `Main` |
| Day and stage | `Saturday · Boiler Room` |
| Genre | `Modular live` |

```
Everything patched on stage, with the cables, the mistakes and the recoveries all audible.
```

### 6. SUBSTATION 9

| Field | Value |
|---|---|
| Name | `SUBSTATION 9` |
| Billing | `Main` |
| Day and stage | `Sunday · Boiler Room` |
| Genre | `Hardware techno` |

```
Three drum machines, no laptop, and a hi-hat that cuts through brick like a spanner dropped on pipework.
```

### 7. Hiroko Vane

| Field | Value |
|---|---|
| Name | `Hiroko Vane` |
| Billing | `Support` |
| Day and stage | `Friday · Cooling Tower` |
| Genre | `Field recording` |

```
Tape of harbours, lifts and transformer hum, mixed until the recordings and the tower sound like one place.
```

### 8. Cold Cathode

| Field | Value |
|---|---|
| Name | `Cold Cathode` |
| Billing | `Support` |
| Day and stage | `Saturday · Cooling Tower` |
| Genre | `Dub techno` |

```
One chord, a spring reverb and a long delay; the concrete does the rest of the work.
```

### 9. Ilse Rüm

| Field | Value |
|---|---|
| Name | `Ilse Rüm` |
| Billing | `Support` |
| Day and stage | `Sunday · Cooling Tower` |
| Genre | `Neoclassical electronic` |

```
Piano and cello through tape delay, played at the volume of a conversation.
```

### 10. TAPE DECAY

| Field | Value |
|---|---|
| Name | `TAPE DECAY` |
| Billing | `Support` |
| Day and stage | `Friday · Boiler Room` |
| Genre | `Tape loops` |

```
Four reel-to-reel machines running spliced loops that wear out audibly before the set ends.
```

### 11. Odalys Ferrer

| Field | Value |
|---|---|
| Name | `Odalys Ferrer` |
| Billing | `Support` |
| Day and stage | `Saturday · Cooling Tower` |
| Genre | `Percussive ambient` |

```
Drums and metal bowls recorded in the room, then played back into it until the two blur.
```

### 12. VITRINE

| Field | Value |
|---|---|
| Name | `VITRINE` |
| Billing | `Support` |
| Day and stage | `Sunday · Boiler Room` |
| Genre | `Glassy IDM` |

```
Brittle high-register rhythms that sound like something small breaking, slowed down.
```

**Without JavaScript** the tabs are hidden, all twelve cards are shown, and the status line reads
`Showing all twelve artists.` No artist may be unreachable with scripting off.

---

## 7. Programme

**Heading** (`h2`, section `id="programme"`):

```
Programme
```

**Intro:**

```
One stage plays at a time. The night opens in the Cooling Tower, moves down to the Boiler Room and finishes on the main floor. Changeovers take fifteen minutes and the walk between stages takes about four.
```

Three day blocks follow, each with an `h3`, a doors line, a table on desktop and a stacked list on
mobile. Table columns are always `Time`, `Turbine Hall`, `Boiler Room`, `Cooling Tower`, in that
order. A cell with no set contains the character `—` marked `aria-hidden="true"` alongside the
visually hidden string `No set`.

### Friday 12 June

`h3` label:

```
Friday 12 June
```

Doors line:

```
Doors 19:00 · Last set ends 04:00 · Hall clears 04:30
```

Table caption (visually hidden is acceptable):

```
Friday 12 June, set times by stage
```

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| `19:30 – 21:00` | — | — | `Hiroko Vane` |
| `21:15 – 22:45` | — | `TAPE DECAY` | — |
| `23:00 – 00:45` | — | `Auric Drift` | — |
| `01:00 – 04:00` | `KASIMIR VOLT` | — | — |

Stacked mobile order, one block per set, each reading time, stage, artist:

```
19:30 – 21:00 · Cooling Tower · Hiroko Vane
21:15 – 22:45 · Boiler Room · TAPE DECAY
23:00 – 00:45 · Boiler Room · Auric Drift
01:00 – 04:00 · Turbine Hall · KASIMIR VOLT
```

### Saturday 13 June

`h3` label:

```
Saturday 13 June
```

Doors line:

```
Doors 19:00 · Last set ends 04:00 · Hall clears 04:30
```

Daytime line, shown above the Saturday table:

```
14:00 – 17:00 · Boiler Room · Modular synthesis workshop with Mara Teschke. Full Pass + Workshop only, 40 places.
```

Table caption:

```
Saturday 13 June, set times by stage
```

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| `19:30 – 21:00` | — | — | `Odalys Ferrer` |
| `21:15 – 23:00` | — | — | `Cold Cathode` |
| `23:15 – 01:00` | — | `Mara Teschke` | — |
| `01:15 – 04:00` | `Lena Orbis` | — | — |

Stacked mobile order:

```
19:30 – 21:00 · Cooling Tower · Odalys Ferrer
21:15 – 23:00 · Cooling Tower · Cold Cathode
23:15 – 01:00 · Boiler Room · Mara Teschke
01:15 – 04:00 · Turbine Hall · Lena Orbis
```

### Sunday 14 June

`h3` label:

```
Sunday 14 June
```

Doors line:

```
Doors 17:30 · Last set ends 02:00 · Hall clears 02:30
```

Table caption:

```
Sunday 14 June, set times by stage
```

| Time | Turbine Hall | Boiler Room | Cooling Tower |
|---|---|---|---|
| `18:00 – 19:30` | — | — | `Ilse Rüm` |
| `19:45 – 21:15` | — | `VITRINE` | — |
| `21:30 – 23:15` | — | `SUBSTATION 9` | — |
| `23:30 – 02:00` | `NULLSET` | — | — |

Stacked mobile order:

```
18:00 – 19:30 · Cooling Tower · Ilse Rüm
19:45 – 21:15 · Boiler Room · VITRINE
21:30 – 23:15 · Boiler Room · SUBSTATION 9
23:30 – 02:00 · Turbine Hall · NULLSET
```

**Note under the three day blocks:**

```
All times are Central European Summer Time. Set times can move. Anything that changes is posted at the gate and here.
```

---

## 8. Venue

**Heading** (`h2`, section `id="venue"`):

```
The Powerhouse, Hall E
```

**Paragraph 1:**

```
Hall E has not made electricity since 1998. For three nights it makes something else. The building went up in 1928 to burn coal for the city; Hall E held the turbines, and their concrete plinths are still set into the floor. The main stage goes up between them.
```

**Paragraph 2:**

```
The three rooms are not versions of one room. The Turbine Hall is the main floor: twenty-six metres up to the roof trusses and about eight seconds of reverb, which is why the slow sets are programmed here and not downstairs. The Boiler Room is two levels below ground — brick vaults, a low ceiling, iron furnace doors along one wall, and heat the crowd makes and the building keeps. The Cooling Tower is a forty-metre concrete shell with a ring of seating at the base and a deck closing the top. It is the quietest room on site, and the loudest thing in it is usually the room.
```

**Paragraph 3:**

```
Four thousand people a night, across all three. The hall is not heated and it holds the cold: about fourteen degrees on the floor at three in the morning, in June. Bring a layer, and bring ear protection.
```

### Getting here

`h3` label:

```
Getting here
```

Address line:

```
The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków
```

Four travel entries, each a term and a description:

| Term | Description |
|---|---|
| `Tram` | `Trams 9, 14 and 22 stop at Elektrownia, 200 metres from the gate. The last tram into the centre leaves at 23:10; after that the night line 62 runs every forty minutes until 04:40.` |
| `Train` | `Kraków Główny is twenty minutes away on tram 14, or a 35-minute walk along the river.` |
| `Bike` | `Three hundred covered racks inside the gate, lit and staffed until thirty minutes after the last set.` |
| `Accessibility` | `Step-free from the gate to all three stages. A lift serves the Boiler Room and the Cooling Tower balcony, and the Turbine Hall has a raised viewing platform with its own bar and toilet. Accessible toilets on every level.` |

Line under the four entries:

```
There is no parking on site and the streets around it are permit-only. The drop-off point is on the corner of ul. Kotłowa and ul. Węglowa, fifty metres from the gate.
```

**Map caption**, below the static map image:

```
Hall E, the gate on ul. Kotłowa, and the Elektrownia tram stop two streets north. The river runs along the southern edge of the site.
```

---

## 9. Tickets

**Heading** (`h2`, section `id="tickets"`):

```
Tickets
```

**Intro:**

```
Three ways in. The price you see is the price you pay: no booking fee, no service charge, and no tier that expires while you are reading this.
```

Three cards, in this order. Every card carries the tier name (`h3`), the price, an inclusion list
and one button.

### Card 1 — Single Night

| Field | Value |
|---|---|
| Name | `Single Night` |
| Price | `€45` |
| Price suffix | `one night` |
| Badge | none |

Inclusion list:

```
One night, chosen at checkout
All three stages
Re-entry on the night
```

Button label:

```
Choose a night
```

### Card 2 — Full Pass

| Field | Value |
|---|---|
| Name | `Full Pass` |
| Price | `€110` |
| Price suffix | `three nights` |
| Badge | `Most popular` |

This is the highlighted card (CANON §3). The badge is real text inside the card, not a background
image, and the card's accessible name begins with the badge so the emphasis is not purely visual.

Inclusion list:

```
All three nights, 12–14 June
All three stages
Re-entry on every night
€25 less than three single nights
```

Button label:

```
Get a Full Pass
```

### Card 3 — Full Pass + Workshop

| Field | Value |
|---|---|
| Name | `Full Pass + Workshop` |
| Price | `€165` |
| Price suffix | `three nights and the workshop` |
| Badge | none |

Inclusion list:

```
Everything in the Full Pass
Modular synthesis workshop, Saturday 14:00 – 17:00
Led by Mara Teschke in the Boiler Room
40 places
```

Button label:

```
Get a Full Pass and workshop
```

Availability strings for this card, per CANON §3. Ship it in the default state; the other two exist
so the state is not invented later:

| State | String |
|---|---|
| Default | no line shown |
| Fewer than 10 places | `Fewer than 10 workshop places left.` |
| None left | `Workshop sold out. Full Pass is still available.` |

When the workshop is sold out the button reads `Workshop sold out`, carries `aria-disabled="true"`
and stays focusable.

### Comparison list

Table caption:

```
The three tiers compared
```

| | `Single Night` | `Full Pass` | `Full Pass + Workshop` |
|---|---|---|---|
| `Price` | `€45` | `€110` | `€165` |
| `Nights` | `One, chosen at checkout` | `Three` | `Three` |
| `Stages` | `All three` | `All three` | `All three` |
| `Re-entry on the night` | `Yes` | `Yes` | `Yes` |
| `Saturday workshop` | `No` | `No` | `Yes, 40 places` |
| `Companion ticket` | `Free` | `Free` | `Free` |
| `Booking fee` | `None` | `None` | `None` |

### Access note

Verbatim from CANON §3, placed directly under the comparison list and above the small print, so it
sits with the prices rather than in the footer:

```
Companion tickets for personal assistants are free. Write to access@turbine.fm and we will arrange it, no documentation required.
```

`access@turbine.fm` inside that sentence is a `mailto:` link.

### Small print under the section

```
Every ticket is 18+. Bring photo ID.
```

---

## 10. FAQ

**Heading** (`h2`, section `id="faq"`):

```
Questions
```

**Intro:**

```
Eight things people write to us about.
```

Eight items, in this order, all collapsed on load. Native `<details>` and `<summary>` satisfy both
the keyboard requirement and the no-JavaScript requirement without script; if you build a custom
accordion instead, it has to match that behaviour. Each item keeps the `id` given here — the footer
links to three of them.

### 1. `id="faq-times"`

Question:

```
What time does it start and finish?
```

Answer:

```
Doors at 19:00 on Friday and Saturday, 17:30 on Sunday. The last set ends at 04:00 on Friday and Saturday and at 02:00 on Sunday, and the hall clears half an hour later. Full set times are in the programme above.
```

### 2. `id="faq-age"`

Question:

```
Is there an age limit?
```

Answer:

```
Yes. Eighteen and over, on every night and in the workshop. We check photo ID at the gate and we do not make exceptions.
```

### 3. `id="faq-reentry"`

Question:

```
Can I leave and come back?
```

Answer:

```
Yes, on the same night, with your wristband. The gate stops readmitting at 02:00 on Friday and Saturday and at 00:30 on Sunday. The yard between the gate and the hall is the smoking area, so you do not have to leave the site for that.
```

### 4. `id="faq-accessibility"`

Question:

```
What is the site like if I have access needs?
```

Answer:

```
Step-free from the gate to all three stages, a lift to the Boiler Room and to the Cooling Tower balcony, and a raised viewing platform in the Turbine Hall with its own bar and toilet. Accessible toilets on every level. A quiet room next to the gate stays open all night with the sound at conversation level, and ear defenders are free at the info desk. There is haze on all three stages and strobe in the Turbine Hall after midnight. Companion tickets for personal assistants are free: write to access@turbine.fm.
```

`access@turbine.fm` is a `mailto:` link.

### 5. `id="faq-bring"`

Question:

```
What should I bring?
```

Answer:

```
Photo ID, your ticket on a phone or on paper, and ear protection. Bring a layer as well: the hall is unheated and sits at about fourteen degrees at three in the morning, in June. Leave glass, professional cameras and anything larger than a small rucksack at home.
```

### 6. `id="faq-cashless"`

Question:

```
Is the site cashless?
```

Answer:

```
The bars and the merchandise stand take cards and phones only. If you would rather not use a card, the desk by the gate turns cash into a festival card with no fee, and refunds the balance in cash on the same night.
```

### 7. `id="faq-weather"`

Question:

```
What happens if it rains?
```

Answer:

```
Nothing changes. All three stages are under cover and so is the queue. The only open ground is the yard between the gate and the hall, and that is forty metres.
```

### 8. `id="faq-lockers"`

Question:

```
Are there lockers?
```

Answer:

```
Nine hundred of them by the gate, €5 a night, large enough for a coat and a rucksack. They open and close as often as you like on the same wristband. The staffed cloakroom next to them takes coats until thirty minutes after the last set.
```

---

## 11. Newsletter

**Heading** (`h2`, section `id="newsletter"`):

```
Three emails a year
```

**Pitch, one line:**

```
Set times, the day tickets go on sale, and the lineup once it is locked. Nothing else.
```

**Field label** — visible, above the input, never a placeholder standing in for a label:

```
Email address
```

**Placeholder** (in addition to the label, not instead of it):

```
name@example.com
```

**Consent checkbox**, unchecked on load, never pre-ticked:

```
Yes, send me TURBINE festival email. Every message has an unsubscribe link.
```

**Button label:**

```
Sign up
```

**Line under the form:**

```
We do not sell the list and we do not share it.
```

**Validation and confirmation messages**, shown inline next to the field they concern and announced
politely:

| Case | String |
|---|---|
| Empty field | `Enter your email address.` |
| Not an address | `That does not look like an email address. Check it and try again.` |
| Consent not ticked | `Tick the box to confirm you want the email.` |
| Success | `You are on the list. We will write when there is something to say.` |

**Fixture note**, required, shown under the form at all times (brief §6 — the form submits nowhere):

```
This page is a teaching fixture. The form sends nothing and stores nothing.
```

---

## 12. Footer

The footer opens with a visually hidden `h2`:

```
Site footer
```

Four link columns follow, each with an `h3`, then the socials, then the legal lines.

### Column 1

Heading:

```
Festival
```

| Label | Target |
|---|---|
| `Lineup` | `#lineup` |
| `Programme` | `#programme` |
| `Venue` | `#venue` |
| `Tickets` | `#tickets` |

### Column 2

Heading:

```
Visit
```

| Label | Target |
|---|---|
| `Getting here` | `#venue` |
| `Accessibility` | `#faq-accessibility` |
| `What to bring` | `#faq-bring` |
| `Lockers and cloakroom` | `#faq-lockers` |

### Column 3

Heading:

```
Contact
```

| Label | Target |
|---|---|
| `hello@turbine.fm` | `mailto:hello@turbine.fm` |
| `access@turbine.fm` | `mailto:access@turbine.fm` |
| `Three emails a year` | `#newsletter` |
| `Questions` | `#faq` |

### Column 4

Heading:

```
Small print
```

These four go to the fictional domain and do not resolve. That is deliberate: the brief allows a
dead external URL and forbids a second page, and an inert `#` link is worse for a keyboard user
than an honest external one.

| Label | Target |
|---|---|
| `Terms of entry` | `https://turbine.fm/terms` |
| `Privacy` | `https://turbine.fm/privacy` |
| `House rules` | `https://turbine.fm/house-rules` |
| `Credits` | `https://turbine.fm/credits` |

### Socials

A row of three icon links under the columns. Icons are `aria-hidden="true"`; the accessible name
comes from the link. All three point at the fictional domain rather than at a real platform, so no
link can land on a real account.

| Accessible name | Target |
|---|---|
| `TURBINE on Instagram` | `https://turbine.fm/instagram` |
| `TURBINE on Bandcamp` | `https://turbine.fm/bandcamp` |
| `TURBINE on Mastodon` | `https://turbine.fm/mastodon` |

### Legal lines

Three lines, in this order:

```
© 2027 TURBINE · The Powerhouse, Hall E · ul. Kotłowa 3 · 30-702 Kraków
```

```
Fourth edition · 12–14 June 2027 · 18+
```

Fiction disclaimer, verbatim from CANON §1 — do not rewrite, shorten or move it above the legal
lines:

```
TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental.
```

---

## 13. Image manifest and alt text

`design/assets/` holds the files below. Use them as supplied; do not source, generate or substitute
images (brief §5). The wordmark is live text everywhere it appears and is never an image, so it has
no entry here.

The alt text is also the shot brief: if a supplied file does not show what its alt text describes,
that is a discrepancy to raise, not an alt text to rewrite.

| Path | Where | Intrinsic size |
|---|---|---|
| `design/assets/hero-hall-e.webp` | Hero, full-bleed | 2400 × 1350 |
| `design/assets/artists/<slug>.webp` | Lineup cards, twelve files | 800 × 1000 |
| `design/assets/venue-boiler-room.webp` | Venue, left column | 1600 × 1200 |
| `design/assets/map-powerhouse.svg` | Venue, static map placeholder | 1200 × 800 |
| `design/assets/og-turbine.jpg` | Social card, published at `/og-turbine.jpg` | 1200 × 630 |
| `design/assets/texture-grain.png` | Decorative overlay | tiles |

Artist slugs, in CANON §2 order: `kasimir-volt`, `lena-orbis`, `nullset`, `auric-drift`,
`mara-teschke`, `substation-9`, `hiroko-vane`, `cold-cathode`, `ilse-rum`, `tape-decay`,
`odalys-ferrer`, `vitrine`.

### Alt text

`hero-hall-e.webp`:

```
The empty floor of Hall E at night, four concrete turbine plinths lit from above by sodium lamps, steel roof trusses in the dark overhead.
```

`artists/kasimir-volt.webp`:

```
KASIMIR VOLT behind a mixing desk, lit from one side in orange, both hands on the faders.
```

`artists/lena-orbis.webp`:

```
Lena Orbis at a table of hardware in a dark hall, eyes closed, one hand held over a filter.
```

`artists/nullset.webp`:

```
NULLSET seen from behind, facing a modular rack whose patch cables cross in front of a bank of green meters.
```

`artists/auric-drift.webp`:

```
Auric Drift standing still at a table of pedals, the room behind him lost in haze.
```

`artists/mara-teschke.webp`:

```
Mara Teschke leaning over a modular case, one patch cable between her teeth while she plugs in another.
```

`artists/substation-9.webp`:

```
SUBSTATION 9 crouched over three drum machines on flight cases, lit only by their displays.
```

`artists/hiroko-vane.webp`:

```
Hiroko Vane in headphones, holding a field recorder at arm's length towards a concrete wall.
```

`artists/cold-cathode.webp`:

```
Cold Cathode at a mixer in blue light, one hand on a delay unit, smoke crossing the beam.
```

`artists/ilse-rum.webp`:

```
Ilse Rüm at an upright piano with a tape machine on top of it and a microphone lowered to the strings.
```

`artists/tape-decay.webp`:

```
TAPE DECAY between two reel-to-reel machines, a loop of tape running across the stage from one to the other.
```

`artists/odalys-ferrer.webp`:

```
Odalys Ferrer seated among metal bowls and hand drums, a mallet resting on the rim of the largest.
```

`artists/vitrine.webp`:

```
VITRINE lit from below through a sheet of glass, both hands flat on a control surface.
```

`venue-boiler-room.webp`:

```
The Boiler Room: brick vaults two levels below ground, a low ceiling, and a row of iron furnace doors along one wall.
```

`map-powerhouse.svg`:

```
Map of the Powerhouse site: Hall E and its gate on ulica Kotłowa, the Elektrownia tram stop two streets north, and the river along the southern edge.
```

`og-turbine.jpg` — used as `og:image:alt`:

```
The TURBINE wordmark over the floor of Hall E, with the dates 12 to 14 June 2027 and the venue, The Powerhouse, Hall E, Kraków.
```

`texture-grain.png` — decorative. Empty alt (`alt=""`) and hidden from assistive technology. It
carries no information and must never be given a description.

---

## 14. Interface microcopy and accessible names

Every remaining user-facing string on the page. If you need one that is not here, stop and ask.

| Where | String | Notes |
|---|---|---|
| Skip link | `Skip to main content` | targets `#main` |
| Nav landmark | `Primary` | `aria-label` |
| Wordmark link | `TURBINE — back to top` | accessible name |
| Hamburger, closed | `Open menu` | `aria-label` |
| Hamburger, open | `Close menu` | `aria-label` |
| Scroll cue link | `Scroll down to the lineup` | accessible name; visible text is `Scroll` |
| Ticker strip | `aria-hidden="true"` | the visually hidden sentence in §5 is the accessible version |
| Lineup tab list | `Filter the lineup by day` | `aria-label` on the tab list |
| Programme captions | see §7 | one per day table |
| Empty programme cell | `No set` | visually hidden; the visible `—` is `aria-hidden="true"` |
| Ticket card 2 | `Most popular` | real text, not a background image |
| Sold-out button | `Workshop sold out` | `aria-disabled="true"`, stays focusable |
| FAQ items | questions in §10 | the `summary` text is the question, unchanged |
| Newsletter messages | see §11 | announced politely, never as an alert dialog |
| Footer landmark heading | `Site footer` | visually hidden `h2` |
| Main landmark | `id="main"` on the element that starts at the hero | the skip link target |

No string on the page says `Click here`, `Learn more`, `Read more` or `Submit`.

---

## 15. Heading outline

One `h1`, no skipped levels (CANON §9). The complete outline:

This block is a structure diagram, not a set of strings. The headings themselves are in the sections
above.

    h1  TURBINE Three nights inside the machine
    h2  Lineup
        h3  one per artist, twelve, in the §6 order
    h2  Programme
        h3  Friday 12 June
        h3  Saturday 13 June
        h3  Sunday 14 June
    h2  The Powerhouse, Hall E
        h3  Getting here
    h2  Tickets
        h3  Single Night
        h3  Full Pass
        h3  Full Pass + Workshop
    h2  Questions
        h3  one per question, eight, in the §10 order
    h2  Three emails a year
    h2  Site footer                            (visually hidden)
        h3  Festival
        h3  Visit
        h3  Contact
        h3  Small print

The ticker has no heading. The hero eyebrow, the dates line and the venue line are not headings.

---

## 16. Link inventory

Every link on the page, so nothing has to be guessed.

**In-page anchors:** `#top`, `#main`, `#lineup`, `#programme`, `#venue`, `#tickets`, `#faq`,
`#newsletter`, `#faq-accessibility`, `#faq-bring`, `#faq-lockers`.

**Mail:** `mailto:hello@turbine.fm`, `mailto:access@turbine.fm`.

**External, deliberately dead** — the domain is fictional and none of these resolve:

| Used by | URL |
|---|---|
| All three ticket card buttons | `https://tickets.turbine.fm/2027` |
| Footer small print | `https://turbine.fm/terms`, `https://turbine.fm/privacy`, `https://turbine.fm/house-rules`, `https://turbine.fm/credits` |
| Socials | `https://turbine.fm/instagram`, `https://turbine.fm/bandcamp`, `https://turbine.fm/mastodon` |

The nav CTA and the hero primary CTA go to `#tickets`, not to the external URL. All links open in
the same tab: nothing on this page uses `target="_blank"`.
