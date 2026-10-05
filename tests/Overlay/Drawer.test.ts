import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Drawer from '../../src/Overlay/Drawer.vue'
import { installDialog } from './dialog-env'

const mounted: Array<{ unmount: () => void }> = []

afterEach(() => {
  mounted.splice(0).forEach((wrapper) => wrapper.unmount())
  document.documentElement.style.overflow = ''
})

describe('OverlayDrawer', () => {
  let env: ReturnType<typeof installDialog>

  beforeEach(() => {
    env = installDialog({ requestClose: true, closedBy: true })
    setSupport({ dialog: true, dialogClosedBy: true, dialogRequestClose: true })
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  const mountDrawer = (props: Record<string, unknown> = {}, slots: Record<string, string> = {}) => {
    const wrapper = mount(Drawer, { props, slots, attachTo: document.body })

    mounted.push(wrapper)

    return wrapper
  }

  it('should render a modal on the right with the placement as data and a light dismiss by default', () => {
    const wrapper = mountDrawer({ title: 'Menu', class: 'x', id: 'd' }, { default: 'Content' })

    expect(wrapper.element.tagName).toBe('DIALOG')
    expect(wrapper.classes()).toContain('drawer')
    expect(wrapper.classes()).toContain('x')
    expect(wrapper.attributes('data-placement')).toBe('right')
    expect(wrapper.attributes('closedby')).toBe('any')
    expect(wrapper.attributes('id')).toBe('d')
    expect(wrapper.find('.modal-body').text()).toBe('Content')
    expect(wrapper.attributes('style')).toContain('margin: 0px 0px 0px auto')
    expect(wrapper.attributes('style')).toContain('var(--zk-drawer-size, 24rem)')
  })

  it('should stick to each edge', () => {
    expect(mountDrawer({ placement: 'left' }).attributes('style')).toContain('margin: 0px auto 0px 0px')
    expect(mountDrawer({ placement: 'top' }).attributes('style')).toContain('margin: 0px 0px auto')
    expect(mountDrawer({ placement: 'bottom' }).attributes('style')).toContain('margin: auto 0px 0px')
  })

  it('should open and close with the model and pass the events', async () => {
    const wrapper = mountDrawer({ modelValue: false })

    await wrapper.setProps({ modelValue: true })

    expect(env.showModal).toHaveBeenCalledTimes(1)
    expect(wrapper.emitted('open')).toHaveLength(1)

    ;(wrapper.element as HTMLDialogElement).close('x')
    await nextTick()
    await nextTick()

    expect(wrapper.emitted('close')?.[0]).toEqual(['x'])
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([false])
  })

  it('should pass the cancel event', async () => {
    const wrapper = mountDrawer({ modelValue: true, title: 'T' })

    await wrapper.find('.modal-close').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('should pass the header and footer slots and the close label', () => {
    const wrapper = mountDrawer(
      { closeLabel: 'Fermer', title: 'T' },
      { header: 'Head', footer: '<button class="f">Go</button>' }
    )

    expect(wrapper.find('.modal-title').text()).toBe('Head')
    expect(wrapper.find('.modal-footer .f').exists()).toBe(true)
    expect(wrapper.find('.modal-close').attributes('aria-label')).toBe('Fermer')
  })

  it('should not render the header and footer slots that were not given', () => {
    const wrapper = mountDrawer()

    expect(wrapper.find('.modal-footer').exists()).toBe(false)
    expect(wrapper.find('.modal-title').exists()).toBe(false)
  })

  it('should keep its open state in the URL', async () => {
    window.history.replaceState(null, '', '/')
    const wrapper = mountDrawer({ queryParam: 'menu' })

    ;(
      wrapper.findComponent({ name: 'OverlayModal' }).vm.$ as unknown as { exposed: { show: () => void } }
    ).exposed.show()
    await nextTick()

    expect(window.location.search).toBe('?menu=1')
    window.history.replaceState(null, '', '/')
  })

  it('should validate the placement and the closedby', () => {
    const { placement, closedby } = (
      Drawer as unknown as { props: Record<string, { validator: (v: string) => boolean }> }
    ).props

    expect(placement.validator('bottom')).toBe(true)
    expect(placement.validator('middle')).toBe(false)
    expect(closedby.validator('none')).toBe(true)
    expect(closedby.validator('x')).toBe(false)
  })
})
