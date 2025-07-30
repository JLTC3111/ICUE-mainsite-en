const cards = [
  {
    id: "1",
    title: "Card One",
    description: "This is the first card.",
    image: "images/card1.jpg",
    year: "2023",
    location: "New York"
  },
  {
    id: "2",
    title: "Card Two",
    description: "Second card's details here.",
    image: "images/card2.jpg",
    year: "2024",
    location: "Tokyo"
  },
  // Add more cards...
];

// Fetch and render card.html for each card
cards.forEach(card => {
  fetch('../card.html')
    .then(response => response.text())
    .then(template => {
      const cardHTML = template
        .replace(/{{title}}/g, card.title)
        .replace(/{{description}}/g, card.description)
        .replace(/{{image}}/g, card.image)
        .replace(/{{year}}/g, card.year)
        .replace(/{{location}}/g, card.location);

      document.getElementById('card-container').innerHTML += cardHTML;
    });
});
