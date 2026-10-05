import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import { useControllable } from '../../src/composables/useControllable'
import {
  type QueryAdapter,
  QUERY_CHANGE_EVENT,
  historyAdapter,
  queryBoolean,
  queryList,
  queryNumber,
  useQueryParam,
} from '../../src/composables/useQueryParam'

function setUrl(url: string): void {
  window.history.replaceState(null, '', url)
}

describe('historyAdapter', () => {
  beforeEach(() => setUrl('/page?a=1#top'))

  it('should read the query string', () => {
    expect(historyAdapter.read().get('a')).toBe('1')
  })

  it('should write the query string and keep the path and the hash', () => {
    const params = new URLSearchParams({ a: '2', b: 'x y' })

    historyAdapter.write(params, 'replace')

    expect(window.location.pathname).toBe('/page')
    expect(window.location.search).toBe('?a=2&b=x+y')
    expect(window.location.hash).toBe('#top')
  })

  it('should remove the question mark when there is no parameter', () => {
    historyAdapter.write(new URLSearchParams(), 'replace')

    expect(window.location.href.endsWith('/page#top')).toBe(true)
  })

  it('should push a history entry in push mode', () => {
    const push = vi.spyOn(window.history, 'pushState')

    historyAdapter.write(new URLSearchParams({ a: '3' }), 'push')

    expect(push).toHaveBeenCalled()
    push.mockRestore()
  })

  it('should notify the listeners on popstate and on its own change event, until it is unsubscribed', () => {
    const listener = vi.fn()
    const stop = historyAdapter.subscribe(listener)

    window.dispatchEvent(new PopStateEvent('popstate'))
    window.dispatchEvent(new Event(QUERY_CHANGE_EVENT))

    expect(listener).toHaveBeenCalledTimes(2)

    stop()
    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(listener).toHaveBeenCalledTimes(2)
  })
})

describe('parsers', () => {
  it('should parse numbers with a fallback', () => {
    const parse = queryNumber(1)

    expect(parse('5')).toBe(5)
    expect(parse('abc')).toBe(1)
    expect(parse(' ')).toBe(1)
  })

  it('should parse booleans', () => {
    expect(queryBoolean('true')).toBe(true)
    expect(queryBoolean('1')).toBe(true)
    expect(queryBoolean('no')).toBe(false)
  })

  it('should parse and serialize a comma separated list', () => {
    expect(queryList.parse('a,b,,c')).toEqual(['a', 'b', 'c'])
    expect(queryList.serialize(['a', 'b'])).toBe('a,b')
  })
})

describe('useQueryParam', () => {
  beforeEach(() => setUrl('/'))
  afterEach(() => setUrl('/'))

  it('should use the default when the parameter is absent and the value of the URL otherwise', () => {
    expect(useQueryParam('tab', { default: 'a' }).value).toBe('a')

    setUrl('/?tab=b')

    expect(useQueryParam('tab', { default: 'a' }).value).toBe('b')
  })

  it('should write the URL, keep the other parameters and drop the default value', () => {
    setUrl('/?other=1')
    const tab = useQueryParam('tab', { default: 'a' })

    tab.value = 'c'
    expect(window.location.search).toBe('?other=1&tab=c')
    expect(tab.value).toBe('c')

    tab.value = 'a'
    expect(window.location.search).toBe('?other=1')
  })

  it('should compare arrays by value to drop the default', () => {
    const list = useQueryParam<string[]>('f', { default: [], ...queryList })

    list.value = ['x', 'y']
    expect(window.location.search).toBe('?f=x%2Cy')

    list.value = []
    expect(window.location.search).toBe('')
  })

  it('should follow the URL when it changes elsewhere', () => {
    const page = useQueryParam('page', { default: 1, parse: queryNumber(1) })

    setUrl('/?page=4')
    window.dispatchEvent(new PopStateEvent('popstate'))

    expect(page.value).toBe(4)
  })

  it('should share the state between two users of the same parameter', () => {
    const first = useQueryParam('q', { default: '' })
    const second = useQueryParam('q', { default: '' })

    first.value = 'hello'

    expect(second.value).toBe('hello')
  })

  it('should push history entries when asked to', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const tab = useQueryParam('tab', { default: 'a', mode: 'push' })

    tab.value = 'b'

    expect(push).toHaveBeenCalled()
    push.mockRestore()
  })

  it('should serialize with a custom function', () => {
    const flag = useQueryParam('on', { default: false, parse: queryBoolean, serialize: (value) => (value ? '1' : '0') })

    flag.value = true

    expect(window.location.search).toBe('?on=1')
  })

  it('should use a custom adapter, for the router of the application', () => {
    let params = new URLSearchParams('tab=z')
    const listeners = new Set<() => void>()
    const adapter: QueryAdapter = {
      read: () => new URLSearchParams(params),
      write: (next) => {
        params = next
      },
      subscribe: (listener) => {
        listeners.add(listener)

        return () => listeners.delete(listener)
      },
    }
    const tab = useQueryParam('tab', { default: 'a', adapter })

    expect(tab.value).toBe('z')

    tab.value = 'y'
    expect(params.get('tab')).toBe('y')

    params = new URLSearchParams('tab=w')
    listeners.forEach((listener) => listener())
    expect(tab.value).toBe('w')
  })

  it('should stop listening when its scope ends', () => {
    const listeners = new Set<() => void>()
    const adapter: QueryAdapter = {
      read: () => new URLSearchParams(),
      write: () => undefined,
      subscribe: (listener) => {
        listeners.add(listener)

        return () => listeners.delete(listener)
      },
    }
    const scope = effectScope()

    scope.run(() => useQueryParam('tab', { default: 'a', adapter }))
    expect(listeners.size).toBe(1)

    scope.stop()
    expect(listeners.size).toBe(0)
  })
})

describe('useControllable with a query parameter', () => {
  beforeEach(() => setUrl('/'))
  afterEach(() => setUrl('/'))

  it('should keep the uncontrolled value in the URL and emit', () => {
    const emit = vi.fn()
    const page = useControllable<number>({}, 'modelValue', emit, 1, { param: 'page', parse: queryNumber(1) })

    page.value = 3

    expect(window.location.search).toBe('?page=3')
    expect(emit).toHaveBeenCalledWith('update:modelValue', 3)
  })

  it('should read the initial value from the URL', () => {
    setUrl('/?page=7')
    const page = useControllable<number>({}, 'modelValue', vi.fn(), 1, { param: 'page', parse: queryNumber(1) })

    expect(page.value).toBe(7)
  })

  it('should let the prop win over the URL', () => {
    setUrl('/?page=7')
    const page = useControllable<number>({ modelValue: 2 }, 'modelValue', vi.fn(), 1, {
      param: 'page',
      parse: queryNumber(1),
    })

    expect(page.value).toBe(2)
  })

  it('should ignore the query options without a parameter name', () => {
    const page = useControllable<number>({}, 'modelValue', vi.fn(), 1, { param: undefined })

    page.value = 5

    expect(window.location.search).toBe('')
    expect(page.value).toBe(5)
  })

  it('should pass the serializer, the mode and the adapter to the parameter', () => {
    const push = vi.spyOn(window.history, 'pushState')
    const page = useControllable<number>({}, 'modelValue', vi.fn(), 1, {
      param: 'p',
      parse: queryNumber(1),
      serialize: (value) => `n${value}`,
      mode: 'push',
      adapter: historyAdapter,
    })

    page.value = 2

    expect(window.location.search).toBe('?p=n2')
    expect(push).toHaveBeenCalled()
    push.mockRestore()
  })
})
