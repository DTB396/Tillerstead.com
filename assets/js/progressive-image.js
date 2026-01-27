/**
 * Progressive Image Enhancement
 * LQIP (Low Quality Image Placeholder) with blur-up technique
 * Medium/Unsplash/Next.js Image pattern
 */

class ProgressiveImage {
  constructor() {
    this.init();
  }

  init() {
    // Setup progressive images on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupImages());
    } else {
      this.setupImages();
    }
  }

  /**
   * Setup all progressive images
   * HTML structure expected:
   * <div class="progressive-image" data-src="full.jpg" data-placeholder="thumb.jpg">
   *   <img src="thumb.jpg" class="progressive-image__placeholder" alt="" />
   * </div>
   */
  setupImages() {
    const containers = document.querySelectorAll('.progressive-image[data-src]');
    
    containers.forEach(container => {
      const fullSrc = container.dataset.src;
      const placeholder = container.querySelector('.progressive-image__placeholder');
      
      if (!placeholder) return;

      // Apply blur to placeholder
      placeholder.style.filter = 'blur(20px)';
      placeholder.style.transform = 'scale(1.05)'; // Prevent blur edge artifacts
      placeholder.style.transition = 'filter 0.6s ease, transform 0.6s ease';
      
      // Load full resolution image
      this.loadImage(fullSrc, (img) => {
        // Create full-size image element
        const fullImage = document.createElement('img');
        fullImage.src = fullSrc;
        fullImage.alt = placeholder.alt || '';
        fullImage.className = 'progressive-image__full';
        fullImage.style.opacity = '0';
        fullImage.style.transition = 'opacity 0.6s ease';
        
        // Insert full image
        container.appendChild(fullImage);
        
        // Trigger fade in after a frame
        requestAnimationFrame(() => {
          fullImage.style.opacity = '1';
          
          // Remove blur from placeholder and fade it out
          setTimeout(() => {
            placeholder.style.filter = 'blur(0)';
            placeholder.style.transform = 'scale(1)';
            placeholder.style.opacity = '0';
            
            // Remove placeholder after transition
            setTimeout(() => {
              placeholder.remove();
              container.classList.add('progressive-image--loaded');
            }, 600);
          }, 100);
        });
      });
    });
  }

  /**
   * Load an image and call callback when ready
   */
  loadImage(src, callback) {
    const img = new Image();
    
    img.onload = () => {
      if (callback) callback(img);
    };
    
    img.onerror = () => {
      console.warn(`Failed to load image: ${src}`);
    };
    
    img.src = src;
  }

  /**
   * Generate a tiny base64 placeholder (for inline use)
   * Usage: <img src="data:image/svg+xml,..." data-src="full.jpg" />
   */
  static generatePlaceholderSVG(width, height, color = '#f0f0f0') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="${width}" height="${height}" fill="${color}"/>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Lazy load images with Intersection Observer
   * More performant than loading all images immediately
   */
  setupLazyProgressive() {
    if (!('IntersectionObserver' in window)) {
      // Fallback: load all images immediately
      this.setupImages();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const container = entry.target;
          const fullSrc = container.dataset.src;
          const placeholder = container.querySelector('.progressive-image__placeholder');
          
          if (!placeholder || !fullSrc) return;

          // Apply blur
          placeholder.style.filter = 'blur(20px)';
          placeholder.style.transform = 'scale(1.05)';
          
          // Load full image
          this.loadImage(fullSrc, () => {
            const fullImage = document.createElement('img');
            fullImage.src = fullSrc;
            fullImage.alt = placeholder.alt || '';
            fullImage.className = 'progressive-image__full';
            fullImage.style.opacity = '0';
            fullImage.style.transition = 'opacity 0.6s ease';
            
            container.appendChild(fullImage);
            
            requestAnimationFrame(() => {
              fullImage.style.opacity = '1';
              
              setTimeout(() => {
                placeholder.style.opacity = '0';
                setTimeout(() => placeholder.remove(), 600);
              }, 100);
            });
          });
          
          observer.unobserve(container);
        }
      });
    }, {
      rootMargin: '50px', // Start loading slightly before image enters viewport
      threshold: 0.01
    });

    const containers = document.querySelectorAll('.progressive-image[data-src]');
    containers.forEach(container => observer.observe(container));
  }
}

// CSS for progressive images (inline for better performance)
const styles = document.createElement('style');
styles.textContent = `
  .progressive-image {
    position: relative;
    overflow: hidden;
    display: block;
    background-color: #f0f0f0;
  }
  
  .progressive-image__placeholder,
  .progressive-image__full {
    display: block;
    width: 100%;
    height: auto;
  }
  
  .progressive-image__placeholder {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .progressive-image__full {
    position: relative;
    z-index: 1;
  }
  
  /* Reduce motion support */
  @media (prefers-reduced-motion: reduce) {
    .progressive-image__placeholder,
    .progressive-image__full {
      transition: none !important;
      filter: none !important;
    }
  }
`;
document.head.appendChild(styles);

// Initialize
if (typeof window !== 'undefined') {
  window.ProgressiveImage = ProgressiveImage;
  
  // Auto-init with lazy loading for better performance
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const progressive = new ProgressiveImage();
      progressive.setupLazyProgressive();
    });
  } else {
    const progressive = new ProgressiveImage();
    progressive.setupLazyProgressive();
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ProgressiveImage;
}
