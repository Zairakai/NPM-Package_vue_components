import type { InjectionKey } from 'vue'

/**
 * Context an accordion shares with its items.
 */
export interface AccordionContext {
  /** Shared `name` of the native `<details>` in single mode, so the browser closes the others. */
  name: string | undefined
  isOpen: (id: string) => boolean
  setOpen: (id: string, open: boolean) => void
}

export const ACCORDION_KEY: InjectionKey<AccordionContext> = Symbol('zk-accordion')
