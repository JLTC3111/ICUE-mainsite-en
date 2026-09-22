import { withDeadline } from './requests.js'

/** Browsers cache failed ESM fetches by URL, even when React.lazy is recreated. */
export function createChunkLoader(importModule = url => import(/* @vite-ignore */ url), options = {}) {
  const modules = new Map()
  return (importerUrl, specifier, nativeImport) => {
    const url = new URL(specifier, importerUrl).href
    let record = modules.get(url)
    if (!record) {
      record = { attempts: 0, promise: null }
      modules.set(url, record)
    }
    if (record.promise) return record.promise
    const target = new URL(url)
    if (record.attempts > 0) target.searchParams.set('icue-retry', String(record.attempts))
    const firstAttempt = record.attempts === 0
    record.attempts += 1
    const pending = withDeadline(() => firstAttempt && nativeImport ? nativeImport() : importModule(target.href), options)
    record.promise = pending
    pending.catch(() => { if (record.promise === pending) record.promise = null })
    return pending
  }
}

export function installChunkRecovery() {
  // Vite supplies each emitted URL and its native import on the first attempt.
  // Healthy modules retain their identity and the existing preload behavior.
  const load = createChunkLoader()
  window.__icueImportChunk = (url, nativeImport) => load(window.location.href, url, nativeImport)
}
