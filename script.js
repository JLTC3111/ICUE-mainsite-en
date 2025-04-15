function attachProfileEvents() {
  const profileData = [
    {
      name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span> An expert in urban development and construction management, she holds a PhD in the field and currently serves as Director of the Institute for Economic, Urban, and Construction Research under the Vietnam Construction Association. Her extensive career includes serving as Deputy Director at both the Institute for Urban and Construction Economics Research (2013–2018) and the Department of Urban Development at the Ministry of Construction (2008–2013). Her work spans legal frameworks, urban planning, and architectural design, with a strong focus on sustainable, well-governed cities. She has led major initiatives in green urban development, climate resilience, and policy advisory for national and regional planning, supported by international partners like the World Bank and ADB.
                    <i class="fa-solid fa-layer-group"></i>`,
      img: "public/nguyenhonghanh.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Hoàng Thu Hà</span> Experienced accounting professional with over 10 years in financial management, reporting, and compliance. Holds a Bachelor’s degree in Accounting and has successfully led accounting departments, managed financial settlements, conducted audits, and prepared accurate financial statements. Skilled in monitoring financial transactions, ensuring legal and regulatory compliance, and supporting project-based financial operations. Proficient in accounting software and known for a strong work ethic, adaptability, and attention to detail. Brings strong leadership and organizational skills, with a focus on delivering accurate financial insights.`,
      img: "public/hoangthuha.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Lan Anh</span> Urban planning and development expert with over 20 years of experience in strategic urban design, policy-making, and sustainable development. Holds a PhD and Master’s from The University of Tokyo, with a strong background in climate change adaptation, urban classification laws, and national development strategies. Former Deputy General Director at Vietnam’s Urban Development Agency, leading major programs for urban resilience and planning to 2050. A published researcher, educator, and active member of key professional associations. Skilled in coordinating large-scale projects, legal frameworks, and cross-sector collaboration. Fluent in multiple languages and passionate about shaping livable, sustainable urban futures.`,
      img: "public/tranthilananh.jpg"
    },
    {
      name: `<span class="intro-people">Mr. Trần Quốc Toản </span> Urban Planning and Climate Change Expert with over 25 years of experience in sustainable infrastructure, transport planning, and climate resilience. Holds a degree in Bridge and Tunnel Engineering and has served in key leadership roles within Vietnam’s Ministry of Transport and civil engineering associations. Skilled in policy advisory, smart city planning, and green growth strategy development. Led major national projects focused on urban mobility, environmental sustainability, and legal reform. A respected lecturer and expert trainer for organizations such as the World Bank and ADB, known for his deep expertise, strategic thinking, and commitment to building climate-resilient urban futures.`,
      img: "public/tranquoctoan.jpg"
    },
    {
      name: `<span class="intro-people">Long Đỗ - IT manager</span> A dedicated Project Officer with a Master’s degree in Project Management from the University of Salford, UK, along with certifications in CCNA and Cybersecurity. Brings over 5 years of broad-based experience across banking, retail, contract management, and finance, with a proven ability to manage complex projects and deliver results efficiently. Combines strong technical skills with hands-on execution, ensuring smooth coordination between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding, and gaming. Experienced with designing and creative problem solving. 🔧💬`,
      img: "public/longdo.jpg"
    }
  ];

  let currentIndex = 0;
  const textBox = document.getElementById('profile-text');
  const photo = document.getElementById('profile-photo');

  function updateProfile(index) {
    textBox.classList.remove('fade-In');
    photo.classList.remove('fade-In');
    void textBox.offsetWidth;
    void photo.offsetWidth;
    textBox.innerHTML = `<div>${profileData[index].name}</div>`;
    photo.src = profileData[index].img;
    textBox.classList.add('fade-In');
    photo.classList.add('fade-In');
  }

  document.getElementById('next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData.length;
    updateProfile(currentIndex);
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData.length) % profileData.length;
    updateProfile(currentIndex);
  });

  // Start first profile
  updateProfile(0);
}

// ✅ Only one definition of loadPage
function loadPage(page) {
  const content = document.getElementById('content');
  fetch(`${page}.html`)
    .then(response => response.text())
    .then(data => {
      content.innerHTML = data;
      // 🔁 Highlight the current page link
      const drawerLinks = document.querySelectorAll('.drawer-menu a');
        drawerLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
        link.classList.add('active');}});
      // Special behavior only for this page
      if (page === 'meetOurExperts') {
        attachProfileEvents();
      }
    })
    .catch(error => {
      console.error('Error loading page:', error);
      content.innerHTML = '<h1>Page not found</h1>';
    });
}

// 👇 Auto-load home by default
window.onload = () => {
  loadPage('home');
};

let currentPage = 'home'; // default

function toggleDrawerMenu() {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon');

  const isOpen = drawerMenu.classList.contains('open');

  if (isOpen) {
    drawerMenu.classList.remove('open');
    menuIcon.src = '/public/menu-icon.png'; // back to menu
    removeOverlayListener();
  } else {
    drawerMenu.classList.add('open');
    menuIcon.src = '/public/close-icon.png'; // switch to close icon
    addOverlayListener();
  }
}

function closeDrawerMenu() {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon');
  drawerMenu.classList.remove('open');
  menuIcon.src = '/public/menu-icon.png';
  removeOverlayListener();
}

function handleOutsideClick(e) {
  const drawer = document.getElementById('drawerMenu');
  const toggle = document.querySelector('.menu-toggle');

  if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
    closeDrawerMenu();
  }
}

function handleEscKey(e) {
  if (e.key === 'Escape') {
    closeDrawerMenu();
  }
}

function addOverlayListener() {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscKey);
}

function removeOverlayListener() {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscKey);
}

// Navigation handler + page loader
function navigateToPage(page) {
  currentPage = page;
  loadPage(page); // Your existing page loader
  highlightActiveLink(page);
  closeDrawerMenu();
}

// Highlight active link
function highlightActiveLink(page) {
  const links = document.querySelectorAll('#drawerMenu a');
  links.forEach(link => {
    link.classList.remove('active');
    if (link.textContent.toLowerCase().includes(page.toLowerCase())) {
      link.classList.add('active');
    }
  });
}

// Auto-highlight on initial load
window.onload = () => {
  loadPage('home');
  highlightActiveLink('home');
};