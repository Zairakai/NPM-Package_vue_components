<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { otpDigits } from '@form/inputs'
  import { computed, nextTick, ref } from 'vue'

  defineOptions({
    name: 'FormOtp',
  })

  const emit = defineEmits(['update:modelValue', 'complete'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: String,
      default: undefined,
    },
    length: {
      type: Number,
      default: 6,
    },
    // The characters that are accepted: digits by default.
    pattern: {
      type: RegExp,
      default: () => /\d/,
    },
    label: {
      type: String,
      default: 'Verification code',
    },
    digitLabel: {
      type: String,
      default: 'Digit {n} of {total}',
    },
    name: String,
    form: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    mask: {
      type: Boolean,
      default: false,
    },
  })

  const uid = useUid('otp')
  const state = useControllable(props, 'modelValue', emit, '')
  const boxes = ref([])

  const digits = computed(() => Array.from({ length: props.length }, (_, index) => state.value[index] ?? ''))

  async function focusBox(index) {
    await nextTick()

    const box = boxes.value[Math.max(0, Math.min(props.length - 1, index))]

    box?.focus()
    box?.select()
  }

  function commit(next) {
    const value = next.join('')

    state.value = value

    if (value.length === props.length) {
      emit('complete', value)
    }
  }

  // Typing a character fills the box and goes to the next one; a paste fills the following boxes.
  function onInput(event, index) {
    const typed = otpDigits(event.target.value, props.length - index, props.pattern)
    const next = [...digits.value]

    if (0 === typed.length) {
      next[index] = ''
      event.target.value = ''
      commit(next)

      return
    }

    typed.forEach((character, offset) => (next[index + offset] = character))
    commit(next)
    event.target.value = next[index]
    focusBox(index + typed.length)
  }

  function onKeydown(event, index) {
    if ('Backspace' === event.key && '' === digits.value[index] && 0 < index) {
      event.preventDefault()

      const next = [...digits.value]

      next[index - 1] = ''
      commit(next)
      focusBox(index - 1)
    } else if ('ArrowLeft' === event.key) {
      event.preventDefault()
      focusBox(index - 1)
    } else if ('ArrowRight' === event.key) {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  function onPaste(event, index) {
    event.preventDefault()

    const typed = otpDigits(event.clipboardData?.getData('text') ?? '', props.length - index, props.pattern)
    const next = [...digits.value]

    typed.forEach((character, offset) => (next[index + offset] = character))
    commit(next)
    focusBox(index + typed.length)
  }

  const rootProps = computed(() => ({
    id: props.id,
    class: `otp ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
  }))
</script>

<template>
  <div v-bind="rootProps">
    <input
      v-for="(digit, index) in digits"
      :id="`${uid}-${index}`"
      :key="index"
      :ref="(element) => (boxes[index] = element)"
      class="otp-digit"
      :type="mask ? 'password' : 'text'"
      inputmode="numeric"
      :autocomplete="0 === index ? 'one-time-code' : 'off'"
      maxlength="1"
      :value="digit"
      :disabled="disabled"
      :aria-label="digitLabel.replace('{n}', String(index + 1)).replace('{total}', String(length))"
      @input="onInput($event, index)"
      @keydown="onKeydown($event, index)"
      @paste="onPaste($event, index)"
      @focus="$event.target.select()"
    />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :form="form"
      :value="state"
    />
  </div>
</template>
