<script setup>
  import { CHIP_GROUP_KEY } from '@display/chip'
  import { computed, inject, ref } from 'vue'

  defineOptions({
    name: 'DisplayChip',
  })

  const emit = defineEmits(['update:selected', 'remove'])

  const props = defineProps({
    id: String,
    class: String,
    variant: {
      type: String,
      default: 'default',
      validator(value) {
        return ['default', 'info', 'success', 'warning', 'error'].includes(value)
      },
    },
    // Inside a chip group: the value it adds to the selection.
    value: String,
    // A chip that can be chosen: it becomes a toggle button.
    selectable: {
      type: Boolean,
      default: false,
    },
    selected: {
      type: Boolean,
      default: undefined,
    },
    // A chip that can be removed: a button next to it.
    removable: {
      type: Boolean,
      default: false,
    },
    removeLabel: {
      type: String,
      default: 'Remove',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const group = inject(CHIP_GROUP_KEY, null)
  const own = ref(false)

  const isSelected = computed(() => {
    if (undefined !== props.selected) {
      return props.selected
    }

    return group && undefined !== props.value ? group.selected.value.includes(props.value) : own.value
  })

  const interactive = computed(() => props.selectable || Boolean(group))

  function toggle() {
    const next = !isSelected.value

    if (group && undefined !== props.value) {
      group.toggle(props.value)
    } else {
      own.value = !own.value
    }

    emit('update:selected', next)
  }

  const chipProps = computed(() => ({
    id: props.id,
    class: `chip ${props.class ?? ''}`.trim(),
    'data-variant': props.variant,
    'data-selected': isSelected.value ? '' : undefined,
    'data-disabled': props.disabled ? '' : undefined,
  }))
</script>

<template>
  <span v-bind="chipProps">
    <span
      v-if="$slots.icon"
      class="chip-icon"
      aria-hidden="true"
    >
      <slot name="icon" />
    </span>
    <button
      v-if="interactive"
      type="button"
      class="chip-label"
      :aria-pressed="isSelected"
      :disabled="disabled"
      @click="toggle"
    >
      <slot />
    </button>
    <span
      v-else
      class="chip-label"
    >
      <slot />
    </span>
    <button
      v-if="removable"
      type="button"
      class="chip-remove"
      :aria-label="removeLabel"
      :disabled="disabled"
      @click="emit('remove')"
    >
      &times;
    </button>
  </span>
</template>
