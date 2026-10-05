<script setup>
  import { useToast } from '@/composables/useToast'
  import { computed, onMounted, ref } from 'vue'

  defineOptions({
    name: 'FeedbackToastContainer',
  })

  const props = defineProps({
    id: String,
    class: String,
    position: {
      type: String,
      default: 'top-right',
      validator(value) {
        return ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right'].includes(value)
      },
    },
    label: {
      type: String,
      default: 'Notifications',
    },
    closeLabel: {
      type: String,
      default: 'Close',
    },
  })

  const { toasts, remove, pause, resume } = useToast()
  const root = ref(null)

  // A manual popover lives in the top layer: the toasts stay above the modal dialogs.
  onMounted(() => {
    if ('function' === typeof root.value?.showPopover) {
      root.value.showPopover()
    }
  })

  // Functional CSS only: the container has to stay on top of the page, in its corner.
  const style = computed(() => {
    const [vertical, horizontal] = props.position.split('-')

    return {
      // Reset what the browser gives to a popover, then pin it in its corner.
      inset: 'auto',
      margin: '0',
      padding: '0',
      border: '0',
      background: 'transparent',
      overflow: 'visible',
      position: 'fixed',
      zIndex: 'var(--zk-z-toast, 1200)',
      [vertical]: '1rem',
      ...('center' === horizontal ? { left: '50%', transform: 'translateX(-50%)' } : { [horizontal]: '1rem' }),
    }
  })

  const containerProps = computed(() => ({
    id: props.id,
    class: `toast-container ${props.class ?? ''}`.trim(),
    role: 'region',
    popover: 'manual',
    'aria-label': props.label,
    'data-position': props.position,
    style: style.value,
  }))
</script>

<template>
  <section
    ref="root"
    v-bind="containerProps"
  >
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :role="['warning', 'error'].includes(toast.variant) ? 'alert' : 'status'"
      :data-variant="toast.variant"
      @mouseenter="pause(toast.id)"
      @mouseleave="resume(toast.id)"
      @focusin="pause(toast.id)"
      @focusout="resume(toast.id)"
    >
      <p
        v-if="toast.title"
        class="toast-title"
      >
        {{ toast.title }}
      </p>
      <p class="toast-message">{{ toast.message }}</p>
      <button
        v-if="toast.dismissible"
        type="button"
        class="toast-close"
        :aria-label="closeLabel"
        @click="remove(toast.id)"
      >
        &times;
      </button>
    </div>
  </section>
</template>
