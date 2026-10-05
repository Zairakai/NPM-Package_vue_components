<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayDivider',
  })

  const props = defineProps({
    id: String,
    class: String,
    orientation: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value)
      },
    },
  })

  const dividerProps = computed(() => ({
    id: props.id,
    class: `divider ${props.class ?? ''}`.trim(),
    'data-orientation': props.orientation,
  }))
</script>

<template>
  <hr
    v-if="'horizontal' === orientation && !$slots.default"
    v-bind="dividerProps"
  />
  <div
    v-else
    v-bind="dividerProps"
    role="separator"
    :aria-orientation="orientation"
  >
    <span
      v-if="$slots.default"
      class="divider-label"
    >
      <slot />
    </span>
  </div>
</template>
