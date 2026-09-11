#!/usr/bin/env node
/**
 * Verify that the six checkpoint branches exist on the workshop remote.
 *
 *   node scripts/check-checkpoints.mjs [remote]      default remote: origin
 *
 * This is a maintainer check, not a gate. Run it before the template link goes out.
 *
 * CHECKPOINTS.md is 250 lines of instructions that all end in `git checkout step-N`,
 * and three other places send people the same way: HELPER-CRIB-SHEET.md makes it
 * Rescue A, .devcontainer/welcome.sh prints it on attach, and the printed handout
 * has it on the front. Every one of those routes fails with
 *
 *   error: pathspec 'step-3' did not match any file(s) known to git
 *
 * if the branches are not on the remote — and so does the recovery CHECKPOINTS.md §7
 * documents, because it fetches from the same repository. The failure lands on
 * somebody who is already behind and already reaching for the emergency exit, so the
 * branches have to be pushed and checked out from a clean clone before publication,
 * not assembled in the room.
 *
 * Exits 0 when all six are present, 1 otherwise, and names what is missing.
 */

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const run = promisify(execFile)

const EXPECTED = ['step-0', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5']
const remote = process.argv[2] ?? 'origin'

async function heads(target) {
  const { stdout } = await run('git', ['ls-remote', '--heads', target])
  return new Set(
    stdout
      .split('\n')
      .map((line) => line.split('refs/heads/')[1])
      .filter(Boolean),
  )
}

async function main() {
  let present
  try {
    present = await heads(remote)
  } catch (err) {
    console.error(`could not read ${remote}: ${err.message.trim()}`)
    process.exit(1)
  }

  const missing = EXPECTED.filter((branch) => !present.has(branch))

  for (const branch of EXPECTED) {
    console.log(`  ${present.has(branch) ? 'present' : 'MISSING'}  ${branch}`)
  }

  if (missing.length === 0) {
    console.log(`\nall six checkpoint branches are on ${remote}`)
    return
  }

  console.error(
    `\n${missing.length} of ${EXPECTED.length} checkpoint branches are not on ${remote}: ` +
      `${missing.join(', ')}.\n` +
      'Until they are pushed, CHECKPOINTS.md, HELPER-CRIB-SHEET.md Rescue A, the handout and\n' +
      '.devcontainer/welcome.sh are all telling attendees to run a command that fails.',
  )
  process.exit(1)
}

main()
