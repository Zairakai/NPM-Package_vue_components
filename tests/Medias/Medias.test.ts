import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import Audio from '../../src/Medias/Audio.vue'
import Canvas from '../../src/Medias/Canvas.vue'
import Figcaption from '../../src/Medias/Figcaption.vue'
import Figure from '../../src/Medias/Figure.vue'
import Iframe from '../../src/Medias/Iframe.vue'
import Image from '../../src/Medias/Image.vue'
import MediaObject from '../../src/Medias/Object.vue'
import Source from '../../src/Medias/Source.vue'
import Track from '../../src/Medias/Track.vue'
import Video from '../../src/Medias/Video.vue'

describe('MediaImage', () => {
  it('renders <img> with src and alt', () => {
    const wrapper = mount(Image, { props: { src: '/img/photo.jpg', alt: 'A photo' } })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('/img/photo.jpg')
    expect(img.attributes('alt')).toBe('A photo')
  })

  it('passes width, height and loading props', () => {
    const wrapper = mount(Image, {
      props: { src: '/img/photo.jpg', alt: 'A photo', width: 800, height: 600, loading: 'lazy' },
    })
    const img = wrapper.find('img')
    expect(img.attributes('width')).toBe('800')
    expect(img.attributes('height')).toBe('600')
    expect(img.attributes('loading')).toBe('lazy')
  })
})

describe('MediaFigure', () => {
  it('renders <figure> with slot content', () => {
    const wrapper = mount(Figure, { slots: { default: 'Figure content' } })
    expect(wrapper.find('figure').exists()).toBe(true)
    expect(wrapper.text()).toBe('Figure content')
  })
})

describe('MediaFigcaption', () => {
  it('renders <figcaption> with slot content', () => {
    const wrapper = mount(Figcaption, { slots: { default: 'Caption' } })
    expect(wrapper.find('figcaption').exists()).toBe(true)
    expect(wrapper.text()).toBe('Caption')
  })
})

describe('MediaCanvas', () => {
  it('renders <canvas> element', () => {
    const wrapper = mount(Canvas, { props: { width: 300, height: 150 } })
    expect(wrapper.find('canvas').exists()).toBe(true)
  })
})

describe('MediaIframe', () => {
  it('renders <iframe> with src prop', () => {
    const wrapper = mount(Iframe, { props: { src: 'https://example.com', title: 'Example' } })
    const iframe = wrapper.find('iframe')
    expect(iframe.exists()).toBe(true)
    expect(iframe.attributes('src')).toBe('https://example.com')
  })
})

describe('MediaObject', () => {
  it('renders <object> element', () => {
    const wrapper = mount(MediaObject, { props: { data: '/file.pdf', type: 'application/pdf' } })
    expect(wrapper.find('object').exists()).toBe(true)
  })
})

describe('MediaSource', () => {
  it('renders <source> element', () => {
    const wrapper = mount(Source, { props: { src: '/audio.mp3', type: 'audio/mpeg' } })
    expect(wrapper.find('source').exists()).toBe(true)
  })
})

describe('MediaTrack', () => {
  it('renders <track> element', () => {
    const wrapper = mount(Track, { props: { src: '/captions.vtt', kind: 'subtitles' } })
    expect(wrapper.find('track').exists()).toBe(true)
  })
})

describe('MediaAudio', () => {
  it('renders <audio> element', () => {
    const wrapper = mount(Audio, {
      props: { sources: [{ src: '/audio.mp3', type: 'audio/mpeg' }] },
    })
    expect(wrapper.find('audio').exists()).toBe(true)
  })
})

describe('MediaVideo', () => {
  it('renders <video> element', () => {
    const wrapper = mount(Video, {
      props: { sources: [{ src: '/video.mp4', type: 'video/mp4' }] },
    })
    expect(wrapper.find('video').exists()).toBe(true)
  })
})
