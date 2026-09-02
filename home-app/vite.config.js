import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Contact is served by the shared Contact app on icue.vn (contact-app in the vn
// repo). /contact is redirected here as well as at the legacy URL so the
// home-app dev server matches production.
const CONTACT_APP_URL = 'https://icue.vn/contact?site=en'
const OUR_WORK_APP_URL = 'https://icue.vn/our-work?site=en'
const ABOUT_US_APP_URL = 'https://icue.vn/about-us?site=en'
const FAQ_APP_URL = 'https://icue.vn/faqs?site=en'
const RECRUITMENT_APP_URL = 'https://icue.vn/recruitment?site=en'
const COMMUNITY_ACTIVITIES_APP_URL = 'https://icue.vn/community-activities?site=en'
const LEGAL_APP_URLS = {
  privacy: 'https://icue.vn/legal/privacy?lang=en',
  terms: 'https://icue.vn/legal/terms?lang=en',
  gdpr: 'https://icue.vn/legal/gdpr?lang=en',
  cookies: 'https://icue.vn/legal/cookies?lang=en',
}

const LEGACY_PAGE_REDIRECTS = {
  '/legacy/pages/Home.html': '/',
  '/legacy/pages/Home_OLD.html': '/',
  '/legacy/pages/Contact.html': CONTACT_APP_URL,
  '/contact': CONTACT_APP_URL,
  '/contact/': CONTACT_APP_URL,
  '/about-us': ABOUT_US_APP_URL,
  '/about-us/': ABOUT_US_APP_URL,
  '/about-us.html': ABOUT_US_APP_URL,
  '/our-work': OUR_WORK_APP_URL,
  '/our-work/': OUR_WORK_APP_URL,
  '/faqs': FAQ_APP_URL,
  '/faqs/': FAQ_APP_URL,
  '/recruitment': RECRUITMENT_APP_URL,
  '/recruitment/': RECRUITMENT_APP_URL,
  '/community-activities': COMMUNITY_ACTIVITIES_APP_URL,
  '/community-activities/': COMMUNITY_ACTIVITIES_APP_URL,
  '/legal': LEGAL_APP_URLS.privacy,
  '/legal/': LEGAL_APP_URLS.privacy,
  '/privacy': LEGAL_APP_URLS.privacy,
  '/terms': LEGAL_APP_URLS.terms,
  '/gdpr': LEGAL_APP_URLS.gdpr,
  '/cookies': LEGAL_APP_URLS.cookies,
  '/legal/privacy': LEGAL_APP_URLS.privacy,
  '/legal/privacy/': LEGAL_APP_URLS.privacy,
  '/legal/terms': LEGAL_APP_URLS.terms,
  '/legal/terms/': LEGAL_APP_URLS.terms,
  '/legal/gdpr': LEGAL_APP_URLS.gdpr,
  '/legal/gdpr/': LEGAL_APP_URLS.gdpr,
  '/legal/cookies': LEGAL_APP_URLS.cookies,
  '/legal/cookies/': LEGAL_APP_URLS.cookies,
  '/legacy/pages/aboutUs.html': ABOUT_US_APP_URL,
  '/legacy/pages/aboutus.html': ABOUT_US_APP_URL,
  '/legacy/pages/aboutus': ABOUT_US_APP_URL,
  '/legacy/pages/ourWork.html': OUR_WORK_APP_URL,
  '/legacy/pages/pastProjects.html': '/past-projects',
  '/legacy/pages/recruitment.html': RECRUITMENT_APP_URL,
  '/legacy/pages/News.html': '/news-archive',
  '/legacy/pages/orgStructure.html': 'https://icue.vn/structure/',
  '/legacy/pages/notableAwards.html': '/notable-awards',
  '/legacy/pages/communityActivities.html': COMMUNITY_ACTIVITIES_APP_URL,
  '/legacy/pages/FAQs.html': FAQ_APP_URL,
  '/legacy/pages/privacy.html': LEGAL_APP_URLS.privacy,
  '/legacy/pages/terms.html': LEGAL_APP_URLS.terms,
  '/legacy/pages/gdpr.html': LEGAL_APP_URLS.gdpr,
  '/legacy/pages/cookies.html': LEGAL_APP_URLS.cookies,
  '/legacy-embed/pages/privacy.html': LEGAL_APP_URLS.privacy,
  '/legacy-embed/pages/terms.html': LEGAL_APP_URLS.terms,
  '/legacy-embed/pages/gdpr.html': LEGAL_APP_URLS.gdpr,
  '/legacy-embed/pages/cookies.html': LEGAL_APP_URLS.cookies,
}

function routeDevRequest(req, res, next) {
  const urlPath = (req.url || '').split('?')[0]

  if (LEGACY_PAGE_REDIRECTS[urlPath]) {
    res.statusCode = 302
    res.setHeader('Location', LEGACY_PAGE_REDIRECTS[urlPath])
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
