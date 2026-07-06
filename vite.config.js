import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  publicDir: 'public',
  base: '',
  plugins: [react()],
  resolve: {
    alias: {
      '@icue/main-site-nav': path.resolve(__dirname, 'shared/main-site-nav'),
      '@icue/home-layout': path.resolve(__dirname, 'shared/home-layout'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/donations': 'http://localhost:3000',
    },
  },
});
