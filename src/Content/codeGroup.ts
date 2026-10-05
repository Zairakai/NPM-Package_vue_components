import { reactive } from 'vue'

const STORAGE_PREFIX = 'zk-code-group:'

// The choice of every named group, shared by all the code groups of the page.
const selections: Record<string, string | undefined> = reactive({})

/** The tab chosen for a group, from the page or from what the visitor chose before. */
export function groupSelection(group: string): string | undefined {
  if (undefined === selections[group]) {
    try {
      selections[group] = window.localStorage.getItem(`${STORAGE_PREFIX}${group}`) ?? undefined
    } catch {
      // Storage can be blocked (private mode): the choice only lasts for the page.
    }
  }

  return selections[group]
}

export function selectInGroup(group: string, id: string): void {
  selections[group] = id

  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${group}`, id)
  } catch {
    // See above.
  }
}

/** Forget every choice (tests). */
export function resetGroups(): void {
  for (const key of Object.keys(selections)) {
    delete selections[key]
  }
}
