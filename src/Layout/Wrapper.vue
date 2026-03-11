<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutWrapper',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  const sectionProps = computed(() => ({
    id: props.id,
    class: `wrapper ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="sectionProps">
    <slot />
  </div>
</template>
