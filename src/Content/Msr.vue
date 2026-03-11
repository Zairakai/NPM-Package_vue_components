<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentMsr',
  })

  const props = defineProps({
    class: {
      type: String,
      default: '',
    },
  })

  const msrProps = computed(() => ({
    class: `msr ${props.class}`.trim(),
  }))
</script>

<template>
  <span v-bind="msrProps">
    <slot />
  </span>
</template>
