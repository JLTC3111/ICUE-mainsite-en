const n=`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Past Projects</title>
  <link rel="stylesheet" href="styles.css">
</head>
<style>
* {
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body,
.legacy-page {
  font-family: sans-serif;
  /* Match site footer near-black gradient */
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  /* Content-sized height so the site footer sits directly under the grid/swiper */
  min-height: 0;
  height: auto;
  padding: 5%;
  padding-bottom: 0.75rem;
  box-sizing: border-box;
}

.grid {
  margin-top: 10%;
  display: grid;
  gap: 25px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: auto;
  align-items: start;
  justify-content: center;
  padding: 20px;
}

.grid a {
  text-decoration: none;
}

@media (max-width: 550px) {
  .grid {
    margin-top: 22%;
    grid-template-columns: 1fr;
  }
}

@media (min-width: 551px) and (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (prefers-reduced-motion: reduce) {
  .card,
  .image-card img,
  .card.image-card {
    transition: none !important;
  }
}

.card {
  background: #141414;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  overflow: hidden;
  padding: 0;
  text-align: center;
  /* Avoid transitioning layout/filter on resize — only cheap hover props */
  transition: transform 0.22s ease, background-color 0.22s ease, border-color 0.22s ease;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04);
  outline: none;
  contain: layout paint;
}

.card:hover {
  background-color: #3310ff;
  border-color: rgba(255, 255, 255, 0.28);
  transform: translateY(-4px);
}

.card:hover .description {
  background-color: transparent;
}

.card:hover .location,
.card:hover .year {
  color: #ffffff;
}

.dark {
  background: #1a1a1a;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.dark a {
  color: #ccc;
  text-decoration: underline;
  margin-top: 1rem;
}

.image-card img {
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  max-height: 500px;
  object-fit: cover;
  display: block;
  border-radius: 4px;
  /* No CSS filters — grayscale/blur force expensive repaints on resize */
  transition: transform 0.22s ease;
}

.image-card:hover img {
  transform: scale(1.02);
}

.card-info {
  text-align: left;
  padding: 20px 10px 10px;
}

.card-info h3 {
  color: #fff;
  font-size: clamp(0.75rem, 2.5vw, 1.1rem);
  margin-bottom: 5px;
}

.card-info p {
  margin: 3px 0;
}

.card-info p,
.card-info .description,
.card-info .location,
.card-info .year {
  font-size: clamp(0.65rem, 2.5vw, 1rem);
  color: #ffffff;
  margin-bottom: 4px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  white-space: normal;
}

.card-info .description {
  color: #ffffff;
  background: transparent;
}

/* Mobile / touch layouts: always visible (no entrance anim) */
.card.image-card {
  opacity: 1;
}

/*
 * Desktop-only entrance: opacity + short translateY (no blur / 3D flip).
 * JS (pastProjectsAos) toggles .aos-animate via IntersectionObserver.
 */
@media (min-width: 1025px) {
  @media (prefers-reduced-motion: no-preference) {
    .card.image-card[data-aos] {
      opacity: 0;
      transform: translate3d(0, 18px, 0);
      transition:
        opacity 0.4s ease var(--pp-aos-delay, 0ms),
        transform 0.4s ease var(--pp-aos-delay, 0ms);
    }

    .card.image-card[data-aos].aos-animate {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
}

</style>
<body>
  <main class="grid">
    <a href="src/pages/card.html?id=1" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_1.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>General Planning Adjustment for Lao Cai City</h3>
        <p class="location">Lao Cai City</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:28,162.64 hectares, projected to 2045</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=2" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_2.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>General Construction Planning at 1/500 Scale</h3>
        <p class="location">Hop Thanh Commune, Lao Cai City</p>
        <p class="year">Completion Year: 2025</p>
        <p class="description">Total Area:2,693.3 hectares</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=3" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_3.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>Zoning Plan 6B (Nguyen Ai Quoc Ward)</h3>
        <p class="location">THai Duong City</p>
        <p class="year">Completion Year: 2025</p>
        <p class="description">Total Area:1,159 hectares</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=4" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_4.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>Zoning Plan for Coc San Construction</h3>
        <p class="location">Lao Cai City</p>
        <p class="year">Completion Year: 2025</p>
        <p class="description">Total Area:1,173.1 hectares</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=5" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_5.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>General Urban Planning for Dong Yen Town, Bac Giang District</h3>
        <p class="location">Dong Yen Commune, Ha Giang City</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:4,407.9 hectares, planned to 2035, oriented to 2050</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=6" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_6.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>General Urban Planning for Na Chi Town, Xin Man District</h3>
        <p class="location">Na Chi Commune, Xin Man District, Ha Giang City</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:8,038.7 hectares, planned to 2035, oriented to 2050</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=7" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_7.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>General Urban Planning for Tan Bac Town, Quang Binh District</h3>
        <p class="location">Tan Bac Commune, Quang Binh District, Ha Giang</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:6,297.1 hectares, planned to 2035, oriented to 2050</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=8" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_8.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>Zoning Plan 5A (Nam Dong Ward Area) – Hai Duong City</h3>
        <p class="location">Hai Duong City, Hai Duong Province</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:332.16 hectares, Scale 1/2000, Completion Year: 2025</p>
      </div>
    </a>

    <a href="src/pages/card.html?id=9" class="card image-card" data-aos="fade-up">
      <div class="image-wrapper">
      <img src="public/pastProjects/pp_9.jpg" loading="lazy">
      </div>
      <div class="card-info">
        <h3>Detailed Planning for Park City Xuan An Eco-Urban Area</h3>
        <p class="location">Xuan An Town, Nghi Xuan District, Ha Tinh Province</p>
        <p class="year">Completion Year: 2024</p>
        <p class="description">Total Area:27.7 hectares, Scale 1/500</p>
      </div>
    </a>
  </main>

</body>

</html>`;export{n as default};
