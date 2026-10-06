<script setup>
  import { ref } from 'vue'

  const selected = ref('a')
  const nodes = [
    {
      id: 'src',
      label: 'src',
      children: [
        { id: 'a', label: 'index.ts' },
        { id: 'b', label: 'utils.ts' },
      ],
    },
    { id: 'readme', label: 'README.md' },
  ]
</script>

<template>
  <NavigationTreeView
    v-model="selected"
    :nodes="nodes"
    label="Files"
    :expanded="['src']"
  />
</template>
