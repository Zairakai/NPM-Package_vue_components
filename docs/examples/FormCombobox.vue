<script setup>
  import { ref } from 'vue'

  const fruit = ref('')
  const fruits = ['Apple', 'Banana', 'Cherry', 'Date', 'Elderberry']
</script>

<template>
  <FormCombobox
    v-model="fruit"
    :options="fruits"
    label="Fruit"
    placeholder="Type to filter"
  />
  <p>Value: {{ fruit || 'none' }}</p>
</template>
