/**
 * Every string the participant site puts on screen that does not come from a markdown file.
 *
 * There are two of these — `ui.en.mjs` and `ui.pl.mjs` — and `scripts/build-guideline.mjs`
 * builds the whole site once per locale. Keeping the strings out of the builder is what
 * makes a second language a data change rather than a fork of the generator.
 *
 * The prose lives in markdown beside this file: `before.md` / `before.pl.md`,
 * `ideas.md` / `ideas.pl.md`, and `prompts/` / `prompts/pl/`.
 */

export default {
  lang: 'en',
  /** The URL prefix this locale lives under. Empty means the site root. */
  base: '',
  /** How this language is named in the switcher, and the other one's link. */
  name: 'EN',
  other: { lang: 'pl', name: 'PL', base: 'pl' },
  switcherLabel: 'Language',

  meta: {
    hubTitle: 'Build an AI that checks and fixes its own work · WaysConf 2026',
    hubDesc:
      'A WaysConf 2026 masterclass: an agent builds a website from a Figma file, writes the program that checks it, and fixes what that program finds.',
    beforeTitle: 'Before you come · WaysConf 2026 masterclass',
    beforeDesc:
      'About thirty minutes at home: four accounts, the tools, signing in, your own repository, and an agent that checks it all for you.',
    duringTitle: 'The workshop · WaysConf 2026 masterclass',
    duringDesc:
      'The ideas, the diagrams and the eight prompts that take an empty folder to a deployed, verified website.',
  },

  chrome: {
    skip: 'Skip to main content',
    home: 'WaysConf 2026 — all parts of the workshop',
    tocTitle: 'On this page',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 September, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Everything here stays online after the conference. The repository, if you want it:',
    footerFiction:
      'TURBINE is a fictional festival created as teaching material. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental.',
  },

  copy: { button: 'Copy', aria: 'Copy the command: ', done: 'Copied' },

  hub: {
    kicker: 'WaysConf 2026 · masterclass',
    h1: 'Build an AI that checks and fixes its own work',
    lede: 'Ninety minutes. An agent builds a website from a Figma file, writes the program that checks it, and fixes what that program finds — until the program says yes.',
    when: '16 September 2026 · 14:55 · ROOM-PM · Kraków',
    partsHeading: 'The workshop, in four parts',
    partsIntro: 'The first part is for now, at home. The other three open on the day.',
    open: 'Open',
    locked: 'Opens on 16 September',
    parts: [
      {
        key: 'before',
        n: '01',
        title: 'Before the workshop',
        body: 'Accounts, the tools, signing in and your own repository — about thirty minutes. At the end, your agent checks the lot and tells you what is missing.',
      },
      {
        key: 'workshop',
        n: '02',
        title: 'The workshop',
        body: 'The Figma file, the ideas, the diagrams and the eight prompts you paste during the session.',
      },
      {
        key: 'deck',
        n: '03',
        title: 'The presentation',
        body: 'The slides from the session, to go back to afterwards.',
      },
      {
        key: 'site',
        n: '04',
        title: 'What you will build',
        body: 'The finished festival website — what your agent is aiming for.',
      },
    ],
  },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Free. Your project lives in a repository there, you sign in to Netlify with it in one click, and it is the browser option if you cannot install anything.',
      buttons: [{ href: 'https://github.com/signup', label: 'Create an account' }],
      meta: '2 min · confirm the email',
    },
    {
      n: '02',
      title: 'One coding agent',
      pay: true,
      body: '<strong>Claude Pro</strong> or <strong>ChatGPT Plus</strong> — one, not both. They are equals here: every prompt in this workshop was written and run against both.',
      buttons: [
        { href: 'https://claude.ai/', label: 'Claude' },
        { href: 'https://chatgpt.com/', label: 'ChatGPT', ghost: true },
      ],
      meta: 'the only thing on this page that costs money · about €20',
    },
    {
      n: '03',
      title: 'Netlify',
      body: 'Free, and this is where your site ends up. Choose <strong>Sign up with GitHub</strong> and there is nothing else to fill in.',
      buttons: [{ href: 'https://app.netlify.com/signup', label: 'Create an account' }],
      meta: '2 min · no card',
    },
    {
      n: '04',
      title: 'Figma',
      body: 'Free is enough. You save the design out of Figma as one file and hand that file to your agent. Nothing in the workshop needs a paid seat.',
      buttons: [{ href: 'https://www.figma.com/signup', label: 'Create an account' }],
      meta: 'free tier is fine',
    },
  ],

  osPicker: {
    legend: 'Which computer are you on?',
    mac: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    hintNeutral: 'Everything below changes to match.',
    hintGuessed: (os) => `We guessed ${os} from your browser. Not right? Pick another — everything below changes to match.`,
    hintSet: (os) => `Everything below is for ${os}.`,
  },

  terminal: {
    mac: {
      heading: 'Opening a terminal on macOS',
      steps: [
        'Press <kbd>Cmd</kbd> + <kbd>Space</kbd>.',
        'Type <code>Terminal</code>.',
        'Press <kbd>Enter</kbd>.',
      ],
      note: 'A window opens with a line of text and a blinking cursor. That is it. Paste into it with <kbd>Cmd</kbd> + <kbd>V</kbd>.',
    },
    windows: {
      heading: 'Opening a terminal on Windows',
      steps: [
        'Press the <kbd>Windows</kbd> key.',
        'Type <code>PowerShell</code>.',
        'Click <strong>Windows PowerShell</strong> — <em>not</em> "Command Prompt", which looks similar and behaves differently.',
      ],
      note: 'A blue window opens with a line of text and a blinking cursor. That is it. Paste into it with <kbd>Ctrl</kbd> + <kbd>V</kbd>, or by right-clicking.',
    },
    linux: {
      heading: 'Opening a terminal on Linux',
      steps: [
        'Press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>.',
        'If nothing happens, open your applications menu and search for <code>Terminal</code>.',
      ],
      note: 'Paste into it with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd> — the plain <kbd>Ctrl</kbd> + <kbd>V</kbd> means something else in a terminal.',
    },
  },

  terminalRules: [
    '<b>The line with the cursor is the prompt.</b> It ends in <code>$</code>, <code>%</code> or <code>&gt;</code>, and it means the terminal is waiting for you.',
    '<b>Paste, then press <kbd>Enter</kbd>.</b> Nothing runs until you do.',
    '<b>Silence is normal.</b> A command can sit there for a minute printing nothing. It has not frozen — it is working. You will learn to wait.',
    '<b>It is finished when the prompt comes back.</b> That is the only signal there is.',
    '<b>What has scrolled past is a transcript.</b> You cannot click into an old line and fix it. Only the line you are typing now is live.',
    '<b>You cannot break your computer with anything on this page.</b> Every command here installs something, signs you in, or prints what it finds.',
  ],

  install: {
    mac: {
      heading: 'Node, Git and the GitHub command line, on macOS',
      cmds: ['brew install node gh'],
      note: 'This needs Homebrew. No Homebrew? Paste the one command from <a href="https://brew.sh">brew.sh</a> first — it asks for your Mac password, and nothing appears as you type it, which is normal. Git comes with it. When everything has finished, close the terminal and open a new one.',
    },
    windows: {
      heading: 'Node, Git and the GitHub command line, on Windows',
      cmds: [
        'winget install --id OpenJS.NodeJS.LTS',
        'winget install --id Git.Git',
        'winget install --id GitHub.cli',
        'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
      ],
      note: 'One at a time. The last one lets PowerShell start the tools you install next — without it, <code>npm</code> and your agent stop with <em>running scripts is disabled on this system</em>. If it asks, type <code>Y</code> and press Enter. Then close PowerShell and open a new one: it only notices new programs when it starts.',
    },
    linux: {
      heading: 'Node, Git and the GitHub command line, on Linux',
      cmds: [
        'sudo apt install -y curl git gh',
        'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash',
        'nvm install --lts',
      ],
      note: 'Close the terminal and open a new one before the third command. The first asks for your password; nothing appears as you type it, which is normal. Node comes through nvm because most distributions ship one older than the workshop needs, and because the installs below then need no <code>sudo</code>. Not on Ubuntu or Debian? Install <code>curl</code>, <code>git</code> and <code>gh</code> with your own package manager — <a href="https://github.com/cli/cli#installation">instructions for gh</a>.',
    },
    agentHeading: 'One coding agent — whichever you already pay for',
    agentBody:
      'You need <strong>one</strong> of these two, not both. If you have a Claude subscription take the first; if you have ChatGPT Plus take the second.',
    claude: 'Claude Pro or Max',
    chatgpt: 'ChatGPT Plus',
    netlifyHeading: 'The Netlify command line',
    netlifyBody: 'This is what puts your site on the internet at the end of the workshop.',
    after:
      'If a command says <code>command not found</code> straight after you installed it, close the terminal and open a new one. That fixes it nearly every time.',
  },

  signin: {
    intro:
      'Each tool needs to know who you are, and they all do it the same way: the command opens your browser, you click to allow it, and you come back to the terminal. Then one more command shows it worked.',
    check: 'Check:',
    github: {
      heading: 'GitHub',
      cmd: 'gh auth login',
      body: 'It asks a few questions; move with the arrow keys and press Enter. Choose <strong>GitHub.com</strong>, then <strong>HTTPS</strong>, then <strong>Yes</strong> to authenticating Git, then <strong>Login with a web browser</strong>. It shows a one-time code: press Enter, paste the code in the browser, and click <strong>Authorize</strong>.',
      checkCmd: 'gh auth status',
      expect: 'says Logged in to github.com',
    },
    agent: {
      heading: 'Your agent',
      claude: {
        cmd: 'claude auth login',
        body: 'Your browser opens on claude.ai. Sign in and click <strong>Authorize</strong>. If the terminal asks for a code instead, copy it from the browser and paste it back.',
        checkCmd: 'claude auth status',
        expect: 'shows "loggedIn": true',
      },
      codex: {
        cmd: 'codex login',
        body: 'Your browser opens on ChatGPT. Sign in and allow it. The terminal says when it is done.',
        checkCmd: 'codex login status',
        expect: 'says Logged in using ChatGPT',
      },
    },
    netlify: {
      heading: 'Netlify',
      cmd: 'netlify login',
      body: 'Your browser opens a Netlify page. Click <strong>Authorize</strong>, then come back to the terminal.',
      checkCmd: 'netlify status',
      expect: 'shows your email address',
    },
  },

  repo: {
    intro:
      'Your project needs a home on GitHub. One command creates the repository — private, so only you can see it — and puts an empty copy on your computer, in a folder called <code>turbine</code>.',
    cmds: ['gh repo create turbine --private --clone', 'cd turbine'],
    after:
      'That folder is where the workshop starts. On the day you open a terminal, go into it with <code>cd turbine</code>, and start your agent there. Leave it empty until then.',
    checkCmd: 'git remote -v',
    expect: 'shows github.com/your-name/turbine',
    taken:
      'Already have a repository called turbine? Pick another name, and use it wherever this page says turbine.',
  },

  ready: {
    intro:
      'Last step, and you do not have to check anything yourself. Your agent looks at everything above and tells you, in plain words, what is still missing.',
    steps: [
      'In a terminal, go into your project folder:',
      'Start your agent — <code>claude</code> or <code>codex</code>. If it asks whether you trust this folder, say yes.',
      'Copy the prompt below, paste it, and press Enter.',
    ],
    promptLabel: 'Paste this to your agent',
    prompt: `I am getting ready for a workshop and I have not used a terminal much. Check that this
computer is set up for it. Do not install, sign in to or change anything yourself: only
look, and run whatever commands you need in order to look.

Check each of these, and show me the result as a table — what you checked, what you found,
and OK or NOT OK:

1. Node is installed, version 20.11 or newer, and npm works.
2. Git is installed, and knows a name and an email address to put on commits.
3. The GitHub command line is installed and signed in.
4. The Netlify command line is installed and signed in.
5. You, the agent I am talking to, are installed and signed in. Say which agent you are.
6. This folder is a git repository connected to a repository on GitHub, that repository
   exists, and it belongs to the account the GitHub command line is signed in as.
7. This folder is empty apart from git's own files. The workshop starts from nothing.

For every NOT OK, tell me in one or two sentences what to do, in plain words, with the exact
command to type if there is one. Finish with one line on its own: READY, or NOT READY and
how many things are left.`,
    after:
      'It asks before running each command. Say yes — it only looks. Fix whatever it marks NOT OK, then paste the same prompt again until it says <strong>READY</strong>. If your agent will not start at all, go back to <a href="#sign-in">Sign in</a>.',
  },

  codespaces: {
    intro:
      'Some work laptops will not let you install anything. You can do the whole workshop in the browser instead, in a <strong>GitHub Codespace</strong>: a computer in the cloud that already has Node, Git and the GitHub command line, and is already signed in to GitHub.',
    steps: [
      {
        text: 'On github.com, click <strong>+</strong> → <strong>New repository</strong>. Name it <code>turbine</code>, choose <strong>Private</strong>, tick <strong>Add a README file</strong> — a codespace cannot open on an empty repository — and click <strong>Create repository</strong>.',
      },
      {
        text: 'On the repository page: <strong>Code</strong> → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. It takes a minute or two. The panel along the bottom is a terminal, already in your repository folder.',
      },
      {
        text: 'Remove the README, so the folder starts empty:',
        cmds: ['rm README.md'],
      },
      {
        text: 'Install your agent and the Netlify command line — the commands from <a href="#install-the-tools">Install the tools</a>, from the agent onwards. Node, Git and GitHub are already there.',
      },
      {
        text: 'Sign in to your agent and to Netlify as in <a href="#sign-in">Sign in</a>. The terminal prints a link instead of opening your browser: hold <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> and click it. Codex needs the version of its login that works from another device:',
        cmds: ['codex login --device-auth'],
        note: 'If Codex says device code login is not enabled, turn it on in ChatGPT → Settings → Security, then run it again.',
      },
      {
        text: 'Run <a href="#let-your-agent-check-everything">Let your agent check everything</a>, in the codespace terminal. You are already in the project folder, so skip <code>cd turbine</code>.',
      },
    ],
    after:
      'GitHub’s free plan includes 120 core-hours of Codespaces a month. The workshop uses about three. On the day, open the same codespace from <a href="https://github.com/codespaces">github.com/codespaces</a>.',
  },

  faq: [
    [
      'I have never used a terminal.',
      'Good — a third of the room has not either. There is a section on it above, every command has a copy button, and the first thing your agent is asked to do in the workshop is explain each command as it goes.',
    ],
    [
      'Do I need to know how to code?',
      'No. You will read what the agent made and say what is wrong with it in plain English. That is the job the session is about.',
    ],
    [
      'I do not want to pay for an AI subscription.',
      'The free tiers of both products do not include the command-line tool, so a free account will not run the loop. The cheapest tier of either is enough, and you can cancel afterwards.',
    ],
    [
      'Why do I need a GitHub repository?',
      'It is where your project lives. Your agent can save its work there as it goes, so nothing is lost if a laptop gives up, and you leave with the code as well as the address.',
    ],
    [
      'My Figma is free.',
      'That is all you need. You save the file out of Figma — two clicks — and hand it to your agent. Nothing in the workshop needs a paid seat.',
    ],
    [
      'The check says NOT OK and I do not understand why.',
      'Ask it. Type "explain point 3 like I have never done this" — it knows what it found. If it is still stuck, bring it to the room fifteen minutes early.',
    ],
    [
      'Will I need the internet during the workshop?',
      'Yes, and the room has it. Your agent installs packages, decodes the Figma file and publishes your site, and all three go over the network. If Codex asks before going online, say yes.',
    ],
    [
      'My work laptop will not let me install things.',
      'Use a Codespace, as described above. You install nothing on the laptop itself.',
    ],
    [
      'Will this work on Windows?',
      'Yes. Use PowerShell rather than the old Command Prompt. Everything in the session is the same.',
    ],
    [
      'What do I take home?',
      'A live address, your repository with the code in it, and eight prompts that work on Monday.',
    ],
  ],

  exportSteps: {
    steps: [
      '<b>Duplicate it.</b> Open the file, then <strong>Duplicate to your drafts</strong>. In a file you can only view, saving a local copy may not be offered.',
      '<b>Save a local copy.</b> Open the main menu (the Figma icon, top left), then <strong>File</strong> → <strong>Save local copy…</strong>',
      '<b>You get one <code>.fig</code> file.</b> Inside your project folder, make a folder called <code>design</code> and put the file in it — after prompt 01 has created the project.',
    ],
    rules: [
      '<b>The file, not a picture of it.</b> A <code>.fig</code> is the design itself — the text as text, the colours as values, the variables, the components and the photos — so the agent reads the design instead of guessing at a photograph of it.',
      '<b>Your agent decodes it, and may need the internet to do so.</b> Nothing outside Figma opens a <code>.fig</code>, so the agent works the format out itself, sometimes with a small package it installs. The room has network. If Codex asks to go online, say yes.',
      '<b>Inside the project, not beside it.</b> Your agent works inside the project folder, and Claude Code asks before it reads anything outside it — a file one level up turns into a question the agent has to stop for.',
    ],
  },

  during: {
    promptsHeading: 'The eight prompts',
    figmaTitle: 'The design, in Figma',
    figmaReady:
      'Open it, then <strong>Duplicate to your drafts</strong>. It is yours — poke at it, break it, it does not matter.',
    figmaReadyCta: 'Open in Figma',
    figmaPending:
      'The link goes here on the day. You will duplicate it to your own drafts and save a local copy from there.',
    figmaPendingCta: 'Link on the day',
    exportTitle: 'Then save a copy',
    exportBody:
      'File → Save local copy, and Figma gives you one <code>.fig</code> file. That file is what your agent reads.',
    exportCta: 'Two clicks · below',
    packAlt: (href, figHref) =>
      `No Figma account, or it is being difficult? <a href="${figHref}" download>Download turbine.fig</a> (5&nbsp;MB), the same file already saved. The <a href="${href}" download>ready-made pack</a> (7&nbsp;MB) is the same design as pictures, tokens and copy — <em>optional</em>, for an agent that cannot read the file.`,
    exportHeading: 'Getting the design out of Figma',
    exportIntro:
      'Your agent cannot see your screen. It needs the design as a file, and Figma will save the whole design as one.',
  },

  pages: {
    beforeH1: 'Before you come',
    beforeLede: [
      'Ninety minutes, thirty people, one loop. A coding agent is handed a design, writes a website, and is then told by a program — not by itself — everything that is wrong with it. Then it fixes those things and is told again.',
      'This page is the preparation. It takes about thirty minutes, goes much better at home than on conference wifi, and ends with your agent telling you whether you are ready.',
    ],
    duringH1: 'During the workshop',
    duringLede:
      'You need the design and this page. There is nothing to clone and no code to read — everything else, your agent makes for itself.',
    pasteNote:
      'Paste each prompt whole. The rules in them matter as much as the request, and cutting a prompt down to its first sentence is the commonest way to get a disappointing answer.',
    promptsIntro:
      'In order. Each one stands alone, so if one is going badly you can say <em>&ldquo;stop where you are, I want to move on&rdquo;</em> and paste the next.',
    promptLabel: (n) => `Prompt ${n}`,
  },

  diagrams: {
    '01-the-loop': 'The loop: generate, verify, repair, with a deploy exit',
    '02-fake-loop-vs-real-loop': 'A model grading its own output, beside a model judged by a separate program',
    '03-verification-tiers': 'Three tiers of checking: deterministic gates, measured comparison, adversarial review',
    '04-mcp-topology': 'An agent connected to a design file, a browser and a deploy target',
    '05-dynamic-workflow': 'Three review passes fanning out, every finding sent to be refuted, and a majority filter',
    '06-ninety-minutes': 'The ninety minutes: three hands-on stretches between four blocks of talking',
    '07-loop-vs-workflow': 'Two shapes: a loop defined by its exit condition, and a workflow defined by its phases',
  },
}
