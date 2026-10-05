<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { joinHex, normalizeHex, splitHex } from '@form/inputs'
  import { computed, ref, watch } from 'vue'

  defineOptions({
    name: 'FormColorPicker',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // #rrggbb, or #rrggbbaa with alpha.
    modelValue: {
      type: String,
      default: undefined,
    },
    // Ready made colours to click.
    palette: {
      type: Array,
      default: () => [],
    },
    alpha: {
      type: Boolean,
      default: false,
    },
    label: String,
    name: String,
    form: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    hexLabel: {
      type: String,
      default: 'Hex colour',
    },
    alphaLabel: {
      type: String,
      default: 'Opacity',
    },
  })

  const uid = useUid('color')
  const state = useControllable(props, 'modelValue', emit, '#000000')

  const parts = computed(() => splitHex(state.value) ?? { color: '#000000', alpha: 1 })

  // The text can be wrong while it is typed: it only becomes the value when it is a colour.
  const draft = ref(state.value)
  const valid = ref(true)

  watch(state, (value) => {
    draft.value = value
    valid.value = true
  })

  function set(color, alpha) {
    state.value = props.alpha ? joinHex(color, alpha) : (normalizeHex(color)?.slice(0, 7) ?? '#000000')
  }

  function onHex(event) {
    draft.value = event.target.value

    const hex = normalizeHex(draft.value)

    valid.value = Boolean(hex)

    if (hex) {
      state.value = props.alpha ? hex : hex.slice(0, 7)
    }
  }

  const rootProps = computed(() => ({
    id: props.id,
    class: `color-picker ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
  }))
</script>

<template>
  <div v-bind="rootProps">
    <input
      :id="`${uid}-native`"
      type="color"
      class="color-picker-native"
      :value="parts.color"
      :disabled="disabled"
      :aria-label="label ?? hexLabel"
      @input="set($event.target.value, parts.alpha)"
    />
    <input
      :id="`${uid}-hex`"
      type="text"
      class="color-picker-hex"
      spellcheck="false"
      autocomplete="off"
      :value="draft"
      :disabled="disabled"
      :aria-label="hexLabel"
      :aria-invalid="valid ? undefined : 'true'"
      @input="onHex"
    />
    <input
      v-if="alpha"
      type="range"
      class="color-picker-alpha"
      min="0"
      max="1"
      step="0.01"
      :value="parts.alpha"
      :disabled="disabled"
      :aria-label="alphaLabel"
      @input="set(parts.color, Number($event.target.value))"
    />
    <ul
      v-if="palette.length"
      class="color-picker-palette"
      role="list"
    >
      <li
        v-for="color in palette"
        :key="color"
      >
        <button
          type="button"
          class="color-picker-swatch"
          :aria-label="color"
          :aria-pressed="normalizeHex(color)?.slice(0, 7) === parts.color"
          :disabled="disabled"
          :style="{ backgroundColor: color }"
          @click="set(color, parts.alpha)"
        ></button>
      </li>
    </ul>
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :form="form"
      :value="state"
    />
  </div>
</template>
