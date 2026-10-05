import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import Calendar from '../../src/Form/Calendar.vue'
import Combobox from '../../src/Form/Combobox.vue'
import DatePicker from '../../src/Form/DatePicker.vue'
import MultiSelect from '../../src/Form/MultiSelect.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

const options = ['Apple', 'Banana', { value: 'c', label: 'Cherry', disabled: true }, 'Date']

describe('FormCombobox', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(Combobox, { props: { options, label: 'Fruit', ...props }, attachTo: document.body })

  it('should expose the combobox and listbox roles', async () => {
    const wrapper = build({ id: 'f', class: 'x' })
    const input = wrapper.find('input.combobox-input')

    expect(wrapper.classes()).toEqual(['combobox', 'x'])
    expect(wrapper.find('label').attributes('for')).toBe('f')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[role="listbox"]').isVisible()).toBe(false)

    await input.trigger('focus')

    expect(input.attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(4)
    expect(input.attributes('aria-controls')).toBe(wrapper.find('[role="listbox"]').attributes('id'))
  })

  it('should filter while typing and show the empty text', async () => {
    const wrapper = build({ emptyText: 'Nothing' })
    const input = wrapper.find('input')

    await input.setValue('an')
    expect(wrapper.findAll('[role="option"]').map((option) => option.text())).toEqual(['Banana'])
    await input.setValue('zzz')
    expect(wrapper.find('.combobox-empty').text()).toBe('Nothing')
    expect(wrapper.emitted('search')?.at(-1)).toEqual(['zzz'])
  })

  it('should move with the arrows, skip disabled options and choose with Enter', async () => {
    const wrapper = build()
    const input = wrapper.find('input')

    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(input.attributes('aria-activedescendant')).toBe(wrapper.findAll('[role="option"]')[0].attributes('id'))
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.findAll('[role="option"]')[3].attributes('data-active')).toBeDefined()
    await input.trigger('keydown', { key: 'ArrowUp' })
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.findAll('[role="option"]')[0].attributes('data-active')).toBeDefined()
    await input.trigger('keydown', { key: 'End' })
    expect(wrapper.findAll('[role="option"]')[3].attributes('data-active')).toBeDefined()
    await input.trigger('keydown', { key: 'Home' })
    await input.trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Apple'])
    expect(input.attributes('aria-expanded')).toBe('false')
    expect((input.element as HTMLInputElement).value).toBe('Apple')
  })

  it('should choose with a click, ignore a disabled option and close with Escape', async () => {
    const wrapper = build({ modelValue: '' })
    const input = wrapper.find('input')

    await input.trigger('focus')
    await wrapper.findAll('[role="option"]')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.findAll('[role="option"]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Banana'])
    await input.trigger('focus')
    await input.trigger('keydown', { key: 'Escape' })
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('should show the chosen label and close on blur', async () => {
    const wrapper = build({ modelValue: 'Date' })
    const input = wrapper.find('input')

    expect((input.element as HTMLInputElement).value).toBe('Date')
    await input.trigger('focus')
    await input.trigger('blur')
    expect(input.attributes('aria-expanded')).toBe('false')
  })

  it('should keep the options as they are for a remote source and show the loading state', async () => {
    const wrapper = build({ remote: true, loading: true, options: ['Zed'] })

    await wrapper.find('input').setValue('q')
    expect(wrapper.findAll('[role="option"]')).toHaveLength(1)
    expect(wrapper.find('input').attributes('aria-busy')).toBe('true')
    await wrapper.setProps({ options: [] })
    expect(wrapper.find('.combobox-empty').text()).toBe('…')
  })

  it('should create a value when creatable', async () => {
    const wrapper = build({ creatable: true })

    await wrapper.find('input').setValue('Kiwi')
    const created = wrapper.findAll('[role="option"]').at(-1)!

    expect(created.attributes('data-created')).toBeDefined()
    await created.trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['Kiwi'])
  })

  it('should post the value in a hidden input and be disabled', () => {
    const wrapper = build({ modelValue: 'Apple', name: 'fruit', form: 'f1' })

    expect(wrapper.find('input[type="hidden"]').attributes('name')).toBe('fruit')
    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('Apple')
    expect(build({ disabled: true }).find('input').attributes('disabled')).toBeDefined()
  })

  it('should keep several values as chips and remove them', async () => {
    const wrapper = build({ multiple: true, modelValue: ['Apple', 'Banana'], name: 'fruit' })

    expect(wrapper.findAll('.combobox-chip').map((chip) => chip.find('.combobox-chip-label').text())).toEqual([
      'Apple',
      'Banana',
    ])
    expect(wrapper.find('[role="listbox"]').attributes('aria-multiselectable')).toBe('true')
    expect(wrapper.findAll('input[type="hidden"]').map((input) => input.attributes('name'))).toEqual([
      'fruit[]',
      'fruit[]',
    ])

    await wrapper.find('.combobox-chip-remove').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Banana']])
  })

  it('should add a value, empty the query, and remove the last with Backspace', async () => {
    const wrapper = build({ multiple: true })
    const input = wrapper.find('input')

    await input.setValue('ba')
    await wrapper.findAll('[role="option"]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Banana']])
    expect((input.element as HTMLInputElement).value).toBe('')
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.length).toBeGreaterThan(1)
  })

  it('should hide the chosen options of a multiple list and work as a MultiSelect', async () => {
    const wrapper = mount(MultiSelect, { props: { options, modelValue: ['Apple'] }, attachTo: document.body })

    await wrapper.find('input').trigger('focus')
    expect(wrapper.findAll('[role="option"]').map((option) => option.text())).not.toContain('Apple')
    await wrapper.findAll('[role="option"]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['Apple', 'Banana']])
  })
})

describe('FormCalendar', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(Calendar, { props: { locale: 'en-US', modelValue: '2026-10-05', ...props }, attachTo: document.body })
  const day = (wrapper: ReturnType<typeof build>, label: string) =>
    wrapper.findAll('.calendar-day').find((button) => button.attributes('aria-label')?.includes(label))!

  it('should render a grid of the month with the selected day and a roving tabindex', () => {
    const wrapper = build({ id: 'c', class: 'x' })

    expect(wrapper.classes()).toEqual(['calendar', 'x'])
    expect(wrapper.find('.calendar-title').text()).toBe('October 2026')
    expect(wrapper.find('table').attributes('role')).toBe('grid')
    expect(wrapper.findAll('thead th')).toHaveLength(7)
    expect(wrapper.findAll('thead th')[0].text()).toBe('Mon')
    expect(day(wrapper, 'October 5, 2026').attributes('data-selected')).toBeDefined()
    expect(wrapper.findAll('.calendar-day[tabindex="0"]')).toHaveLength(1)
    expect(day(wrapper, 'October 5, 2026').attributes('tabindex')).toBe('0')
  })

  it('should choose a day, and change month with the buttons', async () => {
    const wrapper = build()

    await day(wrapper, 'October 12, 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-10-12'])
    await wrapper.find('.calendar-next').trigger('click')
    expect(wrapper.find('.calendar-title').text()).toBe('November 2026')
    await wrapper.find('.calendar-previous').trigger('click')
    await wrapper.find('.calendar-previous').trigger('click')
    expect(wrapper.find('.calendar-title').text()).toBe('September 2026')
    expect(wrapper.emitted('update:month')?.[0]).toEqual(['2026-11'])
  })

  it('should move the focus with the keyboard', async () => {
    const wrapper = build()
    const grid = wrapper.find('table')

    await grid.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.find('.calendar-day[tabindex="0"]').attributes('aria-label')).toContain('October 6')
    await grid.trigger('keydown', { key: 'ArrowDown' })
    expect(wrapper.find('.calendar-day[tabindex="0"]').attributes('aria-label')).toContain('October 13')
    await grid.trigger('keydown', { key: 'ArrowLeft' })
    await grid.trigger('keydown', { key: 'ArrowUp' })
    expect(wrapper.find('.calendar-day[tabindex="0"]').attributes('aria-label')).toContain('October 5')
    await grid.trigger('keydown', { key: 'Home' })
    expect(wrapper.find('.calendar-day[tabindex="0"]').attributes('aria-label')).toContain('October 5')
    await grid.trigger('keydown', { key: 'End' })
    expect(wrapper.find('.calendar-day[tabindex="0"]').attributes('aria-label')).toContain('October 11')
    await grid.trigger('keydown', { key: 'PageDown' })
    expect(wrapper.find('.calendar-title').text()).toBe('November 2026')
    await grid.trigger('keydown', { key: 'PageUp', shiftKey: true })
    expect(wrapper.find('.calendar-title').text()).toBe('November 2025')
  })

  it('should disable days out of the bounds and days refused by the function', async () => {
    const wrapper = build({ min: '2026-10-03', max: '2026-10-20', isDisabled: (iso: string) => '2026-10-10' === iso })

    expect(day(wrapper, 'October 2, 2026').attributes('disabled')).toBeDefined()
    expect(day(wrapper, 'October 21, 2026').attributes('disabled')).toBeDefined()
    expect(day(wrapper, 'October 10, 2026').attributes('disabled')).toBeDefined()
    await day(wrapper, 'October 10, 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.find('table').trigger('keydown', { key: 'PageUp' })
    expect(wrapper.find('.calendar-title').text()).toBe('October 2026')
  })

  it('should choose a range with two clicks, in any order', async () => {
    const wrapper = build({ range: true, modelValue: undefined })

    await day(wrapper, 'October 20, 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await day(wrapper, 'October 15, 2026').trigger('mouseenter')
    expect(day(wrapper, 'October 17, 2026').attributes('data-in-range')).toBeDefined()
    await day(wrapper, 'October 15, 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([{ start: '2026-10-15', end: '2026-10-20' }])
  })

  it('should show a chosen range and cancel a started one with Escape', async () => {
    const wrapper = build({ range: true, modelValue: { start: '2026-10-05', end: '2026-10-08' } })

    expect(day(wrapper, 'October 6, 2026').attributes('data-in-range')).toBeDefined()
    expect(day(wrapper, 'October 8, 2026').attributes('data-selected')).toBeDefined()
    await day(wrapper, 'October 20, 2026').trigger('click')
    await wrapper.find('table').trigger('keydown', { key: 'Escape' })
    await day(wrapper, 'October 22, 2026').trigger('click')
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should follow the value of the parent and mark today', async () => {
    const wrapper = build()

    await wrapper.setProps({ modelValue: '2027-03-09' })
    expect(wrapper.find('.calendar-title').text()).toBe('March 2027')
    expect(
      mount(Calendar, { props: { locale: 'en-US' } })
        .find('[data-today]')
        .attributes('aria-current')
    ).toBe('date')
  })
})

describe('FormDatePicker', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(DatePicker, { props: { locale: 'en-US', label: 'Date', ...props }, attachTo: document.body })

  it('should show the formatted date and open the calendar', async () => {
    const wrapper = build({ modelValue: '2026-10-05', id: 'd', class: 'x' })

    expect(wrapper.classes()).toEqual(['datepicker', 'x'])
    expect((wrapper.find('input.datepicker-input').element as HTMLInputElement).value).toBe('Oct 5, 2026')
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(false)
    await wrapper.find('.datepicker-toggle').trigger('click')
    await nextTick()
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(true)
    expect(wrapper.find('input').attributes('aria-expanded')).toBe('true')
  })

  it('should pick a day and close, then clear', async () => {
    const wrapper = build({ modelValue: '2026-10-05' })

    await wrapper.find('.datepicker-input').trigger('click')
    await wrapper
      .findAll('.calendar-day')
      .find((button) => button.attributes('aria-label')?.includes('October 12'))!
      .trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-10-12'])
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(false)
    await wrapper.find('.datepicker-clear').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([undefined])
  })

  it('should close with Escape and when the visitor clicks outside', async () => {
    const wrapper = build()

    await wrapper.find('.datepicker-toggle').trigger('click')
    await wrapper.find('.datepicker-panel').trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(false)
    await wrapper.find('.datepicker-toggle').trigger('click')
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))
    await nextTick()
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(false)
  })

  it('should handle a range and post it', async () => {
    const wrapper = build({ range: true, modelValue: { start: '2026-10-05', end: '2026-10-08' }, name: 'stay' })

    expect((wrapper.find('.datepicker-input').element as HTMLInputElement).value).toBe('Oct 5, 2026 – Oct 8, 2026')
    expect(wrapper.find('input[name="stay[start]"]').attributes('value')).toBe('2026-10-05')
    expect(wrapper.find('input[name="stay[end]"]').attributes('value')).toBe('2026-10-08')
    await wrapper.find('.datepicker-toggle').trigger('click')
    await wrapper
      .findAll('.calendar-day')
      .find((button) => button.attributes('aria-label')?.includes('October 20'))!
      .trigger('click')
    expect(wrapper.find('.datepicker-panel').isVisible()).toBe(true)
  })

  it('should post a single date and be disabled', () => {
    expect(build({ modelValue: '2026-10-05', name: 'd' }).find('input[type="hidden"]').attributes('value')).toBe(
      '2026-10-05'
    )
    expect(build({ disabled: true }).find('.datepicker-toggle').attributes('disabled')).toBeDefined()
    expect(
      (
        build({ range: true, modelValue: { start: '2026-10-05' } }).find('.datepicker-input')
          .element as HTMLInputElement
      ).value
    ).toBe('')
  })
})
