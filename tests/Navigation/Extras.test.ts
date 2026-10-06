import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import BackToTop from '../../src/Navigation/BackToTop.vue'
import CommandPalette from '../../src/Navigation/CommandPalette.vue'
import SkipLink from '../../src/Navigation/SkipLink.vue'
import { ancestorsOf, branchIds, visibleNodes } from '../../src/Navigation/tree'
import TreeView from '../../src/Navigation/TreeView.vue'
import ContextMenu from '../../src/Overlay/ContextMenu.vue'
import DropdownItem from '../../src/Overlay/DropdownItem.vue'
import { installDialog } from '../Overlay/dialog-env'

afterEach(() => {
  document.body.innerHTML = ''
})

const nodes = [
  {
    id: 'src',
    label: 'src',
    children: [
      { id: 'a', label: 'a.ts' },
      { id: 'sub', label: 'sub', children: [{ id: 'b', label: 'b.ts' }] },
      { id: 'off', label: 'off.ts', disabled: true },
    ],
  },
  { id: 'docs', label: 'docs', children: [{ id: 'd', label: 'd.md' }] },
  { id: 'readme', label: 'README' },
]

describe('tree helpers', () => {
  it('should list the nodes that can be reached', () => {
    expect(visibleNodes(nodes, []).map((entry) => entry.node.id)).toEqual(['src', 'docs', 'readme'])
    expect(visibleNodes(nodes, ['src']).map((entry) => `${entry.node.id}:${entry.depth}:${entry.parent}`)).toEqual([
      'src:0:null',
      'a:1:src',
      'sub:1:src',
      'off:1:src',
      'docs:0:null',
      'readme:0:null',
    ])
    expect(visibleNodes(nodes, ['sub']).map((entry) => entry.node.id)).toEqual(['src', 'docs', 'readme'])
  })

  it('should find the branches and the ancestors of a node', () => {
    expect(branchIds(nodes)).toEqual(['src', 'sub', 'docs'])
    expect(ancestorsOf(nodes, 'b')).toEqual(['src', 'sub'])
    expect(ancestorsOf(nodes, 'readme')).toEqual([])
    expect(ancestorsOf(nodes, 'zzz')).toBeUndefined()
  })
})

describe('NavigationTreeView', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(TreeView, { props: { nodes, label: 'Files', ...props }, attachTo: document.body })
  const item = (wrapper: ReturnType<typeof build>, id: string) => wrapper.find(`[data-node-id="${id}"]`)

  it('should render a tree with levels and the expanded state', () => {
    const wrapper = build({ id: 't', class: 'x', expanded: ['src'] })

    expect(wrapper.attributes('role')).toBe('tree')
    expect(wrapper.attributes('aria-label')).toBe('Files')
    expect(item(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    expect(item(wrapper, 'docs').attributes('aria-expanded')).toBe('false')
    expect(item(wrapper, 'readme').attributes('aria-expanded')).toBeUndefined()
    expect(item(wrapper, 'a').attributes('aria-level')).toBe('2')
    expect(wrapper.find('[role="group"]').exists()).toBe(true)
    expect(item(wrapper, 'd').exists()).toBe(false)
  })

  it('should give the tab key to one node only', () => {
    const wrapper = build()

    expect(wrapper.findAll('[tabindex="0"]')).toHaveLength(1)
    expect(item(wrapper, 'src').attributes('tabindex')).toBe('0')
    expect(build({ modelValue: 'readme' }).find('[data-node-id="readme"]').attributes('tabindex')).toBe('0')
  })

  it('should select a node with a click and emit it', async () => {
    const wrapper = build()

    await item(wrapper, 'readme').trigger('click')
    expect(item(wrapper, 'readme').attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['readme'])
    expect(wrapper.emitted('select')?.[0][0]).toMatchObject({ id: 'readme' })
  })

  it('should open and close a branch with its toggle button', async () => {
    const wrapper = build()

    await item(wrapper, 'src').find('.tree-item-toggle').trigger('click')
    expect(item(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('update:expanded')?.[0]).toEqual([['src']])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await item(wrapper, 'src').find('.tree-item-toggle').trigger('click')
    expect(item(wrapper, 'src').attributes('aria-expanded')).toBe('false')
  })

  it('should not select a disabled node', async () => {
    const wrapper = build({ expanded: ['src'] })

    await item(wrapper, 'off').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(item(wrapper, 'off').attributes('aria-disabled')).toBe('true')
  })

  it('should move with the arrows, skipping disabled nodes', async () => {
    const wrapper = build({ expanded: ['src'] })

    await item(wrapper, 'src').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(item(wrapper, 'a').element)
    await item(wrapper, 'a').trigger('keydown', { key: 'ArrowDown' })
    await item(wrapper, 'sub').trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(item(wrapper, 'docs').element)
    await item(wrapper, 'docs').trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(item(wrapper, 'sub').element)
    await item(wrapper, 'sub').trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(item(wrapper, 'readme').element)
    await item(wrapper, 'readme').trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(item(wrapper, 'src').element)
  })

  it('should open with ArrowRight, enter the branch, then close with ArrowLeft and go to the parent', async () => {
    const wrapper = build()

    await item(wrapper, 'src').trigger('keydown', { key: 'ArrowRight' })
    expect(item(wrapper, 'src').attributes('aria-expanded')).toBe('true')
    await item(wrapper, 'src').trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(item(wrapper, 'a').element)
    await item(wrapper, 'a').trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(item(wrapper, 'src').element)
    await item(wrapper, 'src').trigger('keydown', { key: 'ArrowLeft' })
    expect(item(wrapper, 'src').attributes('aria-expanded')).toBe('false')
    await item(wrapper, 'readme').trigger('keydown', { key: 'ArrowRight' })
    await item(wrapper, 'readme').trigger('keydown', { key: 'ArrowLeft' })
  })

  it('should select with Enter and Space, and open everything with *', async () => {
    const wrapper = build()

    await item(wrapper, 'src').trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['src'])
    await item(wrapper, 'src').trigger('keydown', { key: ' ' })
    await item(wrapper, 'src').trigger('keydown', { key: '*' })
    expect(item(wrapper, 'sub').attributes('aria-expanded')).toBe('true')
    expect(item(wrapper, 'docs').attributes('aria-expanded')).toBe('true')
  })

  it('should jump to a node by its first letters', async () => {
    const wrapper = build()

    await item(wrapper, 'src').trigger('keydown', { key: 'r' })
    expect(document.activeElement).toBe(item(wrapper, 'readme').element)
    await item(wrapper, 'readme').trigger('keydown', { key: 'Control' })
    await item(wrapper, 'readme').trigger('keydown', { key: 'z', ctrlKey: true })
  })

  it('should reveal a node by opening its ancestors', async () => {
    const wrapper = build()

    ;(wrapper.vm.$ as unknown as { exposed: { reveal: (id: string) => void } }).exposed.reveal('b')
    await nextTick()
    expect(item(wrapper, 'b').exists()).toBe(true)
    ;(wrapper.vm.$ as unknown as { exposed: { reveal: (id: string) => void } }).exposed.reveal('zzz')
  })

  it('should render the node slot', () => {
    const wrapper = mount(TreeView, {
      props: { nodes },
      slots: { default: '<template #default="{ node }">[{{ node.label }}]</template>' },
    })

    expect(wrapper.find('.tree-item-label').text()).toBe('[src]')
  })
})

describe('NavigationSkipLink', () => {
  it('should link to the target and move the focus to it', async () => {
    document.body.innerHTML = '<main id="main"></main>'
    const wrapper = mount(SkipLink, { props: { id: 's', class: 'x' }, attachTo: document.body })

    expect(wrapper.attributes('href')).toBe('#main')
    expect(wrapper.text()).toBe('Skip to the main content')
    await wrapper.trigger('click')
    expect(document.getElementById('main')?.getAttribute('tabindex')).toBe('-1')
    expect(document.activeElement).toBe(document.getElementById('main'))
  })

  it('should accept a target with a hash, a label, and keep a tabindex that exists', async () => {
    document.body.innerHTML = '<section id="content" tabindex="0"></section><button id="btn"></button>'
    const wrapper = mount(SkipLink, { props: { target: '#content', label: 'Go' }, attachTo: document.body })

    expect(wrapper.attributes('href')).toBe('#content')
    await wrapper.trigger('click')
    expect(document.getElementById('content')?.getAttribute('tabindex')).toBe('0')
    await mount(SkipLink, { props: { target: 'btn' } }).trigger('click')
    await mount(SkipLink, { props: { target: 'missing' } }).trigger('click')
  })

  it('should come on screen with the focus only', async () => {
    const wrapper = mount(SkipLink, { attachTo: document.body })

    expect(wrapper.attributes('style')).toContain('-9999px')
    await wrapper.trigger('focus')
    expect(wrapper.attributes('style')).toContain('inset-inline-start: 0')
    await wrapper.trigger('blur')
    expect(wrapper.attributes('style')).toContain('-9999px')
  })
})

describe('NavigationBackToTop', () => {
  const scroll = async (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    window.dispatchEvent(new Event('scroll'))
    await nextTick()
  }

  afterEach(() => {
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
    vi.restoreAllMocks()
  })

  it('should show after the threshold and scroll to the top', async () => {
    const scrollTo = vi.fn()

    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
    const wrapper = mount(BackToTop, {
      props: { threshold: 100, label: 'Top', id: 'b', class: 'x' },
      attachTo: document.body,
    })

    expect(wrapper.find('button').exists()).toBe(false)
    await scroll(200)
    expect(wrapper.find('button').attributes('aria-label')).toBe('Top')
    await wrapper.find('button').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
    expect(wrapper.emitted('click')).toHaveLength(1)
    await scroll(10)
    expect(wrapper.find('button').exists()).toBe(false)
  })

  it('should not animate when the visitor prefers less motion, and stop listening when removed', async () => {
    const scrollTo = vi.fn()

    window.scrollTo = scrollTo as unknown as typeof window.scrollTo
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    await scroll(500)
    const wrapper = mount(BackToTop, { attachTo: document.body })

    await nextTick()
    await wrapper.find('button').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'auto' })
    const remove = vi.spyOn(window, 'removeEventListener')

    wrapper.unmount()
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})

describe('NavigationCommandPalette', () => {
  let env: ReturnType<typeof installDialog>
  const commands = [
    { id: 'new', label: 'New file', group: 'File', hint: 'Ctrl+N' },
    { id: 'open', label: 'Open file', group: 'File' },
    { id: 'theme', label: 'Change theme', group: 'View' },
    { id: 'off', label: 'Disabled command', group: 'View', disabled: true },
    { id: 'plain', label: 'Plain' },
  ]

  beforeEach(() => {
    env = installDialog({ requestClose: true, closedBy: true })
    setSupport({ dialog: true, dialogClosedBy: true, dialogRequestClose: true })
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  const build = (props: Record<string, unknown> = {}) =>
    mount(CommandPalette, { props: { commands, modelValue: true, ...props }, attachTo: document.body })

  it('should list the commands by group in a listbox', async () => {
    const wrapper = build({ id: 'p', class: 'x' })

    await nextTick()
    expect(wrapper.find('[role="combobox"]').attributes('aria-label')).toBe('Command palette')
    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
    expect(wrapper.findAll('.command-palette-heading').map((heading) => heading.text())).toEqual(['File', 'View'])
    expect(wrapper.findAll('[role="option"]')).toHaveLength(5)
    expect(wrapper.find('kbd').text()).toBe('Ctrl+N')
    expect(wrapper.findAll('[role="option"]')[0].attributes('data-active')).toBeDefined()
  })

  it('should filter while typing and show the empty text', async () => {
    const wrapper = build({ emptyText: 'Nothing' })

    await wrapper.find('input').setValue('theme')
    expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(['Change theme'])
    expect(wrapper.emitted('search')?.[0]).toEqual(['theme'])
    await wrapper.find('input').setValue('zzz')
    expect(wrapper.find('.command-palette-empty').text()).toBe('Nothing')
  })

  it('should move with the arrows, skip disabled commands and run with Enter', async () => {
    const wrapper = build()
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(wrapper.findAll('[role="option"]')[1].attributes('id'))
    await input.trigger('keydown', { key: 'End' })
    expect(wrapper.findAll('[role="option"]')[4].attributes('data-active')).toBeDefined()
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'Home' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('select')?.[0][0]).toMatchObject({ id: 'new' })
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false])
  })

  it('should run a command with a click but not a disabled one', async () => {
    const wrapper = build()

    await wrapper.findAll('[role="option"]')[3].trigger('click')
    expect(wrapper.emitted('select')).toBeUndefined()
    await wrapper.findAll('[role="option"]')[2].trigger('mousemove')
    expect(wrapper.findAll('[role="option"]')[2].attributes('data-active')).toBeDefined()
    await wrapper.findAll('[role="option"]')[3].trigger('mousemove')
    await wrapper.findAll('[role="option"]')[2].trigger('click')
    expect(wrapper.emitted('select')?.[0][0]).toMatchObject({ id: 'theme' })
  })

  it('should open and close with the shortcut', async () => {
    const wrapper = build({ modelValue: undefined })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'K', metaKey: true, cancelable: true }))
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([false])
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k' }))
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })

  it('should have no shortcut when empty, keep remote commands as they are and stop listening when removed', async () => {
    const none = build({ shortcut: '', modelValue: undefined })

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))
    expect(none.emitted('update:modelValue')).toBeUndefined()

    const remote = build({ remote: true, commands: [{ id: 'x', label: 'Server result' }] })

    await remote.find('input').setValue('q')
    expect(remote.findAll('[role="option"]')).toHaveLength(1)
    remote.unmount()
  })

  it('should render the command slot', () => {
    const wrapper = mount(CommandPalette, {
      props: { commands, modelValue: true },
      slots: { command: '<template #command="{ command }">>{{ command.id }}</template>' },
      attachTo: document.body,
    })

    expect(wrapper.find('[role="option"]').text()).toBe('>new')
  })
})

describe('OverlayContextMenu', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(ContextMenu, {
      props: { label: 'Actions', ...props },
      slots: {
        default: '<p>Area</p>',
        menu: '<button role="menuitem" class="one">One</button><button role="menuitem" class="two">Two</button>',
      },
      attachTo: document.body,
    })

  it('should open at the pointer on a right click and focus the first item', async () => {
    const wrapper = build({ id: 'c', class: 'x' })

    await wrapper.trigger('contextmenu', { clientX: 40, clientY: 30 })
    const menu = wrapper.find('[role="menu"]')

    expect(menu.attributes('aria-label')).toBe('Actions')
    expect(menu.attributes('style')).toContain('position: fixed')
    expect(document.activeElement).toBe(wrapper.find('.one').element)
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('should not open when disabled', async () => {
    const wrapper = build({ disabled: true })

    await wrapper.trigger('contextmenu')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('should open from the keyboard with the menu key and Shift+F10', async () => {
    const wrapper = build()

    await wrapper.trigger('keydown', { key: 'ContextMenu' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    await wrapper.find('[role="menu"]').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.trigger('keydown', { key: 'F10', shiftKey: true })
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    await wrapper.trigger('keydown', { key: 'F10' })
  })

  it('should move with the arrows and close with Tab', async () => {
    const wrapper = build()

    await wrapper.trigger('contextmenu')
    const menu = wrapper.find('[role="menu"]')

    await menu.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.find('.two').element)
    await menu.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(wrapper.find('.one').element)
    await menu.trigger('keydown', { key: 'ArrowUp' })
    await menu.trigger('keydown', { key: 'Home' })
    await menu.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(wrapper.find('.two').element)
    await menu.trigger('keydown', { key: 'Tab' })
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('should close when the visitor clicks outside but not inside, and when an item closes it', async () => {
    const wrapper = mount(
      {
        components: { ContextMenu, DropdownItem },
        template: '<ContextMenu><p>Area</p><template #menu><DropdownItem>Pick</DropdownItem></template></ContextMenu>',
      },
      { attachTo: document.body }
    )

    await wrapper.find('.context-menu-area').trigger('contextmenu')
    wrapper.find('[role="menu"]').element.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(true)
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
    await wrapper.find('.context-menu-area').trigger('contextmenu')
    await wrapper.find('[role="menuitem"]').trigger('click')
    expect(wrapper.find('[role="menu"]').exists()).toBe(false)
  })

  it('should stop listening when removed while open', async () => {
    const wrapper = build()

    await wrapper.trigger('contextmenu')
    wrapper.unmount()
    document.body.dispatchEvent(new Event('pointerdown'))
  })
})
