/**
 * The line numbers of a "1,3-5" spec (or an array of numbers and "a-b" ranges).
 */
export function parseLines(spec: string | Array<number | string> | undefined): Set<number> {
  const lines = new Set<number>()

  if (undefined === spec) {
    return lines
  }

  const parts = Array.isArray(spec) ? spec.map(String) : spec.split(',')

  for (const part of parts) {
    const [start, end] = part.split('-').map((value) => Number.parseInt(value.trim(), 10))

    if (Number.isNaN(start)) {
      continue
    }

    for (let line = start; line <= (end ?? start) && Number.isFinite(line); line += 1) {
      lines.add(line)
    }
  }

  return lines
}

/** The lines of a code, without the empty line a final line break would add. */
export function splitLines(code: string): string[] {
  const lines = code.replace(/\r\n?/g, '\n').split('\n')

  if (1 < lines.length && '' === lines[lines.length - 1]) {
    lines.pop()
  }

  return lines
}
