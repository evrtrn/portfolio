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
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
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


  /* ── INIT ────────────────────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initNavSpy();
    initSmoothScroll();
  });

}());
