/**
 * Shared mobile card slider used by the News and Past Projects pages.
 *
 * Both pages render the same `.card.image-card` grid inside `main.grid` and
 * previously shipped two ~175-line, byte-for-byte identical implementations in
 * `script.js` (`initMobileNewsSlider` / `initMobileProjectsSlider`). They are
 * now a single factory; the only per-page differences are the localStorage key
 * (so each page remembers its own slide) and the window state key.
 *
 * Public API is preserved for backwards compatibility:
 *   window.initMobileNewsSlider()
 *   window.initMobileProjectsSlider()
 *
 * Behaviour matches the original, plus a few safe robustness fixes:
 *   - rebuilds against live DOM after SPA re-navigation (stale wrapper guard)
 *   - the single resize listener always drives the latest mount
 *   - honours `prefers-reduced-motion`
 */

const SWIPE_THRESHOLD_PX = 30;
const MOBILE_MAX_WIDTH = 1440;

function createCardSlider({ storageKey, stateKey }) {
  return () => {
    const cards = document.querySelectorAll('.card.image-card');
    const gridContainer = document.querySelector('main.grid');
    if (!cards.length || !gridContainer) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const prefersReducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const enterTransition = prefersReducedMotion
      ? 'none'
      : 'transform 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
    const settleTransition = prefersReducedMotion
      ? 'none'
      : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    const state = window[stateKey] || {
      resizeBound: false,
      touchBound: false,
      sliderWrapper: null,
      sliderTrack: null,
      dragFrame: null,
      isDragging: false,
      lastDragOffset: 0
    };
    window[stateKey] = state;

    const cardCount = cards.length;
    const stepPercent = 100 / cardCount;
    let currentIndex = Math.max(
      0,
      Math.min(cardCount - 1, parseInt(localStorage.getItem(storageKey), 10) || 0)
    );
    let startX = 0;
    let startY = 0;

    const bindTouch = () => {
      if (!isTouchDevice || state.touchBound || !state.sliderWrapper) return;
      state.sliderWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
      state.sliderWrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
      state.sliderWrapper.addEventListener('touchend', handleTouchEnd, { passive: true });
      state.touchBound = true;
    };

    const unbindTouch = () => {
      if (!state.sliderWrapper || !state.touchBound) return;
      state.sliderWrapper.removeEventListener('touchstart', handleTouchStart);
      state.sliderWrapper.removeEventListener('touchmove', handleTouchMove);
      state.sliderWrapper.removeEventListener('touchend', handleTouchEnd);
      state.touchBound = false;
    };

    const ensureWrapper = () => {
      // After SPA navigation the previous DOM is replaced, leaving a detached
      // wrapper reference behind. Discard it so we rebuild against live nodes.
      if (state.sliderWrapper && !gridContainer.contains(state.sliderWrapper)) {
        state.sliderWrapper = null;
        state.sliderTrack = null;
        state.touchBound = false;
      }
      if (state.sliderWrapper) return;

      state.sliderWrapper = document.createElement('div');
      state.sliderWrapper.className = 'slider-wrapper';
      Object.assign(state.sliderWrapper.style, {
        position: 'relative',
        width: '100%',
        height: 'auto',
        overflow: 'hidden'
      });

      state.sliderTrack = document.createElement('div');
      state.sliderTrack.className = 'slider-track';
      Object.assign(state.sliderTrack.style, {
        display: 'flex',
        width: `${cardCount * 100}%`,
        transition: enterTransition,
        transform: 'translateX(0%)',
        willChange: 'transform'
      });

      cards.forEach((card) => {
        const cardWrapper = document.createElement('div');
        cardWrapper.className = 'card-wrapper';
        Object.assign(cardWrapper.style, {
          width: `${stepPercent}%`,
          flexShrink: '0',
          display: 'flex',
          justifyContent: 'center'
        });
        cardWrapper.appendChild(card);
        state.sliderTrack.appendChild(cardWrapper);
      });

      state.sliderWrapper.appendChild(state.sliderTrack);
      gridContainer.prepend(state.sliderWrapper);
    };

    const cleanupWrapper = () => {
      unbindTouch();
      if (state.sliderWrapper) {
        state.sliderWrapper.remove();
        state.sliderWrapper = null;
        state.sliderTrack = null;
      }
      cards.forEach((card) => gridContainer.appendChild(card));
    };

    function updateSlider() {
      const isMobile = window.innerWidth <= MOBILE_MAX_WIDTH && isTouchDevice;

      if (isMobile) {
        gridContainer.style.display = 'flex';
        gridContainer.style.flexDirection = 'column';
        gridContainer.style.alignItems = 'center';
        gridContainer.style.overflow = 'hidden';
        gridContainer.style.touchAction = 'pan-y';

        ensureWrapper();
        bindTouch();

        if (state.sliderTrack) {
          state.sliderTrack.style.transform = `translateX(-${currentIndex * stepPercent}%)`;
        }
      } else {
        cleanupWrapper();
        gridContainer.style.display = 'grid';
        gridContainer.style.flexDirection = '';
        gridContainer.style.alignItems = '';
        gridContainer.style.overflow = '';
        gridContainer.style.touchAction = '';
      }
    }

    function handleTouchStart(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      state.isDragging = true;
    }

    function handleTouchMove(e) {
      if (!state.isDragging || !state.sliderTrack) return;
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = Math.abs(currentX - startX);
      const deltaY = Math.abs(currentY - startY);

      if (deltaX > deltaY) {
        e.preventDefault();
      }

      const dragOffset = ((currentX - startX) / window.innerWidth) * 100;
      state.lastDragOffset = dragOffset;

      if (!state.dragFrame) {
        state.dragFrame = requestAnimationFrame(() => {
          const baseTransform = -currentIndex * stepPercent;
          state.sliderTrack.style.transition = 'none';
          state.sliderTrack.style.transform = `translateX(${baseTransform + state.lastDragOffset}%)`;
          state.dragFrame = null;
        });
      }
    }

    function handleTouchEnd(e) {
      state.isDragging = false;
      if (!state.sliderTrack) return;

      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;

      state.sliderTrack.style.transition = settleTransition;

      let newIndex = currentIndex;

      if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
        if (deltaX < 0 && currentIndex < cardCount - 1) {
          newIndex = currentIndex + 1;
        } else if (deltaX > 0 && currentIndex > 0) {
          newIndex = currentIndex - 1;
        }
      }

      currentIndex = newIndex;
      const finalTransform = -currentIndex * stepPercent;
      state.sliderTrack.style.transform = `translateX(${finalTransform}%)`;
      localStorage.setItem(storageKey, currentIndex.toString());
    }

    updateSlider();

    // Keep a single resize listener, but always point it at the latest mount so
    // re-navigation doesn't leave it driving stale nodes/index.
    state.onResize = updateSlider;
    if (!state.resizeBound) {
      state.resizeBound = true;
      window.addEventListener(
        'resize',
        () => {
          if (typeof state.onResize === 'function') state.onResize();
        },
        { passive: true }
      );
    }
  };
}

window.initMobileProjectsSlider = createCardSlider({
  storageKey: 'projectsSliderIndex',
  stateKey: '__projectsSliderState'
});

window.initMobileNewsSlider = createCardSlider({
  storageKey: 'newsSliderIndex',
  stateKey: '__newsSliderState'
});

// Safety net for direct/initial loads. During SPA navigation the live driver is
// `loadPage()` (News -> initMobileNewsSlider, pastProjects -> initMobileProjectsSlider);
// at first DOMContentLoaded `#content` is still empty so these no-op.
document.addEventListener('DOMContentLoaded', () => {
  window.initMobileProjectsSlider();
  window.initMobileNewsSlider();
});
