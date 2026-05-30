/**
 * Evelyn Kuang — Portfolio
 * script.js
 *
 * Responsibilities:
 *  1. Scroll-reveal — fade content blocks in as they enter the viewport
 *  2. Active nav link — highlight current section while scrolling (homepage)
 *  3. Reduced-motion guard — skip JS animations if user prefers it
 *  4. Smooth scroll fallback — for browsers without CSS scroll-behavior
 */

(function () {
  'use strict';

  /* ── 1. REDUCED-MOTION GUARD ─────────────────────────────── */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;


  /* ── 2. SCROLL-REVEAL ────────────────────────────────────── */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );

    targets.forEach(el => observer.observe(el));
  }


  /* ── 3. ACTIVE NAV LINK (homepage) ──────────────────────── */
  function initNavSpy() {
    /* Fixed: was '.nav-links a' — correct class is '.nav__links' */
    const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');
    if (!navLinks.length) return;

    const sectionIds = Array.from(navLinks).map(a =>
      a.getAttribute('href').slice(1)
    );

    const sections = sectionIds
      .map(id => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const setActive = (id) => {
      navLinks.forEach(a => {
        a.setAttribute(
          'aria-current',
          a.getAttribute('href') === '#' + id ? 'true' : 'false'
        );
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    sections.forEach(s => observer.observe(s));
  }


  /* ── 4. SMOOTH SCROLL FALLBACK ───────────────────────────── */
  function initSmoothScroll() {
    if (CSS.supports('scroll-behavior', 'smooth')) return;
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }


  /* ── 5. LIGHTBOX ─────────────────────────────────────────── */
  function initLightbox() {
    // Build overlay DOM once
    const overlay = document.createElement('div');
    overlay.className = 'lightbox';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.innerHTML = `
      <div class="lightbox__inner">
        <button class="lightbox__close" aria-label="Close image viewer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <img class="lightbox__img" src="" alt="" />
        <p class="lightbox__caption"></p>
      </div>
    `;
    document.body.appendChild(overlay);

    const inner      = overlay.querySelector('.lightbox__inner');
    const imgEl      = overlay.querySelector('.lightbox__img');
    const captionEl  = overlay.querySelector('.lightbox__caption');
    const closeBtn   = overlay.querySelector('.lightbox__close');
    let previousFocus = null;

    function open(src, alt, caption) {
      imgEl.src = src;
      imgEl.alt = alt || '';
      captionEl.textContent = caption || '';
      captionEl.style.display = caption ? '' : 'none';

      previousFocus = document.activeElement;
      document.body.style.overflow = 'hidden';

      // Trigger on next frame so CSS transition fires
      requestAnimationFrame(() => {
        overlay.classList.add('is-open');
        closeBtn.focus();
      });
    }

    function close() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      if (previousFocus) previousFocus.focus();

      // Clear src after transition to avoid flash on reopen
      overlay.addEventListener('transitionend', () => {
        if (!overlay.classList.contains('is-open')) {
          imgEl.src = '';
        }
      }, { once: true });
    }

    // Close on button click
    closeBtn.addEventListener('click', close);

    // Close on backdrop click (not inner content)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) close();
    });

    // Trap focus inside overlay when open
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !overlay.classList.contains('is-open')) return;
      const focusable = overlay.querySelectorAll('button, [tabindex="0"]');
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    });

    // Attach click handlers to all images
    function attachToImages() {
      // Case study images: <img> inside .cs-image
      document.querySelectorAll('.cs-image img, .card-image img, .cs-hero-image img').forEach(img => {
        const wrapper = img.closest('.cs-image, .card-image, .cs-hero-image');
        if (!wrapper || wrapper.dataset.lightboxBound) return;
        wrapper.dataset.lightboxBound = 'true';
        wrapper.style.cursor = 'zoom-in';

        // Find associated caption (next sibling .cs-image-caption)
        const getCaption = () => {
          const next = wrapper.nextElementSibling;
          return next && next.classList.contains('cs-image-caption') ? next.textContent : '';
        };

        wrapper.addEventListener('click', () => {
          open(img.src, img.alt, getCaption());
        });

        // Keyboard: Enter or Space on the wrapper
        wrapper.setAttribute('tabindex', '0');
        wrapper.setAttribute('role', 'button');
        wrapper.setAttribute('aria-haspopup', 'dialog');
        wrapper.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open(img.src, img.alt, getCaption());
          }
        });
      });
    }

    // Run on init and observe DOM changes for dynamically added images
    attachToImages();

    const domObserver = new MutationObserver(attachToImages);
    domObserver.observe(document.body, { childList: true, subtree: true });
  }


  /* ── INIT ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavSpy();
    initSmoothScroll();
    initLightbox();
  });

}());
