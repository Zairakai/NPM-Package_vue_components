export interface TreeNodeData {
  id: string
  label: string
  disabled?: boolean
  children?: TreeNodeData[]
}

export interface FlatNode {
  node: TreeNodeData
  depth: number
  parent: string | null
}

/** The nodes that can be reached with the keyboard: a node's children only when it is expanded. */
export function visibleNodes(
  nodes: TreeNodeData[],
  expanded: string[],
  depth = 0,
  parent: string | null = null
): FlatNode[] {
  return nodes.flatMap((node) => [
    { node, depth, parent },
    ...(node.children?.length && expanded.includes(node.id)
      ? visibleNodes(node.children, expanded, depth + 1, node.id)
      : []),
  ])
}

/** The ids of every node that has children. */
export function branchIds(nodes: TreeNodeData[]): string[] {
  return nodes.flatMap((node) => (node.children?.length ? [node.id, ...branchIds(node.children)] : []))
}

/** The ids that must be expanded to show a node (all its ancestors). */
export function ancestorsOf(nodes: TreeNodeData[], id: string, path: string[] = []): string[] | undefined {
  for (const node of nodes) {
    if (node.id === id) {
      return path
    }

    const found = node.children ? ancestorsOf(node.children, id, [...path, node.id]) : undefined

    if (found) {
      return found
    }
  }

  return undefined
}
