import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Checkbox from '../../src/Form/Checkbox.vue'
import Select from '../../src/Form/Select.vue'
import Textarea from '../../src/Form/Textarea.vue'

const FormFieldMock = {
  template: '<div class="form-field"><slot /></div>',
  props: ['name', 'field'],
}

const FormInputMock = {
  template: '<input type="checkbox" />',
  props: ['modelValue', 'type', 'name'],
  emits: ['update:modelValue', 'isValid'],
}

const FormLabelMock = {
  template: '<label />',
  props: ['id', 'label', 'class', 'iconBefore', 'iconAfter', 'prefix', 'suffix'],
}

const FormAdditionalMock = {
  template: '<span class="additional" />',
  props: ['text'],
}

describe('FormCheckbox (field=false — raw input)', () => {
  it('renders a raw checkbox input when field=false', () => {
    const wrapper = mount(Checkbox, {
      props: { field: false, modelValue: false, name: 'agree' },
      attrs: { name: 'agree' },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = mount(Checkbox, {
      props: { field: false, modelValue: false, name: 'agree' },
      attrs: { name: 'agree' },
    })
    await wrapper.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})

describe('FormCheckbox (field=true — uses FormInput)', () => {
  it('renders via FormInput stub when field=true', () => {
    const wrapper = mount(Checkbox, {
      props: { field: true, modelValue: false },
      global: {
        stubs: { FormInput: FormInputMock },
      },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })
})

describe('FormSelect', () => {
  const options = { fr: 'France', de: 'Germany', es: 'Spain' }

  const createWrapper = (props = {}) =>
    mount(Select, {
      props: { name: 'country', options, ...props },
      global: {
        stubs: {
          FormField: FormFieldMock,
          FormLabel: FormLabelMock,
          FormAdditional: FormAdditionalMock,
        },
      },
    })

  it('renders a <select> element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('select').exists()).toBe(true)
  })

  it('renders flat options', () => {
    const wrapper = createWrapper()
    const opts = wrapper.findAll('option')
    expect(opts).toHaveLength(3)
    expect(opts[0].attributes('value')).toBe('fr')
    expect(opts[0].text()).toBe('France')
  })

  it('sets the required attribute', () => {
    const wrapper = createWrapper({ required: true })
    expect(wrapper.find('select').attributes('required')).toBeDefined()
  })

  it('shows error message via FormAdditional', () => {
    const wrapper = createWrapper({ errorMessage: 'Required field' })
    expect(wrapper.find('.additional').exists()).toBe(true)
  })

  it('emits update:modelValue on change', async () => {
    const wrapper = createWrapper({ modelValue: 'fr' })
    await wrapper.find('select').setValue('de')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})

describe('FormTextarea', () => {
  const createWrapper = (props = {}) =>
    mount(Textarea, {
      props: { name: 'message', ...props },
      global: {
        stubs: {
          FormField: FormFieldMock,
          FormLabel: FormLabelMock,
          FormAdditional: FormAdditionalMock,
        },
      },
    })

  it('renders a <textarea> element', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('sets name attribute', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('textarea').attributes('name')).toBe('message')
  })

  it('sets required attribute', () => {
    const wrapper = createWrapper({ required: true })
    expect(wrapper.find('textarea').attributes('required')).toBeDefined()
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = createWrapper({ modelValue: '' })
    await wrapper.find('textarea').setValue('Hello world')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
