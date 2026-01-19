/**
 * Premium Carousel/Slider using Swiper
 * Perfect for testimonials, portfolio, process steps
 */

import { Swiper, Navigation, Pagination, Autoplay, EffectFade } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

Swiper.use([Navigation, Pagination, Autoplay, EffectFade]);

export class PremiumCarousel {
  constructor(selector = '.premium-carousel') {
    this.container = document.querySelector(selector);
    if (!this.container) return;

    this.initSwiper();
  }

  initSwiper() {
    new Swiper(this.container, {
      modules: [Navigation, Pagination, Autoplay, EffectFade],
      
      // Slide settings
      slidesPerView: 1,
      spaceBetween: 20,
      
      // Responsive breakpoints
      breakpoints: {
        640: {
          slidesPerView: 2,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 3,
          spaceBetween: 30,
        },
      },

      // Navigation
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // Pagination
      pagination: {
        el: '.swiper-pagination',
        type: 'bullets',
        clickable: true,
        dynamicBullets: true,
      },

      // Autoplay
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },

      // Effects
      effect: 'slide',
      fadeEffect: {
        crossFade: true,
      },

      // Animation
      speed: 800,
      easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',

      // Accessibility
      keyboard: {
        enabled: true,
        onlyInViewport: true,
      },

      // Callbacks
      on: {
        init: (swiper) => {
          this.updateSlideHeight(swiper);
        },
        slideChange: (swiper) => {
          this.onSlideChange(swiper);
        },
        resize: (swiper) => {
          this.updateSlideHeight(swiper);
        },
      },

      // A11y
      a11y: {
        enabled: true,
        notificationClass: 'swiper-notification',
      },
    });
  }

  updateSlideHeight(swiper) {
    // Make all slides same height
    const slides = swiper.slides;
    let maxHeight = 0;

    slides.forEach(slide => {
      slide.style.height = 'auto';
      maxHeight = Math.max(maxHeight, slide.offsetHeight);
    });

    slides.forEach(slide => {
      slide.style.height = `${maxHeight}px`;
    });
  }

  onSlideChange(swiper) {
    // Add/remove active class for animations
    swiper.slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === swiper.activeIndex);
    });
  }
}

// Auto-initialize testimonials carousel
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new PremiumCarousel('.testimonials-carousel');
    new PremiumCarousel('.portfolio-carousel');
  });
} else {
  new PremiumCarousel('.testimonials-carousel');
  new PremiumCarousel('.portfolio-carousel');
}

export default PremiumCarousel;
