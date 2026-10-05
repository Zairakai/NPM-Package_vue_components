<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { ancestorsOf, branchIds, visibleNodes } from '@navigation/tree'
  import NavigationTreeNode from '@navigation/TreeNode.vue'
  import { computed, nextTick, provide, ref } from 'vue'

  defineOptions({
    name: 'NavigationTreeView',
  })

  const emit = defineEmits(['update:modelValue', 'update:expanded', 'select'])

  const props = defineProps({
    id: String,
    class: String,
    // The tree: { id, label, disabled, children }.
    nodes: {
      type: Array,
      default: () => [],
    },
    // The id of the selected node.
    modelValue: {
      type: String,
      default: undefined,
    },
    // The ids of the open branches.
    expanded: {
      type: Array,
      default: undefined,
    },
    label: String,
  })

  const selected = useControllable(props, 'modelValue', emit, undefined)
  const open = useControllable(props, 'expanded', emit, [])

  const root = ref(null)
  const flat = computed(() => visibleNodes(props.nodes, open.value))

  // Roving tabindex: one node can take the Tab key, the selected one or else the first.
  const focusedId = ref(undefined)
  const tabbable = computed(() => {
    const wanted = focusedId.value ?? selected.value

    return flat.value.some((entry) => entry.node.id === wanted && !entry.node.disabled)
      ? wanted
      : flat.value.find((entry) => !entry.node.disabled)?.node.id
  })

  async function focusNode(id) {
    focusedId.value = id
    await nextTick()
    ;[...(root.value?.querySelectorAll('[data-node-id]') ?? [])]
      .find((element) => element.dataset.nodeId === id)
      ?.focus()
  }

  function toggle(id, value) {
    const isOpen = open.value.includes(id)
    const next = value ?? !isOpen

    open.value = next ? [...open.value, id] : open.value.filter((item) => item !== id)
  }

  function choose(node) {
    if (node.disabled) {
      return
    }

    selected.value = node.id
    emit('select', node)
  }

  provide('zk-tree', { selected, open, tabbable, toggle, choose, focusNode })

  let typed = ''
  let timer

  function onKeydown(event) {
    const entries = flat.value.filter((entry) => !entry.node.disabled)
    const index = entries.findIndex((entry) => entry.node.id === (focusedId.value ?? tabbable.value))
    const current = entries[index]

    if (!current) {
      return
    }

    const has = Boolean(current.node.children?.length)
    const isOpen = open.value.includes(current.node.id)

    const actions = {
      ArrowDown: () =>
        entries[Math.min(entries.length - 1, index + 1)] &&
        focusNode(entries[Math.min(entries.length - 1, index + 1)].node.id),
      ArrowUp: () => focusNode(entries[Math.max(0, index - 1)].node.id),
      Home: () => focusNode(entries[0].node.id),
      End: () => focusNode(entries.at(-1).node.id),
      ArrowRight: () => {
        if (has && !isOpen) {
          toggle(current.node.id, true)
        } else if (has) {
          focusNode(current.node.children.find((child) => !child.disabled)?.id ?? current.node.id)
        }
      },
      ArrowLeft: () => {
        if (has && isOpen) {
          toggle(current.node.id, false)
        } else if (null !== current.parent) {
          focusNode(current.parent)
        }
      },
      Enter: () => choose(current.node),
      ' ': () => choose(current.node),
      '*': () => (open.value = [...new Set([...open.value, ...branchIds(props.nodes)])]),
    }

    if (actions[event.key]) {
      event.preventDefault()
      actions[event.key]()

      return
    }

    // The first letters jump to the next node that starts with them.
    if (1 === event.key.length && !event.ctrlKey && !event.metaKey && !event.altKey) {
      clearTimeout(timer)
      typed += event.key.toLowerCase()
      timer = setTimeout(() => (typed = ''), 500)

      const found = [...entries.slice(index + 1), ...entries.slice(0, index + 1)].find((entry) =>
        entry.node.label.toLowerCase().startsWith(typed)
      )

      if (found) {
        focusNode(found.node.id)
      }
    }
  }

  // Open the branches that lead to a node.
  function reveal(id) {
    const path = ancestorsOf(props.nodes, id)

    if (path) {
      open.value = [...new Set([...open.value, ...path])]
    }
  }

  defineExpose({ reveal })

  const treeProps = computed(() => ({
    id: props.id,
    class: `tree-view ${props.class ?? ''}`.trim(),
    role: 'tree',
    'aria-label': props.label,
  }))
</script>

<template>
  <ul
    ref="root"
    v-bind="treeProps"
    @keydown="onKeydown"
  >
    <NavigationTreeNode
      v-for="node in nodes"
      :key="node.id"
      :node="node"
      :level="1"
    >
      <template #default="slotProps">
        <slot v-bind="slotProps" />
      </template>
    </NavigationTreeNode>
  </ul>
</template>
