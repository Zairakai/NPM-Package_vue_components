<script setup>
  import { computed, ref } from 'vue'

  import FormInput from '@form/Input.vue'

  defineOptions({
    name: 'FormInputCheckbox',
    inheritAttrs: false,
  })

  const emit = defineEmits(['update:modelValue', 'isValid'])

  const inputRef = ref()
  const isValid = ref(true)

  const localValue = computed({
    get: () => props.modelValue,
    set: (newValue) => {
      if (inputRef.value?.checkValidity()) {
        isValid.value = true
      } else {
        isValid.value = false
      }

      emit('update:modelValue', newValue)
      emit('isValid', isValid.value)
    },
  })

  const props = defineProps({
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null,
    },
    field: {
      type: Boolean,
      default: true,
    },
  })
</script>

<template>
  <template v-if="field">
    <FormInput
      v-bind="$attrs"
      v-model="localValue"
      type="checkbox"
      @is-valid="emit('isValid', $event)"
    />
  </template>

  <template v-else>
    <input
      ref="inputRef"
      v-bind="$attrs"
      v-model="localValue"
      type="checkbox"
    />
  </template>
</template>
