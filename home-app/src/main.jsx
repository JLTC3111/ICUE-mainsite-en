import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import AppRecovery from '../../shared/resilience/AppRecovery.jsx'
import { installChunkRecovery } from '../../shared/resilience/chunkRecovery.js'

import i18n from './lib/i18n'
import SiteChatbot from '../../shared/chatbot/SiteChatbot.jsx'
import { redirectExternalAppAtBootstrap } from './lib/bootstrapExternalRedirect'
import '../../styles.css'
import './styles/footer-theme.css'

installChunkRecovery()

window.__ICUE_API_BASE_URL__ = import.meta.env.VITE_API_BASE_URL || ''

// Netlify owns these redirects, but keep a client-side guard in the entry
// bundle as well. If a publish configuration ever omits `_redirects`, stale
// About Us or English legal shells must not be allowed to mount again.
if (!redirectExternalAppAtBootstrap()) {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <AppRecovery><App /><SiteChatbot i18n={i18n} /></AppRecovery>
    </StrictMode>,
  )
}
