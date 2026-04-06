import vue from '@vitejs/plugin-vue'
import baseConfig from '@zairakai/js-dev-tools/vitest'
import path from 'path'
import { defineConfig } from 'vitest/config'

const baseTest = baseConfig.test ?? {}
const baseCoverage = baseTest.coverage ?? {}

export default defineConfig({
  ...baseConfig,
  plugins: [vue()],
  test: {
    ...baseTest,
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      ...baseCoverage,
      reporter: ['text', 'lcov', 'html', 'cobertura'],
      exclude: [
        ...(baseCoverage.exclude ?? []),
        'tests/**',
        'vitest.config.js',
        'eslint.config.js',
        'prettier.config.js',
        'vite.config.js',
      ],
    },
  },
  resolve: {
    alias: {
      '@form': path.resolve(__dirname, './src/Form'),
      '@layout': path.resolve(__dirname, './src/Layout'),
      '@content': path.resolve(__dirname, './src/Content'),
      '@medias': path.resolve(__dirname, './src/Medias'),
      '@': path.resolve(__dirname, './src'),
      '@js': path.resolve(__dirname, './tests/mocks'),
    },
  },
})
