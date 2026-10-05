import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope, nextTick, ref } from 'vue'
import { toQuery, useRemoteData } from '../../src/composables/useRemoteData'

describe('toQuery', () => {
  it('should build a query string and leave out the empty values', () => {
    expect(
      toQuery({ page: 2, q: 'ada lovelace', empty: '', none: null, missing: undefined, on: true }).toString()
    ).toBe('page=2&q=ada+lovelace&on=true')
  })

  it('should repeat a parameter for an array and use brackets for an object', () => {
    expect(
      decodeURIComponent(toQuery({ tag: ['a', 'b'], filter: { status: 'open', owner: ['x', 'y'] } }).toString())
    ).toBe('tag=a&tag=b&filter[status]=open&filter[owner]=x&filter[owner]=y')
  })
})

describe('useRemoteData', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('should load at once by default and expose the data', async () => {
    const fetcher = vi.fn().mockResolvedValue(['row'])
    const params = ref({ page: 1 })
    const { data, loading } = useRemoteData(fetcher, params)

    expect(loading.value).toBe(true)

    await vi.runAllTimersAsync()

    expect(fetcher).toHaveBeenCalledWith({ page: 1 }, expect.objectContaining({ signal: expect.any(AbortSignal) }))
    expect(data.value).toEqual(['row'])
    expect(loading.value).toBe(false)
  })

  it('should not load at once when asked not to', async () => {
    const fetcher = vi.fn().mockResolvedValue(1)

    useRemoteData(fetcher, ref({}), { immediate: false })
    await vi.runAllTimersAsync()

    expect(fetcher).not.toHaveBeenCalled()
  })

  it('should load again when the parameters change, after the debounce', async () => {
    const fetcher = vi.fn().mockImplementation(async (params: { q: string }) => params.q)
    const params = ref({ q: 'a' })
    const { data } = useRemoteData(fetcher, params, { debounce: 300 })

    await vi.runAllTimersAsync()

    params.value = { q: 'ab' }
    await nextTick()
    params.value = { q: 'abc' }
    await nextTick()
    vi.advanceTimersByTime(299)
    expect(fetcher).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(2)

    expect(fetcher).toHaveBeenCalledTimes(2)
    expect(data.value).toBe('abc')
  })

  it('should cancel the request that is still running and ignore its late answer', async () => {
    const signals: AbortSignal[] = []
    const resolvers: Array<(value: string) => void> = []
    const fetcher = vi.fn().mockImplementation(
      (_params: unknown, { signal }: { signal: AbortSignal }) =>
        new Promise<string>((resolve) => {
          signals.push(signal)
          resolvers.push(resolve)
        })
    )
    const params = ref({ q: 'a' })
    const { data } = useRemoteData(fetcher, params)

    params.value = { q: 'b' }
    await nextTick()
    await vi.runAllTimersAsync()

    expect(signals[0].aborted).toBe(true)

    resolvers[1]('second')
    await vi.runAllTimersAsync()
    resolvers[0]('first')
    await vi.runAllTimersAsync()

    expect(data.value).toBe('second')
  })

  it('should keep the error, and not an abort', async () => {
    const failure = new Error('boom')
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(failure)
      .mockRejectedValueOnce(new DOMException('stopped', 'AbortError'))
    const params = ref({ n: 1 })
    const { error, reload } = useRemoteData(fetcher, params)

    await vi.runAllTimersAsync()
    expect(error.value).toBe(failure)

    await reload()
    expect(error.value).toBeNull()
  })

  it('should clear the error when a new request starts', async () => {
    const fetcher = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValueOnce('ok')
    const { error, data, reload } = useRemoteData(fetcher, ref({}))

    await vi.runAllTimersAsync()
    expect(error.value).not.toBeNull()

    await reload()
    expect(error.value).toBeNull()
    expect(data.value).toBe('ok')
  })

  it('should stop everything when its scope ends', async () => {
    const signals: AbortSignal[] = []
    const fetcher = vi.fn().mockImplementation(
      (_params: unknown, { signal }: { signal: AbortSignal }) =>
        new Promise(() => {
          signals.push(signal)
        })
    )
    const scope = effectScope()
    const params = ref({ a: 1 })
    const result = scope.run(() => useRemoteData(fetcher, params, { debounce: 100 }))!

    params.value = { a: 2 }
    await nextTick()
    scope.stop()
    await vi.runAllTimersAsync()

    expect(fetcher).toHaveBeenCalledTimes(1)
    expect(signals[0].aborted).toBe(true)
    expect(result.loading.value).toBe(false)
  })

  it('should let the caller cancel', async () => {
    const fetcher = vi.fn().mockImplementation(() => new Promise(() => undefined))
    const { cancel, loading } = useRemoteData(fetcher, ref({}))

    cancel()

    expect(loading.value).toBe(false)
  })
})
