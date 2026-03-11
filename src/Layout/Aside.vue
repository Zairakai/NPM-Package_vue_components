<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutAside',
  })

  const props = defineProps({
    id: String,
    class: String,
    role: String,
  })

  const asideProps = computed(() => ({
    id: props.id,
    class: props.class,
    role: props.role,
  }))
</script>

<template>
  <aside v-bind="asideProps">
    <slot />
  </aside>
</template>
