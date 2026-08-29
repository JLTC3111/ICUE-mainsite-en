import './CircularText.css'

const HOVER_SPEED = {
  slowDown: 2,
  speedUp: 0.25,
  goBonkers: 0.05,
}

export default function CircularText({
  text,
  spinDuration = 20,
  onHover = 'speedUp',
  className = '',
  lightColor = '#ffffff',
  darkColor = '#ffffff',
  tintColor = '#ffffff',
}) {
  const letters = Array.from(text)
  const hoverDuration = spinDuration * (HOVER_SPEED[onHover] || 1)
  const step = letters.length ? 360 / letters.length : 0

  return (
    <div
      className={`circular-text circular-text--hover-${onHover || 'none'} ${className}`.trim()}
      style={{
        '--circular-text-duration': `${spinDuration}s`,
        '--circular-text-hover-duration': `${hoverDuration}s`,
        '--circular-text-light': lightColor,
        '--circular-text-dark': darkColor,
        '--circular-text-tint': tintColor,
      }}
      aria-hidden="true"
    >
      {letters.map((letter, i) => (
        <span
          key={`${letter}-${i}`}
          style={{ transform: `rotate(${step * i}deg)` }}
        >
          {letter}
        </span>
      ))}
    </div>
  )
}
