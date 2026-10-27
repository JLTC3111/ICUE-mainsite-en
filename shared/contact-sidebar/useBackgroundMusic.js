import { useAudioVisualizer } from './useAudioVisualizer.js'

// Share the homepage's existing audio object with the VN mascot headphones.
export function useBackgroundMusic() {
  const { isPlaying, toggle } = useAudioVisualizer()
  const audio = typeof window !== 'undefined' ? window.__icueBackgroundAudio : null
  const filename = (audio?.currentSrc || audio?.src || '').split(/[?#]/)[0].split('/').pop() || ''
  let trackTitle = filename
  try { trackTitle = decodeURIComponent(filename) } catch { /* A malformed file name can still be displayed. */ }
  return { isPlaying, toggle, trackTitle }
}
