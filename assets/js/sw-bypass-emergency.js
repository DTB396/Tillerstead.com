/**
 * EMERGENCY SERVICE WORKER BYPASS
 * Unregisters ALL service workers and prevents re-registration
 * Use this ONLY for emergency mobile debugging
 */

(function() {
  'use strict';
  
  console.log('[EMERGENCY] Service worker bypass script loaded');
  
  // Unregister ALL service workers immediately
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      registrations.forEach(function(registration) {
        console.log('[EMERGENCY] Unregistering service worker:', registration.scope);
        registration.unregister();
      });
    });
    
    // Prevent new registrations
    const originalRegister = navigator.serviceWorker.register;
    navigator.serviceWorker.register = function() {
      console.log('[EMERGENCY] Service worker registration blocked');
      return Promise.reject(new Error('Service worker disabled for emergency debugging'));
    };
  }
  
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[EMERGENCY] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    });
  }
  
  console.log('[EMERGENCY] Service worker bypass complete - page should load fresh assets');
})();
