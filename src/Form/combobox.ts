export interface ComboOption {
  value: string
  label: string
  disabled?: boolean
}

/** Options given as strings or as objects, always as objects. */
export function normalizeOptions(options: Array<string | ComboOption> | Record<string, string>): ComboOption[] {
  if (!Array.isArray(options)) {
    return Object.entries(options).map(([value, label]) => ({ value, label }))
  }

  return options.map((option) => ('string' === typeof option ? { value: option, label: option } : option))
}

/** Keep the options whose label contains the text, not case sensitive and without accents. */
export function filterOptions(options: ComboOption[], query: string): ComboOption[] {
  const strip = (text: string): string =>
    text
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
  const needle = strip(query.trim())

  return '' === needle ? options : options.filter((option) => strip(option.label).includes(needle))
}

/** The next option that is not disabled, going in a direction and wrapping around. -1 when none. */
export function nextEnabled(options: ComboOption[], from: number, direction: 1 | -1): number {
  const count = options.length

  for (let step = 1; step <= count; step += 1) {
    const index = (((from + direction * step) % count) + count) % count

    if (!options[index].disabled) {
      return index
    }
  }

  return -1
}
