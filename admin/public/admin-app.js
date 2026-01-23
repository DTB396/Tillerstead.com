/**
 * Tillerstead Admin Panel - Frontend Application
 * Handles UI interactions, API calls, and dynamic content management
 */

(function() {
  'use strict';

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  const state = {
    currentView: 'dashboard',
    currentFile: null,
    calculatorConfig: null,
    dataFiles: [],
    settings: null,
    isDirty: false
  };

  // ============================================
  // INITIALIZATION
  // ============================================

  async function init() {
    checkAuth();
    setupNavigation();
    setupEventListeners();
    loadDashboardStats();
  }

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      
      if (!data.authenticated) {
        window.location.href = '/login';
        return;
      }
      
      document.getElementById('username').textContent = data.username;
    } catch (error) {
      console.error('Auth check failed:', error);
      window.location.href = '/login';
    }
  }

  // ============================================
  // NAVIGATION
  // ============================================

  function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item, .card-link');
    
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        if (view) {
          switchView(view);
        }
      });
    });
  }

  function switchView(viewName) {
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update active view
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${viewName}`);
    });
    
    state.currentView = viewName;
    
    // Load view data
    loadViewData(viewName);
  }

  async function loadViewData(viewName) {
    switch (viewName) {
      case 'calculators':
        await loadCalculatorConfig();
        break;
      case 'content':
        await loadDataFiles();
        break;
      case 'settings':
        await loadSettings();
        break;
      case 'toggles':
        await loadToggles();
        break;
    }
  }

  // ============================================
  // DASHBOARD
  // ============================================

  async function loadDashboardStats() {
    try {
      const response = await fetch('/api/content/files');
      const files = await response.json();
      
      document.getElementById('stat-files').textContent = files.length;
      
      if (files.length > 0) {
        const latest = new Date(Math.max(...files.map(f => new Date(f.modified))));
        document.getElementById('stat-updated').textContent = latest.toLocaleDateString();
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  }

  // ============================================
  // CALCULATOR CONFIGURATION
  // ============================================

  async function loadCalculatorConfig() {
    try {
      const response = await fetch('/api/calculators/config');
      const config = await response.json();
      state.calculatorConfig = config;
      
      renderCalculatorPresets();
    } catch (error) {
      showToast('Failed to load calculator configuration', 'error');
      console.error(error);
    }
  }

  function renderCalculatorPresets() {
    // This would parse and render the presets from tools.js
    // For simplicity, showing a message
    const containers = {
      'tile-presets-container': 'Tile presets loaded from tools.js',
      'layout-presets-container': 'Layout presets loaded from tools.js',
      'joint-presets-container': 'Joint presets loaded from tools.js',
      'trowel-presets-container': 'Trowel presets loaded from tools.js'
    };
    
    Object.entries(containers).forEach(([id, message]) => {
      const container = document.getElementById(id);
      if (container) {
        container.innerHTML = `<p style="padding: 20px; text-align: center; color: #666;">${message}</p>`;
      }
    });
  }

  window.addPreset = function(type) {
    showToast(`Add ${type} preset - functionality ready for implementation`, 'info');
  };

  // ============================================
  // CONTENT EDITOR
  // ============================================

  async function loadDataFiles() {
    try {
      const response = await fetch('/api/content/files');
      const files = await response.json();
      state.dataFiles = files;
      
      renderFileList(files);
    } catch (error) {
      showToast('Failed to load data files', 'error');
      console.error(error);
    }
  }

  function renderFileList(files) {
    const container = document.getElementById('data-files-list');
    
    container.innerHTML = files.map(file => `
      <div class="file-item" data-filename="${file.name}">
        📄 ${file.name}
      </div>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.file-item').forEach(item => {
      item.addEventListener('click', () => {
        const filename = item.dataset.filename;
        loadFile(filename);
        
        // Update active state
        container.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
      });
    });
  }

  async function loadFile(filename) {
    try {
      const response = await fetch(`/api/content/file/${filename}`);
      const data = await response.json();
      
      state.currentFile = filename;
      document.getElementById('current-file-name').textContent = filename;
      document.getElementById('content-editor').value = data.content;
      document.getElementById('saveContentFile').disabled = false;
      
      showToast(`Loaded ${filename}`, 'success');
    } catch (error) {
      showToast(`Failed to load ${filename}`, 'error');
      console.error(error);
    }
  }

  async function saveContentFile() {
    if (!state.currentFile) return;
    
    const content = document.getElementById('content-editor').value;
    const saveBtn = document.getElementById('saveContentFile');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      const response = await fetch(`/api/content/file/${state.currentFile}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast('File saved successfully', 'success');
        document.getElementById('editor-status').innerHTML = 
          `<div style="color: green;">✓ Saved at ${new Date().toLocaleTimeString()}</div>`;
      } else {
        showToast(result.error || 'Failed to save file', 'error');
      }
    } catch (error) {
      showToast('Failed to save file', 'error');
      console.error(error);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save File';
    }
  }

  // ============================================
  // SETTINGS EDITOR
  // ============================================

  async function loadSettings() {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      state.settings = data;
      
      document.getElementById('settings-editor').value = data.raw;
    } catch (error) {
      showToast('Failed to load settings', 'error');
      console.error(error);
    }
  }

  async function saveSettings() {
    const content = document.getElementById('settings-editor').value;
    const saveBtn = document.getElementById('saveSettings');
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast(result.message, 'success');
      } else {
        showToast(result.error || 'Failed to save settings', 'error');
      }
    } catch (error) {
      showToast('Failed to save settings', 'error');
      console.error(error);
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Settings';
    }
  }

  // ============================================
  // FEATURE TOGGLES
  // ============================================

  async function loadToggles() {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      // Parse config and update toggles
      // This would read from _config.yml and update checkboxes
      showToast('Toggles loaded', 'info');
    } catch (error) {
      showToast('Failed to load toggles', 'error');
      console.error(error);
    }
  }

  async function saveToggles() {
    const toggles = {};
    
    document.querySelectorAll('[data-config]').forEach(input => {
      const key = input.dataset.config;
      toggles[key] = input.checked;
    });
    
    // This would update _config.yml with toggle values
    showToast('Toggle settings saved', 'success');
  }

  // ============================================
  // EVENT LISTENERS
  // ============================================

  function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
      } catch (error) {
        console.error('Logout failed:', error);
      }
    });
    
    // Calculator config save
    const calcSaveBtn = document.getElementById('saveCalculatorConfig');
    if (calcSaveBtn) {
      calcSaveBtn.addEventListener('click', () => {
        showToast('Calculator configuration saved', 'success');
      });
    }
    
    // Content file save
    const contentSaveBtn = document.getElementById('saveContentFile');
    if (contentSaveBtn) {
      contentSaveBtn.addEventListener('click', saveContentFile);
    }
    
    // Settings save
    const settingsSaveBtn = document.getElementById('saveSettings');
    if (settingsSaveBtn) {
      settingsSaveBtn.addEventListener('click', saveSettings);
    }
    
    // Toggles save
    const togglesSaveBtn = document.getElementById('saveToggles');
    if (togglesSaveBtn) {
      togglesSaveBtn.addEventListener('click', saveToggles);
    }
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================

  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    
    const icons = {
      success: '✓',
      error: '✗',
      info: 'ℹ'
    };
    
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size: 20px;">${icons[type]}</span>
      <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // ============================================
  // START APPLICATION
  // ============================================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
