# guideline/ — the pre-workshop setup page

The page organisers email to participants a few days before WaysConf 2026. It is the only preparation
anyone gets, so it has to carry the whole of it: four accounts, one install, a browser-only route for
people who cannot or would rather not install anything, a self-test, and the questions that actually
get asked.

## Deploy

```bash
npx netlify deploy --prod --dir=guideline
```

That is the entire deploy. The folder is static: one HTML file, one stylesheet copied out of the design
system, and three font files. No build step, no framework, no bundler. Dragging the folder onto
<https://app.netlify.com/drop> does the same thing without a terminal.

The published address used in `README.md` is `https://turbine-workshop.netlify.app`.

## What is in here

| File | What it is |
|---|---|
| `index.html` | The page. Markup, styles and the small progressive-enhancement script, in one file. |
| `tokens.css` | `design/tokens/tokens.css`, copied verbatim. Never edited here — regenerate it upstream. |
| `fonts/*.woff2` | The same three faces the TURBINE site self-hosts, copied from `public/fonts/`. |
| `fonts/fonts.css` | `@font-face` for those three, with relative paths so the folder works from `file://`, from a Netlify drop and from a subdirectory. |

## Constraints this page holds itself to

- **No network requests.** No CDN, no Google Fonts, no analytics, no cookies. The only state it keeps is
  the account checklist, in the visitor's own `localStorage`, inside a `try`/`catch` so that blocked
  storage cannot break the page.
- **Works with JavaScript off.** The operating-system tabs fall back to three readable blocks, the copy
  buttons are hidden rather than broken, and every command is still on the page.
- **WCAG 2.2 AA**, the same bar the workshop project is held to: one `h1`, landmark regions, a skip link
  as the first focusable element, visible focus on everything focusable, and no colour pairing below
  4.5:1. `color.text.muted` (`#6B7280`) is the one token from `tokens.css` that never appears — it
  measures 4.07:1 on this background, which is exactly why the festival palette contains it.
- **Responsive from 390px.** No horizontal scroll at any width; code blocks scroll inside their own box.

## Updating it

Edit `index.html`. If `design/tokens/tokens.css` changes upstream, copy it again rather than editing the
copy:

```bash
cp design/tokens/tokens.css guideline/tokens.css
```

The facts on the page — date, time, room, venue, the repository address — are duplicated from the root
`README.md` and `docs/CANON.md`. If one of them moves, both files move.
