import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { paginationRange } from '../../src/Navigation/pagination'
import Pagination from '../../src/Navigation/Pagination.vue'

describe('paginationRange', () => {
  const pages = (items: ReturnType<typeof paginationRange>) =>
    items.map((item) => ('page' === item.type ? item.page : '…'))

  it('should list every page when there are few', () => {
    expect(pages(paginationRange(3, 5))).toEqual([1, 2, 3, 4, 5])
  })

  it('should add gaps around the current page', () => {
    expect(pages(paginationRange(10, 20))).toEqual([1, '…', 9, 10, 11, '…', 20])
  })

  it('should keep the first pages together near the start and the last near the end', () => {
    expect(pages(paginationRange(1, 20))).toEqual([1, 2, '…', 20])
    expect(pages(paginationRange(20, 20))).toEqual([1, '…', 19, 20])
  })

  it('should show a lone missing page instead of a gap', () => {
    expect(pages(paginationRange(4, 20))).toEqual([1, 2, 3, 4, 5, '…', 20])
  })

  it('should honour the siblings and the boundaries', () => {
    expect(pages(paginationRange(10, 20, 2, 2))).toEqual([1, 2, '…', 8, 9, 10, 11, 12, '…', 19, 20])
  })

  it('should return nothing without pages and clamp the boundaries', () => {
    expect(paginationRange(1, 0)).toEqual([])
    expect(pages(paginationRange(1, 2, 1, 5))).toEqual([1, 2])
  })

  it('should give a distinct key to every gap', () => {
    const gaps = paginationRange(10, 30, 1, 1).filter((item) => 'gap' === item.type)

    expect(new Set(gaps.map((gap) => ('gap' === gap.type ? gap.key : ''))).size).toBe(gaps.length)
  })
})

describe('NavigationPagination', () => {
  beforeEach(() => window.history.replaceState(null, '', '/list'))

  it('should render a labelled navigation with the current page marked', () => {
    const wrapper = mount(Pagination, { props: { pages: 5, modelValue: 2, id: 'p', class: 'x' } })

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Pagination')
    expect(wrapper.classes()).toEqual(['pagination', 'x'])
    expect(wrapper.attributes('id')).toBe('p')

    const items = wrapper.findAll('.pagination-item')

    expect(items.find((item) => 'page' === item.attributes('aria-current'))?.text()).toBe('2')
    expect(items.find((item) => '5' === item.text())?.attributes('aria-label')).toBe('Page 5')
  })

  it('should compute the pages from the items and the page size', () => {
    const wrapper = mount(Pagination, { props: { totalItems: 95, pageSize: 10 } })

    expect(wrapper.findAll('.pagination-item[aria-label^="Page"]').map((item) => item.text())).toContain('10')
  })

  it('should show one page when there is nothing', () => {
    expect(
      mount(Pagination, { props: { totalItems: 0 } }).findAll('.pagination-item[aria-label^="Page"]')
    ).toHaveLength(1)
  })

  it('should go to a page, emit the model and the change event, and work without v-model', async () => {
    const wrapper = mount(Pagination, { props: { pages: 4 } })

    await wrapper
      .findAll('.pagination-item')
      .find((item) => '3' === item.text())
      ?.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
    expect(wrapper.emitted('change')?.[0]).toEqual([3])
    expect(wrapper.find('[aria-current="page"]').text()).toBe('3')
  })

  it('should use the previous and next buttons and disable them at the ends', async () => {
    const wrapper = mount(Pagination, { props: { pages: 3, modelValue: 1 } })

    expect(wrapper.find('[data-direction="previous"]').attributes('disabled')).toBeDefined()

    await wrapper.find('[data-direction="next"]').trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual([2])

    await wrapper.setProps({ modelValue: 3 })
    expect(wrapper.find('[data-direction="next"]').attributes('disabled')).toBeDefined()

    await wrapper.find('[data-direction="previous"]').trigger('click')
    expect(wrapper.emitted('change')?.[1]).toEqual([2])
  })

  it('should do nothing when the page does not change', async () => {
    const wrapper = mount(Pagination, { props: { pages: 3, modelValue: 2 } })

    await wrapper.find('[aria-current="page"]').trigger('click')

    expect(wrapper.emitted('change')).toBeUndefined()
  })

  it('should use the labels and the slots', () => {
    const wrapper = mount(Pagination, {
      props: { pages: 3, label: 'Pages', previousLabel: 'Précédent', nextLabel: 'Suivant', pageLabel: 'Page n°' },
      slots: { previous: 'P', next: 'N' },
    })

    expect(wrapper.attributes('aria-label')).toBe('Pages')
    expect(wrapper.find('[data-direction="previous"]').attributes('aria-label')).toBe('Précédent')
    expect(wrapper.find('[data-direction="next"]').attributes('aria-label')).toBe('Suivant')
    expect(wrapper.find('[data-direction="next"]').text()).toBe('N')
    expect(wrapper.find('[aria-label="Page n° 2"]').exists()).toBe(true)
  })

  it('should render real links with a query parameter and keep the other parameters', () => {
    window.history.replaceState(null, '', '/list?sort=name')
    const wrapper = mount(Pagination, { props: { pages: 4, queryParam: 'page' } })
    const links = wrapper.findAll('a.pagination-item')

    expect(links.find((link) => '3' === link.text())?.attributes('href')).toBe('?sort=name&page=3')
    expect(links.find((link) => '1' === link.text())?.attributes('href')).toBe('?sort=name')
    expect(wrapper.find('a[rel="next"]').attributes('href')).toBe('?sort=name&page=2')
    expect(wrapper.find('[data-direction="previous"]').element.tagName).toBe('BUTTON')
  })

  it('should link to a bare question mark for the first page without other parameters', () => {
    const wrapper = mount(Pagination, { props: { pages: 3, queryParam: 'page' } })

    expect(
      wrapper
        .findAll('a.pagination-item')
        .find((link) => '1' === link.text())
        ?.attributes('href')
    ).toBe('?')
  })

  it('should handle the click on a link without reloading and write the URL', async () => {
    const wrapper = mount(Pagination, { props: { pages: 4, queryParam: 'page' } })
    const link = wrapper.findAll('a.pagination-item').find((item) => '4' === item.text())
    const event = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })

    link?.element.dispatchEvent(event)
    await wrapper.vm.$nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(window.location.search).toBe('?page=4')
    expect(wrapper.find('[aria-current="page"]').text()).toBe('4')
    expect(wrapper.find('a[rel="prev"]').attributes('href')).toBe('?page=3')
  })

  it('should keep the native behaviour of a modified or middle click', () => {
    const wrapper = mount(Pagination, { props: { pages: 4, queryParam: 'page' } })
    const link = wrapper.findAll('a.pagination-item').find((item) => '4' === item.text())
    const init = { bubbles: true, cancelable: true }

    for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }]) {
      const event = new MouseEvent('click', { ...init, ...options })

      link?.element.dispatchEvent(event)

      expect(event.defaultPrevented).toBe(false)
    }

    expect(window.location.search).toBe('')
  })

  it('should not handle a click that was already handled', () => {
    const wrapper = mount(Pagination, { props: { pages: 4, queryParam: 'page' } })
    const link = wrapper.findAll('a.pagination-item').find((item) => '4' === item.text())
    const event = new MouseEvent('click', { bubbles: true, cancelable: true })

    event.preventDefault()
    link?.element.dispatchEvent(event)

    expect(window.location.search).toBe('')
  })

  it('should read the page from the URL', () => {
    window.history.replaceState(null, '', '/list?page=3')
    const wrapper = mount(Pagination, { props: { pages: 4, queryParam: 'page' } })

    expect(wrapper.find('[aria-current="page"]').text()).toBe('3')
  })

  it('should build the links with a custom function', () => {
    const wrapper = mount(Pagination, {
      props: { pages: 3, modelValue: 2, hrefFor: (page: number) => `/items/${page}` },
    })

    expect(
      wrapper
        .findAll('a.pagination-item')
        .find((link) => '3' === link.text())
        ?.attributes('href')
    ).toBe('/items/3')
    expect(wrapper.find('a[rel="prev"]').attributes('href')).toBe('/items/1')
  })
})
