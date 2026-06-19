(function () {
  'use strict';

  /* =============================================
     CONFIGURATION
     ============================================= */
  const CONFIG = {
    typingSpeed: 80,
    deleteSpeed: 50,
    pauseAfterWord: 2000,
    pauseBeforeDelete: 1000,
    words: [
      'Full-Stack Developer',
      'IT Operations Specialist',
      'Problem Solver'
    ],
    stats: {
      threshold: 0.5,
      duration: 2000
    },
    observerThreshold: 0.15
  };

  /* =============================================
     DOM CACHE
     ============================================= */
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  const dom = {
    header: $('#header'),
    hamburger: $('#hamburger'),
    navLinks: $('#nav-links'),
    themeToggle: $('#theme-toggle'),
    backToTop: $('#back-to-top'),
    typingEl: $('#typing-text'),
    contactForm: $('#contact-form'),
    formSuccess: $('#form-success'),
    statItems: $$('.stat-item'),
    statNumbers: $$('.stat-number'),
    aosElements: $$('[data-aos]'),
    cursorGlow: $('#cursor-glow')
  };

  /* =============================================
     TYPING EFFECT
     ============================================= */
  class TypingEffect {
    constructor(el, words) {
      this.el = el;
      this.words = words;
      this.wordIndex = 0;
      this.charIndex = 0;
      this.isDeleting = false;
      this.timeout = null;
    }

    start() {
      this.type();
    }

    type() {
      const current = this.words[this.wordIndex];

      if (this.isDeleting) {
        this.charIndex--;
        this.el.textContent = current.substring(0, this.charIndex);
      } else {
        this.charIndex++;
        this.el.textContent = current.substring(0, this.charIndex);
      }

      let delay = this.isDeleting ? CONFIG.deleteSpeed : CONFIG.typingSpeed;

      if (!this.isDeleting && this.charIndex === current.length) {
        delay = CONFIG.pauseAfterWord;
        this.isDeleting = true;
      } else if (this.isDeleting && this.charIndex === 0) {
        this.isDeleting = false;
        this.wordIndex = (this.wordIndex + 1) % this.words.length;
        delay = CONFIG.pauseBeforeDelete;
      }

      this.timeout = setTimeout(() => this.type(), delay);
    }

    destroy() {
      if (this.timeout) clearTimeout(this.timeout);
    }
  }

  if (dom.typingEl) {
    const typing = new TypingEffect(dom.typingEl, CONFIG.words);
    typing.start();
  }

  /* =============================================
     MOBILE HAMBURGER MENU
     ============================================= */
  function toggleMenu(forceClose) {
    const isActive = dom.navLinks.classList.contains('active');

    if (forceClose && !isActive) return;

    dom.navLinks.classList.toggle('active');
    dom.hamburger.classList.toggle('active');
    dom.hamburger.setAttribute('aria-expanded', !isActive);
    document.body.style.overflow = isActive ? '' : 'hidden';
  }

  if (dom.hamburger) {
    dom.hamburger.addEventListener('click', () => toggleMenu());
  }

  $$('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  document.addEventListener('click', (e) => {
    if (dom.navLinks.classList.contains('active') &&
        !dom.navLinks.contains(e.target) &&
        !dom.hamburger.contains(e.target)) {
      toggleMenu(true);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && dom.navLinks.classList.contains('active')) {
      toggleMenu(true);
    }
  });

  /* =============================================
     DARK / LIGHT MODE TOGGLE
     ============================================= */
  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  if (dom.themeToggle) {
    setTheme(getPreferredTheme());

    dom.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'light' : 'dark');
    }
  });

  /* =============================================
     HEADER SCROLL EFFECT
     ============================================= */
  let lastScrollY = 0;

  function handleHeaderScroll() {
    const scrollY = window.scrollY;

    if (scrollY > 50) {
      dom.header.classList.add('scrolled');
    } else {
      dom.header.classList.remove('scrolled');
    }

    if (scrollY > lastScrollY && scrollY > 200) {
      dom.header.classList.add('hidden');
    } else {
      dom.header.classList.remove('hidden');
    }

    lastScrollY = scrollY;
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });

  /* =============================================
     BACK TO TOP
     ============================================= */
  function handleBackToTop() {
    if (window.scrollY > 400) {
      dom.backToTop.classList.add('visible');
    } else {
      dom.backToTop.classList.remove('visible');
    }
  }

  if (dom.backToTop) {
    window.addEventListener('scroll', handleBackToTop, { passive: true });

    dom.backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* =============================================
     SMOOTH SCROLL (fallback for anchor links)
     ============================================= */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (!link) return;

    const targetId = link.getAttribute('href');
    if (targetId === '#') return;

    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* =============================================
     SCROLL ANIMATIONS (Intersection Observer)
     ============================================= */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) {
      dom.aosElements.forEach(el => el.classList.add('aos-animate'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.getAttribute('data-aos-delay')) || 0;
          setTimeout(() => {
            entry.target.classList.add('aos-animate');
          }, delay);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: CONFIG.observerThreshold,
      rootMargin: '0px 0px -50px 0px'
    });

    dom.aosElements.forEach(el => observer.observe(el));
  }

  initScrollAnimations();

  /* =============================================
     ANIMATED STAT COUNTERS
     ============================================= */
  function animateStats() {
    if (!('IntersectionObserver' in window)) {
      dom.statNumbers.forEach(el => {
        el.textContent = el.getAttribute('data-count');
      });
      return;
    }

    const statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const statItem = entry.target;
          statItem.classList.add('visible');

          const numEl = statItem.querySelector('.stat-number');
          if (!numEl) return;

          const target = parseInt(numEl.getAttribute('data-count'));
          if (isNaN(target)) return;

          animateCounter(numEl, target);
          statObserver.unobserve(statItem);
        }
      });
    }, { threshold: CONFIG.stats.threshold });

    dom.statItems.forEach(el => statObserver.observe(el));
  }

  function animateCounter(el, target) {
    const duration = CONFIG.stats.duration;
    const startTime = performance.now();
    const isFloat = target % 1 !== 0;

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = isFloat ? current.toFixed(1) : current;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(update);
  }

  animateStats();

  /* =============================================
     CONTACT FORM VALIDATION
     ============================================= */
  function validateForm() {
    if (!dom.contactForm) return;

    const fields = {
      name: {
        el: $('#form-name'),
        validate: (v) => v.trim().length >= 2 ? '' : 'Name must be at least 2 characters'
      },
      email: {
        el: $('#form-email'),
        validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Please enter a valid email address'
      },
      subject: {
        el: $('#form-subject'),
        validate: (v) => v.trim().length >= 3 ? '' : 'Subject must be at least 3 characters'
      },
      message: {
        el: $('#form-message'),
        validate: (v) => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters'
      }
    };

    function showError(input, message) {
      input.classList.add('error');
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('form-error')) {
        errorEl.textContent = message;
      }
    }

    function clearError(input) {
      input.classList.remove('error');
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('form-error')) {
        errorEl.textContent = '';
      }
    }

    Object.values(fields).forEach(({ el }) => {
      el.addEventListener('input', () => clearError(el));
      el.addEventListener('blur', () => {
        const msg = fields[el.id.replace('form-', '')].validate(el.value);
        if (msg) showError(el, msg);
      });
    });

    dom.contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let hasError = false;

      Object.entries(fields).forEach(([key, { el, validate }]) => {
        const errorMsg = validate(el.value);
        if (errorMsg) {
          showError(el, errorMsg);
          hasError = true;
        } else {
          clearError(el);
        }
      });

      if (hasError) {
        const firstError = Object.values(fields).find(({ el }) => el.classList.contains('error'));
        if (firstError) firstError.el.focus();
        return;
      }

      const submitBtn = dom.contactForm.querySelector('.btn-submit');
      submitBtn.classList.add('loading');
      submitBtn.disabled = true;

      const formData = new FormData(dom.contactForm);
      const data = Object.fromEntries(formData.entries());

      fetch('https://formspree.io/f/xgvzqkdo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(() => {
          dom.formSuccess.classList.add('visible');
          dom.contactForm.reset();
        })
        .catch(() => {
          dom.formSuccess.textContent = 'Something went wrong. Please email me directly at jobwangila254@gmail.com.';
          dom.formSuccess.classList.add('visible');
        })
        .finally(() => {
          submitBtn.classList.remove('loading');
          submitBtn.disabled = false;
        });
    });
  }

  validateForm();

  /* =============================================
     CURSOR GLOW EFFECT
     ============================================= */
  function initCursorGlow() {
    if (!dom.cursorGlow || window.matchMedia('(pointer: coarse)').matches) {
      if (dom.cursorGlow) dom.cursorGlow.style.display = 'none';
      return;
    }

    let mouseX = -200;
    let mouseY = -200;
    let currentX = -200;
    let currentY = -200;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      dom.cursorGlow.style.transform = `translate(${currentX - 150}px, ${currentY - 150}px)`;
      requestAnimationFrame(animate);
    }

    animate();
  }

  initCursorGlow();

  /* =============================================
     ACTIVE NAV LINK HIGHLIGHT
     ============================================= */
  function updateActiveNavLink() {
    const sections = $$('section[id]');
    const navLinks = $$('.nav-link');

    if (!sections.length || !navLinks.length) return;

    let current = '';

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 150) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href && href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });

  /* =============================================
     ACCESSIBILITY: REDUCED MOTION
     ============================================= */
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    dom.statItems.forEach(el => el.classList.add('visible'));
    dom.statNumbers.forEach(el => {
      el.textContent = el.getAttribute('data-count') || '0';
    });
  }

  /* =============================================
     PERFORMANCE: PASSIVE SCROLL LISTENERS
     ============================================= */
  let scrollTimeout;
  window.addEventListener('scroll', () => {
    if (scrollTimeout) return;
    scrollTimeout = requestAnimationFrame(() => {
      scrollTimeout = null;
    });
  }, { passive: true });

})();
