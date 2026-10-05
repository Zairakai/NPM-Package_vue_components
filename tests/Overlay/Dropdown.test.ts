import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Dropdown from '../../src/Overlay/Dropdown.vue'
import DropdownItem from '../../src/Overlay/DropdownItem.vue'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  vi.useRealTimers()
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.body.innerHTML = ''
  resetSupport()
})

beforeEach(() => setSupport({ popover: false }))

function build(props: Record<string, unknown> = {}, onSelect = vi.fn(), itemProps: Record<string, unknown> = {}) {
  const wrapper = mount(
    defineComponent({
      render: () =>
        h(Dropdown, props, {
          trigger: ({ attrs }: { attrs: Record<string, unknown> }) =>
            h('button', { class: 'trigger', ...attrs }, 'Menu'),
          default: () => [
            h(DropdownItem, { onSelect: () => onSelect('edit'), ...itemProps }, () => 'Edit'),
            h(DropdownItem, { disabled: true, onSelect: () => onSelect('hidden') }, () => 'Hidden'),
            h(DropdownItem, { onSelect: () => onSelect('delete') }, () => 'Delete'),
            h(DropdownItem, { onSelect: () => onSelect('duplicate'), closeOnSelect: false }, () => 'Duplicate'),
          ],
        }),
    }),
    { attachTo: document.body }
  )

  mounted.push(wrapper)

  return wrapper
}

const items = (wrapper: ReturnType<typeof build>) => wrapper.findAll('[role="menuitem"]')

describe('OverlayDropdown', () => {
  it('should render a menu popover opened by the trigger, with the menu semantics', async () => {
    const wrapper = build({ id: 'm', label: 'Actions', class: 'x' })
    const trigger = wrapper.find('.trigger')

    expect(trigger.attributes('aria-haspopup')).toBe('menu')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('#m').attributes('role')).toBe('menu')
    expect(wrapper.find('#m').attributes('aria-label')).toBe('Actions')
    expect(wrapper.find('#m').classes()).toContain('dropdown')
    expect(wrapper.find('#m').classes()).toContain('x')
    expect(wrapper.find('#m').attributes('data-placement')).toBe('bottom-start')
    expect(items(wrapper)[0].attributes('tabindex')).toBe('-1')
    expect(items(wrapper)[0].attributes('role')).toBe('menuitem')

    await trigger.trigger('click')

    expect(trigger.attributes('aria-expanded')).toBe('true')
  })

  it('should focus the first enabled item when it opens', async () => {
    const wrapper = build()

    await wrapper.find('.trigger').trigger('click')
    await nextTick()
    await nextTick()

    expect(document.activeElement).toBe(items(wrapper)[0].element)
  })

  it('should open from the keyboard on the first or the last item', async () => {
    const wrapper = build()

    await wrapper.find('.trigger').trigger('keydown', { key: 'ArrowDown' })
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(items(wrapper)[0].element)

    const other = build()

    await other.find('.trigger').trigger('keydown', { key: 'ArrowUp' })
    await nextTick()
    await nextTick()
    expect(document.activeElement).toBe(items(other)[3].element)
  })

  it('should ignore the other keys on the trigger', async () => {
    const wrapper = build()

    await wrapper.find('.trigger').trigger('keydown', { key: 'a' })

    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('false')
  })

  it('should move with the arrow keys, Home and End and skip the disabled item', async () => {
    const wrapper = build()
    const key = async (name: string) => {
      ;(document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true })
      )
      await nextTick()
    }

    await wrapper.find('.trigger').trigger('click')
    await nextTick()
    await nextTick()

    await key('ArrowDown')
    expect(document.activeElement).toBe(items(wrapper)[2].element)

    await key('ArrowDown')
    expect(document.activeElement).toBe(items(wrapper)[3].element)

    await key('ArrowDown')
    expect(document.activeElement).toBe(items(wrapper)[0].element)

    await key('ArrowUp')
    expect(document.activeElement).toBe(items(wrapper)[3].element)

    await key('Home')
    expect(document.activeElement).toBe(items(wrapper)[0].element)

    await key('End')
    expect(document.activeElement).toBe(items(wrapper)[3].element)
  })

  it('should jump to an item with the first letters, and forget them after a pause', async () => {
    vi.useFakeTimers()
    const wrapper = build()

    await wrapper.find('.trigger').trigger('click')
    await nextTick()
    await nextTick()

    const key = (name: string, options: KeyboardEventInit = {}) =>
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options })
      )

    key('d')
    expect(document.activeElement).toBe(items(wrapper)[2].element)

    key('u')
    expect(document.activeElement).toBe(items(wrapper)[3].element)

    vi.advanceTimersByTime(600)
    key('e')
    expect(document.activeElement).toBe(items(wrapper)[0].element)

    key('x', { ctrlKey: true })
    expect(document.activeElement).toBe(items(wrapper)[0].element)
  })

  it('should close with Tab', async () => {
    const wrapper = build()

    await wrapper.find('.trigger').trigger('click')
    await nextTick()
    await nextTick()
    ;(document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }))
    await nextTick()

    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('false')
  })

  it('should emit select and close the menu when an item is chosen', async () => {
    const onSelect = vi.fn()
    const wrapper = build({}, onSelect)

    await wrapper.find('.trigger').trigger('click')
    await items(wrapper)[2].trigger('click')

    expect(onSelect).toHaveBeenCalledWith('delete')
    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('false')
  })

  it('should keep the menu open for an item that asks for it', async () => {
    const wrapper = build()

    await wrapper.find('.trigger').trigger('click')
    await items(wrapper)[3].trigger('click')

    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('true')
  })

  it('should not select a disabled item', async () => {
    const onSelect = vi.fn()
    const wrapper = build({}, onSelect)

    await items(wrapper)[1].trigger('click')

    expect(onSelect).not.toHaveBeenCalled()
  })

  it('should work as an item outside of a dropdown', async () => {
    const wrapper = mount(DropdownItem, { slots: { default: 'Solo' }, props: { id: 'i', class: 'y' } })

    await wrapper.trigger('click')

    expect(wrapper.emitted('select')).toHaveLength(1)
    expect(wrapper.classes()).toEqual(['dropdown-item', 'y'])
    expect(wrapper.attributes('id')).toBe('i')
  })

  it('should follow a v-model', async () => {
    const wrapper = build({ modelValue: true })

    await nextTick()
    await nextTick()

    expect(wrapper.find('.trigger').attributes('aria-expanded')).toBe('true')
  })
})
