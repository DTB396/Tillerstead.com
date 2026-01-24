/**
 * API Configuration for Tillerstead Site
 * Centralized API endpoint configuration for Railway backend
 */

const API_CONFIG = {
  // Railway backend URL - Update after deploying to Railway
  baseUrl: process.env.API_URL || 'http://localhost:8000',
  
  endpoints: {
    jobs: '/api/jobs',
    rooms: '/api/rooms',
    calculators: '/api/calculators',
    products: '/api/products',
    imports: '/api/imports',
    exports: '/api/exports',
    settings: '/api/settings'
  },
  
  // Helper to build full URL
  getUrl: function(endpoint) {
    return `${this.baseUrl}${this.endpoints[endpoint] || endpoint}`;
  }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
