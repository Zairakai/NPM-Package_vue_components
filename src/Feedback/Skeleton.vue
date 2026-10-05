<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'FeedbackSkeleton',
  })

  const props = defineProps({
    id: String,
    class: String,
    variant: {
      type: String,
      default: 'text',
      validator(value) {
        return ['text', 'circle', 'rect'].includes(value)
      },
    },
    width: String,
    height: String,
    // Number of lines, for the text variant.
    lines: {
      type: Number,
      default: 1,
    },
    animated: {
      type: Boolean,
      default: true,
    },
  })

  const count = computed(() => ('text' === props.variant ? Math.max(1, props.lines) : 1))

  const skeletonProps = computed(() => ({
    id: props.id,
    class: `skeleton ${props.class ?? ''}`.trim(),
    'aria-hidden': 'true',
    'data-variant': props.variant,
    'data-animated': props.animated ? '' : undefined,
  }))

  // Functional CSS only: the size of the placeholder, the last line is shorter.
  function sizeOf(index) {
    const last = 1 < count.value && index === count.value - 1

    return {
      width: last ? '60%' : props.width,
      height: props.height,
    }
  }
</script>

<template>
  <div
    v-if="1 < count"
    class="skeleton-group"
    aria-busy="true"
  >
    <span
      v-for="index in count"
      :key="index"
      v-bind="skeletonProps"
      :style="sizeOf(index - 1)"
    ></span>
  </div>
  <span
    v-else
    v-bind="skeletonProps"
    :style="sizeOf(0)"
  ></span>
</template>
