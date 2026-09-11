# 02 — Look at the design

The agent reads the design and tells you what it found. It writes nothing. This is the
cheapest correction you will get all day: a wrong assumption costs one sentence to fix
here, and twenty minutes of generated code to fix later.

Two routes, depending on whether your Figma account can talk to the agent. **Neither is
better.** The second one is what the gates compare against.

---

## Route A — you connected Figma

Use this if `figma` appears when you run `/mcp` in Claude Code, or `codex mcp list` in
Codex, and the workshop file opens in your browser.

```text
Read the TURBINE design file through the Figma MCP server:
<paste the Figma link here>

Do not write any code yet. Tell me what you found, as a list:

1. Every section, in the order they appear down the page, with the name of each.
2. Every colour, as an exact value, and what it is used for.
3. Every text size, and which one is used where.
4. The spacing values you can see — the gaps between things.
5. Anything the design does not tell you, and that you would otherwise have to guess.

Point 5 is the one I care about most. Be specific and be honest: "I cannot tell what
happens to the lineup grid below 500px" is more useful to me than a confident guess.
```

---

## Route B — Figma is free, or the connection refuses

The design pack is a folder you downloaded from the setup page. Put it beside your project
and unzip it, so that there is a `design` folder next to your `src` folder.

```text
There is a folder called design next to this project. It contains:

- images of the page as it should look, at each width the design covers
- a file of named design values: colours, text sizes, spacing, radii
- a file with every word that appears on the page

Read all of it. Do not write any code yet. Tell me what you found, as a list:

1. Every section, in the order they appear down the page.
2. Every colour, by its name from the design, and what it is used for.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Anything the files disagree about, or do not tell you, and that you would otherwise
   have to guess.

Point 4 is the one I care about most. Be specific and be honest: "the PNG shows a hover
state I have no values for" is more useful to me than a confident guess.
```

---

**What you should see.** A list. Read it. Two things are worth your attention:

- **Does it describe your design?** If it says "a hero, three feature cards and a pricing
  table" and your design has a lineup of twelve artists, it is looking at something else,
  or at nothing.
- **What is in point 4 or 5?** That list is the brief you forgot to write. Answer it now,
  in your own words, before moving on.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It starts building | `Stop. I asked what you found, not for code. Undo anything you wrote.` |
| Figma returns an error or 401 | Your account does not include Dev Mode. Switch to Route B — nothing downstream changes. |
| Colours come back as "a dark grey" | `Give me exact values. If you cannot read exact values, say so — do not describe them.` |
| It describes a page you do not recognise | It is not reading your file. Check the link, or switch to Route B. |

---

### Why this prompt exists at all

It produces nothing. That is the point.

Everything that goes wrong later in a design-to-code loop went wrong here, invisibly: the
agent guessed a colour, assumed a breakpoint, invented a word. Forcing it to say what it
saw — *before* it can hide the guess inside four hundred lines of markup — is the highest
return per second of anything in this session.

In Claude Code this is what **plan mode** does for you automatically (`Shift+Tab` until the
footer says *plan mode on*). This prompt is plan mode written out by hand, so that it works
in any agent.
