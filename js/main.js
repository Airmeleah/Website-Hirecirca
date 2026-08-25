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

  /* -------------------------------------------------- proof carousel */
  const carousel = document.getElementById('proofCarousel');
  const prevBtn = document.getElementById('proofPrev');
  const nextBtn = document.getElementById('proofNext');
  const dotsWrap = document.getElementById('proofDots');

  if (carousel && dotsWrap) {
    const cards = Array.from(carousel.children);

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Go to screenshot ${i + 1}`);
      dot.addEventListener('click', () => {
        cards[i].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    const scrollByCard = (dir) => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(carousel).gap) || 0;
      carousel.scrollBy({ left: dir * (card.offsetWidth + gap), behavior: 'smooth' });
    };
    prevBtn.addEventListener('click', () => scrollByCard(-1));
    nextBtn.addEventListener('click', () => scrollByCard(1));

    let ticking = false;
    const updateActiveDot = () => {
      const center = carousel.scrollLeft + carousel.clientWidth / 2;
      let closest = 0;
      let closestDist = Infinity;
      cards.forEach((card, i) => {
        const dist = Math.abs((card.offsetLeft + card.offsetWidth / 2) - center);
        if (dist < closestDist) { closestDist = dist; closest = i; }
      });
      dots.forEach((d, i) => d.classList.toggle('active', i === closest));
      prevBtn.disabled = carousel.scrollLeft < 10;
      nextBtn.disabled = carousel.scrollLeft > carousel.scrollWidth - carousel.clientWidth - 10;
      ticking = false;
    };
    carousel.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateActiveDot); ticking = true; }
    }, { passive: true });
    updateActiveDot();
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
