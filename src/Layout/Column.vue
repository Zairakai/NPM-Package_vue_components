<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutColumn',
  })

  const props = defineProps({
    id: String,
    class: String,
    col: {
      type: String,
      default: 'col',
    },
  })

  const columnProps = computed(() => ({
    id: props.id,
    class: `${props.col} ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="columnProps">
    <slot />
  </div>
</template>
