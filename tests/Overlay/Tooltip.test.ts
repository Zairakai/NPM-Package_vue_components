import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Tooltip from '../../src/Overlay/Tooltip.vue'
import { installPopover } from './popover-env'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  vi.useRealTimers()
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  resetSupport()
})

const mountTooltip = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
  const wrapper = mount(Tooltip, {
    props,
    slots: { default: '<button class="trigger">Save</button>', ...slots },
    attachTo: document.body,
  })

  mounted.push(wrapper)

  return wrapper
}

const tip = (wrapper: ReturnType<typeof mountTooltip>) => wrapper.find('[role="tooltip"]')

describe('OverlayTooltip without the Popover API', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    setSupport({ popover: false })
  })

  it('should render a hidden tooltip that describes the trigger', () => {
    const wrapper = mountTooltip({ text: 'Save the file', id: 't', class: 'x' })

    expect(tip(wrapper).attributes('id')).toBe('t')
    expect(tip(wrapper).text()).toBe('Save the file')
    expect(tip(wrapper).classes()).toEqual(['tooltip', 'x'])
    expect(tip(wrapper).attributes('hidden')).toBeDefined()
    expect(tip(wrapper).attributes('popover')).toBeUndefined()
    expect(tip(wrapper).attributes('data-placement')).toBe('top')
    expect(wrapper.find('.trigger').attributes('aria-describedby')).toBe('t')
  })

  it('should generate an id', () => {
    expect(tip(mountTooltip({ text: 'x' })).attributes('id')).toMatch(/^tooltip-/)
  })

  it('should show after the delay on hover and hide on leave', async () => {
    const wrapper = mountTooltip({ text: 'Hi', delay: 300 })

    await wrapper.find('.tooltip-anchor').trigger('pointerenter')
    vi.advanceTimersByTime(299)
    await nextTick()
    expect(tip(wrapper).attributes('hidden')).toBeDefined()

    vi.advanceTimersByTime(2)
    await nextTick()
    expect(tip(wrapper).attributes('hidden')).toBeUndefined()

    await wrapper.find('.tooltip-anchor').trigger('pointerleave')
    expect(tip(wrapper).attributes('hidden')).toBeDefined()
  })

  it('should not show if the pointer leaves before the delay', async () => {
    const wrapper = mountTooltip({ text: 'Hi' })

    await wrapper.find('.tooltip-anchor').trigger('pointerenter')
    await wrapper.find('.tooltip-anchor').trigger('pointerleave')
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(tip(wrapper).attributes('hidden')).toBeDefined()
  })

  it('should ignore a touch', async () => {
    const wrapper = mountTooltip({ text: 'Hi' })
    const event = new Event('pointerenter') as Event & { pointerType: string }

    event.pointerType = 'touch'
    wrapper.find('.tooltip-anchor').element.dispatchEvent(event)
    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(tip(wrapper).attributes('hidden')).toBeDefined()
  })

  it('should show at once on focus and hide on blur and Escape', async () => {
    const wrapper = mountTooltip({ text: 'Hi' })

    await wrapper.find('.tooltip-anchor').trigger('focusin')
    expect(tip(wrapper).attributes('hidden')).toBeUndefined()

    await wrapper.find('.tooltip-anchor').trigger('focusout')
    expect(tip(wrapper).attributes('hidden')).toBeDefined()

    await wrapper.find('.tooltip-anchor').trigger('focusin')
    await wrapper.find('.tooltip-anchor').trigger('keydown', { key: 'a' })
    expect(tip(wrapper).attributes('hidden')).toBeUndefined()

    await wrapper.find('.tooltip-anchor').trigger('keydown', { key: 'Escape' })
    expect(tip(wrapper).attributes('hidden')).toBeDefined()
  })

  it('should never show when it is disabled', async () => {
    const wrapper = mountTooltip({ text: 'Hi', disabled: true })

    await wrapper.find('.tooltip-anchor').trigger('focusin')

    expect(tip(wrapper).attributes('hidden')).toBeDefined()
  })

  it('should render the content slot and not break without a trigger element', () => {
    const wrapper = mountTooltip({}, { content: '<b>Rich</b>', default: 'Plain text' })

    expect(tip(wrapper).find('b').exists()).toBe(true)
    expect(wrapper.find('.tooltip-anchor').text()).toContain('Plain text')
  })

  it('should not fire a pending show after it is removed', async () => {
    const wrapper = mountTooltip({ text: 'Hi' })

    await wrapper.find('.tooltip-anchor').trigger('pointerenter')
    wrapper.unmount()
    vi.advanceTimersByTime(1000)
  })

  it('should validate the placement', () => {
    const { placement } = (Tooltip as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(placement.validator('left-end')).toBe(true)
    expect(placement.validator('middle')).toBe(false)
  })
})

describe('OverlayTooltip with the Popover API', () => {
  let env: ReturnType<typeof installPopover>

  beforeEach(() => {
    vi.useFakeTimers()
    env = installPopover()
    setSupport({ popover: true })
  })

  afterEach(() => env.restore())

  it('should be a manual popover shown and hidden by the pointer and the focus', async () => {
    const wrapper = mountTooltip({ text: 'Hi' })

    expect(tip(wrapper).attributes('popover')).toBe('manual')
    expect(tip(wrapper).attributes('hidden')).toBeUndefined()

    await wrapper.find('.tooltip-anchor').trigger('focusin')
    expect(env.showPopover).toHaveBeenCalledTimes(1)

    await wrapper.find('.tooltip-anchor').trigger('focusout')
    expect(env.hidePopover).toHaveBeenCalledTimes(1)
  })
})
