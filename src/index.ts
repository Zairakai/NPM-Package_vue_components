/**
 * @zairakai/npm-vue-components
 * Collection of reusable Vue 3 components
 */

import type { App, Plugin } from 'vue'
import { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from './config.js'

// Export all components by category
export * from './Content/index.js'
export * from './Form/index.js'
export * from './Layout/index.js'
export * from './Medias/index.js'

// Re-export config so consuming apps can use the injection key if needed.
export { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from './config.js'
export type { ZkComponentsConfig } from './config.js'

// Plugin installation options
export interface VueComponentsOptions {
  prefix?: string
  /** Minimum password length used by FormInputPassword. Default: 8. */
  minPasswordLength?: number
}

// Vue plugin for easy installation
const VueComponentsPlugin: Plugin = {
  install(app: App, options: VueComponentsOptions = {}) {
    // Provide global config to all components via inject.
    app.provide(ZK_CONFIG_KEY, {
      ...DEFAULT_ZK_CONFIG,
      minPasswordLength: options.minPasswordLength ?? DEFAULT_ZK_CONFIG.minPasswordLength,
    })

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
