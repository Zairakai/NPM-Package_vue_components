import type { InjectionKey, Ref } from 'vue'

/**
 * Context a chip group shares with its chips.
 */
export interface ChipGroupContext {
  selected: Ref<string[]>
  toggle: (value: string) => void
}

export const CHIP_GROUP_KEY: InjectionKey<ChipGroupContext> = Symbol('zk-chip-group')
