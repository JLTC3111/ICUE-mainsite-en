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
      name: `<span class="intro-people">Long Đỗ - IT manager</span> A dedicated Project Officer with a Master’s degree in Project Management from the University of Salford, UK, along with certifications in CCNA and Cybersecurity. Brings over 5 years of broad-based experience across banking, retail, (smart) contract management, and finance, with a proven ability to manage complex projects and deliver results efficiently. Combines strong technical skills with hands-on execution, ensuring smooth coordination between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding, and gaming. Experienced with designing and creative problem solving. 🔧💬
      https://dobaolongicueltd.netlify.app/`,
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

function loadPage(page) {
  const content = document.getElementById('content');
  fetch(`${page}.html`)
    .then(response => response.text())
    .then(data => {
      content.innerHTML = data;

      // Highlight nav
      document.querySelectorAll('.drawer-menu a').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
      });

      // Wait until DOM has parsed injected content
      requestAnimationFrame(() => {
        if (page === 'meetOurExperts') {
          attachProfileEvents();
        } else if (page === 'home') {
          initHomeTextSlider(); // Initialize the text slider

          // Log the dots to ensure they are accessible
          const dots = document.querySelectorAll("#sliderDots .dot");
          console.log(dots);  // Log the dots to the console

          if (dots.length > 0) {
            // Attach dot event listeners
            dots.forEach(dot => {
              dot.addEventListener("click", () => {
                const dotIndex = parseInt(dot.dataset.index);
                updateText(dotIndex); // Update the text based on clicked dot
                restartInterval(); // Restart interval to reset the text slider timing
              });
            });
          } else {
            console.log("No dots found");
          }
        }
      });
    });
}




function initHomeTextSlider() {
  const messages = [
    "⏳ 20 Years of Urban Excellence  With two decades of experience, our team of 10 dedicated professionals is passionate about urban planning, construction, and climate change. We design cities that thrive in a fast-evolving world — balancing function, resilience, and community needs.",
    
    "🤝 Built on Unity, Driven by Value We believe in giving back, practicing unity, working hard, and constantly striving for self-improvement. These core values shape our approach and inspire our partnerships with local experts, government agencies, and legal specialists.",

    "💡 Smart Cities, Smarter Solutions.From smart city integration to climate adaptation strategies, we use technology and data-driven insights to enhance urban efficiency, connectivity, and sustainability — building cities that are ready for tomorrow.",

    "🏆 Our Greatest Achievement. We led the Đà Nẵng city-wide planning initiative for both Type 1 and Type 2 cities — a transformative project that continues to impact daily life for thousands. It reflects our dedication to big-picture strategy and real-world results.",

    "🌱 Shaping Cities, Improving Lives. Every solution we deliver is rooted in one mission: creating better urban futures. From the ground up, we help shape spaces that are inclusive, sustainable, and human-centered.",

    "💥 Creating timeless experiences."
  ];

  const textElement = document.querySelector("#homeSliderText .highlight-text");
  const dots = document.querySelectorAll("#sliderDots .dot");

  // ✅ Prevent running if DOM isn't ready yet
  if (!textElement || dots.length === 0) {
    console.warn("Slider elements not found. Skipping slider init.");
    return;
  }

  let index = 0;
  let intervalId;

  function updateText(newIndex) {
    index = newIndex;
    const textElement = document.getElementById("homeSliderText").querySelector(".highlight-text");
    
    // Log to see if the element is selected properly
    console.log("Text Element:", textElement);
    
    if (!textElement) {
      console.error("highlight-text element not found!");
      return;  // Exit the function if the element is not found
    }
  
    textElement.classList.remove("fade-In");
    void textElement.offsetWidth; // Reflow
    textElement.textContent = messages[index];
    textElement.classList.add("fade-In");
  
    // Update the dots
    dots.forEach(dot => dot.classList.remove("active"));
    dots[index]?.classList.add("active");
  }
  

  function nextText() {
    index = (index + 1) % messages.length;
    updateText(index);
  }

  function restartInterval() {
    clearInterval(intervalId);
    intervalId = setInterval(nextText, 6000);
  }

  updateText(index);
  if (window.homeSliderIntervalId) {
    clearInterval(window.homeSliderIntervalId);
  }
  
  // Start a fresh interval and store it globally
  window.homeSliderIntervalId = setInterval(nextText, 4000);

  dots.forEach(dot => {
    const newDot = dot.cloneNode(true); // clone the dot element
    dot.parentNode.replaceChild(newDot, dot); // replace it to remove old listeners
  
    newDot.addEventListener("click", () => {
      const dotIndex = parseInt(newDot.dataset.index);
      updateText(dotIndex);
      restartInterval();
    });
  });

  console.log("✅ Slider initialized");
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

  // Start fade out
  menuIcon.classList.remove('fade-in');
  menuIcon.classList.add('fade-out');

  // Wait for fade-out to finish, then swap the icon and fade in
  setTimeout(() => {
    menuIcon.src = isOpen ? '/public/menu-icon.png' : '/public/close-icon.png';
    menuIcon.classList.remove('fade-out');
    menuIcon.classList.add('fade-in');
  }, 200); // Timing should match CSS transition duration

  // Toggle menu state
  if (isOpen) {
    drawerMenu.classList.remove('open');
    removeOverlayListener();
  } else {
    drawerMenu.classList.add('open');
    addOverlayListener();
  }
}

function closeDrawerMenu() {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon');

  drawerMenu.classList.remove('open');
  removeOverlayListener();

  // Animate icon switch
  menuIcon.classList.remove('fade-in');
  menuIcon.classList.add('fade-out');

  setTimeout(() => {
    menuIcon.src = '/public/menu-icon.png';
    menuIcon.classList.remove('fade-out');
    menuIcon.classList.add('fade-in');
  }, 200);
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

function toggleSubmenu(e) {
  e.preventDefault(); // prevent page from jumping
  const submenu = document.getElementById('ourTeamSubmenu');
  submenu.classList.toggle('open');
}

document.addEventListener('DOMContentLoaded', () => {
  const submenuTrigger = document.querySelector('.has-submenu');
  const submenu = document.querySelector('.submenu');

  submenuTrigger.addEventListener('click', (e) => {
    e.preventDefault();

    if (submenu.classList.contains('open')) {
      // Trigger slide-up animation
      submenu.classList.remove('open');
      submenu.classList.add('closing');

      // Wait for animation to finish, then clean up
      setTimeout(() => {
        submenu.classList.remove('closing');
      }, 400); // match the CSS transition duration
    } else {
      submenu.classList.add('open');
    }
  });
});

// Auto-highlight on initial load
window.onload = () => {
  loadPage('home');
  highlightActiveLink('home');
};