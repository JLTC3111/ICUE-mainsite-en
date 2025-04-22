function attachProfileEvents() {
  const profileData = [
    {
      name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span> An expert in urban development and construction management, she holds a PhD in the field and currently serves as Director of the Institute for Economic, Urban, and Construction Research under the Vietnam Construction Association. Her extensive career includes serving as Deputy Director at both the Institute for Urban and Construction Economics Research (2013–2018) and the Department of Urban Development at the Ministry of Construction (2008–2013). Her work spans legal frameworks, urban planning, and architectural design, with a strong focus on sustainable, well-governed cities. She has led major initiatives in green urban development, climate resilience, and policy advisory for national and regional planning, supported by international partners like the World Bank and ADB.
                    <i class="fa-solid fa-layer-group"></i>`,
      img: "public/profilePhotos/nguyenhonghanh.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Hoàng Thu Hà</span> Experienced accounting professional with over 10 years in financial management, reporting, and compliance. Holds a Bachelor's degree in Accounting and has successfully led accounting departments, managed financial settlements, conducted audits, and prepared accurate financial statements. Skilled in monitoring financial transactions, ensuring legal and regulatory compliance, and supporting project-based financial operations. Proficient in accounting software and known for a strong work ethic, adaptability, and attention to detail. Brings strong leadership and organizational skills, with a focus on delivering accurate financial insights.`,
      img: "public/profilePhotos/hoangthuha.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Lan Anh</span> Urban planning and development expert with over 20 years of experience in strategic urban design, policy-making, and sustainable development. Holds a PhD and Master's from The University of Tokyo, with a strong background in climate change adaptation, urban classification laws, and national development strategies. Former Deputy General Director at Vietnam's Urban Development Agency, leading major programs for urban resilience and planning to 2050. A published researcher, educator, and active member of key professional associations. Skilled in coordinating large-scale projects, legal frameworks, and cross-sector collaboration. Fluent in multiple languages and passionate about shaping livable, sustainable urban futures.`,
      img: "public/profilePhotos/tranthilananh.jpg"
    },
    {
      name: `<span class="intro-people">Mr. Trần Quốc Toản </span> Urban Planning and Climate Change Expert with over 25 years of experience in sustainable infrastructure, transport planning, and climate resilience. Holds a degree in Bridge and Tunnel Engineering and has served in key leadership roles within Vietnam's Ministry of Transport and civil engineering associations. Skilled in policy advisory, smart city planning, and green growth strategy development. Led major national projects focused on urban mobility, environmental sustainability, and legal reform. A respected lecturer and expert trainer for organizations such as the World Bank and ADB, known for his deep expertise, strategic thinking, and commitment to building climate-resilient urban futures.`,
      img: "public/profilePhotos/tranquoctoan.jpg"
    },
    {
      name: `<span class="intro-people">Long Đỗ - IT manager</span> A dedicated Project Officer with a Master's degree in Project Management from the University of Salford, UK, along with certifications in CCNA and Cybersecurity. Brings over 5 years of broad-based experience across banking, retail, (smart) contract management, and finance, with a proven ability to manage complex projects and deliver results efficiently. Combines strong technical skills with hands-on execution, ensuring smooth coordination between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding, and gaming. Experienced with designing and creative problem solving. 🔧💬
      https://dobaolongicueltd.netlify.app/`,
      img: "public/profilePhotos/longdo.jpg"
    }
  ];

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  const MIN_SWIPE_DISTANCE = 15;
  
  const textBox = document.getElementById('profile-text');
  const photo = document.getElementById('profile-photo');
  const container = document.querySelector('.image-container');

  function updateProfile(index, direction = 'right') {
    if (!textBox || !photo) return;

    // Add exit animation
    textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');

    setTimeout(() => {
      // Update content
      textBox.innerHTML = `<div>${profileData[index].name}</div>`;
      photo.src = profileData[index].img;

      // Remove exit animation and add enter animation
      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
      textBox.classList.add(direction === 'right' ? 'slide-enter-right' : 'slide-enter-left');
      photo.classList.add(direction === 'right' ? 'slide-enter-right' : 'slide-enter-left');

      // Remove enter animation after transition
      setTimeout(() => {
        textBox.classList.remove('slide-enter-right', 'slide-enter-left');
        photo.classList.remove('slide-enter-right', 'slide-enter-left');
      }, 300);
    }, 300);
  }

  document.getElementById('next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData.length;
    updateProfile(currentIndex, 'right');
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData.length) % profileData.length;
    updateProfile(currentIndex, 'left');
  });

  // Add touch support for mobile
  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
        if (swipeDistance > 0) {
          document.getElementById('prev-btn')?.click();
        } else {
          document.getElementById('next-btn')?.click();
        }
      }
    });
  }

  // Start first profile
  updateProfile(0);
}

function loadPage(page) {
  const content = document.getElementById('content');

  fetch(`${page}.html`)
    .then(response => response.text())
    .then(data => {
      content.innerHTML = data;

      // 🔸 Highlight active nav link
      document.querySelectorAll('.drawer-menu a').forEach(link => {
        link.classList.toggle('active', link.dataset.page === page);
      });

      // 🔸 Wait for content to be in DOM
      requestAnimationFrame(() => {
        if (page === 'meetOurExperts') {
          attachProfileEvents();
        }
        if (page === 'coreTeam') {
          attachProfileEvents_coreTeam();
        }
        if (page === 'Home') {
          initHomeTextSlider();         // Start slider
          attachHomeButtonEvents();     // Reactivate buttons
        }
      });
    });
}

function attachHomeButtonEvents() {
  document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Button clicked:', button.textContent);
      // Add your button logic here
    });
  });
}

function initHomeTextSlider() {
  // Clean up existing event listeners and intervals
  const sliderContainer = document.querySelector("#homeTextSlider");
  const dotsContainer = document.querySelector("#sliderDots");
  
  // Remove existing event listeners
  if (window.homeSliderIntervalId) {
    clearInterval(window.homeSliderIntervalId);
  }
  
  // Remove existing event listeners from dots
  if (dotsContainer) {
    const newDotsContainer = dotsContainer.cloneNode(true);
    dotsContainer.parentNode.replaceChild(newDotsContainer, dotsContainer);
  }

  const messages = [
    "⏳ 20 Years of Urban Excellence. With two decades of experience, our team of 10 dedicated professionals is passionate about urban planning, construction, and climate change. We design cities that thrive in a fast-evolving world — balancing function, resilience, and community needs.",
    "🤝 Built on Unity, Driven by Value We believe in giving back, practicing unity, working hard, and constantly striving for self-improvement. These core values shape our approach and inspire our partnerships with local experts, government agencies, and legal specialists.",
    "💡 Smart Cities, Smarter Solutions. From smart city integration to climate adaptation strategies, we use technology and data-driven insights to enhance urban efficiency, connectivity, and sustainability — building cities that are ready for tomorrow.",
    "🏆 Our Greatest Achievement. We led the Đà Nẵng city-wide planning initiative for both Type 1 and Type 2 cities — a transformative project that continues to impact daily life for thousands. It reflects our dedication to big-picture strategy and real-world results.",
    "🌱 Shaping Cities, Improving Lives. Every solution we deliver is rooted in one mission: creating better urban futures. From the ground up, we help shape spaces that are inclusive, sustainable, and human-centered.",
    "💥 Creating timeless experiences."
  ];

  const textElement = document.querySelector("#homeSliderText .highlight-text");
  const dots = document.querySelectorAll("#sliderDots .dot");

  if (!textElement || dots.length === 0 || !sliderContainer) {
    console.warn("Slider elements not found. Skipping slider init.");
    return;
  }

  let index = 0;
  let isPaused = true;

  function updateText(newIndex) {
    index = newIndex;
    const textElement = document.getElementById("homeSliderText").querySelector(".highlight-text");
    
    if (!textElement) {
      console.error("highlight-text element not found!");
      return;
    }
  
    textElement.classList.add("transitioning");
    textElement.classList.remove("fade-In");
    
    setTimeout(() => {
      textElement.textContent = messages[index];
      textElement.classList.remove("transitioning");
      textElement.classList.add("fade-In");
      
      // Update dot states
      dots.forEach((dot, i) => {
        if (i === index) {
          dot.classList.add("active");
        } else {
          dot.classList.remove("active");
        }
      });
    }, 300);
  }

  function nextText() {
    if (!isPaused) {
      index = (index + 1) % messages.length;
      updateText(index);
    }
  }

  function prevText() {
    if (!isPaused) {
      index = (index - 1 + messages.length) % messages.length;
      updateText(index);
    }
  }

  function restartInterval() {
    clearInterval(window.homeSliderIntervalId);
    if (!isPaused) {
      window.homeSliderIntervalId = setInterval(nextText, 4000);
    }
  }

  // Initialize the slider
  updateText(index);
  window.homeSliderIntervalId = setInterval(nextText, 4000);

  // Add event listeners to dots
  dots.forEach((dot, i) => {
    // Add hover effect
    dot.style.transition = "transform 0.2s ease";
    
    dot.addEventListener("mouseenter", () => {
      dot.style.transform = "scale(1.25)";
    });
    
    dot.addEventListener("mouseleave", () => {
      dot.style.transform = "scale(1)";
    });

    // Click handler
    dot.addEventListener("click", () => {
      isPaused = true;
      clearInterval(window.homeSliderIntervalId);
      updateText(i);
      
      // Add resume functionality after 5 seconds
      setTimeout(() => {
        isPaused = false;
        restartInterval();
      }, 15000);
    });
  });

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevText();
      restartInterval();
    } else if (e.key === "ArrowRight") {
      nextText();
      restartInterval();
    }
  });

  // Pause on hover
  sliderContainer.addEventListener("mouseenter", () => {
    clearInterval(window.homeSliderIntervalId);
  });

  sliderContainer.addEventListener("mouseleave", () => {
    if (!isPaused) {
      window.homeSliderIntervalId = setInterval(nextText, 4000);
    }
  });

  console.log("✅ Slider initialized with enhanced features");
}

// 👇 Auto-load Home by default
window.onload = () => {
  loadPage('Home');
};

let currentPage = 'Home'; // default

function toggleDrawerMenu() {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon');
  const isOpen = drawerMenu.classList.contains('open');

  // Start fade out
  menuIcon.classList.remove('fade-in');
  menuIcon.classList.add('fade-out');

  // Wait for fade-out to finish, then swap the icon and fade in
  setTimeout(() => {
    menuIcon.src = isOpen ? '/public/logoIcons/menu-icon.png' : '/public/logoIcons/close-icon.png';
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
    menuIcon.src = '/public/logoIcons/menu-icon.png';
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
  loadPage('Home');
  highlightActiveLink('Home');
};

function createBalloons() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeead', '#d4a5a5', '#9b5de5'];
    const container = document.body;
    
    // Create 15 balloons
    for (let i = 0; i < 15; i++) {
        const balloon = document.createElement('div');
        balloon.className = 'balloon';
        balloon.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        balloon.style.left = `${Math.random() * 80 + 10}%`; // Random position between 10% and 90%
        balloon.style.animationDelay = `${i * 0.2}s`; // Stagger the animations
        
        container.appendChild(balloon);
        
        // Remove balloon after animation completes
        balloon.addEventListener('animationend', () => {
            balloon.remove();
        });
    }
}

// Initialize balloon button when the page loads
document.addEventListener('DOMContentLoaded', function() {
    const balloonButton = document.getElementById('balloonButton');
    if (balloonButton) {
        balloonButton.addEventListener('click', function() {
            createBalloons();
        });
    }
});

function attachProfileEvents_coreTeam() {
  const profileData_coreTeam = [
    {name: '<span class="intro-core">Core Team</span>Our team consists of 5-6 dedicated professionals who manage day-to-day operations and essential tasks, ensuring everything runs smoothly. With expertise in project management, technical development, customer relations, marketing, and finance, each member plays a crucial role in driving the organization’s success. Through strong collaboration and open communication, they work together to tackle challenges and seize opportunities. From client interactions to internal processes, the team’s collective efforts ensure top-notch service and operational efficiency. Their commitment and hard work are vital to the continued growth and success of our organization.',
      img: "public/profilePhotos/coreTeam.png"
    },
    {name: 
      `<span class="intro-core">Nguyễn Quỳnh Ly </span>Possesses a strong academic foundation in urban planning, sustainable urban development, infrastructure management, and public space design. Contributed to various research and technical support projects focused on public spaces, community development, and urban development programs. Demonstrates excellent teamwork, clear organizational skills, and a strong sense of responsibility. Proactive, eager to learn, and committed to furthering professional expertise through participation in urban projects that prioritize sustainability and environmentally friendly solutions.`, 
      img: "public/profilePhotos/lyly.png"
    },
    {
      name: `<span class="intro-core">Đinh Tùng Dương</span> My name is Đinh Tùng Dương, a graduate of Urban Management from Hanoi Architectural University. I was honored to be recognized as the Valedictorian of Hanoi in 2023. Over the past two years, I have gained valuable experience in the field of urban development, contributing to projects related to spatial planning, landscape improvement, and sustainable urban living. I possess strong analytical and organizational skills, along with proficiency in both office and technical software tools. I am committed to continuous professional growth and aspire to contribute meaningfully within a reputable and forward-thinking organization. `,
      img: "public/profilePhotos/duong.png"
    },
    {
      name: `<span class="intro-core">Nguyễn Thanh Tâm</span> ákfbahvsbvbsvhbjakejkvbvjbjvej bjefbjkegbkekj fbkjebjkfbjk fbjkbj kjb q bjkfejbfbefbkkbafbjebjkbejkfbb jbkfbkjefbkj j bjfebkjfbkj kjbmanqpnpifh -pìhnie bjbgfbjla jbbg obi niogint33hi pjnpfgnoi3b nio3ipp nf pihih13i inii ni nfnie no. <i class="fa-solid fa-layer-group"></i>`,  
      img: "public/profilePhotos/tam.png"
    },
    {
      name: `<span class="intro-core">Trịnh Thị Tình </span> Graduated from Business Administration at Hanoi College of Tourism. In addition to being in charge of office administration, I have participated in and supported scientific research topics and projects. I am a dynamic, responsible person and always ready to learn. In my work, with meticulousness and responsibility, I promote the spirit of teamwork and demonstrate the accumulated experience. I wish to develop myself in a professional environment and contribute positive values ​​to the organization.<i class="fa-solid fa-layer-group"></i>`,
      img: "public/profilePhotos/tinh.png"
    },
    {
      name: `<span class="intro-core">Nguyễn Thị Ly </span>Tôi là Nguyễn Quỳnh Ly, tôi tốt nghiệp trường Đại học Kinh tế quốc dân, được đào tạo bài bản và có ý thức trách nhiệm cao trong công việc. Tôi có kinh nghiệm làm các công việc liên quan đến thầu các dự án máy móc thiết bị và những dự án liên quan đến lĩnh vực quy hoạch, ngoài ra tôi có thể làm các công việc hành chính khác. Qua đó tích lũy kỹ năng chuyên môn và kỹ năng làm việc nhóm. Tôi mong muốn được làm việc trong môi trường chuyên nghiệp để phát huy năng lực và đóng góp tích cực cho sự phát triển của đơn vị.`,
      img: "public/profilePhotos/lyicue.png"
    },
    {
      name: `<span class="intro-core">Phan Thị Hiến </span>`,
      img: "public/profilePhotos/hien.png"
    },
    
    
  ];

  let currentIndex = 0;
  let touchStartX = 0;
  let touchEndX = 0;
  const MIN_SWIPE_DISTANCE = 15;
  
  const textBox = document.getElementById('profile-text-coreTeam');
  const photo = document.getElementById('profile-photo-coreTeam');
  const container = document.querySelector('.image-container'); // Fixed class name here

  function updateProfile_coreTeam(index, direction = 'right') {
    if (!textBox || !photo) return;

    // Add exit animation
    textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');

    setTimeout(() => {
      // Update content
      textBox.innerHTML = `<div>${profileData_coreTeam[index].name}</div>`;
      photo.src = profileData_coreTeam[index].img;

      // Remove exit animation and add enter animation
      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
      textBox.classList.add(direction === 'right' ? 'slide-enter-right' : 'slide-enter-left');
      photo.classList.add(direction === 'right' ? 'slide-enter-right' : 'slide-enter-left');

      // Remove enter animation after transition
      setTimeout(() => {
        textBox.classList.remove('slide-enter-right', 'slide-enter-left');
        photo.classList.remove('slide-enter-right', 'slide-enter-left');
      }, 300);
    }, 300);
  }

  document.getElementById('next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'right');
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData_coreTeam.length) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'left');
  });

  // Add touch support for mobile
  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;
      
      if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
        if (swipeDistance > 0) {
          document.getElementById('prev-btn')?.click();
        } else {
          document.getElementById('next-btn')?.click();
        }
      }
    });
  }

  // Start first profile
  updateProfile_coreTeam(0); // Fixed here
}

attachProfileEvents_coreTeam(); // Initialize the function

