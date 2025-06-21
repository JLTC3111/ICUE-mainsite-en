console.log('[script.js] Loaded ✅');
function typeHTMLString(targetElement, htmlString, speed = 1, onComplete = null) {
  targetElement.innerHTML = "";

  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = htmlString;

  const nodes = Array.from(tempContainer.childNodes);
  let nodeIndex = 0;

  // Create and append cursor initially
  const cursor = document.createElement("span");
  cursor.className = "svg-blinking-cursor";
  targetElement.appendChild(cursor);
  // Create your custom SVG
  const svgCursor = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgCursor.setAttribute("width", "24");
  svgCursor.setAttribute("height", "24");
  svgCursor.setAttribute("viewBox", "0 0 24 24");
  svgCursor.setAttribute("class", "svg-blinking-cursor"); // custom class

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "black"); // or darkblue, your choice
  path.setAttribute("d", `M12,13 L10.5,13 C10.2238576,13 10,12.7761424 10,12.5 C10,12.2238576 10.2238576,12 10.5,12 L12,12 L12,5.5 C12,4.67157288 11.3284271,4 10.5,4 L9.5,4 C9.22385763,4 9,3.77614237 9,3.5 C9,3.22385763 9.22385763,3 9.5,3 L10.5,3 C11.3177995,3 12.0438856,3.39267155 12.5,3.99975627 C12.9561144,3.39267155 13.6822005,3 14.5,3 L15.5,3 C15.7761424,3 16,3.22385763 16,3.5 C16,3.77614237 15.7761424,4 15.5,4 L14.5,4 C13.6715729,4 13,4.67157288 13,5.5 L13,12 L14.5,12 C14.7761424,12 15,12.2238576 15,12.5 C15,12.7761424 14.7761424,13 14.5,13 L13,13 L13,19.5 C13,20.3284271 13.6715729,21 14.5,21 L15.5,21 C15.7761424,21 16,21.2238576 16,21.5 C16,21.7761424 15.7761424,22 15.5,22 L14.5,22 C13.6822005,22 12.9561144,21.6073285 12.5,21.0002437 C12.0438856,21.6073285 11.3177995,22 10.5,22 L9.5,22 C9.22385763,22 9,21.7761424 9,21.5 C9,21.2238576 9.22385763,21 9.5,21 L10.5,21 C11.3284271,21 12,20.3284271 12,19.5 L12,13 Z`);

  svgCursor.appendChild(path);
  targetElement.appendChild(svgCursor);
  function typeNextNode() {
    if (nodeIndex >= nodes.length) {
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const node = nodes[nodeIndex];
    nodeIndex++;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const span = document.createElement("span");
      targetElement.insertBefore(span, cursor); // always before cursor

      let charIndex = 0;
      function typeChar() {
        if (charIndex < text.length) {
          span.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, speed);
        } else {
          typeNextNode();
        }
      }
      typeChar();
    } else {
      const clone = node.cloneNode(true);
      targetElement.insertBefore(clone, cursor);
      typeNextNode();
    }
  }

  typeNextNode();
}

window.attachProfileEvents = () => {
  const profileData = [
    {
      name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span><br> An expert in urban development and construction management, she holds a PhD in the field and is currently Director of the Institute for Economic, Urban and Construction Research under the Vietnam Construction Association. Her long career includes serving as Deputy Director at both the Institute for Economic, Urban and Construction Research (2013–2018) and the Urban Development Agency under the Ministry of Construction (2008–2013). Her work spans legal frameworks, urban planning and architectural design, with a strong focus on sustainable and well-managed cities. She has led major initiatives on green urban development, climate resilience and policy advice for national and regional planning, with support from international partners such as the World Bank and ADB.`,
      img: "public/profilePhotos/nguyenhonghanh.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Hoàng Thu Hà</span><br> Experienced accounting professional with over 10 years of financial management, reporting and compliance. Holds a Bachelor of Accounting degree and has successfully led accounting departments, managed financial payments, conducted audits and prepared accurate financial reports. Skilled in overseeing financial transactions, ensuring legal and regulatory compliance and supporting project finance activities. Proficient in accounting software and known for strong work ethic, adaptability and attention to detail. Brings strong leadership and organizational skills with a focus on delivering accurate financial insights.`,
      img: "public/profilePhotos/hoangthuha.jpg"
    },
    {
      name: `<span class="intro-people">Ms. Lan Anh</span><br> Urban planning and development expert with over 20 years of experience in strategic urban design, policy making and sustainable development. PhD and Master's degrees from the University of Tokyo, with a strong background in climate change adaptation, urban classification law and national development strategy. Former Deputy General Director of the Vietnam Urban Development Agency, leading major programs on resilience and urban planning to 2050. Published researcher, educator and active member of key professional associations. Skilled in coordinating large-scale projects, regulatory frameworks and cross-sectoral collaboration. Fluent in multiple languages ​​and passionate about shaping a sustainable, livable urban future.`,
      img: "public/profilePhotos/tranthilananh.jpg"
    },
    {
      name: `<span class="intro-people">Mr. Trần Quốc Toản </span><br> Urban Planning and Climate Change with over 25 years of experience in sustainable infrastructure, transport planning and climate resilience. Degree in Bridge and Tunnel Engineering and has held key leadership roles in the Vietnamese Ministry of Transport and civil engineering associations. Skilled in policy consulting, smart city planning and green growth strategy development. Led major national projects focused on urban mobility, environmental sustainability and regulatory reform. A respected lecturer and trainer for organizations such as the World Bank and ADB, known for his extensive expertise, strategic thinking and commitment to building a climate resilient urban future.`,
      img: "public/profilePhotos/tranquoctoan.jpg"
    },
    {
      name: `<span class="intro-people"> Long Đỗ - Project Manager </span><br> A dedicated Project Officer with a Masters in Project Management from the University of Salford, UK, along with CCNA and Cyber ​​Security certifications. Over 5 years of extensive experience in banking, retail, (smart) contract management and finance, with a proven ability to manage complex projects and deliver effective results. Combines strong technical skills with practical implementation, ensuring seamless collaboration between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding and gaming. Experience in design and creative problem solving. 🔧💬
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
      // Step 2: Update content with typewriter
      textBox.innerHTML = ""; // clear previous
      const message = profileData[index].name;
      const container = document.createElement("div");
      textBox.appendChild(container);

      typeHTMLString(container, message, 12, () => {
        gsap.fromTo(container, 
          { opacity: 0, y: 10, scale: 0.98 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power1.out" }
        );
      });
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
        { x: direction === 'right' ? 100 : -100, scale: 0.5, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.5, scale: 1, ease: "power2.out" }
      );
  
      tl.fromTo(textBox, 
        { x: direction === 'right' ? 100 : -100, scale: 1.5, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.5, scale: 1, ease: "power2.out" },
        "-=0.5" // Start slightly overlapping with photo animation
      );
  
    }, 300); // ← match exit animation duration (0.3s)
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
  landing.style.pointerEvents = 'All';

  let fakeProgress = setInterval(() => {
    progress += Math.random() * 1.5;
    if (progress > 90) progress = 90;
    setProgress(progress);
  }, 80);
  
  fetch(`/src/pages/${page}.html`)
  .then(response => response.text())
  .then(data => {
    content.innerHTML = data;
    clearInterval(fakeProgress); // ensure we clear progress interval

    // Finalize progress bar to 100%
    let finalize = setInterval(() => {
      progress += 2;
      setProgress(progress);
      if (progress >= 100) {
        clearInterval(finalize);

        // Hide loading overlay
        landing.style.opacity = 0;
        landing.style.pointerEvents = 'none';

        setTimeout(() => {
          landing.style.display = 'none';

            requestAnimationFrame(() => {
              retriggerMenuAnimations();
              updateCalendarSvgTime();
              initAudioVisualizer();
              updateMusicBarColor(page);
              
              switch (page) {
                case 'meetOurExperts':
                  attachProfileEvents();
                  break;
                case 'coreTeam':
                  attachProfileEvents_coreTeam();
                  break;
                case 'Home':
                  initHomeTextSlider();
                  attachHomeButtonEvents();
                  break;
                case 'News':
                  initLogoSlider();
                  initMobileNewsSlider();
                  triggerFanfare();
                  break;
                case 'aboutUs':
                  createBalloons();
                  break;
                case 'Contact':
                  initPostMethod();
                  break;
                case 'ourWork':
                  initializeCarousel();
                  break;
              }
            });

          // Hide contact sidebar on News page
          const contactSidebar = document.querySelector('.contact-sidebar');
          if (contactSidebar) {
            if (page === 'News') {
              contactSidebar.style.display = 'none';
            } else {
              contactSidebar.style.display = '';
            }
           }
          }, 10);
        }
      }, 0);
    });
}

window.retriggerMenuAnimations = (isFirstLoad = true) => {
  const animatedSelectors = [
    { selector: '.menu-toggle', delay: 0 },
    { selector: '.logo-banner', delay: -0.3 },
    { selector: '.flag-link', delay: -0.3 },
    { selector: '.contact-link', delay: 1 },
    { selector: '.contact-sidebar', delay: 1.25 },
  ];

  const timeline = gsap.timeline({ defaults: { duration: 0.5, ease: 'power2.out' } });

  // Utility: set hidden state before animation
  const preHide = (el) => {
    el.classList.add('pre-hidden');
    el.style.opacity = '0';
    el.style.visibility = 'hidden';
  };

  // Utility: unhide on animation start
  const unhide = (el) => {
    el.classList.remove('pre-hidden');
    el.style.opacity = '';
    el.style.visibility = '';
  };

  // Animate standard menu elements
  animatedSelectors.forEach(({ selector, delay }) => {
    const el = document.querySelector(selector);
    if (!el) return;

    const newEl = el.cloneNode(true);
    preHide(newEl);
    el.parentNode.replaceChild(newEl, el);

    timeline.fromTo(
      newEl,
      isFirstLoad ? { y: -50, opacity: 0 } : { opacity: 0 },
      {
        y: 0,
        opacity: 1,
        onStart: () => unhide(newEl)
      },
      delay
    );
  });

// Flag-Icon Animation 
const langSwitcher = document.getElementById('langSwitcher');
if (langSwitcher) {
  const newLangSwitcher = langSwitcher.cloneNode(true);
  preHide(newLangSwitcher);
  langSwitcher.parentNode.replaceChild(newLangSwitcher, langSwitcher);

  timeline.fromTo(
    newLangSwitcher,
    isFirstLoad ? { y: -50, opacity: 0 } : { opacity: 0 },
    {
      y: 0,
      opacity: 1,
      onStart: () => unhide(newLangSwitcher)
    },
    '-=0.3'
  );

// 🇬🇧 Flag-Icon Hover
  newLangSwitcher.addEventListener('mouseenter', () => {
    gsap.killTweensOf(newLangSwitcher);
    gsap.to(newLangSwitcher, {
      scale: 1.25,
      duration: 0.3,
      ease: 'power2.out'
    });
  });

  newLangSwitcher.addEventListener('mouseleave', () => {
    gsap.to(newLangSwitcher, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.inOut'
    });
  });
}

// 🔁 CONTACT LINK
const contactUs = document.getElementById('contactLink');
  if (contactUs) {
    const newContact = contactUs.cloneNode(true);
    preHide(newContact);
    contactUs.parentNode.replaceChild(newContact, contactUs);

    timeline.fromTo(
      newContact,
      isFirstLoad ? { y: -50, opacity: 0 } : { opacity: 0 },
      {
        y: 0,
        opacity: 1,
        onStart: () => unhide(newContact)
      },
      '-=0.3'
    );

// CONTACT LINK HOVER
  newContact.addEventListener('mouseenter', () => {
    gsap.killTweensOf(newContact);
    gsap.to(newContact, {
      scale: 1.25,
        duration: .05,
        ease: 'power2.out'
      });
    });
    
  newContact.addEventListener('mouseleave', () => {
    gsap.to(newContact, {
      scale: 1,
        duration: .05,
        ease: 'power2.inOut'
      });
    });
}

// 🔁 MENU ICON ANIMATION
const menuToggle = document.getElementById('menuIcon');
  if (menuToggle) {
    const newToggle = menuToggle.cloneNode(true);
    preHide(newToggle);
    menuToggle.parentNode.replaceChild(newToggle, menuToggle);
    timeline.fromTo(
      newToggle,
        isFirstLoad ? { y: -60, opacity: 0 } : { scale: 0.5, opacity: 0 },
        {
          y: 0,
          scale: 1,
          opacity: 1,
          onStart: () => unhide(newToggle)
        },
        '-=0.4'
      );
  
  // MENU ICON HOVER
  newToggle.addEventListener('mouseenter', () => {
      gsap.to(newToggle, {
        scale: 1.25,
        duration: .05,
        ease: 'power2.out'
      });
    });

  newToggle.addEventListener('mouseleave', () => {
      gsap.to(newToggle, {
        scale: 1,
        duration: .05,
        ease: 'power2.inOut'
      });
    });
  }
};

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
    "10+ years of urban excellence. Dedicated professionals who are passionate about urban planning, construction, and climate change. ⏳ ",
    "Built on Unity, Driven by Values! ​​We believe in giving back, and constantly striving for self-improvement. These core values ​​shape our approach & inspire our partnerships with local professionals, government agencies. 🤝 ",
    "Smart Cities, Smarter Solutions. We use technology and data-driven insights to improve efficiency, connectivity, and future-ready cities. 💡 ",
    "Led the Đà Nẵng citywide planning initiative for both tier 1 and tier 2 cities — a transformational project that reflects our commitment to big-picture strategy and real results. 🏆 ",
    "Shaping cities, improving lives. Every solution we deliver is rooted in a mission: to create a better urban future that is inclusive, sustainable and people-centered. 🌱  ",
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
    const textElement = document.querySelector("#homeSliderText .highlight-text");
  
    if (!textElement) {
      console.error("highlight-text element not found!");
      return;
    }
  
    const message = messages[index];
    const typingSpeed = 25; // ms per character
  
    // Step 1: Animate out old text
    gsap.to(textElement, {
      duration: 0.2,
      opacity: 0,
      scale: 0.95,
      y: 10,
      ease: "power2.out",
      onComplete: () => {
        textElement.textContent = ""; // Clear content
        textElement.style.opacity = 1; // Reset visibility for typing
  
        // Step 2: Typewriter loop
        let i = 0;
        const typeNextChar = () => {
          if (i < message.length) {
            textElement.textContent += message.charAt(i);
            i++;
            setTimeout(typeNextChar, typingSpeed);
          } else {
            // Optional: little GSAP bounce after typing completes
            gsap.fromTo(
              textElement,
              { scale: 0.98 },
              { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" }
            );
          }
        };
  
        typeNextChar();
      }
    });
  
    // Step 3: Update dot states and restart progress bar
    dots.forEach((dot, i) => {
      const progress = dot.querySelector(".progress-dot");
      dot.classList.remove("active");
  
      if (progress) {
        progress.style.animation = "none";
        void progress.offsetWidth;
      }
  
      if (i === index) {
        dot.classList.add("active");
  
        if (progress) {
          progress.style.animation = "none";
          void progress.offsetWidth;
          progress.style.animation = "slide-progress 8s linear forwards";
        }
      }
    });
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
      window.homeSliderIntervalId = setInterval(nextText, 8000);
    }
  }

  // Initialize the slider
  updateText(index);
  window.homeSliderIntervalId = setInterval(nextText, 8000);

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

let currentPage = ''; // default
window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);

function router() {
  const hash = window.location.hash || '#/Home';
  const page = hash.replace('#/', '') || 'Home';

  window.loadPage(page);
}

window.toggleDrawerMenu = () => {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon'); // This now correctly references your <svg> element
  const isOpen = drawerMenu.classList.contains('open');

  // Toggle the 'is-open' class on the SVG icon.
  menuIcon.classList.toggle('is-open');
  if (isOpen) {
    drawerMenu.classList.remove('open');
    removeOverlayListener();
  } else {
    drawerMenu.classList.add('open');
    addOverlayListener();
  }
}

// Ensure menuIcon is indeed your SVG element in HTML:
// <svg id="menuIcon" ...>...</svg>

window.toggleDrawerMenu = () => {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon'); // This now correctly references your <svg> element
  const isOpen = drawerMenu.classList.contains('open');

  // Toggle the 'is-open' class on the SVG icon.
  // Your CSS will handle the transformation based on this class.
  if (menuIcon) { // Good practice: check if element exists before manipulating
      menuIcon.classList.toggle('is-open');
  }

  if (isOpen) {
    drawerMenu.classList.remove('open');
    removeOverlayListener();
  } else {
    drawerMenu.classList.add('open');
    addOverlayListener();
  }
};

// Simplified window.closeDrawerMenu to work with SVG transformations
window.closeDrawerMenu = () => {
  const drawerMenu = document.getElementById('drawerMenu');
  const menuIcon = document.getElementById('menuIcon'); // This is your SVG element

  // Ensure menu and listeners are closed
  drawerMenu.classList.remove('open');
  removeOverlayListener();

  // Simply remove the 'is-open' class from the SVG icon.
  // Your CSS transitions will automatically animate it back to its original (hamburger) form.
  if (menuIcon) {
      menuIcon.classList.remove('is-open');
  }
  // The image swap logic (src changes, fade-in/fade-out classes, setTimeout)
  // is removed as it's not needed for SVG transformations.
};


// These functions remain correct as they are
window.handleOutsideClick = (e) => {
  const drawer = document.getElementById('drawerMenu');
  const toggle = document.querySelector('.menu-toggle'); // Assuming this refers to your menuIcon or its wrapper

  // IMPORTANT: Make sure `toggle` refers to `menuIcon` or its clickable parent
  // If your menu-icon <svg> is directly clickable, you might use:
  // const toggle = document.getElementById('menuIcon');

  if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
    closeDrawerMenu();
  }
};

window.handleEscKey = (e) => {
  if (e.key === 'Escape') {
    closeDrawerMenu();
  }
};

window.addOverlayListener = () => {
  document.addEventListener('click', handleOutsideClick);
  document.addEventListener('keydown', handleEscKey);
};

window.removeOverlayListener = () => {
  document.removeEventListener('click', handleOutsideClick);
  document.removeEventListener('keydown', handleEscKey);
};

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
/*window.onload = () => {
  loadPage('Home');
  highlightActiveLink('Home');
};*/

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
  const container = document.getElementById('profile-text-coreTeam')?.parentElement;

  window.updateProfile_coreTeam = (index, direction = 'right') => {
    if (!textBox || !photo) return;

    const isFirstLoad = (currentIndex === 0 && index === 0);

    if (!isFirstLoad) {
      textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
      photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    }

    setTimeout(() => {
      textBox.innerHTML = "";
      const message = profileData_coreTeam[index].name;
      const container = document.createElement("div");
      textBox.appendChild(container);

      typeHTMLString(container, message, 14, () => {
        gsap.fromTo(container, 
          { opacity: 0, y: 10, scale: 0.98 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power1.out" }
        );
      });
      photo.src = profileData_coreTeam[index].img;

      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
      textBox.classList.remove('slide-enter-left', 'slide-enter-right');
      photo.classList.remove('slide-enter-left', 'slide-enter-right');

      const tl = gsap.timeline();

      if (isFirstLoad) {
        tl.fromTo(photo,
          { y: 100, scale: 0.25, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out" }
        );

        tl.fromTo(textBox,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1, ease: "bounce.out" },
          "-=0.8"
        );
      } else {
        tl.fromTo(photo,
          { y: 100, scale: 0.25, opacity: 0 },
          { y: 0, scale: 1, opacity: 1, duration: 1, ease: "power3.out" }
        );

        tl.to(photo, {
          y: 10,
          duration: 0.3,
          ease: "power2.out"
        }, "-=0.4");

        tl.set(photo, { y: 10 });

        tl.fromTo(textBox,
          { x: direction === 'right' ? 100 : -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.5"
        );
      }

    }, isFirstLoad ? 0 : 800);
  };

  document.getElementById('next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'right');
  });

  document.getElementById('prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData_coreTeam.length) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'left');
  });

  if (container) {
    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const swipeDistance = touchEndX - touchStartX;

      if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
        if (swipeDistance > 0) {
          currentIndex = (currentIndex - 1 + profileData_coreTeam.length) % profileData_coreTeam.length;
          updateProfile_coreTeam(currentIndex, 'left');
        } else {
          currentIndex = (currentIndex + 1) % profileData_coreTeam.length;
          updateProfile_coreTeam(currentIndex, 'right');
        }
      }
    });
  }

  // Preload images
  profileData_coreTeam.forEach(profile => {
    const img = new Image();
    img.src = profile.img;
  });

  // Initialize first profile
  updateProfile_coreTeam(0);
};

window.initLogoSlider = () => {
  const logoList = document.getElementById('logoList');
  if (!logoList) return;

  let position = 0;
  let speed = 1;
  let isPaused = false;

  const loop = () => {
    if (!isPaused) {
      position -= speed;
      const listWidth = logoList.scrollWidth;
      const containerWidth = logoList.parentElement.offsetWidth;

      // Reset when it scrolls out of view
      if (-position >= listWidth) {
        position = containerWidth;
      }

      logoList.style.transform = `translateX(${position}px)`;
    }
    requestAnimationFrame(loop);
  };

  requestAnimationFrame(loop);

  // Pause on hover
  logoList.parentElement.addEventListener('mouseenter', () => isPaused = true);
  logoList.parentElement.addEventListener('mouseleave', () => isPaused = false);

  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight');

  if (arrowLeft) arrowLeft.addEventListener('click', () => { speed = 1; isPaused = false; });
  if (arrowRight) arrowRight.addEventListener('click', () => { speed = -1; isPaused = false; });
};

// ===================
// News Slider (Mobile Only)
// ===================
window.initMobileNewsSlider = () => {
  if (window.innerWidth > 768) return; // Only run on small screens

  const containers = document.querySelectorAll(".news-container");
  const leftArrow = document.getElementById("arrowNewsLeft");
  const rightArrow = document.getElementById("arrowNewsRight");

  if (!containers.length || !leftArrow || !rightArrow) return;

  let currentIndex = 0;

  function updateSlider() {
    containers.forEach((container, index) => {
      container.style.display = index === currentIndex ? "block" : "none";
    });
  }

  leftArrow.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + containers.length) % containers.length;
    updateSlider();
  });

  rightArrow.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % containers.length;
    updateSlider();
  });

  updateSlider();
}

// Call when DOM is ready
document.addEventListener("DOMContentLoaded", initMobileNewsSlider);

window.initPostMethod = () => {
const form = document.getElementById("contactForm");
    const thankYou = document.getElementById("thankYouMessage");

    form.addEventListener("submit", function (e) {
      e.preventDefault(); // Stop regular submission
      const formData = new FormData(form);

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(formData).toString()
      })
      .then(() => {
        form.style.display = "none";
        thankYou.style.display = "block";
      })
      .catch((error) => alert("Something went wrong. Please try again."));
    });
  }
  
//Work-Page Script
window.initializeCarousel = () => {
  const nextButton = document.getElementById("work-next");
  const prevButton = document.getElementById("work-prev");
  const carousel = document.querySelector(".work-carousel");

  if (!nextButton || !prevButton || !carousel) {
    console.warn("Carousel initialization failed. Missing key DOM elements.");
    return;
  }

  const slider = carousel.querySelector(".work-list");
  const thumbnails = carousel.querySelector(".work-thumbnail");
  const timeBar = carousel.querySelector(".work-time");

  if (!slider || !thumbnails || !timeBar) {
    console.warn("Carousel structure incomplete.");
    return;
  }

  let autoAdvanceTimeout;
  let animationTimeout;
  const timeRunning = 3000;
  const timeAutoNext = 25000;

  const resetAutoAdvance = () => {
    clearTimeout(autoAdvanceTimeout);
    autoAdvanceTimeout = setTimeout(() => nextButton.click(), timeAutoNext);
  };

  const showSlide = (direction) => {
    const items = slider.querySelectorAll(".work-item");
    const thumbs = thumbnails.querySelectorAll(".work-item");

    if (direction === "work-next") {
      slider.appendChild(items[0]);
      thumbnails.appendChild(thumbs[0]);
      carousel.classList.add("work-next");
    } else if (direction === "work-prev") {
      slider.prepend(items[items.length - 1]);
      thumbnails.prepend(thumbs[thumbs.length - 1]);
      carousel.classList.add("work-prev");
    }
    clearTimeout(animationTimeout);
    animationTimeout = setTimeout(() => {
      carousel.classList.remove("work-next", "work-prev");
    }, timeRunning);

    resetAutoAdvance();
  };

  const goToSlide = (targetIndex) => {
  const currentSlide = slider.querySelector(".work-item");
  const currentIndex = parseInt(currentSlide.dataset.index, 10);

  if (targetIndex === currentIndex) return; // already active

  let steps = targetIndex - currentIndex;
  const totalItems = slider.querySelectorAll(".work-item").length;

  // Handle wrap-around (shortest path logic)
  if (steps < 0) steps += totalItems;

  for (let i = 0; i < steps; i++) {
    slider.appendChild(slider.firstElementChild);
    thumbnails.appendChild(thumbnails.firstElementChild);
  }

  carousel.classList.add("work-jump");

  clearTimeout(animationTimeout);
  animationTimeout = setTimeout(() => {
    carousel.classList.remove("work-jump");
  }, timeRunning);

  resetAutoAdvance();
};

  // Add click events to thumbnails
const initThumbnailClick = () => {
  const thumbItems = Array.from(thumbnails.querySelectorAll(".work-item"));
    thumbItems.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        goToSlide(index);
      });
    });
  };

  initThumbnailClick();
  resetAutoAdvance();

  nextButton.onclick = () => showSlide("work-next");
  prevButton.onclick = () => showSlide("work-prev");
  carousel.setAttribute('data-loaded', 'true');

};

window.updateCalendarSvgTime = () => {
    const calendarMonthElement = document.getElementById('calendar-month');
    const calendarDayElement = document.getElementById('calendar-day');
    const calendarTimeElement = document.getElementById('calendar-time');

    if (!calendarMonthElement || !calendarDayElement || !calendarTimeElement) {
        console.warn("One or more calendar SVG text elements not found. Make sure IDs are correct.");
        return;
    }

    const now = new Date();

    // Get Month (e.g., "June")
    const month = now.toLocaleString('en-US', { month: 'long' });

    // Get Day (e.g., "18")
    const day = now.getDate();

    // Get Time (e.g., "03:04 PM" for 3:04 PM)
    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' (midnight) should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    const timeString = `${hours}:${formattedMinutes} ${ampm}`;

    // Update the SVG text elements
    calendarMonthElement.textContent = month;
    calendarDayElement.textContent = day;
    calendarTimeElement.textContent = timeString;

    // Log for debugging (optional)
    console.log(`Updated calendar SVG: ${month} ${day}, ${timeString}`);
}

// Initial update when the page loads
updateCalendarSvgTime();

// Update the time every minute (60,000 milliseconds)
setInterval(updateCalendarSvgTime, 60 * 1000);

// Preload the sound (optional)
  const fanfareAudio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_b91cc18f4b.mp3'); // Royalty-free fanfare

  // Make sure the audio is allowed to autoplay (you might need to trigger it from user interaction)
  fanfareAudio.load();

  window.triggerFanfare = function () {
    // Play sound
    fanfareAudio.currentTime = 0;
    fanfareAudio.play().catch(e => console.warn('Autoplay blocked:', e));

    // Confetti burst!
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti(Object.assign({}, defaults, {
        particleCount,
        origin: {
          x: randomInRange(0.1, 0.9),
          y: Math.random() - 0.2
        }
      }));
    }, 250);
  };

  function initAudioVisualizer(
    audioSrc = 'public/music/royalty_free.mp3',
    barSelector = 'contact-sidebar .music-bars',
    clickTargetSelector = '#visualizer'
  ) {
    const clickTarget = document.querySelector(clickTargetSelector);
  
    // ✅ Reuse existing audio if already created
    if (window.__audioVisualizer) {
      const { audio, ctx } = window.__audioVisualizer;
  
      if (clickTarget) {
        clickTarget.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          if (ctx.state === 'suspended') ctx.resume();
          audio.paused ? audio.play() : audio.pause();
        });
      }
  
      return;
    }
  
    // ❌ First-time setup
    const audio = new Audio(audioSrc);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
  
    const freqData = new Uint8Array(analyser.frequencyBinCount);
  
    function toggleAudio() {
      if (ctx.state === 'suspended') ctx.resume();
      audio.paused ? audio.play() : audio.pause();
    }
  
    if (clickTarget) {
      clickTarget.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleAudio();
      });
    }
  
    // ✅ Save audio setup globally
    window.__audioVisualizer = {
      audio,
      ctx,
      analyser,
      freqData
    };
  }
  
  // ✅ Global animation loop — only runs once
  function startAudioVisualizerLoop(barSelector = '.music-bars') {
    function loop() {
      requestAnimationFrame(loop);
  
      const av = window.__audioVisualizer;
      if (!av) return;
  
      const { analyser, freqData } = av;
      const bars = document.querySelectorAll(barSelector);
  
      if (!analyser || bars.length === 0) return;
  
      analyser.getByteFrequencyData(freqData);
  
      bars.forEach((bar, i) => {
        const value = freqData[i];
        const scale = Math.max(0.5, value / 256);
        bar.style.transform = `scaleY(${scale})`;
      });
    }
  
    loop();
  }
  
  // ✅ Call this once globally on startup (e.g. inside DOMContentLoaded)
  window.addEventListener('DOMContentLoaded', () => {
    startAudioVisualizerLoop(); // Start global animation once
  });

  function updateMusicBarColor(page) {
    const paths = document.querySelectorAll('.music-bars svg path');
  
    let color = '#ffffff'; // default
  
    switch (page) {
      case 'ourWork':
        color = '#ffcc00';
        break;
      case 'Contact':
        color = '#000000';
        break;
        case 'coreTeam':
        color = '#000000';
        break;
    }
  
    paths.forEach(path => {
      path.setAttribute('stroke', color);
      path.setAttribute('fill', color); // Only needed if your SVG uses `fill`
    });
  }

  function enableCursorGradientTrail(color = 'yellow') {
    document.addEventListener('mousemove', (e) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
  
      // Optional: customize color dynamically
      trail.style.background = `radial-gradient(circle, ${color}, transparent 60%)`;
  
      // Position at mouse location
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
  
      document.body.appendChild(trail);
  
      // Remove after animation completes
      setTimeout(() => {
        trail.remove();
      }, 500); // match animation duration
    });
  }
  
  // ✅ Enable it
  enableCursorGradientTrail(); // Default: yellow
  
  



  
  

  
  
