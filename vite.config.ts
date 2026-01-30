import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all addresses
    allowedHosts: true, // Allow all hosts (tunnel)
    cors: true, // Enable CORS
    headers: {
      'Access-Control-Allow-Origin': '*' // explicit header for robustness
    }
  }
})
