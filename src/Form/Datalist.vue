<script setup>
  defineOptions({
    name: 'FormDatalist',
  })

  defineProps({
    id: {
      type: String,
      required: true,
    },

    options: {
      type: Object,
      required: true,
    },
  })
</script>

<template>
  <datalist :id="id">
    <option
      v-for="(label, value) in options"
      :key="value"
      :value="value"
      :label="label"
    />
  </datalist>
</template>
