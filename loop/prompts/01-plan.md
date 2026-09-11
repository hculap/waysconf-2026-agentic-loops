# 01 — Plan

Write the implementation plan for the TURBINE landing page. Write the plan only. Do not create, edit or
delete a single file, and do not write code, not even a sketch of a component.

Read first, and only the parts you need: `docs/CANON.md` §7, `brief/BRIEF.md` §4 and §7,
`brief/ACCEPTANCE.md`, `brief/CONTENT.md` §15, `design/FIGMA-SPEC.md` §5, `AGENTS.md`.

Produce one table, one section per row, in canonical order, with these columns:

```
| # | Section | File | Criteria | Copy | Design | Behaviour | Risk |
```

- **Section** — the canonical name, and the `data-section` value it will carry.
- **File** — the path you will create under `src/`.
- **Criteria** — every acceptance criterion id this section is responsible for satisfying.
- **Copy** — the `brief/CONTENT.md` section the strings come from.
- **Design** — the `design/FIGMA-SPEC.md` section that specifies the layout.
- **Behaviour** — the client-side behaviour, if any, and what it does with JavaScript disabled.
- **Risk** — the one thing most likely to go wrong here, in a few words.

Then, below the table, four short lists:

1. **Unowned criteria.** Every criterion from `brief/ACCEPTANCE.md` that no row above claims. Give the id
   and one line on where it will be satisfied instead. This list existing and being empty is the point of
   it; do not quietly drop the ones that belong to the layout or the build.
2. **Build order.** The order you will actually work in, which may differ from canonical order, and why.
3. **Assumptions.** Anything the brief left ambiguous, with the reading you chose. Do not stall on these
   and do not resolve them silently.
4. **Questions.** Anything you needed that is in none of the source files. Do not invent an answer.

Constraints:

- Keep it under two pages. A plan I cannot read in ninety seconds does not get read.
- Do not restate the brief back to me. Point at it.
- Do not propose anything on the out-of-scope list in `docs/CANON.md` §11.
- Do not propose a dependency that is not already in `package.json`.

Stop after the plan and wait. The plan is the cheapest place in this whole process to be corrected.
