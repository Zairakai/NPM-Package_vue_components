<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { move } from '@data/sortable'
  import { computed, nextTick, ref } from 'vue'

  defineOptions({
    name: 'DataSortableList',
  })

  const emit = defineEmits(['update:modelValue', 'reorder'])

  const props = defineProps({
    id: String,
    class: String,
    // The items, in order.
    modelValue: {
      type: Array,
      default: undefined,
    },
    // The property that identifies an item. The item itself when empty.
    itemKey: String,
    label: String,
    handleLabel: {
      type: String,
      default: 'Reorder {item}',
    },
    // What is read to a screen reader. Use {item}, {position}, {total}.
    grabbedText: {
      type: String,
      default: '{item} grabbed, position {position} of {total}. Use the arrows to move it.',
    },
    movedText: {
      type: String,
      default: '{item} moved to position {position} of {total}.',
    },
    droppedText: {
      type: String,
      default: '{item} dropped at position {position} of {total}.',
    },
    cancelledText: {
      type: String,
      default: 'Move cancelled.',
    },
    itemLabel: {
      type: Function,
      default: (item) => String(item?.label ?? item),
    },
  })

  const state = useControllable(props, 'modelValue', emit, [])
  const grabbed = ref(null)
  const original = ref(null)
  const dragged = ref(null)
  const message = ref('')
  const list = ref(null)

  const keyOf = (item) => (props.itemKey ? item[props.itemKey] : item)

  const say = (template, index, item = state.value[index]) =>
    (message.value = template
      .replace('{item}', props.itemLabel(item))
      .replace('{position}', String(index + 1))
      .replace('{total}', String(state.value.length)))

  function reorder(from, to) {
    const next = move(state.value, from, to)

    if (next !== state.value) {
      state.value = next
      emit('reorder', { from, to })
    }
  }

  async function focusHandle(index) {
    await nextTick()
    list.value?.querySelectorAll('.sortable-handle')[index]?.focus()
  }

  // The keyboard way, for whoever cannot drag: Space grabs, arrows move, Space or Enter drops, Escape gives it back.
  function onHandleKeydown(event, index) {
    const grabbing = null !== grabbed.value

    if (' ' === event.key || 'Enter' === event.key) {
      event.preventDefault()

      if (grabbing) {
        say(props.droppedText, grabbed.value)
        grabbed.value = null
        original.value = null
      } else {
        grabbed.value = index
        original.value = [...state.value]
        say(props.grabbedText, index)
      }

      return
    }

    if (!grabbing) {
      return
    }

    if ('Escape' === event.key) {
      event.preventDefault()
      state.value = original.value
      grabbed.value = null
      message.value = props.cancelledText
      focusHandle(index)

      return
    }

    const to = { ArrowUp: grabbed.value - 1, ArrowDown: grabbed.value + 1, Home: 0, End: state.value.length - 1 }[
      event.key
    ]

    if (undefined !== to && 0 <= to && to < state.value.length) {
      event.preventDefault()
      const item = state.value[grabbed.value]

      reorder(grabbed.value, to)
      grabbed.value = to
      say(props.movedText, to, item)
      focusHandle(to)
    }
  }

  // The pointer way, with the native drag and drop.
  function onDragStart(event, index) {
    dragged.value = index
    event.dataTransfer?.setData('text/plain', String(index))

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
    }
  }

  function onDrop(event, index) {
    event.preventDefault()

    if (null !== dragged.value) {
      const item = state.value[dragged.value]

      reorder(dragged.value, index)
      say(props.droppedText, index, item)
    }

    dragged.value = null
  }

  const listProps = computed(() => ({
    id: props.id,
    class: `sortable-list ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
  }))
</script>

<template>
  <div>
    <ul
      ref="list"
      v-bind="listProps"
    >
      <li
        v-for="(item, index) in state"
        :key="keyOf(item)"
        class="sortable-item"
        draggable="true"
        :data-grabbed="index === grabbed ? '' : undefined"
        :data-dragging="index === dragged ? '' : undefined"
        @dragstart="onDragStart($event, index)"
        @dragover.prevent
        @drop="onDrop($event, index)"
        @dragend="dragged = null"
      >
        <button
          type="button"
          class="sortable-handle"
          :aria-label="handleLabel.replace('{item}', itemLabel(item))"
          :aria-pressed="index === grabbed"
          @keydown="onHandleKeydown($event, index)"
        >
          <slot name="handle">&#8942;&#8942;</slot>
        </button>
        <div class="sortable-content">
          <slot
            :item="item"
            :index="index"
          >
            {{ itemLabel(item) }}
          </slot>
        </div>
      </li>
    </ul>
    <p
      class="sortable-status"
      role="status"
      aria-live="assertive"
    >
      {{ message }}
    </p>
  </div>
</template>
