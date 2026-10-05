import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppBar from '../../src/Layout/AppBar.vue'
import BottomNavigation from '../../src/Layout/BottomNavigation.vue'
import Spacer from '../../src/Layout/Spacer.vue'
import Sticky from '../../src/Layout/Sticky.vue'

describe('LayoutAppBar', () => {
  it('should render a header with the title and the slots', () => {
    const wrapper = mount(AppBar, {
      props: { title: 'App', id: 'a', class: 'x', dense: true, sticky: true },
      slots: { leading: 'L', trailing: 'T', default: 'D' },
    })

    expect(wrapper.element.tagName).toBe('HEADER')
    expect(wrapper.classes()).toEqual(['app-bar', 'x'])
    expect(wrapper.find('.app-bar-title').text()).toBe('App')
    expect(wrapper.find('.app-bar-leading').text()).toBe('L')
    expect(wrapper.find('.app-bar-trailing').text()).toBe('T')
    expect(wrapper.attributes('data-dense')).toBeDefined()
    expect(wrapper.attributes('style')).toContain('position: sticky')
  })

  it('should not be sticky or dense by default and accept a title slot', () => {
    const wrapper = mount(AppBar, { slots: { title: '<b>Hi</b>' } })

    expect(wrapper.attributes('style')).toBeUndefined()
    expect(wrapper.attributes('data-dense')).toBeUndefined()
    expect(wrapper.find('.app-bar-title b').exists()).toBe(true)
  })
})

describe('LayoutBottomNavigation', () => {
  const items = [
    { value: 'home', label: 'Home' },
    { value: 'docs', label: 'Docs', href: '/docs' },
  ]

  it('should render links and buttons with the current one marked', async () => {
    const wrapper = mount(BottomNavigation, {
      props: { items, modelValue: 'home', label: 'Bottom', id: 'b', class: 'x' },
      slots: { 'icon-home': '<i>h</i>' },
    })

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Bottom')
    expect(wrapper.findAll('.bottom-navigation-item')[0].element.tagName).toBe('BUTTON')
    expect(wrapper.findAll('.bottom-navigation-item')[1].attributes('href')).toBe('/docs')
    expect(wrapper.findAll('.bottom-navigation-item')[0].attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('.bottom-navigation-item')[1].attributes('aria-current')).toBeUndefined()
    expect(wrapper.find('.bottom-navigation-icon i').exists()).toBe(true)
  })

  it('should change the current item on its own and emit', async () => {
    const wrapper = mount(BottomNavigation, { props: { items } })

    await wrapper.findAll('.bottom-navigation-item')[0].trigger('click')

    expect(wrapper.findAll('.bottom-navigation-item')[0].attributes('data-active')).toBeDefined()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['home'])
  })
})

describe('LayoutSpacer and LayoutSticky', () => {
  it('should grow in a flex container and be hidden from assistive technologies', () => {
    const wrapper = mount(Spacer, { props: { id: 's', class: 'x' } })

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.attributes('style')).toContain('flex-grow: 1')
  })

  it('should stick to an edge with an offset and another tag', () => {
    const wrapper = mount(Sticky, {
      props: { offset: '1rem', edge: 'bottom', as: 'aside', id: 's', class: 'x' },
      slots: { default: 'S' },
    })

    expect(wrapper.element.tagName).toBe('ASIDE')
    expect(wrapper.attributes('style')).toContain('position: sticky')
    expect(wrapper.attributes('style')).toContain('bottom: 1rem')
    expect(mount(Sticky).attributes('style')).toContain('top: 0')
  })
})
