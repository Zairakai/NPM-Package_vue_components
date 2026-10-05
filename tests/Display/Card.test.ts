import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Card from '../../src/Display/Card.vue'

describe('DisplayCard', () => {
  it('should render an article with the card class and a body', () => {
    const wrapper = mount(Card, { slots: { default: '<p>Content</p>' } })

    expect(wrapper.element.tagName).toBe('ARTICLE')
    expect(wrapper.classes()).toContain('card')
    expect(wrapper.find('.card-body').html()).toContain('<p>Content</p>')
    expect(wrapper.find('.card-header').exists()).toBe(false)
    expect(wrapper.find('.card-footer').exists()).toBe(false)
  })

  it('should render the title, the header and the footer slots', () => {
    const titled = mount(Card, { props: { title: 'Profile' } })

    expect(titled.find('.card-header').text()).toBe('Profile')

    const slotted = mount(Card, { slots: { header: '<h2>Head</h2>', footer: '<button>OK</button>' } })

    expect(slotted.find('.card-header h2').exists()).toBe(true)
    expect(slotted.find('.card-footer button').exists()).toBe(true)
  })

  it('should change the root element and keep the custom class and id', () => {
    const wrapper = mount(Card, { props: { as: 'section', class: 'wide', id: 'c1' } })

    expect(wrapper.element.tagName).toBe('SECTION')
    expect(wrapper.classes()).toEqual(['card', 'wide'])
    expect(wrapper.attributes('id')).toBe('c1')
  })
})
