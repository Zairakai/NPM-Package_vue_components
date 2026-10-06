<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutSticky',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The distance to the edge, any CSS length.
    offset: {
      type: String,
      default: '0',
    },
    edge: {
      type: String,
      default: 'top',
      validator(value) {
        return ['top', 'bottom'].includes(value)
      },
    },
    as: {
      type: String,
      default: 'div',
    },
  })

  const stickyProps = computed(() => ({
    id: props.id,
    class: `sticky ${props.class ?? ''}`.trim(),
    style: { position: 'sticky', [props.edge]: props.offset },
  }))
</script>

<template>
  <component
    :is="as"
    v-bind="stickyProps"
  >
    <slot />
  </component>
</template>
