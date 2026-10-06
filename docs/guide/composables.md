# Composables

The helpers the components are built on. They are exported by the package so your own components can use them.

| Composable | What it does |
| :--- | :--- |
| `useControllable(props, key, emit, initial, query?)` | A value that is controlled when the parent passes the prop and kept inside otherwise. It emits `update:<key>`. With `query` the state lives in the URL. |
| `useQueryParam(key, options)` | A ref synced with a query parameter. Typed with `queryNumber`, `queryBoolean` and `queryList`. The default value stays out of the URL. |
| `useRemoteData(fetcher, params, options)` | Loads data that depends on parameters: debounce, cancel of the running request, late answers ignored. Returns `data`, `error`, `loading`, `reload` and `cancel`. |
| `toQuery(params)` | A `URLSearchParams` from an object: empty values left out, arrays repeated, objects as `filter[status]`. |
| `httpFetcher(client, url)` and `fetchFetcher(url)` | Fetchers for `useRemoteData` that use an HTTP client (axios, `@zairakai/js-http-client`) or `fetch`. |
| `useFloating(anchor, panel, open, options)` and `computePosition` | Places a panel next to an anchor with flip and shift. |
| `useToast()` | Shows and removes toasts for `FeedbackToastContainer`. |
| `useClipboard()` | Copies text with the Clipboard API, or with a fallback. `copied` is true for a moment. |
| `useUid(prefix)` | A unique id for labels and ARIA references. |

## Example

```vue
<script setup>
import { ref } from 'vue'
import { httpFetcher, useRemoteData } from '@zairakai/vue-components'
import { createLaravelClient } from '@zairakai/js-http-client'

const client = createLaravelClient({ baseURL: '/api' })
const params = ref({ page: 1, q: '' })

const { data, loading, error } = useRemoteData(httpFetcher(client, '/users'), params, { debounce: 300 })
</script>
```
