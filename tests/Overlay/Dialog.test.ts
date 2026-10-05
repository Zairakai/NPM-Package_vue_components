import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Dialog from '../../src/Overlay/Dialog.vue'
import { installDialog } from './dialog-env'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.documentElement.style.overflow = ''
})

describe('OverlayDialog', () => {
  let env: ReturnType<typeof installDialog>

  beforeEach(() => {
    env = installDialog({ requestClose: true, closedBy: true })
    setSupport({ dialog: true, dialogClosedBy: true, dialogRequestClose: true })
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  const mountDialog = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const wrapper = mount(Dialog, { props, slots, attachTo: document.body })

    mounted.push(wrapper)

    return wrapper
  }

  const open = async (wrapper: ReturnType<typeof mountDialog>) => {
    ;(
      wrapper.findComponent({ name: 'OverlayModal' }).vm.$ as unknown as { exposed: { show: () => void } }
    ).exposed.show()
    await nextTick()
    await nextTick()
  }

  const press = async (wrapper: ReturnType<typeof mountDialog>, value: string) => {
    const submit = wrapper.find(`button[value="${value}"]`).element as HTMLButtonElement
    const event = new SubmitEvent('submit', { bubbles: true, cancelable: true, submitter: submit })

    wrapper.find('form').element.dispatchEvent(event)
    await nextTick()
    await nextTick()
  }

  it('should render a dialog with the message and a confirm and a cancel button', () => {
    const wrapper = mountDialog({ title: 'Delete?', message: 'This cannot be undone.', class: 'x' })

    expect(wrapper.find('dialog').classes()).toContain('dialog')
    expect(wrapper.find('dialog').classes()).toContain('x')
    expect(wrapper.find('.modal-title').text()).toBe('Delete?')
    expect(wrapper.find('.dialog-message').text()).toBe('This cannot be undone.')
    expect(wrapper.find('form').attributes('method')).toBe('dialog')
    expect(wrapper.find('button[value="confirm"]').text()).toBe('OK')
    expect(wrapper.find('button[value="confirm"]').attributes('autofocus')).toBeDefined()
    expect(wrapper.find('button[value="cancel"]').text()).toBe('Cancel')
    expect(wrapper.find('.modal-close').exists()).toBe(false)
  })

  it('should use the labels and the default slot as the message', () => {
    const wrapper = mountDialog({ confirmLabel: 'Supprimer', cancelLabel: 'Annuler' }, { default: '<b>Sure?</b>' })

    expect(wrapper.find('button[value="confirm"]').text()).toBe('Supprimer')
    expect(wrapper.find('button[value="cancel"]').text()).toBe('Annuler')
    expect(wrapper.find('.dialog-message b').exists()).toBe(true)
  })

  it('should be an alert dialog with only one button that cannot be dismissed', () => {
    const wrapper = mountDialog({ alert: true, message: 'Saved' })

    expect(wrapper.find('dialog').attributes('role')).toBe('alertdialog')
    expect(wrapper.find('dialog').attributes('closedby')).toBe('none')
    expect(wrapper.find('button[value="cancel"]').exists()).toBe(false)
    expect(wrapper.find('button[value="confirm"]').exists()).toBe(true)
  })

  it('should emit confirm with the close result when the user confirms', async () => {
    const wrapper = mountDialog({ message: 'Sure?' })

    await open(wrapper)
    await press(wrapper, 'confirm')

    expect(wrapper.emitted('confirm')).toHaveLength(1)
    expect(wrapper.emitted('cancel')).toBeUndefined()
    expect(wrapper.emitted('close')?.[0]).toEqual(['confirm'])
    expect(wrapper.emitted('update:modelValue')?.map((event) => event[0])).toEqual([true, false])
  })

  it('should emit cancel when the user cancels', async () => {
    const wrapper = mountDialog({ message: 'Sure?' })

    await open(wrapper)
    await press(wrapper, 'cancel')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect(wrapper.emitted('confirm')).toBeUndefined()
  })

  it('should emit cancel when the dialog is closed another way', async () => {
    const wrapper = mountDialog({ message: 'Sure?' })

    await open(wrapper)
    ;(wrapper.find('dialog').element as HTMLDialogElement).close()
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('should follow the v-model', async () => {
    const wrapper = mountDialog({ modelValue: false })

    await wrapper.setProps({ modelValue: true })

    expect(env.showModal).toHaveBeenCalled()
  })

  it('should answer a submit without a submitter as a confirmation', async () => {
    const wrapper = mountDialog({ message: 'Sure?' })

    await open(wrapper)
    wrapper.find('form').element.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }))
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('should work without the dialog element: no navigation and the same answers', async () => {
    setSupport({ dialog: false })
    const wrapper = mountDialog({ message: 'Sure?' })

    await open(wrapper)

    const event = new SubmitEvent('submit', {
      bubbles: true,
      cancelable: true,
      submitter: wrapper.find('button[value="cancel"]').element as HTMLButtonElement,
    })

    wrapper.find('form').element.dispatchEvent(event)
    await nextTick()
    await nextTick()

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })
})
