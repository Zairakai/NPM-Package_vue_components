<script setup>
  import { ref } from 'vue'

  const score = ref(3.5)
</script>

<template>
  <FormRating
    v-model="score"
    label="Your score"
    half
  />
  <p>Score: {{ score }}</p>
</template>
