import { useCallback, useRef } from 'react';
import { flushSync } from 'react-dom';
import './animated-view-toggle.css';

function polygonCollapsed(cx, cy, vertexCount) {
  const pairs = Array.from({ length: vertexCount }, () => `${cx}px ${cy}px`).join(', ');
  return `polygon(${pairs})`;
}

function getTransitionClipPaths(
  variant,
  cx,
  cy,
  maxRadius,
  viewportWidth,
  viewportHeight,
) {
  switch (variant) {
    case 'square': {
      const halfW = Math.max(cx, viewportWidth - cx);
      const halfH = Math.max(cy, viewportHeight - cy);
      const halfSide = Math.max(halfW, halfH) * 1.05;
      const end = [
        `${cx - halfSide}px ${cy - halfSide}px`,
        `${cx + halfSide}px ${cy - halfSide}px`,
        `${cx + halfSide}px ${cy + halfSide}px`,
        `${cx - halfSide}px ${cy + halfSide}px`,
      ].join(', ');
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`];
    }
    case 'diamond': {
      const radius = maxRadius * Math.SQRT2;
      const end = [
        `${cx}px ${cy - radius}px`,
        `${cx + radius}px ${cy}px`,
        `${cx}px ${cy + radius}px`,
        `${cx - radius}px ${cy}px`,
      ].join(', ');
      return [polygonCollapsed(cx, cy, 4), `polygon(${end})`];
    }
    case 'circle':
    default:
      return [
        `circle(0px at ${cx}px ${cy}px)`,
        `circle(${maxRadius}px at ${cx}px ${cy}px)`,
      ];
  }
}

/** Phosphor video-camera (public/phosphor-icons/video-camera.svg) */
function VideoCameraIcon() {
  return (
    <svg viewBox="16 0 236 256" fill="currentColor" aria-hidden="true">
      <path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z" />
    </svg>
  );
}

/** Phosphor video-camera-slash (public/phosphor-icons/video-camera-slash.svg) */
function VideoCameraSlashIcon() {
  return (
    <svg viewBox="16 0 236 256" fill="currentColor" aria-hidden="true">
      <path d="M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H113.06a8,8,0,0,0,0,16H192v87.63a8,8,0,0,0,16,0V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM240,161.05l-32-21.33V116.28L240,95ZM53.92,34.62A8,8,0,1,0,42.08,45.38L51.73,56H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H182.64l19.44,21.38a8,8,0,1,0,11.84-10.76ZM32,184V72H66.28L168.1,184Z" />
    </svg>
  );
}

/**
 * Magic UI Animated Theme Toggler pattern — adapted for boolean view transitions.
 * @see https://magicui.design/docs/components/animated-theme-toggler
 */
export default function AnimatedViewToggle({
  className = '',
  duration = 450,
  variant = 'circle',
  fromCenter = false,
  checked = false,
  onCheckedChange,
  disabled = false,
  ariaLabel,
  ...props
}) {
  const buttonRef = useRef(null);

  const toggle = useCallback(() => {
    if (disabled) return;

    const button = buttonRef.current;
    if (!button || button.dataset.transitioning === 'true') return;

    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;

    let x;
    let y;
    if (fromCenter) {
      x = viewportWidth / 2;
      y = viewportHeight / 2;
    } else {
      const { top, left, width, height } = button.getBoundingClientRect();
      x = left + width / 2;
      y = top + height / 2;
    }

    const maxRadius = Math.hypot(
      Math.max(x, viewportWidth - x),
      Math.max(y, viewportHeight - y),
    );

    const applyChange = () => {
      onCheckedChange?.(!checked);
    };

    if (typeof document.startViewTransition !== 'function') {
      applyChange();
      return;
    }

    button.dataset.transitioning = 'true';

    const clipPath = getTransitionClipPaths(
      variant,
      x,
      y,
      maxRadius,
      viewportWidth,
      viewportHeight,
    );

    const root = document.documentElement;
    root.dataset.icueViewToggleVt = 'active';
    root.style.setProperty('--icue-view-toggle-vt-duration', `${duration}ms`);
    root.style.setProperty('--icue-view-toggle-vt-clip-from', clipPath[0]);

    const cleanup = () => {
      delete button.dataset.transitioning;
      delete root.dataset.icueViewToggleVt;
      root.style.removeProperty('--icue-view-toggle-vt-duration');
      root.style.removeProperty('--icue-view-toggle-vt-clip-from');
    };

    const transition = document.startViewTransition(() => {
      flushSync(applyChange);
    });

    if (typeof transition?.finished?.finally === 'function') {
      transition.finished.finally(cleanup);
    } else {
      cleanup();
    }

    const ready = transition?.ready;
    if (ready && typeof ready.then === 'function') {
      ready.then(() => {
        document.documentElement.animate(
          { clipPath },
          {
            duration,
            easing: 'ease-in-out',
            fill: 'forwards',
            pseudoElement: '::view-transition-new(root)',
          },
        );
      });
    }
  }, [checked, disabled, duration, fromCenter, onCheckedChange, variant]);

  const classes = ['animated-view-toggle', className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      ref={buttonRef}
      className={classes}
      onClick={toggle}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={ariaLabel}
      data-state={checked ? 'on' : 'off'}
      {...props}
    >
      <span className="animated-view-toggle__icons" aria-hidden="true">
        <span className="animated-view-toggle__icon animated-view-toggle__icon--camera">
          <VideoCameraIcon />
        </span>
        <span className="animated-view-toggle__icon animated-view-toggle__icon--slash">
          <VideoCameraSlashIcon />
        </span>
      </span>
      <span className="animated-view-toggle__sr-only">{ariaLabel}</span>
    </button>
  );
}
