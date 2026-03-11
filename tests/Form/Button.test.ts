import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Button from '../../src/Form/Button.vue'

// Mock the FormField component
const FormFieldMock = {
  template: '<div class="form-field" :class="$attrs.class"><slot /></div>',
  props: ['field', 'name'],
}

describe('FormButton', () => {
  const createWrapper = (props = {}, slots = {}) => {
    return mount(Button, {
      props,
      slots,
      global: {
        stubs: {
          FormField: FormFieldMock,
        },
      },
    })
  }

  it('should render with default props', () => {
    const wrapper = createWrapper({}, { default: 'Click me' })

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('button').attributes('type')).toBe('button')
    expect(wrapper.text()).toBe('Click me')
  })

  it('should render different button types', () => {
    const submitWrapper = createWrapper({ type: 'submit' })
    expect(submitWrapper.find('button').attributes('type')).toBe('submit')

    const resetWrapper = createWrapper({ type: 'reset' })
    expect(resetWrapper.find('button').attributes('type')).toBe('reset')
  })

  it('should pass through standard button attributes', () => {
    const wrapper = createWrapper({
      id: 'test-button',
      name: 'test-name',
      value: 'test-value',
      form: 'test-form',
    })

    const button = wrapper.find('button')
    expect(button.attributes('id')).toBe('test-button')
    expect(button.attributes('name')).toBe('test-name')
    expect(button.attributes('value')).toBe('test-value')
    expect(button.attributes('form')).toBe('test-form')
  })

  it('should handle disabled state', () => {
    const wrapper = createWrapper({ disabled: true })
    expect(wrapper.find('button').attributes('disabled')).toBeDefined()
  })

  it('should render slot content', () => {
    const wrapper = createWrapper(
      {},
      {
        default: '<span class="icon">🚀</span> Launch',
      }
    )

    expect(wrapper.html()).toContain('<span class="icon">🚀</span> Launch')
  })

  it('should apply custom classes to field wrapper', () => {
    const wrapper = createWrapper({
      fieldClass: 'custom-field-class',
    })
    expect(wrapper.find('.form-field').classes()).toContain('custom-field-class')
  })

  it('should validate button type prop', () => {
    // This would normally be tested at the Vue level, but we can test the validator function
    const component = Button as any
    const typeValidator = component.props?.type?.validator

    if (typeValidator) {
      expect(typeValidator('button')).toBe(true)
      expect(typeValidator('submit')).toBe(true)
      expect(typeValidator('reset')).toBe(true)
      expect(typeValidator('invalid')).toBe(false)
    }
  })
})
