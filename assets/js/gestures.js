/**
 * Advanced Gestures - Swipe, Pinch, Long-Press, Web Share
 * Tillerstead.com Mobile Interaction Enhancement
 */

class GestureHandler {
  constructor() {
    this.init();
  }

  init() {
    this.initSwipeNavigation();
    this.initLongPress();
    this.initPinchZoom();
    this.initWebShare();
  }

  /**
   * Swipe Navigation for Portfolio
   */
  initSwipeNavigation() {
    const portfolioImages = document.querySelectorAll('.portfolio-item, .gallery-item');
    
    portfolioImages.forEach(item => {
      let startX = 0;
      let startY = 0;
      let moving = false;

      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        moving = true;
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        if (!moving) return;

        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const deltaX = currentX - startX;
        const deltaY = currentY - startY;

        // Detect horizontal swipe (ignore if vertical)
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
          e.preventDefault();
        }
      });

      item.addEventListener('touchend', (e) => {
        if (!moving) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - startX;
        const deltaY = endY - startY;

        // Horizontal swipe threshold
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
          if (deltaX > 0) {
            this.navigatePortfolio(item, 'prev');
          } else {
            this.navigatePortfolio(item, 'next');
          }

          if (window.haptics) {
            window.haptics.trigger('swipe');
          }
        }

        moving = false;
      }, { passive: true });
    });
  }

  navigatePortfolio(currentItem, direction) {
    const items = Array.from(document.querySelectorAll('.portfolio-item, .gallery-item'));
    const currentIndex = items.indexOf(currentItem);
    
    let targetIndex;
    if (direction === 'next') {
      targetIndex = (currentIndex + 1) % items.length;
    } else {
      targetIndex = (currentIndex - 1 + items.length) % items.length;
    }

    const targetItem = items[targetIndex];
    if (targetItem) {
      targetItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  /**
   * Long Press Context Menus
   */
  initLongPress() {
    const portfolioItems = document.querySelectorAll('.portfolio-item img, .gallery-item img');
    
    portfolioItems.forEach(item => {
      let pressTimer;
      let startX, startY;

      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        pressTimer = setTimeout(() => {
          this.showContextMenu(item, e.touches[0].clientX, e.touches[0].clientY);
          
          if (window.haptics) {
            window.haptics.trigger('longPress');
          }
        }, 500);
      }, { passive: true });

      item.addEventListener('touchmove', (e) => {
        const moveX = e.touches[0].clientX;
        const moveY = e.touches[0].clientY;
        const distance = Math.sqrt(Math.pow(moveX - startX, 2) + Math.pow(moveY - startY, 2));

        // Cancel if finger moved
        if (distance > 10) {
          clearTimeout(pressTimer);
        }
      }, { passive: true });

      item.addEventListener('touchend', () => {
        clearTimeout(pressTimer);
      }, { passive: true });
    });
  }

  showContextMenu(element, x, y) {
    // Remove existing menu
    const existing = document.querySelector('.gesture-context-menu');
    if (existing) existing.remove();

    const menu = document.createElement('div');
    menu.className = 'gesture-context-menu';
    menu.innerHTML = `
      <button class="context-menu-item" data-action="share">
        <span aria-hidden="true">📤</span> Share
      </button>
      <button class="context-menu-item" data-action="download">
        <span aria-hidden="true">⬇️</span> Download
      </button>
      <button class="context-menu-item" data-action="fullscreen">
        <span aria-hidden="true">🔍</span> View Full Size
      </button>
    `;

    menu.style.position = 'fixed';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    document.body.appendChild(menu);

    // Position adjustment if off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${x - rect.width}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height}px`;
    }

    // Handle actions
    menu.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      
      if (action === 'share') {
        this.shareImage(element);
      } else if (action === 'download') {
        this.downloadImage(element);
      } else if (action === 'fullscreen') {
        this.viewFullscreen(element);
      }

      menu.remove();
    });

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
          menu.remove();
        }
      }, { once: true });
    }, 100);
  }

  /**
   * Pinch to Zoom
   */
  initPinchZoom() {
    const zoomableImages = document.querySelectorAll('.portfolio-item img, .gallery-item img');
    
    zoomableImages.forEach(img => {
      let initialDistance = 0;
      let currentScale = 1;

      img.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          initialDistance = this.getDistance(e.touches[0], e.touches[1]);
          img.style.transition = 'none';
        }
      });

      img.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
          e.preventDefault();
          const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
          const scale = currentDistance / initialDistance;
          currentScale = Math.min(Math.max(scale, 0.5), 3);
          
          img.style.transform = `scale(${currentScale})`;
        }
      });

      img.addEventListener('touchend', (e) => {
        if (e.touches.length === 0) {
          img.style.transition = 'transform 0.3s ease';
          
          // Reset if zoomed out
          if (currentScale < 1) {
            img.style.transform = 'scale(1)';
            currentScale = 1;
          }
        }
      });
    });
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Web Share API
   */
  initWebShare() {
    // Add share buttons to portfolio items
    const shareButtons = document.querySelectorAll('[data-share]');
    
    shareButtons.forEach(button => {
      if (!navigator.share) {
        button.style.display = 'none';
        return;
      }

      button.addEventListener('click', (e) => {
        e.preventDefault();
        const url = button.dataset.shareUrl || window.location.href;
        const title = button.dataset.shareTitle || document.title;
        const text = button.dataset.shareText || '';
        
        this.share({ url, title, text });
      });
    });
  }

  async share(data) {
    if (!navigator.share) {
      // // // // // // // // // // // console.log('[Gestures] Web Share API not supported'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
      return;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });

      // // // // // // // // // // // console.log('[Gestures] Shared successfully'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
      
      if (window.haptics) {
        window.haptics.trigger('success');
      }

      // Track analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'share', {
          method: 'web_share',
          content_type: 'page',
          item_id: data.url
        });
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('[Gestures] Share failed:', error);
      }
    }
  }

  async shareImage(imgElement) {
    const imageUrl = imgElement.src;
    const title = imgElement.alt || 'Tillerstead Portfolio Image';

    try {
      // Fetch the image as blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'tillerstead-portfolio.jpg', { type: blob.type });

      await navigator.share({
        title,
        text: 'Check out this tile installation by Tillerstead',
        files: [file]
      });

      // // // // // // // // // // // console.log('[Gestures] Image shared successfully'); // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED // AUTO-DISABLED
    } catch (error) {
      // Fallback to URL share
      this.share({
        title,
        text: 'Check out this tile installation by Tillerstead',
        url: window.location.href
      });
    }
  }

  downloadImage(imgElement) {
    const link = document.createElement('a');
    link.href = imgElement.src;
    link.download = imgElement.alt || 'tillerstead-image';
    link.click();

    if (window.haptics) {
      window.haptics.trigger('success');
    }
  }

  viewFullscreen(imgElement) {
    if (imgElement.requestFullscreen) {
      imgElement.requestFullscreen();
    } else if (imgElement.webkitRequestFullscreen) {
      imgElement.webkitRequestFullscreen();
    }

    if (window.haptics) {
      window.haptics.trigger('light');
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new GestureHandler();
  });
} else {
  new GestureHandler();
}

GestureHandler;
