import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const here = dirname(fileURLToPath(import.meta.url))
const generated = join(here, 'sidebar.generated.json')
const components = existsSync(generated) ? JSON.parse(readFileSync(generated, 'utf8')) : []

// GitLab.com serves the site from the root of a unique domain. Set DOCS_BASE for a path (/group/project/).
export default defineConfig({
  title: '@zairakai/vue-components',
  description: 'Unstyled, accessible Vue 3 components that use the web platform first.',
  base: process.env.DOCS_BASE ?? '/',
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'Theming', link: '/theming' },
      { text: 'GitLab', link: 'https://gitlab.com/zairakai/npm-packages/vue-components' },
    ],
    sidebar: {
      '/components/': components,
      '/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Composables', link: '/guide/composables' },
            { text: 'State in the URL and data from a server', link: '/guide/url-and-http' },
            { text: 'Theming', link: '/theming' },
            { text: 'Browser support', link: '/browser-support' },
          ],
        },
        { text: 'Components', link: '/components/' },
      ],
    },
    search: { provider: 'local' },
    outline: [2, 3],
  },
})
