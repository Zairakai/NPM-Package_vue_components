<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutFlex',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  const flexProps = computed(() => {
    const result = {}

    if (props.id) {
      result.id = props.id
    }

    result.class = props.class ?? 'flex'

    return result
  })
</script>

<template>
  <div v-bind="flexProps">
    <slot />
  </div>
</template>
