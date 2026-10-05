import type { ComputedRef, InjectionKey } from 'vue'

/**
 * Context a list shares with its items.
 */
export interface ListContext {
  selectable: ComputedRef<string>
  isSelected: (value: string) => boolean
  toggle: (value: string) => void
}

export const LIST_KEY: InjectionKey<ListContext> = Symbol('zk-list')
