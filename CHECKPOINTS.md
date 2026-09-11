# Checkpoints

Six branches. Each one is the repository at a point in the workshop. If you fall behind, get stuck, or
want to skip ahead to the part you came for, you jump to the nearest one and carry on from there.

**Using a checkpoint is the normal path, not a failure.** It is the reason they exist and the reason
they were built and tested before the day. Nobody in this room is being assessed on typing speed, on
how quickly their agent converges, or on whether the conference wifi liked them. The subject of the
ninety minutes is the loop — a generator, a verifier that can say no, and the repair that follows.
You can see all of that from `step-3`. You cannot see any of it while you are still debugging a
missing dependency at minute forty.

The presenter will say the branch name out loud at the start of each section. If you hear one and you
are not there, jump.

---

## 1. The six checkpoints

| Branch | What the repository is at that point | What `npm run check` does there |
|---|---|---|
| **`step-0`** | The starter, exactly as the template ships it. The Astro project builds and serves a page with no sections on it. The design tokens, the brief, the content, the acceptance criteria and all nine gates are present and complete. Nothing has been built. | Everything fails, and the failures are the task list. This is the first demonstration of the session, not a broken state. |
| **`step-1`** | The page shell plus the first two sections: skip link, sticky nav, hero. Tokens wired into Tailwind, fonts self-hosted and loading, exactly one `h1`. | The build gate passes. Everything that counts sections — structure, content, links, visual, perf — still fails, because nine of the eleven are missing and the gates count them rather than take your word for it. |
| **`step-2`** | The ticker, the lineup and the programme built on top of `step-1`: twelve artist cards with a working day filter, and the three-days-by-three-stages timetable. | Same shape as `step-1`, with substantially fewer failures. That the failure count falls in a straight line is the thing worth noticing. |
| **`step-3`** | All eleven canonical sections present and in canonical order, and deliberately imperfect. Supporting copy uses `color.text.muted`; the sodium buttons use white text on orange. Both are real mistakes that real models make with this palette. | Structure, content and links pass. **The accessibility and token gates fail, genuinely**, and the report names the selector and the expected value. The visual diff also registers the wrong colours as changed pixels — without being able to tell you which direction is the improvement. This is the branch the self-repair section runs from. |
| **`step-4`** | The repairs applied, and nothing else changed. `text.muted` is back in the footer legal block where it belongs; the buttons use near-black on sodium. | Every local gate green. Deploy has not been run. |
| **`step-5`** | Built, deployed and confirmed live, with the evidence of the run that passed. | Green, including the deploy family. The URL recorded in this branch is the one deployed when the checkpoint was made; your own deploy produces your own URL. |

Two things worth stating plainly about `step-3`. The contrast failure is not staged and the numbers
are not rigged: `color.text.muted` (`#6B7280`) on `color.bg.base` (`#0A0B0D`) measures about 4.1:1
against a 4.5:1 requirement, and white on `color.accent.sodium` (`#FF6A1A`) measures about 2.9:1.
Both are recorded in [`design/tokens/CONTRAST.md`](design/tokens/CONTRAST.md), computed rather than
estimated. And a model handed this palette reaches for the muted grey almost every time, which is why
the palette was built this way. See [`docs/CANON.md`](docs/CANON.md) §8.

---

## 2. Where each checkpoint sits in the ninety minutes

The session runs 14:55 to 16:25. Times are approximate — the clock in the room is the presenter's —
but the block names are what you will hear.

| Block | Clock | Minute | You should have |
|---|---|---|---|
| 1. Why a loop needs something that can say no | 14:55 | 0 | a Codespace open, on `main` |
| 2. The brief, the criteria, and a page that fails everything | 15:05 | 10 | `npm run check` run once — **`step-0`** |
| 3. Design in, first sections out | 15:15 | 20 | nav and hero built by the agent — **`step-1`** by 15:30 |
| 4. Lineup and programme | 15:30 | 35 | twelve cards and the timetable — **`step-2`** by 15:45 |
| 5. Everything else, and the gates going red for real | 15:45 | 50 | all eleven sections, a11y and tokens failing — **`step-3`** by 15:55 |
| 6. Self-repair | 15:55 | 60 | the loop closing those failures — **`step-4`** by 16:10 |
| 7. Deploy, and proving what shipped is what passed | 16:10 | 75 | a live URL — **`step-5`** by 16:20 |
| 8. What the gates do not catch | 16:20 | 85 | nothing to do but listen |

The self-rescue rule, so you do not have to ask: **look at the clock, find the row, and if you are
not where that row says, check out the branch it names.** At 15:47 with no lineup on the page, the
answer is `git checkout step-2`. It takes fifteen seconds and you rejoin the room immediately.

---

## 3. Jumping to a checkpoint, in the terminal

Three lines. Read §4 first if you have work you care about.

```
git add -A
git commit -m "where I got to"
git checkout step-3
```

Then find out where you are:

```
npm run check
```

That writes `checks/report.md`, which is the honest answer to "what state is this in" for any branch,
including this one.

What each line does:

- `git add -A` marks every change you have made as part of the next commit
- `git commit -m "..."` saves them, permanently, with that message. This is what makes the jump safe
- `git checkout step-3` replaces the files in front of you with the checkpoint's version

The commit is not optional politeness. Without it, git will usually refuse to switch — it will not
overwrite changes you never saved — and you will get this:

```
error: Your local changes to the following files would be overwritten by checkout:
        src/sections/Lineup.astro
Please commit your changes or stash them before you switch branches.
```

That message is git protecting your work. Commit, then try again.

If you would rather not commit, `git stash` puts your changes aside and `git stash pop` brings them
back later. It works, and stashes are easy to forget you made. Prefer the commit.

One useful side effect: `loop/ralph.sh` refuses to start when the working tree is dirty, on purpose —
an unattended loop should always be something you can `git reset --hard` your way out of. The commit
you make before jumping also unblocks the loop.

---

## 4. What you lose, and what you keep

**You lose**, unless you committed first:

- your own version of any file the checkpoint also has a version of — in practice everything under
  `src/`
- any uncommitted edit, anywhere

**You keep**, always:

- every commit you made. They are still on your `main` branch, and `git checkout main` brings them
  all back exactly as they were
- your repository, your Codespace, your installed dependencies and the Chromium build Playwright
  uses — none of these are affected by switching branches
- your Netlify site and any URL you already deployed
- your agent session, your API sign-in, and anything in `.env`

The asymmetry is the point. A commit costs you five seconds and makes the jump completely reversible.

---

## 5. Two routes with no terminal at all

### 5.1 GitHub Desktop

1. **Fetch origin**, top right, so Desktop knows about the checkpoint branches.
2. If you have uncommitted changes, write a summary in the box at the bottom left and press
   **Commit to main**.
3. **Current Branch** dropdown → pick `step-3`.

To go back, the same dropdown → `main`.

### 5.2 A fresh Codespace on the branch

This needs no git at all, and it leaves your existing work entirely untouched — useful if you would
rather keep what you have and look at the checkpoint alongside it.

1. On your repository at github.com, click the branch dropdown (it says `main`) and select `step-3`.
2. Click the green **Code** button → **Codespaces** tab.
3. Click the **...** menu → **New with options...**
4. Set **Branch** to `step-3` → **Create codespace**.

The cost is another three-minute first boot. The benefit is that nothing you already have moves.
Remember to close or delete the extra Codespace afterwards.

---

## 6. Getting back to your own work, and building on a checkpoint

### Back to your work

```
git checkout main
```

Everything you committed is there, unchanged. `git checkout -` also works and means "the branch I was
on before this one".

### Carry on from the checkpoint instead

If the checkpoint is where you want to continue from, give your position a name of its own before you
start editing:

```
git switch -c mine
```

You are now on a branch called `mine`, starting from the checkpoint. Your commits go there, and
`step-3` stays untouched as a reference you can always return to. This is the tidy way to do it, and
it means your later `git checkout step-4` still works.

### If git says "detached HEAD"

You are looking at a specific commit rather than standing on a branch. Nothing is broken and nothing
is lost. Either `git switch -c mine` to name where you are, or `git checkout main` to leave. Ignore
the paragraph of explanation git prints; those two commands are the whole of it.

---

## 7. If the checkpoint branches are not there

```
error: pathspec 'step-3' did not match any file(s) known to git
```

This means "Include all branches" was not ticked when you created your repository from the template
(see [`docs/GITHUB-FOR-DESIGNERS.md`](docs/GITHUB-FOR-DESIGNERS.md) §4). Fix it by fetching the
branches straight from the workshop repository:

```
git remote add workshop https://github.com/hculap/waysconf-2026-agentic-loops.git
git fetch workshop
git checkout -b step-3 workshop/step-3
```

Once you have two remotes carrying the same branch names, plain `git checkout step-3` becomes
ambiguous and git will say so. Use the explicit form for each one you need:

```
git checkout -b step-4 workshop/step-4
```

Or skip all of it and use the fresh-Codespace route in §5.2, pointed at
`hculap/waysconf-2026-agentic-loops` rather than at your own repository.

---

## 8. After a jump

Run this, always:

```
npm run check
```

The report tells you the truth about the branch you landed on, and it is also how you confirm the jump
worked.

Two things that occasionally need attention:

**Missing packages.** If the build complains that something is not installed, run `npm install`. The
dependency list barely changes between checkpoints, so this is rare.

**A dev server pointing at the old build.** If `npm run dev` was already running when you switched,
stop it with `Ctrl + C` and start it again. Astro usually copes; when it does not, this is why.

Playwright's Chromium lives outside the project and survives every branch switch. You never need to
reinstall it.

---

## 9. The short version

```
git add -A && git commit -m "where I got to"    save what you have
git checkout step-3                             jump to a checkpoint
npm run check                                   find out where you are
git switch -c mine                              carry on from here, on your own branch
git checkout main                               go back to your own work
```

If any of the words in those lines are unfamiliar, [`docs/TERMINAL-IN-TEN-MINUTES.md`](docs/TERMINAL-IN-TEN-MINUTES.md)
covers the terminal and [`docs/GITHUB-FOR-DESIGNERS.md`](docs/GITHUB-FOR-DESIGNERS.md) covers the git
vocabulary. Neither is long, and neither is a prerequisite for using a checkpoint.
