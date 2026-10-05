import { getSupport } from './useSupport'

/**
 * Run a change of the page inside a view transition (an animated change) when
 * the browser supports it and the user did not ask for less motion. Otherwise
 * the change is made at once.
 */
export function withViewTransition(update: () => void): void {
  const reduced = 'undefined' !== typeof window && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  if (getSupport().viewTransitions && !reduced) {
    document.startViewTransition(update)

    return
  }

  update()
}
