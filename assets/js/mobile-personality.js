/**
 * Mobile App Personality - Delightful Micro-Interactions
 * Premium craftsmanship + playful details + conversion focus
 */

class MobilePersonality {
  constructor() {
    this.init();
  }

  init() {
    this.addDelightfulDetails();
    this.addPersuasiveElements();
    this.addPremiumTouches();
    this.addPlayfulEasterEggs();
  }

  /**
   * Delightful Micro-Interactions
   * Little moments that make users smile
   */
  addDelightfulDetails() {
    // Success confetti on form submission
    this.addSuccessConfetti();
    
    // Animated emoji reactions
    this.addEmojiReactions();
    
    // Playful loading messages
    this.addLoadingPersonality();
    
    // Celebrate milestones
    this.addMilestoneToasts();
  }

  addSuccessConfetti() {
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form')) {
        setTimeout(() => {
          this.throwConfetti();
          this.showSuccessToast('🎉 Amazing! We\'ll get back to you faster than you can say "perfectly level tile"!');
          
          if (window.haptics) {
            window.haptics.trigger('success');
          }
        }, 500);
      }
    });
  }

  throwConfetti() {
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.animationDuration = Math.random() * 2 + 2 + 's';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 4000);
    }
  }

  addEmojiReactions() {
    // Portfolio image reactions - tap to appreciate
    const images = document.querySelectorAll('.portfolio-item img, .gallery-item img');
    
    images.forEach(img => {
      let tapCount = 0;
      let tapTimer;

      img.addEventListener('click', (e) => {
        tapCount++;
        clearTimeout(tapTimer);

        if (tapCount === 2) {
          // Double-tap = heart reaction
          this.showEmojiReaction(e.clientX, e.clientY, '❤️');
          if (window.haptics) window.haptics.trigger('medium');
          tapCount = 0;
        } else {
          tapTimer = setTimeout(() => {
            tapCount = 0;
          }, 300);
        }
      });
    });
  }

  showEmojiReaction(x, y, emoji) {
    const reaction = document.createElement('div');
    reaction.className = 'emoji-reaction';
    reaction.textContent = emoji;
    reaction.style.left = x + 'px';
    reaction.style.top = y + 'px';
    
    document.body.appendChild(reaction);
    
    setTimeout(() => reaction.remove(), 1000);
  }

  addLoadingPersonality() {
    const messages = [
      "🔨 Crafting the perfect experience...",
      "🏗️ Building something amazing...",
      "✨ Making magic happen...",
      "🎯 Laser-leveling this page...",
      "🧩 Setting tiles perfectly in place...",
      "💎 Polishing to perfection...",
      "🚀 Almost there, faster than grouting!"
    ];

    // Replace generic loading messages
    const originalShowTransition = window.MobileAppFeatures?.prototype?.showPageTransition;
    if (originalShowTransition) {
      window.MobileAppFeatures.prototype.showPageTransition = function() {
        const overlay = document.createElement('div');
        overlay.className = 'page-transition-overlay';
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        overlay.innerHTML = `
          <div class="page-transition-spinner">
            <div class="loading-message">${randomMessage}</div>
            <div class="dot-loader">
              <span></span><span></span><span></span>
            </div>
          </div>
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
          if (overlay.parentNode) {
            overlay.classList.add('fade-out');
            setTimeout(() => overlay.remove(), 300);
          }
        }, 5000);
      };
    }
  }

  addMilestoneToasts() {
    // Celebrate when user explores multiple pages
    const visited = new Set(JSON.parse(localStorage.getItem('tillerstead-visited-pages') || '[]'));
    visited.add(window.location.pathname);
    localStorage.setItem('tillerstead-visited-pages', JSON.stringify([...visited]));

    const milestones = {
      3: { emoji: '🎯', message: 'Explorer! You\'ve checked out 3 pages. Like what you see?' },
      5: { emoji: '🌟', message: 'Wow! 5 pages visited. You\'re serious about quality tile work!' },
      10: { emoji: '🏆', message: 'Champion browser! Ready to start your project?' }
    };

    if (milestones[visited.size]) {
      setTimeout(() => {
        this.showMilestoneToast(milestones[visited.size]);
      }, 2000);
    }
  }

  showMilestoneToast({ emoji, message }) {
    const toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = `
      <span class="milestone-emoji">${emoji}</span>
      <span class="milestone-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    if (window.haptics) {
      window.haptics.trigger('success');
    }
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Persuasive Elements
   * Subtle conversion optimization
   */
  addPersuasiveElements() {
    // Social proof pulses
    this.addSocialProofPulse();
    
    // Urgency indicators (non-manipulative)
    this.addAvailabilityIndicator();
    
    // Trust signals
    this.addTrustBadges();
    
    // Smooth CTA progression
    this.addProgressiveCTAs();
  }

  addSocialProofPulse() {
    // Subtle pulse on 5-star reviews
    const reviews = document.querySelectorAll('[data-review], .review-card, .testimonial-card');
    
    reviews.forEach((review, index) => {
      setTimeout(() => {
        review.classList.add('social-proof-pulse');
        setTimeout(() => review.classList.remove('social-proof-pulse'), 1000);
      }, index * 2000);
    });
  }

  addAvailabilityIndicator() {
    // Show current availability (honest, not fake scarcity)
    const now = new Date();
    const month = now.toLocaleDateString('en-US', { month: 'long' });
    
    const indicator = document.createElement('div');
    indicator.className = 'availability-indicator';
    indicator.innerHTML = `
      <span class="availability-dot"></span>
      <span class="availability-text">Scheduling ${month} projects now</span>
    `;
    
    const fab = document.querySelector('.mobile-fab');
    if (fab) {
      fab.insertAdjacentElement('beforebegin', indicator);
    }
  }

  addTrustBadges() {
    // Floating trust badge on scroll
    let scrollProgress = 0;
    
    window.addEventListener('scroll', () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = (window.scrollY / docHeight) * 100;
      
      // Show trust badge after 50% scroll
      if (scrollProgress > 50 && !document.querySelector('.trust-badge-float')) {
        this.showFloatingTrustBadge();
      }
    }, { passive: true });
  }

  showFloatingTrustBadge() {
    const badge = document.createElement('div');
    badge.className = 'trust-badge-float';
    badge.innerHTML = `
      <div class="trust-badge-content">
        <span class="trust-badge-icon">✓</span>
        <div class="trust-badge-text">
          <strong>Licensed & Insured</strong>
          <small>NJ HIC #13VH10808800</small>
        </div>
      </div>
    `;
    
    document.body.appendChild(badge);
    
    setTimeout(() => badge.classList.add('show'), 100);
  }

  addProgressiveCTAs() {
    // Different CTAs based on scroll depth
    const ctaMessages = [
      { threshold: 0, text: 'Get Free Quote', icon: '✉' },
      { threshold: 30, text: 'See Our Work', icon: '🖼️' },
      { threshold: 60, text: 'Ready to Start?', icon: '🚀' },
      { threshold: 90, text: 'Let\'s Talk!', icon: '💬' }
    ];

    let currentCTA = 0;
    
    window.addEventListener('scroll', () => {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      
      for (let i = ctaMessages.length - 1; i >= 0; i--) {
        if (scrollPercent >= ctaMessages[i].threshold && currentCTA !== i) {
          currentCTA = i;
          this.updateFABMessage(ctaMessages[i]);
          break;
        }
      }
    }, { passive: true });
  }

  updateFABMessage({ text, icon }) {
    const fab = document.querySelector('.mobile-fab');
    if (!fab) return;

    const fabIcon = fab.querySelector('.fab-icon');
    const fabLabel = fab.querySelector('.fab-label');
    
    if (fabIcon) fabIcon.textContent = icon;
    if (fabLabel) {
      fabLabel.classList.add('updating');
      setTimeout(() => {
        fabLabel.textContent = text;
        fabLabel.classList.remove('updating');
      }, 150);
    }
  }

  /**
   * Premium Touches
   * High-end details that signal quality
   */
  addPremiumTouches() {
    // Smooth parallax on hero
    this.addParallaxEffect();
    
    // Premium button sounds (subtle)
    this.addSoundEffects();
    
    // Elegant transitions
    this.addPremiumTransitions();
    
    // Quality indicators
    this.addQualitySignals();
  }

  addParallaxEffect() {
    const hero = document.querySelector('.hero, [class*="hero"]');
    if (!hero) return;

    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          hero.style.transform = `translateY(${scrolled * 0.5}px)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  addSoundEffects() {
    // Subtle UI sounds (very quiet, premium feel)
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const playTone = (frequency, duration) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.02, audioContext.currentTime); // Very quiet
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    // Success sound
    document.addEventListener('submit', () => {
      playTone(523.25, 0.1); // C5
      setTimeout(() => playTone(659.25, 0.1), 100); // E5
      setTimeout(() => playTone(783.99, 0.15), 200); // G5
    });

    // Navigation sound
    document.addEventListener('click', (e) => {
      if (e.target.closest('.mobile-nav-item')) {
        playTone(440, 0.05); // A4 - very brief
      }
    });
  }

  addPremiumTransitions() {
    // Add class to body for premium animations
    document.body.classList.add('premium-mode');
    
    // Stagger animations on scroll into view
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('premium-fade-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.card, .service-card, .portfolio-item').forEach(el => {
      observer.observe(el);
    });
  }

  addQualitySignals() {
    // Add subtle "quality" badge on hover
    const portfolioItems = document.querySelectorAll('.portfolio-item, .gallery-item');
    
    portfolioItems.forEach(item => {
      const badge = document.createElement('div');
      badge.className = 'quality-badge';
      badge.innerHTML = '✨ TCNA Certified';
      badge.style.opacity = '0';
      
      item.appendChild(badge);
      
      item.addEventListener('mouseenter', () => {
        badge.style.opacity = '1';
      });
      
      item.addEventListener('mouseleave', () => {
        badge.style.opacity = '0';
      });
    });
  }

  /**
   * Playful Easter Eggs
   * Hidden delights for engaged users
   */
  addPlayfulEasterEggs() {
    // Konami code = special message
    this.addKonamiCode();
    
    // Shake device = surprise
    this.addShakeToSurprise();
    
    // Triple-tap logo = fun animation
    this.addLogoEasterEgg();
  }

  addKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        
        if (konamiIndex === konamiCode.length) {
          this.activateKonami();
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    });
  }

  activateKonami() {
    const message = document.createElement('div');
    message.className = 'konami-message';
    message.innerHTML = `
      <h2>🎮 You found the secret!</h2>
      <p>You're as detail-oriented as we are with tile work! 🏆</p>
      <p>Want 5% off? Use code: <strong>KONAMI5</strong></p>
    `;
    
    document.body.appendChild(message);
    
    this.throwConfetti();
    
    if (window.haptics) {
      window.haptics.trigger('notification');
    }
    
    setTimeout(() => {
      message.classList.add('show');
    }, 100);
    
    message.addEventListener('click', () => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    });
  }

  addShakeToSurprise() {
    if (!window.DeviceMotionEvent) return;

    let lastX, lastY, lastZ;
    let shakeCount = 0;
    let shakeTimer;

    window.addEventListener('devicemotion', (e) => {
      const acc = e.accelerationIncludingGravity;
      
      if (lastX !== undefined) {
        const deltaX = Math.abs(acc.x - lastX);
        const deltaY = Math.abs(acc.y - lastY);
        const deltaZ = Math.abs(acc.z - lastZ);
        
        if (deltaX + deltaY + deltaZ > 30) {
          shakeCount++;
          
          clearTimeout(shakeTimer);
          shakeTimer = setTimeout(() => {
            shakeCount = 0;
          }, 1000);
          
          if (shakeCount >= 3) {
            this.showShakeSurprise();
            shakeCount = 0;
          }
        }
      }
      
      lastX = acc.x;
      lastY = acc.y;
      lastZ = acc.z;
    });
  }

  showShakeSurprise() {
    const surprises = [
      { emoji: '🎲', message: 'Whoa! Easy on the device!', cta: 'We handle tiles more gently 😄' },
      { emoji: '🌪️', message: 'Shake detected!', cta: 'Our tile work stays steady even in earthquakes!' },
      { emoji: '🎪', message: 'Fun mode activated!', cta: 'Professional work, playful spirit!' }
    ];
    
    const surprise = surprises[Math.floor(Math.random() * surprises.length)];
    this.showSuccessToast(`${surprise.emoji} ${surprise.message} ${surprise.cta}`);
    
    if (window.haptics) {
      window.haptics.trigger('heavy');
    }
  }

  addLogoEasterEgg() {
    const logo = document.querySelector('[data-logo], .site-logo, .logo');
    if (!logo) return;

    let tapCount = 0;
    let tapTimer;

    logo.addEventListener('click', (e) => {
      e.preventDefault();
      tapCount++;
      
      clearTimeout(tapTimer);
      
      if (tapCount === 3) {
        this.activateLogoAnimation();
        tapCount = 0;
      } else {
        tapTimer = setTimeout(() => {
          tapCount = 0;
        }, 500);
      }
    });
  }

  activateLogoAnimation() {
    const logo = document.querySelector('[data-logo], .site-logo, .logo');
    if (!logo) return;

    logo.classList.add('logo-party');
    
    if (window.haptics) {
      window.haptics.trigger('success');
    }
    
    setTimeout(() => {
      logo.classList.remove('logo-party');
    }, 2000);
  }

  showSuccessToast(message) {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast success-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Initialize personality features
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobilePersonality = new MobilePersonality();
  });
} else {
  window.mobilePersonality = new MobilePersonality();
}

export default MobilePersonality;
