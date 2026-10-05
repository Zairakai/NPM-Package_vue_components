<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { computed } from 'vue'

  defineOptions({
    name: 'FeedbackAlert',
  })

  const emit = defineEmits(['update:modelValue', 'close'])

  const props = defineProps({
    id: String,
    class: String,
    // Whether the alert is shown. Use it with v-model, it works without too.
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    variant: {
      type: String,
      default: 'info',
      validator(value) {
        return ['info', 'success', 'warning', 'error'].includes(value)
      },
    },
    title: String,
    dismissible: {
      type: Boolean,
      default: false,
    },
    closeLabel: {
      type: String,
      default: 'Close',
    },
  })

  const visible = useControllable(props, 'modelValue', emit, true)

  function close() {
    visible.value = false
    emit('close')
  }

  const alertProps = computed(() => ({
    id: props.id,
    class: `alert ${props.class ?? ''}`.trim(),
    role: ['warning', 'error'].includes(props.variant) ? 'alert' : 'status',
    'data-variant': props.variant,
  }))
</script>

<template>
  <div
    v-if="visible"
    v-bind="alertProps"
  >
    <span
      v-if="$slots.icon"
      class="alert-icon"
    >
      <slot name="icon" />
    </span>
    <div class="alert-body">
      <p
        v-if="$slots.title || title"
        class="alert-title"
      >
        <slot name="title">{{ title }}</slot>
      </p>
      <div class="alert-content">
        <slot />
      </div>
    </div>
    <div
      v-if="$slots.actions"
      class="alert-actions"
    >
      <slot name="actions" />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="alert-close"
      :aria-label="closeLabel"
      @click="close"
    >
      <slot name="close">&times;</slot>
    </button>
  </div>
</template>
