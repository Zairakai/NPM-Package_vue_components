<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutFooter',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const footerProps = computed(() => ({
    id: props.id,
    class: props.class,
    role: props.role,
  }))
</script>

<template>
  <footer v-bind="footerProps">
    <slot />
  </footer>
</template>
