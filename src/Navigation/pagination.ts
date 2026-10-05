export type PaginationItem = { type: 'page'; page: number } | { type: 'gap'; key: string }

/**
 * The items of a pagination: always the first and last pages (boundaries), the
 * current page and its siblings, and a gap wherever pages are left out.
 */
export function paginationRange(current: number, total: number, siblings = 1, boundaries = 1): PaginationItem[] {
  if (1 > total) {
    return []
  }

  const visible = new Set<number>()

  for (let page = 1; page <= Math.min(boundaries, total); page += 1) {
    visible.add(page)
  }

  for (let page = Math.max(1, total - boundaries + 1); page <= total; page += 1) {
    visible.add(page)
  }

  for (let page = Math.max(1, current - siblings); page <= Math.min(total, current + siblings); page += 1) {
    visible.add(page)
  }

  const items: PaginationItem[] = []
  let previous = 0

  for (const page of [...visible].sort((first, second) => first - second)) {
    if (1 === page - previous - 1) {
      // A gap of one page is shown as the page itself, it is shorter than an ellipsis.
      items.push({ type: 'page', page: previous + 1 })
    } else if (1 < page - previous - 1) {
      items.push({ type: 'gap', key: `gap-${previous}` })
    }

    items.push({ type: 'page', page })
    previous = page
  }

  return items
}
