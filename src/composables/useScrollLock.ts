let locks = 0
let previous = ''

/**
 * Stop the page behind a modal from scrolling. Counted: nested modals lock once
 * and the page scrolls again when the last one is closed.
 */
export function lockScroll(): void {
  if ('undefined' === typeof document) {
    return
  }

  if (0 === locks) {
    previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }

  locks += 1
}

export function unlockScroll(): void {
  if (0 === locks) {
    return
  }

  locks -= 1

  if (0 === locks) {
    document.documentElement.style.overflow = previous
  }
}
