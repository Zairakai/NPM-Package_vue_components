<script setup>
  import { computed, ref, watch } from 'vue'

  defineOptions({
    name: 'MediaLazyImage',
  })

  const emit = defineEmits(['load', 'error'])

  const props = defineProps({
    id: String,
    class: String,
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    srcset: String,
    sizes: String,
    // Giving the size avoids the page jumping when the image arrives.
    width: [String, Number],
    height: [String, Number],
    // Load now instead of when it comes near the screen (the first image of a page).
    eager: {
      type: Boolean,
      default: false,
    },
    // The image shown if the real one fails.
    fallback: String,
    fit: {
      type: String,
      default: 'cover',
    },
  })

  const state = ref('loading')
  const failed = ref(false)

  // A new source starts again.
  watch(
    () => props.src,
    () => {
      state.value = 'loading'
      failed.value = false
    }
  )

  const current = computed(() => (failed.value && props.fallback ? props.fallback : props.src))

  function onLoad(event) {
    state.value = 'loaded'
    emit('load', event)
  }

  function onError(event) {
    if (props.fallback && !failed.value) {
      failed.value = true

      return
    }

    state.value = 'error'
    emit('error', event)
  }

  const wrapperProps = computed(() => ({
    id: props.id,
    class: `lazy-image ${props.class ?? ''}`.trim(),
    'data-state': state.value,
  }))

  const imageProps = computed(() => ({
    class: 'lazy-image-img',
    src: current.value,
    srcset: failed.value ? undefined : props.srcset,
    sizes: props.sizes,
    alt: props.alt,
    width: props.width,
    height: props.height,
    loading: props.eager ? 'eager' : 'lazy',
    decoding: 'async',
    fetchpriority: props.eager ? 'high' : undefined,
    style: { objectFit: props.fit },
  }))
</script>

<template>
  <span v-bind="wrapperProps">
    <span
      v-if="'loading' === state && $slots.placeholder"
      class="lazy-image-placeholder"
      aria-hidden="true"
    >
      <slot name="placeholder" />
    </span>
    <img
      v-if="'error' !== state"
      v-bind="imageProps"
      @load="onLoad"
      @error="onError"
    />
    <span
      v-else
      class="lazy-image-error"
      role="img"
      :aria-label="alt"
    >
      <slot name="error">{{ alt }}</slot>
    </span>
  </span>
</template>
