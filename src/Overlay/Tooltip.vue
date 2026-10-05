<script setup>
  import { useFloating } from '@/composables/useFloating'
  import { usePopover } from '@/composables/usePopover'
  import { getSupport } from '@/composables/useSupport'
  import { useUid } from '@/composables/useUid'
  import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

  defineOptions({
    name: 'OverlayTooltip',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The text of the tooltip. Use the content slot for anything richer.
    text: String,
    placement: {
      type: String,
      default: 'top',
      validator(value) {
        return /^(top|bottom|left|right)(-(start|end))?$/.test(value)
      },
    },
    offset: {
      type: Number,
      default: 8,
    },
    // Milliseconds before a hover shows it. The focus shows it at once.
    delay: {
      type: Number,
      default: 300,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const uid = useUid('tooltip')
  const tooltipId = computed(() => props.id ?? `${uid}-tip`)

  const open = ref(false)
  const anchor = ref(null)
  const tip = ref(null)
  let timer

  const native = 'undefined' === typeof document || getSupport().popover

  // Manual: only the pointer and the focus decide when it shows.
  const popover = usePopover(tip, open, (value) => (open.value = value), 'manual', anchor)
  const floating = useFloating(anchor, tip, open, { placement: props.placement, offset: props.offset })

  function show() {
    clearTimeout(timer)

    if (!props.disabled) {
      open.value = true
    }
  }

  function hide() {
    clearTimeout(timer)
    open.value = false
  }

  function onPointerEnter(event) {
    // A touch has no hover: the tooltip would stay open until the next tap.
    if ('touch' === event.pointerType) {
      return
    }

    clearTimeout(timer)
    timer = setTimeout(show, props.delay)
  }

  function onKeydown(event) {
    if ('Escape' === event.key) {
      hide()
    }
  }

  // The trigger is described by the tooltip: set it on the element that was given.
  onMounted(() => {
    anchor.value.firstElementChild?.setAttribute('aria-describedby', tooltipId.value)
    popover.apply(open.value)
  })

  onBeforeUnmount(() => clearTimeout(timer))

  const tipProps = computed(() => ({
    id: tooltipId.value,
    class: `tooltip ${props.class ?? ''}`.trim(),
    role: 'tooltip',
    popover: native ? 'manual' : undefined,
    'data-placement': floating.placement.value,
    hidden: native ? undefined : !open.value,
    // The reset comes first: "inset" is a shorthand that would erase the left and top set after it.
    style: {
      inset: 'auto',
      margin: '0',
      ...floating.style.value,
      pointerEvents: 'none',
      zIndex: 'var(--zk-z-floating, 1100)',
    },
  }))
</script>

<template>
  <span
    ref="anchor"
    class="tooltip-anchor"
    style="display: inline-block"
    @pointerenter="onPointerEnter"
    @pointerleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown="onKeydown"
  >
    <slot />
    <span
      ref="tip"
      v-bind="tipProps"
      @toggle="popover.onToggle"
    >
      <slot name="content">{{ text }}</slot>
    </span>
  </span>
</template>
