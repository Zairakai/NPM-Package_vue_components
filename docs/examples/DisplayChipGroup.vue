<script setup>
  import { ref } from 'vue'

  const selected = ref(['vue'])
</script>

<template>
  <DisplayChipGroup
    v-model="selected"
    label="Frameworks"
  >
    <DisplayChip value="vue">Vue</DisplayChip>
    <DisplayChip value="svelte">Svelte</DisplayChip>
    <DisplayChip value="solid">Solid</DisplayChip>
  </DisplayChipGroup>
  <p>Selected: {{ selected.join(', ') || 'none' }}</p>
</template>
