<script setup>
  import { useClipboard } from '@/composables/useClipboard'
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentTerminal',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The session: a string per line ("$ npm install" is a command, the rest is output)
    // or { type: "command" | "output" | "comment", text }.
    lines: {
      type: Array,
      default: () => [],
    },
    prompt: {
      type: String,
      default: '$',
    },
    title: String,
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

  const COMMAND = /^[$>]\s+/

  const entries = computed(() =>
    props.lines.map((line) => {
      if ('string' !== typeof line) {
        return line
      }

      return COMMAND.test(line) ? { type: 'command', text: line.replace(COMMAND, '') } : { type: 'output', text: line }
    })
  )

  // Only the commands are copied: the output is not something to paste.
  const commands = computed(() =>
    entries.value
      .filter((entry) => 'command' === entry.type)
      .map((entry) => entry.text)
      .join('\n')
  )

  const terminalProps = computed(() => ({
    id: props.id,
    class: `terminal ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <figure v-bind="terminalProps">
    <figcaption
      v-if="title || copyable"
      class="terminal-header"
    >
      <span
        v-if="title"
        class="terminal-title"
      >
        {{ title }}
      </span>
      <button
        v-if="copyable"
        type="button"
        class="terminal-copy"
        :data-copied="copied ? '' : undefined"
        @click="copy(commands)"
      >
        {{ copied ? copiedLabel : copyLabel }}
      </button>
      <span
        class="terminal-status"
        role="status"
        aria-live="polite"
      >
        {{ copied ? copiedLabel : '' }}
      </span>
    </figcaption>
    <pre
      class="terminal-body"
      tabindex="0"
    ><span v-for="(entry, index) in entries" :key="index" class="terminal-line" :data-type="entry.type"><span v-if="'command' === entry.type" class="terminal-prompt" aria-hidden="true">{{ prompt }} </span><kbd v-if="'command' === entry.type">{{ entry.text }}</kbd><samp v-else-if="'output' === entry.type">{{ entry.text }}</samp><span v-else class="terminal-comment">{{ entry.text }}</span>
</span></pre>
  </figure>
</template>
