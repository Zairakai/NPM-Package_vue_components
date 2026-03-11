<script setup>
  import { computed } from 'vue'

  import LayoutContainer from '@layout/Container.vue'

  defineOptions({
    name: 'LayoutRow',
  })

  const props = defineProps({
    id: String,
    class: String,
    lang: String,
    role: String,
  })

  const sectionProps = computed(() => ({
    id: props.id,
    class: props.class,
    lang: props.lang,
    role: props.role,
  }))
</script>

<template>
  <section v-bind="sectionProps">
    <LayoutContainer>
      <slot />
    </LayoutContainer>
  </section>
</template>
