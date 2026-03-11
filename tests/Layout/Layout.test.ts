import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Article from '../../src/Layout/Article.vue'
import Aside from '../../src/Layout/Aside.vue'
import Column from '../../src/Layout/Column.vue'
import Flex from '../../src/Layout/Flex.vue'
import FlexItem from '../../src/Layout/FlexItem.vue'
import Footer from '../../src/Layout/Footer.vue'
import Grid from '../../src/Layout/Grid.vue'
import GridItem from '../../src/Layout/GridItem.vue'
import Header from '../../src/Layout/Header.vue'
import Loader from '../../src/Layout/Loader.vue'
import Main from '../../src/Layout/Main.vue'
import Nav from '../../src/Layout/Nav.vue'
import Row from '../../src/Layout/Row.vue'
import Section from '../../src/Layout/Section.vue'
import Wrapper from '../../src/Layout/Wrapper.vue'

describe('Layout wrappers', () => {
  it('Header renders <header> with slot content', () => {
    const wrapper = mount(Header, { slots: { default: 'Site header' } })
    expect(wrapper.find('header').exists()).toBe(true)
    expect(wrapper.text()).toBe('Site header')
  })

  it('Header passes id, class and role props', () => {
    const wrapper = mount(Header, { props: { id: 'site-header', class: 'sticky', role: 'banner' } })
    const el = wrapper.find('header')
    expect(el.attributes('id')).toBe('site-header')
    expect(el.attributes('class')).toBe('sticky')
    expect(el.attributes('role')).toBe('banner')
  })

  it('Footer renders <footer> with slot content', () => {
    const wrapper = mount(Footer, { slots: { default: 'Site footer' } })
    expect(wrapper.find('footer').exists()).toBe(true)
    expect(wrapper.text()).toBe('Site footer')
  })

  it('Nav renders <nav> with slot content', () => {
    const wrapper = mount(Nav, { slots: { default: 'Navigation' } })
    expect(wrapper.find('nav').exists()).toBe(true)
    expect(wrapper.text()).toBe('Navigation')
  })

  it('Aside renders <aside> with slot content', () => {
    const wrapper = mount(Aside, { slots: { default: 'Sidebar' } })
    expect(wrapper.find('aside').exists()).toBe(true)
    expect(wrapper.text()).toBe('Sidebar')
  })

  it('Main renders <main> with slot content', () => {
    const wrapper = mount(Main, { slots: { default: 'Main content' } })
    expect(wrapper.find('main').exists()).toBe(true)
    expect(wrapper.text()).toBe('Main content')
  })

  it('Article renders <article> with slot content', () => {
    const wrapper = mount(Article, { slots: { default: 'Article body' } })
    expect(wrapper.find('article').exists()).toBe(true)
    expect(wrapper.text()).toBe('Article body')
  })

  it('Section renders <section> with slot content', () => {
    const wrapper = mount(Section, { slots: { default: 'A section' } })
    expect(wrapper.find('section').exists()).toBe(true)
    expect(wrapper.text()).toBe('A section')
  })

  it('Row renders <div> with default row class', () => {
    const wrapper = mount(Row, { slots: { default: 'Row content' } })
    const div = wrapper.find('div')
    expect(div.exists()).toBe(true)
    expect(div.classes()).toContain('row')
    expect(wrapper.text()).toBe('Row content')
  })

  it('Row uses custom row prop as class', () => {
    const wrapper = mount(Row, { props: { row: 'my-row' } })
    expect(wrapper.find('div').classes()).toContain('my-row')
  })

  it('Column renders <div> with slot content', () => {
    const wrapper = mount(Column, { slots: { default: 'Col' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Col')
  })

  it('Wrapper renders <div> with slot content', () => {
    const wrapper = mount(Wrapper, { slots: { default: 'Wrapper content' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Wrapper content')
  })

  it('Flex renders <div> with slot content', () => {
    const wrapper = mount(Flex, { slots: { default: 'Flex content' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Flex content')
  })

  it('FlexItem renders <div> with slot content', () => {
    const wrapper = mount(FlexItem, { slots: { default: 'Flex item' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Flex item')
  })

  it('Grid renders <div> with slot content', () => {
    const wrapper = mount(Grid, { slots: { default: 'Grid content' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Grid content')
  })

  it('GridItem renders <div> with slot content', () => {
    const wrapper = mount(GridItem, { slots: { default: 'Grid item' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Grid item')
  })
})

describe('LayoutLoader', () => {
  it('shows loader when isLoading=true', () => {
    const wrapper = mount(Loader, { props: { isLoading: true, status: 'Loading...' } })
    expect(wrapper.find('#loader').exists()).toBe(true)
    expect(wrapper.find('#loaderText').text()).toBe('Loading...')
  })

  it('shows slot content when isLoading=false', () => {
    const wrapper = mount(Loader, {
      props: { isLoading: false },
      slots: { default: 'Content ready' },
    })
    expect(wrapper.find('#loader').exists()).toBe(false)
    expect(wrapper.text()).toBe('Content ready')
  })
})
