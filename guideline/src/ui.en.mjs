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
    beforeTitle: 'Before you come · WaysConf 2026 masterclass',
    beforeDesc:
      'Fifteen minutes of setup for the WaysConf 2026 masterclass: four free accounts, one install, and how to open a terminal.',
    duringTitle: 'The workshop · WaysConf 2026 masterclass',
    duringDesc:
      'The ideas, the diagrams and the eight prompts that take an empty folder to a deployed, verified website.',
  },

  chrome: {
    skip: 'Skip to main content',
    tabsLabel: 'Workshop',
    before: 'Before',
    during: 'During',
    tocTitle: 'On this page',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 September, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Everything here stays online after the conference. The repository, if you want it:',
    footerFiction:
      'TURBINE is a fictional festival created as teaching material. Artist names, imagery and copy are invented. Any resemblance to a real event or performer is coincidental.',
  },

  copy: { button: 'Copy', aria: 'Copy the command: ', done: 'Copied' },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Free. You need it to sign in to Netlify in one click, and for the browser option if you cannot install anything.',
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
    '<b>You cannot break your computer with anything on this page.</b> Every command here either installs something or prints a version number.',
  ],

  install: {
    mac: {
      heading: 'Node, on macOS',
      cmd: 'brew install node',
      note: 'No Homebrew? Download the LTS installer from <a href="https://nodejs.org">nodejs.org</a>, open it, and click through. Then close the terminal and open a new one.',
    },
    windows: {
      heading: 'Node, on Windows',
      cmd: 'winget install OpenJS.NodeJS.LTS',
      note: 'Or the installer from <a href="https://nodejs.org">nodejs.org</a>. Either way, close PowerShell and open a new one afterwards — it only notices new programs when it starts.',
    },
    linux: {
      heading: 'Node, on Linux',
      cmd: 'sudo apt install -y nodejs npm',
      note: 'It will ask for your password; nothing appears as you type it, which is normal. Node 20.11 or newer is required — if your distribution ships something older, use <a href="https://github.com/nvm-sh/nvm">nvm</a>.',
    },
    agentHeading: 'Then one agent — whichever you already pay for',
    agentBody:
      'You need <strong>one</strong> of these two, not both. If you have a Claude subscription take the first; if you have ChatGPT Plus take the second.',
    claude: 'Claude Pro or Max',
    chatgpt: 'ChatGPT Plus',
  },

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

  selftest: [
    ['node -v', 'prints v20.11.0 or higher'],
    ['npm -v', 'prints any version'],
    ['claude --version', 'only if you chose Claude'],
    ['codex --version', 'only if you chose ChatGPT'],
  ],

  faq: [
    [
      'I have never used a terminal.',
      'Good — a third of the room has not either. There is a section on it above, and the first thing your agent is asked to do is explain each command as it goes.',
    ],
    [
      'Do I need to know how to code?',
      'No. You will read code and say what is wrong with the result in plain English. That is the job the session is about.',
    ],
    [
      'I do not want to pay for an AI subscription.',
      'The free tiers of both products do not include the command-line tool, so a free account will not run the loop. The cheapest tier of either is enough, and you can cancel afterwards.',
    ],
    [
      'My Figma is free.',
      'That is all you need. You save the file out of Figma — two clicks — and hand it to your agent. Nothing in the workshop needs a paid seat.',
    ],
    [
      'Will I need the internet during the workshop?',
      'Yes, and the room has it. Your agent installs packages, decodes the Figma file and publishes your site, and all three go over the network. If Codex asks before going online, say yes.',
    ],
    [
      'My work laptop will not let me install things.',
      'Use the browser option. You get a full machine with everything on it and you install nothing.',
    ],
    [
      'Will this work on Windows?',
      'Yes. Use PowerShell rather than the old Command Prompt. Everything in the session is the same.',
    ],
    [
      'What if I fall behind?',
      'You cannot, in a way that matters. Every prompt stands alone — if one is going badly, tell your agent to stop and paste the next. A half-built page with a working checker teaches more than a finished page with none.',
    ],
    [
      'What do I take home?',
      'A live URL, the page of prompts, and the design. All of it stays online after the conference.',
    ],
  ],

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
      'This page is the preparation. It takes about fifteen minutes and goes much better at home than on conference wifi.',
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
