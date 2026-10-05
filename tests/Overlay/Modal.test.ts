import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Modal from '../../src/Overlay/Modal.vue'
import { installDialog } from './dialog-env'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.documentElement.style.overflow = ''
})

describe('OverlayModal with the native dialog', () => {
  let env: ReturnType<typeof installDialog>

  beforeEach(() => {
    env = installDialog({ requestClose: true, closedBy: true })
    setSupport({ dialog: true, dialogClosedBy: true, dialogRequestClose: true })
    document.documentElement.style.overflow = ''
    window.history.replaceState(null, '', '/')
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  const mountModal = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const wrapper = mount(Modal, { props, slots, attachTo: document.body })

    mounted.push(wrapper)

    return wrapper
  }

  it('should render a closed dialog with its title, body and footer', () => {
    const wrapper = mountModal(
      { title: 'Settings', id: 'm', class: 'x' },
      { default: 'Body', footer: '<button>Save</button>' }
    )

    expect(wrapper.element.tagName).toBe('DIALOG')
    expect((wrapper.element as HTMLDialogElement).open).toBe(false)
    expect(wrapper.classes()).toEqual(['modal', 'x'])
    expect(wrapper.attributes('id')).toBe('m')
    expect(wrapper.find('.modal-title').text()).toBe('Settings')
    expect(wrapper.find('.modal-body').text()).toBe('Body')
    expect(wrapper.find('.modal-footer button').exists()).toBe(true)
    expect(wrapper.attributes('aria-labelledby')).toBe(wrapper.find('.modal-title').attributes('id'))
    expect(wrapper.attributes('aria-describedby')).toBe(wrapper.find('.modal-body').attributes('id'))
    expect(wrapper.attributes('closedby')).toBe('closerequest')
    expect(wrapper.attributes('role')).toBeUndefined()
  })

  it('should not label the dialog without a title and not render a footer', () => {
    const wrapper = mountModal()

    expect(wrapper.attributes('aria-labelledby')).toBeUndefined()
    expect(wrapper.find('.modal-footer').exists()).toBe(false)
    expect(wrapper.find('.modal-title').exists()).toBe(false)
  })

  it('should open as a modal when the model becomes true, lock the scroll and emit open', async () => {
    const wrapper = mountModal({ modelValue: false })

    await wrapper.setProps({ modelValue: true })

    expect(env.showModal).toHaveBeenCalledTimes(1)
    expect((wrapper.element as HTMLDialogElement).open).toBe(true)
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('should open at once when it is mounted open', () => {
    mountModal({ modelValue: true })

    expect(env.showModal).toHaveBeenCalledTimes(1)
  })

  it('should open without v-model through its exposed show and close', async () => {
    const wrapper = mountModal()

    ;(wrapper.vm as unknown as { show: () => void }).show()
    await nextTick()
    await nextTick()
    expect((wrapper.element as HTMLDialogElement).open).toBe(true)

    ;(wrapper.vm as unknown as { close: (value?: string) => void }).close('done')
    await nextTick()

    expect((wrapper.element as HTMLDialogElement).open).toBe(false)
    expect(wrapper.emitted('close')?.[0]).toEqual(['done'])
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('should open a non-modal dialog with show() and not lock the scroll', async () => {
    const wrapper = mountModal({ modelValue: false, modal: false })

    await wrapper.setProps({ modelValue: true })

    expect(env.show).toHaveBeenCalledTimes(1)
    expect(env.showModal).not.toHaveBeenCalled()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('should close the dialog when the model becomes false', async () => {
    const wrapper = mountModal({ modelValue: true })

    await wrapper.setProps({ modelValue: false })

    expect(env.close).toHaveBeenCalled()
    expect((wrapper.element as HTMLDialogElement).open).toBe(false)
  })

  it('should not open it twice', async () => {
    const wrapper = mountModal({ modelValue: true })

    await wrapper.setProps({ modelValue: false })
    await wrapper.setProps({ modelValue: true })

    expect(env.showModal).toHaveBeenCalledTimes(2)
  })

  it('should follow the browser when it closes the dialog and emit the return value', async () => {
    const wrapper = mountModal()

    ;(wrapper.vm as unknown as { show: () => void }).show()
    await nextTick()
    await nextTick()
    ;(wrapper.element as HTMLDialogElement).close('escaped')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.map((event) => event[0])).toEqual([true, false])
    expect(wrapper.emitted('close')?.[0]).toEqual(['escaped'])
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('should open it again when the parent refuses to close (v-model not updated)', async () => {
    const wrapper = mountModal({ modelValue: true })

    ;(wrapper.element as HTMLDialogElement).close('x')
    await nextTick()
    await nextTick()

    expect(env.showModal).toHaveBeenCalledTimes(2)
    expect((wrapper.element as HTMLDialogElement).open).toBe(true)
  })

  it('should ask to close with the close button, and the cancel event can refuse', async () => {
    const wrapper = mountModal({ modelValue: true, title: 'T' })

    wrapper.element.addEventListener('cancel', (event) => event.preventDefault())
    await wrapper.find('.modal-close').trigger('click')

    expect((wrapper.element as HTMLDialogElement).open).toBe(true)
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('should close with the close button when nothing refuses', async () => {
    const wrapper = mountModal({ modelValue: true, title: 'T', closeLabel: 'Fermer' })

    expect(wrapper.find('.modal-close').attributes('aria-label')).toBe('Fermer')

    await wrapper.find('.modal-close').trigger('click')
    await nextTick()

    expect(wrapper.emitted('close')).toBeDefined()
  })

  it('should hide the close button when asked', () => {
    expect(mountModal({ closeButton: false }).find('.modal-close').exists()).toBe(false)
  })

  it('should be an alertdialog when it is an alert', () => {
    expect(mountModal({ alert: true }).attributes('role')).toBe('alertdialog')
  })

  it('should use the header and close slots and give the footer a close function', async () => {
    const wrapper = mountModal(
      { modelValue: true },
      {
        header: 'Custom head',
        close: 'X',
        footer: '<template #footer="{ close }"><button class="inner" @click="close(\'ok\')">Done</button></template>',
      }
    )

    expect(wrapper.find('.modal-title').text()).toBe('Custom head')
    expect(wrapper.find('.modal-close').text()).toBe('X')

    await wrapper.find('.inner').trigger('click')
    await nextTick()

    expect(wrapper.emitted('close')?.[0]).toEqual(['ok'])
  })

  it('should keep the dialog open when closedby is none and the browser has no support for it', async () => {
    setSupport({ dialogClosedBy: false })
    const wrapper = mountModal({ modelValue: true, closedby: 'none' })
    const event = new Event('cancel', { cancelable: true })

    wrapper.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.attributes('closedby')).toBeUndefined()
  })

  it('should let the browser handle closedby none when it supports it', () => {
    const wrapper = mountModal({ modelValue: true, closedby: 'none' })
    const event = new Event('cancel', { cancelable: true })

    wrapper.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(false)
    expect(wrapper.attributes('closedby')).toBe('none')
  })

  it('should close on a click outside when closedby is any and the browser cannot do it', async () => {
    setSupport({ dialogClosedBy: false })
    const wrapper = mountModal({ closedby: 'any' })

    ;(wrapper.vm as unknown as { show: () => void }).show()
    await nextTick()
    await nextTick()

    const content = wrapper.find('.modal-content').element

    content.getBoundingClientRect = () => ({ left: 100, right: 200, top: 100, bottom: 200 }) as DOMRect

    await wrapper.trigger('click', { clientX: 10, clientY: 10 })
    await nextTick()

    expect((wrapper.element as HTMLDialogElement).open).toBe(false)
  })

  it('should not close on a click inside the content, on a child or with closedby other than any', async () => {
    setSupport({ dialogClosedBy: false })
    const wrapper = mountModal({ modelValue: true, closedby: 'any' })

    wrapper.find('.modal-content').element.getBoundingClientRect = () =>
      ({ left: 0, right: 500, top: 0, bottom: 500 }) as DOMRect

    await wrapper.trigger('click', { clientX: 50, clientY: 50 })
    await wrapper.find('.modal-body').trigger('click')

    expect((wrapper.element as HTMLDialogElement).open).toBe(true)

    await wrapper.setProps({ closedby: 'closerequest' })
    await wrapper.trigger('click', { clientX: 900, clientY: 900 })

    expect((wrapper.element as HTMLDialogElement).open).toBe(true)
  })

  it('should leave the click outside to the browser when it supports closedby', async () => {
    const wrapper = mountModal({ modelValue: true, closedby: 'any' })

    await wrapper.trigger('click', { clientX: 900, clientY: 900 })

    expect((wrapper.element as HTMLDialogElement).open).toBe(true)
  })

  it('should dispatch its own cancel and close without requestClose support', async () => {
    delete (HTMLDialogElement.prototype as unknown as Record<string, unknown>)['requestClose']
    setSupport({ dialogRequestClose: false })
    const wrapper = mountModal({ title: 'T' })

    ;(wrapper.vm as unknown as { show: () => void }).show()
    await nextTick()
    await nextTick()

    await wrapper.find('.modal-close').trigger('click')
    await nextTick()

    expect(wrapper.emitted('cancel')).toHaveLength(1)
    expect((wrapper.element as HTMLDialogElement).open).toBe(false)
  })

  it('should keep the state in a query parameter of the URL', async () => {
    const wrapper = mountModal({ queryParam: 'login' })

    ;(wrapper.vm as unknown as { show: () => void }).show()
    await nextTick()

    expect(window.location.search).toBe('?login=1')

    ;(wrapper.vm as unknown as { close: () => void }).close()
    await nextTick()

    expect(window.location.search).toBe('')
  })

  it('should open from the URL', () => {
    window.history.replaceState(null, '', '/?login=1')
    mountModal({ queryParam: 'login' })

    expect(env.showModal).toHaveBeenCalledTimes(1)
  })

  it('should follow a v-model', async () => {
    const open = ref(false)
    const wrapper = mount(
      defineComponent({
        render: () =>
          h(
            Modal,
            { modelValue: open.value, 'onUpdate:modelValue': (value: boolean) => (open.value = value) },
            () => 'Body'
          ),
      }),
      { attachTo: document.body }
    )

    open.value = true
    await nextTick()
    await nextTick()
    expect(env.showModal).toHaveBeenCalledTimes(1)

    ;(wrapper.find('dialog').element as HTMLDialogElement).close()
    await nextTick()
    await nextTick()
    expect(open.value).toBe(false)
  })

  it('should unlock the scroll when it is unmounted while open', () => {
    const wrapper = mountModal({ modelValue: true })

    expect(document.documentElement.style.overflow).toBe('hidden')

    wrapper.unmount()

    expect(document.documentElement.style.overflow).toBe('')
  })

  it('should validate the closedby values', () => {
    const { closedby } = (Modal as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(closedby.validator('any')).toBe(true)
    expect(closedby.validator('x')).toBe(false)
  })
})

describe('OverlayModal without the dialog element', () => {
  beforeEach(() => {
    setSupport({ dialog: false })
    document.documentElement.style.overflow = ''
  })

  afterEach(() => resetSupport())

  const mountModal = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const wrapper = mount(Modal, { props, slots, attachTo: document.body })

    mounted.push(wrapper)

    return wrapper
  }

  const key = async (wrapper: ReturnType<typeof mountModal>, name: string, options: KeyboardEventInit = {}) => {
    wrapper.element.dispatchEvent(
      new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...options })
    )
    await nextTick()
    await nextTick()
  }

  it('should render a hidden dialog role div that covers the page', () => {
    const wrapper = mountModal({ title: 'T' })

    expect(wrapper.element.tagName).toBe('DIV')
    expect(wrapper.attributes('role')).toBe('dialog')
    expect(wrapper.attributes('aria-modal')).toBe('true')
    expect(wrapper.attributes('data-fallback')).toBeDefined()
    expect(wrapper.attributes('closedby')).toBeUndefined()
    expect((wrapper.element as HTMLElement).hidden).toBe(true)
    expect(wrapper.attributes('style')).toContain('position: fixed')
  })

  it('should not say it is modal when it is not', () => {
    expect(mountModal({ modal: false }).attributes('aria-modal')).toBeUndefined()
  })

  it('should show, lock the scroll, focus inside and close with the focus returned', async () => {
    const opener = document.createElement('button')

    document.body.append(opener)
    opener.focus()

    const wrapper = mountModal({ modelValue: false, title: 'T' }, { default: '<input id="first" />' })

    await wrapper.setProps({ modelValue: true })

    expect((wrapper.element as HTMLElement).hidden).toBe(false)
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.activeElement).toBe(wrapper.find('.modal-close').element)

    await wrapper.setProps({ modelValue: false })

    expect((wrapper.element as HTMLElement).hidden).toBe(true)
    expect(document.documentElement.style.overflow).toBe('')
    expect(document.activeElement).toBe(opener)
    expect(wrapper.emitted('close')).toBeDefined()
  })

  it('should focus the dialog itself when there is nothing to focus', async () => {
    const wrapper = mountModal({ closeButton: false })

    await wrapper.setProps({ modelValue: true })

    expect(document.activeElement).toBe(wrapper.element)
  })

  it('should close with Escape unless closedby is none', async () => {
    const wrapper = mountModal({ modelValue: true })

    await key(wrapper, 'Escape')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])

    const locked = mountModal({ modelValue: true, closedby: 'none' })

    await key(locked, 'Escape')
    expect(locked.emitted('update:modelValue')).toBeUndefined()
  })

  it('should let a cancel listener refuse the Escape', async () => {
    const wrapper = mountModal({ modelValue: true })

    wrapper.element.addEventListener('cancel', (event) => event.preventDefault())
    await key(wrapper, 'Escape')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should trap the focus with Tab and Shift+Tab', async () => {
    const wrapper = mountModal(
      { modelValue: true, title: 'T' },
      { default: '<button id="b1">One</button>', footer: '<button id="b2">Two</button>' }
    )
    const close = wrapper.find('.modal-close').element as HTMLElement
    const last = wrapper.find('#b2').element as HTMLElement

    last.focus()
    await key(wrapper, 'Tab')
    expect(document.activeElement).toBe(close)

    close.focus()
    await key(wrapper, 'Tab', { shiftKey: true })
    expect(document.activeElement).toBe(last)

    wrapper.find('#b1').element instanceof HTMLElement && (wrapper.find('#b1').element as HTMLElement).focus()
    await key(wrapper, 'Tab')
    expect(document.activeElement).toBe(wrapper.find('#b1').element)
  })

  it('should not trap the focus when there is nothing to focus and ignore the other keys', async () => {
    const wrapper = mountModal({ modelValue: true, closeButton: false })

    await key(wrapper, 'Tab')
    await key(wrapper, 'a')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
  })

  it('should close on a click outside the content when closedby is any', async () => {
    const wrapper = mountModal({ modelValue: true, closedby: 'any' })

    wrapper.find('.modal-content').element.getBoundingClientRect = () =>
      ({ left: 100, right: 200, top: 100, bottom: 200 }) as DOMRect

    await wrapper.trigger('click', { clientX: 5, clientY: 5 })
    await nextTick()

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('should store the return value of a close', async () => {
    const wrapper = mountModal({ modelValue: true })

    ;(wrapper.vm as unknown as { close: (value: string) => void }).close('answer')
    await nextTick()

    expect((wrapper.element as unknown as { returnValue: string }).returnValue).toBe('answer')
  })

  it('should close without a return value', async () => {
    const wrapper = mountModal({ modelValue: true })

    ;(wrapper.vm as unknown as { close: () => void }).close()
    await nextTick()

    expect((wrapper.element as unknown as { returnValue: string }).returnValue).toBe('')
  })

  it('should be mounted open', () => {
    const wrapper = mountModal({ modelValue: true })

    expect((wrapper.element as HTMLElement).hidden).toBe(false)
  })
})

describe('OverlayModal on the server', () => {
  it('should render the dialog element when there is no document to detect from', async () => {
    const { renderToString } = await import('vue/server-renderer')
    const { createSSRApp } = await import('vue')

    vi.stubGlobal('document', undefined)

    try {
      const html = await renderToString(createSSRApp({ render: () => h(Modal, { title: 'T' }, () => 'Body') }))

      expect(html).toContain('<dialog')
    } finally {
      vi.unstubAllGlobals()
    }
  })
})
