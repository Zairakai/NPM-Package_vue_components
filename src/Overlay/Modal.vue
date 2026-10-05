<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { queryBoolean } from '@/composables/useQueryParam'
  import { lockScroll, unlockScroll } from '@/composables/useScrollLock'
  import { getSupport } from '@/composables/useSupport'
  import { useUid } from '@/composables/useUid'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, useSlots, watch } from 'vue'

  defineOptions({
    name: 'OverlayModal',
  })

  const emit = defineEmits(['update:modelValue', 'open', 'close', 'cancel'])

  const props = defineProps({
    id: String,
    class: String,
    // Whether the dialog is open. Use it with v-model, it works without too.
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    // Keep the open state in this query parameter of the URL (?dialog=1).
    queryParam: String,
    title: String,
    // A modal blocks the page behind it; a non-modal dialog does not.
    modal: {
      type: Boolean,
      default: true,
    },
    // How it can be dismissed: "any" (Escape and a click outside), "closerequest" (Escape), "none" (only the code).
    closedby: {
      type: String,
      default: 'closerequest',
      validator(value) {
        return ['any', 'closerequest', 'none'].includes(value)
      },
    },
    // An alert dialog interrupts the user and expects an answer.
    alert: {
      type: Boolean,
      default: false,
    },
    closeButton: {
      type: Boolean,
      default: true,
    },
    closeLabel: {
      type: String,
      default: 'Close',
    },
  })

  const slots = useSlots()
  const uid = useUid('modal')
  const titleId = `${uid}-title`
  const bodyId = `${uid}-body`

  const dialog = ref(null)

  const state = useControllable(props, 'modelValue', emit, false, {
    param: props.queryParam,
    parse: queryBoolean,
    serialize: (value) => (value ? '1' : '0'),
    adapter: useQueryAdapter(),
  })

  // The native <dialog> when the browser has it; a div with the same role otherwise.
  // On the server there is no way to know, and the browser will have it: <dialog>.
  const native = 'undefined' === typeof document || getSupport().dialog
  const tag = native ? 'dialog' : 'div'

  let locked = false
  let opener = null

  function lock() {
    if (props.modal && !locked) {
      lockScroll()
      locked = true
    }
  }

  function unlock() {
    if (locked) {
      unlockScroll()
      locked = false
    }
  }

  const focusables = () => [
    ...dialog.value.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    ),
  ]

  function present() {
    const element = dialog.value

    if (!element) {
      return
    }

    if (native) {
      if (element.open) {
        return
      }

      props.modal ? element.showModal() : element.show()
    } else {
      opener = document.activeElement
      element.hidden = false
      ;(focusables()[0] ?? element).focus()
    }

    lock()
    emit('open')
  }

  function dismiss(returnValue) {
    const element = dialog.value

    if (!element) {
      return
    }

    if (native) {
      if (element.open) {
        element.close(returnValue)
      }

      return
    }

    element.hidden = true
    unlock()
    opener?.focus?.()
    opener = null
    emit('close', returnValue)
  }

  watch(state, (open) => (open ? present() : dismiss()), { flush: 'post' })

  onMounted(() => {
    if (!native) {
      dialog.value.hidden = true
    }

    if (state.value) {
      present()
    }
  })

  onBeforeUnmount(unlock)

  // The browser closed the dialog (Escape, a form with method="dialog", close()): follow it.
  async function onClose() {
    unlock()

    if (state.value) {
      state.value = false
    }

    emit('close', dialog.value.returnValue)

    // A parent that keeps the dialog open (v-model not updated) gets it back.
    await nextTick()

    if (state.value) {
      present()
    }
  }

  // Escape or requestClose(): the event can be cancelled to keep the dialog open.
  function onCancel(event) {
    emit('cancel', event)

    if ('none' === props.closedby && !getSupport().dialogClosedBy) {
      event.preventDefault()
    }
  }

  // Ask to close: the dialog fires "cancel" first and can refuse.
  function requestClose(returnValue) {
    const element = dialog.value

    if (native && getSupport().dialogRequestClose) {
      element.requestClose(returnValue)

      return
    }

    const event = new Event('cancel', { cancelable: true })

    element.dispatchEvent(event)

    if (!event.defaultPrevented) {
      native ? element.close(returnValue) : closeFallback(returnValue)
    }
  }

  function closeFallback(returnValue) {
    state.value = false
    dialog.value.returnValue = returnValue ?? ''
  }

  function close(returnValue) {
    if (native) {
      dialog.value.close(returnValue)

      return
    }

    closeFallback(returnValue)
  }

  // Light dismiss without the closedby attribute: a click on the backdrop is a click on the dialog itself.
  function onClick(event) {
    if ('any' !== props.closedby || event.target !== dialog.value) {
      return
    }

    if (native && getSupport().dialogClosedBy) {
      return
    }

    const rect = dialog.value.querySelector('.modal-content').getBoundingClientRect()
    const outside =
      event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom

    if (outside) {
      requestClose()
    }
  }

  // Without <dialog>: Escape and a focus trap, the browser does not give them.
  function onKeydown(event) {
    if (native) {
      return
    }

    if ('Escape' === event.key && 'none' !== props.closedby) {
      event.stopPropagation()
      requestClose()

      return
    }

    if ('Tab' === event.key) {
      const items = focusables()

      if (0 === items.length) {
        return
      }

      const first = items[0]
      const last = items[items.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
  }

  const hasTitle = computed(() => undefined !== props.title || undefined !== slots.header)

  const dialogProps = computed(() => ({
    id: props.id,
    class: `modal ${props.class ?? ''}`.trim(),
    role: props.alert ? 'alertdialog' : native ? undefined : 'dialog',
    'aria-modal': native ? undefined : props.modal ? 'true' : undefined,
    'aria-labelledby': hasTitle.value ? titleId : undefined,
    'aria-describedby': bodyId,
    closedby: native && getSupport().dialogClosedBy ? props.closedby : undefined,
    'data-fallback': native ? undefined : '',
    // The fallback root takes the focus when there is nothing else to focus.
    tabindex: native ? undefined : '-1',
    // Functional CSS only, for the fallback: it has to cover the page like the backdrop of a dialog does.
    style: native
      ? undefined
      : { position: 'fixed', inset: '0', zIndex: 'var(--zk-z-overlay, 1000)', display: 'grid', placeItems: 'center' },
  }))

  defineExpose({ show: () => (state.value = true), close, requestClose })
</script>

<template>
  <component
    :is="tag"
    ref="dialog"
    v-bind="dialogProps"
    @close="onClose"
    @cancel="onCancel"
    @click="onClick"
    @keydown="onKeydown"
  >
    <div class="modal-content">
      <header
        v-if="hasTitle || closeButton"
        class="modal-header"
      >
        <h2
          v-if="hasTitle"
          :id="titleId"
          class="modal-title"
        >
          <slot name="header">{{ title }}</slot>
        </h2>
        <button
          v-if="closeButton"
          type="button"
          class="modal-close"
          :aria-label="closeLabel"
          @click="requestClose()"
        >
          <slot name="close">&times;</slot>
        </button>
      </header>
      <div
        :id="bodyId"
        class="modal-body"
      >
        <slot />
      </div>
      <footer
        v-if="$slots.footer"
        class="modal-footer"
      >
        <slot
          name="footer"
          :close="close"
        />
      </footer>
    </div>
  </component>
</template>
