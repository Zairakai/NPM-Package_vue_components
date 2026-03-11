declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Vite module declarations
interface ImportMetaEnv {
  readonly NODE_ENV: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  glob<T = any>(pattern: string, options?: { eager?: boolean }): Record<string, T>
}
