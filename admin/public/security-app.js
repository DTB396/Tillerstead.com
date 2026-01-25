/**
 * Security Dashboard Frontend
 */

// ==
// STATE
// ==

let currentUser = null;
let auditLogs = [];
let apiKeys = [];

// ==
// INITIALIZATION
// ==

document.addEventListener('DOMContentLoaded', async () => {
  await checkAuth();
  await loadSecurityOverview();
  await loadAuditLogs();
  await check2FAStatus();
  await loadAPIKeys();
  await loadIPFilters();
  await loadRoles();
});

// ==
// AUTHENTICATION
// ==

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check');
    if (!response.ok) {
      window.location.href = '/login.html';
      return;
    }
    const data = await response.json();
    currentUser = data.user;
  } catch (error) {
    window.location.href = '/login.html';
  }
}

// ==
// SECURITY OVERVIEW
// ==

async function loadSecurityOverview() {
  try {
    const response = await fetch('/api/security/overview');
    const data = await response.json();

    // Update stats
    document.getElementById('login-attempts').textContent = data.loginAttempts || 0;
    document.getElementById('failed-logins').textContent = data.failedLogins || 0;
    document.getElementById('active-sessions').textContent = data.activeSessions || 1;
    document.getElementById('api-key-count').textContent = data.apiKeyCount || 0;
    document.getElementById('whitelist-count').textContent = data.whitelistCount || 0;
    document.getElementById('blacklist-count').textContent = data.blacklistCount || 0;
    document.getElementById('high-severity').textContent = data.highSeverity || 0;
    document.getElementById('suspicious-activity').textContent = data.suspicious || 0;
    document.getElementById('blocked-attempts').textContent = data.blocked || 0;
  } catch (error) {
    console.error('Failed to load security overview:', error);
  }
}

// ==
// TWO-FACTOR AUTHENTICATION
// ==

async function check2FAStatus() {
  try {
    const response = await fetch('/api/auth/2fa/status');
    const data = await response.json();

    const statusBadge = document.getElementById('2fa-status');
    const enabledDiv = document.getElementById('2fa-enabled');
    const disabledDiv = document.getElementById('2fa-disabled');

    if (data.enabled) {
      statusBadge.textContent = 'Enabled';
      statusBadge.className = 'status-badge active';
      enabledDiv.style.display = 'block';
      disabledDiv.style.display = 'none';
    } else {
      statusBadge.textContent = 'Disabled';
      statusBadge.className = 'status-badge warning';
      enabledDiv.style.display = 'none';
      disabledDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Failed to check 2FA status:', error);
  }
}

async function setup2FA() {
  try {
    const response = await fetch('/api/auth/2fa/setup', { method: 'POST' });
    const data = await response.json();

    document.getElementById('qr-code').src = data.qrCode;
    document.getElementById('secret-key').textContent = data.secret;
    
    document.getElementById('2fa-modal').classList.add('active');
    document.getElementById('2fa-setup').style.display = 'block';
    document.getElementById('backup-codes-display').style.display = 'none';
  } catch (error) {
    alert('Failed to setup 2FA: ' + error.message);
  }
}

async function verify2FA() {
  const token = document.getElementById('2fa-token').value;

  if (!token || token.length !== 6) {
    alert('Please enter a 6-digit code');
    return;
  }

  try {
    const response = await fetch('/api/auth/2fa/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.error || 'Invalid verification code');
      return;
    }

    // Show backup codes
    displayBackupCodes(data.backupCodes);
    document.getElementById('2fa-setup').style.display = 'none';
    document.getElementById('backup-codes-display').style.display = 'block';

    await check2FAStatus();
    showToast('2FA enabled successfully!', 'success');
  } catch (error) {
    alert('Failed to enable 2FA: ' + error.message);
  }
}

function displayBackupCodes(codes) {
  const container = document.getElementById('backup-codes');
  container.innerHTML = codes.map(code => 
    `<div class="backup-code">${code}</div>`
  ).join('');
}

async function regenerateBackupCodes() {
  const token = prompt('Enter your 2FA code to regenerate backup codes:');
  if (!token) return;

  try {
    const response = await fetch('/api/auth/2fa/regenerate-codes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.error || 'Failed to regenerate codes');
      return;
    }

    displayBackupCodes(data.backupCodes);
    document.getElementById('2fa-modal').classList.add('active');
    document.getElementById('2fa-setup').style.display = 'none';
    document.getElementById('backup-codes-display').style.display = 'block';
  } catch (error) {
    alert('Failed to regenerate backup codes: ' + error.message);
  }
}

async function disable2FA() {
  if (!confirm('Are you sure you want to disable 2FA? This will make your account less secure.')) {
    return;
  }

  const token = prompt('Enter your 2FA code to disable:');
  if (!token) return;

  try {
    const response = await fetch('/api/auth/2fa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (!data.success) {
      alert(data.error || 'Failed to disable 2FA');
      return;
    }

    await check2FAStatus();
    showToast('2FA disabled', 'info');
  } catch (error) {
    alert('Failed to disable 2FA: ' + error.message);
  }
}

function close2FAModal() {
  document.getElementById('2fa-modal').classList.remove('active');
  document.getElementById('2fa-token').value = '';
}

// ==
// AUDIT LOGS
// ==

async function loadAuditLogs(filter = 'all') {
  try {
    const response = await fetch(`/api/security/audit?filter=${filter}`);
    auditLogs = await response.json();
    displayAuditLogs(auditLogs);
  } catch (error) {
    console.error('Failed to load audit logs:', error);
  }
}

function displayAuditLogs(logs) {
  const container = document.getElementById('audit-log');

  if (logs.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #718096;">No audit logs found</p>';
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="audit-entry ${log.severity}">
      <span class="audit-timestamp">${new Date(log.timestamp).toLocaleString()}</span>
      <div class="audit-details">
        <strong>${log.event}</strong> by ${log.user} from ${log.ip}
        ${log.details ? `<br><small>${JSON.stringify(log.details)}</small>` : ''}
      </div>
    </div>
  `).join('');
}

function filterAuditLogs() {
  const filter = document.getElementById('audit-filter').value;
  loadAuditLogs(filter);
}

// ==
// API KEYS
// ==

async function loadAPIKeys() {
  try {
    const response = await fetch('/api/security/api-keys');
    apiKeys = await response.json();
    displayAPIKeys(apiKeys);
  } catch (error) {
    console.error('Failed to load API keys:', error);
  }
}

function displayAPIKeys(keys) {
  const container = document.getElementById('api-keys-list');

  if (keys.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #718096;">No API keys created</p>';
    return;
  }

  container.innerHTML = keys.map(key => `
    <div class="api-key-item">
      <div class="api-key-header">
        <span class="api-key-name">${key.name}</span>
        <button class="btn btn-sm btn-danger" onclick="revokeAPIKey('${key.hash}')">Revoke</button>
      </div>
      <div class="api-key-hash">${key.hash}</div>
      <div class="api-key-stats">
        <span>Created: ${new Date(key.created).toLocaleDateString()}</span>
        <span>Last used: ${key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : 'Never'}</span>
        <span>Usage: ${key.usageCount}</span>
      </div>
    </div>
  `).join('');
}

async function createAPIKey() {
  const name = prompt('Enter a name for this API key:');
  if (!name) return;

  try {
    const response = await fetch('/api/security/api-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, permissions: [] })
    });

    const data = await response.json();

    alert(`API Key created!\n\n${data.key}\n\n⚠️ Save this key now - you won't be able to see it again!`);
    
    await loadAPIKeys();
    await loadSecurityOverview();
  } catch (error) {
    alert('Failed to create API key: ' + error.message);
  }
}

async function revokeAPIKey(hash) {
  if (!confirm('Are you sure you want to revoke this API key?')) {
    return;
  }

  try {
    await fetch(`/api/security/api-keys/${hash}`, {
      method: 'DELETE'
    });

    await loadAPIKeys();
    await loadSecurityOverview();
    showToast('API key revoked', 'success');
  } catch (error) {
    alert('Failed to revoke API key: ' + error.message);
  }
}

// ==
// IP FILTER
// ==

async function loadIPFilters() {
  try {
    const response = await fetch('/api/security/ip-filter');
    const data = await response.json();

    displayIPList('whitelist', data.whitelist || []);
    displayIPList('blacklist', data.blacklist || []);
  } catch (error) {
    console.error('Failed to load IP filters:', error);
  }
}

function displayIPList(type, ips) {
  const container = document.getElementById(type);

  if (ips.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #718096;">No IPs added</p>';
    return;
  }

  container.innerHTML = ips.map(ip => `
    <div class="ip-item">
      <span>${ip}</span>
      <span class="remove-btn" onclick="removeIP('${type}', '${ip}')">×</span>
    </div>
  `).join('');
}

async function addToWhitelist() {
  const ip = document.getElementById('whitelist-ip').value.trim();
  if (!ip) return;

  await addIP('whitelist', ip);
  document.getElementById('whitelist-ip').value = '';
}

async function addToBlacklist() {
  const ip = document.getElementById('blacklist-ip').value.trim();
  if (!ip) return;

  await addIP('blacklist', ip);
  document.getElementById('blacklist-ip').value = '';
}

async function addIP(type, ip) {
  try {
    await fetch(`/api/security/ip-filter/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip })
    });

    await loadIPFilters();
    await loadSecurityOverview();
    showToast(`IP added to ${type}`, 'success');
  } catch (error) {
    alert(`Failed to add IP: ${error.message}`);
  }
}

async function removeIP(type, ip) {
  try {
    await fetch(`/api/security/ip-filter/${type}/${ip}`, {
      method: 'DELETE'
    });

    await loadIPFilters();
    await loadSecurityOverview();
    showToast(`IP removed from ${type}`, 'success');
  } catch (error) {
    alert(`Failed to remove IP: ${error.message}`);
  }
}

// ==
// USER ROLES
// ==

async function loadRoles() {
  try {
    const response = await fetch('/api/security/roles');
    const roles = await response.json();
    displayRoles(roles);
  } catch (error) {
    console.error('Failed to load roles:', error);
  }
}

function displayRoles(roles) {
  const container = document.getElementById('roles-list');

  container.innerHTML = roles.map(role => `
    <div class="api-key-item">
      <div class="api-key-header">
        <span class="api-key-name">${role.name}</span>
        <span class="status-badge ${role.name === 'admin' ? 'danger' : 'active'}">${role.permissions.length} permissions</span>
      </div>
      <p style="color: #718096; font-size: 14px; margin: 10px 0;">${role.description}</p>
      <div style="font-size: 12px; color: #4a5568;">
        <strong>Permissions:</strong> ${role.permissions.join(', ')}
      </div>
    </div>
  `).join('');
}

// ==
// UTILITIES
// ==

function showToast(message, type = 'info') {
  // Use existing toast system from admin-app.js if available
  if (window.showToast) {
    window.showToast(message, type);
    return;
  }

  // Simple fallback
  alert(message);
}
