import { Cpu } from 'lucide-react'
import usePrefersReducedMotion from '../../../shared/ui/usePrefersReducedMotion.js'
import { useHomeBeamsEnabled } from '../hooks/useHomeBeamsEnabled.js'
import './HomeBeamsToggle.css'

const LABELS = ['Turn on background and beam effects', 'Turn off background and beam effects', 'Background and beam effects are off while reduced motion is enabled']

export default function HomeBeamsToggle() {
  const [enabled, setEnabled] = useHomeBeamsEnabled()
  const reducedMotion = usePrefersReducedMotion()
  const label = LABELS[reducedMotion ? 2 : enabled ? 1 : 0]

  return (
    <button
      type="button"
      className="home-beams-toggle"
      aria-label={label}
      title={label}
      aria-pressed={enabled && !reducedMotion}
      disabled={reducedMotion}
      onClick={() => setEnabled(value => !value)}
    >
      <Cpu size={20} strokeWidth={1.75} aria-hidden="true" focusable="false" />
    </button>
  )
}
