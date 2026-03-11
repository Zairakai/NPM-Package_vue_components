import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Container from '../../src/Layout/Container.vue'

describe('LayoutContainer', () => {
  const createWrapper = (props = {}, slots = {}) => {
    return mount(Container, {
      props,
      slots,
    })
  }

  it('should render with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.element.tagName.toLowerCase()).toBe('div')
  })

  it('should render slot content', () => {
    const wrapper = createWrapper(
      {},
      {
        default: '<p>Container content</p>',
      }
    )

    expect(wrapper.html()).toContain('<p>Container content</p>')
  })

  it('should apply id attribute', () => {
    const wrapper = createWrapper({ id: 'main-container' })
    expect(wrapper.attributes('id')).toBe('main-container')
  })

  it('should apply class attribute', () => {
    const wrapper = createWrapper({
      class: 'custom-container',
    })
    expect(wrapper.classes()).toContain('custom-container')
  })

  it('should apply role attribute', () => {
    const wrapper = createWrapper({ role: 'main' })
    expect(wrapper.attributes('role')).toBe('main')
  })

  it('should apply multiple props together', () => {
    const wrapper = createWrapper({
      id: 'test-container',
      class: 'fluid centered',
      role: 'region',
    })

    expect(wrapper.attributes('id')).toBe('test-container')
    expect(wrapper.classes()).toContain('fluid')
    expect(wrapper.classes()).toContain('centered')
    expect(wrapper.attributes('role')).toBe('region')
  })

  it('should handle empty props gracefully', () => {
    const wrapper = createWrapper({
      id: '',
      class: '',
      role: '',
    })

    // Empty string attributes should either not be present or be empty
    const id = wrapper.attributes('id')
    const role = wrapper.attributes('role')

    expect(id === undefined || id === '').toBe(true)
    expect(role === undefined || role === '').toBe(true)
  })

  it('should support nested content', () => {
    const wrapper = createWrapper(
      {},
      {
        default: `
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      `,
      }
    )

    expect(wrapper.html()).toContain('<header>Header</header>')
    expect(wrapper.html()).toContain('<main>Main content</main>')
    expect(wrapper.html()).toContain('<footer>Footer</footer>')
  })
})
