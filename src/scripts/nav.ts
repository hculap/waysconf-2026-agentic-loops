/**
 * Mobile nav disclosure — the hamburger below 768.
 *
 * The four links and the ticket CTA ship visible and the toggle ships `hidden`.
 * With scripting off that is the whole nav, laid out inline at every width: not the
 * design, but complete and operable, which is the trade progressive enhancement
 * asks for. A hamburger that needs JavaScript to open is the one arrangement that
 * cannot be allowed, because it hides the navigation behind a control that does
 * nothing.
 *
 * CANON 7 puts the hamburger *below* 768, so 768 itself keeps the full bar. The
 * breakpoint is owned here rather than in CSS: the toggle's visibility and the
 * menu's visibility have to agree, and splitting that decision between a media
 * query and a script is how they stop agreeing.
 *
 * Escape closes and returns focus to the toggle, because focus left inside a
 * collapsed menu is focus lost. Focus is not trapped while the menu is open —
 * AC-20 fails on a keyboard trap, and a disclosure is not a modal.
 *
 * Expected markup:
 *
 *   <nav data-nav aria-label="Primary">
 *     <a href="#top">TURBINE</a>
 *     <button data-nav-toggle type="button" hidden
 *             aria-controls="nav-menu" aria-expanded="false" aria-label="Open menu"
 *             data-label-open="Open menu" data-label-close="Close menu">...</button>
 *     <div data-nav-menu id="nav-menu">...links and CTA...</div>
 *   </nav>
 *
 * The two labels come from CONTENT 14 and live in the markup, not here.
 */

/** Below 768, per CANON 7. 767.98 rather than 767 so a fractional width lands on one side. */
const COMPACT = '(max-width: 767.98px)'

interface Nav {
  toggle: HTMLElement
  menu: HTMLElement
}

function setOpen(nav: Nav, open: boolean): void {
  nav.toggle.setAttribute('aria-expanded', String(open))
  nav.menu.hidden = !open

  const label = open ? nav.toggle.dataset.labelClose : nav.toggle.dataset.labelOpen
  if (label) nav.toggle.setAttribute('aria-label', label)
}

function isOpen(nav: Nav): boolean {
  return nav.toggle.getAttribute('aria-expanded') === 'true'
}

export function initNav(scope: ParentNode = document): void {
  for (const root of scope.querySelectorAll<HTMLElement>('[data-nav]')) {
    const toggle = root.querySelector<HTMLElement>('[data-nav-toggle]')
    const menu = root.querySelector<HTMLElement>('[data-nav-menu]')
    if (!toggle || !menu) continue

    const nav: Nav = { toggle, menu }
    const compact = window.matchMedia(COMPACT)

    const applyWidth = (): void => {
      toggle.hidden = !compact.matches
      // Above the breakpoint the menu is the nav bar and is always shown; the
      // toggle is gone, so its collapsed state says nothing to anybody.
      setOpen(nav, !compact.matches)
    }

    toggle.addEventListener('click', () => setOpen(nav, !isOpen(nav)))

    // Following an in-page anchor from inside the drawer should leave the drawer
    // behind. Otherwise the reader arrives at the section with the menu still over it.
    menu.addEventListener('click', (event) => {
      if (!compact.matches) return
      if ((event.target as Element).closest('a')) setOpen(nav, false)
    })

    root.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !compact.matches || !isOpen(nav)) return
      setOpen(nav, false)
      toggle.focus()
    })

    compact.addEventListener('change', applyWidth)
    applyWidth()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initNav())
} else {
  initNav()
}
