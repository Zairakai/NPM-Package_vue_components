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
}

type Row = Record<string, unknown>

/** The next sort when a column header is activated: ascending, descending, then none. */
export function nextSort(current: TableSort | null | undefined, key: string): TableSort | null {
  if (current?.key !== key) {
    return { key, direction: 'asc' }
  }

  return 'asc' === current.direction ? { key, direction: 'desc' } : null
}

const valueOf = (row: Row, column: TableColumn): unknown => row[column.key]

/** The text shown in a cell. Numbers and dates follow the locale (Intl). */
export function formatCell(column: TableColumn, row: Row, locale?: string): string {
  const value = valueOf(row, column)

  if (column.format) {
    return column.format(value, row)
  }

  if (null === value || undefined === value || '' === value) {
    return ''
  }

  if ('number' === column.type) {
    return new Intl.NumberFormat(locale).format(Number(value))
  }

  if ('date' === column.type) {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(value as string | number | Date))
  }

  return String(value)
}

/** Keep the rows where a column that can be searched contains the text (not case sensitive). */
export function filterRows(rows: Row[], columns: TableColumn[], search: string): Row[] {
  const needle = search.trim().toLowerCase()

  if ('' === needle) {
    return rows
  }

  return rows.filter((row) => columns.some((column) => formatCell(column, row).toLowerCase().includes(needle)))
}

/** Sort a copy of the rows: numbers by value, dates by time, text with natural order in the locale. */
export function sortRows(
  rows: Row[],
  columns: TableColumn[],
  sort: TableSort | null | undefined,
  locale?: string
): Row[] {
  const column = columns.find((candidate) => candidate.key === sort?.key)

  if (!sort || !column) {
    return rows
  }

  const collator = new Intl.Collator(locale, { numeric: true, sensitivity: 'base' })
  const factor = 'asc' === sort.direction ? 1 : -1

  const compare = (first: unknown, second: unknown): number => {
    if (null === first || undefined === first || '' === first) {
      return null === second || undefined === second || '' === second ? 0 : 1
    }

    if (null === second || undefined === second || '' === second) {
      return -1
    }

    if ('number' === column.type) {
      return (Number(first) - Number(second)) * factor
    }

    if ('date' === column.type) {
      return (new Date(first as string).getTime() - new Date(second as string).getTime()) * factor
    }

    return collator.compare(String(first), String(second)) * factor
  }

  return [...rows].sort((first, second) => compare(valueOf(first, column), valueOf(second, column)))
}

/** The rows of a page (starting at 1). */
export function paginateRows(rows: Row[], page: number, pageSize: number): Row[] {
  return rows.slice((page - 1) * pageSize, page * pageSize)
}

/** The value of the aria-sort attribute of a column header. */
export function ariaSort(sort: TableSort | null | undefined, key: string): 'ascending' | 'descending' | 'none' {
  if (sort?.key !== key) {
    return 'none'
  }

  return 'asc' === sort.direction ? 'ascending' : 'descending'
}
