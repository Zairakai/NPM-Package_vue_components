import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import { parseDiff, splitRows } from '../../src/Content/diff'
import Diff from '../../src/Content/Diff.vue'
import { childPath, contains, display, entriesOf, kindOf } from '../../src/Content/json'
import JsonViewer from '../../src/Content/JsonViewer.vue'
import Terminal from '../../src/Content/Terminal.vue'

const DIFF = `diff --git a/a.txt b/a.txt
index 111..222 100644
--- a/a.txt
+++ b/a.txt
@@ -1,3 +1,3 @@
 keep
-old
+new
 end
`

describe('parseDiff', () => {
  it('should classify the lines and number both sides', () => {
    const lines = parseDiff(DIFF)

    expect(lines.map((line) => line.type)).toEqual([
      'file',
      'file',
      'file',
      'file',
      'hunk',
      'context',
      'del',
      'add',
      'context',
    ])
    expect(lines[5]).toMatchObject({ text: 'keep', oldNumber: 1, newNumber: 1 })
    expect(lines[6]).toMatchObject({ text: 'old', oldNumber: 2, newNumber: undefined })
    expect(lines[7]).toMatchObject({ text: 'new', oldNumber: undefined, newNumber: 2 })
    expect(lines[8]).toMatchObject({ text: 'end', oldNumber: 3, newNumber: 3 })
  })

  it('should read a second file after a first one', () => {
    const lines = parseDiff(`${DIFF}diff --git a/b.txt b/b.txt\n--- a/b.txt\n+++ b/b.txt\n@@ -5 +5 @@\n-x\n+y\n`)

    expect(lines.filter((line) => 'file' === line.type)).toHaveLength(7)
    expect(lines.at(-1)).toMatchObject({ type: 'add', text: 'y', newNumber: 5 })
  })

  it('should show text before any hunk as file lines and accept windows line breaks', () => {
    expect(parseDiff('hello\r\nworld').map((line) => line.type)).toEqual(['file', 'file'])
  })
})

describe('splitRows', () => {
  it('should pair a removal with an addition and keep the context on both sides', () => {
    const rows = splitRows(parseDiff(DIFF))
    const changed = rows.find((row) => 'del' === row.left?.type)

    expect(changed?.left?.text).toBe('old')
    expect(changed?.right?.text).toBe('new')
    expect(rows.find((row) => 'keep' === row.left?.text)?.right?.text).toBe('keep')
  })

  it('should leave a side empty when there are more removals than additions', () => {
    const rows = splitRows(parseDiff('@@ -1,2 +1 @@\n-a\n-b\n+c\n'))

    expect(rows.at(-1)?.left?.text).toBe('b')
    expect(rows.at(-1)?.right).toBeUndefined()
  })
})

describe('ContentDiff', () => {
  it('should render a unified view with ins and del elements and line numbers', () => {
    const wrapper = mount(Diff, { props: { diff: DIFF, title: 'a.txt', id: 'd', class: 'x' } })

    expect(wrapper.classes()).toEqual(['diff', 'x'])
    expect(wrapper.attributes('data-view')).toBe('unified')
    expect(wrapper.find('.diff-title').text()).toBe('a.txt')
    expect(wrapper.find('del.diff-line').text()).toContain('old')
    expect(wrapper.find('ins.diff-line').text()).toContain('new')
    expect(wrapper.find('ins .diff-mark').text()).toBe('+')
    expect(wrapper.find('del .diff-number').attributes('data-old')).toBe('2')
    expect(wrapper.find('pre').attributes('tabindex')).toBe('0')
  })

  it('should hide the line numbers and the title when asked', () => {
    const wrapper = mount(Diff, { props: { diff: DIFF, lineNumbers: false } })

    expect(wrapper.find('.diff-number').exists()).toBe(false)
    expect(wrapper.find('.diff-title').exists()).toBe(false)
  })

  it('should render two sides in the split view', () => {
    const wrapper = mount(Diff, { props: { diff: DIFF, view: 'split' } })
    const sides = wrapper.findAll('pre')

    expect(wrapper.attributes('data-view')).toBe('split')
    expect(sides).toHaveLength(2)
    expect(sides[0].find('del').text()).toContain('old')
    expect(sides[1].find('ins').text()).toContain('new')
  })

  it('should show an empty cell opposite a missing line in the split view', () => {
    const wrapper = mount(Diff, { props: { diff: '@@ -1 +1,2 @@\n a\n+b\n', view: 'split' } })

    expect(wrapper.findAll('pre')[0].find('[data-type="empty"]').exists()).toBe(true)
  })

  it('should render nothing for an empty diff and validate the view', () => {
    expect(mount(Diff).findAll('.diff-line')).toHaveLength(1)

    const { view } = (Diff as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(view.validator('split')).toBe(true)
    expect(view.validator('x')).toBe(false)
  })
})

describe('ContentTerminal', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    setSupport({ clipboard: true })
  })

  afterEach(() => {
    resetSupport()
    vi.unstubAllGlobals()
  })

  const lines = ['$ npm install', 'added 1 package', { type: 'comment', text: '# now run it' }, '> npm test']

  it('should render commands as user input, output as sample output and comments', () => {
    const wrapper = mount(Terminal, { props: { lines, title: 'Shell', id: 't', class: 'x' } })

    expect(wrapper.classes()).toEqual(['terminal', 'x'])
    expect(wrapper.find('.terminal-title').text()).toBe('Shell')
    expect(wrapper.findAll('kbd').map((key) => key.text())).toEqual(['npm install', 'npm test'])
    expect(wrapper.find('samp').text()).toBe('added 1 package')
    expect(wrapper.find('.terminal-comment').text()).toBe('# now run it')
    expect(wrapper.find('.terminal-prompt').attributes('aria-hidden')).toBe('true')
    expect(wrapper.find('.terminal-prompt').text()).toBe('$')
    expect(wrapper.find('pre').attributes('tabindex')).toBe('0')
  })

  it('should use another prompt', () => {
    expect(
      mount(Terminal, { props: { lines: ['$ ls'], prompt: '#' } })
        .find('.terminal-prompt')
        .text()
    ).toBe('#')
  })

  it('should copy only the commands', async () => {
    const wrapper = mount(Terminal, { props: { lines, copiedLabel: 'Done' } })

    await wrapper.find('.terminal-copy').trigger('click')
    await nextTick()
    await nextTick()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('npm install\nnpm test')
    expect(wrapper.find('.terminal-copy').text()).toBe('Done')
    expect(wrapper.find('.terminal-status').text()).toBe('Done')
  })

  it('should hide the header without a title and a copy button', () => {
    expect(
      mount(Terminal, { props: { lines, copyable: false } })
        .find('.terminal-header')
        .exists()
    ).toBe(false)
  })
})

describe('json helpers', () => {
  it('should tell the kind of a value', () => {
    expect([{}, [], 'a', 1, true, null, undefined].map(kindOf)).toEqual([
      'object',
      'array',
      'string',
      'number',
      'boolean',
      'null',
      'null',
    ])
  })

  it('should display primitives, quoting the strings', () => {
    expect(display('a')).toBe('"a"')
    expect(display(1)).toBe('1')
    expect(display(false)).toBe('false')
    expect(display(null)).toBe('null')
    expect(display(undefined)).toBe('null')
  })

  it('should list the entries of objects and arrays only', () => {
    expect(entriesOf({ a: 1 })).toEqual([['a', 1]])
    expect(entriesOf(['x'])).toEqual([['0', 'x']])
    expect(entriesOf(5)).toEqual([])
  })

  it('should find a text in keys and values, not case sensitive', () => {
    const value = { user: { Name: 'Ada', tags: ['math', 'code'] } }

    expect(contains(value, 'name')).toBe(true)
    expect(contains(value, 'MATH')).toBe(true)
    expect(contains(value, 'zzz')).toBe(false)
    expect(contains(value, '')).toBe(false)
    expect(contains(5, '5')).toBe(true)
  })

  it('should build the path of a child', () => {
    expect(childPath('', 'a', 'object')).toBe('a')
    expect(childPath('a', 'b', 'object')).toBe('a.b')
    expect(childPath('a', '2', 'array')).toBe('a[2]')
  })
})

describe('ContentJsonViewer', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    setSupport({ clipboard: true })
  })

  afterEach(() => {
    resetSupport()
    vi.unstubAllGlobals()
  })

  const value = {
    name: 'Ada',
    age: 36,
    ok: true,
    none: null,
    langs: ['en', 'fr'],
    address: { city: 'London', geo: { lat: 1 } },
  }

  it('should render the tree with collapsible branches and typed values', () => {
    const wrapper = mount(JsonViewer, { props: { value, id: 'j', class: 'x', label: 'Person' } })

    expect(wrapper.classes()).toEqual(['json-viewer', 'x'])
    expect(wrapper.attributes('aria-label')).toBe('Person')
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.findAll('.json-leaf').length).toBeGreaterThan(3)
    expect(wrapper.find('.json-value[data-type="string"]').text()).toBe('"Ada"')
    expect(wrapper.find('.json-value[data-type="number"]').text()).toBe('36')
    expect(wrapper.find('.json-value[data-type="boolean"]').text()).toBe('true')
    expect(wrapper.find('.json-value[data-type="null"]').text()).toBe('null')
    expect(wrapper.find('details').exists()).toBe(true)
    expect(wrapper.find('.json-count').text()).toBe('{6}')
  })

  it('should open the branches down to the expanded depth', () => {
    const closed = mount(JsonViewer, { props: { value, expanded: 0 } })
    const deep = mount(JsonViewer, { props: { value, expanded: 3 } })

    expect(closed.findAll('details').every((details) => !(details.element as HTMLDetailsElement).open)).toBe(true)
    expect(deep.findAll('details').every((details) => (details.element as HTMLDetailsElement).open)).toBe(true)
  })

  it('should open and mark what matches the search', () => {
    const wrapper = mount(JsonViewer, { props: { value, expanded: 0, search: 'lat' } })
    const paths = wrapper.findAll('[data-match]').map((node) => node.attributes('data-path'))

    expect(paths).toContain('address.geo.lat')
    expect(
      wrapper.findAll('details').filter((details) => (details.element as HTMLDetailsElement).open).length
    ).toBeGreaterThanOrEqual(3)
  })

  it('should give the path of every node', () => {
    const wrapper = mount(JsonViewer, { props: { value, expanded: 3 } })
    const paths = wrapper.findAll('[data-path]').map((node) => node.attributes('data-path'))

    expect(paths).toContain('langs[1]')
    expect(paths).toContain('address.city')
  })

  it('should emit the path and the value when a key is chosen', async () => {
    const wrapper = mount(JsonViewer, { props: { value, expanded: 3 } })

    await wrapper
      .findAll('.json-key')
      .find((key) => 'city' === key.text())
      ?.trigger('click')
    expect(wrapper.emitted('select')?.[0]).toEqual([{ path: 'address.city', value: 'London' }])

    await wrapper
      .findAll('.json-key')
      .find((key) => 'geo' === key.text())
      ?.trigger('click')
    expect(wrapper.emitted('select')?.[1]).toEqual([{ path: 'address.geo', value: { lat: 1 } }])
  })

  it('should copy the formatted JSON', async () => {
    const wrapper = mount(JsonViewer, { props: { value: { a: 1 } } })

    await wrapper.find('.json-copy').trigger('click')
    await nextTick()
    await nextTick()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(JSON.stringify({ a: 1 }, null, 2))
    expect(wrapper.find('.json-copy').attributes('data-copied')).toBeDefined()
  })

  it('should hide the copy button, show a primitive root and an array root', () => {
    expect(
      mount(JsonViewer, { props: { value: 5, copyable: false } })
        .find('.json-copy')
        .exists()
    ).toBe(false)
    expect(
      mount(JsonViewer, { props: { value: 5 } })
        .find('.json-value')
        .text()
    ).toBe('5')
    expect(
      mount(JsonViewer, { props: { value: [1, 2] } })
        .find('.json-count')
        .text()
    ).toBe('[2]')
  })
})
