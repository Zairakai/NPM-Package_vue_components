import { type Ref, onBeforeUnmount, watch } from 'vue'
import { getSupport } from './useSupport'

export type PopoverMode = 'auto' | 'manual'

/**
 * Show and hide an element in the top layer with the Popover API: the browser
 * gives the light dismiss (outside click, Escape), the focus return and the
 * stacking above everything. Without the API the element is toggled with the
 * `hidden` attribute and a script gives the same behaviour.
 *
 * `open` is the state. Call `onToggle` on the native `toggle` event so the
 * state follows what the browser did (light dismiss).
 */
export function usePopover(
  element: Ref<HTMLElement | null>,
  open: Ref<boolean>,
  setOpen: (value: boolean) => void,
  mode: PopoverMode = 'auto',
  anchor?: Ref<HTMLElement | null>
) {
  let shown = false
  let opener: Element | null = null

  const onOutside = (event: Event): void => {
    const target = event.target as Node

    if (!element.value?.contains(target) && !anchor?.value?.contains(target)) {
      setOpen(false)
    }
  }

  const onKeydown = (event: KeyboardEvent): void => {
    if ('Escape' === event.key) {
      setOpen(false)
    }
  }

  function listen(): void {
    document.addEventListener('pointerdown', onOutside, true)
    document.addEventListener('keydown', onKeydown)
  }

  function unlisten(): void {
    document.removeEventListener('pointerdown', onOutside, true)
    document.removeEventListener('keydown', onKeydown)
  }

  function apply(isOpen: boolean): void {
    const target = element.value

    if (!target) {
      return
    }

    if (getSupport().popover) {
      if (isOpen && !shown) {
        target.showPopover()
        shown = true
      } else if (!isOpen && shown) {
        target.hidePopover()
        shown = false
      }

      return
    }

    target.hidden = !isOpen

    if (isOpen && 'auto' === mode) {
      opener = document.activeElement
      listen()
    } else {
      unlisten()

      if (!isOpen && opener instanceof HTMLElement) {
        opener.focus()
        opener = null
      }
    }
  }

  watch(open, apply, { flush: 'post' })

  function onToggle(event: Event): void {
    shown = 'open' === (event as ToggleEvent).newState
    setOpen(shown)
  }

  /** The attributes to put on the element that opens it. */
  function triggerAttributes(panelId: string): Record<string, unknown> {
    return getSupport().popover ? { popovertarget: panelId } : { onClick: () => setOpen(!open.value) }
  }

  onBeforeUnmount(unlisten)

  return { apply, onToggle, triggerAttributes }
}
