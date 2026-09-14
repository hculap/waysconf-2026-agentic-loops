# 07 — Try to break it

Your checker is green. That means *no known defect* — it has never meant finished.

This prompt goes looking for what the checker structurally cannot see. It is a model
checking a model, which makes it the least reliable thing you will do today, and it is
still worth doing, because the alternative is not looking.

---

```text
The checks pass. Now try to prove the page is still wrong.

Your job now is to attack, not to defend and not to fix. Find five things that
are wrong with this page that your checker cannot catch, and for each one tell me:

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

**What you should see.** A short list, several items of which are genuinely worth fixing —
and at least one that is wrong, or that you disagree with. Both outcomes are the lesson.

Pick the two you believe and say:

```text
Fix findings 2 and 4. Leave the rest. Then run npm run check again — I want to know if
fixing them broke anything that was passing.
```

---

### Why you make it argue with itself

A reviewer asked to "find problems" finds problems — it will produce five, because you
asked for five. A reviewer asked to *destroy a specific claim* either destroys it or fails
to, and failing to is information.

The three angles are doing the job a second person would do. It is weaker than a second
person and much better than nothing, and it costs one paragraph.

### Where self-assessment is fine, and where it is not

| Fine | Not fine |
|---|---|
| Is this sentence any good | Is this correct |
| Which of these five findings matters most | Is this accessible |
| Does this read as the same brand | Does this match the design |
| Is the hierarchy clear | Is it finished |

The left column has no external truth to check against, so a thoughtful opinion is the
best instrument available. The right column has one — so use it, and do not accept an
opinion instead.

This prompt lives entirely in the left column. That is why it produces a list for you to
triage, and never a verdict.

---

### One real example

While this workshop was being built, the accessibility check was green. Zero violations,
three widths, twice in a row, perfect Lighthouse score.

Five of the nine pieces of text in the hero were below the legal contrast minimum against
the photograph behind them. The largest, first, most-read text on the page.

The checker was not broken and it was not lying. axe does not evaluate text over a
background image — it reports the pair as *incomplete*, and in a gate whose rule is "zero
violations", incomplete is indistinguishable from correct.

Nothing in the source would have told you either. The background there was a photograph,
two translucent overlays and a gradient composited together, and no line of CSS anywhere
says what colour that comes out as. It took a person deciding to look.

**Green means no known defect. Knowing where your checks stop is the job.**
