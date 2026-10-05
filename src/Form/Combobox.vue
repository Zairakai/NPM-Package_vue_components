<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { filterOptions, nextEnabled, normalizeOptions } from '@form/combobox'
  import { computed, ref, watch } from 'vue'

  defineOptions({
    name: 'FormCombobox',
  })

  const emit = defineEmits(['update:modelValue', 'search', 'open', 'close'])

  const props = defineProps({
    id: String,
    class: String,
    name: String,
    form: String,
    // Strings, { value, label, disabled } objects or a { value: label } object.
    options: {
      type: [Array, Object],
      default: () => [],
    },
    // The chosen value, or the array of values when multiple.
    modelValue: {
      type: [String, Array],
      default: undefined,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    label: String,
    placeholder: String,
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // The options come from a server: they are not filtered here, listen to the search event.
    remote: {
      type: Boolean,
      default: false,
    },
    loading: {
      type: Boolean,
      default: false,
    },
    // Allow a value that is not in the options (tags).
    creatable: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: 'No result',
    },
    removeLabel: {
      type: String,
      default: 'Remove',
    },
  })

  const uid = useUid('combobox')
  const inputId = computed(() => props.id ?? `${uid}-input`)
  const listId = `${uid}-list`

  const state = useControllable(props, 'modelValue', emit, props.multiple ? [] : '')
  const all = computed(() => normalizeOptions(props.options))
  const chosen = computed(() => (props.multiple ? state.value : '' === state.value ? [] : [state.value]))

  const labelOf = (value) => all.value.find((option) => option.value === value)?.label ?? value

  const query = ref('')
  const open = ref(false)
  const active = ref(-1)

  // Single: the input shows the chosen label until the visitor types.
  const typed = ref(false)
  const text = computed(() => (props.multiple || typed.value ? query.value : labelOf(state.value)))

  const shown = computed(() => {
    const pool = props.multiple ? all.value.filter((option) => !chosen.value.includes(option.value)) : all.value
    const found = props.remote || (!typed.value && !props.multiple) ? pool : filterOptions(pool, query.value)
    const text = query.value.trim()
    const extra =
      props.creatable && text && !all.value.some((option) => option.label.toLowerCase() === text.toLowerCase())
        ? [{ value: text, label: text, created: true }]
        : []

    return [...found, ...extra]
  })

  const activeId = computed(() => (open.value && 0 <= active.value ? `${uid}-option-${active.value}` : undefined))

  function show() {
    if (!open.value && !props.disabled) {
      open.value = true
      emit('open')
    }
  }

  function hide() {
    if (open.value) {
      open.value = false
      active.value = -1
      emit('close')
    }
  }

  function choose(option) {
    if (option.disabled) {
      return
    }

    if (props.multiple) {
      state.value = [...state.value, option.value]
      query.value = ''
      emit('search', '')
    } else {
      state.value = option.value
      typed.value = false
      query.value = ''
      hide()
    }
  }

  function remove(value) {
    state.value = state.value.filter((item) => item !== value)
  }

  function onInput(event) {
    typed.value = true
    query.value = event.target.value
    emit('search', query.value)
    show()
    active.value = nextEnabled(shown.value, -1, 1)
  }

  function move(direction) {
    show()
    active.value = nextEnabled(shown.value, 0 > active.value ? (1 === direction ? -1 : 0) : active.value, direction)
  }

  function onKeydown(event) {
    const actions = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Home: () => open.value && (active.value = nextEnabled(shown.value, -1, 1)),
      End: () => open.value && (active.value = nextEnabled(shown.value, 0, -1)),
      Escape: () => {
        if (open.value) {
          typed.value = false
          query.value = ''
        }

        hide()
      },
      Enter: () => open.value && shown.value[active.value] && choose(shown.value[active.value]),
      Backspace: () => props.multiple && '' === query.value && chosen.value.length && remove(chosen.value.at(-1)),
    }

    if (actions[event.key]) {
      if (
        'Backspace' !== event.key &&
        ('Escape' !== event.key || open.value) &&
        ('Enter' !== event.key || open.value)
      ) {
        event.preventDefault()
      }

      actions[event.key]()
    }
  }

  // A blur that goes to the list (a click) must not close before the click lands.
  function onBlur() {
    typed.value = false
    query.value = ''
    hide()
  }

  watch(shown, (list) => {
    if (active.value >= list.length) {
      active.value = list.length - 1
    }
  })

  const rootProps = computed(() => ({
    class: `combobox ${props.class ?? ''}`.trim(),
    'data-open': open.value ? '' : undefined,
    'data-disabled': props.disabled ? '' : undefined,
    style: { position: 'relative' },
  }))

  const listStyle = {
    position: 'absolute',
    insetInline: 0,
    top: '100%',
    zIndex: 10,
    margin: 0,
    padding: 0,
    listStyle: 'none',
    overflowY: 'auto',
    maxHeight: '16rem',
  }
</script>

<template>
  <div v-bind="rootProps">
    <label
      v-if="label"
      class="combobox-label"
      :for="inputId"
    >
      {{ label }}
    </label>
    <div class="combobox-control">
      <span
        v-for="value in multiple ? chosen : []"
        :key="value"
        class="combobox-chip"
      >
        <span class="combobox-chip-label">{{ labelOf(value) }}</span>
        <button
          type="button"
          class="combobox-chip-remove"
          :aria-label="`${removeLabel} ${labelOf(value)}`"
          :disabled="disabled"
          @click="remove(value)"
        >
          &times;
        </button>
      </span>
      <input
        :id="inputId"
        type="text"
        class="combobox-input"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        :aria-expanded="open"
        :aria-controls="listId"
        :aria-activedescendant="activeId"
        :aria-busy="loading ? 'true' : undefined"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required && 0 === chosen.length"
        :value="text"
        @input="onInput"
        @focus="show"
        @click="show"
        @keydown="onKeydown"
        @blur="onBlur"
      />
    </div>
    <ul
      v-show="open"
      :id="listId"
      class="combobox-list"
      role="listbox"
      :aria-multiselectable="multiple ? 'true' : undefined"
      :style="listStyle"
      @mousedown.prevent
    >
      <li
        v-for="(option, index) in shown"
        :id="`${uid}-option-${index}`"
        :key="option.value"
        class="combobox-option"
        role="option"
        :aria-selected="chosen.includes(option.value)"
        :aria-disabled="option.disabled ? 'true' : undefined"
        :data-active="index === active ? '' : undefined"
        :data-created="option.created ? '' : undefined"
        @click="choose(option)"
        @mousemove="option.disabled || (active = index)"
      >
        <slot
          name="option"
          :option="option"
        >
          {{ option.label }}
        </slot>
      </li>
      <li
        v-if="0 === shown.length"
        class="combobox-empty"
        role="presentation"
      >
        <span v-if="loading">…</span>
        <template v-else>{{ emptyText }}</template>
      </li>
    </ul>
    <template v-if="name">
      <input
        v-for="value in chosen"
        :key="value"
        type="hidden"
        :name="multiple ? `${name}[]` : name"
        :form="form"
        :value="value"
      />
    </template>
  </div>
</template>
