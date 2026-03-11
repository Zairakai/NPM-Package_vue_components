<script setup>
  defineOptions({
    name: 'LayoutLoader',
  })

  const _props = defineProps({
    isLoading: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      default: '',
    },
  })
</script>

<template>
  <template v-if="isLoading">
    <div id="loader">
      <span id="loaderAnimated" />
      <span id="loaderText">{{ status }}</span>
    </div>
  </template>

  <template v-else>
    <slot />
  </template>
</template>
