<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { computed } from 'vue'

  defineOptions({
    name: 'LayoutBottomNavigation',
  })

  const emit = defineEmits(['update:modelValue'])

  const props = defineProps({
    id: String,
    class: String,
    // The items: { value, label, href }. With an href an item is a link, otherwise a button.
    items: {
      type: Array,
      default: () => [],
    },
    // The value of the current item.
    modelValue: {
      type: String,
      default: undefined,
    },
    label: {
      type: String,
      default: 'Main',
    },
  })

  const current = useControllable(props, 'modelValue', emit, undefined)

  const navProps = computed(() => ({
    id: props.id,
    class: `bottom-navigation ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
  }))

  const itemProps = (item) => ({
    class: 'bottom-navigation-item',
    href: item.href,
    type: item.href ? undefined : 'button',
    'aria-current': current.value === item.value ? 'page' : undefined,
    'data-active': current.value === item.value ? '' : undefined,
  })
</script>

<template>
  <nav v-bind="navProps">
    <component
      :is="item.href ? 'a' : 'button'"
      v-for="item in items"
      :key="item.value"
      v-bind="itemProps(item)"
      @click="current = item.value"
    >
      <span
        class="bottom-navigation-icon"
        aria-hidden="true"
      >
        <slot
          :name="`icon-${item.value}`"
          :item="item"
        />
      </span>
      <span class="bottom-navigation-label">{{ item.label }}</span>
    </component>
  </nav>
</template>
