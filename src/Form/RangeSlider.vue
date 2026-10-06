<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { snap } from '@form/inputs'
  import { computed } from 'vue'

  defineOptions({
    name: 'FormRangeSlider',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // [low, high].
    modelValue: {
      type: Array,
      default: undefined,
    },
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100,
    },
    step: {
      type: Number,
      default: 1,
    },
    label: String,
    name: String,
    form: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    // How the value is read by a screen reader: (value) => "20 euros".
    valueText: {
      type: Function,
      default: (value) => String(value),
    },
    lowLabel: {
      type: String,
      default: 'Minimum',
    },
    highLabel: {
      type: String,
      default: 'Maximum',
    },
  })

  const uid = useUid('range-slider')
  const state = useControllable(props, 'modelValue', emit, [props.min, props.max])

  const low = computed(() => snap(state.value[0] ?? props.min, props.min, props.max, props.step))
  const high = computed(() => snap(state.value[1] ?? props.max, props.min, props.max, props.step))

  // The two thumbs cannot cross: the one that moves stops at the other.
  function setLow(event) {
    state.value = [Math.min(Number(event.target.value), high.value), high.value]
    event.target.value = String(low.value)
  }

  function setHigh(event) {
    state.value = [low.value, Math.max(Number(event.target.value), low.value)]
    event.target.value = String(high.value)
  }

  const percent = (value) => (props.max === props.min ? 0 : ((value - props.min) / (props.max - props.min)) * 100)

  const rootProps = computed(() => ({
    id: props.id,
    class: `range-slider ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
    'data-disabled': props.disabled ? '' : undefined,
    style: { '--range-low': `${percent(low.value)}%`, '--range-high': `${percent(high.value)}%` },
  }))

  const inputProps = (value, label) => ({
    type: 'range',
    min: props.min,
    max: props.max,
    step: props.step,
    disabled: props.disabled,
    value,
    'aria-label': label,
    'aria-valuetext': props.valueText(value),
  })
</script>

<template>
  <div v-bind="rootProps">
    <input
      :id="`${uid}-low`"
      class="range-slider-low"
      v-bind="inputProps(low, lowLabel)"
      @input="setLow"
    />
    <input
      :id="`${uid}-high`"
      class="range-slider-high"
      v-bind="inputProps(high, highLabel)"
      @input="setHigh"
    />
    <output
      class="range-slider-output"
      :for="`${uid}-low ${uid}-high`"
    >
      {{ valueText(low) }} – {{ valueText(high) }}
    </output>
    <template v-if="name">
      <input
        type="hidden"
        :name="`${name}[]`"
        :form="form"
        :value="low"
      />
      <input
        type="hidden"
        :name="`${name}[]`"
        :form="form"
        :value="high"
      />
    </template>
  </div>
</template>
