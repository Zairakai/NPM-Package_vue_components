<script setup>
  import { ref } from 'vue'

  const price = ref([20, 80])
</script>

<template>
  <FormRangeSlider
    v-model="price"
    label="Price"
    :value-text="(value) => `${value} euros`"
  />
</template>
