import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // Needed for Docker port mapping
    hmr: {
      host: 'localhost', // Fix WebSocket reconnection on Windows + Docker
      port: 5173,
    },
    watch: {
      usePolling: true,      // Needed for file watching on Windows with Docker volumes
      interval: 300,         // Check every 300ms
    }
  }
})
