import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    allowedHosts: [
      'localhost',
      '.serveousercontent.com',
      '.serveo.net',
      '.ngrok.io',
      '.trycloudflare.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})