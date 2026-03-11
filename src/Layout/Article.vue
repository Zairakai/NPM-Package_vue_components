<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutArticle',
  })

  const props = defineProps({
    id: String,
    class: String,
    lang: String,
    role: String,
  })

  const articleProps = computed(() => ({
    id: props.id,
    class: props.class,
    lang: props.lang,
    role: props.role,
  }))
</script>

<template>
  <article v-bind="articleProps">
    <slot />
  </article>
</template>
