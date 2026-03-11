<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutNavigation',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const navProps = computed(() => ({
    id: props.id,
    class: props.class,
    role: props.role,
  }))
</script>

<template>
  <nav v-bind="navProps">
    <slot />
  </nav>
</template>
