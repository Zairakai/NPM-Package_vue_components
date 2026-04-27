<script setup>
  import { computed } from 'vue'

  import FormInput from '@form/Input.vue'

  defineOptions({
    name: 'FormInputPassword',
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
      // Fall back to 8 when the env var is not set at package build time.
      default: `^.{${import.meta.env.VITE_AUTH_MIN_CHARACTERS ?? '8'},}`,
    },
  })
</script>

<template>
  <FormInput
    v-bind="$attrs"
    v-model="localValue"
    type="password"
    :pattern="pattern"
    @is-valid="emit('isValid', $event)"
  />
</template>
