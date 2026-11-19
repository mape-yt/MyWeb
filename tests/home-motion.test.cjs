// Run with: node --test tests/home-motion.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const vm = require('node:vm');

function environment({ reduced = false, canvasSupported = true } = {}) {
  function element() {
    const classes = new Set();
    return {
      dataset: {}, style: { setProperty() {}, removeProperty() {} }, attrs: {}, listeners: {},
      classList: { add: value => classes.add(value), remove: value => classes.delete(value) },
      addEventListener(name, fn) { this.listeners[name] = fn; },
      setAttribute(name, value) { this.attrs[name] = value; },
      getBoundingClientRect: () => ({ width: 350, height: 350, left: 0, top: 0 }),
    };
  }
  const page = element(), stage = element(), sculpture = element(), caption = element();
  const toggle = element(), label = element(), progress = element();
  toggle.querySelector = () => label;
  stage.closest = () => sculpture;
  const context = new Proxy({}, { get: (_, key) => key === 'createRadialGradient' ? () => ({ addColorStop() {} }) : () => {} });
  const canvas = { parentElement: stage, getContext: () => canvasSupported ? context : null };
  const buttons = ['sphere', 'orbit', 'wave'].map(shape => Object.assign(element(), { dataset: { shape } }));
  const elements = { '.home-page': page, '#sculpture-canvas': canvas, '.motion-toggle': toggle, '#sculpture-description': caption, '.reading-progress': progress };
  const document = { ...element(), hidden: false, documentElement: { scrollHeight: 3000 },
    querySelector: selector => elements[selector],
    querySelectorAll: selector => selector === '.shape-button' ? buttons : [] };
  const preference = { matches: reduced, addEventListener(_, fn) { this.change = fn; } };
  const frames = new Map(), observers = [];
  let nextFrame = 0;
  const scope = {
    document, Math, window: { innerHeight: 844, devicePixelRatio: 3, scrollY: 0, addEventListener() {} },
    matchMedia: query => query.includes('reduced-motion') ? preference : { matches: false },
    requestAnimationFrame: callback => { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    ResizeObserver: class { observe() {} },
    IntersectionObserver: class { constructor(callback) { this.callback = callback; observers.push(this); } observe() {} unobserve() {} },
  };
  scope.window.IntersectionObserver = scope.IntersectionObserver;
  scope.window.ResizeObserver = scope.ResizeObserver;
  vm.runInNewContext(readFileSync(resolve(__dirname, '../js/home.js'), 'utf8'), scope);
  return { page, canvas, toggle, buttons, caption, document, preference, frames, observers };
}

test('reduced motion starts static, with usable shape controls and capped pixel density', () => {
  const app = environment({ reduced: true });
  assert.equal(app.page.dataset.motion, 'off');
  assert.equal(app.frames.size, 0);
  assert.equal(app.canvas.width, 700);
  app.buttons[2].listeners.click();
  assert.equal(app.buttons[2].attrs['aria-pressed'], 'true');
  assert.match(app.caption.textContent, /ripple/);
  assert.equal(app.frames.size, 0);
});

test('animation stops off-screen and in background tabs, and resumes with one loop', () => {
  const app = environment();
  assert.equal(app.frames.size, 1);
  app.observers[0].callback([{ isIntersecting: false }]);
  assert.equal(app.frames.size, 0);
  app.observers[0].callback([{ isIntersecting: true }]);
  assert.equal(app.frames.size, 1);
  app.document.hidden = true;
  app.document.listeners.visibilitychange();
  assert.equal(app.frames.size, 0);
  app.document.hidden = false;
  app.document.listeners.visibilitychange();
  app.document.listeners.visibilitychange();
  assert.equal(app.frames.size, 1);
  app.toggle.listeners.click();
  assert.equal(app.frames.size, 0);
  app.toggle.listeners.click();
  assert.equal(app.frames.size, 1);
  app.preference.matches = true;
  app.preference.change();
  assert.equal(app.frames.size, 0);
});

test('unsupported canvas leaves a static fallback without an animation loop', () => {
  const app = environment({ canvasSupported: false });
  assert.equal(app.frames.size, 0);
  assert.ok(app.buttons.every(button => button.disabled));
});
