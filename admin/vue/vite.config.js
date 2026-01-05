import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: '/admin/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    },
    // Ensure single instances of vue and pinia across all packages
    dedupe: ['vue', 'pinia', 'vue-router']
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  // Optimize deps to ensure proper module resolution
  optimizeDeps: {
    include: ['pinia', 'vue', 'vue-router', '@vbwd/view-component']
  }
})
