<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayEmptyState',
  })

  const props = defineProps({
    id: String,
    class: String,
    title: String,
    description: String,
  })

  const stateProps = computed(() => ({
    id: props.id,
    class: `empty-state ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div v-bind="stateProps">
    <div
      v-if="$slots.icon"
      class="empty-state-icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>
    <p
      v-if="title || $slots.title"
      class="empty-state-title"
    >
      <slot name="title">{{ title }}</slot>
    </p>
    <p
      v-if="description || $slots.default"
      class="empty-state-description"
    >
      <slot>{{ description }}</slot>
    </p>
    <div
      v-if="$slots.actions"
      class="empty-state-actions"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
