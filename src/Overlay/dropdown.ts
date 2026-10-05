import type { InjectionKey } from 'vue'

/**
 * Context a dropdown shares with its items.
 */
export interface DropdownContext {
  close: () => void
}

export const DROPDOWN_KEY: InjectionKey<DropdownContext> = Symbol('zk-dropdown')
