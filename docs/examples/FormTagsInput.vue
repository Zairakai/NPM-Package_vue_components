<script setup>
  import { ref } from 'vue'

  const tags = ref(['one', 'two'])
</script>

<template>
  <FormTagsInput
    v-model="tags"
    label="Tags"
    placeholder="Type, then Enter or comma"
  />
</template>
