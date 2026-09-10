import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getBootstrapExternalRedirect } from './src/lib/bootstrapExternalRedirect.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function routeDevRequest(req, res, next) {
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
    {
      name: 'legacy-pages-spa',
      configureServer(server) {
        server.middlewares.use(routeDevRequest)
      },
      configurePreviewServer(server) {
        server.middlewares.use(routeDevRequest)
      },
    },
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'lucide-react'],
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@icue/main-site-nav': path.resolve(__dirname, '../shared/main-site-nav'),
      '@icue/drawer-menu': path.resolve(__dirname, '../shared/drawer-menu'),
      '@icue/i18n': path.resolve(__dirname, '../shared/i18n'),
      '@icue/text': path.resolve(__dirname, '../shared/text'),
      '@icue/home-layout': path.resolve(__dirname, '../shared/home-layout'),
      '@icue/ui': path.resolve(__dirname, '../shared/ui'),
      '@icue/site-footer': path.resolve(__dirname, '../shared/site-footer'),
      '@icue/contact-sidebar': path.resolve(__dirname, '../shared/contact-sidebar'),
      '@icue/zalo': path.resolve(__dirname, '../shared/zalo'),
      'motion/react': path.resolve(__dirname, '../node_modules/motion/react'),
    },
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
