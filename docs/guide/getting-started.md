# Getting started

## Install

```bash
npm install @zairakai/vue-components
```

Vue 3 is the only peer dependency.

## Use the components

Import what you need, from the package or from a category. A category import keeps the bundle small.

```ts
import { DisplayCard, OverlayModal } from '@zairakai/vue-components'
import { DataTable } from '@zairakai/vue-components/Data'
```

Or register everything once with the plugin:

```ts
import VueComponents from '@zairakai/vue-components'

app.use(VueComponents, {
  // A prefix for the component names: <ZkOverlayModal>.
  prefix: 'Zk',
  // Where the components keep the state they put in the URL (see below).
  queryAdapter: undefined,
  // Force a platform feature on or off, for example to test the fallbacks.
  support: { popover: false },
})
```

## No style

The components ship no CSS. They give the markup, the accessibility and the behaviour, and a stable class and `data-*` state on every part. See [Theming](/theming).

## v-model works with or without

Every component that has a value works as a controlled component when you give it `v-model`, and keeps its own state when you do not.

```vue
<NavigationTabs v-model="tab">…</NavigationTabs>
<NavigationTabs>…</NavigationTabs>
```

## The web platform first

The components use the native element when the browser has it and a script when it does not: [Browser support](/browser-support) lists the features and what each component falls back to.
