<script setup>
  import { ref } from 'vue'

  const day = ref('2026-10-06')
</script>

<template>
  <FormCalendar
    v-model="day"
    locale="en-GB"
  />
  <p>Day: {{ day }}</p>
</template>
