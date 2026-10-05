<script setup>
  import { ACCORDION_KEY } from '@display/accordion'
  import { computed, inject, nextTick, ref } from 'vue'

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

  // Standalone (no parent accordion): the item keeps its own state.
  const accordion = inject(ACCORDION_KEY, null)
  const own = ref(false)
  const details = ref(null)

  const open = computed(() => (accordion ? accordion.isOpen(props.id) : own.value))

  // The browser opens and closes the <details> by itself: follow it.
  async function onToggle(event) {
    const isOpen = event.target.open

    if (accordion) {
      accordion.setOpen(props.id, isOpen)
    } else {
      own.value = isOpen
    }

    // A parent that refuses the change (v-model not updated) keeps the DOM in sync.
    await nextTick()
    details.value.open = open.value
  }

  function onSummaryClick(event) {
    if (props.disabled) {
      event.preventDefault()
    }
  }

  const itemProps = computed(() => ({
    class: `accordion-item ${props.class ?? ''}`.trim(),
    name: accordion?.name,
    open: open.value,
    'data-disabled': props.disabled ? '' : undefined,
  }))
</script>

<template>
  <details
    ref="details"
    v-bind="itemProps"
    @toggle="onToggle"
  >
    <summary
      class="accordion-trigger"
      data-accordion-trigger
      :aria-disabled="disabled ? 'true' : undefined"
      @click="onSummaryClick"
    >
      <component
        :is="`h${level}`"
        class="accordion-header"
      >
        <slot name="title">{{ title }}</slot>
      </component>
    </summary>
    <div class="accordion-panel">
      <slot />
    </div>
  </details>
</template>
