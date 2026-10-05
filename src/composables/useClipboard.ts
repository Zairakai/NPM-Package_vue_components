import { onBeforeUnmount, ref } from 'vue'
import { getSupport } from './useSupport'

/**
 * Copy text to the clipboard. The asynchronous Clipboard API when the browser
 * has it (and the page is secure); otherwise a hidden textarea and the old
 * `execCommand('copy')`. `copied` is true for a moment after a success, to
 * show a confirmation.
 */
export function useClipboard(timeout = 2000) {
  const copied = ref(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  function legacyCopy(text: string): boolean {
    const field = document.createElement('textarea')

    field.value = text
    field.setAttribute('readonly', '')
    field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
    document.body.append(field)
    field.select()

    try {
      return document.execCommand('copy')
    } finally {
      field.remove()
    }
  }

  async function copy(text: string): Promise<boolean> {
    let done = false

    if (getSupport().clipboard) {
      try {
        await navigator.clipboard.writeText(text)
        done = true
      } catch {
        // Refused (permissions, insecure page): try the old way.
      }
    }

    if (!done && 'undefined' !== typeof document) {
      done = legacyCopy(text)
    }

    if (done) {
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, timeout)
    }

    return done
  }

  onBeforeUnmount(() => clearTimeout(timer))

  return { copied, copy }
}
