/**
 * System Health Dashboard Frontend
 */

let autoRefreshInterval = null;

// ==
// INITIALIZATION
// ==

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await refreshMetrics();
  setupAutoRefresh();
});

// ==
// AUTHENTICATION
// ==

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check');
    if (!response.ok) {
      window.location.href = '/login.html';
    }
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// ==
// LOAD METRICS
// ==

async function refreshMetrics() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    updateHealthStatus(data.health);
    updateCurrentMetrics(data.metrics);
    updatePerformanceMetrics(data.performance);
    updateSystemInfo(data.system);
  } catch (error) {
    console.error('Failed to load metrics:', error);
  }
}

function updateHealthStatus(health) {
  const statusEl = document.getElementById('health-status');
  
  statusEl.className = `health-status ${health.status}`;
  
  const statusText = {
    healthy: 'All Systems Operational',
    warning: 'Performance Degraded',
    critical: 'Critical Issues Detected'
  };

  let text = statusText[health.status] || 'Unknown Status';
  
  if (health.issues && health.issues.length > 0) {
    text += ': ' + health.issues.join(', ');
  }

  statusEl.innerHTML = `<span>●</span><span>${text}</span>`;
}

function updateCurrentMetrics(metrics) {
  // CPU
  const cpuUsage = metrics.cpu?.usage?.toFixed(1) || 0;
  document.getElementById('cpu-usage').textContent = cpuUsage + '%';
  updateProgressBar('cpu-progress', cpuUsage);

  // Memory
  const memUsage = metrics.memory?.usage?.toFixed(1) || 0;
  document.getElementById('memory-usage').textContent = memUsage + '%';
  updateProgressBar('memory-progress', memUsage);

  // Uptime
  const uptimeHours = (metrics.uptime / 3600).toFixed(1);
  document.getElementById('uptime').textContent = uptimeHours;

  // Requests
  document.getElementById('request-count').textContent = 
    (metrics.requests?.total || 0).toLocaleString();
}

function updatePerformanceMetrics(performance) {
  document.getElementById('avg-response').textContent = 
    performance.avgResponseTime || '—';
  
  document.getElementById('requests-per-min').textContent = 
    performance.requestsPerMinute || 0;
  
  document.getElementById('error-rate').textContent = 
    (performance.errorRate || 0) + '%';
  
  document.getElementById('max-response').textContent = 
    performance.maxResponseTime || '—';
}

function updateSystemInfo(system) {
  document.getElementById('platform').textContent = 
    system.platform || '—';
  
  document.getElementById('architecture').textContent = 
    system.architecture || '—';
  
  document.getElementById('node-version').textContent = 
    system.nodeVersion || '—';
  
  document.getElementById('cpu-count').textContent = 
    system.cpuCount || '—';
  
  document.getElementById('total-memory').textContent = 
    formatBytes(system.totalMemory);
  
  document.getElementById('free-memory').textContent = 
    formatBytes(system.freeMemory);
  
  document.getElementById('process-uptime').textContent = 
    formatUptime(system.processUptime);
}

function updateProgressBar(id, value) {
  const el = document.getElementById(id);
  el.style.width = value + '%';
  
  // Color based on value
  el.className = 'progress-fill';
  if (value > 90) {
    el.classList.add('critical');
  } else if (value > 70) {
    el.classList.add('warning');
  }
}

// ==
// AUTO REFRESH
// ==

function setupAutoRefresh() {
  const checkbox = document.getElementById('auto-refresh');
  
  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }
  });

  // Start initially
  startAutoRefresh();
}

function startAutoRefresh() {
  stopAutoRefresh();
  autoRefreshInterval = setInterval(refreshMetrics, 30000); // 30 seconds
}

function stopAutoRefresh() {
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
    autoRefreshInterval = null;
  }
}

// ==
// UTILITIES
// ==

function formatBytes(bytes) {
  if (!bytes) return '—';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

function formatUptime(seconds) {
  if (!seconds) return '—';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  
  return parts.join(' ') || '< 1m';
}
