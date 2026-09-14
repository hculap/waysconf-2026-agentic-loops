# 01 — Start

Empty folder in, a website running on your own machine out. Nothing is designed yet; this
is just the workbench.

---

```text
Set up a new website project in this folder.

Use Astro with Tailwind CSS. Static output — no React, Vue or Svelte, no server, no
database. Node is already installed.

Then start the development server and tell me the address to open in my browser.

Do not build any pages yet. Do not invent any content. The design comes next, and I want
the page to still be empty when it does.

While you work, tell me in one line what each command is doing. I have not used a terminal
before and I would like to follow along.
```

---

**Codex will ask whether it trusts this folder.** Say yes. It refuses to work in a directory it has not been told about, which in a brand-new empty folder means the very first thing it does is stop and ask. That is the tool being careful, not something going wrong.

**What you should see.** A few minutes of installing, then a line like
`Local http://localhost:4321/`. Open it. You get Astro's placeholder page — plain, ugly,
correct.

**The terminal is now busy.** That window is running the site and will not take another
command. Leave it alone and open a second one. In Claude Code and Codex you can simply
keep talking; they handle it.

---

### If it goes wrong

| What you see | Say this |
|---|---|
| It starts building a landing page anyway | `Stop. Undo the pages you created. I want an empty project until I give you the design.` |
| `Not inside a trusted directory` | This is Codex asking permission. Answer yes, or run `git init` in the folder first. |
| `command not found: npm` | Node is not installed. Follow the setup page, or switch to the browser option on it. |
| It asks you to choose a template | `Pick the minimal or empty template. No example content.` |
| "The directory is not empty" | You put the design folder in before this prompt. Move it out, run this prompt, then put it back for prompt 02. |
| Nothing happens for two minutes | It is installing. Installing looks exactly like being stuck. Give it five. |

---

### Why it is worded like that

**"Do not build any pages yet."** Left to itself an agent will fill the silence — it will
invent a hero, a features grid and three testimonials before you have said a word about
what you want. Saying what *not* to do is half of prompting, and it is the half people
leave out.

**"Tell me in one line what each command is doing."** You can ask for this. The agent is
not only a machine that produces files; it is the only patient explainer you will have all
afternoon.
