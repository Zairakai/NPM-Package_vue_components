<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentCallout',
  })

  const props = defineProps({
    id: String,
    class: String,
    variant: {
      type: String,
      default: 'note',
      validator(value) {
        return ['note', 'tip', 'warning', 'danger'].includes(value)
      },
    },
    // The title. By default the name of the variant ("Note", "Tip"...).
    title: String,
  })

  const heading = computed(() => props.title ?? props.variant.charAt(0).toUpperCase() + props.variant.slice(1))

  const calloutProps = computed(() => ({
    id: props.id,
    class: `callout ${props.class ?? ''}`.trim(),
    role: 'note',
    'data-variant': props.variant,
  }))
</script>

<template>
  <aside v-bind="calloutProps">
    <p class="callout-title">
      <span
        v-if="$slots.icon"
        class="callout-icon"
        aria-hidden="true"
      >
        <slot name="icon" />
      </span>
      {{ heading }}
    </p>
    <div class="callout-body">
      <slot />
    </div>
  </aside>
</template>
