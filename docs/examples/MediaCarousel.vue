<script setup>
  const slides = ['First slide', 'Second slide', 'Third slide']
</script>

<template>
  <MediaCarousel
    :items="slides"
    label="Slides"
  />
</template>
