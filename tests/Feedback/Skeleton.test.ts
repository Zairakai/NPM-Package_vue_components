import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Skeleton from '../../src/Feedback/Skeleton.vue'

describe('FeedbackSkeleton', () => {
  it('should render a hidden animated text placeholder', () => {
    const wrapper = mount(Skeleton, { props: { class: 'x', id: 's' } })

    expect(wrapper.classes()).toEqual(['skeleton', 'x'])
    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('data-variant')).toBe('text')
    expect(wrapper.attributes('data-animated')).toBeDefined()
    expect(wrapper.attributes('id')).toBe('s')
  })

  it('should apply the size and the variant', () => {
    const wrapper = mount(Skeleton, { props: { variant: 'circle', width: '3rem', height: '3rem', animated: false } })

    expect(wrapper.attributes('data-variant')).toBe('circle')
    expect(wrapper.attributes('data-animated')).toBeUndefined()
    expect(wrapper.attributes('style')).toContain('width: 3rem')
    expect(wrapper.attributes('style')).toContain('height: 3rem')
  })

  it('should render several lines with a shorter last one', () => {
    const wrapper = mount(Skeleton, { props: { lines: 3 } })

    expect(wrapper.attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('.skeleton')).toHaveLength(3)
    expect(wrapper.findAll('.skeleton')[2].attributes('style')).toContain('width: 60%')
    expect(wrapper.findAll('.skeleton')[0].attributes('style') ?? '').not.toContain('60%')
  })

  it('should render a single placeholder for the other variants whatever the lines', () => {
    const wrapper = mount(Skeleton, { props: { variant: 'rect', lines: 4 } })

    expect(wrapper.classes()).toContain('skeleton')
    expect(wrapper.find('.skeleton-group').exists()).toBe(false)
  })

  it('should validate the variant', () => {
    const { variant } = (Skeleton as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(variant.validator('rect')).toBe(true)
    expect(variant.validator('blob')).toBe(false)
  })
})
