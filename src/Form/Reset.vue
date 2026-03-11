<script setup>
  import FormButton from '@form/Button.vue'

  defineOptions({
    name: 'ResetButton',
    inheritAttrs: false,
  })
</script>

<template>
  <FormButton
    type="reset"
    v-bind="$attrs"
  >
    <slot />
  </FormButton>
</template>
