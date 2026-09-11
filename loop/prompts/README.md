# The prompts

Every prompt used on stage, in order, as files rather than as screenshots of a chat window.

Each file in this directory **is** the prompt. There is no preamble to strip and no commentary to skip:
the whole file is what the agent receives. That is what makes it runnable as well as readable, and it is
why the explanations live here instead of inside the prompts.

## Running them

Both agents, same files, no translation:

```bash
claude -p "$(cat loop/prompts/01-plan.md)"          # Claude Code, one shot
codex exec "$(cat loop/prompts/01-plan.md)"         # Codex CLI, one shot
```

Or open `claude` / `codex` interactively and paste the file. Or read it off the screen and type it. The
prompts assume nothing about which of those you did, and none of them depends on an earlier turn in the
conversation — which is the property that lets the same file run in iteration nine of an unattended loop.

Two of them want a value from you first. `02-implement-section.md` has `<SECTION>`, and
`03-fix-from-report.md` has an optional block after `--- REPORT ---`. Angle brackets are the only
placeholder convention in this directory: if you do not see any, there is nothing to fill in.

`loop/PROMPT.md` is a different thing and lives one directory up. It is the standing instruction
`loop/ralph.sh` sends on every iteration, unchanged, forever. These files are what a person sends.

## Which one, and when

| | Prompt | Send it when | It gives you back |
|---|---|---|---|
| 00 | `00-orient.md` | First contact with the repository, before any decision | A short account of what this is, what "done" means, and what is actually on disk |
| 01 | `01-plan.md` | Once, before any code exists | A section-by-section plan with every acceptance criterion owned by something |
| 02 | `02-implement-section.md` | Once per section, eleven times | One section built, the gates run, `loop/PROGRESS.md` appended |
| 03 | `03-fix-from-report.md` | Every time `npm run check` exits non-zero | The first failing gate family repaired, item by item |
| 04 | `04-adversarial-review.md` | After the gates are green, never instead of them | Ranked findings about what the gates cannot see, each citing a selector or a line |
| 05 | `05-deploy.md` | After the gates are green and the findings are triaged | A live URL, proved by fetching it rather than by reporting it |
| 06 | `06-explain-to-designer.md` | At the end, or whenever the room stops following | An account of what happened, in language a designer can check |

The subagents in `.claude/agents/` — `design-critic`, `a11y-auditor`, `copy-checker` — are the narrow
version of 04, and they are the one thing here that is Claude Code only: `.claude/agents/` is a Claude Code
directory and Codex does not read it, so on Codex send `04-adversarial-review.md` instead. In Claude Code
you ask for one by name, in ordinary words — *Use the design-critic subagent on the built page.* Use them
after the gates are green, on one question each. 04 is the broad version: one agent, told to attack the
whole page. Both open items; neither closes one.

## What makes them work

Five properties, shared by all seven. They are worth more than the wording.

**They point at files instead of pasting them.** Every prompt here names paths and section numbers.
Nothing quotes `docs/CANON.md` at the agent. A pasted document lands in the conversation, where it gets
summarised, decays, and is paid for again on every later turn. A path is still readable in iteration nine
and costs the same each time.

**They are specific about what not to do.** Negative constraints are cheaper to enforce than positive ones
and they are what stops scope creep. Every prohibition in these files is something an agent actually did in
this repository at least once.

**They ask for evidence, not for assurance.** "Do not tell me a gate passes unless you ran it." "Tell me it
is live because you fetched it." An agent that cannot produce an artifact for a claim has not done the
work, and the prompts are written so that the difference shows.

**They fit on a slide.** A prompt nobody can read aloud is a prompt nobody checks. If one of these grows
past a screen, something in it belongs in `AGENTS.md` instead, where it applies to every prompt at once.

**They carry no history.** Each one restates the constraint it depends on. That is mild duplication in
exchange for the ability to run any of them, in any order, in a fresh context, with no conversation behind
it — including at 3am, from a bash loop, in an agent that remembers nothing.

## Which pattern from `docs/TIPS.md` each one demonstrates

`docs/TIPS.md` §1 lists eight prompt patterns and §2 lists six ways loops fail. Each prompt here is one of
those patterns made concrete, so a participant can read the tip and then read the thing the tip describes.

**`00-orient.md` — "Point at files, do not paste them", plus "Tell it what not to do".**
It bans editing, building and summarising, and it requires a file path beside every claim. The point it
makes is about grounding: the accuracy of everything downstream is set here, by whether the agent read
`docs/CANON.md` or recognised the general shape of a festival landing page. Asking where the repository
actually is right now is a direct guard against §2 *silent partial completion* — an agent that assumes
`src/` is full will happily report on sections that do not exist.

**`01-plan.md` — "Ask for a plan before code, and read it", plus "Give it a contract, not a wish".**
A plan takes ninety seconds to check; the code it would have produced takes an afternoon. Nearly every
serious misunderstanding is visible in the plan, and this is where it is cheapest to correct. The demand
for a list of unowned criteria is the countable-completeness idea from §2: eight of eleven sections built
and confidently summarised is the quietest failure mode there is, so the plan is made to count.
"Stop after the plan" is load-bearing — without it, most agents plan and then start.

**`02-implement-section.md` — "Give it a contract, not a wish", plus §5 *why small tasks beat one large
one*.**
The contract is the criterion ids and the `data-` hook table in `brief/ACCEPTANCE.md`, not an adjective
about quality. The scope is one section because the context you carry is the context you pay for on every
turn: one section touches four files, the whole page touches forty, and a small task that fails costs a
small retry while you keep the sections that passed.

**`03-fix-from-report.md` — "Hand over the failure report verbatim", plus "Ask for the smallest change
that turns the gate green".**
This is the repair half of the loop and the most-used prompt in the workshop. It refuses paraphrase,
because paraphrase drops the selector and the selector is the useful part. It fixes one family at a time,
and it names the order — BUILD, STRUCTURE, RUNTIME, LINKS, CONTENT, TOKENS, A11Y, VISUAL, PERF — rather
than trusting the report's own sequence, which is alphabetical. That distinction is the point: an agent
that repairs a single stale link while two sections are missing is §2 *the loop oscillates* happening on
stage. The three-strikes rule is the same failure named directly: a criterion that fails three times the
same way usually means two gates contradict each other, and iteration does not resolve a contradiction.
The prohibition on editing `checks/` is §2 *the loop edits the test* — the most common failure, and the one
that feels most like success.

**`04-adversarial-review.md` — §4 *real loop versus fake loop*, held to the useful half.**
A fake loop asks the model to grade its own output; this one asks it to attack output it did not produce,
with the gates' verdict already fixed and out of its reach. Every constraint in the file exists to keep it
on the useful side of that line: cite a selector or be discarded, rank by harm, say what would make it not
a defect, and find nothing if there is nothing. A model may open an item and may never close one, because
one model with veto power removes the determinism that makes everything else here trustworthy.

**`05-deploy.md` — §6 *things never to let a loop do unattended*.**
Deploying to production without a gate in front of it is on that list, so the gates are a precondition
rather than a suggestion. The hash comparison is the criterion `brief/ACCEPTANCE.md` says is usually
missing: everything else proves that *a* page passed, and only this proves that the page which passed is
the page that shipped. The prohibitions on secrets, global installs and force pushes are the rest of §6,
written where they will actually be read.

**`06-explain-to-designer.md` — §2 *success reported, nothing run*, turned into a writing constraint.**
Requiring a real failure with its criterion id, and cutting any claim that cannot point at a file, makes
the difference between having run the loop and having described it impossible to hide in prose. The section
on what the checks could not see is the same honesty the repository's own README insists on: a green gate
means no known defect, which is a smaller and more useful claim than "accessible", "on-brand" or "done".
