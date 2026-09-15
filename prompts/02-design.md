# 02 — Look at the design

The agent reads the design and tells you what it found. It writes no page yet. This is the
cheapest correction you will get all day: a wrong assumption costs one sentence to fix
here, and twenty minutes of generated code to fix later.

---

## First, put the file in your project

1. On the workshop page, click **Download turbine.fig**.
2. Inside your project folder, make a folder called `design` and put the file in it.

The other card on that page opens the same design in Figma, for looking at while the agent
works.

**Inside the project, not beside it.** Your agent works inside the project folder. Claude
Code asks before it reads anything outside that folder, and a file one level up turns into
a permission question the agent has to stop for.

**The file, not a picture of it.** A PNG is a picture of the design: the agent has to infer
every colour and every measurement from pixels, and it will be *nearly* right — which is
exactly what fails a contrast check and looks subtly wrong next to the real thing. The
`.fig` is the design itself: the text as text, the colours as values, the variables, the
components and the photos. There is nothing left to infer.

Your agent has no program that opens a `.fig`, so it decodes the file itself. That takes it
ten to fifteen minutes, and it may install a small package from the internet to do it.
**The room has network, so let it** — if Codex asks before going online, say yes.

---

```text
Inside this project there is a folder called design with a .fig file in it. That is the
Figma file itself, saved with "Save local copy". It is not a picture: it is the whole
design as data — every text, colour, variable, component and photo.

Work from that one file and nothing else. Do not search this computer for the design, a
specification, reference images or anything else about this project: there is nothing else,
and whatever you find is not the design. If the file names something it does not contain,
put it under point 6 instead of going to look for it.

There is no tool that opens it, so decode it. What is known about the format:

- A .fig is a zip. The design is in canvas.fig inside it. thumbnail.png is only a small
  preview picture: do not work from it.
- canvas.fig starts with the bytes "fig-kiwi" and a version number, then chunks, each
  prefixed with its length. The first chunk is a schema in the kiwi binary format
  (github.com/evanw/kiwi); the second is the document, encoded with that schema. Each
  chunk is compressed, with raw deflate or with zstd.
- The images folder inside the zip holds the photos, named by the hash the fills use.
- Skip anything marked isSoftDeleted, and anything that belongs to something marked so.
  It was deleted in Figma and is still in the file. A variable inside a deleted collection
  is not marked itself — skip it too.
- Text inside a component can come from component properties and overrides. If every
  card of the same kind shows the same words, you are reading the component rather than
  the instances. Resolve that before you trust any copy.

You may install a package to do this; the network is available. Keep the decoded data and
the photos in a folder called design-data inside this project. Do not write any page code
yet.

Then write the design down as documentation, in a folder called docs, so that nobody — not
me, not you, not a fresh session — has to open the .fig again. Write each document as soon
as you have read that part of the file, not all of them at the end:

- docs/sections.md: every section, in the order they appear down the page, and what is in
  each one
- docs/colours.md: every colour, by its name in the design, with its exact value and what
  it is used for
- docs/typography.md: every font and text style, with size, weight, line height and letter
  spacing, and where each one is used
- docs/layout.md: every width the design covers, and the spacing, sizes, corner radii and
  columns at each width
- docs/components.md: every component, with its variants and states
- docs/copy.md: every piece of text, section by section, word for word, including alt text
  and labels that no frame shows
- docs/images.md: every image, with its file in design-data, where it is used, its size and
  its alt text

Copy every value exactly as the file has it: no rounding, no renaming. From now on these
documents are the design, and every later step reads them instead of the .fig. When a value
turns out to be missing, the fix is to add it to the right document first.

Then show me a list, and write point 6 of it into notes.md:

1. Every section, in the order they appear down the page.
2. Every colour, by its name from the design, with its exact value.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Each document you wrote in docs, and what is in it, one line each.
6. Anything the file disagrees with itself about, or does not tell you, and that you would
   otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the file shows a hover
state I have no values for" is more useful to me than a confident guess.

Then stop and wait for me to answer point 6.
```

---

**What you should see.** Ten to fifteen minutes of the agent working the file out. A
`docs` folder fills up as it goes — colours, type, layout, components, copy, images — and
at the end there is a list in the chat. Read the list. Two things are worth your attention:

- **Does it describe your design?** If it says "a hero, three feature cards and a pricing
  table" and your design has a lineup of twelve artists, it is looking at something else,
  or at nothing.
- **What is in point 6?** That list is the brief you forgot to write. Answer it now, in
  your own words. If point 6 is empty, the agent is guessing and has not said so — ask it
  `which of those did you read, and which did you infer?`

`docs` matters later. It is the design written down: every prompt after this one builds and
checks against those documents, not against the `.fig`, and you can open them yourself —
they are plain text. `notes.md` holds the open questions, and if you ever have to start a
fresh session, the two together are what the new one knows.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It starts building | `Stop. I asked what you found, not for code. Undo anything you wrote.` |
| It keeps everything for one big write-up at the end | `Write docs/colours.md now, from what you have read so far, then carry on.` |
| A document is thin, or a value is missing from it | `docs/typography.md has no line heights. Read them from the file and add them.` |
| It asks to read a file outside the folder | The `.fig` is beside the project, not in it. Move it into `design` inside the project and say `It is in design now.` |
| It searches your disk, or reads another project | `Stop. The design is the .fig in design and nothing else. Do not use anything you found outside this project.` |
| "I cannot open binary files" | `It is a zip. Unzip it and decode canvas.fig as described in my last message.` |
| It describes a small, blurry page | It read `thumbnail.png`. `That is the preview picture. Work from canvas.fig.` |
| `zstd` is not supported, or decompression fails | Your Node is older than 22.15. `Install a package that reads zstd and carry on.` |
| Codex asks to use the network | Say yes. Installing a package needs it, and the room has it. |
| Claude Code asks before every command | Decoding is dozens of small commands. Say yes, and pick the option that stops it asking again for that kind of command. |
| Every artist card has the same name | `You are reading the component, not the instances. Resolve the component properties and overrides.` |
| Colours come back as "a dark grey" | `Give me exact values. If you cannot read exact values, say so — do not describe them.` |
| Ten minutes in, it still cannot read the file | Download the ready-made pack from the workshop page, put it in `design`, and say `Use the pack in the design folder instead.` |

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
