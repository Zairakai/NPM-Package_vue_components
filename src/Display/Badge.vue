<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayBadge',
  })

  const props = defineProps({
    id: String,
    class: String,
    variant: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'info', 'success', 'warning', 'error'].includes(value)
      },
    },
    size: {
      type: String,
      default: 'medium',
      validator(value) {
        return ['small', 'medium', 'large'].includes(value)
      },
    },
    dot: {
      type: Boolean,
      default: false,
    },
  })

  const badgeProps = computed(() => ({
    id: props.id,
    class: `badge ${props.class ?? ''}`.trim(),
    'data-variant': props.variant,
    'data-size': props.size,
    'data-dot': props.dot ? '' : undefined,
  }))
</script>

<template>
  <span v-bind="badgeProps"><slot /></span>
</template>
