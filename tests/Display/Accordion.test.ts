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

const triggers = (wrapper: ReturnType<typeof build>) => wrapper.findAll('button.accordion-trigger')

describe('DisplayAccordion', () => {
  it('should render closed items linked by ARIA', () => {
    const wrapper = build()
    const [first] = triggers(wrapper)

    expect(wrapper.find('.accordion').exists()).toBe(true)
    expect(first.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('.accordion-panel').attributes('hidden')).toBeDefined()
    expect(wrapper.find('.accordion-panel').attributes('role')).toBe('region')
    expect(wrapper.find('.accordion-panel').attributes('aria-labelledby')).toBe(first.attributes('id'))
    expect(first.attributes('aria-controls')).toBe(wrapper.find('.accordion-panel').attributes('id'))
    expect(wrapper.find('h3.accordion-header').exists()).toBe(true)
  })

  it('should open one item at a time in single mode, without v-model', async () => {
    const wrapper = build()
    const [first, second] = triggers(wrapper)

    await first.trigger('click')

    expect(first.attributes('aria-expanded')).toBe('true')
    expect(wrapper.find('.accordion-item').attributes('data-open')).toBeDefined()

    await second.trigger('click')

    expect(first.attributes('aria-expanded')).toBe('false')
    expect(second.attributes('aria-expanded')).toBe('true')

    await second.trigger('click')

    expect(second.attributes('aria-expanded')).toBe('false')
  })

  it('should keep several items open in multiple mode', async () => {
    const wrapper = build({ multiple: true })
    const [first, second] = triggers(wrapper)

    await first.trigger('click')
    await second.trigger('click')

    expect(first.attributes('aria-expanded')).toBe('true')
    expect(second.attributes('aria-expanded')).toBe('true')

    await first.trigger('click')

    expect(first.attributes('aria-expanded')).toBe('false')
    expect(second.attributes('aria-expanded')).toBe('true')
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
      })
    )

    expect(wrapper.findAll('button')[1].attributes('aria-expanded')).toBe('true')

    await wrapper.findAll('button')[0].trigger('click')

    expect(model.value).toBe('a')
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
      })
    )

    await wrapper.findAll('button')[1].trigger('click')

    expect(model.value).toEqual(['a', 'b'])
  })

  it('should not toggle a disabled item', async () => {
    const wrapper = build()

    await triggers(wrapper)[2].trigger('click')

    expect(triggers(wrapper)[2].attributes('aria-expanded')).toBe('false')
  })

  it('should move the focus with the arrow keys, Home and End and skip disabled items', async () => {
    const wrapper = build()
    const [first, second] = triggers(wrapper)

    first.element.focus()
    await first.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(second.element)

    await second.trigger('keydown', { key: 'ArrowDown' })
    expect(document.activeElement).toBe(first.element)

    await first.trigger('keydown', { key: 'ArrowUp' })
    expect(document.activeElement).toBe(second.element)

    await second.trigger('keydown', { key: 'Home' })
    expect(document.activeElement).toBe(first.element)

    await first.trigger('keydown', { key: 'End' })
    expect(document.activeElement).toBe(second.element)

    await second.trigger('keydown', { key: 'a' })
    expect(document.activeElement).toBe(second.element)
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
    })

    expect(wrapper.find('h4.accordion-header').exists()).toBe(true)
    expect(wrapper.classes()).toEqual(['accordion-item', 'x'])
    expect(wrapper.find('button b').exists()).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('true')

    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes('aria-expanded')).toBe('false')
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
