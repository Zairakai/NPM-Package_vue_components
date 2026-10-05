import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import Stepper from '../../src/Navigation/Stepper.vue'

const steps = [
  { id: 'account', label: 'Account', description: 'Your details' },
  { id: 'plan', label: 'Plan' },
  { id: 'pay', label: 'Payment' },
]

describe('NavigationStepper', () => {
  beforeEach(() => window.history.replaceState(null, '', '/'))

  it('should render an ordered list with the state of every step', () => {
    const wrapper = mount(Stepper, { props: { steps, modelValue: 1, label: 'Checkout', id: 's', class: 'x' } })
    const items = wrapper.findAll('li.step')

    expect(wrapper.element.tagName).toBe('OL')
    expect(wrapper.attributes('aria-label')).toBe('Checkout')
    expect(wrapper.classes()).toEqual(['stepper', 'x'])
    expect(wrapper.attributes('id')).toBe('s')
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(items.map((item) => item.attributes('data-state'))).toEqual(['complete', 'current', 'upcoming'])
    expect(items[1].attributes('aria-current')).toBe('step')
    expect(items[0].attributes('aria-current')).toBeUndefined()
  })

  it('should render the marker, the label and the description', () => {
    const wrapper = mount(Stepper, { props: { steps } })

    expect(wrapper.findAll('.step-marker')[0].text()).toBe('1')
    expect(wrapper.findAll('.step-label')[0].text()).toBe('Account')
    expect(wrapper.findAll('.step-description')[0].text()).toBe('Your details')
    expect(wrapper.findAll('.step-description')).toHaveLength(1)
  })

  it('should use the marker slot', () => {
    const wrapper = mount(Stepper, {
      props: { steps, modelValue: 1 },
      slots: { marker: `<template #marker="{ state }">{{ state }}</template>` },
    })

    expect(wrapper.findAll('.step-marker').map((marker) => marker.text())).toEqual(['complete', 'current', 'upcoming'])
  })

  it('should only let a linear stepper go back to a completed step', async () => {
    const wrapper = mount(Stepper, { props: { steps, modelValue: 1 } })
    const triggers = wrapper.findAll('.step-trigger')

    expect(triggers[0].element.tagName).toBe('BUTTON')
    expect(triggers[1].element.tagName).toBe('SPAN')
    expect(triggers[2].element.tagName).toBe('SPAN')

    await triggers[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([0])
  })

  it('should let a non linear stepper reach any other step', async () => {
    const wrapper = mount(Stepper, { props: { steps, modelValue: 1, linear: false } })
    const triggers = wrapper.findAll('.step-trigger')

    expect(triggers[0].element.tagName).toBe('BUTTON')
    expect(triggers[1].element.tagName).toBe('SPAN')
    expect(triggers[2].element.tagName).toBe('BUTTON')

    await triggers[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })

  it('should not do anything when a step that cannot be reached is clicked', async () => {
    const wrapper = mount(Stepper, { props: { steps, modelValue: 0 } })

    await wrapper.findAll('.step-trigger')[2].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should work without v-model and start at the first step', async () => {
    const wrapper = mount(Stepper, { props: { steps, linear: false } })

    expect(wrapper.findAll('li')[0].attributes('data-state')).toBe('current')

    await wrapper.findAll('.step-trigger')[2].trigger('click')

    expect(wrapper.findAll('li')[2].attributes('data-state')).toBe('current')
  })

  it('should keep the current step in a query parameter of the URL', async () => {
    window.history.replaceState(null, '', '/?step=1')
    const wrapper = mount(Stepper, { props: { steps, queryParam: 'step', linear: false } })

    expect(wrapper.findAll('li')[1].attributes('data-state')).toBe('current')

    await wrapper.findAll('.step-trigger')[2].trigger('click')

    expect(window.location.search).toBe('?step=2')
  })

  it('should use the index as the key when a step has no id and validate the orientation', () => {
    const wrapper = mount(Stepper, { props: { steps: [{ label: 'A' }, { label: 'B' }], orientation: 'vertical' } })

    expect(wrapper.findAll('li')).toHaveLength(2)
    expect(wrapper.attributes('data-orientation')).toBe('vertical')

    const { orientation } = (Stepper as unknown as { props: Record<string, { validator: (v: string) => boolean }> })
      .props

    expect(orientation.validator('vertical')).toBe(true)
    expect(orientation.validator('x')).toBe(false)
  })
})
