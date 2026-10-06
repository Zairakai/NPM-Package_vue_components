<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { computed, ref } from 'vue'

  defineOptions({
    name: 'LayoutSplitter',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The size of the first pane, in percent.
    modelValue: {
      type: Number,
      default: undefined,
    },
    // "horizontal" puts the panes side by side, "vertical" one above the other.
    direction: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value)
      },
    },
    min: {
      type: Number,
      default: 10,
    },
    max: {
      type: Number,
      default: 90,
    },
    // How far an arrow key moves it, in percent.
    step: {
      type: Number,
      default: 5,
    },
    label: {
      type: String,
      default: 'Resize',
    },
  })

  const state = useControllable(props, 'modelValue', emit, 50)
  const root = ref(null)
  const dragging = ref(false)

  const clamp = (value) => Math.min(props.max, Math.max(props.min, value))
  const size = computed(() => clamp(state.value))
  const horizontal = computed(() => 'horizontal' === props.direction)

  const set = (value) => (state.value = clamp(Math.round(value * 10) / 10))

  // The pointer is captured so the drag goes on outside the handle.
  function onPointerDown(event) {
    dragging.value = true
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event) {
    if (!dragging.value) {
      return
    }

    const box = root.value.getBoundingClientRect()
    const length = horizontal.value ? box.width : box.height

    if (0 < length) {
      set(((horizontal.value ? event.clientX - box.left : event.clientY - box.top) / length) * 100)
    }
  }

  function onPointerUp(event) {
    dragging.value = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  function onKeydown(event) {
    const forward = horizontal.value ? 'ArrowRight' : 'ArrowDown'
    const backward = horizontal.value ? 'ArrowLeft' : 'ArrowUp'
    const target = {
      [forward]: size.value + props.step,
      [backward]: size.value - props.step,
      Home: props.min,
      End: props.max,
    }[event.key]

    if (undefined !== target) {
      event.preventDefault()
      set(target)
    }
  }

  // Functional CSS only: the two panes and the handle in a grid.
  const rootStyle = computed(() => ({
    display: 'grid',
    [horizontal.value ? 'gridTemplateColumns' : 'gridTemplateRows']: `${size.value}% auto minmax(0, 1fr)`,
  }))

  const rootProps = computed(() => ({
    id: props.id,
    class: `splitter ${props.class ?? ''}`.trim(),
    'data-direction': props.direction,
    'data-dragging': dragging.value ? '' : undefined,
    style: rootStyle.value,
  }))
</script>

<template>
  <div
    ref="root"
    v-bind="rootProps"
  >
    <div class="splitter-pane splitter-first">
      <slot name="first" />
    </div>
    <div
      class="splitter-handle"
      role="separator"
      tabindex="0"
      :aria-orientation="horizontal ? 'vertical' : 'horizontal'"
      :aria-valuenow="Math.round(size)"
      :aria-valuemin="min"
      :aria-valuemax="max"
      :aria-label="label"
      :style="{ touchAction: 'none', cursor: horizontal ? 'col-resize' : 'row-resize' }"
      @keydown="onKeydown"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
    ></div>
    <div class="splitter-pane splitter-second">
      <slot name="second" />
    </div>
  </div>
</template>
