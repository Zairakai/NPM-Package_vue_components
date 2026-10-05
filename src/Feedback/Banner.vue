<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { computed } from 'vue'

  defineOptions({
    name: 'FeedbackBanner',
  })

  const emit = defineEmits(['update:modelValue', 'dismiss'])

  const props = defineProps({
    id: String,
    class: String,
    // Whether it shows.
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
    dismissible: {
      type: Boolean,
      default: false,
    },
    // Remember the dismissal in the browser under this key, so it does not come back at each visit.
    storageKey: String,
    dismissLabel: {
      type: String,
      default: 'Dismiss',
    },
  })

  function dismissed() {
    try {
      return Boolean(props.storageKey) && '1' === window.localStorage.getItem(props.storageKey)
    } catch {
      return false
    }
  }

  const state = useControllable(props, 'modelValue', emit, !dismissed())

  function dismiss() {
    state.value = false
    emit('dismiss')

    try {
      if (props.storageKey) {
        window.localStorage.setItem(props.storageKey, '1')
      }
    } catch {
      // Storage can be blocked: it only stays hidden for the page.
    }
  }

  const bannerProps = computed(() => ({
    id: props.id,
    class: `banner ${props.class ?? ''}`.trim(),
    'data-variant': props.variant,
    role: 'error' === props.variant || 'warning' === props.variant ? 'alert' : 'status',
  }))
</script>

<template>
  <div
    v-if="state"
    v-bind="bannerProps"
  >
    <div
      v-if="$slots.icon"
      class="banner-icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </div>
    <div class="banner-content">
      <slot />
    </div>
    <div
      v-if="$slots.actions"
      class="banner-actions"
    >
      <slot name="actions" />
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="banner-dismiss"
      :aria-label="dismissLabel"
      @click="dismiss"
    >
      &times;
    </button>
  </div>
</template>
