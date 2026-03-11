import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import Blockquote from '../../src/Content/Blockquote.vue'
import Heading from '../../src/Content/Heading.vue'
import Link from '../../src/Content/Link.vue'
import List from '../../src/Content/List.vue'
import Msr from '../../src/Content/Msr.vue'
import Paragraph from '../../src/Content/Paragraph.vue'

const ContentLinkStub = {
  template: '<a :href="href"><slot /></a>',
  props: ['href', 'route', 'target', 'rel', 'title'],
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:pathMatch(.*)*', component: { template: '' } }],
})

describe('ContentHeading', () => {
  it('renders <h1> by default', () => {
    const wrapper = mount(Heading, { slots: { default: 'Title' } })
    expect(wrapper.find('h1').exists()).toBe(true)
    expect(wrapper.text()).toBe('Title')
  })

  it('renders the correct heading level', () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const wrapper = mount(Heading, { props: { level } })
      expect(wrapper.find(`h${level}`).exists()).toBe(true)
    }
  })

  it('passes id and class props', () => {
    const wrapper = mount(Heading, { props: { level: 2, id: 'title', class: 'bold' } })
    const h2 = wrapper.find('h2')
    expect(h2.attributes('id')).toBe('title')
    expect(h2.attributes('class')).toBe('bold')
  })
})

describe('ContentParagraph', () => {
  it('renders <p> with slot content', () => {
    const wrapper = mount(Paragraph, { slots: { default: 'Some text.' } })
    expect(wrapper.find('p').exists()).toBe(true)
    expect(wrapper.text()).toBe('Some text.')
  })

  it('renders HTML via html prop instead of slot', () => {
    const wrapper = mount(Paragraph, { props: { html: '<strong>Bold</strong>' } })
    expect(wrapper.find('p strong').exists()).toBe(true)
  })
})

describe('ContentBlockquote', () => {
  it('renders <blockquote> with slot content', () => {
    const wrapper = mount(Blockquote, { slots: { default: 'A quote.' } })
    expect(wrapper.find('blockquote').exists()).toBe(true)
    expect(wrapper.text()).toContain('A quote.')
  })
})

describe('ContentMsr', () => {
  it('renders without error', () => {
    const wrapper = mount(Msr)
    expect(wrapper.exists()).toBe(true)
  })
})

describe('ContentList', () => {
  const items = [{ name: 'Item 1' }, { name: 'Item 2' }]

  it('renders <ul> by default', () => {
    const wrapper = mount(List, {
      props: { items },
      global: { stubs: { ContentLink: ContentLinkStub } },
    })
    expect(wrapper.find('ul').exists()).toBe(true)
    expect(wrapper.findAll('li')).toHaveLength(2)
  })

  it('renders <ol> when ordered=true', () => {
    const wrapper = mount(List, {
      props: { items, ordered: true },
      global: { stubs: { ContentLink: ContentLinkStub } },
    })
    expect(wrapper.find('ol').exists()).toBe(true)
  })
})

describe('ContentLink', () => {
  it('renders <a> with href prop', () => {
    const wrapper = mount(Link, {
      props: { href: 'https://example.com' },
      slots: { default: 'Click me' },
      global: { plugins: [router] },
    })
    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.text()).toBe('Click me')
  })

  it('adds target=_blank and rel for external links', () => {
    const wrapper = mount(Link, {
      props: { href: 'https://external.com' },
      global: { plugins: [router] },
    })
    const a = wrapper.find('a')
    expect(a.attributes('target')).toBe('_blank')
    expect(a.attributes('rel')).toContain('noopener')
  })
})
