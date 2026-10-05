import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Divider from '../../src/Display/Divider.vue'

describe('DisplayDivider', () => {
  it('should render a horizontal rule by default', () => {
    const wrapper = mount(Divider, { props: { class: 'x', id: 'd' } })

    expect(wrapper.element.tagName).toBe('HR')
    expect(wrapper.classes()).toEqual(['divider', 'x'])
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.attributes('id')).toBe('d')
  })

  it('should render a vertical separator', () => {
    const wrapper = mount(Divider, { props: { orientation: 'vertical' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('vertical')
    expect(wrapper.find('.divider-label').exists()).toBe(false)
  })

  it('should render a label in the middle of the separator', () => {
    const wrapper = mount(Divider, { slots: { default: 'or' } })

    expect(wrapper.attributes('role')).toBe('separator')
    expect(wrapper.attributes('aria-orientation')).toBe('horizontal')
    expect(wrapper.find('.divider-label').text()).toBe('or')
  })

  it('should validate the orientation', () => {
    const { orientation } = (Divider as unknown as { props: Record<string, { validator: (v: string) => boolean }> })
      .props

    expect(orientation.validator('vertical')).toBe(true)
    expect(orientation.validator('diagonal')).toBe(false)
  })
})
