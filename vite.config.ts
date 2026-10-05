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
        Content: resolve(__dirname, 'src/Content/index.ts'),
        Data: resolve(__dirname, 'src/Data/index.ts'),
        Display: resolve(__dirname, 'src/Display/index.ts'),
        Feedback: resolve(__dirname, 'src/Feedback/index.ts'),
        Form: resolve(__dirname, 'src/Form/index.ts'),
        Layout: resolve(__dirname, 'src/Layout/index.ts'),
        Medias: resolve(__dirname, 'src/Medias/index.ts'),
        Navigation: resolve(__dirname, 'src/Navigation/index.ts'),
        Overlay: resolve(__dirname, 'src/Overlay/index.ts'),
        Utility: resolve(__dirname, 'src/Utility/index.ts'),
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
      '@data': resolve(__dirname, 'src/Data'),
      '@display': resolve(__dirname, 'src/Display'),
      '@feedback': resolve(__dirname, 'src/Feedback'),
      '@navigation': resolve(__dirname, 'src/Navigation'),
      '@overlay': resolve(__dirname, 'src/Overlay'),
      '@utility': resolve(__dirname, 'src/Utility'),
    },
  },
})
