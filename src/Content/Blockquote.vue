<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentBlockquote',
  })

  const props = defineProps({
    cite: String,
    class: String,
  })

  const blockquoteProps = computed(() => ({
    cite: props.cite,
    class: props.class,
  }))
</script>

<template>
  <blockquote v-bind="blockquoteProps">
    <slot />
  </blockquote>
</template>
