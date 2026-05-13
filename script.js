/* ===================================================
   GAYATHRI P — PORTFOLIO v2
   Three.js scene + GSAP scroll-driven animations
   =================================================== */

(function () {
  'use strict';

  // ==================== THREE.JS SCENE ====================
  const canvas = document.getElementById('three-canvas');
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // ----- Accent color -----
  const ACCENT = new THREE.Color(0xd4a853);
  const WHITE = new THREE.Color(0xffffff);
  const DIM_WHITE = new THREE.Color(0x333333);

  // ----- Floating particles -----
  const PARTICLE_COUNT = 300;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const speeds = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
    sizes[i] = Math.random() * 2 + 0.5;
    speeds.push({
      x: (Math.random() - 0.5) * 0.008,
      y: (Math.random() - 0.5) * 0.008,
      z: (Math.random() - 0.5) * 0.004,
    });
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.08,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ----- Pastel colors for Three.js -----
  const PASTELS = [
    new THREE.Color(0xfbcce1), // pink
    new THREE.Color(0xd1f2eb), // green
    new THREE.Color(0xfef9e7), // yellow
    new THREE.Color(0xd6eaf8), // blue
  ];

  // ----- Playful solid shapes -----
  const shapes = [];

  // Sphere 1 (Pink)
  const sphereGeo = new THREE.SphereGeometry(3, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({ color: PASTELS[0], transparent: true, opacity: 0.3 }); // Higher opacity for light mode
  const sphere = new THREE.Mesh(sphereGeo, sphereMat);
  sphere.position.set(-18, 10, -15);
  scene.add(sphere);
  shapes.push({ mesh: sphere, rotSpeed: { x: 0.005, y: 0.005, z: 0 }, floatSpeed: 0.0005, floatAmp: 4 });

  // Donut (Torus) (Green)
  const torusGeo = new THREE.TorusGeometry(3, 1.2, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({ color: PASTELS[1], transparent: true, opacity: 0.25 });
  const torus = new THREE.Mesh(torusGeo, torusMat);
  torus.position.set(20, -8, -10);
  scene.add(torus);
  shapes.push({ mesh: torus, rotSpeed: { x: 0.01, y: 0.01, z: 0.005 }, floatSpeed: 0.0008, floatAmp: 5 });

  // Cone (Yellow)
  const coneGeo = new THREE.ConeGeometry(2.5, 5, 32);
  const coneMat = new THREE.MeshBasicMaterial({ color: PASTELS[2], transparent: true, opacity: 0.3 });
  const cone = new THREE.Mesh(coneGeo, coneMat);
  cone.position.set(12, 15, -12);
  scene.add(cone);
  shapes.push({ mesh: cone, rotSpeed: { x: 0.008, y: 0.01, z: 0.008 }, floatSpeed: 0.001, floatAmp: 3 });

  // Icosahedron (Blue)
  const icoGeo = new THREE.IcosahedronGeometry(2.5, 0);
  const icoMat = new THREE.MeshBasicMaterial({ color: PASTELS[3], transparent: true, opacity: 0.25 });
  const ico = new THREE.Mesh(icoGeo, icoMat);
  ico.position.set(-15, -12, -8);
  scene.add(ico);
  shapes.push({ mesh: ico, rotSpeed: { x: 0.01, y: 0.01, z: 0.01 }, floatSpeed: 0.0007, floatAmp: 4 });

  // ----- Connecting lines (constellation effect) -----
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x000000, // Black lines for light mode
    transparent: true,
    opacity: 0.04,
  });

  const lineGroups = [];
  for (let g = 0; g < 8; g++) {
    const lineGeo = new THREE.BufferGeometry();
    const linePositions = new Float32Array(6); // 2 points
    const i1 = Math.floor(Math.random() * PARTICLE_COUNT);
    const i2 = Math.floor(Math.random() * PARTICLE_COUNT);
    linePositions[0] = positions[i1 * 3];
    linePositions[1] = positions[i1 * 3 + 1];
    linePositions[2] = positions[i1 * 3 + 2];
    linePositions[3] = positions[i2 * 3];
    linePositions[4] = positions[i2 * 3 + 1];
    linePositions[5] = positions[i2 * 3 + 2];
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    const line = new THREE.Line(lineGeo, lineMat);
    scene.add(line);
    lineGroups.push({ line, i1, i2 });
  }

  // ----- Mouse tracking -----
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  document.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  // ----- Scroll tracking -----
  let scrollProgress = 0;

  // ----- Render loop -----
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Smooth mouse
    mouseX += (targetMouseX - mouseX) * 0.03;
    mouseY += (targetMouseY - mouseY) * 0.03;

    // Camera parallax
    camera.position.x = mouseX * 2;
    camera.position.y = -mouseY * 2;
    camera.lookAt(0, 0, 0);

    // Scroll-driven camera z
    camera.position.z = 30 - scrollProgress * 10;

    // Update particles
    const posArr = particleGeo.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      posArr[i * 3] += speeds[i].x;
      posArr[i * 3 + 1] += speeds[i].y;
      posArr[i * 3 + 2] += speeds[i].z;

      // Wrap
      if (posArr[i * 3] > 40) posArr[i * 3] = -40;
      if (posArr[i * 3] < -40) posArr[i * 3] = 40;
      if (posArr[i * 3 + 1] > 40) posArr[i * 3 + 1] = -40;
      if (posArr[i * 3 + 1] < -40) posArr[i * 3 + 1] = 40;
    }
    particleGeo.attributes.position.needsUpdate = true;

    // Rotate & float shapes
    shapes.forEach((s, idx) => {
      s.mesh.rotation.x += s.rotSpeed.x;
      s.mesh.rotation.y += s.rotSpeed.y;
      s.mesh.rotation.z += s.rotSpeed.z;
      s.mesh.position.y += Math.sin(elapsed * s.floatSpeed * 100 + idx) * 0.015 * s.floatAmp;
    });

    // Update connecting lines
    lineGroups.forEach(lg => {
      const lp = lg.line.geometry.attributes.position.array;
      lp[0] = posArr[lg.i1 * 3];
      lp[1] = posArr[lg.i1 * 3 + 1];
      lp[2] = posArr[lg.i1 * 3 + 2];
      lp[3] = posArr[lg.i2 * 3];
      lp[4] = posArr[lg.i2 * 3 + 1];
      lp[5] = posArr[lg.i2 * 3 + 2];
      lg.line.geometry.attributes.position.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  animate();

  // Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ==================== GSAP ANIMATIONS ====================
  gsap.registerPlugin(ScrollTrigger);

  // ----- Progress bar -----
  gsap.to('#progress-bar', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
  });

  // ----- Scroll progress for Three.js -----
  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      scrollProgress = self.progress;
    },
  });

  // ----- Hero animations -----
  const heroTL = gsap.timeline({ delay: 0.3 });

  heroTL
    .to('.hero-wave', {
      scale: 1.5,
      duration: 0.8,
      ease: 'back.out(2)',
    })
    .to('#hero-label', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out',
    }, '-=0.4')
    .to('.hero-char', {
      opacity: 1,
      y: 0,
      duration: 1.2,
      stagger: 0.05,
      ease: 'elastic.out(1, 0.5)',
    }, '-=0.6')
    .to('.hero-card', {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'back.out(1.7)',
    }, '-=0.8');

  // ----- Navigation Scrolled State -----
  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // ----- Playful Cursor Blob Logic -----
  const blob = document.getElementById('cursor-blob');
  if (blob) {
    let bx = 0, by = 0;
    let tbx = 0, tby = 0;
    let vx = 0, vy = 0;
    let lastTbx = 0, lastTby = 0;
    
    document.addEventListener('mousemove', (e) => {
      tbx = e.clientX;
      tby = e.clientY;
    });

    // Hover detection for all interactive elements
    function initHovers() {
      const interactables = document.querySelectorAll('a, button, .glass-card, .skill-pill, .hero-char');
      const hoverClasses = ['hover-pink', 'hover-green', 'hover-yellow', 'hover-blue'];
      let colorIndex = 0;

      interactables.forEach(el => {
        el.addEventListener('mouseenter', () => {
          blob.classList.add('hovering');
          blob.classList.add(hoverClasses[colorIndex]);
          colorIndex = (colorIndex + 1) % hoverClasses.length;
        });
        el.addEventListener('mouseleave', () => {
          blob.classList.remove('hovering');
          hoverClasses.forEach(c => blob.classList.remove(c));
        });
      });
    }
    initHovers();

    function updateBlob() {
      // Smooth follow with inertia
      bx += (tbx - bx) * 0.18;
      by += (tby - by) * 0.18;

      // Velocity for squish & stretch
      vx = tbx - lastTbx;
      vy = tby - lastTby;
      lastTbx = tbx;
      lastTby = tby;

      const speed = Math.sqrt(vx*vx + vy*vy);
      const squish = Math.min(speed * 0.012, 0.4);
      const angle = Math.atan2(vy, vx) * 180 / Math.PI;

      // Center based on current size
      const size = blob.classList.contains('hovering') ? 140 : 80;
      const offset = size / 2;

      blob.style.transform = `translate(${bx - offset}px, ${by - offset}px) rotate(${angle}deg) scale(${1 + squish}, ${1 - squish})`;
      
      requestAnimationFrame(updateBlob);
    }
    updateBlob();
  }

  // ----- Story blocks tilt -----
  gsap.utils.toArray('.story-block').forEach(block => {
    gsap.from(block, {
      rotate: -5,
      scale: 0.9,
      opacity: 0,
      duration: 1,
      ease: 'back.out(1.7)',
      scrollTrigger: {
        trigger: block,
        start: 'top 90%',
      },
    });
  });

  // ----- Section titles bouncy -----
  gsap.utils.toArray('.section-title').forEach(title => {
    gsap.from(title, {
      y: 100,
      rotateX: -45,
      opacity: 0,
      duration: 1.2,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: title,
        start: 'top 90%',
      },
    });
  });

  // ----- Metric cards tilt-on-scroll -----
  gsap.utils.toArray('.metric').forEach((metric, i) => {
    gsap.to(metric, {
      opacity: 1,
      x: 0,
      rotation: 0,
      duration: 1,
      delay: i * 0.2,
      ease: 'elastic.out(1, 0.7)',
      scrollTrigger: {
        trigger: metric,
        start: 'top 85%',
      },
    });
  });

  // ----- Skill pills stagger -----
  gsap.utils.toArray('.skill-pill').forEach((pill, i) => {
    gsap.to(pill, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: Math.random() * 10 - 5, /* Random playful tilt */
      duration: 0.8,
      delay: i * 0.1,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: '.skills-container',
        start: 'top 85%',
      },
    });
  });

  // ----- Experience cards -----
  gsap.utils.toArray('.timeline-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      delay: i * 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
      },
    });
  });

  // ----- Contact items -----
  gsap.utils.toArray('.contact-item').forEach((item, i) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.contact-grid',
        start: 'top 85%',
      },
    });
  });

  // ----- Parallax on glass cards -----
  gsap.utils.toArray('.glass-card').forEach(card => {
    gsap.to(card, {
      y: -20,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });

  // ==================== NAVIGATION ====================
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      navToggle.classList.remove('active');
      mobileMenu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

})();
