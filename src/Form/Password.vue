<script setup>
  import { computed, inject, ref } from 'vue'

  import { ensureIconSprite } from '@/composables/useIconSprite.js'
  import { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from '@/config.js'
  import FormInput from '@form/Input.vue'

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
    // Explicit pattern prop overrides the config-based default.
    pattern: {
      type: String,
      default: null,
    },
    // Render a show/hide toggle button inside the field.
    showToggle: {
      type: Boolean,
      default: true,
    },
    // aria-label text — override for i18n, no built-in translation here
    // (unlike the Blade equivalent, this package has no i18n system).
    labelShow: {
      type: String,
      default: 'Show password',
    },
    labelHide: {
      type: String,
      default: 'Hide password',
    },
  })

  // Prop takes precedence; otherwise derive pattern from plugin config.
  const effectivePattern = computed(() => props.pattern ?? `^.{${zkConfig.minPasswordLength},}`)

  const isVisible = ref(false)
  const inputType = computed(() => (isVisible.value ? 'text' : 'password'))

  function toggleVisibility() {
    isVisible.value = !isVisible.value
  }

  if (props.showToggle) {
    ensureIconSprite()
  }
</script>

<template>
  <FormInput
    v-bind="$attrs"
    v-model="localValue"
    :type="inputType"
    :pattern="effectivePattern"
    @is-valid="emit('isValid', $event)"
  >
    <template
      v-if="showToggle"
      #trailing-content
    >
      <button
        type="button"
        data-toggle-visibility
        :aria-label="isVisible ? labelHide : labelShow"
        @click="toggleVisibility"
      >
        <svg
          v-if="!isVisible"
          data-icon-show
          width="20"
          height="20"
        >
          <use href="#icon-visibility" />
        </svg>
        <svg
          v-else
          data-icon-hide
          width="20"
          height="20"
        >
          <use href="#icon-visibility-off" />
        </svg>
      </button>
    </template>
  </FormInput>
</template>
