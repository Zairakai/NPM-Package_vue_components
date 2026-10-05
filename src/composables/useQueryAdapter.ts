import { inject } from 'vue'
import { DEFAULT_ZK_CONFIG, ZK_CONFIG_KEY } from '../config'
import { type QueryAdapter, historyAdapter } from './useQueryParam'

/**
 * The adapter the application chose for the URL state (its router), or the
 * History API of the browser.
 */
export function useQueryAdapter(): QueryAdapter {
  return inject(ZK_CONFIG_KEY, DEFAULT_ZK_CONFIG).queryAdapter ?? historyAdapter
}
