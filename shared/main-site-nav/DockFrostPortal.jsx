import { createPortal, useLayoutEffect, useState } from 'react';

/**
 * Paints frosted glass behind the dock pill via a fixed layer on the nav root.
 * Backdrop-filter on in-nav descendants is blocked by ancestor transforms;
 * a portal on .main-site-nav (same isolation context as page content) avoids that.
 */
export default function DockFrostPortal({ active, anchorEl, containerEl }) {
  const [style, setStyle] = useState(null);

  useLayoutEffect(() => {
    if (!active || !anchorEl) {
      setStyle(null);
      return undefined;
    }

    const sync = () => {
      if (!anchorEl.isConnected) {
        setStyle(null);
        return;
      }

      const rect = anchorEl.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) {
        setStyle(null);
        return;
      }

      setStyle({
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
    };

    sync();
    const rafId = requestAnimationFrame(sync);

    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(anchorEl);
    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);

    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [active, anchorEl]);

  if (!active || !style || !containerEl) {
    return null;
  }

  return createPortal(
    <div className="main-site-nav__dock-frost-portal" style={style} aria-hidden="true" />,
    containerEl,
  );
}
