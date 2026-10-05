import { type Ref, getCurrentScope, onScopeDispose, ref, watch } from 'vue'

type Primitive = string | number | boolean | null | undefined

/**
 * A query string from parameters: empty values are left out, an array is a
 * repeated parameter (`tag=a&tag=b`) and a nested object a bracket name
 * (`filter[status]=open`), which is what most back ends read.
 */
export function toQuery(params: Record<string, unknown>): URLSearchParams {
  const query = new URLSearchParams()

  const add = (key: string, value: unknown): void => {
    if (null === value || undefined === value || '' === value) {
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => add(key, item))
    } else if ('object' === typeof value) {
      Object.entries(value as Record<string, unknown>).forEach(([name, item]) => add(`${key}[${name}]`, item))
    } else {
      query.append(key, String(value as Primitive))
    }
  }

  Object.entries(params).forEach(([key, value]) => add(key, value))

  return query
}

export interface RemoteDataOptions {
  /** Milliseconds to wait after the last change of the parameters before asking. */
  debounce?: number
  /** Ask once at the start. */
  immediate?: boolean
}

/**
 * Load data that depends on parameters. When the parameters change it asks
 * again, cancels the request that was still running (AbortController) and
 * ignores an answer that arrives late, so the data always matches the last
 * parameters. Works with `fetch` and with an HTTP client that takes a signal.
 */
export function useRemoteData<T, P extends Record<string, unknown>>(
  fetcher: (params: P, context: { signal: AbortSignal }) => Promise<T>,
  params: Ref<P>,
  options: RemoteDataOptions = {}
) {
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>
  const error = ref<unknown>(null)
  const loading = ref(false)

  let controller: AbortController | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  let counter = 0

  async function load(): Promise<void> {
    controller?.abort()
    controller = new AbortController()
    counter += 1

    const current = counter

    loading.value = true
    error.value = null

    try {
      const result = await fetcher(params.value, { signal: controller.signal })

      if (current === counter) {
        data.value = result
      }
    } catch (failure) {
      if (current === counter && !(failure instanceof DOMException && 'AbortError' === failure.name)) {
        error.value = failure
      }
    } finally {
      if (current === counter) {
        loading.value = false
      }
    }
  }

  function schedule(): void {
    clearTimeout(timer)
    timer = setTimeout(load, options.debounce ?? 0)
  }

  watch(params, schedule, { deep: true })

  if (options.immediate ?? true) {
    void load()
  }

  function cancel(): void {
    clearTimeout(timer)
    controller?.abort()
    counter += 1
    loading.value = false
  }

  if (getCurrentScope()) {
    onScopeDispose(cancel)
  }

  return { data, error, loading, reload: load, cancel }
}
