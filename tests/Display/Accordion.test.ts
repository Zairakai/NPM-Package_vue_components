import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import Accordion from '../../src/Display/Accordion.vue'
import AccordionItem from '../../src/Display/AccordionItem.vue'

function build(props: Record<string, unknown> = {}) {
  return mount(
    defineComponent({
      render: () =>
        h(Accordion, props, () => [
          h(AccordionItem, { id: 'a', title: 'First' }, () => 'Panel A'),
          h(AccordionItem, { id: 'b', title: 'Second' }, () => 'Panel B'),
          h(AccordionItem, { id: 'c', title: 'Third', disabled: true }, () => 'Panel C'),
        ]),
    }),
    { attachTo: document.body }
  )
}

const detailsOf = (wrapper: ReturnType<typeof build>) => wrapper.findAll('details.accordion-item')

// The browser opens the <details> itself and fires "toggle": do the same.
async function setOpen(details: HTMLDetailsElement, open: boolean) {
  details.open = open
  details.dispatchEvent(new Event('toggle'))
  await Promise.resolve()
  await Promise.resolve()
}

describe('DisplayAccordion', () => {
  it('should render native closed details with a heading in each summary', () => {
    const wrapper = build()
    const [first] = detailsOf(wrapper)

    expect(wrapper.find('.accordion').exists()).toBe(true)
    expect((first.element as HTMLDetailsElement).open).toBe(false)
    expect(first.find('summary.accordion-trigger h3.accordion-header').text()).toBe('First')
    expect(first.find('.accordion-panel').text()).toBe('Panel A')
  })

  it('should share one name between the items in single mode so the browser closes the others', () => {
    const names = detailsOf(build()).map((details) => details.attributes('name'))

    expect(names[0]).toBeTruthy()
    expect(new Set(names).size).toBe(1)
  })

  it('should not give a name in multiple mode', () => {
    expect(detailsOf(build({ multiple: true }))[0].attributes('name')).toBeUndefined()
  })

  it('should follow the browser when an item opens and closes, without v-model', async () => {
    const wrapper = build()
    const [first, second] = detailsOf(wrapper).map((details) => details.element as HTMLDetailsElement)

    await setOpen(first, true)
    expect(first.open).toBe(true)
    expect(detailsOf(wrapper)[0].attributes('data-open')).toBeUndefined()

    await setOpen(first, false)
    await setOpen(second, true)
    expect(first.open).toBe(false)
    expect(second.open).toBe(true)
  })

  it('should keep several items open in multiple mode', async () => {
    const wrapper = build({ multiple: true })
    const [first, second] = detailsOf(wrapper).map((details) => details.element as HTMLDetailsElement)

    await setOpen(first, true)
    await setOpen(second, true)

    expect(first.open).toBe(true)
    expect(second.open).toBe(true)

    await setOpen(first, false)

    expect(first.open).toBe(false)
    expect(second.open).toBe(true)
  })

  it('should follow and emit the v-model', async () => {
    const model = ref<string | null>('b')
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            Accordion,
            { modelValue: model.value, 'onUpdate:modelValue': (value: string | null) => (model.value = value) },
            () => [h(AccordionItem, { id: 'a', title: 'A' }), h(AccordionItem, { id: 'b', title: 'B' })]
          ),
      }),
      { attachTo: document.body }
    )
    const [a, b] = wrapper.findAll('details').map((details) => details.element as HTMLDetailsElement)

    expect(b.open).toBe(true)

    await setOpen(a, true)

    expect(model.value).toBe('a')

    await setOpen(a, false)

    expect(model.value).toBeNull()
  })

  it('should accept an array model in multiple mode', async () => {
    const model = ref<string[]>(['a'])
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            Accordion,
            {
              multiple: true,
              modelValue: model.value,
              'onUpdate:modelValue': (value: string[]) => (model.value = value),
            },
            () => [h(AccordionItem, { id: 'a', title: 'A' }), h(AccordionItem, { id: 'b', title: 'B' })]
          ),
      }),
      { attachTo: document.body }
    )
    const [, b] = wrapper.findAll('details').map((details) => details.element as HTMLDetailsElement)

    await setOpen(b, true)

    expect(model.value).toEqual(['a', 'b'])
  })

  it('should put the browser back in sync when the parent refuses the change', async () => {
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(Accordion, { modelValue: null, 'onUpdate:modelValue': () => undefined }, () => [
            h(AccordionItem, { id: 'a', title: 'A' }),
          ]),
      }),
      { attachTo: document.body }
    )
    const details = wrapper.find('details').element as HTMLDetailsElement

    await setOpen(details, true)

    expect(details.open).toBe(false)
  })

  it('should not open a disabled item', async () => {
    const wrapper = build()
    const third = detailsOf(wrapper)[2]
    const summary = third.find('summary')
    const event = new MouseEvent('click', { cancelable: true, bubbles: true })

    summary.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(summary.attributes('aria-disabled')).toBe('true')
    expect(third.attributes('data-disabled')).toBeDefined()
  })

  it('should not stop the click of an enabled item', () => {
    const summary = detailsOf(build())[0].find('summary')
    const event = new MouseEvent('click', { cancelable: true, bubbles: true })

    summary.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
  })

  it('should move the focus with the arrow keys, Home and End and skip disabled items', async () => {
    const wrapper = build()
    const [first, second] = wrapper.findAll('summary').map((summary) => summary.element as HTMLElement)
    const keydown = async (target: HTMLElement, key: string) => {
      target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }))
      await Promise.resolve()
    }

    first.focus()
    await keydown(first, 'ArrowDown')
    expect(document.activeElement).toBe(second)

    await keydown(second, 'ArrowDown')
    expect(document.activeElement).toBe(first)

    await keydown(first, 'ArrowUp')
    expect(document.activeElement).toBe(second)

    await keydown(second, 'Home')
    expect(document.activeElement).toBe(first)

    await keydown(first, 'End')
    expect(document.activeElement).toBe(second)

    await keydown(second, 'a')
    expect(document.activeElement).toBe(second)
  })

  it('should ignore the keys when the focus is not on a header', async () => {
    const wrapper = build()

    ;(document.activeElement as HTMLElement | null)?.blur()
    await wrapper.find('.accordion').trigger('keydown', { key: 'ArrowDown' })

    expect(document.activeElement).toBe(document.body)
  })

  it('should work on its own, outside of an accordion, with the title slot and a custom level', async () => {
    const wrapper = mount(AccordionItem, {
      props: { id: 'solo', level: 4, class: 'x' },
      slots: { title: '<b>Custom</b>', default: 'Body' },
      attachTo: document.body,
    })
    const details = wrapper.find('details').element as HTMLDetailsElement

    expect(wrapper.find('h4.accordion-header').exists()).toBe(true)
    expect(wrapper.classes()).toEqual(['accordion-item', 'x'])
    expect(wrapper.find('summary b').exists()).toBe(true)
    expect(wrapper.attributes('name')).toBeUndefined()

    await setOpen(details, true)
    expect(details.open).toBe(true)

    await setOpen(details, false)
    expect(details.open).toBe(false)
  })

  it('should validate the heading level', () => {
    const { level } = (AccordionItem as unknown as { props: Record<string, { validator: (v: number) => boolean }> })
      .props

    expect(level.validator(3)).toBe(true)
    expect(level.validator(1)).toBe(false)
    expect(level.validator(7)).toBe(false)
  })

  it('should keep the id and custom class of the accordion', () => {
    const wrapper = mount(Accordion, { props: { id: 'acc', class: 'x' } })

    expect(wrapper.attributes('id')).toBe('acc')
    expect(wrapper.classes()).toEqual(['accordion', 'x'])
  })
})
