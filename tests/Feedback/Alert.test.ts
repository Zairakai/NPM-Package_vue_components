import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Alert from '../../src/Feedback/Alert.vue'

describe('FeedbackAlert', () => {
  it('should render a status with the info variant by default', () => {
    const wrapper = mount(Alert, { slots: { default: 'Saved' } })

    expect(wrapper.classes()).toContain('alert')
    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('data-variant')).toBe('info')
    expect(wrapper.find('.alert-content').text()).toBe('Saved')
    expect(wrapper.find('.alert-title').exists()).toBe(false)
    expect(wrapper.find('.alert-close').exists()).toBe(false)
  })

  it('should announce warnings and errors as alerts', () => {
    expect(mount(Alert, { props: { variant: 'error' } }).attributes('role')).toBe('alert')
    expect(mount(Alert, { props: { variant: 'warning' } }).attributes('role')).toBe('alert')
    expect(mount(Alert, { props: { variant: 'success' } }).attributes('role')).toBe('status')
  })

  it('should render the title, icon and actions', () => {
    const wrapper = mount(Alert, {
      props: { title: 'Heads up', class: 'x', id: 'a1' },
      slots: { icon: '<i>!</i>', actions: '<button>Undo</button>' },
    })

    expect(wrapper.find('.alert-title').text()).toBe('Heads up')
    expect(wrapper.find('.alert-icon i').exists()).toBe(true)
    expect(wrapper.find('.alert-actions button').exists()).toBe(true)
    expect(wrapper.classes()).toEqual(['alert', 'x'])
    expect(wrapper.attributes('id')).toBe('a1')
  })

  it('should render the title slot instead of the title prop', () => {
    const wrapper = mount(Alert, { props: { title: 'Prop' }, slots: { title: 'Slot' } })

    expect(wrapper.find('.alert-title').text()).toBe('Slot')
  })

  it('should hide itself and emit when it is dismissed, without v-model', async () => {
    const wrapper = mount(Alert, { props: { dismissible: true } })
    const close = wrapper.find('.alert-close')

    expect(close.attributes('aria-label')).toBe('Close')

    await close.trigger('click')

    expect(wrapper.find('.alert').exists()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('should follow the v-model and label the close button', async () => {
    const wrapper = mount(Alert, { props: { modelValue: true, dismissible: true, closeLabel: 'Fermer' } })

    expect(wrapper.find('.alert-close').attributes('aria-label')).toBe('Fermer')

    await wrapper.setProps({ modelValue: false })

    expect(wrapper.find('.alert').exists()).toBe(false)
  })

  it('should validate the variant', () => {
    const { variant } = (Alert as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(variant.validator('error')).toBe(true)
    expect(variant.validator('nope')).toBe(false)
  })
})
