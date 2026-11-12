<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'DisplayStat',
})

const props = defineProps({
  id: String,
  class: String,
  label: String,
  value: [String, Number],
  // The change since before: a number, positive or negative.
  change: {
    type: Number,
    default: undefined,
  },
  // The unit or sign shown after the change: "%".
  changeUnit: {
    type: String,
    default: '%',
  },
  // Whether going up is good news (turnover) or bad (errors).
  upIsGood: {
    type: Boolean,
    default: true,
  },
  // The text read for the change. Use {value}, {direction}.
  changeLabel: {
    type: String,
    default: '{direction} {value}',
  },
  increaseWord: {
    type: String,
    default: 'Up',
  },
  decreaseWord: {
    type: String,
    default: 'Down',
  },
})

const direction = computed(() =>
  (props.change ?? 0) === 0 ? 'flat' : props.change > 0 ? 'up' : 'down',
)
const sentiment = computed(() =>
  direction.value === 'flat'
    ? 'neutral'
    : (direction.value === 'up') === props.upIsGood
      ? 'positive'
      : 'negative',
)

const changeText = computed(() => {
  const word =
    direction.value === 'up'
      ? props.increaseWord
      : direction.value === 'down'
        ? props.decreaseWord
        : ''

  return props.changeLabel
    .replace('{direction}', word)
    .replace('{value}', `${Math.abs(props.change)}${props.changeUnit}`)
    .trim()
})

const statProps = computed(() => ({
  id: props.id,
  class: `stat ${props.class ?? ''}`.trim(),
}))
</script>

<template>
  <div v-bind="statProps">
    <dl class="stat-list">
      <dt class="stat-label">
        <slot name="label">{{ label }}</slot>
      </dt>
      <dd class="stat-value">
        <slot>{{ value }}</slot>
      </dd>
    </dl>
    <p
      v-if="change !== undefined"
      class="stat-change"
      :data-direction="direction"
      :data-sentiment="sentiment"
    >
      <span class="stat-arrow" aria-hidden="true">
        {{ direction === 'up' ? '▲' : direction === 'down' ? '▼' : '-' }}}
      </span>
      <span class="stat-change-text">{{ changeText }}</span>
    </p>
  </div>
</template>
