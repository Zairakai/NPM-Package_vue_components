/** Keep a number inside bounds and on a step. */
export function snap(value: number, min: number, max: number, step: number): number {
  const stepped = Math.round((value - min) / step) * step + min
  const decimals = (String(step).split('.')[1] ?? '').length

  return Math.min(max, Math.max(min, Number(stepped.toFixed(decimals))))
}

/** Split a text on separators into trimmed, non empty values. */
export function splitTags(text: string, separators: string[] = [',', ';', '\n', '\t']): string[] {
  const pattern = new RegExp(`[${separators.map((separator) => separator.replace(/[\\\]^-]/g, '\\$&')).join('')}]`)

  return text
    .split(pattern)
    .map((part) => part.trim())
    .filter((part) => '' !== part)
}

/** The digits of a pasted code, cut to the length of the code. */
export function otpDigits(text: string, length: number, pattern = /\d/): string[] {
  return [...text].filter((character) => pattern.test(character)).slice(0, length)
}

/** A hex colour as #rrggbb or #rrggbbaa, or undefined. Accepts the short forms #rgb and #rgba. */
export function normalizeHex(value: string): string | undefined {
  const match = /^#?([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i.exec(value.trim())

  if (!match) {
    return undefined
  }

  const hex = match[1].toLowerCase()
  const full = 5 > hex.length ? [...hex].map((character) => character + character).join('') : hex

  return `#${full}`
}

export function splitHex(value: string): { color: string; alpha: number } | undefined {
  const hex = normalizeHex(value)

  if (!hex) {
    return undefined
  }

  return {
    color: hex.slice(0, 7),
    alpha: 9 === hex.length ? Math.round((parseInt(hex.slice(7), 16) / 255) * 100) / 100 : 1,
  }
}

export function joinHex(color: string, alpha: number): string {
  const base = normalizeHex(color)?.slice(0, 7) ?? '#000000'

  if (1 <= alpha) {
    return base
  }

  return `${base}${Math.round(Math.max(0, alpha) * 255)
    .toString(16)
    .padStart(2, '0')}`
}

/** 1536 -> 1.5 KB. */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  const power = Math.min(units.length - 1, Math.floor(Math.log(Math.max(bytes, 1)) / Math.log(1024)))
  const value = bytes / 1024 ** power

  return `${Number(value.toFixed(1))} ${units[power]}`
}

export interface FileRejection {
  file: File
  reason: 'type' | 'size' | 'count'
}

/** Is a file allowed by an accept list (".png", "image/*", "image/png")? */
export function matchesAccept(file: { name: string; type: string }, accept: string): boolean {
  if ('' === accept.trim()) {
    return true
  }

  return accept
    .split(',')
    .map((rule) => rule.trim().toLowerCase())
    .some((rule) =>
      rule.startsWith('.')
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith('/*')
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule
    )
}

/** Sort the given files into the accepted ones and the rejected ones, with the reason. */
export function validateFiles(
  current: File[],
  incoming: File[],
  rules: { accept?: string; maxSize?: number; maxFiles?: number }
): { accepted: File[]; rejected: FileRejection[] } {
  const accepted: File[] = []
  const rejected: FileRejection[] = []

  for (const file of incoming) {
    if (!matchesAccept(file, rules.accept ?? '')) {
      rejected.push({ file, reason: 'type' })
    } else if (undefined !== rules.maxSize && file.size > rules.maxSize) {
      rejected.push({ file, reason: 'size' })
    } else if (undefined !== rules.maxFiles && current.length + accepted.length >= rules.maxFiles) {
      rejected.push({ file, reason: 'count' })
    } else {
      accepted.push(file)
    }
  }

  return { accepted, rejected }
}
