<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { splitTags } from '@form/inputs'
  import { computed, ref } from 'vue'

  defineOptions({
    name: 'FormTagsInput',
  })

  const emit = defineEmits(['update:modelValue', 'reject'])

  const props = defineProps({
    id: String,
    class: String,
    modelValue: {
      type: Array,
      default: undefined,
    },
    // The characters that end a tag when typed or pasted, besides Enter.
    separators: {
      type: Array,
      default: () => [',', ';'],
    },
    max: Number,
    allowDuplicates: {
      type: Boolean,
      default: false,
    },
    label: String,
    placeholder: String,
    name: String,
    form: String,
    disabled: {
      type: Boolean,
      default: false,
    },
    removeLabel: {
      type: String,
      default: 'Remove',
    },
  })

  const uid = useUid('tags')
  const inputId = computed(() => props.id ?? `${uid}-input`)
  const state = useControllable(props, 'modelValue', emit, [])
  const text = ref('')

  function add(values) {
    const next = [...state.value]

    for (const value of values) {
      if (!props.allowDuplicates && next.includes(value)) {
        emit('reject', { value, reason: 'duplicate' })
      } else if (undefined !== props.max && next.length >= props.max) {
        emit('reject', { value, reason: 'max' })
      } else {
        next.push(value)
      }
    }

    state.value = next
  }

  function flush() {
    const values = splitTags(text.value, props.separators)

    text.value = ''
    add(values)
  }

  function onInput(event) {
    text.value = event.target.value

    if (props.separators.some((separator) => text.value.includes(separator))) {
      flush()
      event.target.value = ''
    }
  }

  function onKeydown(event) {
    if ('Enter' === event.key) {
      if ('' !== text.value.trim()) {
        event.preventDefault()
        flush()
      }
    } else if ('Backspace' === event.key && '' === text.value && 0 < state.value.length) {
      state.value = state.value.slice(0, -1)
    }
  }

  function onPaste(event) {
    const values = splitTags(event.clipboardData?.getData('text') ?? '', [...props.separators, '\n', '\t'])

    if (1 < values.length) {
      event.preventDefault()
      add(values)
    }
  }

  function remove(index) {
    state.value = state.value.filter((_, position) => position !== index)
  }

  const rootProps = computed(() => ({
    class: `tags-input ${props.class ?? ''}`.trim(),
    'data-disabled': props.disabled ? '' : undefined,
  }))
</script>

<template>
  <div v-bind="rootProps">
    <label
      v-if="label"
      class="tags-input-label"
      :for="inputId"
    >
      {{ label }}
    </label>
    <ul
      class="tags-input-list"
      role="list"
    >
      <li
        v-for="(tag, index) in state"
        :key="`${tag}-${index}`"
        class="tags-input-tag"
      >
        <span class="tags-input-tag-label">{{ tag }}</span>
        <button
          type="button"
          class="tags-input-remove"
          :aria-label="`${removeLabel} ${tag}`"
          :disabled="disabled"
          @click="remove(index)"
        >
          &times;
        </button>
      </li>
    </ul>
    <input
      :id="inputId"
      type="text"
      class="tags-input-field"
      autocomplete="off"
      :placeholder="placeholder"
      :disabled="disabled"
      :value="text"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @blur="flush"
    />
    <template v-if="name">
      <input
        v-for="tag in state"
        :key="tag"
        type="hidden"
        :name="`${name}[]`"
        :form="form"
        :value="tag"
      />
    </template>
  </div>
</template>
