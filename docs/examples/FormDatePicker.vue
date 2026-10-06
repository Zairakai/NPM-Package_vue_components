<script setup>
  import { ref } from 'vue'

  const range = ref({ start: '2026-10-06', end: '2026-10-09' })
</script>

<template>
  <FormDatePicker
    v-model="range"
    range
    label="Stay"
    locale="en-GB"
  />
</template>
