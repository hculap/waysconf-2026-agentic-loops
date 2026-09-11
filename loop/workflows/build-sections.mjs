/**
 * build-sections.mjs — one agent per canonical page section.
 *
 *   Workflow({ scriptPath: 'loop/workflows/build-sections.mjs' })
 *
 * WHAT THIS IS FOR
 *
 * The TURBINE page is eleven sections that barely touch each other. A nav does not
 * need to know how the FAQ accordion is wired; the programme table does not care
 * what the ticket cards cost. Eleven near-independent pieces of work is the exact
 * shape a fan-out is good at, and the exact shape a single long conversation is bad
 * at: by the time one agent reaches the footer it has forgotten what it decided in
 * the hero, and its context is full of eleven sections' worth of detail it no longer
 * needs.
 *
 * So: one agent per section, each holding one section's worth of context, each
 * owning a set of files no other agent touches.
 *
 * WHAT THIS IS NOT FOR
 *
 * This does not decide whether the page is correct. `npm run check` does that, and
 * it runs once, at the end, against the assembled page. Eleven agents each saying
 * "my section looks right" is eleven opinions, and the whole point of this
 * repository is that opinions do not close a gate.
 */

export const meta = {
  name: 'build-sections',
  description: 'Build the eleven canonical TURBINE sections in parallel, self-verify each one, then integrate and run the gates',
  whenToUse: 'Once the plan is agreed and src/ is still the starter state. Turns an empty page into eleven mounted sections in one pass, then hands the result to npm run check.',
  phases: [
    { title: 'Scaffold', detail: 'One agent builds the primitives that more than one section consumes' },
    { title: 'Build', detail: 'Eleven agents, one per canonical section, each owning a disjoint set of files' },
    { title: 'Verify', detail: 'Each section is read back against its own criteria and repaired in place' },
    { title: 'Integrate', detail: 'Mount the sections in canonical order, build, and run npm run check' },
  ],
}

// ── Shared context ───────────────────────────────────────────────────────────
//
// Every agent gets the project rules. They also get AGENTS.md and CLAUDE.md
// injected automatically at start, so there is no point pasting those in here —
// what goes in a prompt is the part of the job that is specific to this agent.

const PROJECT_RULES = `
Authority, in this order. Where two disagree the earlier one wins:
  1. docs/CANON.md            festival facts, palette, typography, section order, tone, out of scope
  2. brief/BRIEF.md           what the client asked for
  3. brief/ACCEPTANCE.md      every acceptance criterion and the program that decides it
  4. brief/CONTENT.md         every user-facing string on the page
  5. design/FIGMA-SPEC.md     layout, components, deltas at 768 and 390
  6. design/tokens/tokens.json plus design/tokens/CONTRAST.md for measured ratios

Rules that are not negotiable:
- Do not invent copy. Every string is in brief/CONTENT.md. A string that is missing there is a
  question for the client, not a gap for you to fill. Record it and move on.
- Do not write a colour, font size, spacing or radius literal anywhere. Values reach the page
  through the generated theme, which is built from design/tokens/tokens.json.
- Supporting copy uses color.text.secondary. color.text.muted is footer-legal only and fails
  contrast as body text; that is deliberate, see CANON section 8.
- Text on accent.sodium is bg.base, never white. White on sodium is about 2.9:1 and fails.
- Do not edit anything under checks/. Changing the verifier so it agrees with the generator is
  the precise failure this repository exists to demonstrate.
- Do not add a dependency. Everything needed is already in package.json.
- Do not build anything on the out-of-scope list in CANON section 11: no commerce, no backend,
  no cookie banner, no light theme, no second page.
- The string NOVA must not appear anywhere. CANON section 12 says why, and it is a good reason.
- Astro 5 and Tailwind 4 only. No React, Vue, Svelte or Solid. Client behaviour is plain
  TypeScript, progressively enhanced: with JavaScript disabled all twelve artists are visible
  and every FAQ answer is readable.
`

// Commands the fan-out agents must not run. Eleven agents sharing one dist/, one
// .astro/ cache and one preview port is not parallelism, it is a race. The build
// happens once, in the integration phase, where a failure has one owner.
const NO_BUILD_RULE = `
Do not run npm run build, npm run check, astro build, astro check, astro preview or playwright.
Ten other agents are editing this working tree at the same time and those commands share dist/,
the .astro cache and port 4321. The build runs once, after every section is written, in the
integration step. Read-only commands scoped to your own file are fine: cat, grep, ls.
`

// ── The eleven sections, in CANON section 7 order ────────────────────────────
//
// `owns` is the ownership rule that makes the fan-out safe: a component used by
// exactly one section belongs to that section's agent, a component used by more
// than one is scaffolded before the fan-out starts. Nobody edits a file twice.

const SECTIONS = [
  {
    slug: 'skip-link',
    title: 'Skip link',
    file: 'src/sections/SkipLink.astro',
    owns: [],
    copy: 'brief/CONTENT.md section 2',
    design: 'design/FIGMA-SPEC.md section 5.12',
    criteria: ['AC-06', 'AC-10', 'AC-16', 'AC-17', 'AC-25', 'AC-48'],
    mustDo: [
      'This one already half exists. src/layouts/Base.astro ships <a class="skip-link" href="#main">Skip to content</a> inline, and src/styles/global.css styles .skip-link — off-screen by transform, in view on :focus. Render that same anchor, that same class and that same string in your component, and add data-section="skip-link". Do not restyle it and do not invent a second class.',
      'The integration step deletes the inline anchor from Base.astro and mounts your component in its place. You may edit neither file, so the page having exactly one link to #main is the integrator\'s job and not yours — but shipping markup that differs from the anchor it replaces is how the page ends up with two.',
      'Visually hidden until it receives focus, then plainly visible — not opacity 0, not a 1px clip that stays clipped on focus.',
      'href resolves to #main. The <main id="main"> element itself is in Base.astro already and is not yours either.',
      'It has to be the first focusable element in the document, so it carries no positive tabindex and nothing may precede it in DOM order.',
      'Focus indicator with at least 3:1 contrast against whatever is behind it when it appears.',
    ],
  },
  {
    slug: 'nav',
    title: 'Nav',
    file: 'src/sections/Nav.astro',
    owns: ['src/scripts/nav.ts'],
    copy: 'brief/CONTENT.md section 3',
    design: 'design/FIGMA-SPEC.md sections 4.3, 5.1, 6 and 7',
    criteria: ['AC-06', 'AC-09', 'AC-13', 'AC-15', 'AC-16', 'AC-17', 'AC-20', 'AC-21', 'AC-23', 'AC-48', 'AC-49'],
    mustDo: [
      'Exactly four section links plus exactly one ticket CTA. AC-13 counts them and resolves every fragment.',
      'Wordmark left, all caps, +0.18em tracking. Never the words "Turbine Festival" in the lockup.',
      'Sticky. Hamburger below 768 with aria-expanded on the toggle, and no focus trap when the panel is open.',
      'Every transition at most 200ms, and none of them run under prefers-reduced-motion: reduce.',
      'This section provides the page\'s single banner landmark — a <header> — with the navigation landmark inside it. src/layouts/Base.astro deliberately does not: it renders sections into named slots so that AC-06 is satisfied in one place. One banner, one navigation, and no second of either.',
      'src/scripts/nav.ts already ships the disclosure behaviour, and its header comment writes out the markup it expects and why focus is not trapped. Render against that contract. Do not rewrite the module and do not add a second one.',
      'Touch targets at least 24x24 CSS px at 390.',
    ],
  },
  {
    slug: 'hero',
    title: 'Hero',
    file: 'src/sections/Hero.astro',
    owns: [],
    copy: 'brief/CONTENT.md section 4',
    design: 'design/FIGMA-SPEC.md section 5.2',
    criteria: ['AC-06', 'AC-07', 'AC-22', 'AC-29', 'AC-33', 'AC-35', 'AC-42', 'AC-56'],
    mustDo: [
      'This section carries the only h1 on the page. AC-07 fails on two.',
      'Dates read 12-14 June 2027 with an en dash, not a hyphen. AC-42 compares the string exactly.',
      'Two CTAs. The primary one is bg.base text on accent.sodium. White on sodium fails contrast.',
      'The hero image is the LCP element: explicit width and height, eager, modern format, alt text from brief/CONTENT.md section 13.',
      'The scroll cue does not animate under prefers-reduced-motion: reduce.',
      'This is the tightest pixel budget on the page — 0.5% against design/export/ versus 1.5% everywhere else — so letter-spacing and vertical rhythm here are worth measuring rather than eyeballing.',
    ],
  },
  {
    slug: 'ticker',
    title: 'Ticker',
    file: 'src/sections/Ticker.astro',
    owns: [],
    copy: 'brief/CONTENT.md section 5',
    design: 'design/FIGMA-SPEC.md sections 4.9 and 5.3',
    criteria: ['AC-06', 'AC-15', 'AC-21', 'AC-26', 'AC-36'],
    mustDo: [
      'No heading. CONTENT section 15 is explicit that the ticker contributes nothing to the heading outline.',
      'Under prefers-reduced-motion: reduce the computed animation-name must be none. Slowing it down is not honouring the preference, and AC-21 reads the computed value.',
      'A marquee repeats its tag run so the loop has no visible gap. The repeat is aria-hidden, so a screen reader reads each genre once rather than twice.',
      'No horizontal overflow at 390. AC-36 checks scrollWidth against the viewport, and a marquee is the usual offender.',
    ],
  },
  {
    slug: 'lineup',
    title: 'Lineup',
    file: 'src/sections/Lineup.astro',
    owns: ['src/components/ArtistCard.astro', 'src/components/TabBar.astro', 'src/scripts/tabs.ts'],
    copy: 'brief/CONTENT.md section 6',
    design: 'design/FIGMA-SPEC.md sections 4.4, 4.5 and 5.4',
    criteria: ['AC-06', 'AC-08', 'AC-15', 'AC-18', 'AC-20', 'AC-22', 'AC-23', 'AC-39', 'AC-50'],
    mustDo: [
      'Twelve cards, each with data-artist spelled exactly as CANON section 2 spells it, plus data-day and data-stage from the same table. Ilse Rum is spelled with an umlaut.',
      'The day filter is the WAI-ARIA tabs pattern: roving tabindex, ArrowLeft, ArrowRight, Home and End move selection, exactly one aria-selected="true", aria-controls resolving to a labelled tabpanel.',
      'src/scripts/tabs.ts already implements that pattern and its header comment writes out the markup it expects, down to the attribute names. Render against that contract rather than writing a second module. Read it before you start: it records why there is one tabpanel and not four — four panels means four copies of the twelve cards, and the duplicate data-artist values and duplicate ids that follow fail AC-39 and AC-14.',
      'With JavaScript disabled all twelve artists are visible. The tab list therefore ships carrying hidden and the script unhides it; the tabs must not hide eleven-twelfths of the lineup behind a script that did not load.',
      'h2 "Lineup", one h3 per artist. No skipped levels.',
      'Portrait alt text comes from brief/CONTENT.md section 13. It is not the filename and not the artist name repeated.',
    ],
  },
  {
    slug: 'programme',
    title: 'Programme',
    file: 'src/sections/Programme.astro',
    owns: ['src/components/TimetableRow.astro'],
    copy: 'brief/CONTENT.md section 7',
    design: 'design/FIGMA-SPEC.md sections 4.7 and 5.5',
    criteria: ['AC-06', 'AC-08', 'AC-32', 'AC-36', 'AC-42', 'AC-47'],
    mustDo: [
      'All twelve sets across three days and three stages. AC-47 counts the cells.',
      'Stage names exactly: Turbine Hall, Boiler Room, Cooling Tower.',
      'Set times are the ones recorded in design/FIGMA-SPEC.md section 12 (20:00 / 22:00 / 00:00, doors 19:00, curfew 02:00). CANON does not fix them, so they are an assumption already made for you. Do not invent different ones.',
      'A real table with scoped headers on desktop, stacked blocks at 390. Do not ship two DOM copies of the same data — a screen reader would read the programme twice.',
      'h2 "Programme", one h3 per day.',
    ],
  },
  {
    slug: 'venue',
    title: 'Venue',
    file: 'src/sections/Venue.astro',
    owns: [],
    copy: 'brief/CONTENT.md section 8',
    design: 'design/FIGMA-SPEC.md section 5.6',
    criteria: ['AC-06', 'AC-08', 'AC-22', 'AC-38', 'AC-42', 'AC-51'],
    mustDo: [
      'Two columns: image and text, plus travel information and a static map placeholder.',
      'h2 "The Powerhouse, Hall E", h3 "Getting here".',
      'The map placeholder carries no information a sighted user gets, so it is data-decorative with alt="". The venue photograph is not decorative and needs real alt text.',
      'Venue, city, capacity and the 1928 and 1998 dates read exactly as CANON section 1 has them.',
      'Every local asset you reference has to exist in public/images/. Copy what you need from design/assets/; do not hotlink and do not generate new imagery.',
    ],
  },
  {
    slug: 'tickets',
    title: 'Tickets',
    file: 'src/sections/Tickets.astro',
    owns: ['src/components/TicketCard.astro'],
    copy: 'brief/CONTENT.md section 9',
    design: 'design/FIGMA-SPEC.md sections 4.6 and 5.7',
    criteria: ['AC-06', 'AC-08', 'AC-23', 'AC-29', 'AC-41', 'AC-43', 'AC-49'],
    mustDo: [
      'Three cards with data-tier="single" | "full" | "workshop" and the canonical prices: 45, 110 and 165 euro.',
      'Full Pass is flagged as most popular. The sold-out warning is driven by data-places-left and appears below 10.',
      'The access note appears inside this section, verbatim, near the prices. For one group of readers it is the deciding fact on the page, so it is not fine print and not a footnote.',
      'Buttons are bg.base on accent.sodium. Every ticket button points at the dead external URL in brief/CONTENT.md section 16 — never href="#", which AC-49 rejects.',
      'h2 "Tickets", one h3 per tier.',
    ],
  },
  {
    slug: 'faq',
    title: 'FAQ',
    file: 'src/sections/Faq.astro',
    owns: ['src/components/FaqRow.astro', 'src/scripts/accordion.ts'],
    copy: 'brief/CONTENT.md section 10',
    design: 'design/FIGMA-SPEC.md sections 4.8 and 5.8',
    criteria: ['AC-06', 'AC-08', 'AC-15', 'AC-19', 'AC-47', 'AC-50'],
    mustDo: [
      'Exactly eight items, with the ids brief/CONTENT.md section 10 gives them — other sections link to faq-accessibility, faq-bring and faq-lockers.',
      'AC-19 accepts two shapes and only two: a summary inside a details, or a button carrying aria-expanded. brief/CONTENT.md section 10 and design/FIGMA-SPEC.md section 4.8 both name the native pair first, because it satisfies the keyboard requirement and the no-JavaScript requirement without a line of script. Whichever you build, the expanded state has to toggle on both Enter and Space with focus staying on the control — AC-19 drives all eight items with both keys.',
      'If you build the custom accordion instead of the native pair, do not write the module: src/scripts/accordion.ts already ships it, and its header comment writes out the markup it expects. It renders every answer open with its trigger reporting aria-expanded="true" and closes them on load, which is how that path keeps the answers readable with JavaScript off. Render against that contract.',
      'A div with a click handler is the one shape neither AC-19 nor CANON section 9 allows. It is not a keyboard control and it takes the answers away when the script does not load.',
      'Every aria-controls, if you use them, resolves to the panel it names. AC-50 checks every IDREF on the page whichever shape you built.',
      'h2 "Questions", one h3 per question.',
    ],
  },
  {
    slug: 'newsletter',
    title: 'Newsletter',
    file: 'src/sections/Newsletter.astro',
    owns: ['src/components/Input.astro'],
    copy: 'brief/CONTENT.md section 11',
    design: 'design/FIGMA-SPEC.md sections 4.2 and 5.9',
    criteria: ['AC-06', 'AC-15', 'AC-16', 'AC-23', 'AC-24', 'AC-38'],
    mustDo: [
      'The email field has a real, programmatically associated label. A placeholder is not a label.',
      'The consent checkbox is unchecked on load and stays unchecked. AC-24 re-reads it two seconds later, so a script that ticks it on DOMContentLoaded fails.',
      'No dark patterns: no pre-ticked box, no guilt copy on the decline path, no invented scarcity.',
      'The form submits nowhere and confirms inline. There is no backend and there will not be one.',
      'h2 "Three emails a year".',
    ],
  },
  {
    slug: 'footer',
    title: 'Footer',
    file: 'src/sections/Footer.astro',
    owns: [],
    copy: 'brief/CONTENT.md section 12',
    design: 'design/FIGMA-SPEC.md sections 4.10 and 5.10',
    criteria: ['AC-06', 'AC-08', 'AC-09', 'AC-28', 'AC-44', 'AC-49'],
    mustDo: [
      'This section provides the page\'s single contentinfo landmark — a <footer>. src/layouts/Base.astro deliberately does not; it renders this section into a named slot. Nothing else on the page may carry that role.',
      'Four columns with the sixteen links from brief/CONTENT.md section 12, plus socials and legal lines.',
      'A visually hidden h2 "Site footer" and four h3 column headings, so the outline in CONTENT section 15 holds.',
      'The fiction disclaimer from CANON section 1, verbatim and unaltered. AC-44 compares it exactly.',
      'The legal block carries data-legal and is the only element on the entire page allowed to use color.text.muted. AC-28 checks ancestry, so muted text anywhere else fails by name.',
    ],
  },
]

// ── Schemas ──────────────────────────────────────────────────────────────────

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    section: { type: 'string', description: 'The data-section slug' },
    filesWritten: { type: 'array', items: { type: 'string' } },
    criteriaAddressed: { type: 'array', items: { type: 'string' }, description: 'AC ids this section now satisfies, in your judgement' },
    hooks: { type: 'array', items: { type: 'string' }, description: 'data-* and id attributes the gates can select on' },
    assumptions: { type: 'array', items: { type: 'string' }, description: 'Ambiguities you had to decide, one line each' },
    openQuestions: { type: 'array', items: { type: 'string' }, description: 'Things that are genuinely missing from the brief and are a question for the client' },
    summary: { type: 'string' },
  },
  required: ['section', 'filesWritten', 'criteriaAddressed', 'summary'],
}

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    section: { type: 'string' },
    clean: { type: 'boolean', description: 'True only if nothing was found and nothing was repaired' },
    repaired: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          what: { type: 'string' },
        },
        required: ['criterion', 'what'],
      },
    },
    unresolved: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterion: { type: 'string' },
          problem: { type: 'string' },
          where: { type: 'string', description: 'file:line or a selector' },
        },
        required: ['criterion', 'problem', 'where'],
      },
    },
    notDecidableHere: { type: 'array', items: { type: 'string' }, description: 'Criteria that only the assembled, rendered page can decide' },
  },
  required: ['section', 'clean', 'repaired', 'unresolved'],
}

const INTEGRATE_SCHEMA = {
  type: 'object',
  properties: {
    mounted: { type: 'array', items: { type: 'string' }, description: 'Section slugs mounted, in DOM order' },
    buildOk: { type: 'boolean' },
    checkExitCode: { type: 'integer' },
    failingGates: { type: 'array', items: { type: 'string' } },
    failureCount: { type: 'integer' },
    firstFailures: { type: 'array', items: { type: 'string' }, description: 'The first few lines of checks/report.md What to fix, verbatim' },
    summary: { type: 'string' },
  },
  required: ['mounted', 'buildOk', 'summary'],
}

// ── Phase 1: scaffold ────────────────────────────────────────────────────────
//
// This IS a barrier, and it is the right one: every section builder consumes
// these files, so none of them can start until they exist. The rule that keeps
// the fan-out safe afterwards is narrow — a component used by more than one
// section is built here, a component used by exactly one section belongs to that
// section's agent. Nothing is written twice, so nothing needs merging.
//
// Most of that shared layer is already in the tree. `git ls-files src/` lists
// Button, Section, SectionHeading and Tag, each committed with a header comment
// recording the gate decision behind it. This phase therefore has one file left
// to write, and its more important job is telling the agent to read the four it
// must not touch.

phase('Scaffold')
log('Scaffolding the primitives more than one section consumes.')

const scaffold = await agent(
  `Build the shared primitives for the TURBINE landing page. You are the only agent writing files
right now; eleven section agents start the moment you finish, and they will consume what you write.

${PROJECT_RULES}

WRITE EXACTLY ONE FILE

  src/components/VisuallyHidden.astro  the standard clip-rect utility: removed from the visual
                                       layer, still in the accessibility tree, not display:none.
                                       Used by the skip link and by the footer's hidden h2.

Four of the five shared primitives already ship in this repository, built and committed:

  src/components/Button.astro          FIGMA-SPEC 4.1, in three variants and two sizes
  src/components/Section.astro         the shell every section is built inside
  src/components/SectionHeading.astro  kicker, heading, intro, with the level as a prop
  src/components/Tag.astro             the mono label: ticker tags, genre tags, tier badges

Read all four before you write anything, and change none of them. Each opens with a header comment
recording the gate decision behind it, and those decisions are not rediscoverable from the spec:
Button rounds the 28px and 20px inline padding FIGMA-SPEC 4.1 asks for up to 32 and 24 because
those two values are not on the ten-step spacing scale AC-32 enforces, and it ships its hover
overlay at opacity 0 so the colour the page actually paints at rest stays on-palette for AC-26.
Section spells data-section and id once so that eleven agents cannot spell them eleven ways.
Rewriting any of that loses the reasoning and turns green gates red.

What you report back is the inventory the eleven builders work from. In summary, say which of the
five exist, and in buttonVariants list the variants Button.astro actually declares — read them out
of the file rather than guessing, because four sections are about to use them.

Also create the empty directories the section agents will write into: src/sections/ and src/data/.
src/components/ and src/scripts/ already exist.

${NO_BUILD_RULE}`,
  {
    label: 'scaffold primitives',
    phase: 'Scaffold',
    schema: {
      type: 'object',
      properties: {
        filesWritten: { type: 'array', items: { type: 'string' } },
        buttonVariants: { type: 'array', items: { type: 'string' } },
        summary: { type: 'string' },
      },
      required: ['filesWritten', 'summary'],
    },
  },
)

if (!scaffold) {
  // Aborting loudly is the right failure here. Without src/components/VisuallyHidden.astro
  // the skip link and the footer's hidden h2 each invent their own, and the
  // divergence this phase exists to prevent is exactly what you get — with no
  // error to explain it.
  throw new Error('Scaffold agent returned nothing, so src/components/VisuallyHidden.astro may not exist and nobody has read the four committed primitives back. Re-run the workflow.')
}

log(`Scaffold wrote ${scaffold.filesWritten.length} file(s). Fanning out to ${SECTIONS.length} sections.`)

// ── Phases 2 and 3: build, then self-verify, one section at a time ───────────
//
// ╭──────────────────────────────────────────────────────────────────────────╮
// │ WHY pipeline() AND NOT parallel() BETWEEN THESE TWO STAGES               │
// ╰──────────────────────────────────────────────────────────────────────────╯
//
// The obvious way to write this is two barriers:
//
//     const built = await parallel(SECTIONS.map(s => () => buildAgent(s)))
//     const checked = await parallel(built.map(b => () => verifyAgent(b)))
//
// It reads well and it is wrong, for two reasons.
//
// The first is latency. The skip link is forty lines; the programme is a three
// day by three stage timetable with a responsive collapse. The barrier makes the
// skip-link verifier wait for the programme builder, and every verifier finishes
// its wait at the same moment, so the second barrier queues eleven agents against
// a concurrency cap of min(16, CPUs - 2), which on a typical laptop is six to
// eight and never eleven. Wall clock for a barrier pair
// is (slowest build) + (slowest verify). Wall clock for a pipeline is the slowest
// single build-then-verify chain. With a spread this wide those are not close.
//
// The second reason is the one that matters more, and it is about feedback, not
// speed. Each verifier repairs the section it just read. A barrier delays every
// repair until the slowest builder is done, which means a section that was
// finished and wrong sits finished and wrong for minutes. With a pipeline the
// skip link is built, read back, and fixed while the programme is still being
// written. Shorter distance between a mistake and the thing that catches it is
// the entire idea this workshop is about; a barrier here lengthens it for no gain.
//
// The test for whether a barrier is justified is narrow: does stage N need
// cross-item context from all of stage N-1? Here it does not. The FAQ verifier
// needs the FAQ. It has no use whatsoever for the venue builder's return value.
//
// Where a barrier IS justified in this script: the scaffold above, because every
// builder consumes it, and the integration below, because mounting eleven
// sections in canonical order genuinely needs all eleven to exist. Both of those
// are cross-item dependencies. The one between build and verify is not.
//
// One more thing that is deliberately absent: isolation: 'worktree'. It costs
// setup time and disk per agent, and it earns that only when agents mutate the
// same files. The `owns` field above makes the file sets disjoint, so a worktree
// would buy nothing except a merge problem that does not currently exist.

phase('Build')

const results = await pipeline(
  SECTIONS,

  // Stage 1 — build.
  async (section) => {
    const built = await agent(
      `Build the ${section.title} section of the TURBINE landing page.

${PROJECT_RULES}

YOUR FILE, AND ONLY YOURS

  ${section.file}${section.owns.length ? '\n  ' + section.owns.join('\n  ') : ''}

Ten other agents are building the other ten sections right now, each owning its own files. Do not
edit src/pages/index.astro, src/layouts/Base.astro, src/styles/, any file listed above as belonging
to another section, or anything under checks/ or design/. If you need something that lives outside
your files, write it down as an open question and carry on. The integration step will wire your
section into the page; you do not mount it yourself.

FIVE SHARED PRIMITIVES ALREADY EXIST. USE THEM, DO NOT REBUILD THEM

  src/components/Section.astro         the shell your section is built inside. Pass it
                                       name="${section.slug}" and it writes data-section and id for
                                       you (AC-06), applies .container-turbine (AC-33) and names the
                                       landmark (AC-09). Do not hand-write any of those three. Its
                                       \`as\` prop renders header, footer, nav or div instead of
                                       section — which is how the nav and the footer become their
                                       landmarks. The skip link is the one section not built inside
                                       it: it is a bare anchor and carries its own data-section.
  src/components/SectionHeading.astro  your h2 and any h3 under it. The level is a prop, so use it
                                       rather than writing a heading wrapper of your own (AC-08).
  src/components/Button.astro          every control and CTA, in three variants and two sizes.
  src/components/Tag.astro             the mono label: ticker tags, genre tags, billing and tier
                                       badges, already carrying on-accent ink (AC-29).
  src/components/VisuallyHidden.astro  the clip-rect utility.

Read the header comment of each one you touch. Each records the gate decision behind it. Do not
create a second Button, a second section wrapper or a second heading component: eleven agents each
inventing one is the exact divergence these five exist to prevent.

WHERE YOUR CONTENT AND YOUR LAYOUT COME FROM

  Copy    ${section.copy}
  Design  ${section.design}
  Tokens  design/tokens/tokens.json, through the generated theme
  Hook    the root element carries data-section="${section.slug}"

THE CRITERIA THIS SECTION IS MEASURED BY

  ${section.criteria.join(', ')}

Read those rows in brief/ACCEPTANCE.md before you write anything. Each row names the program that
decides it and the message it prints when it fails. That message is the repair prompt you would get
back, so writing the section to satisfy the message directly is cheaper than writing it and finding
out later.

WHAT THIS SECTION HAS TO GET RIGHT

${section.mustDo.map((m) => '- ' + m).join('\n')}

${NO_BUILD_RULE}

Return the structured result. Be accurate about criteriaAddressed: claim only what you actually
satisfied. A claim that turns out to be false costs the next agent more than an honest gap does.`,
      {
        label: `build ${section.slug}`,
        phase: 'Build',
        schema: BUILD_SCHEMA,
      },
    )
    return built
  },

  // Stage 2 — self-verify and repair in place.
  //
  // Note what this stage is allowed to decide, which is deliberately narrow.
  // It cannot open a browser, run axe, take a screenshot or run the build — the
  // page is not assembled yet and ten other agents are still writing to the tree.
  // So it checks what a file and a grep can decide, repairs what it can, and
  // reports the rest. Everything it cannot decide is named in notDecidableHere
  // and left for `npm run check`, which is the only thing on this project with
  // the authority to say a section is finished.
  async (built, section) => {
    if (!built) {
      log(`${section.slug}: build agent returned nothing, skipping verify.`)
      return null
    }
    const verified = await agent(
      `Read back the ${section.title} section that was just written and repair what is wrong with it.

You did not write this file. Read it as though you are about to reject it.

  File(s)    ${[section.file].concat(section.owns).join(', ')}
  Copy       ${section.copy}
  Criteria   ${section.criteria.join(', ')}

The builder claims it addressed: ${(built.criteriaAddressed || []).join(', ') || 'nothing in particular'}.
Claims are not evidence. Check them.

${PROJECT_RULES}

WHAT YOU CAN DECIDE HERE, DETERMINISTICALLY

Run these against your file(s) only, and treat any hit as a defect to fix:

  grep -nE '#[0-9a-fA-F]{3,8}|rgb\\(|hsl\\(' <file>     AC-27  colour literal outside the token layer
  grep -nEi 'lorem|ipsum|TODO|TBD|FIXME|placeholder' <file>   AC-40  placeholder text
  grep -nEi 'immersive|journey|unleash|elevate|curated experience' <file>   AC-45  banned words
  grep -nE '[!]' <file>                                 AC-45  exclamation mark in rendered copy
  grep -niw nova <file>                                 AC-46  see CANON section 12

Then read the file and check, by eye and against the sources:

- Every user-facing string traces to ${section.copy}. Not paraphrased, not improved. Quote the
  source line for anything you are unsure about, and if a string is not there, that is an open
  question, not licence to write one.
- The data-* hooks brief/ACCEPTANCE.md depends on are present and spelled exactly right.
  A gate that cannot select an element reports it as missing.
- Heading levels inside this section match brief/CONTENT.md section 15.
- Every aria-controls, aria-labelledby, aria-describedby and for attribute names an id that exists
  in this file, or is documented as belonging to another section.
- Every img has an alt attribute, decorative ones have data-decorative and alt="", and no alt text
  is the filename.
- Nothing from the out-of-scope list in CANON section 11 has quietly appeared.

REPAIR, DO NOT JUST REPORT

Fix what you find, in the same file. Make the smallest change that removes the defect, and fix the
cause rather than the symptom: a contrast problem is fixed by moving to a pairing marked PASS in
design/tokens/CONTRAST.md, never by nudging a value until a number moves.

WHAT YOU CANNOT DECIDE HERE

The page is not assembled and ten other agents are still writing to this tree, so there is no
rendered DOM, no axe run, no screenshot and no Lighthouse score available to you. ${NO_BUILD_RULE}
List every criterion in your set that only the assembled page can settle under notDecidableHere,
and say so plainly rather than guessing. An honest "I could not check AC-15 from here" is worth
more than a confident claim that it passes.`,
      {
        label: `verify ${section.slug}`,
        phase: 'Verify',
        effort: 'medium',
        schema: VERIFY_SCHEMA,
      },
    )
    return { section, built, verified }
  },
)

// ── Phase 4: integrate ───────────────────────────────────────────────────────

phase('Integrate')

const done = results.filter(Boolean)
const missing = SECTIONS.filter((s) => !done.some((d) => d.section.slug === s.slug))
const repairs = done.reduce((n, d) => n + ((d.verified && d.verified.repaired ? d.verified.repaired.length : 0)), 0)
const unresolved = done.flatMap((d) => (d.verified && d.verified.unresolved ? d.verified.unresolved.map((u) => `${d.section.slug}: [${u.criterion}] ${u.problem} (${u.where})`) : []))
const questions = done.flatMap((d) => (d.built && d.built.openQuestions ? d.built.openQuestions.map((q) => `${d.section.slug}: ${q}`) : []))

// No silent caps: if a section fell over, say which one and say it loudly. A
// summary that quietly reports ten of eleven reads as eleven of eleven.
if (missing.length) {
  log(`${missing.length} section(s) did not complete and are NOT in the page: ${missing.map((s) => s.slug).join(', ')}`)
}
log(`${done.length}/${SECTIONS.length} sections built. ${repairs} defect(s) repaired during self-verify, ${unresolved.length} left unresolved.`)

const integration = await agent(
  `Assemble the TURBINE landing page from the sections that were just written, then run the gates.

${PROJECT_RULES}

MOUNT, IN THIS ORDER, AND DO NOT REORDER IT

${SECTIONS.map((s, i) => `  ${String(i + 1).padStart(2, '0')}  ${s.slug.padEnd(11)} ${s.file}`).join('\n')}

CANON section 7 fixes that order and AC-06 reads [data-section] in DOM order and compares it to the
same list. A section in the wrong place fails as loudly as a section that is missing.

Read src/layouts/Base.astro before you mount anything. It does less than you may assume, and its
header comment says why: the header and footer are sections too, rendered by the page rather than by
the layout, so that AC-06 is satisfied in exactly one place. What it provides is <main id="main">,
a named header slot, a named footer slot, and — for now — a hard-coded skip-link anchor.

  src/layouts/Base.astro   one edit only: delete the inline
                           <a class="skip-link" href="#main">Skip to content</a> and put
                           <slot name="skip-link" /> in its place, first inside <body>. Leave the
                           .skip-link rule in src/styles/global.css alone; the component uses it.
                           Do not add a <header> or a <footer> wrapper around the slots. The banner
                           landmark comes from the Nav section and the contentinfo landmark from the
                           Footer section, and wrapping the slots as well makes AC-09 report two of
                           each.
  src/pages/index.astro    mount SkipLink into the skip-link slot, Nav into the header slot, Footer
                           into the footer slot, and everything from hero to newsletter into the
                           default slot, which is inside <main>. Then replace the starter
                           placeholder entirely. Nothing about the starter state
                           survives: not the "Nothing is built yet" heading, not the missing-section
                           list, not its title or description.

Head metadata comes from brief/CONTENT.md section 1. AC-12 wants a title of at most 60 characters
containing TURBINE and a description between 50 and 160 characters.

${missing.length ? `WARNING: these sections were not built and their files may not exist: ${missing.map((s) => s.slug).join(', ')}. Do not write them yourself — mount what exists, and report the gap.` : ''}

THEN RUN THE GATES, WHICH IS THE ONLY VERDICT THAT COUNTS

  npm run build
  npm run check

Eleven agents have just told us their sections are correct. None of them ran a browser, none of them
ran axe, and none of them saw the assembled page. Everything they said is a claim until this command
returns an exit code.

Read checks/report.md. Do not fix anything yet — this run exists to produce an accurate starting
report for the loop, not to begin repairing inside a workflow. Report the exit code, the gates that
failed, the total failure count and the first few failures verbatim.

Finally, append an iteration block to loop/PROGRESS.md in the format that file specifies. Include:

- that the page was assembled by a section fan-out, not by a single pass
- ${repairs} defect(s) repaired by the self-verify stage${unresolved.length ? ', and these left unresolved:\n' + unresolved.map((u) => '  - ' + u).join('\n') : ''}
${questions.length ? '- these open questions the section agents raised, which are questions for the client, not gaps to fill:\n' + questions.map((q) => '  - ' + q).join('\n') : '- no open questions were raised'}

Write it for someone who was not here, because the next iteration will not share your context.`,
  {
    label: 'integrate and run the gates',
    phase: 'Integrate',
    effort: 'high',
    schema: INTEGRATE_SCHEMA,
  },
)

const green = Boolean(integration) && integration.checkExitCode === 0

if (!integration) {
  log('The integration agent returned nothing. The section files exist on disk but nothing mounted them, so src/pages/index.astro is still the starter page. Re-run this workflow, or mount them by hand in the order printed above.')
} else if (green) {
  log('npm run check exited 0. Every gate is green, which means no known defect — not that the page is finished. The next defects are the ones no gate can see: loop/workflows/adversarial-review.mjs.')
} else {
  log(`npm run check exited ${integration.checkExitCode}. ${integration.failureCount || 0} failure(s) across ${(integration.failingGates || []).join(', ') || 'the gates'}. That report is the loop's task list: bash loop/ralph.sh`)
}

const summary = {
  ok: green,
  stage: integration ? 'integrated' : 'integrate-failed',
  sectionsBuilt: done.map((d) => d.section.slug),
  sectionsMissing: missing.map((s) => s.slug),
  mounted: integration ? integration.mounted : [],
  repairsDuringVerify: repairs,
  unresolved,
  openQuestions: questions,
  gates: integration
    ? {
        exitCode: integration.checkExitCode,
        failing: integration.failingGates || [],
        failureCount: integration.failureCount || 0,
        firstFailures: integration.firstFailures || [],
      }
    : null,
  nextStep: green
    ? 'Run loop/workflows/adversarial-review.mjs. The gates are green; that is where the remaining defects are.'
    : 'Run bash loop/ralph.sh. The report is the task list and the loop is the thing that works through it.',
}

log('Result:\n' + JSON.stringify(summary, null, 2))

// Read this one carefully, because it is the kind of claim this repository keeps
// telling you to check.
//
// This script returns NOTHING to the Workflow tool. The runtime splices the body
// into `async () => { 'use strict'; <body> }`, so a trailing expression statement
// is evaluated and then discarded; only a `return` produces a result. The bare
// `summary` below therefore does not reach the caller, and the line above it is
// how the summary actually gets out: `log()` prints the whole object into the run
// log, where the invoking agent and the person watching both read it.
//
// It is written this way on purpose. Top-level `return` is legal in the Workflow
// runtime — the loader parses with allowReturnOutsideFunction — and illegal in a
// plain ES module, so a file that used it could not be checked with
// `node --check`. These two scripts are teaching material before they are
// tooling, and a reader being able to run
// `node --check loop/workflows/build-sections.mjs` is worth more than a return
// value that the log already carries. The bare expression stays as the marker of
// where the result would go.
summary
