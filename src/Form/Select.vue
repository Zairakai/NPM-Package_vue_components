<script setup>
  import { computed, ref } from 'vue'
  import FormAdditional from './Additional.vue'
  import FormField from './Field.vue'
  import FormLabel from './Label.vue'

  defineOptions({
    name: 'FormSelect',
  })

  const emit = defineEmits(['update:modelValue', 'isValid'])

  const selectRef = ref()
  const isValid = ref(true)

  const localValue = computed({
    get: () => props.modelValue,
    set: (newValue) => {
      if (selectRef.value?.checkValidity()) {
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
    options: {
      type: Object,
      required: true,
    },
    modelValue: [String, Number, Array],
    multiple: {
      type: Boolean,
      default: false,
    },
    required: {
      type: Boolean,
      default: false,
    },
    selectClass: String,
    label: String,
    labelAfter: {
      type: Boolean,
      default: false,
    },
    fieldClass: String,
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

  const labelProps = computed(() => ({
    id: props.id,
    label: props.label,
    class: props.fieldClass,
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
      <span
        v-if="iconBefore"
        data-leading-icon
        v-html="iconBefore"
      />
      <span
        v-if="prefix"
        data-prefix
        v-html="prefix"
      />

      <select
        :id="id"
        ref="selectRef"
        v-model="localValue"
        :name="name"
        :form="form"
        :required="required"
        :multiple="multiple"
        :class="selectClass"
      >
        <template
          v-for="(optionValue, optionKey, optionIndex) in options"
          :key="optionKey + '-' + optionIndex"
        >
          <optgroup
            v-if="Array.isArray(optionValue)"
            :label="optionKey"
          >
            <option
              v-for="(optionValueValue, optionValueKey, optionValueIndex) in optionValue"
              :key="optionValueKey + '-' + optionValueIndex"
              :value="optionValueKey"
            >
              {{ optionValueValue }}
            </option>
          </optgroup>

          <option
            v-else
            :value="optionKey"
          >
            {{ optionValue }}
          </option>
        </template>
      </select>

      <span
        v-if="suffix"
        data-suffix
        v-html="suffix"
      />
      <span
        v-if="iconAfter"
        data-trailing-icon
        v-html="iconAfter"
      />
    </div>

    <template v-if="field && label && labelAfter">
      <FormLabel v-bind="labelProps" />
    </template>

    <FormAdditional
      v-if="errorMessage"
      :text="errorMessage"
    />
  </FormField>
</template>
