<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  defineOptions({
    name: 'MediaCarousel',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The slides: any items, shown with the item slot.
    items: {
      type: Array,
      default: () => [],
    },
    // The index of the current slide.
    modelValue: {
      type: Number,
      default: undefined,
    },
    // Move on by itself, every this many milliseconds. Not when the visitor prefers less motion.
    autoplay: {
      type: Number,
      default: 0,
    },
    // Go back to the first slide after the last.
    loop: {
      type: Boolean,
      default: true,
    },
    label: {
      type: String,
      default: 'Carousel',
    },
    previousLabel: {
      type: String,
      default: 'Previous slide',
    },
    nextLabel: {
      type: String,
      default: 'Next slide',
    },
    slideLabel: {
      type: String,
      default: '{n} of {total}',
    },
    indicators: {
      type: Boolean,
      default: true,
    },
  })

  const state = useControllable(props, 'modelValue', emit, 0)
  const track = ref(null)
  const paused = ref(false)
  let timer

  const count = computed(() => props.items.length)
  const last = computed(() => count.value - 1)

  async function show(index, behavior = 'smooth') {
    if (0 === count.value) {
      return
    }

    const next = props.loop ? (index + count.value) % count.value : Math.max(0, Math.min(last.value, index))

    state.value = next
    await nextTick()

    const slide = track.value?.children[next]

    if (slide && 'function' === typeof track.value.scrollTo) {
      track.value.scrollTo({ left: slide.offsetLeft - track.value.offsetLeft, behavior })
    }
  }

  const previous = () => show(state.value - 1)
  const next = () => show(state.value + 1)

  // The visitor scrolls or swipes: the index follows what is in view.
  function onScroll() {
    const width = track.value?.clientWidth

    if (width) {
      state.value = Math.max(0, Math.min(last.value, Math.round(track.value.scrollLeft / width)))
    }
  }

  function onKeydown(event) {
    const actions = { ArrowLeft: previous, ArrowRight: next, Home: () => show(0), End: () => show(last.value) }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  }

  const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  function start() {
    stop()

    if (0 < props.autoplay && !reduced()) {
      timer = setInterval(() => !paused.value && next(), props.autoplay)
    }
  }

  function stop() {
    clearInterval(timer)
  }

  watch(() => props.autoplay, start)
  onMounted(start)
  onBeforeUnmount(stop)

  const atStart = computed(() => !props.loop && 0 === state.value)
  const atEnd = computed(() => !props.loop && state.value === last.value)

  const rootProps = computed(() => ({
    id: props.id,
    class: `carousel ${props.class ?? ''}`.trim(),
    role: 'region',
    'aria-roledescription': 'carousel',
    'aria-label': props.label,
    // While it moves by itself a screen reader must not be interrupted.
    'aria-live': 0 < props.autoplay && !paused.value ? 'off' : 'polite',
  }))

  // Functional CSS only: the slides in a row, one at a time, snapping.
  const trackStyle = { display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }
  const slideStyle = { flex: '0 0 100%', scrollSnapAlign: 'start' }
</script>

<template>
  <div
    v-bind="rootProps"
    @keydown="onKeydown"
    @mouseenter="paused = true"
    @mouseleave="paused = false"
    @focusin="paused = true"
    @focusout="paused = false"
  >
    <div
      ref="track"
      class="carousel-track"
      tabindex="0"
      :style="trackStyle"
      @scroll.passive="onScroll"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        class="carousel-slide"
        role="group"
        aria-roledescription="slide"
        :aria-label="slideLabel.replace('{n}', String(index + 1)).replace('{total}', String(count))"
        :data-active="index === state ? '' : undefined"
        :style="slideStyle"
      >
        <slot
          name="item"
          :item="item"
          :index="index"
          :active="index === state"
        >
          {{ item }}
        </slot>
      </div>
    </div>
    <button
      type="button"
      class="carousel-previous"
      :aria-label="previousLabel"
      :disabled="atStart"
      @click="previous"
    >
      &lsaquo;
    </button>
    <button
      type="button"
      class="carousel-next"
      :aria-label="nextLabel"
      :disabled="atEnd"
      @click="next"
    >
      &rsaquo;
    </button>
    <div
      v-if="indicators && 1 < count"
      class="carousel-indicators"
    >
      <button
        v-for="(item, index) in items"
        :key="index"
        type="button"
        class="carousel-indicator"
        :aria-label="slideLabel.replace('{n}', String(index + 1)).replace('{total}', String(count))"
        :aria-current="index === state ? 'true' : undefined"
        @click="show(index)"
      ></button>
    </div>
  </div>
</template>
