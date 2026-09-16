<script setup lang="ts">
/**
 * One prompt on a slide: its opening lines, a Copy button holding the whole thing, and a
 * link to that prompt's section on the workshop page.
 *
 * The text is bundled from prompts/ by scripts/build-deck-prompts.mjs, so the button works
 * with no network — a conference is exactly the place where the network is not there — and
 * the slide cannot drift from what the room is pasting.
 */
import { computed, ref } from 'vue'
import { promptByNumber } from '../prompts.generated'

const props = defineProps<{ n: string }>()
const prompt = computed(() => promptByNumber(props.n))
const hidden = computed(() => prompt.value.lines - prompt.value.preview.split('\n').length)

const state = ref<'idle' | 'copied' | 'failed'>('idle')
let timer: ReturnType<typeof setTimeout> | undefined

async function copy() {
  const text = prompt.value.text
  let ok = false
  try {
    // Only available in a secure context; localhost and the Netlify site both are, but a
    // deck opened from a file:// URL is not, and that is a real way to present in a hurry.
    await navigator.clipboard.writeText(text)
    ok = true
  } catch {
    ok = legacyCopy(text)
  }
  state.value = ok ? 'copied' : 'failed'
  clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'idle'), 2000)
}

function legacyCopy(text: string) {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.cssText = 'position:fixed;top:-1000px;opacity:0'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  return ok
}

const label = computed(() =>
  state.value === 'copied' ? 'Copied' : state.value === 'failed' ? 'Press Ctrl+C' : 'Copy',
)
</script>

<template>
  <div class="promptcard">
    <div class="promptcard__bar">
      <span class="promptcard__id">Prompt {{ prompt.n }}</span>
      <span class="promptcard__gap" />
      <button
        class="promptcard__copy"
        type="button"
        :class="{ 'is-done': state === 'copied' }"
        @click="copy"
      >
        {{ label }}
      </button>
      <a class="promptcard__link" :href="prompt.href" target="_blank" rel="noopener">Full text ↗</a>
    </div>

    <pre class="promptcard__body"><code>{{ prompt.preview }}</code></pre>

    <p class="promptcard__foot">
      <template v-if="hidden > 0">… {{ hidden }} more lines. </template>Copy takes the whole
      prompt<template v-if="prompt.parts > 1">; a second part follows it on the page</template>.
    </p>
  </div>
</template>

<style scoped>
.promptcard {
  border: 1px solid var(--sp-line);
  border-radius: 10px;
  background: var(--sp-surface);
  overflow: hidden;
}

.promptcard__bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.7rem;
  border-bottom: 1px solid var(--sp-line);
  background: var(--sp-raised);
  font-size: 0.78rem;
  line-height: 1.2;
}

.promptcard__id {
  font-family: var(--sp-font-mono, 'JetBrains Mono', monospace);
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--sp-accent-2);
  text-transform: uppercase;
}

.promptcard__gap {
  flex: 1;
}

.promptcard__copy {
  border: 1px solid var(--sp-line-strong);
  border-radius: 6px;
  padding: 0.18rem 0.7rem;
  background: var(--sp-surface);
  color: var(--sp-fg-2);
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
}

.promptcard__copy:hover {
  border-color: var(--sp-accent-2);
  color: var(--sp-fg);
}

.promptcard__copy.is-done {
  border-color: var(--sp-accent);
  color: var(--sp-accent-2);
}

.promptcard__link {
  color: var(--sp-accent-2);
  font-size: 0.74rem;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
  white-space: nowrap;
}

/* Slidev gives every <pre> a border, a background and a radius of its own; inside a card that
   reads as a second box drawn by mistake. */
.promptcard__body {
  margin: 0;
  padding: 0.7rem 0.85rem 0.4rem;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  font-family: var(--sp-font-mono, 'JetBrains Mono', monospace);
  font-size: 0.74rem;
  line-height: 1.45;
  color: var(--sp-fg-2);
  /* Grey-scale antialiasing: at this size subpixel rendering tints the glyphs, and a
     projector exaggerates it into what looks like syntax highlighting nobody asked for. */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  white-space: pre-wrap;
  overflow: hidden;
}

.promptcard__body code {
  color: inherit;
  background: transparent;
  font-size: inherit;
}

.promptcard__foot {
  margin: 0;
  padding: 0 0.85rem 0.6rem;
  font-size: 0.7rem;
  color: var(--sp-fg-3);
}
</style>
