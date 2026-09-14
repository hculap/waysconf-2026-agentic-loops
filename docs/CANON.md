# TURBINE — canonical project facts

> Single source of truth for every artifact in this repository. If anything you write disagrees
> with this file, this file wins. Everything here is **fictional** and exists only as a workshop fixture.

## 1. The event

| Field | Value |
|---|---|
| Name | **TURBINE** |
| Wordmark | `TURBINE` — all caps, letter-spaced, never "Turbine Festival" in the logo lockup |
| Tagline | *Three nights inside the machine* |
| Secondary line | *Ambient, techno and modular sound in a hall built for power* |
| Edition | Fourth edition |
| Dates | **11–13 June 2027** (Fri–Sun) |
| Venue | The Powerhouse, Hall E — a decommissioned 1928 coal power station |
| City | Kraków, Poland |
| Capacity | 4 000 per night |
| Stages | 3 — **Turbine Hall**, **Boiler Room**, **Cooling Tower** |
| Website | `turbine.fm` (fictional) |
| Contact | `hello@turbine.fm` (fictional) |

**Disclaimer required in `CREDITS.md` and the site footer:** TURBINE is a fictional festival created as
teaching material for a conference workshop. Artist names, imagery and copy are invented. Any resemblance
to a real event or performer is coincidental.

## 2. Lineup — 12 artists (fictional)

| # | Artist | Billing | Day | Stage | Genre tag |
|---|---|---|---|---|---|
| 1 | KASIMIR VOLT | Headliner | Fri | Turbine Hall | Industrial techno |
| 2 | Lena Orbis | Headliner | Sat | Turbine Hall | Deep ambient |
| 3 | NULLSET | Headliner | Sun | Turbine Hall | Generative |
| 4 | Auric Drift | Main | Fri | Boiler Room | Drone |
| 5 | Mara Teschke | Main | Sat | Boiler Room | Modular live |
| 6 | SUBSTATION 9 | Main | Sun | Boiler Room | Hardware techno |
| 7 | Hiroko Vane | Support | Fri | Cooling Tower | Field recording |
| 8 | Cold Cathode | Support | Sat | Cooling Tower | Dub techno |
| 9 | Ilse Rüm | Support | Sun | Cooling Tower | Neoclassical electronic |
| 10 | TAPE DECAY | Support | Fri | Boiler Room | Tape loops |
| 11 | Odalys Ferrer | Support | Sat | Cooling Tower | Percussive ambient |
| 12 | VITRINE | Support | Sun | Boiler Room | Glassy IDM |

## 3. Ticket tiers

| Tier | Price | Includes | Note |
|---|---|---|---|
| **Single Night** | €45 | One night, all three stages | Choose your date at checkout |
| **Full Pass** | €110 | All three nights | Most popular — highlight this card |
| **Full Pass + Workshop** | €165 | All three nights + Saturday modular synthesis workshop (limited to 40 places) | Sold out warning appears below 10 places |

Access note that must appear near the pricing table: *Companion tickets for personal assistants are free.
Write to access@turbine.fm and we will arrange it, no documentation required.*

## 4. Colour tokens

Dark theme is the only theme. The palette is deliberately built so that a careless implementation
**will** fail contrast — that is pedagogically intentional, see §8.

| Token | Hex | Use |
|---|---|---|
| `color.bg.base` | `#0A0B0D` | Page background |
| `color.bg.surface` | `#131519` | Cards, nav background |
| `color.bg.raised` | `#1C1F25` | Hover states, table header |
| `color.border.subtle` | `#2A2E36` | Hairlines, card borders |
| `color.border.strong` | `#3D434E` | Focus ring base, dividers |
| `color.text.primary` | `#F2F4F7` | Headings, body on dark |
| `color.text.secondary` | `#A7AEBB` | Supporting copy |
| `color.text.muted` | `#6B7280` | **Trap.** Legal/footer text only, never body copy |
| `color.accent.sodium` | `#FF6A1A` | Primary accent — sodium lamp orange, CTAs |
| `color.accent.coolant` | `#2FE6D6` | Secondary accent — links, active tab |
| `color.accent.arc` | `#7C5CFF` | Tertiary accent — badges, marquee |
| `color.state.danger` | `#FF4D4D` | Sold-out, errors |
| `color.state.success` | `#3DDC84` | Confirmation |

Fixed pairings that are known-good and must be used for body text:
`text.primary` on `bg.base`, `text.primary` on `bg.surface`, `text.secondary` on `bg.base`,
`bg.base` on `accent.sodium` (dark text on orange button, **not** white).

## 5. Typography

| Role | Family | Source | Weights |
|---|---|---|---|
| Display | **Space Grotesk** | Google Fonts | 500, 700 |
| Body | **Inter** | Google Fonts | 400, 500, 600 |
| Mono | **JetBrains Mono** | Google Fonts | 400, 700 |

Type scale (rem): `0.75 · 0.875 · 1 · 1.125 · 1.25 · 1.5 · 2 · 2.5 · 3.5 · 4.5 · 6`
Display sizes use Space Grotesk with `letter-spacing: -0.02em`; the wordmark uses `+0.18em`.

## 6. Spacing, radius, breakpoints

- Spacing scale (px): `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`
- Radius: `none 0 · sm 4 · md 8 · lg 16 · pill 999`
- Breakpoints: **mobile 390**, **tablet 768**, **desktop 1440** — these three widths are the only ones screenshotted and diffed.
- Content max width: 1200px, gutter 24px mobile / 48px desktop.

## 7. Page sections — canonical order

1. **Skip link** (visually hidden until focused)
2. **Nav** — sticky, wordmark left, 4 links, ticket CTA right; hamburger below 768
3. **Hero** — full-bleed image, wordmark, dates, venue, two CTAs, scroll cue
4. **Ticker** — horizontal marquee of genre tags; must respect `prefers-reduced-motion`
5. **Lineup** — 12 artist cards with portraits, day filter tabs (All / Fri / Sat / Sun)
6. **Programme** — timetable, 3 days × 3 stages, table on desktop, stacked on mobile
7. **Venue** — two columns: image + text, travel info, static map placeholder
8. **Tickets** — 3 tier cards + comparison list + access note
9. **FAQ** — accordion, 8 questions, keyboard operable
10. **Newsletter** — email input, consent checkbox, no dark patterns
11. **Footer** — 4 link columns, socials, legal, fiction disclaimer

## 8. Why the palette is a teaching device

`color.text.muted` (`#6B7280`) on `color.bg.base` (`#0A0B0D`) is roughly **4.1:1** — under the 4.5:1
required for normal body text. A model asked to "use a muted grey for supporting copy" reaches for it
almost every time. The axe gate then fails **for real**, the failure report goes back into the loop, and
the agent fixes it by moving to `text.secondary`. Nothing about that demo is staged.

The same is true of white-on-sodium: `#FFFFFF` on `#FF6A1A` is about **2.9:1** and fails, while the
canonical pairing `#0A0B0D` on `#FF6A1A` passes comfortably. Buttons are where models get this wrong.

## 9. Non-negotiable accessibility requirements

Target: **WCAG 2.2 AA**.

- Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI boundaries
- Every interactive element has a visible focus indicator with ≥ 3:1 contrast against its background
- Lineup tabs and FAQ accordion fully keyboard operable, correct ARIA
- `prefers-reduced-motion` honoured by ticker, scroll cue and any transition over 200 ms
- All images have meaningful `alt`; decorative images have `alt=""`
- One `h1`, no skipped heading levels, landmark regions present, `lang="en"`
- Skip link as first focusable element
- Touch targets ≥ 24×24 CSS px

## 10. Tone of voice

Spare, concrete, physical. Short sentences. Talks about the building as much as the music.
Never uses "immersive", "journey", "unleash", "elevate", "curated experience", or exclamation marks.

Good: *"Hall E has not made electricity since 1998. For three nights it makes something else."*
Bad: *"Get ready for an unforgettable immersive journey!"*

## 11. Out of scope — do not build

- No e-commerce, checkout or payment flow — ticket CTAs link to `#tickets` or a dead external URL
- No CMS, no database, no backend, no API routes
- No login, accounts or user state
- No cookie banner, no analytics, no third-party trackers
- No light theme, no theme switcher
- No i18n — English only
- No blog, no news archive, no artist detail pages — the landing page is one page

## 12. Naming collisions to avoid

The working name for this project was briefly "NOVA". **Do not use it anywhere.** It is the name of the
music festival attacked at Re'im on 7 October 2023 and is inappropriate for a fictional electronic
festival in public teaching material.
