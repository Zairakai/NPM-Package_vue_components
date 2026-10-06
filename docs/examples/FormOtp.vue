<script setup>
  import { ref } from 'vue'

  const code = ref('')
</script>

<template>
  <FormOtp
    v-model="code"
    :length="6"
  />
  <p>Code: {{ code || '…' }}</p>
</template>
