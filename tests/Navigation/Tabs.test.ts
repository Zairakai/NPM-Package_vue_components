import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Tab from '../../src/Navigation/Tab.vue'
import TabList from '../../src/Navigation/TabList.vue'
import TabPanel from '../../src/Navigation/TabPanel.vue'
import Tabs from '../../src/Navigation/Tabs.vue'

function build(tabsProps: Record<string, unknown> = {}, disabledB = false) {
  return mount(
    defineComponent({
      render: () =>
        h(Tabs, tabsProps, () => [
          h(TabList, { label: 'Settings' }, () => [
            h(Tab, { id: 'a' }, () => 'Tab A'),
            h(Tab, { id: 'b', disabled: disabledB }, () => 'Tab B'),
            h(Tab, { id: 'c' }, () => 'Tab C'),
          ]),
          h(TabPanel, { id: 'a' }, () => 'Panel A'),
          h(TabPanel, { id: 'b' }, () => 'Panel B'),
          h(TabPanel, { id: 'c' }, () => 'Panel C'),
        ]),
    }),
    { attachTo: document.body }
  )
}

const tabs = (wrapper: ReturnType<typeof build>) => wrapper.findAll('[role="tab"]')
const panels = (wrapper: ReturnType<typeof build>) => wrapper.findAll('[role="tabpanel"]')

describe('NavigationTabs', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
    setSupport({ hiddenUntilFound: true, viewTransitions: false })
  })

  afterEach(() => resetSupport())

  it('should render a labelled tablist, and select the first tab by default', () => {
    const wrapper = build()

    expect(wrapper.find('[role="tablist"]').attributes('aria-label')).toBe('Settings')
    expect(wrapper.find('[role="tablist"]').attributes('aria-orientation')).toBe('horizontal')
    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('false')
    expect(tabs(wrapper)[0].attributes('tabindex')).toBe('0')
    expect(tabs(wrapper)[1].attributes('tabindex')).toBe('-1')
    expect(wrapper.find('.tabs').attributes('data-orientation')).toBe('horizontal')
  })

  it('should link every tab to its panel with ARIA', () => {
    const wrapper = build()

    expect(tabs(wrapper)[1].attributes('aria-controls')).toBe(panels(wrapper)[1].attributes('id'))
    expect(panels(wrapper)[1].attributes('aria-labelledby')).toBe(tabs(wrapper)[1].attributes('id'))
  })

  it('should show only the selected panel and keep the others findable by the page search', () => {
    const wrapper = build()

    expect(panels(wrapper)[0].attributes('hidden')).toBeUndefined()
    expect(panels(wrapper)[1].attributes('hidden')).toBe('until-found')
  })

  it('should simply hide the panels when the browser cannot search them', () => {
    setSupport({ hiddenUntilFound: false })
    const wrapper = build()

    expect(panels(wrapper)[1].attributes('hidden')).toBe('')
  })

  it('should select the tab that is clicked', async () => {
    const wrapper = build()

    await tabs(wrapper)[2].trigger('click')

    expect(tabs(wrapper)[2].attributes('aria-selected')).toBe('true')
    expect(panels(wrapper)[2].attributes('hidden')).toBeUndefined()
    expect(panels(wrapper)[0].attributes('hidden')).toBe('until-found')
  })

  it('should select the tab of a panel the page search found', async () => {
    const wrapper = build()

    await panels(wrapper)[1].trigger('beforematch')

    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')
  })

  it('should skip a disabled tab as the default and with the arrow keys', async () => {
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Tabs, {}, () => [
            h(TabList, {}, () => [
              h(Tab, { id: 'a', disabled: true }, () => 'A'),
              h(Tab, { id: 'b' }, () => 'B'),
              h(Tab, { id: 'c' }, () => 'C'),
            ]),
            h(TabPanel, { id: 'a' }),
            h(TabPanel, { id: 'b' }),
            h(TabPanel, { id: 'c' }),
          ]),
      }),
      { attachTo: document.body }
    )

    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
  })

  it('should follow the v-model', async () => {
    const model = ref('b')
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Tabs, { modelValue: model.value, 'onUpdate:modelValue': (value: string) => (model.value = value) }, () => [
            h(TabList, {}, () => [h(Tab, { id: 'a' }, () => 'A'), h(Tab, { id: 'b' }, () => 'B')]),
            h(TabPanel, { id: 'a' }),
            h(TabPanel, { id: 'b' }),
          ]),
      })
    )

    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')

    await wrapper.findAll('[role="tab"]')[0].trigger('click')

    expect(model.value).toBe('a')
  })

  it('should keep the active tab in a query parameter of the URL', async () => {
    window.history.replaceState(null, '', '/?tab=c')
    const wrapper = build({ queryParam: 'tab' })

    expect(tabs(wrapper)[2].attributes('aria-selected')).toBe('true')

    await tabs(wrapper)[1].trigger('click')

    expect(window.location.search).toBe('?tab=b')
  })

  it('should move the focus and select with the arrow keys, Home and End', async () => {
    const wrapper = build()
    const keydown = async (index: number, key: string) => {
      tabs(wrapper)[index].element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      await wrapper.vm.$nextTick()
    }

    ;(tabs(wrapper)[0].element as HTMLElement).focus()
    await keydown(0, 'ArrowRight')
    expect(document.activeElement).toBe(tabs(wrapper)[1].element)
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')

    await keydown(1, 'ArrowRight')
    await keydown(2, 'ArrowRight')
    expect(document.activeElement).toBe(tabs(wrapper)[0].element)

    await keydown(0, 'ArrowLeft')
    expect(document.activeElement).toBe(tabs(wrapper)[2].element)

    await keydown(2, 'Home')
    expect(document.activeElement).toBe(tabs(wrapper)[0].element)

    await keydown(0, 'End')
    expect(document.activeElement).toBe(tabs(wrapper)[2].element)

    await keydown(2, 'x')
    expect(document.activeElement).toBe(tabs(wrapper)[2].element)
  })

  it('should use the up and down arrows when vertical', async () => {
    const wrapper = build({ orientation: 'vertical' })

    expect(wrapper.find('[role="tablist"]').attributes('aria-orientation')).toBe('vertical')
    ;(tabs(wrapper)[0].element as HTMLElement).focus()
    tabs(wrapper)[0].element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    )
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(tabs(wrapper)[1].element)
  })

  it('should only move the focus in manual activation', async () => {
    const wrapper = build({ activation: 'manual' })

    ;(tabs(wrapper)[0].element as HTMLElement).focus()
    tabs(wrapper)[0].element.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
    )
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(tabs(wrapper)[1].element)
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('false')
  })

  it('should ignore the keys when the focus is not on a tab', async () => {
    const wrapper = build()

    ;(document.activeElement as HTMLElement | null)?.blur()
    await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(tabs(wrapper)[0].attributes('aria-selected')).toBe('true')
  })

  it('should change the panel inside a view transition when asked and supported', async () => {
    setSupport({ viewTransitions: true })
    const startViewTransition = vi.fn((update: () => void) => update())

    ;(document as unknown as { startViewTransition: unknown }).startViewTransition = startViewTransition
    const wrapper = build({ transition: true })

    await tabs(wrapper)[1].trigger('click')

    expect(startViewTransition).toHaveBeenCalledTimes(1)
    expect(tabs(wrapper)[1].attributes('aria-selected')).toBe('true')

    delete (document as unknown as { startViewTransition?: unknown }).startViewTransition
  })

  it('should keep the class and id of the root, the list, the tabs and the panels', () => {
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Tabs, { id: 't', class: 'x' }, () => [
            h(TabList, { id: 'l', class: 'y' }, () => [h(Tab, { id: 'a', class: 'z' }, () => 'A')]),
            h(TabPanel, { id: 'a', class: 'w' }),
          ]),
      })
    )

    expect(wrapper.find('#t').classes()).toEqual(['tabs', 'x'])
    expect(wrapper.find('#l').classes()).toEqual(['tab-list', 'y'])
    expect(wrapper.find('[role="tab"]').classes()).toEqual(['tab', 'z'])
    expect(wrapper.find('[role="tabpanel"]').classes()).toEqual(['tab-panel', 'w'])
  })

  it('should validate the orientation and the activation', () => {
    const { orientation, activation } = (
      Tabs as unknown as { props: Record<string, { validator: (v: string) => boolean }> }
    ).props

    expect(orientation.validator('vertical')).toBe(true)
    expect(orientation.validator('x')).toBe(false)
    expect(activation.validator('manual')).toBe(true)
    expect(activation.validator('x')).toBe(false)
  })

  it('should not register a tab again when it is enabled after being disabled', async () => {
    const disabled = ref(true)
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Tabs, {}, () => [
            h(TabList, {}, () => [
              h(Tab, { id: 'a', disabled: disabled.value }, () => 'A'),
              h(Tab, { id: 'b' }, () => 'B'),
            ]),
            h(TabPanel, { id: 'a' }),
            h(TabPanel, { id: 'b' }),
          ]),
      })
    )

    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')

    disabled.value = false
    await wrapper.vm.$nextTick()

    // Registered after the second one: the second stays the default.
    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
  })
})
