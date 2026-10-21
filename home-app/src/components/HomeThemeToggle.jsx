import { Moon, Sun } from 'lucide-react'
import AnimatedViewToggle from '../../../shared/ui/AnimatedViewToggle.jsx'
import { useHomeTheme } from '../hooks/useHomeTheme.js'
import './HomeThemeToggle.css'

export default function HomeThemeToggle() {
  const [theme, setTheme] = useHomeTheme()
  const dark = theme === 'dark'
  const label = dark ? 'Switch to light mode' : 'Switch to dark mode'
  return (
    <AnimatedViewToggle
      className="home-theme-toggle"
      checked={dark}
      onCheckedChange={next => setTheme(next ? 'dark' : 'light')}
      ariaLabel={label}
      title={label}
      duration={450}
      viewTransitionName="icue-avt-home-theme-icon"
      onIcon={<Moon size={20} strokeWidth={1.75} aria-hidden="true" />}
      offIcon={<Sun size={20} strokeWidth={1.75} aria-hidden="true" />}
    />
  )
}
