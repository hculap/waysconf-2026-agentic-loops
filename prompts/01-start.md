# 01 — Start

Creates an Astro and Tailwind project in the repository folder, starts the development server,
and commits the project to your GitHub repository. No pages and no content yet.

## Before you paste

Open a terminal, go into your project folder and start your agent:

```bash
cd turbine
claude
```

With Codex, type `codex` instead of `claude`. If `cd turbine` says there is no such folder, type
`ls` and look for `turbine` in the list.

**Esc stops the agent mid-task.** Ctrl+C twice closes it; start it again with
`claude --continue` or `codex resume --last`.

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

Then commit everything with a message that says what this step did, and push. Tell me the
step is done, so I can clear the session.
```

---

**Expected result.** A few minutes of installing, then a line like
`Local http://localhost:4321/`. That address shows Astro's placeholder page. The agent keeps
the server running. Then it commits the project and pushes it: the commit is visible in your
repository on github.com.

**The agent asks before it runs a command.** Choose the option that allows this kind of
command without asking again. **Codex also asks whether it trusts the folder.** Answer yes.

**After this prompt: type `/clear` and press Enter.** `/clear` ends the conversation and
starts a new one with an empty context, in Claude Code and in Codex. Nothing is lost: the
next prompt reads what it needs from the files in the project.

---

### If something goes wrong

| What you see | Say this |
|---|---|
| It starts building a landing page | Press Esc, then say `Stop. Undo the pages you created. I want an empty project until I give you the design.` |
| It asks before a command | Choose the option that allows this kind of command without asking again. |
| `Not inside a trusted directory` | Codex is asking for permission. Answer yes. |
| Codex asks to use the network | Answer yes. Installing packages and pushing need it. |
| `command not found: npm` | Node is not installed. Go back to the Preparation page. |
| It asks you to choose a template | `Pick the minimal or empty template. No example content.` |
| "The directory is not empty" | Something other than git's files is in the folder, for example the `design` folder. Move it out, run this prompt, put it back before prompt 02. |
| No output for two minutes | It is installing. Wait up to five minutes. |
| `git push` fails or asks for a password | Run `gh auth status` in a new terminal window (any folder). If it is not signed in, repeat Sign in from the Preparation page, then say `Push again.` |

---

### Why it is written this way

- "Do not build any pages yet": without it, the agent invents a hero, a feature grid and testimonials before it has seen the design.
- A commit at the end of every step: each step is saved in the repository, and any later step can be undone back to it.
- `/clear` between steps: every prompt starts with an empty context and reads the state from files, not from a long conversation.
