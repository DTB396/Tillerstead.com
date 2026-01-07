/**
 * Testimonial Read More Functionality
 * Handles expanding/collapsing long testimonials to maintain layout
 */

(function () {
  'use strict';

  function initReadMore() {
    const readMoreButtons = document.querySelectorAll(
      '.ts-testimonial__read-more',
    );

    readMoreButtons.forEach((button) => {
      button.addEventListener('click', function (e) {
        e.preventDefault();

        const testimonial = this.closest('.ts-testimonial');
        const preview = testimonial.querySelector(
          '.ts-testimonial__quote-preview',
        );
        const full = testimonial.querySelector('.ts-testimonial__quote-full');
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          // Collapse
          preview.style.display = 'block';
          full.style.display = 'none';
          this.setAttribute('aria-expanded', 'false');
          this.querySelector('.ts-testimonial__read-more-text').textContent =
            'Read more';
        } else {
          // Expand
          preview.style.display = 'none';
          full.style.display = 'block';
          this.setAttribute('aria-expanded', 'true');
          this.querySelector('.ts-testimonial__read-more-text').textContent =
            'Show less';
        }
      });
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReadMore);
  } else {
    initReadMore();
  }
})();
