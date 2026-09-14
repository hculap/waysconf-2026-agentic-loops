#!/usr/bin/env node
/**
 * Prompt 08 is prompts 01–07, as one message.
 *
 *   node scripts/build-workflow-prompt.mjs           rewrite the block in 08, EN and PL
 *   node scripts/build-workflow-prompt.mjs --check   exit 1 if 08 has drifted from 01–07
 *
 * The workshop teaches two shapes: seven prompts pasted by hand, and the same job handed over
 * as one workflow. The claim that they are the same job only holds if phase 03 of the workflow
 * says what prompt 03 says. Maintained by hand, that claim lasts until the first edit to a
 * prompt — the previous 08 had six phases, skipped prompt 01 entirely, and paraphrased every
 * other one into something weaker: no four-part failure report, no three-attempts rule, no
 * list of the places a checker cannot see.
 *
 * So the text block in 08 is generated. Every phase is the text block of its prompt, paragraph
 * for paragraph. The differences are declared below, per language, and each one names the
 * exact paragraph it replaces — if a prompt is rewritten so that paragraph no longer exists,
 * the build fails and says so, instead of silently shipping a workflow that no longer matches.
 *
 * Only the ```text block is generated. The prose around it in 08 is written by hand.
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHECK = process.argv.includes('--check')

// ── per-language shape of the workflow ──────────────────────────────────────

const LOCALES = {
  en: {
    dir: 'prompts',
    header: `ultracode. I want you to do a whole job in seven phases. Each phase is one of the seven
workshop prompts, in the same order, with the same words and the same rules. Work through
them on your own and do not skip ahead.

Use a dynamic workflow: inside a phase, spawn as many subagents as the work needs and run
them in parallel, deciding how many from what you find rather than from a number I gave
you — one per section, one per review lens, one per finding, whatever the phase calls for.
Merge their results before you leave the phase.

Because this is one run rather than seven messages, exactly two things change:
- In phase 03 you do not wait for me after each section. You build the sections in
  parallel, one subagent each.
- You stop and wait for me only where a phase tells you to: at the end of phase 02, and
  whenever a rule says to stop and ask. Everywhere else, keep going.`,
    names: ['START', 'LOOK', 'BUILD', 'ARM', 'REPAIR', 'SHIP', 'ATTACK'],
    phase: (n, name) => `PHASE ${n} — ${name}`,
    bars: [
      'Before moving on: the development server is running and you have told me its address.',
      'Before moving on: notes.md exists, and I have answered point 6.',
      'Before moving on: every section in notes.md is built, and the project builds with no errors.',
      'Before moving on: npm run check runs and reports something. It will be red. Good.',
      'Before moving on: npm run check exits 0.',
      'Before moving on: the live URL returns 200, serves the page you built, and npm run check -- --url passes against it.',
      'That is the end of the run.',
    ],
    replace: {
      3: [
        {
          from: `One section at a time, in the order in notes.md. After each section, tell me in one
sentence what you built, and then STOP and wait for me to say "next". Do not build two
sections in one go, however small they look.`,
          to: `Build every section in notes.md, one subagent per section, all in parallel, then put
them together in the order in notes.md. Do not wait for me between sections.`,
        },
      ],
    },
    insertBefore: {
      7: [
        {
          before: `Report only the findings that survive all three.`,
          text: `In this phase, do it with subagents: one per place in the list above, looking in
parallel, and then, for every candidate they find, a separate subagent whose only job is
to argue against it from those three angles.`,
        },
      ],
    },
    footer: `Rules for the whole run:
- Announce each phase as you enter it, and say how many subagents you are using and why.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep notes.md current as you go. If we have to start a fresh session, notes.md is all it
  will have.`,
  },

  pl: {
    dir: 'prompts/pl',
    header: `ultracode. Chcę, żebyś wykonał całą robotę w siedmiu fazach. Każda faza to jeden z siedmiu
promptów z warsztatu, w tej samej kolejności, tymi samymi słowami i z tymi samymi regułami.
Przejdź je samodzielnie i nie przeskakuj do przodu.

Użyj dynamicznego workflow: wewnątrz fazy powołuj tyle subagentów, ile wymaga robota, i
uruchamiaj je równolegle, decydując o liczbie na podstawie tego, co zastaniesz, a nie
liczby, którą ci podałem — jeden na sekcję, jeden na soczewkę review, jeden na znalezisko,
czego akurat wymaga faza. Scal ich wyniki, zanim z niej wyjdziesz.

Ponieważ to jeden przebieg zamiast siedmiu wiadomości, zmieniają się dokładnie dwie rzeczy:
- W fazie 03 nie czekasz na mnie po każdej sekcji. Budujesz sekcje równolegle, po jednym
  subagencie na każdą.
- Zatrzymujesz się i czekasz na mnie tylko tam, gdzie faza ci to każe: na końcu fazy 02 i
  zawsze, gdy reguła mówi, żeby się zatrzymać i zapytać. Wszędzie indziej jedziesz dalej.`,
    names: ['START', 'POPATRZ', 'BUDUJ', 'UZBRÓJ', 'NAPRAWIAJ', 'WYSTAW', 'ATAKUJ'],
    phase: (n, name) => `FAZA ${n} — ${name}`,
    bars: [
      'Zanim pójdziesz dalej: serwer deweloperski działa i podałeś mi jego adres.',
      'Zanim pójdziesz dalej: notes.md istnieje, a ja odpowiedziałem na punkt 6.',
      'Zanim pójdziesz dalej: każda sekcja z notes.md jest zbudowana, a projekt buduje się bez błędów.',
      'Zanim pójdziesz dalej: npm run check uruchamia się i coś raportuje. Będzie czerwono. Dobrze.',
      'Zanim pójdziesz dalej: npm run check kończy się kodem 0.',
      'Zanim pójdziesz dalej: adres na żywo zwraca 200, serwuje stronę, którą zbudowałeś, a npm run check -- --url przechodzi na nim.',
      'To jest koniec przebiegu.',
    ],
    replace: {
      3: [
        {
          from: `Jedna sekcja naraz, w kolejności z notes.md. Po każdej sekcji powiedz mi jednym zdaniem,
co zbudowałeś, a potem ZATRZYMAJ SIĘ i czekaj, aż powiem „dalej". Nie buduj dwóch sekcji
za jednym razem, choćby wyglądały na drobne.`,
          to: `Zbuduj każdą sekcję z notes.md, po jednym subagencie na sekcję, wszystkie równolegle, a
potem złóż je w kolejności z notes.md. Nie czekaj na mnie między sekcjami.`,
        },
      ],
    },
    insertBefore: {
      7: [
        {
          before: `Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy.`,
          text: `W tej fazie zrób to subagentami: po jednym na każde miejsce z listy powyżej, szukających
równolegle, a potem, dla każdego kandydata, którego znajdą, osobny subagent, którego
jedynym zadaniem jest argumentować przeciwko niemu z tych trzech stron.`,
        },
      ],
    },
    footer: `Reguły na cały przebieg:
- Ogłaszaj każdą fazę, kiedy w nią wchodzisz, i mów, ilu subagentów używasz i dlaczego.
- Jeśli faza nie może się skończyć, zatrzymaj się na niej i powiedz dlaczego. Nie idź
  dalej z poprzednią zepsutą.
- Utrzymuj notes.md na bieżąco. Jeśli będziemy musieli zacząć nową sesję, notes.md jest
  wszystkim, co będzie miała.`,
  },
}

// ── helpers ──────────────────────────────────────────────────────────────────

const TEXT_BLOCK = /```text\n([\s\S]*?)\n```/

/** Paragraphs, with their original line wrapping preserved. */
const paragraphs = (block) => block.split(/\n\s*\n/).map((p) => p.replace(/\s+$/, ''))

const norm = (s) => s.replace(/\s+/g, ' ').trim()

async function promptBlock(dir, n) {
  const file = (await readdir(join(ROOT, dir))).find((f) => f.startsWith(`0${n}-`))
  if (!file) throw new Error(`${dir}: no prompt 0${n}`)
  const md = await readFile(join(ROOT, dir, file), 'utf8')
  const block = md.match(TEXT_BLOCK)?.[1]
  if (!block) throw new Error(`${dir}/${file}: no \`\`\`text block`)
  return { file, block }
}

async function compose(lang) {
  const L = LOCALES[lang]
  const out = [L.header]

  for (let n = 1; n <= 7; n++) {
    const { file, block } = await promptBlock(L.dir, n)
    let paras = paragraphs(block)

    for (const { from, to } of L.replace[n] ?? []) {
      const i = paras.findIndex((p) => norm(p) === norm(from))
      if (i < 0) {
        throw new Error(
          `${L.dir}/${file}: the paragraph phase 0${n} replaces is no longer in the prompt.\n` +
            `  expected: ${norm(from).slice(0, 90)}…\n` +
            '  Update the declared difference in scripts/build-workflow-prompt.mjs — do not just delete it.',
        )
      }
      paras[i] = to
    }

    for (const { before, text } of L.insertBefore[n] ?? []) {
      const i = paras.findIndex((p) => norm(p).startsWith(norm(before)))
      if (i < 0) {
        throw new Error(`${L.dir}/${file}: cannot find the paragraph starting "${before}" to insert before`)
      }
      paras = [...paras.slice(0, i), text, ...paras.slice(i)]
    }

    out.push(`${L.phase(`0${n}`, L.names[n - 1])}\n\n${paras.join('\n\n')}\n\n${L.bars[n - 1]}`)
  }

  out.push(L.footer)
  return out.join('\n\n')
}

// ── run ──────────────────────────────────────────────────────────────────────

let drift = 0
for (const lang of Object.keys(LOCALES)) {
  const L = LOCALES[lang]
  const file = (await readdir(join(ROOT, L.dir))).find((f) => f.startsWith('08-'))
  const path = join(ROOT, L.dir, file)
  const md = await readFile(path, 'utf8')
  if (!TEXT_BLOCK.test(md)) throw new Error(`${L.dir}/${file}: no \`\`\`text block to replace`)

  const block = await compose(lang)
  const next = md.replace(TEXT_BLOCK, () => '```text\n' + block + '\n```')
  const lines = block.split('\n').length

  if (next === md) {
    console.log(`  ${lang}  ${L.dir}/${file}  in step with prompts 01–07  (${lines} lines)`)
    continue
  }
  if (CHECK) {
    drift++
    console.log(`  ${lang}  ${L.dir}/${file}  DRIFTED from prompts 01–07`)
  } else {
    await writeFile(path, next)
    console.log(`  ${lang}  ${L.dir}/${file}  rewritten from prompts 01–07  (${lines} lines)`)
  }
}

if (CHECK && drift) {
  console.log('\nFAIL — prompt 08 no longer says what prompts 01–07 say. Run: node scripts/build-workflow-prompt.mjs')
  process.exit(1)
}
if (CHECK) console.log('\nPASS — prompt 08 is prompts 01–07, phase for phase, with only the declared differences')
