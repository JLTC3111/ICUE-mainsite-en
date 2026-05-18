import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: 'public',
  plugins: [],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/donations': 'http://localhost:3000',
    },
  },
})