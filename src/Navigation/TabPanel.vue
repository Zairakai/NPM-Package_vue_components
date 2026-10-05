<script setup>
  import { getSupport } from '@/composables/useSupport'
  import { TABS_KEY } from '@navigation/tabs'
  import { computed, inject } from 'vue'

  defineOptions({
    name: 'NavigationTabPanel',
  })

  const props = defineProps({
    // Required: the id of the tab it belongs to.
    id: {
      type: String,
      required: true,
    },
    class: String,
  })

  const tabs = inject(TABS_KEY)
  const selected = computed(() => tabs.active.value === props.id)

  // "until-found" keeps the hidden panels searchable: the browser reveals one when
  // the page search finds a match in it, and fires "beforematch" so we select its tab.
  // Set as an attribute: a boolean property could not carry the value "until-found".
  const hiddenAttribute = computed(() =>
    selected.value ? undefined : getSupport().hiddenUntilFound ? 'until-found' : ''
  )

  const panelProps = computed(() => ({
    id: `${tabs.uid}-panel-${props.id}`,
    class: `tab-panel ${props.class ?? ''}`.trim(),
    role: 'tabpanel',
    'aria-labelledby': `${tabs.uid}-tab-${props.id}`,
    tabindex: 0,
  }))
</script>

<template>
  <div
    v-bind="panelProps"
    :hidden.attr="hiddenAttribute"
    @beforematch="tabs.select(id)"
  >
    <slot />
  </div>
</template>
