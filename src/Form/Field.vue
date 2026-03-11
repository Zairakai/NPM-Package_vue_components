<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'FormField',
  })

  const props = defineProps({
    class: String,
    field: {
      type: Boolean,
      default: true,
    },
    name: String,
  })

  const fieldsetProps = computed(() => ({
    class: `field ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <template v-if="field">
    <div v-bind="fieldsetProps">
      <slot />
    </div>
  </template>

  <template v-else>
    <slot />
  </template>
</template>
