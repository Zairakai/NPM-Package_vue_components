<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'FeedbackProgress',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The current value. Without it the progress is indeterminate.
    value: {
      type: Number,
      default: undefined,
    },
    max: {
      type: Number,
      default: 100,
    },
    label: String,
    variant: {
      type: String,
      default: 'linear',
      validator(value) {
        return ['linear', 'circular'].includes(value)
      },
    },
  })

  // Linear: the native <progress> element, its role, value and range are built in.
  // Circular: there is no native element, so a progressbar around an SVG ring.
  const indeterminate = computed(() => undefined === props.value)

  const percent = computed(() => {
    if (indeterminate.value || 0 >= props.max) {
      return 0
    }

    return Math.round(Math.min(100, Math.max(0, (props.value / props.max) * 100)))
  })

  const progressProps = computed(() => ({
    id: props.id,
    class: `progress ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
    'data-variant': props.variant,
    'data-indeterminate': indeterminate.value ? '' : undefined,
  }))
</script>

<template>
  <progress
    v-if="'linear' === variant"
    v-bind="progressProps"
    :value="indeterminate ? undefined : value"
    :max="max"
  >
    <slot />
  </progress>
  <div
    v-else
    v-bind="progressProps"
    role="progressbar"
    aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="indeterminate ? undefined : value"
  >
    <svg
      viewBox="0 0 36 36"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        class="progress-track"
        cx="18"
        cy="18"
        r="16"
        fill="none"
      />
      <circle
        class="progress-bar"
        cx="18"
        cy="18"
        r="16"
        fill="none"
        pathLength="100"
        :stroke-dasharray="`${indeterminate ? 25 : percent} 100`"
      />
    </svg>
    <slot />
  </div>
</template>
