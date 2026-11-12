<script setup>
defineOptions({
  name: 'FormAdditional',
})

defineProps({
  text: String,
  counter: String,
})
</script>

<template>
  <div data-additional>
    <span class="supporting-text">{{ text }}</span>
    <span class="character-counter">{{ counter }}</span>
  </div>
</template>
