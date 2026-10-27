import { createRetryableLoader, fetchWithDeadline } from '../resilience/requests.js'

// Kept lazy: reading assistant answers never loads the auth SDK.
export const loadSupabaseClient = createRetryableLoader(async () => {
  const [{ createClient }, response] = await Promise.all([
    import('@supabase/supabase-js'),
    fetchWithDeadline('/newsroom/supabase-config.json', { credentials: 'omit', cache: 'no-store' }),
  ])
  if (!response.ok) throw new Error('Account service unavailable')
  const { url, anonKey } = await response.json()
  if (!url || !anonKey) throw new Error('Account service unavailable')
  return createClient(url, anonKey, {
    global: { fetch: fetchWithDeadline },
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  })
})
