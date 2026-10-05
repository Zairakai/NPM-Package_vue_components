<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { queryNumber } from '@/composables/useQueryParam'
  import { paginationRange } from '@navigation/pagination'
  import { computed } from 'vue'

  defineOptions({
    name: 'NavigationPagination',
  })

  const emit = defineEmits(['update:modelValue', 'change'])

  const props = defineProps({
    id: String,
    class: String,
    // The current page, starting at 1.
    modelValue: {
      type: Number,
      default: undefined,
    },
    // Either the number of pages...
    pages: Number,
    // ...or the number of items and the size of a page.
    totalItems: Number,
    pageSize: {
      type: Number,
      default: 10,
    },
    siblings: {
      type: Number,
      default: 1,
    },
    boundaries: {
      type: Number,
      default: 1,
    },
    // Keep the page in this query parameter of the URL (?page=3). The items become real links.
    queryParam: String,
    // Build the link of a page yourself (a router link, another URL scheme). The items become real links.
    hrefFor: Function,
    label: {
      type: String,
      default: 'Pagination',
    },
    previousLabel: {
      type: String,
      default: 'Previous page',
    },
    nextLabel: {
      type: String,
      default: 'Next page',
    },
    pageLabel: {
      type: String,
      default: 'Page',
    },
  })

  const adapter = useQueryAdapter()
  const page = useControllable(props, 'modelValue', emit, 1, {
    param: props.queryParam,
    parse: queryNumber(1),
    adapter,
  })

  const total = computed(() => props.pages ?? Math.max(1, Math.ceil((props.totalItems ?? 0) / props.pageSize)))

  const items = computed(() => paginationRange(page.value, total.value, props.siblings, props.boundaries))

  // Real links work without script and can be crawled; the click is still handled here.
  const linked = computed(() => undefined !== props.queryParam || undefined !== props.hrefFor)

  function hrefOf(target) {
    if (props.hrefFor) {
      return props.hrefFor(target)
    }

    const params = adapter.read()

    if (1 === target) {
      params.delete(props.queryParam)
    } else {
      params.set(props.queryParam, String(target))
    }

    const search = params.toString()

    return search ? `?${search}` : '?'
  }

  function go(target) {
    const next = Math.min(total.value, Math.max(1, target))

    if (next === page.value) {
      return
    }

    page.value = next
    emit('change', next)
  }

  // Ctrl, cmd, shift and middle click keep their native meaning (new tab or window).
  function onLinkClick(event, target) {
    if (
      event.defaultPrevented ||
      0 !== event.button ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return
    }

    event.preventDefault()
    go(target)
  }

  const paginationProps = computed(() => ({
    id: props.id,
    class: `pagination ${props.class ?? ''}`.trim(),
    'aria-label': props.label,
  }))

  const previous = computed(() => ({ target: page.value - 1, disabled: 1 >= page.value }))
  const next = computed(() => ({ target: page.value + 1, disabled: total.value <= page.value }))
</script>

<template>
  <nav v-bind="paginationProps">
    <ul>
      <li>
        <a
          v-if="linked && !previous.disabled"
          class="pagination-item"
          data-direction="previous"
          :href="hrefOf(previous.target)"
          :aria-label="previousLabel"
          rel="prev"
          @click="onLinkClick($event, previous.target)"
        >
          <slot name="previous">&lsaquo;</slot>
        </a>
        <button
          v-else
          type="button"
          class="pagination-item"
          data-direction="previous"
          :disabled="previous.disabled"
          :aria-label="previousLabel"
          @click="go(previous.target)"
        >
          <slot name="previous">&lsaquo;</slot>
        </button>
      </li>
      <li
        v-for="item in items"
        :key="'page' === item.type ? item.page : item.key"
      >
        <span
          v-if="'gap' === item.type"
          class="pagination-gap"
          aria-hidden="true"
        >
          &hellip;
        </span>
        <a
          v-else-if="linked"
          class="pagination-item"
          :href="hrefOf(item.page)"
          :aria-label="`${pageLabel} ${item.page}`"
          :aria-current="item.page === page ? 'page' : undefined"
          @click="onLinkClick($event, item.page)"
        >
          {{ item.page }}
        </a>
        <button
          v-else
          type="button"
          class="pagination-item"
          :aria-label="`${pageLabel} ${item.page}`"
          :aria-current="item.page === page ? 'page' : undefined"
          @click="go(item.page)"
        >
          {{ item.page }}
        </button>
      </li>
      <li>
        <a
          v-if="linked && !next.disabled"
          class="pagination-item"
          data-direction="next"
          :href="hrefOf(next.target)"
          :aria-label="nextLabel"
          rel="next"
          @click="onLinkClick($event, next.target)"
        >
          <slot name="next">&rsaquo;</slot>
        </a>
        <button
          v-else
          type="button"
          class="pagination-item"
          data-direction="next"
          :disabled="next.disabled"
          :aria-label="nextLabel"
          @click="go(next.target)"
        >
          <slot name="next">&rsaquo;</slot>
        </button>
      </li>
    </ul>
  </nav>
</template>
