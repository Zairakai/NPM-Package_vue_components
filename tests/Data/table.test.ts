import { describe, expect, it } from 'vitest'
import {
  ariaSort,
  filterRows,
  formatCell,
  nextSort,
  paginateRows,
  sortRows,
  type TableColumn,
} from '../../src/Data/table'

const columns: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', type: 'number', sortable: true },
  { key: 'born', label: 'Born', type: 'date', sortable: true },
]

const rows = [
  { id: 1, name: 'item 10', age: 30, born: '1990-05-01' },
  { id: 2, name: 'Item 2', age: 7, born: '2001-01-15' },
  { id: 3, name: 'alpha', age: null, born: null },
]

describe('nextSort', () => {
  it('should go ascending, descending, then none', () => {
    const asc = nextSort(null, 'name')

    expect(asc).toEqual({ key: 'name', direction: 'asc' })
    expect(nextSort(asc, 'name')).toEqual({ key: 'name', direction: 'desc' })
    expect(nextSort({ key: 'name', direction: 'desc' }, 'name')).toBeNull()
  })

  it('should start again when another column is chosen', () => {
    expect(nextSort({ key: 'name', direction: 'desc' }, 'age')).toEqual({ key: 'age', direction: 'asc' })
    expect(nextSort(undefined, 'age')).toEqual({ key: 'age', direction: 'asc' })
  })
})

describe('ariaSort', () => {
  it('should give the aria-sort value of a column', () => {
    expect(ariaSort({ key: 'a', direction: 'asc' }, 'a')).toBe('ascending')
    expect(ariaSort({ key: 'a', direction: 'desc' }, 'a')).toBe('descending')
    expect(ariaSort({ key: 'a', direction: 'asc' }, 'b')).toBe('none')
    expect(ariaSort(null, 'a')).toBe('none')
  })
})

describe('formatCell', () => {
  it('should show text, numbers and dates with the locale', () => {
    expect(formatCell(columns[0], rows[0])).toBe('item 10')
    expect(formatCell({ key: 'n', label: 'N', type: 'number' }, { n: 1234567.5 }, 'en-US')).toBe('1,234,567.5')
    expect(formatCell(columns[2], rows[0], 'en-US')).toBe('May 1, 1990')
  })

  it('should show nothing for an empty value', () => {
    expect(formatCell(columns[1], rows[2])).toBe('')
    expect(formatCell(columns[0], { name: '' })).toBe('')
    expect(formatCell(columns[0], {})).toBe('')
  })

  it('should use the format function of the column', () => {
    expect(
      formatCell({ key: 'name', label: 'N', format: (value, row) => `${String(value)}#${String(row['id'])}` }, rows[0])
    ).toBe('item 10#1')
  })
})

describe('filterRows', () => {
  it('should keep the rows that contain the text in a shown value, not case sensitive', () => {
    expect(filterRows(rows, columns, 'ITEM').map((row) => row['id'])).toEqual([1, 2])
    expect(filterRows(rows, columns, ' alpha ').map((row) => row['id'])).toEqual([3])
    expect(filterRows(rows, columns, 'nothing')).toEqual([])
  })

  it('should keep every row without a search', () => {
    expect(filterRows(rows, columns, '  ')).toBe(rows)
  })
})

describe('sortRows', () => {
  it('should sort text in natural order', () => {
    expect(sortRows(rows, columns, { key: 'name', direction: 'asc' }, 'en').map((row) => row['id'])).toEqual([3, 2, 1])
    expect(sortRows(rows, columns, { key: 'name', direction: 'desc' }, 'en').map((row) => row['id'])).toEqual([1, 2, 3])
  })

  it('should sort numbers by value and put the empty ones last', () => {
    expect(sortRows(rows, columns, { key: 'age', direction: 'asc' }).map((row) => row['id'])).toEqual([2, 1, 3])
    expect(sortRows(rows, columns, { key: 'age', direction: 'desc' }).map((row) => row['id'])).toEqual([1, 2, 3])
  })

  it('should sort dates by time', () => {
    expect(sortRows(rows, columns, { key: 'born', direction: 'asc' }).map((row) => row['id'])).toEqual([1, 2, 3])
    expect(sortRows(rows, columns, { key: 'born', direction: 'desc' }).map((row) => row['id'])).toEqual([2, 1, 3])
  })

  it('should leave empty values equal and not change the given rows', () => {
    const copy = [...rows]

    expect(sortRows([{ a: null }, { a: '' }], [{ key: 'a', label: 'A' }], { key: 'a', direction: 'asc' })).toHaveLength(
      2
    )
    sortRows(rows, columns, { key: 'age', direction: 'asc' })
    expect(rows).toEqual(copy)
  })

  it('should not sort without a sort or for an unknown column', () => {
    expect(sortRows(rows, columns, null)).toBe(rows)
    expect(sortRows(rows, columns, { key: 'zzz', direction: 'asc' })).toBe(rows)
  })
})

describe('paginateRows', () => {
  it('should cut a page', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({ id: index + 1 }))

    expect(paginateRows(many, 1, 10)).toHaveLength(10)
    expect(paginateRows(many, 3, 10).map((row) => row['id'])).toEqual([21, 22, 23, 24, 25])
    expect(paginateRows(many, 4, 10)).toEqual([])
  })
})
