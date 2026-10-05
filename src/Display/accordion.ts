import type { InjectionKey } from 'vue'

/**
 * Context an accordion shares with its items.
 */
export interface AccordionContext {
  isOpen: (id: string) => boolean
  toggle: (id: string) => void
}

export const ACCORDION_KEY: InjectionKey<AccordionContext> = Symbol('zk-accordion')
