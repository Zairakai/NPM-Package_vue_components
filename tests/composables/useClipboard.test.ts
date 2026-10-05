import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { useClipboard } from '../../src/composables/useClipboard'
import { resetSupport, setSupport } from '../../src/composables/useSupport'

function setup(timeout?: number) {
  let api!: ReturnType<typeof useClipboard>
  const wrapper = mount(
    defineComponent({
      setup() {
        api = useClipboard(timeout)

        return () => h('div')
      },
    })
  )

  return { api, wrapper }
}

describe('useClipboard', () => {
  beforeEach(() => vi.useFakeTimers())

  afterEach(() => {
    vi.useRealTimers()
    resetSupport()
    vi.unstubAllGlobals()
    delete (document as unknown as { execCommand?: unknown }).execCommand
  })

  it('should use the Clipboard API and show a confirmation that goes away', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', { clipboard: { writeText } })
    setSupport({ clipboard: true })
    const { api } = setup(1000)

    expect(await api.copy('hello')).toBe(true)
    expect(writeText).toHaveBeenCalledWith('hello')
    expect(api.copied.value).toBe(true)

    vi.advanceTimersByTime(1001)

    expect(api.copied.value).toBe(false)
  })

  it('should restart the confirmation when copying again', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    setSupport({ clipboard: true })
    const { api } = setup(1000)

    await api.copy('a')
    vi.advanceTimersByTime(800)
    await api.copy('b')
    vi.advanceTimersByTime(800)

    expect(api.copied.value).toBe(true)
  })

  it('should fall back to a hidden textarea without the Clipboard API', async () => {
    const execCommand = vi.fn().mockReturnValue(true)

    ;(document as unknown as { execCommand: unknown }).execCommand = execCommand
    setSupport({ clipboard: false })
    const { api } = setup()

    expect(await api.copy('legacy')).toBe(true)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(document.querySelector('textarea')).toBeNull()
    expect(api.copied.value).toBe(true)
  })

  it('should fall back when the Clipboard API refuses', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) } })
    ;(document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(true)
    setSupport({ clipboard: true })
    const { api } = setup()

    expect(await api.copy('x')).toBe(true)
  })

  it('should report a failure and not show a confirmation', async () => {
    ;(document as unknown as { execCommand: unknown }).execCommand = vi.fn().mockReturnValue(false)
    setSupport({ clipboard: false })
    const { api } = setup()

    expect(await api.copy('x')).toBe(false)
    expect(api.copied.value).toBe(false)
  })

  it('should stop the timer when it is removed', async () => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    setSupport({ clipboard: true })
    const { api, wrapper } = setup()

    await api.copy('x')
    wrapper.unmount()
    vi.advanceTimersByTime(5000)

    expect(api.copied.value).toBe(true)
  })
})
