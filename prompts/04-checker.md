# 04 — Write the checker

**This is the workshop.** Everything before it was getting a page onto a screen. Everything
after it depends on what happens here.

You are about to ask the agent to build the thing that will judge its own work — and then,
in the next prompt, forbid it from ever touching that thing again.

---

```text
Now write a program that checks your own work.

It must be a program, not an opinion. It runs, it looks at the real page in a real
browser, and it exits with code 0 if everything is right and a non-zero code if anything
is wrong. It never asks a language model anything, it never asks me anything, and it
gives the same answer twice on the same page.

Put it in check.mjs, and make "npm run check" run it. You may install Playwright and
@axe-core/playwright for this — that is the one exception to the no-new-packages rule.

It must check at least these, and it must check them against the page as a browser
actually renders it, not against the source code:

1. The site builds with no errors.
2. Loading the page produces no errors in the browser console.
3. Every section from the design is present, and in the right order.
4. Accessibility: zero axe-core violations, at 390, 768 and 1440 pixels wide.
5. Every colour the page paints is one of the colours in the design. Anything else is a
   failure, and the report says which colour and which element.
6. Every piece of text from the content file appears on the page.
7. Nothing sticks out sideways at 390 pixels — no horizontal scrollbar.
8. Every image has alt text, and it is not the filename.

When something fails, the report must say four things: what failed, where on the page,
what it expected, and what it found. "Contrast issue on the page" is useless. "The date
line in the hero is #6B7280 on #0A0B0D, which is 4.07 to 1, and body text needs 4.5" is
the whole job.

Write the report to check-report.md as well as printing it, because in the next step I am
going to hand that file straight back to you.

Two rules about the checker itself:

- If a check cannot run — the browser will not start, the page will not load — that is a
  FAILURE, never a pass and never a silent skip. A check that did not happen must not look
  like a check that succeeded.
- Do not make the checks lenient so that they pass. I am expecting this to fail. If it
  passes first time I will assume it is not checking anything.

When it is written, run it and show me the output.
```

---

**What you should see.** Red. Quite a lot of it.

That is the correct outcome and it is worth sitting with for a second. A page you were
fairly happy with two minutes ago has just been told, by a program, exactly what is wrong
with it — with element names and measured numbers.

Read three or four of the failures. Not to fix them; just to see what the report sounds
like when it is written well.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It passes first time | `I do not believe it. Show me what each check actually asserts, and prove one of them can fail — break something on purpose and run it again.` |
| Failures like "improve accessibility" | `That is advice, not a measurement. Every failure must name an element and give a number.` |
| It checks the source code instead of the page | `Check the rendered page in a browser, not the files. A class name in the source is not proof of a colour on the screen.` |
| It skips a check it could not run | `A check that did not run is a failure, not a skip. Change it so that anything unverified comes out red.` |
| It goes quiet for a long time | Installing a browser takes a few minutes on a first run. |

---

## Why this is the whole point

Ask a model whether its work is good and it will tell you. It will be articulate, specific,
and it will sound exactly the same whether the answer is true or not. You have no way of
knowing which time you got.

`check.mjs` cannot do that. It is a few hundred lines that open a browser, measure things,
and return a number. It has no opinion about whether you will like the page, it does not
know that the agent worked hard, and it will not be talked round.

That is what makes the next prompt work.

> **A loop is only worth building if something in it can say no without asking a language
> model for permission.**

One honest warning, because the checker will shortly start telling you the page is fine:
it is answering a narrower question than "is this page good". Automated accessibility
rules reach roughly 30–40% of what the standard actually requires. A colour check knows
nothing about whether the design works. Prompt 07 goes looking for the rest.
