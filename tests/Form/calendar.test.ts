import { describe, expect, it } from 'vitest'
import { addDays, addMonths, clampIso, fromIso, isBetween, monthGrid, orderRange, toIso } from '../../src/Form/calendar'
import { filterOptions, nextEnabled, normalizeOptions } from '../../src/Form/combobox'

describe('calendar helpers', () => {
  it('should convert between a date and an ISO day', () => {
    expect(toIso(new Date(2026, 9, 5))).toBe('2026-10-05')
    expect(toIso(fromIso('2026-02-28')!)).toBe('2026-02-28')
    expect(fromIso('2026-02-30')).toBeUndefined()
    expect(fromIso('nope')).toBeUndefined()
    expect(fromIso(undefined)).toBeUndefined()
  })

  it('should add days and months without leaving the target month', () => {
    expect(toIso(addDays(new Date(2026, 0, 31), 1))).toBe('2026-02-01')
    expect(toIso(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28')
    expect(toIso(addMonths(new Date(2028, 0, 31), 1))).toBe('2028-02-29')
    expect(toIso(addMonths(new Date(2026, 0, 15), -1))).toBe('2025-12-15')
  })

  it('should build the weeks of a month from the first day of the week', () => {
    const monday = monthGrid(2026, 9, 1)
    const sunday = monthGrid(2026, 9, 0)

    expect(monday.every((row) => 7 === row.length)).toBe(true)
    expect(toIso(monday[0][0])).toBe('2026-09-28')
    expect(monday).toHaveLength(5)
    expect(toIso(sunday[0][0])).toBe('2026-09-27')
  })

  it('should clamp, order and test ranges', () => {
    expect(clampIso('2026-01-01', '2026-02-01', '2026-03-01')).toBe('2026-02-01')
    expect(clampIso('2026-05-01', '2026-02-01', '2026-03-01')).toBe('2026-03-01')
    expect(clampIso('2026-02-10', '2026-02-01', '2026-03-01')).toBe('2026-02-10')
    expect(clampIso('2026-02-10')).toBe('2026-02-10')
    expect(orderRange('2026-02-10', '2026-02-01')).toEqual(['2026-02-01', '2026-02-10'])
    expect(orderRange('2026-02-01', '2026-02-10')).toEqual(['2026-02-01', '2026-02-10'])
    expect(isBetween('2026-02-05', '2026-02-01', '2026-02-10')).toBe(true)
    expect(isBetween('2026-02-15', '2026-02-01', '2026-02-10')).toBe(false)
    expect(isBetween('2026-02-05', undefined, '2026-02-10')).toBe(false)
  })
})

describe('combobox helpers', () => {
  it('should normalize strings, objects and maps', () => {
    expect(normalizeOptions(['a'])).toEqual([{ value: 'a', label: 'a' }])
    expect(normalizeOptions([{ value: 'a', label: 'A' }])).toEqual([{ value: 'a', label: 'A' }])
    expect(normalizeOptions({ a: 'A' })).toEqual([{ value: 'a', label: 'A' }])
  })

  it('should filter without case and accents', () => {
    const options = normalizeOptions(['Élodie', 'Bob'])

    expect(filterOptions(options, 'elo').map((option) => option.value)).toEqual(['Élodie'])
    expect(filterOptions(options, '  ')).toBe(options)
    expect(filterOptions(options, 'zz')).toEqual([])
  })

  it('should find the next enabled option and wrap around', () => {
    const options = [
      { value: 'a', label: 'a' },
      { value: 'b', label: 'b', disabled: true },
      { value: 'c', label: 'c' },
    ]

    expect(nextEnabled(options, 0, 1)).toBe(2)
    expect(nextEnabled(options, 2, 1)).toBe(0)
    expect(nextEnabled(options, 0, -1)).toBe(2)
    expect(nextEnabled([{ value: 'x', label: 'x', disabled: true }], -1, 1)).toBe(-1)
    expect(nextEnabled([], -1, 1)).toBe(-1)
  })
})
