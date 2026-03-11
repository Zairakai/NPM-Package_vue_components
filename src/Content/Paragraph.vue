<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentParagraph',
  })

  const props = defineProps({
    id: String,
    class: String,
    html: {
      type: String,
      default: null,
    },
  })

  const paragraphProps = computed(() => ({
    id: props.id,
    class: props.class,
  }))
</script>

<template>
  <template v-if="null !== html">
    <p
      v-bind="paragraphProps"
      v-html="html"
    />
  </template>
  <template v-else>
    <p v-bind="paragraphProps">
      <slot />
    </p>
  </template>
</template>
