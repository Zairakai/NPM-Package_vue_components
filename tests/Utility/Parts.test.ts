import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { renderMarkdown, safeUrl } from '../../src/Content/markdown'
import Markdown from '../../src/Content/Markdown.vue'
import { move } from '../../src/Data/sortable'
import SortableList from '../../src/Data/SortableList.vue'
import Stat from '../../src/Display/Stat.vue'
import Banner from '../../src/Feedback/Banner.vue'
import CookieBanner from '../../src/Feedback/CookieBanner.vue'
import Splitter from '../../src/Layout/Splitter.vue'

afterEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('DisplayStat', () => {
  it('should render a label, a value and a rising change that is good news', () => {
    const wrapper = mount(Stat, { props: { label: 'Sales', value: 120, change: 12.5, id: 's', class: 'x' } })

    expect(wrapper.find('dt').text()).toBe('Sales')
    expect(wrapper.find('dd').text()).toBe('120')
    expect(wrapper.find('.stat-change').attributes('data-direction')).toBe('up')
    expect(wrapper.find('.stat-change').attributes('data-sentiment')).toBe('positive')
    expect(wrapper.find('.stat-change-text').text()).toBe('Up 12.5%')
    expect(wrapper.find('.stat-arrow').attributes('aria-hidden')).toBe('true')
  })

  it('should judge a change by whether up is good, and show a flat change', () => {
    const errors = mount(Stat, { props: { change: 3, upIsGood: false } })

    expect(errors.find('.stat-change').attributes('data-sentiment')).toBe('negative')
    expect(
      mount(Stat, { props: { change: -3, upIsGood: false } })
        .find('.stat-change')
        .attributes('data-sentiment')
    ).toBe('positive')
    expect(
      mount(Stat, { props: { change: -3 } })
        .find('.stat-change-text')
        .text()
    ).toBe('Down 3%')
    const flat = mount(Stat, { props: { change: 0 } })

    expect(flat.find('.stat-change').attributes('data-sentiment')).toBe('neutral')
    expect(flat.find('.stat-change-text').text()).toBe('0%')
    expect(mount(Stat).find('.stat-change').exists()).toBe(false)
  })

  it('should render the slots', () => {
    const wrapper = mount(Stat, { slots: { label: 'L', default: 'V' } })

    expect(wrapper.find('dt').text()).toBe('L')
    expect(wrapper.find('dd').text()).toBe('V')
  })
})

describe('FeedbackBanner', () => {
  it('should show a status banner with its slots', () => {
    const wrapper = mount(Banner, {
      props: { id: 'b', class: 'x' },
      slots: { default: 'News', icon: 'i', actions: '<a>More</a>' },
    })

    expect(wrapper.attributes('role')).toBe('status')
    expect(wrapper.attributes('data-variant')).toBe('info')
    expect(wrapper.find('.banner-content').text()).toBe('News')
    expect(wrapper.find('.banner-icon').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.banner-actions a').exists()).toBe(true)
    expect(wrapper.find('.banner-dismiss').exists()).toBe(false)
    expect(mount(Banner, { props: { variant: 'error' } }).attributes('role')).toBe('alert')
    expect(mount(Banner, { props: { variant: 'warning' } }).attributes('role')).toBe('alert')
  })

  it('should be dismissed and remember it', async () => {
    const wrapper = mount(Banner, { props: { dismissible: true, storageKey: 'seen' } })

    await wrapper.find('.banner-dismiss').trigger('click')
    expect(wrapper.find('.banner').exists()).toBe(false)
    expect(wrapper.emitted('dismiss')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
    expect(
      mount(Banner, { props: { storageKey: 'seen' } })
        .find('.banner')
        .exists()
    ).toBe(false)
  })

  it('should follow the v-model and survive a blocked storage', async () => {
    const wrapper = mount(Banner, { props: { modelValue: true, dismissible: true } })

    await wrapper.find('.banner-dismiss').trigger('click')
    expect(wrapper.find('.banner').exists()).toBe(true)
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const blocked = mount(Banner, { props: { dismissible: true, storageKey: 'k' } })

    await blocked.find('.banner-dismiss').trigger('click')
    expect(blocked.find('.banner').exists()).toBe(false)
    get.mockRestore()
    set.mockRestore()
  })
})

describe('FeedbackCookieBanner', () => {
  const categories = [
    { id: 'essential', label: 'Essential', required: true },
    { id: 'stats', label: 'Statistics', description: 'Anonymous' },
  ]
  const build = (props: Record<string, unknown> = {}) =>
    mount(CookieBanner, {
      props: { categories, ...props },
      slots: { default: 'We use cookies' },
      attachTo: document.body,
    })

  it('should ask when there is no answer yet', async () => {
    const wrapper = build({ id: 'c', class: 'x' })

    await nextTick()
    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('.cookie-banner-title').attributes('id'))
    expect(wrapper.find('.cookie-banner-text').text()).toBe('We use cookies')
  })

  it('should accept all and remember it', async () => {
    const wrapper = build()

    await nextTick()
    await wrapper.find('.cookie-banner-accept').trigger('click')
    expect(wrapper.emitted('consent')?.[0]).toEqual([{ essential: true, stats: true }])
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
    expect(JSON.parse(window.localStorage.getItem('zk-consent') as string)).toEqual({ essential: true, stats: true })
  })

  it('should reject all but keep the required ones', async () => {
    const wrapper = build()

    await nextTick()
    await wrapper.find('.cookie-banner-reject').trigger('click')
    expect(wrapper.emitted('consent')?.[0]).toEqual([{ essential: true, stats: false }])
  })

  it('should let the visitor customize', async () => {
    const wrapper = build()

    await nextTick()
    expect(wrapper.find('fieldset').exists()).toBe(false)
    await wrapper.find('.cookie-banner-customize').trigger('click')
    expect(wrapper.find('input[type="checkbox"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('.cookie-banner-description').text()).toBe('Anonymous')
    await wrapper.findAll('input[type="checkbox"]')[1].setValue(true)
    await wrapper.find('.cookie-banner-save').trigger('click')
    expect(wrapper.emitted('consent')?.[0]).toEqual([{ essential: true, stats: true }])
  })

  it('should not ask again, and ask again when a category was added', async () => {
    window.localStorage.setItem('zk-consent', JSON.stringify({ essential: true, stats: false }))
    const wrapper = build()

    await nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
    expect(wrapper.emitted('consent')?.[0]).toEqual([{ essential: true, stats: false }])
    const more = build({ categories: [...categories, { id: 'ads', label: 'Ads' }] })

    await nextTick()
    expect(more.find('.cookie-banner').exists()).toBe(true)
  })

  it('should survive a blocked or broken storage', async () => {
    window.localStorage.setItem('zk-consent', '{broken')
    const wrapper = build()

    await nextTick()
    expect(wrapper.find('.cookie-banner').exists()).toBe(true)
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    await wrapper.find('.cookie-banner-accept').trigger('click')
    expect(wrapper.find('.cookie-banner').exists()).toBe(false)
    set.mockRestore()
  })
})

const pointer = async (element: Element, type: string, init: Record<string, number> = {}) => {
  element.dispatchEvent(new MouseEvent(type, { bubbles: true, ...init }))
  await nextTick()
}

describe('LayoutSplitter', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(Splitter, { props, slots: { first: 'A', second: 'B' }, attachTo: document.body })

  it('should render two panes and a separator that tells its position', () => {
    const wrapper = build({ modelValue: 30, id: 's', class: 'x', label: 'Panels' })
    const handle = wrapper.find('[role="separator"]')

    expect(wrapper.find('.splitter-first').text()).toBe('A')
    expect(wrapper.find('.splitter-second').text()).toBe('B')
    expect(handle.attributes('aria-valuenow')).toBe('30')
    expect(handle.attributes('aria-orientation')).toBe('vertical')
    expect(handle.attributes('aria-label')).toBe('Panels')
    expect(handle.attributes('tabindex')).toBe('0')
    expect(wrapper.attributes('style')).toContain('grid-template-columns: 30% auto')
  })

  it('should stack the panes vertically', () => {
    const wrapper = build({ direction: 'vertical' })

    expect(wrapper.find('[role="separator"]').attributes('aria-orientation')).toBe('horizontal')
    expect(wrapper.attributes('style')).toContain('grid-template-rows: 50% auto')
  })

  it('should move with the arrow keys, Home and End, inside the limits', async () => {
    const wrapper = build({ modelValue: 50 })
    const handle = wrapper.find('[role="separator"]')

    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([55])
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([45])
    await handle.trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([10])
    await handle.trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[3]).toEqual([90])
    await handle.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(4)
    const vertical = build({ direction: 'vertical', modelValue: 50 })

    await vertical.find('[role="separator"]').trigger('keydown', { key: 'ArrowDown' })
    expect(vertical.emitted('update:modelValue')?.[0]).toEqual([55])
    await vertical.find('[role="separator"]').trigger('keydown', { key: 'ArrowUp' })
  })

  it('should follow a drag with the pointer', async () => {
    const wrapper = build()
    const handle = wrapper.find('[role="separator"]')

    wrapper.element.getBoundingClientRect = () => ({ left: 100, top: 0, width: 400, height: 200 }) as DOMRect
    await pointer(handle.element, 'pointermove', { clientX: 200 })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await pointer(handle.element, 'pointerdown', { pointerId: 1 })
    expect(wrapper.attributes('data-dragging')).toBeDefined()
    await pointer(handle.element, 'pointermove', { clientX: 300 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([50])
    await pointer(handle.element, 'pointermove', { clientX: 1000 })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([90])
    await pointer(handle.element, 'pointerup', { pointerId: 1 })
    expect(wrapper.attributes('data-dragging')).toBeUndefined()
  })

  it('should follow a vertical drag and ignore a drag of an empty box', async () => {
    const wrapper = build({ direction: 'vertical' })
    const handle = wrapper.find('[role="separator"]')

    wrapper.element.getBoundingClientRect = () => ({ left: 0, top: 50, width: 400, height: 200 }) as DOMRect
    await pointer(handle.element, 'pointerdown', { pointerId: 1 })
    await pointer(handle.element, 'pointermove', { clientY: 100 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([25])
    wrapper.element.getBoundingClientRect = () => ({ left: 0, top: 0, width: 0, height: 0 }) as DOMRect
    await pointer(handle.element, 'pointermove', { clientY: 100 })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await pointer(handle.element, 'pointercancel')
  })
})

describe('sortable helper and DataSortableList', () => {
  it('should move an item and leave the list as it is for a move that does nothing', () => {
    const list = ['a', 'b', 'c']

    expect(move(list, 0, 2)).toEqual(['b', 'c', 'a'])
    expect(move(list, 2, 0)).toEqual(['c', 'a', 'b'])
    expect(move(list, 1, 1)).toBe(list)
    expect(move(list, -1, 1)).toBe(list)
    expect(move(list, 0, 5)).toBe(list)
    expect(list).toEqual(['a', 'b', 'c'])
  })

  // A parent that keeps the list, as v-model does.
  const build = (props: Record<string, unknown> = {}) => {
    const host = mount(
      defineComponent({
        components: { SortableList },
        data: () => ({ list: ['a', 'b', 'c'] }),
        template: '<SortableList v-model="list" label="Tasks" v-bind="$attrs" />',
      }),
      { attrs: props, attachTo: document.body }
    )

    return host.findComponent(SortableList)
  }
  const handles = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('.sortable-handle')

  it('should render the items with a handle that names the item', () => {
    const wrapper = build({ id: 's', class: 'x' })

    expect(wrapper.find('ul').attributes('aria-label')).toBe('Tasks')
    expect(wrapper.findAll('.sortable-item')).toHaveLength(3)
    expect(handles(wrapper)[1].attributes('aria-label')).toBe('Reorder b')
    expect(wrapper.find('.sortable-status').attributes('role')).toBe('status')
    expect(wrapper.findAll('.sortable-item')[0].attributes('draggable')).toBe('true')
  })

  it('should grab, move with the arrows and drop with the keyboard, telling what happens', async () => {
    const wrapper = build()

    await handles(wrapper)[0].trigger('keydown', { key: ' ' })
    expect(handles(wrapper)[0].attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.sortable-status').text()).toContain('a grabbed, position 1 of 3')
    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b', 'a', 'c']])
    expect(wrapper.emitted('reorder')?.[0]).toEqual([{ from: 0, to: 1 }])
    expect(wrapper.find('.sortable-status').text()).toContain('a moved to position 2 of 3')
    await handles(wrapper)[0].trigger('keydown', { key: 'Enter' })
    expect(wrapper.find('.sortable-status').text()).toContain('dropped at position 2')
    expect(wrapper.findAll('.sortable-item')[1].attributes('data-grabbed')).toBeUndefined()
  })

  it('should go to the ends, stay inside the list, and ignore keys when nothing is grabbed', async () => {
    const wrapper = build()

    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await handles(wrapper)[1].trigger('keydown', { key: ' ' })
    await handles(wrapper)[1].trigger('keydown', { key: 'End' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'c', 'b']])
    await handles(wrapper)[2].trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await handles(wrapper)[2].trigger('keydown', { key: 'Home' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['b', 'a', 'c']])
    await handles(wrapper)[0].trigger('keydown', { key: 'x' })
  })

  it('should give the list back with Escape', async () => {
    const wrapper = build()

    await handles(wrapper)[0].trigger('keydown', { key: ' ' })
    await handles(wrapper)[0].trigger('keydown', { key: 'ArrowDown' })
    await handles(wrapper)[1].trigger('keydown', { key: 'Escape' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([['a', 'b', 'c']])
    expect(wrapper.find('.sortable-status').text()).toBe('Move cancelled.')
  })

  it('should reorder with the native drag and drop', async () => {
    const wrapper = build()
    const items = wrapper.findAll('.sortable-item')
    const dataTransfer = { setData: vi.fn(), effectAllowed: '' }

    await items[0].trigger('dragstart', { dataTransfer })
    expect(items[0].attributes('data-dragging')).toBeDefined()
    expect(dataTransfer.effectAllowed).toBe('move')
    await items[2].trigger('drop')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b', 'c', 'a']])
    await items[1].trigger('drop')
    await items[0].trigger('dragstart')
    await items[0].trigger('dragend')
    expect(wrapper.findAll('.sortable-item')[0].attributes('data-dragging')).toBeUndefined()
  })

  it('should use a key and a label for objects and render the slots', () => {
    const wrapper = mount(SortableList, {
      props: {
        modelValue: [
          { id: 1, label: 'One' },
          { id: 2, label: 'Two' },
        ],
        itemKey: 'id',
      },
      slots: { default: '<template #default="{ item, index }">{{ index }}-{{ item.label }}</template>', handle: 'H' },
    })

    expect(wrapper.find('.sortable-content').text()).toBe('0-One')
    expect(wrapper.find('.sortable-handle').text()).toBe('H')
    expect(wrapper.find('.sortable-handle').attributes('aria-label')).toBe('Reorder One')
    expect(mount(SortableList).findAll('li')).toHaveLength(0)
  })
})

describe('markdown', () => {
  it('should accept safe links only', () => {
    expect(safeUrl('https://a.b')).toBe('https://a.b')
    expect(safeUrl('/page')).toBe('/page')
    expect(safeUrl('#top')).toBe('#top')
    expect(safeUrl('../x')).toBe('../x')
    expect(safeUrl('mailto:a@b.c')).toBe('mailto:a@b.c')
    expect(safeUrl('page.html')).toBe('page.html')
    expect(safeUrl('javascript:alert(1)')).toBeUndefined()
    expect(safeUrl('  JaVaScRiPt:alert(1)')).toBeUndefined()
    expect(safeUrl('data:text/html,x')).toBeUndefined()
  })

  it('should render headings, paragraphs and inline marks', () => {
    expect(renderMarkdown('# Title\n\nSome **bold** and *italic* and `code`.')).toBe(
      '<h1>Title</h1>\n<p>Some <strong>bold</strong> and <em>italic</em> and <code>code</code>.</p>'
    )
    expect(renderMarkdown('###### Six')).toBe('<h6>Six</h6>')
    expect(renderMarkdown('line one\nline two')).toBe('<p>line one line two</p>')
    expect(renderMarkdown('')).toBe('')
  })

  it('should render links and drop the unsafe ones', () => {
    expect(renderMarkdown('[site](https://a.b?x=1&y=2)')).toBe(
      '<p><a href="https://a.b?x=1&amp;y=2" rel="noopener noreferrer">site</a></p>'
    )
    expect(renderMarkdown('[bad](javascript:alert(1))')).toBe('<p>bad</p>')
  })

  it('should escape the HTML of the source', () => {
    expect(renderMarkdown('<script>alert(1)</script> & "q"')).toBe(
      '<p>&lt;script&gt;alert(1)&lt;/script&gt; &amp; &quot;q&quot;</p>'
    )
    expect(renderMarkdown('`<b>`')).toBe('<p><code>&lt;b&gt;</code></p>')
    expect(renderMarkdown('[<img src=x onerror=alert(1)>](/a)')).not.toContain('<img')
  })

  it('should render lists, quotes, rules and fenced code', () => {
    expect(renderMarkdown('- a\n- b\n\n1. one\n2. two')).toBe(
      '<ul><li>a</li><li>b</li></ul>\n<ol><li>one</li><li>two</li></ol>'
    )
    expect(renderMarkdown('> quoted\n> text')).toBe('<blockquote><p>quoted text</p></blockquote>')
    expect(renderMarkdown('---')).toBe('<hr>')
    expect(renderMarkdown('```js\nconst a = "<b>"\n```')).toBe(
      '<pre><code class="language-js">const a = &quot;&lt;b&gt;&quot;</code></pre>'
    )
    expect(renderMarkdown('```\nplain\n```')).toBe('<pre><code>plain</code></pre>')
    expect(renderMarkdown('```js"><x\nA\n```')).toContain('class="language-jsx"')
    expect(renderMarkdown('```\nunclosed')).toBe('<pre><code>unclosed</code></pre>')
  })

  it('should stop a paragraph at a block and accept windows line breaks', () => {
    expect(renderMarkdown('text\n# Heading')).toBe('<p>text</p>\n<h1>Heading</h1>')
    expect(renderMarkdown('a\r\n\r\nb')).toBe('<p>a</p>\n<p>b</p>')
    expect(renderMarkdown('- a\n1. b')).toBe('<ul><li>a</li></ul>\n<ol><li>b</li></ol>')
  })

  it('should render in a component, with a renderer of your own', () => {
    const wrapper = mount(Markdown, { props: { source: '# Hi', id: 'm', class: 'x' } })

    expect(wrapper.classes()).toEqual(['markdown', 'x'])
    expect(wrapper.find('h1').text()).toBe('Hi')
    expect(
      mount(Markdown, { props: { source: 'a', renderer: (text: string) => `<i>${text}</i>` } })
        .find('i')
        .text()
    ).toBe('a')
    expect(mount(Markdown).html()).toContain('markdown')
  })
})
