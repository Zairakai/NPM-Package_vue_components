<script setup>
import { TABS_KEY } from '@navigation/tabs'
import { computed, inject, ref } from 'vue'

defineOptions({
  name: 'NavigationTabList',
})

const props = defineProps({
  id: String,
  class: String,
  label: String,
})

const tabs = inject(TABS_KEY)
const root = ref(null)

const listProps = computed(() => ({
  id: props.id,
  class: `tab-list ${props.class ?? ''}`.trim(),
  role: 'tablist',
  'aria-label': props.label,
  'aria-orientation': tabs.orientation.value,
}))

// Arrow keys, Home and End move the focus; in automatic mode they also select.
function onKeydown(event) {
  const items = [...root.value.querySelectorAll('[role="tab"]:not([disabled])')]
  const index = items.indexOf(document.activeElement)

  if (index === -1) {
    return
  }

  const vertical = tabs.orientation.value === 'vertical'
  const previous = vertical ? 'ArrowUp' : 'ArrowLeft'
  const next = vertical ? 'ArrowDown' : 'ArrowRight'
  const target = {
    [previous]: (index - 1 + items.length) % items.length,
    [next]: (index + 1) % items.length,
    Home: 0,
    End: items.length - 1,
  }[event.key]

  if (undefined === target) {
    return
  }

  event.preventDefault()
  items[target].focus()

  if (tabs.activation.value === 'auto') {
    items[target].click()
  }
}
</script>

<template>
  <div ref="root" v-bind="listProps" @keydown="onKeydown">
    <slot />
  </div>
</template>
