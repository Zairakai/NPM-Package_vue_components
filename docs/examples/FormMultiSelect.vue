<script setup>
  import { ref } from 'vue'

  const tags = ref(['vue'])
</script>

<template>
  <FormMultiSelect
    v-model="tags"
    :options="['vue', 'svelte', 'solid', 'react']"
    label="Frameworks"
  />
</template>
