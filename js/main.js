// HireCirca — site interactions

document.addEventListener('DOMContentLoaded', () => {
  /* -------------------------------------------------- sticky navbar shadow */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 12) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -------------------------------------------------- mobile menu */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMenu = () => {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  /* -------------------------------------------------- scroll reveal */
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => io.observe(el));

  /* -------------------------------------------------- contact form (no backend wired yet) */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // NOTE: this form has no backend yet. Wire it to a service
    // like Formspree, EmailJS, or your own endpoint before going live.
    success.classList.add('show');
    form.reset();
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});
