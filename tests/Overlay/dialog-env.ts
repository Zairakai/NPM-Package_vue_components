import { vi } from 'vitest'

/**
 * jsdom does not implement the open state of <dialog>: this gives it the
 * behaviour of a browser (open attribute, close event, returnValue, cancel).
 */
export function installDialog(options: { closedBy?: boolean; requestClose?: boolean } = {}) {
  const proto = HTMLDialogElement.prototype as unknown as Record<string, unknown>
  const original = {
    showModal: proto['showModal'],
    show: proto['show'],
    close: proto['close'],
    requestClose: proto['requestClose'],
    closedBy: proto['closedBy'],
  }

  const showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  const show = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  const close = vi.fn(function (this: HTMLDialogElement, value?: string) {
    if (!this.hasAttribute('open')) {
      return
    }

    this.removeAttribute('open')
    if (undefined !== value) {
      this.returnValue = value
    }
    this.dispatchEvent(new Event('close'))
  })

  proto['showModal'] = showModal
  proto['show'] = show
  proto['close'] = close

  if (options.requestClose) {
    proto['requestClose'] = vi.fn(function (this: HTMLDialogElement, value?: string) {
      const event = new Event('cancel', { cancelable: true })

      this.dispatchEvent(event)

      if (!event.defaultPrevented) {
        close.call(this, value)
      }
    })
  }

  if (options.closedBy) {
    proto['closedBy'] = 'closerequest'
  }

  return {
    showModal,
    show,
    close,
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
