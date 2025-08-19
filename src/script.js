console.log('[script.js] Loaded ✅');

// Touch device detection
const isTouchDevice = (
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0
);

let profileChangeAudioCtx;
function playProfileChangeSound() {
  if (!profileChangeAudioCtx) {
    profileChangeAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const audioCtx = profileChangeAudioCtx;
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);

  oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.1);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + 0.1);
}
function typeHTMLString(targetElement, htmlString, speed = 1, onComplete = null, typingSessionObj = null, highlightClass = null) {
  targetElement.innerHTML = "";

  // Always replace <strong> tags with highlight span
  let processedHtmlString = htmlString;
  if (highlightClass) {
    processedHtmlString = processedHtmlString.replace(/<strong>(.*?)<\/strong>/g, `<span class=\"${highlightClass}\">$1<\/span>`);
  }

  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = processedHtmlString;

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
  path.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z");

  svgCursor.appendChild(path);
  targetElement.appendChild(svgCursor);

  // Typing skip logic
  let skipTyping = false;
  if (typingSessionObj) typingSessionObj.skip = false;

  function typeNextNode() {
    if (skipTyping || (typingSessionObj && typingSessionObj.skip)) {
      // Instantly show all remaining nodes
      for (; nodeIndex < nodes.length; nodeIndex++) {
        const node = nodes[nodeIndex];
        if (node.nodeType === Node.TEXT_NODE) {
          const span = document.createElement("span");
          span.textContent = node.textContent;
          targetElement.insertBefore(span, cursor);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const wrapper = node.cloneNode(false);
          targetElement.insertBefore(wrapper, cursor);
          wrapper.innerHTML = node.innerHTML;
        } else {
          const clone = node.cloneNode(true);
          targetElement.insertBefore(clone, cursor);
        }
      }
      if (typeof onComplete === "function") onComplete();
      return;
    }
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
        if (skipTyping || (typingSessionObj && typingSessionObj.skip)) {
          span.textContent = text;
          typeNextNode();
          return;
        }
        if (charIndex < text.length) {
          span.textContent += text.charAt(charIndex);
          charIndex++;
          setTimeout(typeChar, speed);
        } else {
          typeNextNode();
        }
      }
      typeChar();
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = node.cloneNode(false); // Clone just the tag, not children
      targetElement.insertBefore(wrapper, cursor);
      const childNodes = Array.from(node.childNodes);
      let childIndex = 0;
      function typeChildNode() {
        if (skipTyping || (typingSessionObj && typingSessionObj.skip)) {
          wrapper.innerHTML = node.innerHTML;
          typeNextNode();
          return;
        }
        if (childIndex >= childNodes.length) {
          typeNextNode();
          return;
        }
        const child = childNodes[childIndex];
        childIndex++;
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          const span = document.createElement("span");
          wrapper.appendChild(span);
          let charIndex = 0;
          function typeChar() {
            if (skipTyping || (typingSessionObj && typingSessionObj.skip)) {
              span.textContent = text;
              typeChildNode();
              return;
            }
            if (charIndex < text.length) {
              span.textContent += text.charAt(charIndex);
              charIndex++;
              setTimeout(typeChar, speed);
            } else {
              typeChildNode();
            }
          }
          typeChar();
        } else {
          // If it's an element inside another (nested), just append it and continue
          wrapper.appendChild(child.cloneNode(true));
          typeChildNode();
        }
      }
      typeChildNode();
    } else {
      // Fallback: just clone and insert if it's a comment or unsupported node
      const clone = node.cloneNode(true);
      targetElement.insertBefore(clone, cursor);
      typeNextNode();
    }
  }
  typeNextNode();
  // Expose skip function
  return () => { skipTyping = true; if (typingSessionObj) typingSessionObj.skip = true; };
}

window.attachProfileEvents_moe = () => {
  const profileData_moe = [
  {
    name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span><br> An expert in urban development and construction management, she holds a PhD in the field and is currently Director of the Institute for Economic, Urban and Construction Research under the Vietnam Construction Association. Her long career includes serving as Deputy Director at both the Institute for Economic, Urban and Construction Research (2013–2018) and the Urban Development Agency under the Ministry of Construction (2008–2013). Her work spans legal frameworks, <span class="highlight-text-phrase-moe">urban planning</span> and architectural design, with a strong focus on sustainable and well-managed cities. She has led major initiatives on <span class="highlight-text-phrase-moe">green urban development</span>, <span class="highlight-text-phrase-moe">climate resilience</span> and policy advice for national and regional planning, with support from international partners such as the World Bank and ADB.`,
    img: "public/profilePhotos/nguyenhonghanh.jpg"
  },
  {
    name: `<span class="intro-people">Ms. Hoàng Thu Hà</span><br> Experienced accounting professional with over 10 years of financial management, reporting and compliance. Holds a Bachelor of Accounting degree and has successfully led accounting departments, managed financial payments, conducted audits and prepared accurate financial reports. Skilled in overseeing financial transactions, ensuring legal and regulatory compliance and supporting project finance activities. Proficient in <span class="highlight-text-phrase-moe"> accounting </span> software and known for strong work ethic, adaptability and attention to detail. Brings strong leadership and organizational skills with a focus on delivering accurate financial insights.`,
    img: "public/profilePhotos/hoangthuha.jpg"
  },
  {
    name: `<span class="intro-people">Dr. Lan Anh</span><br> Urban planning and development expert with over 20 years of experience in <span class="highlight-text-phrase-moe">strategic urban design</span>, policy making and sustainable development. PhD and Master's degrees from the University of Tokyo, with a strong background in <span class="highlight-text-phrase-moe">climate change adaptation</span>, urban classification law and national development strategy. Former Deputy General Director of the Vietnam Urban Development Agency, leading major programs on <span class="highlight-text-phrase-moe">resilience</span> and <span class="highlight-text-phrase-moe">urban planning</span> to 2050. Published researcher, educator and active member of key professional associations. Skilled in coordinating large-scale projects, regulatory frameworks and cross-sectoral collaboration. Fluent in multiple languages and passionate about shaping a sustainable, livable urban future.`,
    img: "public/profilePhotos/tranthilananh.jpg"
  },
  {
    name: `<span class="intro-people">Mr. Trần Quốc Toản</span><br> <span class="highlight-text-phrase-moe">Urban Planning</span> and <span class="highlight-text-phrase-moe">Climate Change</span> with over 15 years of experience in sustainable infrastructure, transport planning and <span class="highlight-text-phrase-moe">climate resilience</span>. Degree in Bridge and Tunnel Engineering and has held key leadership roles in the Vietnamese Ministry of Transport and civil engineering associations. Skilled in policy consulting, <span class="highlight-text-phrase-moe">smart city planning</span> and <span class="highlight-text-phrase-moe">green growth strategy development</span>. Led major national projects focused on urban mobility, environmental sustainability and regulatory reform. A respected lecturer and trainer for organizations such as the World Bank and ADB, known for his extensive expertise, strategic thinking and commitment to building a <span class="highlight-text-phrase-moe">climate resilient urban future</span>.`,
    img: "public/profilePhotos/tranquoctoan.jpg"
  },
  {
    name: `<span class="intro-people">Long Đỗ - Project Manager</span><br> A dedicated Project Officer with a Masters Degree in Project Management from the University of Salford, UK, along with CCNA and Cyber Security certifications. Over 5 years of extensive experience in banking, retail, (smart) contract management and finance, with a proven ability to manage complex projects and deliver effective results. Combines strong technical skills with practical implementation, ensuring seamless collaboration between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding and gaming. Experience in <span class="highlight-text-phrase-moe">design</span> and <span class="highlight-text-phrase-moe">creative problem solving</span>. <a href="https://en.longd.tech" target="_blank">🔧💬 View Profile</a>`,
    img: "public/profilePhotos/longdo.jpg"
  }
];


  let currentIndex = 0;
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const MIN_SWIPE_DISTANCE = 15;
  
  const textBox = document.getElementById('profile-text');
  const photo = document.getElementById('profile-photo');
  const container = document.querySelector('.image-container');

  // Visual cues: add left/right overlays
  if (textBox && !document.getElementById('profile-cue-left')) {
    const leftCue = document.createElement('div');
    leftCue.id = 'profile-cue-left';
    leftCue.style.position = 'absolute';
    leftCue.style.left = 0;
    leftCue.style.top = 0;
    leftCue.style.width = '40%';
    leftCue.style.height = '100%';
    leftCue.style.pointerEvents = 'none';
    leftCue.style.display = 'flex';
    leftCue.style.alignItems = 'center';
    leftCue.style.justifyContent = 'flex-start';
    leftCue.style.zIndex = 2;
    leftCue.innerHTML = '<span style="font-size:2rem;opacity:0.25;margin-left:8px;user-select:none;">&#8592;</span>';
    textBox.style.position = 'relative';
    textBox.appendChild(leftCue);
    const rightCue = document.createElement('div');
    rightCue.id = 'profile-cue-right';
    rightCue.style.position = 'absolute';
    rightCue.style.right = 0;
    rightCue.style.top = 0;
    rightCue.style.width = '40%';
    rightCue.style.height = '100%';
    rightCue.style.pointerEvents = 'none';
    rightCue.style.display = 'flex';
    rightCue.style.alignItems = 'center';
    rightCue.style.justifyContent = 'flex-end';
    rightCue.style.zIndex = 2;
    rightCue.innerHTML = '<span style="font-size:2rem;opacity:0.25;margin-right:8px;user-select:none;">&#8594;</span>';
    textBox.appendChild(rightCue);
  }

  let typingSessionObj = { skip: false };
  let isTyping = false;
  let skipOnNextClick = false;

  function updateProfile_moe (index, direction = 'right') {
    if (!textBox || !photo) return;
    const isFirstLoad = (currentIndex === 0 && index === 0);
    if (!isFirstLoad) {
      textBox.classList.add(direction === 'right' ? 'slide-exit-right' : 'slide-exit-left');
      photo.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
    }
    
    setTimeout(() => {
      textBox.innerHTML = "";
      const message = profileData_moe[index].name;
      const containerDiv = document.createElement("div");
      textBox.appendChild(containerDiv);
      typingSessionObj = { skip: false };
      isTyping = true;
      skipOnNextClick = false;
      typeHTMLString(containerDiv, message, 25, () => {
        gsap.fromTo(containerDiv, 
          { opacity: 0, y: 10, scale: 0.98 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power1.out" }
        );
        isTyping = false;
        skipOnNextClick = false;
      }, typingSessionObj);
      
      photo.src = profileData_moe[index].img;
      textBox.classList.remove('slide-exit-right', 'slide-exit-left');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
      const tl = gsap.timeline();
      tl.fromTo(photo, 
        { x: direction === 'right' ? -100 : 100, scale: 0.5, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.5, scale: 1, ease: "power2.out" }
      );
      tl.fromTo(textBox, 
        { x: direction === 'right' ? 100 : -100, scale: 1.5, opacity: 0 }, 
        { x: 0, opacity: 1, duration: 1.5, scale: 1, ease: "power2.out" },
        "-=0.5"
      );
    }, 300);
  };

  document.getElementById('moe-next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData_moe.length;
    updateProfile_moe(currentIndex, 'right');
  });
  document.getElementById('moe-prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData_moe.length) % profileData_moe.length;
    updateProfile_moe(currentIndex, 'left');
  });

  
  updateProfile_moe(0);

  if (textBox) {
      const handleClick = (e) => {
        if (isTyping) {
          typingSessionObj.skip = true;
          return;
        }
      };
      textBox.addEventListener('click', handleClick);
    }

  if (textBox && isTouchDevice) {
  const swipeElements = [container, textBox];
  let swipeLocked = false;

  swipeElements.forEach(el => {
    el.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;  // Track vertical position
    });

    el.addEventListener('touchend', (e) => {
      if (swipeLocked) return;

      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;  // Track vertical position

      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;

      // Ignore diagonal or mostly vertical swipes
      if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE || Math.abs(deltaY) > Math.abs(deltaX)) {
        return;  // Vertical or diagonal swipe
      }

      const swipeDistance = deltaX;

      if (Math.abs(swipeDistance) > MIN_SWIPE_DISTANCE) {
        swipeLocked = true;
          // Right swipe (next)
            if (swipeDistance > 0) {
                currentIndex = (currentIndex - 1 + profileData_moe.length) % profileData_moe.length;
                updateProfile_moe(currentIndex, 'left');
              }
              // Left swipe (previous)
              else {
                currentIndex = (currentIndex + 1) % profileData_moe.length;
                updateProfile_moe(currentIndex, 'right');
              }

              setTimeout(() => swipeLocked = false, 500); // Debounce
            }
          });
        });
      }
}

window.calendarModal = () => {
    const calendarIcon = document.querySelector('.calendar-icon svg');
    const calendarLink = document.querySelector('.calendar-icon');
    const calendarModal = document.getElementById('calendar-modal');
    const calendarModalContent = document.getElementById('calendar-modal-content');
    const calendarModalSvg = document.getElementById('calendar-modal-svg');
    const calendarModalClose = document.getElementById('calendar-modal-close');

if (calendarIcon && calendarLink && calendarModal && calendarModalSvg && calendarModalClose) {
        calendarLink.addEventListener('click', function(e) {
            // Clone the calendar SVG
            const clone = calendarIcon.cloneNode(true);
            // Clear previous
            calendarModalSvg.innerHTML = '';
            calendarModalSvg.appendChild(clone);
            // Style the SVG
            clone.style.width = '340px';
            clone.style.height = '340px';
            clone.style.display = 'block';
            calendarModal.style.display = 'flex';
        });
        calendarModalClose.addEventListener('click', function() {
            calendarModal.style.display = 'none';
        });
        // Close modal when clicking outside modal content
        calendarModal.addEventListener('click', function(e) {
            if (e.target === calendarModal) {
                calendarModal.style.display = 'none';
      }
  });
}}

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
    clearInterval(fakeProgress); 

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
              calendarModal(page);
              updateHamburgerIcon(page)
              
              switch (page) {
                case 'meetOurExperts':
                  attachProfileEvents_moe();
                  ICUEFooter.autoInject();
                  break;
                case 'coreTeam':
                  attachProfileEvents_coreTeam();
                  ICUEFooter.autoInject();
                  break;
                case 'Home':
                  makeItRainText();
                  realSlamnorSlam();
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
                case 'pastProjects':
                  handleAOSByScreenSize();
                  break;
                case 'orgStructure':
                  ICUEFooter.autoInject();
                  break;
                case 'FAQs':
                  initFrequentlyAskedQuestions();
                  ICUEFooter.autoInject();
                  break;
                case 'recruitment':
                  JobBoard.init();
                  ICUEFooter.autoInject();
                  break;
                case 'donations':
                  DonationForm.init();
                  ICUEFooter.autoInject();
                  break;
                case 'notableAwards':
                  AwardsPage.init();
                  ICUEFooter.autoInject();
                  break;
                case 'communityActivities':
                  CommunityPage.init();
                  ICUEFooter.autoInject();
                  break;
                case 'privacy':
                  ICUEFooter.autoInject();
                  break;
                case 'terms':
                  ICUEFooter.autoInject();
                  break;
                case 'gdpr':
                  ICUEFooter.autoInject();
                  break;
                case 'cookies':
                  ICUEFooter.autoInject();
                  break;
              }
            });
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

//🍔 MENU ICON ANIMATION
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

window.makeItRainText = () => {
  const el = document.querySelector("#rainText");
  if (!el) return;

  const text = el.textContent.trim();
  el.textContent = "";

  text.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.opacity = 0;
    el.appendChild(span);

    gsap.fromTo(
      span,
      { y: "-40vh", opacity: 0 },
      {
        y: 0,
        opacity: 1,
        delay: i * 0.25,
        duration: 3,
        ease: "bounce.out"
      }
    );
  });
};

// Call when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  window.makeItRainText();
});

window.realSlamnorSlam = function () {
  const text = document.querySelector('#textSlam .slam-text');
  const dust = document.querySelector('#textSlam .slam-dust');

  if (!text || !dust) {
    console.warn("Missing .slam-text or .slam-dust");
    return;
  }

  // Reset state
  gsap.set(text, {
    x: 0,
    y: 0,
    rotationX: 0,
    scale: 1.05,
    opacity: 0,
    transformOrigin: "50% 50%",
    perspective: 1000
  });

  gsap.set(dust, {
    scale: 0.5,
    opacity: 0,
    filter: "brightness(0.25)"
  });

  const tl = gsap.timeline();

  // 🌀 Spin + Drop Slam
  tl.to(text, {
    opacity: 1,
    x: 1000,
    y: 0,
    rotationX: 360,
    rotationY: 360,
    rotationZ: 360,
    scale: 1.05,
    duration: 1.5,
    ease: "back.out(1.7)",
    transformPerspective: 1200
  })

  // 💥 Slam Impact
  .to(text, {
    x: -1000,
    y: 0,
    scaleY: 1.05,
    scaleX: 1.05,
    duration: 0.7,
    ease: "power4.inOut"
  })

  // 👊 Bounce Back
  .to(text, {
    x: 0,
    y: 0,
    scaleY: 1,
    scaleX: 1,
    duration: 0.7,
    ease: "elastic.out(1, 0.5)"
  })

  // 💨 Dust Puff
  .to(dust, {
    opacity: 1,
    scale: 1.4,
    filter: "brightness(1.5)",
    duration: 0.75,
    ease: "power2.out"
  }, "-=1") // overlap dust with squash

  .to(dust, {
    opacity: 0,
    scale: 2.2,
    filter: "brightness(.75)",
    duration: 1.2,
    ease: "power2.in"
  }, "-=0.6"); // overlap exit
};

window.addEventListener("DOMContentLoaded", () => {
  realSlamnorSlam();
});

window.initHomeTextSlider = () => {
  // Clean up existing event listeners and intervals
  const sliderContainer = document.querySelector("#homeTextSlider");
  const dotsContainer = document.querySelector("#sliderDots");
  let isAnimating = false;
  let typingSessionId = 0;
  let isTyping = false;
  
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
    '10+ years of urban excellence. Dedicated Professionals who are passionate about <strong class="highlight-text-phrase"> urban planning </strong>, construction, and <strong class="highlight-text-phrase"> climate change. </strong> ⏳ ',
    `Built on Unity, <strong class="highlight-text-phrase"> Driven by Values! </strong> ​​We believe in <strong class="highlight-text-phrase"> giving back </strong>, and constantly striving for self-improvement. These <strong class="highlight-text-phrase"> core values </strong> ​​shape our approach & inspire our partnerships with local professionals, government agencies. 🤝 `,
    `Smart Cities, Smarter Solutions. We use technology and <strong class="highlight-text-phrase"> data-driven insights </strong> to improve <strong class="highlight-text-phrase"> efficiency </strong>, connectivity, and future-ready cities. 💡 `,
    `Led <strong class="highlight-text-phrase"> Đà Nẵng citywide </strong> planning initiative for both tier 1 and tier 2 cities — a transformational project that reflects our commitment to <strong class="highlight-text-phrase"> big-picture </strong> strategy and real results. 🏆 `,
    `Shaping cities, <strong class="highlight-text-phrase"> improving lives. </strong> Every solution we deliver is rooted in a mission: to create a better urban future that is inclusive, <strong class="highlight-text-phrase"> sustainable </strong> and <strong class="highlight-text-phrase"> people-centered. </strong> 🌱  `,
    `💥 Create beautiful <strong class="highlight-text-phrase"> experiences </strong> that last forever.`
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
    typingSessionId += 1;
    const thisSession = typingSessionId;
  
    const message = messages[index];
    const typingSpeed = 50;
  
    isTyping = true;
    textElement.innerHTML = "";
    gsap.killTweensOf(textElement);
  
    gsap.fromTo(
      textElement,
      { opacity: 0, scale: 0.95, y: 10 },
      {
        duration: 0.2,
        opacity: 1,
        scale: 1,
        y: 0,
        ease: "power2.out",
        onComplete: () => {
          typeHTMLString(textElement, message, typingSpeed, () => {
          isTyping = false;
          gsap.fromTo(textElement, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
        });
  
         
        }
      }
    );
  
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

  function nextText(force = false) {
    if (!isPaused || force) {
      index = (index + 1) % messages.length;
      updateText(index);
    }
  }
  
  function prevText(force = false) {
    if (!isPaused || force) {
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
  window.homeSliderIntervalId = setInterval(nextText, 15000);

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
      clearInterval(window.homeSliderIntervalId);
      window.homeSliderIntervalId = setInterval(nextText, 15000);
    }
  });

  // Click-to-navigate feature with double-click protection
  let lastClickTime = 0;
  sliderContainer.addEventListener("click", (event) => {
    const now = Date.now();
    if (now - lastClickTime < 200) return; // protect from double fire
    lastClickTime = now;

    const rect = sliderContainer.getBoundingClientRect();
    const clickX = event.clientX - rect.left;

    if (isTyping) {
      typingSessionId++; // 🔥 Cancel current typing
      isTyping = false;
      textElement.innerHTML = messages[index];
      // 🧾 Show full message
      gsap.to(textElement, { scale: 1, duration: 0.2, ease: "power1.out" });
      return;
    }

    if (clickX < rect.width / 2) {
      prevText(true);
    } else {
      nextText(true);
    }

    restartInterval();
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

      setTimeout(() => {
        submenu.classList.remove('closing');
      }, 300); 
    } else {
      submenu.classList.add('open');
    }
  });
});

window.OrgStructure = {
  showTab: function(tabName) {
      const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));
              
              // Remove active class from all tabs
              const tabs = document.querySelectorAll('.tab');
              tabs.forEach(tab => tab.classList.remove('active'));
              
              // Show selected tab content
              document.getElementById(tabName).classList.add('active');
              
              // Add active class to clicked tab
              event.target.classList.add('active');
          },

          downloadDocument: function(docName) {
              // Handle direct file paths (like 'public/files/...')
              if (docName.includes('/') || docName.includes('.')) {
                  const link = document.createElement('a');
                  link.href = docName;
                  link.download = docName.split('/').pop(); // Get filename from path
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  return;
              }
              
              const filePath = documentMap[docName];
              if (filePath) {
                  const link = document.createElement('a');
                  link.href = filePath;
                  link.download = filePath.split('/').pop();
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
              } else {
                  alert(`Document "${docName}" not found. Please check if the file exists.`);
              }
          },

          searchDocuments: function(searchTerm) {
              const categories = document.querySelectorAll('.document-category');
              const searchLower = searchTerm.toLowerCase();
              
              categories.forEach(category => {
                  const items = category.querySelectorAll('.document-list li');
                  let hasVisibleItems = false;
                  
                  items.forEach(item => {
                      const text = item.textContent.toLowerCase();
                      if (text.includes(searchLower)) {
                          item.style.display = 'block';
                          hasVisibleItems = true;
                      } else {
                          item.style.display = 'none';
                      }
                  });
                  
                  category.style.display = hasVisibleItems || searchTerm === '' ? 'block' : 'none';
              });
          }
      };

    window.showTab = window.OrgStructure.showTab;
    window.downloadDocument = window.OrgStructure.downloadDocument;
    window.searchDocuments = window.OrgStructure.searchDocuments;

window.initFrequentlyAskedQuestions = function() {
    let currentOpenCategory = null; // Track currently open category
        const faqData = {
          services: [
              { q: "Question - What types of consulting services do you provide?", a: "Answer: We provide consulting in planning, design, project management, supervision, and legal procedure support." },
              { q: "Question - Do you take on small residential projects?", a: "Answer: Yes, we handle everything from residential housing to commercial and industrial buildings." }
          ],
          process: [
              { q: "Question - What is the collaboration process like?", a: "Answer: The process includes: initial consultation → site survey → preliminary design → finalized drawings → construction support." },
              { q: "Question - Can I make changes to the design during the process?", a: "Answer: Yes, clients have the right to request revisions at different stages before finalizing the drawings." }
          ],
          costs: [
              { q: "Question - How are service fees calculated?", a: "Answer: Fees can be charged as a package, as a percentage of total investment, or hourly depending on the project type." },
              { q: "Question - Do you allow payment in installments?", a: "Answer: Yes, we accept flexible payments according to project phases." }
          ],
          legal: [
              { q: "Question - Do you assist with building permits?", a: "Answer: Yes, we provide full support from preparing documents to submitting them to the authorities." },
              { q: "Question - What documents do clients need to provide?", a: "Answer: Typically: land ownership papers, current site drawings, and relevant legal documents." }
          ],
          timeline: [
              { q: "Question - How long does it take to complete a project?", a: "Answer: Depending on scale, usually 2-6 months for design and 6-18 months for construction." },
              { q: "Question - What if the project is delayed?", a: "Answer: We immediately report delays, propose solutions, and commit to catching up when possible." }
          ],
          technology: [
              { q: "Question - Do you use BIM technology?", a: "Answer: Yes, we use BIM and 3D modeling to help clients clearly visualize the design." },
              { q: "Question - Do you offer green design solutions?", a: "Answer: Yes, we prioritize sustainable materials and energy-saving solutions." }
          ],
          clients: [
              { q: "Question - Who are your main clients?", a: "Answer: We serve individuals, businesses, and government agencies." },
              { q: "Question - Do you provide maintenance support after handover?", a: "Answer: Yes, we offer after-sales service and maintenance upon request." }
          ],
          general: [
              { q: "Question - Can I see your past projects?", a: "Answer: Yes, please contact us to receive our portfolio and project list." },
              { q: "Question - What’s the fastest way to contact you?", a: "Answer: You can call our hotline directly or send an email, we respond within 24 hours." }
          ]
      };
      
      function openCategory(category) {
            // Find the clicked card first
            const clickedCard = event.target.closest('.faq-card');
            
            // Clear any existing answers with animation
            const existingAnswers = document.querySelectorAll('.faq-answer-section');
            if (existingAnswers.length > 0) {
                gsap.to(existingAnswers, {
                    duration: 0.3,
                    height: 0,
                    opacity: 0,
                    ease: "power2.inOut",
                    onComplete: () => {
                        existingAnswers.forEach(section => section.remove());
                    }
                });
            }
            
            // Remove active state from all cards with animation
            const allCards = document.querySelectorAll('.faq-card');
            gsap.to(allCards, {
                duration: 0.2,
                scale: 1,
                ease: "power2.out",
                onComplete: () => {
                    allCards.forEach(card => card.classList.remove('active'));
                }
            });
            
            // If clicking the same category that's already open, just close it
            if (currentOpenCategory === category) {
                currentOpenCategory = null;
                return;
            }
            
            // Set new current category
            currentOpenCategory = category;
            
            if (faqData[category] && clickedCard) {
                // Animate clicked card
                gsap.to(clickedCard, {
                    duration: 0.3,
                    scale: 1.02,
                    ease: "back.out(1.7)",
                    onComplete: () => {
                        clickedCard.classList.add('active');
                    }
                });
                
                // Create the FAQ section
                const section = document.createElement("div");
                section.classList.add("faq-answer-section");
                
                // Set initial state for animation
                gsap.set(section, {
                    height: 0,
                    opacity: 0,
                    overflow: "hidden"
                });
                
                faqData[category].forEach((item, index) => {
                    const div = document.createElement("div");
                    div.classList.add("faq-answer");
                    div.innerHTML = `
                        <h4 class="faq-question" onclick="toggleAnswer(this)">${item.q}</h4>
                        <div class="faq-answer-text" style="display: none;">${item.a}</div>
                    `;
                    
                    // Set initial animation state for each FAQ item
                    gsap.set(div, {
                        y: 20,
                        opacity: 0
                    });
                    
                    section.appendChild(div);
                });
                
                // Insert the section after the clicked card
                clickedCard.insertAdjacentElement('afterend', section);
                
                // Animate section appearance
                gsap.to(section, {
                    duration: 0.5,
                    height: "auto",
                    opacity: 1,
                    ease: "power2.out",
                    delay: 0.1
                });
                
                // Stagger animate FAQ items
                const faqItems = section.querySelectorAll('.faq-answer');
                gsap.to(faqItems, {
                    duration: 0.4,
                    y: 0,
                    opacity: 1,
                    ease: "power2.out",
                    stagger: 0.1,
                    delay: 0.3
                });
            }
        }
    
        function toggleAnswer(el) {
            const p = el.nextElementSibling;
            if (p && p.classList.contains('faq-answer-text')) {
                const isOpen = p.style.display === "block";
                
                if (isOpen) {
                    // Closing animation
                    gsap.to(p, {
                        duration: 0.3,
                        height: 0,
                        opacity: 0,
                        ease: "power2.inOut",
                        onComplete: () => {
                            p.style.display = "none";
                            p.style.height = "auto"; // Reset height for next opening
                        }
                    });
                    
                    // Animate question
                    gsap.to(el, {
                        duration: 0.2,
                        scale: 1,
                        backgroundColor: "#fff",
                        ease: "power2.out"
                    });
                } else {
                    // Opening animation
                    p.style.display = "block";
                    gsap.set(p, { height: 0, opacity: 0 });
                    
                    gsap.to(p, {
                        duration: 0.4,
                        height: "auto",
                        opacity: 1,
                        ease: "power2.out"
                    });
                    
                    // Animate question
                    gsap.to(el, {
                        duration: 0.2,
                        scale: 1.01,
                        backgroundColor: "#bbdefb",
                        ease: "back.out(1.7)"
                    });
                }
                
                // Toggle expanded class
                el.classList.toggle('expanded');
            }
        }
      
          // Make functions globally available
          window.openCategory = openCategory;
          window.toggleAnswer = toggleAnswer;
      
          return {
              openCategory,
              toggleAnswer
          };
      };

// Global Job Board Function
window.JobBoard = (function() {
  'use strict';
  
  const jobPositions = [
      {
          title: "Head of Technology Assistant",
          department: "Technology",
          location: "Hanoi, Vietnam",
          description: "We’re looking for a tech-savvy, organized pro to support our CTO and tech leadership. Help manage projects, streamline workflows, and keep our tech teams firing on all cylinders.",
          tags: ["Tech understanding + admin/project skills", "Great communication & organization", "Proactive, solution-oriented mindset", "Full-time"]
      },
      {
          title: "Research Intern",
          department: "Administration",
          location: "Hanoi, Vietnam",
          description: "Join our team to explore new technologies, support innovative projects, and learn from top experts in the field. This is a part-time internship with flexible hours.",
          tags: ["Curiosity and passion for research", "Willingness to learn and contribute", "Strong analytical and problem-solving skills", "Part-time"]
      },
      {
          title: "Data Analyst",
          department: "Data & Analytics",
          location: "Ho Chi Minh City, Vietnam",
          description: "Analyze energy data to optimize performance and predict trends. Use Python, SQL, and machine learning tools.",
          tags: ["Python", "SQL", "Machine Learning", "Analytics", "Full-time"]
      },
  ];

  // Function to render job positions
  function renderJobs(jobs) {
      const jobsContainer = document.getElementById('jobs-container');
      if (!jobsContainer) {
          // Only log error if we're on a careers/jobs page
          if (window.location.hash && window.location.hash.toLowerCase().includes('career')) {
              console.error('Jobs container not found');
          }
          return;
      }
      
      jobsContainer.innerHTML = '';

      jobs.forEach(job => {
          const jobCard = document.createElement('div');
          jobCard.className = 'job-card';
          jobCard.onclick = () => openJobDetail(job);
          
          jobCard.innerHTML = `
              <h3 class="job-title">${job.title}</h3>
              <div class="job-department">${job.department}</div>
              <div class="job-location"><svg width="16px" height="16px" viewBox="-3 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pin_sharp_circle [#624]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-223.000000, -5439.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M176,5286.219 C176,5287.324 175.105,5288.219 174,5288.219 C172.895,5288.219 172,5287.324 172,5286.219 C172,5285.114 172.895,5284.219 174,5284.219 C175.105,5284.219 176,5285.114 176,5286.219 M174,5296 C174,5296 169,5289 169,5286 C169,5283.243 171.243,5281 174,5281 C176.757,5281 179,5283.243 179,5286 C179,5289 174,5296 174,5296 M174,5279 C170.134,5279 167,5282.134 167,5286 C167,5289.866 174,5299 174,5299 C174,5299 181,5289.866 181,5286 C181,5282.134 177.866,5279 174,5279" id="pin_sharp_circle-[#624]"> </path> </g> </g> </g> </g></svg>${job.location}</div>
              <div class="job-description">${job.description}</div>
              <div class="job-tags">
                  ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
              </div>
          `;
          
          jobsContainer.appendChild(jobCard);
      });
  }

  // Function to search jobs
  function searchJobs(event) {
      event.preventDefault();
      const searchTerm = document.getElementById('job-search').value.toLowerCase();
      
      if (!searchTerm) {
          renderJobs(jobPositions);
          return;
      }

      const filteredJobs = jobPositions.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.department.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );

      renderJobs(filteredJobs);
      
      // Show search results message
      const resultMessage = filteredJobs.length === 0 
          ? `No positions found for "${searchTerm}"`
          : `Found ${filteredJobs.length} position(s) matching "${searchTerm}"`;
          
      showSearchMessage(resultMessage);
  }

  // Function to show search message
  function showSearchMessage(message) {
      const existingMessage = document.querySelector('.search-result-message');
      if (existingMessage) {
          existingMessage.remove();
      }

      const messageDiv = document.createElement('div');
      messageDiv.className = 'search-result-message';
      messageDiv.style.cssText = `
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          margin: 20px 0;
          color: #666;
          font-weight: 500;
      `;
      messageDiv.textContent = message;

      const jobsContainer = document.getElementById('jobs-container');
      jobsContainer.parentNode.insertBefore(messageDiv, jobsContainer);
  }

  // Initialize jobs on page load
  function initialize() {
      renderJobs(jobPositions);
      
      // Smooth scroll for CTA button
      const ctaButton = document.querySelector('.cta-button');
      if (ctaButton) {
          ctaButton.addEventListener('click', function(e) {
              e.preventDefault();
              const openPositions = document.getElementById('open-positions');
              if (openPositions) {
                  openPositions.scrollIntoView({
                      behavior: 'smooth'
                  });
              }
          });
      }
  }

  // Public API - expose these functions globally
  return {
      init: initialize,
      renderJobs: renderJobs,
      searchJobs: searchJobs,
      getJobPositions: () => [...jobPositions], // Return a copy to prevent mutation
      addJob: (job) => {
          jobPositions.push(job);
          renderJobs(jobPositions);
      },
      removeJob: (title) => {
          const index = jobPositions.findIndex(job => job.title === title);
          if (index > -1) {
              jobPositions.splice(index, 1);
              renderJobs(jobPositions);
          }
      }
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  if (window.JobBoard) {
      window.JobBoard.init();
  }
});

window.DonationForm = (function () {
  let selectedAmount = 0;
  let selectedFrequency = "monthly";

  // Function to select donation amount
  function selectAmount(button, amount) {
    // Remove active class from all amount buttons
    document.querySelectorAll('.amount-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Add active class to clicked button
    button.classList.add('active');

    // Update selected amount
    selectedAmount = amount;
    const donateAmountElement = document.getElementById('donateAmount');
    if (donateAmountElement) {
      donateAmountElement.textContent = amount;
    }

    // Clear custom amount input if it exists
    const customAmountInput = document.getElementById('customAmount');
    if (customAmountInput) {
      customAmountInput.value = '';
    }
  }

  // Function to update custom amount
  function updateCustomAmount(input) {
    const customAmount = parseInt(input.value);
    if (customAmount && customAmount > 0) {
      // Remove active class from preset buttons
      document.querySelectorAll('.amount-btn').forEach(btn => {
        btn.classList.remove('active');
      });

      // Update selected amount
      selectedAmount = customAmount;
      const donateAmountElement = document.getElementById('donateAmount');
      if (donateAmountElement) {
        donateAmountElement.textContent = customAmount;
      }
    }
  }

  // Function to select donation frequency
  function selectFrequency(option, frequency) {
    // Remove active class from all frequency options
    document.querySelectorAll('.donation-option').forEach(opt => {
      opt.classList.remove('active');
    });

    // Add active class to clicked option
    option.classList.add('active');

    // Update selected frequency
    selectedFrequency = frequency;
  }

  // Function to process donation
  function processDonation(event) {
    event.preventDefault();

    // Get form data
    const formData = new FormData(event.target);
    const donationData = {
      amount: selectedAmount,
      frequency: selectedFrequency,
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      company: formData.get('company')
    };

    // Validate required fields
    if (!donationData.firstName || !donationData.lastName || !donationData.email) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate amount
    if (!selectedAmount || selectedAmount <= 0) {
      alert('Please select a valid donation amount.');
      return;
    }

    // Stripe Integration - Create checkout session and redirect
    fetch('/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(donationData)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(session => {
      // Redirect to Stripe Checkout
      window.location.href = session.url;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('Donations Not Available Right Now, Please Try Again in a Few Months.');
    });

    console.log('Donation data:', donationData);
  }

  // Initialize page
  function init() {
    // Check if donateAmount element exists before trying to set its content
    const donateAmountElement = document.getElementById('donateAmount');
    if (donateAmountElement) {
      donateAmountElement.textContent = selectedAmount;
    }

    // Add hover effects to cards
    const cards = document.querySelectorAll('.award-card, .project-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', function () {
        this.style.transform = 'translateY(-5px)';
      });
      card.addEventListener('mouseleave', function () {
        this.style.transform = 'translateY(0)';
      });
    });
  }

  // Run init after DOM is ready
  document.addEventListener('DOMContentLoaded', init);

  // Public API (accessible globally as window.DonationForm)
  return {
    selectAmount,
    updateCustomAmount,
    selectFrequency,
    processDonation,
    init
  };
})();

// Make selectAmount globally accessible for onclick handlers
window.selectAmount = function(button, amount) {
  if (window.DonationForm && window.DonationForm.selectAmount) {
    window.DonationForm.selectAmount(button, amount);
  }
};

// Make other donation functions globally accessible for onclick handlers
window.updateCustomAmount = function(input) {
  if (window.DonationForm && window.DonationForm.updateCustomAmount) {
    window.DonationForm.updateCustomAmount(input);
  }
};

window.selectFrequency = function(option, frequency) {
  if (window.DonationForm && window.DonationForm.selectFrequency) {
    window.DonationForm.selectFrequency(option, frequency);
  }
};

window.processDonation = function(event) {
  if (window.DonationForm && window.DonationForm.processDonation) {
    window.DonationForm.processDonation(event);
  }
};

window.AwardsPage = (function () {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    let observer;

    function init() {
      // Create observer if not already created
      if (!observer) {
        observer = new IntersectionObserver(handleIntersect, observerOptions);
      }

      // Observe award cards
      const cards = document.querySelectorAll('.award-card, .cert-card, .timeline-item');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
      });

      console.log('Awards page loaded successfully');
    }

    function handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }

    // Expose public API
    return {
      init
    };
  })();

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    if (window.AwardsPage && typeof window.AwardsPage.init === 'function') {
      window.AwardsPage.init();
    }
  });

 window.CommunityPage = {
    init: function () {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      // Animate photo items
      const photoItems = document.querySelectorAll('.photo-item');
      photoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
      });

      // Floating elements parallax scroll
      window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        const floatingElements = document.querySelector('.floating-elements');
        if (floatingElements) {
          floatingElements.style.transform = `translateY(${rate}px)`;
        }
      });

      // Community buttons interaction
      document.querySelectorAll('.community-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();

          if (btn.textContent.includes('Discord')) {
            btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.074.034c-.21.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.407-.874-.618-1.249a.07.07 0 00-.074-.034 19.736 19.736 0 00-4.885 1.515.064.064 0 00-.03.027C2.96 9.045 2.154 13.58 2.478 18.057a.082.082 0 00.031.057c2.052 1.507 4.041 2.422 5.992 3.029a.07.07 0 00.074-.027c.461-.63.873-1.295 1.226-1.994a.07.07 0 00-.041-.098c-.65-.249-1.263-.557-1.845-.914a.07.07 0 01-.007-.115c.124-.093.248-.19.366-.287a.07.07 0 01.073-.01c3.861 1.773 8.027 1.773 11.863 0a.07.07 0 01.074.01c.118.097.242.194.366.287a.07.07 0 01-.006.115 12.298 12.298 0 01-1.846.913.07.07 0 00-.04.099c.36.698.772 1.362 1.225 1.993a.07.07 0 00.074.028c1.962-.607 3.95-1.522 6.002-3.029a.07.07 0 00.031-.056c.5-6.933-1.043-11.436-4.548-13.661a.061.061 0 00-.03-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
              </svg>
            `;
            setTimeout(() => {
              btn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.369a19.791 19.791 0 00-4.885-1.515.07.07 0 00-.074.034c-.21.375-.444.864-.608 1.249-1.844-.276-3.68-.276-5.486 0-.164-.393-.407-.874-.618-1.249a.07.07 0 00-.074-.034 19.736 19.736 0 00-4.885 1.515.064.064 0 00-.03.027C2.96 9.045 2.154 13.58 2.478 18.057a.082.082 0 00.031.057c2.052 1.507 4.041 2.422 5.992 3.029a.07.07 0 00.074-.027c.461-.63.873-1.295 1.226-1.994a.07.07 0 00-.041-.098c-.65-.249-1.263-.557-1.845-.914a.07.07 0 01-.007-.115c.124-.093.248-.19.366-.287a.07.07 0 01.073-.01c3.861 1.773 8.027 1.773 11.863 0a.07.07 0 01.074.01c.118.097.242.194.366.287a.07.07 0 01-.006.115 12.298 12.298 0 01-1.846.913.07.07 0 00-.04.099c.36.698.772 1.362 1.225 1.993a.07.07 0 00.074.028c1.962-.607 3.95-1.522 6.002-3.029a.07.07 0 00.031-.056c.5-6.933-1.043-11.436-4.548-13.661a.061.061 0 00-.03-.028zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.955 2.419-2.157 2.419zm7.974 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.095 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z"/>
                </svg>
                Join Discord
              `;
            }, 2000);
          } else {
            btn.innerHTML = `
              <svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 59.312 59.312" xml:space="preserve" fill="#000" stroke="#000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:#ffffff;" d="M41.507,0c-9.225,0-16.729,7.504-16.729,16.728c0,2.829,0.711,5.492,1.956,7.831L2.525,48.979 c-1.944,1.962-1.93,5.127,0.031,7.071c0.975,0.967,2.248,1.449,3.52,1.449c1.287,0,2.573-0.494,3.551-1.479l2.831-2.855 l6.148,6.147l3.662-3.662l-2.951-3.027l2.148-2.094l2.924,3l2.702-2.701l-6.185-6.186l12.945-13.059 c2.297,1.188,4.896,1.872,7.656,1.872c9.224,0,16.728-7.504,16.728-16.728S50.73,0,41.507,0z M41.507,27.456 c-5.917,0-10.729-4.812-10.729-10.728S35.59,6,41.507,6c5.915,0,10.728,4.812,10.728,10.728S47.422,27.456,41.507,27.456z"></path> </g> </g></svg>
              Searching...
            `;
            setTimeout(() => {
              btn.innerHTML = `
                <svg height="20px" width="20px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 59.312 59.312" xml:space="preserve" fill="#000" stroke="#000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:#ffffff;" d="M41.507,0c-9.225,0-16.729,7.504-16.729,16.728c0,2.829,0.711,5.492,1.956,7.831L2.525,48.979 c-1.944,1.962-1.93,5.127,0.031,7.071c0.975,0.967,2.248,1.449,3.52,1.449c1.287,0,2.573-0.494,3.551-1.479l2.831-2.855 l6.148,6.147l3.662-3.662l-2.951-3.027l2.148-2.094l2.924,3l2.702-2.701l-6.185-6.186l12.945-13.059 c2.297,1.188,4.896,1.872,7.656,1.872c9.224,0,16.728-7.504,16.728-16.728S50.73,0,41.507,0z M41.507,27.456 c-5.917,0-10.729-4.812-10.729-10.728S35.59,6,41.507,6c5.915,0,10.728,4.812,10.728,10.728S47.422,27.456,41.507,27.456z"></path> </g> </g></svg>
                Find Local Chapter
              `;
            }, 2000);
          }
        });
      });
    }
  };

  // Auto-init when DOM is ready (optional, can remove if you only want manual call)
  document.addEventListener('DOMContentLoaded', () => {
    if (window.CommunityPage && typeof window.CommunityPage.init === 'function') {
      window.CommunityPage.init();
    }
  });

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
  {
    name: `<span class="intro-core">Nguyễn Thị Ly</span> Strong academic background in urban planning, <span class="highlight-text-phrase-core">sustainable urban development</span>, <span class="highlight-text-phrase-core">infrastructure management</span> and <span class="highlight-text-phrase-core">public space design</span>. Contribute to numerous research and technical assistance projects focusing on public spaces, community development and urban development programs. Demonstrate excellent teamwork spirit, clear organizational skills and a high sense of responsibility. Proactive, eager to learn and committed to advancing the profession through participation in urban projects that prioritize <span class="highlight-text-phrase-core">sustainable</span> and <span class="highlight-text-phrase-core">environmentally friendly solutions</span>.`,
    img: "public/profilePhotos/lyly.png"
  },
  {
    name: `<span class="intro-core">Đinh Tùng Dương</span> I hold a degree in Urban Management from Hanoi Architectural University, where I was honored to be named Hanoi's Valedictorian in 2023. Over the past two years, I have been actively contributing to urban development projects focusing on <span class="highlight-text-phrase-core">spatial planning</span>, <span class="highlight-text-phrase-core">landscape improvement</span>, and <span class="highlight-text-phrase-core">sustainable urban living</span>. I have strong analytical and organizational skills, along with proficiency in both office and technical software. I am committed to continuous professional development and aim to contribute effectively to a progressive, reputable organization.`,
    img: "public/profilePhotos/duong.png"
  },
  {
    name: `<span class="intro-core">Nguyễn Thanh Tâm</span> Dedicated professional specializing in <span class="highlight-text-phrase-core">quantity surveying</span>, <span class="highlight-text-phrase-core">detailed planning</span> and <span class="highlight-text-phrase-core">technical drawing</span>. With strong team working skills and a reliable, hard-working approach, I contribute effectively to collaborative projects and office operations. As an active partner of ICUE, I have built strong networks with local authorities, ensuring smooth communication and project support. I am proficient in routine administrative tasks, project documentation and on-site coordination. I am passionate about contributing to the team and supporting the growth and success of the organization.`,
    img: "public/profilePhotos/tam.png"
  },
  {
    name: `<span class="intro-core">Trịnh Thị Tình</span> Graduated from Hanoi College of Tourism with a major in Business Administration. In addition to managing office administrative tasks, I also contribute and support various <span class="highlight-text-phrase-core">scientific research projects</span>. I am a dynamic and responsible individual, always <span class="highlight-text-phrase-core">eager to learn</span> and develop. With a high sense of detail and responsibility, I value teamwork and apply the accumulated experience to bring about quality results. I wish to further develop my career in a professional environment where I can actively contribute to the success of the organization.`,
    img: "public/profilePhotos/tinh.png"
  },
  {
    name: `<span class="intro-core">Nguyễn Quỳnh Ly</span> I graduated from the National Economics University, have a thorough training and a high sense of responsibility in my work. I have experience in <span class="highlight-text-phrase-core">bidding for machinery and equipment projects</span>, as well as projects related to <span class="highlight-text-phrase-core">urban planning</span>. In addition, I am capable of handling various administrative tasks. These roles have helped me build strong technical and teamwork skills. I wish to work in a professional environment where I can apply my abilities and contribute to the development of the organization.`,
    img: "public/profilePhotos/lyicue.png"
  },
  {
    name: `<span class="intro-core">Phan Thị Hiến</span> Graduated from Hanoi Open University with a major in accounting. Currently, I am working in the accounting field. With experience, I have accumulated a lot of knowledge and skills in accounting, <span class="highlight-text-phrase-core">financial reporting</span> and <span class="highlight-text-phrase-core">data analysis</span>. I always pay attention to accuracy and transparency in my work. In addition, I also have the ability to work in a team, which helps me coordinate effectively with other departments. I hope to continue to develop my accounting career and contribute to the success of the company.`,
    img: "public/profilePhotos/hien.png"
  }
];

  let currentIndex = 0;

  const textBox = document.getElementById('profile-text-coreTeam');
  const photo = document.getElementById('profile-photo-coreTeam');
  const container = document.getElementById('profile-text-coreTeam')?.parentElement;

  // Visual cues: add left/right overlays
  if (textBox && !document.getElementById('profile-cue-left-core')) {
    const leftCue = document.createElement('div');
    leftCue.id = 'profile-cue-left-core';
    leftCue.style.position = 'absolute';
    leftCue.style.left = 0;
    leftCue.style.top = 0;
    leftCue.style.width = '40%';
    leftCue.style.height = '100%';
    leftCue.style.pointerEvents = 'none';
    leftCue.style.display = 'flex';
    leftCue.style.alignItems = 'center';
    leftCue.style.justifyContent = 'flex-start';
    leftCue.style.zIndex = 2;
    leftCue.innerHTML = '<span style="font-size:2rem;opacity:0.25;margin-left:8px;user-select:none;">&#8592;</span>';
    textBox.style.position = 'relative';
    textBox.appendChild(leftCue);
    const rightCue = document.createElement('div');
    rightCue.id = 'profile-cue-right-core';
    rightCue.style.position = 'absolute';
    rightCue.style.right = 0;
    rightCue.style.top = 0;
    rightCue.style.width = '40%';
    rightCue.style.height = '100%';
    rightCue.style.pointerEvents = 'none';
    rightCue.style.display = 'flex';
    rightCue.style.alignItems = 'center';
    rightCue.style.justifyContent = 'flex-end';
    rightCue.style.zIndex = 2;
    rightCue.innerHTML = '<span style="font-size:2rem;opacity:0.25;margin-right:8px;user-select:none;">&#8594;</span>';
    textBox.appendChild(rightCue);
  }

  let typingSessionObj = { skip: false };
  let isTyping = false;
  let skipOnNextClick = false;

  window.updateProfile_coreTeam = (index, direction = 'right') => {
    if (!textBox || !photo) return;
    const isFirstLoad = (currentIndex === 0 && index === 0);
    if (!isFirstLoad) {
      textBox.classList.add(direction === 'right' ? 'slide-exit-left' : 'slide-exit-right');
      photo.classList.add(direction === 'right' ? 'slide-exit-right' : 'slide-exit-left');
    }
    setTimeout(() => {
      textBox.innerHTML = "";
      const message = profileData_coreTeam[index].name;
      const containerDiv = document.createElement("div");
      textBox.appendChild(containerDiv);
      typingSessionObj = { skip: false };
      isTyping = true;
      skipOnNextClick = false;
      typeHTMLString(containerDiv, message, 30, () => {
        gsap.fromTo(containerDiv, 
          { opacity: 0, y: 10, scale: 0.98 }, 
          { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: "power1.out" }
        );
        isTyping = false;
        skipOnNextClick = false;
      }, typingSessionObj);
      photo.src = profileData_coreTeam[index].img;
      textBox.classList.remove('slide-exit-left', 'slide-exit-right');
      photo.classList.remove('slide-exit-left', 'slide-exit-right');
      
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

  document.getElementById('core-next-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'right');
  });

  document.getElementById('core-prev-btn')?.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + profileData_coreTeam.length) % profileData_coreTeam.length;
    updateProfile_coreTeam(currentIndex, 'left');
  });

  updateProfile_coreTeam(0);
  
  if (textBox) {
      const handleClick = (e) => {
        if (isTyping) {
          typingSessionObj.skip = true;
          return;
        }
      };
      textBox.addEventListener('click', handleClick);
    }

    if (textBox && isTouchDevice) {
      const swipeTarget = container || textBox; // fallback if container is null
      let swipeLocked = false;
      const MIN_SWIPE_DISTANCE = 25;

      let touchStartX = 0;
      let touchStartY = 0;

      swipeTarget.addEventListener('touchstart', (e) => {
        const touch = e.changedTouches[0];
        touchStartX = touch.screenX;
        touchStartY = touch.screenY;
      });

      swipeTarget.addEventListener('touchend', (e) => {
        if (swipeLocked) return;

        const touch = e.changedTouches[0];
        const touchEndX = touch.screenX;
        const touchEndY = touch.screenY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        // Ignore diagonal or mostly vertical swipes
        if (Math.abs(deltaX) < MIN_SWIPE_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY)) return;
          swipeLocked = true;
          if (deltaX > 0) {
            // Swipe right = previous profile
            currentIndex = (currentIndex - 1 + profileData_coreTeam.length) % profileData_coreTeam.length;
            updateProfile_coreTeam(currentIndex, 'left');
          } else if (deltaX < 0) {
            // Swipe left = next profile
            currentIndex = (currentIndex + 1) % profileData_coreTeam.length;
            updateProfile_coreTeam(currentIndex, 'right');
          }
          setTimeout(() => swipeLocked = false, 500);
      });
    }
  }

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
  const cards = document.querySelectorAll(".card.image-card");
  const gridContainer = document.querySelector("main.grid");

  if (!cards.length || !gridContainer) return;

  // Detect touch device
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  let currentIndex = 0;
  let startX = 0;
  let endX = 0;

  function updateSlider() {
    if (window.innerWidth <= 1440 && isTouchDevice) {
      // Apply slider styles for touch devices
      Object.assign(gridContainer.style, {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        touchAction: "pan-y"
      });

      // Show only one card at a time
      cards.forEach((card, i) => {
        card.style.display = i === currentIndex ? "block" : "none";
      });

    } else {
      // Use CSS grid for non-touch devices
      gridContainer.style.display = "grid";

      // Show all cards
      cards.forEach(card => {
        card.style.display = "block";
      });
    }
  }

  function handleSwipe() {
    if (endX < startX - 50) {
      currentIndex = (currentIndex + 1) % cards.length;
      updateSlider();
    } else if (endX > startX + 50) {
      currentIndex = (currentIndex - 1 + cards.length) % cards.length;
      updateSlider();
    }
  }

  // Only add swipe events for touch devices
  if (isTouchDevice) {
    gridContainer.addEventListener("touchstart", e => {
      startX = e.touches[0].clientX;
    });

    gridContainer.addEventListener("touchend", e => {
      endX = e.changedTouches[0].clientX;
      handleSwipe();
    });
  }

  updateSlider();
  window.addEventListener("resize", updateSlider);
};

  document.addEventListener("DOMContentLoaded", () => {
    window.initMobileNewsSlider();
  });

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

    const month = now.toLocaleString('en-US', { month: 'long' });

    const day = now.getDate();

    let hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // The hour '0' (midnight) should be '12'
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

    const timeString = `${hours}:${formattedMinutes}${ampm}`;

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

window.triggerFanfare = () => {
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
  
    window.__audioVisualizer = {
      audio,
      ctx,
      analyser,
      freqData
    };
  }
  
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
        const scale = Math.max(0.5, value / 180);
        bar.style.transform = `scaleY(${scale})`;
      });
    }
  
    loop();
  }
  
  window.addEventListener('DOMContentLoaded', () => {
    startAudioVisualizerLoop();
  });

  function updateMusicBarColor(page) {
    const paths = document.querySelectorAll('.music-bars svg path');
  
    let color = '#000000'; // default
  
    switch (page) {
      case 'ourWork':
        color = '#ffcc00';
        break;
      case 'Contact':
        color = '#210000ff';
        break;
      case 'Home':
        color = '#ffffff';
        break;
      case 'pastProjects':
        color = '#a1c900ff';
        break;
      case 'communityActivities':
        color = '#ffffff';
        break;
    }
  
    paths.forEach(path => {
      path.setAttribute('stroke', color);
      path.setAttribute('fill', color); 
    });
  }

  // Function to change hamburger menu icon color based on page background
  function updateHamburgerIcon(page) {
    const hamburgerIcon = document.getElementById('menuIcon');
    const contactLink = document.getElementById('contactLink');
    if (!hamburgerIcon) return;
    
    // Pages with dark backgrounds that need white icons
    const darkBackgroundPages = ['communityActivities', 'aboutUs'];
    
    if (darkBackgroundPages.includes(page)) {
      hamburgerIcon.style.stroke = 'white';
      hamburgerIcon.style.strokeWidth = '0.5px';
      hamburgerIcon.style.fill = 'none';
      contactLink.style.color = 'white';
    } else {
      hamburgerIcon.style.stroke = 'none';
      hamburgerIcon.style.fill = 'none';
    }
  }

  function enableCursorGradientTrail(color = 'yellow') {
    document.addEventListener('mousemove', (e) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';

      trail.style.background = `radial-gradient(circle, ${color}, transparent 60%)`;
  
      // Position at mouse location
      trail.style.left = `${e.clientX}px`;
      trail.style.top = `${e.clientY}px`;
  
      document.body.appendChild(trail);
  
      setTimeout(() => {
        trail.remove();
      }, 500); 
    });
  }

  enableCursorGradientTrail(); // Default: yellow
  
window.preloadProfileImages = () => {
  // Images for meetourexperts.html
  const expertImages = [
    "public/profilePhotos/nguyenhonghanh.jpg",
    "public/profilePhotos/hoangthuha.jpg",
    "public/profilePhotos/tranthilananh.jpg",
    "public/profilePhotos/tranquoctoan.jpg",
    "public/profilePhotos/longdo.jpg"
  ];
  // Images for coreTeam.html
  const coreTeamImages = [
    "public/profilePhotos/lyly.png",
    "public/profilePhotos/duong.png",
    "public/profilePhotos/tam.png",
    "public/profilePhotos/tinh.png",
    "public/profilePhotos/lyicue.png",
    "public/profilePhotos/hien.png"
  ];
  [...expertImages, ...coreTeamImages].forEach(src => {
    const img = new Image();
    img.src = src;
  });
};

window.addEventListener('DOMContentLoaded', () => {
  window.preloadProfileImages();
});
  