<script setup>
  import { useClipboard } from '@/composables/useClipboard'
  import ContentJsonNode from '@content/JsonNode.vue'
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentJsonViewer',
  })

  const emit = defineEmits(['select'])

  const props = defineProps({
    id: String,
    class: String,
    value: {
      type: null,
      default: null,
    },
    // How many levels are open at the start.
    expanded: {
      type: Number,
      default: 1,
    },
    // Open and mark what contains this text.
    search: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: 'JSON',
    },
    copyable: {
      type: Boolean,
      default: true,
    },
    copyLabel: {
      type: String,
      default: 'Copy',
    },
    copiedLabel: {
      type: String,
      default: 'Copied',
    },
  })

  const { copied, copy } = useClipboard()

  const viewerProps = computed(() => ({
    id: props.id,
    class: `json-viewer ${props.class ?? ''}`.trim(),
    role: 'group',
    'aria-label': props.label,
  }))
</script>

<template>
  <div v-bind="viewerProps">
    <button
      v-if="copyable"
      type="button"
      class="json-copy"
      :data-copied="copied ? '' : undefined"
      @click="copy(JSON.stringify(value, null, 2))"
    >
      {{ copied ? copiedLabel : copyLabel }}
    </button>
    <ul class="json-root">
      <ContentJsonNode
        :value="value"
        :expand="expanded"
        :search="search"
        @select="emit('select', $event)"
      />
    </ul>
  </div>
</template>
