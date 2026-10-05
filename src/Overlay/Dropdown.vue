<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { DROPDOWN_KEY } from '@overlay/dropdown'
  import OverlayPopover from '@overlay/Popover.vue'
  import { nextTick, provide, ref } from 'vue'

  defineOptions({
    name: 'OverlayDropdown',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    placement: {
      type: String,
      default: 'bottom-start',
    },
    label: String,
  })

  const state = useControllable(props, 'modelValue', emit, false)
  const menu = ref(null)

  provide(DROPDOWN_KEY, {
    close: () => {
      state.value = false
    },
  })

  const items = () => [...(menu.value?.$el.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [])]

  async function focusItem(position) {
    await nextTick()

    const list = items()

    list.at('last' === position ? -1 : 0)?.focus()
  }

  // The menu opens with the first item focused, as the menu pattern asks.
  function onUpdate(value) {
    state.value = value

    if (value) {
      focusItem('first')
    }
  }

  // The keyboard on the trigger: the arrows open the menu on the first or the last item.
  function onTriggerKeydown(event) {
    if ('ArrowDown' === event.key || 'ArrowUp' === event.key) {
      event.preventDefault()
      state.value = true
      focusItem('ArrowUp' === event.key ? 'last' : 'first')
    }
  }

  let search = ''
  let timer

  // The keyboard in the menu: arrows, Home, End, and the first letters to jump to an item.
  function onKeydown(event) {
    const list = items()
    const index = list.indexOf(document.activeElement)

    const move = {
      ArrowDown: (index + 1) % list.length,
      ArrowUp: (index - 1 + list.length) % list.length,
      Home: 0,
      End: list.length - 1,
    }[event.key]

    if (undefined !== move) {
      event.preventDefault()
      list[move]?.focus()

      return
    }

    if ('Tab' === event.key) {
      state.value = false

      return
    }

    if (1 === event.key.length && !event.ctrlKey && !event.metaKey && !event.altKey) {
      clearTimeout(timer)
      search += event.key.toLowerCase()
      timer = setTimeout(() => (search = ''), 500)

      const found = [...list.slice(index + 1), ...list.slice(0, index + 1)].find((item) =>
        item.textContent.trim().toLowerCase().startsWith(search)
      )

      found?.focus()
    }
  }
</script>

<template>
  <OverlayPopover
    ref="menu"
    :id="id"
    :class="`dropdown ${$props.class ?? ''}`.trim()"
    :model-value="state"
    :placement="placement"
    :label="label"
    haspopup="menu"
    role="menu"
    @update:model-value="onUpdate"
  >
    <template #trigger="{ attrs, open }">
      <slot
        name="trigger"
        :attrs="{ ...attrs, onKeydown: onTriggerKeydown }"
        :open="open"
      />
    </template>
    <div
      class="dropdown-menu"
      @keydown="onKeydown"
    >
      <slot />
    </div>
  </OverlayPopover>
</template>
