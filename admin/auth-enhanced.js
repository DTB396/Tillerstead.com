/**
 * Two-Factor Authentication (2FA) System
 * TOTP-based 2FA with QR code generation
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { randomBytes } from 'crypto';

// ==
// 2FA MANAGER
// ==

class TwoFactorAuth {
  constructor() {
    this.secrets = new Map(); // In production, store in database
  }

  /**
   * Generate a new 2FA secret for a user
   */
  generateSecret(username) {
    const secret = speakeasy.generateSecret({
      name: `Tillerstead Admin (${username})`,
      issuer: 'Tillerstead',
      length: 32
    });

    this.secrets.set(username, {
      secret: secret.base32,
      tempSecret: secret.base32,
      enabled: false,
      backupCodes: this.generateBackupCodes()
    });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url,
      qrCode: null // Will be generated separately
    };
  }

  /**
   * Generate QR code for the secret
   */
  async generateQRCode(otpauthUrl) {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verify a TOTP token
   */
  verifyToken(username, token) {
    const userData = this.secrets.get(username);
    
    if (!userData) {
      return { valid: false, error: 'User not found' };
    }

    const secret = userData.enabled ? userData.secret : userData.tempSecret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps of variance
    });

    return { valid: verified };
  }

  /**
   * Enable 2FA after verification
   */
  enable2FA(username, token) {
    const verification = this.verifyToken(username, token);
    
    if (!verification.valid) {
      return { success: false, error: 'Invalid verification code' };
    }

    const userData = this.secrets.get(username);
    userData.enabled = true;
    userData.secret = userData.tempSecret;
    delete userData.tempSecret;

    return {
      success: true,
      backupCodes: userData.backupCodes
    };
  }

  /**
   * Disable 2FA
   */
  disable2FA(username, token) {
    const verification = this.verifyToken(username, token);
    
    if (!verification.valid) {
      return { success: false, error: 'Invalid verification code' };
    }

    this.secrets.delete(username);
    return { success: true };
  }

  /**
   * Check if user has 2FA enabled
   */
  isEnabled(username) {
    const userData = this.secrets.get(username);
    return userData ? userData.enabled : false;
  }

  /**
   * Generate backup codes
   */
  generateBackupCodes(count = 10) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = randomBytes(4).toString('hex').toUpperCase();
      codes.push(code.match(/.{1,4}/g).join('-'));
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  verifyBackupCode(username, code) {
    const userData = this.secrets.get(username);
    
    if (!userData || !userData.backupCodes) {
      return { valid: false };
    }

    const index = userData.backupCodes.indexOf(code);
    
    if (index === -1) {
      return { valid: false };
    }

    // Remove used backup code
    userData.backupCodes.splice(index, 1);

    return {
      valid: true,
      remainingCodes: userData.backupCodes.length
    };
  }

  /**
   * Regenerate backup codes
   */
  regenerateBackupCodes(username, token) {
    const verification = this.verifyToken(username, token);
    
    if (!verification.valid) {
      return { success: false, error: 'Invalid verification code' };
    }

    const userData = this.secrets.get(username);
    userData.backupCodes = this.generateBackupCodes();

    return {
      success: true,
      backupCodes: userData.backupCodes
    };
  }
}

export const twoFactorAuth = new TwoFactorAuth();

// ==
// 2FA MIDDLEWARE
// ==

export function require2FA(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const username = req.session.userId;

  // Check if user has 2FA enabled
  if (twoFactorAuth.isEnabled(username)) {
    // Check if 2FA is verified in this session
    if (!req.session.twoFactorVerified) {
      return res.status(401).json({
        error: '2FA verification required',
        require2FA: true
      });
    }
  }

  next();
}

// ==
// ROLE-BASED ACCESS CONTROL
// ==

class RoleManager {
  constructor() {
    this.roles = new Map([
      ['admin', {
        permissions: ['*'], // All permissions
        description: 'Full system access'
      }],
      ['editor', {
        permissions: [
          'content:read',
          'content:write',
          'calculator:read',
          'calculator:write'
        ],
        description: 'Can edit content and calculators'
      }],
      ['viewer', {
        permissions: [
          'content:read',
          'calculator:read',
          'settings:read'
        ],
        description: 'Read-only access'
      }]
    ]);

    this.userRoles = new Map([
      ['admin', 'admin']
    ]);
  }

  /**
   * Assign role to user
   */
  assignRole(username, role) {
    if (!this.roles.has(role)) {
      throw new Error(`Invalid role: ${role}`);
    }

    this.userRoles.set(username, role);
    return true;
  }

  /**
   * Get user's role
   */
  getUserRole(username) {
    return this.userRoles.get(username) || null;
  }

  /**
   * Get role permissions
   */
  getRolePermissions(role) {
    const roleData = this.roles.get(role);
    return roleData ? roleData.permissions : [];
  }

  /**
   * Check if user has permission
   */
  hasPermission(username, permission) {
    const role = this.getUserRole(username);
    
    if (!role) return false;

    const permissions = this.getRolePermissions(role);

    // Admin wildcard
    if (permissions.includes('*')) return true;

    // Exact match
    if (permissions.includes(permission)) return true;

    // Wildcard match (e.g., 'content:*' matches 'content:read')
    const wildcardMatch = permissions.some(perm => {
      if (!perm.includes(':')) return false;
      const [category] = perm.split(':');
      return permission.startsWith(category + ':') && perm.endsWith('*');
    });

    return wildcardMatch;
  }

  /**
   * Create new role
   */
  createRole(name, permissions, description) {
    if (this.roles.has(name)) {
      throw new Error(`Role already exists: ${name}`);
    }

    this.roles.set(name, { permissions, description });
    return true;
  }

  /**
   * List all roles
   */
  listRoles() {
    return Array.from(this.roles.entries()).map(([name, data]) => ({
      name,
      ...data
    }));
  }

  /**
   * List all user role assignments
   */
  listUserRoles() {
    return Array.from(this.userRoles.entries()).map(([username, role]) => ({
      username,
      role,
      permissions: this.getRolePermissions(role)
    }));
  }
}

export const roleManager = new RoleManager();

// ==
// PERMISSION MIDDLEWARE
// ==

/**
 * Middleware to check permission
 * Usage: requirePermission('content:write')
 */
export function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = req.session.userId;

    if (!roleManager.hasPermission(username, permission)) {
      return res.status(403).json({
        error: 'Permission denied',
        required: permission
      });
    }

    next();
  };
}

/**
 * Middleware to check any of multiple permissions
 * Usage: requireAnyPermission(['content:read', 'content:write'])
 */
export function requireAnyPermission(permissions) {
  return (req, res, next) => {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const username = req.session.userId;

    const hasAny = permissions.some(permission =>
      roleManager.hasPermission(username, permission)
    );

    if (!hasAny) {
      return res.status(403).json({
        error: 'Permission denied',
        required: permissions
      });
    }

    next();
  };
}

// ==
// EXPORT
// ==

export default {
  twoFactorAuth,
  require2FA,
  roleManager,
  requirePermission,
  requireAnyPermission
};
