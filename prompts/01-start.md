# 01 — Start

Creates an Astro and Tailwind project in the current folder and starts the development
server. No pages and no content yet.

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

**Expected result.** A few minutes of installing, then a line like
`Local http://localhost:4321/`. That address shows Astro's placeholder page. The agent keeps
the server running; you can keep typing to it in the same window.

**Codex asks whether it trusts the folder.** Answer yes. Codex does not work in a folder it
has not been told to trust.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It starts building a landing page | `Stop. Undo the pages you created. I want an empty project until I give you the design.` |
| `Not inside a trusted directory` | Codex is asking for permission. Answer yes. |
| `command not found: npm` | Node is not installed. Go back to the Preparation page. |
| It asks you to choose a template | `Pick the minimal or empty template. No example content.` |
| "The directory is not empty" | Something other than git's files is in the folder, for example the `design` folder. Move it out, run this prompt, put it back before prompt 02. |
| No output for two minutes | It is installing. Wait up to five minutes. |

---

### Why it is written this way

- "Do not build any pages yet": without it, the agent invents a hero, a feature grid and testimonials before it has seen the design.
- "Tell me in one line what each command is doing": the agent explains its own commands when asked.
