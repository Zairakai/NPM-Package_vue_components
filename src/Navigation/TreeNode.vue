<script setup>
  import { computed, inject } from 'vue'

  defineOptions({
    name: 'NavigationTreeNode',
  })

  const props = defineProps({
    node: {
      type: Object,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
  })

  const tree = inject('zk-tree')

  const has = computed(() => Boolean(props.node.children?.length))
  const isOpen = computed(() => tree.open.value.includes(props.node.id))
  const isSelected = computed(() => tree.selected.value === props.node.id)
</script>

<template>
  <li
    class="tree-item"
    role="none"
  >
    <div
      class="tree-item-row"
      role="treeitem"
      :data-node-id="node.id"
      :tabindex="tree.tabbable.value === node.id ? 0 : -1"
      :aria-level="level"
      :aria-expanded="has ? isOpen : undefined"
      :aria-selected="isSelected"
      :aria-disabled="node.disabled ? 'true' : undefined"
      :data-selected="isSelected ? '' : undefined"
      :data-disabled="node.disabled ? '' : undefined"
      @click="tree.choose(node)"
      @focus="tree.focusNode && null"
    >
      <button
        v-if="has"
        type="button"
        class="tree-item-toggle"
        tabindex="-1"
        aria-hidden="true"
        @click.stop="tree.toggle(node.id)"
      >
        <span data-open-icon>{{ isOpen ? '▾' : '▸' }}</span>
      </button>
      <span
        v-else
        class="tree-item-toggle"
        aria-hidden="true"
      ></span>
      <span class="tree-item-label">
        <slot
          :node="node"
          :open="isOpen"
          :selected="isSelected"
        >
          {{ node.label }}
        </slot>
      </span>
    </div>
    <ul
      v-if="has && isOpen"
      class="tree-group"
      role="group"
    >
      <NavigationTreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :level="level + 1"
      >
        <template #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </NavigationTreeNode>
    </ul>
  </li>
</template>
