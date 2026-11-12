type SortDirection = 'asc' | 'desc'

export interface TableSort {
  key: string
  direction: SortDirection
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  /** How to read the value: text (default), number or date. Used to sort and to format. */
  type?: 'text' | 'number' | 'date'
  align?: 'start' | 'center' | 'end'
  format?: (value: unknown, row: Record<string, unknown>) => string
  /** A filter control in the header of the search: a text, a list of choices or a range of numbers or dates. */
  filter?: 'text' | 'select' | 'range'
  /** The choices of a select filter: strings or { value, label }. */
  options?: Array<string | { value: string; label: string }>
}

/** The value of every active filter, by column key. A range is "min..max", either side may be empty. */
export type TableFilters = Record<string, string>

type Row = Record<string, unknown>

/** The next sort when a column header is activated: ascending, descending, then none. */
export function nextSort(
  current: TableSort | null | undefined,
  key: string,
): TableSort | null {
  if (current?.key !== key) {
    return { key, direction: 'asc' }
  }

  return current.direction === 'asc' ? { key, direction: 'desc' } : null
}

const valueOf = (row: Row, column: TableColumn): unknown => row[column.key]

/** The text shown in a cell. Numbers and dates follow the locale (Intl). */
export function formatCell(
  column: TableColumn,
  row: Row,
  locale?: string,
): string {
  const value = valueOf(row, column)

  if (column.format) {
    return column.format(value, row)
  }

  if (value === null || undefined === value || value === '') {
    return ''
  }

  if (column.type === 'number') {
    return new Intl.NumberFormat(locale).format(Number(value))
  }

  if (column.type === 'date') {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(
      new Date(value as string | number | Date),
    )
  }

  return String(value)
}

/** Keep the rows where a column that can be searched contains the text (not case sensitive). */
export function filterRows(
  rows: Row[],
  columns: TableColumn[],
  search: string,
): Row[] {
  const needle = search.trim().toLowerCase()

  if (needle === '') {
    return rows
  }

  return rows.filter((row) =>
    columns.some((column) =>
      formatCell(column, row).toLowerCase().includes(needle),
    ),
  )
}

/** Sort a copy of the rows: numbers by value, dates by time, text with natural order in the locale. */
export function sortRows(
  rows: Row[],
  columns: TableColumn[],
  sort: TableSort | null | undefined,
  locale?: string,
): Row[] {
  const column = columns.find((candidate) => candidate.key === sort?.key)

  if (!sort || !column) {
    return rows
  }

  const collator = new Intl.Collator(locale, {
    numeric: true,
    sensitivity: 'base',
  })
  const factor = sort.direction === 'asc' ? 1 : -1

  const compare = (first: unknown, second: unknown): number => {
    if (first === null || undefined === first || first === '') {
      return second === null || undefined === second || second === '' ? 0 : 1
    }

    if (second === null || undefined === second || second === '') {
      return -1
    }

    if (column.type === 'number') {
      return (Number(first) - Number(second)) * factor
    }

    if (column.type === 'date') {
      return (
        (new Date(first as string).getTime() -
          new Date(second as string).getTime()) *
        factor
      )
    }

    return collator.compare(String(first), String(second)) * factor
  }

  return [...rows].sort((first, second) =>
    compare(valueOf(first, column), valueOf(second, column)),
  )
}

/** The rows of a page (starting at 1). */
export function paginateRows(
  rows: Row[],
  page: number,
  pageSize: number,
): Row[] {
  return rows.slice((page - 1) * pageSize, page * pageSize)
}

/** The value of the aria-sort attribute of a column header. */
export function ariaSort(
  sort: TableSort | null | undefined,
  key: string,
): 'ascending' | 'descending' | 'none' {
  if (sort?.key !== key) {
    return 'none'
  }

  return sort.direction === 'asc' ? 'ascending' : 'descending'
}

/** The two sides of a range filter value. */
export function parseRange(value: string): { min: string; max: string } {
  const [min = '', max = ''] = value.split('..')

  return { min, max }
}

export function joinRange(min: string, max: string): string {
  return min === '' && max === '' ? '' : `${min}..${max}`
}

/** Only the filters that have a value. */
export function activeFilters(filters: TableFilters | undefined): TableFilters {
  return Object.fromEntries(
    Object.entries(filters ?? {}).filter(([, value]) => value !== ''),
  )
}

function matchesFilter(column: TableColumn, row: Row, value: string): boolean {
  const cell = valueOf(row, column)

  if (column.filter === 'range') {
    const { min, max } = parseRange(value)

    if (cell === null || undefined === cell || cell === '') {
      return false
    }

    const number =
      column.type === 'date' ? new Date(cell as string).getTime() : Number(cell)
    const low =
      min === ''
        ? -Infinity
        : column.type === 'date'
          ? new Date(min).getTime()
          : Number(min)
    const high =
      max === ''
        ? Infinity
        : column.type === 'date'
          ? new Date(max).getTime()
          : Number(max)

    return low <= number && number <= high
  }

  if (column.filter === 'select') {
    return String(cell ?? '') === value
  }

  return formatCell(column, row).toLowerCase().includes(value.toLowerCase())
}

/** Keep the rows that match every active filter. */
export function applyFilters(
  rows: Row[],
  columns: TableColumn[],
  filters: TableFilters | undefined,
): Row[] {
  const active = Object.entries(activeFilters(filters))

  if (active.length === 0) {
    return rows
  }

  return rows.filter((row) =>
    active.every(([key, value]) => {
      const column = columns.find((candidate) => candidate.key === key)

      return !column || matchesFilter(column, row, value)
    }),
  )
}
