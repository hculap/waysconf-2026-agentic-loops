# The prompts

Eight things to say to a coding agent. That is the whole workshop.

You need two things and nothing else: **the Figma file** and **this page**. No repository to
clone, no script to run, no code to read. You start in an empty folder and finish with a
website on the internet that the agent built, checked and corrected by itself.

## Two shapes, and neither is a script

Almost everything people build on top of coding agents is one of two shapes. Both are
things you *say*, not things you install.

**A loop** is *do this again until a condition holds*. You define the exit condition and
the agent keeps going until a program — not an opinion — says it is met. Prompt 05.

**A workflow** is *do these things, in this order, with a bar between each*. You define the
phases and what has to be true before the next one starts. Prompt 08.

They nest. The workflow gets you from nothing to nearly-right; a loop inside one of its
phases closes the last gap. Once you can see which one a piece of work wants, most of the
tooling people write for this becomes unnecessary.

## How to use them

Open your agent — `claude` or `codex` — in an empty folder, and paste them in order. Each
one is written to be pasted whole: the agent needs the rules as much as the request, and
trimming a prompt to its first sentence is the commonest way to get a disappointing answer.

After each prompt there is a **what you should see** line. If you see something else, that
is not a failure — it is the moment to say so to the agent, in your own words. The whole
point of this session is that you are allowed to.

## The eight

| | Prompt | What it does | Roughly |
|---|---|---|---|
| 01 | [Start](01-start.md) | Empty folder → a site running on your machine | 3 min |
| 02 | [Look at the design](02-design.md) | The agent decodes the Figma file and tells you what it found, before writing any page | 15 min |
| 03 | [Build it](03-build.md) | Section by section, pausing after each | 15 min |
| 04 | **[Write the checker](04-checker.md)** | The agent writes the program that will judge its own work | 6 min |
| 05 | **[The loop](05-loop.md)** | Check, fix, check again, until the program says yes | 10 min |
| 06 | [Ship it](06-deploy.md) | A public URL you can send to someone | 4 min |
| 07 | [Try to break it](07-review.md) | Find what the checker cannot see | 5 min |
| 08 | **[The same job, as a workflow](08-workflow.md)** | Everything above, handed over as one instruction with phases | — |

Prompts 04 and 05 are the workshop. Prompt 08 is what you do with it on Monday.

## The one idea

Prompt 03 asks the agent to build something. Prompt 04 asks it to build **the thing that
decides whether prompt 03 worked** — and then prompt 05 forbids it from touching that thing
ever again.

That separation is the difference between an AI demo and an AI that works. A model asked
"is this good?" will say yes, warmly and at length. A program asked the same question exits
0 or it does not.

## If you fall behind

You cannot fall behind in a way that matters, because every prompt is self-contained. If
prompt 03 is going badly when the room moves on to 04, say to your agent:

> Stop where you are. Leave whatever is unfinished. I want to move on.

and paste the next one. A half-built page with a working checker teaches you more than a
finished page with none.
