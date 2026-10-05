<script setup>
  import OverlayModal from '@overlay/Modal.vue'
  import { computed } from 'vue'

  defineOptions({
    name: 'OverlayDrawer',
  })

  const emit = defineEmits(['update:modelValue', 'open', 'close', 'cancel'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    queryParam: String,
    title: String,
    // The edge it slides from. "bottom" is a bottom sheet.
    placement: {
      type: String,
      default: 'right',
      validator(value) {
        return ['left', 'right', 'top', 'bottom'].includes(value)
      },
    },
    closedby: {
      type: String,
      default: 'any',
      validator(value) {
        return ['any', 'closerequest', 'none'].includes(value)
      },
    },
    closeLabel: {
      type: String,
      default: 'Close',
    },
  })

  // Functional CSS only: a drawer sticks to its edge and uses the whole side.
  // border-box: the size includes the padding and the border, so it never exceeds the window.
  const style = computed(() => {
    const size = 'var(--zk-drawer-size, 24rem)'

    return {
      left: {
        margin: '0 auto 0 0',
        width: size,
        maxWidth: '100%',
        height: '100%',
        maxHeight: 'none',
        boxSizing: 'border-box',
      },
      right: {
        margin: '0 0 0 auto',
        width: size,
        maxWidth: '100%',
        height: '100%',
        maxHeight: 'none',
        boxSizing: 'border-box',
      },
      top: {
        margin: '0 0 auto 0',
        width: '100%',
        maxWidth: 'none',
        height: size,
        maxHeight: '100%',
        boxSizing: 'border-box',
      },
      bottom: {
        margin: 'auto 0 0 0',
        width: '100%',
        maxWidth: 'none',
        height: size,
        maxHeight: '100%',
        boxSizing: 'border-box',
      },
    }[props.placement]
  })
</script>

<template>
  <OverlayModal
    :id="id"
    :class="`drawer ${$props.class ?? ''}`.trim()"
    :data-placement="placement"
    :style="style"
    :model-value="modelValue"
    :query-param="queryParam"
    :title="title"
    :closedby="closedby"
    :close-label="closeLabel"
    @update:model-value="emit('update:modelValue', $event)"
    @open="emit('open')"
    @close="emit('close', $event)"
    @cancel="emit('cancel', $event)"
  >
    <slot />
    <template
      v-if="$slots.header"
      #header
    >
      <slot name="header" />
    </template>
    <template
      v-if="$slots.footer"
      #footer="slotProps"
    >
      <slot
        name="footer"
        v-bind="slotProps"
      />
    </template>
  </OverlayModal>
</template>
