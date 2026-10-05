<script setup>
  import { useControllable } from '@/composables/useControllable'
  import { useQueryAdapter } from '@/composables/useQueryAdapter'
  import { queryNumber, useQueryParam } from '@/composables/useQueryParam'
  import { getSupport } from '@/composables/useSupport'
  import { useUid } from '@/composables/useUid'
  import {
    activeFilters,
    applyFilters,
    ariaSort,
    filterRows,
    formatCell,
    joinRange,
    nextSort,
    paginateRows,
    parseRange,
    sortRows,
  } from '@data/table'
  import NavigationPagination from '@navigation/Pagination.vue'
  import { computed, onMounted, ref, watch } from 'vue'

  defineOptions({
    name: 'DataTable',
  })

  const emit = defineEmits([
    'update:sort',
    'update:search',
    'update:page',
    'update:selected',
    'update:filters',
    'query',
  ])

  const props = defineProps({
    id: String,
    class: String,
    // The columns: { key, label, sortable, type: "text" | "number" | "date", align, format }.
    columns: {
      type: Array,
      default: () => [],
    },
    rows: {
      type: Array,
      default: () => [],
    },
    // The property that identifies a row.
    rowKey: {
      type: String,
      default: 'id',
    },
    caption: String,
    // { key, direction: "asc" | "desc" }, with v-model:sort.
    sort: {
      type: Object,
      default: undefined,
    },
    // The text filtered on, with v-model:search. A search box is shown when searchable.
    search: {
      type: String,
      default: undefined,
    },
    searchable: {
      type: Boolean,
      default: false,
    },
    // The value of every column filter, by column key, with v-model:filters. A range is "min..max".
    filters: {
      type: Object,
      default: undefined,
    },
    clearFiltersLabel: {
      type: String,
      default: 'Clear filters',
    },
    // The label of a filter. Use {column}.
    filterLabel: {
      type: String,
      default: 'Filter {column}',
    },
    minLabel: {
      type: String,
      default: 'from',
    },
    maxLabel: {
      type: String,
      default: 'to',
    },
    allLabel: {
      type: String,
      default: 'All',
    },
    searchLabel: {
      type: String,
      default: 'Search',
    },
    // The current page, starting at 1, with v-model:page.
    page: {
      type: Number,
      default: undefined,
    },
    pageSize: {
      type: Number,
      default: 10,
    },
    // The keys of the selected rows, with v-model:selected. A selection column is shown when selectable.
    selected: {
      type: Array,
      default: undefined,
    },
    selectable: {
      type: Boolean,
      default: false,
    },
    // The server sorts, filters and paginates: the table only shows the rows it gets
    // and asks for the next ones with the query event. Give the total of rows.
    serverSide: {
      type: Boolean,
      default: false,
    },
    total: Number,
    loading: {
      type: Boolean,
      default: false,
    },
    emptyText: {
      type: String,
      default: 'Nothing to show',
    },
    // Keep the page, the sort and the search in the URL: ?page=2&sort=name&dir=desc&q=ada.
    // The value is the prefix of the parameters, an empty string for none.
    queryPrefix: {
      type: String,
      default: undefined,
    },
    locale: String,
    selectAllLabel: {
      type: String,
      default: 'Select all rows',
    },
    selectRowLabel: {
      type: String,
      default: 'Select row',
    },
  })

  const uid = useUid('table')
  const adapter = useQueryAdapter()
  const url = (name) => (undefined === props.queryPrefix ? undefined : `${props.queryPrefix}${name}`)

  const currentPage = useControllable(props, 'page', emit, 1, {
    param: url('page'),
    parse: queryNumber(1),
    adapter,
  })

  const currentSearch = useControllable(props, 'search', emit, '', { param: url('q'), adapter })

  // The column filters: the ones given (v-model:filters), the URL (one parameter per column, f_name) or its own.
  // The columns that have a filter are read once, when the table is created.
  const filterable = props.columns.filter((column) => column.filter)
  const urlFilters =
    undefined === props.queryPrefix
      ? null
      : Object.fromEntries(
          filterable.map((column) => [column.key, useQueryParam(url(`f_${column.key}`), { default: '', adapter })])
        )
  const ownFilters = ref({})

  const currentFilters = computed(() => {
    if (undefined !== props.filters) {
      return props.filters
    }

    return urlFilters
      ? Object.fromEntries(Object.entries(urlFilters).map(([key, state]) => [key, state.value]))
      : ownFilters.value
  })

  function setFilter(key, value) {
    const next = { ...currentFilters.value, [key]: value }

    if (urlFilters) {
      urlFilters[key].value = value
    } else {
      ownFilters.value = next
    }

    emit('update:filters', next)
    currentPage.value = 1
  }

  function clearFilters() {
    const next = Object.fromEntries(filterable.map((column) => [column.key, '']))

    filterable.forEach((column) => urlFilters && (urlFilters[column.key].value = ''))
    ownFilters.value = next
    emit('update:filters', next)
    currentPage.value = 1
  }

  const hasFilters = computed(() => 0 < Object.keys(activeFilters(currentFilters.value)).length)
  const optionOf = (option) => ('string' === typeof option ? { value: option, label: option } : option)

  // The sort: the one given (v-model:sort), the URL (two parameters: the column and the direction) or its own.
  const urlKey = undefined === props.queryPrefix ? null : useQueryParam(url('sort'), { default: '', adapter })
  const urlDirection = undefined === props.queryPrefix ? null : useQueryParam(url('dir'), { default: 'asc', adapter })
  const ownSort = ref(null)

  const currentSort = computed(() => {
    if (undefined !== props.sort) {
      return props.sort
    }

    if (urlKey) {
      return urlKey.value ? { key: urlKey.value, direction: urlDirection.value } : null
    }

    return ownSort.value
  })

  function setSort(value) {
    if (urlKey) {
      urlKey.value = value?.key ?? ''
      urlDirection.value = value?.direction ?? 'asc'
    } else {
      ownSort.value = value
    }

    emit('update:sort', value)
    currentPage.value = 1
  }

  const selectedKeys = useControllable(props, 'selected', emit, [])

  // The rows shown: client side, the filtered, sorted and paginated rows; server side, the rows as given.
  const filtered = computed(() =>
    props.serverSide
      ? props.rows
      : applyFilters(filterRows(props.rows, props.columns, currentSearch.value), props.columns, currentFilters.value)
  )
  const sorted = computed(() =>
    props.serverSide ? filtered.value : sortRows(filtered.value, props.columns, currentSort.value, props.locale)
  )
  const totalRows = computed(() => (props.serverSide ? (props.total ?? props.rows.length) : sorted.value.length))
  const pages = computed(() => Math.max(1, Math.ceil(totalRows.value / props.pageSize)))
  const visible = computed(() =>
    props.serverSide ? sorted.value : paginateRows(sorted.value, currentPage.value, props.pageSize)
  )

  // A search or a change of size can leave the page beyond the last one.
  watch(pages, (count) => {
    if (currentPage.value > count) {
      currentPage.value = count
    }
  })

  // Server side: tell what to ask for, whenever the state changes.
  function ask() {
    emit('query', {
      page: currentPage.value,
      pageSize: props.pageSize,
      sort: currentSort.value?.key,
      direction: currentSort.value?.direction,
      search: currentSearch.value,
      filters: activeFilters(currentFilters.value),
    })
  }

  watch(
    [currentPage, currentSort, currentSearch, currentFilters, () => props.pageSize],
    () => props.serverSide && ask(),
    {
      deep: true,
    }
  )
  onMounted(() => props.serverSide && ask())

  function keyOf(row) {
    return row[props.rowKey]
  }

  const allSelected = computed(
    () => 0 < visible.value.length && visible.value.every((row) => selectedKeys.value.includes(keyOf(row)))
  )
  const someSelected = computed(
    () => !allSelected.value && visible.value.some((row) => selectedKeys.value.includes(keyOf(row)))
  )

  function toggleAll() {
    const keys = visible.value.map(keyOf)

    selectedKeys.value = allSelected.value
      ? selectedKeys.value.filter((key) => !keys.includes(key))
      : [...new Set([...selectedKeys.value, ...keys])]
  }

  function toggleRow(row) {
    const key = keyOf(row)

    selectedKeys.value = selectedKeys.value.includes(key)
      ? selectedKeys.value.filter((selected) => selected !== key)
      : [...selectedKeys.value, key]
  }

  const columnCount = computed(() => props.columns.length + (props.selectable ? 1 : 0))

  // <search> is a landmark of its own; a div with the role is the same for the browsers without it.
  const searchTag = getSupport().search ? 'search' : 'div'

  const tableProps = computed(() => ({
    id: props.id,
    class: `data-table ${props.class ?? ''}`.trim(),
    'aria-busy': props.loading ? 'true' : undefined,
    'aria-rowcount': totalRows.value,
    'data-loading': props.loading ? '' : undefined,
  }))
</script>

<template>
  <div class="data-table-wrapper">
    <component
      :is="searchTag"
      v-if="searchable || 0 < filterable.length"
      class="data-table-search"
      :role="'search' === searchTag ? undefined : 'search'"
    >
      <form
        method="get"
        @submit.prevent
      >
        <template v-if="searchable">
          <label :for="`${uid}-search`">{{ searchLabel }}</label>
          <input
            :id="`${uid}-search`"
            type="search"
            name="q"
            :value="currentSearch"
            @input="currentSearch = $event.target.value"
          />
        </template>
        <div
          v-for="column in filterable"
          :key="column.key"
          class="data-table-filter"
          :data-filter="column.filter"
        >
          <label :for="`${uid}-filter-${column.key}`">{{ filterLabel.replace('{column}', column.label) }}</label>
          <select
            v-if="'select' === column.filter"
            :id="`${uid}-filter-${column.key}`"
            :name="`f_${column.key}`"
            :value="currentFilters[column.key] ?? ''"
            @change="setFilter(column.key, $event.target.value)"
          >
            <option value="">{{ allLabel }}</option>
            <option
              v-for="option in column.options ?? []"
              :key="optionOf(option).value"
              :value="optionOf(option).value"
            >
              {{ optionOf(option).label }}
            </option>
          </select>
          <span
            v-else-if="'range' === column.filter"
            class="data-table-range"
          >
            <input
              :id="`${uid}-filter-${column.key}`"
              :type="'date' === column.type ? 'date' : 'number'"
              :name="`f_${column.key}_min`"
              :aria-label="`${filterLabel.replace('{column}', column.label)} ${minLabel}`"
              :value="parseRange(currentFilters[column.key] ?? '').min"
              @input="
                setFilter(column.key, joinRange($event.target.value, parseRange(currentFilters[column.key] ?? '').max))
              "
            />
            <input
              :type="'date' === column.type ? 'date' : 'number'"
              :name="`f_${column.key}_max`"
              :aria-label="`${filterLabel.replace('{column}', column.label)} ${maxLabel}`"
              :value="parseRange(currentFilters[column.key] ?? '').max"
              @input="
                setFilter(column.key, joinRange(parseRange(currentFilters[column.key] ?? '').min, $event.target.value))
              "
            />
          </span>
          <input
            v-else
            :id="`${uid}-filter-${column.key}`"
            type="search"
            :name="`f_${column.key}`"
            :value="currentFilters[column.key] ?? ''"
            @input="setFilter(column.key, $event.target.value)"
          />
        </div>
        <button
          v-if="hasFilters"
          type="button"
          class="data-table-clear"
          @click="clearFilters"
        >
          {{ clearFiltersLabel }}
        </button>
      </form>
    </component>
    <table v-bind="tableProps">
      <caption v-if="caption">
        {{
          caption
        }}
      </caption>
      <thead>
        <tr>
          <th
            v-if="selectable"
            scope="col"
            class="data-table-select"
          >
            <input
              type="checkbox"
              :aria-label="selectAllLabel"
              :checked="allSelected"
              :indeterminate="someSelected"
              @change="toggleAll"
            />
          </th>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="column.sortable ? ariaSort(currentSort, column.key) : undefined"
            :data-align="column.align"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="data-table-sort"
              @click="setSort(nextSort(currentSort, column.key))"
            >
              {{ column.label }}
            </button>
            <template v-else>{{ column.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="row in visible"
          :key="keyOf(row)"
          :aria-selected="selectable ? selectedKeys.includes(keyOf(row)) : undefined"
        >
          <td
            v-if="selectable"
            class="data-table-select"
          >
            <input
              type="checkbox"
              :aria-label="`${selectRowLabel} ${keyOf(row)}`"
              :checked="selectedKeys.includes(keyOf(row))"
              @change="toggleRow(row)"
            />
          </td>
          <td
            v-for="column in columns"
            :key="column.key"
            :data-align="column.align"
          >
            <slot
              :name="`cell-${column.key}`"
              :row="row"
              :value="row[column.key]"
            >
              {{ formatCell(column, row, locale) }}
            </slot>
          </td>
        </tr>
        <tr
          v-if="0 === visible.length"
          class="data-table-empty"
        >
          <td :colspan="columnCount">
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
    <NavigationPagination
      v-if="1 < pages"
      class="data-table-pagination"
      :model-value="currentPage"
      :pages="pages"
      @update:model-value="currentPage = $event"
    />
  </div>
</template>
