<script setup>
import { computed } from 'vue'

defineOptions({
  name: 'FormLabel',
})

const props = defineProps({
  name: String,
  id: String,
  label: String,
  class: String,
  msr: String,
  iconBefore: String,
  iconAfter: String,
  prefix: String,
  suffix: String,
})

const labelProps = computed(() => ({
  for: props.id ?? props.name,
  class: props.class,
}))
</script>

<template>
  <label v-bind="labelProps">
    <span v-if="iconBefore || $slots['icon-before']" data-leading-icon
      ><slot name="icon-before">{{ iconBefore }}</slot></span
    >

    <span v-if="prefix || $slots['prefix']" data-prefix
      ><slot name="prefix">{{ prefix }}</slot></span
    >

    <span v-if="label !== undefined" data-content>
      <span>{{ label }}</span>
    </span>

    <span v-else-if="msr !== undefined" data-content class="msr">{{
      msr
    }}</span>

    <slot v-else />

    <span v-if="suffix || $slots['suffix']" data-suffix
      ><slot name="suffix">{{ suffix }}</slot></span
    >

    <span v-if="iconAfter || $slots['icon-after']" data-trailing-icon
      ><slot name="icon-after">{{ iconAfter }}</slot></span
    >
  </label>
</template>
