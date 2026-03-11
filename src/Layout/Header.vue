<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutHeader',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const headerProps = computed(() => ({
    id: props.id,
    class: props.class,
    role: props.role,
  }))
</script>

<template>
  <header v-bind="headerProps">
    <slot />
  </header>
</template>
