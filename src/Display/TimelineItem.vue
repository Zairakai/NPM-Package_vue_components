<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'DisplayTimelineItem',
  })

  const props = defineProps({
    id: String,
    class: String,
    title: String,
    // The date or time, as a machine readable value (2026-10-05) for the <time> element.
    datetime: String,
    // The text shown for it. By default the machine readable value.
    time: String,
    variant: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'info', 'success', 'warning', 'error'].includes(value)
      },
    },
  })

  const itemProps = computed(() => ({
    id: props.id,
    class: `timeline-item ${props.class ?? ''}`.trim(),
    'data-variant': props.variant,
  }))
</script>

<template>
  <li v-bind="itemProps">
    <span
      class="timeline-marker"
      aria-hidden="true"
    >
      <slot name="marker" />
    </span>
    <div class="timeline-content">
      <time
        v-if="datetime || time"
        class="timeline-time"
        :datetime="datetime"
      >
        {{ time ?? datetime }}
      </time>
      <p
        v-if="title || $slots.title"
        class="timeline-title"
      >
        <slot name="title">{{ title }}</slot>
      </p>
      <div class="timeline-body">
        <slot />
      </div>
    </div>
  </li>
</template>
