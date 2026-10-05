<script setup>
  import { LIST_KEY } from '@display/list'
  import { computed, inject } from 'vue'

  defineOptions({
    name: 'DisplayListItem',
  })

  const props = defineProps({
    id: String,
    class: String,
    title: String,
    subtitle: String,
    // The value it adds to the selection of the list.
    value: String,
    // Makes the item a link.
    href: String,
    disabled: {
      type: Boolean,
      default: false,
    },
  })

  const list = inject(LIST_KEY, null)

  const selectable = computed(
    () => Boolean(list) && 'none' !== list.selectable.value && undefined !== props.value && !props.href
  )
  const selected = computed(() => selectable.value && list.isSelected(props.value))
  const tag = computed(() => (props.href ? 'a' : selectable.value ? 'button' : 'div'))

  const itemProps = computed(() => ({
    id: props.id,
    class: `list-item ${props.class ?? ''}`.trim(),
    'data-selected': selected.value ? '' : undefined,
    'data-disabled': props.disabled ? '' : undefined,
  }))

  const bodyProps = computed(() => ({
    class: 'list-item-body',
    href: props.href && !props.disabled ? props.href : undefined,
    type: 'button' === tag.value ? 'button' : undefined,
    disabled: 'button' === tag.value ? props.disabled : undefined,
    'aria-pressed': 'button' === tag.value ? selected.value : undefined,
    'aria-disabled': 'a' === tag.value && props.disabled ? 'true' : undefined,
  }))
</script>

<template>
  <li v-bind="itemProps">
    <component
      :is="tag"
      v-bind="bodyProps"
      @click="selectable && list.toggle(value)"
    >
      <span
        v-if="$slots.prepend"
        class="list-item-prepend"
      >
        <slot name="prepend" />
      </span>
      <span class="list-item-content">
        <span
          v-if="title || $slots.title"
          class="list-item-title"
        >
          <slot name="title">{{ title }}</slot>
        </span>
        <span
          v-if="subtitle"
          class="list-item-subtitle"
        >
          {{ subtitle }}
        </span>
        <slot />
      </span>
      <span
        v-if="$slots.append"
        class="list-item-append"
      >
        <slot name="append" />
      </span>
    </component>
  </li>
</template>
