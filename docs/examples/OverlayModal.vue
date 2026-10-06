<script setup>
  import { ref } from 'vue'

  const open = ref(false)
</script>

<template>
  <button
    type="button"
    @click="open = true"
  >
    Open the dialog
  </button>
  <OverlayModal
    v-model="open"
    title="A native dialog"
    closedby="any"
  >
    It uses the dialog element: Escape and a click outside close it.
    <template #footer>
      <button
        type="button"
        @click="open = false"
      >
        Close
      </button>
    </template>
  </OverlayModal>
</template>
