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

    // ---- lightbox: the carousel crops 26-53% off each screenshot, so the
    // focused card opens the full image. First click focuses a card, a second
    // click on the already-focused one opens it — the carousel keeps working.
    const lb      = document.getElementById('lightbox');
    const lbImg   = document.getElementById('lbImg');
    const lbCap   = document.getElementById('lbCap');
    const lbCount = document.getElementById('lbCount');
    const lbStage = document.getElementById('lbStage');
    const lbPrev  = document.getElementById('lbPrev');
    const lbNext  = document.getElementById('lbNext');

    const shots = cards.map((card) => {
      const img = card.querySelector('img');
      const tag = card.querySelector('.proof-tag');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        tag: tag ? tag.textContent.trim() : ''
      };
    });

    let lbIndex = 0;
    let lastFocused = null;

    function renderShot(i) {
      lbIndex = (i + shots.length) % shots.length;
      const shot = shots[lbIndex];
      lbImg.src = shot.src;
      lbImg.alt = shot.alt;
      lbCap.textContent = shot.tag;
      lbCount.textContent = (lbIndex + 1) + ' / ' + shots.length;
      lbStage.scrollTop = 0;   // a previous shot may have been scrolled down
    }

    function openLightbox(i) {
      lastFocused = document.activeElement;
      renderShot(i);
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      lbPrev.focus();
    }

    function closeLightbox() {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    lb.querySelectorAll('[data-lb-close]').forEach((el) =>
      el.addEventListener('click', closeLightbox));
    lbPrev.addEventListener('click', () => renderShot(lbIndex - 1));
    lbNext.addEventListener('click', () => renderShot(lbIndex + 1));

    document.addEventListener('keydown', (e) => {
      if (lb.hidden) return;
      if (e.key === 'Escape')     { e.preventDefault(); closeLightbox(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); renderShot(lbIndex - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); renderShot(lbIndex + 1); }
      // keep tabbing inside the dialog while it is open
      if (e.key === 'Tab') {
        const f = [lbPrev, lbNext, document.getElementById('lbClose')];
        const at = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(at + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus();
      }
    });

    // set when a swipe happened, so the trailing click doesn't fight it
    let suppressClick = false;
    cards.forEach((card, i) => card.addEventListener('click', () => {
      if (suppressClick) { suppressClick = false; return; }
      if (i === active) { openLightbox(i); return; }
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
