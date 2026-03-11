<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaImage',
  })

  const props = defineProps({
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    id: String,
    width: [String, Number],
    height: [String, Number],
    srcset: String,
    sizes: String,
    class: String,
    crossorigin: {
      type: String,
      default: null,
    },
    loading: String,
    longdesc: String,
    referrerpolicy: String,
    ismap: {
      type: Boolean,
      default: false,
    },
    usemap: String,
  })

  const getSrc = computed(() => {
    return props.src
  })

  const imgProps = computed(() => ({
    id: props.id,
    width: props.width,
    height: props.height,
    srcset: props.srcset,
    sizes: props.sizes,
    class: props.class,
    crossorigin: props.crossorigin,
    loading: props.loading,
    longdesc: props.longdesc,
    referrerpolicy: props.referrerpolicy,
    ismap: props,
    usemap: props.usemap,
  }))
</script>

<template>
  <img
    v-bind="imgProps"
    :src="getSrc"
    :alt="alt"
  />
</template>
