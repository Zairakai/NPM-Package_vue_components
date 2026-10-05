<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayRating',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The score, from 0 to max, with halves.
    value: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 5,
    },
    // The text read for the score. Use {value} and {max}.
    label: {
      type: String,
      default: '{value} out of {max}',
    },
  })

  const score = computed(() => Math.min(props.max, Math.max(0, props.value)))

  // Every star is full, half or empty.
  const stars = computed(() =>
    Array.from({ length: props.max }, (_, index) => {
      const remaining = score.value - index

      return 1 <= remaining ? 'full' : 0.5 <= remaining ? 'half' : 'empty'
    })
  )

  const ratingProps = computed(() => ({
    id: props.id,
    class: `rating ${props.class ?? ''}`.trim(),
    role: 'img',
    'aria-label': props.label.replace('{value}', String(score.value)).replace('{max}', String(props.max)),
    'data-value': score.value,
  }))
</script>

<template>
  <span v-bind="ratingProps">
    <span
      v-for="(state, index) in stars"
      :key="index"
      class="rating-star"
      :data-state="state"
      aria-hidden="true"
    >
      <slot
        :state="state"
        :index="index"
      >
        &#9733;
      </slot>
    </span>
  </span>
</template>
