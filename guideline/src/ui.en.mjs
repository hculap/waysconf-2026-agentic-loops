/**
 * Every string the participant site puts on screen that does not come from a markdown file.
 *
 * There are two of these — `ui.en.mjs` and `ui.pl.mjs` — and `scripts/build-guideline.mjs`
 * builds the whole site once per locale. Keeping the strings out of the builder is what
 * makes a second language a data change rather than a fork of the generator.
 *
 * The prose lives in markdown beside this file: `preparation.md` / `preparation.pl.md`,
 * `ideas.md` / `ideas.pl.md`, and `prompts/` / `prompts/pl/`.
 *
 * Style: documentation. Say what to do, with what, and how to confirm it worked. No scene
 * setting, no numbers for effect, no reassurance.
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
      'Materials for the WaysConf 2026 masterclass: preparation, workshop, presentation and the finished site.',
    preparationTitle: 'Preparation · WaysConf 2026 masterclass',
    preparationDesc:
      'Set up your computer before the workshop: accounts, tools, sign-in, a GitHub repository and an automated setup check.',
    duringTitle: 'The workshop · WaysConf 2026 masterclass',
    duringDesc:
      'The ideas, the diagrams and the eight prompts that take an empty folder to a deployed, verified website.',
  },

  chrome: {
    skip: 'Skip to main content',
    home: 'WaysConf 2026: workshop materials',
    tocTitle: 'On this page',
    footerSession:
      '<strong>Build an AI that checks and fixes its own work</strong> · WaysConf 2026 · 16 September, 14:55, ROOM-PM · Szymon Paluch',
    footerRepo: 'Workshop repository:',
    footerFiction:
      'TURBINE is a fictional festival created as teaching material. Artist names, imagery and copy are invented.',
  },

  copy: { button: 'Copy', aria: 'Copy the command: ', done: 'Copied' },

  hub: {
    kicker: 'WaysConf 2026 · masterclass',
    h1: 'Build an AI that checks and fixes its own work',
    lede: 'In the workshop you build a website from a Figma file. A coding agent, Claude Code or Codex, does the building. It also writes a program that checks the page against the design, and fixes every problem that program reports.',
    when: '16 September 2026 · 14:55 · ROOM-PM · EXPO Kraków',
    partsHeading: 'Materials',
    partsIntro: 'Complete the preparation before 16 September. I will open the other materials on the day of the workshop.',
    open: 'Open',
    locked: 'Available on 16 September',
    parts: [
      {
        key: 'preparation',
        n: '01',
        title: 'Preparation',
        body: 'You create the accounts, install the tools, sign in and create a GitHub repository. At the end, the agent checks that everything works. It takes about 30 minutes.',
      },
      {
        key: 'workshop',
        n: '02',
        title: 'Workshop',
        body: 'The Figma file and the eight prompts you paste during the session.',
      },
      {
        key: 'deck',
        n: '03',
        title: 'Presentation',
        body: 'The slides I show in the session.',
      },
      {
        key: 'site',
        n: '04',
        title: 'Finished site',
        body: 'The festival website built from the same design. This is the result your agent works towards.',
      },
    ],
  },

  accounts: [
    {
      n: '01',
      title: 'GitHub',
      body: 'Free. Stores your project repository. Also used to sign up for Netlify and to run a Codespace.',
      buttons: [{ href: 'https://github.com/signup', label: 'Create an account' }],
      meta: '2 min · confirm your email',
    },
    {
      n: '02',
      title: 'Coding agent',
      pay: true,
      body: '<strong>Claude Pro or Max</strong> (for Claude Code) or <strong>ChatGPT Plus</strong> (for Codex). You need one. The prompts work with both.',
      buttons: [
        { href: 'https://claude.ai/', label: 'Claude' },
        { href: 'https://chatgpt.com/', label: 'ChatGPT', ghost: true },
      ],
      meta: 'paid · about €20 per month',
    },
    {
      n: '03',
      title: 'Netlify',
      body: 'Free. Publishes your site. Choose <strong>Sign up with GitHub</strong>.',
      buttons: [{ href: 'https://app.netlify.com/signup', label: 'Create an account' }],
      meta: '2 min · no card required',
    },
    {
      n: '04',
      title: 'Figma',
      body: 'Free plan. You save the design from Figma as a file and give the file to the agent.',
      buttons: [{ href: 'https://www.figma.com/signup', label: 'Create an account' }],
      meta: 'free plan',
    },
  ],

  osPicker: {
    legend: 'Operating system',
    mac: 'macOS',
    windows: 'Windows',
    linux: 'Linux',
    hintNeutral: 'The instructions below change to match.',
    hintGuessed: (os) => `Detected: ${os}. If this is wrong, choose another system.`,
    hintSet: (os) => `The instructions below are for ${os}.`,
  },

  terminal: {
    mac: {
      heading: 'macOS',
      steps: [
        'Press <kbd>Cmd</kbd> + <kbd>Space</kbd>.',
        'Type <code>Terminal</code>.',
        'Press <kbd>Enter</kbd>.',
      ],
      note: 'Paste with <kbd>Cmd</kbd> + <kbd>V</kbd>.',
    },
    windows: {
      heading: 'Windows',
      steps: [
        'Press the <kbd>Windows</kbd> key.',
        'Type <code>PowerShell</code>.',
        'Click <strong>Windows PowerShell</strong>. Do not use Command Prompt.',
      ],
      note: 'Paste with <kbd>Ctrl</kbd> + <kbd>V</kbd> or a right-click.',
    },
    linux: {
      heading: 'Linux',
      steps: [
        'Press <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>.',
        'If no window opens, search for <code>Terminal</code> in the applications menu.',
      ],
      note: 'Paste with <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>V</kbd>. In a terminal, <kbd>Ctrl</kbd> + <kbd>V</kbd> does not paste.',
    },
  },

  terminalRules: [
    '<b>Prompt:</b> the line with the cursor, ending in <code>$</code>, <code>%</code> or <code>&gt;</code>. The terminal is waiting for a command.',
    '<b>Running a command:</b> paste it and press <kbd>Enter</kbd>.',
    '<b>No output:</b> some commands print nothing for a minute or longer. They are still running.',
    '<b>Finished:</b> a command has finished when the prompt appears again.',
    '<b>Earlier lines:</b> cannot be edited. Only the current line accepts input.',
    '<b>Commands on this page:</b> install tools, sign you in, create the repository or print a status.',
  ],

  install: {
    mac: {
      heading: 'Node, Git and GitHub CLI on macOS',
      cmds: ['brew install node gh'],
      note: 'Requires Homebrew. Without it, first run the install command from <a href="https://brew.sh">brew.sh</a>; it asks for your Mac password, and typing shows nothing. Homebrew installs Git. Afterwards, close the terminal and open a new one.',
    },
    windows: {
      heading: 'Node, Git and GitHub CLI on Windows',
      cmds: [
        'winget install --id OpenJS.NodeJS.LTS',
        'winget install --id Git.Git',
        'winget install --id GitHub.cli',
        'Set-ExecutionPolicy -Scope CurrentUser RemoteSigned',
      ],
      note: 'Run the commands one at a time. The last one allows PowerShell to run npm and the agent; without it they fail with <em>running scripts is disabled on this system</em>. If asked, type <code>Y</code> and press Enter. Afterwards, close PowerShell and open a new one.',
    },
    linux: {
      heading: 'Node, Git and GitHub CLI on Linux',
      cmds: [
        'sudo apt install -y curl git gh',
        'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.7/install.sh | bash',
        'nvm install --lts',
      ],
      note: 'The first command asks for your password; typing shows nothing. Before the third command, close the terminal and open a new one. Node is installed with nvm because distribution packages are often older than the required 20.11, and because global npm installs then need no <code>sudo</code>. Other distributions: install <code>curl</code>, <code>git</code> and <code>gh</code> with your package manager (<a href="https://github.com/cli/cli#installation">gh instructions</a>).',
    },
    agentHeading: 'Coding agent (one of the two)',
    agentBody: 'Install the agent that matches your subscription.',
    claude: 'Claude Pro or Max',
    chatgpt: 'ChatGPT Plus',
    netlifyHeading: 'Netlify CLI',
    netlifyBody: 'Publishes the site at the end of the workshop.',
    after:
      'If a command reports <code>command not found</code> right after installation, close the terminal and open a new one.',
  },

  signin: {
    intro:
      'Each sign-in command opens the browser. Approve access there, then return to the terminal. The status command confirms the result.',
    check: 'Check:',
    github: {
      heading: 'GitHub',
      cmd: 'gh auth login',
      body: 'Answer with the arrow keys and <kbd>Enter</kbd>: <strong>GitHub.com</strong> → <strong>HTTPS</strong> → <strong>Yes</strong> (authenticate Git) → <strong>Login with a web browser</strong>. Copy the one-time code, press <kbd>Enter</kbd>, paste the code in the browser and click <strong>Authorize</strong>.',
      checkCmd: 'gh auth status',
      expect: 'Logged in to github.com',
    },
    agent: {
      heading: 'Coding agent',
      claude: {
        cmd: 'claude auth login',
        body: 'Sign in on claude.ai in the browser and click <strong>Authorize</strong>. If the terminal asks for a code, copy it from the browser and paste it.',
        checkCmd: 'claude auth status',
        expect: '"loggedIn": true',
      },
      codex: {
        cmd: 'codex login',
        body: 'Sign in to ChatGPT in the browser and allow access. The terminal confirms when sign-in is complete.',
        checkCmd: 'codex login status',
        expect: 'Logged in using ChatGPT',
      },
    },
    netlify: {
      heading: 'Netlify',
      cmd: 'netlify login',
      body: 'Click <strong>Authorize</strong> in the browser, then return to the terminal.',
      checkCmd: 'netlify status',
      expect: 'your email address',
    },
  },

  repo: {
    intro:
      'This command creates a private repository named <code>turbine</code> on your GitHub account and clones it into a <code>turbine</code> folder in the current directory.',
    cmds: ['gh repo create turbine --private --clone', 'cd turbine'],
    after:
      'The workshop starts in this folder: <code>cd turbine</code>, then start the agent. Do not add files to it.',
    checkCmd: 'git remote -v',
    expect: 'github.com/your-username/turbine',
    taken:
      'If a repository named turbine already exists on your account, choose another name and use it wherever this page says turbine.',
  },

  ready: {
    intro:
      'The agent checks every item from the previous steps and reports what is missing. It does not change anything.',
    steps: [
      'Go to the project folder:',
      'Start the agent: <code>claude</code> or <code>codex</code>. If it asks whether to trust the folder, answer yes.',
      'Paste the prompt below and press <kbd>Enter</kbd>.',
    ],
    promptLabel: 'Paste this to your agent',
    prompt: `Check that this computer is ready for a workshop. Do not install, sign in to or change
anything: only inspect, and run whatever commands you need to do that.

Check each item and report the result as a table with three columns: what you checked,
what you found, OK or NOT OK.

1. Node is installed, version 20.11 or newer, and npm works.
2. Git is installed and has a user name and email configured.
3. The GitHub CLI (gh) is installed and signed in.
4. The Netlify CLI is installed and signed in.
5. You, the agent running this check, are installed and signed in. State which agent you are.
6. This folder is a git repository with a GitHub remote, and that repository exists on
   GitHub under the account gh is signed in as.
7. This folder contains nothing except git's own files.

For every NOT OK item, give the fix in one or two plain sentences, with the exact command
if there is one. End with one line: READY, or NOT READY and the number of items left.`,
    after:
      'The agent asks for permission before each command; allow it. Fix every NOT OK item and run the same prompt again until the result is <strong>READY</strong>. If the agent does not start, repeat <a href="#sign-in">Sign in</a>.',
  },

  codespaces: {
    intro:
      'If you cannot install software, use a <strong>GitHub Codespace</strong>: a cloud computer in the browser with Node, Git and GitHub CLI preinstalled and already signed in to GitHub.',
    steps: [
      {
        text: 'On github.com, click <strong>+</strong> → <strong>New repository</strong>. Name: <code>turbine</code>. Visibility: <strong>Private</strong>. Select <strong>Add a README file</strong>, because a Codespace cannot be created for an empty repository. Click <strong>Create repository</strong>.',
      },
      {
        text: 'On the repository page, click <strong>Code</strong> → <strong>Codespaces</strong> → <strong>Create codespace on main</strong>. The terminal is the panel at the bottom, already in the repository folder.',
      },
      {
        text: 'Delete the README so the folder is empty:',
        cmds: ['rm README.md'],
      },
      {
        text: 'Install the agent and the Netlify CLI with the commands from <a href="#install-the-tools">Install the tools</a>. Node, Git and GitHub CLI are already installed.',
      },
      {
        text: 'Sign in to the agent and to Netlify as described in <a href="#sign-in">Sign in</a>. The terminal prints a link instead of opening the browser: hold <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> and click it. For Codex, use the device sign-in:',
        cmds: ['codex login --device-auth'],
        note: 'If Codex reports that device code login is not enabled, turn it on in ChatGPT → Settings → Security and run the command again.',
      },
      {
        text: 'Run <a href="#check-the-setup">Check the setup</a> in the Codespace terminal. Skip <code>cd turbine</code>: the terminal is already in the project folder.',
      },
    ],
    after:
      'The GitHub free plan includes 120 core-hours of Codespaces per month; the workshop uses about 3. On the day, reopen the same Codespace from <a href="https://github.com/codespaces">github.com/codespaces</a>.',
  },

  faq: [
    [
      'Do I need programming experience?',
      'No. You describe problems in plain language; the agent writes the code.',
    ],
    [
      'Can I use a free AI plan?',
      'No. The free plans of Claude and ChatGPT do not include Claude Code or Codex. The cheapest paid plan of either is enough.',
    ],
    [
      'Why do I need a GitHub repository?',
      'The project is stored in it, and you keep the code after the workshop.',
    ],
    [
      'Do I need a paid Figma plan?',
      'No. The design file can be saved from the free plan.',
    ],
    [
      'The check reports NOT OK and I do not know why.',
      'Ask the agent to explain that item step by step. If the problem remains, come 15 minutes before the workshop starts.',
    ],
    [
      'Is internet access required during the workshop?',
      'Yes. The room has Wi-Fi. The agent installs packages, decodes the Figma file and publishes the site.',
    ],
    [
      'I cannot install software on my laptop.',
      'Use a Codespace, as described in the section on working without installing.',
    ],
    [
      'Does it work on Windows?',
      'Yes. Use PowerShell, not Command Prompt.',
    ],
    [
      'What do I keep after the workshop?',
      'The published site, the repository with its code, and the prompts.',
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
    preparationH1: 'Preparation',
    preparationLede: [
      'Complete these steps before 16 September, on the computer you will bring to the workshop. Time required: about 30 minutes.',
      'The last step is a prompt: your coding agent checks the setup and lists anything that is missing.',
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
