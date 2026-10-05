<script setup>
  import { DROPDOWN_KEY } from '@overlay/dropdown'
  import { nextTick, onBeforeUnmount, provide, ref } from 'vue'

  defineOptions({
    name: 'OverlayContextMenu',
  })

  const emit = defineEmits(['open', 'close'])

  const props = defineProps({
    id: String,
    class: String,
    label: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const open = ref(false)
  const position = ref({ x: 0, y: 0 })
  const menu = ref(null)

  function close() {
    if (open.value) {
      open.value = false
      document.removeEventListener('pointerdown', onOutside, true)
      emit('close')
    }
  }

  provide(DROPDOWN_KEY, { close })

  const items = () => [...(menu.value?.querySelectorAll('[role="menuitem"]:not([disabled])') ?? [])]

  function onOutside(event) {
    if (!menu.value?.contains(event.target)) {
      close()
    }
  }

  async function show(x, y) {
    position.value = { x, y }
    open.value = true
    emit('open')
    document.addEventListener('pointerdown', onOutside, true)
    await nextTick()

    // Keep the menu inside the window.
    const box = menu.value.getBoundingClientRect()

    position.value = {
      x: Math.max(0, Math.min(x, window.innerWidth - box.width)),
      y: Math.max(0, Math.min(y, window.innerHeight - box.height)),
    }
    items()[0]?.focus()
  }

  function onContextMenu(event) {
    if (props.disabled) {
      return
    }

    event.preventDefault()
    show(event.clientX, event.clientY)
  }

  // The menu key, or Shift+F10, opens it on the area for the keyboard.
  function onKeydown(event) {
    if ('ContextMenu' === event.key || (event.shiftKey && 'F10' === event.key)) {
      event.preventDefault()

      const box = event.currentTarget.getBoundingClientRect()

      show(box.left, box.bottom)
    }
  }

  function onMenuKeydown(event) {
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
    } else if ('Escape' === event.key || 'Tab' === event.key) {
      event.preventDefault()
      close()
    }
  }

  onBeforeUnmount(() => document.removeEventListener('pointerdown', onOutside, true))

  // Functional CSS only: where the pointer was.
  const style = () => ({
    position: 'fixed',
    left: `${position.value.x}px`,
    top: `${position.value.y}px`,
    margin: 0,
    zIndex: 1000,
  })
</script>

<template>
  <div
    :id="id"
    :class="`context-menu-area ${$props.class ?? ''}`.trim()"
    @contextmenu="onContextMenu"
    @keydown="onKeydown"
  >
    <slot />
    <div
      v-if="open"
      ref="menu"
      class="context-menu"
      role="menu"
      :aria-label="label"
      :style="style()"
      @keydown="onMenuKeydown"
    >
      <slot name="menu" />
    </div>
  </div>
</template>
