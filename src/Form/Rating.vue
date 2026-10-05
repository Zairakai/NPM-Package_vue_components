<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { snap } from '@form/inputs'
  import { computed } from 'vue'

  defineOptions({
    name: 'FormRating',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Number,
      default: undefined,
    },
    max: {
      type: Number,
      default: 5,
    },
    // Allow half stars.
    half: {
      type: Boolean,
      default: false,
    },
    label: String,
    name: String,
    form: String,
    readonly: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // The text read for the score, with {value} and {max}.
    valueText: {
      type: String,
      default: '{value} out of {max}',
    },
    clearable: {
      type: Boolean,
      default: true,
    },
  })

  const state = useControllable(props, 'modelValue', emit, 0)
  const step = computed(() => (props.half ? 0.5 : 1))
  const score = computed(() => snap(state.value ?? 0, 0, props.max, step.value))
  const inactive = computed(() => props.readonly || props.disabled)

  const stars = computed(() =>
    Array.from({ length: props.max }, (_, index) => {
      const remaining = score.value - index

      return 1 <= remaining ? 'full' : 0.5 <= remaining ? 'half' : 'empty'
    })
  )

  function set(value) {
    if (!inactive.value) {
      state.value = snap(value, 0, props.max, step.value)
    }
  }

  // A click on the left half of a star gives half a point.
  function onStarClick(event, index) {
    const box = event.currentTarget.getBoundingClientRect()
    const left = props.half && 0 < box.width && event.clientX - box.left < box.width / 2
    const value = index + (left ? 0.5 : 1)

    set(props.clearable && value === score.value ? 0 : value)
  }

  function onKeydown(event) {
    const target = {
      ArrowRight: () => score.value + step.value,
      ArrowUp: () => score.value + step.value,
      ArrowLeft: () => score.value - step.value,
      ArrowDown: () => score.value - step.value,
      Home: () => 0,
      End: () => props.max,
    }[event.key]

    if (target) {
      event.preventDefault()
      set(target())
    }
  }

  const text = computed(() =>
    props.valueText.replace('{value}', String(score.value)).replace('{max}', String(props.max))
  )

  const ratingProps = computed(() => ({
    id: props.id,
    class: `rating-input ${props.class ?? ''}`.trim(),
    role: 'slider',
    tabindex: props.disabled ? undefined : 0,
    'aria-label': props.label,
    'aria-valuemin': 0,
    'aria-valuemax': props.max,
    'aria-valuenow': score.value,
    'aria-valuetext': text.value,
    'aria-readonly': props.readonly ? 'true' : undefined,
    'aria-disabled': props.disabled ? 'true' : undefined,
    'data-value': score.value,
  }))
</script>

<template>
  <span
    v-bind="ratingProps"
    @keydown="onKeydown"
  >
    <span
      v-for="(state, index) in stars"
      :key="index"
      class="rating-star"
      :data-state="state"
      aria-hidden="true"
      @click="onStarClick($event, index)"
    >
      <slot
        :state="state"
        :index="index"
      >
        &#9733;
      </slot>
    </span>
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :form="form"
      :value="score"
    />
  </span>
</template>
