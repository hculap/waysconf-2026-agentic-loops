# 03 — Write the checker first

The agent writes `npm run check`: a program that tests the page in a real browser against
`design/data` and writes a report file. It writes it before the page exists.

Writing the test before the code is called test-driven development. The check comes first and
fails, because there is nothing to check yet. Prompt 04 then builds the page, and prompt 05
fixes it until the check passes.

## Before you paste

Switch to plan mode, as before prompt 02. Claude Code: `Shift+Tab` until the footer shows
*plan mode on*. Codex: `/plan`. When you approve the plan in Claude Code, choose **Yes,
auto-accept edits**.

---

```text
Plan first. Research what you need, then show me a plan and wait for my approval. Do not
create or change any file until I approve it.

Now write a program that checks the page against the design, before the page exists.

It must be a program, not an opinion. It runs, it looks at the real page in a real
browser, and it exits with code 0 if everything is right and a non-zero code if anything
is wrong. It never asks a language model anything, it never asks me anything, and it
gives the same answer twice on the same page.

Make "npm run check" run it. Install whatever you need to drive a real browser and to
test accessibility. These are tools for checking; none of them goes into the page.

By default it builds the site and serves the built files itself, and checks that page. It
must not depend on a development server someone else started. It must also take an address —
npm run check -- --url https://… — and run the same checks against that page instead, so
that later it can judge the live site too.

Derive what to check from design/data, not from me. There is no page to look at yet: every
check comes from the design. At minimum it must decide, against the page as a browser
actually renders it rather than against the source:

1. that the project builds, with no errors
2. that loading the page produces no errors in the browser console
3. that every section the design defines is present, and in the order the design gives
4. that it is accessible, at every width the design specifies
5. that every colour the page paints is one the design defines — anything else fails
6. that every piece of copy in the design appears on the page
7. that nothing overflows sideways at the narrowest width the design specifies
8. that every image has alt text, and that it is not the filename

When something fails, the report must say four things: what failed, where on the page,
what the design says it should be, and what was actually there. "Contrast issue on the
page" is useless. Naming the element, the expected value, the measured value and the
threshold is the whole job.

Write the report to a file as well as printing it, because later I am going to hand that
file straight back to you. Tell me what you called it.

Three rules about the checker itself:

- If a check cannot run — the browser will not start, the page will not load,
  design/data is missing — that is a FAILURE, never a pass and never a silent skip. A
  check that did not happen must not look like a check that succeeded.
- An accessibility result marked incomplete, such as text over a photo or a gradient, is
  not a pass. Measure the contrast from the rendered pixels behind that text, and fail only
  if the measured ratio is below the threshold, or if it cannot be measured.
- Do not make the checks lenient so that they pass.

Your plan must list each check, what it reads from design/data, and how it measures.

There is no page yet. When the checker is written, run it now against the project as it is:
it must fail, and the report must say why. A check that passes on an empty page is not
checking anything.

Then commit everything with a message that says what this step did, and push. Tell me the
step is done, so I can clear the session.
```

---

**Expected result.** First, a plan: the checks, what each reads from `design/data`, how it
measures, which tools it installs and the name of the report file. Approve it or correct it.
Then the checker is written and run against the empty project. It fails, and the report says
why for each check: sections missing, copy missing, and so on. Then a commit, pushed.

How to tell a checker that fails on purpose from a broken one:

- **Working:** a report file exists and lists each check with where, expected and actual.
- **Broken:** an error with file paths and line numbers, and no report file.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It writes code before showing a plan | Press Esc, then say `Stop. Show me the plan first and wait for my approval.` |
| It passes on the empty project | `It passed with no page. Show me which checks ran and what each one measured.` |
| It wants to build a page first, so the check has something to test | `No page in this step. The check must fail on the project as it is.` |
| A check is skipped | `A check that cannot run is a failure. Make it fail and say why it could not run.` |
| A contrast result is marked incomplete (text over a photo or gradient) | `Measure that contrast from the rendered pixels behind the text. Fail only if the ratio is below the threshold or it cannot be measured.` |
| The report says "contrast issue" with no details | `Every failure needs the element, the expected value, the measured value and the threshold.` |
| It takes values from its own idea of the design | `Every check reads its values from design/data. Show me where each one comes from.` |
| It asks which testing library to use | `Your choice. Pick one that drives a real browser and tests accessibility.` |
| Codex asks to use the network | Answer yes. Installing the browser and the accessibility tools needs it. |
| The report says the page will not load | `The checker must build the site and serve it itself. Do not rely on a development server.` |
| `npm run check -- --url https://example.com` does nothing different | `The checker must accept --url and run the same checks against that address.` |
| It is 15:50 and the checker is broken (an error, no report file) | Press Esc. If the footer says plan mode, press Shift+Tab until it does not (Codex: leave /plan with /plan again or Esc). Download **checker.zip** from the workshop page and tell the agent: `Unzip checker.zip from my Downloads folder into this project, follow RESCUE.md inside it, and commit.` It contains its own `design/data`, which replaces yours. Then `/clear` and prompt 04. In a Codespace, drag the zip from your computer into the file list on the left, then say `Unzip checker.zip in this project, follow RESCUE.md inside it, and commit.` |

---

### Why it is written this way

- Tests first: the check is written from the design before any page exists, so it cannot be shaped to fit what was built.
- A program, not an opinion: exit code 0 or not, the same answer on every run, no language model involved.
- An incomplete result is not a pass: accessibility tools report text over a photo or gradient as "incomplete". The checker measures the rendered pixels behind that text, and fails only when the ratio is too low or cannot be measured; otherwise a rule of "zero violations" would pass it unseen, or a rule of "incomplete fails" would never let the page pass.
