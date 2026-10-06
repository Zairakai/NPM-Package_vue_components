<script setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  defineOptions({
    name: 'NavigationBackToTop',
  })

  const emit = defineEmits(['click'])

  const props = defineProps({
    id: String,
    class: String,
    // The scroll distance, in pixels, after which the button shows.
    threshold: {
      type: Number,
      default: 300,
    },
    label: {
      type: String,
      default: 'Back to top',
    },
  })

  const visible = ref(false)

  const update = () => {
    visible.value = window.scrollY > props.threshold
  }

  function scrollTop() {
    // Smooth, unless the visitor asked for less motion.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

    window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
    emit('click')
  }

  onMounted(() => {
    update()
    window.addEventListener('scroll', update, { passive: true })
  })

  onBeforeUnmount(() => window.removeEventListener('scroll', update))
</script>

<template>
  <button
    v-if="visible"
    :id="id"
    type="button"
    :class="`back-to-top ${$props.class ?? ''}`.trim()"
    :aria-label="label"
    @click="scrollTop"
  >
    <slot>&uarr;</slot>
  </button>
</template>
