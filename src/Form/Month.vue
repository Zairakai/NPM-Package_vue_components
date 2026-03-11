<script setup>
  import { computed } from 'vue'

  import FormInput from '@form/Input.vue'

  defineOptions({
    name: 'FormInputMonth',
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
    pattern: {
      type: String,
      default: '[0-9]{4}-[0-9]{2}',
    },
  })
</script>

<template>
  <FormInput
    v-bind="$attrs"
    v-model="localValue"
    type="month"
    :pattern="props.pattern"
    @is-valid="emit('isValid', $event)"
  />
</template>
