<script setup>
  import FormCombobox from '@form/Combobox.vue'

  defineOptions({
    name: 'FormMultiSelect',
    inheritAttrs: false,
  })

  defineEmits(['update:modelValue'])

  defineProps({
    modelValue: {
      type: Array,
      default: () => [],
    },
  })
</script>

<template>
  <FormCombobox
    v-bind="$attrs"
    :model-value="modelValue"
    multiple
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template
      v-if="$slots.option"
      #option="slotProps"
    >
      <slot
        name="option"
        v-bind="slotProps"
      />
    </template>
  </FormCombobox>
</template>
