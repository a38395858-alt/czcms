(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersFinePointer = window.matchMedia('(pointer: fine)');
  document.documentElement.dataset.publicMotion = 'ready';

  function initServiceSelector() {
    const selector = document.querySelector('[data-service-selector]');
    if (!selector) return;

    const tabs = [...selector.querySelectorAll('[data-service-tab]')];
    const panels = [...selector.querySelectorAll('[data-service-panel]')];
    const gsap = window.gsap;
    let activeIndex = tabs.findIndex((tab) => tab.getAttribute('aria-selected') === 'true');
    if (activeIndex < 0) activeIndex = 0;

    function activate(index, focus = false) {
      const changed = activeIndex !== index;
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && focus) tab.focus();
      });
      panels.forEach((panel) => {
        panel.hidden = Number(panel.dataset.servicePanel) !== index;
      });
      activeIndex = index;

      // The active service changes the user's planning context. A short
      // crossfade confirms that state change without delaying access to it.
      const panel = panels[index];
      if (changed && panel && gsap && !reduceMotion.matches) {
        const content = [...panel.children];
        gsap.killTweensOf(content);
        gsap.fromTo(content, { autoAlpha: 0, y: 10 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.3,
          stagger: 0.035,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        });
      }
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => activate(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        let next = index;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length - 1;
        if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
        if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
        activate(next, true);
      });
    });
  }

  function animateEditorialMoments() {
    const gsap = window.gsap;
    const home = document.body.classList.contains('page-home');
    if (!home || reduceMotion.matches) return;
    if (!gsap) {
      document.documentElement.dataset.publicMotion = 'gsap-unavailable';
      return;
    }
    document.documentElement.dataset.publicMotion = 'gsap-active';

    const hero = document.querySelector('.hero');
    if (hero) {
      const copy = hero.querySelector('.hero-copy');
      const visual = hero.querySelector('.route-visual');
      const parts = copy ? [
        copy.querySelector('.hero-kicker'),
        copy.querySelector('h1'),
        copy.querySelector('.hero-lead'),
        copy.querySelector('.hero-actions'),
        copy.querySelector('.hero-microcopy'),
      ].filter(Boolean) : [];
      const photo = visual?.querySelector('.route-photo');
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (parts.length) {
        timeline.from(parts, {
          autoAlpha: 0,
          y: 18,
          duration: 0.52,
          stagger: 0.075,
          clearProps: 'transform,opacity,visibility',
        });
      }
      if (visual) {
        timeline.fromTo(visual, {
          clipPath: 'inset(5% 5% 5% 5%)',
          autoAlpha: 0,
        }, {
          clipPath: 'inset(0% 0% 0% 0%)',
          autoAlpha: 1,
          duration: 0.72,
          clearProps: 'clipPath,opacity,visibility',
        }, 0.08);
      }
      if (photo) {
        timeline.fromTo(photo, { scale: 1.075 }, {
          scale: 1,
          duration: 1.25,
          ease: 'power2.out',
          clearProps: 'transform',
        }, 0.1);
      }
      timeline.eventCallback('onComplete', () => initHeroPhotoParallax(gsap, visual, photo));
    }

    const candidates = [
      '.en-service-section .en-split-head',
      '.services-section .section-intro',
      '.services-section .service-register',
      '.services-section .service-list',
      '.services-section .service-widebands',
      '.services-section .service-chapters',
      '.services-section .service-stories',
      '.services-section .handoff-table',
    ];
    const revealed = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || revealed.has(entry.target)) return;
        revealed.add(entry.target);
        observer.unobserve(entry.target);
        const children = entry.target.matches('.section-intro, .en-split-head')
          ? [...entry.target.children]
          : [...entry.target.children].slice(0, 6);
        gsap.fromTo(children.length ? children : entry.target, {
          autoAlpha: 0,
          y: 16,
        }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.56,
          stagger: 0.055,
          ease: 'power3.out',
          clearProps: 'transform,opacity,visibility',
        });
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });

    candidates.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => observer.observe(element));
    });
  }

  function initHeaderScrollState() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    let scheduled = false;
    const update = () => {
      scheduled = false;
      header.dataset.scrolled = String(window.scrollY > 10);
    };
    const queueUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', queueUpdate, { passive: true });
  }

  function initHeroPhotoParallax(gsap, visual, photo) {
    if (!gsap || !visual || !photo || reduceMotion.matches || !prefersFinePointer.matches) return;
    if (visual.dataset.heroParallax === 'ready') return;

    visual.dataset.heroParallax = 'ready';
    gsap.set(photo, { transformOrigin: '50% 50%', scale: 1.04 });
    const moveX = gsap.quickTo(photo, 'x', { duration: 0.65, ease: 'power3.out' });
    const moveY = gsap.quickTo(photo, 'y', { duration: 0.65, ease: 'power3.out' });

    visual.addEventListener('pointermove', (event) => {
      const bounds = visual.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(x * 12);
      moveY(y * 10);
    });
    visual.addEventListener('pointerleave', () => {
      moveX(0);
      moveY(0);
    });
  }

  function createDotTexture(THREE) {
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureCanvas.height = 64;
    const context = textureCanvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.3, 'rgba(255,255,255,.92)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(textureCanvas);
  }

  function motionProfile() {
    const classes = document.body.classList;
    if (classes.contains('language-de')) return { colors: [0xff7c70, 0xf4c45f], drift: 0.78, direction: 1 };
    if (classes.contains('language-fr')) return { colors: [0xefc8d4, 0x7f9fe6], drift: 0.64, direction: -1 };
    if (classes.contains('language-es')) return { colors: [0xe96532, 0xf7cc45], drift: 0.9, direction: 1 };
    if (classes.contains('language-it')) return { colors: [0xe6b95a, 0x6aa7b8], drift: 0.58, direction: -1 };
    if (classes.contains('language-nl')) return { colors: [0x51c4b1, 0xef762f], drift: 0.72, direction: 1 };
    return { colors: [0x82d7c7, 0xf58a52], drift: 0.72, direction: 1 };
  }

  function colorToCss(color) {
    return `#${color.toString(16).padStart(6, '0')}`;
  }

  function insertMotionCanvas(host) {
    const existing = host.querySelector('.hero-motion-canvas');
    if (existing) return existing;
    const canvas = document.createElement('canvas');
    canvas.className = 'hero-motion-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    const image = host.querySelector('.route-photo, .sourcing-hero-photo');
    if (image) image.after(canvas);
    else host.prepend(canvas);
    return canvas;
  }

  function initHeroScene(THREE, host) {
    const canvas = insertMotionCanvas(host);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      canvas.remove();
      return false;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    const profile = motionProfile();
    const isCompact = window.matchMedia('(max-width: 780px)').matches;
    const particleCount = isCompact ? 48 : 96;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const velocity = new Float32Array(particleCount);
    const phase = new Float32Array(particleCount);
    const colorA = new THREE.Color(profile.colors[0]);
    const colorB = new THREE.Color(profile.colors[1]);
    const mixed = new THREE.Color();

    for (let index = 0; index < particleCount; index += 1) {
      const point = index * 3;
      positions[point] = (Math.random() - 0.5) * 11;
      positions[point + 1] = (Math.random() - 0.5) * 6.7;
      positions[point + 2] = -Math.random() * 4;
      velocity[index] = 0.16 + Math.random() * 0.34;
      phase[index] = Math.random() * Math.PI * 2;
      mixed.copy(colorA).lerp(colorB, Math.random());
      colors[point] = mixed.r;
      colors[point + 1] = mixed.g;
      colors[point + 2] = mixed.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: isCompact ? 0.12 : 0.095,
      map: createDotTexture(THREE),
      transparent: true,
      opacity: 0.7,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const beaconGroup = new THREE.Group();
    const beaconMaterial = new THREE.SpriteMaterial({
      map: particleMaterial.map,
      color: profile.colors[0],
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    [-3.4, -1.1, 1.4, 3.7].forEach((x, index) => {
      const beacon = new THREE.Sprite(beaconMaterial.clone());
      beacon.position.set(x, [-1.45, 0.55, -0.7, 1.25][index], 0.4);
      beacon.scale.setScalar(index % 2 ? 0.34 : 0.28);
      beacon.userData.phase = index * 0.85;
      beaconGroup.add(beacon);
    });
    scene.add(beaconGroup);

    let visible = true;
    let active = false;
    let animationFrame = 0;
    let lastTime = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    function resize() {
      const { width, height } = host.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.15 : 1.45));
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }

    function render(now) {
      if (!active) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05) || 0;
      lastTime = now;
      const position = particleGeometry.attributes.position;
      const elapsed = now / 1000;
      for (let index = 0; index < particleCount; index += 1) {
        const point = index * 3;
        positions[point] += velocity[index] * delta * profile.drift * profile.direction;
        positions[point + 1] += Math.sin(elapsed * 0.8 + phase[index]) * delta * 0.07;
        if (positions[point] > 5.9) positions[point] = -5.9;
        if (positions[point] < -5.9) positions[point] = 5.9;
      }
      position.needsUpdate = true;
      currentX += (targetX - currentX) * 0.035;
      currentY += (targetY - currentY) * 0.035;
      particles.rotation.y = currentX * 0.08;
      particles.rotation.x = -currentY * 0.05;
      beaconGroup.children.forEach((beacon) => {
        const pulse = 0.85 + Math.sin(elapsed * 1.5 + beacon.userData.phase) * 0.14;
        beacon.scale.setScalar(pulse * 0.3);
        beacon.material.opacity = 0.36 + Math.sin(elapsed * 1.5 + beacon.userData.phase) * 0.12;
      });
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    }

    function start() {
      if (active || reduceMotion.matches || document.hidden || !visible) return;
      active = true;
      lastTime = performance.now();
      animationFrame = window.requestAnimationFrame(render);
    }

    function stop() {
      active = false;
      window.cancelAnimationFrame(animationFrame);
    }

    const sizeObserver = new ResizeObserver(resize);
    sizeObserver.observe(host);
    const viewObserver = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    }, { threshold: 0.08 });
    viewObserver.observe(host);

    host.addEventListener('pointermove', (event) => {
      if (!prefersFinePointer.matches || reduceMotion.matches) return;
      const bounds = host.getBoundingClientRect();
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 2;
    });
    host.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) stop();
      else start();
    });

    resize();
    if (!reduceMotion.matches) start();
    return true;
  }

  function initCanvasFallback(host) {
    const canvas = insertMotionCanvas(host);
    const context = canvas.getContext('2d');
    if (!context) {
      canvas.remove();
      return;
    }

    const profile = motionProfile();
    const compact = window.matchMedia('(max-width: 780px)').matches;
    const points = Array.from({ length: compact ? 26 : 48 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: 1.4 + Math.random() * 2.5,
      velocity: 0.012 + Math.random() * 0.026,
      phase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.5 ? colorToCss(profile.colors[0]) : colorToCss(profile.colors[1]),
    }));
    let width = 1;
    let height = 1;
    let active = false;
    let visible = true;
    let frame = 0;
    let lastTime = 0;

    function resize() {
      const bounds = host.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const scale = Math.min(window.devicePixelRatio || 1, compact ? 1.1 : 1.35);
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
      draw(performance.now());
    }

    function draw(now) {
      context.clearRect(0, 0, width, height);
      points.forEach((point, index) => {
        const x = point.x * width;
        const y = point.y * height + Math.sin(now * 0.0012 + point.phase) * 8;
        const alpha = 0.24 + (Math.sin(now * 0.0016 + point.phase) + 1) * 0.14;
        context.beginPath();
        context.fillStyle = point.color;
        context.globalAlpha = alpha;
        context.arc(x, y, point.size, 0, Math.PI * 2);
        context.fill();
        if (index % 7 === 0) {
          context.globalAlpha = alpha * 0.22;
          context.beginPath();
          context.arc(x, y, point.size * 3.4, 0, Math.PI * 2);
          context.fill();
        }
      });
      context.globalAlpha = 1;
    }

    function render(now) {
      if (!active) return;
      const delta = Math.min((now - lastTime) / 1000, 0.05) || 0;
      lastTime = now;
      points.forEach((point) => {
        point.x += point.velocity * delta * profile.drift * profile.direction;
        if (point.x > 1.04) point.x = -0.04;
        if (point.x < -0.04) point.x = 1.04;
      });
      draw(now);
      frame = window.requestAnimationFrame(render);
    }

    function start() {
      if (active || reduceMotion.matches || document.hidden || !visible) return;
      active = true;
      lastTime = performance.now();
      frame = window.requestAnimationFrame(render);
    }

    function stop() {
      active = false;
      window.cancelAnimationFrame(frame);
    }

    new ResizeObserver(resize).observe(host);
    new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    }, { threshold: 0.08 }).observe(host);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop();
      else start();
    });
    reduceMotion.addEventListener('change', () => {
      if (reduceMotion.matches) stop();
      else start();
    });
    resize();
    start();
  }

  async function initHeroMotion() {
    const hosts = [...document.querySelectorAll('.page-home .route-visual, .page-product-sourcing [data-sourcing-motion-board]')];
    if (!hosts.length || reduceMotion.matches) return;
    document.documentElement.dataset.heroMotion = 'three-loading';
    try {
      const THREE = await import('/assets/vendor/three.module.min.js?v=0.181.1');
      const fallbackHosts = hosts.filter((host) => !initHeroScene(THREE, host));
      fallbackHosts.forEach(initCanvasFallback);
      document.documentElement.dataset.heroMotion = fallbackHosts.length ? 'canvas-fallback' : 'three-active';
    } catch {
      hosts.forEach(initCanvasFallback);
      document.documentElement.dataset.heroMotion = 'canvas-fallback';
    }
  }

  function animateProductSourcingMoments() {
    const gsap = window.gsap;
    const sourcingPage = document.body.classList.contains('page-product-sourcing');
    if (!sourcingPage || reduceMotion.matches || !gsap) return;

    const hero = document.querySelector('.sourcing-hero');
    const board = document.querySelector('[data-sourcing-motion-board]');
    if (hero) {
      const parts = [
        hero.querySelector('.sourcing-breadcrumb'),
        hero.querySelector('.sourcing-kicker'),
        hero.querySelector('h1'),
        hero.querySelector('.sourcing-hero-lead'),
        hero.querySelector('.sourcing-hero-actions'),
      ].filter(Boolean);
      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (parts.length) {
        timeline.from(parts, { autoAlpha: 0, y: 18, duration: 0.52, stagger: 0.07, clearProps: 'transform,opacity,visibility' });
      }
      if (board) {
        timeline.fromTo(board, { autoAlpha: 0, clipPath: 'inset(4% 3% 4% 3%)' }, { autoAlpha: 1, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.78, clearProps: 'clipPath,opacity,visibility' }, 0.12);
        const photo = board.querySelector('.sourcing-hero-photo');
        if (photo) timeline.fromTo(photo, { scale: 1.065 }, { scale: 1, duration: 1.15, ease: 'power2.out', clearProps: 'transform' }, 0.14);
        timeline.eventCallback('onComplete', () => initHeroPhotoParallax(gsap, board, photo));
      }
    }

    const targets = [...document.querySelectorAll('.sourcing-fit-item, .sourcing-process-step')];
    const observed = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || observed.has(entry.target)) return;
        observed.add(entry.target);
        observer.unobserve(entry.target);
        gsap.from(entry.target, { autoAlpha: 0, y: 18, duration: 0.52, ease: 'power3.out', clearProps: 'transform,opacity,visibility' });
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    targets.forEach((target) => observer.observe(target));

    document.querySelectorAll('.sourcing-faq details').forEach((item) => {
      item.addEventListener('toggle', () => {
        if (!item.open) return;
        const answer = item.querySelector('p');
        if (answer) gsap.from(answer, { autoAlpha: 0.35, y: -5, duration: 0.24, ease: 'power2.out', clearProps: 'transform,opacity,visibility' });
      });
    });
  }

  initServiceSelector();
  initHeaderScrollState();
  animateEditorialMoments();
  animateProductSourcingMoments();
  void initHeroMotion();
})();
