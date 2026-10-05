<script setup>
  import { childPath, contains, display, entriesOf, kindOf } from '@content/json'
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentJsonNode',
  })

  const props = defineProps({
    name: {
      type: String,
      default: '',
    },
    value: {
      type: null,
      default: null,
    },
    path: {
      type: String,
      default: '',
    },
    depth: {
      type: Number,
      default: 0,
    },
    expand: {
      type: Number,
      default: 1,
    },
    search: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['select'])

  const kind = computed(() => kindOf(props.value))
  const branch = computed(() => 'object' === kind.value || 'array' === kind.value)
  const children = computed(() => entriesOf(props.value))
  const matches = computed(() => '' !== props.search && contains(props.value, props.search, props.name))
  // A branch opens by default down to a depth, and for every match of the search.
  const open = computed(() => props.depth < props.expand || matches.value)
  const label = computed(() => ('array' === kind.value ? `[${children.value.length}]` : `{${children.value.length}}`))
  const ownMatch = computed(() => '' !== props.search && props.name.toLowerCase().includes(props.search.toLowerCase()))

  const select = () => emit('select', { path: props.path, value: props.value })
</script>

<template>
  <li
    v-if="!branch"
    class="json-leaf"
    :data-path="path"
    :data-match="matches ? '' : undefined"
  >
    <button
      v-if="'' !== name"
      type="button"
      class="json-key"
      @click="select"
    >
      {{ name }}
    </button>
    <span
      class="json-value"
      :data-type="kind"
      >{{ display(value) }}</span
    >
  </li>
  <li
    v-else
    class="json-branch"
    :data-path="path"
    :data-match="ownMatch ? '' : undefined"
  >
    <details :open="open">
      <summary>
        <button
          v-if="'' !== name"
          type="button"
          class="json-key"
          @click.prevent="select"
        >
          {{ name }}
        </button>
        <span
          class="json-count"
          :data-type="kind"
          >{{ label }}</span
        >
      </summary>
      <ul class="json-children">
        <ContentJsonNode
          v-for="[key, child] in children"
          :key="key"
          :name="key"
          :value="child"
          :path="childPath(path, key, kind)"
          :depth="depth + 1"
          :expand="expand"
          :search="search"
          @select="emit('select', $event)"
        />
      </ul>
    </details>
  </li>
</template>
