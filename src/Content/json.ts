export type JsonKind = 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'

export function kindOf(value: unknown): JsonKind {
  if (null === value || undefined === value) {
    return 'null'
  }

  if (Array.isArray(value)) {
    return 'array'
  }

  return 'object' === typeof value ? 'object' : (typeof value as 'string' | 'number' | 'boolean')
}

/** How a primitive is shown: strings are quoted. */
export function display(value: unknown): string {
  return 'string' === kindOf(value) ? JSON.stringify(value) : String(value ?? 'null')
}

/** The keys (or indexes) of an object or an array. */
export function entriesOf(value: unknown): Array<[string, unknown]> {
  const kind = kindOf(value)

  if ('array' === kind) {
    return (value as unknown[]).map((item, index) => [String(index), item])
  }

  return 'object' === kind ? Object.entries(value as Record<string, unknown>) : []
}

/** Whether a key or a value, anywhere below, contains the text (not case sensitive). */
export function contains(value: unknown, term: string, key = ''): boolean {
  const needle = term.toLowerCase()

  if ('' === needle) {
    return false
  }

  if (key.toLowerCase().includes(needle)) {
    return true
  }

  const kind = kindOf(value)

  if ('object' === kind || 'array' === kind) {
    return entriesOf(value).some(([childKey, child]) => contains(child, term, childKey))
  }

  return display(value).toLowerCase().includes(needle)
}

/** The path of a child: a.b[2].c */
export function childPath(parent: string, key: string, parentKind: JsonKind): string {
  if ('array' === parentKind) {
    return `${parent}[${key}]`
  }

  return '' === parent ? key : `${parent}.${key}`
}
