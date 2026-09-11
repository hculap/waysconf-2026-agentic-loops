# Helper crib sheet

One page. Print it. You do not need to know the material — you need to recognise
these ten situations and say the right sentence.

**The golden rule:** nobody waits more than two minutes. If you cannot fix it in two
minutes, move them to a checkpoint branch or to Codespaces and keep them in the room
rather than in a setup problem.

---

## The two rescues that solve most things

**Rescue A — jump to a checkpoint.** They have fallen behind. Their work is not lost;
it is just not where the room is.

```bash
git stash              # park whatever they have
git checkout step-3    # or whichever step is on the screen
npm install            # only if it complains about a missing package
```

The current step number is always on the slide in the corner.

**Rescue B — move to the browser.** Their local setup is fighting them. Stop fighting
it.

On the repository page on github.com: green **Code** button → **Codespaces** tab →
**Create codespace on main**. Three minutes on first boot, everything pre-installed.
They lose nothing; they can copy their work across later.

---

## The ten things that actually happen

| What they say | What it is | What you say |
|---|---|---|
| "command not found: npm" | Node is not installed | Rescue B. Do not install Node during the session. |
| "command not found: claude" / "codex" | Agent CLI not installed | `npm install -g @anthropic-ai/claude-code` or `npm install -g @openai/codex`. If that fails, Rescue B. |
| "It says permission denied" on npm install -g | Global install without permission | Rescue B. Do not start using sudo in a workshop. |
| "It's asking me to log in and nothing happens" | Browser did not open, or a captive portal | Have them open any http page first to clear the portal, then re-run. The CLI prints a URL — they can paste it into a browser by hand. |
| "npm run dev did nothing" | It did work; it is waiting | Point at the `localhost:4321` line. That is the site. Leave that terminal alone and open a second one. |
| "My terminal won't take any more commands" | A server is running in it | That is correct. Open a second terminal. Ctrl+C only if they want to stop the server. |
| "Everything is red" | `npm run check` is doing its job | Correct and expected. That is the task list, not an error. |
| "The agent says it's done but the check still fails" | The exact thing the talk is about | Say so — this is a good moment, not a problem. Have them paste `checks/report.md` back to the agent. |
| "It changed the tests" | The agent edited `checks/` | `git checkout checks/` to restore, and tell them: this is the failure mode on the slide. |
| "My Figma is free and the MCP thing won't connect" | Expected | Route A: the design is in `design/export/` and `design/tokens/`. Nothing is blocked. |

---

## Things to say, and not say

**Say:** "That is the normal path, not a failure." Checkpoints are a designed feature.
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

They run `npm run check`, it prints green, they run `npm run deploy`, and they get a URL. That URL goes on the shared board. That is the finish line.
