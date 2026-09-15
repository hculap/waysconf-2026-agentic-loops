# 07 — Try to break it

A review of the page by an agent that did not build it. The agent looks for problems the
checker from prompt 03 cannot catch, argues against each one, and reports only those that
survive. You choose which to fix; the agent fixes them, runs `npm run check` again, commits,
pushes and deploys again to the site from prompt 06. The review adds to `npm run check`; it
does not replace it.

The page is already live after prompt 06. If time runs out, skip this prompt: the address you
have stays.

## Before you paste

Type `/clear`, so the reviewer has not seen the page being built. An agent asked to grade its
own work in the same session remembers its reasons for every decision and defends them; that
is not a review. The page is reviewed on this machine; the agent starts the development server
if it is not running.

---

```text
Whatever npm run check says right now, try to prove the page is wrong.

You did not build this page. Judge it only by what a browser shows and what is in this
project, not by anything said earlier in this conversation.

Look at the page on this machine. If the development server is not running, start it yourself
and give me the address.

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that the checker in this project cannot catch, and for each one
tell me:

- exactly which element, by what I would see on screen
- what is wrong with it
- why the checker missed it — what question does it ask that this slips past?

Look specifically where an automated check has no reach:

- text over a photograph or a gradient: an accessibility tool cannot compute that pair and
  marks it incomplete; the checker in this project may measure it from the pixels, so look
  at what it actually measured there
- reading order for someone using a keyboard or a screen reader: technically valid and
  incoherent is a thing that exists
- alt text that is present, and useless
- a heading structure that looks like a hierarchy and is not one
- copy that passes every rule and still does not sound like the brand
- what happens at a width between the ones the design specifies — one nobody screenshotted
- anything that only breaks on the second visit, or with a slow connection

Before you tell me any of them, argue against each one yourself, from three angles:

  is it true      - go and look again, do not trust your first reading
  does it matter  - would a visitor notice, or only a checklist?
  is it handled   - is it already covered somewhere I have not looked?

Report only the findings that survive all three. Default to discarding when you are
unsure, and tell me how many you threw away. Four real findings beat five with a guess in
them. If you cannot point at a specific element, it is not a finding.

Do not fix anything yet. I want to decide which of these are real first.
```

---

**Expected result.** Up to five findings, each with the element, the problem and why the
checker missed it, plus the number of candidates the agent discarded. Decide which findings
are real. Then type `Fix findings` and the numbers you chose, press Shift+Enter for a new line,
and paste the block below:

```text
Fix only the findings I listed above. Leave the rest. Then run npm run check again: I want
to know if fixing them broke anything that was passing. If it exits 0, commit everything
with a message that says which findings were fixed, and push. If it exits non-zero, tell me
which failures are new since your fixes, then commit and push anyway. Then deploy again to
the same site with netlify deploy --prod --dir=dist --site <the site name in notes.md>, and
run npm run check -- --url against the live address.
```

The agent fixes the chosen findings, runs the check, commits and pushes, deploys again to the
site from prompt 06 and runs the check against the live address.

**After this prompt: type `/clear`.**

---

### If something goes wrong

| What you see | Say this |
|---|---|
| A finding with no specific element | `Name the element as I would see it on screen, or drop the finding.` |
| Five findings and nothing discarded | `How many candidates did you discard, and why?` If arguing against the findings removed none, it did not really happen. |
| It starts fixing before you chose | Press Esc, then say `Stop. No fixes yet. I decide which findings are real first.` |
| It mentions decisions made while building | The session was not cleared. Type `/clear` and paste the prompt again. |
| The development server is not running | `Start the development server yourself and give me the address.` |
| A fix makes a check fail that passed before | `That fix broke a check that passed before. Undo that fix, tell me why it broke the check, and do not change the checker.` |
| It cannot find the site name | `The site name from prompt 06 is in notes.md. If it is not there, run netlify status and use that site.` |

---

### Why it is written this way

- A new session: a reviewer that did not build the page has nothing to defend.
- Find, then argue against each finding from three angles (is it true, does it matter, is it handled): you get what survives, not everything that was found.
- It looks where a program cannot: text over photos, reading order, alt text that is present and useless, widths between the ones the design specifies.
