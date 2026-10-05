import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import ColorPicker from '../../src/Form/ColorPicker.vue'
import FileDropzone from '../../src/Form/FileDropzone.vue'
import Otp from '../../src/Form/Otp.vue'
import RangeSlider from '../../src/Form/RangeSlider.vue'
import Rating from '../../src/Form/Rating.vue'
import TagsInput from '../../src/Form/TagsInput.vue'
import TimePicker from '../../src/Form/TimePicker.vue'

afterEach(() => {
  document.body.innerHTML = ''
})

const file = (name: string, type = 'text/plain', size = 10) => new File([new Uint8Array(size)], name, { type })

describe('FormRangeSlider', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(RangeSlider, { props: { label: 'Price', ...props }, attachTo: document.body })

  it('should render two range inputs, a group and an output', () => {
    const wrapper = build({ modelValue: [20, 80], id: 'r', class: 'x', valueText: (value: number) => `${value} euros` })
    const [low, high] = wrapper.findAll('input[type="range"]')

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Price')
    expect(wrapper.attributes('style')).toContain('--range-low: 20%')
    expect(low.attributes('aria-valuetext')).toBe('20 euros')
    expect(high.attributes('aria-label')).toBe('Maximum')
    expect(wrapper.find('output').text()).toBe('20 euros – 80 euros')
  })

  it('should move a thumb and never let them cross', async () => {
    const wrapper = build({ modelValue: [20, 80] })
    const [low, high] = wrapper.findAll('input[type="range"]')

    await low.setValue(30)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[30, 80]])
    await low.setValue(95)
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[80, 80]])
    await high.setValue(10)
    expect(wrapper.emitted('update:modelValue')?.[2]).toEqual([[20, 20]])
  })

  it('should default to the full range, post both values and be disabled', () => {
    const wrapper = build({ name: 'price', disabled: true, min: 10, max: 50, step: 5 })

    expect(wrapper.find('output').text()).toBe('10 – 50')
    expect(wrapper.findAll('input[type="hidden"]').map((input) => input.attributes('value'))).toEqual(['10', '50'])
    expect(wrapper.attributes('data-disabled')).toBeDefined()
  })
})

describe('FormRating', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(Rating, { props: { label: 'Score', ...props }, attachTo: document.body })

  it('should be a slider with a text value', () => {
    const wrapper = build({ modelValue: 3.5, half: true, id: 'r', class: 'x', name: 'score' })

    expect(wrapper.attributes('role')).toBe('slider')
    expect(wrapper.attributes('aria-valuenow')).toBe('3.5')
    expect(wrapper.attributes('aria-valuetext')).toBe('3.5 out of 5')
    expect(wrapper.attributes('aria-valuemax')).toBe('5')
    expect(wrapper.attributes('tabindex')).toBe('0')
    expect(wrapper.findAll('.rating-star').map((star) => star.attributes('data-state'))).toEqual([
      'full',
      'full',
      'full',
      'half',
      'empty',
    ])
    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('3.5')
  })

  it('should change with the keyboard', async () => {
    const wrapper = build({ modelValue: 2 })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([3])
    await wrapper.trigger('keydown', { key: 'ArrowDown' })
    await wrapper.trigger('keydown', { key: 'End' })
    await wrapper.trigger('keydown', { key: 'Home' })
    await wrapper.trigger('keydown', { key: 'ArrowUp' })
    await wrapper.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(6)
    await wrapper.trigger('keydown', { key: 'x' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(6)
  })

  it('should step by a half when asked', async () => {
    const wrapper = build({ modelValue: 2, half: true })

    await wrapper.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2.5])
  })

  it('should choose with a click, and clear when the same star is clicked again', async () => {
    const wrapper = build()

    await wrapper.findAll('.rating-star')[3].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([4])
    await wrapper.findAll('.rating-star')[3].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([0])
    expect(build({ clearable: false, modelValue: 4 }).findAll('.rating-star')[3].element).toBeTruthy()
  })

  it('should give half a point on the left of a star', async () => {
    const wrapper = build({ half: true })
    const star = wrapper.findAll('.rating-star')[1]

    vi.spyOn(star.element, 'getBoundingClientRect').mockReturnValue({ left: 100, width: 20 } as DOMRect)
    await star.trigger('click', { clientX: 104 })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([1.5])
    await star.trigger('click', { clientX: 118 })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([2])
  })

  it('should not change when read only or disabled', async () => {
    const readonly = build({ readonly: true, modelValue: 2 })

    await readonly.trigger('keydown', { key: 'ArrowRight' })
    await readonly.findAll('.rating-star')[4].trigger('click')
    expect(readonly.emitted('update:modelValue')).toBeUndefined()
    expect(readonly.attributes('aria-readonly')).toBe('true')

    const disabled = build({ disabled: true })

    expect(disabled.attributes('tabindex')).toBeUndefined()
    expect(disabled.attributes('aria-disabled')).toBe('true')
  })
})

describe('FormOtp', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(Otp, { props: { length: 4, ...props }, attachTo: document.body })
  const boxes = (wrapper: ReturnType<typeof build>) => wrapper.findAll('input.otp-digit')

  it('should render one box per digit with labels and the one time code hint', () => {
    const wrapper = build({ modelValue: '12', id: 'o', class: 'x', name: 'code' })

    expect(wrapper.attributes('role')).toBe('group')
    expect(boxes(wrapper)).toHaveLength(4)
    expect(boxes(wrapper)[0].attributes('autocomplete')).toBe('one-time-code')
    expect(boxes(wrapper)[1].attributes('autocomplete')).toBe('off')
    expect(boxes(wrapper)[2].attributes('aria-label')).toBe('Digit 3 of 4')
    expect(boxes(wrapper).map((box) => (box.element as HTMLInputElement).value)).toEqual(['1', '2', '', ''])
    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('12')
    expect(build({ mask: true }).find('.otp-digit').attributes('type')).toBe('password')
  })

  it('should fill a box, go to the next and complete', async () => {
    const wrapper = build()

    await boxes(wrapper)[0].setValue('1')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1'])
    expect(document.activeElement).toBe(boxes(wrapper)[1].element)
    await boxes(wrapper)[1].setValue('x')
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['1'])
  })

  it('should complete when the last digit is typed', async () => {
    const wrapper = build({ modelValue: '123' })

    await boxes(wrapper)[3].setValue('4')
    expect(wrapper.emitted('complete')?.[0]).toEqual(['1234'])
  })

  it('should spread a paste over the boxes', async () => {
    const wrapper = build()

    await boxes(wrapper)[0].trigger('paste', { clipboardData: { getData: () => '98 76 5' } })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['9876'])
    expect(wrapper.emitted('complete')?.[0]).toEqual(['9876'])
  })

  it('should spread several characters typed in one box', async () => {
    const wrapper = build()

    await boxes(wrapper)[1].setValue('555')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['555'])
  })

  it('should go back with Backspace on an empty box and move with the arrows', async () => {
    const wrapper = build({ modelValue: '12' })

    await boxes(wrapper)[2].trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['1'])
    await boxes(wrapper)[2].trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(boxes(wrapper)[1].element)
    await boxes(wrapper)[1].trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(boxes(wrapper)[2].element)
  })
})

describe('FormTimePicker', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(TimePicker, { props: { label: 'Time', ...props }, attachTo: document.body })

  it('should show the hours and minutes of the value in 24 hours', () => {
    const wrapper = build({ modelValue: '14:30', id: 't', class: 'x', name: 'time' })

    expect(wrapper.attributes('role')).toBe('group')
    expect((wrapper.find('.time-picker-hour').element as HTMLSelectElement).value).toBe('14')
    expect((wrapper.find('.time-picker-minute').element as HTMLSelectElement).value).toBe('30')
    expect(wrapper.findAll('.time-picker-hour option')).toHaveLength(24)
    expect(wrapper.find('.time-picker-period').exists()).toBe(false)
    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('14:30')
  })

  it('should change the hour and the minute', async () => {
    const wrapper = build({ modelValue: '14:30' })

    await wrapper.find('.time-picker-hour').setValue('9')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['09:30'])
    await wrapper.find('.time-picker-minute').setValue('45')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['14:45'])
  })

  it('should start from midnight when only a minute is chosen on an empty value', async () => {
    const wrapper = build({ minuteStep: 15 })

    expect(
      wrapper.findAll('.time-picker-minute option').filter((option) => '' !== option.attributes('value'))
    ).toHaveLength(4)
    await wrapper.find('.time-picker-minute').setValue('15')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['00:15'])
  })

  it('should show 12 hours with AM and PM and give a 24 hour value', async () => {
    const wrapper = build({ modelValue: '14:05', hours: 12 })

    expect((wrapper.find('.time-picker-hour').element as HTMLSelectElement).value).toBe('2')
    expect((wrapper.find('.time-picker-period').element as HTMLSelectElement).value).toBe('pm')
    await wrapper.find('.time-picker-period').setValue('am')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['02:05'])
    await wrapper.find('.time-picker-hour').setValue('12')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['12:05'])
  })

  it('should read midnight as 12 AM and set an hour on an empty 12 hour value', async () => {
    expect(
      (build({ modelValue: '00:00', hours: 12 }).find('.time-picker-hour').element as HTMLSelectElement).value
    ).toBe('12')

    const wrapper = build({ hours: 12 })

    await wrapper.find('.time-picker-hour').setValue('3')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['03:00'])
    const other = build({ hours: 12 })

    await other.find('.time-picker-period').setValue('pm')
    expect(other.emitted('update:modelValue')?.[0]).toEqual(['00:00'.replace('00', '12')])
  })
})

describe('FormTagsInput', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(TagsInput, { props: { label: 'Tags', ...props }, attachTo: document.body })

  it('should render the tags as a list with remove buttons and hidden inputs', async () => {
    const wrapper = build({ modelValue: ['a', 'b'], name: 'tags', id: 't', class: 'x' })

    expect(wrapper.findAll('.tags-input-tag').map((tag) => tag.find('.tags-input-tag-label').text())).toEqual([
      'a',
      'b',
    ])
    expect(wrapper.find('label').attributes('for')).toBe('t')
    expect(wrapper.findAll('input[type="hidden"]').map((input) => input.attributes('name'))).toEqual([
      'tags[]',
      'tags[]',
    ])
    await wrapper.find('.tags-input-remove').trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
  })

  it('should add a tag with Enter and with a separator', async () => {
    const wrapper = build()
    const input = wrapper.find('input.tags-input-field')

    await input.setValue('one')
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['one']])
    await input.setValue('two,')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['one', 'two']])
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')).toHaveLength(2)
  })

  it('should add the text on blur and remove the last tag with Backspace', async () => {
    const wrapper = build({ modelValue: ['a'] })
    const input = wrapper.find('input.tags-input-field')

    await input.setValue('b')
    await input.trigger('blur')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])
    await input.trigger('keydown', { key: 'Backspace' })
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([[]])
  })

  it('should split a paste and refuse duplicates and too many tags', async () => {
    const wrapper = build({ modelValue: ['a'], max: 3 })
    const input = wrapper.find('input.tags-input-field')

    await input.trigger('paste', { clipboardData: { getData: () => 'a, b\nc\nd' } })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b', 'c']])
    expect(wrapper.emitted('reject')?.map((event) => (event[0] as { reason: string }).reason)).toEqual([
      'duplicate',
      'max',
    ])
  })

  it('should leave a single pasted value to the field and allow duplicates when asked', async () => {
    const wrapper = build({ modelValue: ['a'], allowDuplicates: true })

    await wrapper.find('input.tags-input-field').trigger('paste', { clipboardData: { getData: () => 'solo' } })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    await wrapper.find('input.tags-input-field').setValue('a;')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'a']])
    expect(build({ disabled: true }).find('.tags-input').attributes('data-disabled')).toBeDefined()
  })
})

describe('FormColorPicker', () => {
  const build = (props: Record<string, unknown> = {}) =>
    mount(ColorPicker, { props: { label: 'Colour', ...props }, attachTo: document.body })

  it('should show the native input, the hex text and the palette', async () => {
    const wrapper = build({
      modelValue: '#ff0000',
      palette: ['#00ff00', '#ff0000'],
      name: 'color',
      id: 'c',
      class: 'x',
    })

    expect((wrapper.find('input[type="color"]').element as HTMLInputElement).value).toBe('#ff0000')
    expect((wrapper.find('.color-picker-hex').element as HTMLInputElement).value).toBe('#ff0000')
    expect(wrapper.findAll('.color-picker-swatch').map((swatch) => swatch.attributes('aria-pressed'))).toEqual([
      'false',
      'true',
    ])
    await wrapper.findAll('.color-picker-swatch')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#00ff00'])
    expect(wrapper.find('input[type="hidden"]').attributes('value')).toBe('#ff0000')
  })

  it('should change with the native input and with a valid hex only', async () => {
    const wrapper = build({ modelValue: '#ff0000' })
    const hex = wrapper.find('.color-picker-hex')

    await wrapper.find('input[type="color"]').setValue('#0000ff')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#0000ff'])
    await hex.setValue('#12')
    expect(hex.attributes('aria-invalid')).toBe('true')
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    await hex.setValue('#0f0')
    expect(hex.attributes('aria-invalid')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['#00ff00'])
  })

  it('should handle the opacity', async () => {
    const wrapper = build({ modelValue: '#ff000080', alpha: true })

    expect((wrapper.find('.color-picker-alpha').element as HTMLInputElement).value).toBe('0.5')
    await wrapper.find('.color-picker-alpha').setValue('1')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#ff0000'])
    await wrapper.find('.color-picker-hex').setValue('#00ff0040')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual(['#00ff0040'])
  })

  it('should drop the opacity of a long hex without alpha mode and be disabled', async () => {
    const wrapper = build({ modelValue: '#ff0000' })

    await wrapper.find('.color-picker-hex').setValue('#00ff0040')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['#00ff00'])
    expect(wrapper.find('.color-picker-alpha').exists()).toBe(false)
    expect(build({ disabled: true }).find('.color-picker-native').attributes('disabled')).toBeDefined()
  })
})

describe('FormFileDropzone', () => {
  const build = (props: Record<string, unknown> = {}) => mount(FileDropzone, { props, attachTo: document.body })
  const choose = async (wrapper: ReturnType<typeof build>, files: File[]) => {
    const input = wrapper.find('input[type="file"]')

    Object.defineProperty(input.element, 'files', { value: files, configurable: true })
    await input.trigger('change')
  }

  it('should render the area, the browse button and the help from the rules', () => {
    const wrapper = build({ accept: '.png', maxSize: 2048, maxFiles: 3, id: 'd', class: 'x', name: 'files' })

    expect(wrapper.classes()).toEqual(['file-dropzone', 'x'])
    expect(wrapper.find('.file-dropzone-label').text()).toBe('Drop files here or')
    expect(wrapper.find('.file-dropzone-help').text()).toBe('.png · max 2 KB · 3 files')
    expect(wrapper.find('.file-dropzone-browse').attributes('aria-describedby')).toBe(
      wrapper.find('.file-dropzone-help').attributes('id')
    )
    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe('.png')
  })

  it('should open the file chooser from the button', async () => {
    const wrapper = build()
    const click = vi.spyOn(wrapper.find('input[type="file"]').element as HTMLInputElement, 'click')

    await wrapper.find('.file-dropzone-browse').trigger('click')
    expect(click).toHaveBeenCalled()
  })

  it('should add the chosen files, list them and remove one', async () => {
    const wrapper = build()

    await choose(wrapper, [file('a.txt', 'text/plain', 2048), file('b.txt')])
    expect(wrapper.emitted('update:modelValue')?.[0][0]).toHaveLength(2)
    expect(wrapper.findAll('.file-dropzone-file')).toHaveLength(2)
    expect(wrapper.find('.file-dropzone-size').text()).toBe('2 KB')
    await wrapper.find('.file-dropzone-remove').trigger('click')
    expect(wrapper.findAll('.file-dropzone-file')).toHaveLength(1)
  })

  it('should reject files with a reason and show the errors', async () => {
    const wrapper = build({ accept: 'image/*', maxSize: 100 })

    await choose(wrapper, [file('a.txt'), file('big.png', 'image/png', 500), file('ok.png', 'image/png')])
    expect(wrapper.emitted('reject')?.[0][0]).toHaveLength(2)
    expect(wrapper.find('[role="alert"]').text()).toContain('a.txt is not an accepted type')
    expect(wrapper.find('[role="alert"]').text()).toContain('big.png is too big')
    expect(wrapper.findAll('.file-dropzone-file')).toHaveLength(1)
  })

  it('should keep a single file when not multiple', async () => {
    const wrapper = build({ multiple: false })

    await choose(wrapper, [file('a.txt'), file('b.txt')])
    await choose(wrapper, [file('c.txt')])
    expect(wrapper.findAll('.file-dropzone-name').map((name) => name.text())).toEqual(['c.txt'])
  })

  it('should show the drag state and take dropped files', async () => {
    const wrapper = build()
    const area = wrapper.find('.file-dropzone-area')

    await area.trigger('dragenter')
    expect(wrapper.attributes('data-dragging')).toBeDefined()
    await area.trigger('dragenter')
    await area.trigger('dragleave')
    expect(wrapper.attributes('data-dragging')).toBeDefined()
    await area.trigger('dragleave')
    expect(wrapper.attributes('data-dragging')).toBeUndefined()
    await area.trigger('dragenter')
    await area.trigger('drop', { dataTransfer: { files: [file('d.txt')] } })
    expect(wrapper.attributes('data-dragging')).toBeUndefined()
    expect(wrapper.findAll('.file-dropzone-file')).toHaveLength(1)
  })

  it('should ignore a drop when disabled', async () => {
    const wrapper = build({ disabled: true })

    await wrapper.find('.file-dropzone-area').trigger('dragenter')
    expect(wrapper.attributes('data-dragging')).toBeUndefined()
    await wrapper.find('.file-dropzone-area').trigger('drop', { dataTransfer: { files: [file('d.txt')] } })
    expect(wrapper.findAll('.file-dropzone-file')).toHaveLength(0)
  })

  it('should preview images and release the URL when the file goes away or the component is removed', async () => {
    const create = vi.fn().mockReturnValue('blob:one')
    const revoke = vi.fn()

    vi.stubGlobal('URL', Object.assign(URL, { createObjectURL: create, revokeObjectURL: revoke }))

    const wrapper = build()

    await choose(wrapper, [file('a.png', 'image/png'), file('b.txt')])
    expect(wrapper.find('img.file-dropzone-preview').attributes('src')).toBe('blob:one')
    expect(wrapper.findAll('img')).toHaveLength(1)
    await wrapper.find('.file-dropzone-remove').trigger('click')
    expect(revoke).toHaveBeenCalledWith('blob:one')

    const second = build()

    await choose(second, [file('c.png', 'image/png')])
    second.unmount()
    expect(revoke).toHaveBeenCalledTimes(2)
    expect(build({ previews: false }).find('img').exists()).toBe(false)
    vi.unstubAllGlobals()
  })
})
