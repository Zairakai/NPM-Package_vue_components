import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useToast } from '../../src/composables/useToast'
import ToastContainer from '../../src/Feedback/ToastContainer.vue'

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    useToast().clear()
    vi.useRealTimers()
  })

  it('should add a toast with its defaults and remove it after the duration', () => {
    const { add, toasts } = useToast()
    const id = add({ message: 'Hello' })

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({ id, message: 'Hello', variant: 'default', duration: 5000, dismissible: true })

    vi.advanceTimersByTime(5000)

    expect(toasts.value).toHaveLength(0)
  })

  it('should keep a toast without duration until it is removed', () => {
    const { add, remove, toasts } = useToast()
    const id = add({ message: 'Sticky', duration: 0 })

    vi.advanceTimersByTime(60000)

    expect(toasts.value).toHaveLength(1)

    remove(id)

    expect(toasts.value).toHaveLength(0)
  })

  it('should have a shortcut per variant', () => {
    const { info, success, warning, error, toasts } = useToast()

    info('i', { title: 'Info' })
    success('s')
    warning('w')
    error('e', { dismissible: false })

    expect(toasts.value.map((toast) => toast.variant)).toEqual(['info', 'success', 'warning', 'error'])
    expect(toasts.value[0].title).toBe('Info')
    expect(toasts.value[3].dismissible).toBe(false)
  })

  it('should pause and resume the countdown with the time that was left', () => {
    const { add, pause, resume, toasts } = useToast()
    const id = add({ message: 'Slow', duration: 1000 })

    vi.advanceTimersByTime(400)
    pause(id)
    vi.advanceTimersByTime(5000)

    expect(toasts.value).toHaveLength(1)

    resume(id)
    vi.advanceTimersByTime(599)

    expect(toasts.value).toHaveLength(1)

    vi.advanceTimersByTime(2)

    expect(toasts.value).toHaveLength(0)
  })

  it('should ignore pause and resume on an unknown or sticky toast', () => {
    const { add, pause, resume, toasts } = useToast()
    const sticky = add({ message: 'Sticky', duration: 0 })

    pause(999)
    resume(999)
    pause(sticky)
    resume(sticky)

    expect(toasts.value).toHaveLength(1)
  })

  it('should clear every toast', () => {
    const { add, clear, toasts } = useToast()

    add({ message: 'a' })
    add({ message: 'b', duration: 0 })
    clear()

    expect(toasts.value).toHaveLength(0)
  })
})

describe('FeedbackToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    useToast().clear()
    vi.useRealTimers()
  })

  it('should render a labelled region fixed in its corner', () => {
    const wrapper = mount(ToastContainer, { props: { id: 't', class: 'x' } })

    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-label')).toBe('Notifications')
    expect(wrapper.attributes('data-position')).toBe('top-right')
    expect(wrapper.classes()).toEqual(['toast-container', 'x'])
    expect(wrapper.attributes('id')).toBe('t')
    expect(wrapper.attributes('style')).toContain('position: fixed')
    expect(wrapper.attributes('style')).toContain('top: 1rem')
    expect(wrapper.attributes('style')).toContain('right: 1rem')
  })

  it('should center the container horizontally', () => {
    const wrapper = mount(ToastContainer, { props: { position: 'bottom-center' } })

    expect(wrapper.attributes('style')).toContain('bottom: 1rem')
    expect(wrapper.attributes('style')).toContain('left: 50%')
  })

  it('should list the toasts and close one', async () => {
    const wrapper = mount(ToastContainer)
    const { add, error } = useToast()

    add({ message: 'Done', title: 'Saved', variant: 'success' })
    error('Broken')
    await wrapper.vm.$nextTick()

    const toasts = wrapper.findAll('.toast')

    expect(toasts).toHaveLength(2)
    expect(toasts[0].attributes('role')).toBe('status')
    expect(toasts[0].attributes('data-variant')).toBe('success')
    expect(toasts[0].find('.toast-title').text()).toBe('Saved')
    expect(toasts[1].attributes('role')).toBe('alert')
    expect(toasts[1].find('.toast-title').exists()).toBe(false)

    await toasts[0].find('.toast-close').trigger('click')

    expect(wrapper.findAll('.toast')).toHaveLength(1)
  })

  it('should not render a close button for a toast that is not dismissible', async () => {
    const wrapper = mount(ToastContainer)

    useToast().add({ message: 'Locked', dismissible: false })
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.toast-close').exists()).toBe(false)
  })

  it('should pause the countdown on hover and focus and resume afterwards', async () => {
    const wrapper = mount(ToastContainer)

    useToast().add({ message: 'Hover me', duration: 1000 })
    await wrapper.vm.$nextTick()

    const toast = wrapper.find('.toast')

    await toast.trigger('mouseenter')
    vi.advanceTimersByTime(3000)
    expect(wrapper.findAll('.toast')).toHaveLength(1)

    await toast.trigger('mouseleave')
    vi.advanceTimersByTime(1001)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(0)

    useToast().add({ message: 'Focus me', duration: 1000 })
    await wrapper.vm.$nextTick()

    const focused = wrapper.find('.toast')

    await focused.trigger('focusin')
    vi.advanceTimersByTime(3000)
    expect(wrapper.findAll('.toast')).toHaveLength(1)

    await focused.trigger('focusout')
    vi.advanceTimersByTime(1001)
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.toast')).toHaveLength(0)
  })

  it('should validate the position', () => {
    const { position } = (ToastContainer as unknown as { props: Record<string, { validator: (v: string) => boolean }> }).props

    expect(position.validator('top-left')).toBe(true)
    expect(position.validator('middle')).toBe(false)
  })
})
