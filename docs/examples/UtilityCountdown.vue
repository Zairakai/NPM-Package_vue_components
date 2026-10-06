<script setup>
  const target = Date.now() + 1000 * 60 * 60 * 26
</script>

<template>
  <UtilityCountdown
    :target="target"
    show-days
  />
</template>
