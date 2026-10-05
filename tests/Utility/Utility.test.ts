import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import { isoDuration, remaining, toTime } from '../../src/Utility/countdown'
import Countdown from '../../src/Utility/Countdown.vue'
import ShareButton from '../../src/Utility/ShareButton.vue'
import { isThemeMode, resolveTheme } from '../../src/Utility/theme'
import ThemeSwitcher from '../../src/Utility/ThemeSwitcher.vue'

afterEach(() => {
  document.body.innerHTML = ''
  window.localStorage.clear()
})

describe('theme helpers', () => {
  it('should resolve the theme of a mode', () => {
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('dark', false)).toBe('dark')
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
    expect(isThemeMode('dark')).toBe(true)
    expect(isThemeMode('blue')).toBe(false)
  })
})

describe('UtilityThemeSwitcher', () => {
  let listeners: Array<(event: { matches: boolean }) => void>
  const mockPreference = (matches: boolean) => {
    listeners = []
    window.matchMedia = vi.fn().mockReturnValue({
      matches,
      addEventListener: (_name: string, handler: (event: { matches: boolean }) => void) => listeners.push(handler),
      removeEventListener: vi.fn(),
    }) as unknown as typeof window.matchMedia
  }

  beforeEach(() => {
    mockPreference(false)
    document.documentElement.removeAttribute('data-theme')
  })

  it('should render the modes as toggle buttons and apply the system theme', async () => {
    const wrapper = mount(ThemeSwitcher, { props: { id: 't', class: 'x' }, attachTo: document.body })

    await nextTick()
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Theme')
    expect(wrapper.findAll('button').map((button) => button.text())).toEqual(['Light', 'Dark', 'System'])
    expect(wrapper.findAll('button')[2].attributes('aria-pressed')).toBe('true')
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    expect(wrapper.attributes('data-theme-applied')).toBe('light')
  })

  it('should choose a mode, apply it, emit it and remember it', async () => {
    const wrapper = mount(ThemeSwitcher, { attachTo: document.body })

    await wrapper.find('[data-mode="dark"]').trigger('click')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.colorScheme).toBe('dark')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['dark'])
    expect(wrapper.emitted('change')?.at(-1)).toEqual(['dark'])
    expect(window.localStorage.getItem('zk-theme')).toBe('dark')
  })

  it('should start from what was remembered and ignore a wrong value', () => {
    window.localStorage.setItem('zk-theme', 'dark')
    expect(
      mount(ThemeSwitcher, { attachTo: document.body }).find('[data-mode="dark"]').attributes('aria-pressed')
    ).toBe('true')
    window.localStorage.setItem('zk-theme', 'blue')
    expect(
      mount(ThemeSwitcher, { attachTo: document.body }).find('[data-mode="system"]').attributes('aria-pressed')
    ).toBe('true')
  })

  it('should follow the preference of the system while in system mode', async () => {
    mockPreference(true)
    const wrapper = mount(ThemeSwitcher, { attachTo: document.body })

    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    listeners[0]({ matches: false })
    await nextTick()
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
    wrapper.unmount()
  })

  it('should not remember anywhere without a key, use another attribute, and work without matchMedia', async () => {
    const wrapper = mount(ThemeSwitcher, {
      props: { storageKey: '', attribute: 'data-mode', modelValue: 'light' },
      attachTo: document.body,
    })

    await nextTick()
    await wrapper.find('[data-mode="dark"]').trigger('click')
    expect(window.localStorage.length).toBe(0)
    expect(document.documentElement.getAttribute('data-mode')).toBe('light')
    document.documentElement.removeAttribute('data-mode')
    ;(window as unknown as { matchMedia?: unknown }).matchMedia = undefined
    mount(ThemeSwitcher, { attachTo: document.body })
    await nextTick()
  })

  it('should survive a blocked storage and render the mode slots', async () => {
    const get = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const set = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const wrapper = mount(ThemeSwitcher, { slots: { dark: 'Night' }, attachTo: document.body })

    await wrapper.find('[data-mode="dark"]').trigger('click')
    expect(wrapper.find('[data-mode="dark"]').text()).toBe('Night')
    expect(wrapper.find('[data-mode="dark"]').attributes('aria-pressed')).toBe('true')
    get.mockRestore()
    set.mockRestore()
  })
})

describe('countdown helpers', () => {
  it('should split what is left in days, hours, minutes and seconds', () => {
    const value = remaining(1000 * (86400 + 3600 * 2 + 60 * 3 + 4), 0)

    expect(value).toEqual({ total: 93784, days: 1, hours: 2, minutes: 3, seconds: 4 })
    expect(remaining(0, 5000).total).toBe(0)
    expect(remaining(1500, 0).total).toBe(1)
  })

  it('should write an ISO duration and read a target', () => {
    expect(isoDuration(remaining(1000 * (86400 + 3600 * 2 + 60 * 3 + 4), 0))).toBe('P1DT2H3M4S')
    expect(isoDuration(remaining(5000, 0))).toBe('PT0H0M5S')
    expect(toTime(new Date(5))).toBe(5)
    expect(toTime(7)).toBe(7)
    expect(toTime('1970-01-01T00:00:01Z')).toBe(1000)
    expect(Number.isNaN(toTime('nope'))).toBe(true)
  })
})

describe('UtilityCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('should show what is left in a time element and tick', async () => {
    const wrapper = mount(Countdown, { props: { target: new Date('2026-10-05T10:01:05Z'), id: 'c', class: 'x' } })

    expect(wrapper.element.tagName).toBe('TIME')
    expect(wrapper.attributes('role')).toBe('timer')
    expect(wrapper.attributes('aria-live')).toBe('off')
    expect(wrapper.attributes('datetime')).toBe('PT0H1M5S')
    expect(wrapper.findAll('.countdown-part').map((part) => part.text())).toEqual(['00h', '01m', '05s'])
    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.find('[data-unit="seconds"]').text()).toBe('03s')
    expect(wrapper.emitted('tick')).toHaveLength(2)
  })

  it('should show the days when there are some or when asked, with other units', () => {
    const wrapper = mount(Countdown, {
      props: { target: '2026-10-07T10:00:00Z', units: { days: ' days', hours: ':', minutes: ':', seconds: '' } },
    })

    expect(wrapper.find('[data-unit="days"]').text()).toBe('2 days')
    expect(
      mount(Countdown, { props: { target: '2026-10-05T11:00:00Z' } })
        .find('[data-unit="days"]')
        .exists()
    ).toBe(false)
    expect(
      mount(Countdown, { props: { target: '2026-10-05T11:00:00Z', showDays: true } })
        .find('[data-unit="days"]')
        .text()
    ).toBe('0d')
  })

  it('should finish once and stop', async () => {
    const wrapper = mount(Countdown, { props: { target: Date.now() + 2000 } })

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('finished')).toHaveLength(1)
    expect(wrapper.attributes('data-finished')).toBeDefined()
    expect(wrapper.attributes('datetime')).toBe('PT0H0M0S')
    const ticks = wrapper.emitted('tick')?.length

    await vi.advanceTimersByTimeAsync(5000)
    expect(wrapper.emitted('tick')).toHaveLength(ticks as number)
  })

  it('should be finished at once for a target in the past, and start again with a new target', async () => {
    const wrapper = mount(Countdown, { props: { target: Date.now() - 1000 } })

    expect(wrapper.emitted('finished')).toHaveLength(1)
    await wrapper.setProps({ target: Date.now() + 3000 })
    expect(wrapper.attributes('data-finished')).toBeUndefined()
    await vi.advanceTimersByTimeAsync(4000)
    expect(wrapper.emitted('finished')).toHaveLength(2)
  })

  it('should render the default slot with the remaining time and stop when removed', async () => {
    const wrapper = mount(Countdown, {
      props: { target: Date.now() + 90_000 },
      slots: { default: '<template #default="{ minutes, seconds }">{{ minutes }}:{{ seconds }}</template>' },
    })

    expect(wrapper.text()).toBe('1:30')
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)
  })
})

describe('UtilityShareButton', () => {
  afterEach(() => {
    resetSupport()
    vi.unstubAllGlobals()
  })

  it('should use the share sheet of the system', async () => {
    const share = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', { share, canShare: () => true })
    setSupport({ share: true })
    const wrapper = mount(ShareButton, { props: { title: 'T', text: 'X', url: '/page', id: 's', class: 'x' } })

    expect(wrapper.text()).toBe('Share')
    await wrapper.trigger('click')
    expect(share).toHaveBeenCalledWith({ title: 'T', text: 'X', url: '/page' })
    expect(wrapper.emitted('share')).toHaveLength(1)
  })

  it('should share the current page by default and not fail when the sheet is closed', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('closed'), { name: 'AbortError' }))

    vi.stubGlobal('navigator', { share })
    setSupport({ share: true })
    const wrapper = mount(ShareButton)

    await wrapper.trigger('click')
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: window.location.href }))
    expect(wrapper.emitted('error')).toBeUndefined()
    expect(wrapper.emitted('share')).toBeUndefined()
  })

  it('should report a real error of the share sheet', async () => {
    vi.stubGlobal('navigator', { share: vi.fn().mockRejectedValue(new Error('boom')) })
    setSupport({ share: true })
    const wrapper = mount(ShareButton)

    await wrapper.trigger('click')
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('should copy the address when the browser cannot share data', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)

    vi.stubGlobal('navigator', { share: vi.fn(), canShare: () => false, clipboard: { writeText } })
    setSupport({ share: true, clipboard: true })
    const wrapper = mount(ShareButton, { props: { url: '/page', copiedLabel: 'Done' } })

    await wrapper.trigger('click')
    await nextTick()
    expect(writeText).toHaveBeenCalledWith('/page')
    expect(wrapper.emitted('copy')?.[0]).toEqual(['/page'])
    expect(wrapper.attributes('data-copied')).toBeDefined()
    expect(wrapper.find('[role="status"]').text()).toBe('Done')
  })

  it('should report when nothing worked', async () => {
    vi.stubGlobal('navigator', {})
    setSupport({ share: false, clipboard: false })
    document.execCommand = vi.fn().mockReturnValue(false)
    const wrapper = mount(ShareButton, { props: { url: '/page' } })

    await wrapper.trigger('click')
    expect(wrapper.emitted('error')).toHaveLength(1)
  })
})
