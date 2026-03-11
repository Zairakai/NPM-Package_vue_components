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
    <span
      v-if="iconBefore"
      data-leading-icon
      v-html="iconBefore"
    />

    <span
      v-if="prefix"
      data-prefix
      v-html="prefix"
    />

    <span
      v-if="undefined !== label && undefined !== id"
      data-content
    >
      <span v-html="label" />
    </span>

    <span
      v-else-if="undefined !== msr"
      data-content
      class="msr"
      v-html="msr"
    />

    <slot v-else />

    <span
      v-if="suffix"
      data-suffix
      v-html="suffix"
    />

    <span
      v-if="iconAfter"
      data-trailing-icon
      v-html="iconAfter"
    />
  </label>
</template>
