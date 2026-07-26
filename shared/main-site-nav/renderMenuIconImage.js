/** Rasterize the nav hamburger icon for MetallicPaint input. */
export function renderMenuIconImage(isOpen = false, size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  const viewBoxOffsetY = -0.5;
  const viewBoxSize = 25;
  const scale = size / viewBoxSize;

  const drawBar = (x, y, width, height, { translateY = 0, rotateDeg = 0 } = {}) => {
    const px = x * scale;
    const py = (y - viewBoxOffsetY) * scale;
    const pw = width * scale;
    const ph = height * scale;
    const cx = px + pw / 2;
    const cy = py + ph / 2;

    ctx.save();
    ctx.translate(cx, cy);
    if (rotateDeg) ctx.rotate((rotateDeg * Math.PI) / 180);
    if (translateY) ctx.translate(0, translateY * scale);
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
    ctx.restore();
  };

  if (isOpen) {
    // Draw the close mark around one shared center. Translating after rotating
    // moved both legacy bars sideways in their rotated coordinate systems,
    // which made one edge appear clipped in the compact Pill menu button.
    drawBar(6.5, 11.75, 12, 1.5, { rotateDeg: -45 });
    drawBar(6.5, 11.75, 12, 1.5, { rotateDeg: 45 });
  } else {
    drawBar(7.834, 7.75, 9.333, 1.5);
    drawBar(5.5, 11.75, 14, 1.5);
    drawBar(7.834, 15.75, 9.333, 1.5);
  }

  return canvas.toDataURL('image/png');
}
