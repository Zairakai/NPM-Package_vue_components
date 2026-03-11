<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'MediaObject',
  })

  const props = defineProps({
    id: String,
    class: String,
    data: {
      type: String,
      required: true,
    },
    type: String,
    width: [String, Number],
    height: [String, Number],
    name: String,
    form: String,
  })

  const objectProps = computed(() => ({
    id: props.id,
    class: props.class,
    data: props.data,
    type: props.type,
    width: props.width,
    height: props.height,
    name: props.name,
    form: props.form,
  }))
</script>

<template>
  <object v-bind="objectProps">
    <slot />
  </object>
</template>
