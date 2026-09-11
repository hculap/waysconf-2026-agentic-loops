# GitHub for designers

Why a design workshop has a GitHub account in the prerequisites, what the nine words mean, and the
exact clicks for the three things you have to do on the day.

You can finish this workshop without typing a single `git` command. That is a deliberate property of
how it is set up, not a concession. §8 says what the alternatives are.

---

## 1. Why this is here at all

Four reasons, in ascending order of how much they matter today.

**Version history you did not have to remember to make.** Figma keeps a version history for you and
names it by timestamp. A repository keeps one too, except that you decide when a version begins and
you write the sentence that describes it. "Lineup section, twelve cards, filter working" is a more
useful thing to scroll back through than "Edited 14:32".

**Named saves rather than a wall of autosaves.** The unit of history here is a **commit**: a snapshot
of every file, with a message attached. It is the equivalent of the moment you duplicate a page and
call it `v3 — client asked for bigger type`, done properly and without the duplicate.

**A shared source of truth.** One address that holds the design tokens, the copy, the acceptance
criteria, the verifier and the site. When the agent reads `docs/CANON.md` it is reading the same file
you are. Nothing in this workshop lives in somebody's downloads folder.

**And the one that actually matters today: it is the thing your deploy reads from.** Netlify does not
publish your laptop. It publishes a folder of built files, and it gets that folder either from a
repository it is connected to or from a command you run against a repository you have checked out.
Either way, **what is on the internet is a function of what is committed.** That is the sentence to
hold on to. It is also the reason the workshop insists on a repository of your own rather than a
shared one: your deploy has to read from something you control.

---

## 2. The minimum model

Nine words. You will use five of them, and the last column says which five.

| GitHub calls it | The nearest thing you already have | What it is here | On the day |
|---|---|---|---|
| **Repository** | the project file, plus its entire history and settings | one folder, tracked: `src/`, `checks/`, `design/`, `brief/`, everything | **yes** |
| **Commit** | a version you named yourself | a snapshot of every file plus a one-line message | **yes** |
| **Branch** | duplicating a page to try something without touching the original | `main` is yours; `step-0` … `step-5` are the workshop's checkpoints | **yes** |
| **`main`** | the master artboard everything is compared against | the branch your Netlify site publishes from | **yes** |
| **Template** | duplicating a starter file | how you get your own copy of this repository | **yes** |
| **Push** | pressing Share, and meaning it | sending your commits from your machine up to GitHub | only if you want the tick in §9 |
| **Fork** | — | a copy that stays attached to the original, for proposing changes back | no — §4 says why not |
| **Clone** | downloading the file to work on it locally | putting a repository on a machine; Codespaces does this for you | no, it happens for you |
| **Pull request** | a share link with a comment thread, attached to a proposed change | a proposed change, with a comment thread | no |

Two clarifications that save arguments later.

A commit is not a backup and not an autosave. Nothing is committed until somebody says so, and
everything in a commit is deliberate. This is the point. History you can read is history somebody
chose to write.

A branch is not a copy of the folder sitting next to the original. It is a name for a line of work,
and switching branches changes the files in front of you in place. This surprises people the first
time and is the whole subject of [`../CHECKPOINTS.md`](../CHECKPOINTS.md).

---

## 3. What you can safely ignore today

Genuinely ignore. None of it appears in the ninety minutes, and every one of them is the reason
somebody decided git was not for them:

- merge conflicts, `rebase`, `cherry-pick`, `reset --hard`, the reflog
- stashing, tags, releases, submodules, `.gitignore` rules
- signing commits, protected branches, code owners, review requirements
- Issues, Projects, Discussions, Wikis
- what GitHub Actions is doing on your push (§9 tells you the one thing worth knowing)
- squash versus merge versus rebase merge

If you take a copy, open a Codespace, let the agent work, and deploy, you will not meet any of them.

---

## 4. Template, fork, clone — and why this workshop uses a template

These three get confused constantly, and picking the wrong one costs ten minutes you do not have.

**Template — "give me a new project that starts where this one ends."** You get a brand-new
repository, owned by you, with its own history beginning at a single commit. It carries no ongoing
relationship to the original. You can make it private. Nothing you commit is a proposal to anybody.

**Fork — "I want to suggest changes to somebody else's project."** You get a copy that stays attached
to the original. GitHub will keep offering to sync it with upstream and to open pull requests back to
`hculap/waysconf-2026-agentic-loops`. That attachment is precisely the point of a fork, and precisely
what you do not want here — your TURBINE page is not a contribution to the workshop material, it is
your own work. A fork of a public repository is also public.

**Clone — "put a copy of this repository on this machine."** Not a GitHub-side concept at all; it is
the local step. In a Codespace it happens for you and you never see it.

So: **template.** Your repository, your history, private if you want it, no upstream asking questions,
and Netlify connects to it without ambiguity about which repository it is watching.

One detail in the template flow is easy to miss and expensive to miss: **"Include all branches."** The
workshop checkpoints `step-0` through `step-5` are branches. Without that box ticked you get only
`main`, and [`../CHECKPOINTS.md`](../CHECKPOINTS.md) has nothing to jump to. It is recoverable (that
document says how) but it is one tick now against three minutes later.

---

## 5. Click path: take your own copy of the workshop repository

Do this before the day if you can. It takes under a minute.

1. Open **`https://github.com/hculap/waysconf-2026-agentic-loops`** and sign in.
2. Click the green **Use this template** button, top right, then **Create a new repository**.
3. **Owner**: your own account.
4. **Repository name**: anything. `my-turbine` is fine.
5. **Tick "Include all branches".** This is the one people miss. See §4.
6. **Public** or **Private**: either works. Private is fine — Codespaces and Netlify both handle
   private repositories on the free plans.
7. **Create repository**.

GitHub copies the files and drops you on your new repository. The address bar now says your username,
not `hculap`. From here on, everything you do happens in your copy and nothing you do can affect the
original.

---

## 6. Click path: open it in a Codespace

1. On **your** repository, click the green **Code** button.
2. Choose the **Codespaces** tab.
3. Click **Create codespace on main**.

A new browser tab opens with VS Code in it. First boot takes roughly three minutes, because
`.devcontainer/setup.sh` is installing the project dependencies, the Chromium build the gates need,
both agent CLIs and the Netlify CLI. Let it finish. You will see it working in the terminal panel.

When it is ready:

- the **terminal** is the panel along the bottom; if it is hidden, the hamburger menu at top left →
  **Terminal** → **New Terminal**
- `npm run dev` starts the site on port **4321**, which the Codespace forwards automatically. A
  notification offers to open it; the **Ports** tab at the bottom has the link if you dismiss it
- `npm run check` runs every gate and writes `checks/report.md`

Three practical notes.

**A Codespace is a real computer, and it keeps running.** Close the tab and it suspends by itself
after a period of inactivity; your files are still there when you come back. You can stop it
deliberately from **github.com/codespaces**, which is also where you delete it afterwards.

**The free plan is more than enough.** GitHub's free tier includes a monthly Codespaces allowance,
and a ninety-minute session on the two-core machine this repository asks for is a small fraction of
it. Delete the Codespace when you are done if you would rather not think about it.

**You need no terminal knowledge to get this far.** If the terminal panel is unfamiliar, read
[`TERMINAL-IN-TEN-MINUTES.md`](TERMINAL-IN-TEN-MINUTES.md) — the five things you need to know, and
every command this workshop asks you to type.

---

## 7. Click path: connect it to Netlify

There are two honest routes to a live URL, and they are good at different things.

### 7.1 In the room: the CLI

This is what the workshop does on the day, because on conference wifi with thirty laptops it is the
one that reliably works. From the terminal in your Codespace:

```
npm run build
npx netlify login
npm run deploy
```

`npm run deploy` is this project's name for `netlify deploy --prod --dir=dist`, reached through `npx`,
which is why nothing has to be installed first. It is the name the rest of this repository uses for the
deploy as well, so you will not meet a second spelling of it.

`netlify login` prints a URL. Open it, authorise, come back to the terminal — it is waiting. Then
`deploy` asks whether to create a new site or use an existing one; create a new one. It prints a
public URL, and that URL is the thing you came here for.

If the browser sign-in is awkward, there is a token route: Netlify → your avatar → **User settings** →
**Applications** → **Personal access tokens** → **New access token**, then set it in the terminal. The
line depends on which shell you are in:

```
export NETLIFY_AUTH_TOKEN=your-token-here          Codespace, macOS, Git Bash, WSL
$env:NETLIFY_AUTH_TOKEN = "your-token-here"        PowerShell on Windows
```

The `$` in the PowerShell line is part of the variable's name and is typed; it is not a prompt. The
token is a secret; `.env` is already in `.gitignore`, and a token never belongs in a commit.

### 7.2 Afterwards: connect the repository, deploy on every push

This is the arrangement that makes "what is on the internet is a function of what is committed"
literally true. Worth setting up after the workshop.

1. Sign in at **`https://app.netlify.com`**.
2. Click **Add new site** (some accounts now read **Add new project** — Netlify has been renaming
   this; it is the same button) → **Import an existing project**.
3. Choose **Deploy with GitHub**. Authorise Netlify if asked.
4. Netlify asks which repositories it may see. Grant access to your `my-turbine` repository
   specifically rather than to everything; this installs the Netlify GitHub App on that repository.
5. Pick your repository from the list.
6. Build settings:
   - **Branch to deploy**: `main`
   - **Base directory**: leave empty. This repository's root *is* the Astro project — there is no
     `site/` subfolder
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
7. **Deploy**.

If the first build fails on a Node version, add an environment variable under **Site configuration** →
**Environment variables**: `NODE_VERSION` set to `22`. The project needs Node 20.11 or newer and is
developed on 22.

From then on, every push to `main` rebuilds and republishes, and every pull request gets its own
preview URL.

---

## 8. Three legitimate on-ramps, and none of them is the CLI

The git command line is one interface to git, not the thing itself. All three of these are real.

**The GitHub web UI.** You can browse every file, read history, switch branches from the dropdown,
edit a file and commit it with a message, all in the browser. For this workshop it covers taking a
copy, opening a Codespace, and reading what changed. It is also the fastest way to look at a
checkpoint branch without disturbing anything you have.

**GitHub Desktop** (`desktop.github.com`, free, macOS and Windows). A window with your changed files
on the left, the diff on the right, a box for the message, and a button that says **Commit to main**
followed by one that says **Push origin**. That is the entire loop, with no commands. It also handles
the checkpoint jumps: **Current Branch** dropdown → pick `step-3`. If you are working on your own
machine rather than in a Codespace, this is the on-ramp to use.

**The git CLI.** Fine if you already know it. Required for nothing here. The one place the workshop
suggests typing git commands is [`../CHECKPOINTS.md`](../CHECKPOINTS.md), and that document gives a
GitHub Desktop route and a browser route alongside every command.

To be unambiguous, because it comes up every time: **you can complete this workshop, deploy a working
site and take home a public URL without ever typing `git`.**

---

## 9. What a push sets in motion

Worth thirty seconds, because it is a small demonstration of the workshop's whole argument.

This repository contains `.github/workflows/checks.yml`. When you push, GitHub runs `npm run check`
on its own machine: it installs the dependencies, installs Chromium, and runs every gate against the
site your commit builds. The result appears as a green tick or a red cross next to your commit.

The point is not the automation. The point is that the verifier now exists somewhere the agent cannot
reach. A gate that only runs on the machine where the code is being written is a gate the code's
author can quietly adjust. The same gates, run on a machine nobody is standing at, are a fact.

You do not have to do anything with this. Push and look at the tick.

---

## 10. When something looks wrong

**"Use this template" is not on the page.** You are looking at a fork of the repository, or at a
different repository. Check that the address is exactly
`github.com/hculap/waysconf-2026-agentic-loops`. If the address is right and the button still is not
there, the repository's own **Template repository** switch is off. That one is not fixable from your
side: say so in the room, and work in a Codespace on the workshop repository until it is.

**`git checkout step-3` says the branch does not exist.** You did not tick "Include all branches" in
§5. [`../CHECKPOINTS.md`](../CHECKPOINTS.md) §7 fixes it in three commands, and the browser route in
§5 of that document does not need them at all.

**The Codespace is still installing after five minutes.** It is probably fine — first boot does a lot.
If it is genuinely stuck, delete it at **github.com/codespaces** and create another. Nothing is lost;
your repository is untouched.

**Netlify shows a build that failed.** Open the deploy log. Nine failures in ten are the publish
directory (`dist`) or the Node version (§7.2). The tenth is a genuinely broken build, in which case
`npm run build` fails in your Codespace too, and that is the place to look.

**You committed something you should not have.** If it was a token or a password, treat it as
exposed: revoke it at the service that issued it and issue a new one. Do not spend the workshop
trying to rewrite history. Revoking is the fix; deleting the commit is not.

---

## 11. The shortest version

```
Use this template → Create a new repository → tick "Include all branches"
Code → Codespaces → Create codespace on main
npm run check
... work ...
npx netlify login && npm run build && npm run deploy
```

Everything else on this page is context for those five lines.
