<script setup>
  import { computed } from 'vue'

  import FormInput from '@form/Input.vue'

  defineOptions({
    name: 'FormInputHidden',
    inheritAttrs: false,
  })

  const emit = defineEmits(['update:modelValue', 'isValid'])

  const localValue = computed({
    get: () => props.modelValue,
    set: (newValue) => emit('update:modelValue', newValue),
  })

  const props = defineProps({
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null,
    },
  })
</script>

<template>
  <FormInput
    v-bind="$attrs"
    v-model="localValue"
    type="hidden"
    :field="false"
    @is-valid="emit('isValid', $event)"
  />
</template>
