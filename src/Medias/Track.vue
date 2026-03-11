<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaTrack',
  })

  const props = defineProps({
    src: {
      type: String,
      required: true,
    },
    label: String,
    default: {
      type: Boolean,
      default: false,
    },
    kind: String,
    srclang: String,
  })

  const trackProps = computed(() => ({
    src: props.src,
    label: props.label,
    default: props.default,
    kind: props.kind,
    srclang: props.srclang,
  }))
</script>

<template>
  <track v-bind="trackProps" />
</template>
