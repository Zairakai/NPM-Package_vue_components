<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaCanvas',
  })

  const props = defineProps({
    id: String,
    class: String,
    width: [String, Number],
    height: [String, Number],
  })

  const canvasProps = computed(() => ({
    id: props.id,
    class: props.class,
    width: props.width,
    height: props.height,
  }))
</script>

<template>
  <canvas v-bind="canvasProps">
    <slot />
  </canvas>
</template>
