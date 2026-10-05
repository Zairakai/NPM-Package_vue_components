import * as Vue from 'vue'

let counter = 0

/**
 * Return a unique, stable id to link a label, a trigger and a panel with ARIA
 * attributes. Uses Vue's own `useId()` (3.5+, safe for SSR hydration) when it
 * is available and falls back to a counter on older Vue 3 versions.
 */
export function useUid(prefix = 'zk'): string {
  const vueUseId = (Vue as { useId?: () => string }).useId

  if ('function' === typeof vueUseId) {
    return `${prefix}-${vueUseId()}`
  }

  counter += 1

  return `${prefix}-${counter}`
}
