# 07 — Try to break it

A review of the finished page by an agent that did not build it. The agent looks for problems
the checker from prompt 04 cannot catch, argues against each one, and reports only those that
survive. It adds to `npm run check`; it does not replace it.

## Before you paste

Start a new session, so the reviewer has not seen the page being built: open a new terminal,
go to the project folder (`cd turbine`) and start `claude` or `codex` there. An agent asked to
grade its own work in the same session remembers its reasons for every decision and defends
them; that is not a review.

---

```text
The checks pass. Now try to prove the page is still wrong.

You did not build this page. Judge it only by what a browser shows and what is in this
project, not by anything said earlier in this conversation.

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that the checker in this project cannot catch, and for each one
tell me:

- exactly which element, by what I would see on screen
- what is wrong with it
- why the checker missed it — what question does it ask that this slips past?

Look specifically where an automated check has no reach:

- text over a photograph or a gradient: an automated contrast check cannot compute that
  pair at all, and reports it as inconclusive rather than as a failure
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
are real, then paste:

```text
Fix findings 2 and 4. Leave the rest. Then run npm run check again — I want to know if
fixing them broke anything that was passing.
```

---

### If something goes wrong

| What you see | Say this |
|---|---|
| A finding with no specific element | `Name the element as I would see it on screen, or drop the finding.` |
| Five findings and nothing discarded | `How many candidates did you discard, and why?` If arguing against the findings removed none, it did not really happen. |
| It starts fixing | `Stop. No fixes yet. I decide which findings are real first.` |
| It mentions decisions made while building | You are still in the building session. Start a new one and paste the prompt again. |

---

### Why it is written this way

- A new session: a reviewer that did not build the page has nothing to defend.
- Find, then argue against each finding from three angles (is it true, does it matter, is it handled): you get what survives, not everything that was found.
- It looks where a program cannot: text over photos, reading order, alt text that is present and useless, widths between the ones the design specifies.
