/**
 * @zairakai/npm-vue-components
 * Collection of reusable Vue 3 components
 */

import type { App, Plugin } from 'vue'
import type { QueryAdapter } from './composables/useQueryParam.js'
import type { PlatformSupport } from './composables/useSupport.js'
import { setSupport } from './composables/useSupport.js'
import { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from './config.js'

// Export all components by category
export * from './Content/index.js'
export * from './Data/index.js'
export * from './Display/index.js'
export * from './Feedback/index.js'
export * from './Form/index.js'
export * from './Layout/index.js'
export * from './Medias/index.js'
export * from './Navigation/index.js'
export * from './Overlay/index.js'

// Re-export config so consuming apps can use the injection key if needed.
export { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from './config.js'
export type { ZkComponentsConfig } from './config.js'

// Shared composables
export { useClipboard } from './composables/useClipboard.js'
export { useControllable } from './composables/useControllable.js'
export type { ControllableQuery } from './composables/useControllable.js'
export { computePosition, useFloating } from './composables/useFloating.js'
export type { FloatingPlacement } from './composables/useFloating.js'
export { useToast } from './composables/useToast.js'
export type { Toast, ToastOptions, ToastVariant } from './composables/useToast.js'
export { useUid } from './composables/useUid.js'

// Plugin installation options
export interface VueComponentsOptions {
  prefix?: string
  /** Minimum password length used by FormInputPassword. Default: 8. */
  minPasswordLength?: number
  /** Where the components keep the state they put in the URL (the router of the app). */
  queryAdapter?: QueryAdapter
  /** Force platform features on or off, for example `{ popover: false }` to use the script fallbacks. */
  support?: Partial<PlatformSupport>
}

// Vue plugin for easy installation
const VueComponentsPlugin: Plugin = {
  install(app: App, options: VueComponentsOptions = {}) {
    if (options.support) {
      setSupport(options.support)
    }

    // Provide global config to all components via inject.
    app.provide(ZK_CONFIG_KEY, {
      ...DEFAULT_ZK_CONFIG,
      minPasswordLength: options.minPasswordLength ?? DEFAULT_ZK_CONFIG.minPasswordLength,
      ...(options.queryAdapter ? { queryAdapter: options.queryAdapter } : {}),
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
