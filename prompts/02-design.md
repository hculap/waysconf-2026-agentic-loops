# 02 — Look at the design

The agent reads the design and tells you what it found. It writes no page yet. This is the
cheapest correction you will get all day: a wrong assumption costs one sentence to fix
here, and twenty minutes of generated code to fix later.

**First put the design next to your project.** One file: the Figma file itself.

---

## Figma → .fig → agent

1. Open the TURBINE file and **Duplicate to your drafts**. It is yours now; poke at it.
2. Main menu (the Figma icon, top left) → **File** → **Save local copy…**
3. Figma saves a file ending in **`.fig`**. Beside your project, make a folder called
   `design` and put the file in it.

No Figma account? The workshop page has the same file ready to download. Put it in the
same place.

**The file, not a picture of it.** A PNG is a picture of the design: the agent has to infer
every colour and every measurement from pixels, and it will be *nearly* right — which is
exactly what fails a contrast check and looks subtly wrong next to the real thing. The
`.fig` is the design itself: the text as text, the colours as values, the variables, the
components and the photos. There is nothing left to infer.

Your agent has no program that opens a `.fig`, so it decodes the file itself. That takes it
ten to fifteen minutes, and it may install a small package from the internet to do it. **The room
has network, so let it** — if Codex asks before going online, say yes.

---

## Route A — you connected Figma to the agent

Use this if `figma` appears when you run `/mcp` in Claude Code, or `codex mcp list` in
Codex. The agent reads the live file and you can skip the `.fig`. It needs a paid Figma
seat with Dev Mode; on a free account use Route B.

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

## Route B — the .fig file

The ordinary route, and what the rest of this pack assumes.

```text
Beside this project there is a folder called design with a .fig file in it. That is the
Figma file itself, saved with "Save local copy". It is not a picture: it is the whole
design as data — every text, colour, variable, component and photo.

There is no tool that opens it, so decode it. What is known about the format:

- A .fig is a zip. The design is in canvas.fig inside it. thumbnail.png is only a small
  preview picture: do not work from it.
- canvas.fig starts with the bytes "fig-kiwi" and a version number, then chunks, each
  prefixed with its length. The first chunk is a schema in the kiwi binary format
  (github.com/evanw/kiwi); the second is the document, encoded with that schema. Each
  chunk is compressed, with raw deflate or with zstd.
- The images folder inside the zip holds the photos, named by the hash the fills use.
- Skip anything marked isSoftDeleted, and anything that belongs to something marked so.
  It was deleted in Figma and is still in the file.
- Text inside a component can come from component properties and overrides. If every
  card of the same kind shows the same words, you are reading the component rather than
  the instances. Resolve that before you trust any copy.

You may install a package to do this; the network is available. Keep what you decode in a
folder called design-data inside this project, so the next steps read it instead of
decoding again. Do not write any page code yet.

Then tell me what you found, as a list:

1. Every section, in the order they appear down the page.
2. Every colour, by its name from the design, with its exact value, and what it is used for.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Every piece of copy, section by section.
6. Anything the file disagrees with itself about, or does not tell you, and that you would
   otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the file shows a hover
state I have no values for" is more useful to me than a confident guess.
```

---

**What you should see.** Ten to fifteen minutes of the agent working the file out, then a
long list. Read it. Two things are worth your attention:

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
| There is no "Save local copy" in the menu | You are in a file you can only view. Duplicate it to your drafts first and save from your copy. |
| "I cannot open binary files" | `It is a zip. Unzip it and decode canvas.fig as described in my last message.` |
| It describes a small, blurry page | It read `thumbnail.png`. `That is the preview picture. Work from canvas.fig.` |
| `zstd` is not supported, or decompression fails | Your Node is older than 22.15. `Install a package that reads zstd and carry on.` |
| Codex asks to use the network | Say yes. Installing a package needs it, and the room has it. |
| Claude Code asks before every command | Decoding is dozens of small commands. Say yes, and pick the option that stops it asking again for that kind of command. |
| Every artist card has the same name | `You are reading the component, not the instances. Resolve the component properties and overrides.` |
| Colours come back as "a dark grey" | `Give me exact values. If you cannot read exact values, say so — do not describe them.` |
| Figma returns an error or 401 | Your account does not include Dev Mode. Use the `.fig` instead — Route B, nothing downstream changes. |
| Ten minutes in, it still cannot read the file | Download the ready-made pack from the workshop page, put it in `design`, and say `Use the pack in the design folder instead.` |
| It describes a page you do not recognise | It is not reading your file. Check the link, or switch to Route B. |

---

### Why this prompt exists at all

It produces no page. That is the point.

Everything that goes wrong later in a design-to-code loop went wrong here, invisibly: the
agent guessed a colour, assumed a breakpoint, invented a word. Forcing it to say what it
saw — *before* it can hide the guess inside four hundred lines of markup — is the highest
return per second of anything in this session.

It is also the first loop of the day, and you did not have to set it up. The agent has
never opened a `.fig`. You gave it five facts about the format; it wrote a decoder, looked
at what came out, and tried again until the names on the cards were real names. That is
the shape of everything after prompt 04.

In Claude Code, **plan mode** is the same idea built in (`Shift+Tab` until the footer says
*plan mode on*): look first, say what you found, change nothing. This prompt is that idea
written out by hand, so that it works in any agent.
