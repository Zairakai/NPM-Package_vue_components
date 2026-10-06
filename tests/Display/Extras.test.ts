import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Chip from '../../src/Display/Chip.vue'
import ChipGroup from '../../src/Display/ChipGroup.vue'
import EmptyState from '../../src/Display/EmptyState.vue'
import List from '../../src/Display/List.vue'
import ListItem from '../../src/Display/ListItem.vue'
import Rating from '../../src/Display/Rating.vue'
import Timeline from '../../src/Display/Timeline.vue'
import TimelineItem from '../../src/Display/TimelineItem.vue'

describe('DisplayChip', () => {
  it('should render a static label', () => {
    const wrapper = mount(Chip, {
      props: { id: 'c', class: 'x', variant: 'info' },
      slots: { default: 'Tag', icon: '*' },
    })

    expect(wrapper.classes()).toEqual(['chip', 'x'])
    expect(wrapper.attributes('data-variant')).toBe('info')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('.chip-label').text()).toBe('Tag')
    expect(wrapper.find('.chip-icon').attributes('aria-hidden')).toBe('true')
  })

  it('should toggle when selectable and emit', async () => {
    const wrapper = mount(Chip, { props: { selectable: true }, slots: { default: 'Tag' } })
    const button = wrapper.find('button.chip-label')

    expect(button.attributes('aria-pressed')).toBe('false')
    await button.trigger('click')
    expect(button.attributes('aria-pressed')).toBe('true')
    expect(wrapper.attributes('data-selected')).toBeDefined()
    expect(wrapper.emitted('update:selected')?.[0]).toEqual([true])
  })

  it('should follow the selected prop and be removable', async () => {
    const wrapper = mount(Chip, {
      props: { selectable: true, selected: true, removable: true, removeLabel: 'Drop', disabled: true },
    })

    expect(wrapper.find('.chip-label').attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('.chip-remove').attributes('aria-label')).toBe('Drop')
    expect(wrapper.attributes('data-disabled')).toBeDefined()

    await mount(Chip, { props: { removable: true } })
      .find('.chip-remove')
      .trigger('click')
    const free = mount(Chip, { props: { removable: true } })

    await free.find('.chip-remove').trigger('click')
    expect(free.emitted('remove')).toHaveLength(1)
  })
})

describe('DisplayChipGroup', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(
      {
        components: { ChipGroup, Chip },
        props: ['groupProps'],
        template: '<ChipGroup v-bind="groupProps"><Chip value="a">A</Chip><Chip value="b">B</Chip></ChipGroup>',
      },
      { props: { groupProps: props } }
    )

  it('should select several values', async () => {
    const wrapper = build({ label: 'Tags', id: 'g', class: 'x' })
    const buttons = wrapper.findAll('button')

    expect(wrapper.find('.chip-group').attributes('role')).toBe('group')
    expect(wrapper.find('.chip-group').attributes('aria-label')).toBe('Tags')
    await buttons[0].trigger('click')
    await buttons[1].trigger('click')
    expect(buttons.map((button) => button.attributes('aria-pressed'))).toEqual(['true', 'true'])
    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
  })

  it('should select one value at a time', async () => {
    const wrapper = build({ multiple: false })
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    await buttons[1].trigger('click')

    expect(buttons.map((button) => button.attributes('aria-pressed'))).toEqual(['false', 'true'])
  })
})

describe('DisplayList', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(
      {
        components: { List, ListItem },
        props: ['listProps'],
        template:
          '<List v-bind="listProps"><ListItem value="a" title="A" subtitle="sub">body<template #prepend>P</template><template #append>Z</template></ListItem><ListItem value="b" title="B" disabled /><ListItem title="L" href="/x" /></List>',
      },
      { props: { listProps: props } }
    )

  it('should render a plain list', () => {
    const wrapper = build({ id: 'l', class: 'x', label: 'Things' })

    expect(wrapper.find('ul').classes()).toEqual(['list', 'x'])
    expect(wrapper.find('ul').attributes('aria-label')).toBe('Things')
    expect(wrapper.find('ul').attributes('data-selectable')).toBeUndefined()
    expect(wrapper.find('.list-item-title').text()).toBe('A')
    expect(wrapper.find('.list-item-subtitle').text()).toBe('sub')
    expect(wrapper.find('.list-item-prepend').text()).toBe('P')
    expect(wrapper.find('.list-item-append').text()).toBe('Z')
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a.list-item-body').attributes('href')).toBe('/x')
  })

  it('should select several items', async () => {
    const wrapper = build({ selectable: 'multiple' })
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    expect(wrapper.find('li').attributes('data-selected')).toBeDefined()
    expect(buttons[1].attributes('disabled')).toBeDefined()
    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
  })

  it('should select a single item', async () => {
    const wrapper = build({ selectable: 'single' })
    const buttons = wrapper.findAll('button')

    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-pressed')).toBe('true')
    await buttons[0].trigger('click')
    expect(buttons[0].attributes('aria-pressed')).toBe('false')
  })

  it('should mark a disabled link', () => {
    const wrapper = mount(ListItem, { props: { href: '/x', disabled: true } })

    expect(wrapper.find('a').attributes('href')).toBeUndefined()
    expect(wrapper.find('a').attributes('aria-disabled')).toBe('true')
  })
})

describe('DisplayTimeline', () => {
  it('should render an ordered list of items with a time element', () => {
    const wrapper = mount({
      components: { Timeline, TimelineItem },
      template:
        '<Timeline label="History" reverse><TimelineItem title="Done" datetime="2026-10-05" time="5 Oct" variant="success">text<template #marker>o</template></TimelineItem><TimelineItem datetime="2026-10-06" /></Timeline>',
    })

    expect(wrapper.find('ol').attributes('aria-label')).toBe('History')
    expect(wrapper.find('ol').attributes('reversed')).toBeDefined()
    expect(wrapper.find('li').attributes('data-variant')).toBe('success')
    expect(wrapper.find('time').attributes('datetime')).toBe('2026-10-05')
    expect(wrapper.find('time').text()).toBe('5 Oct')
    expect(wrapper.findAll('time')[1].text()).toBe('2026-10-06')
    expect(wrapper.find('.timeline-title').text()).toBe('Done')
    expect(wrapper.find('.timeline-marker').attributes('aria-hidden')).toBe('true')
  })
})

describe('DisplayRating', () => {
  it('should draw full, half and empty stars with a text alternative', () => {
    const wrapper = mount(Rating, { props: { value: 3.5, id: 'r', class: 'x' } })

    expect(wrapper.attributes('role')).toBe('img')
    expect(wrapper.attributes('aria-label')).toBe('3.5 out of 5')
    expect(wrapper.findAll('.rating-star').map((star) => star.attributes('data-state'))).toEqual([
      'full',
      'full',
      'full',
      'half',
      'empty',
    ])
  })

  it('should clamp the value and use a custom max and label', () => {
    const wrapper = mount(Rating, { props: { value: 99, max: 3, label: '{value}/{max}' } })

    expect(wrapper.attributes('aria-label')).toBe('3/3')
    expect(mount(Rating, { props: { value: -2 } }).attributes('data-value')).toBe('0')
  })
})

describe('DisplayEmptyState', () => {
  it('should render the title, description, icon and actions', () => {
    const wrapper = mount(EmptyState, {
      props: { title: 'Empty', description: 'Nothing', id: 'e', class: 'x' },
      slots: { icon: 'i', actions: '<button>Add</button>' },
    })

    expect(wrapper.classes()).toEqual(['empty-state', 'x'])
    expect(wrapper.find('.empty-state-title').text()).toBe('Empty')
    expect(wrapper.find('.empty-state-description').text()).toBe('Nothing')
    expect(wrapper.find('.empty-state-icon').exists()).toBe(true)
    expect(wrapper.find('.empty-state-actions button').exists()).toBe(true)
  })

  it('should render nothing optional by default', () => {
    expect(mount(EmptyState).findAll('p')).toHaveLength(0)
  })
})
