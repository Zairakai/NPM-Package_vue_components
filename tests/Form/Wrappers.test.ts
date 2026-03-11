import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Color from '../../src/Form/Color.vue'
import Datalist from '../../src/Form/Datalist.vue'
import Date from '../../src/Form/Date.vue'
import Datetime from '../../src/Form/Datetime.vue'
import Email from '../../src/Form/Email.vue'
import Fieldset from '../../src/Form/Fieldset.vue'
import File from '../../src/Form/File.vue'
import Form from '../../src/Form/Form.vue'
import Group from '../../src/Form/Group.vue'
import Hidden from '../../src/Form/Hidden.vue'
import Label from '../../src/Form/Label.vue'
import Month from '../../src/Form/Month.vue'
import Number from '../../src/Form/Number.vue'
import Password from '../../src/Form/Password.vue'
import Radio from '../../src/Form/Radio.vue'
import Range from '../../src/Form/Range.vue'
import Reset from '../../src/Form/Reset.vue'
import Search from '../../src/Form/Search.vue'
import Submit from '../../src/Form/Submit.vue'
import Switch from '../../src/Form/Switch.vue'
import Tel from '../../src/Form/Tel.vue'
import Time from '../../src/Form/Time.vue'
import Url from '../../src/Form/Url.vue'
import Week from '../../src/Form/Week.vue'

const FormInputStub = {
  template: '<input v-bind="$attrs" />',
  inheritAttrs: false,
}

const FormButtonStub = {
  template: '<button :type="$attrs.type"><slot /></button>',
  inheritAttrs: false,
}

const FormCheckboxStub = {
  template: '<input type="checkbox" v-bind="$attrs" />',
  inheritAttrs: false,
}

const stubs = { FormInput: FormInputStub }

describe('FormLabel', () => {
  it('renders <label> element', () => {
    const wrapper = mount(Label, { props: { label: 'My label', id: 'field-id' } })
    expect(wrapper.find('label').exists()).toBe(true)
  })

  it('uses slot when label/id are absent', () => {
    const wrapper = mount(Label, { slots: { default: 'Slot label' } })
    expect(wrapper.text()).toBe('Slot label')
  })
})

describe('FormFieldset', () => {
  it('renders <fieldset> with slot content', () => {
    const wrapper = mount(Fieldset, { slots: { default: 'Fields here' } })
    expect(wrapper.find('fieldset').exists()).toBe(true)
    expect(wrapper.text()).toBe('Fields here')
  })

  it('renders legend after slot by default', () => {
    const wrapper = mount(Fieldset, { props: { legend: 'My section' } })
    const children = wrapper.find('fieldset').element.children
    expect(children[children.length - 1].tagName).toBe('LEGEND')
  })

  it('renders legend before slot when legendBefore=true', () => {
    const wrapper = mount(Fieldset, { props: { legend: 'My section', legendBefore: true } })
    const children = wrapper.find('fieldset').element.children
    expect(children[0].tagName).toBe('LEGEND')
  })
})

describe('FormGroup', () => {
  it('renders <div> with slot content', () => {
    const wrapper = mount(Group, { slots: { default: 'Group content' } })
    expect(wrapper.find('div').exists()).toBe(true)
    expect(wrapper.text()).toBe('Group content')
  })

  it('applies class prop', () => {
    const wrapper = mount(Group, { props: { class: 'my-group' } })
    expect(wrapper.find('div').attributes('class')).toBe('my-group')
  })
})

describe('Form input wrappers', () => {
  it('FormEmail renders with type="email"', () => {
    const wrapper = mount(Email, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('FormNumber renders with type="number"', () => {
    const wrapper = mount(Number, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('number')
  })

  it('FormRange renders with type="range"', () => {
    const wrapper = mount(Range, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('range')
  })

  it('FormSearch renders with type="search"', () => {
    const wrapper = mount(Search, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('search')
  })

  it('FormTel renders with type="tel"', () => {
    const wrapper = mount(Tel, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('tel')
  })

  it('FormUrl renders with type="url"', () => {
    const wrapper = mount(Url, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('url')
  })

  it('FormDate renders with type="date"', () => {
    const wrapper = mount(Date, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('date')
  })

  it('FormPassword renders with type="password"', () => {
    const wrapper = mount(Password, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('password')
  })

  it('FormColor renders with type="color"', () => {
    const wrapper = mount(Color, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('color')
  })

  it('FormDatetime renders with type="datetime-local"', () => {
    const wrapper = mount(Datetime, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('datetime-local')
  })

  it('FormFile renders with type="file"', () => {
    const wrapper = mount(File, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('file')
  })

  it('FormHidden renders with type="hidden"', () => {
    const wrapper = mount(Hidden, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('hidden')
  })

  it('FormMonth renders with type="month"', () => {
    const wrapper = mount(Month, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('month')
  })

  it('FormRadio renders with type="radio"', () => {
    const wrapper = mount(Radio, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('radio')
  })

  it('FormTime renders with type="time"', () => {
    const wrapper = mount(Time, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('time')
  })

  it('FormWeek renders with type="week"', () => {
    const wrapper = mount(Week, { global: { stubs } })
    expect(wrapper.find('input').attributes('type')).toBe('week')
  })

  it('FormSwitch renders a checkbox input', () => {
    const wrapper = mount(Switch, {
      props: { name: 'toggle' },
      global: { stubs: { FormCheckbox: FormCheckboxStub } },
    })
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true)
  })
})

describe('FormButton wrappers', () => {
  const buttonStubs = { FormButton: FormButtonStub }

  it('FormReset renders a reset button', () => {
    const wrapper = mount(Reset, {
      slots: { default: 'Reset' },
      global: { stubs: buttonStubs },
    })
    expect(wrapper.find('button').attributes('type')).toBe('reset')
  })

  it('FormSubmit renders a submit button', () => {
    const wrapper = mount(Submit, {
      slots: { default: 'Submit' },
      global: { stubs: buttonStubs },
    })
    expect(wrapper.find('button').attributes('type')).toBe('submit')
  })
})

describe('FormForm', () => {
  it('renders <form> element', () => {
    const wrapper = mount(Form, { slots: { default: 'Form content' } })
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('sets autocomplete attribute', () => {
    const wrapper = mount(Form, { props: { autocomplete: 'on' } })
    expect(wrapper.find('form').attributes('autocomplete')).toBe('on')
  })
})

describe('FormDatalist', () => {
  it('renders <datalist> with options', () => {
    const wrapper = mount(Datalist, {
      props: { id: 'my-list', options: { fr: 'France', de: 'Germany' } },
    })
    expect(wrapper.find('datalist').attributes('id')).toBe('my-list')
    expect(wrapper.findAll('option')).toHaveLength(2)
  })
})
