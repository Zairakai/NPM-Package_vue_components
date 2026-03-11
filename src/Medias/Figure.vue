<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaFigure',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  const figureProps = computed(() => ({
    id: props.id,
    class: props.class,
  }))
</script>

<template>
  <figure v-bind="figureProps">
    <slot />
  </figure>
</template>
