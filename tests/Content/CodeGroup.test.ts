import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { groupSelection, resetGroups, selectInGroup } from '../../src/Content/codeGroup'
import CodeGroup from '../../src/Content/CodeGroup.vue'

const tabs = [
  { id: 'npm', label: 'npm', code: 'npm install x', language: 'bash' },
  { id: 'yarn', label: 'Yarn', code: 'yarn add x', language: 'bash', title: 'terminal' },
  { id: 'pnpm', label: 'pnpm', code: 'pnpm add x' },
]

describe('code group selection', () => {
  beforeEach(() => {
    resetGroups()
    window.localStorage.clear()
  })

  it('should remember the choice of a group in the page and in the storage', () => {
    expect(groupSelection('pm')).toBeUndefined()

    selectInGroup('pm', 'yarn')

    expect(groupSelection('pm')).toBe('yarn')
    expect(window.localStorage.getItem('zk-code-group:pm')).toBe('yarn')

    resetGroups()

    expect(groupSelection('pm')).toBe('yarn')
  })

  it('should keep the choice for the page when the storage is blocked', () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(groupSelection('x')).toBeUndefined()
    selectInGroup('x', 'a')
    expect(groupSelection('x')).toBe('a')

    get.mockRestore()
    set.mockRestore()
  })
})

describe('ContentCodeGroup', () => {
  beforeEach(() => {
    resetGroups()
    window.localStorage.clear()
  })

  it('should render the tabs with a code block in each panel', () => {
    const wrapper = mount(CodeGroup, {
      props: { tabs, id: 'g', class: 'x', label: 'Install' },
      attachTo: document.body,
    })

    expect(wrapper.classes()).toEqual(['code-group', 'x'])
    expect(wrapper.find('[role="tablist"]').attributes('aria-label')).toBe('Install')
    expect(wrapper.findAll('[role="tab"]').map((tab) => tab.text())).toEqual(['npm', 'Yarn', 'pnpm'])
    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
    expect(wrapper.findAll('[role="tabpanel"]')).toHaveLength(3)
    expect(wrapper.findAll('figure.code-block')[1].text()).toContain('yarn add x')
  })

  it('should show the tab that is chosen and emit it', async () => {
    const wrapper = mount(CodeGroup, { props: { tabs }, attachTo: document.body })

    await wrapper.findAll('[role="tab"]')[1].trigger('click')

    expect(wrapper.findAll('[role="tab"]')[1].attributes('aria-selected')).toBe('true')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['yarn'])
  })

  it('should follow the v-model and ignore an id it does not know', async () => {
    const wrapper = mount(CodeGroup, { props: { tabs, modelValue: 'pnpm' }, attachTo: document.body })

    expect(wrapper.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')

    await wrapper.setProps({ modelValue: 'nope' })

    expect(wrapper.findAll('[role="tab"]')[0].attributes('aria-selected')).toBe('true')
  })

  it('should share the choice between the groups with the same name and remember it', async () => {
    const first = mount(CodeGroup, { props: { tabs, group: 'pm' }, attachTo: document.body })
    const second = mount(CodeGroup, { props: { tabs, group: 'pm' }, attachTo: document.body })

    await first.findAll('[role="tab"]')[2].trigger('click')
    await nextTick()

    expect(second.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')
    expect(window.localStorage.getItem('zk-code-group:pm')).toBe('pnpm')

    const later = mount(CodeGroup, { props: { tabs, group: 'pm' }, attachTo: document.body })

    expect(later.findAll('[role="tab"]')[2].attributes('aria-selected')).toBe('true')
  })

  it('should render nothing active without tabs', () => {
    expect(mount(CodeGroup).findAll('[role="tab"]')).toHaveLength(0)
  })
})
