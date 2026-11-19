/* Shared, keyboard-accessible navigation on every page. */
const menuToggle = document.querySelector('.nav-toggle');
const siteLinks = document.querySelector('.site-links');
if (menuToggle && siteLinks) {
  const closeMenu = () => {
    siteLinks.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.textContent = 'Menu';
  };
  menuToggle.addEventListener('click', () => {
    const open = siteLinks.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.textContent = open ? 'Close' : 'Menu';
  });
  siteLinks.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && siteLinks.classList.contains('is-open')) {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-nav')) closeMenu();
  });
  window.matchMedia('(min-width: 701px)').addEventListener('change', closeMenu);
}
