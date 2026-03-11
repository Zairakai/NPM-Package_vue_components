<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaSource',
  })

  const props = defineProps({
    src: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    sizes: String,
    media: String,
    srcset: String,
  })

  const sourceProps = computed(() => ({
    src: props.src,
    type: props.type,
    sizes: props.sizes,
    media: props.media,
    srcset: props.srcset,
  }))
</script>

<template>
  <source v-bind="sourceProps" />
</template>
