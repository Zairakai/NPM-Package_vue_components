import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Progress from '../../src/Feedback/Progress.vue'

describe('FeedbackProgress', () => {
  it('should render a linear progressbar with its value', () => {
    const wrapper = mount(Progress, { props: { value: 40, label: 'Upload', class: 'x', id: 'p' } })

    expect(wrapper.attributes('role')).toBe('progressbar')
    expect(wrapper.attributes('aria-valuenow')).toBe('40')
    expect(wrapper.attributes('aria-valuemin')).toBe('0')
    expect(wrapper.attributes('aria-valuemax')).toBe('100')
    expect(wrapper.attributes('aria-label')).toBe('Upload')
    expect(wrapper.attributes('data-variant')).toBe('linear')
    expect(wrapper.attributes('data-indeterminate')).toBeUndefined()
    expect(wrapper.find('.progress-bar').attributes('style')).toContain('width: 40%')
    expect(wrapper.classes()).toEqual(['progress', 'x'])
    expect(wrapper.attributes('id')).toBe('p')
  })

  it('should be indeterminate without a value', () => {
    const wrapper = mount(Progress)

    expect(wrapper.attributes('aria-valuenow')).toBeUndefined()
    expect(wrapper.attributes('data-indeterminate')).toBeDefined()
    expect(wrapper.find('.progress-bar').attributes('style')).toBeUndefined()
  })

  it('should compute the percentage from a custom maximum and clamp it', () => {
    expect(mount(Progress, { props: { value: 5, max: 20 } }).find('.progress-bar').attributes('style')).toContain('25%')
    expect(mount(Progress, { props: { value: 500 } }).find('.progress-bar').attributes('style')).toContain('100%')
    expect(mount(Progress, { props: { value: -5 } }).find('.progress-bar').attributes('style')).toContain('0%')
    expect(mount(Progress, { props: { value: 5, max: 0 } }).find('.progress-bar').attributes('style')).toContain('0%')
  })

  it('should render a circular progress with a dash length', () => {
    const wrapper = mount(Progress, { props: { variant: 'circular', value: 30 } })

    expect(wrapper.find('svg').exists()).toBe(true)
    expect(wrapper.find('circle.progress-track').exists()).toBe(true)
    expect(wrapper.find('circle.progress-bar').attributes('stroke-dasharray')).toBe('30 100')
  })

  it('should show a quarter circle when circular and indeterminate', () => {
    const wrapper = mount(Progress, { props: { variant: 'circular' } })

    expect(wrapper.find('circle.progress-bar').attributes('stroke-dasharray')).toBe('25 100')
  })

  it('should render the slot', () => {
    expect(mount(Progress, { props: { value: 1 }, slots: { default: '<span>1%</span>' } }).find('span').exists()).toBe(true)
  })

  it('should validate the variant', () => {
    const { variant } = (Progress as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(variant.validator('circular')).toBe(true)
    expect(variant.validator('square')).toBe(false)
  })
})
