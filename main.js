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
  if (window.innerWidth <= 768) return; // Disable custom cursor on mobile

  document.addEventListener('mousemove', (e) => {
    targetMouseX = e.clientX;
    targetMouseY = e.clientY;
  });

  function updateCursor() {
    mouseX += (targetMouseX - mouseX) * 0.25;
    mouseY += (targetMouseY - mouseY) * 0.25;
    
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
        
        cursorX += (targetX - cursorX) * 0.22;
        cursorY += (targetY - cursorY) * 0.22;
        
        cursorWidth += (rect.width + 12 - cursorWidth) * 0.22;
        cursorHeight += (rect.height + 12 - cursorHeight) * 0.22;
        
        cursorCircle.style.left = `${cursorX}px`;
        cursorCircle.style.top = `${cursorY}px`;
        cursorCircle.style.width = `${cursorWidth}px`;
        cursorCircle.style.height = `${cursorHeight}px`;
        cursorCircle.style.borderRadius = window.getComputedStyle(snapTarget).borderRadius;
        cursorCircle.style.transform = 'translate(-50%, -50%)';
      } else {
        // NORMAL FLUID LERP STATE
        cursorX += (targetMouseX - cursorX) * 0.15;
        cursorY += (targetMouseY - cursorY) * 0.15;
        
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
        
        cursorWidth += (baseSize - cursorWidth) * 0.2;
        cursorHeight += (baseSize - cursorHeight) * 0.2;
        
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
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-interactive');
      if (el.classList.contains('magnetic') || el.tagName === 'A' || el.tagName === 'BUTTON' || el.classList.contains('bottom-nav-btn')) {
        snapTarget = el;
        document.body.classList.add('cursor-snapped');
      }
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-interactive');
      snapTarget = null;
      document.body.classList.remove('cursor-snapped');
    });
  });

  const projects = document.querySelectorAll('.project-card');
  projects.forEach(card => {
    card.addEventListener('mouseenter', () => {
      document.body.classList.add('hover-project');
      if (cursorCircle) cursorCircle.textContent = 'VIEW';
    });
    card.addEventListener('mouseleave', () => {
      document.body.classList.remove('hover-project');
      if (cursorCircle) cursorCircle.textContent = '';
    });
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
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

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
  const card = document.querySelector('.hero-image-card');
  if (card) {
    document.addEventListener('mousemove', (e) => {
      const cx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const cy = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      gsap.to(card, {
        rotateY: cx * 15,
        rotateX: -cy * 15,
        duration: 0.6,
        ease: "power2.out"
      });
    });
    
    document.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.8, ease: "power3.out" });
    });
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);

    currentScrollY += (scrollTargetY - currentScrollY) * 0.08;

    // Point Light follows mouse position smoothly
    pointLight.position.x += (mouse3D.x - pointLight.position.x) * 0.08;
    pointLight.position.y += (mouse3D.y - pointLight.position.y) * 0.08;

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
      
      mesh.position.z += (targetZ - mesh.position.z) * 0.1;
      
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
  const magnets = document.querySelectorAll('.magnetic');
  if (window.innerWidth <= 768) return;

  magnets.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);

      gsap.to(btn, {
        x: x * 0.35,
        y: y * 0.35,
        duration: 0.3,
        ease: "power2.out"
      });
      
      const btnText = btn.querySelector('.magnetic-text') || btn;
      if (btnText !== btn) {
        gsap.to(btnText, {
          x: x * 0.15,
          y: y * 0.15,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
      const btnText = btn.querySelector('.magnetic-text') || btn;
      if (btnText !== btn) {
        gsap.to(btnText, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.3)" });
      }
    });
  });
}

// 6. Project Card Parallax Image Hover
function initProjectImageHover() {
  const cards = document.querySelectorAll('.project-card');
  
  cards.forEach(card => {
    const fallback = card.querySelector('.project-fallback-gfx');
    if (!fallback) return;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(fallback, {
        rotateY: x * 10,
        rotateX: -y * 10,
        x: x * 18,
        y: y * 18,
        duration: 0.5,
        ease: "power2.out",
        transformPerspective: 1000
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(fallback, {
        rotateY: 0,
        rotateX: 0,
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
      });
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
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
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

// 9. Smooth Anchor Scrolling
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      // Only resolve simple in-page fragments to avoid selector injection
      if (!/^#[A-Za-z][\w-]*$/.test(targetId)) return;

      const target = document.getElementById(targetId.slice(1));
      if (target) {
        gsap.to(window, {
          scrollTo: target,
          duration: 1.5,
          ease: "power3.inOut"
        });
      }
    });
  });

  const scrollIndicator = document.getElementById('scroll-to-work');
  if (scrollIndicator) {
    scrollIndicator.addEventListener('click', () => {
      const aboutSec = document.getElementById('about');
      if (aboutSec) {
        aboutSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

// 10. Contact Form Validation
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const status = document.getElementById('contact-form-status');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  const limits = { name: 80, email: 254, subject: 120, message: 2000 };

  function setStatus(text, isError) {
    if (!status) return;
    status.textContent = text;
    status.classList.toggle('is-error', Boolean(isError));
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const values = {};
    for (const field of Object.keys(limits)) {
      const input = form.elements[field];
      values[field] = input ? input.value.trim() : '';
    }

    for (const [field, max] of Object.entries(limits)) {
      if (values[field].length > max) {
        setStatus(`${field} must be ${max} characters or fewer.`, true);
        return;
      }
    }

    if (!values.name || !values.message) {
      setStatus('Please fill in your name and project details.', true);
      return;
    }

    if (!emailPattern.test(values.email)) {
      setStatus('Please enter a valid email address.', true);
      return;
    }

    form.reset();
    setStatus('Message sent successfully!', false);
  });
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
  initSmoothScrolling();
  initContactForm();
});
