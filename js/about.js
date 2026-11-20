/* About-page interactions; all story chapters remain readable without JS. */
(() => {
  const page = document.querySelector('.about-page');
  if (!page) return;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const motionButton = document.querySelector('.lab-motion');
  let motion = !preference.matches;
  const transitions = new Map();
  // Replace an in-flight transition immediately, so rapid selections never show stale text.
  function revealSelection(element) {
    transitions.get(element)?.cancel();
    transitions.delete(element);
    if (!motion || preference.matches || !element.animate) return;
    const animation = element.animate([
      { opacity: .35, transform: 'translateY(6px)' },
      { opacity: 1, transform: 'translateY(0)' }
    ], { duration: 280, easing: 'cubic-bezier(.22,.8,.22,1)' });
    transitions.set(element, animation);
    animation.onfinish = () => transitions.delete(element);
  }
  function setMotion(enabled) {
    motion = enabled;
    page.dataset.motion = enabled ? 'on' : 'off';
    motionButton.textContent = enabled ? 'Pause effects' : 'Enable effects';
    motionButton.setAttribute('aria-pressed', String(!enabled));
    if (!enabled) {
      transitions.forEach(animation => animation.cancel());
      transitions.clear();
    }
  }
  motionButton.hidden = false;
  motionButton.addEventListener('click', () => setMotion(!motion));
  preference.addEventListener('change', () => setMotion(!preference.matches));
  setMotion(motion);

  const roles = {
    student: ['Always a student.', 'Mathematics, science, and a good question. Learning is where every project begins.'],
    developer: ['Thinking in systems.', 'I use programming, logic, and problem solving to turn complicated ideas into working software.'],
    builder: ['Ideas deserve a first version.', 'Build it, try it, and improve it. Making something real is how I learn what an idea can become.']
  };
  const roleButtons = [...document.querySelectorAll('.role-controls button')];
  roleButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.role;
    const data = roles[key];
    if (!data) return;
    if (button.getAttribute('aria-pressed') === 'true') return;
    roleButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('.identity-console').dataset.role = key;
    document.getElementById('role-title').textContent = data[0];
    document.getElementById('role-description').textContent = data[1];
    revealSelection(document.querySelector('.identity-note'));
  }));

  const tabs = [...document.querySelectorAll('[data-chapter]')];
  const panels = [...document.querySelectorAll('.chapter-panel')];
  const tablist = document.querySelector('.chapter-tabs');
  tablist.setAttribute('role', 'tablist');
  const compactTabs = matchMedia('(max-width: 700px)');
  const updateTabOrientation = () => tablist.setAttribute('aria-orientation', compactTabs.matches ? 'horizontal' : 'vertical');
  compactTabs.addEventListener('change', updateTabOrientation);
  updateTabOrientation();
  let currentChapter = 0;
  function selectChapter(index, moveFocus = false) {
    tabs.forEach((tab, i) => {
      tab.setAttribute('aria-selected', String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
      panels[i].hidden = i !== index;
    });
    if (index !== currentChapter) revealSelection(panels[index].querySelector('.chapter-inner'));
    currentChapter = index;
    if (moveFocus) tabs[index].focus();
  }
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panels[index].id);
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => selectChapter(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (!compactTabs.matches && event.key === 'ArrowDown') next = (index + 1) % tabs.length;
      if (!compactTabs.matches && event.key === 'ArrowUp') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { event.preventDefault(); selectChapter(next, true); }
    });
  });
  selectChapter(0);

  const steps = {
    learn: ['Start with curiosity.', 'Understand how something works before trying to change it. Build a foundation, then find the questions worth asking.', 'CONNECT THE PIECES'],
    question: ['Ask a better question.', 'Why does it work? What could be different? Look at the problem from another angle before choosing a solution.', 'CHANGE THE PERSPECTIVE'],
    build: ['Give the idea a shape.', 'Turn an idea into something real. Even a rough first version teaches more than an idea sitting on paper.', 'MAKE SOMETHING REAL'],
    break: ['Find the weak points.', "Things don't always work the first time. Debugging helps me understand the system instead of guessing.", 'TEST. DEBUG. UNDERSTAND.'],
    improve: ['Make the next version better.', 'Take what I learned from the first version and make the system clearer, stronger, and more useful. Then start the loop again.', 'REFINE AND REPEAT']
  };
  const stepButtons = [...document.querySelectorAll('.process-controls button')];
  stepButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.step;
    const data = steps[key];
    if (!data) return;
    if (button.getAttribute('aria-pressed') === 'true') return;
    stepButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    document.querySelector('.process-art').dataset.step = key;
    document.getElementById('process-title').textContent = data[0];
    document.getElementById('process-description').textContent = data[1];
    document.querySelector('.process-caption').textContent = data[2];
    document.querySelector('.diagram-center-state').textContent = button.textContent.trim();
    document.querySelectorAll('.diagram-node').forEach(node => node.classList.toggle('is-current', node.dataset.node === key));
    revealSelection(document.querySelector('.process-copy'));
  }));

  if ('IntersectionObserver' in window) {
    const entrance = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      if (motion) entry.target.classList.add('lab-reveal');
      entrance.unobserve(entry.target);
    }), { threshold: .1 });
    document.querySelectorAll('[data-enter]').forEach(element => entrance.observe(element));
    // Stop the decorative orbital animation when it cannot be seen.
    const art = document.querySelector('.identity-art');
    const orbitObserver = new IntersectionObserver(entries => {
      art.dataset.visible = String(entries[0].isIntersecting);
    });
    orbitObserver.observe(art);
  }
  document.addEventListener('visibilitychange', () => {
    page.classList.toggle('page-backgrounded', document.hidden);
  });
  document.querySelectorAll('.lab-interest-card').forEach(card => {
    card.addEventListener('pointermove', event => {
      if (!motion || !pointer.matches) return;
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--light-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--light-y', `${event.clientY - bounds.top}px`);
    });
  });
})();
