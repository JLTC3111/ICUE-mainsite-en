import { useId } from 'react'
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
  const pathId = `circular-text-path-${useId().replace(/:/g, '')}`
  const gradientId = `circular-text-gradient-${useId().replace(/:/g, '')}`
  const hoverDuration = spinDuration * (HOVER_SPEED[onHover] || 1)

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
      <svg className="circular-text__svg" viewBox="0 0 100 100" focusable="false">
        <defs>
          <path
            id={pathId}
            d="M 50,50 m -39,0 a 39,39 0 1,1 78,0 a 39,39 0 1,1 -78,0"
          />
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--circular-text-dark)" />
            <stop offset="0.28" stopColor="var(--circular-text-light)" />
            <stop offset="0.52" stopColor="var(--circular-text-tint)" />
            <stop offset="0.75" stopColor="var(--circular-text-light)" />
            <stop offset="1" stopColor="var(--circular-text-dark)" />
          </linearGradient>
        </defs>
        <text className="circular-text__label" fill={`url(#${gradientId})`}>
          <textPath
            href={`#${pathId}`}
            startOffset="50%"
            textAnchor="middle"
            textLength="238"
            lengthAdjust="spacing"
          >
            {text}
          </textPath>
        </text>
      </svg>
    </div>
  )
}
