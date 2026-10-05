import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import Carousel from '../../src/Medias/Carousel.vue'
import LazyImage from '../../src/Medias/LazyImage.vue'
import Lightbox from '../../src/Medias/Lightbox.vue'
import Player from '../../src/Medias/Player.vue'
import { installDialog } from '../Overlay/dialog-env'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('MediaLazyImage', () => {
  it('should be lazy and async by default and keep the size', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: '/a.jpg',
        alt: 'A',
        width: 100,
        height: 50,
        srcset: '/a2.jpg 2x',
        sizes: '50vw',
        id: 'i',
        class: 'x',
      },
    })
    const img = wrapper.find('img')

    expect(wrapper.classes()).toEqual(['lazy-image', 'x'])
    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(img.attributes('loading')).toBe('lazy')
    expect(img.attributes('decoding')).toBe('async')
    expect(img.attributes('width')).toBe('100')
    expect(img.attributes('srcset')).toBe('/a2.jpg 2x')
    expect(img.attributes('fetchpriority')).toBeUndefined()
    expect(img.attributes('style')).toContain('object-fit: cover')
  })

  it('should load at once and with a high priority when eager', () => {
    const img = mount(LazyImage, { props: { src: '/a.jpg', alt: 'A', eager: true, fit: 'contain' } }).find('img')

    expect(img.attributes('loading')).toBe('eager')
    expect(img.attributes('fetchpriority')).toBe('high')
    expect(img.attributes('style')).toContain('contain')
  })

  it('should show the placeholder until it is loaded', async () => {
    const wrapper = mount(LazyImage, { props: { src: '/a.jpg', alt: 'A' }, slots: { placeholder: 'wait' } })

    expect(wrapper.find('.lazy-image-placeholder').text()).toBe('wait')
    await wrapper.find('img').trigger('load')
    expect(wrapper.attributes('data-state')).toBe('loaded')
    expect(wrapper.find('.lazy-image-placeholder').exists()).toBe(false)
    expect(wrapper.emitted('load')).toHaveLength(1)
  })

  it('should use the fallback once, then show the error', async () => {
    const wrapper = mount(LazyImage, { props: { src: '/a.jpg', alt: 'A', fallback: '/f.jpg', srcset: '/a2.jpg 2x' } })

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').attributes('src')).toBe('/f.jpg')
    expect(wrapper.find('img').attributes('srcset')).toBeUndefined()
    expect(wrapper.attributes('data-state')).toBe('loading')
    await wrapper.find('img').trigger('error')
    expect(wrapper.attributes('data-state')).toBe('error')
    expect(wrapper.find('.lazy-image-error').attributes('aria-label')).toBe('A')
    expect(wrapper.find('.lazy-image-error').text()).toBe('A')
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('should show the error at once without a fallback, with a slot, and start again with a new source', async () => {
    const wrapper = mount(LazyImage, { props: { src: '/a.jpg', alt: 'A' }, slots: { error: 'Broken' } })

    await wrapper.find('img').trigger('error')
    expect(wrapper.find('.lazy-image-error').text()).toBe('Broken')
    await wrapper.setProps({ src: '/b.jpg' })
    expect(wrapper.attributes('data-state')).toBe('loading')
    expect(wrapper.find('img').attributes('src')).toBe('/b.jpg')
  })
})

describe('MediaCarousel', () => {
  const items = ['one', 'two', 'three']
  const build = (props: Record<string, unknown> = {}) =>
    mount(Carousel, { props: { items, ...props }, attachTo: document.body })

  beforeEach(() => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
    vi.useFakeTimers()
  })

  afterEach(() => vi.useRealTimers())

  it('should render a labelled region of slides with indicators', () => {
    const wrapper = build({ id: 'c', class: 'x', label: 'Photos' })

    expect(wrapper.attributes('role')).toBe('region')
    expect(wrapper.attributes('aria-roledescription')).toBe('carousel')
    expect(wrapper.attributes('aria-label')).toBe('Photos')
    expect(wrapper.findAll('.carousel-slide')).toHaveLength(3)
    expect(wrapper.findAll('.carousel-slide')[1].attributes('aria-label')).toBe('2 of 3')
    expect(wrapper.findAll('.carousel-slide')[0].attributes('aria-roledescription')).toBe('slide')
    expect(wrapper.findAll('.carousel-slide')[0].attributes('data-active')).toBeDefined()
    expect(wrapper.findAll('.carousel-indicator')).toHaveLength(3)
    expect(wrapper.findAll('.carousel-indicator')[0].attributes('aria-current')).toBe('true')
    expect(wrapper.attributes('aria-live')).toBe('polite')
  })

  it('should go to the next and previous slide and loop', async () => {
    const wrapper = build()

    await wrapper.find('.carousel-next').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    await wrapper.find('.carousel-previous').trigger('click')
    await wrapper.find('.carousel-previous').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('should stop at the ends without loop', async () => {
    const wrapper = build({ loop: false })

    expect(wrapper.find('.carousel-previous').attributes('disabled')).toBeDefined()
    await wrapper.find('.carousel-indicator:last-child').trigger('click')
    expect(wrapper.find('.carousel-next').attributes('disabled')).toBeDefined()
    await wrapper.find('.carousel-next').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('should move with the keyboard and with the indicators', async () => {
    const wrapper = build()

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    await wrapper.trigger('keydown', { key: 'End' })
    await wrapper.trigger('keydown', { key: 'Home' })
    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.trigger('keydown', { key: 'x' })
    expect(wrapper.emitted('update:modelValue')?.map((event) => event[0])).toEqual([1, 2, 0, 2])
    await wrapper.findAll('.carousel-indicator')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([1])
  })

  it('should scroll the track to the slide and follow what the visitor scrolls to', async () => {
    const wrapper = build()
    const track = wrapper.find('.carousel-track').element as HTMLElement
    const scrollTo = vi.fn()

    track.scrollTo = scrollTo as unknown as typeof track.scrollTo
    await wrapper.find('.carousel-next').trigger('click')
    expect(scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }))
    Object.defineProperty(track, 'clientWidth', { value: 200, configurable: true })
    track.scrollLeft = 400
    await wrapper.find('.carousel-track').trigger('scroll')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    track.scrollLeft = 9999
    await wrapper.find('.carousel-track').trigger('scroll')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
  })

  it('should move on by itself, pause on hover and focus, and stop when removed', async () => {
    const wrapper = build({ autoplay: 1000 })

    expect(wrapper.attributes('aria-live')).toBe('off')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1])
    await wrapper.trigger('mouseenter')
    expect(wrapper.attributes('aria-live')).toBe('polite')
    await vi.advanceTimersByTimeAsync(3000)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await wrapper.trigger('mouseleave')
    await wrapper.trigger('focusin')
    await wrapper.trigger('focusout')
    await vi.advanceTimersByTimeAsync(1000)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
    wrapper.unmount()
    await vi.advanceTimersByTimeAsync(5000)
  })

  it('should not move on by itself when the visitor prefers less motion, and react to a new autoplay', async () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia
    const wrapper = build({ autoplay: 500 })

    await vi.advanceTimersByTimeAsync(2000)
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia
    await wrapper.setProps({ autoplay: 500 })
    await wrapper.setProps({ autoplay: 600 })
    await vi.advanceTimersByTimeAsync(600)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
  })

  it('should render the item slot, hide the indicators and handle no items', () => {
    const wrapper = mount(Carousel, {
      props: { items, indicators: false },
      slots: { item: '<template #item="{ item, active }">{{ item }}:{{ active }}</template>' },
    })

    expect(wrapper.findAll('.carousel-slide')[0].text()).toBe('one:true')
    expect(wrapper.find('.carousel-indicators').exists()).toBe(false)
    const empty = mount(Carousel)

    return empty
      .find('.carousel-next')
      .trigger('click')
      .then(() => expect(empty.emitted('update:modelValue')).toBeUndefined())
  })
})

describe('MediaLightbox', () => {
  let env: ReturnType<typeof installDialog>
  const items = [
    { src: '/a.jpg', alt: 'A', caption: 'First', thumbnail: '/a-t.jpg' },
    { src: '/b.jpg', alt: 'B', srcset: '/b2.jpg 2x' },
    { src: '/c.jpg', alt: 'C' },
  ]

  beforeEach(() => {
    env = installDialog({ requestClose: true, closedBy: true })
    setSupport({ dialog: true, dialogClosedBy: true, dialogRequestClose: true })
  })

  afterEach(() => {
    env.restore()
    resetSupport()
  })

  const build = (props: Record<string, unknown> = {}) =>
    mount(Lightbox, { props: { items, ...props }, attachTo: document.body })

  it('should list the thumbnails as buttons', () => {
    const wrapper = build({ id: 'l', class: 'x' })

    expect(wrapper.findAll('.lightbox-thumbnail')).toHaveLength(3)
    expect(wrapper.findAll('.lightbox-thumbnail')[0].attributes('aria-label')).toBe('View A')
    expect(wrapper.find('.lightbox-thumbnail img').attributes('src')).toBe('/a-t.jpg')
    expect(wrapper.findAll('.lightbox-thumbnail img')[1].attributes('src')).toBe('/b.jpg')
    expect(build({ thumbnails: false }).find('.lightbox-thumbnails').exists()).toBe(false)
  })

  it('should open the large view on the image that was chosen', async () => {
    const wrapper = build()

    await wrapper.findAll('.lightbox-thumbnail')[1].trigger('click')
    await nextTick()
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([true])
    expect(wrapper.emitted('update:index')?.[0]).toEqual([1])
    expect(wrapper.find('.lightbox-image').attributes('src')).toBe('/b.jpg')
    expect(wrapper.find('.lightbox-image').attributes('srcset')).toBe('/b2.jpg 2x')
    expect(wrapper.find('.lightbox-counter').text()).toBe('2 / 3')
  })

  it('should show the caption and move with the buttons, looping', async () => {
    const wrapper = build({ modelValue: true })

    expect(wrapper.find('.lightbox-caption').text()).toBe('First')
    await wrapper.find('.lightbox-previous').trigger('click')
    expect(wrapper.emitted('update:index')?.[0]).toEqual([2])
    await wrapper.find('.lightbox-next').trigger('click')
    expect(wrapper.emitted('update:index')?.[1]).toEqual([0])
  })

  it('should move with the keyboard', async () => {
    const wrapper = build({ modelValue: true, index: 1 })

    await wrapper.find('.lightbox-figure').trigger('keydown', { key: 'ArrowRight' })
    await wrapper.find('.lightbox-figure').trigger('keydown', { key: 'ArrowLeft' })
    await wrapper.find('.lightbox-figure').trigger('keydown', { key: 'Home' })
    await wrapper.find('.lightbox-figure').trigger('keydown', { key: 'End' })
    await wrapper.find('.lightbox-figure').trigger('keydown', { key: 'x' })
    expect(wrapper.emitted('update:index')?.map((event) => event[0])).toEqual([2, 0, 0, 2])
  })

  it('should stop at the ends without loop', async () => {
    const wrapper = build({ modelValue: true, loop: false, index: 0 })

    expect(wrapper.find('.lightbox-previous').attributes('disabled')).toBeDefined()
    const last = build({ modelValue: true, loop: false, index: 2 })

    expect(last.find('.lightbox-next').attributes('disabled')).toBeDefined()
    await last.find('.lightbox-figure').trigger('keydown', { key: 'ArrowRight' })
    expect(last.emitted('update:index')?.[0]).toEqual([2])
  })

  it('should render the caption slot and handle no items', () => {
    const wrapper = build({ modelValue: true, items: [{ src: '/a.jpg', alt: 'A' }] })

    expect(wrapper.find('.lightbox-caption').exists()).toBe(false)
    const slot = mount(Lightbox, {
      props: { items, modelValue: true },
      slots: { caption: '<template #caption="{ item }">cap-{{ item.alt }}</template>' },
      attachTo: document.body,
    })

    expect(slot.find('.lightbox-caption').text()).toBe('cap-A')
    const empty = build({ items: [], modelValue: true })

    expect(empty.find('.lightbox-figure').exists()).toBe(false)
    return empty.find('.lightbox-next').trigger('click')
  })
})

describe('MediaPlayer', () => {
  let paused = true
  const proto = HTMLMediaElement.prototype as unknown as Record<string, unknown>
  const original = {
    play: proto['play'],
    pause: proto['pause'],
    paused: Object.getOwnPropertyDescriptor(proto, 'paused'),
  }

  beforeEach(() => {
    paused = true
    proto['play'] = vi.fn(function (this: HTMLMediaElement) {
      paused = false
      this.dispatchEvent(new Event('play'))

      return Promise.resolve()
    })
    proto['pause'] = vi.fn(function (this: HTMLMediaElement) {
      paused = true
      this.dispatchEvent(new Event('pause'))
    })
    Object.defineProperty(proto, 'paused', { get: () => paused, configurable: true })
  })

  afterEach(() => {
    proto['play'] = original.play
    proto['pause'] = original.pause
    Object.defineProperty(proto, 'paused', original.paused!)
  })

  const build = (props: Record<string, unknown> = {}) =>
    mount(Player, { props: { src: '/v.mp4', ...props }, attachTo: document.body })

  it('should use the controls of the browser by default', () => {
    const wrapper = build({
      id: 'p',
      class: 'x',
      label: 'Clip',
      poster: '/p.jpg',
      loop: true,
      tracks: [{ src: '/fr.vtt', srclang: 'fr', label: 'Français', default: true }],
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Clip')
    expect(wrapper.find('video').attributes('controls')).toBeDefined()
    expect(wrapper.find('video').attributes('poster')).toBe('/p.jpg')
    expect(wrapper.find('track').attributes('srclang')).toBe('fr')
    expect(wrapper.find('.player-controls').exists()).toBe(false)
  })

  it('should be an audio player with no poster', () => {
    const wrapper = build({ type: 'audio', poster: '/p.jpg' })

    expect(wrapper.find('audio').exists()).toBe(true)
    expect(wrapper.find('audio').attributes('poster')).toBeUndefined()
    expect(wrapper.attributes('data-type')).toBe('audio')
  })

  it('should play and pause with its own button and say what it does', async () => {
    const wrapper = build({ customControls: true })

    expect(wrapper.find('video').attributes('controls')).toBeUndefined()
    expect(wrapper.find('.player-play').attributes('aria-label')).toBe('Play')
    await wrapper.find('.player-play').trigger('click')
    expect(wrapper.find('.player-play').attributes('aria-label')).toBe('Pause')
    expect(wrapper.attributes('data-playing')).toBeDefined()
    expect(wrapper.emitted('update:playing')?.[0]).toEqual([true])
    await wrapper.find('.player-play').trigger('click')
    expect(wrapper.attributes('data-playing')).toBeUndefined()
  })

  it('should stay paused when the browser refuses to play', async () => {
    proto['play'] = vi.fn(() => Promise.reject(new Error('NotAllowed')))
    const wrapper = build({ customControls: true })

    await wrapper.find('.player-play').trigger('click')
    expect(wrapper.attributes('data-playing')).toBeUndefined()
  })

  it('should show the time and seek', async () => {
    const wrapper = build({ customControls: true })
    const video = wrapper.find('video').element as HTMLVideoElement

    Object.defineProperty(video, 'duration', { value: 3725, configurable: true })
    await wrapper.find('video').trigger('loadedmetadata')
    video.currentTime = 65
    await wrapper.find('video').trigger('timeupdate')
    expect(wrapper.find('.player-time').text()).toBe('1:05 / 1:02:05')
    expect(wrapper.find('.player-seek').attributes('aria-valuetext')).toBe('1:05 / 1:02:05')
    expect(wrapper.emitted('update:time')?.[0]).toEqual([65])
    await wrapper.find('.player-seek').setValue('120')
    expect(video.currentTime).toBe(120)
  })

  it('should show 0:00 before the duration is known', () => {
    expect(build({ customControls: true }).find('.player-time').text()).toBe('0:00 / 0:00')
  })

  it('should mute, change the volume and the speed', async () => {
    const wrapper = build({ customControls: true })
    const video = wrapper.find('video').element as HTMLVideoElement

    await wrapper.find('.player-mute').trigger('click')
    expect(video.muted).toBe(true)
    expect(wrapper.find('.player-mute').attributes('aria-label')).toBe('Unmute')
    await wrapper.find('.player-volume').setValue('0.5')
    expect(video.volume).toBe(0.5)
    expect(video.muted).toBe(false)
    await wrapper.find('.player-volume').setValue('0')
    expect(video.muted).toBe(true)
    await wrapper.find('.player-speed').setValue('1.5')
    expect(video.playbackRate).toBe(1.5)
  })

  it('should use the keyboard on the player but not inside a control', async () => {
    const wrapper = build({ customControls: true })
    const video = wrapper.find('video').element as HTMLVideoElement

    Object.defineProperty(video, 'duration', { value: 100, configurable: true })
    await wrapper.find('video').trigger('loadedmetadata')
    video.currentTime = 50
    await wrapper.find('video').trigger('keydown', { key: 'ArrowRight' })
    expect(video.currentTime).toBe(55)
    await wrapper.find('video').trigger('keydown', { key: 'ArrowLeft' })
    expect(video.currentTime).toBe(50)
    await wrapper.find('video').trigger('keydown', { key: 'm' })
    expect(video.muted).toBe(true)
    await wrapper.find('video').trigger('keydown', { key: ' ' })
    expect(wrapper.attributes('data-playing')).toBeDefined()
    await wrapper.find('video').trigger('keydown', { key: 'k' })
    await wrapper.find('video').trigger('keydown', { key: 'f' })
    await wrapper.find('video').trigger('keydown', { key: 'z' })
    await wrapper.find('.player-play').trigger('keydown', { key: 'm' })
    expect(build().find('video').element).toBeTruthy()
    await build().find('video').trigger('keydown', { key: ' ' })
  })

  it('should go fullscreen when the browser can', async () => {
    Object.defineProperty(document, 'fullscreenEnabled', { value: true, configurable: true })
    Object.defineProperty(document, 'fullscreenElement', { value: null, configurable: true, writable: true })
    document.exitFullscreen = vi.fn() as unknown as typeof document.exitFullscreen
    const wrapper = build({ customControls: true })
    const request = vi.fn()

    wrapper.element.requestFullscreen = request as unknown as typeof wrapper.element.requestFullscreen
    await wrapper.find('.player-fullscreen').trigger('click')
    expect(request).toHaveBeenCalled()
    Object.defineProperty(document, 'fullscreenElement', { value: wrapper.element, configurable: true, writable: true })
    document.dispatchEvent(new Event('fullscreenchange'))
    await nextTick()
    expect(wrapper.attributes('data-fullscreen')).toBeDefined()
    await wrapper.find('.player-fullscreen').trigger('click')
    expect(document.exitFullscreen).toHaveBeenCalled()
    await wrapper.find('video').trigger('keydown', { key: 'f' })
    wrapper.unmount()
    Object.defineProperty(document, 'fullscreenEnabled', { value: false, configurable: true })
    expect(build({ customControls: true, type: 'audio' }).find('.player-fullscreen').exists()).toBe(false)
  })

  it('should pass the events on', async () => {
    const wrapper = build()

    await wrapper.find('video').trigger('ended')
    await wrapper.find('video').trigger('error')
    expect(wrapper.emitted('ended')).toHaveLength(1)
    expect(wrapper.emitted('error')).toHaveLength(1)
  })
})
