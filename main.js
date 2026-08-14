/* Core JavaScript Logic for 3D Minimal Portfolio */

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global Variables
let mouseX = 0, mouseY = 0;
let targetMouseX = 0, targetMouseY = 0;
let cursorX = 0, cursorY = 0;
const cursorDot = document.querySelector('.custom-cursor-dot');
const cursorCircle = document.querySelector('.custom-cursor-circle');

// 1. Custom Interactive Cursor (Snapping & Liquid Stretch)
let snapTarget = null;
let cursorWidth = 40;
let cursorHeight = 40;
let lastX = 0, lastY = 0;

function initCustomCursor() {
  if (isMobileViewport()) return; // Disable custom cursor on mobile

  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  function updateCursor() {
    mouseX = lerp(mouseX, targetMouseX, 0.25);
    mouseY = lerp(mouseY, targetMouseY, 0.25);
    
    if (cursorDot) {
      cursorDot.style.left = `${mouseX}px`;
      cursorDot.style.top = `${mouseY}px`;
    }

    if (cursorCircle) {
      if (snapTarget) {
        // SNAPPED DOCKING STATE
        const rect = snapTarget.getBoundingClientRect();
        const targetX = rect.left + rect.width / 2;
        const targetY = rect.top + rect.height / 2;
        
        cursorX = lerp(cursorX, targetX, 0.22);
        cursorY = lerp(cursorY, targetY, 0.22);
        
        cursorWidth = lerp(cursorWidth, rect.width + 12, 0.22);
        cursorHeight = lerp(cursorHeight, rect.height + 12, 0.22);
        
        cursorCircle.style.left = `${cursorX}px`;
        cursorCircle.style.top = `${cursorY}px`;
        cursorCircle.style.width = `${cursorWidth}px`;
        cursorCircle.style.height = `${cursorHeight}px`;
        cursorCircle.style.borderRadius = window.getComputedStyle(snapTarget).borderRadius;
        cursorCircle.style.transform = 'translate(-50%, -50%)';
      } else {
        // NORMAL FLUID LERP STATE
        cursorX = lerp(cursorX, targetMouseX, 0.15);
        cursorY = lerp(cursorY, targetMouseY, 0.15);
        
        // Calculate velocity for stretch
        const dx = cursorX - lastX;
        const dy = cursorY - lastY;
        lastX = cursorX;
        lastY = cursorY;
        
        const speed = Math.sqrt(dx * dx + dy * dy);
        const maxSpeed = 100;
        const stretchFactor = Math.min(speed / maxSpeed, 0.45);
        
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        
        let baseSize = 40;
        if (document.body.classList.contains('hover-project')) {
          baseSize = 80;
        } else if (document.body.classList.contains('hover-interactive')) {
          baseSize = 50;
        }
        
        cursorWidth = lerp(cursorWidth, baseSize, 0.2);
        cursorHeight = lerp(cursorHeight, baseSize, 0.2);
        
        cursorCircle.style.left = `${cursorX}px`;
        cursorCircle.style.top = `${cursorY}px`;
        cursorCircle.style.width = `${cursorWidth}px`;
        cursorCircle.style.height = `${cursorHeight}px`;
        cursorCircle.style.borderRadius = '50%';
        
        cursorCircle.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(${1 + stretchFactor}, ${1 - stretchFactor})`;
      }
    }

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // Hover docking listeners
  const interactives = document.querySelectorAll('a, button, input, textarea, .scroll-indicator, .timeline-item, .bottom-navbar a, .bottom-nav-btn');
  bindHoverBodyClass(interactives, 'hover-interactive', {
    onEnter: (el) => {
      if (el.classList.contains('magnetic') || el.tagName === 'A' || el.tagName === 'BUTTON' || el.classList.contains('bottom-nav-btn')) {
        snapTarget = el;
        document.body.classList.add('cursor-snapped');
      }
    },
    onLeave: () => {
      snapTarget = null;
      document.body.classList.remove('cursor-snapped');
    }
  });

  bindHoverBodyClass(document.querySelectorAll('.project-card'), 'hover-project', {
    onEnter: () => {
      if (cursorCircle) cursorCircle.textContent = 'VIEW';
    },
    onLeave: () => {
      if (cursorCircle) cursorCircle.textContent = '';
    }
  });
}

// 2. Preloader Animation
function initPreloader() {
  const preloader = document.querySelector('.preloader');
  const progressBar = document.querySelector('.loader-bar');
  const progressPercent = document.querySelector('.loader-percent');
  const brandSpans = document.querySelectorAll('.loader-brand span');
  
  if (!preloader) return;

  gsap.to(brandSpans, {
    opacity: 1,
    y: 0,
    stagger: 0.08,
    duration: 1.2,
    ease: "power4.out"
  });

  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.floor(Math.random() * 8) + 2;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      const tl = gsap.timeline({
        onComplete: () => {
          preloader.style.display = 'none';
          document.body.style.overflowY = 'auto';
          triggerPageEntrance();
        }
      });

      tl.to(brandSpans, {
        y: -100,
        opacity: 0,
        stagger: 0.04,
        duration: 0.8,
        ease: "power4.in"
      })
      .to(preloader, {
        yPercent: -100,
        duration: 1.2,
        ease: "power4.inOut"
      }, "-=0.3");
    }
    
    if (progressBar) progressBar.style.width = `${progress}%`;
    if (progressPercent) progressPercent.textContent = progress;
  }, 80);
}

// Entrance Reveals
function triggerPageEntrance() {
  // Reveal bottom navbar
  gsap.from('.bottom-navbar', {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out"
  });

  // Reveal left/right name sections and central image card
  gsap.from('.left-col, .right-col', {
    x: (index) => index === 0 ? -100 : 100,
    opacity: 0,
    duration: 1.5,
    ease: "power4.out"
  });

  gsap.from('.hero-image-card', {
    scale: 0.7,
    y: 50,
    opacity: 0,
    duration: 1.8,
    ease: "power4.out"
  });
}

// 3. Three.js 3D Hexagonal Grid Background (Exact Screenshot Honeycomb)
let scene, camera, renderer, hexGroup, pointLight;
function initThreeJS() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 12);

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  syncRendererToViewport(renderer, camera);

  hexGroup = new THREE.Group();
  scene.add(hexGroup);

  // Hexagon parameters
  const hexRadius = 0.58; 
  const colSpacing = hexRadius * Math.sqrt(3);
  const rowSpacing = hexRadius * 1.5;
  const hexHeight = 0.4; // Extrude thickness to catch light on edges
  
  // Create hexagonal geometry prism
  const hexGeometry = new THREE.CylinderGeometry(hexRadius - 0.02, hexRadius - 0.02, hexHeight, 6);
  
  // Standard material that catches bevel shading
  const hexMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5f5f7, // Warm white
    roughness: 0.5,
    metalness: 0.05
  });

  // Generate grid nodes
  const cols = window.innerWidth < 768 ? 10 : 18;
  const rows = window.innerWidth < 768 ? 8 : 12;

  for (let r = -rows; r <= rows; r++) {
    for (let c = -cols; c <= cols; c++) {
      const mesh = new THREE.Mesh(hexGeometry, hexMaterial);
      
      let x = c * colSpacing;
      let y = r * rowSpacing;
      
      // Shift odd rows
      if (r % 2 !== 0) {
        x += colSpacing / 2;
      }
      
      mesh.position.set(x, y, 0);
      mesh.rotation.x = Math.PI / 2; // Flat face pointing forward
      mesh.rotation.y = Math.PI / 6; // Orient point facing up
      
      // Save initial positions for parallax animations
      mesh.userData = {
        initX: x,
        initY: y,
        initZ: 0
      };
      
      hexGroup.add(mesh);
    }
  }

  // Light setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.72);
  scene.add(ambientLight);

  // Directional Light from top-left for fixed shading
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
  dirLight.position.set(-5, 5, 5);
  scene.add(dirLight);

  // PointLight tracking the cursor for interactive reflections
  pointLight = new THREE.PointLight(0xffffff, 1.4, 25);
  pointLight.position.set(0, 0, 3);
  scene.add(pointLight);

  // Resize handler
  window.addEventListener('resize', () => syncRendererToViewport(renderer, camera));

  // Animation variables
  let mouse3D = new THREE.Vector3(0, 0, 3);
  let scrollTargetY = 0;
  let currentScrollY = 0;

  document.addEventListener('mousemove', (e) => {
    // Map screen mouse to 3D coords
    const mx = (e.clientX / window.innerWidth) * 2 - 1;
    const my = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Smooth transition target
    mouse3D.x = mx * 8;
    mouse3D.y = my * 5;
  });

  window.addEventListener('scroll', () => {
    scrollTargetY = window.scrollY;
  });

  // Central Card Hover Parallax hook
  createPointerTilt(document.querySelector('.hero-image-card'), {
    listenOn: document,
    source: 'viewport',
    rotate: 15,
    duration: 0.6
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    currentScrollY = lerp(currentScrollY, scrollTargetY, 0.08);

    // Point Light follows mouse position smoothly
    pointLight.position.x = lerp(pointLight.position.x, mouse3D.x, 0.08);
    pointLight.position.y = lerp(pointLight.position.y, mouse3D.y, 0.08);

    // Push mesh grids backward slightly on scroll
    hexGroup.position.z = -currentScrollY * 0.002;
    hexGroup.position.y = currentScrollY * 0.001;

    // Hover distance distortion on individual cells
    hexGroup.children.forEach(mesh => {
      const dist = mesh.position.distanceTo(pointLight.position);
      
      // Wobble push target
      let targetZ = 0;
      if (dist < 3.5) {
        targetZ = (3.5 - dist) * 0.28; // Push forward
      }
      
      mesh.position.z = lerp(mesh.position.z, targetZ, 0.1);
      
      // Slight cell rotations matching mouse distance
      mesh.rotation.z = Math.PI / 6 + (mesh.position.z * 0.1);
    });

    renderer.render(scene, camera);
  }
  animate();
}

// 4. GSAP Card Stacking and Pinning (Services)
function initCardStacking() {
  const cards = document.querySelectorAll('.service-card');
  const stickyContainer = document.querySelector('.services-sticky');
  
  if (cards.length === 0 || !stickyContainer) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.services-pin-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      pin: true,
      invalidateOnRefresh: true
    }
  });

  cards.forEach((card, index) => {
    if (index === 0) return;

    gsap.set(card, {
      yPercent: 120,
      scale: 0.9 + (index * 0.02),
      rotationX: -8,
      transformPerspective: 1500
    });

    tl.to(card, {
      yPercent: 0,
      rotationX: 0,
      ease: "power2.out",
      duration: 1.5
    }, index * 1.2);

    if (index > 0) {
      const prevCards = Array.from(cards).slice(0, index);
      prevCards.forEach((prevCard, pIndex) => {
        const scaleVal = 0.92 + (pIndex * 0.02);
        const opacityVal = 0.6 + (pIndex * 0.1);
        
        tl.to(prevCard, {
          scale: scaleVal,
          opacity: opacityVal,
          yPercent: -6 * (index - pIndex),
          duration: 1.2,
          ease: "power2.out"
        }, (index - 0.5) * 1.2);
      });
    }
  });
}

// 5. Magnetic Snapping Hover Effects
function initMagneticButtons() {
  if (isMobileViewport()) return;

  document.querySelectorAll('.magnetic').forEach(btn => {
    const btnText = btn.querySelector('.magnetic-text');
    createMagneticPull(btn, [
      { el: btn, strength: 0.35 },
      { el: btnText, strength: 0.15 }
    ]);
  });
}

// 6. Project Card Parallax Image Hover
function initProjectImageHover() {
  document.querySelectorAll('.project-card').forEach(card => {
    createPointerTilt(card, {
      target: card.querySelector('.project-fallback-gfx'),
      rotate: 10,
      translate: 18,
      transformPerspective: 1000
    });
  });
}

// 7. Infinite Testimonials Auto-scroll (Marquee Effect)
function initTestimonialsMarquee() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;

  const cards = Array.from(track.children);
  cards.forEach(card => {
    const clone = card.cloneNode(true);
    track.appendChild(clone);
  });

  const originalWidth = track.scrollWidth / 2;

  const animation = gsap.to(track, {
    x: `-=${originalWidth}`,
    duration: 35,
    ease: "none",
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize(x => parseFloat(x) % originalWidth)
    }
  });

  track.addEventListener('mouseenter', () => animation.pause());
  track.addEventListener('mouseleave', () => animation.play());
}

// 8. Live Clock
function initLiveClock() {
  const clockElement = document.querySelector('.footer-clock');
  const heroClockElement = document.querySelector('.hero-clock');
  
  function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    // Skopje time calculation for hero if needed, or local user time
    // Standard User Local Time
    let localHours = hours % 12;
    localHours = localHours ? localHours : 12;
    minutes = padTwoDigits(minutes);
    
    const timeStr = `${localHours}:${minutes} ${ampm} LOCAL`;
    
    if (clockElement) clockElement.textContent = timeStr;
    if (heroClockElement) {
      // Custom format: New York - HH:MM GMT-4
      // Let's print local location and offset: "New York, NY - 12:40 GMT-4"
      // Calculate offset dynamically
      const offsetMinutes = -now.getTimezoneOffset();
      const offsetHours = offsetMinutes / 60;
      const offsetSign = offsetHours >= 0 ? '+' : '';
      heroClockElement.textContent = `New York, NY - ${localHours}:${minutes} GMT${offsetSign}${offsetHours}`;
    }
  }
  
  updateClock();
  setInterval(updateClock, 1000);
}

// 9. Smooth Scrolling for in-page anchors
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      scrollToElement(document.querySelector(targetId));
    });
  });

  const scrollIndicator = document.getElementById('scroll-to-work');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      scrollToElement(document.getElementById('about'));
    });
  }
}

// Initialize Everything
window.addEventListener('DOMContentLoaded', () => {
  document.body.style.overflowY = 'hidden'; // Lock scrolling during preloader
  
  initPreloader();
  initCustomCursor();
  initThreeJS();
  initCardStacking();
  initMagneticButtons();
  initProjectImageHover();
  initTestimonialsMarquee();
  initLiveClock();
  initSmoothScroll();
});
