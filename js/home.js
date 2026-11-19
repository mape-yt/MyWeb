/* Homepage-only motion. No dependencies, network requests, or scroll hijacking. */
(() => {
  const page = document.querySelector('.home-page');
  const canvas = document.querySelector('#sculpture-canvas');
  if (!page || !canvas) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  let motion = !reduced.matches;
  let observer;
  let frame = 0;
  let inView = true;
  let lastTime = 0;
  let elapsed = 0;
  let shape = 'sphere';
  let width = 0;
  let height = 0;
  let points = [];
  let targetX = 0;
  let targetY = 0;
  let pointerX = 0;
  let pointerY = 0;
  const ctx = canvas.getContext('2d');
  const stage = canvas.parentElement;
  const sculpture = stage.closest('.sculpture');
  const caption = document.querySelector('#sculpture-description');
  const descriptions = {
    sphere: 'A world of possibilities. Built from connected points.',
    orbit: 'Different paths. One shared direction.',
    wave: 'Small experiments. A ripple of new ideas.'
  };
  const golden = Math.PI * (3 - Math.sqrt(5));
  function coordinates(index, count, type) {
    const t = index / count;
    if (type === 'orbit') {
      const u = t * Math.PI * 2;
      const v = index * golden;
      const ring = .69 + .24 * Math.cos(v);
      return [ring * Math.cos(u), .24 * Math.sin(v), ring * Math.sin(u)];
    }
    if (type === 'wave') {
      const side = Math.ceil(Math.sqrt(count));
      const x = (index % side) / (side - 1) * 2 - 1;
      const z = Math.floor(index / side) / (side - 1) * 2 - 1;
      return [x * .85, Math.sin(x * 3 + elapsed) * Math.cos(z * 2 + elapsed * .5) * .26, z * .85];
    }
    const y = 1 - (index / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(golden * index) * r, y, Math.sin(golden * index) * r];
  }
  function resize() {
    const bounds = stage.getBoundingClientRect();
    width = bounds.width; height = bounds.height;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = width < 400 ? 112 : 192;
    points = Array.from({length: count}, (_, i) => coordinates(i, count, shape));
    draw(0);
  }
  function draw(dt) {
    if (!ctx || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * .06;
    pointerY += (targetY - pointerY) * .06;
    const yaw = elapsed * .14 + pointerX * .45;
    const pitch = -.22 + pointerY * .3;
    const scale = Math.min(width, height) * .33;
    const blend = motion ? Math.min(dt * .004, 1) : 1;
    const projected = points.map((point, i) => {
      const target = coordinates(i, points.length, shape);
      for (let axis = 0; axis < 3; axis++) point[axis] += (target[axis] - point[axis]) * blend;
      const x = point[0] * Math.cos(yaw) + point[2] * Math.sin(yaw);
      const z = -point[0] * Math.sin(yaw) + point[2] * Math.cos(yaw);
      const y = point[1] * Math.cos(pitch) - z * Math.sin(pitch);
      const depth = point[1] * Math.sin(pitch) + z * Math.cos(pitch);
      const perspective = 3.5 / (3.5 - depth);
      return {x: width / 2 + x * scale * perspective, y: height / 2 + y * scale * perspective, z: depth};
    });
    const glow = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, scale * 1.5);
    glow.addColorStop(0, '#315fbd24'); glow.addColorStop(1, '#315fbd00');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, width, height);
    // Fixed neighbor count keeps connection cost linear on smaller devices.
    projected.forEach((p, i) => {
      for (const offset of [1, 5, 8]) {
        const q = projected[(i + offset) % projected.length];
        const distance = Math.hypot(p.x - q.x, p.y - q.y);
        if (distance > scale * .52) continue;
        const opacity = Math.max(.025, (1 - distance / (scale * .52)) * .23 * (1 + (p.z + 1) * .35));
        ctx.strokeStyle = `rgba(128,172,255,${opacity})`;
        ctx.lineWidth = .75;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
      }
    });
    projected.sort((a, b) => a.z - b.z).forEach(p => {
      const depth = (p.z + 1.2) / 2.4;
      ctx.fillStyle = `rgba(157,194,255,${.25 + depth * .75})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, .7 + depth * 1.65, 0, Math.PI * 2); ctx.fill();
      if (depth > .88) {
        ctx.fillStyle = '#8db8ff10'; ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, Math.PI * 2); ctx.fill();
      }
    });
  }
  function animate(now) {
    frame = 0;
    if (!motion || !inView || document.hidden || !ctx) return;
    const dt = lastTime ? Math.min(now - lastTime, 50) : 16;
    lastTime = now; elapsed += dt / 1000;
    draw(dt);
    frame = requestAnimationFrame(animate);
  }
  function syncAnimation() {
    cancelAnimationFrame(frame); frame = 0; lastTime = 0;
    if (motion && inView && !document.hidden && ctx) frame = requestAnimationFrame(animate);
    else draw(0);
  }
  function setMotion(enabled) {
    motion = enabled;
    page.dataset.motion = enabled ? 'on' : 'off';
    toggle.querySelector('span').textContent = enabled ? 'Pause effects' : 'Enable effects';
    toggle.setAttribute('aria-pressed', String(!enabled));
    if (!enabled) document.querySelectorAll('.awaiting-reveal').forEach(el => el.classList.remove('awaiting-reveal'));
    syncAnimation();
  }
  toggle.hidden = false;
  toggle.addEventListener('click', () => setMotion(!motion));
  reduced.addEventListener('change', () => setMotion(!reduced.matches));
  document.querySelectorAll('.shape-button').forEach(button => {
    button.addEventListener('click', () => {
      shape = button.dataset.shape;
      document.querySelectorAll('.shape-button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      caption.textContent = descriptions[shape];
      if (!motion) draw(0);
    });
  });
  stage.addEventListener('pointermove', event => {
    if (!motion || !finePointer.matches) return;
    const bounds = stage.getBoundingClientRect();
    targetX = (event.clientX - bounds.left) / bounds.width - .5;
    targetY = (event.clientY - bounds.top) / bounds.height - .5;
  });
  stage.addEventListener('pointerleave', () => { targetX = 0; targetY = 0; });
  if (ctx) sculpture.classList.add('sculpture-ready');
  else document.querySelectorAll('.shape-button').forEach(button => { button.disabled = true; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener('resize', resize);
  resize();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => { inView = entries[0].isIntersecting; syncAnimation(); }).observe(stage);
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.remove('awaiting-reveal'); observer.unobserve(entry.target); }
    }), { threshold: .08, rootMargin: '0px 0px -25px 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (motion && el.getBoundingClientRect().top > window.innerHeight) { el.classList.add('awaiting-reveal'); observer.observe(el); }
    });
  }
  document.addEventListener('visibilitychange', syncAnimation);
  const progress = document.querySelector('.reading-progress');
  let progressFrame = 0;
  function updateProgress() {
    progressFrame = 0;
    const travel = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${travel > 0 ? Math.min(1, Math.max(0, window.scrollY / travel)) : 0})`;
  }
  window.addEventListener('scroll', () => { if (!progressFrame) progressFrame = requestAnimationFrame(updateProgress); }, {passive: true});
  window.addEventListener('resize', updateProgress);
  updateProgress();
  document.querySelectorAll('.work-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!motion || !finePointer.matches) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty('--tilt-x', `${(y - .5) * -5}deg`);
      card.style.setProperty('--tilt-y', `${(x - .5) * 5}deg`);
      card.style.setProperty('--light-x', `${x * 100}%`);
      card.style.setProperty('--light-y', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => { card.style.removeProperty('--tilt-x'); card.style.removeProperty('--tilt-y'); });
  });
  setMotion(motion);
})();
