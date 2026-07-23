import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('arcgis-'),
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // El SDK entra por import() dinámico, así que Rollup ya lo separa del
    // bundle inicial. No hace falta manualChunks: @arcgis/core no expone un
    // entry principal, solo subpaths, y declararlo por nombre rompe el build.
    chunkSizeWarningLimit: 4000,
  },
})
