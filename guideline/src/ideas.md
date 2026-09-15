# The ideas

## Workshop plan

| Time | Part | What you do |
|---|---|---|
| 14:55 | Introduction | Listen. |
| 15:03 | Setup | Open a terminal in the `turbine` folder, start the agent, paste prompt 01. |
| 15:10 | Design | Put `turbine.fig` in `design/` and paste prompt 02. The agent decodes the file for 10 to 16 minutes. |
| 15:20 | Build | Read the agent's findings, answer its open questions, paste prompt 03. Review the page section by section. |
| 15:35 | Checker | Paste prompt 04. The agent writes `npm run check`. Demo: a failing check and its report. |
| 15:50 | Loop | Paste prompt 05. The agent fixes the page until the check passes. |
| 16:05 | Deploy | Paste prompt 06, then prompt 07. |
| 16:17 | Limits and questions | Listen, ask. |

Each prompt works on its own. If one fails, tell the agent to stop and paste the next one. Prompt 08 is prompts 01 to 07 as one message, for use after the workshop.

---

## The loop

::diagram:01-the-loop::

- **Plan.** The agent states what it will change and why. From the second round on, the plan starts from the report.
- **Implement.** The agent writes code. The first time it generates the page; after that it fixes what the report names.
- **Verify.** A program, `npm run check`, tests the page in a real browser and exits with 0 (pass) or 1 (fail). On a fail it writes a report.

The loop ends when the check exits 0. Then the page is deployed.

---

## Who checks the work

::diagram:02-fake-loop-vs-real-loop::

An agent can check work on two conditions: it did not do the work in the same context, and it is told to find problems, not to confirm the result.

| Who checks | What it is good for |
|---|---|
| The same agent, in the same context | Nothing. It repeats the reasoning that produced the work. |
| A program: `npm run check` | Everything with an exact answer: sections, colours, copy, contrast, overflow. |
| Agents with a fresh context, told to attack (adversarial review) | What a program cannot measure: reading order, useless alt text, text over photos, copy that does not match the brand. |

Run the program and the review side by side. Failures and confirmed findings go into one report, and the page ships when that report is empty. In the workshop, the review is prompt 07, pasted in a new session.

---

## Plan before code

In Claude Code, press `Shift+Tab` until the footer shows *plan mode on*. The agent cannot edit files until you approve the plan. In Codex, ask for the plan explicitly:

```text
Do not write any code yet. Tell me what you found and what you intend to build, and wait.
```

Prompt 02 works the same way: the agent reads the design and writes no page code.

---

## Levels of checking

::diagram:03-verification-tiers::

1. **Deterministic checks.** Build, console errors, sections, colours, copy, contrast, overflow. Same result on every run.
2. **Measured comparison.** Screenshots compared with the design. Detects a change, does not judge it.
3. **Adversarial review.** Agents with a fresh context look for what levels 1 and 2 cannot measure. Every finding must name an element and survive an attempt to refute it.

---

## The failure report

The check writes every failure to a file. Example:

```md
**3. [check 07] a colour on the page is not in the design**

- Where: the supporting line inside each card in the lineup section
- Expected: the design's "text / secondary"
- Actual: the design's "text / muted", 4.07:1 against the page background;
          body text needs 4.5:1
- Hint: muted is defined for legal and footer text only
```

Each failure has four fields: what failed, where, what the design expects, what the page has. In the next round the agent reads this file, not its memory of the previous round.

The agent must never edit the checker. If it can change the check, a pass means nothing.

---

## Context and notes

A long session collects abandoned attempts and old reasoning. When the agent slows down or becomes vague, move the state into files and start a new session.

| Long session | New session |
|---|---|
| Holds every earlier attempt | Reads the report: the current failures |
| Repeats its own earlier reasoning | Reads `notes.md`: what was tried and what happened |
| Slows down | Reads `docs/`: the design, written down in prompt 02 |

```text
Write what is left to do into notes.md, in ten lines: what you tried, what worked,
what did not, and why.
```

Then start a new session and tell the agent to read `docs` and `notes.md`.

---

## Loops and workflows

::diagram:07-loop-vs-workflow::

- **Loop:** plan, implement and verify, repeated until a condition holds. You define the exit condition. Prompt 05; in Claude Code also `/goal npm run check exits 0`.
- **Workflow:** phases in a fixed order, with a condition that must hold before the next phase starts. A phase can run several agents at the same time. You define the phases. Prompt 08.

A workflow can contain a loop: phase 05 of prompt 08 is the loop from prompt 05.

### Workflow patterns

Six ways to arrange several agents inside a workflow. Prompt 08 uses three of them: fan out and synthesize (phase 03), loop until done (phase 05) and adversarial verification (phase 07).

#### 1. Classify and act

::diagram:08-pattern-1-classify-and-act::

**How it works:** one agent reads the task and sends it to exactly one specialised agent.

**When to use it:** tasks of different kinds that need different instructions. Example: incoming bug reports routed to a design, a copy or an accessibility agent.

#### 2. Fan out and synthesize

::diagram:08-pattern-2-fan-out-and-synthesize::

**How it works:** the task is split into independent parts, one agent per part works in parallel, and a final step merges the results.

**When to use it:** parts that do not depend on each other. Example: phase 03 of prompt 08 builds every page section with its own agent and puts them together in order.

#### 3. Adversarial verification

::diagram:08-pattern-3-adversarial-verification::

**How it works:** one agent produces a result, several agents with a fresh context try to break it, and their findings go back to the first agent.

**When to use it:** anything a program cannot check. Example: prompt 07, and phase 07 of prompt 08.

#### 4. Generate and filter

::diagram:08-pattern-4-generate-and-filter::

**How it works:** several agents produce many candidates, and a filter with a rubric removes duplicates and weak candidates.

**When to use it:** you need options rather than one answer. Example: ten headline variants for the hero, of which three reach the designer.

#### 5. Tournament

::diagram:08-pattern-5-tournament::

**How it works:** judge agents compare candidates in pairs, and winners advance until one is left.

**When to use it:** choosing between complete attempts when there is no numeric score. Example: four versions of the lineup section, compared two at a time.

#### 6. Loop until done

::diagram:08-pattern-6-loop-until-done::

**How it works:** an agent works, a check asks whether anything new was found, and a new round starts until nothing is.

**When to use it:** repairing until a check passes, or reviewing until a round finds nothing new. Example: prompt 05.

---

## Deploy and check the live page

```bash
npm run build
netlify deploy --prod --dir=dist
```

After deploying, compare the served page with the files in `dist`, and run `npm run check -- --url <address>` against the live address. A passing local check does not prove the live page is the same: a stale build, the wrong folder or markup added by the host can change it. Prompt 06 does both steps.

---

## Limits of automated checks

- Automated accessibility rules cover about 30 to 40% of WCAG. A pass means no known defect, not an accessible page.
- axe does not evaluate text over images or gradients. It marks those pairs *incomplete*, and a check whose rule is "zero violations" treats incomplete as a pass. Your checker must count incomplete as a failure.
- A screenshot comparison detects a change. It does not say whether the change is better.
- No check here evaluates whether the design itself is good.

---

## Common failures

| Symptom | Cause | Fix |
|---|---|---|
| The check turns green and nothing was fixed | The agent edited the check | Restore the check, then read the diff |
| Two wrong states, alternating | Two requirements that cannot both be true | Stop the loop. The contradiction is in the design or the brief |
| It keeps working after the task is done | Nothing runs the check first | Run the check before every fix |
| It gets slower and vaguer | The context is full | Write the state to `notes.md`, start a new session |
| "It works now" and it does not | The agent reports instead of measuring | Trust only the exit code of `npm run check` |
| Nothing happens for a long time | A step waits for input with no time limit | Give every step a time limit |

---

## After the workshop

Start with one check, not a whole page:

1. Choose a check your team does by hand.
2. Turn it into a program that exits with 0 or 1.
3. Write its output to a file an agent can read.
4. Only then put an agent in front of it.
