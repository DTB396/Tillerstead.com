/**
 * PWA Features - Install Prompt, Push Notifications, Background Sync
 * Tillerstead.com Progressive Web App Enhancements
 */

class PWAFeatures {
  constructor() {
    this.deferredPrompt = null;
    this.init();
  }

  init() {
    this.initInstallPrompt();
    this.initPushNotifications();
    this.initBackgroundSync();
    this.initServiceWorkerUpdates();
    this.initAppBadge();
  }

  /**
   * Custom Install Prompt
   * Better UX than browser default
   */
  initInstallPrompt() {
    // Capture the install prompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    // Track successful installation
    window.addEventListener('appinstalled', () => {
      // console.log('[PWA] App installed successfully'); // AUTO-DISABLED
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      
      if (window.haptics) {
        window.haptics.trigger('success');
      }

      // Track analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_install', {
          event_category: 'engagement',
          event_label: 'app_installed'
        });
      }
    });
  }

  showInstallPrompt() {
    // Don't show if user dismissed before
    if (localStorage.getItem('tillerstead-install-dismissed') === '1') {
      return;
    }

    // Don't show on first visit
    const visitCount = parseInt(localStorage.getItem('tillerstead-visit-count') || '0') + 1;
    localStorage.setItem('tillerstead-visit-count', visitCount.toString());
    
    if (visitCount < 2) return;

    const banner = document.createElement('div');
    banner.className = 'pwa-install-banner';
    banner.innerHTML = `
      <div class="pwa-install-content">
        <div class="pwa-install-icon">📱</div>
        <div class="pwa-install-text">
          <strong>Install Tillerstead App</strong>
          <p>Get quick access to tools and portfolio</p>
        </div>
        <button class="pwa-install-btn" aria-label="Install app">Install</button>
        <button class="pwa-install-close" aria-label="Dismiss install prompt">✕</button>
      </div>
    `;

    document.body.appendChild(banner);

    // Show with animation
    setTimeout(() => banner.classList.add('show'), 100);

    // Install button
    banner.querySelector('.pwa-install-btn').addEventListener('click', async () => {
      if (!this.deferredPrompt) return;

      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      // console.log(`[PWA] User ${outcome} the install prompt`); // AUTO-DISABLED
      this.deferredPrompt = null;
      this.hideInstallPrompt();
    });

    // Close button
    banner.querySelector('.pwa-install-close').addEventListener('click', () => {
      localStorage.setItem('tillerstead-install-dismissed', '1');
      this.hideInstallPrompt();
    });
  }

  hideInstallPrompt() {
    const banner = document.querySelector('.pwa-install-banner');
    if (banner) {
      banner.classList.remove('show');
      setTimeout(() => banner.remove(), 300);
    }
  }

  /**
   * Push Notifications
   * Optional engagement feature
   */
  initPushNotifications() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      return;
    }

    // Check if user has granted permission
    if (Notification.permission === 'granted') {
      this.subscribeToPush();
    }
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // console.log('[PWA] Notification permission granted'); // AUTO-DISABLED
      await this.subscribeToPush();
      return true;
    }

    return false;
  }

  async subscribeToPush() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        // console.log('[PWA] Already subscribed to push'); // AUTO-DISABLED
        return;
      }

      // Subscribe to push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          // Replace with your VAPID public key
          'YOUR_VAPID_PUBLIC_KEY'
        )
      });

      // console.log('[PWA] Push subscription created:', subscription); // AUTO-DISABLED
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
    } catch (error) {
      console.error('[PWA] Failed to subscribe to push:', error);
    }
  }

  async sendSubscriptionToServer(subscription) {
    // TODO: Implement server endpoint
    // console.log('[PWA] Would send subscription to server:', subscription); // AUTO-DISABLED
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  /**
   * Background Sync
   * Offline form submission
   */
  initBackgroundSync() {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      // console.log('[PWA] Background sync not supported'); // AUTO-DISABLED
      return;
    }

    // Intercept form submissions
    document.addEventListener('submit', (e) => {
      const form = e.target;
      
      // Only handle contact forms
      if (!form.matches('#contact-form, .contact-form')) {
        return;
      }

      if (!navigator.onLine) {
        e.preventDefault();
        this.queueFormSubmission(form);
      }
    });
  }

  async queueFormSubmission(form) {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Store form data
    const queue = JSON.parse(localStorage.getItem('tillerstead-form-queue') || '[]');
    queue.push({
      timestamp: Date.now(),
      data
    });
    localStorage.setItem('tillerstead-form-queue', JSON.stringify(queue));

    // Register sync
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('form-sync');
      
      this.showOfflineMessage('Your message will be sent when you\'re back online');
      
      if (window.haptics) {
        window.haptics.trigger('success');
      }
    } catch (error) {
      console.error('[PWA] Background sync registration failed:', error);
      this.showOfflineMessage('Please try again when you\'re back online');
    }
  }

  showOfflineMessage(message) {
    const toast = document.createElement('div');
    toast.className = 'pwa-toast';
    toast.textContent = message;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /**
   * Service Worker Updates
   * Notify user of new version
   */
  initServiceWorkerUpdates() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.showUpdateNotification();
    });

    // Check for updates periodically
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg) reg.update();
      });
    }, 60000); // Check every minute
  }

  showUpdateNotification() {
    const banner = document.createElement('div');
    banner.className = 'pwa-update-banner';
    banner.innerHTML = `
      <div class="pwa-update-content">
        <span>🎉 New version available!</span>
        <button class="pwa-update-btn">Refresh</button>
      </div>
    `;

    document.body.appendChild(banner);
    setTimeout(() => banner.classList.add('show'), 100);

    banner.querySelector('.pwa-update-btn').addEventListener('click', () => {
      window.location.reload();
    });
  }

  /**
   * App Badge API
   * Notification indicators
   */
  initAppBadge() {
    if (!('setAppBadge' in navigator)) {
      // console.log('[PWA] App Badge API not supported'); // AUTO-DISABLED
      return;
    }

    // Example: Set badge when there are unread notifications
    this.updateAppBadge(0);
  }

  async updateAppBadge(count) {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pwaFeatures = new PWAFeatures();
  });
} else {
  window.pwaFeatures = new PWAFeatures();
}

PWAFeatures;
