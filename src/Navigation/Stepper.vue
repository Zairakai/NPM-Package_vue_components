<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { queryNumber } from '@/composables/useQueryParam'
  import { computed } from 'vue'

  defineOptions({
    name: 'NavigationStepper',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The steps: { id, label, description }.
    steps: {
      type: Array,
      default: () => [],
    },
    // The index of the current step, starting at 0.
    modelValue: {
      type: Number,
      default: undefined,
    },
    // In a linear stepper only the completed steps can be reached again.
    linear: {
      type: Boolean,
      default: true,
    },
    orientation: {
      type: String,
      default: 'horizontal',
      validator(value) {
        return ['horizontal', 'vertical'].includes(value)
      },
    },
    // Keep the current step in this query parameter of the URL (?step=2).
    queryParam: String,
    label: String,
  })

  const current = useControllable(props, 'modelValue', emit, 0, {
    param: props.queryParam,
    parse: queryNumber(0),
    adapter: useQueryAdapter(),
  })

  const stateOf = (index) => (index < current.value ? 'complete' : index === current.value ? 'current' : 'upcoming')

  const reachable = (index) => index !== current.value && (!props.linear || index < current.value)

  const stepperProps = computed(() => ({
    id: props.id,
    class: `stepper ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
    'data-orientation': props.orientation,
  }))
</script>

<template>
  <ol v-bind="stepperProps">
    <li
      v-for="(step, index) in steps"
      :key="step.id ?? index"
      class="step"
      :data-state="stateOf(index)"
      :aria-current="index === current ? 'step' : undefined"
    >
      <component
        :is="reachable(index) ? 'button' : 'span'"
        class="step-trigger"
        :type="reachable(index) ? 'button' : undefined"
        @click="reachable(index) && (current = index)"
      >
        <span
          class="step-marker"
          aria-hidden="true"
        >
          <slot
            name="marker"
            :step="step"
            :index="index"
            :state="stateOf(index)"
          >
            {{ index + 1 }}
          </slot>
        </span>
        <span class="step-label">{{ step.label }}</span>
        <span
          v-if="step.description"
          class="step-description"
        >
          {{ step.description }}
        </span>
      </component>
    </li>
  </ol>
</template>
