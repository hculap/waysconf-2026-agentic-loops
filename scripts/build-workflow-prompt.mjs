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

Because this is one run rather than seven messages, these things change:
- You stop and wait for me only at the end of phase 02, for my answer to point 6, and
  wherever a rule says to stop and ask. Where a phase says to show me a plan and wait for
  my approval, write the plan into notes.md and carry on.
- Where a phase says I will clear the session, do not stop: start the next phase by reading
  notes.md and design/data again.
- In phase 04 you build the sections in parallel, one subagent each, instead of one after
  another, and you review the page against design/data yourself instead of waiting for my
  review.
- Phase 05 is not the end of the run: when npm run check exits 0, continue to phase 06.
- In phase 07 the review is done by subagents that start with a fresh context, and you fix
  the findings that survive without waiting for me to choose.`,
    names: ['START', 'LOOK', 'ARM', 'BUILD', 'REPAIR', 'SHIP', 'ATTACK'],
    phase: (n, name) => `PHASE ${n} — ${name}`,
    bars: [
      'Before moving on: the development server is running and you have told me its address.',
      'Before moving on: npm run design has written design/data, notes.md exists, and I have answered point 6.',
      'Before moving on: npm run check runs, and it fails on the project as it is.',
      'Before moving on: every section in design/data/sections.json is built, the project builds with no errors, and notes.md has a "Design review" section.',
      'Before moving on: npm run check exits 0.',
      'Before moving on: the live URL returns 200, serves the page you built, and npm run check -- --url passes against it.',
      'That is the end of the run: the findings that survived are fixed, npm run check still exits 0, the page is deployed again, and npm run check -- --url passes against the live address.',
    ],
    replace: {
      4: [
        {
          from: `Build the whole page in one go: every section in design/data/sections.json, in that order. Do
not stop between sections to ask me. When it is done, tell me which sections you built, one
line each, and the address to open.`,
          to: `Build every section in design/data/sections.json at the same time, one subagent per section,
then put them together in that order. Do not stop between sections to ask me. When it is done,
tell me which sections you built, one line each, and the address to open.`,
        },
        {
          from: `Then wait while I review the page. When I tell you my review, write it into notes.md under
"Design review", and do not fix anything yet. Then commit everything with a message that says
what this step did, and push. Tell me the step is done, so I can clear the session.`,
          to: `Then review the page yourself: compare what the browser shows with design/data, and write
every difference into notes.md under "Design review". Do not fix anything yet. Then commit
everything with a message that says what this step did, and push.`,
        },
      ],
      5: [
        {
          from: `The items under "Design review" in notes.md are problems I found by looking at the page.
Treat the ones that design/data supports like failures in the report and fix them too. For
each one design/data does not support, write one line into notes.md saying so, and leave it.`,
          to: `The items under "Design review" in notes.md are the differences you found in phase 04.
Treat the ones that design/data supports like failures in the report and fix them too. For
each one design/data does not support, write one line into notes.md saying so, and leave it.`,
        },
        {
          from: `If npm run check exits 0 and no Design review item that design/data supports is left, commit
everything with a message that says the check passes, push, and tell me we are finished.`,
          to: `If npm run check exits 0 and no Design review item that design/data supports is left, commit
everything with a message that says the check passes, push, and continue to phase 06.`,
        },
      ],
      7: [
        {
          from: `Do not fix anything yet. I want to decide which of these are real first.`,
          to: `Then fix the findings that survived and run npm run check again; it must still exit 0.
Write the findings and what you fixed into notes.md, commit everything with a message that
says which findings were fixed, and push. Then deploy again to the same site with
netlify deploy --prod --dir=dist --site <the site name in notes.md>, and run
npm run check -- --url against the live address.`,
        },
      ],
    },
    insertBefore: {
      7: [
        {
          before: `Report only the findings that survive all three.`,
          text: `In this phase, do it with subagents, each starting with a fresh context that has not seen
the page being built: one per place in the list above, looking in parallel, and then, for
every candidate they find, a separate subagent whose only job is to argue against it from
those three angles.`,
        },
      ],
    },
    footer: `Rules for the whole run:
- Announce each phase as you enter it, and say how many subagents you are using and why.
- If a phase cannot finish, stop there and tell me why. Do not carry on into the next one
  with the previous one broken.
- Keep notes.md current as you go. If we have to start a fresh session, notes.md and
  design/data are all it will have.`,
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

Ponieważ to jeden przebieg zamiast siedmiu wiadomości, zmieniają się te rzeczy:
- Zatrzymujesz się i czekasz na mnie tylko na końcu fazy 02, na moją odpowiedź na punkt 6,
  i tam, gdzie reguła mówi, żeby się zatrzymać i zapytać. Tam, gdzie faza każe pokazać mi
  plan i czekać na zgodę, zapisz plan do notes.md i jedź dalej.
- Tam, gdzie faza mówi, że wyczyszczę sesję, nie zatrzymuj się: zacznij następną fazę od
  ponownego przeczytania notes.md i design/data.
- W fazie 04 budujesz sekcje równolegle, po jednym subagencie na każdą, zamiast jedna po
  drugiej, i sam przeglądasz stronę względem design/data, zamiast czekać na mój przegląd.
- Faza 05 nie jest końcem przebiegu: kiedy npm run check skończy się kodem 0, przejdź do
  fazy 06.
- W fazie 07 przegląd robią subagenci, którzy zaczynają ze świeżym kontekstem, a znaleziska,
  które przetrwały, naprawiasz bez czekania, aż wybiorę.`,
    names: ['START', 'POPATRZ', 'UZBRÓJ', 'BUDUJ', 'NAPRAWIAJ', 'WYSTAW', 'ATAKUJ'],
    phase: (n, name) => `FAZA ${n} — ${name}`,
    bars: [
      'Zanim pójdziesz dalej: serwer deweloperski działa i podałeś mi jego adres.',
      'Zanim pójdziesz dalej: npm run design zapisał design/data, notes.md istnieje, a ja odpowiedziałem na punkt 6.',
      'Zanim pójdziesz dalej: npm run check uruchamia się i nie przechodzi na projekcie takim, jaki jest.',
      'Zanim pójdziesz dalej: każda sekcja z design/data/sections.json jest zbudowana, projekt buduje się bez błędów, a notes.md ma sekcję „Design review".',
      'Zanim pójdziesz dalej: npm run check kończy się kodem 0.',
      'Zanim pójdziesz dalej: adres na żywo zwraca 200, serwuje stronę, którą zbudowałeś, a npm run check -- --url przechodzi na nim.',
      'To jest koniec przebiegu: znaleziska, które przetrwały, są naprawione, npm run check nadal kończy się kodem 0, strona jest opublikowana jeszcze raz, a npm run check -- --url przechodzi na adresie na żywo.',
    ],
    replace: {
      4: [
        {
          from: `Zbuduj całą stronę za jednym razem: każdą sekcję z design/data/sections.json, w tej
kolejności. Nie zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy skończysz, powiedz mi,
które sekcje zbudowałeś, po jednej linijce, i podaj adres do otwarcia.`,
          to: `Zbuduj wszystkie sekcje z design/data/sections.json naraz, po jednym subagencie na sekcję,
a potem złóż je w tej kolejności. Nie zatrzymuj się między sekcjami, żeby mnie pytać. Kiedy
skończysz, powiedz mi, które sekcje zbudowałeś, po jednej linijce, i podaj adres do otwarcia.`,
        },
        {
          from: `Potem poczekaj, aż przejrzę stronę. Kiedy podam ci mój przegląd, zapisz go do notes.md pod
nagłówkiem „Design review" i jeszcze niczego nie naprawiaj. Potem zrób commit wszystkiego
z opisem, co zrobił ten krok, i zrób push. Powiedz mi, że krok jest skończony, żebym mógł
wyczyścić sesję.`,
          to: `Potem sam przejrzyj stronę: porównaj to, co pokazuje przeglądarka, z design/data i zapisz
każdą różnicę do notes.md pod nagłówkiem „Design review". Jeszcze niczego nie naprawiaj.
Potem zrób commit wszystkiego z opisem, co zrobił ten krok, i zrób push.`,
        },
      ],
      5: [
        {
          from: `Pozycje pod nagłówkiem „Design review" w notes.md to problemy, które znalazłem, oglądając
stronę. Te, które mają pokrycie w design/data, traktuj jak błędy z raportu i też je napraw. Przy
każdej, która nie ma pokrycia w design/data, zapisz do notes.md jedną linijkę, że go nie ma,
i zostaw ją.`,
          to: `Pozycje pod nagłówkiem „Design review" w notes.md to różnice, które znalazłeś w fazie 04.
Te, które mają pokrycie w design/data, traktuj jak błędy z raportu i też je napraw. Przy
każdej, która nie ma pokrycia w design/data, zapisz do notes.md jedną linijkę, że go nie ma,
i zostaw ją.`,
        },
        {
          from: `Jeśli npm run check kończy się kodem 0 i nie została żadna pozycja z „Design review", która ma
pokrycie w design/data, zrób commit wszystkiego z opisem, że test przechodzi, zrób push
i powiedz mi, że skończyliśmy.`,
          to: `Jeśli npm run check kończy się kodem 0 i nie została żadna pozycja z „Design review", która ma
pokrycie w design/data, zrób commit wszystkiego z opisem, że test przechodzi, zrób push
i przejdź do fazy 06.`,
        },
      ],
      7: [
        {
          from: `Nie naprawiaj jeszcze niczego. Najpierw chcę zdecydować, które z nich są prawdziwe.`,
          to: `Potem napraw znaleziska, które przetrwały, i uruchom npm run check jeszcze raz; musi nadal
kończyć się kodem 0. Zapisz znaleziska i to, co naprawiłeś, do notes.md, zrób commit
wszystkiego z opisem, które znaleziska naprawiłeś, i zrób push. Potem opublikuj jeszcze raz
na tę samą stronę przez netlify deploy --prod --dir=dist --site <nazwa strony z notes.md>
i uruchom npm run check -- --url na adresie na żywo.`,
        },
      ],
    },
    insertBefore: {
      7: [
        {
          before: `Zgłoś tylko te znaleziska, które przeżyją wszystkie trzy.`,
          text: `W tej fazie zrób to subagentami, z których każdy zaczyna ze świeżym kontekstem, który nie
widział budowania strony: po jednym na każde miejsce z listy powyżej, szukających równolegle,
a potem, dla każdego kandydata, którego znajdą, osobny subagent, którego jedynym zadaniem
jest argumentować przeciwko niemu z tych trzech stron.`,
        },
      ],
    },
    footer: `Reguły na cały przebieg:
- Ogłaszaj każdą fazę, kiedy w nią wchodzisz, i mów, ilu subagentów używasz i dlaczego.
- Jeśli faza nie może się skończyć, zatrzymaj się na niej i powiedz dlaczego. Nie idź
  dalej z poprzednią zepsutą.
- Utrzymuj notes.md na bieżąco. Jeśli będziemy musieli zacząć nową sesję, notes.md
  i design/data to wszystko, co będzie miała.`,
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
