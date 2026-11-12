<script setup>
import { computed, ref } from 'vue'

import FormAdditional from './Additional.vue'
import FormField from './Field.vue'
import FormLabel from './Label.vue'

defineOptions({
  name: 'FormTextarea',
})

const emit = defineEmits(['update:modelValue', 'isValid'])

const textareaRef = ref()
const isValid = ref(true)

const localValue = computed({
  get: () => props.modelValue,
  set: (newValue) => {
    if (textareaRef.value?.checkValidity()) {
      isValid.value = true
    } else {
      isValid.value = false
    }

    emit('update:modelValue', newValue)
    emit('isValid', isValid.value)
  },
})

const props = defineProps({
  id: String,
  name: {
    type: String,
    required: true,
  },
  form: String,
  modelValue: String,
  placeholder: String,
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
  autofocus: {
    type: Boolean,
    default: false,
  },
  class: String,
  rows: {
    type: Number,
    default: 4,
  },
  cols: {
    type: Number,
    default: 50,
  },
  maxlength: {
    type: Number,
  },
  wrap: String,
  dirname: String,
  label: String,
  labelAfter: {
    type: Boolean,
    default: false,
  },
  fieldClass: String,
  iconBefore: String,
  iconAfter: String,
  prefix: String,
  suffix: String,
  supportingText: String,
  supportingCounter: String,
  errorMessage: String,
  field: {
    type: Boolean,
    default: true,
  },
})

const textareaProps = computed(() => ({
  id: props.id,
  name: props.name,
  placeholder: props.placeholder,
  form: props.form,
  required: props.required,
  disabled: props.disabled,
  readonly: props.readonly,
  autofocus: props.autofocus,
  class: props.class,
  rows: props.rows,
  cols: props.cols,
  maxlength: props.maxlength,
  wrap: props.wrap,
  dirname: props.dirname,
}))

const labelProps = computed(() => ({
  id: props.id,
  label: props.label,
  iconBefore: props.iconBefore,
  iconAfter: props.iconAfter,
  prefix: props.prefix,
  suffix: props.suffix,
}))
</script>

<template>
  <FormField :name="name">
    <template v-if="field && label && !labelAfter">
      <FormLabel v-bind="labelProps" />
    </template>

    <div data-input>
      <span v-if="iconBefore || $slots['icon-before']" data-leading-icon
        ><slot name="icon-before">{{ iconBefore }}</slot></span
      >

      <span v-if="prefix || $slots['prefix']" data-prefix
        ><slot name="prefix">{{ prefix }}</slot></span
      >

      <textarea ref="textareaRef" v-bind="textareaProps" v-model="localValue" />

      <span v-if="suffix || $slots['suffix']" data-suffix
        ><slot name="suffix">{{ suffix }}</slot></span
      >

      <span v-if="iconAfter || $slots['icon-after']" data-trailing-icon
        ><slot name="icon-after">{{ iconAfter }}</slot></span
      >
    </div>

    <template v-if="field && label && labelAfter">
      <FormLabel v-bind="labelProps" />
    </template>

    <FormAdditional v-if="errorMessage" :text="errorMessage" />
  </FormField>
</template>
