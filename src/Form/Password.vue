<script setup>
  import { computed, inject } from 'vue'

  import FormInput from '@form/Input.vue'
  import { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from '@/config.js'

  defineOptions({
    name: 'FormInputPassword',
    inheritAttrs: false,
  })

  const emit = defineEmits(['update:modelValue', 'isValid'])

  // Read global config provided by VueComponentsPlugin.
  // Falls back to defaults when the component is used without the plugin.
  const zkConfig = inject(ZK_CONFIG_KEY, DEFAULT_ZK_CONFIG)

  const localValue = computed({
    get: () => props.modelValue,
    set: (newValue) => emit('update:modelValue', newValue),
  })

  const props = defineProps({
    modelValue: {
      type: [String, Number, Boolean, null],
      default: null,
    },
    // Explicit pattern overrides the config-based default.
    pattern: {
      type: String,
      default: null,
    },
  })

  // Prop takes precedence; otherwise derive from plugin config.
  const effectivePattern = computed(() => props.pattern ?? `^.{${zkConfig.minPasswordLength},}`)
</script>

<template>
  <FormInput
    v-bind="$attrs"
    v-model="localValue"
    type="password"
    :pattern="effectivePattern"
    @is-valid="emit('isValid', $event)"
  />
</template>
