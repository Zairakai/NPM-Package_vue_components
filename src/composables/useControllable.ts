import { type Ref, type WritableComputedRef, computed, ref } from 'vue'

/**
 * A value that works both controlled and uncontrolled.
 *
 * When the parent passes the prop (`v-model`), it is the source of truth.
 * When it does not, the component keeps its own state, so it still works
 * without any `v-model`. Every change emits `update:<key>`.
 */
export function useControllable<T>(
  props: Record<string, unknown>,
  key: string,
  emit: (event: string, value: T) => void,
  initial: T
): WritableComputedRef<T> {
  const inner = ref(initial) as Ref<T>

  return computed<T>({
    get: () => (undefined !== props[key] ? (props[key] as T) : inner.value),
    set: (value: T) => {
      inner.value = value
      emit(`update:${key}`, value)
    },
  })
}
