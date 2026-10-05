<script setup>
  import { isoDuration, remaining, toTime } from '@utility/countdown'
  import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  defineOptions({
    name: 'UtilityCountdown',
  })

  const emit = defineEmits(['finished', 'tick'])

  const props = defineProps({
    id: String,
    class: String,
    // The moment to count down to: a date, a timestamp or an ISO string.
    target: {
      type: [Date, Number, String],
      required: true,
    },
    // How often it updates, in milliseconds.
    interval: {
      type: Number,
      default: 1000,
    },
    // Show the days even when there are none.
    showDays: {
      type: Boolean,
      default: false,
    },
    units: {
      type: Object,
      default: () => ({ days: 'd', hours: 'h', minutes: 'm', seconds: 's' }),
    },
  })

  const now = ref(Date.now())
  let timer
  let done = false

  const left = computed(() => remaining(toTime(props.target), now.value))
  const pad = (number) => String(number).padStart(2, '0')

  function tick() {
    now.value = Date.now()
    emit('tick', left.value)

    if (0 === left.value.total && !done) {
      done = true
      emit('finished')
      stop()
    }
  }

  function stop() {
    clearInterval(timer)
  }

  function start() {
    stop()
    done = false
    now.value = Date.now()

    if (0 === left.value.total) {
      done = true
      emit('finished')

      return
    }

    timer = setInterval(tick, props.interval)
  }

  onMounted(start)
  onBeforeUnmount(stop)
  watch(() => props.target, start)

  const timeProps = computed(() => ({
    id: props.id,
    class: `countdown ${props.class ?? ''}`.trim(),
    // A timer is not announced every second: it is only read when asked.
    role: 'timer',
    'aria-live': 'off',
    datetime: isoDuration(left.value),
    'data-finished': 0 === left.value.total ? '' : undefined,
  }))
</script>

<template>
  <time v-bind="timeProps">
    <slot v-bind="left">
      <span
        v-if="showDays || 0 < left.days"
        class="countdown-part"
        data-unit="days"
      >
        {{ left.days }}{{ units.days }}
      </span>
      <span
        class="countdown-part"
        data-unit="hours"
      >
        {{ pad(left.hours) }}{{ units.hours }}
      </span>
      <span
        class="countdown-part"
        data-unit="minutes"
      >
        {{ pad(left.minutes) }}{{ units.minutes }}
      </span>
      <span
        class="countdown-part"
        data-unit="seconds"
      >
        {{ pad(left.seconds) }}{{ units.seconds }}
      </span>
    </slot>
  </time>
</template>
