<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { LIST_KEY } from '@display/list'
  import { computed, provide } from 'vue'

  defineOptions({
    name: 'DisplayList',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // "none", "single" or "multiple": whether the items can be chosen.
    selectable: {
      type: String,
      default: 'none',
      validator(value) {
        return ['none', 'single', 'multiple'].includes(value)
      },
    },
    // The chosen values: one in single mode, an array in multiple mode.
    modelValue: {
      type: [String, Array],
      default: undefined,
    },
    label: String,
  })

  const state = useControllable(props, 'modelValue', emit, 'multiple' === props.selectable ? [] : null)

  const chosen = computed(() => {
    if (Array.isArray(state.value)) {
      return state.value
    }

    return null === state.value || undefined === state.value ? [] : [state.value]
  })

  provide(LIST_KEY, {
    selectable: computed(() => props.selectable),
    isSelected: (value) => chosen.value.includes(value),
    toggle: (value) => {
      if ('multiple' === props.selectable) {
        state.value = chosen.value.includes(value)
          ? chosen.value.filter((item) => item !== value)
          : [...chosen.value, value]
      } else {
        state.value = chosen.value.includes(value) ? null : value
      }
    },
  })

  const listProps = computed(() => ({
    id: props.id,
    class: `list ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
    'data-selectable': 'none' === props.selectable ? undefined : props.selectable,
  }))
</script>

<template>
  <ul v-bind="listProps">
    <slot />
  </ul>
</template>
