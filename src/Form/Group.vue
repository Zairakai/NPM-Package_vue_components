<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'FormGroup',
  })

  const props = defineProps({
    class: String,
    errors: {
      type: Object,
      default: () => ({}),
    },
  })

  const computedClasses = computed(() => {
    let classes = ''
    if (props.class) {
      classes += props.class
    }
    if (props.name && props.errors[props.name]) {
      classes += ' error'
    }
    return classes.trim()
  })
</script>

<template>
  <div :class="computedClasses">
    <slot />
  </div>
</template>
