  // Custom cursor
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });
  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();
  document.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2)';
      ring.style.width = '60px'; ring.style.height = '60px';
      ring.style.opacity = '0.5';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      ring.style.width = '40px'; ring.style.height = '40px';
      ring.style.opacity = '1';
    });
  });

  // Particle canvas background
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.vx = (Math.random() - 0.5) * 0.3;
      this.vy = (Math.random() - 0.5) * 0.3;
      this.alpha = Math.random() * 0.4 + 0.05;
      this.size = Math.random() * 1.5 + 0.3;
      this.color = Math.random() > 0.6 ? '#38BDF8' : Math.random() > 0.5 ? '#818CF8' : '#34D399';
    }
    update() {
      this.x += this.vx; this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  for (let i = 0; i < 120; i++) particles.push(new Particle());

  // Connect nearby particles
  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(56,189,248,' + (0.08 * (1 - dist/120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  function animCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animCanvas);
  }
  animCanvas();

  // Scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, entry.target.dataset.delay || 0);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.skill-card, .project-card, .timeline-item').forEach((el, i) => {
    el.dataset.delay = (i % 4) * 100;
    observer.observe(el);
  });

  // Reveal the character standing first, then seated at the desktop.
  const characterScene = document.querySelector('.character-scene');
  if (characterScene) {
    const clampProgress = value => Math.max(0, Math.min(1, value));
    let characterFrame = 0;

    function updateCharacterScene() {
      characterFrame = 0;
      const viewportHeight = window.innerHeight || 1;
      const scrollPosition = window.scrollY;
      const bodyProgress = clampProgress(scrollPosition / (viewportHeight * 0.45));
      const sitProgress = clampProgress((scrollPosition - viewportHeight * 0.55) / (viewportHeight * 0.8));

      characterScene.style.setProperty('--body-opacity', bodyProgress);
      characterScene.style.setProperty('--body-offset', `${18 * (1 - bodyProgress)}px`);
      characterScene.style.setProperty('--sit-offset', `${14 * sitProgress}px`);
      characterScene.style.setProperty('--desk-opacity', sitProgress);
      characterScene.style.setProperty('--desk-offset', `${20 * (1 - sitProgress)}px`);
      characterScene.style.setProperty('--standing-opacity', bodyProgress * (1 - sitProgress));
      characterScene.style.setProperty('--seated-opacity', sitProgress);
    }

    function requestCharacterUpdate() {
      if (!characterFrame) characterFrame = requestAnimationFrame(updateCharacterScene);
    }

    window.addEventListener('scroll', requestCharacterUpdate, { passive: true });
    window.addEventListener('resize', requestCharacterUpdate);
    updateCharacterScene();
  }
