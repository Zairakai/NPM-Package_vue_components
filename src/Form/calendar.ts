/** A day as the ISO date of the local calendar: 2026-10-05. */
export function toIso(date: Date): string {
  const pad = (number: number): string => String(number).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** The date of an ISO day, at local midnight. Undefined when it is not a real day. */
export function fromIso(value: string | undefined | null): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? '')

  if (!match) {
    return undefined
  }

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))

  return toIso(date) === value ? date : undefined
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

/** Move by months, staying inside the target month (31 Jan + 1 month = 28 or 29 Feb). */
export function addMonths(date: Date, months: number): Date {
  const target = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate()

  return new Date(target.getFullYear(), target.getMonth(), Math.min(date.getDate(), last))
}

/** The weeks of a month as rows of seven days, from the first day of the week (0 = Sunday, 1 = Monday). */
export function monthGrid(year: number, month: number, weekStart = 1): Date[][] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() - weekStart + 7) % 7
  const start = addDays(first, -offset)
  const days = new Date(year, month + 1, 0).getDate()
  const rows = Math.ceil((offset + days) / 7)

  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => addDays(start, row * 7 + column))
  )
}

export function isBetween(iso: string, start: string | undefined, end: string | undefined): boolean {
  return Boolean(start && end) && start! <= iso && iso <= end!
}

/** Keep an ISO day inside optional bounds. */
export function clampIso(iso: string, min?: string, max?: string): string {
  if (min && iso < min) {
    return min
  }

  return max && iso > max ? max : iso
}

/** A range from two clicks: the earlier one first. */
export function orderRange(first: string, second: string): [string, string] {
  return first <= second ? [first, second] : [second, first]
}
