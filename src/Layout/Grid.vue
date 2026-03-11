<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutGrid',
  })

  const props = defineProps({
    id: String,
    class: String,
    columns: String,
  })

  const gridProps = computed(() => {
    const result = {}

    if (props.id) {
      result.id = props.id
    }

    result.class = props.class ?? 'grid'

    if (undefined !== props.columns) {
      result.class += ` grid-cols-${props.columns}`
    }

    return result
  })
</script>

<template>
  <div v-bind="gridProps">
    <slot />
  </div>
</template>
