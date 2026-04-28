<script setup>
  import { computed, ref } from 'vue'
  import FormAdditional from './Additional.vue'
  import FormField from './Field.vue'
  import FormLabel from './Label.vue'

  defineOptions({
    name: 'FormInput',
  })

  const emit = defineEmits(['update:modelValue', 'isValid', 'focus', 'blur'])

  const inputRef = ref()
  const isValid = ref(true)

  const localValue = computed({
    get: () => props.value ?? props.modelValue,
    set: (newValue) => {
      if (inputRef.value?.checkValidity()) {
        isValid.value = true
      } else {
        isValid.value = false
      }

      if (null === props.value) {
        emit('update:modelValue', newValue)
      }

      emit('isValid', isValid.value)
    },
  })

  const props = defineProps({
    type: {
      type: String,
      default: 'text',
    },
    id: String,
    form: String,
    value: {
      type: [String, Number, Boolean],
      default: null,
    },
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    placeholder: String,
    list: String,
    required: {
      type: Boolean,
      default: false,
    },
    autocomplete: String,
    pattern: String,
    min: String,
    max: String,
    step: String,
    maxlength: Number,
    minlength: Number,
    accept: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    class: String,
    width: String,
    height: String,
    size: Number,
    label: String,
    labelAfter: {
      type: Boolean,
      default: false,
    },
    fieldClass: {
      type: String,
    },
    field: {
      type: Boolean,
      default: true,
    },
    iconBefore: String,
    iconAfter: String,
    prefix: String,
    suffix: String,
    errorMessage: {
      type: String,
    },
  })

  const inputProps = computed(() => ({
    type: props.type,
    id: props.id,
    form: props.form,
    name: props.name,
    placeholder: props.placeholder ?? '',
    list: props.list,
    required: props.required,
    autocomplete: props.autocomplete,
    pattern: props.pattern,
    min: props.min,
    max: props.max,
    step: props.step,
    maxlength: props.maxlength,
    minlength: props.minlength,
    accept: props.accept,
    disabled: props.disabled,
    readonly: props.readonly,
    multiple: props.multiple,
    autofocus: props.autofocus,
    class: props.class,
    style: {
      ...(props.width ? { width: props.width } : {}),
      ...(props.height ? { height: props.height } : {}),
    },
    size: props.size,
  }))

  const labelProps = computed(() => ({
    // Fall back to name when no explicit id — mirrors Blade component behavior
    id: props.id ?? props.name,
    label: props.label,
    fieldClass: props.fieldClass,
    iconBefore: props.iconBefore,
    iconAfter: props.iconAfter,
    prefix: props.prefix,
    suffix: props.suffix,
  }))
</script>

<template>
  <FormField
    :field="field"
    :name="name"
  >
    <template v-if="field && label && !labelAfter">
      <FormLabel v-bind="labelProps" />
    </template>

    <template v-if="'hidden' === props.type">
      <input
        ref="inputRef"
        v-bind="inputProps"
        v-model="localValue"
        @focus="emit('focus', $event)"
        @blur="emit('blur', $event)"
      />
    </template>
    <template v-else>
      <div data-input>
        <span
          v-if="iconBefore"
          data-leading-icon
          class="msr"
          v-html="iconBefore"
        />

        <span
          v-if="prefix"
          data-prefix
          v-html="prefix"
        />

        <input
          ref="inputRef"
          v-bind="inputProps"
          v-model="localValue"
          @focus="emit('focus', $event)"
          @blur="emit('blur', $event)"
        />

        <span
          v-if="suffix"
          data-suffix
          v-html="suffix"
        />

        <span
          v-if="iconAfter"
          data-trailing-icon
          class="msr"
          v-html="iconAfter"
        />
      </div>
    </template>

    <template v-if="field && label && labelAfter">
      <FormLabel v-bind="labelProps" />
    </template>

    <FormAdditional
      v-if="errorMessage"
      :text="errorMessage"
    />
  </FormField>
</template>
