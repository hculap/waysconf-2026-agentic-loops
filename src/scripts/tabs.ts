/**
 * Lineup day filter — the WAI-ARIA tabs pattern, added to markup that already works.
 *
 * Progressive enhancement runs one way only. The page ships with the tab list
 * carrying `hidden`, every artist card visible and the status line already reading
 * "Showing all twelve artists." (CONTENT 6). This module unhides the tab list and
 * takes over the filtering. With scripting off nothing here runs, the tab list stays
 * hidden, and all twelve artists are reachable — which is the requirement, because
 * tabs that filter a list are an affordance and the list is the content.
 *
 * There is one tabpanel, not four. Four panels would mean four copies of the twelve
 * cards, and duplicate `data-artist` values and duplicate ids fail AC-39 and AC-14.
 * Every tab therefore points its `aria-controls` at the same panel, and the panel's
 * `aria-labelledby` is repointed at whichever tab is selected, so the panel is always
 * named by the filter that produced it (AC-18).
 *
 * Expected markup:
 *
 *   <div data-tabs>
 *     <div data-tabs-list role="tablist" aria-label="Filter the lineup by day" hidden>
 *       <button data-tab data-tab-value="all" data-tab-status="Showing all twelve artists."
 *               type="button" role="tab" id="lineup-tab-all"
 *               aria-controls="lineup-panel" aria-selected="true" aria-label="All twelve artists">All</button>
 *       <button data-tab data-tab-value="fri" data-tab-status="Showing four artists playing Friday 12 June."
 *               type="button" role="tab" id="lineup-tab-fri"
 *               aria-controls="lineup-panel" aria-selected="false" aria-label="Friday 12 June">Fri</button>
 *       ...
 *     </div>
 *     <p data-tabs-status aria-live="polite">Showing all twelve artists.</p>
 *     <div data-tabs-panel id="lineup-panel" role="tabpanel" aria-labelledby="lineup-tab-all">
 *       <article data-tab-item data-day="fri">...</article>
 *       ...
 *     </div>
 *   </div>
 *
 * `data-tab-value="all"` is the one reserved value: it matches every item. Every
 * other value is compared against an item's `data-day`. The status strings live in
 * the markup rather than here, because CONTENT 6 owns those words and this file
 * must not be a second place they are written down.
 */

const ALL = 'all'

interface TabSet {
  list: HTMLElement
  tabs: HTMLElement[]
  panel: HTMLElement | null
  items: HTMLElement[]
  status: HTMLElement | null
}

function readTabSet(root: HTMLElement): TabSet | null {
  const list = root.querySelector<HTMLElement>('[data-tabs-list]')
  const tabs = Array.from(root.querySelectorAll<HTMLElement>('[data-tab]'))
  if (!list || tabs.length === 0) return null

  return {
    list,
    tabs,
    panel: root.querySelector<HTMLElement>('[data-tabs-panel]'),
    items: Array.from(root.querySelectorAll<HTMLElement>('[data-tab-item]')),
    status: root.querySelector<HTMLElement>('[data-tabs-status]'),
  }
}

function select(set: TabSet, target: HTMLElement, moveFocus: boolean): void {
  const value = target.dataset.tabValue ?? ALL

  // Roving tabindex: exactly one tab is in the page tab order, and the arrow keys
  // move within the set. Twelve cards behind four tabs should cost one Tab press,
  // not four.
  for (const tab of set.tabs) {
    const selected = tab === target
    tab.setAttribute('aria-selected', String(selected))
    tab.tabIndex = selected ? 0 : -1
  }

  if (set.panel && target.id) set.panel.setAttribute('aria-labelledby', target.id)

  for (const item of set.items) {
    item.hidden = value !== ALL && item.dataset.day !== value
  }

  // Rewriting the live region is what tells a screen reader user that the list
  // changed underneath them. Without it the filter is silent and the page lies.
  const status = target.dataset.tabStatus
  if (set.status && status) set.status.textContent = status

  if (moveFocus) target.focus()
}

function onKeydown(set: TabSet, event: KeyboardEvent): void {
  const current = set.tabs.indexOf(event.target as HTMLElement)
  if (current < 0) return

  let next = -1
  switch (event.key) {
    case 'ArrowRight':
      next = (current + 1) % set.tabs.length
      break
    case 'ArrowLeft':
      next = (current - 1 + set.tabs.length) % set.tabs.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = set.tabs.length - 1
      break
    default:
      return
  }

  // Automatic activation. The panels are already in the document, so following the
  // focus costs nothing and saves a keystroke per tab.
  event.preventDefault()
  select(set, set.tabs[next]!, true)
}

export function initTabs(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-tabs]')) {
    const set = readTabSet(root)
    if (!set) continue

    // The tab list is the part that does not work without this module, so it is the
    // part that only appears once this module has run.
    set.list.hidden = false

    for (const tab of set.tabs) {
      tab.addEventListener('click', () => select(set, tab, false))
    }
    set.list.addEventListener('keydown', (event) => onKeydown(set, event))

    const initial = set.tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') ?? set.tabs[0]!
    select(set, initial, false)
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initTabs())
} else {
  initTabs()
}
