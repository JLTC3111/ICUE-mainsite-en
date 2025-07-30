const cards = [
  {
    id: "1",
    title: "General Planning Adjustment for Lao Cai City",
    description: "Total Area - 28,162.64 hectares, projected completion year is 2045. The plan focuses on optimizing land use, improving infrastructure, guiding population growth, and enhancing the city’s role as a regional economic and transportation hub.",
    images: [
      "public/pastprojects/project_1/pp_1a.png", 
      "public/pastprojects/project_1/pp_1b.png",
    ],
    year: "2024",
    location: "Lao Cai City"
  },
  {
    id: "2",
    title: "General Construction Planning at 1/500 Scale",
    description: "Total Area:2,693.3 hectares. A detailed 1/500 scale construction plan for Hop Thanh Commune in Lao Cai City, covering 2,693.3 hectares. The plan sets the groundwork for future urban development, zoning, and infrastructure alignment to support sustainable growth by 2025.",
    images: [
      "public/pastprojects/project_2/pp_2a.png",  
      "public/pastprojects/project_2/pp_2b.png", 
    ],
    year: "2025",
    location: "Hop Thanh Commune, Lao Cai City"
  },
  // Add more cards...
];

if (!location.pathname.endsWith('/card.html')) {
// Fetch and render card.html for each card
cards.forEach(card => {
  fetch('../card.html')
    .then(response => response.text())
    .then(template => {
      // Create image HTML from array
      const imagesHTML = card.images
        .map(src => `<img src="/${src.replace(/^\/?/, '')}" alt="${card.title}" style="width:100%; margin-bottom: 10px;">`)
        .join('');
      const cardHTML = template
        .replace(/{{title}}/g, card.title)
        .replace(/{{description}}/g, card.description)
        .replace(/{{images}}/g, card.images)
        .replace(/{{year}}/g, card.year)
        .replace(/{{location}}/g, card.location);
      document.getElementById('card-container').innerHTML += cardHTML;
    });
});
}

