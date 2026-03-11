<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutFlexItem',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  const itemProps = computed(() => ({
    id: props.id,
    class: props.class,
  }))
</script>

<template>
  <div v-bind="itemProps">
    <slot />
  </div>
</template>
