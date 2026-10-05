import type { ComputedRef, InjectionKey, Ref } from 'vue'

/**
 * Context the tabs share with their list, tabs and panels.
 */
export interface TabsContext {
  uid: string
  /** The id of the active tab: the one chosen, or the first enabled tab. */
  active: ComputedRef<string | null>
  orientation: Ref<string>
  activation: Ref<string>
  select: (id: string) => void
  register: (id: string) => () => void
}

export const TABS_KEY: InjectionKey<TabsContext> = Symbol('zk-tabs')
