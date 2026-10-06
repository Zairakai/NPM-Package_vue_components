<script setup>
  import { ref } from 'vue'

  const page = ref(3)
</script>

<template>
  <NavigationPagination
    v-model="page"
    :pages="12"
  />
  <p>Page {{ page }}</p>
</template>
