<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { ACCORDION_KEY } from '@display/accordion'
  import { computed, provide, ref } from 'vue'

  defineOptions({
    name: 'DisplayAccordion',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The open item: its id in single mode, an array of ids in multiple mode.
    modelValue: {
      type: [String, Array],
      default: undefined,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  })

  const root = ref(null)
  const state = useControllable(props, 'modelValue', emit, props.multiple ? [] : null)

  const openIds = computed(() => {
    const value = state.value

    if (Array.isArray(value)) {
      return value
    }

    return null === value || undefined === value ? [] : [value]
  })

  function isOpen(id) {
    return openIds.value.includes(id)
  }

  function toggle(id) {
    if (props.multiple) {
      state.value = isOpen(id) ? openIds.value.filter((openId) => openId !== id) : [...openIds.value, id]

      return
    }

    state.value = isOpen(id) ? null : id
  }

  provide(ACCORDION_KEY, { isOpen, toggle })

  // Arrow keys, Home and End move the focus between the headers.
  function onKeydown(event) {
    const triggers = [...root.value.querySelectorAll('[data-accordion-trigger]:not([disabled])')]
    const index = triggers.indexOf(document.activeElement)

    if (-1 === index) {
      return
    }

    const next = {
      ArrowDown: (index + 1) % triggers.length,
      ArrowUp: (index - 1 + triggers.length) % triggers.length,
      Home: 0,
      End: triggers.length - 1,
    }[event.key]

    if (undefined !== next) {
      event.preventDefault()
      triggers[next].focus()
    }
  }

  const accordionProps = computed(() => ({
    id: props.id,
    class: `accordion ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div
    ref="root"
    v-bind="accordionProps"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>
