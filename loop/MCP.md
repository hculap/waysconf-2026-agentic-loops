# MCP — connecting the agent to Figma, a browser and a deploy target

MCP is a standard way for a coding agent to call tools that are not in its own
process. Without it, an agent can only read and write the files in front of it.
With it, the same agent can read the actual design, drive a real browser, and put
a site on the internet — without you pasting anything between windows.

That is the whole of it. The rest of this file is setup.

Everything below was verified on 2026-09-11 against the versions named. If a
command has drifted, the version is the first thing to check.

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

**The official Figma MCP server needs a paid Figma seat.** The remote endpoint
answers `401` until you complete an OAuth sign-in, and the sign-in only grants
Dev Mode access on a plan that includes it. If you are on a free Figma account,
the official server will connect and then refuse to hand over code or variables.

That is not a problem for this workshop, because there are two other routes and
both are genuinely good.

### Route A — the export pack (no Figma account needed at all)

Everything the agent needs from the design is already in this repository:

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

### Route B — the REST API, with a personal access token

`figma-developer-mcp` is a community server that talks to the Figma REST API using
a personal access token rather than Dev Mode. It works on a free account for any
file you can open.

```bash
claude mcp add --scope user figma-rest \
  --env FIGMA_API_KEY=your-personal-access-token \
  -- npx -y figma-developer-mcp --stdio
```

Get the token from Figma → your avatar → Settings → Security → Personal access
tokens. It is a secret: it goes in your shell environment, never in a file you
commit. `.gitignore` already excludes `.env`.

What you lose compared to the official server: no Dev Mode code generation and no
Code Connect mapping. What you keep: the node tree, real colour values, real
spacing, and image exports. For building a landing page, that is most of the value.

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
4. **Figma returns 401.** See above — use Route A, and keep moving. Nothing in
   this workshop is blocked by it.
