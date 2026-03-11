<script setup>
  import { computed } from 'vue'

  import FormCheckbox from '@form/Checkbox.vue'

  defineOptions({
    name: 'FormSwitch',
    inheritAttrs: false,
  })

  const emit = defineEmits(['update:modelValue', 'isValid'])

  const localValue = computed({
    get: () => props.modelValue,
    set: (newValue) => emit('update:modelValue', newValue),
  })

  const props = defineProps({
    id: String,
    name: String,
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null,
    },
    checked: String,
    class: String,
    label: String,
    fieldClass: String,
  })

  const switchProps = computed(() => ({
    id: props.id ?? `switch-${props.name}`,
    name: props.name,
    checked: props.checked,
    class: `switch ${props.class ?? ''}`.trim(),
    label: props.label,
    fieldClass: props.fieldClass,
  }))
</script>

<template>
  <FormCheckbox
    v-bind="switchProps"
    v-model="localValue"
    @is-valid="emit('isValid', $event)"
  />
</template>
