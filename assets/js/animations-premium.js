/**
 * Premium Animation Suite for Tillerstead.com
 * Uses: GSAP, Animate On Scroll (AOS), custom scroll triggers
 * Brings flagship-level polish to every interaction
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AOS from 'aos';

gsap.registerPlugin(ScrollTrigger);

// ============================================================
// SCROLL-TRIGGERED ANIMATIONS
// ============================================================

export const initScrollAnimations = () => {
  // Hero section - staggered fade-in
  gsap.from('[data-animate-hero]', {
    scrollTrigger: {
      trigger: '[data-animate-hero]',
      start: 'top 80%',
      toggleActions: 'play none none none'
    },
    opacity: 0,
    y: 40,
    duration: 1,
    stagger: 0.1,
    ease: 'power2.out'
  });

  // Trust bar - count-up numbers
  gsap.from('[data-count-up]', {
    scrollTrigger: {
      trigger: '[data-count-up]',
      start: 'top 85%',
      toggleActions: 'play none none none'
    },
    textContent: 0,
    duration: 2,
    ease: 'power2.out',
    snap: { textContent: 1 }
  });

  // Feature cards - staggered entrance from bottom
  gsap.from('[data-feature-card]', {
    scrollTrigger: {
      trigger: '[data-feature-card]',
      start: 'top 80%'
    },
    opacity: 0,
    y: 50,
    x: -20,
    duration: 0.8,
    stagger: 0.15,
    ease: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  });

  // Portfolio grid - parallax effect on images
  gsap.to('[data-portfolio-image]', {
    scrollTrigger: {
      trigger: '[data-portfolio-image]',
      start: 'top center',
      scrub: 0.5
    },
    y: -50,
    duration: 1,
    ease: 'none'
  });

  // Text reveal animations
  gsap.from('[data-reveal-text]', {
    scrollTrigger: {
      trigger: '[data-reveal-text]',
      start: 'top 85%'
    },
    opacity: 0,
    y: 30,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power2.out'
  });
};

// ============================================================
// BUTTON & INTERACTIVE HOVER EFFECTS
// ============================================================

export const initButtonAnimations = () => {
  // Premium button shine effect
  const buttons = document.querySelectorAll('[data-button-premium]');
  buttons.forEach(button => {
    const shine = document.createElement('span');
    shine.className = 'shine-effect';
    button.appendChild(shine);

    button.addEventListener('mouseenter', () => {
      gsap.fromTo(
        shine,
        { x: '-100%' },
        { x: '100%', duration: 0.6, ease: 'power2.out' }
      );
    });

    button.addEventListener('mousedown', () => {
      gsap.to(button, { scale: 0.95, duration: 0.1 });
    });

    button.addEventListener('mouseup', () => {
      gsap.to(button, { scale: 1, duration: 0.2, ease: 'elastic.out(1, 0.3)' });
    });
  });
};

// ============================================================
// PARALLAX SCROLL EFFECTS
// ============================================================

export const initParallaxHero = () => {
  const hero = document.querySelector('[data-parallax-hero]');
  if (!hero) return;

  gsap.to('[data-parallax-image]', {
    scrollTrigger: {
      trigger: '[data-parallax-hero]',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
      markers: false
    },
    y: 200,
    ease: 'none'
  });
};

// ============================================================
// STAGGERED LIST ANIMATIONS
// ============================================================

export const initListAnimations = () => {
  gsap.from('[data-list-item]', {
    scrollTrigger: {
      trigger: '[data-list-container]',
      start: 'top 80%'
    },
    opacity: 0,
    x: -20,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power2.out'
  });
};

// ============================================================
// TESTIMONIALS ROTATION WITH FADE
// ============================================================

export const initTestimonialAnimations = () => {
  const testimonials = document.querySelectorAll('[data-testimonial]');
  if (testimonials.length === 0) return;

  let current = 0;
  const rotateTestimonials = () => {
    gsap.to(testimonials[current], {
      opacity: 0,
      duration: 0.5,
      pointerEvents: 'none'
    });

    current = (current + 1) % testimonials.length;

    gsap.to(testimonials[current], {
      opacity: 1,
      duration: 0.5,
      pointerEvents: 'auto'
    });

    setTimeout(rotateTestimonials, 5000);
  };

  setInterval(rotateTestimonials, 7000);
};

// ============================================================
// SCROLL PROGRESS BAR
// ============================================================

export const initScrollProgressBar = () => {
  const progressBar = document.querySelector('[data-scroll-progress]');
  if (!progressBar) return;

  gsap.to(progressBar, {
    scaleX: 1,
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      markers: false
    },
    transformOrigin: '0% 50%',
    ease: 'none'
  });
};

// ============================================================
// INITIALIZE ALL ANIMATIONS
// ============================================================

export const initAllAnimations = () => {
  // Initialize AOS for simpler animations
  AOS.init({
    duration: 800,
    offset: 100,
    once: true,
    easing: 'ease-in-out-cubic'
  });

  // Initialize premium GSAP animations
  initScrollAnimations();
  initButtonAnimations();
  initParallaxHero();
  initListAnimations();
  initTestimonialAnimations();
  initScrollProgressBar();

  console.log('✓ Premium animations initialized');
};

// Auto-init on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnimations);
} else {
  initAllAnimations();
}
