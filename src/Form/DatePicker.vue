<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { fromIso } from '@form/calendar'
  import FormCalendar from '@form/Calendar.vue'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

  defineOptions({
    name: 'FormDatePicker',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // 2026-10-05, or { start, end } when range.
    modelValue: {
      type: [String, Object],
      default: undefined,
    },
    range: {
      type: Boolean,
      default: false,
    },
    name: String,
    form: String,
    label: String,
    placeholder: String,
    min: String,
    max: String,
    weekStart: {
      type: Number,
      default: 1,
    },
    locale: String,
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    toggleLabel: {
      type: String,
      default: 'Choose a date',
    },
    clearLabel: {
      type: String,
      default: 'Clear',
    },
  })

  const uid = useUid('datepicker')
  const inputId = computed(() => props.id ?? `${uid}-input`)
  const panelId = `${uid}-panel`

  const state = useControllable(props, 'modelValue', emit, undefined)
  const open = ref(false)
  const root = ref(null)

  const format = (iso) => {
    const day = fromIso(iso)

    return day ? new Intl.DateTimeFormat(props.locale, { dateStyle: 'medium' }).format(day) : ''
  }

  const text = computed(() => {
    if (!props.range) {
      return format(state.value)
    }

    return state.value?.start && state.value?.end ? `${format(state.value.start)} – ${format(state.value.end)}` : ''
  })

  const complete = computed(() =>
    props.range ? Boolean(state.value?.start && state.value?.end) : Boolean(state.value)
  )

  function onPick(value) {
    state.value = value

    // A single date, or a finished range, closes the calendar.
    if (!props.range || (value?.start && value?.end)) {
      open.value = false
    }
  }

  function clear() {
    state.value = undefined
  }

  async function toggle() {
    open.value = !open.value

    if (open.value) {
      await nextTick()
      root.value?.querySelector('.calendar-day[tabindex="0"]')?.focus()
    }
  }

  const onOutside = (event) => {
    if (open.value && !root.value?.contains(event.target)) {
      open.value = false
    }
  }

  const onKeydown = (event) => {
    if ('Escape' === event.key && open.value) {
      open.value = false
      root.value?.querySelector('.datepicker-toggle')?.focus()
    }
  }

  onMounted(() => document.addEventListener('pointerdown', onOutside, true))
  onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside, true))

  const rootProps = computed(() => ({
    class: `datepicker ${props.class ?? ''}`.trim(),
    'data-open': open.value ? '' : undefined,
    style: { position: 'relative' },
  }))

  const panelStyle = { position: 'absolute', top: '100%', insetInlineStart: 0, zIndex: 10 }
</script>

<template>
  <div
    ref="root"
    v-bind="rootProps"
    @keydown="onKeydown"
  >
    <label
      v-if="label"
      class="datepicker-label"
      :for="inputId"
    >
      {{ label }}
    </label>
    <div class="datepicker-control">
      <input
        :id="inputId"
        type="text"
        class="datepicker-input"
        readonly
        :value="text"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggle"
      />
      <button
        v-if="complete"
        type="button"
        class="datepicker-clear"
        :aria-label="clearLabel"
        :disabled="disabled"
        @click="clear"
      >
        &times;
      </button>
      <button
        type="button"
        class="datepicker-toggle"
        :aria-label="toggleLabel"
        :disabled="disabled"
        @click="toggle"
      >
        <slot name="icon">&#128197;</slot>
      </button>
    </div>
    <div
      v-show="open"
      :id="panelId"
      class="datepicker-panel"
      role="dialog"
      :aria-label="toggleLabel"
      :style="panelStyle"
    >
      <FormCalendar
        :model-value="state"
        :range="range"
        :min="min"
        :max="max"
        :week-start="weekStart"
        :locale="locale"
        @update:model-value="onPick"
      />
    </div>
    <template v-if="name">
      <input
        v-if="!range"
        type="hidden"
        :name="name"
        :form="form"
        :value="state ?? ''"
      />
      <template v-else>
        <input
          type="hidden"
          :name="`${name}[start]`"
          :form="form"
          :value="state?.start ?? ''"
        />
        <input
          type="hidden"
          :name="`${name}[end]`"
          :form="form"
          :value="state?.end ?? ''"
        />
      </template>
    </template>
  </div>
</template>
