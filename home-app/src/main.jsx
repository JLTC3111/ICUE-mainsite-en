import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

import './lib/i18n'
import '../../styles.css'
import './styles/footer-theme.css'

window.__ICUE_API_BASE_URL__ = import.meta.env.VITE_API_BASE_URL || ''

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
