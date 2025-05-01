window.attachProfileEvents = () => {
  const profileData = [
    {
      name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span> An expert in urban development and construction management, she holds a PhD in the field and is currently Director of the Institute for Economic, Urban and Construction Research under the Vietnam Construction Association. Her long career includes serving as Deputy Director at both the Institute for Economic, Urban and Construction Research (2013–2018) and the Urban Development Agency under the Ministry of Construction (2008–2013). Her work spans legal frameworks, urban planning and architectural design, with a strong focus on sustainable and well-managed cities. She has led major initiatives on green urban development, climate resilience and policy advice for national and regional planning, with support from international partners such as the World Bank and ADB.`,
      img: "public/profilePhotos/nguyenhonghanh.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Hoàng Thu Hà</span> Experienced accounting professional with over 10 years of financial management, reporting and compliance. Holds a Bachelor of Accounting degree and has successfully led accounting departments, managed financial payments, conducted audits and prepared accurate financial reports. Skilled in overseeing financial transactions, ensuring legal and regulatory compliance and supporting project finance activities. Proficient in accounting software and known for strong work ethic, adaptability and attention to detail. Brings strong leadership and organizational skills with a focus on delivering accurate financial insights.`,
      img: "public/profilePhotos/hoangthuha.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Lan Anh</span>Urban planning and development expert with over 20 years of experience in strategic urban design, policy making and sustainable development. PhD and Master's degrees from the University of Tokyo, with a strong background in climate change adaptation, urban classification law and national development strategy. Former Deputy General Director of the Vietnam Urban Development Agency, leading major programs on resilience and urban planning to 2050. Published researcher, educator and active member of key professional associations. Skilled in coordinating large-scale projects, regulatory frameworks and cross-sectoral collaboration. Fluent in multiple languages ​​and passionate about shaping a sustainable, livable urban future.`,
      img: "public/profilePhotos/tranthilananh.jpg"
    },
    {
      name: `<span class="intro-people">Mr. Trần Quốc Toản </span> Urban Planning and Climate Change with over 25 years of experience in sustainable infrastructure, transport planning and climate resilience. Degree in Bridge and Tunnel Engineering and has held key leadership roles in the Vietnamese Ministry of Transport and civil engineering associations. Skilled in policy consulting, smart city planning and green growth strategy development. Led major national projects focused on urban mobility, environmental sustainability and regulatory reform. A respected lecturer and trainer for organizations such as the World Bank and ADB, known for his extensive expertise, strategic thinking and commitment to building a climate resilient urban future.`,
      img: "public/profilePhotos/tranquoctoan.jpg"
    },
    {
      name: `<span class="intro-people"> Long Đỗ - Quản Lý Dự Án </span> A dedicated Project Officer with a Masters in Project Management from the University of Salford, UK, along with CCNA and Cyber ​​Security certifications. Over 5 years of extensive experience in banking, retail, (smart) contract management and finance, with a proven ability to manage complex projects and deliver effective results. Combines strong technical skills with practical implementation, ensuring seamless collaboration between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding and gaming. Experience in design and creative problem solving. 🔧💬
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

  
  window.updateProfile = (index, direction = 'right') => {
    if (!textBox || !photo) return;
  
    // Step 1: Add exit animation classes
    const isFirstLoad = (currentIndex === 0 && index === 0);

    if (!isFirstLoad) {
    textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');}
  
    setTimeout(() => {
      // Step 2: Update the content
      textBox.innerHTML = `<div>${profileData[index].name}</div>`;
      photo.src = profileData[index].img;
  
      // Step 3: Remove exit animation classes
      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
  
      // (Optional) remove old enter classes in case
      textBox.classList.remove('slide-enter-left', 'slide-enter-right');
      photo.classList.remove('slide-enter-left', 'slide-enter-right');
  
      // Step 4: Animate using GSAP (✅ after content is updated)
      const tl = gsap.timeline();
  
      tl.fromTo(photo, 
        { x: direction === 'right' ? 100 : -100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 7.5, ease: "power2.out" }
      );
  
      tl.fromTo(textBox, 
        { x: direction === 'right' ? 100 : -100, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 7.5, ease: "power2.out" },
        "-=0.5" // Start slightly overlapping with photo animation
      );
  
    }, 500); // ← match exit animation duration (0.3s)
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

  // Preload all profile images
profileData.forEach(profile => {
  const img = new Image();
  img.src = profile.img;
});
  // Start first profile
  updateProfile(0);
}

window.loadPage = (page) => {
  const content = document.getElementById('content');
  const landing = document.getElementById('landing-page');
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.getElementById('progress-text');
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  let progress = 0;
  progressBar.style.strokeDasharray = `${circumference}`;

  const setProgress = (percent) => {
    const offset = circumference - (percent / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;
    progressText.textContent = `${Math.round(percent)}%`;
  };

  landing.style.display = 'grid';
  landing.style.opacity = 1;
  landing.style.pointerEvents = 'all';

  let fakeProgress = setInterval(() => {
    progress += Math.random() * 1.5;
    if (progress > 90) progress = 90;
    setProgress(progress);
  }, 80);

  fetch(`/src/pages/${page}.html`)
    .then(response => response.text())
    .then(data => {
      content.innerHTML = data;

      clearInterval(fakeProgress);

      let finalize = setInterval(() => {
        progress += 2;
        setProgress(progress);
        if (progress >= 100) {
          clearInterval(finalize);
          landing.style.opacity = 0;
          landing.style.pointerEvents = 'none';

          setTimeout(() => {
            landing.style.display = 'none';

            // ✅ Delay script activation *after* loader is gone
            requestAnimationFrame(() => {
              if (page === 'meetOurExperts') {
                attachProfileEvents();
              }
              if (page === 'coreTeam') {
                attachProfileEvents_coreTeam();
              }
              if (page === 'Home') {
                initHomeTextSlider();
                attachHomeButtonEvents();
              }
            });

          }, 400); // After fade-out
        }
      },);
    });
}

window.attachHomeButtonEvents = () => {
  document.querySelectorAll('.home-button').forEach(button => {
    button.addEventListener('click', () => {
      console.log('Button clicked:', button.textContent);
      // Add your button logic here
    });
  });
}

window.initHomeTextSlider = () => {
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
    "⏳ 20 years of urban excellence. With two decades of experience, our team of 10 dedicated professionals are passionate about urban planning, construction, and climate change. We design cities that thrive in a rapidly evolving world—balancing function, resilience, and community needs.",
    "🤝 Built on Unity, Driven by Values ​​We believe in giving back, practicing unity, working hard and constantly striving for self-improvement. These core values ​​shape our approach and inspire our partnerships with local professionals, government agencies and legal professionals.",
    "💡 Smart Cities, Smarter Solutions. From smart city integration to climate resilience strategies, we use technology and data-driven insights to improve urban efficiency, connectivity, and sustainability—building future-ready cities.",
    "🏆 Our greatest achievement. We led the Da Nang citywide planning initiative for both tier 1 and tier 2 cities — a transformational project that continues to impact the daily lives of thousands of people. It reflects our commitment to big-picture strategy and real results.",
    "🌱 Shaping cities, improving lives. Every solution we deliver is rooted in a mission: to create a better urban future. From the ground up, we help shape spaces that are inclusive, sustainable and people-centered.",
    "💥 Create experiences that last forever."
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

window.toggleDrawerMenu = () => {
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

window.closeDrawerMenu = () => {
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

window.handleOutsideClick = (e) => {
  const drawer = document.getElementById('drawerMenu');
  const toggle = document.querySelector('.menu-toggle');

  if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
    closeDrawerMenu();
  }
}

window.handleEscKey = (e) => {
  if (e.key === 'Escape') {
    closeDrawerMenu();
  }
}

window.addOverlayListener = () => {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscKey);
}

window.removeOverlayListener = () => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscKey);
}

// Navigation handler + page loader
window.navigateToPage = (page) => {
  currentPage = page;
  loadPage(page); // Your existing page loader
  highlightActiveLink(page);
  closeDrawerMenu();
}

// Highlight active link
window.highlightActiveLink = (page) => {
  const links = document.querySelectorAll('#drawerMenu a');
  links.forEach(link => {
    link.classList.remove('active');
    if (link.textContent.toLowerCase().includes(page.toLowerCase())) {
      link.classList.add('active');
    }
  });
}

window.toggleSubmenu = (e) => {
  e.preventDefault(); // prevent page from jumping
  const submenu = document.getElementById('ourPeopleSubmenu');
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

window.createBalloons = () => {
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

window.attachProfileEvents_coreTeam = () => {
  const profileData_coreTeam = [
    {name: '<span class="intro-core">Core Team</span> Our team consists of 5-6 dedicated professionals who manage the day-to-day operations and essential tasks, ensuring everything runs smoothly. With expertise in project management, technical development, client relations, marketing and finance, each member plays a vital role in driving the success of the organization. Through close collaboration and open communication, they work together to solve challenges and seize opportunities. From customer interactions to internal processes, the collective efforts of the team ensure top-notch service and operational efficiency. Their commitment and hard work are vital to the continued growth and success of our organization.',
      img: "public/profilePhotos/coreTeam.jpg"
    },
    {name: 
      `<span class="intro-core"> Nguyễn Thị Ly </span> Strong academic background in urban planning, sustainable urban development, infrastructure management and public space design. Contribute to numerous research and technical assistance projects focusing on public spaces, community development and urban development programs. Demonstrate excellent teamwork spirit, clear organizational skills and a high sense of responsibility. Proactive, eager to learn and committed to advancing the profession through participation in urban projects that prioritize sustainable and environmentally friendly solutions.`, 
      img: "public/profilePhotos/lyly.png"
    },
    {
      name: `<span class="intro-core">Đinh Tùng Dương</span> I hold a degree in Urban Management from Hanoi Architectural University, where I was honored to be named Hanoi's Valedictorian in 2023. Over the past two years, I have been actively contributing to urban development projects focusing on spatial planning, landscape improvement, and sustainable urban living. I have strong analytical and organizational skills, along with proficiency in both office and technical software. I am committed to continuous professional development and aim to contribute effectively to a progressive, reputable organization. `,
      img: "public/profilePhotos/duong.png"
    },
    {
      name: `<span class="intro-core">Nguyễn Thanh Tâm</span> Dedicated professional specializing in quantity surveying, detailed planning and technical drawing. With strong team working skills and a reliable, hard-working approach, I contribute effectively to collaborative projects and office operations. As an active partner of ICUE, I have built strong networks with local authorities, ensuring smooth communication and project support. I am proficient in routine administrative tasks, project documentation and on-site coordination. I am passionate about contributing to the team and supporting the growth and success of the organization.`,  
      img: "public/profilePhotos/tam.png"
    },
    {
      name: `<span class="intro-core">Trịnh Thị Tình </span> Graduated from Hanoi College of Tourism with a major in Business Administration. In addition to managing office administrative tasks, I also contribute and support various scientific research projects. I am a dynamic and responsible individual, always eager to learn and develop. With a high sense of detail and responsibility, I value teamwork and apply the accumulated experience to bring about quality results. I wish to further develop my career in a professional environment where I can actively contribute to the success of the organization.`,
      img: "public/profilePhotos/tinh.png"
    },
    {
      name: `<span class="intro-core">Nguyễn Quỳnh Ly </span> I graduated from the National Economics University, have a thorough training and a high sense of responsibility in my work. I have experience in bidding for machinery and equipment projects, as well as projects related to urban planning. In addition, I am capable of handling various administrative tasks. These roles have helped me build strong technical and teamwork skills. I wish to work in a professional environment where I can apply my abilities and contribute to the development of the organization.`,
      img: "public/profilePhotos/lyicue.png"
    },
    {
      name: `<span class="intro-core">Phan Thị Hiến </span> Graduated from Hanoi Open University with a major in accounting. Currently, I am working in the accounting field. With experience, I have accumulated a lot of knowledge and skills in accounting, financial reporting and data analysis. I always pay attention to accuracy and transparency in my work. In addition, I also have the ability to work in a team, which helps me coordinate effectively with other departments. I hope to continue to develop my accounting career and contribute to the success of the company.`,
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

  window.updateProfile_coreTeam = (index, direction = 'right') => {
    if (!textBox || !photo) return;
  
    // Step 1: Add exit animation classes
    const isFirstLoad = (currentIndex === 0 && index === 0);

    if (!isFirstLoad) {
    textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');}
  
    setTimeout(() => {
      // Step 2: Update the content
      textBox.innerHTML = `<div>${profileData_coreTeam[index].name}</div>`;
      photo.src = profileData_coreTeam[index].img;
  
      // Step 3: Remove exit animation classes
      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
  
      // (Optional) remove old enter classes in case
      textBox.classList.remove('slide-enter-left', 'slide-enter-right');
      photo.classList.remove('slide-enter-left', 'slide-enter-right');
  
      // Step 4: Animate using GSAP (✅ after content is updated)
      const tl = gsap.timeline();
  
      if (isFirstLoad) {
        // 👑 First time opening animation
        tl.fromTo(photo, 
          { y: 100, scale: 0.8, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out" }
        );
  
        tl.fromTo(textBox,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "bounce.out" },
          "-=0.8" // overlap a bit
        );
  
      } else {
        // 👉 Normal sliding between profiles
        tl.fromTo(photo, 
          { x: direction === 'right' ? 100 : -100, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
        );
  
        tl.fromTo(textBox, 
          { x: direction === 'right' ? 100 : -100, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.5"
        );
      }
  
    }, isFirstLoad ? 0 : 800); // No delay if first load
  };

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

  // Preload all profile images
profileData_coreTeam.forEach(profile => {
  const img = new Image();
  img.src = profile.img;
});
  // Start first profile
  updateProfile_coreTeam(0); // Fixed here
}

attachProfileEvents_coreTeam(); // Initialize the function

