<script>
  import FormCheckbox from './Checkbox.vue'
  import FormLabel from './Label.vue'

  export default {
    name: 'FormSwitch',

    components: {
      FormCheckbox,
      FormLabel,
    },

    inheritAttrs: false,

    props: {
      label: {
        type: String,
        required: true,
      },
      switchBefore: {
        type: Boolean,
        default: false,
      },
    },

    emits: ['input'],
  }
</script>

<template>
  <x-form.group :name="name">
    <FormCheckbox
      v-bind="$attrs"
      @input="$emit('input', $event.target.value)"
    />

    <FormLabel :for-id="id">
      <span v-if="switchBefore" />
      {{ label }}
      <span v-if="!switchBefore" />
    </FormLabel>
  </x-form.group>
</template>
