<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayCard',
  })

  const props = defineProps({
    id: String,
    class: String,
    as: {
      type: String,
      default: 'article',
    },
    title: String,
  })

  const cardProps = computed(() => ({
    id: props.id,
    class: `card ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <component
    :is="as"
    v-bind="cardProps"
  >
    <header
      v-if="$slots.header || title"
      class="card-header"
    >
      <slot name="header">{{ title }}</slot>
    </header>
    <div class="card-body">
      <slot />
    </div>
    <footer
      v-if="$slots.footer"
      class="card-footer"
    >
      <slot name="footer" />
    </footer>
  </component>
</template>
