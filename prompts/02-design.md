# 02 — Look at the design

The agent reads the design and tells you what it found. It writes nothing. This is the
cheapest correction you will get all day: a wrong assumption costs one sentence to fix
here, and twenty minutes of generated code to fix later.

**First get the design out of Figma and next to your project.** Three clicks, and Figma
does the zipping for you.

---

## Figma → zip → agent

1. Open the TURBINE file and **Duplicate to your drafts**. It is yours now; poke at it.
2. Select the frames on the canvas.
3. Right-hand panel → **Export** → choose **SVG** → **Export**.
4. Figma hands you a **zip**. Unzip it beside your project, into a folder called `design`.

**Export SVG, not PNG.** A PNG is a picture of the design: the agent has to infer every
colour and every measurement from pixels, and it will be *nearly* right — which is exactly
what fails a contrast check and looks subtly wrong next to the real thing. An SVG carries
the text as text and the fills as values, so there is nothing left to infer.

Take the PNGs too if you like. They cost nothing and they are useful to look at.

---

## Route A — you connected Figma to the agent

Use this if `figma` appears when you run `/mcp` in Claude Code, or `codex mcp list` in
Codex. The agent reads the live file and you can skip the export.

```text
Read the design file through the Figma MCP server:
<paste the Figma link here>

Do not write any code yet. Tell me what you found, as a list:

1. Every section, in the order they appear down the page, with the name of each.
2. Every colour, as an exact value, and what it is used for.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. The spacing values you can see — the gaps between things.
6. Anything the design does not tell you, and that you would otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "I cannot tell what
happens to the lineup grid below 500px" is more useful to me than a confident guess.
```

---

## Route B — you exported it yourself

The ordinary route, and what the rest of this pack assumes.

```text
There is a folder called design next to this project. It is what I exported out of Figma.

Read all of it. The SVG files carry the real text and the real fill values — read those
rather than guessing from any images. Do not write any code yet. Tell me what you found,
as a list:

1. Every section, in the order they appear down the page.
2. Every colour, by its name from the design, and what it is used for.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Every piece of copy, section by section.
6. Anything the files disagree about, or do not tell you, and that you would otherwise
   have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the export shows a hover
state I have no values for" is more useful to me than a confident guess.
```

---

**What you should see.** A list. Read it. Two things are worth your attention:

- **Does it describe your design?** If it says "a hero, three feature cards and a pricing
  table" and your design has a lineup of twelve artists, it is looking at something else,
  or at nothing.
- **What is in point 6?** That list is the brief you forgot to write. Answer it now, in
  your own words, before moving on. If point 6 is empty, the agent is guessing and has not
  said so — ask it `which of those did you read, and which did you infer?`

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It starts building | `Stop. I asked what you found, not for code. Undo anything you wrote.` |
| Figma returns an error or 401 | Your account does not include Dev Mode. Export it yourself instead — Route B, nothing downstream changes. |
| It read only the pictures | `Where did you get those colour values? If you sampled them from an image, say so.` Sampled values fail a token check: "close to the brand orange" is not the brand orange. Export SVG as well. |
| The export is one enormous file | You selected the page rather than the frames. Select the frames themselves and export again. |
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
