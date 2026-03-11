<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaIframe',
  })

  const props = defineProps({
    id: String,
    class: String,
    src: String,
    srcdoc: String,
    width: [String, Number],
    height: [String, Number],
    allow: String,
    allowfullscreen: {
      type: Boolean,
      default: false,
    },
    allowpaymentrequest: {
      type: Boolean,
      default: false,
    },
    loading: String,
    name: String,
    referrerpolicy: String,
    sandbox: String,
  })

  const iframeProps = computed(() => ({
    id: props.id,
    class: props.class,
    src: props.src,
    srcdoc: props.srcdoc,
    width: props.width,
    height: props.height,
    allow: props.allow,
    allowfullscreen: props.allowfullscreen,
    allowpaymentrequest: props.allowpaymentrequest,
    loading: props.loading,
    name: props.name,
    referrerpolicy: props.referrerpolicy,
    sandbox: props.sandbox,
  }))
</script>

<template>
  <iframe v-bind="iframeProps">
    <slot></slot>
  </iframe>
</template>
