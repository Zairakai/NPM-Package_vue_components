<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { CHIP_GROUP_KEY } from '@display/chip'
  import { computed, provide } from 'vue'

  defineOptions({
    name: 'DisplayChipGroup',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The values of the chips that are chosen.
    modelValue: {
      type: Array,
      default: undefined,
    },
    // One chip at a time, or several.
    multiple: {
      type: Boolean,
      default: true,
    },
    label: String,
  })

  const selected = useControllable(props, 'modelValue', emit, [])

  provide(CHIP_GROUP_KEY, {
    selected,
    toggle: (value) => {
      if (selected.value.includes(value)) {
        selected.value = selected.value.filter((chosen) => chosen !== value)
      } else {
        selected.value = props.multiple ? [...selected.value, value] : [value]
      }
    },
  })

  const groupProps = computed(() => ({
    id: props.id,
    class: `chip-group ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
  }))
</script>

<template>
  <div v-bind="groupProps">
    <slot />
  </div>
</template>
