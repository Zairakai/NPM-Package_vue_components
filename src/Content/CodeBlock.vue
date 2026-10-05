<script setup>
  import { useClipboard } from '@/composables/useClipboard'
  import { parseLines, splitLines } from '@content/codeBlock'
  import { computed, useSlots } from 'vue'

  defineOptions({
    name: 'ContentCodeBlock',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The code. It can also be given as the text of the default slot.
    code: String,
    language: String,
    // A title: a file name, for example.
    title: String,
    lineNumbers: {
      type: Boolean,
      default: false,
    },
    // The lines to highlight: "2,4-6" or [2, "4-6"].
    highlightLines: {
      type: [String, Array],
      default: undefined,
    },
    wrap: {
      type: Boolean,
      default: false,
    },
    // A maximum height (any CSS length): the code scrolls inside.
    maxHeight: String,
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
    // Turns the code into highlighted HTML: (code, language) => string.
    // The result is rendered as HTML: only give it the output of a highlighter you trust.
    highlighter: Function,
  })

  const slots = useSlots()
  const { copied, copy } = useClipboard()

  const source = computed(() => {
    if (undefined !== props.code) {
      return props.code
    }

    return (slots.default?.() ?? []).map((node) => ('string' === typeof node.children ? node.children : '')).join('')
  })

  const lines = computed(() => splitLines(source.value))
  const highlighted = computed(() => parseLines(props.highlightLines))
  const html = computed(() => props.highlighter?.(source.value, props.language))
  const languageClass = computed(() => (props.language ? `language-${props.language}` : undefined))

  // The <pre> below has no whitespace around its content (it would be shown) and is a scrollable
  // region: it takes the focus (tabindex 0) so the keyboard can scroll it.

  const blockProps = computed(() => ({
    id: props.id,
    class: `code-block ${props.class ?? ''}`.trim(),
    'data-language': props.language,
    'data-line-numbers': props.lineNumbers ? '' : undefined,
    'data-wrap': props.wrap ? '' : undefined,
  }))

  // Functional CSS only: what the options need to work.
  const preStyle = computed(() => ({
    whiteSpace: props.wrap ? 'pre-wrap' : 'pre',
    overflow: 'auto',
    maxHeight: props.maxHeight,
  }))
</script>

<template>
  <figure v-bind="blockProps">
    <figcaption
      v-if="title || language || copyable"
      class="code-block-header"
    >
      <span
        v-if="title"
        class="code-block-title"
      >
        {{ title }}
      </span>
      <span
        v-if="language"
        class="code-block-language"
      >
        {{ language }}
      </span>
      <button
        v-if="copyable"
        type="button"
        class="code-block-copy"
        :data-copied="copied ? '' : undefined"
        @click="copy(source)"
      >
        {{ copied ? copiedLabel : copyLabel }}
      </button>
      <span
        class="code-block-status"
        role="status"
        aria-live="polite"
      >
        {{ copied ? copiedLabel : '' }}
      </span>
    </figcaption>
    <pre
      class="code-block-pre"
      tabindex="0"
      :style="preStyle"
    ><code v-if="html" :class="languageClass" v-html="html"></code><code v-else :class="languageClass"><span v-for="(line, index) in lines" :key="index" class="code-line" :data-line="index + 1" :data-highlighted="highlighted.has(index + 1) ? '' : undefined">{{ line }}
</span></code></pre>
  </figure>
</template>
