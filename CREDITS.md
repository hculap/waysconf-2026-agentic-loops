# Credits

What is in this repository, where it came from, and under what licence. Everything below was checked
rather than remembered; §5 says how and when.

---

## 1. The fiction

> TURBINE is a fictional festival created as teaching material for a conference workshop. Artist names,
> imagery and copy are invented. Any resemblance to a real event or performer is coincidental.

That paragraph is required by [`docs/CANON.md`](docs/CANON.md) §1 and appears in two places: here, and
in the footer of the page the workshop builds.

It is not boilerplate. The festival, the venue, the twelve artists, the dates, the ticket prices, the
travel information and every word of copy in [`brief/CONTENT.md`](brief/CONTENT.md) were written for
this workshop. There is no real TURBINE, no Powerhouse Hall E, no KASIMIR VOLT. Nothing in this
repository was taken from a real festival's website, and no real event's material was used as a
source.

One name is banned outright rather than merely unused. `docs/CANON.md` §12 records it and the reason.

---

## 2. Typefaces

Three families, all under the **SIL Open Font License, version 1.1**.

| Family | By | Licence | Role here |
|---|---|---|---|
| **Space Grotesk** | Florian Karsten, based on Colophon Foundry's Space Mono | SIL Open Font License 1.1 | Display type and the wordmark |
| **Inter** | Rasmus Andersson | SIL Open Font License 1.1 | Body and interface text |
| **JetBrains Mono** | JetBrains, designed by Philipp Nurullin | SIL Open Font License 1.1 | Set times, prices, code |

The OFL permits use, study, modification and redistribution, including commercially. Two of its
conditions matter to anyone reusing this repository: the fonts may not be sold on their own, and the
copyright notice and licence must travel with the font files wherever they go.

The files in `public/fonts/` are Latin-subset `woff2` copies fetched from Google Fonts by
[`scripts/fetch-fonts.mjs`](scripts/fetch-fonts.mjs), which also generates the `@font-face` sheet
beside them. They are self-hosted rather than linked, for a reason that is specific to this project:
a webfont that arrives late, or does not arrive at all on conference wifi, changes every glyph on the
page and turns the pixel-diff gate into noise.

The same script fetches each family's OFL text and writes it beside the fonts, so this repository meets
that second condition rather than describing it: `public/fonts/OFL-SpaceGrotesk.txt`, `OFL-Inter.txt`
and `OFL-JetBrainsMono.txt`, upstream files kept verbatim, with each copyright line repeated in the
header of `fonts.css`. The two other folders the same `woff2` files are copied into — `guideline/fonts/`
and `deck/public/fonts/` — carry the three texts as well, because both are meant to be published on
their own. If you lift any of those folders into a project of your own, the OFL files are already in it;
keep them there.

---

## 3. Imagery

Sixteen of the eighteen files under `design/assets/` — the hero, the two venue frames, the twelve
artist portraits and the social card — were generated with Google's **Nano Banana Pro**, model id
**`gemini-3-pro-image`**, through the Gemini API. There are no stock photographs in this repository
and no image whose origin is unrecorded.

Each returned image carries **SynthID**, Google's invisible watermark identifying it as AI-generated.
SynthID survives resizing, cropping and re-encoding, and is detectable with Google's own tooling.
Nothing here has been done to remove, weaken or obscure it, and nothing should be: an image that has
to hide where it came from is a worse thing than an image that says so.

The images depict no real person, venue or event. The building does not exist, the crowd does not
exist, and the twelve artists do not exist. Prompts explicitly exclude identifiable faces and any
likeness of a real person.

The other two files are not model output at all. `texture-grain.png` and `texture-scanline.png` are
256 × 256 tiles written by [`scripts/generate-textures.mjs`](scripts/generate-textures.mjs) — a seeded
PRNG and a raised-cosine wave, deterministic and byte-identical on every machine. They were originally
specified as prompts alongside the rest; the model refused both on a recitation filter, and arithmetic
turned out to be the better tool for fine noise and thin lines. No model made them, so there is no
SynthID on them to find. `design/assets/manifest.json` records both as `"present": false` for that
reason, and `PROMPTS.md` §5 is the whole episode.

The full record is [`design/assets/PROMPTS.md`](design/assets/PROMPTS.md). For each of the sixteen
generated images it gives the filename, the exact output dimensions, the generation parameters, the
complete prompt as sent, and the alt text the page ships with. §9 of that file is the provenance
statement this section restates; §1.3 is the detail on SynthID. Each returned image appends one row to
`evidence/asset-generation.log` — timestamp, model id, image id, a 16-character prefix of the prompt
hash, output tier, output dimensions, bytes, elapsed time and reported cost — which is sixteen rows for
the set as it stands. The log ships with the repository — `.gitignore` makes an exception for it — so a
clone has the record and not only the claim.

---

## 4. Software

### 4.1 The project

| | Version | By |
|---|---|---|
| Node.js | 22.22.3 | OpenJS Foundation |
| npm | 10.9.8 | npm, Inc. |
| Astro | 5.18.2 | the Astro project |
| Tailwind CSS | 4.3.3 | Tailwind Labs |
| Playwright (`@playwright/test`) | 1.63.0 | Microsoft |
| axe-core for Playwright (`@axe-core/playwright`) | 4.13.0 | Deque Systems |
| Lighthouse | 12.8.2 | Google |
| pixelmatch | 7.2.0 | Vladimir Agafonkin / Mapbox |
| pngjs | 7.0.0 | the pngjs contributors |
| sharp | 0.35.4 | Lovell Fuller and contributors |
| TypeScript | 5.9.3 | Microsoft |

### 4.2 Agents and command-line tools

| | Version | By |
|---|---|---|
| Claude Code | 2.1.268 | Anthropic |
| Codex CLI | 0.153.4 | OpenAI |
| Netlify CLI | 26.0.2 | Netlify |
| GitHub CLI (`gh`) | 2.93.0 | GitHub |
| git | 2.43.0 | the Git project |

### 4.3 MCP servers

| | Version | Gives the agent |
|---|---|---|
| `@playwright/mcp` | 0.0.80 | a real Chromium: navigate, screenshot, read the accessibility tree |
| `@netlify/mcp` | 1.15.1 | create a site, deploy the build, read back the live URL |
| Figma, remote | `https://mcp.figma.com/mcp` | the real design: frames, layers, variables, measured spacing |

The Figma endpoint answers `401` until an OAuth sign-in completes, and that sign-in grants Dev Mode
access only on a paid plan. [`loop/MCP.md`](loop/MCP.md) says so plainly and documents the two routes
that work without one. The export-pack route is the reference path the visual gate compares against,
not a consolation prize.

Each package is used under its own licence, unmodified, as declared in `package.json` and resolved
into `node_modules/`. Hosting is GitHub (repository, Actions, Codespaces) and Netlify (the deployed
site).

---

## 5. How these numbers were obtained

Every version in §4 was read off this machine on **11 September 2026** — from `node --version`,
`npm --version`, each package's own `package.json` under `node_modules/`, and each CLI's `--version`.
The MCP versions match those recorded in `loop/MCP.md`, verified the same day.

They are a record of what this repository was built and tested against, not a minimum requirement. The
project asks for Node 20.11 or newer and nothing else. If a command in the documentation has drifted,
the version is the first thing to check.

The contrast figures quoted anywhere in this repository were computed from the hex values in
`design/tokens/tokens.json` by the script in the appendix of
[`design/tokens/CONTRAST.md`](design/tokens/CONTRAST.md). None of them is an estimate.

---

## 6. The loop

[`loop/ralph.sh`](loop/ralph.sh) takes its shape from the pattern Geoffrey Huntley has written about
as **"Ralph Wiggum"**: put the instruction in a file, run a coding agent against that file, let it
fail, and run it again — doing the work through repetition with a fresh context each time, rather than
through one long conversation that degrades as it grows.

What this repository borrows is that shape: the prompt lives in `loop/PROMPT.md` and does not change
between iterations, state lives in `loop/PROGRESS.md` rather than in the conversation, and each
iteration starts clean.

What it changes is the exit condition. The loop here is bounded — a hard iteration cap, twelve by
default — and it stops when `npm run check` exits 0, which is a program reading the built site rather
than a person watching or a model deciding. That substitution is the subject of the workshop, and it
is ours; the credit above is for the idea we started from, not for the thing built on top of it.

Neither Geoffrey Huntley nor any other person, project or company named in this file has reviewed,
endorsed or been involved in this workshop.

---

## 7. Licences and authorship

This repository carries three licences, because it contains three different kinds of thing: the code is
MIT, the design, copy and imagery are CC BY 4.0, and the three typefaces stay under the SIL Open Font
License 1.1 they arrived with. [`LICENSE`](LICENSE) gives the boundaries between them and the full
terms.

Written by Szymon Paluch for **WaysConf 2026**, Kraków, 16 September 2026 — the masterclass *Build an
AI that checks and fixes its own work*.
