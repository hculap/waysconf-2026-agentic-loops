// @ts-check
import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'

// Static output only. There is no server, no API route and no database in this project —
// the whole point is that the deliverable is a folder of files that Netlify can serve.
export default defineConfig({
  site: 'https://turbine-festival.netlify.app',
  output: 'static',
  build: {
    // Keep the emitted HTML readable. Participants will open dist/index.html and look at it,
    // and the structure gate parses it.
    format: 'directory',
    inlineStylesheets: 'never',
  },
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Astro inlines any bundled <script> under this size into the HTML. Netlify serves the
      // page with `script-src 'self'`, which blocks inline scripts, so in production the nav
      // toggle, the lineup tabs, the FAQ accordion and the newsletter form were all dead.
      // Zero keeps every script a same-origin file under /_astro/, which the policy allows.
      assetsInlineLimit: 0,
    },
  },
  devToolbar: {
    enabled: false,
  },
})
