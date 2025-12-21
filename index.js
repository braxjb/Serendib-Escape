
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

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const navbar = document.querySelector('.navbar');
    const hamburger = document.querySelector('.hamburger');
    const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
    const mobileDropdownToggles = document.querySelectorAll('.mobile-dropdown-toggle');
    
    // Initialize navbar as transparent at top
    navbar.classList.remove('scrolled');
    
    // Scroll effect for navbar - with threshold
    window.addEventListener('scroll', () => {
        // Use a small threshold (10px) to trigger the change
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Trigger scroll check on page load in case page isn't at top
    window.dispatchEvent(new Event('scroll'));
    
    // Mobile menu toggle
    if (hamburger && mobileMenuOverlay) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenuOverlay.classList.toggle('active');
            
            // Prevent body scrolling when menu is open
            if (mobileMenuOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
            
            // Update aria-expanded attribute
            hamburger.setAttribute('aria-expanded', 
                mobileMenuOverlay.classList.contains('active'));
        });
        
        // Close menu when clicking on a link
        const mobileLinks = mobileMenuOverlay.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Don't close if it's a dropdown toggle
                if (!e.target.classList.contains('mobile-dropdown-toggle')) {
                    mobileMenuOverlay.classList.remove('active');
                    hamburger.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    hamburger.setAttribute('aria-expanded', 'false');
                }
            });
        });
        
        // Close menu when clicking outside
        mobileMenuOverlay.addEventListener('click', (e) => {
            if (e.target === mobileMenuOverlay) {
                mobileMenuOverlay.classList.remove('active');
                hamburger.classList.remove('active');
                document.body.style.overflow = 'auto';
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Mobile dropdown toggle
    mobileDropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = toggle.parentElement;
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            document.querySelectorAll('.mobile-dropdown').forEach(other => {
                if (other !== dropdown) other.classList.remove('active');
            });
        });
    });
    
    // Close menu on window resize (to desktop)
    window.addEventListener('resize', () => {
        if (window.innerWidth > 991) {
            if (mobileMenuOverlay && mobileMenuOverlay.classList.contains('active')) {
                mobileMenuOverlay.classList.remove('active');
                if (hamburger) {
                    hamburger.classList.remove('active');
                    hamburger.setAttribute('aria-expanded', 'false');
                }
                document.body.style.overflow = 'auto';
            }
        }
    });
    
    // Search functionality (placeholder)
    const searchButtons = document.querySelectorAll('.search-icon, .mobile-search button');
    searchButtons.forEach(button => {
        button.addEventListener('click', () => {
            const searchInput = document.querySelector('.mobile-search input');
            if (searchInput && searchInput.value.trim()) {
                alert(`Searching for: ${searchInput.value}`);
                searchInput.value = '';
            } else if (!searchInput) {
                alert('Search functionality would open a search modal.');
            }
        });
    });
});


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


