import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: true, // allow external access (important for ngrok)
    allowedHosts: ['.ngrok-free.dev', '.ngrok.app', '.ngrok.io'], // allow all ngrok URLs
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5002',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5002',
        ws: true,
        changeOrigin: true
      }
    }
  }
})