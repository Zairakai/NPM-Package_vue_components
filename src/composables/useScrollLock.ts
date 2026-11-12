let locks = 0
let previous = ''

/**
 * Stop the page behind a modal from scrolling. Counted: nested modals lock once
 * and the page scrolls again when the last one is closed.
 */
export function lockScroll(): void {
  if (typeof document === 'undefined') {
    return
  }

  if (locks === 0) {
    previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
  }

  locks += 1
}

export function unlockScroll(): void {
  if (locks === 0) {
    return
  }

  locks -= 1

  if (locks === 0) {
    document.documentElement.style.overflow = previous
  }
}
