import VueComponents from '@zairakai/vue-components'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import Badges from './Badges.vue'
import BuildInfo from './BuildInfo.vue'
import Layout from './Layout.vue'
import './style.scss'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(Layout, null, {
      'home-hero-after': () => h(Badges),
      'doc-after': () => h(BuildInfo),
    }),
  enhanceApp({ app }) {
    // The components of the library, for the live examples.
    app.use(VueComponents)
  },
} satisfies Theme
