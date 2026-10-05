<script setup>
  import { onBeforeUnmount, onMounted, ref } from 'vue'

  defineOptions({
    name: 'DataInfiniteScroll',
  })

  const emit = defineEmits(['load'])

  const props = defineProps({
    id: String,
    class: String,
    loading: {
      type: Boolean,
      default: false,
    },
    // Nothing more to load.
    finished: {
      type: Boolean,
      default: false,
    },
    // How early to load: a CSS margin around the viewport, for example "200px".
    margin: {
      type: String,
      default: '200px',
    },
  })

  const sentinel = ref(null)
  let observer

  function check(entries) {
    if (entries.some((entry) => entry.isIntersecting) && !props.loading && !props.finished) {
      emit('load')
    }
  }

  // The browser tells when the end of the list comes near, no scroll listener.
  onMounted(() => {
    if ('undefined' === typeof IntersectionObserver) {
      return
    }

    observer = new IntersectionObserver(check, { rootMargin: props.margin })
    observer.observe(sentinel.value)
  })

  onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div
    :id="id"
    :class="`infinite-scroll ${$props.class ?? ''}`.trim()"
    :aria-busy="loading ? 'true' : undefined"
  >
    <slot />
    <div
      ref="sentinel"
      class="infinite-scroll-sentinel"
      aria-hidden="true"
    ></div>
    <div
      v-if="loading"
      class="infinite-scroll-loading"
      role="status"
    >
      <slot name="loading">Loading</slot>
    </div>
    <div
      v-else-if="finished"
      class="infinite-scroll-finished"
    >
      <slot name="finished" />
    </div>
  </div>
</template>
