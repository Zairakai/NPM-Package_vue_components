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
    <span
      class="supporting-text"
      v-html="text"
    />
    <span
      class="character-counter"
      v-html="counter"
    />
  </div>
</template>
