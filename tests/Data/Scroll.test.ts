import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import InfiniteScroll from '../../src/Data/InfiniteScroll.vue'
import VirtualScroll from '../../src/Data/VirtualScroll.vue'

const items = Array.from({ length: 1000 }, (_, index) => ({ id: index, label: `Row ${index}` }))

describe('DataVirtualScroll', () => {
  const mountList = (props: Record<string, unknown> = {}) =>
    mount(VirtualScroll, {
      props: { items, itemHeight: 20, height: 100, ...props },
      slots: { default: `<template #default="{ item, index }">{{ index }}:{{ item.label }}</template>` },
      attachTo: document.body,
    })

  it('should draw only the visible items and a spacer of the full height', () => {
    const wrapper = mountList({ id: 'v', class: 'x', label: 'Rows' })

    expect(wrapper.classes()).toEqual(['virtual-scroll', 'x'])
    expect(wrapper.attributes('role')).toBe('list')
    expect(wrapper.attributes('aria-label')).toBe('Rows')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('style')).toContain('height: 100px')
    expect(wrapper.find('.virtual-scroll > div').attributes('style')).toContain('height: 20000px')
    expect(wrapper.findAll('.virtual-scroll-item')).toHaveLength(8)
    expect(wrapper.findAll('.virtual-scroll-item')[0].text()).toBe('0:Row 0')
  })

  it('should place and describe every item for assistive technologies', () => {
    const item = mountList().findAll('.virtual-scroll-item')[2]

    expect(item.attributes('role')).toBe('listitem')
    expect(item.attributes('aria-posinset')).toBe('3')
    expect(item.attributes('aria-setsize')).toBe('1000')
    expect(item.attributes('style')).toContain('top: 40px')
  })

  it('should draw the items that come into the window when it scrolls', async () => {
    const wrapper = mountList()

    ;(wrapper.element as HTMLElement).scrollTop = 2000
    await wrapper.trigger('scroll')

    const texts = wrapper.findAll('.virtual-scroll-item').map((entry) => entry.text())

    expect(texts[0]).toBe('97:Row 97')
    expect(texts.at(-1)).toBe('107:Row 107')
    expect(texts).toHaveLength(11)
  })

  it('should use a key from the items when given and scroll to an index', async () => {
    const wrapper = mountList({ itemKey: 'id' })

    ;(wrapper.vm as unknown as { scrollToIndex: (index: number) => void }).scrollToIndex(500)
    await nextTick()

    expect((wrapper.element as HTMLElement).scrollTop).toBe(10000)
    expect(wrapper.findAll('.virtual-scroll-item')[3].text()).toBe('500:Row 500')

    ;(wrapper.vm as unknown as { scrollToIndex: (index: number) => void }).scrollToIndex(99999)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(19980)

    ;(wrapper.vm as unknown as { scrollToIndex: (index: number) => void }).scrollToIndex(-5)
    await nextTick()
    expect((wrapper.element as HTMLElement).scrollTop).toBe(0)
  })

  it('should render nothing for an empty list', () => {
    expect(mountList({ items: [] }).findAll('.virtual-scroll-item')).toHaveLength(0)
  })
})

describe('DataInfiniteScroll', () => {
  let callback: (entries: Array<{ isIntersecting: boolean }>) => void
  let observe: ReturnType<typeof vi.fn>
  let disconnect: ReturnType<typeof vi.fn>
  let options: IntersectionObserverInit | undefined

  beforeEach(() => {
    observe = vi.fn()
    disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(handler: typeof callback, init?: IntersectionObserverInit) {
          callback = handler
          options = init
        }
        observe = observe
        disconnect = disconnect
      }
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  it('should watch the end of the list and ask for more when it comes near', () => {
    const wrapper = mount(InfiniteScroll, {
      props: { id: 'i', class: 'x', margin: '50px' },
      slots: { default: '<p>Row</p>' },
    })

    expect(wrapper.classes()).toEqual(['infinite-scroll', 'x'])
    expect(options?.rootMargin).toBe('50px')
    expect(observe).toHaveBeenCalledTimes(1)

    callback([{ isIntersecting: false }])
    expect(wrapper.emitted('load')).toBeUndefined()

    callback([{ isIntersecting: true }])
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('should not ask while it is loading or when everything is loaded', async () => {
    const wrapper = mount(InfiniteScroll, { props: { loading: true } })

    callback([{ isIntersecting: true }])
    expect(wrapper.emitted('load')).toBeUndefined()
    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[role="status"]').text()).toBe('Loading')

    await wrapper.setProps({ loading: false, finished: true })
    callback([{ isIntersecting: true }])
    expect(wrapper.emitted('load')).toBeUndefined()
  })

  it('should show the finished slot and the loading slot', async () => {
    const wrapper = mount(InfiniteScroll, {
      props: { finished: true },
      slots: { finished: 'The end', loading: 'Wait' },
    })

    expect(wrapper.find('.infinite-scroll-finished').text()).toBe('The end')

    await wrapper.setProps({ finished: false, loading: true })
    expect(wrapper.find('[role="status"]').text()).toBe('Wait')
  })

  it('should stop watching when it is removed', () => {
    mount(InfiniteScroll).unmount()

    expect(disconnect).toHaveBeenCalled()
  })

  it('should do nothing in a browser without IntersectionObserver', () => {
    vi.unstubAllGlobals()
    delete (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver

    expect(() => mount(InfiniteScroll).unmount()).not.toThrow()
  })
})
