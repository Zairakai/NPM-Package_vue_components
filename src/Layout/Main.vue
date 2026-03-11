<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutMain',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const mainProps = computed(() => ({
    id: props.id,
    class: props.class,
    role: props.role,
  }))
</script>

<template>
  <main v-bind="mainProps">
    <slot />
  </main>
</template>
