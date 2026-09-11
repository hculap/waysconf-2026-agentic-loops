# TURBINE — design pack

Four files. Put this folder next to your project, so that `design` sits beside `src`, and
point your agent at it.

| File | What it is |
|---|---|
| `390.png`, `768.png`, `1440.png` | The page as it should look, at the three widths that matter |
| `tokens.json` | Every colour, text size, spacing value and radius, by name |
| `content.md` | Every word that appears on the page |

## Why a token file and not just the pictures

An agent given only a screenshot has to infer every colour and every measurement from
pixels, and it will be *nearly* right — an orange, some spacing. Nearly right is what
fails a contrast check and looks subtly off next to the real design.

Given `tokens.json`, it does not infer anything. `#FF6A1A` is in the file. That difference
is the single most useful thing in this folder, and it is why the second prompt asks the
agent to read all three files before writing a line.

## Where the pictures come from

They are renders of the reference implementation, captured at the three widths with fonts
loaded, images decoded and animations frozen — not exports from Figma.

Worth knowing the difference. A Figma export says *what the design asks for*. These say
*what the page looked like when it was correct*. For building and for comparing, they are
equivalent; for settling an argument about intent, open the Figma file.

## The words are not suggestions

`content.md` is every string on the page, and the prompts tell the agent not to write copy.
That is not pedantry: an agent left to invent text will produce competent, plausible,
entirely wrong marketing prose, and you will not notice until somebody reads it aloud.

TURBINE is a fictional festival. The artists, the venue and the copy are invented.
