import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormButton from '../../src/Form/Button.vue'

describe('FormButton', () => {
  it('renders a button with default type', () => {
    const wrapper = mount(FormButton, {
      slots: { default: 'Save' },
    })

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('type')).toBe('button')
  })

  it('applies data-icon attribute', () => {
    const wrapper = mount(FormButton, {
      props: { icon: 'plus' },
      slots: { default: 'Add' },
    })

    const button = wrapper.find('button')
    expect(button.attributes('data-icon')).toBe('plus')
  })
})
