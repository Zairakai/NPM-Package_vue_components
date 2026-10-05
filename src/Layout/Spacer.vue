<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutSpacer',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  // Takes the free room of a flex container.
  const spacerProps = computed(() => ({
    id: props.id,
    class: `spacer ${props.class ?? ''}`.trim(),
    'aria-hidden': 'true',
    style: { flexGrow: 1 },
  }))
</script>

<template>
  <div v-bind="spacerProps"></div>
</template>
