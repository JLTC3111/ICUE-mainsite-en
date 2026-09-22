import { fileURLToPath } from 'node:url'

/** Keep Vite's native import/CSS preloading and provide retry URLs after bundling. */
export function recoveryChunks() {
  const entries = [
    './src/pages/HomePage.jsx',
    './src/components/reactbits/GridScan.jsx',
    '../shared/main-site-nav/MainSiteHeader.jsx',
  ]
  const references = new Map()
  return {
    name: 'icue-recovery-chunks',
    apply: 'build',
    buildStart() {
      for (const entry of entries) {
        const id = fileURLToPath(new URL(entry, import.meta.url))
        references.set(id, this.emitFile({ type: 'chunk', id }))
      }
    },
    renderDynamicImport({ targetModuleId }) {
      const reference = references.get(targetModuleId)
      if (!reference) return null
      // Rollup resolves the filename/hash placeholder in both places. Preserve
      // the native import expression so Vite still discovers its CSS dependencies.
      const url = `/${this.getFileName(reference)}`
      return { left: `window.__icueImportChunk(${JSON.stringify(url)}, () => import(`, right: '))' }
    },
  }
}
