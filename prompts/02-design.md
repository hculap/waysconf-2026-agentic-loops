# 02 — Look at the design

The agent plans and builds a decoder for the Figma file: a script in the project, run with
`npm run design`, that writes the design as JSON into `design/data`. Every later step, and the
checker, reads that data. No page code yet.

## Before you paste

1. On the workshop page, click **Download turbine.fig**.
2. Put the file in a folder named `design` inside the project. Easiest: tell the agent `Move turbine.fig from my Downloads folder into a new folder called design in this project.` It must be inside the project: Claude Code asks for permission before it reads files outside the project folder.
3. Switch to plan mode. In plan mode the agent researches and shows a plan, and changes no file until you approve it. Claude Code: press `Shift+Tab` until the footer shows *plan mode on*. Codex: type `/plan` and press Enter.

You are not expected to understand the whole plan. Check three things: it is a script that `npm run design` runs, it writes JSON files into `design/data`, it writes no page code. Then approve. In Claude Code, choose **Yes, auto-accept edits**, so the agent does not ask before every file change.

---

```text
Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Inside this project there is a folder called design with a .fig file in it. That is the
Figma file itself, as Figma saves it. It is not a picture: it is the whole
design as data — every text, colour, variable, component and photo.

Work from that one file and nothing else. Do not search this computer for the design, a
specification, reference images or anything else about this project: there is nothing else,
and whatever you find is not the design. If the file names something it does not contain,
put it under point 6 instead of going to look for it.

What I want is a tool, not a one-off decode: a script in this project that reads the .fig in
design and writes the design data that the page and the checker will need. Make
"npm run design" run it. Running it again on a new .fig must refresh the data, so that nobody
has to decode or export the design by hand again.

Keep the decoder small: one script, no test suite for the decoder, no extra tooling. Stop
working on it as soon as the seven JSON files and the images are written.

There is no program that opens a .fig, so the script decodes it itself. What is known about
the format:

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

The script may use a package; the network is available. Do not write any page code.

The script writes JSON files into design/data, and the photos into design/images:

- design/data/sections.json: every section, in the order they appear down the page, and
  what is in each one
- design/data/colours.json: every colour, by its name in the design, with its exact value
  and where it is used
- design/data/typography.json: every text style, with font, size, weight, line height and
  letter spacing, and where each one is used
- design/data/layout.json: every width the design covers, and the spacing, sizes, corner
  radii and columns at each width
- design/data/components.json: every component, with its variants and states
- design/data/copy.json: every piece of text, section by section, word for word, including
  alt text and labels that no frame shows
- design/data/images.json: every image, with its file in design/images, where it is used,
  its size and its alt text

Every value is copied exactly as the file has it: no rounding, no renaming. From now on
design/data is the design. Every later step reads it instead of the .fig, and the checker
tests the page against it. If a value turns out to be missing, the fix goes into the script,
and then npm run design runs again.

Your plan must say how the script reads the file, which package it uses if any, and the
shape of each JSON file.

After I approve the plan, write the script, run npm run design, then show me a list and
write point 6 of it into notes.md:

1. Every section, in the order they appear down the page, and the name on every artist card.
2. Every colour, by its name from the design, with its exact value.
3. Every text size, and which one is used where.
4. Every width the design covers.
5. Each file in design/data, and what is in it, one line each.
6. Anything the file disagrees with itself about, or does not tell you, and that you would
   otherwise have to guess.

Point 6 is the one I care about most. Be specific and be honest: "the file shows a hover
state I have no values for" is more useful to me than a confident guess.

Then stop and wait for me to answer point 6.

When I have answered point 6, write my answers into notes.md. Then commit everything with a
message that says what this step did, and push. Tell me the step is done, so I can clear the
session.
```

---

**Expected result.** First, a plan: how the script reads the file, which package it uses and
the shape of each JSON file. Read it, then correct it in plain words or approve it. Then the
agent writes and runs the decoder. This can take longer than the workshop allows: at
15:30, anyone who does not have `design/data` yet takes the rescue pack (the last
row of the table below). At the end `npm run design` exists, `design/data` holds seven JSON
files, `design/images` holds the photos, and the chat shows a six-point list.

Check two things in the list:

- Point 1 matches the design: twelve artist cards with twelve different names, not a generic landing page.
- Point 6 is not empty. Answer with names from the design, for example a colour or text style name from point 2, not with new values. If point 6 is empty, ask `which of those did you read, and which did you infer?`

For anything you cannot answer that way, paste:

```text
For anything I have not answered: pick the likeliest reading, write it into notes.md as an
assumption, and carry on.
```

After your answers the agent commits and pushes.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It writes code before showing a plan | Press Esc, then say `Stop. Show me the plan first and wait for my approval.` |
| It decodes the file once and writes no script | `I asked for a tool. Put the decoding in a script, make npm run design run it, and run it.` |
| It writes tests or extra tooling for the decoder | `Keep the decoder to one script. No tests for it. Write the seven JSON files and the images, then stop.` |
| A JSON file is missing values | `design/data/typography.json has no line heights. Fix the script so it reads them, and run npm run design again.` |
| It starts building the page | Press Esc, then say `Stop. No page code in this step. Undo anything you wrote for the page.` |
| It asks to read a file outside the folder | The `.fig` is beside the project, not in it. Move it into `design` inside the project and say `It is in design now.` |
| It searches your disk, or reads another project | Press Esc, then say `Stop. The design is the .fig in design and nothing else. Do not use anything you found outside this project.` |
| "I cannot open binary files" | `It is a zip. The script must unzip it and decode canvas.fig as described in my last message.` |
| It describes a small, blurry page | It read `thumbnail.png`. `That is the preview picture. Work from canvas.fig.` |
| `zstd` is not supported, or decompression fails | Node is older than 22.15. `Use a package that reads zstd and carry on.` |
| Codex asks to use the network | Answer yes. Installing a package needs it. |
| Claude Code asks before every command | Answer yes and pick the option that stops asking for that kind of command. |
| Every artist card has the same name | `You are reading the component, not the instances. Resolve the component properties and overrides in the script.` |
| Colours come back as "a dark grey" | `Give me exact values. If the script cannot read exact values, say so.` |
| `git push` fails | Run `gh auth status` in a new terminal window (any folder). If it is not signed in, repeat Sign in from the Preparation page, then say `Push again.` |
| It is 15:30 and you do not have `design/data` | Press Esc. If the footer says plan mode, press Shift+Tab until it does not (Codex: leave /plan with /plan again or Esc). Download **design-data.zip** from the workshop page and tell the agent: `Unzip design-data.zip from my Downloads folder into this project, follow RESCUE.md inside it, and commit.` Then `/clear` and prompt 03. In a Codespace, drag the zip from your computer into the file list on the left, then say `Unzip design-data.zip in this project, follow RESCUE.md inside it, and commit.` |

---

### Why it is written this way

- Plan first: a wrong approach to the file costs one sentence to correct before the script exists.
- A script, not a one-off decode: a new version of the `.fig` is one `npm run design` away, and the page and the checker read the same JSON.
- Point 6: the list of things the file does not specify is the part of the brief nobody wrote.
