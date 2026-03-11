<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutContainer',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const containerProps = computed(() => ({
    id: props.id,
    class: `container ${props.class ?? ''}`.trim(),
    role: props.role,
  }))
</script>

<template>
  <div v-bind="containerProps">
    <slot />
  </div>
</template>
