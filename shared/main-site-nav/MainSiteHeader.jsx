import LanguageFlagLink from './LanguageFlagLink';
import VideoToggle from './VideoToggle';
import VideoText from '@icue/ui/VideoText';
import MetallicMenuIcon from './MetallicMenuIcon';

const LOGO_VIDEO_SRC = 'public/bgVideos/video-text-football.mp4';
const CONTACT_VIDEO_SRC = 'public/bgVideos/blueflow.mp4';

export default function MainSiteHeader({
  drawerOpen,
  onToggleDrawer,
  showContactLink,
  showHomeVideoToggle,
  showMoeVideoToggle,
  showAboutUsVideoToggle,
  homeVideoEnabled,
  homeVideoToggleDisabled,
  onHomeVideoToggle,
  aboutUsVideoEnabled,
  aboutUsVideoToggleDisabled,
  onAboutUsVideoToggle,
  menuIconRef,
  menuToggleRef,
  logoLinkRef,
  contactLinkRef,
  flagLinkRef,
}) {
  return (
    <>
      <div className="main-site-nav__left logo-banner">
        <a
          ref={logoLinkRef}
          href="https://en.icue.vn"
          id="logo-link"
          className="logo-link"
          aria-label="Go to homepage"
        >
          <img
            className="logo-mark"
            src="public/logoIcons/favicon.png"
            alt=""
            aria-hidden="true"
            decoding="async"
          />
          <VideoText
            className="logo-wordmark"
            src={LOGO_VIDEO_SRC}
            fontSize="72"
            fontWeight="700"
            fontFamily="Poppins, system-ui, sans-serif"
            as="span"
          >
            ICUE
          </VideoText>
        </a>

        <VideoToggle
          id="homeVideoToggleContainerMobile"
          inputId="homeVideoToggleMobile"
          variant="navbar"
          label="Background video toggle"
          showLabel={false}
          visible={showHomeVideoToggle}
          animated
          checked={homeVideoEnabled}
          onCheckedChange={onHomeVideoToggle}
          disabled={homeVideoToggleDisabled}
        />

        <VideoToggle
          id="moeVideoToggleContainerMobile"
          inputId="moeVideoToggleMobile"
          variant="navbar"
          type="moe"
          label="Meet Our Experts background video toggle"
          showLabel={false}
          visible={showMoeVideoToggle}
        />

        <VideoToggle
          id="aboutUsVideoToggleContainerMobile"
          inputId="aboutUsVideoToggleMobile"
          variant="navbar"
          label="About Us background video toggle"
          showLabel={false}
          visible={showAboutUsVideoToggle}
          animated
          checked={aboutUsVideoEnabled}
          onCheckedChange={onAboutUsVideoToggle}
          disabled={aboutUsVideoToggleDisabled}
        />
      </div>

      <div className="main-site-nav__center">
        <button
          ref={menuToggleRef}
          type="button"
          className="menu-toggle"
          id="menuToggle"
          aria-label="Toggle navigation menu"
          aria-expanded={drawerOpen}
          onClick={(e) => {
            e.stopPropagation();
            onToggleDrawer();
          }}
        >
          <MetallicMenuIcon isOpen={drawerOpen} menuIconRef={menuIconRef} />
        </button>
      </div>

      <div className="main-site-nav__right">
        {showContactLink && (
          <a
            ref={contactLinkRef}
            href="#/aboutUs"
            data-page="aboutUs"
            className="contact-link"
            id="contactLink"
            onClick={(e) => {
              e.preventDefault();
              if (typeof window.loadPage === 'function') {
                window.loadPage('aboutUs');
              }
              if (typeof window.closeDrawerMenu === 'function') {
                window.closeDrawerMenu();
              }
            }}
          >
            <VideoText
              className="contact-link-wordmark"
              src={CONTACT_VIDEO_SRC}
              fontSize="64"
              fontWeight="700"
              fontFamily="Poppins, system-ui, sans-serif"
              viewBox="0 0 720 120"
              as="span"
            >
              ABOUT US
            </VideoText>
          </a>
        )}

        <div className="language-switcher" ref={flagLinkRef}>
          <VideoToggle
            id="homeVideoToggleContainerDesktop"
            inputId="homeVideoToggleDesktop"
            variant="nav"
            showLabel={false}
            visible={showHomeVideoToggle}
            animated
            checked={homeVideoEnabled}
            onCheckedChange={onHomeVideoToggle}
            disabled={homeVideoToggleDisabled}
          />

          <VideoToggle
            id="moeVideoToggleContainerDesktop"
            inputId="moeVideoToggleDesktop"
            variant="nav"
            type="moe"
            label="Meet Our Experts background video toggle"
            showLabel={false}
            visible={showMoeVideoToggle}
          />

          <VideoToggle
            id="aboutUsVideoToggleContainerDesktop"
            inputId="aboutUsVideoToggleDesktop"
            variant="nav"
            label="About Us background video toggle"
            showLabel={false}
            visible={showAboutUsVideoToggle}
            animated
            checked={aboutUsVideoEnabled}
            onCheckedChange={onAboutUsVideoToggle}
            disabled={aboutUsVideoToggleDisabled}
          />

          <LanguageFlagLink />
        </div>
      </div>
    </>
  );
}
