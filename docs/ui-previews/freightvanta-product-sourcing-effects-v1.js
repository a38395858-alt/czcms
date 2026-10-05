(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const palettes = {
    "market-de": { accent: 0xef493e, line: 0xf5f3ee, intensity: 0.76 },
    "market-fr": { accent: 0xff4d88, line: 0xf7ecf1, intensity: 0.72 },
    "market-es": { accent: 0xffd45a, line: 0xffffff, intensity: 0.76 },
    "market-it": { accent: 0xf4cf77, line: 0xf4f6ef, intensity: 0.7 },
    "market-nl": { accent: 0xf7bd73, line: 0xe8ffff, intensity: 0.72 }
  };

  function paletteForPage() {
    const className = Object.keys(palettes).find((name) => document.body.classList.contains(name));
    return palettes[className] || palettes["market-de"];
  }

  function createSignalField(board, palette) {
    if (!window.THREE || reducedMotion.matches) return;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    const field = new THREE.Group();
    const clock = new THREE.Clock();
    let active = true;
    let inView = true;
    let frameId = 0;

    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.domElement.className = "fx-canvas";
    renderer.domElement.setAttribute("aria-hidden", "true");
    board.appendChild(renderer.domElement);

    camera.position.set(0, 0, 6.6);
    scene.add(field);

    const paths = [
      [[-3.2, -1.35, -.3], [-1.35, -.15, .2], [.35, .9, -.25], [3.2, 1.45, .15]],
      [[-3.15, 1.2, -.2], [-1.05, .48, .25], [.8, -.35, -.18], [3.25, -.8, .2]],
      [[-2.75, -.2, .18], [-.75, -1.2, -.2], [1.35, -.62, .28], [3.05, .42, -.12]]
    ];

    paths.forEach((points, index) => {
      const curve = new THREE.CatmullRomCurve3(points.map(([x, y, z]) => new THREE.Vector3(x, y, z)));
      const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(52));
      const material = new THREE.LineBasicMaterial({
        color: index === 1 ? palette.line : palette.accent,
        transparent: true,
        opacity: index === 1 ? palette.intensity * .46 : palette.intensity * .68,
        depthWrite: false
      });
      field.add(new THREE.Line(geometry, material));
    });

    const count = 70;
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    for (let index = 0; index < count; index += 1) {
      const curve = paths[index % paths.length];
      const segment = Math.min(curve.length - 2, Math.floor(Math.random() * (curve.length - 1)));
      const progress = Math.random();
      const start = curve[segment];
      const end = curve[segment + 1];
      positions[index * 3] = start[0] + (end[0] - start[0]) * progress + (Math.random() - .5) * .18;
      positions[index * 3 + 1] = start[1] + (end[1] - start[1]) * progress + (Math.random() - .5) * .18;
      positions[index * 3 + 2] = start[2] + (end[2] - start[2]) * progress;
      phases[index] = Math.random() * Math.PI * 2;
    }
    const particles = new THREE.BufferGeometry();
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: palette.accent,
      size: .043,
      transparent: true,
      opacity: Math.min(1, palette.intensity + .08),
      depthWrite: false,
      sizeAttenuation: true
    });
    const pointCloud = new THREE.Points(particles, particleMaterial);
    field.add(pointCloud);

    function resize() {
      const box = board.getBoundingClientRect();
      if (!box.width || !box.height) return;
      renderer.setSize(box.width, box.height, false);
      camera.aspect = box.width / box.height;
      camera.updateProjectionMatrix();
    }

    function render() {
      if (!active) {
        frameId = 0;
        return;
      }
      const time = clock.getElapsedTime();
      const position = particles.attributes.position;
      for (let index = 0; index < count; index += 1) {
        position.setZ(index, positions[index * 3 + 2] + Math.sin(time * 1.1 + phases[index]) * .075);
      }
      position.needsUpdate = true;
      field.rotation.z = Math.sin(time * .22) * .02;
      field.position.y = Math.cos(time * .38) * .06;
      particleMaterial.opacity = Math.min(1, palette.intensity + .06 + Math.sin(time * 1.25) * .12);
      renderer.render(scene, camera);
      frameId = window.requestAnimationFrame(render);
    }

    function updateActivity() {
      active = inView && !document.hidden;
      if (active && !frameId) frameId = window.requestAnimationFrame(render);
    }

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateActivity();
    }, { threshold: .08 });
    observer.observe(board);

    document.addEventListener("visibilitychange", updateActivity);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    frameId = window.requestAnimationFrame(render);
  }

  function runGsap() {
    if (!window.gsap || reducedMotion.matches) return;
    if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

    const heroCopy = document.querySelectorAll(".hero .eyebrow, .hero h1, .hero-lead, .hero .actions");
    const board = document.querySelector(".route-board");
    const intro = gsap.timeline({ defaults: { ease: "power4.out" } });
    intro.from(heroCopy, { y: 22, opacity: 0, duration: .68, stagger: .09 });
    if (board) intro.from(board, { y: 18, opacity: 0, scale: 1.018, duration: .86 }, "<.14");

    if (!window.ScrollTrigger) return;
    const flowItems = document.querySelectorAll(".steps article, .fr-flow article, .es-flow article, .it-flow article, .nl-flow article");
    if (flowItems.length) {
      gsap.from(flowItems, {
        y: 20,
        opacity: 0,
        duration: .52,
        stagger: .075,
        ease: "power3.out",
        scrollTrigger: {
          trigger: flowItems[0].closest(".section"),
          start: "top 72%",
          once: true
        }
      });
    }

    document.querySelectorAll(".faq details").forEach((item) => {
      item.addEventListener("toggle", () => {
        if (!item.open) return;
        gsap.from(item.querySelector("p"), { y: -5, opacity: .35, duration: .26, ease: "power2.out" });
      });
    });
  }

  function start() {
    if (reducedMotion.matches) return;
    const board = document.querySelector(".route-board");
    if (board) createSignalField(board, paletteForPage());
    runGsap();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
