<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentCode',
  })

  const props = defineProps({
    id: String,
    class: String,
  })

  const codeProps = computed(() => ({
    id: props.id,
    class: `code ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <code v-bind="codeProps"><slot /></code>
</template>
