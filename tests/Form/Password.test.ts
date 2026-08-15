import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import Password from '../../src/Form/Password.vue'

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

describe('FormInputPassword', () => {
  const mountPassword = (props = {}) => {
    return mount(Password, {
      props: {
        name: 'password',
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

  afterEach(() => {
    document.getElementById('zk-icon-sprite')?.remove()
  })

  it('injects the icon sprite exactly once even with multiple fields', () => {
    mountPassword({ name: 'password' })
    mountPassword({ name: 'password_confirmation' })

    expect(document.querySelectorAll('#zk-icon-sprite').length).toBe(1)
  })

  it('does not inject the sprite when the toggle is disabled', () => {
    mountPassword({ showToggle: false })

    expect(document.getElementById('zk-icon-sprite')).toBeNull()
  })

  it('renders the toggle button inside [data-input], not around it', () => {
    const wrapper = mountPassword()

    const dataInput = wrapper.find('[data-input]')
    expect(dataInput.exists()).toBe(true)
    expect(dataInput.find('[data-toggle-visibility]').exists()).toBe(true)
  })

  it('starts hidden and toggles the input type on click', async () => {
    const wrapper = mountPassword()

    expect(wrapper.find('input').attributes('type')).toBe('password')
    expect(wrapper.find('[data-icon-show]').exists()).toBe(true)
    expect(wrapper.find('[data-icon-hide]').exists()).toBe(false)

    await wrapper.find('[data-toggle-visibility]').trigger('click')

    expect(wrapper.find('input').attributes('type')).toBe('text')
    expect(wrapper.find('[data-icon-show]').exists()).toBe(false)
    expect(wrapper.find('[data-icon-hide]').exists()).toBe(true)

    await wrapper.find('[data-toggle-visibility]').trigger('click')

    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('updates the aria-label on toggle, with i18n override props', async () => {
    const wrapper = mountPassword({ labelShow: 'Afficher', labelHide: 'Masquer' })

    const button = wrapper.find('[data-toggle-visibility]')
    expect(button.attributes('aria-label')).toBe('Afficher')

    await button.trigger('click')
    expect(button.attributes('aria-label')).toBe('Masquer')
  })

  it('omits the toggle entirely when disabled', () => {
    const wrapper = mountPassword({ showToggle: false })

    expect(wrapper.find('[data-toggle-visibility]').exists()).toBe(false)
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('references the shared sprite symbols via <use>, not inline duplicated paths', () => {
    const wrapper = mountPassword()

    expect(wrapper.find('use[href="#icon-visibility"]').exists()).toBe(true)
  })
})
