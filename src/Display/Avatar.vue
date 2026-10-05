<script setup>
  import { computed, ref, watch } from 'vue'

  defineOptions({
    name: 'DisplayAvatar',
  })

  const props = defineProps({
    id: String,
    class: String,
    src: String,
    alt: String,
    name: String,
    size: {
      type: String,
      default: 'medium',
      validator(value) {
        return ['small', 'medium', 'large'].includes(value)
      },
    },
    shape: {
      type: String,
      default: 'circle',
      validator(value) {
        return ['circle', 'square'].includes(value)
      },
    },
  })

  const failed = ref(false)

  watch(
    () => props.src,
    () => {
      failed.value = false
    }
  )

  const initials = computed(() => {
    const words = (props.name ?? '').trim().split(/\s+/).filter(Boolean)

    if (0 === words.length) {
      return ''
    }

    if (1 === words.length) {
      return words[0].slice(0, 2).toUpperCase()
    }

    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  })

  const avatarProps = computed(() => ({
    id: props.id,
    class: `avatar ${props.class ?? ''}`.trim(),
    role: 'img',
    'aria-label': props.alt ?? props.name,
    'data-size': props.size,
    'data-shape': props.shape,
  }))
</script>

<template>
  <span v-bind="avatarProps">
    <img
      v-if="src && !failed"
      :src="src"
      alt=""
      @error="failed = true"
    />
    <span
      v-else-if="initials"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
    <slot v-else />
  </span>
</template>
