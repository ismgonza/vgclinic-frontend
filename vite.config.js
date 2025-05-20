// Update vite.config.js to better handle the proxy and other settings
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
    },
    port: 5173,
    host: true,
    open: true
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
})