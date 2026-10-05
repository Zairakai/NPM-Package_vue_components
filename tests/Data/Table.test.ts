import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Table from '../../src/Data/Table.vue'

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', type: 'number', sortable: true, align: 'end' },
  { key: 'note', label: 'Note' },
]

const rows = [
  { id: 1, name: 'Charlie', age: 30, note: 'a' },
  { id: 2, name: 'alice', age: 7, note: 'b' },
  { id: 3, name: 'Bob', age: 1200, note: 'c' },
]

const many = Array.from({ length: 25 }, (_, index) => ({
  id: index + 1,
  name: `User ${String(index + 1).padStart(2, '0')}`,
  age: index,
  note: '',
}))

const mountTable = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) =>
  mount(Table, { props: { columns, rows, locale: 'en-US', ...props }, slots, attachTo: document.body })

const names = (wrapper: ReturnType<typeof mountTable>) =>
  wrapper.findAll('tbody tr:not(.data-table-empty) td:first-child').map((cell) => cell.text())

describe('DataTable', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    setSupport({ search: true })
  })

  afterEach(() => {
    document.body.innerHTML = ''
    resetSupport()
  })

  it('should render a table with a caption, the headers and the rows', () => {
    const wrapper = mountTable({ caption: 'Users', id: 't', class: 'x' })

    expect(wrapper.find('table').classes()).toEqual(['data-table', 'x'])
    expect(wrapper.find('table').attributes('id')).toBe('t')
    expect(wrapper.find('caption').text()).toBe('Users')
    expect(wrapper.findAll('thead th').map((cell) => cell.text())).toEqual(['Name', 'Age', 'Note'])
    expect(wrapper.findAll('thead th')[0].attributes('scope')).toBe('col')
    expect(names(wrapper)).toEqual(['Charlie', 'alice', 'Bob'])
    expect(wrapper.find('table').attributes('aria-rowcount')).toBe('3')
  })

  it('should format the numbers with the locale and align the columns', () => {
    const wrapper = mountTable()

    expect(wrapper.findAll('tbody tr')[2].findAll('td')[1].text()).toBe('1,200')
    expect(wrapper.findAll('thead th')[1].attributes('data-align')).toBe('end')
  })

  it('should show the empty message or slot', () => {
    expect(mountTable({ rows: [], emptyText: 'No users' }).find('.data-table-empty').text()).toBe('No users')
    expect(mountTable({ rows: [] }, { empty: '<b>None</b>' }).find('.data-table-empty b').exists()).toBe(true)
    expect(mountTable({ rows: [] }).find('.data-table-empty td').attributes('colspan')).toBe('3')
  })

  it('should render a cell slot with the row and the value', () => {
    const wrapper = mountTable(
      {},
      { 'cell-name': `<template #cell-name="{ row, value }"><b>{{ value }}-{{ row.id }}</b></template>` }
    )

    expect(wrapper.find('tbody tr td b').text()).toBe('Charlie-1')
  })

  it('should mark a loading table as busy', () => {
    const wrapper = mountTable({ loading: true })

    expect(wrapper.find('table').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('table').attributes('data-loading')).toBeDefined()
  })

  it('should sort by a column, descending, then back to the original order', async () => {
    const wrapper = mountTable()
    const sort = wrapper.findAll('.data-table-sort')[0]

    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('none')
    expect(wrapper.findAll('thead th')[2].attributes('aria-sort')).toBeUndefined()

    await sort.trigger('click')
    expect(names(wrapper)).toEqual(['alice', 'Bob', 'Charlie'])
    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('ascending')

    await sort.trigger('click')
    expect(names(wrapper)).toEqual(['Charlie', 'Bob', 'alice'])
    expect(wrapper.findAll('thead th')[0].attributes('aria-sort')).toBe('descending')

    await sort.trigger('click')
    expect(names(wrapper)).toEqual(['Charlie', 'alice', 'Bob'])
    expect(wrapper.emitted('update:sort')).toHaveLength(3)
  })

  it('should sort numbers by value', async () => {
    const wrapper = mountTable()

    await wrapper.findAll('.data-table-sort')[1].trigger('click')

    expect(names(wrapper)).toEqual(['alice', 'Charlie', 'Bob'])
  })

  it('should follow the sort of the parent', async () => {
    const wrapper = mountTable({ sort: { key: 'name', direction: 'desc' } })

    expect(names(wrapper)).toEqual(['Charlie', 'Bob', 'alice'])

    await wrapper.setProps({ sort: { key: 'age', direction: 'asc' } })

    expect(names(wrapper)).toEqual(['alice', 'Charlie', 'Bob'])
  })

  it('should filter with the search box and emit the search', async () => {
    const wrapper = mountTable({ searchable: true, searchLabel: 'Find' })

    expect(wrapper.find('search').exists()).toBe(true)
    expect(wrapper.find('label').text()).toBe('Find')
    expect(wrapper.find('form').attributes('method')).toBe('get')

    await wrapper.find('input[type="search"]').setValue('ali')

    expect(names(wrapper)).toEqual(['alice'])
    expect(wrapper.emitted('update:search')?.[0]).toEqual(['ali'])
  })

  it('should submit the search form without leaving the page', async () => {
    const wrapper = mountTable({ searchable: true })
    const event = new Event('submit', { cancelable: true })

    wrapper.find('form').element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })

  it('should use a div with the search role when the browser has no search element', () => {
    setSupport({ search: false })
    const wrapper = mountTable({ searchable: true })

    expect(wrapper.find('div.data-table-search').attributes('role')).toBe('search')
  })

  it('should follow the search of the parent', () => {
    expect(names(mountTable({ search: 'bob' }))).toEqual(['Bob'])
  })

  it('should paginate and go to another page', async () => {
    const wrapper = mountTable({ rows: many, pageSize: 10 })

    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.find('.data-table-pagination').exists()).toBe(true)
    expect(wrapper.find('table').attributes('aria-rowcount')).toBe('25')

    await wrapper
      .findAll('.pagination-item')
      .find((item) => '3' === item.text())
      ?.trigger('click')

    expect(names(wrapper)[0]).toBe('User 21')
    expect(names(wrapper)).toHaveLength(5)
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
  })

  it('should not show the pagination for a single page', () => {
    expect(mountTable().find('.data-table-pagination').exists()).toBe(false)
  })

  it('should come back to page 1 when the sort changes and stay inside the pages when the search narrows them', async () => {
    const wrapper = mountTable({ rows: many, pageSize: 10, searchable: true })

    await wrapper
      .findAll('.pagination-item')
      .find((item) => '3' === item.text())
      ?.trigger('click')
    await wrapper.find('input[type="search"]').setValue('User 01')
    await nextTick()

    expect(names(wrapper)).toEqual(['User 01'])
    expect(wrapper.find('.data-table-pagination').exists()).toBe(false)
  })

  it('should select rows and all the rows of the page', async () => {
    const wrapper = mountTable({ selectable: true })
    const boxes = () => wrapper.findAll('tbody input[type="checkbox"]')
    const all = () => wrapper.find('thead input[type="checkbox"]')

    expect(all().attributes('aria-label')).toBe('Select all rows')
    expect(boxes()[0].attributes('aria-label')).toBe('Select row 1')

    await boxes()[0].setValue(true)
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([[1]])
    expect(wrapper.findAll('tbody tr')[0].attributes('aria-selected')).toBe('true')
    expect((all().element as HTMLInputElement).indeterminate).toBe(true)

    await all().setValue(true)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[1, 2, 3]])
    expect((all().element as HTMLInputElement).checked).toBe(true)

    await all().setValue(false)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[]])

    await boxes()[1].setValue(true)
    await boxes()[1].setValue(false)
    expect(wrapper.emitted('update:selected')?.at(-1)).toEqual([[]])
  })

  it('should follow the selection of the parent and count the selection column in the empty row', () => {
    const wrapper = mountTable({ selectable: true, selected: [2], rows: [] })

    expect(wrapper.find('.data-table-empty td').attributes('colspan')).toBe('4')

    const filled = mountTable({ selectable: true, selected: [2] })

    expect(filled.findAll('tbody tr')[1].attributes('aria-selected')).toBe('true')
  })

  it('should leave the selection attribute out when it cannot be selected', () => {
    expect(mountTable().find('tbody tr').attributes('aria-selected')).toBeUndefined()
  })

  it('should ask the server for the rows and show the ones it gets', async () => {
    const wrapper = mountTable({ serverSide: true, rows: rows.slice(0, 2), total: 40, pageSize: 10, searchable: true })

    expect(wrapper.emitted('query')?.[0]).toEqual([
      { page: 1, pageSize: 10, sort: undefined, direction: undefined, search: '' },
    ])
    expect(names(wrapper)).toEqual(['Charlie', 'alice'])
    expect(wrapper.find('table').attributes('aria-rowcount')).toBe('40')

    await wrapper
      .findAll('.pagination-item')
      .find((item) => '2' === item.text())
      ?.trigger('click')
    await nextTick()
    expect(wrapper.emitted('query')?.at(-1)).toEqual([
      { page: 2, pageSize: 10, sort: undefined, direction: undefined, search: '' },
    ])

    await wrapper.findAll('.data-table-sort')[0].trigger('click')
    await nextTick()
    expect(wrapper.emitted('query')?.at(-1)).toEqual([
      { page: 1, pageSize: 10, sort: 'name', direction: 'asc', search: '' },
    ])

    await wrapper.find('input[type="search"]').setValue('x')
    await nextTick()
    expect(wrapper.emitted('query')?.at(-1)?.[0]).toMatchObject({ search: 'x' })
  })

  it('should use the number of rows as the total when the server does not give one', () => {
    expect(mountTable({ serverSide: true }).find('table').attributes('aria-rowcount')).toBe('3')
  })

  it('should keep the page, the search and the sort in the URL', async () => {
    window.history.replaceState(null, '', '/?t_page=2&t_q=user')
    const wrapper = mountTable({ rows: many, pageSize: 10, searchable: true, queryPrefix: 't_' })

    expect(names(wrapper)[0]).toBe('User 11')

    await wrapper.findAll('.data-table-sort')[0].trigger('click')
    await nextTick()
    expect(window.location.search).toContain('t_sort=name')
    expect(window.location.search).not.toContain('t_page')
    expect(window.location.search).toContain('t_q=user')

    await wrapper.findAll('.data-table-sort')[0].trigger('click')
    await nextTick()
    expect(window.location.search).toContain('t_dir=desc')
    expect(names(wrapper)[0]).toBe('User 25')

    await wrapper.findAll('.data-table-sort')[0].trigger('click')
    await nextTick()
    expect(window.location.search).not.toContain('t_sort')
  })

  it('should read the sort from the URL', () => {
    window.history.replaceState(null, '', '/?s_sort=name&s_dir=desc')

    expect(names(mountTable({ queryPrefix: 's_' }))).toEqual(['Charlie', 'Bob', 'alice'])
  })

  it('should not touch the URL without a prefix', async () => {
    const wrapper = mountTable({ rows: many, pageSize: 10 })

    await wrapper
      .findAll('.pagination-item')
      .find((item) => '2' === item.text())
      ?.trigger('click')

    expect(window.location.search).toBe('')
  })
})
