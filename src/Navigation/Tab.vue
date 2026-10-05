<script setup>
  import { TABS_KEY } from '@navigation/tabs'
  import { computed, inject, onBeforeUnmount, watch } from 'vue'

  defineOptions({
    name: 'NavigationTab',
  })

  const props = defineProps({
    // Required: links the tab to the panel with the same id.
    id: {
      type: String,
      required: true,
    },
    class: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const tabs = inject(TABS_KEY)
  const selected = computed(() => tabs.active.value === props.id)

  // A disabled tab can never be the default one.
  let unregister = null

  watch(
    () => props.disabled,
    (disabled) => {
      unregister?.()
      unregister = disabled ? null : tabs.register(props.id)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => unregister?.())

  const tabProps = computed(() => ({
    id: `${tabs.uid}-tab-${props.id}`,
    class: `tab ${props.class ?? ''}`.trim(),
    type: 'button',
    role: 'tab',
    disabled: props.disabled,
    'aria-selected': selected.value,
    'aria-controls': `${tabs.uid}-panel-${props.id}`,
    // Only the selected tab is in the tab order, the arrow keys reach the others.
    tabindex: selected.value ? 0 : -1,
  }))
</script>

<template>
  <button
    v-bind="tabProps"
    @click="tabs.select(id)"
  >
    <slot />
  </button>
</template>
