<script setup>
  import { computed } from 'vue'

  defineOptions({
    name: 'NavigationBreadcrumb',
  })

  const props = defineProps({
    id: String,
    class: String,
    // The trail: { label, href }. The last item is the current page.
    items: {
      type: Array,
      default: () => [],
    },
    label: {
      type: String,
      default: 'Breadcrumb',
    },
  })

  const breadcrumbProps = computed(() => ({
    id: props.id,
    class: `breadcrumb ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
  }))

  const isLast = (index) => index === props.items.length - 1
</script>

<template>
  <nav v-bind="breadcrumbProps">
    <ol>
      <li
        v-for="(item, index) in items"
        :key="index"
        class="breadcrumb-item"
      >
        <!-- Replace the link with your router link in this slot. -->
        <slot
          name="item"
          :item="item"
          :current="isLast(index)"
        >
          <span
            v-if="isLast(index) || !item.href"
            :aria-current="isLast(index) ? 'page' : undefined"
          >
            {{ item.label }}
          </span>
          <a
            v-else
            :href="item.href"
          >
            {{ item.label }}
          </a>
        </slot>
      </li>
    </ol>
  </nav>
</template>
