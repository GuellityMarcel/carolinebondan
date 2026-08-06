/* ==========================================================================
   Caroline Bondan — Consultoria e Assessoria Ambiental
   JavaScript vanilla — sem dependências externas.
   ========================================================================== */
(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     Tela de abertura (preloader) — 4s, com barra de carregamento
  ------------------------------------------------------------ */
  var preloader = document.getElementById('preloader');
  if (preloader) {
    document.body.classList.add('is-loading');
    var preloaderDelay = reducedMotion ? 200 : 4000;
    setTimeout(function () {
      preloader.classList.add('is-hidden');
      document.body.classList.remove('is-loading');
    }, preloaderDelay);
    // Failsafe: garante que a tela nunca fique presa caso algo falhe.
    setTimeout(function () {
      preloader.style.display = 'none';
    }, preloaderDelay + 800);
  }

  /* ------------------------------------------------------------
     Ano dinâmico no rodapé
  ------------------------------------------------------------ */
  var anoEl = document.getElementById('anoAtual');
  if (anoEl) anoEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------
     Header: sombra + redução ao rolar
  ------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScrollHeader = function () {
      if (window.scrollY > 50) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScrollHeader();
    window.addEventListener('scroll', onScrollHeader, { passive: true });
  }

  /* ------------------------------------------------------------
     Menu mobile (hambúrguer + painel lateral)
  ------------------------------------------------------------ */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var closeMenuBtn = document.getElementById('closeMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileMenuOverlay');

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    mobileOverlay.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    mobileOverlay.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (hamburgerBtn) hamburgerBtn.addEventListener('click', openMobileMenu);
  if (closeMenuBtn) closeMenuBtn.addEventListener('click', closeMobileMenu);
  if (mobileOverlay) mobileOverlay.addEventListener('click', closeMobileMenu);
  document.querySelectorAll('[data-nav-mobile]').forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu();
  });

  /* ------------------------------------------------------------
     Scroll spy — destaca item de menu ativo
  ------------------------------------------------------------ */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = document.querySelectorAll('[data-nav]');

  if (sections.length && 'IntersectionObserver' in window) {
    var spyObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(function (sec) { spyObserver.observe(sec); });
  }

  /* ------------------------------------------------------------
     Fade-up on scroll (Intersection Observer)
  ------------------------------------------------------------ */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(function (el, i) {
      el.style.setProperty('--i', i % 6);
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ------------------------------------------------------------
     Contadores animados (estatísticas)
  ------------------------------------------------------------ */
  var counters = document.querySelectorAll('.stat-number[data-count]');
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reducedMotion) { el.textContent = target; return; }
    var duration = 1400;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target;
      }
    }
    requestAnimationFrame(step);
  }

  if (counters.length && 'IntersectionObserver' in window) {
    var statsObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { statsObserver.observe(c); });
  }

  /* ------------------------------------------------------------
     Parallax leve no background do Hero
  ------------------------------------------------------------ */
  var heroBg = document.getElementById('heroBg');
  if (heroBg && !reducedMotion) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          var offset = window.scrollY * 0.28;
          heroBg.style.transform = 'translateY(' + offset + 'px)';
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ------------------------------------------------------------
     Carrossel de depoimentos (scroll-snap + setas + dots)
  ------------------------------------------------------------ */
  var track = document.getElementById('testimonialTrack');
  if (track) {
    var slides = track.querySelectorAll('.testimonial-slide');
    var dotsWrap = document.getElementById('testimonialDots');
    var prevBtn = document.getElementById('prevTestimonial');
    var nextBtn = document.getElementById('nextTestimonial');
    var current = 0;

    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.setAttribute('aria-label', 'Ir para depoimento ' + (i + 1));
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', function () { goToSlide(i); });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll('button');

    function goToSlide(index) {
      current = (index + slides.length) % slides.length;
      track.scrollTo({ left: slides[current].offsetLeft, behavior: reducedMotion ? 'auto' : 'smooth' });
      updateDots();
    }
    function updateDots() {
      dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
    }
    if (prevBtn) prevBtn.addEventListener('click', function () { goToSlide(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToSlide(current + 1); });

    var scrollTimeout;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(function () {
        var closest = 0, minDist = Infinity;
        slides.forEach(function (s, i) {
          var dist = Math.abs(s.offsetLeft - track.scrollLeft);
          if (dist < minDist) { minDist = dist; closest = i; }
        });
        current = closest;
        updateDots();
      }, 120);
    }, { passive: true });
  }

})();
