<script setup>
  import { useUid } from '@/composables/useUid'
  import { ACCORDION_KEY } from '@display/accordion'
  import { computed, inject, ref } from 'vue'

  defineOptions({
    name: 'DisplayAccordionItem',
  })

  const props = defineProps({
    // Required inside an accordion: the id the accordion keeps in its v-model.
    id: {
      type: String,
      required: true,
    },
    class: String,
    title: String,
    // The heading level of the header, 2 to 6.
    level: {
      type: Number,
      default: 3,
      validator(value) {
        return 2 <= value && 6 >= value
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const uid = useUid('accordion')
  const triggerId = `${uid}-trigger`
  const panelId = `${uid}-panel`

  // Standalone (no parent accordion): the item keeps its own state.
  const accordion = inject(ACCORDION_KEY, null)
  const own = ref(false)

  const open = computed(() => (accordion ? accordion.isOpen(props.id) : own.value))

  function toggle() {
    if (accordion) {
      accordion.toggle(props.id)

      return
    }

    own.value = !own.value
  }

  const itemProps = computed(() => ({
    class: `accordion-item ${props.class ?? ''}`.trim(),
    'data-open': open.value ? '' : undefined,
  }))
</script>

<template>
  <div v-bind="itemProps">
    <component
      :is="`h${level}`"
      class="accordion-header"
    >
      <button
        :id="triggerId"
        type="button"
        class="accordion-trigger"
        data-accordion-trigger
        :aria-expanded="open"
        :aria-controls="panelId"
        :disabled="disabled"
        @click="toggle"
      >
        <slot name="title">{{ title }}</slot>
      </button>
    </component>
    <div
      :id="panelId"
      class="accordion-panel"
      role="region"
      :aria-labelledby="triggerId"
      :hidden="!open"
    >
      <slot />
    </div>
  </div>
</template>
