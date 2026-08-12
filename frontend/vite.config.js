import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  // Keep a stable origin for Google OAuth (Authorized JavaScript origins).
  // If 5173 is busy, Vite will fail instead of silently switching ports.
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate Chart.js into its own chunk
          'chartjs': ['chart.js'],
          // Separate PDF export into its own chunk
          'pdf-export': ['jspdf', 'jspdf-autotable'],
          // Separate Vue ecosystem
          'vue-vendor': ['vue', 'vue-router', 'pinia']
        }
      }
    },
    // Increase chunk size warning limit to 1000kb
    chunkSizeWarningLimit: 1000
  }
})
