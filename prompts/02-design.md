# 02 — Look at the design

The agent decodes the Figma file, writes the design down as documents in `docs`, and lists
what it found. It writes no page code.

## Before you paste

1. On the workshop page, click **Download turbine.fig**.
2. Inside the project folder, create a folder named `design` and put the file in it.

The file must be inside the project folder: Claude Code asks for permission before it reads
files outside it.

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

**Expected result.** 10 to 16 minutes of decoding. `docs` fills with seven documents
(sections, colours, typography, layout, components, copy, images) and `design-data` with the
decoded data and the photos. At the end, a six-point list in the chat.

Check two things in the list:

- The sections match the design: twelve artist cards with twelve different names, not a generic landing page.
- Point 6 is not empty. Answer each item in your own words. If it is empty, ask `which of those did you read, and which did you infer?`

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It starts building | `Stop. I asked what you found, not for code. Undo anything you wrote.` |
| It leaves the documents for the end | `Write docs/colours.md now, from what you have read so far, then carry on.` |
| A document is missing values | `docs/typography.md has no line heights. Read them from the file and add them.` |
| It asks to read a file outside the folder | The `.fig` is beside the project, not in it. Move it into `design` inside the project and say `It is in design now.` |
| It searches your disk, or reads another project | `Stop. The design is the .fig in design and nothing else. Do not use anything you found outside this project.` |
| "I cannot open binary files" | `It is a zip. Unzip it and decode canvas.fig as described in my last message.` |
| It describes a small, blurry page | It read `thumbnail.png`. `That is the preview picture. Work from canvas.fig.` |
| `zstd` is not supported, or decompression fails | Node is older than 22.15. `Install a package that reads zstd and carry on.` |
| Codex asks to use the network | Answer yes. Installing a package needs it. |
| Claude Code asks before every command | Answer yes and pick the option that stops asking for that kind of command. |
| Every artist card has the same name | `You are reading the component, not the instances. Resolve the component properties and overrides.` |
| Colours come back as "a dark grey" | `Give me exact values. If you cannot read exact values, say so.` |

---

### Why it is written this way

- No page code: a wrong assumption is corrected here in one sentence, before it is spread across the page.
- Documents in `docs`: every later prompt reads them instead of decoding the file again, and you can open them yourself.
- Point 6: the list of things the file does not specify is the part of the brief nobody wrote.
