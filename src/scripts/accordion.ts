/**
 * FAQ accordion — collapse behaviour added to eight answers that are already there.
 *
 * The page ships with every answer open and every trigger reporting
 * `aria-expanded="true"`. This module closes them. That order matters: with
 * scripting off the reader gets all eight answers, which is the whole point of
 * CONTENT 10, and there is no state in which a question exists with its answer
 * unreachable.
 *
 * Each trigger is a real <button>, so Enter and Space both fire a click, focus
 * stays where it was, and none of that is code we have to write or a gate has to
 * take on trust (AC-19). The one thing a custom accordion has to get right that a
 * <details> element does not expose reliably is `aria-expanded`, and that is what
 * this file maintains.
 *
 * Expected markup:
 *
 *   <div data-accordion>
 *     <div data-accordion-item>
 *       <h3>
 *         <button data-accordion-trigger type="button" id="faq-times-trigger"
 *                 aria-controls="faq-times-panel" aria-expanded="true">
 *           What time does it start and finish?
 *         </button>
 *       </h3>
 *       <div id="faq-times-panel" role="region" aria-labelledby="faq-times-trigger">...</div>
 *     </div>
 *     ...
 *   </div>
 *
 * `data-accordion-open` on a trigger keeps that one item open after enhancement.
 * Nothing on this page uses it; it is here so that a future "first item open"
 * decision is a markup change rather than a rewrite.
 */

interface AccordionItem {
  trigger: HTMLElement
  panel: HTMLElement
}

function readItem(trigger: HTMLElement): AccordionItem | null {
  const id = trigger.getAttribute('aria-controls')
  if (!id) return null

  const panel = document.getElementById(id)
  return panel ? { trigger, panel } : null
}

function setExpanded(item: AccordionItem, expanded: boolean): void {
  item.trigger.setAttribute('aria-expanded', String(expanded))
  item.panel.hidden = !expanded
}

export function initAccordion(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-accordion]')) {
    for (const trigger of root.querySelectorAll<HTMLElement>('[data-accordion-trigger]')) {
      const item = readItem(trigger)
      if (!item) continue

      setExpanded(item, trigger.hasAttribute('data-accordion-open'))

      trigger.addEventListener('click', () => {
        setExpanded(item, item.trigger.getAttribute('aria-expanded') !== 'true')
      })
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initAccordion())
} else {
  initAccordion()
}
