// All six languages use the Vietnamese site's live knowledge through a
// same-origin relay. The relay retains the synced snapshot during outages.
export const knowledgeUrls = Object.fromEntries(
  ['vi', 'en', 'de', 'fr', 'ko', 'ja'].map(locale => [locale, `/chatbot/shared/${locale}`]),
)
