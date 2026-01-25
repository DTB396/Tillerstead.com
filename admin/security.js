/**
 * Security Middleware & Protection Layer
 * Rate limiting, brute force protection, security headers
 */

import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { createHash, randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// ==
// RATE LIMITING
// ==

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: 'Too many login attempts, please try again after 15 minutes.',
  skipSuccessfulRequests: true,
  standardHeaders: true,
});

// Content modification limiter
export const modifyLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute
  message: 'Too many modification requests, please slow down.',
});

// ==
// BRUTE FORCE PROTECTION
// ==

class BruteForceProtection {
  constructor() {
    this.attempts = new Map();
    this.lockouts = new Map();
    this.maxAttempts = 5;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutes
    this.attemptWindow = 15 * 60 * 1000; // 15 minutes
  }

  recordAttempt(identifier, success) {
    const now = Date.now();
    
    if (!this.attempts.has(identifier)) {
      this.attempts.set(identifier, []);
    }

    const attempts = this.attempts.get(identifier);
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(
      time => now - time < this.attemptWindow
    );

    if (success) {
      // Clear attempts on success
      this.attempts.delete(identifier);
      this.lockouts.delete(identifier);
      return { allowed: true };
    }

    // Record failed attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);

    // Check if should lock out
    if (recentAttempts.length >= this.maxAttempts) {
      this.lockouts.set(identifier, now + this.lockoutDuration);
      return {
        allowed: false,
        reason: 'Too many failed attempts',
        unlockTime: now + this.lockoutDuration
      };
    }

    return {
      allowed: true,
      remainingAttempts: this.maxAttempts - recentAttempts.length
    };
  }

  isLockedOut(identifier) {
    const lockoutUntil = this.lockouts.get(identifier);
    
    if (!lockoutUntil) return false;

    const now = Date.now();
    
    if (now > lockoutUntil) {
      // Lockout expired
      this.lockouts.delete(identifier);
      this.attempts.delete(identifier);
      return false;
    }

    return true;
  }

  getStatus(identifier) {
    if (this.isLockedOut(identifier)) {
      const unlockTime = this.lockouts.get(identifier);
      return {
        locked: true,
        unlockTime,
        remainingTime: unlockTime - Date.now()
      };
    }

    const attempts = this.attempts.get(identifier) || [];
    return {
      locked: false,
      attempts: attempts.length,
      remainingAttempts: this.maxAttempts - attempts.length
    };
  }
}

export const bruteForce = new BruteForceProtection();

// Middleware to check brute force protection
export function checkBruteForce(req, res, next) {
  const identifier = req.ip;
  
  if (bruteForce.isLockedOut(identifier)) {
    const status = bruteForce.getStatus(identifier);
    return res.status(429).json({
      error: 'Account temporarily locked due to too many failed attempts',
      unlockTime: new Date(status.unlockTime).toISOString(),
      remainingTime: Math.ceil(status.remainingTime / 1000 / 60) + ' minutes'
    });
  }

  next();
}

// ==
// SECURITY HEADERS
// ==

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },
  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
});

// ==
// AUDIT LOGGING
// ==

class AuditLogger {
  constructor() {
    this.logFile = path.join(process.cwd(), 'logs', 'audit.log');
    this.ensureLogDirectory();
  }

  async ensureLogDirectory() {
    const dir = path.dirname(this.logFile);
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async log(event, user, details, ip) {
    const entry = {
      timestamp: new Date().toISOString(),
      event,
      user: user || 'anonymous',
      ip,
      details,
      severity: this.getSeverity(event)
    };

    const logLine = JSON.stringify(entry) + '\n';

    try {
      await fs.appendFile(this.logFile, logLine);
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }

    // Also log high-severity events to console
    if (entry.severity === 'high' || entry.severity === 'critical') {
      console.warn('🚨 SECURITY EVENT:', entry);
    }

    return entry;
  }

  getSeverity(event) {
    const severityMap = {
      'login_success': 'low',
      'login_failed': 'medium',
      'login_locked': 'high',
      'logout': 'low',
      'file_read': 'low',
      'file_write': 'medium',
      'file_delete': 'high',
      'config_change': 'high',
      'user_created': 'medium',
      'user_deleted': 'high',
      'permission_denied': 'medium',
      'suspicious_activity': 'high',
      'data_breach_attempt': 'critical'
    };

    return severityMap[event] || 'medium';
  }

  async getRecentLogs(limit = 100) {
    try {
      const content = await fs.readFile(this.logFile, 'utf8');
      const lines = content.trim().split('\n');
      const logs = lines
        .slice(-limit)
        .map(line => JSON.parse(line))
        .reverse();
      return logs;
    } catch (error) {
      return [];
    }
  }

  async getLogsByUser(username, limit = 100) {
    const logs = await this.getRecentLogs(1000);
    return logs
      .filter(log => log.user === username)
      .slice(0, limit);
  }

  async getLogsByEvent(event, limit = 100) {
    const logs = await this.getRecentLogs(1000);
    return logs
      .filter(log => log.event === event)
      .slice(0, limit);
  }

  async getHighSeverityLogs(limit = 100) {
    const logs = await this.getRecentLogs(1000);
    return logs
      .filter(log => log.severity === 'high' || log.severity === 'critical')
      .slice(0, limit);
  }
}

export const auditLog = new AuditLogger();

// Middleware to log all authenticated requests
export function auditMiddleware(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log after response
    if (req.session && req.session.userId) {
      const event = `${req.method.toLowerCase()}_${req.path.split('/')[2] || 'request'}`;
      auditLog.log(event, req.session.userId, {
        method: req.method,
        path: req.path,
        status: res.statusCode
      }, req.ip);
    }
    
    originalSend.call(this, data);
  };

  next();
}

// ==
// INPUT VALIDATION & SANITIZATION
// ==

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potential XSS
  return input
    .replace(/[<>]/g, '')
    .trim();
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateUsername(username) {
  // Alphanumeric, underscore, hyphen, 3-20 chars
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
}

export function validateFilePath(filePath, allowedDir) {
  const normalized = path.normalize(filePath);
  const allowed = path.normalize(allowedDir);
  
  // Ensure path is within allowed directory
  return normalized.startsWith(allowed);
}

// ==
// API KEY MANAGEMENT
// ==

class APIKeyManager {
  constructor() {
    this.keys = new Map();
    this.loadKeys();
  }

  async loadKeys() {
    const keyFile = path.join(process.cwd(), 'config', 'api-keys.json');
    try {
      const content = await fs.readFile(keyFile, 'utf8');
      const data = JSON.parse(content);
      this.keys = new Map(Object.entries(data));
    } catch (error) {
      // No keys file yet
      this.keys = new Map();
    }
  }

  async saveKeys() {
    const keyFile = path.join(process.cwd(), 'config', 'api-keys.json');
    const dir = path.dirname(keyFile);
    
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }

    const data = Object.fromEntries(this.keys);
    await fs.writeFile(keyFile, JSON.stringify(data, null, 2));
  }

  generateKey(name, permissions = []) {
    const key = 'ts_' + randomBytes(32).toString('hex');
    const hashedKey = this.hashKey(key);
    
    this.keys.set(hashedKey, {
      name,
      permissions,
      created: new Date().toISOString(),
      lastUsed: null,
      usageCount: 0
    });

    this.saveKeys();
    
    return key; // Return unhashed key only once
  }

  hashKey(key) {
    return createHash('sha256').update(key).digest('hex');
  }

  validateKey(key) {
    const hashedKey = this.hashKey(key);
    const keyData = this.keys.get(hashedKey);
    
    if (!keyData) return null;

    // Update usage stats
    keyData.lastUsed = new Date().toISOString();
    keyData.usageCount++;
    this.saveKeys();

    return keyData;
  }

  revokeKey(key) {
    const hashedKey = this.hashKey(key);
    const deleted = this.keys.delete(hashedKey);
    if (deleted) {
      this.saveKeys();
    }
    return deleted;
  }

  listKeys() {
    return Array.from(this.keys.entries()).map(([hash, data]) => ({
      hash: hash.substring(0, 16) + '...',
      ...data
    }));
  }
}

export const apiKeys = new APIKeyManager();

// Middleware to validate API keys
export function requireAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  const keyData = apiKeys.validateKey(apiKey);
  
  if (!keyData) {
    auditLog.log('api_key_invalid', null, { key: apiKey.substring(0, 8) + '...' }, req.ip);
    return res.status(401).json({ error: 'Invalid API key' });
  }

  req.apiKeyData = keyData;
  next();
}

// ==
// SESSION SECURITY
// ==

export function secureSessionConfig() {
  return {
    secret: process.env.SESSION_SECRET || randomBytes(32).toString('hex'),
    name: 'tillerstead.sid', // Don't use default 'connect.sid'
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
      httpOnly: true, // No JS access
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict', // CSRF protection
      path: '/admin' // Limit cookie scope
    },
    rolling: true // Extend session on activity
  };
}

// ==
// IP WHITELIST/BLACKLIST
// ==

class IPFilter {
  constructor() {
    this.whitelist = new Set();
    this.blacklist = new Set();
  }

  addToWhitelist(ip) {
    this.whitelist.add(ip);
  }

  addToBlacklist(ip) {
    this.blacklist.add(ip);
  }

  removeFromWhitelist(ip) {
    this.whitelist.delete(ip);
  }

  removeFromBlacklist(ip) {
    this.blacklist.delete(ip);
  }

  isAllowed(ip) {
    // If blacklisted, deny
    if (this.blacklist.has(ip)) return false;
    
    // If whitelist is empty, allow all (except blacklisted)
    if (this.whitelist.size === 0) return true;
    
    // If whitelist exists, only allow whitelisted
    return this.whitelist.has(ip);
  }
}

export const ipFilter = new IPFilter();

export function checkIPFilter(req, res, next) {
  const ip = req.ip;
  
  if (!ipFilter.isAllowed(ip)) {
    auditLog.log('ip_blocked', null, { ip }, ip);
    return res.status(403).json({ error: 'Access denied from this IP address' });
  }

  next();
}

// ==
// EXPORT SECURITY BUNDLE
// ==

export default {
  apiLimiter,
  authLimiter,
  modifyLimiter,
  bruteForce,
  checkBruteForce,
  securityHeaders,
  auditLog,
  auditMiddleware,
  sanitizeInput,
  validateEmail,
  validateUsername,
  validateFilePath,
  apiKeys,
  requireAPIKey,
  secureSessionConfig,
  ipFilter,
  checkIPFilter
};
