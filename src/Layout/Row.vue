<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutRow',
  })

  const props = defineProps({
    id: String,
    class: String,
    row: {
      type: String,
      default: 'row',
    },
  })

  const rowProps = computed(() => ({
    id: props.id,
    class: `${props.row} ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="rowProps">
    <slot />
  </div>
</template>
