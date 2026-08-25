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

  /* -------------------------------------------------- proof carousel
     Material-3 style: the active card expands to a hero while its
     neighbours compress by distance. Driven by an index, not scroll,
     so the morph stays smooth and fully controllable. */
  const carousel = document.getElementById('proofCarousel');
  const prevBtn = document.getElementById('proofPrev');
  const nextBtn = document.getElementById('proofNext');
  const dotsWrap = document.getElementById('proofDots');

  if (carousel && dotsWrap) {
    const cards = Array.from(carousel.children);
    let active = 0;

    // one dot per card
    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Show screenshot ${i + 1} of ${cards.length}`);
      dot.addEventListener('click', () => setActive(i));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    // distance from the active card decides how much room each one gets
    const stateFor = (distance) => {
      if (distance === 0) return 'hero';
      if (distance === 1) return 'near';
      if (distance === 2) return 'far';
      return 'sliver';
    };

    function setActive(i) {
      active = Math.max(0, Math.min(cards.length - 1, i));
      cards.forEach((card, idx) => {
        card.dataset.state = stateFor(Math.abs(idx - active));
        card.setAttribute('aria-current', idx === active ? 'true' : 'false');
      });
      dots.forEach((d, idx) => d.classList.toggle('active', idx === active));
      prevBtn.disabled = active === 0;
      nextBtn.disabled = active === cards.length - 1;
    }

    // set when a swipe happened, so the trailing click doesn't fight it
    let suppressClick = false;
    cards.forEach((card, i) => card.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      setActive(i);
    }));
    prevBtn.addEventListener('click', () => setActive(active - 1));
    nextBtn.addEventListener('click', () => setActive(active + 1));

    // keyboard
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); setActive(active + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); setActive(active - 1); }
    });

    // drag / swipe
    let startX = null;
    let dragging = false;
    const SWIPE_THRESHOLD = 45;

    const onDown = (x) => { startX = x; dragging = true; carousel.classList.add('dragging'); };
    const onUp = (x) => {
      if (!dragging || startX === null) return;
      const dx = x - startX;
      if (Math.abs(dx) > SWIPE_THRESHOLD) {
        suppressClick = true;
        setActive(active + (dx < 0 ? 1 : -1));
      }
      dragging = false;
      startX = null;
      carousel.classList.remove('dragging');
    };

    carousel.addEventListener('pointerdown', (e) => onDown(e.clientX));
    carousel.addEventListener('pointerup', (e) => onUp(e.clientX));
    carousel.addEventListener('pointercancel', () => {
      dragging = false; startX = null; carousel.classList.remove('dragging');
    });

    setActive(0);
  }

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
