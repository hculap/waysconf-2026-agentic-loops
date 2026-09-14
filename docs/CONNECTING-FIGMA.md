# MCP — connecting the agent to Figma, a browser and a deploy target

MCP is a standard way for a coding agent to call tools that are not in its own
process. Without it, an agent can only read and write the files in front of it.
With it, the same agent can read the actual design, drive a real browser, and put
a site on the internet — without you pasting anything between windows.

That is the whole of it. The rest of this file is setup.

Everything below was verified on 2026-09-11 against the versions named, and the Figma
limits on 2026-09-14. If a command has drifted, the version is the first thing to check.

---

## The three servers

| Server | Package / URL | What the agent gains |
|---|---|---|
| **Figma** | `https://mcp.figma.com/mcp` (HTTP, OAuth) | Reads the real design: frames, layers, variables, measured spacing |
| **Playwright** | `@playwright/mcp` 0.0.80 | Drives a real Chromium: navigate, screenshot, read the accessibility tree |
| **Netlify** | `@netlify/mcp` 1.15.1 | Creates a site, deploys the build, reads back the live URL |

This repository already ships `.mcp.json` with all three configured. The first
time you open the project, Claude Code will ask you to approve them — project-scoped
servers are never trusted silently, which is correct, because a repository you
cloned can otherwise ask your agent to run anything.

---

## Claude Code

Already configured. To check:

```bash
claude mcp list
```

To add them yourself in a different project:

```bash
claude mcp add --scope project playwright -- npx -y @playwright/mcp@latest --headless --isolated
claude mcp add --scope project netlify    -- npx -y @netlify/mcp@latest
claude mcp add --scope project --transport http figma https://mcp.figma.com/mcp
```

`--scope project` writes `.mcp.json` into the repository, so the configuration
travels with the code. `--scope user` would keep it to your machine only.

---

## Codex CLI

Codex keeps its servers in `~/.codex/config.toml` rather than in the repository,
so this is a one-time setup on your machine:

```bash
codex mcp add playwright -- npx -y @playwright/mcp@latest --headless --isolated
codex mcp add netlify    -- npx -y @netlify/mcp@latest
codex mcp add figma      --url https://mcp.figma.com/mcp
codex mcp login figma          # opens a browser for the OAuth handshake
codex mcp list
```

---

## Figma, honestly

This is the part that trips people up, so here it is plainly.

**You do not need the Figma connection.** The whole design fits in one file that anyone can
save out of Figma, and a coding agent reads that file by itself. The connection is the
nicer demo; the file is what thirty people can all do in two minutes.

### Route A — the .fig file (a free account is enough)

Open your copy of the file — **Duplicate to your drafts** first if you can only view it —
then the main menu → **File** → **Save local copy…**. Figma writes one `.fig` file. The
participant page also hosts `guideline/turbine.fig` for anyone without an account.

That file is the design, not a picture of it:

```
turbine.fig            a zip
  canvas.fig           the document: every page, frame, text layer, colour, variable,
                       component and instance
  images/              every photo, full resolution, named by hash
  thumbnail.png        a small preview — the one thing in here an agent must not build from
  meta.json            file name, canvas colour, export time
```

`canvas.fig` is Figma's own binary format: the bytes `fig-kiwi`, a version, then two
length-prefixed chunks. The first is a schema in [kiwi](https://github.com/evanw/kiwi)'s
binary format, the second is the document encoded with it. Each chunk is compressed with
raw deflate or zstd — the TURBINE file uses zstd for the document. Because the schema
travels inside the file, a decoder written against the format keeps working when Figma
adds fields.

No program outside Figma opens it, so the agent writes a decoder. A clean Claude Code run on
2026-09-14, given prompt 02 and nothing else, took 16 minutes: it installed `kiwi-schema` and
`fzstd`, decoded the file, fell into the component-text trap below, noticed, fixed it, and
returned all twelve artist names, every colour token and all three widths
(`evidence/fig-trial-claude-2026-09-14.md`). Prompt 02 hands it five
facts about the format. Three of them are traps that cost the most time when nobody
mentions them:

- **`thumbnail.png`** is a picture. An agent that gives up on `canvas.fig` and describes the
  thumbnail is back to guessing from pixels.
- **Deleted things are still in the file.** Every node Figma deleted stays in the document
  marked `isSoftDeleted`. The TURBINE file carries 133 of them, including 14 whole variable
  collections from earlier builds — and the 169 variables inside those collections are not
  marked at all. Only the collection they belong to says they are gone.
- **Text in components comes from properties.** A card's name is a component property: the
  instance holds the value (`componentPropAssignments`), and the layer inside the component
  points at it (`parameterConsumptionMap`, a `PROP_REF` entry). A reader that follows only
  the component sees twelve artist cards with the same name. This one caught the decoder
  that was written to check this workshop's own file.

**The agent may install a package to do it** — `kiwi-schema` for the format, or a zstd
reader on a Node older than 22.15, which is when `zlib.zstdDecompressSync` arrived. That
needs the network. The room has it; tell people to let the agent use it.

Check a file before handing it to anyone:

```bash
node checks/handoff.mjs guideline/turbine.fig
```

It decodes the file with no dependency, prints the pages, text layers, words, colours,
variables, components and images it found, and exits non-zero if an agent would have to
guess. It also says when the file is still called *Untitled*.

### Route B — the export pack (no Figma account at all)

Everything the agent needs from the design is also in this repository as plain files, and
the participant page offers the same thing as `design-pack.zip`:

```
design/export/        full-page and per-section PNGs at 390, 768 and 1440
design/tokens/        tokens.json, tokens.css, and the measured contrast matrix
design/FIGMA-SPEC.md  the layout spec, frame by frame, with real numbers
```

An agent given a PNG plus a token file plus a written layout spec produces better
output than an agent given a screenshot alone, because the two things it normally
has to guess — exact colour values and exact spacing — are handed to it as data.
This is the route the visual diff gate compares against, so it is the reference
path, not the consolation prize.

### The official Figma MCP server — a paid seat, and a budget

The remote endpoint answers `401` until you complete an OAuth sign-in, and what you get
after that depends on the plan the file lives in and on your seat. Figma's limits, as
published on 2026-09-14 ([Rate limits & access](https://developers.figma.com/docs/figma-mcp-server/rate-limits-access/)):

| Plan | View or Collab seat | Dev or Full seat |
|---|---|---|
| Starter | up to 20 tool calls a month | — |
| Professional | up to 6 a month | up to 200 a day, 10 a minute |
| Organization, Enterprise | up to 6 a month | up to 600 a day, 20 a minute |

Reading a page for a build takes dozens of calls, so on a free account the month's budget
is gone inside prompt 02. A duplicate in your drafts lives in your own team — usually
Starter — whatever seat you have at work. For a demo on stage, keep the file in a paid team
and sign in with a Dev or Full seat.

### The REST API, with a personal access token

`figma-developer-mcp` is a community server that talks to the Figma REST API using a
personal access token rather than Dev Mode:

```bash
claude mcp add --scope user figma-rest \
  --env FIGMA_API_KEY=your-personal-access-token \
  -- npx -y figma-developer-mcp --stdio
```

Get the token from Figma → your avatar → Settings → Security → Personal access
tokens. It is a secret: it goes in your shell environment, never in a file you
commit. `.gitignore` already excludes `.env`.

It is no longer a free-account answer. Reading a file, its nodes or its images is a Tier 1
REST call, and Tier 1 allows a View or Collab seat up to 20 calls a month on every plan; a
Dev or Full seat gets 10 to 20 a minute depending on the plan
([REST API rate limits](https://developers.figma.com/docs/rest-api/rate-limits/)). What you
keep when it works: the node tree, real colour values, real spacing, and image exports.

### A plugin bridge — live and free, with more moving parts

Community servers such as [`claude-talk-to-figma-mcp`](https://github.com/arinspunk/claude-talk-to-figma-mcp)
skip the REST API entirely: a plugin runs inside Figma desktop and talks to the agent over
a local WebSocket, so there is no token, no seat and no rate limit. The price is three
things that all have to be running — a local server started from the terminal, a plugin
imported from its manifest into the desktop app, and the file open with the plugin running
for as long as the agent works. Not tested in this workshop. It makes a good live demo; it
is too many moving parts to hand to a room.

---

## What "give the agent the design" actually buys you

Try both and watch the difference, because it is the single most convincing thing
in this workshop:

1. Ask the agent to build the hero from a screenshot alone. It will approximate.
   The orange will be *an* orange. The spacing will be *some* spacing. It will look
   roughly right and fail the token gate on the first run.

2. Ask it again with `design/tokens/tokens.json` in context. The colours are now
   exact, because they were never guessed.

The gates make that difference measurable rather than a matter of taste: AC-26
fails on any colour the page paints that is not in the token file, and AC-31 fails
on any font size that is off the scale.

---

## Netlify

The MCP server can create the site and deploy it. So can the CLI, and on
conference wifi with thirty people the CLI is the one that reliably works:

```bash
npm run build
npx netlify deploy --prod --dir=dist
```

The first run asks you to authorise in a browser and then to pick or create a
site. Take the URL it prints — that is the thing you came here for.

---

## When MCP will not connect

In rough order of how often it is the answer:

1. **You have not approved the server.** Run `claude` in the project once and
   accept the prompt.
2. **You are behind a captive portal.** The venue wifi has not let you out yet.
   Open any http page in a browser, accept the terms, try again.
3. **`npx` cannot reach the registry.** The devcontainer pre-installs everything,
   so switching to Codespaces resolves this.
4. **Figma returns 401.** See above — save the `.fig` instead, and keep moving.
   Nothing in this workshop is blocked by it.
