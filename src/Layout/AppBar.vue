<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutAppBar',
  })

  const props = defineProps({
    id: String,
    class: String,
    title: String,
    // A smaller bar.
    dense: {
      type: Boolean,
      default: false,
    },
    // Stays at the top of the page while it scrolls.
    sticky: {
      type: Boolean,
      default: false,
    },
  })

  const barProps = computed(() => ({
    id: props.id,
    class: `app-bar ${props.class ?? ''}`.trim(),
    'data-dense': props.dense ? '' : undefined,
    'data-sticky': props.sticky ? '' : undefined,
    // Functional CSS only: the position.
    style: props.sticky ? { position: 'sticky', top: 0 } : undefined,
  }))
</script>

<template>
  <header v-bind="barProps">
    <div class="app-bar-leading">
      <slot name="leading" />
    </div>
    <div class="app-bar-title">
      <slot name="title">{{ title }}</slot>
    </div>
    <div class="app-bar-trailing">
      <slot name="trailing" />
    </div>
    <slot />
  </header>
</template>
