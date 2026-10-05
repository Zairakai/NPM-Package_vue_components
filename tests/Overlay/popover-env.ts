import { vi } from 'vitest'

/** jsdom has no Popover API: give the elements showPopover and hidePopover. */
export function installPopover() {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>
  const original = { showPopover: proto['showPopover'], hidePopover: proto['hidePopover'] }

  const showPopover = vi.fn(function (this: HTMLElement) {
    this.setAttribute('data-open', '')
  })
  const hidePopover = vi.fn(function (this: HTMLElement) {
    this.removeAttribute('data-open')
  })

  proto['showPopover'] = showPopover
  proto['hidePopover'] = hidePopover

  return {
    showPopover,
    hidePopover,
    restore() {
      for (const [key, value] of Object.entries(original)) {
        if (undefined === value) {
          delete proto[key]
        } else {
          proto[key] = value
        }
      }
    },
  }
}

/** A browser fires "toggle" on the popover after it opened or closed. */
export function fireToggle(element: Element, newState: 'open' | 'closed'): void {
  const event = new Event('toggle') as Event & { newState: string }

  event.newState = newState
  element.dispatchEvent(event)
}
