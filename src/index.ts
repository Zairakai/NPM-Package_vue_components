/**
 * @zairakai/npm-vue-components
 * Collection of reusable Vue 3 components
 */

import type { App, Plugin } from 'vue'

// Export all components by category
export * from './Content/index.js'
export * from './Form/index.js'
export * from './Layout/index.js'
export * from './Medias/index.js'

// Plugin installation options
export interface VueComponentsOptions {
  prefix?: string
}

// Vue plugin for easy installation
const VueComponentsPlugin: Plugin = {
  install(app: App, options: VueComponentsOptions = {}) {
    // Import all components dynamically
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const components = import.meta.glob<{ default: any }>('./**/*.vue', {
      eager: true,
    })

    for (const path in components) {
      const component = components[path]
      const name = (component.default.name ?? path.split('/').pop()?.replace('.vue', '') ?? '') as string

      if (options.prefix) {
        app.component(`${options.prefix}${name}`, component.default)
      } else {
        app.component(name, component.default)
      }
    }
  },
}

export default VueComponentsPlugin
