# State in the URL and data from a server

What a visitor may want to share, bookmark or reload belongs in the URL. The components that have such a state take a `queryParam` prop.

| Component | Prop | Example |
| :--- | :--- | :--- |
| `NavigationTabs` | `queryParam` | `?tab=billing` |
| `NavigationPagination` | `queryParam` | `?page=3` (real links) |
| `NavigationStepper` | `queryParam` | `?step=2` |
| `DisplayAccordion` | `queryParam` | `?faq=shipping`, or `?faq=a,b` when `multiple` |
| `OverlayModal`, `OverlayDrawer` | `queryParam` | `?dialog=1` |
| `DataTable` | `queryPrefix` | `?t_page=2&t_sort=name&t_dir=desc&t_q=ada&t_f_status=open` |

The parameter that has its default value is left out of the URL. The other parameters are kept. The back button works.

## History API or your router

By default the components use the History API. To use your router, give the plugin an adapter:

```ts
app.use(VueComponents, {
  queryAdapter: {
    read: () => new URLSearchParams(router.currentRoute.value.query),
    write: (params, mode) => router[mode]({ query: Object.fromEntries(params) }),
    subscribe: (listener) => router.afterEach(listener),
  },
})
```

## Links that work without JavaScript

`NavigationPagination` renders `<a href="?page=3">`. It works without JavaScript and can be crawled. The click is handled without a reload, and ctrl, cmd and middle click keep their native behaviour. Use `hrefFor` or the slot for router links.

## Filters that work as a plain GET

The filters of `DataTable` are a `<search>` element with a `<form method="get">`. Column filters can be a text, a list or a range of numbers or dates.

## Server mode

With `serverSide`, `DataTable` only shows the rows it gets and emits `query` with the page, the sort, the search and the active filters. Load the data with `useRemoteData`:

```vue
<script setup>
import { ref } from 'vue'
import { fetchFetcher, useRemoteData } from '@zairakai/vue-components'

const params = ref({})
const { data, loading } = useRemoteData(fetchFetcher('/api/users'), params, { debounce: 250 })
</script>

<template>
  <DataTable
    server-side
    :columns="columns"
    :rows="data?.items ?? []"
    :total="data?.total"
    :loading="loading"
    query-prefix="u_"
    @query="params = $event"
  />
</template>
```
