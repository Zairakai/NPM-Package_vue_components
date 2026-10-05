/** A copy of a list with one item moved from an index to another. */
export function move<T>(items: T[], from: number, to: number): T[] {
  if (from === to || 0 > from || from >= items.length || 0 > to || to >= items.length) {
    return items
  }

  const next = [...items]
  const [item] = next.splice(from, 1)

  next.splice(to, 0, item)

  return next
}
