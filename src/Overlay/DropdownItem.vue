<script setup>
  import { DROPDOWN_KEY } from '@overlay/dropdown'
  import { computed, inject } from 'vue'

  defineOptions({
    name: 'OverlayDropdownItem',
  })

  const emit = defineEmits(['select'])

  const props = defineProps({
    id: String,
    class: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    // Close the menu once the item is chosen.
    closeOnSelect: {
      type: Boolean,
      default: true,
    },
  })

  const dropdown = inject(DROPDOWN_KEY, null)

  function onClick() {
    emit('select')

    if (props.closeOnSelect) {
      dropdown?.close()
    }
  }

  const itemProps = computed(() => ({
    id: props.id,
    class: `dropdown-item ${props.class ?? ''}`.trim(),
    type: 'button',
    role: 'menuitem',
    disabled: props.disabled,
    // The arrow keys move the focus: only the code gives it, not the tab key.
    tabindex: -1,
  }))
</script>

<template>
  <button
    v-bind="itemProps"
    @click="onClick"
  >
    <slot />
  </button>
</template>
