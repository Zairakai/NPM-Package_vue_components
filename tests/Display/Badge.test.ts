import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Badge from '../../src/Display/Badge.vue'

describe('DisplayBadge', () => {
  it('should render the slot with the default variant and size', () => {
    const wrapper = mount(Badge, { slots: { default: '3' } })

    expect(wrapper.text()).toBe('3')
    expect(wrapper.classes()).toContain('badge')
    expect(wrapper.attributes('data-variant')).toBe('default')
    expect(wrapper.attributes('data-size')).toBe('medium')
    expect(wrapper.attributes('data-dot')).toBeUndefined()
  })

  it('should expose the variant, the size and the dot as data attributes', () => {
    const wrapper = mount(Badge, { props: { variant: 'success', size: 'small', dot: true, class: 'x', id: 'b' } })

    expect(wrapper.attributes('data-variant')).toBe('success')
    expect(wrapper.attributes('data-size')).toBe('small')
    expect(wrapper.attributes('data-dot')).toBeDefined()
    expect(wrapper.classes()).toEqual(['badge', 'x'])
    expect(wrapper.attributes('id')).toBe('b')
  })

  it('should validate the variant and the size', () => {
    const { variant, size } = (Badge as unknown as { props: Record<string, { validator: (v: string) => boolean }> })
      .props

    expect(variant.validator('error')).toBe(true)
    expect(variant.validator('nope')).toBe(false)
    expect(size.validator('large')).toBe(true)
    expect(size.validator('huge')).toBe(false)
  })
})
