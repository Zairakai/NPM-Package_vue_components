import { type Ref, type WritableComputedRef, computed, ref } from 'vue'
import { type QueryAdapter, type QueryWriteMode, useQueryParam } from './useQueryParam'

/**
 * Keep the value in a query parameter of the URL, so it can be shared,
 * bookmarked and reloaded.
 */
export interface ControllableQuery<T> {
  param: string | undefined
  parse?: (raw: string) => T
  serialize?: (value: T) => string
  mode?: QueryWriteMode
  adapter?: QueryAdapter
}

/**
 * A value that works both controlled and uncontrolled.
 *
 * When the parent passes the prop (`v-model`), it is the source of truth.
 * When it does not, the component keeps its own state, so it still works
 * without any `v-model`. With a `query` parameter that state lives in the URL.
 * Every change emits `update:<key>`.
 */
export function useControllable<T>(
  props: Record<string, unknown>,
  key: string,
  emit: (event: string, value: T) => void,
  initial: T,
  query?: ControllableQuery<T>
): WritableComputedRef<T> {
  const inner: Ref<T> = query?.param
    ? useQueryParam<T>(query.param, {
        default: initial,
        ...(query.parse ? { parse: query.parse } : {}),
        ...(query.serialize ? { serialize: query.serialize } : {}),
        ...(query.mode ? { mode: query.mode } : {}),
        ...(query.adapter ? { adapter: query.adapter } : {}),
      })
    : (ref(initial) as Ref<T>)

  return computed<T>({
    get: () => (undefined !== props[key] ? (props[key] as T) : inner.value),
    set: (value: T) => {
      inner.value = value
      emit(`update:${key}`, value)
    },
  })
}
