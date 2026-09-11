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
  },
  devToolbar: {
    enabled: false,
  },
})
