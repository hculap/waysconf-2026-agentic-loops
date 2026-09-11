import { defineShikiSetup } from '@slidev/types'

/**
 * Slidev's default is vitesse-dark, whose string and comment tokens sit around 2.4:1
 * against this deck's code surface. That is fine on a laptop in a dark room and mud on a
 * projector in a lit one — `checks/deck.mjs` measured 2.36:1 on the tokens.json slide and
 * failed it.
 *
 * github-dark is the same kind of theme with more separation between the token colours
 * and the ground. Both entries are the dark theme on purpose: this deck is dark-only, and
 * `colorSchema: dark` in the frontmatter pins the rest of the UI the same way.
 *
 * If a future change drops a token below 3:1 again, the gate names the slide.
 */
export default defineShikiSetup(() => ({
  themes: {
    dark: 'github-dark',
    light: 'github-dark',
  },
}))
