import { type Ref, computed, getCurrentScope, onScopeDispose, ref } from 'vue'

export type QueryWriteMode = 'push' | 'replace'

/**
 * Where the query string lives. The browser address bar by default; plug the
 * router of the application with the `queryAdapter` option of the plugin.
 */
export interface QueryAdapter {
  read: () => URLSearchParams
  write: (params: URLSearchParams, mode: QueryWriteMode) => void
  subscribe: (listener: () => void) => () => void
}

export const QUERY_CHANGE_EVENT = 'zk:querychange'

/**
 * The default adapter: the History API of the browser. It is a no-op without a
 * browser (server rendering), where the value is just the default.
 */
export const historyAdapter: QueryAdapter = {
  read: () => ('undefined' === typeof window ? new URLSearchParams() : new URLSearchParams(window.location.search)),
  write: (params, mode) => {
    if ('undefined' === typeof window) {
      return
    }

    const search = params.toString()
    const url = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`

    window.history['push' === mode ? 'pushState' : 'replaceState'](window.history.state, '', url)
    // pushState and replaceState do not fire popstate: tell the other users of the URL.
    window.dispatchEvent(new Event(QUERY_CHANGE_EVENT))
  },
  subscribe: (listener) => {
    if ('undefined' === typeof window) {
      return () => undefined
    }

    window.addEventListener('popstate', listener)
    window.addEventListener(QUERY_CHANGE_EVENT, listener)

    return () => {
      window.removeEventListener('popstate', listener)
      window.removeEventListener(QUERY_CHANGE_EVENT, listener)
    }
  },
}

export interface QueryParamOptions<T> {
  /** The value when the parameter is absent. It is kept out of the URL. */
  default: T
  parse?: (raw: string) => T
  serialize?: (value: T) => string
  /** `replace` (default) rewrites the current history entry, `push` adds one (back button). */
  mode?: QueryWriteMode
  adapter?: QueryAdapter
}

/** Parse a number, falling back to the default when it is not one. */
export const queryNumber = (fallback: number) => (raw: string) => {
  const value = Number(raw)

  return '' === raw.trim() || Number.isNaN(value) ? fallback : value
}

/** `true` and `1` are true, everything else is false. */
export const queryBoolean = (raw: string): boolean => 'true' === raw || '1' === raw

/** A list as a comma separated value. */
export const queryList = {
  parse: (raw: string): string[] => raw.split(',').filter((item) => '' !== item),
  serialize: (value: string[]): string => value.join(','),
}

/**
 * A ref synced with a query parameter, to share, bookmark and reload a state.
 *
 * Setting the ref writes the URL (the parameter is removed when the value is
 * the default); changing the URL (back button, a link, the router) updates the
 * ref. The other parameters of the URL are kept.
 */
export function useQueryParam<T = string>(key: string, options: QueryParamOptions<T>): Ref<T> {
  const adapter = options.adapter ?? historyAdapter
  const parse = options.parse ?? ((raw: string) => raw as unknown as T)
  const serialize = options.serialize ?? ((value: T) => String(value))

  const read = (): T => {
    const raw = adapter.read().get(key)

    return null === raw ? options.default : parse(raw)
  }

  const state = ref(read()) as Ref<T>
  let writing = false

  const write = (value: T): void => {
    const params = adapter.read()

    if (JSON.stringify(value) === JSON.stringify(options.default)) {
      params.delete(key)
    } else {
      params.set(key, serialize(value))
    }

    writing = true
    adapter.write(params, options.mode ?? 'replace')
    writing = false
  }

  const stop = adapter.subscribe(() => {
    if (!writing) {
      state.value = read()
    }
  })

  if (getCurrentScope()) {
    onScopeDispose(stop)
  }

  // A ref whose setter writes the URL: the state follows what was written.
  return computed<T>({
    get: () => state.value,
    set: (value: T) => {
      state.value = value
      write(value)
    },
  })
}
