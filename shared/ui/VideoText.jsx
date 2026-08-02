import { Children, useEffect, useMemo, useRef, useState } from 'react';
import './video-text.css';

/** Data Saver or an explicit reduced-motion preference means: never loop the video. */
function prefersStillVideo() {
  if (typeof window === 'undefined') return false;
  const connection = navigator.connection
    || navigator.mozConnection
    || navigator.webkitConnection;
  if (connection?.saveData) return true;
  if (/(slow-2g|2g)/i.test(connection?.effectiveType || '')) return true;
  return typeof window.matchMedia === 'function'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function buildSvgMask({
  content,
  fontSize,
  fontWeight,
  textAnchor,
  textX,
  dominantBaseline,
  fontFamily,
  viewBox,
}) {
  const responsiveFontSize =
    typeof fontSize === 'number' ? `${fontSize}vw` : fontSize;

  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}' preserveAspectRatio='xMidYMid meet' width='100%' height='100%'><text x='${textX}' y='52%' font-size='${responsiveFontSize}' font-weight='${fontWeight}' text-anchor='${textAnchor}' dominant-baseline='${dominantBaseline}' font-family='${fontFamily}'>${content}</text></svg>`;
}

/**
 * Magic UI Video Text — text filled with a looping video mask.
 * @see https://magicui.design/docs/components/video-text
 */
export default function VideoText({
  src,
  children,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  preload = 'metadata',
  defer = false,
  fontSize = 20,
  fontWeight = 'bold',
  textAnchor = 'middle',
  textX = '50%',
  dominantBaseline = 'middle',
  fontFamily = 'sans-serif',
  viewBox = '0 0 500 120',
  as: Component = 'div',
}) {
  const content = Children.toArray(children).join('');
  const [loadVideo, setLoadVideo] = useState(!defer);
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef(null);
  const maskRef = useRef(null);

  const maskOptions = useMemo(
    () => ({
      content,
      fontSize,
      fontWeight,
      textAnchor,
      textX,
      dominantBaseline,
      fontFamily,
      viewBox,
    }),
    [content, fontSize, fontWeight, textAnchor, textX, dominantBaseline, fontFamily, viewBox],
  );

  const svgMask = useMemo(() => buildSvgMask(maskOptions), [maskOptions]);

  useEffect(() => {
    setVideoReady(false);
    if (!defer) {
      setLoadVideo(true);
      return undefined;
    }

    setLoadVideo(false);
    const start = () => setLoadVideo(true);
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(start, { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(start, 1000);
    return () => window.clearTimeout(id);
  }, [defer, src]);

  // Only decode video while the wordmark is actually on screen and the tab is
  // visible. Otherwise the header keeps a decoder + compositor layer alive on
  // every route for a decoration nobody is looking at.
  useEffect(() => {
    const video = videoRef.current;
    const mask = maskRef.current;
    if (!video || !mask) return undefined;

    if (prefersStillVideo()) {
      video.pause();
      return undefined;
    }

    let onScreen = true;

    const sync = () => {
      if (onScreen && !document.hidden) {
        const played = video.play();
        if (played?.catch) played.catch(() => {});
      } else {
        video.pause();
      }
    };

    let observer = null;
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(
        ([entry]) => {
          onScreen = entry.isIntersecting;
          sync();
        },
        { rootMargin: '96px' },
      );
      observer.observe(mask);
    }

    document.addEventListener('visibilitychange', sync, { passive: true });
    sync();

    return () => {
      observer?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [loadVideo, src]);

  const dataUrlMask = `url("data:image/svg+xml,${encodeURIComponent(svgMask)}")`;

  const maskPosition = textAnchor === 'start' ? 'left center' : 'center';

  return (
    <Component className={['video-text', className].filter(Boolean).join(' ')}>
      <div
        ref={maskRef}
        className={[
          'video-text__mask',
          videoReady ? 'video-text__mask--video-ready' : '',
        ].filter(Boolean).join(' ')}
        style={{
          maskImage: dataUrlMask,
          WebkitMaskImage: dataUrlMask,
          maskSize: 'contain',
          WebkitMaskSize: 'contain',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskPosition,
          WebkitMaskPosition: maskPosition,
        }}
      >
        {loadVideo ? (
          <video
            ref={videoRef}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            preload={preload}
            playsInline
            disablePictureInPicture
            tabIndex={-1}
            aria-hidden="true"
            onCanPlay={() => setVideoReady(true)}
          >
            <source src={src} type="video/mp4" />
          </video>
        ) : null}
      </div>
      <span className="video-text__sr-only">{content}</span>
    </Component>
  );
}
