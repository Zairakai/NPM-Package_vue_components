<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { filterOptions, nextEnabled } from '@form/combobox'
  import OverlayModal from '@overlay/Modal.vue'
  import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

  defineOptions({
    name: 'NavigationCommandPalette',
  })

  const emit = defineEmits(['update:modelValue', 'select', 'search'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Boolean,
      default: undefined,
    },
    // The commands: { id, label, group, hint, disabled }.
    commands: {
      type: Array,
      default: () => [],
    },
    // The key that opens it with Ctrl or Cmd. Empty for no shortcut.
    shortcut: {
      type: String,
      default: 'k',
    },
    title: {
      type: String,
      default: 'Command palette',
    },
    placeholder: {
      type: String,
      default: 'Type a command',
    },
    emptyText: {
      type: String,
      default: 'No command found',
    },
    // The commands come from a server: they are not filtered here.
    remote: {
      type: Boolean,
      default: false,
    },
  })

  const uid = useUid('palette')
  const listId = `${uid}-list`
  const state = useControllable(props, 'modelValue', emit, false)
  const query = ref('')
  const active = ref(0)
  const input = ref(null)

  const shown = computed(() => (props.remote ? props.commands : filterOptions(props.commands, query.value)))

  // The commands in the order of their groups, with a heading before each one.
  const groups = computed(() => {
    const result = []

    shown.value.forEach((command) => {
      const name = command.group ?? ''
      const group = result.find((candidate) => candidate.name === name) ?? result[result.push({ name, items: [] }) - 1]

      group.items.push(command)
    })

    return result
  })

  const ordered = computed(() => groups.value.flatMap((group) => group.items))
  const indexOf = (command) => ordered.value.indexOf(command)

  watch(query, (value) => {
    emit('search', value)
    active.value = Math.max(0, nextEnabled(ordered.value, -1, 1))
  })

  watch(state, async (open) => {
    if (open) {
      query.value = ''
      active.value = Math.max(0, nextEnabled(ordered.value, -1, 1))
      await nextTick()
      input.value?.focus()
    }
  })

  function run(command) {
    if (command?.disabled) {
      return
    }

    state.value = false
    emit('select', command)
  }

  function onKeydown(event) {
    const actions = {
      ArrowDown: () => (active.value = nextEnabled(ordered.value, active.value, 1)),
      ArrowUp: () => (active.value = nextEnabled(ordered.value, active.value, -1)),
      Home: () => (active.value = nextEnabled(ordered.value, -1, 1)),
      End: () => (active.value = nextEnabled(ordered.value, 0, -1)),
      Enter: () => run(ordered.value[active.value]),
    }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()
    }
  }

  const onShortcut = (event) => {
    if (
      props.shortcut &&
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === props.shortcut.toLowerCase()
    ) {
      event.preventDefault()
      state.value = !state.value
    }
  }

  onMounted(() => document.addEventListener('keydown', onShortcut))
  onBeforeUnmount(() => document.removeEventListener('keydown', onShortcut))
</script>

<template>
  <OverlayModal
    :id="id"
    :class="`command-palette ${$props.class ?? ''}`.trim()"
    :model-value="state"
    :title="title"
    :close-button="false"
    closedby="any"
    @update:model-value="state = $event"
  >
    <input
      ref="input"
      v-model="query"
      type="text"
      class="command-palette-input"
      role="combobox"
      autocomplete="off"
      aria-expanded="true"
      :aria-controls="listId"
      :aria-activedescendant="ordered[active] ? `${uid}-command-${active}` : undefined"
      :aria-label="title"
      :placeholder="placeholder"
      @keydown="onKeydown"
    />
    <div
      :id="listId"
      class="command-palette-list"
      role="listbox"
    >
      <div
        v-for="group in groups"
        :key="group.name"
        class="command-palette-group"
        role="group"
        :aria-label="group.name || undefined"
      >
        <div
          v-if="group.name"
          class="command-palette-heading"
          role="presentation"
        >
          {{ group.name }}
        </div>
        <div
          v-for="command in group.items"
          :id="`${uid}-command-${indexOf(command)}`"
          :key="command.id"
          class="command-palette-command"
          role="option"
          :aria-selected="indexOf(command) === active"
          :aria-disabled="command.disabled ? 'true' : undefined"
          :data-active="indexOf(command) === active ? '' : undefined"
          @click="run(command)"
          @mousemove="command.disabled || (active = indexOf(command))"
        >
          <slot
            name="command"
            :command="command"
          >
            <span class="command-palette-label">{{ command.label }}</span>
            <kbd
              v-if="command.hint"
              class="command-palette-hint"
            >
              {{ command.hint }}
            </kbd>
          </slot>
        </div>
      </div>
      <p
        v-if="0 === ordered.length"
        class="command-palette-empty"
        role="presentation"
      >
        {{ emptyText }}
      </p>
    </div>
  </OverlayModal>
</template>
