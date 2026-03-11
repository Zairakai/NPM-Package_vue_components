import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FormField from '../../src/Form/Field.vue'

describe('FormField', () => {
  it('wraps slot content by default', () => {
    const wrapper = mount(FormField, {
      slots: { default: '<span data-test="slot">Hi</span>' },
    })

    expect(wrapper.find('.field').exists()).toBe(true)
    expect(wrapper.find('[data-test="slot"]').exists()).toBe(true)
  })

  it('renders slot directly when field=false', () => {
    const wrapper = mount(FormField, {
      props: { field: false },
      slots: { default: '<span data-test="slot">Hi</span>' },
    })

    expect(wrapper.find('.field').exists()).toBe(false)
    expect(wrapper.find('[data-test="slot"]').exists()).toBe(true)
  })
})
