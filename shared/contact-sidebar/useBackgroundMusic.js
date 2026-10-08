import { useAudioVisualizer } from './useAudioVisualizer.js'

// Share the homepage's existing audio object with the VN mascot headphones.
export function useBackgroundMusic() {
  const { isPlaying, toggle } = useAudioVisualizer()
  return { isPlaying, toggle }
}
