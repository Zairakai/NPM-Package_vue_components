import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'

const here = dirname(fileURLToPath(import.meta.url))
const src = resolve(here, '../../src')
const generated = join(here, 'sidebar.generated.json')
const components = existsSync(generated) ? JSON.parse(readFileSync(generated, 'utf8')) : []
const ci = process.env

// What built this site: shown at the bottom of every page.
const build = {
  version: ci.DOCS_VERSION ?? 'next',
  ref: ci.CI_COMMIT_REF_NAME ?? 'local',
  commit: ci.CI_COMMIT_SHORT_SHA ?? '',
  commitUrl: ci.CI_PROJECT_URL && ci.CI_COMMIT_SHA ? `${ci.CI_PROJECT_URL}/-/commit/${ci.CI_COMMIT_SHA}` : '',
  pipeline: ci.CI_PIPELINE_ID ?? '',
  pipelineUrl: ci.CI_PIPELINE_URL ?? '',
  date: ci.CI_COMMIT_TIMESTAMP ?? new Date().toISOString(),
}

const project = 'https://gitlab.com/zairakai/npm-packages/vue-components'

// GitLab.com serves the site from the root of a unique domain. The versions live in folders of it:
// DOCS_BASE is the folder of this build (/1.4.0/) and DOCS_ROOT the root of the site (/).
export default defineConfig({
  title: '@zairakai/vue-components',
  description: 'Unstyled, accessible Vue 3 components that use the web platform first.',
  base: process.env.DOCS_BASE ?? '/',
  cleanUrls: true,
  lastUpdated: true,
  vite: {
    plugins: [
      {
        // The sources import './file.js' for a file.ts (the TypeScript way): the Vite of VitePress only
        // follows that from a .ts file, so the .vue files of the library need a hand.
        name: 'zairakai-js-to-ts',
        enforce: 'pre',
        async resolveId(id, importer, options) {
          if (!importer?.startsWith(src) || !id.endsWith('.js')) {
            return null
          }

          const resolved = await this.resolve(id.replace(/\.js$/, '.ts'), importer, { ...options, skipSelf: true })

          return resolved ?? null
        },
      },
    ],
    resolve: {
      alias: {
        '@zairakai/vue-components': resolve(src, 'index.ts'),
        '@': src,
        '@form': resolve(src, 'Form'),
        '@layout': resolve(src, 'Layout'),
        '@content': resolve(src, 'Content'),
        '@medias': resolve(src, 'Medias'),
        '@data': resolve(src, 'Data'),
        '@display': resolve(src, 'Display'),
        '@feedback': resolve(src, 'Feedback'),
        '@navigation': resolve(src, 'Navigation'),
        '@overlay': resolve(src, 'Overlay'),
        '@utility': resolve(src, 'Utility'),
      },
    },
  },
  themeConfig: {
    root: process.env.DOCS_ROOT ?? '/',
    build,
    badges: [
      {
        label: 'Pipeline',
        image: `${project}/badges/main/pipeline.svg?ignore_skipped=true&key_text=Main`,
        href: `${project}/-/commits/main`,
      },
      { label: 'Coverage', image: `${project}/badges/main/coverage.svg`, href: `${project}/-/pipelines?ref=main` },
      {
        label: 'npm',
        image: 'https://img.shields.io/npm/v/@zairakai/vue-components',
        href: 'https://www.npmjs.com/package/@zairakai/vue-components',
      },
      {
        label: 'Release',
        image: 'https://img.shields.io/gitlab/v/release/zairakai/npm-packages/vue-components?logo=gitlab',
        href: `${project}/-/releases`,
      },
      {
        label: 'License',
        image: 'https://img.shields.io/badge/license-MIT-blue.svg',
        href: `${project}/-/blob/main/LICENSE`,
      },
      {
        label: 'Node.js',
        image: 'https://img.shields.io/badge/node.js-%3E%3D24-green.svg?logo=node.js',
        href: 'https://nodejs.org',
      },
    ],
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Components', link: '/components/' },
      { text: 'Theming', link: '/theming' },
      { text: 'GitLab', link: project },
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
