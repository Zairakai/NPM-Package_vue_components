<script setup>
  import { ref } from 'vue'

  const step = ref(1)
  const steps = [{ label: 'Account' }, { label: 'Address', description: 'Where to ship' }, { label: 'Payment' }]
</script>

<template>
  <NavigationStepper
    v-model="step"
    :steps="steps"
  />
</template>
