<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { addDays, addMonths, clampIso, fromIso, isBetween, monthGrid, orderRange, toIso } from '@form/calendar'
  import { computed, nextTick, ref, watch } from 'vue'

  defineOptions({
    name: 'FormCalendar',
  })

  const emit = defineEmits(['update:modelValue', 'update:month'])

  const props = defineProps({
    id: String,
    class: String,
    // The chosen day (2026-10-05), or { start, end } when range.
    modelValue: {
      type: [String, Object],
      default: undefined,
    },
    range: {
      type: Boolean,
      default: false,
    },
    min: String,
    max: String,
    // The first day of the week: 0 Sunday, 1 Monday.
    weekStart: {
      type: Number,
      default: 1,
    },
    locale: String,
    // A function (iso) => boolean to disable some days.
    isDisabled: {
      type: Function,
      default: () => false,
    },
    previousLabel: {
      type: String,
      default: 'Previous month',
    },
    nextLabel: {
      type: String,
      default: 'Next month',
    },
  })

  const uid = useUid('calendar')
  const state = useControllable(props, 'modelValue', emit, undefined)

  const selected = computed(() => (props.range ? state.value?.start : state.value))
  const todayIso = toIso(new Date())

  // The month shown and the day that has the keyboard focus.
  const focused = ref(fromIso(selected.value) ?? fromIso(clampIso(todayIso, props.min, props.max)) ?? new Date())
  // Range: the first click is kept until the second.
  const anchor = ref(null)
  const hover = ref(null)

  const grid = computed(() => monthGrid(focused.value.getFullYear(), focused.value.getMonth(), props.weekStart))

  const title = computed(() =>
    new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(focused.value)
  )
  const weekdays = computed(() =>
    grid.value[0].map((day) => ({
      short: new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(day),
      long: new Intl.DateTimeFormat(props.locale, { weekday: 'long' }).format(day),
    }))
  )
  const dayLabel = (day) => new Intl.DateTimeFormat(props.locale, { dateStyle: 'full' }).format(day)

  const outOfBounds = (iso) => iso !== clampIso(iso, props.min, props.max)
  const blocked = (iso) => outOfBounds(iso) || props.isDisabled(iso)

  const rangeEnd = computed(() =>
    props.range ? (anchor.value ? (hover.value ?? anchor.value) : state.value?.end) : undefined
  )
  const rangeStart = computed(() => (props.range ? (anchor.value ?? state.value?.start) : undefined))

  function inRange(iso) {
    if (!props.range || !rangeStart.value || !rangeEnd.value) {
      return false
    }

    const [from, to] = orderRange(rangeStart.value, rangeEnd.value)

    return isBetween(iso, from, to)
  }

  function pick(day) {
    const iso = toIso(day)

    if (blocked(iso)) {
      return
    }

    focused.value = day

    if (!props.range) {
      state.value = iso

      return
    }

    if (null === anchor.value) {
      anchor.value = iso
      hover.value = null
    } else {
      const [start, end] = orderRange(anchor.value, iso)

      anchor.value = null
      hover.value = null
      state.value = { start, end }
    }
  }

  const container = ref(null)

  async function focusDay() {
    await nextTick()
    container.value?.querySelector('[tabindex="0"]')?.focus()
  }

  function go(day) {
    const bounded = fromIso(clampIso(toIso(day), props.min, props.max)) ?? day
    const monthChanged =
      bounded.getMonth() !== focused.value.getMonth() || bounded.getFullYear() !== focused.value.getFullYear()

    focused.value = bounded

    if (monthChanged) {
      emit('update:month', toIso(new Date(bounded.getFullYear(), bounded.getMonth(), 1)).slice(0, 7))
    }

    focusDay()
  }

  function onKeydown(event) {
    const day = focused.value
    const target = {
      ArrowLeft: () => addDays(day, -1),
      ArrowRight: () => addDays(day, 1),
      ArrowUp: () => addDays(day, -7),
      ArrowDown: () => addDays(day, 7),
      Home: () => addDays(day, -((day.getDay() - props.weekStart + 7) % 7)),
      End: () => addDays(day, 6 - ((day.getDay() - props.weekStart + 7) % 7)),
      PageUp: () => addMonths(day, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(day, event.shiftKey ? 12 : 1),
    }[event.key]

    if (target) {
      event.preventDefault()
      go(target())
    } else if ('Escape' === event.key && anchor.value) {
      anchor.value = null
      hover.value = null
    }
  }

  function shift(months) {
    go(addMonths(focused.value, months))
  }

  watch(
    () => props.modelValue,
    () => {
      const day = fromIso(selected.value)

      if (day) {
        focused.value = day
      }
    }
  )

  const isSelected = (iso) =>
    props.range ? iso === state.value?.start || iso === state.value?.end || iso === anchor.value : iso === state.value

  const calendarProps = computed(() => ({
    id: props.id,
    class: `calendar ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div
    ref="container"
    v-bind="calendarProps"
  >
    <div class="calendar-header">
      <button
        type="button"
        class="calendar-previous"
        :aria-label="previousLabel"
        @click="shift(-1)"
      >
        &lsaquo;
      </button>
      <div
        :id="`${uid}-title`"
        class="calendar-title"
        aria-live="polite"
      >
        {{ title }}
      </div>
      <button
        type="button"
        class="calendar-next"
        :aria-label="nextLabel"
        @click="shift(1)"
      >
        &rsaquo;
      </button>
    </div>
    <table
      class="calendar-grid"
      role="grid"
      :aria-labelledby="`${uid}-title`"
      @keydown="onKeydown"
    >
      <thead>
        <tr>
          <th
            v-for="weekday in weekdays"
            :key="weekday.long"
            scope="col"
            :abbr="weekday.long"
          >
            {{ weekday.short }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(week, index) in grid"
          :key="index"
        >
          <td
            v-for="day in week"
            :key="toIso(day)"
            role="gridcell"
            :aria-selected="isSelected(toIso(day))"
          >
            <button
              type="button"
              class="calendar-day"
              :tabindex="toIso(day) === toIso(focused) ? 0 : -1"
              :aria-label="dayLabel(day)"
              :aria-current="toIso(day) === todayIso ? 'date' : undefined"
              :disabled="blocked(toIso(day))"
              :data-outside="day.getMonth() !== focused.getMonth() ? '' : undefined"
              :data-selected="isSelected(toIso(day)) ? '' : undefined"
              :data-in-range="inRange(toIso(day)) ? '' : undefined"
              :data-today="toIso(day) === todayIso ? '' : undefined"
              @click="pick(day)"
              @mouseenter="anchor && (hover = toIso(day))"
            >
              {{ day.getDate() }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
