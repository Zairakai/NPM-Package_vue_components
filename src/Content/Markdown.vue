<script setup>
  import { renderMarkdown } from '@content/markdown'
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentMarkdown',
  })

  const props = defineProps({
    id: String,
    class: String,
    source: {
      type: String,
      default: '',
    },
    // Your own renderer: (markdown) => html. It must return HTML that is safe to show:
    // sanitize it (DOMPurify) if the Markdown does not come from you.
    renderer: {
      type: Function,
      default: undefined,
    },
  })

  const html = computed(() => (props.renderer ?? renderMarkdown)(props.source))

  const rootProps = computed(() => ({
    id: props.id,
    class: `markdown ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <div
    v-bind="rootProps"
    v-html="html"
  ></div>
</template>
