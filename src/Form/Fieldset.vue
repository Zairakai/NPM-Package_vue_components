<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'FormFieldset',
  })

  const props = defineProps({
    legend: String,
    legendBefore: {
      type: Boolean,
      default: false,
    },
    class: String,
  })

  const fieldsetProps = computed(() => ({
    class: props.class,
  }))
</script>

<template>
  <fieldset v-bind="fieldsetProps">
    <legend v-if="legend && legendBefore">
      {{ legend }}
    </legend>

    <slot />

    <legend v-if="legend && !legendBefore">
      {{ legend }}
    </legend>
  </fieldset>
</template>
