console.log('[script.js] Loaded ✅');

const loadExternalScript = (() => {
  const loaded = new Set();

  return (src, { type, module: isModule } = {}) => {
    if (loaded.has(src)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      if (type) script.type = type;
      if (isModule) script.type = 'module';
      script.defer = true;
      script.onload = () => {
        loaded.add(src);
        resolve();
      };
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    }).catch((err) => {
      console.warn(err.message);
    });
  };
})();

const ensureModelViewerLoaded = () => loadExternalScript(
  'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js',
  { module: true }
);

const activateModelViewers = (root) => {
  if (!root) return;
  ensureModelViewerLoaded().then(() => {
    root.querySelectorAll('model-viewer').forEach((el) => {
      window.customElements.upgrade(el);
    });
  });
};

window.ensureModelViewerLoaded = ensureModelViewerLoaded;

function isTruelyTouchDevice() {
   
    const isProbablyMac = (() => {
        // Check User Agent for macOS indicators
        const userAgent = navigator.userAgent.toLowerCase();
        if (/mac os x|macos|macintosh/.test(userAgent)) return true;
        
        // Check userAgentData if available (modern browsers)
        if (navigator.userAgentData?.platform) {
            return navigator.userAgentData.platform.toLowerCase() === 'macos';
        }
        
        // Fallback: Check for Mac-specific features
        try {
            // Mac-specific CSS media query
            return window.matchMedia('(-webkit-device-pixel-ratio: 1)').matches && 
                   /safari/i.test(navigator.userAgent) && 
                   !/chrome/i.test(navigator.userAgent);
        } catch (e) {
            return false;
        }
    })();
    
    // Basic touch capability check
    const hasBasicTouch = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
    
    if (!hasBasicTouch) return false;
    
    const screenWidth = screen.width;
    const screenHeight = screen.height;
    const maxDimension = Math.max(screenWidth, screenHeight);
    const minDimension = Math.min(screenWidth, screenHeight);
    
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (isProbablyMac) {
        const isMacOS = /mac os x/.test(userAgent);
        const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        
        if (isMacOS && !hasCoarsePointer) return false;
        
        if (minDimension >= 800 && maxDimension >= 1200) return false;
    }
    
    if (/windows/.test(userAgent)) {
        const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
        const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
        
        if (hasFinePointer && !hasCoarsePointer) return false;
        
        if (minDimension >= 768 && maxDimension >= 1024) {
            if (navigator.maxTouchPoints <= 5) return false;
        }
    }
    
    const canHover = window.matchMedia('(hover: hover)').matches;
    if (canHover) return false;
    
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (!hasCoarsePointer) return false;
    
    const supportsOrientation = 'orientation' in window;
    
    const isLikelyMobileSize = (
        (minDimension <= 768 && maxDimension <= 1024) || 
        (minDimension <= 414 && maxDimension <= 896) ||  
        (window.innerWidth <= 768) 
    );
    
    const devicePixelRatio = window.devicePixelRatio || 1;
    const hasHighDPR = devicePixelRatio > 1.5;
    
    return hasBasicTouch &&
           hasCoarsePointer &&
           !canHover &&
           (isLikelyMobileSize || supportsOrientation || hasHighDPR);
}

function isTouchPrimaryDevice() {
    const hasTouchCapability = (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0
    );

    if (!hasTouchCapability) return false;

    const primaryPointerCoarse = window.matchMedia('(pointer: coarse)').matches;
    if (!primaryPointerCoarse) return false;

    const canHover = window.matchMedia('(hover: hover)').matches;
    return !canHover;
}

let isAnimating = false;

function typeHTMLString(
  targetElement, 
  htmlString, 
  baseSpeed = 50, // average speed (ms per char)
  onComplete = null, 
  typingSessionObj = null
) {
  targetElement.innerHTML = "";

  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = htmlString;
  const nodes = Array.from(tempContainer.childNodes);
  let nodeIndex = 0;

  // Cursor setup
  const cursor = document.createElement("span");
  cursor.className = "svg-blinking-cursor";
  targetElement.appendChild(cursor);

  const svgCursor = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svgCursor.setAttribute("width", "24");
  svgCursor.setAttribute("height", "24");
  svgCursor.setAttribute("viewBox", "0 0 24 24");
  svgCursor.setAttribute("class", "svg-blinking-cursor");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("fill", "black");
  path.setAttribute("d", "M12,13 L10.5,13 C10.2238576,13 10,12.7761424 10,12.5 C10,12.2238576 10.2238576,12 10.5,12 L12,12 L12,5.5 C12,4.67157288 11.3284271,4 10.5,4 L9.5,4 C9.22385763,4 9,3.77614237 9,3.5 C9,3.22385763 9.22385763,3 9.5,3 L10.5,3 C11.3177995,3 12.0438856,3.39267155 12.5,3.99975627 C12.9561144,3.39267155 13.6822005,3 14.5,3 L15.5,3 C15.7761424,3 16,3.22385763 16,3.5 C16,3.77614237 15.7761424,4 15.5,4 L14.5,4 C13.6715729,4 13,4.67157288 13,5.5 L13,12 L14.5,12 C14.7761424,12 15,12.2238576 15,12.5 C15,12.7761424 14.7761424,13 14.5,13 L13,13 L13,19.5 C13,20.3284271 13.6715729,21 14.5,21 L15.5,21 C15.7761424,21 16,21.2238576 16,21.5 C16,21.7761424 15.7761424,22 15.5,22 L14.5,22 C13.6822005,22 12.9561144,21.6073285 12.5,21.0002437 C12.0438856,21.6073285 11.3177995,22 10.5,22 L9.5,22 C9.22385763,22 9,21.7761424 9,21.5 C9,21.2238576 9.22385763,21 9.5,21 L10.5,21 C11.3284271,21 12,20.3284271 12,19.5 L12,13 Z");
  svgCursor.appendChild(path);
  targetElement.appendChild(svgCursor);

  let burstMode = false;
  let burstCounter = 0;

  function randomSpeed(baseSpeed, lastChar = "") {
      // Punctuation pause: <span class="highlight">5-8x slower</span>
      if (/[.,!?]/.test(lastChar)) {
          return baseSpeed * (5 + Math.random() * 3);
      }
      
      // Burst mode: <span class="highlight">0.4-0.8x base speed (FAST!)</span>
      if (burstMode) {
          if (--burstCounter <= 0) burstMode = false;
          return baseSpeed * (0.4 + Math.random() * 0.4);
      }
      
      // 10% chance to enter burst mode
      if (Math.random() < 0.1) {
          burstMode = true;
          burstCounter = Math.floor(Math.random() * 5) + 3;
      }
      
      // Default typing: <span class="highlight">2.5-5x slower than base</span>
      return baseSpeed * (1.5 + Math.random() * 1.5);
  }

  // NEW: Speed calculation and analysis function
  function calculateSpeeds(baseSpeed = null) {
      // Get base speed from input or use provided value
      const speed = baseSpeed || parseInt(document.getElementById('baseSpeed')?.value) || 100;
      
      // Calculate average WPM for different scenarios
      const normalSpeed = speed * 3.75; // Average of 2.5-5x
      const burstSpeed = speed * 0.6; // Average of 0.4-0.8x
      const punctuationSpeed = speed * 6.5; // Average of 5-8x
      
      // WPM calculation (assuming average word length of 5 characters + 1 space)
      const charsPerMinute = 60000 / speed; // 60000ms = 1 minute
      const normalWPM = Math.round((60000 / normalSpeed) / 6);
      const burstWPM = Math.round((60000 / burstSpeed) / 6);
      const overallWPM = Math.round(charsPerMinute / 6);
      const punctuationWPM = Math.round((60000 / punctuationSpeed) / 6);
      
      // Calculate realistic average WPM
      const realisticAverage = Math.round((normalWPM * 0.8) + (burstWPM * 0.1) + (punctuationWPM * 0.1));
      
      // Create results object for programmatic use
      const speedData = {
          baseSpeed: speed,
          overallWPM: overallWPM,
          normalWPM: normalWPM,
          burstWPM: burstWPM,
          punctuationWPM: punctuationWPM,
          realisticAverage: realisticAverage
      };
      
      // If there's a results element, update the display
      const resultsElement = document.getElementById('speedResults');
      if (resultsElement) {
          const results = `
              <div class="result">
                  <h4>🎯 Your Typing Speeds:</h4>
                  <p><strong>Base Speed:</strong> ${speed}ms between characters</p>
                  <p><strong>Overall WPM:</strong> <span class="highlight">${overallWPM} WPM</span></p>
                  <p><strong>Normal Typing:</strong> ${normalWPM} WPM (80% of time)</p>
                  <p><strong>Burst Mode:</strong> <span class="highlight">${burstWPM} WPM</span> (10% of time - FAST!)</p>
                  <p><strong>After Punctuation:</strong> ${punctuationWPM} WPM (10% of time - thinking pauses)</p>
                  
                  <div style="margin-top: 15px; padding: 10px; background: #0f2419; border-radius: 4px;">
                      <strong>Realistic Average: ${realisticAverage} WPM</strong>
                  </div>
              </div>
          `;
          resultsElement.innerHTML = results;
      }
      
      // Return the data for programmatic use
      return speedData;
  }
  function getTypingSpeed(baseSpeed, lastChar = "", showAnalysis = false) {
      // Get the random delay using your existing logic
      const delay = randomSpeed(baseSpeed, lastChar);
      
      if (showAnalysis) {
          const analysis = calculateSpeeds(baseSpeed);
          console.log('Current typing analysis:', analysis);
      }
      
      return delay;
  }

  function getCurrentTypingStats(baseSpeed) {
      return calculateSpeeds(baseSpeed);
  }

  function typeCharacter(char, previousChar = "") {
      const baseSpeed = 100; 
      const delay = randomSpeed(baseSpeed, previousChar);
      
      setTimeout(() => {
          console.log(`Typing: ${char} (delay: ${delay}ms)`);
      }, delay);
      
      return delay;
  }

  function analyzeMyTypingSpeed(baseSpeed = 100) {
      console.log(`Analyzing typing speed for ${baseSpeed}ms base speed:`);
      const stats = calculateSpeeds(baseSpeed);
      console.log(stats);
      return stats;
  }

  function enhancedRandomSpeed(baseSpeed, lastChar = "", logStats = false) {
      const delay = randomSpeed(baseSpeed, lastChar);
      
      if (logStats) {
          const stats = calculateSpeeds(baseSpeed);
          console.log(`Speed stats for ${baseSpeed}ms base:`, stats);
      }
      
      return delay;
  }

  function typeNextNode() {
    if ((typingSessionObj && typingSessionObj.skip) || nodeIndex >= nodes.length) {
      // dump remaining instantly
      for (; nodeIndex < nodes.length; nodeIndex++) {
        const node = nodes[nodeIndex];
        targetElement.insertBefore(node.cloneNode(true), cursor);
      }
      if (typeof onComplete === "function") onComplete();
      return;
    }

    const node = nodes[nodeIndex++];
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const span = document.createElement("span");
      targetElement.insertBefore(span, cursor);

      let charIndex = 0;
      function typeChar() {
        if (typingSessionObj?.skip) {
          span.textContent = text;
          typeNextNode();
          return;
        }
        if (charIndex < text.length) {
          span.textContent += text.charAt(charIndex++);
          const lastChar = span.textContent.slice(-2, -1); // Get previous character
          setTimeout(typeChar, randomSpeed(baseSpeed, lastChar));
        } else {
          typeNextNode();
        }
      }
      typeChar();

    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const wrapper = node.cloneNode(false);
      targetElement.insertBefore(wrapper, cursor);

      const childNodes = Array.from(node.childNodes);
      let childIndex = 0;

      function typeChildNode() {
        if (typingSessionObj?.skip) {
          wrapper.innerHTML = node.innerHTML;
          typeNextNode();
          return;
        }
        if (childIndex >= childNodes.length) {
          typeNextNode();
          return;
        }

        const child = childNodes[childIndex++];
        if (child.nodeType === Node.TEXT_NODE) {
          const text = child.textContent;
          const span = document.createElement("span");
          wrapper.appendChild(span);

          let charIndex = 0;
          function typeChar() {
            if (typingSessionObj?.skip) {
              span.textContent = text;
              typeChildNode();
              return;
            }
            if (charIndex < text.length) {
              span.textContent += text.charAt(charIndex++);
              const lastChar = span.textContent.slice(-2, -1); // Get previous character
              setTimeout(typeChar, randomSpeed(baseSpeed, lastChar));
            } else {
              typeChildNode();
            }
          }
          typeChar();

        } else {
          wrapper.appendChild(child.cloneNode(true));
          typeChildNode();
        }
      }
      typeChildNode();

    } else {
      targetElement.insertBefore(node.cloneNode(true), cursor);
      typeNextNode();
    }
  }

  typeNextNode();
}

const homeMobileObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
      entry.target.classList.remove('animate-out');
    }
    else {
      entry.target.classList.remove('animate-in');
      entry.target.classList.add('animate-out');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

const initHomeMobileObserver = () => {
  homeMobileObserver.disconnect();
  document.querySelectorAll('.home-section__header').forEach(el => {
    homeMobileObserver.observe(el);
  });
};

const destroyHomeMobileObserver = () => {
  homeMobileObserver.disconnect();
};

document.addEventListener('DOMContentLoaded', () => {
  initHomeMobileObserver();
});

let homeMobileCardObserverTargets = new WeakSet();

const homeMobileCardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in-card');
      entry.target.classList.remove('animate-out-card');
    }
    else {
      entry.target.classList.remove('animate-in-card');
      entry.target.classList.add('animate-out-card');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

const initHomeMobileCardObserver = () => {
  const cards = document.querySelectorAll('.home-card');
  if (!cards.length) return;

  cards.forEach(el => {
    if (homeMobileCardObserverTargets.has(el)) return;
    homeMobileCardObserver.observe(el);
    homeMobileCardObserverTargets.add(el);
  });
};

document.addEventListener('DOMContentLoaded', () => {
  initHomeMobileCardObserver();
});

const destroyHomeMobileCardObserver = () => {
  homeMobileCardObserver.disconnect();
  homeMobileCardObserverTargets = new WeakSet();
};

window.makeItRainText = () => {
  const el = document.querySelector("#rainText");
  if (!el || el.closest('.about-legacy-hero')) return;

  const text = el.textContent.trim();
  el.textContent = "";

  const reduceMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof gsap === "undefined" || reduceMotion) {
    el.textContent = text;
    el.style.opacity = "1";
    el.style.visibility = "visible";
    // Leave color to CSS / adaptive contrast (About Us hero).
    return;
  }

  const spans = [];
  text.split("").forEach((char, i) => {
    const span = document.createElement("span");
    span.textContent = char === " " ? "\u00A0" : char;
    span.style.display = "inline-block";
    span.style.opacity = 0;
    // Inherit from #rainText so adaptive hero contrast can drive fill/color.
    span.style.color = "inherit";
    span.style.webkitTextFillColor = "inherit";
    el.appendChild(span);
    spans.push(span);

    gsap.fromTo(
      span,
      { x: "-50vw", opacity: 0 },
      {
        x: 0,
        opacity: 1,
        delay: i * 0.05,
        duration: 0.75,
        ease: "bounce.out",
      }
    );
  });

  // Chrome iOS can drop GSAP completion; force-visible after the longest delay.
  window.setTimeout(() => {
    spans.forEach((span) => {
      span.style.opacity = "1";
      span.style.transform = "none";
    });
  }, Math.ceil(text.length * 50 + 1000));
};

window.addEventListener("DOMContentLoaded", () => {
  window.makeItRainText();
});

function initOrgProfiles() {
    // Profile data for org structure
    const orgProfileData = [
      {
        name: 'Nguyễn Hồng Hạnh',
        img: 'public/profilePhotos/hanhnguyenorgstructure.png',
        title: 'Managing Director',
        bio: 'Dr. Nguyễn Hồng Hạnh — An expert in urban development and legal frameworks, holds a PhD in the field and is currently Director of the Institute for Economic, Urban and Construction Research under the Vietnam Construction Association'
      },
      {
        name: 'Trần Thị Lan Anh',
        img: 'public/profilePhotos/tranthilananhorgstructure.png',
        title: 'Vice President',
        bio: 'Dr. Trần Thị Lan Anh — An expert in urban planning and development. Holds a Masters degree from Tokyo University'
      },
      {
        name: 'Trần Quốc Toản',
        img: 'public/profilePhotos/tranquoctoanorgstructure.png',
        title: 'Vice President',
        bio: 'Eng. Trần Quốc Toản — A highly experinced engineer. Holds a degree in Bridge and Tunnel Engineering'
      },
      {
        name: 'Nguyễn Thanh Tâm',
        img: 'public/profilePhotos/tamorgstructure.png',
        title: 'Architectural Consultant',
        bio: 'Nguyễn Thanh Tâm — Architectural consultant with extensive experience in urban design and sustainable architecture.'
      },
      {
        name: 'Đỗ Bảo Long',
        img: 'public/profilePhotos/longdoorgstructure.png',
        title: 'Vice President',
        bio: 'Đỗ Bảo Long — Project Manager with a Masters Degree in Project Management from the University of Salford, UK, along with CCNA and Cyber Security certifications'
      },
      {
        name: 'Phan Thị Hiến',
        img: 'public/profilePhotos/hienorgstructure.png',
        title: 'Head Accountant',
        bio: 'Phan Thị Hiến — Head Accountant with extensive experience in financial management and accounting practices.'
      },
      {
        name: 'Trịnh Thị Tình',
        img: 'public/profilePhotos/tinhorgstructure.png',
        title: 'Head of Administration',
        bio: 'Trịnh Thị Tình — Head of Administration with extensive experience in human resources and administrative management.'
      },
      {
        name: 'Nguyễn Quỳnh Ly',
        img: 'public/profilePhotos/lyicueorgstructure.png',
        title: 'Project Documentation Manager',
        bio: 'Nguyễn Quỳnh Ly — Project Documentation Manager with extensive experience in project bidding and documentation.'
      },
      {
        name: 'Nguyễn Thị Ly',
        img: 'public/profilePhotos/lylyorgstructure.png',
        title: 'Project Support Officer',
        bio: 'Nguyễn Thị Ly — Project Support Officer with strong skills in project management and coordination.'
      },
      {
        name: 'Đinh Tùng Dương',
        img: 'public/profilePhotos/duongorgstructure.png',
        title: 'Research Staff',
        bio: 'Đinh Tùng Dương — Research Staff with a background in urban studies and data analysis, contributing to research projects and supporting the development of innovative solutions for sustainable urban development.'
      }
    ];

    window.showPersonDetails = (name) => {
      const modal = document.getElementById('profileModal');
      const modalImg = document.getElementById('profileModalImg');
      const modalText = document.getElementById('profileModalText');

      const searchName = (name || '').trim().toLowerCase();

      const profile = orgProfileData.find(p =>
        p.name.toLowerCase().includes(searchName) ||
        searchName.includes(p.name.toLowerCase())
      );

      if (!profile) {
        console.warn(`Profile not found: ${name}`);
        return;
      }

      modalImg.src = profile.img;
      modalText.innerHTML = `
        <h2>${profile.name}</h2>
        <div class="profile-title">${profile.title}</div>
        <div class="profile-bio">${profile.bio}</div>
      `;

      modal.style.display = 'flex';
    };

    document.getElementById('profileModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'profileModal' || e.target.classList.contains('profile-modal-close')) {
        document.getElementById('profileModal').style.display = 'none';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', initOrgProfiles);

window.attachProfileEvents_moe = () => {
  const profileData_moe = [
  {
    name: `<span class="intro-people">Dr. Nguyễn Hồng Hạnh</span><br> An expert in urban development and construction management, she holds a PhD in the field and is currently Director of the Institute for Economic, Urban and Construction Research under the Vietnam Construction Association. Her long career includes serving as Deputy Director at both the Institute for Economic, Urban and Construction Research (2013–2018) and the Urban Development Agency under the Ministry of Construction (2008–2013). Her work spans legal frameworks, <span class="highlight-text-phrase-moe">urban planning</span> and architectural design, with a strong focus on sustainable and well-managed cities. She has led major initiatives on <span class="highlight-text-phrase-moe">green urban development</span>, <span class="highlight-text-phrase-moe">climate resilience</span> and policy advice for national and regional planning, with support from international partners such as the World Bank and ADB.`,
    img: "public/profilePhotos/hanhnguyen__nobg.png"
  },
  {
    name: `<span class="intro-people">Dr. Lan Anh</span><br> Urban planning and development expert with over 10 years of experience in <span class="highlight-text-phrase-moe">strategic urban design</span>, policy making and sustainable development. PhD and Master's degrees from the University of Tokyo, with a strong background in <span class="highlight-text-phrase-moe">climate change adaptation</span>, urban classification law and national development strategy. Former Deputy General Director of the Vietnam Urban Development Agency, leading major programs on <span class="highlight-text-phrase-moe">resilience</span> and <span class="highlight-text-phrase-moe">urban planning</span> to 2050. Published researcher, educator and active member of key professional associations. Skilled in coordinating large-scale projects, regulatory frameworks and cross-sectoral collaboration. Fluent in multiple languages and passionate about shaping a sustainable, livable urban future.`,
    img: "public/profilePhotos/tranthilananh__nobg.png"
  },
  {
    name: `<span class="intro-people">Mr. Trần Quốc Toản</span><br> <span class="highlight-text-phrase-moe">Urban Planning</span> and <span class="highlight-text-phrase-moe">Climate Change</span> with over 15 years of experience in sustainable infrastructure, transport planning and <span class="highlight-text-phrase-moe">climate resilience</span>. Degree in Bridge and Tunnel Engineering and has held key leadership roles in the Vietnamese Ministry of Transport and civil engineering associations. Skilled in policy consulting, <span class="highlight-text-phrase-moe">smart city planning</span> and <span class="highlight-text-phrase-moe">green growth strategy development</span>. Led major national projects focused on urban mobility, environmental sustainability and regulatory reform. A respected lecturer and trainer for organizations such as the World Bank and ADB, known for his extensive expertise, strategic thinking and commitment to building a <span class="highlight-text-phrase-moe">climate resilient urban future</span>.`,
    img: "public/profilePhotos/tranquoctoan__nobg.png"
  },
  {
    name: `<span class="intro-people">Đỗ Bảo Long - Project Manager</span><br> A dedicated Project Officer with a Masters Degree in Project Management from the University of Salford, UK, along with CCNA and Cyber Security certifications. Over 5 years of extensive experience in banking, retail, (smart) contract management and finance, with a proven ability to manage complex projects and deliver effective results. Combines strong technical skills with practical implementation, ensuring seamless collaboration between teams and stakeholders. Highly adaptable and detail-oriented, with a passion for computer hardware, coding and gaming. Experience in <span class="highlight-text-phrase-moe">design</span> and <span class="highlight-text-phrase-moe">creative problem solving</span>. <a href="https://en.longd.tech" target="_blank">🔧💬 View Profile</a>`,
    img: "public/profilePhotos/longdo__nobg.png"
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
        { x: direction === 'right' ? -37.50 : 100, scale: 0.75, opacity: 0 },
        { x: 0, opacity: 1, duration: .25, scale: 1, ease: "power2.out" }
      );
      tl.fromTo(textBox, 
        { x: direction === 'right' ? 100 : -37.50, scale: 0, opacity: 0 }, 
        { x: 0, opacity: 1, duration: .25, scale: 1, ease: "power2.out" },
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

  if (textBox && isTruelyTouchDevice()) {
  const swipeElements = [container, textBox];
  let swipeLocked = false;

  const prevBtn = document.getElementById('moe-prev-btn');
  const nextBtn = document.getElementById('moe-next-btn');
  if (prevBtn) prevBtn.style.display = 'none';
  if (nextBtn) nextBtn.style.display = 'none';

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

window.setNavLinkContrast = (useLightLinks = false) => {
  if (window.__mainSiteNav?.setDarkNav) {
    window.__mainSiteNav.setDarkNav(!!useLightLinks);
    return;
  }

  const nav = document.querySelector('.menu-bar');
  const menuToggle = document.querySelector('.menu-toggle');
  const menuIcon = document.getElementById('menuIcon');
  const contactLink = document.getElementById('contactLink');
  const shouldUseLight = !!useLightLinks;

  if (nav) nav.classList.toggle('nav-on-dark', shouldUseLight);
  if (menuToggle) menuToggle.classList.toggle('nav-on-dark', shouldUseLight);
  if (menuIcon) menuIcon.classList.toggle('nav-icon-on-dark', shouldUseLight);
  if (contactLink) contactLink.classList.toggle('nav-link-on-dark', shouldUseLight);
};

const HomeBackgroundVideoManager = (() => {
  const STORAGE_KEY_ENABLED = 'home_bg_video_enabled';
  let _enabled = false; // In-memory state

  const initEnabledState = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_ENABLED);
        // Default OFF when user has never set a preference.
        if (raw === null) _enabled = false;
        else _enabled = (raw === '1' || raw === 'true' || raw === 'on');
      } catch (e) {
        _enabled = false;
      }
  };

  const getUserEnabled = () => _enabled;

  const setUserEnabled = (enabled) => {
    _enabled = enabled;
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, enabled ? '1' : '0');
    } catch (e) {
      // ignore
    }
  };

  // Initialize state immediately
  initEnabledState();

  const videoPlaylist = [
    {
      id: 'momentum',
      desktop: 'public/bgVideos/home_bg_1.mp4',
      mobile: 'public/bgVideos/home_bg_1_mobile.mp4',
      prefersLightNav: true
    },
    {
      id: 'harmony',
      desktop: 'public/bgVideos/home_bg_2.mp4',
      mobile: 'public/bgVideos/home_bg_2_mobile.mp4',
      prefersLightNav: true
    },
    {
      id: 'luminous',
      desktop: 'public/bgVideos/home_bg_3.mp4',
      mobile: 'public/bgVideos/home_bg_3_mobile.mp4',
      prefersLightNav: true
    },
    {
      id: 'kaleidoscope',
      desktop: 'public/bgVideos/home_bg_4.mp4',
      mobile: 'public/bgVideos/home_bg_4_mobile.mp4',
      prefersLightNav: true
    },
  ];

  const fallbackPoster = 'public/preview.jpg';
  const preloadedSources = new Set();
  let videoEl = null;
  let resizeHandler = null;
  let visibilityHandler = null;
  let endFallbackHandler = null;
  let isTransitioning = false;
  let watchdogTimer = null;
  let lastProgressTime = 0;
  let lastCurrentTime = 0;
  let playRetryTimer = null;
  let playHandler = null;
  let pauseHandler = null;
  let waitingHandler = null;
  let stalledHandler = null;
  let errorHandler = null;
  let activeMeta = null;
  let errorSwapAttempted = false;
  let currentIndex = -1;
  let warmupVideo = null;

  const logHomeBg = (...args) => console.log('[HomeBackgroundVideo]', ...args);

  const debounce = (fn, delay = 200) => {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const scheduleIdleTask = (task) => {
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(task, { timeout: 2000 });
    } else {
      setTimeout(task, 100); // Small delay instead of 0 to avoid blocking main thread
    }
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;

  const getConnection = () => navigator.connection || navigator.mozConnection || navigator.webkitConnection;

  const canPlayVideosInThisContext = () => {
    const connection = getConnection();
    const slowNetwork = connection && (connection.saveData || /(slow-2g|2g)/i.test(connection.effectiveType || ''));
    // Mobile is allowed: keep video available and let the user toggle.
    // Still respect reduced-motion and data-saver/slow-network.
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !slowNetwork;
  };

  const shouldKeepStatic = () => {
    if (!getUserEnabled()) return true;
    return !canPlayVideosInThisContext();
  };

  const syncRootVideoStateAttr = () => {
    if (!document?.documentElement) return;
    const shouldHide = shouldKeepStatic();
    
    // Safety check: ensure we have the element reference even if internal state is cleared
    const el = videoEl || document.getElementById('bgVideo');

    if (shouldHide) {
      document.documentElement.setAttribute('data-home-bg-video', 'off');
      // Direct force hide to ensure it applies even if CSS is lagging or overridden
      if (el) el.style.display = 'none';
    } else {
      document.documentElement.removeAttribute('data-home-bg-video');
      if (el) el.style.display = '';
    }
  };

  const enforceVideoNonInteractive = (el) => {
    if (!el) return;
    el.controls = false;
    el.disablePictureInPicture = true;
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
    el.style.pointerEvents = 'none';
    el.style.touchAction = 'none';
    el.style.userSelect = 'none';
  };

  const ensureVideoElement = () => {
    videoEl = document.getElementById('bgVideo');
    if (!videoEl) {
        const mediaContainer = document.querySelector('.home-hero__media');
        if (mediaContainer) {
            videoEl = document.createElement('video');
            videoEl.id = 'bgVideo';
            videoEl.className = 'video-bg';
            enforceVideoNonInteractive(videoEl);
            const overlay = mediaContainer.querySelector('.home-hero__overlay');
            if (overlay) {
                mediaContainer.insertBefore(videoEl, overlay);
            } else {
                mediaContainer.appendChild(videoEl);
            }
        }
    }
    if (videoEl) {
      videoEl.loop = false;
      videoEl.preload = 'auto';
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('muted', '');
      videoEl.setAttribute('playsinline', '');
      videoEl.setAttribute('autoplay', '');
      videoEl.setAttribute('webkit-playsinline', '');
      enforceVideoNonInteractive(videoEl);
    }
    return videoEl;
  };

  // Simplified - no longer needed since we use direct src assignment
  // Kept for backward compatibility but returns early
  const ensureSources = () => {
    return { desktop: null, mobile: null };
  };

  const applyNavTheme = (meta) => {
    if (typeof window.setNavLinkContrast === 'function') {
      window.setNavLinkContrast(!!meta?.prefersLightNav);
    }
  };

  const clearVideoSources = () => {
    if (!videoEl) return;
    videoEl.pause();
    videoEl.removeAttribute('src');
    videoEl.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
    videoEl.load();
  };

  let cachedVideoIndex = -1;

  const persistIndex = (index) => {
    cachedVideoIndex = index;
    try {
      sessionStorage.setItem('home_bg_video_index', String(index));
    } catch (e) {
      // ignore blocked storage (e.g. tracking prevention)
    }
  };

  const nextIndex = () => {
    if (!videoPlaylist.length) return -1;
    let cached = cachedVideoIndex;
    if (cached < 0) {
      try {
        cached = parseInt(sessionStorage.getItem('home_bg_video_index') ?? '-1', 10);
      } catch (e) {
        cached = -1;
      }
    }
    if (Number.isInteger(cached) && cached >= 0) {
      return (cached + 1) % videoPlaylist.length;
    }
    return Math.floor(Math.random() * videoPlaylist.length);
  };

  const prefetchSources = (meta) => {
    if (!meta) return;
    [meta.desktop, meta.mobile ?? meta.desktop].forEach(src => {
      if (!src || preloadedSources.has(src)) return;
      preloadedSources.add(src);
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      video.src = src;
      video.setAttribute('aria-hidden', 'true');
      video.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;pointer-events:none;opacity:0;';
      document.body.appendChild(video);
      video.load();
    });
  };

  const warmVideoForMeta = (meta) => {
    if (!meta) return;

    if (!warmupVideo) {
      warmupVideo = document.createElement('video');
      warmupVideo.muted = true;
      warmupVideo.playsInline = true;
      warmupVideo.preload = 'metadata'; // Changed from 'auto' to 'metadata' for lighter load
      warmupVideo.setAttribute('aria-hidden', 'true');
      warmupVideo.style.cssText = 'position:absolute;width:1px;height:1px;left:-9999px;pointer-events:none;';
      document.body.appendChild(warmupVideo);
    }

    const prefersMobile = window.matchMedia('(max-width: 767px)').matches;
    const src = prefersMobile && meta.mobile ? meta.mobile : meta.desktop;
    if (!src) return;

    const cachedSrc = warmupVideo.getAttribute('data-src');
    if (cachedSrc === src) return;

    warmupVideo.setAttribute('data-src', src);
    warmupVideo.src = src;
    warmupVideo.load();
  };

  const attemptPlay = (label = 'play') => {
    if (!videoEl) return;
    const playPromise = videoEl.play();
    if (playPromise?.catch) {
      playPromise.catch(err => {
        console.warn('[HomeBackgroundVideo] Autoplay blocked:', err);
        logHomeBg('play failed', { label, err });
        videoEl.muted = true;
        videoEl.setAttribute('muted', '');
        setTimeout(() => {
          videoEl.play().catch(e2 => console.warn('[HomeBackgroundVideo] Retry play failed:', e2));
        }, 200);
      });
    }
  };

  const activateVideo = (meta) => {
    if (!videoEl || !meta) return;
    enforceVideoNonInteractive(videoEl);

    const prefersMobile = window.matchMedia('(max-width: 767px)').matches;
    const chosenSrc = prefersMobile && meta.mobile ? meta.mobile : meta.desktop;
    if (!chosenSrc) return;
    
    // Skip if already active to avoid unnecessary reloads
    const currentActiveSrc = videoEl.getAttribute('data-active-src');
    if (currentActiveSrc === chosenSrc) {
      logHomeBg('skip activate - already active', meta.id);
      return;
    }
    
    videoEl.src = chosenSrc;
    videoEl.setAttribute('data-active-src', chosenSrc);
    videoEl.setAttribute('data-video-key', meta.id);
    activeMeta = meta;
    errorSwapAttempted = false;

    logHomeBg('activate', meta.id, { chosenSrc });

    videoEl.load();

    try {
      videoEl.currentTime = 0;
    } catch (e) {
      logHomeBg('currentTime reset failed', e);
    }

    if (videoEl.readyState >= 2) {
      attemptPlay('ready');
    } else {
      videoEl.addEventListener('loadedmetadata', () => logHomeBg('loadedmetadata', { duration: videoEl.duration, src: videoEl.currentSrc || videoEl.src }), { once: true });
      videoEl.addEventListener('canplay', () => attemptPlay('canplay'), { once: true });
    }

    if (playRetryTimer) clearTimeout(playRetryTimer);
    playRetryTimer = setTimeout(() => {
      if (!videoEl || isTransitioning || !videoEl.paused) return;
      logHomeBg('retry watchdog: forcing play', { currentTime: videoEl.currentTime, duration: videoEl.duration });
      attemptPlay('retry-watchdog');
    }, 1500);

    if (videoPlaylist.length > 1) {
      const upcoming = videoPlaylist[(currentIndex + 1) % videoPlaylist.length];
      scheduleIdleTask(() => {
        prefetchSources(upcoming);
        warmVideoForMeta(upcoming);
      });
    }
  };

  const goToIndex = (index) => {
    if (!videoPlaylist[index]) return;
    currentIndex = index;
    persistIndex(index);
    const meta = videoPlaylist[index];
    activateVideo(meta);
    applyNavTheme(meta);
  };

  const handleEnded = () => {
    if (!videoPlaylist.length || isTransitioning) return;
    isTransitioning = true;
    logHomeBg('handleEnded', { currentIndex, nextIndex: (currentIndex + 1) % videoPlaylist.length });
    goToIndex((currentIndex + 1) % videoPlaylist.length);
    setTimeout(() => { isTransitioning = false; }, 500);
  };

  const handleResize = () => {
    if (currentIndex === -1 || !videoPlaylist[currentIndex]) return;
    activateVideo(videoPlaylist[currentIndex]);
  };

  const handleVisibilityChange = () => {
    if (!videoEl) return;
    if (document.hidden) {
      videoEl.pause();
    } else if (!shouldKeepStatic()) {
      videoEl.play().catch(() => {});
    }
  };

  const init = () => {
    HomeBackgroundVideoManager.destroy();
    if (!ensureVideoElement()) return;

    // Bind toggle UI whenever Home is (re)rendered
    HomeBackgroundVideoManager.bindToggleUI();

    syncRootVideoStateAttr();

    if (shouldKeepStatic()) {
      clearVideoSources();
      applyNavTheme({ prefersLightNav: false });
      return;
    }

    const startIndex = nextIndex();
    if (startIndex === -1) return;
    goToIndex(startIndex);

    if (videoPlaylist.length > 1) {
      const upcoming = videoPlaylist[(startIndex + 1) % videoPlaylist.length];
      scheduleIdleTask(() => {
        prefetchSources(upcoming);
        warmVideoForMeta(upcoming);
      });
    }

    let lastLogTime = 0;
    const throttleLog = (msg, data) => {
      const now = Date.now();
      if (now - lastLogTime > 1000) { // Only log once per second
        logHomeBg(msg, data);
        lastLogTime = now;
      }
    };
    playHandler = () => throttleLog('playing', { currentIndex, src: videoEl?.currentSrc || videoEl?.src });
    pauseHandler = () => throttleLog('pause', { currentIndex, src: videoEl?.currentSrc || videoEl?.src });
    waitingHandler = () => throttleLog('waiting', { currentIndex, src: videoEl?.currentSrc || videoEl?.src });
    stalledHandler = () => throttleLog('stalled', { currentIndex, src: videoEl?.currentSrc || videoEl?.src });
    errorHandler = () => {
      const currentSrc = videoEl?.currentSrc || videoEl?.src;
      logHomeBg('error', { error: videoEl?.error, currentSrc, active: videoEl?.getAttribute('data-active-src') });
      if (!activeMeta || errorSwapAttempted) return;
      const mobileSrc = activeMeta.mobile || activeMeta.desktop;
      const desktopSrc = activeMeta.desktop;
      const matchesMobile = currentSrc && mobileSrc && currentSrc.includes(mobileSrc);
      const matchesDesktop = currentSrc && desktopSrc && currentSrc.includes(desktopSrc);
      const trySwap = (nextSrc, reason) => {
        if (!nextSrc || nextSrc === currentSrc) return;
        errorSwapAttempted = true;
        logHomeBg('error fallback swap', { reason, nextSrc });
        videoEl.src = nextSrc;
        videoEl.setAttribute('data-active-src', nextSrc);
        videoEl.load();
        attemptPlay('error-swap');
      };
      if (matchesMobile && desktopSrc) {
        trySwap(desktopSrc, 'mobile->desktop');
      } else if (matchesDesktop && mobileSrc && mobileSrc !== desktopSrc) {
        trySwap(mobileSrc, 'desktop->mobile');
      }
    };

    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('playing', playHandler);
    videoEl.addEventListener('pause', pauseHandler);
    videoEl.addEventListener('waiting', waitingHandler);
    videoEl.addEventListener('stalled', stalledHandler);
    videoEl.addEventListener('error', errorHandler);
    
    // Universal fallback: some browsers (especially mobile) don't reliably fire 'ended'.
    // This persistent timeupdate listener ensures videos always transition.
    endFallbackHandler = function () {
      try {
        if (!videoEl || videoEl.paused || isTransitioning) return;
        const duration = videoEl.duration;
        if (!duration || !isFinite(duration)) return;
        
        const timeRemaining = duration - videoEl.currentTime;
        // Trigger transition when less than 1 second remains
        if (timeRemaining <= 1.0 && timeRemaining >= 0) {
          logHomeBg('fallback timeupdate', { currentTime: videoEl.currentTime, duration });
          handleEnded();
        }
      } catch (e) {
        console.warn('[HomeBackgroundVideo] endFallback error', e);
      }
    };
    videoEl.addEventListener('timeupdate', endFallbackHandler);
    if (!watchdogTimer) {
      lastProgressTime = Date.now();
      lastCurrentTime = 0;
      watchdogTimer = setInterval(() => {
        if (!videoEl || videoEl.paused || isTransitioning) return;
        const duration = videoEl.duration;
        const currentTime = videoEl.currentTime || 0;
        const now = Date.now();
        if (currentTime !== lastCurrentTime) {
          lastCurrentTime = currentTime;
          lastProgressTime = now;
        }

        if (duration && isFinite(duration)) {
          const remaining = duration - currentTime;
          if (remaining <= 1.0 && remaining >= 0) {
            logHomeBg('fallback watchdog near-end', { currentTime, duration });
            handleEnded();
          } else if (currentTime > 0.1 && now - lastProgressTime > 5000) {
            logHomeBg('fallback watchdog stalled', { currentTime, duration });
            handleEnded();
          }
        }
      }, 1000);
    }
    resizeHandler = debounce(() => {
      handleResize();
      // Ensure toggle UI state persists correctly across layout changes
      bindToggleUI(); 
    }, 300);
    window.addEventListener('resize', resizeHandler, { passive: true });
    visibilityHandler = handleVisibilityChange;
    document.addEventListener('visibilitychange', visibilityHandler, { passive: true });
  };

  const destroy = () => {
    if (videoEl) {
      clearVideoSources();
      videoEl.pause();
      videoEl.removeEventListener('ended', handleEnded);
      if (playHandler) videoEl.removeEventListener('playing', playHandler);
      if (pauseHandler) videoEl.removeEventListener('pause', pauseHandler);
      if (waitingHandler) videoEl.removeEventListener('waiting', waitingHandler);
      if (stalledHandler) videoEl.removeEventListener('stalled', stalledHandler);
      if (errorHandler) videoEl.removeEventListener('error', errorHandler);
      playHandler = null;
      pauseHandler = null;
      waitingHandler = null;
      stalledHandler = null;
      errorHandler = null;
      if (endFallbackHandler) {
        videoEl.removeEventListener('timeupdate', endFallbackHandler);
        endFallbackHandler = null;
      }
    }
    if (playRetryTimer) {
      clearTimeout(playRetryTimer);
      playRetryTimer = null;
    }
    if (watchdogTimer) {
      clearInterval(watchdogTimer);
      watchdogTimer = null;
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    if (warmupVideo) {
      warmupVideo.removeAttribute('src');
      warmupVideo.load();
      warmupVideo.remove();
      warmupVideo = null;
    }
    currentIndex = -1;
    videoEl = null;
    applyNavTheme(null);
  };

  let toggleDelegationBound = false;
  const ensureToggleDelegation = () => {
    if (toggleDelegationBound) return;
    toggleDelegationBound = true;

    const handler = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.id !== 'homeVideoToggleDesktop' && target.id !== 'homeVideoToggleMobile') return;
      if (target.disabled) return;
      setEnabled(!!target.checked);
    };

    document.addEventListener('change', handler, true);
    document.addEventListener('input', handler, true);
  };

  const bindToggleUI = () => {
    ensureToggleDelegation();
    const desktopToggle = document.getElementById('homeVideoToggleDesktop');
    const mobileToggle = document.getElementById('homeVideoToggleMobile');
    const toggles = [desktopToggle, mobileToggle].filter(Boolean);

    if (!toggles.length) return;

    const enabled = getUserEnabled();
    const canPlay = canPlayVideosInThisContext();
    syncRootVideoStateAttr();

    toggles.forEach((toggle) => {
      toggle.checked = enabled;
      toggle.disabled = !canPlay;
    });
  };

  const setEnabled = (enabled) => {
    setUserEnabled(!!enabled);
    syncRootVideoStateAttr();
    if (enabled) {
      HomeBackgroundVideoManager.init();
    } else {
      HomeBackgroundVideoManager.destroy();
      applyNavTheme({ prefersLightNav: false });
    }

    window.dispatchEvent(new CustomEvent('icue:homeVideoEnabled', {
      detail: { enabled: !!enabled },
    }));

    // Keep both (desktop + mobile) toggles in sync.
    bindToggleUI();
  };

  const isEnabled = () => getUserEnabled();

  return { init, destroy, bindToggleUI, setEnabled, isEnabled, canToggleVideos: canPlayVideosInThisContext };
})();

window.HomeBackgroundVideoManager = HomeBackgroundVideoManager;

const MeetOurExpertsBackgroundVideoManager = (() => {
  const STORAGE_KEY_ENABLED = 'moe_bg_video_enabled';
  let _enabled = false;

  const initEnabledState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (raw === null) _enabled = true; // Default ON
      else _enabled = (raw === '1' || raw === 'true' || raw === 'on');
    } catch (e) {
      _enabled = true; // Default ON
    }
  };

  const getUserEnabled = () => _enabled;
  const setUserEnabled = (enabled) => {
    _enabled = !!enabled;
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, _enabled ? '1' : '0');
    } catch (e) {
      // ignore
    }
  };

  initEnabledState();

  const debounce = (fn, delay = 200) => {
    let timer;
    return function debounced(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;
  const getConnection = () => navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const canPlayVideosInThisContext = () => {
    const connection = getConnection();
    const slowNetwork = connection && (connection.saveData || /(slow-2g|2g)/i.test(connection.effectiveType || ''));
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !slowNetwork;
  };

  const shouldKeepStatic = () => {
    if (!getUserEnabled()) return true;
    return !canPlayVideosInThisContext();
  };

  const getVideoEl = () => document.querySelector('.video-bg-moe');
  const getChosenSrc = () => (isMobileViewport() ? 'public/bgVideos/moe_bg_mobile.mp4' : 'public/bgVideos/moe_bg.mp4');

  const syncRootVideoStateAttr = () => {
    if (!document?.documentElement) return;
    const shouldHide = shouldKeepStatic();
    const el = getVideoEl();

    if (shouldHide) {
      document.documentElement.setAttribute('data-moe-bg-video', 'off');
      if (el) {
        el.pause();
        el.style.display = 'none';
      }
    } else {
      document.documentElement.removeAttribute('data-moe-bg-video');
      if (el) {
        el.style.display = '';
      }
    }
  };

  const setVideoSource = (el) => {
    if (!el) return;
    const src = getChosenSrc();
    const current = el.getAttribute('data-active-src') || el.currentSrc || el.src;
    if (current && current.includes(src)) return;
    el.src = src;
    el.setAttribute('data-active-src', src);
    el.load();
  };

  const attemptPlay = (el) => {
    if (!el) return;
    const p = el.play();
    if (p?.catch) {
      p.catch(() => {
        el.muted = true;
        el.setAttribute('muted', '');
      });
    }
  };

  let resizeHandler = null;
  let visibilityHandler = null;

  // Use a global flag on document to ensure delegation is bound only once
  const ensureToggleDelegation = () => {
    if (document._moeToggleDelegationBound) return;
    document._moeToggleDelegationBound = true;

    const handler = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.id !== 'moeVideoToggleDesktop' && target.id !== 'moeVideoToggleMobile') return;
      if (target.disabled) return;

      // Update state and UI directly
      const newState = !!target.checked;
      setUserEnabled(newState);
      syncRootVideoStateAttr();
      
      if (newState) {
        // Enable: start video
        const el = getVideoEl();
        if (el) {
          el.muted = true;
          el.playsInline = true;
          setVideoSource(el);
          attemptPlay(el);
        }
      } else {
        // Disable: pause video
        const el = getVideoEl();
        if (el) el.pause();
      }
      
      // Sync both toggles
      const otherToggle = document.getElementById(
        target.id === 'moeVideoToggleDesktop' ? 'moeVideoToggleMobile' : 'moeVideoToggleDesktop'
      );
      if (otherToggle) otherToggle.checked = newState;
    };

    document.addEventListener('change', handler, true);
  };

  const bindToggleUI = () => {
    ensureToggleDelegation();
    const desktopToggle = document.getElementById('moeVideoToggleDesktop');
    const mobileToggle = document.getElementById('moeVideoToggleMobile');
    const toggles = [desktopToggle, mobileToggle].filter(Boolean);
    if (!toggles.length) return;

    const enabled = getUserEnabled();
    const canPlay = canPlayVideosInThisContext();
    syncRootVideoStateAttr();

    toggles.forEach((toggle) => {
      toggle.checked = enabled;
      toggle.disabled = !canPlay;
    });
  };

  const init = () => {
    MeetOurExpertsBackgroundVideoManager.destroy();
    bindToggleUI();
    syncRootVideoStateAttr();

    if (shouldKeepStatic()) return;
    const el = getVideoEl();
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    setVideoSource(el);
    attemptPlay(el);

    resizeHandler = debounce(() => {
      bindToggleUI();
      if (shouldKeepStatic()) {
        syncRootVideoStateAttr();
        return;
      }
      const currentEl = getVideoEl();
      setVideoSource(currentEl);
      attemptPlay(currentEl);
    }, 300);
    window.addEventListener('resize', resizeHandler, { passive: true });

    visibilityHandler = () => {
      const currentEl = getVideoEl();
      if (!currentEl) return;
      if (document.hidden) currentEl.pause();
      else if (!shouldKeepStatic()) attemptPlay(currentEl);
    };
    document.addEventListener('visibilitychange', visibilityHandler, { passive: true });
  };

  const destroy = () => {
    const el = getVideoEl();
    if (el) {
      el.pause();
    }
    if (resizeHandler) {
      window.removeEventListener('resize', resizeHandler);
      resizeHandler = null;
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    syncRootVideoStateAttr();
  };

  const setEnabled = (enabled) => {
    setUserEnabled(!!enabled);
    syncRootVideoStateAttr();
    if (enabled) init();
    else destroy();
    bindToggleUI();
  };

  const isEnabled = () => getUserEnabled();

  return { init, destroy, bindToggleUI, setEnabled, isEnabled };
})();

window.MeetOurExpertsBackgroundVideoManager = MeetOurExpertsBackgroundVideoManager;

const AboutUsBackgroundVideoManager = (() => {
  const STORAGE_KEY_ENABLED = 'aboutUs_bg_video_enabled';
  let _enabled = true;

  const initEnabledState = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_ENABLED);
      if (raw === null) _enabled = true; // Default ON to match previous behavior
      else _enabled = (raw === '1' || raw === 'true' || raw === 'on');
    } catch (e) {
      _enabled = true;
    }
  };

  const getUserEnabled = () => _enabled;
  const setUserEnabled = (enabled) => {
    _enabled = !!enabled;
    try {
      localStorage.setItem(STORAGE_KEY_ENABLED, _enabled ? '1' : '0');
    } catch (e) {
      // ignore
    }
  };

  initEnabledState();

  const canPlayVideosInThisContext = () => {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  };

  const shouldKeepStatic = () => {
    if (!getUserEnabled()) return true;
    return !canPlayVideosInThisContext();
  };

  const getVideoEl = () => {
    const content = document.getElementById('content');
    return (
      content?.querySelector('.about-container video.video-bg') ||
      document.querySelector('.about-container video.video-bg')
    );
  };

  const isMobileViewport = () => window.matchMedia('(max-width: 767px)').matches;

  const getSources = (el) => {
    const fallback = {
      desktop: 'public/bgVideos/bg9.mp4',
      mobile: 'public/bgVideos/bg9-mobile.mp4'
    };
    if (!el) return fallback;

    const sources = Array.from(el.querySelectorAll('source'));
    const desktop = sources.find(s => s.getAttribute('media'))?.getAttribute('src') || fallback.desktop;
    const mobile = (sources.find(s => !s.getAttribute('media'))?.getAttribute('src')) || fallback.mobile;
    return { desktop, mobile };
  };

  const getChosenSrc = (el) => {
    const { desktop, mobile } = getSources(el);
    return isMobileViewport() ? (mobile || desktop) : (desktop || mobile);
  };

  const syncRootVideoStateAttr = () => {
    if (!document?.documentElement) return;
    const el = getVideoEl();
    const shouldHide = shouldKeepStatic();

    if (shouldHide) {
      document.documentElement.setAttribute('data-aboutus-bg-video', 'off');
      if (el) {
        el.pause();
        el.style.display = 'none';
      }
    } else {
      document.documentElement.removeAttribute('data-aboutus-bg-video');
      if (el) {
        el.style.display = '';
      }
    }
  };

  const setVideoSource = (el) => {
    if (!el) return;
    const src = getChosenSrc(el);
    const current = el.getAttribute('data-active-src') || el.currentSrc || el.src;
    if (current && src && current.includes(src)) return;
    el.preload = 'auto';
    el.src = src;
    el.setAttribute('data-active-src', src);
    el.load();
  };

  const attemptPlay = (el) => {
    if (!el) return;
    const p = el.play();
    if (p?.catch) {
      p.catch(() => {
        el.muted = true;
        el.setAttribute('muted', '');
      });
    }
  };

  let removeViewportListener = null;
  let visibilityHandler = null;
  let initialized = false;

  const ensureToggleDelegation = () => {
    if (document._aboutUsToggleDelegationBound) return;
    document._aboutUsToggleDelegationBound = true;

    const handler = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLInputElement)) return;
      if (target.id !== 'aboutUsVideoToggleDesktop' && target.id !== 'aboutUsVideoToggleMobile') return;
      if (target.disabled) return;

      const newState = !!target.checked;
      setUserEnabled(newState);
      syncRootVideoStateAttr();

      const el = getVideoEl();
      if (newState && el && !shouldKeepStatic()) {
        el.muted = true;
        el.playsInline = true;
        el.setAttribute('muted', '');
        el.setAttribute('playsinline', '');
        el.setAttribute('webkit-playsinline', '');
        setVideoSource(el);
        attemptPlay(el);
      } else if (el) {
        el.pause();
      }

      const otherToggle = document.getElementById(
        target.id === 'aboutUsVideoToggleDesktop' ? 'aboutUsVideoToggleMobile' : 'aboutUsVideoToggleDesktop'
      );
      if (otherToggle) otherToggle.checked = newState;
    };

    document.addEventListener('change', handler, true);
  };

  const bindToggleUI = () => {
    ensureToggleDelegation();
    const desktopToggle = document.getElementById('aboutUsVideoToggleDesktop');
    const mobileToggle = document.getElementById('aboutUsVideoToggleMobile');
    const toggles = [desktopToggle, mobileToggle].filter(Boolean);
    if (!toggles.length) return;

    const enabled = getUserEnabled();
    const canPlay = canPlayVideosInThisContext();
    syncRootVideoStateAttr();

    toggles.forEach((toggle) => {
      toggle.checked = enabled;
      toggle.disabled = !canPlay;
    });
  };

  const init = () => {
    if (initialized) AboutUsBackgroundVideoManager.destroy();
    bindToggleUI();
    syncRootVideoStateAttr();

    if (shouldKeepStatic()) {
      initialized = false;
      return;
    }
    const el = getVideoEl();
    if (!el) return;

    el.muted = true;
    el.playsInline = true;
    el.setAttribute('muted', '');
    el.setAttribute('playsinline', '');
    el.setAttribute('webkit-playsinline', '');

    setVideoSource(el);
    attemptPlay(el);

    // Avoid heavy resize work: swap sources only when crossing the breakpoint.
    const mql = window.matchMedia('(max-width: 767px)');
    const onViewportChange = () => {
      bindToggleUI();
      if (shouldKeepStatic()) {
        syncRootVideoStateAttr();
        return;
      }
      const currentEl = getVideoEl();
      setVideoSource(currentEl);
      attemptPlay(currentEl);
    };

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', onViewportChange);
      removeViewportListener = () => mql.removeEventListener('change', onViewportChange);
    } else if (typeof mql.addListener === 'function') {
      mql.addListener(onViewportChange);
      removeViewportListener = () => mql.removeListener(onViewportChange);
    } else {
      // Fallback
      let raf = 0;
      const onResize = () => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          onViewportChange();
        });
      };
      window.addEventListener('resize', onResize, { passive: true });
      removeViewportListener = () => window.removeEventListener('resize', onResize);
    }

    visibilityHandler = () => {
      const currentEl = getVideoEl();
      if (!currentEl) return;
      if (document.hidden) currentEl.pause();
      else if (!shouldKeepStatic()) attemptPlay(currentEl);
    };
    document.addEventListener('visibilitychange', visibilityHandler, { passive: true });
    initialized = true;
  };

  const destroy = () => {
    initialized = false;
    const el = getVideoEl();
    if (el) {
      el.pause();
      el.removeAttribute('src');
      el.removeAttribute('data-active-src');
      try { el.load(); } catch (e) {}
    }
    if (removeViewportListener) {
      removeViewportListener();
      removeViewportListener = null;
    }
    if (visibilityHandler) {
      document.removeEventListener('visibilitychange', visibilityHandler);
      visibilityHandler = null;
    }
    syncRootVideoStateAttr();
  };

  const setEnabled = (enabled) => {
    setUserEnabled(!!enabled);
    syncRootVideoStateAttr();

    const el = getVideoEl();
    if (!enabled) {
      // Keep the loaded source warm. Removing it and calling load() here made
      // the About Us page block for several seconds on every toggle cycle.
      el?.pause();
    } else if (!initialized) {
      init();
    } else if (el) {
      el.muted = true;
      el.playsInline = true;
      el.setAttribute('muted', '');
      el.setAttribute('playsinline', '');
      el.setAttribute('webkit-playsinline', '');
      setVideoSource(el);
      attemptPlay(el);
    }

    window.dispatchEvent(new CustomEvent('icue:aboutUsVideoEnabled', {
      detail: { enabled: !!enabled },
    }));

    bindToggleUI();
  };

  const isEnabled = () => getUserEnabled();

  return { init, destroy, bindToggleUI, setEnabled, isEnabled, canToggleVideos: canPlayVideosInThisContext };
})();

window.AboutUsBackgroundVideoManager = AboutUsBackgroundVideoManager;

window.loadPage = (page) => {
  if (page === 'meetOurExperts') {
    window.location.replace('https://icue.vn/people/experts?site=en');
    return;
  }
  if (page === 'coreTeam') {
    window.location.replace('https://icue.vn/people/core-team?site=en');
    return;
  }

  currentPage = page;
  window.currentPage = page;

  const expectedHash = `#/${page}`;
  if (window.location.hash !== expectedHash) {
    history.replaceState(null, '', `${window.location.pathname}${window.location.search}${expectedHash}`);
  }

  const content = document.getElementById('content');
  const landing = document.getElementById('landing-page');
  const progressBar = document.querySelector('.progress-bar');
  const progressText = document.getElementById('progress-text');
  const radius = 90;
  const circumference = 2 * Math.PI * radius;

  // Navigation concurrency guard:
  // If the user navigates again before the current fetch finishes, ignore stale
  // callbacks so we don't briefly show multiple page-specific UI (video toggles,
  // contact link visibility, etc.).
  if (!window.__spaNavState) {
    window.__spaNavState = { seq: 0, controller: null, fetching: false };
  }
  const navState = window.__spaNavState;
  navState.seq += 1;
  const navSeq = navState.seq;

  // Only abort if there's actually an in-flight fetch; otherwise the first load
  // would abort its own fresh controller immediately.
  if (navState.fetching && navState.controller) {
    try { navState.controller.abort(); } catch (e) {}
  }
  navState.controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
  navState.fetching = true;

  const getNavToggleEls = () => {
    const homeVideoToggleContainers = [
      document.getElementById('homeVideoToggleContainerDesktop'),
      document.getElementById('homeVideoToggleContainerMobile')
    ].filter(Boolean);
    const moeVideoToggleContainers = [
      document.getElementById('moeVideoToggleContainerDesktop'),
      document.getElementById('moeVideoToggleContainerMobile')
    ].filter(Boolean);
    const aboutUsVideoToggleContainers = [
      document.getElementById('aboutUsVideoToggleContainerDesktop'),
      document.getElementById('aboutUsVideoToggleContainerMobile')
    ].filter(Boolean);
    const contactLink = document.getElementById('contactLink');
    return { homeVideoToggleContainers, moeVideoToggleContainers, aboutUsVideoToggleContainers, contactLink };
  };

  const showContainers = (containers, show) => {
    containers.forEach((container) => {
      container.hidden = !show;
      if (show) container.style.removeProperty('display');
      else container.style.setProperty('display', 'none', 'important');
    });
  };

  const clearNavToggleInlineStyles = () => {
    const { homeVideoToggleContainers, moeVideoToggleContainers, aboutUsVideoToggleContainers, contactLink } = getNavToggleEls();
    [...homeVideoToggleContainers, ...moeVideoToggleContainers, ...aboutUsVideoToggleContainers].forEach((container) => {
      container.hidden = false;
      container.style.removeProperty('display');
    });
    if (contactLink) contactLink.style.removeProperty('display');
  };

  const hideAllNavVideoToggles = () => {
    if (window.__mainSiteNav?.setPage) return;

    const { homeVideoToggleContainers, moeVideoToggleContainers, aboutUsVideoToggleContainers, contactLink } = getNavToggleEls();
    showContainers(homeVideoToggleContainers, false);
    showContainers(moeVideoToggleContainers, false);
    showContainers(aboutUsVideoToggleContainers, false);
    if (contactLink) contactLink.style.removeProperty('display');
  };

  const updateNavVideoToggleVisibility = () => {
    if (window.__mainSiteNav?.setPage) {
      clearNavToggleInlineStyles();
      window.__mainSiteNav.setPage(page);
      return;
    }

    const { homeVideoToggleContainers, moeVideoToggleContainers, aboutUsVideoToggleContainers, contactLink } = getNavToggleEls();

    if (page === 'Home') {
      showContainers(homeVideoToggleContainers, true);
      showContainers(moeVideoToggleContainers, false);
      showContainers(aboutUsVideoToggleContainers, false);
    } else if (page === 'meetOurExperts') {
      showContainers(homeVideoToggleContainers, false);
      showContainers(moeVideoToggleContainers, true);
      showContainers(aboutUsVideoToggleContainers, false);
    } else if (page === 'aboutUs') {
      showContainers(homeVideoToggleContainers, false);
      showContainers(moeVideoToggleContainers, false);
      showContainers(aboutUsVideoToggleContainers, true);
    } else {
      showContainers(homeVideoToggleContainers, false);
      showContainers(moeVideoToggleContainers, false);
      showContainers(aboutUsVideoToggleContainers, false);
    }

    if (contactLink) contactLink.style.removeProperty('display');
  };

  // Hide all per-page toggles while loading so they don't flash.
  hideAllNavVideoToggles();

  window.HomeBackgroundVideoManager?.destroy();
  window.MeetOurExpertsBackgroundVideoManager?.destroy();
  window.AboutUsBackgroundVideoManager?.destroy();
  if (typeof destroyHomeMobileObserver === 'function') {
    destroyHomeMobileObserver();
  }

  const progressMs = document.getElementById('loading-ms');

  if (progressBar) {
    progressBar.style.strokeDasharray = `${circumference}`;
    // Use a short, linear transition so the ring tracks the real-time
    // per-frame updates smoothly instead of lagging behind a long ease.
    progressBar.style.transition = 'stroke-dashoffset 0.12s linear';
  }

  const setProgress = (percent) => {
    if (!progressBar || !progressText) return;
    const clamped = Math.max(0, Math.min(100, percent));
    const offset = circumference - (clamped / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;
    progressText.textContent = `${Math.round(clamped)}%`;
  };

  if (landing) {
    landing.style.display = 'flex';
    landing.style.opacity = 1;
    landing.style.pointerEvents = 'auto';
  }

  // Real-time loading indicator.
  // The millisecond readout reflects the ACTUAL elapsed load time (measured
  // with the high-resolution clock). The percentage follows a time-based ease
  // that climbs quickly at first then asymptotically approaches a ceiling while
  // the page fragment is still in flight, and only snaps to 100% once the real
  // work (fetch + DOM injection) has completed.
  const loadStart = (typeof performance !== 'undefined' && performance.now)
    ? performance.now()
    : Date.now();
  const now = () => ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());

  // Cancel any in-flight animation from a superseded navigation so the shared
  // ring/text elements aren't driven by two loops at once.
  if (navState.rafId) {
    cancelAnimationFrame(navState.rafId);
    navState.rafId = null;
  }
  let progressFinalized = false;

  const renderElapsed = (elapsed) => {
    if (progressMs) progressMs.textContent = `${Math.round(elapsed)} ms`;
  };

  const tickProgress = () => {
    if (progressFinalized) return;
    const elapsed = now() - loadStart;
    // Exponential approach toward a 92% ceiling; ~600ms time constant feels
    // responsive for fast loads while still showing motion on slow ones.
    const ceiling = 92;
    const pct = ceiling * (1 - Math.exp(-elapsed / 600));
    setProgress(pct);
    renderElapsed(elapsed);
    navState.rafId = requestAnimationFrame(tickProgress);
  };

  const finalizeProgress = () => {
    if (progressFinalized) return;
    progressFinalized = true;
    if (navState.rafId) {
      cancelAnimationFrame(navState.rafId);
      navState.rafId = null;
    }
    setProgress(100);
    renderElapsed(now() - loadStart);
  };

  renderElapsed(0);
  navState.rafId = requestAnimationFrame(tickProgress);

  const pageToFetch = page === 'meetOurExperts' ? 'meetourexperts' : page;
  // Capture the controller/signal used for THIS navigation.
  // navState.controller can be replaced by a newer navigation before this one settles.
  const controller = navState.controller;
  const signal = controller ? controller.signal : undefined;
  const fetchOptions = signal ? { signal } : undefined;

  const markFetchDoneIfCurrent = () => {
    try {
      if (window.__spaNavState?.seq === navSeq && window.__spaNavState?.controller === controller) {
        window.__spaNavState.fetching = false;
      }
    } catch (e) {
      // ignore
    }
  };

  fetch(`/legacy/pages/${pageToFetch}.html`, fetchOptions)
    .then((response) => response.text())
    .then((data) => {
      markFetchDoneIfCurrent();
      if (navSeq !== window.__spaNavState?.seq) return;
      if (content) content.innerHTML = data;
      finalizeProgress();

      setTimeout(() => {
        if (navSeq !== window.__spaNavState?.seq) return;
        if (landing) {
          landing.style.opacity = 0;
          landing.style.pointerEvents = 'none';
        }

        setTimeout(() => {
          if (navSeq !== window.__spaNavState?.seq) return;
          if (landing) landing.style.display = 'none';

          requestAnimationFrame(() => {
            if (navSeq !== window.__spaNavState?.seq) return;

            // Retrigger menu animation may clone/replace nav nodes.
            // Apply toggle visibility AFTER it runs so we target the live nodes only once.
            retriggerMenuAnimations();
            updateNavVideoToggleVisibility();
            updateCalendarSvgTime();
            initAudioVisualizer();
            updateMusicBarColor(page);
            calendarModal(page);
            updateHamburgerIcon(page);
            if (window.ICUEFooter && typeof window.ICUEFooter.autoInject === 'function') {
              window.ICUEFooter.autoInject();
            }
            CommunityGallery.init();
            initializeChatbot();

            if (typeof window.__mainSiteNav?.refreshLanguageSwitcher === 'function') {
              window.__mainSiteNav.refreshLanguageSwitcher();
            } else if (typeof setupLanguageSwitcher === 'function') {
              setupLanguageSwitcher();
              console.log('[LoadPage] Language switcher updated for page:', page);
            }

            switch (page) {
              case 'Home':
                initHomeMobileObserver();
                attachHomeButtonEvents();
                initHomeMobileCardObserver();
                makeItRainText();
                HomeBackgroundVideoManager.bindToggleUI();
                HomeBackgroundVideoManager.init();
                break;
              case 'News':
                initLogoSlider();
                initMobileNewsSlider();
                break;
              case 'aboutUs':
                activateModelViewers(content);
                initHomeTextSlider();
                AboutUsBackgroundVideoManager.bindToggleUI();
                AboutUsBackgroundVideoManager.init();
                break;
              case 'Contact':
                initPostMethod();
                break;
              case 'ourWork':
                activateModelViewers(content);
                initializeCarousel();
                break;
              case 'pastProjects':
                initMobileProjectsSlider();
                handleAOSByScreenSize();
                break;
              case 'orgStructure':
                initOrgProfiles();
                break;
              case 'FAQs':
                initFrequentlyAskedQuestions();
                break;
              case 'recruitment':
                JobBoard.init();
                break;
              case 'notableAwards':
                AwardsPage.init();
                break;
              case 'communityActivities':
                CommunityPage.init();
                break;
              case 'privacy':
                break;
              case 'terms':
                break;
              case 'gdpr':
                break;
              case 'cookies':
                break;
            }

            // Mark route initialization complete to avoid duplicate init from
            // `initializePageFunctions()` (hashchange/pageshow safety nets).
            window.__pageInitState = {
              page,
              time: Date.now()
            };
          });
        }, 100);
      }, 200);
    })
    .catch((err) => {
      markFetchDoneIfCurrent();
      // Ignore expected aborts (usually due to fast navigation).
      if (signal?.aborted || err?.name === 'AbortError') return;
      console.error('[loadPage] Failed to fetch page:', pageToFetch, err);
      finalizeProgress();
      try {
        if (landing) {
          landing.style.opacity = 0;
          landing.style.pointerEvents = 'none';
          setTimeout(() => {
            if (navSeq !== window.__spaNavState?.seq) return;
            landing.style.display = 'none';
          }, 200);
        }
      } catch (e) {
        // ignore
      }
    });
};

window.retriggerMenuAnimations = (isFirstLoad = true) => {
  if (document.getElementById('main-site-nav-root')?.firstElementChild) {
    window.__mainSiteNav?.playEntranceAnimation?.(isFirstLoad);
    return;
  }

  if (window.__mainSiteNav?.playEntranceAnimation) {
    window.__mainSiteNav.playEntranceAnimation(isFirstLoad);
    return;
  }

  if (typeof window.gsap === 'undefined') {
    // Fallback: never crash the app if GSAP failed to load.
    // Just make sure elements are visible.
    const selectors = [
      '.menu-toggle', '.logo-banner', '.flag-link', '.contact-link', '.contact-sidebar',
      '#langSwitcher', '#contactLink', '#menuIcon'
    ];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        el.classList.remove('pre-hidden');
        el.style.opacity = '';
        el.style.visibility = '';
      });
    });
    return;
  }

  const animatedSelectors = [
    { selector: '.menu-toggle', delay: 0 },
    // Avoid cloning/replacing `.logo-banner` because it contains per-page video toggles.
    // Animating only the logo link prevents toggle “double render”/flash.
    { selector: '#logo-link', delay: -0.3 },
    { selector: '.flag-link', delay: -0.3 },
    // Contact link is handled explicitly below (hover handlers + clone), so don't double-animate it here.
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
      1
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
     
    });
  });
}

window.initHomeTextSlider = () => {
  const sliderContainer = document.querySelector("#homeTextSlider");
  const dotsContainer = document.querySelector("#sliderDots");
  let isAnimating = false;
  let typingSessionId = 0;
  let isTyping = false;
  const SLIDE_INTERVAL = 25000; // ms - single source of truth for slide timing

  // Remove existing interval if present
  if (window.homeSliderIntervalId) {
    clearInterval(window.homeSliderIntervalId);
  }

  // Remove existing event listeners from dots by replacing container
  if (dotsContainer) {
    const newDotsContainer = dotsContainer.cloneNode(true);
    dotsContainer.parentNode.replaceChild(newDotsContainer, dotsContainer);
  }

  const messages = [
    '10+ years of urban excellence. Dedicated Professionals who are passionate about <strong class="highlight-text-phrase"> urban planning </strong>, construction, and <strong class="highlight-text-phrase"> climate change. </strong>   ',
    `Built on Unity, <strong class="highlight-text-phrase"> Driven by Values! </strong> ​​We believe in <strong class="highlight-text-phrase"> giving back </strong>, and constantly striving for self-improvement. These <strong class="highlight-text-phrase"> core values </strong> ​​shape our approach & inspire our partnerships with local professionals, government agencies.  `,
    `Smart Cities, Smarter Solutions. We use technology and <strong class="highlight-text-phrase"> data-driven insights </strong> to improve <strong class="highlight-text-phrase"> efficiency </strong>, connectivity, and future-ready cities. `,
    `Led <strong class="highlight-text-phrase"> Đà Nẵng citywide </strong> planning initiative for both tier 1 and tier 2 cities — a transformational project that reflects our commitment to <strong class="highlight-text-phrase"> big-picture </strong> strategy and real results.  `,
    `Shaping cities, <strong class="highlight-text-phrase"> improving lives. </strong> Every solution we deliver is rooted in a mission: to create a better urban future that is inclusive, <strong class="highlight-text-phrase"> sustainable </strong> and <strong class="highlight-text-phrase"> people-centered. </strong>    `,
    `💥 Create beautiful <strong class="highlight-text-phrase"> experiences </strong> that last forever.`
  ];

  const textElement = document.querySelector("#homeSliderText .highlight-text");
  const dots = document.querySelectorAll("#sliderDots .dot");

  if (!textElement || dots.length === 0 || !sliderContainer) {
    console.warn("Slider elements not found. Skipping slider init.");
    return;
  }

  let index = 0;
  let isPaused = false;

  function updateText(newIndex) {
    console.debug('[slider] updateText start', { newIndex, index, isPaused, isTyping });
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
            console.debug('[slider] typing complete', { index, typingSessionId });
            gsap.fromTo(textElement, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "elastic.out(1, 0.5)" });
          });
        }
      }
    );

    // Step 3: Update dot states and restart progress bar
    dots.forEach((dot, i) => {
      const progress = dot.classList.contains('progress-dot') ? dot : dot.querySelector('.progress-dot');
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
          progress.style.animation = `slide-progress ${SLIDE_INTERVAL / 1000}s linear forwards`;
        }
      }
    });
  }

  function nextText(force = false) {
    console.debug('[slider] nextText called', { force, isPaused, index });
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
      console.debug('[slider] restartInterval starting interval', { SLIDE_INTERVAL });
      window.homeSliderIntervalId = setInterval(nextText, SLIDE_INTERVAL);
    }
  }

  // Initialize the slider
  updateText(index);
  clearInterval(window.homeSliderIntervalId);
  window.homeSliderIntervalId = setInterval(nextText, SLIDE_INTERVAL);
  console.debug('[slider] interval started', { SLIDE_INTERVAL });

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
      
      // Add resume functionality after SLIDE_INTERVAL
      setTimeout(() => {
        isPaused = false;
        restartInterval();
      }, SLIDE_INTERVAL);
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
      window.homeSliderIntervalId = setInterval(nextText, SLIDE_INTERVAL);
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

let currentPage = '';
let isInitialLoad = true;

window.addEventListener('DOMContentLoaded', router);
window.addEventListener('hashchange', router);

function router() {
  const hash = window.location.hash || '#/Home';
  const page = hash.replace('#/', '') || 'Home';
  
  // If we are already on the target page and this isn't the first load, do nothing
  if (page === currentPage && !isInitialLoad) {
    return;
  }
  
  // Update state and load the page
  currentPage = page;
  window.currentPage = page;
  isInitialLoad = false;
  window.loadPage(page);
}

window.toggleDrawerMenu = () => {
  if (window.__mainSiteNav?.setDrawerOpen) {
    const isOpen = window.__mainSiteNav.getDrawerOpen?.() ?? false;
    window.__mainSiteNav.setDrawerOpen(!isOpen);
    return;
  }

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
  if (window.__mainSiteNav?.setDrawerOpen) {
    window.__mainSiteNav.setDrawerOpen(false);
    return;
  }

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
  window.currentPage = page;
  loadPage(page);
  highlightActiveLink(page);
  closeDrawerMenu();
}

// Highlight active link
window.highlightActiveLink = (page) => {
  if (window.__mainSiteNav?.setPage) {
    window.__mainSiteNav.setPage(page);
    return;
  }

  const links = document.querySelectorAll('#drawerMenu a');
  links.forEach(link => {
    link.classList.remove('active');
    if (link.textContent.toLowerCase().includes(page.toLowerCase())) {
      link.classList.add('active');
    }
  });
}

window.toggleSubmenu = (e) => {
  if (e) e.preventDefault();
  if (window.__mainSiteNav) return;
  const submenu = document.getElementById('ourPeopleSubmenu');
  if (!submenu) return;

  if (submenu.classList.contains('open')) {
    submenu.classList.remove('open');
    submenu.classList.add('closing');
    setTimeout(() => submenu.classList.remove('closing'), 300);
  } else {
    submenu.classList.remove('closing');
    submenu.classList.add('open');
  }
};

/** Legacy drawer resize — handled by React useDrawerResize when nav island is mounted. */
window.initMainDrawerResize = () => {
  if (window.__mainSiteNav) return;
  const drawer = document.getElementById('drawerMenu');
  const handle = document.getElementById('drawerResizeHandle');
  if (!drawer || !handle) return;

  const STORAGE_KEY = 'icue_main_drawer_width';
  const MIN_WIDTH = 140;
  const MAX_WIDTH = 280;
  const DEFAULT_WIDTH = 180;
  const desktopQuery = window.matchMedia('(min-width: 1441px)');

  const clampWidth = (width) => Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));

  const applyWidth = (width) => {
    const next = clampWidth(width);
    drawer.style.setProperty('--drawer-width', `${next}px`);
    drawer.style.width = `${next}px`;
    return next;
  };

  const loadSavedWidth = () => {
    let saved = DEFAULT_WIDTH;
    try {
      saved = Number.parseInt(localStorage.getItem(STORAGE_KEY), 10);
    } catch (e) {
      // ignore blocked storage (e.g. tracking prevention)
    }
    applyWidth(Number.isFinite(saved) ? saved : DEFAULT_WIDTH);
  };

  const syncHandle = () => {
    handle.hidden = !desktopQuery.matches;
  };

  loadSavedWidth();
  syncHandle();
  desktopQuery.addEventListener('change', syncHandle);

  let dragging = false;
  let startX = 0;
  let startWidth = DEFAULT_WIDTH;

  const stopDragging = (event) => {
    if (!dragging) return;
    dragging = false;
    drawer.classList.remove('is-resizing');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    const width = applyWidth(drawer.getBoundingClientRect().width);
    try {
      localStorage.setItem(STORAGE_KEY, String(Math.round(width)));
    } catch (e) {
      // ignore blocked storage (e.g. tracking prevention)
    }
    if (event?.pointerId != null && handle.hasPointerCapture(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }
  };

  handle.addEventListener('pointerdown', (event) => {
    if (!desktopQuery.matches) return;
    dragging = true;
    startX = event.clientX;
    startWidth = drawer.getBoundingClientRect().width;
    drawer.classList.add('is-resizing');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    handle.setPointerCapture(event.pointerId);
    event.preventDefault();
  });

  handle.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    applyWidth(startWidth + (event.clientX - startX));
  });

  handle.addEventListener('pointerup', stopDragging);
  handle.addEventListener('pointercancel', stopDragging);
};

document.addEventListener('DOMContentLoaded', () => {
  window.initMainDrawerResize?.();
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

// `initMobileProjectsSlider` now lives in `src/modules/cardSlider.js`
// (shared with the News page). It is assigned to `window` there and remains
// callable here via the same global name.

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

      // Expose FAQ data for the chatbot / search features
      try {
        window.__icueFaqData = faqData;
        window.__icueFaqLang = 'en';
      } catch (e) {
        // ignore
      }
      
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

  // Function to highlight search terms in text
  function highlightSearchTerms(text, searchTerm) {
      if (!searchTerm) return text;
      
      const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Function to remove highlights
  function removeHighlights() {
      const highlights = document.querySelectorAll('.search-highlight');
      highlights.forEach(highlight => {
          const parent = highlight.parentNode;
          parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
          parent.normalize();
      });
  }

  // Function to render job positions with optional highlighting
  function renderJobs(jobs, searchTerm = '') {
      const jobsContainer = document.getElementById('jobs-container');
      if (!jobsContainer) {
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
          
          // Apply highlighting if search term exists
          const highlightedTitle = highlightSearchTerms(job.title, searchTerm);
          const highlightedDepartment = highlightSearchTerms(job.department, searchTerm);
          const highlightedDescription = highlightSearchTerms(job.description, searchTerm);
          const highlightedTags = job.tags.map(tag => highlightSearchTerms(tag, searchTerm));
          
          jobCard.innerHTML = `
              <h3 class="job-title">${highlightedTitle}</h3>
              <div class="job-department">${highlightedDepartment}</div>
              <div class="job-location"><svg width="16px" height="16px" viewBox="-3 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>pin_sharp_circle [#624]</title> <desc>Created with Sketch.</desc> <defs> </defs> <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <g id="Dribbble-Light-Preview" transform="translate(-223.000000, -5439.000000)" fill="#000000"> <g id="icons" transform="translate(56.000000, 160.000000)"> <path d="M176,5286.219 C176,5287.324 175.105,5288.219 174,5288.219 C172.895,5288.219 172,5287.324 172,5286.219 C172,5285.114 172.895,5284.219 174,5284.219 C175.105,5284.219 176,5285.114 176,5286.219 M174,5296 C174,5296 169,5289 169,5286 C169,5283.243 171.243,5281 174,5281 C176.757,5281 179,5283.243 179,5286 C179,5289 174,5296 174,5296 M174,5279 C170.134,5279 167,5282.134 167,5286 C167,5289.866 174,5299 174,5299 C174,5299 181,5289.866 181,5286 C181,5282.134 177.866,5279 174,5279" id="pin_sharp_circle-[#624]"> </path> </g> </g> </g> </g></svg>${job.location}</div>
              <div class="job-description">${highlightedDescription}</div>
              <div class="job-tags">
                  ${highlightedTags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
              </div>
          `;
          
          jobsContainer.appendChild(jobCard);
      });
  }

  // Function to search jobs with highlighting and auto-scroll
  function searchJobs(event) {
      event.preventDefault();
      const searchInput = document.getElementById('job-search');
      const searchTerm = searchInput.value.toLowerCase().trim();
      
      // Clear search message
      const existingMessage = document.querySelector('.search-result-message');
      if (existingMessage) {
          existingMessage.remove();
      }
      
      if (!searchTerm) {
          // If search is cleared, remove highlights and show all jobs
          removeHighlights();
          renderJobs(jobPositions);
          return;
      }

      // Filter jobs based on search term
      const filteredJobs = jobPositions.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.department.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );

      // Render jobs with highlighting
      renderJobs(filteredJobs, searchTerm);
      
      // Scroll to jobs section if matches found
      if (filteredJobs.length > 0) {
          const jobsSection = document.getElementById('open-positions') || 
                             document.getElementById('jobs-container') || 
                             document.querySelector('.jobs-section');
          
          if (jobsSection) {
              setTimeout(() => {
                  jobsSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start'
                  });
              }, 100); // Small delay to ensure rendering is complete
          }
      }
      
      // Show search results message
      const resultMessage = filteredJobs.length === 0 
          ? `Không tìm thấy vị trí nào cho "${searchInput.value}"`
          : `Tìm thấy ${filteredJobs.length} vị trí phù hợp với "${searchInput.value}"`;
          
      showSearchMessage(resultMessage);
  }

  // Function to clear search and remove highlights
  function clearSearch() {
      const searchInput = document.getElementById('job-search');
      if (searchInput) {
          searchInput.value = '';
      }
      
      // Remove highlights and show all jobs
      removeHighlights();
      renderJobs(jobPositions);
      
      // Clear search message
      const existingMessage = document.querySelector('.search-result-message');
      if (existingMessage) {
          existingMessage.remove();
      }
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
      
      // Set up search functionality
      const searchInput = document.getElementById('job-search');
      const searchForm = document.querySelector('.job-search-form') || document.querySelector('form');
      
      if (searchInput) {
          // Handle search on form submit
          if (searchForm) {
              searchForm.addEventListener('submit', searchJobs);
          }
          
          // Handle search on input change (real-time search)
          searchInput.addEventListener('input', function(e) {
              // Add slight delay for better performance
              clearTimeout(this.searchTimeout);
              this.searchTimeout = setTimeout(() => {
                  searchJobs(e);
              }, 300);
          });
          
          // Clear search when input is emptied
          searchInput.addEventListener('keyup', function(e) {
              if (e.target.value === '') {
                  clearSearch();
              }
          });
      }
      
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
      
      // Add CSS for search highlighting if not already present
      if (!document.getElementById('job-search-highlight-styles')) {
          const style = document.createElement('style');
          style.id = 'job-search-highlight-styles';
          style.textContent = `
              .search-highlight {
                  background-color: #ffeb3b;
                  color: #000;
                  padding: 2px 4px;
                  border-radius: 3px;
                  font-weight: bold;
              }
              
              .search-result-message {
                  animation: slideIn 0.3s ease-out;
              }
              
              @keyframes slideIn {
                  from {
                      opacity: 0;
                      transform: translateY(-10px);
                  }
                  to {
                      opacity: 1;
                      transform: translateY(0);
                  }
              }
          `;
          document.head.appendChild(style);
      }
  }

  // Public API - expose these functions globally
  return {
      init: initialize,
      renderJobs: renderJobs,
      searchJobs: searchJobs,
      clearSearch: clearSearch,
      highlightSearchTerms: highlightSearchTerms,
      removeHighlights: removeHighlights,
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

// Make JobBoard functions globally accessible for HTML event handlers
window.searchJobs = function(event) {
  if (window.JobBoard && window.JobBoard.searchJobs) {
      return window.JobBoard.searchJobs(event);
  }
};

window.clearJobSearch = function() {
  if (window.JobBoard && window.JobBoard.clearSearch) {
      return window.JobBoard.clearSearch();
  }
};

document.addEventListener('DOMContentLoaded', function() {
  if (window.JobBoard) {
      window.JobBoard.init();
  }
});

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

      const cards = document.querySelectorAll('.award-card, .cert-card');
      cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `all 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
      });

      const timelineItems = document.querySelectorAll('.timeline-item');
      timelineItems.forEach((item, index) => {
        item.style.transitionDelay = `${index * 0.1}s`;
        observer.observe(item);
      });

      console.log('Awards page loaded successfully');
    }

    function handleIntersect(entries) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('timeline-item')) {
            entry.target.classList.add('animate');
          } else {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
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
    _scrollRafId: null,
    _scrollHandler: null,
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

      const photoItems = document.querySelectorAll('.photo-item');
      photoItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
      });

      const floatingElements = document.querySelector('.floating-elements');
      if (floatingElements) {
        if (this._scrollHandler) {
          window.removeEventListener('scroll', this._scrollHandler);
        }
        this._scrollHandler = () => {
          if (this._scrollRafId) return;
          this._scrollRafId = requestAnimationFrame(() => {
            this._scrollRafId = null;
            const rate = window.pageYOffset * -0.5;
            floatingElements.style.transform = `translateY(${rate}px)`;
          });
        };
        window.addEventListener('scroll', this._scrollHandler, { passive: true });
      }

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
            }, 200);
          }
        });
      });
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (window.CommunityPage && typeof window.CommunityPage.init === 'function') {
      window.CommunityPage.init();
    }
  });

window.CommunityGallery = (function () {
    // --- Private state ---
    const photoItems = [
      { src: "public/community/1.jpg", alt: "Hội thảo chuyên gia", caption: "" },
      { src: "public/community/2.jpg", alt: "Gặp gỡ thành viên", caption: "" },
      { src: "public/community/3.jpg", alt: "Thuyết trình công nghệ", caption: "" },
      { src: "public/community/4.jpg", alt: "Networking session", caption: "" },
      { src: "public/community/5.jpg", alt: "Workshop tương tác", caption: "" },
      { src: "public/community/6.jpg", alt: "Chia sẻ kinh nghiệm", caption: "" },
      { src: "public/community/7.jpg", alt: "Cộng đồng global", caption: "" },
      { src: "public/community/8.jpg", alt: "Meetup địa phương", caption: "" },
      { src: "public/community/9.jpg", alt: "Meetup địa phương", caption: "" },
      { src: "public/community/10.jpg", alt: "Meetup địa phương", caption: "" },
      { src: "public/community/11.jpg", alt: "Meetup địa phương", caption: "" },
      { src: "public/community/12.jpg", alt: "Meetup địa phương", caption: "" },
      { src: "public/community/13.jpg", alt: "Meetup địa phương", caption: "" }
    ];

    let currentPhotoIndex = 0;
    let modalCurrentIndex = 0;
    let startX = 0;
    let endX = 0;

    // --- Modal Functions ---
    function createModal() {
      // Remove existing modal if it exists
      const existingModal = document.getElementById('community-modal');
      if (existingModal) {
        existingModal.remove();
      }

      const modal = document.createElement('div');
      modal.id = 'community-modal';
      modal.className = 'community-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
      `;

      const content = document.createElement('div');
      content.className = 'community-modal-content';
      content.style.cssText = `
        position: relative;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
      `;

      const counter = document.createElement('div');
      counter.className = 'community-modal-counter';
      counter.style.cssText = `
        position: absolute;
        top: -60px;
        left: 0;
        background: rgba(0, 0, 0, 0.8);
        color: #ffffff;
        padding: 10px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        backdrop-filter: blur(10px);
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '<svg width="64px" height="64px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM8.96963 8.96965C9.26252 8.67676 9.73739 8.67676 10.0303 8.96965L12 10.9393L13.9696 8.96967C14.2625 8.67678 14.7374 8.67678 15.0303 8.96967C15.3232 9.26256 15.3232 9.73744 15.0303 10.0303L13.0606 12L15.0303 13.9696C15.3232 14.2625 15.3232 14.7374 15.0303 15.0303C14.7374 15.3232 14.2625 15.3232 13.9696 15.0303L12 13.0607L10.0303 15.0303C9.73742 15.3232 9.26254 15.3232 8.96965 15.0303C8.67676 14.7374 8.67676 14.2625 8.96965 13.9697L10.9393 12L8.96963 10.0303C8.67673 9.73742 8.67673 9.26254 8.96963 8.96965Z" fill="#ffffff"></path> </g></svg>';
      closeBtn.className = 'community-modal-close';
      closeBtn.style.cssText = `
        position: absolute;
        top: -60px;
        right: 0;
        background: transparent;
        border: none;
        color: #ffffff;
        font-size: 24px;
        padding: 15px 18px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
      `;
      closeBtn.onmouseenter = () => closeBtn.style.background = 'rgba(255, 0, 0, 0.8)';
      closeBtn.onmouseleave = () => closeBtn.style.background = 'rgba(0, 0, 0, 0.8)';
      closeBtn.onclick = closeModal;

      const prevBtn = document.createElement('button');
      prevBtn.innerHTML = '<svg fill="#fff" width="64px" height="64px" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>left</title> <path d="M7.094 15.938l7.688 7.688-3.719 3.563-11.063-11.063 11.313-11.344 3.531 3.5z"></path> </g></svg>';
      prevBtn.className = 'community-modal-nav community-modal-prev';
      prevBtn.style.cssText = `
        position: absolute;
        top: 50%;
        left: -80px;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        border: none;
        color: #ffffff;
        font-size: 24px;
        padding: 15px 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
      `;
      prevBtn.onmouseenter = () => {
        prevBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        prevBtn.style.transform = 'translateY(-50%) scale(1.1)';
      };
      prevBtn.onmouseleave = () => {
        prevBtn.style.background = 'rgba(0, 0, 0, 0.8)';
        prevBtn.style.transform = 'translateY(-50%) scale(1)';
      };
      prevBtn.onclick = () => navigateModal(-1);

      const nextBtn = document.createElement('button');
      nextBtn.innerHTML = '<svg fill="#fff" width="64px" height="64px" viewBox="-8.5 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>right</title> <path d="M7.75 16.063l-7.688-7.688 3.719-3.594 11.063 11.094-11.344 11.313-3.5-3.469z"></path> </g></svg>';
      nextBtn.className = 'community-modal-nav community-modal-next';
      nextBtn.style.cssText = `
        position: absolute;
        top: 50%;
        right: -80px;
        transform: translateY(-50%);
        background: rgba(0, 0, 0, 0.8);
        border: none;
        color: #ffffff;
        font-size: 24px;
        padding: 15px 20px;
        border-radius: 50%;
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: 10;
      `;
      nextBtn.onmouseenter = () => {
        nextBtn.style.background = 'rgba(255, 255, 255, 0.2)';
        nextBtn.style.transform = 'translateY(-50%) scale(1.1)';
      };
      nextBtn.onmouseleave = () => {
        nextBtn.style.background = 'rgba(0, 0, 0, 0.8)';
        nextBtn.style.transform = 'translateY(-50%) scale(1)';
      };
      nextBtn.onclick = () => navigateModal(1);

      const image = document.createElement('img');
      image.id = 'community-modal-image';
      image.className = 'community-modal-image';
      image.style.cssText = `
        max-width: 100%;
        max-height: 80vh;
        object-fit: contain;
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      `;

      const caption = document.createElement('div');
      caption.className = 'community-modal-caption';
      caption.style.cssText = `
        color: #ffffff;
        text-align: center;
        margin-top: 20px;
        font-size: 16px;
        font-weight: 500;
        max-width: 600px;
      `;

      // Mobile responsive styles
      const style = document.createElement('style');
      style.innerHTML = `
        @media (max-width: 768px) {
          .community-modal-nav {
            font-size: 20px !important;
            padding: 12px 15px !important;
          }
          .community-modal-prev {
            left: 10px !important;
          }
          .community-modal-next {
            right: 10px !important;
          }
          .community-modal-close {
            display: none !important;
          }
          .community-modal-counter {
            top: -20px !important;
            left: 20px !important;
            font-size: 12px !important;
            padding: 8px 12px !important;
          }
        }
      `;
      document.head.appendChild(style);

      content.appendChild(counter);
      content.appendChild(closeBtn);
      content.appendChild(prevBtn);
      content.appendChild(nextBtn);
      content.appendChild(image);
      content.appendChild(caption);
      modal.appendChild(content);
      document.body.appendChild(modal);

      // Close modal when clicking outside
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal();
        }
      });

      // Keyboard navigation for modal
      document.addEventListener('keydown', handleModalKeyboard);

      return modal;
    }

    function openModal(index = 0) {
      modalCurrentIndex = index;
      const modal = document.getElementById('community-modal') || createModal();
      updateModalContent();
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      const modal = document.getElementById('community-modal');
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    }

    function navigateModal(direction) {
      modalCurrentIndex += direction;
      if (modalCurrentIndex < 0) modalCurrentIndex = photoItems.length - 1;
      if (modalCurrentIndex >= photoItems.length) modalCurrentIndex = 0;
      updateModalContent();
    }

    function updateModalContent() {
      const image = document.getElementById('community-modal-image');
      const caption = document.querySelector('.community-modal-caption');
      const counter = document.querySelector('.community-modal-counter');

      if (image && caption && counter) {
        const currentPhoto = photoItems[modalCurrentIndex];
        image.src = currentPhoto.src;
        image.alt = currentPhoto.alt;
        caption.textContent = currentPhoto.caption;
        counter.textContent = `${modalCurrentIndex + 1}/${photoItems.length}`;
      }
    }

    function handleModalKeyboard(e) {
      const modal = document.getElementById('community-modal');
      if (modal && modal.style.display === 'flex') {
        switch (e.key) {
          case 'ArrowLeft':
            navigateModal(-1);
            e.preventDefault();
            break;
          case 'ArrowRight':
            navigateModal(1);
            e.preventDefault();
            break;
          case 'Escape':
            closeModal();
            e.preventDefault();
            break;
        }
      }
    }

    // --- Functions ---
    function initialize() {
      const photoCollage = document.querySelector('.photo-collage');
      if (!photoCollage) return; // Guard: don't run if container doesn't exist

      const photoGrid = document.querySelector('.photo-grid');

      // Add click events to photo items to open modal
      const photoItems = document.querySelectorAll('.photo-item');
      photoItems.forEach((item, index) => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', () => openModal(index));
      });

      // Add total media counter
      const totalCounter = document.createElement('div');
      totalCounter.className = 'community-media-counter';
      totalCounter.textContent = `${photoItems.length} ảnh`;
      totalCounter.style.cssText = `
        position: absolute;
        top: 15px;
        left: 15px;
        background: rgba(0,0,0,0.8);
        color: #ffffff;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        pointer-events: none;
        z-index: 10;
        backdrop-filter: blur(10px);
      `;
      photoCollage.appendChild(totalCounter);

      // Add current photo indicator
      const currentIndicator = document.createElement('div');
      currentIndicator.className = 'community-current-indicator';
      currentIndicator.textContent = `1/${photoItems.length}`;
      currentIndicator.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: rgba(0,0,0,0.8);
        color: #ffffff;
        padding: 8px 15px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        pointer-events: none;
        z-index: 10;
        backdrop-filter: blur(10px);
      `;
      photoCollage.appendChild(currentIndicator);

      // Add navigation arrows
      const leftArrow = document.createElement('button');
      leftArrow.innerHTML = '<svg fill="#fff" width="30px" height="30px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M30 14.5c-.004.276-.224.504-.5.5h-26c-.66 0-.664-1 0-1h26c.282-.004.504.218.5.5zm-15 14c0 .45-.554.663-.854.354l-14-14c-.195-.196-.195-.512 0-.708l14-14c.426-.442 1.167.248.708.708L1.207 14.5l13.647 13.646c.097.095.146.22.146.354z"/></svg>';
      leftArrow.style.cssText = `
        position: absolute;
        left: 15px;
        bottom: 15px;
        background: rgba(0,0,0,0.8);
        border: none;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        opacity: 0.8;
      `;
      leftArrow.onmouseenter = () => leftArrow.style.opacity = '1';
      leftArrow.onmouseleave = () => leftArrow.style.opacity = '0.8';
      leftArrow.onclick = () => navigate(-1);

      const rightArrow = document.createElement('button');
      rightArrow.innerHTML = '<svg fill="#fff" width="30px" height="30px" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><path d="M0 15.5c.004.276.224.504.5.5h26c.66 0 .664-1 0-1H.5c-.282-.004-.504.218-.5.5zm15 14c0 .45.554.663.854.354l14-14c.195-.195.195-.51 0-.707l-14-14c-.426-.443-1.167.248-.707.707L28.793 15.5 15.147 29.148c-.098.095-.147.218-.147.353z"/></svg>';
      rightArrow.style.cssText = `
        position: absolute;
        right: 15px;
        bottom: 15px;
        background: rgba(0,0,0,0.8);
        border: none;
        padding: 10px 15px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10;
        transition: all 0.3s ease;
        opacity: 0.8;
      `;
      rightArrow.onmouseenter = () => rightArrow.style.opacity = '1';
      rightArrow.onmouseleave = () => rightArrow.style.opacity = '0.8';
      rightArrow.onclick = () => navigate(1);

      photoCollage.appendChild(leftArrow);
      photoCollage.appendChild(rightArrow);

      // Touch events
      photoCollage.addEventListener('touchstart', handleTouchStart, { passive: false });
      photoCollage.addEventListener('touchmove', handleTouchMove, { passive: false });
      photoCollage.addEventListener('touchend', handleTouchEnd, { passive: false });

      // Keyboard navigation
      document.addEventListener('keydown', handleKeyboard);

      // Add dots indicator
      addDots();

      // Highlight first photo
      highlightCurrentPhoto();
    }

    function navigate(direction) {
      currentPhotoIndex += direction;
      if (currentPhotoIndex < 0) currentPhotoIndex = photoItems.length - 1;
      if (currentPhotoIndex >= photoItems.length) currentPhotoIndex = 0;

      updateIndicators();
      highlightCurrentPhoto();
    }

    function updateIndicators() {
      const currentIndicator = document.querySelector('.community-current-indicator');
      if (currentIndicator) {
        currentIndicator.textContent = `${currentPhotoIndex + 1}/${photoItems.length}`;
      }

      // Update dots
      const dots = document.querySelectorAll('.community-dot');
      dots.forEach((dot, index) => {
        const isActive = index === currentPhotoIndex;
        dot.style.background = isActive ? '#22c55e' : 'rgba(255,255,255,0.4)';
        dot.style.transform = isActive ? 'scale(1.2)' : 'scale(1)';
      });
    }

    function highlightCurrentPhoto() {
      const items = document.querySelectorAll('.photo-item');
      items.forEach((item, index) => {
        if (index === currentPhotoIndex) {
          item.style.transform = 'scale(1.1)';
          item.style.boxShadow = '0 10px 30px rgba(200, 255, 0, 0.6)';
          item.style.zIndex = '15';
        } else {
          item.style.transform = '';
          item.style.boxShadow = '';
          item.style.zIndex = '';
        }
      });
    }

    function addDots() {
      const photoCollage = document.querySelector('.photo-collage');
      const dotsContainer = document.createElement('div');
      dotsContainer.className = 'community-dots-container';
      dotsContainer.style.cssText = `
        position: absolute;
        bottom: 60px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 8px;
        z-index: 10;
        backdrop-filter: blur(4px);
        background: rgba(0,0,0,0.2);
        padding: 8px 12px;
        border-radius: 20px;
      `;

      photoItems.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.className = 'community-dot';
        dot.style.cssText = `
          all: unset;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.6);
          background: ${index === 0 ? '#22c55e' : 'rgba(255,255,255,0.4)'};
          cursor: pointer;
          transition: all 0.3s ease;
        `;
        dot.onclick = () => {
          currentPhotoIndex = index;
          updateIndicators();
          highlightCurrentPhoto();
        };
        dotsContainer.appendChild(dot);
      });

      photoCollage.appendChild(dotsContainer);
    }

    // --- Touch handlers ---
    function handleTouchStart(e) {
      startX = e.touches[0].clientX;
    }
    function handleTouchMove(e) {
      if (!startX) return;
      e.preventDefault();
    }
    function handleTouchEnd(e) {
      if (!startX) return;
      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      const threshold = 50;
      if (Math.abs(diffX) > threshold) {
        navigate(diffX > 0 ? 1 : -1);
      }
      startX = 0;
      endX = 0;
    }

    // --- Keyboard navigation ---
    function handleKeyboard(e) {
      switch (e.key) {
        case 'ArrowLeft':
          navigate(-1);
          e.preventDefault();
          break;
        case 'ArrowRight':
          navigate(1);
          e.preventDefault();
          break;
      }
    }

    // Expose public API
    return {
      init: initialize,
      next: () => navigate(1),
      prev: () => navigate(-1),
      goTo: (index) => {
        currentPhotoIndex = Math.max(0, Math.min(photoItems.length - 1, index));
        updateIndicators();
        highlightCurrentPhoto();
      },
      openModal: (index = 0) => openModal(index),
      closeModal: closeModal
    };
  })();

  // Auto init when page loads
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.photo-collage')) {
      window.CommunityGallery.init();
    }
  });

  document.addEventListener('DOMContentLoaded', () => {
    if (window.CommunityPage && typeof window.CommunityPage.init === 'function') {
      window.CommunityPage.init();
    }
  });

window.initializeChatbot = function(targetSelector = 'body', css = '') {
    if (document.getElementById('ai-chatbot')) {
        return false;
    }

    const chatbotHTML = `
        <div id="ai-chatbot" class="chatbot-container">
            <div class="chatbot-toggle" id="chatbot-toggle">
                <svg width="64px" height="64px" viewBox="0 -0.5 17 17" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="si-glyph si-glyph-bubble-message-dot-2" fill="#000000" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <title>1049</title> <defs> </defs> <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"> <path d="M9.019,1.04 C4.621,1.04 1.051,3.66 1.051,6.892 C1.051,9.842 4.026,12.276 7.893,12.679 L5.845,15.929 L11.964,12.326 C14.906,11.465 16.989,9.358 16.989,6.891 C16.989,3.66 13.42,1.04 9.019,1.04 L9.019,1.04 Z M6,8 L4,8 L4,6 L6,6 L6,8 L6,8 Z M10,8 L8,8 L8,6 L10,6 L10,8 L10,8 Z M14,8 L12,8 L12,6 L14,6 L14,8 L14,8 Z" fill="#34efeb" class="si-glyph-fill"> </path> </g> </g></svg>
                <span class="chatbot-badge">Auto</span>
            </div>
            
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-title">
                        <span>ICUE-AI Chatbot</span>
                    </div>
                    <button class="chatbot-close" id="chatbot-close">
                        <svg width="22px" height="22px" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="message bot-message">
                        <div class="message-avatar">
                            <svg style="transform:translateY(6px)" width="22px" height="22px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g clip-path="url(#clip0_8_53)"> <path d="M16 12C15.87 12.0016 15.7409 11.9778 15.62 11.93C15.4971 11.8781 15.3852 11.8035 15.29 11.7101C15.2001 11.6179 15.1287 11.5092 15.08 11.39C15.0296 11.266 15.0025 11.1338 15 11C15.0011 10.7376 15.1053 10.4863 15.29 10.3C15.3825 10.2033 15.4952 10.1282 15.62 10.0801C15.8031 10.0047 16.0044 9.98535 16.1984 10.0245C16.3924 10.0637 16.5705 10.1596 16.71 10.3C16.8947 10.4863 16.9989 10.7376 17 11C16.9975 11.1338 16.9704 11.266 16.92 11.39C16.8713 11.5092 16.7999 11.6179 16.71 11.7101C16.6166 11.8027 16.5057 11.876 16.3839 11.9258C16.2621 11.9755 16.1316 12.0007 16 12Z" fill="#000000"></path> <path d="M12 12C11.87 12.0016 11.7409 11.9778 11.62 11.93C11.4971 11.8781 11.3852 11.8035 11.29 11.7101C11.2001 11.6179 11.1287 11.5092 11.08 11.39C11.0296 11.266 11.0025 11.1338 11 11C11.0011 10.7376 11.1053 10.4863 11.29 10.3C11.3825 10.2033 11.4952 10.1282 11.62 10.0801C11.8031 10.0047 12.0044 9.98535 12.1984 10.0245C12.3924 10.0637 12.5705 10.1596 12.71 10.3C12.8947 10.4863 12.9989 10.7376 13 11C12.9975 11.1338 12.9704 11.266 12.92 11.39C12.8713 11.5092 12.7999 11.6179 12.71 11.7101C12.6166 11.8027 12.5057 11.876 12.3839 11.9258C12.2621 11.9755 12.1316 12.0007 12 12Z" fill="#000000"></path> <path d="M8 12C7.86999 12.0016 7.74091 11.9778 7.62 11.93C7.49713 11.8781 7.38519 11.8035 7.29001 11.7101C7.20006 11.6179 7.12873 11.5092 7.07999 11.39C7.0296 11.266 7.0025 11.1338 7 11C7.0011 10.7376 7.10526 10.4863 7.29001 10.3C7.3825 10.2033 7.49516 10.1282 7.62 10.0801C7.80305 10.0047 8.00435 9.98535 8.19839 10.0245C8.39244 10.0637 8.57048 10.1596 8.70999 10.3C8.89474 10.4863 8.9989 10.7376 9 11C8.9975 11.1338 8.9704 11.266 8.92001 11.39C8.87127 11.5092 8.79994 11.6179 8.70999 11.7101C8.61655 11.8027 8.50575 11.876 8.38391 11.9258C8.26207 11.9755 8.13161 12.0007 8 12Z" fill="#000000"></path> </g> <path d="M4.99951 16.55V19.9C4.99922 20.3102 5.11905 20.7114 5.34418 21.0542C5.56931 21.397 5.88994 21.6665 6.26642 21.8292C6.6429 21.9919 7.05875 22.0408 7.46271 21.9698C7.86666 21.8989 8.24103 21.7113 8.53955 21.4301L11.1495 18.9701H12.0195C17.5395 18.9701 22.0195 15.1701 22.0195 10.4701C22.0195 5.77009 17.5395 1.97009 12.0195 1.97009C6.49953 1.97009 2.01953 5.78009 2.01953 10.4701C2.042 11.6389 2.32261 12.7882 2.84125 13.8358C3.35989 14.8835 4.10373 15.8035 5.01953 16.53L4.99951 16.55Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> <defs> <clipPath id="clip0_8_53"> <rect width="10" height="2" fill="white" transform="translate(7 10)"></rect> </clipPath> </defs> </g></svg>
                        </div>
                        <div class="message-content">
                            Hello! I am ICUE's AI assistant. I can help you learn about our projects, services, and information. What do you need assistance with?
                        </div>
                    </div>
                </div>
                
                <div class="chatbot-input-area">
                    <div class="chatbot-input-container">
                        <input type="text" id="chatbot-input" placeholder="Ask Anything..." />
                        <button class="chatbot-send" id="chatbot-send">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </div>
                    <div class="chatbot-suggestions">
                        <button class="suggestion-btn">Services</button>
                        <button class="suggestion-btn">Recent Projects</button>
                        <button class="suggestion-btn">Contact</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Inject CSS if provided
    if (css && !document.querySelector('#icue-chatbot-style')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'icue-chatbot-style';
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }

    // Inject HTML
    const targetElement = document.querySelector(targetSelector);
    if (!targetElement) {
        console.error('Chatbot: Target element not found');
        return false;
    }

    targetElement.insertAdjacentHTML('beforeend', chatbotHTML);

    // Initialize chatbot functionality
    const chatbotKnowledge = createChatbotKnowledge();
    setupChatbotEvents(chatbotKnowledge);
    
    return true;

    function createChatbotKnowledge() {
      const kbCache = Object.create(null);
      const kbLoading = Object.create(null);
      const siteLang = ((document.documentElement.lang || 'en').toLowerCase().startsWith('vi')) ? 'vi' : 'en';
      const kbPaths = {
        vi: '/public/chatbot/kb.vi.json',
        en: '/public/chatbot/kb.en.json'
      };

      // Warm the cache (non-blocking)
      // Prefetch both languages so we can route per-message.
      ensureKb('en').catch(() => {});
      ensureKb('vi').catch(() => {});

      return {
        siteLang,
        ensureKb,
        getResponse
      };

      async function ensureKb(lang) {
        const safeLang = (lang === 'en' || lang === 'vi') ? lang : siteLang;
        if (kbCache[safeLang]) return kbCache[safeLang];
        if (!kbLoading[safeLang]) {
          kbLoading[safeLang] = loadKb(safeLang)
            .catch(() => getFallbackKb(safeLang))
            .then((kb) => prepareKb(kb, safeLang));
        }
        kbCache[safeLang] = await kbLoading[safeLang];
        return kbCache[safeLang];
      }

      async function loadKb(lang) {
        const url = kbPaths[lang];
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`KB fetch failed: ${res.status}`);
        const kb = await res.json();
        if (!kb || !Array.isArray(kb.intents)) throw new Error('KB invalid shape');
        return kb;
      }

      function getFallbackKb(lang) {
        return {
          version: 1,
          language: lang,
          intents: [
            {
              id: 'contact',
              keywords: ['contact', 'email', 'phone', 'hotline'],
              phrases: ['how can i contact you', 'contact details'],
              answer: lang === 'vi'
                ? 'Bạn có thể xem trang Liên hệ để biết email/số điện thoại/biểu mẫu.'
                : 'Please check the Contact page for email/phone/form details.',
              links: [{ label: 'Contact', url: 'https://icue.vn/contact?site=en' }]
            }
          ],
          fallback: {
            answer: lang === 'vi'
              ? 'Mình chưa chắc mình hiểu đúng câu hỏi. Bạn có thể nói rõ hơn bạn đang hỏi về mục nào không (Dịch vụ / Dự án / Tuyển dụng / Liên hệ)?'
              : 'I’m not fully sure I understood. Could you clarify what you’re asking about (Services / Projects / Recruitment / Contact)?'
          }
        };
      }

      function prepareKb(kb, lang) {
        const safe = {
          version: kb.version || 1,
          language: kb.language || lang,
          intents: Array.isArray(kb.intents) ? kb.intents : [],
          fallback: kb.fallback || { answer: lang === 'vi' ? 'Bạn có thể nói rõ hơn giúp mình không?' : 'Could you clarify your question?' }
        };

        safe.intents = safe.intents
          .filter((it) => it && typeof it.answer === 'string')
          .map((it) => {
            const keywords = Array.isArray(it.keywords) ? it.keywords.filter(Boolean) : [];
            const phrases = Array.isArray(it.phrases) ? it.phrases.filter(Boolean) : [];
            const links = Array.isArray(it.links) ? it.links.filter(l => l && l.label && l.url) : [];
            const candidates = [...keywords, ...phrases]
              .map((s) => normalizeForSearch(String(s)))
              .filter(Boolean);
            const candidateTokens = candidates.map(tokenize);
            return {
              id: it.id || 'intent',
              answer: String(it.answer),
              links,
              _candidates: candidates,
              _candidateTokens: candidateTokens
            };
          });
        return safe;
      }

      async function getResponse(userMessage) {
        const raw = String(userMessage || '').trim();
        if (!raw) {
          const kb = await ensureKb(siteLang);
          return { content: kb.fallback?.answer || '', links: [] };
        }

        const unsupported = detectUnsupportedLanguage(raw);
        if (unsupported) {
          return {
            content: siteLang === 'vi'
              ? 'Hiện tại chatbot chỉ hỗ trợ Tiếng Việt và English. Vui lòng đặt câu hỏi bằng Tiếng Việt hoặc English (bạn có thể đổi ngôn ngữ bằng biểu tượng lá cờ trên thanh menu).'
              : 'This chatbot currently supports Vietnamese and English only. Please ask your question in Vietnamese or English (you can switch site language via the flag icon in the menu).',
            links: []
          };
        }

        const queryNorm = normalizeForSearch(raw);
        const queryTokens = tokenize(queryNorm);

        // Route language per-message. If detection is uncertain, score both KBs and pick the best match.
        const detectedLang = await routeLanguage(raw, queryNorm, queryTokens);
        const kb = await ensureKb(detectedLang);

        // 1) Match intents in KB
        const bestIntent = findBestIntent(kb, queryNorm, queryTokens);

        // 2) Match against FAQ data (if available)
        const bestFaq = findBestFaq(queryNorm, queryTokens, detectedLang);

        // Decide
        const intentScore = bestIntent?.score ?? 0;
        const faqScore = bestFaq?.score ?? 0;

        if (faqScore >= 0.52 && faqScore >= intentScore) {
          const links = [{ label: detectedLang === 'vi' ? 'Xem FAQ' : 'View FAQs', url: '#/faqs' }];
          return { content: bestFaq.answer, links };
        }

        if (intentScore >= 0.45) {
          return { content: bestIntent.intent.answer, links: bestIntent.intent.links || [] };
        }

        return {
          content: kb.fallback?.answer || (detectedLang === 'vi'
            ? 'Mình chưa chắc mình hiểu đúng câu hỏi. Bạn có thể nói rõ hơn giúp mình không?'
            : 'I’m not fully sure I understood. Could you clarify your question?'),
          links: [
            { label: detectedLang === 'vi' ? 'FAQ' : 'FAQs', url: '#/faqs' },
            { label: detectedLang === 'vi' ? 'Liên hệ' : 'Contact', url: detectedLang === 'vi' ? 'https://icue.vn/contact' : 'https://icue.vn/contact?site=en' }
          ]
        };
      }

      async function routeLanguage(raw, queryNorm, queryTokens) {
        const direct = detectUserLanguage(raw);
        if (direct === 'en' || direct === 'vi') return direct;

        // If we can't confidently detect, compare intent match strength across both KBs.
        const [kbEn, kbVi] = await Promise.all([ensureKb('en'), ensureKb('vi')]);
        const bestEn = findBestIntent(kbEn, queryNorm, queryTokens);
        const bestVi = findBestIntent(kbVi, queryNorm, queryTokens);
        const enScore = bestEn?.score ?? 0;
        const viScore = bestVi?.score ?? 0;

        // Only switch away from siteLang if there's a clear winner.
        const minToSwitch = 0.45;
        const margin = 0.05;
        if (Math.max(enScore, viScore) >= minToSwitch && Math.abs(enScore - viScore) >= margin) {
          return enScore > viScore ? 'en' : 'vi';
        }
        return siteLang;
      }

      function detectUserLanguage(text) {
        const raw = String(text || '');
        const hasVietnameseDiacritics = /[àáảãạăắằẳẵặâấầẩẫậđèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]/i.test(raw);
        if (hasVietnameseDiacritics) return 'vi';

        // Also detect Vietnamese typed WITHOUT diacritics (e.g., "xin chao", "dich vu").
        const norm = normalizeForSearch(raw);
        const tokens = norm.split(' ').filter(Boolean);

        const viHints = new Set([
          'xin','chao','camon','cam','on','dich','vu','lien','he','tuyen','dung','ung','tuyen','du','an','quyen','gop',
          'bao','gia','chi','phi','gia','thoi','gian','quy','trinh','hop','tac','doi','tac','bao','chi','truyen','thong'
        ]);
        const enHints = new Set([
          'what','how','where','when','services','service','projects','project','contact','recruitment',
          'privacy','terms','cookies','gdpr','price','pricing','quote','proposal','meeting','schedule','internship','partner','press'
        ]);

        let viScore = 0;
        let enScore = 0;
        for (const t of tokens) {
          if (viHints.has(t)) viScore++;
          if (enHints.has(t)) enScore++;
        }

        if (viScore >= 2 && viScore > enScore) return 'vi';
        if (enScore >= 1 && enScore > viScore) return 'en';
        return null;
      }

      function detectUnsupportedLanguage(text) {
        const raw = String(text || '');

        // Script-based detection (high confidence).
        if (/[\u3040-\u30ff]/.test(raw)) return 'ja';
        if (/[\u4e00-\u9fff]/.test(raw)) return 'zh';
        if (/[\uac00-\ud7af]/.test(raw)) return 'ko';
        if (/[\u0e00-\u0e7f]/.test(raw)) return 'th';
        if (/[\u0400-\u04ff]/.test(raw)) return 'ru';
        if (/[\u0600-\u06ff]/.test(raw)) return 'ar';
        if (/[\u0590-\u05ff]/.test(raw)) return 'he';

        const norm = normalizeForSearch(raw);
        const tokens = norm.split(' ').filter(Boolean);
        if (!tokens.length) return null;

        const esHints = new Set(['hola','gracias','por','favor','buenos','dias','buenas','noches','donde','precio','contacto','ayuda','necesito','quiero']);
        const frHints = new Set(['bonjour','merci','svp','silvousplait','ou','prix','contact','aide','besoin','je','veux']);
        const deHints = new Set(['hallo','danke','bitte','preis','kontakt','hilfe','ich','brauche','mochte']);

        let es = 0;
        let fr = 0;
        let de = 0;
        for (const t of tokens) {
          if (esHints.has(t)) es++;
          if (frHints.has(t)) fr++;
          if (deHints.has(t)) de++;
        }
        const max = Math.max(es, fr, de);
        if (max >= 2) {
          if (es === max) return 'es';
          if (fr === max) return 'fr';
          if (de === max) return 'de';
        }
        return null;
      }

      function normalizeForSearch(text) {
        let s = String(text || '').toLowerCase();
        try {
          s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        } catch (e) {
          // ignore
        }
        s = s.replace(/[đ]/g, 'd');
        // After diacritics removal, keep it ASCII-only for compatibility.
        s = s.replace(/[^a-z0-9\s]/g, ' ');
        s = s.replace(/\s+/g, ' ').trim();
        return s;
      }

      function tokenize(normText) {
        const stop = new Set([
          'la','va','hoac','cua','cho','ve','o','toi','ban','minh','chung','toi','xin','vui','long','nhe','a','oi',
          'the','a','an','to','for','and','or','of','in','on','at','is','are','am','i','you','we','our','about','please'
        ]);
        return String(normText || '')
          .split(' ')
          .map(t => t.trim())
          .filter(t => t.length >= 2 && !stop.has(t));
      }

      function scoreTokens(queryTokens, candTokens, queryNorm, candNorm) {
        if (!candNorm) return 0;
        if (queryNorm === candNorm) return 1;
        if (queryNorm.includes(candNorm) || candNorm.includes(queryNorm)) return 0.92;

        const qSet = new Set(queryTokens);
        const cSet = new Set(candTokens);
        if (qSet.size === 0 || cSet.size === 0) return 0;

        let intersect = 0;
        for (const t of cSet) if (qSet.has(t)) intersect++;
        const union = qSet.size + cSet.size - intersect;
        const jaccard = union ? (intersect / union) : 0;
        const coverage = cSet.size ? (intersect / cSet.size) : 0;

        return (0.65 * jaccard) + (0.35 * coverage);
      }

      function findBestIntent(kb, queryNorm, queryTokens) {
        let best = null;
        for (const intent of kb.intents || []) {
          let bestScore = 0;
          const candidates = intent._candidates || [];
          const candidateTokens = intent._candidateTokens || [];
          for (let i = 0; i < candidates.length; i++) {
            const candNorm = candidates[i];
            const candTokens = candidateTokens[i] || [];
            const s = scoreTokens(queryTokens, candTokens, queryNorm, candNorm);
            if (s > bestScore) bestScore = s;
          }
          if (!best || bestScore > best.score) {
            best = { intent, score: bestScore };
          }
        }
        return best;
      }

      function findBestFaq(queryNorm, queryTokens, desiredLang) {
        const faqData = window.__icueFaqData;
        if (!faqData || typeof faqData !== 'object') return null;

        // Avoid answering in the wrong language via FAQ corpus.
        const faqLang = window.__icueFaqLang;
        if ((desiredLang === 'en' || desiredLang === 'vi') && (faqLang === 'en' || faqLang === 'vi') && faqLang !== desiredLang) {
          return null;
        }

        let best = null;
        for (const cat of Object.keys(faqData)) {
          const items = Array.isArray(faqData[cat]) ? faqData[cat] : [];
          for (const item of items) {
            const q = item?.q;
            const a = item?.a;
            if (!q || !a) continue;
            const qNorm = normalizeForSearch(q);
            const s = scoreTokens(queryTokens, tokenize(qNorm), queryNorm, qNorm);
            if (!best || s > best.score) {
              best = { question: q, answer: String(a), score: s };
            }
          }
        }
        return best;
      }
    }

    // Function to set up chatbot events
    function setupChatbotEvents(chatbotKnowledge) {
        const chatbotToggle = document.getElementById('chatbot-toggle');
        const chatbotWindow = document.getElementById('chatbot-window');
        const chatbotClose = document.getElementById('chatbot-close');
        const chatbotInput = document.getElementById('chatbot-input');
        const chatbotSend = document.getElementById('chatbot-send');
        const chatbotMessages = document.getElementById('chatbot-messages');
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');
        
        if (!chatbotToggle || !chatbotWindow) return;
        
        // Local storage chat history
        const CHAT_HISTORY_KEY = 'icueChatbotHistory:en';
        
        function saveChatHistory(history) {
            try {
                localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(history));
            } catch (e) {
                console.warn('Could not save chat history to localStorage:', e);
            }
        }
        
        function loadChatHistory() {
            try {
                const raw = localStorage.getItem(CHAT_HISTORY_KEY);
                return raw ? JSON.parse(raw) : [];
            } catch (e) {
                console.warn('Could not load chat history from localStorage:', e);
                return [];
            }
        }
        
        let chatHistory = loadChatHistory();
        
        function addMessageToHistory(messageObj) {
            chatHistory.push({
                ...messageObj,
                timestamp: new Date().toISOString()
            });
            // Keep only last 50 messages to prevent localStorage bloat
            if (chatHistory.length > 50) {
                chatHistory = chatHistory.slice(-50);
            }
            saveChatHistory(chatHistory);
        }
        
        function createMessageElement(msg) {
          const messageDiv = document.createElement('div');
          const role = msg?.role === 'user' ? 'user' : 'bot';
          const content = String(msg?.content ?? '');
          const links = Array.isArray(msg?.links) ? msg.links : [];
          messageDiv.className = `message ${role === 'user' ? 'user-message' : 'bot-message'}`;

          if (role === 'user') {
            messageDiv.innerHTML = `
              <div class="message-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <div class="message-content"></div>
            `;
          } else {
            messageDiv.innerHTML = `
              <div class="message-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12c0 1.54.36 3.04 1.05 4.4L1 22l5.6-2.05C8.96 21.64 10.46 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z"/>
                </svg>
              </div>
              <div class="message-content"></div>
            `;
          }

          const contentEl = messageDiv.querySelector('.message-content');
          if (contentEl) contentEl.textContent = content;

          if (role === 'bot' && links.length && contentEl) {
            const linksWrap = document.createElement('div');
            linksWrap.className = 'chatbot-links';
            links.forEach((l) => {
              if (!l || !l.label || !l.url) return;
              const a = document.createElement('a');
              a.href = String(l.url);
              a.textContent = String(l.label);
              a.style.display = 'inline-block';
              a.style.marginRight = '10px';
              a.style.marginTop = '6px';
              a.style.textDecoration = 'underline';
              a.addEventListener('click', (e) => {
                if (String(l.url).startsWith('#/')) {
                  e.preventDefault();
                  window.location.hash = l.url;
                }
              });
              linksWrap.appendChild(a);
            });
            contentEl.appendChild(document.createElement('br'));
            contentEl.appendChild(linksWrap);
          }

          return messageDiv;
        }

        function renderChatHistory() {
            // Clear existing messages except the initial bot message
            const initialMessage = chatbotMessages.querySelector('.bot-message');
            chatbotMessages.innerHTML = '';
            
            // Re-add initial message if no history exists
            if (chatHistory.length === 0 && initialMessage) {
                chatbotMessages.appendChild(initialMessage);
                return;
            }
            
            // Render history
            chatHistory.forEach(msg => {
              chatbotMessages.appendChild(createMessageElement(msg));
            });
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        }
        
        // Auto-close chatbot functionality
        function closeChatbot() {
            chatbotWindow.classList.remove('open');
            isOpen = false;
        }
        
        // Auto-close on page load and navigation
        window.addEventListener('DOMContentLoaded', closeChatbot);
        window.addEventListener('hashchange', closeChatbot);
        
        // Auto-close when drawer menu opens/closes
        const originalToggleDrawerMenu = window.toggleDrawerMenu;
        if (originalToggleDrawerMenu) {
            window.toggleDrawerMenu = function() {
                closeChatbot(); // Close chatbot when drawer menu is toggled
                return originalToggleDrawerMenu.apply(this, arguments);
            };
        }
        
        const originalCloseDrawerMenu = window.closeDrawerMenu;
        if (originalCloseDrawerMenu) {
            window.closeDrawerMenu = function() {
                closeChatbot(); // Close chatbot when drawer menu is closed
                return originalCloseDrawerMenu.apply(this, arguments);
            };
        }
        
        let isOpen = false;
        
        // Toggle chatbot window
        chatbotToggle.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                chatbotWindow.classList.add('open');
                // Render chat history when opening
                renderChatHistory();
            } else {
                chatbotWindow.classList.remove('open');
            }
        });
        
        // Close chatbot
        chatbotClose?.addEventListener('click', () => {
            isOpen = false;
            chatbotWindow.classList.remove('open');
        });
        
        // Send message function
        const sendMessage = async (message) => {
            if (!message.trim()) return;
            
            // Add to chat history
            addMessageToHistory({
                role: 'user',
                content: message.trim()
            });
            
            // Add user message to UI
            chatbotMessages.appendChild(createMessageElement({ role: 'user', content: message.trim() }));
            
            // Clear input
            chatbotInput.value = '';
            
            // Scroll to bottom
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            
            // Simulate bot response delay
            setTimeout(async () => {
              const resp = await chatbotKnowledge.getResponse(message);
              addMessageToHistory({
                role: 'bot',
                content: resp.content,
                links: resp.links || []
              });
              chatbotMessages.appendChild(createMessageElement({
                role: 'bot',
                content: resp.content,
                links: resp.links || []
              }));
              chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
            }, 700);
        };
        
        // Send button click
        chatbotSend?.addEventListener('click', async () => {
          await sendMessage(chatbotInput.value);
        });
        
        // Enter key to send
        chatbotInput?.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
            await sendMessage(chatbotInput.value);
            }
        });
        
        // Suggestion buttons
        suggestionBtns.forEach(btn => {
          btn.addEventListener('click', async () => {
            await sendMessage(btn.textContent || '');
          });
        });
        
        // Company deck link to open chatbot
        const openChatbotLink = document.getElementById('open-chatbot-link');
        if (openChatbotLink) {
            openChatbotLink.addEventListener('click', (e) => {
                e.preventDefault();
                isOpen = true;
                chatbotWindow.classList.add('open');
            });
        }
    }
    
    // Bot response generator now lives in createChatbotKnowledge().
};

document.addEventListener("DOMContentLoaded", function() {
  // Call the global setupLanguageSwitcher function
  if (typeof setupLanguageSwitcher === 'function') {
    setupLanguageSwitcher();
  }
  
  // Update language switcher when hash changes (page navigation)
  window.addEventListener('hashchange', function() {
    console.log('[Language Switcher] Hash changed, updating language switcher...');
    if (typeof setupLanguageSwitcher === 'function') {
      setupLanguageSwitcher();
    }
  });
  
  // Also update when popstate occurs (back/forward navigation)
  window.addEventListener('popstate', function() {
    console.log('[Language Switcher] Popstate event, updating language switcher...');
    setTimeout(() => setupLanguageSwitcher(), 100); // Small delay to ensure page content is updated
  });
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
    img: "public/profilePhotos/nguyenquynhly.png"
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

    if (textBox && isTruelyTouchDevice()) {
      const prevBtn = document.getElementById('core-prev-btn');
      const nextBtn = document.getElementById('core-next-btn');
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      
      const swipeTarget = container || textBox; 
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

  const sliderState = window.__logoSliderState || {
    rafId: null,
    isRunning: false,
    lastTs: 0,
    position: 0,
    speed: 1,
    isPaused: false,
    logoList: null,
    container: null,
    visibilityHandler: null
  };
  window.__logoSliderState = sliderState;

  sliderState.logoList = logoList;
  sliderState.container = logoList.parentElement;

  const stopLoop = () => {
    sliderState.isRunning = false;
    if (sliderState.rafId) {
      cancelAnimationFrame(sliderState.rafId);
      sliderState.rafId = null;
    }
    sliderState.lastTs = 0;
  };

  stopLoop();

  const loop = (ts) => {
    if (!sliderState.isRunning) return;

    const list = sliderState.logoList;
    const container = sliderState.container;
    if (!list || !container || !document.body.contains(list) || !document.body.contains(container)) {
      stopLoop();
      return;
    }

    if (!document.hidden && !sliderState.isPaused) {
      const delta = sliderState.lastTs ? (ts - sliderState.lastTs) : 16.67;
      const step = delta / 16.67;
      sliderState.position -= sliderState.speed * step;
      const listWidth = list.scrollWidth;
      const containerWidth = container.offsetWidth;
      if (-sliderState.position >= listWidth) {
        sliderState.position = containerWidth;
      }
      list.style.transform = `translateX(${sliderState.position}px)`;
    }

    sliderState.lastTs = ts;
    sliderState.rafId = requestAnimationFrame(loop);
  };

  sliderState.isRunning = true;
  sliderState.rafId = requestAnimationFrame(loop);

  if (!sliderState.visibilityHandler) {
    sliderState.visibilityHandler = () => {
      if (!document.hidden && sliderState.isRunning && !sliderState.rafId) {
        sliderState.rafId = requestAnimationFrame(loop);
      }
    };
    document.addEventListener('visibilitychange', sliderState.visibilityHandler);
  }

  if (sliderState.container && !sliderState.container.hasAttribute('data-logo-slider-hover-bound')) {
    sliderState.container.setAttribute('data-logo-slider-hover-bound', '1');
    sliderState.container.addEventListener('mouseenter', () => sliderState.isPaused = true);
    sliderState.container.addEventListener('mouseleave', () => sliderState.isPaused = false);
  }

  const arrowLeft = document.getElementById('arrowLeft');
  const arrowRight = document.getElementById('arrowRight');

  if (arrowLeft && !arrowLeft.hasAttribute('data-logo-slider-click-bound')) {
    arrowLeft.setAttribute('data-logo-slider-click-bound', '1');
    arrowLeft.addEventListener('click', () => { sliderState.speed = 1; sliderState.isPaused = false; });
  }
  if (arrowRight && !arrowRight.hasAttribute('data-logo-slider-click-bound')) {
    arrowRight.setAttribute('data-logo-slider-click-bound', '1');
    arrowRight.addEventListener('click', () => { sliderState.speed = -1; sliderState.isPaused = false; });
  }
};

// ===================
// News Slider (Mobile Only)
// ===================
// `initMobileNewsSlider` now lives in `src/modules/cardSlider.js`
// (shared with the Past Projects page). It is assigned to `window` there and
// remains callable here via the same global name.

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
  const timeRunning = 7000;
  const timeAutoNext = 8000;

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

// The shared React contact sidebar owns its calendar clock. Keep this helper
// available for truly legacy documents, but do not leave a global timer running
// after this compatibility runtime is loaded into the SPA shell.

function initAudioVisualizer(
    audioSrc = 'public/music/mixkit-a-very-happy-christmas-897.mp3',
    barSelector = '.music-bars',
    clickTargetSelector = '#visualizer'
  ) {
    const clickTarget = document.querySelector(clickTargetSelector);

    const bindClickOnce = (audio, ctx) => {
      if (!clickTarget) return;
      // Element may be recreated on SPA navigation; bind at most once per element.
      if (clickTarget.hasAttribute('data-av-click-bound')) return;
      clickTarget.setAttribute('data-av-click-bound', '1');
      clickTarget.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (ctx.state === 'suspended') ctx.resume();
        audio.paused ? audio.play() : audio.pause();
      });
    };
  
    if (window.__audioVisualizer) {
      const { audio, ctx } = window.__audioVisualizer;

      bindClickOnce(audio, ctx);
      if (typeof startAudioVisualizerLoop === 'function') startAudioVisualizerLoop(barSelector);
      return;
    }
  
    const audio = new Audio(audioSrc);
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    source.connect(analyser);
    analyser.connect(ctx.destination);
  
    const freqData = new Uint8Array(analyser.frequencyBinCount);
  
    window.__audioVisualizer = {
      audio,
      ctx,
      analyser,
      freqData
    };

    bindClickOnce(audio, ctx);
    if (typeof startAudioVisualizerLoop === 'function') startAudioVisualizerLoop(barSelector);
  }
  
  function startAudioVisualizerLoop(barSelector = '.music-bars') {
    const vizState = window.__audioVisualizerLoopState || {
      rafId: null,
      isRunning: false,
      lastTs: 0,
      cachedBars: null
    };
    window.__audioVisualizerLoopState = vizState;

    if (vizState.isRunning) return;

    const stopLoop = () => {
      vizState.isRunning = false;
      if (vizState.rafId) {
        cancelAnimationFrame(vizState.rafId);
        vizState.rafId = null;
      }
      vizState.cachedBars = null;
      vizState.lastTs = 0;
    };

    const loop = (ts) => {
      if (!vizState.isRunning) return;

      const av = window.__audioVisualizer;
      if (!av?.analyser) {
        stopLoop();
        return;
      }

      if (!vizState.cachedBars || vizState.cachedBars.length === 0 || !vizState.cachedBars[0].isConnected) {
        vizState.cachedBars = document.querySelectorAll(barSelector);
      }
      const bars = vizState.cachedBars || [];
      if (!bars.length) {
        stopLoop();
        return;
      }

      if (!document.hidden && ts - vizState.lastTs >= 33) {
        vizState.lastTs = ts;
        const { analyser, freqData } = av;
        analyser.getByteFrequencyData(freqData);
        bars.forEach((bar, i) => {
          const value = freqData[i];
          const scale = Math.max(0.5, value / 180);
          bar.style.transform = `scaleY(${scale})`;
        });
      }

      vizState.rafId = requestAnimationFrame(loop);
    };

    vizState.isRunning = true;
    vizState.lastTs = 0;
    vizState.rafId = requestAnimationFrame(loop);
  }

  function updateMusicBarColor(page) {
    const paths = document.querySelectorAll('.music-bars svg path');
  
    let color = '#000000'; // default
  
    switch (page) {
      case 'ourWork':
        color = '#000000';
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
      case 'aboutUs': 
        color = '#9df8bd';
        break;
    }
  
    paths.forEach(path => {
      path.setAttribute('stroke', color);
      path.setAttribute('fill', color); 
    });
  }

  // Function to change hamburger menu icon color based on page background
  function updateHamburgerIcon(page) {
    const darkBackgroundPages = ['communityActivities'];
    const useLightNav = darkBackgroundPages.includes(page);
    if (typeof window.setNavLinkContrast === 'function') {
      window.setNavLinkContrast(useLightNav);
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
    "public/profilePhotos/hanhnguyen__nobg.png",
    "public/profilePhotos/tranthilananh__nobg.png",
    "public/profilePhotos/tranquoctoan__nobg.png",
    "public/profilePhotos/longdo__nobg.png"
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

function setupLanguageSwitcher() {
  if (typeof window.__mainSiteNavRefreshLanguage === 'function') {
    window.__mainSiteNavRefreshLanguage();
    return;
  }

  // React nav island owns the switcher once #main-site-nav-root is present
  if (document.getElementById('main-site-nav-root')) {
    return;
  }

  const pageSwitch = document.getElementById("page-switch");
  const langIcon = document.getElementById("langSwitcher");

  if (!pageSwitch || !langIcon) {
    console.warn('[Language Switcher] No language switcher elements found:', {pageSwitch, langIcon});
    return;
  }

  let currentHost = window.location.host;
  const currentPath = window.location.pathname;
  const currentHash = window.location.hash;
  const currentSearch = window.location.search;
  const currentProtocol = window.location.protocol;

  const siteConfig = {
    vietnamese: {
      domain: "icue.vn",
      flagClass: "flag-icon-vn",
      language: "vi"
    },
    english: {
      domain: "en.icue.vn", 
      flagClass: "flag-icon-gb",
      language: "en"
    }
  };

  // Handle localhost/development environment
  if (currentHost.includes("localhost") || currentHost.includes("127.0.0.1")) {
    // For local development, determine language from current site structure
    const isEnglishSite = currentHost.includes("en") || 
                         document.documentElement.lang === "en" ||
                         document.querySelector('meta[name="language"]')?.content === "en";
    
    currentHost = isEnglishSite ? siteConfig.english.domain : siteConfig.vietnamese.domain;
  }

  // Determine current site and target site
  let currentSite, targetSite;
  
  if (currentHost.startsWith("en.") || currentHost === siteConfig.english.domain) {
    // Currently on English site, switch to Vietnamese
    currentSite = siteConfig.english;
    targetSite = siteConfig.vietnamese;
  } else {
    // Currently on Vietnamese site, switch to English  
    currentSite = siteConfig.vietnamese;
    targetSite = siteConfig.english;
  }

  // Get current page from hash or determine from context
  function getCurrentPage() {
    console.log('[Language Switcher] Detecting current page...');
    console.log('[Language Switcher] Current hash:', window.location.hash);
    console.log('[Language Switcher] Current path:', window.location.pathname);
    console.log('[Language Switcher] Current URL:', window.location.href);

    if (typeof window.currentPage === 'string' && window.currentPage) {
      console.log('[Language Switcher] Found global currentPage:', window.currentPage);
      return window.currentPage;
    }

    const liveHash = window.location.hash;
    if (liveHash && liveHash.startsWith('#/')) {
      const hashPage = liveHash.substring(2);
      console.log('[Language Switcher] Detected hash page:', hashPage);
      return hashPage;
    }
    
    // Try to detect from active navigation elements (data-page attribute)
    const activeNavLink = document.querySelector('nav a.active, .menu a.active, .drawer-menu a.active, [data-page].active');
    if (activeNavLink) {
      const dataPage = activeNavLink.getAttribute('data-page');
      if (dataPage) {
        console.log('[Language Switcher] Found active nav with data-page:', dataPage);
        return dataPage;
      }
    }
    
    // Default fallback
    console.log('[Language Switcher] Defaulting to Home page');
    return 'Home';
  }

  const pageMapping = {
    'Home': 'Home',
    'aboutUs': 'aboutUs', 
    'orgStructure': 'orgStructure',
    'ourWork': 'ourWork',
    'pastProjects': 'pastProjects',
    'News': 'News',
    'ourPeople': 'ourPeople',
    'meetOurExperts': 'meetOurExperts',
    'coreTeam': 'coreTeam',
    'Contact': 'Contact',
    'gdpr': 'gdpr',
    'privacy': 'privacy',
    'recruitment': 'recruitment',
    'terms': 'terms',
    'faqs': 'faqs',
    'notableAwards': 'notableAwards',
    'communityActivities': 'communityActivities',
    'cookies': 'cookies'
  };

  const currentPageName = getCurrentPage();
  const targetPageName = pageMapping[currentPageName] || 'Home';
  
  console.log('[Language Switcher] Current page detected:', currentPageName);
  console.log('[Language Switcher] Target page mapped:', targetPageName);
  
  const staticPages = ['gdpr', 'privacy', 'recruitment', 'terms', 'faqs', 'cookies', 'notableAwards', 'communityActivities'];
  
  let targetPath = '';
  console.log('🔧 [DEBUG] Building target path for:', targetPageName);
  if (targetPageName === 'Home') {
    targetPath = '';
    console.log('🔧 [DEBUG] Home page - empty path');
  } else if (staticPages.includes(targetPageName)) {
    // Use hash-based routing for static pages too
    targetPath = `#/${targetPageName}`;
    console.log('🔧 [DEBUG] Static page - hash path:', targetPath);
  } else if (targetPageName === 'meetOurExperts') {
    window.location.href = 'https://icue.vn/people/experts?site=en';
    return;
  } else if (targetPageName === 'coreTeam') {
    window.location.href = 'https://icue.vn/people/core-team?site=en';
    return;
  } else {
    // Hash-based routing for main navigation pages
    targetPath = `#/${targetPageName}`;
    console.log('🔧 [DEBUG] Regular page - hash path:', targetPath);
  }

  const targetUrl = `${currentProtocol}//${targetSite.domain}/${targetPath}${currentSearch}`;
  
  console.log('[Language Switcher] Target URL (hash-based):', targetUrl);
  
  if (langIcon) {
    langIcon.className = `flag-icon ${targetSite.flagClass}`;
  }
  pageSwitch.href = targetUrl;
  
  pageSwitch.setAttribute('aria-label', `Switch to ${targetSite.language === 'en' ? 'English' : 'Vietnamese'} version`);
  pageSwitch.setAttribute('data-current-lang', currentSite.language);
  pageSwitch.setAttribute('data-target-lang', targetSite.language);
  pageSwitch.setAttribute('data-target-domain', targetSite.domain);

  pageSwitch.addEventListener('click', function(e) {
    if (staticPages.includes(targetPageName)) {
      try {
        sessionStorage.setItem('language_switch_to_static', targetPageName);
        console.log('[Language Switcher] Set static page flag for:', targetPageName);
      } catch (error) {
        console.warn('Could not set static page flag:', error);
      }
    }

    if (typeof gtag !== 'undefined') {
      gtag('event', 'language_switch', {
        'from_language': currentSite.language,
        'to_language': targetSite.language,
        'current_page': currentPageName,
        'target_page': targetPageName,
        'target_url': targetUrl
      });
    }
    
    try {
      localStorage.setItem('preferredLanguage', targetSite.language);
      localStorage.setItem('lastVisitedPage', targetPageName);
    } catch (error) {
      console.warn('Could not save language preference:', error);
    }

    return true;
  });

  console.log(`Language switcher configured: ${currentSite.language} (${currentPageName}) → ${targetSite.language} (${targetPageName})`);
  console.log(`Target URL: ${targetUrl}`);
}

function initializePageFunctions() {
  // If `loadPage()` already initialized the current SPA route recently, skip.
  // This prevents duplicate init work (and duplicate listeners/animations) on Home load.
  try {
    const hash = window.location.hash || '#/Home';
    const pageFromHash = hash.replace('#/', '') || 'Home';
    const st = window.__pageInitState;
    if (st && st.page === pageFromHash && (Date.now() - st.time) < 1500) {
      console.log('[Init] Skipping: page already initialized by loadPage()', { page: pageFromHash });
      return;
    }
  } catch (e) {
    // ignore
  }

  let languageSwitchTarget = null;
  try {
    languageSwitchTarget = sessionStorage.getItem('language_switch_to_static');
    console.log('🔄 [DEBUG] Language switch target from sessionStorage:', languageSwitchTarget);
    if (languageSwitchTarget) {
      sessionStorage.removeItem('language_switch_to_static');
      console.log('[Init] Detected language switch to static page:', languageSwitchTarget);
    }
  } catch (e) {
    console.warn('[Init] Could not check language switch flag:', e);
  }
  
  requestAnimationFrame(() => {
    retriggerMenuAnimations();
    updateCalendarSvgTime();
    initAudioVisualizer();
    calendarModal();
    updateHamburgerIcon();
    if (window.ICUEFooter && typeof window.ICUEFooter.autoInject === 'function') {
      window.ICUEFooter.autoInject();
    }
    CommunityGallery.init();
    initializeChatbot();
    
    if (typeof initFrequentlyAskedQuestions === 'function') {
      initFrequentlyAskedQuestions();
      console.log('[Init] FAQ functions initialized globally');
    }
    
    if (typeof JobBoard !== 'undefined' && JobBoard.init) {
      JobBoard.init();
      console.log('[Init] JobBoard initialized globally');
    }
    
    if (typeof AwardsPage !== 'undefined' && AwardsPage.init) {
      AwardsPage.init();
      console.log('[Init] AwardsPage initialized globally');
    }
    
    if (typeof CommunityPage !== 'undefined' && CommunityPage.init) {
      CommunityPage.init();
      console.log('[Init] CommunityPage initialized globally');
    }

    if (typeof setupLanguageSwitcher === 'function') {
      setupLanguageSwitcher();
      console.log('[Init] Language switcher initialized');
    }
    
    const currentPath = window.location.pathname;
    const currentHash = window.location.hash;
    
    console.log('🔍 [DEBUG] Analyzing current page...');
    console.log('🔍 [DEBUG] currentPath:', currentPath);
    console.log('🔍 [DEBUG] currentHash:', currentHash);
    
    // static page OR hash-routed page
    const staticPages = ['gdpr', 'privacy', 'recruitment', 'terms', 'faqs', 'cookies', 'notableAwards', 'communityActivities'];
    const isStaticPage = staticPages.some(page => currentPath.includes(`${page}.html`)) || languageSwitchTarget;
    const isHashRoutedPage = currentHash && staticPages.some(page => currentHash.includes(page));
    
    console.log('📄 [DEBUG] Static pages list:', staticPages);
    console.log('📄 [DEBUG] isStaticPage:', isStaticPage);
    console.log('📄 [DEBUG] isHashRoutedPage:', isHashRoutedPage);
    console.log('📄 [DEBUG] languageSwitchTarget:', languageSwitchTarget);
    
    if (isStaticPage || languageSwitchTarget || isHashRoutedPage) {
      console.log('✅ [DEBUG] Static/Hash page detected, proceeding with initialization...');
      console.log('[Init] Detected static or hash-routed page, initializing specific functions...');
      
      let pageName = languageSwitchTarget;
      if (!pageName && isStaticPage) {
        pageName = staticPages.find(page => currentPath.includes(`${page}.html`));
      }
      if (!pageName && isHashRoutedPage) {
        pageName = staticPages.find(page => currentHash.includes(page));
      }
      console.log('Determined pageName:', pageName);
    
      if (pageName === 'recruitment' || currentPath.includes('recruitment.html') || currentHash.includes('recruitment')) {
        console.log('💼 [DEBUG] Initializing recruitment page functions...');
        if (typeof JobBoard !== 'undefined' && JobBoard.init) {
          JobBoard.init();
          console.log('[Init] JobBoard initialized');
        } else {
          console.warn('⚠️ [DEBUG] JobBoard not available or no init method');
        }
      } else if (pageName === 'faqs' || currentPath.includes('faqs.html')) {
        console.log('❓ [DEBUG] Initializing FAQ page functions...');
        if (typeof initFrequentlyAskedQuestions === 'function') {
          initFrequentlyAskedQuestions();
          console.log('[Init] FAQ functions initialized');
        } else {
          console.warn('⚠️ [DEBUG] initFrequentlyAskedQuestions not available');
        }
      } else if (pageName === 'notableAwards' || currentPath.includes('notableAwards.html')) {
        console.log('🏆 [DEBUG] Initializing awards page functions...');
        if (typeof AwardsPage !== 'undefined' && AwardsPage.init) {
          AwardsPage.init();
          console.log('[Init] AwardsPage initialized');
        } else {
          console.warn('⚠️ [DEBUG] AwardsPage not available or no init method');
        }
      } else if (pageName === 'communityActivities' || currentPath.includes('communityActivities.html')) {
        console.log('👥 [DEBUG] Initializing community page functions...');
        if (typeof CommunityPage !== 'undefined' && CommunityPage.init) {
          CommunityPage.init();
          console.log('[Init] CommunityPage initialized');
        } else {
          console.warn('⚠️ [DEBUG] CommunityPage not available or no init method');
        }
      }
      
      setTimeout(() => {
        console.log('[Init] Static page initialization complete for:', pageName);
      }, 100);
    }
    console.log('[Init] Page functions initialization complete');
  });
}
