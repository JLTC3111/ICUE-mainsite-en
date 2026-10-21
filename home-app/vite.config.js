import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { recoveryChunks } from './recoveryChunks.js'
import { bootRecovery } from '../shared/vite/bootRecovery.js'
import { getBootstrapExternalRedirect } from './src/lib/bootstrapExternalRedirect.js'
import { safeRequestPath } from '../scripts/lib/static-files.mjs'
import { createChatMiddleware } from '../scripts/lib/chat-routes.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function routeDevRequest(req, res, next) {
  if (!safeRequestPath(req.url)) { res.statusCode = 403; res.end(); return }
  const [urlPath, query = ''] = (req.url || '').split('?')
  const redirectTarget = getBootstrapExternalRedirect(
    urlPath,
    query ? `?${query}` : '',
  )

  if (redirectTarget) {
    res.statusCode = 302
    res.setHeader('Location', redirectTarget)
    res.end()
    return
  }

  // Netlify's /public/* compatibility rewrite maps these historical URLs to
  // assets emitted at the site root. Mirror it in dev and preview so local QA
  // exercises the same URLs without a second physical copy of every asset.
  if (urlPath.startsWith('/public/')) {
    req.url = (req.url || '').replace(/^\/public\//, '/')
  }

  next()
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    bootRecovery(),
    recoveryChunks(),
    {
      name: 'legacy-pages-spa',
      configureServer(server) {
        server.middlewares.use(createChatMiddleware())
        server.middlewares.use(routeDevRequest)
      },
      configurePreviewServer(server) {
        server.middlewares.use(createChatMiddleware())
        server.middlewares.use(routeDevRequest)
      },
    },
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'lucide-react'],
    alias: [
      {
        find: /^lucide-react$/,
        replacement: path.resolve(__dirname, '../shared/ui/lucide-icons.js'),
      },
      { find: '@', replacement: path.resolve(__dirname, '..') },
      { find: '@icue/main-site-nav', replacement: path.resolve(__dirname, '../shared/main-site-nav') },
      { find: '@icue/drawer-menu', replacement: path.resolve(__dirname, '../shared/drawer-menu') },
      { find: '@icue/i18n', replacement: path.resolve(__dirname, '../shared/i18n') },
      { find: '@icue/text', replacement: path.resolve(__dirname, '../shared/text') },
      { find: '@icue/home-layout', replacement: path.resolve(__dirname, '../shared/home-layout') },
      { find: '@icue/ui', replacement: path.resolve(__dirname, '../shared/ui') },
      { find: '@icue/site-footer', replacement: path.resolve(__dirname, '../shared/site-footer') },
      { find: '@icue/contact-sidebar', replacement: path.resolve(__dirname, '../shared/contact-sidebar') },
      { find: '@icue/zalo', replacement: path.resolve(__dirname, '../shared/zalo') },
      { find: 'motion/react', replacement: path.resolve(__dirname, '../node_modules/motion/react') },
    ],
  },
  build: {
    outDir: '../dist-home',
    emptyOutDir: true,
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (
            id.includes('/react/')
            || id.includes('/react-dom/')
            || id.includes('/react-router')
            || id.includes('/scheduler/')
          ) {
            return 'react-vendor'
          }
          if (id.includes('/motion/')) return 'motion-vendor'
          return undefined
        }
      },
    },
  },
  server: {
    port: 5175,
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
})
