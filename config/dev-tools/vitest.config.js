import vue from '@vitejs/plugin-vue'
import baseConfig from '@zairakai/js-dev-tools/config/vitest.config.js'
import path from 'node:path'
import { defineConfig, mergeConfig } from 'vitest/config'

// The coverage, its thresholds and its reports are the ones of the base. Only what is specific to the project is here.
const root = (folder) => path.resolve(import.meta.dirname, '../..', folder)

export default mergeConfig(
  baseConfig,
  defineConfig({
    plugins: [vue()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
    },
    resolve: {
      alias: {
        '@form': root('src/Form'),
        '@layout': root('src/Layout'),
        '@content': root('src/Content'),
        '@medias': root('src/Medias'),
        '@data': root('src/Data'),
        '@display': root('src/Display'),
        '@feedback': root('src/Feedback'),
        '@navigation': root('src/Navigation'),
        '@overlay': root('src/Overlay'),
        '@utility': root('src/Utility'),
        '@': root('src'),
        '@js': root('tests/mocks'),
      },
    },
  }),
)
