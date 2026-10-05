<script setup>
  import { parseDiff, splitRows } from '@content/diff'
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentDiff',
  })

  const props = defineProps({
    id: String,
    class: String,
    // A unified diff, as printed by git diff.
    diff: {
      type: String,
      default: '',
    },
    view: {
      type: String,
      default: 'unified',
      validator(value) {
        return ['unified', 'split'].includes(value)
      },
    },
    lineNumbers: {
      type: Boolean,
      default: true,
    },
    title: String,
  })

  const lines = computed(() => parseDiff(props.diff))
  const rows = computed(() => splitRows(lines.value))

  const MARKS = { add: '+', del: '-', context: ' ', hunk: '', file: '' }

  const diffProps = computed(() => ({
    id: props.id,
    class: `diff ${props.class ?? ''}`.trim(),
    'data-view': props.view,
  }))

  // The element of a line: removed text is a <del>, added text an <ins>, as HTML intends.
  const tagOf = (line) => ({ add: 'ins', del: 'del' })[line.type] ?? 'span'
</script>

<template>
  <figure v-bind="diffProps">
    <figcaption
      v-if="title"
      class="diff-title"
    >
      {{ title }}
    </figcaption>
    <pre
      v-if="'unified' === view"
      class="diff-body"
      tabindex="0"
    ><component :is="tagOf(line)" v-for="(line, index) in lines" :key="index" class="diff-line" :data-type="line.type"><span v-if="lineNumbers" class="diff-number" aria-hidden="true" :data-old="line.oldNumber" :data-new="line.newNumber"></span><span class="diff-mark" aria-hidden="true">{{ MARKS[line.type] }}</span>{{ line.text }}
</component></pre>
    <div
      v-else
      class="diff-split"
    >
      <pre
        v-for="side in ['left', 'right']"
        :key="side"
        class="diff-body"
        :data-side="side"
        tabindex="0"
      ><component :is="row[side] ? tagOf(row[side]) : 'span'" v-for="(row, index) in rows" :key="index" class="diff-line" :data-type="row[side] ? ('right' === side && 'context' === row[side].type ? 'context' : row[side].type) : 'empty'"><span v-if="lineNumbers && row[side]" class="diff-number" aria-hidden="true" :data-old="row[side].oldNumber" :data-new="row[side].newNumber"></span>{{ row[side] ? row[side].text : '' }}
</component></pre>
    </div>
  </figure>
</template>
