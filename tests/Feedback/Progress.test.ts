import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Progress from '../../src/Feedback/Progress.vue'

describe('FeedbackProgress', () => {
  it('should render the native progress element with its value and maximum', () => {
    const wrapper = mount(Progress, { props: { value: 40, label: 'Upload', class: 'x', id: 'p' } })

    expect(wrapper.element.tagName).toBe('PROGRESS')
    expect((wrapper.element as HTMLProgressElement).value).toBe(40)
    expect((wrapper.element as HTMLProgressElement).max).toBe(100)
    expect(wrapper.attributes('aria-label')).toBe('Upload')
    expect(wrapper.attributes('data-variant')).toBe('linear')
    expect(wrapper.attributes('data-indeterminate')).toBeUndefined()
    expect(wrapper.classes()).toEqual(['progress', 'x'])
    expect(wrapper.attributes('id')).toBe('p')
  })

  it('should be indeterminate without a value', () => {
    const wrapper = mount(Progress)

    expect(wrapper.attributes('value')).toBeUndefined()
    expect(wrapper.attributes('data-indeterminate')).toBeDefined()
  })

  it('should use a custom maximum and render the fallback slot', () => {
    const wrapper = mount(Progress, { props: { value: 5, max: 20 }, slots: { default: '25%' } })

    expect((wrapper.element as HTMLProgressElement).max).toBe(20)
    expect(wrapper.text()).toBe('25%')
  })

  it('should render a circular progressbar with a dash length', () => {
    const wrapper = mount(Progress, { props: { variant: 'circular', value: 30, max: 60, label: 'Disk' } })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('30')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('60')
    expect(wrapper.attributes('aria-label')).toBe('Disk')
    expect(wrapper.find('circle.progress-track').exists()).toBe(true)
    expect(wrapper.find('circle.progress-bar').attributes('stroke-dasharray')).toBe('50 100')
  })

  it('should clamp the circular percentage', () => {
    expect(
      mount(Progress, { props: { variant: 'circular', value: 500 } })
        .find('circle.progress-bar')
        .attributes('stroke-dasharray')
    ).toBe('100 100')
    expect(
      mount(Progress, { props: { variant: 'circular', value: -5 } })
        .find('circle.progress-bar')
        .attributes('stroke-dasharray')
    ).toBe('0 100')
    expect(
      mount(Progress, { props: { variant: 'circular', value: 5, max: 0 } })
        .find('circle.progress-bar')
        .attributes('stroke-dasharray')
    ).toBe('0 100')
  })

  it('should show a quarter circle when circular and indeterminate, and render the slot', () => {
    const wrapper = mount(Progress, { props: { variant: 'circular' }, slots: { default: '<span>…</span>' } })

    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('data-indeterminate')).toBeDefined()
    expect(wrapper.find('circle.progress-bar').attributes('stroke-dasharray')).toBe('25 100')
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('should validate the variant', () => {
    const { variant } = (Progress as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(variant.validator('circular')).toBe(true)
    expect(variant.validator('square')).toBe(false)
  })
})
