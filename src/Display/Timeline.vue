<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayTimeline',
  })

  const props = defineProps({
    id: String,
    class: String,
    label: String,
    // Newest first or last.
    reverse: {
      type: Boolean,
      default: false,
    },
  })

  const timelineProps = computed(() => ({
    id: props.id,
    class: `timeline ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
    reversed: props.reverse ? true : undefined,
  }))
</script>

<template>
  <ol v-bind="timelineProps">
    <slot />
  </ol>
</template>
