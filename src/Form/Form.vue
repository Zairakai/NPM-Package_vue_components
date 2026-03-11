<script setup>
  defineOptions({
    name: 'FormComponent',
  })

  const _props = defineProps({
    id: String,
    autocomplete: {
      type: String,
      default: 'off',
    },
  })
</script>

<template>
  <form
    :id="id"
    :autocomplete="autocomplete"
  >
    <slot />
  </form>
</template>
