<script setup>
  import FormButton from '@form/Button.vue'

  defineOptions({
    name: 'SubmitButton',
    inheritAttrs: false,
  })
</script>

<template>
  <FormButton
    type="submit"
    v-bind="$attrs"
  >
    <slot />
  </FormButton>
</template>
