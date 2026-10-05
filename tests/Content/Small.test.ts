import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Callout from '../../src/Content/Callout.vue'
import Code from '../../src/Content/Code.vue'
import Kbd from '../../src/Content/Kbd.vue'

describe('ContentCode', () => {
  it('should render an inline code element', () => {
    const wrapper = mount(Code, { slots: { default: 'npm i' }, props: { class: 'x', id: 'c' } })

    expect(wrapper.element.tagName).toBe('CODE')
    expect(wrapper.classes()).toEqual(['code', 'x'])
    expect(wrapper.attributes('id')).toBe('c')
    expect(wrapper.text()).toBe('npm i')
  })
})

describe('ContentKbd', () => {
  it('should render a single key', () => {
    const wrapper = mount(Kbd, { slots: { default: 'Esc' }, props: { class: 'x', id: 'k' } })

    expect(wrapper.element.tagName).toBe('KBD')
    expect(wrapper.classes()).toEqual(['kbd', 'x'])
    expect(wrapper.attributes('id')).toBe('k')
    expect(wrapper.text()).toBe('Esc')
  })

  it('should split a combination into one element per key', () => {
    const wrapper = mount(Kbd, { props: { keys: 'Ctrl + K' } })

    expect(wrapper.classes()).toContain('kbd-combo')
    expect(wrapper.findAll('kbd.kbd-key').map((key) => key.text())).toEqual(['Ctrl', 'K'])
    expect(wrapper.findAll('.kbd-separator')).toHaveLength(1)
    expect(wrapper.find('.kbd-separator').attributes('aria-hidden')).toBe('true')
  })

  it('should accept an array and another separator', () => {
    const wrapper = mount(Kbd, { props: { keys: ['Shift', 'Alt', 'P'], separator: '-' } })

    expect(wrapper.findAll('.kbd-key').map((key) => key.text())).toEqual(['Shift', 'Alt', 'P'])
    expect(wrapper.findAll('.kbd-separator').map((separator) => separator.text())).toEqual(['-', '-'])
  })
})

describe('ContentCallout', () => {
  it('should render a note with the name of the variant as its title', () => {
    const wrapper = mount(Callout, { slots: { default: 'Careful' }, props: { class: 'x', id: 'o' } })

    expect(wrapper.element.tagName).toBe('ASIDE')
    expect(wrapper.attributes('role')).toBe('note')
    expect(wrapper.attributes('data-variant')).toBe('note')
    expect(wrapper.find('.callout-title').text()).toBe('Note')
    expect(wrapper.find('.callout-body').text()).toBe('Careful')
    expect(wrapper.classes()).toEqual(['callout', 'x'])
    expect(wrapper.attributes('id')).toBe('o')
  })

  it('should use the variant, a custom title and an icon', () => {
    const wrapper = mount(Callout, { props: { variant: 'danger', title: 'Stop' }, slots: { icon: '<i>!</i>' } })

    expect(wrapper.attributes('data-variant')).toBe('danger')
    expect(wrapper.find('.callout-title').text()).toBe('! Stop')
    expect(wrapper.find('.callout-icon').attributes('aria-hidden')).toBe('true')
  })

  it('should name the other variants', () => {
    expect(
      mount(Callout, { props: { variant: 'tip' } })
        .find('.callout-title')
        .text()
    ).toBe('Tip')
    expect(
      mount(Callout, { props: { variant: 'warning' } })
        .find('.callout-title')
        .text()
    ).toBe('Warning')
  })

  it('should validate the variant', () => {
    const { variant } = (Callout as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(variant.validator('tip')).toBe(true)
    expect(variant.validator('x')).toBe(false)
  })
})
