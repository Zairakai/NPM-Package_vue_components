<script setup>
  import FormField from '@form/Field.vue'
  import { computed } from 'vue'

  defineOptions({
    name: 'FormButton',
  })

  const props = defineProps({
    id: String,
    type: {
      type: String,
      default: 'button',
      validator(value) {
        return ['button', 'submit', 'reset'].includes(value)
      },
    },
    form: String,
    name: String,
    value: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
    class: String,
    fieldClass: String,
    icon: String,
  })

  const buttonProps = computed(() => ({
    id: props.id,
    form: props.form,
    name: props.name,
    value: props.value,
    disabled: props.disabled,
    autofocus: props.autofocus,
    class: props.class,
    'data-icon': props.icon,
  }))
</script>

<template>
  <FormField :class="fieldClass">
    <button
      :type="type"
      v-bind="buttonProps"
    >
      <slot />
    </button>
  </FormField>
</template>
