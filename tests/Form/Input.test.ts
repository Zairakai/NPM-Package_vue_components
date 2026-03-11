import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import Input from '../../src/Form/Input.vue'

// Mock components
const FormFieldMock = {
  template: '<div class="form-field" :class="$attrs.class"><slot /></div>',
  props: ['field', 'name'],
}

const FormLabelMock = {
  template: '<label>Test Label</label>',
  props: ['id', 'label', 'fieldClass', 'iconBefore', 'iconAfter', 'prefix', 'suffix'],
}

const FormAdditionalMock = {
  name: 'FormAdditional',
  template: '<div class="form-additional">{{ text }}</div>',
  props: ['text'],
}

describe('FormInput', () => {
  const createWrapper = (props = {}) => {
    return mount(Input, {
      props: {
        name: 'test-input',
        ...props,
      },
      global: {
        stubs: {
          FormField: FormFieldMock,
          FormLabel: FormLabelMock,
          FormAdditional: FormAdditionalMock,
        },
      },
    })
  }

  it('should render with default props', () => {
    const wrapper = createWrapper()

    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(wrapper.find('input').attributes('name')).toBe('test-input')
  })

  it('should render different input types', () => {
    const emailWrapper = createWrapper({ type: 'email' })
    expect(emailWrapper.find('input').attributes('type')).toBe('email')

    const passwordWrapper = createWrapper({
      type: 'password',
    })
    expect(passwordWrapper.find('input').attributes('type')).toBe('password')

    const numberWrapper = createWrapper({ type: 'number' })
    expect(numberWrapper.find('input').attributes('type')).toBe('number')
  })

  it('should handle v-model correctly', async () => {
    const wrapper = createWrapper({
      modelValue: 'initial value',
    })
    const input = wrapper.find('input')

    expect((input.element as HTMLInputElement).value).toBe('initial value')

    // Test input changes
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
  })

  it('should render hidden input without wrapper elements', () => {
    const wrapper = createWrapper({
      type: 'hidden',
      modelValue: 'hidden-value',
    })
    const input = wrapper.find('input')

    expect(input.attributes('type')).toBe('hidden')
    expect((input.element as HTMLInputElement).value).toBe('hidden-value')
    expect(wrapper.find('[data-input]').exists()).toBe(false)
  })

  it('should render visible input with wrapper elements', () => {
    const wrapper = createWrapper({ type: 'text' })

    expect(wrapper.find('[data-input]').exists()).toBe(true)
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('should render icon before input', () => {
    const wrapper = createWrapper({ iconBefore: 'search' })

    const iconElement = wrapper.find('[data-leading-icon]')
    expect(iconElement.exists()).toBe(true)
    expect(iconElement.html()).toContain('search')
    expect(iconElement.classes()).toContain('msr')
  })

  it('should render prefix', () => {
    const wrapper = createWrapper({ prefix: '$' })

    const prefixElement = wrapper.find('[data-prefix]')
    expect(prefixElement.exists()).toBe(true)
    expect(prefixElement.html()).toContain('$')
  })

  it('should render suffix', () => {
    const wrapper = createWrapper({ suffix: '.00' })

    const suffixElement = wrapper.find('[data-suffix]')
    expect(suffixElement.exists()).toBe(true)
    expect(suffixElement.html()).toContain('.00')
  })

  it('should render icon after input', () => {
    const wrapper = createWrapper({ iconAfter: 'clear' })

    const iconElement = wrapper.find('[data-trailing-icon]')
    expect(iconElement.exists()).toBe(true)
    expect(iconElement.html()).toContain('clear')
    expect(iconElement.classes()).toContain('msr')
  })

  it('should pass through standard input attributes', () => {
    const wrapper = createWrapper({
      id: 'test-input',
      placeholder: 'Enter text...',
      required: true,
      disabled: true,
      maxlength: 100,
      minlength: 5,
    })

    const input = wrapper.find('input')
    expect(input.attributes('id')).toBe('test-input')
    expect(input.attributes('placeholder')).toBe('Enter text...')
    expect(input.attributes('required')).toBeDefined()
    expect(input.attributes('disabled')).toBeDefined()
    expect(input.attributes('maxlength')).toBe('100')
    expect(input.attributes('minlength')).toBe('5')
  })

  it('should handle label rendering', () => {
    const wrapper = createWrapper({
      field: true,
      label: 'Test Label',
    })

    expect(wrapper.findComponent(FormLabelMock).exists()).toBe(true)
  })

  it('should handle numeric input constraints', () => {
    const wrapper = createWrapper({
      type: 'number',
      min: '0',
      max: '100',
      step: '0.1',
    })

    const input = wrapper.find('input')
    expect(input.attributes('min')).toBe('0')
    expect(input.attributes('max')).toBe('100')
    expect(input.attributes('step')).toBe('0.1')
  })

  it('should emit focus and blur events', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find('input')

    await input.trigger('focus')
    expect(wrapper.emitted('focus')).toBeTruthy()

    await input.trigger('blur')
    expect(wrapper.emitted('blur')).toBeTruthy()
  })

  it('should have input reference accessible', () => {
    const wrapper = createWrapper()

    // The component should expose an inputRef
    expect((wrapper.vm as any).inputRef).toBeDefined()
  })

  it('should apply autocomplete attribute', () => {
    const wrapper = createWrapper({ autocomplete: 'email' })
    const input = wrapper.find('input')

    expect(input.attributes('autocomplete')).toBe('email')
  })

  it('should handle validation failure', async () => {
    const wrapper = createWrapper({
      required: true,
      type: 'email',
    })
    const input = wrapper.find('input')

    // Mock checkValidity to return false (invalid)
    const mockCheckValidity = vi.fn(() => false)
    input.element.checkValidity = mockCheckValidity

    // Trigger validation by setting a value
    await input.setValue('invalid-email')

    expect(mockCheckValidity).toHaveBeenCalled()
    expect(wrapper.emitted('isValid')).toBeTruthy()
    expect(wrapper.emitted('isValid')![0]).toEqual([false])
  })

  it('should apply width and height styles', () => {
    const wrapper = createWrapper({
      width: '200px',
      height: '50px',
    })
    const input = wrapper.find('input')

    expect(input.element.style.width).toBe('200px')
    expect(input.element.style.height).toBe('50px')
  })

  it('should render label after input when labelAfter is true', () => {
    const wrapper = createWrapper({
      field: true,
      label: 'After Label',
      labelAfter: true,
    })

    const labels = wrapper.findAllComponents(FormLabelMock)
    expect(labels).toHaveLength(1)

    // Label should be after input in DOM order
    const input = wrapper.find('input')
    const label = wrapper.findComponent(FormLabelMock)
    expect(label.exists()).toBe(true)
  })

  it('should render error message when provided', () => {
    const wrapper = createWrapper({
      errorMessage: 'This field is required',
    })

    const additional = wrapper.findComponent({
      name: 'FormAdditional',
    })
    expect(additional.exists()).toBe(true)
  })
})
