type DiffType = 'file' | 'hunk' | 'add' | 'del' | 'context'

export interface DiffLine {
  type: DiffType
  text: string
  oldNumber: number | undefined
  newNumber: number | undefined
}

export interface DiffRow {
  left: DiffLine | undefined
  right: DiffLine | undefined
}

const HUNK = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/

/** Read a unified diff (what `git diff` prints) line by line, with the line numbers of both sides. */
export function parseDiff(diff: string): DiffLine[] {
  const lines: DiffLine[] = []
  let oldNumber = 0
  let newNumber = 0
  let inHunk = false

  for (const raw of diff.replace(/\r\n?/g, '\n').replace(/\n$/, '').split('\n')) {
    const hunk = HUNK.exec(raw)

    if (hunk) {
      oldNumber = Number(hunk[1])
      newNumber = Number(hunk[2])
      inHunk = true
      lines.push({ type: 'hunk', text: raw, oldNumber: undefined, newNumber: undefined })
    } else if (!inHunk || /^(diff --git|index |--- |\+\+\+ )/.test(raw)) {
      inHunk = inHunk && !raw.startsWith('diff --git')
      lines.push({ type: 'file', text: raw, oldNumber: undefined, newNumber: undefined })
    } else if (raw.startsWith('+')) {
      lines.push({ type: 'add', text: raw.slice(1), oldNumber: undefined, newNumber })
      newNumber += 1
    } else if (raw.startsWith('-')) {
      lines.push({ type: 'del', text: raw.slice(1), oldNumber, newNumber: undefined })
      oldNumber += 1
    } else {
      lines.push({ type: 'context', text: raw.slice(1), oldNumber, newNumber })
      oldNumber += 1
      newNumber += 1
    }
  }

  return lines
}

/** Pair the removed and the added lines of each change to show the two sides next to each other. */
export function splitRows(lines: DiffLine[]): DiffRow[] {
  const rows: DiffRow[] = []
  let removed: DiffLine[] = []
  let added: DiffLine[] = []

  const flush = (): void => {
    for (let index = 0; index < Math.max(removed.length, added.length); index += 1) {
      rows.push({ left: removed[index], right: added[index] })
    }

    removed = []
    added = []
  }

  for (const line of lines) {
    if ('del' === line.type) {
      removed.push(line)
    } else if ('add' === line.type) {
      added.push(line)
    } else {
      flush()
      rows.push('context' === line.type ? { left: line, right: line } : { left: line, right: line })
    }
  }

  flush()

  return rows
}
