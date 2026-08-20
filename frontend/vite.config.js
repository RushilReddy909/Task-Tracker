import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Forwards any /api/* request from the dev server to the Express
      // backend, so the browser only ever talks to one origin in dev —
      // sidesteps CORS entirely. No path rewrite: the backend's routes
      // are already mounted under /api (see server/src/app.js), so the
      // prefix must be preserved, not stripped.
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
