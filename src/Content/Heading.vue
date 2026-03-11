<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentHeading',
  })

  const props = defineProps({
    level: {
      type: Number,
      default: 1,
      validator(value) {
        return 1 <= value && 6 >= value
      },
    },
    id: String,
    class: String,
  })

  const headingProps = computed(() => ({
    id: props.id,
    class: props.class,
  }))
</script>

<template>
  <component
    :is="`h${level}`"
    v-bind="headingProps"
  >
    <slot />
  </component>
</template>
