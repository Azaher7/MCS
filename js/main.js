/* ============================================
   MCS GENERAL CONTRACTING - ENHANCED JAVASCRIPT
   Touq-inspired Layout - v2.0
   ============================================ */

const MCSApp = (function() {
  'use strict';

  /* ============================================
     CONFIGURATION
     ============================================ */
  const CONFIG = {
    headerScrollThreshold: 50,
    sliderInterval: 6000,
    animationThreshold: 0.15,
    mobileBreakpoint: 1024
  };

  /* ============================================
     DOM ELEMENTS
     ============================================ */
  let elements = {};

  /* ============================================
     INITIALIZATION
     ============================================ */
  function init() {
    cacheElements();
    setupEventListeners();
    
    // Initialize components
    initHeader();
    initMobileMenu();
    initHeroSlider();
    initScrollAnimations();
    initProjectFilter();
    initFAQAccordion();
    initContactForm();
    initCounters();
    
    console.log('MCS Website v2.0 initialized');
  }

  function cacheElements() {
    elements = {
      header: document.querySelector('.header'),
      menuToggle: document.querySelector('.menu-toggle'),
      mobileNav: document.querySelector('.mobile-nav'),
      heroSlider: document.querySelector('.hero-slider'),
      scrollAnimateElements: document.querySelectorAll('.scroll-animate'),
      counters: document.querySelectorAll('[data-count-to]'),
      faqItems: document.querySelectorAll('.faq-item')
    };
  }

  function setupEventListeners() {
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', debounce(handleResize, 250));
    
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && elements.mobileNav?.classList.contains('mobile-nav--open')) {
        closeMobileMenu();
      }
    });
  }

  /* ============================================
     HEADER
     ============================================ */
  function initHeader() {
    updateHeaderState();
  }

  function updateHeaderState() {
    if (!elements.header) return;
    
    const scrollY = window.scrollY || window.pageYOffset;
    
    if (scrollY > CONFIG.headerScrollThreshold) {
      elements.header.classList.add('header--scrolled');
    } else {
      elements.header.classList.remove('header--scrolled');
    }
  }

  /* ============================================
     MOBILE MENU
     ============================================ */
  function initMobileMenu() {
    if (!elements.menuToggle || !elements.mobileNav) return;
    
    elements.menuToggle.addEventListener('click', toggleMobileMenu);
    
    const mobileLinks = elements.mobileNav.querySelectorAll('.mobile-nav__link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function toggleMobileMenu() {
    const isOpen = elements.mobileNav.classList.contains('mobile-nav--open');
    isOpen ? closeMobileMenu() : openMobileMenu();
  }

  function openMobileMenu() {
    elements.menuToggle.classList.add('menu-toggle--active');
    elements.mobileNav.classList.add('mobile-nav--open');
    document.body.style.overflow = 'hidden';
    elements.menuToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    elements.menuToggle.classList.remove('menu-toggle--active');
    elements.mobileNav.classList.remove('mobile-nav--open');
    document.body.style.overflow = '';
    elements.menuToggle.setAttribute('aria-expanded', 'false');
  }

  /* ============================================
     HERO SLIDER
     ============================================ */
  let sliderState = {
    currentSlide: 0,
    totalSlides: 0,
    interval: null,
    isPlaying: true
  };

  function initHeroSlider() {
    const slider = elements.heroSlider;
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.hero-slider__slide');
    const dots = slider.querySelectorAll('.hero-slider__dot');
    const prevBtn = slider.querySelector('.hero-slider__arrow--prev');
    const nextBtn = slider.querySelector('.hero-slider__arrow--next');
    
    sliderState.totalSlides = slides.length;
    if (sliderState.totalSlides <= 1) return;
    
    // Initialize first slide
    showSlide(0);
    
    // Auto-play
    startSlider();
    
    // Dot navigation
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        restartSlider();
      });
    });
    
    // Arrow navigation
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        restartSlider();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        restartSlider();
      });
    }
    
    // Pause on hover
    slider.addEventListener('mouseenter', pauseSlider);
    slider.addEventListener('mouseleave', startSlider);
    
    // Touch/swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    
    slider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        restartSlider();
      }
    }
  }

  function showSlide(index) {
    const slider = elements.heroSlider;
    if (!slider) return;
    
    const slides = slider.querySelectorAll('.hero-slider__slide');
    const dots = slider.querySelectorAll('.hero-slider__dot');
    
    slides.forEach((slide, i) => {
      slide.classList.toggle('hero-slider__slide--active', i === index);
    });
    
    dots.forEach((dot, i) => {
      dot.classList.toggle('hero-slider__dot--active', i === index);
    });
    
    sliderState.currentSlide = index;
  }

  function goToSlide(index) {
    if (index >= sliderState.totalSlides) index = 0;
    if (index < 0) index = sliderState.totalSlides - 1;
    showSlide(index);
  }

  function nextSlide() {
    goToSlide(sliderState.currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(sliderState.currentSlide - 1);
  }

  function startSlider() {
    if (sliderState.interval) clearInterval(sliderState.interval);
    sliderState.interval = setInterval(nextSlide, CONFIG.sliderInterval);
    sliderState.isPlaying = true;
  }

  function pauseSlider() {
    if (sliderState.interval) clearInterval(sliderState.interval);
    sliderState.isPlaying = false;
  }

  function restartSlider() {
    pauseSlider();
    startSlider();
  }

  /* ============================================
     SCROLL ANIMATIONS
     ============================================ */
  function initScrollAnimations() {
    if (!elements.scrollAnimateElements.length) return;
    
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('scroll-animate--visible');
            }
          });
        },
        {
          root: null,
          rootMargin: '0px 0px -50px 0px',
          threshold: CONFIG.animationThreshold
        }
      );
      
      elements.scrollAnimateElements.forEach(el => observer.observe(el));
    } else {
      // Fallback
      elements.scrollAnimateElements.forEach(el => {
        el.classList.add('scroll-animate--visible');
      });
    }
  }

  /* ============================================
     PROJECT FILTER
     ============================================ */
  function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('[data-category]');
    
    if (!filterButtons.length || !projectCards.length) return;
    
    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const filter = this.dataset.filter;
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('filter-btn--active'));
        this.classList.add('filter-btn--active');
        
        // Filter projects
        projectCards.forEach(card => {
          const category = card.dataset.category;
          
          if (filter === 'all' || category === filter) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 300);
          }
        });
      });
    });
  }

  /* ============================================
     FAQ ACCORDION
     ============================================ */
  function initFAQAccordion() {
    if (!elements.faqItems.length) return;
    
    elements.faqItems.forEach(item => {
      const question = item.querySelector('.faq-item__question');
      
      question.addEventListener('click', () => {
        const isOpen = item.classList.contains('faq-item--open');
        
        // Close all items
        elements.faqItems.forEach(faq => {
          faq.classList.remove('faq-item--open');
        });
        
        // Open clicked item if it was closed
        if (!isOpen) {
          item.classList.add('faq-item--open');
        }
      });
    });
  }

  /* ============================================
     CONTACT FORM
     ============================================ */
  function initContactForm() {
    const form = document.querySelector('.contact-form form');
    if (!form) return;
    
    form.addEventListener('submit', handleFormSubmit);
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    if (!validateForm(form)) return;
    
    // Show loading
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate submission
    setTimeout(() => {
      submitBtn.textContent = 'Message Sent!';
      form.reset();
      
      setTimeout(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 3000);
    }, 1500);
  }

  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      field.classList.remove('form-input--error');
      
      if (!field.value.trim()) {
        field.classList.add('form-input--error');
        isValid = false;
      }
      
      if (field.type === 'email' && field.value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(field.value)) {
          field.classList.add('form-input--error');
          isValid = false;
        }
      }
    });
    
    return isValid;
  }

  /* ============================================
     COUNTERS
     ============================================ */
  function initCounters() {
    if (!elements.counters.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.countTo, 10);
          const duration = parseInt(el.dataset.countDuration, 10) || 2000;
          const suffix = el.dataset.countSuffix || '';
          
          animateCounter(el, 0, target, duration, suffix);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });
    
    elements.counters.forEach(counter => observer.observe(counter));
  }

  function animateCounter(el, start, end, duration, suffix) {
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (end - start) * easeOut);
      
      el.textContent = current + suffix;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }

  /* ============================================
     SCROLL HANDLER
     ============================================ */
  function handleScroll() {
    updateHeaderState();
  }

  /* ============================================
     RESIZE HANDLER
     ============================================ */
  function handleResize() {
    if (window.innerWidth >= CONFIG.mobileBreakpoint) {
      if (elements.mobileNav?.classList.contains('mobile-nav--open')) {
        closeMobileMenu();
      }
    }
  }

  /* ============================================
     UTILITIES
     ============================================ */
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  /* ============================================
     PUBLIC API
     ============================================ */
  return {
    init,
    openMobileMenu,
    closeMobileMenu,
    goToSlide
  };

})();

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', MCSApp.init);
} else {
  MCSApp.init();
}
