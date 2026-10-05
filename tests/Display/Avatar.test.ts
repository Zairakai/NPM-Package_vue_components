import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Avatar from '../../src/Display/Avatar.vue'

describe('DisplayAvatar', () => {
  it('should render the image and label it', () => {
    const wrapper = mount(Avatar, { props: { src: '/a.png', name: 'Ada Lovelace' } })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('Ada Lovelace')
    expect(wrapper.find('img').attributes('src')).toBe('/a.png')
    expect(wrapper.attributes('data-size')).toBe('medium')
    expect(wrapper.attributes('data-shape')).toBe('circle')
  })

  it('should prefer the alt text for the label', () => {
    const wrapper = mount(Avatar, { props: { src: '/a.png', name: 'Ada', alt: 'Photo of Ada' } })

    expect(wrapper.attributes('aria-label')).toBe('Photo of Ada')
  })

  it('should show the initials of the name without an image', () => {
    expect(mount(Avatar, { props: { name: 'Ada Lovelace' } }).text()).toBe('AL')
    expect(mount(Avatar, { props: { name: 'ada king lovelace' } }).text()).toBe('AL')
    expect(mount(Avatar, { props: { name: 'Ada' } }).text()).toBe('AD')
  })

  it('should fall back to the initials when the image fails and recover on a new source', async () => {
    const wrapper = mount(Avatar, { props: { src: '/broken.png', name: 'Ada Lovelace' } })

    await wrapper.find('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toBe('AL')

    await wrapper.setProps({ src: '/ok.png' })

    expect(wrapper.find('img').attributes('src')).toBe('/ok.png')
  })

  it('should render the slot when there is no image and no name', () => {
    const wrapper = mount(Avatar, {
      slots: { default: '<i>?</i>' },
      props: { size: 'large', shape: 'square', class: 'x', id: 'av' },
    })

    expect(wrapper.find('i').exists()).toBe(true)
    expect(wrapper.attributes('data-size')).toBe('large')
    expect(wrapper.attributes('data-shape')).toBe('square')
    expect(wrapper.classes()).toEqual(['avatar', 'x'])
    expect(wrapper.attributes('id')).toBe('av')
  })

  it('should validate the size and the shape', () => {
    const { size, shape } = (Avatar as unknown as { props: Record<string, { validator: (v: string) => boolean }> })
      .props

    expect(size.validator('small')).toBe(true)
    expect(size.validator('x')).toBe(false)
    expect(shape.validator('square')).toBe(true)
    expect(shape.validator('x')).toBe(false)
  })
})
