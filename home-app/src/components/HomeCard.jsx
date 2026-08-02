import BorderGlow from '@icue/ui/BorderGlow/BorderGlow'
import { handleSpaNavigation } from '@icue/main-site-nav/navigation'
import { useNavigate } from 'react-router-dom'
import AnimatedContent from './reactbits/AnimatedContent'
import PixelImage from './magicui/PixelImage'

function HomeCardSurface({
  image,
  imageAlt,
  href,
  title,
  description,
  imageOnly,
  compactGrid,
  onLinkClick,
}) {
  return (
    <div className="home-card__surface">
      {imageOnly ? (
        <PixelImage
          src={image}
          alt={imageAlt}
          customGrid={compactGrid}
        />
      ) : (
        <a href={href} onClick={onLinkClick} aria-label={title} className="home-card__media">
          <PixelImage
            src={image}
            alt={imageAlt}
            customGrid={compactGrid}
          />
        </a>
      )}
      <a className="home-card__body" href={href} onClick={onLinkClick} aria-label={title}>
        <h3>{title}</h3>
        <p>{description}</p>
      </a>
    </div>
  )
}

export default function HomeCard({
  image,
  imageAlt,
  href,
  title,
  description,
  imageOnly = false,
  beamRef,
  enableGlow = false,
}) {
  const navigate = useNavigate()
  const handleLinkClick = (event) => {
    handleSpaNavigation(event, href, navigate)
  }
  const pixelGrid = enableGlow
    ? { rows: 4, cols: 6 }
    : { rows: 3, cols: 4 }

  const cardContent = enableGlow ? (
    <BorderGlow
      className="home-card__glow"
      borderRadius={18}
      glowRadius={22}
      glowIntensity={0.9}
      edgeSensitivity={24}
      glowColor="195 90 68"
      backgroundColor="rgba(10, 16, 30, 0.92)"
      colors={['#1db7ff', '#c8ff00', '#368adf']}
      fillOpacity={0.28}
    >
      <HomeCardSurface
        image={image}
        imageAlt={imageAlt}
        href={href}
        title={title}
        description={description}
        imageOnly={imageOnly}
        compactGrid={pixelGrid}
        onLinkClick={handleLinkClick}
      />
    </BorderGlow>
  ) : (
    <HomeCardSurface
      image={image}
      imageAlt={imageAlt}
      href={href}
      title={title}
      description={description}
      imageOnly={imageOnly}
      compactGrid={pixelGrid}
      onLinkClick={handleLinkClick}
    />
  )

  return (
    <article className="home-card" ref={beamRef}>
      <AnimatedContent>
        {cardContent}
      </AnimatedContent>
    </article>
  )
}
