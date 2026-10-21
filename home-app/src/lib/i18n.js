import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { normalizeDeep } from '@icue/text/normalizeUnicode'

import en from '../locales/en.json'

const normalizePostProcessor = {
  type: 'postProcessor',
  name: 'normalizeUnicode',
  process: (value) => normalizeDeep(value),
}

i18n
  .use(normalizePostProcessor)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: normalizeDeep(en) },
    },
    fallbackLng: 'en',
    lng: 'en',
    supportedLngs: ['en'],
    postProcess: ['normalizeUnicode'],
    interpolation: { escapeValue: false },
  })

export default i18n
