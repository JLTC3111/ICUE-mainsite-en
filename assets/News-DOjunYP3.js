const n=`<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News</title>
  <link rel="icon" type="image/png" href="/public/logoIcons/favicon.png">
  <meta name="twitter:title" content="ICUE Vietnam | Institute for Construction, Urban and Economic Research" />
  <meta name="twitter:description" content="Official website of ICUE Vietnam — Institute for Construction, Urban and Economic Research. Explore projects, community activities, news, and contact information." />
  <meta name="description" content="Official website of ICUE Vietnam — Institute for Construction, Urban and Economic Research. Explore projects, community activities, news, and contact information." />
  <link rel="stylesheet" href="/styles.css">
  <link rel="stylesheet" href="/news/newsStandaloneFallback.css" data-legacy-standalone>
<style> 
/* Scope to .legacy-page so embedded News does not clip fixed MainSiteNav/footer
   (unscoped html/body overflow-x:hidden breaks position:fixed on mobile WebKit). */
.legacy-page,
.legacy-page * {
  margin: 0;
  padding: 0;
}

.legacy-page {
  font-family: sans-serif;
  background: #ffffff;
  padding: 5%;
  padding-top: max(5%, 5.5rem);
  overflow-x: hidden;
  max-width: 100vw;
  box-sizing: border-box;
}

.grid {
  margin-top: 5%;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 15px;
  padding: 20px;
  place-items: center;
}

.grid a{
  text-decoration: none;
}

@media (min-width: 551px) and (max-width: 1024px) {
  .card.image-card {
    width: 100%;
    height: clamp(325px, 65vh, 675px);
    max-width: 75%;
    transition: transform 0.3s ease, opacity 0.3s ease;
    will-change: transform;
  }
  .image-card img {
    filter: grayscale(0%) !important;
    height: 400px !important;
  }
}

@media (max-width: 550px) {
  .grid {
    margin-top: 8px;
    grid-template-columns: 1fr;
    padding: 12px 0;
  }
  .card.image-card {
    max-width: 100%;
  }
  .image-card img {
    filter: grayscale(0%) !important;
    height: 250px !important;
  }
}

.card {
  background: #c4c4c4;
  border-radius: 8px;
  overflow: hidden;
  padding: 0.25rem;
  text-align: center;
  transition: all 0.15s ease-in-out;
  box-shadow: 1px 2px 4px rgba(0, 0, 0, 1);
}

.card .date {
  font-style: italic;
}

.card:hover {
  background: linear-gradient(to bottom right, #ff7e5f, #363330);
  transform: scale(1.025);
  will-change: transform, background;
}

.card:hover .description,
.card:hover .location,
.card:hover .year,
.card:hover .date {
  color: #ffffff;
}

.card:hover .description {
  background-color: transparent;
}

.card-info svg {
  transition: all 0.25s ease-in-out;
}

.card-info:hover svg {
  width: 20px !important;
  height: 20px !important;
  stroke: #ffffff !important;
  stroke-width: 2px !important;
  will-change: color, transform;
}

.image-card img {
  filter: grayscale(25%);
  width: 100%;
  height: 500px; 
  object-fit: cover;
  display: block;
  border-radius: 4px;
  transition: filter 0.3s ease, transform 0.3s ease;
}

.image-wrapper picture {
  display: block;
  width: 100%;
}

.image-card:hover img {
  filter: grayscale(0%) brightness(1.05);
  transform: scale(1.025);
}

.image-card:hover svg {
  width: 20px !important;
  height: 20px !important;
  stroke: #ffffff !important;
  stroke-width: 2px !important;
  will-change: color, transform;
}

.card-info {
  text-align: left;
  padding: 10px;
  transition: 0.15s ease-in-out;
  color: #000000;
}

.card-info h3 {
  color: #000000;
  font-size: clamp(0.75rem, 2.5vw, 1rem);
  margin-bottom: 5px;
  line-height: 1.6;
}

.card:hover .card-info h3 {
  color: #ffffff;
  will-change: color, background, transform;
}


.card-info p {
  margin: 3px 0;
  line-height: 1.4;
}

.card-info p,
.card-info .description,
.card-info .location,
.card-info .year,
.card-info .date {
  font-size: clamp(0.75rem, 2.5vw, 1rem);
  color: #000000;
  margin-bottom: 15px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  white-space: normal;
}

.card-info .description {
  color: #000000;
  background: transparent;
}

/* Initial (hidden) state */
.card.image-card {
  filter: blur(8px);
  opacity: 0;
  transition: filter 0.35s ease, opacity 0.35s ease;
}

/* When AOS activates */
.card.image-card.aos-animate {
  filter: blur(0);
  opacity: 1;
  transition: filter 0.35s ease, opacity 0.35s ease;
}

/* CTA banner — glass morphism, blends with the white News page layout */
.new-news-cta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  max-width: 1100px;
  margin: 0 auto 32px;
  padding: 18px 24px;
  border-radius: 18px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(14px) saturate(160%);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.75);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.9) inset,
    0 8px 32px rgba(16, 19, 24, 0.06),
    0 1px 3px rgba(16, 19, 24, 0.04);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
/* Safety net: AOS keeps [data-aos] at opacity:0 until it adds .aos-animate, but
   this page is injected dynamically and AOS may never re-scan it — which left the
   banner invisible. Higher specificity than AOS's [data-aos] rule forces it shown. */
.new-news-cta[data-aos] { opacity: 1; transform: none; }
.new-news-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(200, 255, 0, 0.14) 0%, transparent 42%),
    linear-gradient(225deg, rgba(10, 10, 10, 0.04) 0%, transparent 55%);
  pointer-events: none;
}
.new-news-cta:hover {
  transform: translateY(-1px);
  border-color: rgba(200, 255, 0, 0.35);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.95) inset,
    0 14px 40px rgba(16, 19, 24, 0.08),
    0 0 0 1px rgba(200, 255, 0, 0.12);
}
.new-news-cta__text {
  display: flex;
  flex-direction: column;
  gap: 3px;
  position: relative;
  z-index: 1;
}
.new-news-cta__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5b6068;
}
.new-news-cta__title {
  color: #16181d;
  font-size: clamp(16px, 2.4vw, 20px);
  font-weight: 700;
  letter-spacing: -0.01em;
}
.new-news-cta__sub {
  color: #6b7077;
  font-size: 13px;
  max-width: 520px;
  line-height: 1.45;
}
.new-news-cta__btn {
  flex: 0 0 auto;
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, rgba(200, 255, 0, 0.92) 0%, rgba(158, 224, 0, 0.88) 100%);
  color: #0a0a0a;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid rgba(200, 255, 0, 0.5);
  box-shadow: 0 2px 10px rgba(200, 255, 0, 0.22);
  transition: filter 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease;
}
.new-news-cta:hover .new-news-cta__btn {
  filter: brightness(1.04);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(200, 255, 0, 0.32);
}

@media (max-width: 600px) {
  .new-news-cta {
    flex-direction: column;
    align-items: stretch;
    text-align: left;
    gap: 14px;
    padding: 16px;
    margin: 0 auto 20px;
    border-radius: 16px;
    /* Stronger surface + accent border so the banner clearly stands out on the
       white page (glass-on-white is too faint on small screens). */
    background: rgba(248, 250, 240, 0.92);
    border: 1px solid rgba(158, 224, 0, 0.45);
    box-shadow: 0 6px 20px rgba(16, 19, 24, 0.1);
  }
  .new-news-cta__title { font-size: 17px; }
  .new-news-cta__sub { font-size: 12.5px; max-width: 100%; }
  .new-news-cta__btn {
    align-self: stretch;
    width: auto;
    margin-right: 15%;
    text-align: center;
    padding: 12px 18px;
    font-size: 15px;
  }
}


/* Clear fixed MainSiteNav when News.html is embedded in the React shell */
.legacy-page .news-logo-swiper-wrap {
  margin-top: max(1.25rem, 5.5rem);
}
@media (max-width: 1024px) {
  .legacy-page .news-logo-swiper-wrap {
    margin-top: max(1.5rem, 5.5rem);
  }
}
</style>
<body>
  <div class="news-logo-swiper-wrap" data-news-logo-state="pending">
  <div class="swiper news-logo-swiper" id="newsLogoSwiper">
    <div class="swiper-wrapper">
      <div class="swiper-slide">
        <a href="https://greenviet.org" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/greenviet_logo-1x.webp" srcset="/public/news/logos/responsive/greenviet_logo-1x.webp 1x, /public/news/logos/responsive/greenviet_logo-2x.webp 2x" alt="Greenviet Logo" width="110" height="110" loading="eager" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://srd.org.vn" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/srd_logo-1x.webp" srcset="/public/news/logos/responsive/srd_logo-1x.webp 1x, /public/news/logos/responsive/srd_logo-2x.webp 2x" alt="SRD Logo" width="220" height="110" loading="eager" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://landl.vn" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/landl_logo-1x.webp" srcset="/public/news/logos/responsive/landl_logo-1x.webp 1x, /public/news/logos/responsive/landl_logo-2x.webp 2x" alt="L&L Logo" width="145" height="110" loading="eager" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://www.international-climate-initiative.com/" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/iki_logo-1x.webp" srcset="/public/news/logos/responsive/iki_logo-1x.webp 1x, /public/news/logos/responsive/iki_logo-2x.webp 2x" alt="IKI Logo" width="220" height="51" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://www.giz.de/en/html/index.html" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/giz_logo-1x.webp" srcset="/public/news/logos/responsive/giz_logo-1x.webp 1x, /public/news/logos/responsive/giz_logo-2x.webp 2x" alt="GIZ Logo" width="220" height="73" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://cecr.vn/" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/cecr_logo-1x.webp" srcset="/public/news/logos/responsive/cecr_logo-1x.webp 1x, /public/news/logos/responsive/cecr_logo-2x.webp 2x" alt="CECR Logo" width="220" height="107" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://ccd.org.vn/" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/ccd_logo-1x.webp" srcset="/public/news/logos/responsive/ccd_logo-1x.webp 1x, /public/news/logos/responsive/ccd_logo-2x.webp 2x" alt="CCD Logo" width="134" height="110" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://arocha.org/en/" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/rocha_logo-1x.webp" srcset="/public/news/logos/responsive/rocha_logo-1x.webp 1x, /public/news/logos/responsive/rocha_logo-2x.webp 2x" alt="ROCHA Logo" width="189" height="110" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
      <div class="swiper-slide">
        <a href="https://viup.vn/" target="_blank" rel="noopener noreferrer">
          <img src="/public/news/logos/responsive/viup_logo-1x.webp" srcset="/public/news/logos/responsive/viup_logo-1x.webp 1x, /public/news/logos/responsive/viup_logo-2x.webp 2x" alt="VIUP Logo" width="110" height="110" loading="lazy" decoding="async" fetchpriority="low">
        </a>
      </div>
    </div>
    <div class="swiper-pagination"></div>
  </div>
</div>

<a class="new-news-cta aos-animate" href="https://icue.vn/newsroom/?from=en-news" data-aos="fade-up">
    <div class="new-news-cta__text">
      <span class="new-news-cta__eyebrow">New · Mới</span>
      <strong class="new-news-cta__title">ICUE's upgraded news portal</strong>
      <span class="new-news-cta__sub">Discover the latest stories on our new, upgraded news platform.</span>
    </div>
    <span class="new-news-cta__btn">View the newsroom →</span>
  </a>

  <main class="grid" data-read-label="Read article →">
    <a href="/src/pages/article_template.html?id=4" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_4-480.webp 480w, /public/news/articles/responsive/card_4-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_4.jpg" loading="eager" fetchpriority="high" decoding="async" width="3504" height="2336" alt="Finalizing Vietnam's smart and sustainable urban development project" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Finalizing the project for Vietnam's smart & sustainable urban development for the 2018-2025 period.</h3>
        <p class="description">Vietnam has made significant progress in the development of smart cities since the implementation of the 2018 Project, with the goal of using technology to improve management, enhance the quality of life, and promote sustainable development, aiming for completion by 2030.</p>
        <p class="location"><strong>Location:</strong> Hanoi, Vietnam</p>
        <p class="date">August 13, 2025</p>
      </div>
    </a>
    <a href="/src/pages/article_template.html?id=1" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_1-480.webp 480w, /public/news/articles/responsive/card_1-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/Card_1.jpg" loading="eager" fetchpriority="high" decoding="async" width="2698" height="1798" alt="IKI-GIZ-ICUE completion ceremony" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>IKI-GIZ-ICUE Completion Ceremony</h3>
        <p class="description">On May 16, ICUE and Hoi An celebrate the successful CBF project, supporting climate action and biodiversity with GIZ and IKI’s vital collaboration.</p>
        <p class="location"><strong>Location:</strong> Hoi An, Vietnam</p>
        <p class="date">May 16, 2025</p>
      </div>
    </a>
    <a href="/src/pages/article_template.html?id=9" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_9-480.webp 480w, /public/news/articles/responsive/card_9-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_9.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1168" height="876" alt="Coastal corridor planning at Cua Dai, Hoi An" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Coastal Corridor Planning at Cua Dai, Hoi An</h3>
        <p class="description">Faced with the severe erosion risk at Cua Dai Beach, experts and local managers came together to discuss creating a green corridor – one that both protects the coastline and nurtures the ecosystem and local community.</p>
        <p class="location"><strong>Location:</strong> Hoi An, Vietnam</p>
        <p class="date">December 5, 2024</p>
      </div>
    </a>
    <a href="/src/pages/article_template.html?id=3" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_3-480.webp 480w, /public/news/articles/responsive/card_3-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/Card_3.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1080" height="806" alt="Supporting areas affected by Typhoon Yagi" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Aiding People & Areas Affected by Typhoone Yagi</h3>
        <p class="description">In response to the call from the Central Committee, ICUE issued a notice calling on all of its staff, partners, and benefactors to join hands in contributing and supporting people affected by Typhoon Yagi.</p>
        <p class="location"><strong>Location:</strong> Bao Yen District, Vietnam</p>
        <p class="date">26 Sept, 2024</p>
      </div>
    </a>
    <a href="/src/pages/article_template.html?id=2" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_2-480.webp 480w, /public/news/articles/responsive/card_2-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/Card_2.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1436" height="1074" alt="Asia Regional Conservation Forum in Thailand" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>8th Asia Regional Conservation Forum Opens in Thailand</h3>
        <p class="description">On September 3, the 8th Asia Regional Conservation Forum (RCF) of the International Union for Conservation of Nature (IUCN) officially opened in Bangkok, Thailand.</p>
        <p class="location"><strong>Location:</strong> Bangkok, Thailand</p>
        <p class="date">03 Sept, 2024</p>
      </div>
    </a>
     <a href="/src/pages/article_template.html?id=8" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_8-480.webp 480w, /public/news/articles/responsive/card_8-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_8.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1269" height="805" alt="Warm clothing journey to Quan Ba's highlands" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Warm Coats, Warm Hearts: A Journey of Love to Quan Ba’s Highlands</h3>
        <p class="description">Lead: In the chilly mountains of Hà Giang, a simple gift of warm clothing and heartfelt smiles turned into a story of compassion and community.</p>
        <p class="location"><strong>Location:</strong> Ha Giang, Vietnam</p>
        <p class="date">January 15, 2024</p>
      </div>
    </a> 
    <a href="/src/pages/article_template.html?id=6" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_6-480.webp 480w, /public/news/articles/responsive/card_6-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_6.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1000" height="528" alt="Urban economics and sustainable development seminar" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Urban Economics in Planning, Sustainable Development of Vietnamese Cities - Opportunities & Challenges</h3>
        <p class="description">The Institute for Construction Economics and Urban Research, under the patronage of the Central Economic Commission and the Ministry of Construction, organized a seminar titled "Urban economics in the planning, construction, and sustainable development of Vietnamese cities - opportunities and challenges." This event was part of a series of events for Vietnam Urban Day on November 8, 2022, held at the Ministry of Construction.</p>
        <p class="location"><strong>Location:</strong> Hanoi, Vietnam</p>
        <p class="date">November 8, 2022</p>
      </div>
    </a> 
    <a href="/src/pages/article_template.html?id=7" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_7-480.webp 480w, /public/news/articles/responsive/card_7-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_7.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1454" height="794" alt="Discussion of Vietnam's coastal development" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Discussion of Vietnam's Coastal Areas & Perspectives on Development</h3>
        <p class="description">The ICUE 2020 conference affirmed the crucial role of coastal urban areas in economic development, national defense-security, and inter-regional connectivity, in line with the direction of Resolution 36/NQ-TW. Experts, management agencies, and research institutes exchanged ideas on solutions for controlling development and building a sustainable marine economic model.</p>
        <p class="location"><strong>Location:</strong> Hanoi, Vietnam</p>
        <p class="date">September 30, 2020</p>
      </div>
    </a> 
    <a href="/src/pages/article_template.html?id=5" class="card image-card aos-animate" data-aos="fade-up">
      <div class="image-wrapper">
        <picture>
          <source type="image/webp" srcset="/public/news/articles/responsive/card_5-480.webp 480w, /public/news/articles/responsive/card_5-960.webp 960w" sizes="(max-width: 1024px) 90vw, 420px">
          <img src="/public/news/articles/card_5.jpg" loading="lazy" fetchpriority="low" decoding="async" width="1080" height="662" alt="Building and developing Hue as a cultural heritage city" data-news-card-image>
        </picture>
      </div>
      <div class="card-info">
        <h3>Building and Developing Hue - A Unique Cultural Heritage City in Southeast Asia</h3>
        <p class="description">A scientific seminar brought together experts and policymakers to discuss the unique development of Thua Thien Hue. The city should prioritize its rich cultural heritage and ecological identity over a traditional industrial model, ensuring Hue remains a distinct cultural hub in Southeast Asia.</p>
        <p class="location"><strong>Location:</strong> Hanoi, Vietnam</p>
        <p class="date">May 22, 2014</p>
      </div>
    </a> 

  </main>

<!-- Swiper is initialized by home-app when this URL is rewritten to the React shell.
     Keep a CDN fallback only if the static HTML is opened without the shell. -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css">
<script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"><\/script>
<script src="/news/newsStandaloneFallback.js"><\/script>

</body>
`;export{n as default};
