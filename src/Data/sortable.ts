/** A copy of a list with one item moved from an index to another. */
export function move<T>(items: T[], from: number, to: number): T[] {
  if (
    from === to ||
    from < 0 ||
    from >= items.length ||
    to < 0 ||
    to >= items.length
  ) {
    return items
  }

  const next = [...items]
  const moved = next.splice(from, 1)

  next.splice(to, 0, ...moved)

  return next
}
