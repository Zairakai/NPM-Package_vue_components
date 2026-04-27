import type { InjectionKey } from 'vue'

/**
 * Global configuration provided by the VueComponentsPlugin install.
 */
export interface ZkComponentsConfig {
  minPasswordLength: number
}

/**
 * Injection key for the global component config.
 * Components call inject(ZK_CONFIG_KEY, DEFAULT_ZK_CONFIG) to access it.
 */
export const ZK_CONFIG_KEY: InjectionKey<ZkComponentsConfig> = Symbol('zk-components-config')

/**
 * Default config used when no provider is present (e.g. tree-shaken usage).
 */
export const DEFAULT_ZK_CONFIG: ZkComponentsConfig = {
  minPasswordLength: 8,
}
