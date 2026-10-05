<script setup>
  import OverlayModal from '@overlay/Modal.vue'
  import { ref } from 'vue'

  defineOptions({
    name: 'OverlayDialog',
  })

  const emit = defineEmits(['update:modelValue', 'confirm', 'cancel', 'close'])

  defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    title: String,
    message: String,
    confirmLabel: {
      type: String,
      default: 'OK',
    },
    cancelLabel: {
      type: String,
      default: 'Cancel',
    },
    // An alert has only one button: the user can only acknowledge it.
    alert: {
      type: Boolean,
      default: false,
    },
  })

  const modal = ref(null)

  // The buttons of a <form method="dialog"> close the dialog and give their value as the result.
  // The submit is handled here so it also works where <dialog> does not exist.
  function onSubmit(event) {
    modal.value.close(event.submitter?.value ?? 'confirm')
  }

  function onClose(result) {
    emit('close', result)
    emit('confirm' === result ? 'confirm' : 'cancel')
  }
</script>

<template>
  <OverlayModal
    ref="modal"
    :id="id"
    :class="`dialog ${$props.class ?? ''}`.trim()"
    :model-value="modelValue"
    :title="title"
    :alert="alert"
    :close-button="false"
    :closedby="alert ? 'none' : 'closerequest'"
    @update:model-value="emit('update:modelValue', $event)"
    @close="onClose"
  >
    <p class="dialog-message">
      <slot>{{ message }}</slot>
    </p>
    <template #footer>
      <form
        method="dialog"
        class="dialog-actions"
        @submit.prevent="onSubmit"
      >
        <button
          v-if="!alert"
          type="submit"
          value="cancel"
          formnovalidate
        >
          {{ cancelLabel }}
        </button>
        <button
          type="submit"
          value="confirm"
          autofocus
        >
          {{ confirmLabel }}
        </button>
      </form>
    </template>
  </OverlayModal>
</template>
