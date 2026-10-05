import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { resetSupport, setSupport } from '../../src/composables/useSupport'
import { parseLines, splitLines } from '../../src/Content/codeBlock'
import CodeBlock from '../../src/Content/CodeBlock.vue'

describe('parseLines', () => {
  it('should parse numbers and ranges', () => {
    expect([...parseLines('1,3-5')]).toEqual([1, 3, 4, 5])
    expect([...parseLines([2, '4-5'])]).toEqual([2, 4, 5])
  })

  it('should ignore what is not a line and accept nothing', () => {
    expect([...parseLines('a, 2')]).toEqual([2])
    expect(parseLines(undefined).size).toBe(0)
  })
})

describe('splitLines', () => {
  it('should split on line breaks and drop the empty last line', () => {
    expect(splitLines('a\nb\n')).toEqual(['a', 'b'])
    expect(splitLines('a\r\nb')).toEqual(['a', 'b'])
    expect(splitLines('')).toEqual([''])
  })
})

describe('ContentCodeBlock', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } })
    setSupport({ clipboard: true })
  })

  afterEach(() => {
    resetSupport()
    vi.unstubAllGlobals()
  })

  it('should render a figure with the language, the title and one span per line', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'const a = 1\nconst b = 2\n', language: 'js', title: 'app.js', id: 'c', class: 'x' },
    })

    expect(wrapper.element.tagName).toBe('FIGURE')
    expect(wrapper.classes()).toEqual(['code-block', 'x'])
    expect(wrapper.attributes('data-language')).toBe('js')
    expect(wrapper.attributes('id')).toBe('c')
    expect(wrapper.find('.code-block-title').text()).toBe('app.js')
    expect(wrapper.find('.code-block-language').text()).toBe('js')
    expect(wrapper.find('code').classes()).toContain('language-js')
    expect(wrapper.findAll('.code-line')).toHaveLength(2)
    expect(wrapper.findAll('.code-line')[1].attributes('data-line')).toBe('2')
    expect(wrapper.find('pre').text()).toContain('const a = 1')
  })

  it('should read the code from the slot', () => {
    expect(
      mount(CodeBlock, { slots: { default: 'echo hi' } })
        .find('pre')
        .text()
    ).toBe('echo hi')
  })

  it('should make the code reachable with the keyboard because it can scroll', () => {
    expect(
      mount(CodeBlock, { props: { code: 'x' } })
        .find('pre')
        .attributes('tabindex')
    ).toBe('0')
  })

  it('should not add a language class without a language', () => {
    expect(
      mount(CodeBlock, { props: { code: 'x' } })
        .find('code')
        .classes()
    ).toEqual([])
  })

  it('should mark the line numbers, the wrapping and the highlighted lines', () => {
    const wrapper = mount(CodeBlock, {
      props: { code: 'a\nb\nc', lineNumbers: true, wrap: true, highlightLines: '2-3' },
    })

    expect(wrapper.attributes('data-line-numbers')).toBeDefined()
    expect(wrapper.attributes('data-wrap')).toBeDefined()
    expect(wrapper.find('pre').attributes('style')).toContain('white-space: pre-wrap')
    expect(wrapper.findAll('.code-line').map((line) => line.attributes('data-highlighted') !== undefined)).toEqual([
      false,
      true,
      true,
    ])
  })

  it('should limit the height', () => {
    expect(
      mount(CodeBlock, { props: { code: 'x', maxHeight: '10rem' } })
        .find('pre')
        .attributes('style')
    ).toContain('max-height: 10rem')
  })

  it('should render highlighted HTML from the highlighter', () => {
    const highlighter = vi.fn((code: string, language: string) => `<span class="k">${language}:${code}</span>`)
    const wrapper = mount(CodeBlock, { props: { code: 'x', language: 'ts', highlighter } })

    expect(highlighter).toHaveBeenCalledWith('x', 'ts')
    expect(wrapper.find('code .k').text()).toBe('ts:x')
    expect(wrapper.find('.code-line').exists()).toBe(false)
  })

  it('should copy the code and confirm it', async () => {
    const wrapper = mount(CodeBlock, { props: { code: 'npm i', copyLabel: 'Copier', copiedLabel: 'Copié' } })

    expect(wrapper.find('.code-block-copy').text()).toBe('Copier')

    await wrapper.find('.code-block-copy').trigger('click')
    await nextTick()
    await nextTick()

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('npm i')
    expect(wrapper.find('.code-block-copy').text()).toBe('Copié')
    expect(wrapper.find('.code-block-copy').attributes('data-copied')).toBeDefined()
    expect(wrapper.find('.code-block-status').text()).toBe('Copié')
  })

  it('should hide the copy button and the header when there is nothing to show', () => {
    const wrapper = mount(CodeBlock, { props: { code: 'x', copyable: false } })

    expect(wrapper.find('.code-block-copy').exists()).toBe(false)
    expect(wrapper.find('.code-block-header').exists()).toBe(false)
  })
})
