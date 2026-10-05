<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { useUid } from '@/composables/useUid'
  import { withViewTransition } from '@/composables/useViewTransition'
  import { TABS_KEY } from '@navigation/tabs'
  import { computed, provide, ref, toRef } from 'vue'

  defineOptions({
    name: 'NavigationTabs',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The id of the active tab. Without it the first enabled tab is active.
    modelValue: {
      type: String,
      default: undefined,
    },
    // Keep the active tab in this query parameter of the URL (?tab=settings).
    queryParam: String,
    orientation: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value)
      },
    },
    // "auto" shows a panel as soon as its tab has the focus, "manual" waits for Enter or Space.
    activation: {
      type: String,
      default: 'auto',
      validator(value) {
        return ['auto', 'manual'].includes(value)
      },
    },
    // Animate the change of panel with a view transition, when the browser has them.
    transition: {
      type: Boolean,
      default: false,
    },
  })

  const chosen = useControllable(props, 'modelValue', emit, null, {
    param: props.queryParam,
    adapter: useQueryAdapter(),
  })

  // The tabs register in the order of the page, the first enabled one is the default.
  const registered = ref([])
  const active = computed(() => chosen.value ?? registered.value[0] ?? null)

  provide(TABS_KEY, {
    uid: useUid('tabs'),
    active,
    orientation: toRef(props, 'orientation'),
    activation: toRef(props, 'activation'),
    select: (id) => {
      if (props.transition) {
        withViewTransition(() => (chosen.value = id))

        return
      }

      chosen.value = id
    },
    register: (id) => {
      registered.value = [...registered.value, id]

      return () => {
        registered.value = registered.value.filter((registeredId) => registeredId !== id)
      }
    },
  })

  const tabsProps = computed(() => ({
    id: props.id,
    class: `tabs ${props.class ?? ''}`.trim(),
    'data-orientation': props.orientation,
  }))
</script>

<template>
  <div v-bind="tabsProps">
    <slot />
  </div>
</template>
