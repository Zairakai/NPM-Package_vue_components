import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Breadcrumb from '../../src/Navigation/Breadcrumb.vue'

const items = [{ label: 'Home', href: '/' }, { label: 'Docs', href: '/docs' }, { label: 'Tabs' }]

describe('NavigationBreadcrumb', () => {
  it('should render a labelled navigation with an ordered list', () => {
    const wrapper = mount(Breadcrumb, { props: { items, id: 'b', class: 'x' } })

    expect(wrapper.element.tagName).toBe('NAV')
    expect(wrapper.attributes('aria-label')).toBe('Breadcrumb')
    expect(wrapper.find('ol').exists()).toBe(true)
    expect(wrapper.findAll('li.breadcrumb-item')).toHaveLength(3)
    expect(wrapper.classes()).toEqual(['breadcrumb', 'x'])
    expect(wrapper.attributes('id')).toBe('b')
  })

  it('should link the parents and mark the last one as the current page', () => {
    const wrapper = mount(Breadcrumb, { props: { items } })

    expect(wrapper.findAll('a').map((link) => link.attributes('href'))).toEqual(['/', '/docs'])
    expect(wrapper.findAll('li')[2].find('span').attributes('aria-current')).toBe('page')
    expect(wrapper.findAll('li')[0].find('[aria-current]').exists()).toBe(false)
  })

  it('should not link an item without a href', () => {
    const wrapper = mount(Breadcrumb, { props: { items: [{ label: 'Section' }, { label: 'Page' }] } })

    expect(wrapper.find('a').exists()).toBe(false)
    expect(wrapper.findAll('li')[0].text()).toBe('Section')
  })

  it('should let the item slot render router links', () => {
    const wrapper = mount(Breadcrumb, {
      props: { items },
      slots: { item: `<template #item="{ item, current }"><b :data-current="current">{{ item.label }}</b></template>` },
    })

    expect(wrapper.findAll('b')).toHaveLength(3)
    expect(wrapper.findAll('b')[2].attributes('data-current')).toBe('true')
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('should use a custom label and render an empty trail', () => {
    const wrapper = mount(Breadcrumb, { props: { label: 'Fil d’Ariane' } })

    expect(wrapper.attributes('aria-label')).toBe('Fil d’Ariane')
    expect(wrapper.findAll('li')).toHaveLength(0)
  })
})
