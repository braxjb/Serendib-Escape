
/* =========================================================
   SERENDIB ESCAPE — PERFORMANCE OPTIMIZED CORE
   ========================================================= */

(() => {
  'use strict';

  /* =====================
     DOM CACHE (ONCE)
     ===================== */
  const DOM = {
    navbar: document.querySelector('.navbar'),
    hamburger: document.querySelector('.hamburger'),
    mobileMenu: document.getElementById('mobileMenuOverlay'),
    destinationCarousel: document.getElementById('destination-carousel'),
    packagesCarousel: document.getElementById('packages-carousel'),
    progressBars: document.querySelectorAll('.progress-bar'),
  };

  /* =====================
     NAVBAR + MOBILE MENU
     ===================== */
  const NavbarController = () => {
    if (!DOM.navbar) return;

    const onScroll = () => {
      DOM.navbar.classList.toggle('scrolled', window.scrollY > 10);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!DOM.hamburger || !DOM.mobileMenu) return;

    DOM.hamburger.addEventListener('click', () => {
      const active = DOM.mobileMenu.classList.toggle('active');
      DOM.hamburger.classList.toggle('active', active);
      document.body.style.overflow = active ? 'hidden' : 'auto';
      DOM.hamburger.setAttribute('aria-expanded', active);
    });

    DOM.mobileMenu.addEventListener('click', e => {
      if (e.target === DOM.mobileMenu) {
        DOM.mobileMenu.classList.remove('active');
        DOM.hamburger.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    });
  };

  /* =====================
     GENERIC STEPPED CAROUSEL
     ===================== */
  class SteppedCarousel {
    constructor(container, interval = 3000) {
      this.container = container;
      this.cards = container?.children || [];
      this.index = 0;
      this.intervalTime = interval;
      this.timer = null;
      this.userActive = false;

      if (!this.cards.length) return;
      this.init();
    }

    init() {
      this.start();
      this.bind();
    }

    bind() {
      this.container.addEventListener('mouseenter', () => this.pause(), { passive: true });
      this.container.addEventListener('mouseleave', () => this.start(), { passive: true });
      this.container.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }

    onScroll() {
      this.userActive = true;
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.userActive = false;
      }, 1000);
    }

    start() {
      this.stop();
      this.timer = setInterval(() => {
        if (this.userActive) return;
        this.index = (this.index + 1) % this.cards.length;
        this.scrollToIndex();
      }, this.intervalTime);
    }

    stop() {
      if (this.timer) clearInterval(this.timer);
    }

    pause() {
      this.stop();
    }

    scrollToIndex() {
      const card = this.cards[this.index];
      if (!card) return;

      this.container.scrollTo({
        left: card.offsetLeft,
        behavior: 'smooth'
      });
    }
  }

  /* =====================
     LAZY INIT CAROUSELS
     ===================== */
  const lazyCarousel = (el, callback) => {
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        callback();
        observer.disconnect();
      }
    }, { threshold: 0.2 });

    observer.observe(el);
  };

  /* =====================
     ARTICLE MODAL (SAFE)
     ===================== */
  window.openArticleModal = id => {
    const modal = document.getElementById('article-modal');
    const content = document.getElementById('modal-content');
    if (!modal || !content) return;

    content.innerHTML = window.newsData?.[id] || '<p>Content unavailable.</p>';
    modal.classList.add('active');
  };

  document.getElementById('modal-close')?.addEventListener('click', () => {
    document.getElementById('article-modal')?.classList.remove('active');
  });

  /* =====================
     INIT EVERYTHING
     ===================== */
  document.addEventListener('DOMContentLoaded', () => {
    NavbarController();

    lazyCarousel(DOM.destinationCarousel, () =>
      new SteppedCarousel(DOM.destinationCarousel, 3000)
    );

    lazyCarousel(DOM.packagesCarousel, () =>
      new SteppedCarousel(DOM.packagesCarousel, 3500)
    );
  });

})();

