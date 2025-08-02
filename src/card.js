const cards = [
  {
    id: "1",
    title: "📍 Master Plan Adjustment for Lao Cai City",
    description: "Total area: 28,162.64 ha. Scheduled for completion by 2045. The plan focuses on optimizing land use, upgrading infrastructure, guiding population growth, and reinforcing the city's role as a regional economic and transportation hub.",
    images: [
      "public/pastProjects/project_1/pp_1a.png", 
      "public/pastProjects/project_1/pp_1b.png",
    ],
    year: "2024",
    location: "Lao Cai City"
  },
  {
    id: "2",
    title: "📍 Detailed Construction Plan at 1/500 Scale",
    description: "Total area: 2,693.3 ha. This 1/500 scale detailed plan for Hop Thanh Commune, Lao Cai City, lays the groundwork for future urban development. It includes zoning, infrastructure upgrades, and sustainable growth strategies aimed at 2025 targets.",
    images: [
      "public/pastProjects/project_2/pp_2a.png",  
      "public/pastProjects/project_2/pp_2b.png", 
    ],
    year: "2025",
    location: "Hop Thanh Commune, Lao Cai City"
  },
  {
    id: "3",
    title: "📍 Subdivision Planning Area 6B (Nguyen Ai Quoc Ward)",
    description: "Subdivision 6B marks a strategic step in Hai Duong’s urban restructuring. Spanning over 1,100 ha, the plan focuses on integrated infrastructure, expanding green and urban spaces, and creating modern functional zones. This project is set to redefine the city’s landscape beyond 2025.",
    images: [
      "public/pastProjects/project_3/pp_3a.jpg",  
      "public/pastProjects/project_3/pp_3b.jpg", 
      "public/pastProjects/project_3/pp_3c.jpg",   
    ],
    year: "2025",
    location: "Hai Duong City"
  },
  {
    id: "4",
    title: "📍 Subdivision Development Plan for Coc San",
    description: "A key part of Lao Cai City’s urban expansion strategy, the Coc San development integrates advanced infrastructure with natural landscapes to form a balanced ecological city. It lays the foundation for high-quality residential zones, commercial areas, and public facilities connected to regional transport corridors.",
    images: [
      "public/pastProjects/project_4/pp_4a.png",  
      "public/pastProjects/project_4/pp_4b.png", 
    ],
    year: "2025",
    location: "Lao Cai City"
  },
  {
    id: "5",
    title: "📍 General Planning for Dong Yen Urban Area, Bac Giang District",
    description: "Dong Yen is an ambitious master plan covering nearly 4,500 ha with a long-term vision to 2050. It aims to build a smart satellite city that integrates living, working, and recreational spaces. Strategically designed, Dong Yen is poised to become a northern hub for sustainable, modern urban models.",
    images: [
      "public/pastProjects/project_5/pp_5a.png",  
      "public/pastProjects/project_5/pp_5b.png", 
    ],
    year: "2025",
    location: "Dong Yen Commune, Ha Giang City"
  },
  {
    id: "6",
    title: "📍 General Planning for Na Chi Urban Area, Xin Man District",
    description: "One of the largest plans in the northern mountainous region, the Na Chi urban project spans over 8,000 ha. It’s a bold move to elevate Xin Man’s infrastructure, services, and investment appeal. The plan balances highland cultural preservation with smart infrastructure for long-term sustainability.",
    images: [
      "public/pastProjects/project_6/pp_6a.png",  
      "public/pastProjects/project_6/pp_6b.png", 
    ],
    year: "2025",
    location: "Na Chi Commune, Xin Man District, Ha Giang"
  },
  {
    id: "7",
    title: "📍 General Planning for Tan Bac Urban Area, Quang Binh District",
    description: "Tan Bac is gradually emerging as a new regional center in Quang Binh. This 6,000+ ha plan emphasizes modern living spaces, green tech ecosystems, and integrated public amenities. With a vision through 2050, Tan Bac is set to become a benchmark for culturally grounded but future-ready highland urbanization.",
    images: [
      "public/pastProjects/project_7/pp_7a.png",  
      "public/pastProjects/project_7/pp_7b.png", 
    ],
    year: "2025",
    location: "Tan Bac Commune, Quang Binh, Ha Giang"
  },
  {
    id: "8",
    title: "📍 Subdivision Plan 5A (Nam Dong Ward), Hai Duong City",
    description: "Subdivision 5A is a cornerstone of Hai Duong's sustainable development strategy. Spanning over 330 ha, it focuses on modern urban spatial planning, enhanced connectivity, and a flexible urban ecosystem. The project aims to elevate living quality and boost Nam Dong's regional appeal.",
    images: [
      "public/pastProjects/project_8/pp_8a.png",  
      "public/pastProjects/project_8/pp_8b.png", 
    ],
    year: "2025",
    location: "Hai Duong City, Hai Duong Province"
  },
  {
    id: "9",
    title: "📍 Detailed Plan for Park City Xuan An Eco-Urban Area",
    description: "Park City Xuan An is a premium eco-urban area designed with elegance across 28 ha. With its 'green living, healthy living' vision, it blends lush green spaces, modern service facilities, and smart infrastructure. It’s a rising star in Ha Tinh’s real estate scene, setting new standards for upscale, sustainable urban living in central Vietnam.",
    images: [
      "public/pastProjects/project_9/pp_9a.png",  
      "public/pastProjects/project_9/pp_9b.png", 
    ],
    year: "2025",
    location: "Xuan An Town, Nghi Xuan District, Ha Tinh Province"
  },
];


if (!location.pathname.endsWith('/card.html')) {
// Fetch and render card.html for each card
cards.forEach(card => {
  fetch('../card.html')
    .then(response => response.text())
    .then(template => {
      // Create image HTML from array
      const imagesHTML = card.images
        .map(src => `<img src="${getAbsolutePath(src)}" alt="${card.title}" style="width:100%; margin-bottom: 10px;">`)
        .join('');
        
      // Helper to normalize path
      function getAbsolutePath(src) {
        // Remove leading slash if there is one, then prefix with root "/"
        return '/' + src.replace(/^\/+/, '');
      }
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

