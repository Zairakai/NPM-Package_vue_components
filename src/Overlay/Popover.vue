<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useFloating } from '@/composables/useFloating'
  import { usePopover } from '@/composables/usePopover'
  import { getSupport } from '@/composables/useSupport'
  import { useUid } from '@/composables/useUid'
  import { computed, onMounted, ref } from 'vue'

  defineOptions({
    name: 'OverlayPopover',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // Whether the panel is open. Use it with v-model, it works without too.
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    placement: {
      type: String,
      default: 'bottom',
      validator(value) {
        return /^(top|bottom|left|right)(-(start|end))?$/.test(value)
      },
    },
    // The distance to the trigger, in pixels.
    offset: {
      type: Number,
      default: 8,
    },
    // "auto" closes on a click outside and on Escape; "manual" only closes from the code.
    mode: {
      type: String,
      default: 'auto',
      validator(value) {
        return ['auto', 'manual'].includes(value)
      },
    },
    // What kind of popup the trigger opens, for assistive technologies.
    haspopup: {
      type: String,
      default: 'dialog',
    },
    // The role of the panel.
    role: {
      type: String,
      default: 'dialog',
    },
    label: String,
  })

  const uid = useUid('popover')
  const panelId = computed(() => props.id ?? `${uid}-panel`)

  const state = useControllable(props, 'modelValue', emit, false)
  const anchor = ref(null)
  const panel = ref(null)

  // The Popover API when the browser has it; on the server the browser is assumed to have it.
  const native = 'undefined' === typeof document || getSupport().popover

  const popover = usePopover(
    panel,
    state,
    (value) => {
      state.value = value
    },
    props.mode,
    anchor
  )
  const floating = useFloating(anchor, panel, state, { placement: props.placement, offset: props.offset })

  onMounted(() => popover.apply(state.value))

  // Everything the element that opens the panel needs: put it on your button.
  const triggerAttributes = computed(() => ({
    ...popover.triggerAttributes(panelId.value),
    'aria-expanded': state.value,
    'aria-controls': panelId.value,
    'aria-haspopup': props.haspopup,
  }))

  // Functional CSS only: the browser centers a popover, here it has to sit next to its trigger.
  const panelProps = computed(() => ({
    id: panelId.value,
    class: `popover ${props.class ?? ''}`.trim(),
    role: props.role,
    popover: native ? props.mode : undefined,
    'aria-label': props.label,
    'data-placement': floating.placement.value,
    hidden: native ? undefined : !state.value,
    // The reset comes first: "inset" is a shorthand that would erase the left and top set after it.
    style: {
      inset: 'auto',
      margin: '0',
      ...floating.style.value,
      zIndex: 'var(--zk-z-floating, 1100)',
    },
  }))

  defineExpose({ open: () => (state.value = true), close: () => (state.value = false), update: floating.update })
</script>

<template>
  <span
    ref="anchor"
    class="popover-anchor"
    style="display: inline-block"
  >
    <slot
      name="trigger"
      :attrs="triggerAttributes"
      :open="state"
    />
    <div
      ref="panel"
      v-bind="panelProps"
      @toggle="popover.onToggle"
    >
      <slot />
    </div>
  </span>
</template>
