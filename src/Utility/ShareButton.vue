<script setup>
  import { useClipboard } from '@/composables/useClipboard'
  import { getSupport } from '@/composables/useSupport'
  import { computed } from 'vue'

  defineOptions({
    name: 'UtilityShareButton',
  })

  const emit = defineEmits(['share', 'copy', 'error'])

  const props = defineProps({
    id: String,
    class: String,
    title: String,
    text: String,
    // The address to share. The current page by default.
    url: String,
    label: {
      type: String,
      default: 'Share',
    },
    copiedLabel: {
      type: String,
      default: 'Link copied',
    },
  })

  const { copied, copy } = useClipboard()
  const target = () => props.url ?? window.location.href

  // The share sheet of the system when the browser has it, otherwise the address is copied.
  async function share() {
    const data = { title: props.title, text: props.text, url: target() }

    if (getSupport().share && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        emit('share', data)
      } catch (error) {
        // Closing the sheet is not a failure.
        if ('AbortError' !== error?.name) {
          emit('error', error)
        }
      }

      return
    }

    if (await copy(data.url)) {
      emit('copy', data.url)
    } else {
      emit('error', new Error('Nothing could be shared or copied'))
    }
  }

  const buttonProps = computed(() => ({
    id: props.id,
    class: `share-button ${props.class ?? ''}`.trim(),
    type: 'button',
    'data-copied': copied.value ? '' : undefined,
  }))
</script>

<template>
  <button
    v-bind="buttonProps"
    @click="share"
  >
    <slot :copied="copied">{{ copied ? copiedLabel : label }}</slot>
    <span
      class="share-button-status"
      role="status"
    >
      {{ copied ? copiedLabel : '' }}
    </span>
  </button>
</template>
