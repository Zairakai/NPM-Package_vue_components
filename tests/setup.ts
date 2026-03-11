import { vi } from 'vitest'

vi.mock('@js/Services/Pinia', () => {
  return {
    default: {},
  }
})
