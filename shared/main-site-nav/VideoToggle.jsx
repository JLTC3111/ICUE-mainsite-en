export default function VideoToggle({
  id,
  inputId,
  variant = 'nav',
  type = 'home',
  label = 'Background video toggle',
  showLabel = true,
  visible = true,
}) {
  if (!visible) return null;

  const baseClass = type === 'moe' ? 'moe-video-toggle' : 'home-video-toggle';
  const variantClass = variant === 'navbar' ? `${baseClass}--navbar` : `${baseClass}--nav`;
  const labelClass = `${baseClass}__label`;
  const inputClass = `${baseClass}__input`;
  const trackClass = `${baseClass}__track`;
  const thumbClass = `${baseClass}__thumb`;
  const textClass = `${baseClass}__text`;

  return (
    <div className={`${baseClass} ${variantClass}`} id={id} aria-label={label}>
      <label className={labelClass} htmlFor={inputId}>
        <input id={inputId} className={inputClass} type="checkbox" />
        <span className={trackClass} aria-hidden="true">
          <span className={thumbClass} aria-hidden="true" />
        </span>
        {showLabel && <span className={textClass}>Video</span>}
      </label>
    </div>
  );
}
