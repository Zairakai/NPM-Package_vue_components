import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Popover from '../../src/Overlay/Popover.vue'
import { fireToggle, installPopover } from './popover-env'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
})

const mountPopover = (props: Record<string, unknown> = {}) => {
  const wrapper = mount(Popover, {
    props,
    slots: {
      trigger: `<template #trigger="{ attrs, open }"><button class="trigger" v-bind="attrs">{{ open ? 'Close' : 'Open' }}</button></template>`,
      default: '<p class="content">Hello</p>',
    },
    attachTo: document.body,
  })

  mounted.push(wrapper)

  return wrapper
}

describe('OverlayPopover with the Popover API', () => {
  let env: ReturnType<typeof installPopover>

  beforeEach(() => {
    env = installPopover()
    setSupport({ popover: true })
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  it('should render the trigger and a closed popover panel linked by ARIA', () => {
    const wrapper = mountPopover({ id: 'p', class: 'x', label: 'Details' })
    const trigger = wrapper.find('.trigger')
    const panel = wrapper.find('#p')

    expect(trigger.attributes('popovertarget')).toBe('p')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(trigger.attributes('aria-controls')).toBe('p')
    expect(trigger.attributes('aria-haspopup')).toBe('dialog')
    expect(panel.attributes('popover')).toBe('auto')
    expect(panel.attributes('role')).toBe('dialog')
    expect(panel.attributes('aria-label')).toBe('Details')
    expect(panel.classes()).toEqual(['popover', 'x'])
    expect(panel.attributes('hidden')).toBeUndefined()
    expect(panel.attributes('data-placement')).toBe('bottom')
    expect(panel.find('.content').text()).toBe('Hello')
  })

  it('should generate an id when none is given', () => {
    expect(mountPopover().find('[popover]').attributes('id')).toMatch(/^popover-/)
  })

  it('should show and hide the popover when the model changes', async () => {
    const wrapper = mountPopover({ modelValue: false })

    await wrapper.setProps({ modelValue: true })
    expect(env.showPopover).toHaveBeenCalledTimes(1)
    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.trigger').text()).toBe('Close')

    await wrapper.setProps({ modelValue: false })
    expect(env.hidePopover).toHaveBeenCalledTimes(1)
  })

  it('should follow the browser: the toggle event gives the state and the model is emitted', async () => {
    const wrapper = mountPopover()
    const panel = wrapper.find('[popover]').element

    fireToggle(panel, 'open')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(env.showPopover).not.toHaveBeenCalled()

    fireToggle(panel, 'closed')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false])
    expect(env.hidePopover).not.toHaveBeenCalled()
  })

  it('should open at once when it is mounted open', async () => {
    mountPopover({ modelValue: true })
    await nextTick()

    expect(env.showPopover).toHaveBeenCalledTimes(1)
  })

  it('should position the panel next to the trigger', async () => {
    const wrapper = mountPopover({ placement: 'top-start', offset: 4 })
    const anchor = wrapper.find('.popover-anchor').element

    anchor.getBoundingClientRect = () =>
      ({ left: 100, top: 200, right: 160, bottom: 220, width: 60, height: 20 }) as DOMRect
    Object.defineProperty(wrapper.find('[popover]').element, 'offsetWidth', { value: 80 })
    Object.defineProperty(wrapper.find('[popover]').element, 'offsetHeight', { value: 40 })

    await wrapper.setProps({ modelValue: true })
    await Promise.resolve()
    await nextTick()

    const style = wrapper.find('[popover]').attributes('style') ?? ''

    expect(style).toContain('position: fixed')
    expect(style).toContain('left: 100px')
    expect(style).toContain('top: 156px')
    expect(wrapper.find('[popover]').attributes('data-placement')).toBe('top-start')
  })

  it('should expose open and close and an update function', async () => {
    const wrapper = mountPopover()
    const api = wrapper.vm as unknown as { open: () => void; close: () => void; update: () => void }

    api.open()
    await nextTick()
    expect(env.showPopover).toHaveBeenCalledTimes(1)

    api.close()
    await nextTick()
    expect(env.hidePopover).toHaveBeenCalledTimes(1)
    expect(typeof api.update).toBe('function')
  })

  it('should use the haspopup and role given', () => {
    const wrapper = mountPopover({ haspopup: 'menu', role: 'menu', mode: 'manual' })

    expect(wrapper.find('.trigger').attributes('aria-haspopup')).toBe('menu')
    expect(wrapper.find('[popover]').attributes('role')).toBe('menu')
    expect(wrapper.find('[popover]').attributes('popover')).toBe('manual')
  })

  it('should validate the placement and the mode', () => {
    const { placement, mode } = (Popover as unknown as { props: Record<string, { validator: (v: string) => boolean }> })
      .props

    expect(placement.validator('bottom-end')).toBe(true)
    expect(placement.validator('center')).toBe(false)
    expect(mode.validator('manual')).toBe(true)
    expect(mode.validator('x')).toBe(false)
  })
})

describe('OverlayPopover without the Popover API', () => {
  beforeEach(() => setSupport({ popover: false }))

  afterEach(() => resetSupport())

  it('should hide the panel and have no popover attribute', () => {
    const wrapper = mountPopover({ id: 'p' })

    expect(wrapper.find('#p').attributes('popover')).toBeUndefined()
    expect(wrapper.find('#p').attributes('hidden')).toBeDefined()
    expect(wrapper.find('.trigger').attributes('popovertarget')).toBeUndefined()
  })

  it('should toggle with the trigger click', async () => {
    const wrapper = mountPopover({ id: 'p' })

    await wrapper.find('.trigger').trigger('click')
    expect(wrapper.find('#p').attributes('hidden')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])

    await wrapper.find('.trigger').trigger('click')
    expect(wrapper.find('#p').attributes('hidden')).toBeDefined()
  })

  it('should close on a click outside but not inside or on the trigger', async () => {
    const wrapper = mountPopover({ id: 'p', modelValue: true })
    const outside = document.createElement('div')

    document.body.append(outside)
    await nextTick()
    await nextTick()

    wrapper.find('.content').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    wrapper.find('.trigger').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    outside.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('should close with Escape and give the focus back to what had it', async () => {
    const opener = document.createElement('button')

    document.body.append(opener)
    opener.focus()

    const wrapper = mountPopover({ id: 'p' })

    await wrapper.setProps({ modelValue: true })
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(document.activeElement).toBe(opener)
  })

  it('should not close by itself in manual mode', async () => {
    const wrapper = mountPopover({ id: 'p', mode: 'manual', modelValue: true })

    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should stop listening when it is closed or removed', async () => {
    const wrapper = mountPopover({ id: 'p' })

    await wrapper.setProps({ modelValue: true })
    await wrapper.setProps({ modelValue: false })
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.setProps({ modelValue: true })
    wrapper.unmount()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
  })
})
