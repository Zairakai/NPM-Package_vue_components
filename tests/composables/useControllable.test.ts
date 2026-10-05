import { describe, expect, it, vi } from 'vitest'
import { useControllable } from '../../src/composables/useControllable'

describe('useControllable', () => {
  it('should use its own state when the prop is not provided', () => {
    const emit = vi.fn()
    const value = useControllable<number>({}, 'modelValue', emit, 1)

    expect(value.value).toBe(1)

    value.value = 2

    expect(value.value).toBe(2)
    expect(emit).toHaveBeenCalledWith('update:modelValue', 2)
  })

  it('should follow the prop when it is provided', () => {
    const emit = vi.fn()
    const props = { page: 5 }
    const value = useControllable<number>(props, 'page', emit, 1)

    expect(value.value).toBe(5)

    value.value = 6

    expect(value.value).toBe(5)
    expect(emit).toHaveBeenCalledWith('update:page', 6)
  })
})
