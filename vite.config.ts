import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        Form: resolve(__dirname, 'src/Form/index.ts'),
        Layout: resolve(__dirname, 'src/Layout/index.ts'),
        Content: resolve(__dirname, 'src/Content/index.ts'),
        Medias: resolve(__dirname, 'src/Medias/index.ts'),
      },
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => {
        return format === 'es' ? `${entryName}.js` : `${entryName}.cjs`
      },
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@form': resolve(__dirname, 'src/Form'),
      '@layout': resolve(__dirname, 'src/Layout'),
      '@content': resolve(__dirname, 'src/Content'),
      '@medias': resolve(__dirname, 'src/Medias'),
    },
  },
})
