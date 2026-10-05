<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { queryList } from '@/composables/useQueryParam'
  import { useUid } from '@/composables/useUid'
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
    // Keep the open item in this query parameter of the URL (?faq=shipping, or ?faq=a,b when multiple).
    queryParam: String,
  })

  const root = ref(null)
  const state = useControllable(props, 'modelValue', emit, props.multiple ? [] : null, {
    param: props.queryParam,
    adapter: useQueryAdapter(),
    ...(props.multiple ? queryList : {}),
  })

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

  function setOpen(id, open) {
    if (isOpen(id) === open) {
      return
    }

    if (props.multiple) {
      state.value = open ? [...openIds.value, id] : openIds.value.filter((openId) => openId !== id)

      return
    }

    state.value = open ? id : null
  }

  // Native exclusivity: <details> that share a name close each other, no code needed.
  const name = props.multiple ? undefined : useUid('accordion')

  provide(ACCORDION_KEY, { name, isOpen, setOpen })

  // Arrow keys, Home and End move the focus between the headers.
  function onKeydown(event) {
    const triggers = [...root.value.querySelectorAll('[data-accordion-trigger]:not([aria-disabled="true"])')]
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
