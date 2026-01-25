/**
 * Tillerstead Admin Panel Backend
 * Express server with authentication and API for managing calculators & website content
 */

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import bcrypt from 'bcrypt';
import security from './security.js';
import auth from './auth-enhanced.js';
import userManagement from './user-management.js';
import notifications from './notifications.js';
import systemHealth from './system-health.js';

const { userManager, sessionManager } = userManagement;
const { emailNotifier, inAppNotifier } = notifications;
const { systemMonitor, requestTimingMiddleware, getHealthCheckData } = systemHealth;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Admin credentials (in production, use environment variables and proper DB)
const ADMIN_USERS = {
  admin: {
    username: 'admin',
    // Default password: 'tillerstead2026' - CHANGE THIS!
    passwordHash: '$2b$10$K8OvMmzY5bD5x6FpN3rJNurKWn2VNx9.EoEQPV9zWqPGUoKnE8WDi'
  }
};

// Security headers
app.use(security.securityHeaders);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration with enhanced security
app.use(session(security.secureSessionConfig()));

// Audit logging middleware
app.use(security.auditMiddleware);

// Request timing middleware for performance monitoring
app.use(requestTimingMiddleware);

// ==
// AUTHENTICATION MIDDLEWARE
// ==

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ==
// AUTHENTICATION ROUTES
// ==

// Login with brute force protection
app.post('/api/auth/login', security.authLimiter, security.checkBruteForce, async (req, res) => {
  const { username, password } = req.body;
  const ip = req.ip;

  const user = ADMIN_USERS[username];
  if (!user) {
    security.bruteForce.recordAttempt(ip, false);
    security.auditLog.log('login_failed', username, { reason: 'user_not_found' }, ip);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    security.bruteForce.recordAttempt(ip, false);
    security.auditLog.log('login_failed', username, { reason: 'wrong_password' }, ip);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Successful login
  security.bruteForce.recordAttempt(ip, true);
  req.session.userId = username;
  security.auditLog.log('login_success', username, { ip }, ip);
  
  // Check if 2FA is enabled
  if (auth.twoFactorAuth.isEnabled(username)) {
    req.session.pending2FA = true;
    return res.json({ 
      success: true, 
      username,
      require2FA: true 
    });
  }

  res.json({ success: true, username });
});

// 2FA verification
app.post('/api/auth/2fa/verify', async (req, res) => {
  const { token } = req.body;
  const username = req.session.userId;

  if (!username || !req.session.pending2FA) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const verification = auth.twoFactorAuth.verifyToken(username, token);

  if (!verification.valid) {
    security.auditLog.log('2fa_failed', username, { token: 'invalid' }, req.ip);
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  req.session.twoFactorVerified = true;
  delete req.session.pending2FA;
  security.auditLog.log('2fa_success', username, {}, req.ip);

  res.json({ success: true });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const username = req.session?.userId;
  security.auditLog.log('logout', username, {}, req.ip);
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/auth/check', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, user: req.session.userId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// ==
// CALCULATOR API ROUTES
// ==

// Get calculator configuration from tools.js
app.get('/api/calculators/config', requireAuth, async (req, res) => {
  try {
    const toolsPath = path.join(__dirname, '..', 'assets', 'js', 'tools.js');
    const toolsContent = await fs.readFile(toolsPath, 'utf8');
    
    // Extract constants from tools.js
    const config = extractCalculatorConfig(toolsContent);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update calculator configuration
app.put('/api/calculators/config', requireAuth, async (req, res) => {
  try {
    const { presets } = req.body;
    const toolsPath = path.join(__dirname, '..', 'assets', 'js', 'tools.js');
    let toolsContent = await fs.readFile(toolsPath, 'utf8');
    
    // Update the constants in tools.js
    toolsContent = updateCalculatorConfig(toolsContent, presets);
    
    // Backup original file
    const backupPath = `${toolsPath}.backup.${Date.now()}`;
    await fs.copyFile(toolsPath, backupPath);
    
    // Write updated content
    await fs.writeFile(toolsPath, toolsContent, 'utf8');
    
    res.json({ success: true, message: 'Calculator configuration updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==
// WEBSITE CONTENT API ROUTES
// ==

// List all data files
app.get('/api/content/files', requireAuth, async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '..', '_data');
    const files = await fs.readdir(dataDir);
    const ymlFiles = files.filter(f => f.endsWith('.yml'));
    
    const fileList = await Promise.all(ymlFiles.map(async (filename) => {
      const filePath = path.join(dataDir, filename);
      const stats = await fs.stat(filePath);
      return {
        name: filename,
        path: filename,
        size: stats.size,
        modified: stats.mtime
      };
    }));
    
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content file
app.get('/api/content/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', '_data', filename);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..', '_data'))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(content);
    
    res.json({
      filename,
      content,
      parsed: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content file
app.put('/api/content/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    const filePath = path.join(__dirname, '..', '_data', filename);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..', '_data'))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Validate YAML
    try {
      yaml.load(content);
    } catch (yamlError) {
      return res.status(400).json({ error: 'Invalid YAML syntax: ' + yamlError.message });
    }
    
    // Backup original file
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
    
    // Write updated content
    await fs.writeFile(filePath, content, 'utf8');
    
    res.json({ success: true, message: 'Content file updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==
// SITE SETTINGS / TOGGLES API
// ==

// Get site configuration
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const configPath = path.join(__dirname, '..', '_config.yml');
    const content = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(content);
    
    res.json({ config, raw: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update site configuration
app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const configPath = path.join(__dirname, '..', '_config.yml');
    
    // Validate YAML
    try {
      yaml.load(content);
    } catch (yamlError) {
      return res.status(400).json({ error: 'Invalid YAML syntax: ' + yamlError.message });
    }
    
    // Backup original file
    const backupPath = `${configPath}.backup.${Date.now()}`;
    await fs.copyFile(configPath, backupPath);
    
    // Write updated content
    await fs.writeFile(configPath, content, 'utf8');
    
    res.json({ success: true, message: 'Site configuration updated. Restart Jekyll to apply changes.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==
// UTILITY FUNCTIONS
// ==

function extractCalculatorConfig(toolsContent) {
  const config = {
    tilePresets: [],
    layoutPresets: [],
    jointPresets: [],
    trowelPresets: []
  };
  
  // Extract TILE_PRESETS array
  const tileMatch = toolsContent.match(/const TILE_PRESETS = \[([\s\S]*?)\];/);
  if (tileMatch) {
    config.tilePresets = tileMatch[1];
  }
  
  // Extract LAYOUT_PRESETS array
  const layoutMatch = toolsContent.match(/const LAYOUT_PRESETS = \[([\s\S]*?)\];/);
  if (layoutMatch) {
    config.layoutPresets = layoutMatch[1];
  }
  
  // Extract JOINT_PRESETS array
  const jointMatch = toolsContent.match(/const JOINT_PRESETS = \[([\s\S]*?)\];/);
  if (jointMatch) {
    config.jointPresets = jointMatch[1];
  }
  
  // Extract TROWEL_PRESETS array
  const trowelMatch = toolsContent.match(/const TROWEL_PRESETS = \[([\s\S]*?)\];/);
  if (trowelMatch) {
    config.trowelPresets = trowelMatch[1];
  }
  
  return config;
}

function updateCalculatorConfig(toolsContent, presets) {
  let updated = toolsContent;
  
  if (presets.tilePresets) {
    updated = updated.replace(
      /const TILE_PRESETS = \[[\s\S]*?\];/,
      `const TILE_PRESETS = ${presets.tilePresets};`
    );
  }
  
  if (presets.layoutPresets) {
    updated = updated.replace(
      /const LAYOUT_PRESETS = \[[\s\S]*?\];/,
      `const LAYOUT_PRESETS = ${presets.layoutPresets};`
    );
  }
  
  if (presets.jointPresets) {
    updated = updated.replace(
      /const JOINT_PRESETS = \[[\s\S]*?\];/,
      `const JOINT_PRESETS = ${presets.jointPresets};`
    );
  }
  
  if (presets.trowelPresets) {
    updated = updated.replace(
      /const TROWEL_PRESETS = \[[\s\S]*?\];/,
      `const TROWEL_PRESETS = ${presets.trowelPresets};`
    );
  }
  
  return updated;
}

// ==
// SECURITY API ROUTES
// ==

// Security overview
app.get('/api/security/overview', requireAuth, async (req, res) => {
  try {
    const logs = await security.auditLog.getRecentLogs(1000);
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);

    const loginAttempts = logs.filter(log => 
      log.event === 'login_success' || log.event === 'login_failed'
    ).filter(log => new Date(log.timestamp).getTime() > oneDayAgo).length;

    const failedLogins = logs.filter(log => 
      log.event === 'login_failed'
    ).filter(log => new Date(log.timestamp).getTime() > oneDayAgo).length;

    const highSeverity = logs.filter(log => 
      log.severity === 'high' || log.severity === 'critical'
    ).length;

    res.json({
      loginAttempts,
      failedLogins,
      activeSessions: 1,
      apiKeyCount: security.apiKeys.listKeys().length,
      whitelistCount: security.ipFilter.whitelist.size,
      blacklistCount: security.ipFilter.blacklist.size,
      highSeverity,
      suspicious: 0,
      blocked: 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2FA setup
app.post('/api/auth/2fa/setup', requireAuth, async (req, res) => {
  try {
    const username = req.session.userId;
    const secretData = auth.twoFactorAuth.generateSecret(username);
    const qrCode = await auth.twoFactorAuth.generateQRCode(secretData.otpauthUrl);
    
    res.json({
      secret: secretData.secret,
      qrCode
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enable 2FA
app.post('/api/auth/2fa/enable', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const username = req.session.userId;
    const result = auth.twoFactorAuth.enable2FA(username, token);
    
    if (result.success) {
      security.auditLog.log('2fa_enabled', username, {}, req.ip);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Disable 2FA
app.post('/api/auth/2fa/disable', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const username = req.session.userId;
    const result = auth.twoFactorAuth.disable2FA(username, token);
    
    if (result.success) {
      security.auditLog.log('2fa_disabled', username, {}, req.ip);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2FA status
app.get('/api/auth/2fa/status', requireAuth, (req, res) => {
  const username = req.session.userId;
  const enabled = auth.twoFactorAuth.isEnabled(username);
  res.json({ enabled });
});

// Regenerate backup codes
app.post('/api/auth/2fa/regenerate-codes', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const username = req.session.userId;
    const result = auth.twoFactorAuth.regenerateBackupCodes(username, token);
    
    if (result.success) {
      security.auditLog.log('backup_codes_regenerated', username, {}, req.ip);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit logs
app.get('/api/security/audit', requireAuth, async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    let logs;

    switch (filter) {
      case 'login':
        logs = await security.auditLog.getLogsByEvent('login_success', 100);
        logs = logs.concat(await security.auditLog.getLogsByEvent('login_failed', 100));
        break;
      case 'file':
        logs = await security.auditLog.getLogsByEvent('file_write', 100);
        logs = logs.concat(await security.auditLog.getLogsByEvent('file_delete', 100));
        break;
      case 'high':
        logs = await security.auditLog.getHighSeverityLogs(100);
        break;
      default:
        logs = await security.auditLog.getRecentLogs(100);
    }

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API Keys management
app.get('/api/security/api-keys', requireAuth, (req, res) => {
  const keys = security.apiKeys.listKeys();
  res.json(keys);
});

app.post('/api/security/api-keys', requireAuth, async (req, res) => {
  try {
    const { name, permissions } = req.body;
    const key = security.apiKeys.generateKey(name, permissions);
    security.auditLog.log('api_key_created', req.session.userId, { name }, req.ip);
    res.json({ key, name });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/security/api-keys/:hash', requireAuth, async (req, res) => {
  try {
    const { hash } = req.params;
    security.apiKeys.revokeKey(hash);
    security.auditLog.log('api_key_revoked', req.session.userId, { hash }, req.ip);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// IP Filter management
app.get('/api/security/ip-filter', requireAuth, (req, res) => {
  res.json({
    whitelist: Array.from(security.ipFilter.whitelist),
    blacklist: Array.from(security.ipFilter.blacklist)
  });
});

app.post('/api/security/ip-filter/whitelist', requireAuth, (req, res) => {
  const { ip } = req.body;
  security.ipFilter.addToWhitelist(ip);
  security.auditLog.log('ip_whitelisted', req.session.userId, { ip }, req.ip);
  res.json({ success: true });
});

app.post('/api/security/ip-filter/blacklist', requireAuth, (req, res) => {
  const { ip } = req.body;
  security.ipFilter.addToBlacklist(ip);
  security.auditLog.log('ip_blacklisted', req.session.userId, { ip }, req.ip);
  res.json({ success: true });
});

app.delete('/api/security/ip-filter/whitelist/:ip', requireAuth, (req, res) => {
  const { ip } = req.params;
  security.ipFilter.removeFromWhitelist(ip);
  security.auditLog.log('ip_removed_whitelist', req.session.userId, { ip }, req.ip);
  res.json({ success: true });
});

app.delete('/api/security/ip-filter/blacklist/:ip', requireAuth, (req, res) => {
  const { ip } = req.params;
  security.ipFilter.removeFromBlacklist(ip);
  security.auditLog.log('ip_removed_blacklist', req.session.userId, { ip }, req.ip);
  res.json({ success: true });
});

// Roles management
app

// ==
// USER MANAGEMENT ROUTES
// ==

// Get all users
app.get('/api/users', requireAuth, (req, res) => {
  const users = userManager.getAllUsers();
  res.json(users);
});

// Get user stats
app.get('/api/users/stats', requireAuth, (req, res) => {
  const users = userManager.getAllUsers();
  const sessions = sessionManager.getAllActiveSessions();
  
  res.json({
    total: users.length,
    active: users.filter(u => u.isActive).length,
    admins: users.filter(u => u.role === 'admin').length,
    sessions: sessions.length
  });
});

// Get single user
app.get('/api/users/:username', requireAuth, (req, res) => {
  const user = userManager.getUser(req.params.username);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

// Create user
app.post('/api/users', requireAuth, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const newUser = await userManager.createUser(username, email, password, role);
    
    security.auditLog.log('user_created', req.session.userId, { 
      username, role 
    }, req.ip);
    
    emailNotifier.notifyNewUser(newUser, req.session.userId);
    
    res.json(newUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update user
app.put('/api/users/:username', requireAuth, async (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = await userManager.updateUser(req.params.username, updates);
    
    security.auditLog.log('user_updated', req.session.userId, {
      username: req.params.username,
      updates: Object.keys(updates)
    }, req.ip);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete user
app.delete('/api/users/:username', requireAuth, async (req, res) => {
  try {
    await userManager.deleteUser(req.params.username);
    
    security.auditLog.log('user_deleted', req.session.userId, {
      username: req.params.username
    }, req.ip);
    
    emailNotifier.notifyUserDeleted(req.params.username, req.session.userId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Toggle user status
app.put('/api/users/:username/status', requireAuth, async (req, res) => {
  try {
    const { isActive } = req.body;
    const updatedUser = await userManager.toggleUserStatus(req.params.username, isActive);
    
    security.auditLog.log('user_status_changed', req.session.userId, {
      username: req.params.username,
      isActive
    }, req.ip);
    
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Change password
app.post('/api/users/:username/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await userManager.changePassword(req.params.username, currentPassword, newPassword);
    
    security.auditLog.log('password_changed', req.session.userId, {
      username: req.params.username
    }, req.ip);
    
    emailNotifier.notifyPasswordChanged(req.params.username);
    
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==
// HEALTH MONITORING ROUTES
// ==

// Health check endpoint
app.get('/api/health', requireAuth, (req, res) => {
  const healthData = getHealthCheckData();
  res.json(healthData);
});

// Get metrics history
app.get('/api/health/metrics/:type', requireAuth, (req, res) => {
  const { type } = req.params;
  const limit = parseInt(req.query.limit) || 100;
  const metrics = systemMonitor.getMetricsHistory(type, limit);
  res.json(metrics);
});

// System information
app.get('/api/health/system', requireAuth, (req, res) => {
  const sysInfo = systemMonitor.getSystemInfo();
  res.json(sysInfo);
});

// ==
// NOTIFICATION ROUTES
// ==

// Get notifications
app.get('/api/notifications', requireAuth, (req, res) => {
  const unreadOnly = req.query.unread === 'true';
  const notifications = inAppNotifier.getAll(unreadOnly);
  res.json(notifications);
});

// Mark notification as read
app.put('/api/notifications/:id/read', requireAuth, (req, res) => {
  inAppNotifier.markAsRead(req.params.id);
  res.json({ success: true });
});

// Mark all as read
app.put('/api/notifications/read-all', requireAuth, (req, res) => {
  inAppNotifier.markAllAsRead();
  res.json({ success: true });
});

// Delete notification
app.delete('/api/notifications/:id', requireAuth, (req, res) => {
  inAppNotifier.delete(req.params.id);
  res.json({ success: true });
});.get('/api/security/roles', requireAuth, (req, res) => {
  const roles = auth.roleManager.listRoles();
  res.json(roles);
});

// ==
// SERVE ADMIN PANEL HTML
// ==

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/security', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'security.html'));
});

app.get('/users', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'users.html'));
});

app.get('/health', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'health.html'));
});

// ==
// START SERVER
// ==

app.listen(PORT, () => {
  console.log(`\n🔧 Tillerstead Admin Panel`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Login at http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard at http://localhost:${PORT}`);
  console.log(`\n⚠️  Default credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: tillerstead2026`);
  console.log(`   CHANGE THESE IMMEDIATELY!\n`);
});
