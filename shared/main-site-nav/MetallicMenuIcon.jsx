import { useEffect, useState } from 'react';
import MetallicPaint from '@icue/ui/MetallicPaint/MetallicPaint';
import { shouldAvoidCanvasEffects } from '../browser/visualEffectsPolicy.js';
import { renderMenuIconImage } from './renderMenuIconImage';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const METALLIC_PROPS = {
  seed: 200,
  scale: 5,
  blur: 0.1,
  mouseAnimation: false,
  lightColor: '#ffffff',
  darkColor: '#80ecff',
  tintColor: '#80ecff',
  brightness: 1.35,
  contrast: 0.5,
  angle: 180,
};

/** Static SVG fallback when MetallicPaint close texture is not ready. */
function CloseIconFallback() {
  return (
    <svg
      className="menu-icon-metallic__fallback-close"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="#80ecff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIconFallback() {
  return (
    <svg
      className="menu-icon-metallic__fallback-close menu-icon-metallic__fallback-menu"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        d="M8 8h8M6 12h12M8 16h8"
        fill="none"
        stroke="#80ecff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function MetallicMenuIcon({ isOpen = false, menuIconRef }) {
  const [menuImageSrc, setMenuImageSrc] = useState(null);
  const [closeImageSrc, setCloseImageSrc] = useState(null);
  const reducedMotion = prefersReducedMotion();
  const canvasEffectsDisabled = shouldAvoidCanvasEffects();

  useEffect(() => {
    if (canvasEffectsDisabled) return undefined;
    // Generate masks directly on canvas. The previous implementation mounted
    // temporary React roots to serialize Lucide SVGs; a queued retry could run
    // after its timeout unmounted the root, causing React production error #409.
    setMenuImageSrc(renderMenuIconImage(false, 512));
    setCloseImageSrc(renderMenuIconImage(true, 512));
    return undefined;
  }, [canvasEffectsDisabled]);

  const speed = reducedMotion ? 0 : 0.5;

  return (
    <span
      ref={menuIconRef}
      id="menuIcon"
      className={['menu-icon-metallic', isOpen ? 'is-open' : ''].filter(Boolean).join(' ')}
      aria-hidden="true"
    >
      <span className="menu-icon-metallic__layer menu-icon-metallic__layer--menu">
        {menuImageSrc ? (
          <MetallicPaint
            className="menu-icon-metallic__paint"
            imageSrc={menuImageSrc}
            speed={speed}
            paused={isOpen}
            {...METALLIC_PROPS}
          />
        ) : (
          <MenuIconFallback />
        )}
      </span>
      <span className="menu-icon-metallic__layer menu-icon-metallic__layer--close">
        {closeImageSrc ? (
          <MetallicPaint
            className="menu-icon-metallic__paint"
            imageSrc={closeImageSrc}
            speed={speed}
            paused={!isOpen}
            {...METALLIC_PROPS}
          />
        ) : (
          <CloseIconFallback />
        )}
      </span>
    </span>
  );
}
