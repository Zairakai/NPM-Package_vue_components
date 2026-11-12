<script setup>
import { useControllable } from '@/composables/useControllable'
import { useUid } from '@/composables/useUid'
import { computed } from 'vue'

defineOptions({
  name: 'FormTimePicker',
})

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
  id: String,
  class: String,
  // "HH:MM" in 24 hours, always, whatever the display.
  modelValue: {
    type: String,
    default: undefined,
  },
  // 12 or 24 hour display.
  hours: {
    type: Number,
    default: 24,
    validator(value) {
      return [12, 24].includes(value)
    },
  },
  minuteStep: {
    type: Number,
    default: 1,
  },
  label: String,
  name: String,
  form: String,
  disabled: {
    type: Boolean,
    default: false,
  },
  hourLabel: {
    type: String,
    default: 'Hours',
  },
  minuteLabel: {
    type: String,
    default: 'Minutes',
  },
  periodLabel: {
    type: String,
    default: 'AM or PM',
  },
})

const uid = useUid('time')
const state = useControllable(props, 'modelValue', emit, '')

const parts = computed(() => {
  const match = /^(\d{2}):(\d{2})$/.exec(state.value ?? '')

  return match
    ? { hour: Number(match[1]), minute: Number(match[2]) }
    : { hour: null, minute: null }
})

const pad = (number) => String(number).padStart(2, '0')
const twelve = props.hours === 12

const hourOptions = computed(() =>
  twelve
    ? Array.from({ length: 12 }, (_, index) => (index === 0 ? 12 : index))
    : Array.from({ length: 24 }, (_, index) => index),
)
const minuteOptions = computed(() =>
  Array.from(
    { length: Math.ceil(60 / props.minuteStep) },
    (_, index) => index * props.minuteStep,
  ),
)

const period = computed(() =>
  parts.value.hour === null ? '' : parts.value.hour >= 12 ? 'pm' : 'am',
)
const shownHour = computed(() => {
  if (parts.value.hour === null) {
    return ''
  }

  return twelve ? parts.value.hour % 12 || 12 : parts.value.hour
})

function update(hour, minute, ampm) {
  const base = twelve
    ? (Number(hour) % 12) + (ampm === 'pm' ? 12 : 0)
    : Number(hour)

  state.value = `${pad(base)}:${pad(Number(minute))}`
}

const current = () => ({
  hour: shownHour.value,
  minute: parts.value.minute ?? 0,
  period: period.value || 'am',
})

function onHour(event) {
  update(event.target.value, current().minute, current().period)
}

function onMinute(event) {
  update(
    shownHour.value === '' ? (twelve ? 12 : 0) : shownHour.value,
    event.target.value,
    current().period,
  )
}

function onPeriod(event) {
  update(
    shownHour.value === '' ? 12 : shownHour.value,
    current().minute,
    event.target.value,
  )
}

const rootProps = computed(() => ({
  id: props.id,
  class: `time-picker ${props.class ?? ''}`.trim(),
  role: 'group',
  'aria-label': props.label,
}))
</script>

<template>
  <div v-bind="rootProps">
    <select
      :id="`${uid}-hour`"
      class="time-picker-hour"
      :aria-label="hourLabel"
      :disabled="disabled"
      :value="shownHour"
      @change="onHour"
    >
      <option v-if="shownHour === ''" value="" disabled></option>
      <option v-for="hour in hourOptions" :key="hour" :value="hour">
        {{ twelve ? hour : pad(hour) }}
      </option>
    </select>
    <span aria-hidden="true">:</span>
    <select
      :id="`${uid}-minute`"
      class="time-picker-minute"
      :aria-label="minuteLabel"
      :disabled="disabled"
      :value="parts.minute === null ? '' : parts.minute"
      @change="onMinute"
    >
      <option v-if="parts.minute === null" value="" disabled></option>
      <option v-for="minute in minuteOptions" :key="minute" :value="minute">
        {{ pad(minute) }}
      </option>
    </select>
    <select
      v-if="twelve"
      class="time-picker-period"
      :aria-label="periodLabel"
      :disabled="disabled"
      :value="period || 'am'"
      @change="onPeriod"
    >
      <option value="am">AM</option>
      <option value="pm">PM</option>
    </select>
    <input v-if="name" type="hidden" :name="name" :form="form" :value="state" />
  </div>
</template>
