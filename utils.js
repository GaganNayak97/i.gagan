/* Shared utilities used across the portfolio scripts */

const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return window.innerWidth <= MOBILE_BREAKPOINT;
}

// Frame-rate independent-ish easing towards a target value
function lerp(current, target, factor) {
  return current + (target - current) * factor;
}

// Pointer position inside an element, normalised to -0.5 .. 0.5
function normalizedPointerInElement(el, event) {
  const rect = el.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width - 0.5,
    y: (event.clientY - rect.top) / rect.height - 0.5
  };
}

// Pointer offset in pixels from the centre of an element
function pointerOffsetFromElementCenter(el, event) {
  const rect = el.getBoundingClientRect();
  return {
    x: event.clientX - rect.left - rect.width / 2,
    y: event.clientY - rect.top - rect.height / 2
  };
}

// Pointer position inside the viewport, normalised to -1 .. 1
function normalizedPointerInViewport(event) {
  return {
    x: (event.clientX - window.innerWidth / 2) / (window.innerWidth / 2),
    y: (event.clientY - window.innerHeight / 2) / (window.innerHeight / 2)
  };
}

function padTwoDigits(value) {
  return value < 10 ? `0${value}` : `${value}`;
}

// 3D tilt / parallax on pointer move, with a spring-back on pointer leave.
// `source` picks whether the pointer is measured against the element or the viewport.
function createPointerTilt(trigger, options = {}) {
  const {
    target = trigger,
    listenOn = trigger,
    source = 'element',
    rotate = 0,
    translate = 0,
    duration = 0.5,
    ease = 'power2.out',
    resetDuration = 0.8,
    resetEase = 'power3.out',
    transformPerspective
  } = options;

  if (!trigger || !target) return;

  listenOn.addEventListener('mousemove', (e) => {
    const pointer = source === 'viewport'
      ? normalizedPointerInViewport(e)
      : normalizedPointerInElement(trigger, e);

    const props = {
      rotateY: pointer.x * rotate,
      rotateX: -pointer.y * rotate,
      x: pointer.x * translate,
      y: pointer.y * translate,
      duration,
      ease
    };
    if (transformPerspective) props.transformPerspective = transformPerspective;

    gsap.to(target, props);
  });

  listenOn.addEventListener('mouseleave', () => {
    gsap.to(target, {
      rotateY: 0,
      rotateX: 0,
      x: 0,
      y: 0,
      duration: resetDuration,
      ease: resetEase
    });
  });
}

// Magnetic pull: every layer follows the pointer by its own strength and
// elastically snaps back when the pointer leaves.
function createMagneticPull(trigger, layers, options = {}) {
  const {
    duration = 0.3,
    ease = 'power2.out',
    resetDuration = 0.8,
    resetEase = 'elastic.out(1, 0.3)'
  } = options;

  const activeLayers = layers.filter(layer => layer.el);
  if (!trigger || activeLayers.length === 0) return;

  trigger.addEventListener('mousemove', (e) => {
    const offset = pointerOffsetFromElementCenter(trigger, e);
    activeLayers.forEach(({ el, strength }) => {
      gsap.to(el, {
        x: offset.x * strength,
        y: offset.y * strength,
        duration,
        ease
      });
    });
  });

  trigger.addEventListener('mouseleave', () => {
    activeLayers.forEach(({ el }) => {
      gsap.to(el, { x: 0, y: 0, duration: resetDuration, ease: resetEase });
    });
  });
}

// Toggle a body class while the pointer is over any of the given elements
function bindHoverBodyClass(elements, className, { onEnter, onLeave } = {}) {
  elements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add(className);
      if (onEnter) onEnter(el);
    });
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove(className);
      if (onLeave) onLeave(el);
    });
  });
}

// Keep a Three.js renderer and camera in sync with the viewport
function syncRendererToViewport(renderer, camera) {
  if (camera) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

function scrollToElement(target, { duration = 1.5, ease = 'power3.inOut' } = {}) {
  if (!target) return;
  gsap.to(window, { scrollTo: target, duration, ease });
}
