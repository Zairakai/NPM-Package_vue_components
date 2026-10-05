<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'ContentKbd',
  })

  const props = defineProps({
    id: String,
    class: String,
    // A combination, for example "Ctrl+K" or ["Ctrl", "K"]: each key gets its own element.
    keys: {
      type: [String, Array],
      default: undefined,
    },
    separator: {
      type: String,
      default: '+',
    },
  })

  const list = computed(() => {
    if (undefined === props.keys) {
      return []
    }

    return Array.isArray(props.keys) ? props.keys : props.keys.split(props.separator).map((key) => key.trim())
  })

  const kbdProps = computed(() => ({
    id: props.id,
    class: `kbd ${props.class ?? ''}`.trim(),
  }))
</script>

<template>
  <kbd
    v-if="0 === list.length"
    v-bind="kbdProps"
  >
    <slot />
  </kbd>
  <kbd
    v-else
    v-bind="kbdProps"
    class="kbd kbd-combo"
  >
    <template
      v-for="(key, index) in list"
      :key="index"
    >
      <span
        v-if="0 < index"
        class="kbd-separator"
        aria-hidden="true"
      >
        {{ separator }}
      </span>
      <kbd class="kbd-key">{{ key }}</kbd>
    </template>
  </kbd>
</template>
