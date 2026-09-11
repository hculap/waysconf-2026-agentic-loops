# The terminal, in ten minutes

Everything this workshop asks you to type, and nothing else.

If you have never opened a terminal, this page is enough to get through the ninety minutes without
being lost. It covers what the thing is, three ways to open one, five commands, how copy and paste
behaves differently on every platform, and the three problems that account for nearly every raised
hand in the room. Any word it uses and does not explain is in [`GLOSSARY.md`](GLOSSARY.md), which
defines every term the workshop leans on.

It deliberately does not teach you the rest. There is a lot of rest.

---

## 1. What a terminal is

A terminal is a window where you type the name of a program, press Enter, and the program prints its
output back as text.

That is the whole idea. `npm run build` and a button labelled **Build** do identical work; one is
addressed by name, the other by clicking. Nothing in the terminal is more powerful than the
equivalent button, and nothing in it is more dangerous, as long as you only type the things on this
page.

Two things it is **not**, and both catch people out.

**It is not a document.** What has already scrolled past is a transcript. You cannot click into a
finished line and edit it, and you cannot save the window. Only the line you are currently typing is
live.

**It is not always listening to you.** When a program is running, the window belongs to that program.
Your keystrokes go to it, not to the shell. This is the single most common source of confusion, and
§4.5 and §7.2 are both about it.

One piece of vocabulary, because the two words get used interchangeably and then somebody uses them
precisely: the **terminal** is the window; the **shell** is the program inside it that reads what you
type and finds the program you asked for. In a Codespace and on a Mac the shell is usually `zsh` or
`bash`. On Windows it is usually PowerShell. The distinction matters exactly once, in §2.3.

---

## 2. Opening one

### 2.1 Inside a Codespace — what most of the room will use

A Codespace is a computer running in GitHub's cloud that you drive from a browser tab. It arrives
with Node, both agents, the browser the gates need and every dependency already installed, which is
why the workshop uses it. The click path to get one is in
[`GITHUB-FOR-DESIGNERS.md`](GITHUB-FOR-DESIGNERS.md) §6.

The **gates**, since the word is about to come up constantly: the programs that read the finished page
and decide, without asking a model, whether it passed. There are nine of them and they are the subject
of the session.

Once the Codespace is open you are looking at VS Code in a browser tab. The terminal is the panel
along the bottom. If it is not there:

- the hamburger menu at the top left → **Terminal** → **New Terminal**
- or press **Ctrl** and the backtick key (the one above Tab on most layouts) together

You can have several. The plus sign at the top right of the panel opens another, and you will want a
second one, because the dev server occupies the first (§7.2).

A Codespace terminal starts in the project folder already. You do not need to navigate anywhere.

### 2.2 On macOS

Spotlight (**Cmd + Space**), type `Terminal`, press Enter. That is the one built into macOS and it is
fine. If you already have iTerm2 or Warp, they behave the same way for everything here.

A new Terminal window starts in your home folder, not in the project, so you will need `cd` (§4.3).

### 2.3 On Windows

Press Start, type `Terminal`. On Windows 11 this opens Windows Terminal running **PowerShell**, which
is Microsoft's shell and the default.

PowerShell runs almost everything in this workshop without complaint: `npm`, `git`, `npx`, both agent
CLIs. There is one exception, and it is the reason you will hear WSL mentioned.

The loop script, `loop/ralph.sh`, is a **bash** script. PowerShell is not bash and cannot run it.
Neither can the old Command Prompt. Three ways around that:

1. **Use a Codespace.** The terminal there is Linux and everything works. This is the recommended
   path and the one the room is built around.
2. **Use Git Bash**, installed alongside Git for Windows. It appears in Windows Terminal's dropdown
   as a profile, and it is a real bash.
3. **Use WSL**, the Windows Subsystem for Linux. WSL exists because a large amount of development
   tooling assumes a Linux machine underneath; rather than rewrite all of it, Windows ships an actual
   Linux running alongside Windows. It is excellent, and it is a forty-minute install. Do not start
   it at 14:55 on the day.

Everything else on this page applies to PowerShell as written, except the copy and paste keys, which
are in §5.

---

## 3. The prompt, and how to tell it is waiting for you

Before every line you type, the shell prints a **prompt**: a short piece of text ending in a symbol,
usually `$`, `%` or `>`. It is the shell saying it has nothing to do and is ready for instructions.
A Codespace prompt looks roughly like this:

```
@yourname ➜ /workspaces/my-turbine (main) $
```

That one is telling you three useful things: who you are, which folder you are in, and which git
branch you are on. Not every prompt is so generous; a plain macOS one can be a single `%`.

**The test for whether the terminal is waiting for you: is there a prompt at the bottom, with your
cursor blinking after it?**

- Prompt visible, cursor after it — the shell is idle and listening. Type.
- No prompt, output still appearing, or the cursor sitting alone on an empty line — a program is
  running. Your typing goes to that program. Wait, or interrupt it (§4.5).

Two cases where there is deliberately no prompt and nothing is wrong:

- `npm run dev` never finishes. A dev server is supposed to run until you stop it. See §7.2.
- A program is asking you something and you have not noticed. See §7.3.

If you paste a command into a terminal that is not at a prompt, nothing visible happens — the text
goes to whatever program is running, which ignores it. Then that program ends and your pasted command
appears out of nowhere. Startling, harmless.

---

## 4. The five things to know

### 4.1 `pwd` — where am I

```
pwd
```

Prints the folder you are currently in, as a full path. **P**rint **W**orking **D**irectory.

```
/workspaces/my-turbine
```

This is the first thing to check when a command fails for no visible reason, because almost every
command here only works from the project folder. See §7.1.

### 4.2 `ls` — what is in here

```
ls
```

Lists the contents of the current folder. In the project root you should see, among other things,
`package.json`, `src`, `checks`, `design` and `brief`. If `ls` shows you something else entirely, you
are in the wrong place, and `pwd` will tell you where.

### 4.3 `cd` — go somewhere else

**C**hange **D**irectory. Three forms cover everything you need:

| Type this | It does |
|---|---|
| `cd my-turbine` | go into the folder `my-turbine`, which must be inside the current folder |
| `cd ..` | go up one level, to the folder containing this one |
| `cd ~/my-turbine` | go to `my-turbine` inside your home folder, from wherever you are |

`~` is shorthand for your home folder. It is the one abbreviation worth learning.

A time-saver that is not a trick: type the first few letters of a folder name and press **Tab**. The
shell completes the rest, and if it does not, the thing you are typing does not exist under that
name. Tab completion is also the fastest way to catch a typo before you make it.

### 4.4 Running a command

A command is one word naming a program, optionally followed by words that change what it does, ended
with Enter.

```
npm run check
```

Here `npm` is the program, and `run check` tells it which of this project's tasks to perform. The
list of tasks lives in `package.json`; running `npm run` with nothing after it prints them.

These are all the commands the workshop uses:

| Command | What it does |
|---|---|
| `npm install` | fetch the project's dependencies; already done for you in a Codespace |
| `npm run dev` | start the development server on `http://localhost:4321`; runs until stopped |
| `npm run build` | produce the finished site in `dist/` |
| `npm run check` | run every gate against the built site and write `checks/report.md` |
| `npx netlify login` | opens a browser to sign you in; the terminal waits until you come back |
| `npm run deploy` | publish `dist/` to Netlify. Sign in first, once, with the line above |
| `bash loop/ralph.sh` | run the loop: check, hand the failures to the agent, repeat |
| `claude` or `codex` | start your coding agent in this folder |
| `git checkout step-3` | jump to a workshop checkpoint — see [`../CHECKPOINTS.md`](../CHECKPOINTS.md) |

Two notes on reading commands elsewhere. Documentation often writes them with a leading `$`, as in
`$ npm run check`. The `$` is the prompt, not part of the command; do not paste it. And commands are
case-sensitive everywhere: `NPM` is not `npm`.

### 4.5 `Ctrl + C` — stop whatever is running

Hold **Control** and press **C**. On a Mac this is Control, not Command; it is one of the very few
places on macOS where Control is the right key.

It tells the running program to stop now. You will use it to shut down the dev server, to stop a loop
that is going somewhere you did not intend, and to escape anything that looks stuck. It is safe. It
deletes nothing, and nothing in this workshop is harmed by being interrupted halfway.

When it works you get your prompt back. If one press does nothing, press it again.

On Windows, `Ctrl + C` is also sometimes the copy shortcut. That collision is real, and §5.2 explains
how the two are told apart.

---

## 5. Copy and paste

Copying commands out of a document and into a terminal is most of what you will do, and it is the one
area where every platform disagrees.

### 5.1 The keys, per platform

| Where | Copy | Paste |
|---|---|---|
| macOS Terminal and iTerm2 | **Cmd + C** | **Cmd + V** |
| Windows Terminal and PowerShell | **Ctrl + C** with text selected | **Ctrl + V**, or right-click |
| Linux, and the terminal inside a Codespace | **Ctrl + Shift + C** | **Ctrl + Shift + V** |

The extra **Shift** on Linux exists precisely because `Ctrl + C` was already taken by "stop the
running program", and that meaning is decades older than the clipboard.

### 5.2 The Windows ambiguity

Windows Terminal resolves the collision by context: `Ctrl + C` copies **when you have text
selected**, and interrupts **when you do not**. That works until the day you mean to interrupt
something and there is a stray selection in the window, at which point your program keeps running and
you have quietly copied some output instead. If `Ctrl + C` does not stop something, click once on an
empty part of the window to clear the selection, then press it again.

### 5.3 In a Codespace, in a browser

A Codespace terminal is a web page, so the browser sits between you and the clipboard. Two
consequences:

- On a Mac, **Cmd + V** pastes into a Codespace terminal, because the browser handles it before the
  terminal sees it. `Ctrl + Shift + V` works too.
- The first time you paste, the browser may ask permission to read the clipboard. Allow it. If you
  dismiss that prompt, paste will silently do nothing until you allow it again from the address bar.

### 5.4 Why the mouse does not always work

Clicking into the middle of a command you are halfway through typing usually does nothing at all.
This looks broken and is not.

The shell only ever receives keystrokes. Mouse clicks are handled by the terminal window, which uses
them to select text — a different job, and one that never reaches the program you are typing into.
There is no cursor for the mouse to move.

Move around the line with the keyboard instead:

- **Left** and **Right** arrows move one character
- **Ctrl + A** jumps to the start of the line, **Ctrl + E** to the end (both work on macOS)
- **Up** arrow recalls the previous command, which is by far the most useful key here. You will run
  `npm run check` many times, and after the first it is one keypress away

Some full-screen programs — `less`, `top`, a text editor — do take the mouse, which is why scrolling
occasionally behaves differently depending on what is running. That is the exception.

### 5.5 Why pasting a password shows nothing

If a program asks for a password and your typing produces nothing on screen — no characters, not even
dots — that is deliberate. Password prompts switch off the echo so that nobody reading over your
shoulder learns even the length of what you typed. The terminal has not frozen and your paste did not
fail. Type or paste, press Enter, and it proceeds.

You should rarely meet this in the workshop: both agents and Netlify sign you in through a browser
rather than a terminal prompt. It shows up mainly with `sudo`, which you do not need here.

---

## 6. What "command not found" actually means

```
zsh: command not found: astro
```

This is not a judgement on your command. It is the shell reporting that it never got as far as
running anything.

The mechanism is worth knowing, because it turns the message from an insult into a diagnosis. The
shell takes the **first word** of what you typed. It then walks through a list of folders — that list
is called `PATH` — looking for a program with exactly that name. If it reaches the end without
finding one, it stops and prints this message. Everything after the first word is never considered.

So there are only four possible causes:

1. **The program is not installed.** Common on your own machine, never in a Codespace.
2. **It is installed, but this terminal was opened before the install finished.** A shell reads
   `PATH` once, when it starts. Close the terminal, open a new one, try again. This fixes it
   surprisingly often.
3. **A typo, or a mangled paste.** Chat apps and slide software turn straight quotes into curly ones
   and hyphens into dashes, and the shell treats those as different characters. Retype the command
   rather than pasting it a second time.
4. **It is a project program, not a system one.** Astro, Playwright, Tailwind and the gates live
   inside this project's `node_modules/` folder, which is not on `PATH`. Typing `astro build`
   directly fails for exactly this reason. It is why every command in this workshop is
   `npm run something` or `npx something`: both of those know to look inside the project first.

A message that looks similar and means something else entirely:

```
npm error Missing script: "chek"
```

Here `npm` was found and ran perfectly well. It is npm telling you this project has no task by that
name. Run `npm run` with nothing after it to see the list.

---

## 7. The three things that go wrong most often

### 7.1 You are in the wrong folder

By a wide margin the most common problem, and it produces messages that mention neither folders nor
paths:

```
npm error code ENOENT
npm error syscall open
npm error path /home/you/package.json
npm error enoent Could not read package.json: Error: ENOENT: no such file or directory
```

Every `npm` command needs to run from the project root — the folder containing `package.json`. If you
opened a fresh Terminal on your Mac, you are in your home folder instead.

Diagnose with `pwd`, confirm with `ls` (you should see `package.json` in the listing), fix with `cd`.
In a Codespace this cannot happen unless you navigated away yourself, because new terminals start in
the project.

### 7.2 The previous command never finished

You ran `npm run dev`. The terminal printed a box with a URL in it and then stopped. There is no
prompt. You type `npm run check` and nothing happens, or something strange does.

Nothing is broken. A dev server is supposed to keep running; that is its entire function. While it
runs, that terminal belongs to it, and your keystrokes are handed to the server, which has no idea
what to do with them.

Two ways out, and you want the first:

- **Open a second terminal** and work there. In a Codespace, the plus sign at the top right of the
  panel. Leave the server running in the first. This is how everyone works.
- **Press `Ctrl + C`** to stop the server and get the prompt back.

The same applies to `bash loop/ralph.sh`, to `claude`, and to anything else that occupies the window.
No prompt means the window is taken.

### 7.3 Something is waiting for you and you have not noticed

A program can stop and wait for an answer, and if you are not expecting it, "waiting for input" and
"frozen" look identical. Three forms you will meet:

**A pager.** `git log` and `git diff` send their output to a viewer called `less`, which takes over
the window and shows a `:` at the bottom. Arrow keys and Space scroll. **Press `q` to leave.** `q` is
the answer to a great many stuck-looking terminals.

**A yes-or-no question**, such as `Proceed? (y/N)`. The capital letter is what you get by pressing
Enter alone, so `(y/N)` defaults to no. Type `y` then Enter to proceed.

**A password or a sign-in code.** Nothing appears as you type. See §5.5.

If in genuine doubt, `Ctrl + C` gets you out of all three, and none of them lose work.

---

## 8. What this page has left out

Deliberately, and this is not a list of homework:

- Creating, moving, copying and deleting files from the terminal. You will not need to. Files are
  edited in the editor, or by the agent.
- Pipes, redirects, wildcards, environment variables, shell scripting.
- `sudo`, permissions, and anything that wants an administrator password.
- Terminal text editors. If something ever drops you into `vim`, press **Esc**, then type `:q!` and
  press Enter, and you are out.

One safety note worth carrying beyond the workshop. Commands from a repository you trust, run in a
disposable Codespace, are about as low-risk as computing gets. Commands copied from a forum post you
have not read, run on your own machine with `sudo` in front of them, are a different activity. The
difference is not the terminal. It is who wrote the command.

---

## 9. The whole thing on one card

```
pwd                  where am I
ls                   what is in here
cd folder            go into it
cd ..                go up one
Up arrow             the last command again
Tab                  finish the word I started
Ctrl + C             stop what is running
q                    leave a pager that has taken over the screen

No prompt at the bottom?   A program is running. That is usually correct.
"command not found"?       The shell found no program by that name. See section 6.
npm: no package.json?      You are not in the project folder. Run pwd.
```

Two pages exist for when this one runs out: [`GLOSSARY.md`](GLOSSARY.md) for any word you meet and do
not recognise, and [`../CHECKPOINTS.md`](../CHECKPOINTS.md) to get back on track if you fall behind.
