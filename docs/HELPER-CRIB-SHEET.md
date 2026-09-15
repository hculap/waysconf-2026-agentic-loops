# Helper crib sheet

One page. Print it. You do not need to know the material — you need to recognise
these ten situations and say the right sentence.

**The golden rule:** nobody waits more than two minutes. If you cannot fix it in two
minutes, move them to a rescue pack or to Codespaces and keep them in the room
rather than in a setup problem.

---

## The two rescues that solve most things

**Rescue A — skip forward.** They have fallen behind. Prompts 02 to 05 build on each other,
so skipping a step means taking its result from a rescue pack on the workshop page: at
15:30, `design-data.zip` replaces prompt 02; at 15:50, `checker.zip` replaces
prompt 03 and brings its own `design/data`. The last row of the table in prompt 02 and in
prompt 03 has the exact words to say. A half-built page with a working checker teaches more
than a finished page with none.

```text
Press Esc, then say to their agent:
  Stop. Commit what you have and push.
Then type /clear and paste the next prompt.
```

At 16:08 (prompt 04) and 16:16 (prompt 05) the last row of the prompt's table says
the same. The current prompt number is always on the slide in the corner. Reassure them
that moving on is the designed path, not giving up.

**Rescue B — move to the browser.** Their local setup is fighting them. Stop fighting
it.

On the repository page on github.com: green **Code** button → **Codespaces** tab →
**Create codespace on main**. Three minutes on first boot, everything pre-installed.
They lose nothing; they can copy their work across later.

---

## The things that actually happen

| What they say | What it is | What you say |
|---|---|---|
| "command not found: npm" | Node is not installed | Rescue B. Do not install Node during the session. |
| "command not found: claude" / "codex" | Agent CLI not installed | `npm install -g @anthropic-ai/claude-code` or `npm install -g @openai/codex`. If that fails, Rescue B. |
| "It says permission denied" on npm install -g | Global install without permission | Rescue B. Do not start using sudo in a workshop. |
| "It's asking me to log in and nothing happens" | Browser did not open, or a captive portal | Have them open any http page first to clear the portal, then re-run. The CLI prints a URL — they can paste it into a browser by hand. |
| "npm run dev did nothing" | It did work; it is waiting | Point at the `localhost:4321` line. That is the site. Leave that terminal alone and open a second one. |
| "My terminal won't take any more commands" | A server is running in it | That is correct. Open a second terminal. Ctrl+C only if they want to stop the server. |
| "Everything is red" | `npm run check` is doing its job | Correct and expected. That is the task list, not an error. |
| "The agent says it's done but the check still fails" | The exact thing the talk is about | Say so: this is a good moment, not a problem. Have them tell the agent `Run npm run check and paste the last five lines, unedited.` |
| "It changed the tests" | The agent edited its own checker | Have them say `Restore the checker exactly as it was and fix the page instead.`, and tell them: this is the failure mode on the slide. |
| "Where does the .fig go?" | Prompt 02 reads it from a `design` folder in the project | Once prompt 01 has created the project, make a folder called `design` in it and put `turbine.fig` there. Not before: prompt 01 needs an empty folder. |
| "The agent is installing things" or "Codex wants the network" | It is decoding the `.fig` | Normal. Say yes, the room has network. |
| "Claude keeps asking me to approve commands" | Decoding the `.fig` is dozens of small commands | Say yes, and choose the option that stops it asking again for that kind of command. |
| "Every artist card has the same name" | The agent read the component, not the instances | Have them tell it: resolve the component properties and overrides. The row is in prompt 02. |
| "It's describing a tiny blurry page" | It read `thumbnail.png` inside the `.fig` | Have them tell it: work from `canvas.fig`, not the preview. |

---

## Things to say, and not say

**Say:** "That is the normal path, not a failure." Rescue packs are a designed feature.
People who feel behind stop participating.

**Say:** "Leave it red for now." Half the failures clear themselves when an earlier one
is fixed. Chasing failure number 14 before number 1 wastes the session.

**Do not say:** "It works on mine." Move them to Codespaces instead.

**Do not** take their laptop and type for them unless they ask. Hands on the keyboard
is the entire value of the session.

---

## When to interrupt the speaker

Only these:

- More than about five people are stuck on the same thing. That is a room problem and
  the agenda needs to change.
- The wifi is gone.
- Nobody can sign in to an agent — that means an outage, and the session moves to the
  pre-recorded fallback.

Everything else, handle quietly.

---

## What "done" looks like

`npm run check` exits 0, prompt 06 deploys the page to Netlify, and they get a URL. That URL goes on the shared board. That is the finish line.
