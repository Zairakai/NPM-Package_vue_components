<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useUid } from '@/composables/useUid'
  import { formatBytes, validateFiles } from '@form/inputs'
  import { computed, onBeforeUnmount, ref, watch } from 'vue'

  defineOptions({
    name: 'FormFileDropzone',
  })

  const emit = defineEmits(['update:modelValue', 'reject'])

  const props = defineProps({
    id: String,
    class: String,
    // The files, as an array of File.
    modelValue: {
      type: Array,
      default: undefined,
    },
    // What is accepted: ".pdf,image/*".
    accept: String,
    multiple: {
      type: Boolean,
      default: true,
    },
    // Bytes.
    maxSize: Number,
    maxFiles: Number,
    label: {
      type: String,
      default: 'Drop files here or',
    },
    browseLabel: {
      type: String,
      default: 'browse',
    },
    removeLabel: {
      type: String,
      default: 'Remove',
    },
    name: String,
    form: String,
    required: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    // Show a preview of the images.
    previews: {
      type: Boolean,
      default: true,
    },
  })

  const uid = useUid('dropzone')
  const state = useControllable(props, 'modelValue', emit, [])
  const input = ref(null)
  const dragging = ref(false)
  const errors = ref([])
  let depth = 0

  const reasons = { type: 'is not an accepted type', size: 'is too big', count: 'goes over the number of files' }

  function add(files) {
    const incoming = props.multiple ? files : files.slice(0, 1)
    const { accepted, rejected } = validateFiles(props.multiple ? state.value : [], incoming, props)

    errors.value = rejected.map(({ file, reason }) => ({
      name: file.name,
      reason,
      text: `${file.name} ${reasons[reason]}`,
    }))

    if (rejected.length) {
      emit('reject', rejected)
    }

    if (accepted.length) {
      state.value = props.multiple ? [...state.value, ...accepted] : accepted
    }
  }

  function onChange(event) {
    add([...event.target.files])
    // The same file can be chosen again after it was removed.
    event.target.value = ''
  }

  function onDrop(event) {
    event.preventDefault()
    depth = 0
    dragging.value = false

    if (!props.disabled) {
      add([...(event.dataTransfer?.files ?? [])])
    }
  }

  // The enter and leave events of the children would flicker the state: count them.
  function onDragEnter(event) {
    event.preventDefault()
    depth += 1
    dragging.value = !props.disabled
  }

  function onDragLeave() {
    depth = Math.max(0, depth - 1)
    dragging.value = 0 < depth
  }

  function remove(index) {
    state.value = state.value.filter((_, position) => position !== index)
  }

  function browse() {
    input.value?.click()
  }

  // Object URLs for the previews, released when the file goes away.
  const urls = new Map()

  function preview(file) {
    if (!props.previews || !file.type.startsWith('image/') || 'function' !== typeof URL.createObjectURL) {
      return undefined
    }

    if (!urls.has(file)) {
      urls.set(file, URL.createObjectURL(file))
    }

    return urls.get(file)
  }

  watch(state, (files) => {
    for (const [file, url] of urls) {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url)
        urls.delete(file)
      }
    }
  })

  onBeforeUnmount(() => urls.forEach((url) => URL.revokeObjectURL(url)))

  const rootProps = computed(() => ({
    id: props.id,
    class: `file-dropzone ${props.class ?? ''}`.trim(),
    'data-dragging': dragging.value ? '' : undefined,
    'data-disabled': props.disabled ? '' : undefined,
  }))
</script>

<template>
  <div v-bind="rootProps">
    <div
      class="file-dropzone-area"
      @dragenter="onDragEnter"
      @dragover.prevent
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <span class="file-dropzone-label">{{ label }}</span>
      <button
        type="button"
        class="file-dropzone-browse"
        :disabled="disabled"
        :aria-describedby="`${uid}-help`"
        @click="browse"
      >
        {{ browseLabel }}
      </button>
      <input
        ref="input"
        type="file"
        class="file-dropzone-input"
        hidden
        :accept="accept"
        :multiple="multiple"
        :name="name"
        :form="form"
        :required="required && 0 === state.length"
        :disabled="disabled"
        @change="onChange"
      />
      <slot />
    </div>
    <p
      :id="`${uid}-help`"
      class="file-dropzone-help"
    >
      <slot name="help">{{
        [
          accept,
          undefined !== maxSize ? `max ${formatBytes(maxSize)}` : '',
          undefined !== maxFiles ? `${maxFiles} files` : '',
        ]
          .filter(Boolean)
          .join(' · ')
      }}</slot>
    </p>
    <ul
      v-if="errors.length"
      class="file-dropzone-errors"
      role="alert"
    >
      <li
        v-for="error in errors"
        :key="error.name"
        :data-reason="error.reason"
      >
        {{ error.text }}
      </li>
    </ul>
    <ul
      v-if="state.length"
      class="file-dropzone-files"
    >
      <li
        v-for="(file, index) in state"
        :key="`${file.name}-${index}`"
        class="file-dropzone-file"
      >
        <img
          v-if="preview(file)"
          class="file-dropzone-preview"
          alt=""
          :src="preview(file)"
        />
        <span class="file-dropzone-name">{{ file.name }}</span>
        <span class="file-dropzone-size">{{ formatBytes(file.size) }}</span>
        <button
          type="button"
          class="file-dropzone-remove"
          :aria-label="`${removeLabel} ${file.name}`"
          :disabled="disabled"
          @click="remove(index)"
        >
          &times;
        </button>
      </li>
    </ul>
  </div>
</template>
