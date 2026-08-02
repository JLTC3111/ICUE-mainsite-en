import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const LEGACY_SOURCE_REDIRECTS = {
  '/src/pages/Home.html': '/',
  '/src/pages/Home_OLD.html': '/',
  '/src/pages/Contact.html': '/contact',
  '/src/pages/aboutUs.html': '/about-us',
  '/src/pages/ourWork.html': '/our-work',
  '/src/pages/pastProjects.html': '/past-projects',
  '/src/pages/recruitment.html': '/recruitment',
  '/src/pages/News.html': '/news-archive',
  '/src/pages/News': '/news-archive',
  '/src/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/src/pages/notableAwards.html': '/notable-awards',
  '/src/pages/communityActivities.html': '/community-activities',
  '/src/pages/FAQs.html': '/faqs',
  '/src/pages/privacy.html': '/privacy',
  '/src/pages/terms.html': '/terms',
  '/src/pages/gdpr.html': '/gdpr',
  '/src/pages/cookies.html': '/cookies',
}

const LEGACY_PAGE_REDIRECTS = {
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': '/contact',
  '/legacy/pages/aboutUs.html': '/about-us',
  '/legacy/pages/ourWork.html': '/our-work',
  '/legacy/pages/pastProjects.html': '/past-projects',
  '/legacy/pages/recruitment.html': '/recruitment',
  '/legacy/pages/News.html': '/news-archive',
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': '/notable-awards',
  '/legacy/pages/communityActivities.html': '/community-activities',
  '/legacy/pages/FAQs.html': '/faqs',
  '/legacy/pages/privacy.html': '/privacy',
  '/legacy/pages/terms.html': '/terms',
  '/legacy/pages/gdpr.html': '/gdpr',
  '/legacy/pages/cookies.html': '/cookies',
}

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    {
      name: 'legacy-pages-spa',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const urlPath = (req.url || '').split('?')[0]

          const sourceRedirect = LEGACY_SOURCE_REDIRECTS[urlPath]
          if (sourceRedirect) {
            res.statusCode = 302
            res.setHeader('Location', sourceRedirect)
            res.end()
            return
          }

          if (LEGACY_PAGE_REDIRECTS[urlPath]) {
            res.statusCode = 302
            res.setHeader('Location', LEGACY_PAGE_REDIRECTS[urlPath])
            res.end()
            return
          }

          next()
        })
      },
    },
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'lucide-react'],
    alias: {
      '@': path.resolve(__dirname, '..'),
      '@icue/main-site-nav': path.resolve(__dirname, '../shared/main-site-nav'),
      '@icue/drawer-menu': path.resolve(__dirname, '../shared/drawer-menu'),
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
          if (id.includes('/gsap/')) return 'gsap-vendor'
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
