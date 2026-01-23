/**
 * Social Proof & Trust Signals System
 * Real-time activity feed, project counter, review highlights
 */

(function() {
  'use strict';

  // ============================================
  // SOCIAL PROOF SYSTEM
  // ============================================

  class SocialProofSystem {
    constructor() {
      this.activities = [];
      this.projectCount = 0;
      this.reviewCount = 0;
      this.init();
    }

    init() {
      this.setupLiveActivityFeed();
      this.setupProjectCounter();
      this.setupRecentReviews();
      this.setupTrustBadges();
      this.setupRealtimeNotifications();
    }

    // Live Activity Feed
    setupLiveActivityFeed() {
      const activities = [
        { type: 'quote', text: 'John D. just requested a quote', location: 'Atlantic County', time: '3 min ago' },
        { type: 'review', text: 'Sarah M. left a 5-star review', location: 'Ocean County', time: '12 min ago' },
        { type: 'project', text: 'New bathroom project started', location: 'Cape May County', time: '25 min ago' },
        { type: 'quote', text: 'Mike R. used the tile calculator', location: 'Atlantic County', time: '38 min ago' },
        { type: 'completion', text: 'Kitchen renovation completed', location: 'Ocean County', time: '1 hour ago' }
      ];

      this.activities = activities;
      this.startActivityFeed();
    }

    startActivityFeed() {
      const container = document.getElementById('live-activity-feed');
      if (!container) return;

      let currentIndex = 0;

      const showNextActivity = () => {
        const activity = this.activities[currentIndex];
        this.showActivityNotification(activity);
        
        currentIndex = (currentIndex + 1) % this.activities.length;
      };

      // Show first activity after 10 seconds
      setTimeout(showNextActivity, 10000);

      // Show new activity every 45-90 seconds
      setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance
          showNextActivity();
        }
      }, 60000 + Math.random() * 30000);
    }

    showActivityNotification(activity) {
      const notification = document.createElement('div');
      notification.className = 'social-proof-notification';
      notification.innerHTML = `
        <div class="notification-icon">${this.getActivityIcon(activity.type)}</div>
        <div class="notification-content">
          <div class="notification-text">${activity.text}</div>
          <div class="notification-meta">
            <span class="location">📍 ${activity.location}</span>
            <span class="time">⏱️ ${activity.time}</span>
          </div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
      `;

      document.body.appendChild(notification);

      // Animate in
      setTimeout(() => notification.classList.add('show'), 100);

      // Auto-remove after 8 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 8000);
    }

    getActivityIcon(type) {
      const icons = {
        quote: '📋',
        review: '⭐',
        project: '🔨',
        completion: '✅',
        calculator: '🧮'
      };
      return icons[type] || '📌';
    }

    // Animated Project Counter
    setupProjectCounter() {
      const counters = document.querySelectorAll('[data-counter]');
      
      counters.forEach(counter => {
        const target = parseInt(counter.dataset.target);
        const duration = parseInt(counter.dataset.duration) || 2000;
        
        this.animateCounter(counter, target, duration);
      });
    }

    animateCounter(element, target, duration) {
      const start = 0;
      const increment = target / (duration / 16);
      let current = start;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
              } else {
                element.textContent = Math.floor(current).toLocaleString();
              }
            }, 16);
            observer.unobserve(element);
          }
        });
      });

      observer.observe(element);
    }

    // Recent Reviews Carousel
    setupRecentReviews() {
      this.rotateReviews();
    }

    rotateReviews() {
      const carousel = document.getElementById('review-carousel');
      if (!carousel) return;

      const reviews = carousel.querySelectorAll('.review-card');
      if (reviews.length === 0) return;

      let currentReview = 0;

      setInterval(() => {
        reviews[currentReview].classList.remove('active');
        currentReview = (currentReview + 1) % reviews.length;
        reviews[currentReview].classList.add('active');
      }, 6000);
    }

    // Trust Badges
    setupTrustBadges() {
      const badges = [
        { id: 'licensed', icon: '✓', text: 'NJ Licensed HIC', tooltip: 'New Jersey Home Improvement Contractor License' },
        { id: 'insured', icon: '🛡️', text: 'Fully Insured', tooltip: 'Comprehensive liability & workers comp insurance' },
        { id: 'tcna', icon: '📜', text: 'TCNA Compliant', tooltip: 'Work follows TCNA Handbook standards' },
        { id: 'guarantee', icon: '⭐', text: '5-Year Guarantee', tooltip: 'Workmanship guaranteed for 5 years' },
        { id: 'reviews', icon: '💬', text: '50+ 5-Star Reviews', tooltip: 'Rated 5.0 on multiple platforms' }
      ];

      const container = document.getElementById('trust-badges');
      if (container) {
        container.innerHTML = badges.map(badge => `
          <div class="trust-badge" data-tooltip="${badge.tooltip}">
            <span class="badge-icon">${badge.icon}</span>
            <span class="badge-text">${badge.text}</span>
          </div>
        `).join('');
      }
    }

    // Real-time Notifications
    setupRealtimeNotifications() {
      // Simulate real-time updates
      this.showViewerCount();
      this.showRecentActivity();
    }

    showViewerCount() {
      const viewers = 3 + Math.floor(Math.random() * 5); // 3-7 viewers
      const badge = document.getElementById('live-viewers');
      
      if (badge) {
        badge.textContent = `👥 ${viewers} others viewing this page`;
        badge.style.display = 'block';
      }
    }

    showRecentActivity() {
      const activities = [
        'Someone from Atlantic County just requested a quote',
        'A new 5-star review was just posted',
        'Project completed in Ocean County this week',
        '3 people are currently using the tile calculator'
      ];

      const banner = document.getElementById('recent-activity-banner');
      if (!banner) return;

      const activity = activities[Math.floor(Math.random() * activities.length)];
      banner.textContent = activity;
      banner.classList.add('show');

      setTimeout(() => {
        banner.classList.remove('show');
      }, 6000);
    }
  }

  // ============================================
  // BEFORE/AFTER GALLERY ENHANCEMENT
  // ============================================

  class BeforeAfterGallery {
    constructor() {
      this.init();
    }

    init() {
      this.setupImageComparison();
      this.setupGalleryFilters();
      this.setupLightbox();
    }

    setupImageComparison() {
      const comparisons = document.querySelectorAll('.before-after');
      
      comparisons.forEach(container => {
        const slider = container.querySelector('.slider');
        const beforeImage = container.querySelector('.before');
        const afterImage = container.querySelector('.after');

        if (!slider || !beforeImage || !afterImage) return;

        let isDragging = false;

        const updateSlider = (x) => {
          const rect = container.getBoundingClientRect();
          const position = ((x - rect.left) / rect.width) * 100;
          const clampedPosition = Math.max(0, Math.min(100, position));
          
          slider.style.left = `${clampedPosition}%`;
          afterImage.style.clipPath = `inset(0 ${100 - clampedPosition}% 0 0)`;
        };

        slider.addEventListener('mousedown', () => {
          isDragging = true;
        });

        container.addEventListener('mousemove', (e) => {
          if (!isDragging) return;
          updateSlider(e.clientX);
        });

        document.addEventListener('mouseup', () => {
          isDragging = false;
        });

        // Touch support
        slider.addEventListener('touchstart', () => {
          isDragging = true;
        });

        container.addEventListener('touchmove', (e) => {
          if (!isDragging) return;
          updateSlider(e.touches[0].clientX);
        });

        document.addEventListener('touchend', () => {
          isDragging = false;
        });

        // Initialize at 50%
        updateSlider(rect.left + rect.width / 2);
      });
    }

    setupGalleryFilters() {
      const filters = document.querySelectorAll('[data-filter]');
      const items = document.querySelectorAll('[data-category]');

      filters.forEach(filter => {
        filter.addEventListener('click', () => {
          const category = filter.dataset.filter;

          // Update active filter
          filters.forEach(f => f.classList.remove('active'));
          filter.classList.add('active');

          // Filter items
          items.forEach(item => {
            if (category === 'all' || item.dataset.category === category) {
              item.style.display = 'block';
              setTimeout(() => item.classList.add('visible'), 10);
            } else {
              item.classList.remove('visible');
              setTimeout(() => item.style.display = 'none', 300);
            }
          });
        });
      });
    }

    setupLightbox() {
      const galleryImages = document.querySelectorAll('.gallery-item img');
      
      galleryImages.forEach(img => {
        img.addEventListener('click', () => {
          this.openLightbox(img.src, img.alt);
        });
      });
    }

    openLightbox(src, alt) {
      const lightbox = document.createElement('div');
      lightbox.className = 'lightbox';
      lightbox.innerHTML = `
        <div class="lightbox-content">
          <img src="${src}" alt="${alt}">
          <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
      `;
      
      document.body.appendChild(lightbox);
      
      setTimeout(() => lightbox.classList.add('show'), 10);
      
      lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
          lightbox.remove();
        }
      });
    }
  }

  // ============================================
  // APPOINTMENT SCHEDULING SYSTEM
  // ============================================

  class AppointmentScheduler {
    constructor() {
      this.selectedDate = null;
      this.selectedTime = null;
      this.init();
    }

    init() {
      this.setupCalendar();
      this.setupTimeSlots();
      this.setupFormSubmission();
    }

    setupCalendar() {
      const calendar = document.getElementById('appointment-calendar');
      if (!calendar) return;

      const today = new Date();
      const daysToShow = 14; // Show next 2 weeks

      for (let i = 1; i <= daysToShow; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);

        // Skip Sundays
        if (date.getDay() === 0) continue;

        const day = document.createElement('button');
        day.className = 'calendar-day';
        day.dataset.date = date.toISOString().split('T')[0];
        day.innerHTML = `
          <div class="day-name">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
          <div class="day-number">${date.getDate()}</div>
          <div class="day-month">${date.toLocaleDateString('en-US', { month: 'short' })}</div>
        `;

        day.addEventListener('click', () => {
          document.querySelectorAll('.calendar-day').forEach(d => d.classList.remove('selected'));
          day.classList.add('selected');
          this.selectedDate = day.dataset.date;
          this.loadTimeSlots(date);
        });

        calendar.appendChild(day);
      }
    }

    loadTimeSlots(date) {
      const container = document.getElementById('time-slots');
      if (!container) return;

      const slots = this.getAvailableSlots(date);
      
      container.innerHTML = `
        <h4>Available Times for ${date.toLocaleDateString()}</h4>
        <div class="time-slots-grid">
          ${slots.map(slot => `
            <button class="time-slot" data-time="${slot}">
              ${this.formatTime(slot)}
            </button>
          `).join('')}
        </div>
      `;

      // Add click handlers
      container.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('click', () => {
          container.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
          slot.classList.add('selected');
          this.selectedTime = slot.dataset.time;
          this.enableBooking();
        });
      });

      container.style.display = 'block';
    }

    getAvailableSlots(date) {
      // Mock availability - in production, fetch from backend
      const slots = [];
      const startHour = 8;
      const endHour = 17;

      for (let hour = startHour; hour < endHour; hour++) {
        slots.push(`${hour}:00`);
        if (hour < endHour - 1) {
          slots.push(`${hour}:30`);
        }
      }

      // Randomly mark some as unavailable
      return slots.filter(() => Math.random() > 0.3);
    }

    formatTime(time) {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }

    enableBooking() {
      const bookBtn = document.getElementById('book-appointment');
      if (bookBtn) {
        bookBtn.disabled = false;
      }
    }

    setupFormSubmission() {
      const form = document.getElementById('appointment-form');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.bookAppointment(new FormData(form));
      });
    }

    async bookAppointment(formData) {
      const data = Object.fromEntries(formData);
      data.date = this.selectedDate;
      data.time = this.selectedTime;

      try {
        const response = await fetch('/api/appointments/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (response.ok) {
          this.showConfirmation(data);
        }
      } catch (error) {
        console.error('Booking error:', error);
        alert('Failed to book appointment. Please call us directly.');
      }
    }

    showConfirmation(data) {
      const modal = document.getElementById('appointment-confirmation');
      if (modal) {
        modal.querySelector('.confirmation-date').textContent = 
          new Date(data.date).toLocaleDateString();
        modal.querySelector('.confirmation-time').textContent = 
          this.formatTime(data.time);
        modal.classList.add('show');
      }
    }
  }

  // Initialize all systems
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.socialProof = new SocialProofSystem();
      window.beforeAfter = new BeforeAfterGallery();
      window.scheduler = new AppointmentScheduler();
    });
  } else {
    window.socialProof = new SocialProofSystem();
    window.beforeAfter = new BeforeAfterGallery();
    window.scheduler = new AppointmentScheduler();
  }

})();
