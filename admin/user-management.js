/**
 * User Management System
 * Create, read, update, delete admin users with role assignments
 */

import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// ==
// USER MANAGER
// ==

class UserManager {
  constructor() {
    this.users = new Map();
    this.userFile = path.join(process.cwd(), 'config', 'users.json');
    this.loadUsers();
  }

  async loadUsers() {
    try {
      const content = await fs.readFile(this.userFile, 'utf8');
      const data = JSON.parse(content);
      this.users = new Map(Object.entries(data));
    } catch (error) {
      // File doesn't exist yet, use defaults
      this.users = new Map([
        ['admin', {
          username: 'admin',
          email: 'admin@tillerstead.com',
          passwordHash: '$2b$10$K8OvMmzY5bD5x6FpN3rJNurKWn2VNx9.EoEQPV9zWqPGUoKnE8WDi',
          role: 'admin',
          created: new Date().toISOString(),
          lastLogin: null,
          isActive: true,
          twoFactorEnabled: false
        }]
      ]);
      await this.saveUsers();
    }
  }

  async saveUsers() {
    try {
      const dir = path.dirname(this.userFile);
      await fs.mkdir(dir, { recursive: true });
      const data = Object.fromEntries(this.users);
      await fs.writeFile(this.userFile, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  async createUser(username, email, password, role = 'viewer') {
    if (this.users.has(username)) {
      throw new Error('Username already exists');
    }

    // Validate inputs
    if (!this.validateUsername(username)) {
      throw new Error('Invalid username. Use 3-20 alphanumeric characters, underscore, or hyphen.');
    }

    if (!this.validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      username,
      email,
      passwordHash,
      role,
      created: new Date().toISOString(),
      lastLogin: null,
      isActive: true,
      twoFactorEnabled: false
    };

    this.users.set(username, user);
    await this.saveUsers();

    // Return user without password hash
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async updateUser(username, updates) {
    const user = this.users.get(username);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Validate updates
    if (updates.email && !this.validateEmail(updates.email)) {
      throw new Error('Invalid email address');
    }

    if (updates.password) {
      if (updates.password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    // Update user
    const updatedUser = {
      ...user,
      ...updates,
      username // Prevent username change
    };

    this.users.set(username, updatedUser);
    await this.saveUsers();

    const { passwordHash: _, ...safeUser } = updatedUser;
    return safeUser;
  }

  async deleteUser(username) {
    if (username === 'admin') {
      throw new Error('Cannot delete admin user');
    }

    const deleted = this.users.delete(username);
    
    if (!deleted) {
      throw new Error('User not found');
    }

    await this.saveUsers();
    return true;
  }

  getUser(username) {
    const user = this.users.get(username);
    if (!user) return null;

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  getAllUsers() {
    return Array.from(this.users.values()).map(user => {
      const { passwordHash: _, ...safeUser } = user;
      return safeUser;
    });
  }

  async verifyPassword(username, password) {
    const user = this.users.get(username);
    if (!user) return false;

    return await bcrypt.compare(password, user.passwordHash);
  }

  async changePassword(username, currentPassword, newPassword) {
    const user = this.users.get(username);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    if (newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters');
    }

    // Hash and save new password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    this.users.set(username, user);
    await this.saveUsers();

    return true;
  }

  async updateLastLogin(username) {
    const user = this.users.get(username);
    if (!user) return;

    user.lastLogin = new Date().toISOString();
    this.users.set(username, user);
    await this.saveUsers();
  }

  async toggleUserStatus(username, isActive) {
    const user = this.users.get(username);
    
    if (!user) {
      throw new Error('User not found');
    }

    if (username === 'admin') {
      throw new Error('Cannot deactivate admin user');
    }

    user.isActive = isActive;
    this.users.set(username, user);
    await this.saveUsers();

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  validateUsername(username) {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(username);
  }

  validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Password reset token generation
  generateResetToken(username) {
    const user = this.users.get(username);
    if (!user) return null;

    const token = randomBytes(32).toString('hex');
    const expiry = Date.now() + (60 * 60 * 1000); // 1 hour

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    this.users.set(username, user);
    this.saveUsers();

    return token;
  }

  async resetPasswordWithToken(token, newPassword) {
    const user = Array.from(this.users.values()).find(u => 
      u.resetToken === token && u.resetTokenExpiry > Date.now()
    );

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    if (newPassword.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    delete user.resetToken;
    delete user.resetTokenExpiry;

    this.users.set(user.username, user);
    await this.saveUsers();

    return true;
  }
}

export const userManager = new UserManager();

// ==
// SESSION MANAGER
// ==

class SessionManager {
  constructor() {
    this.sessions = new Map();
    this.cleanup();
  }

  createSession(username, sessionData) {
    const sessionId = randomBytes(32).toString('hex');
    const session = {
      username,
      created: Date.now(),
      lastActivity: Date.now(),
      ip: sessionData.ip,
      userAgent: sessionData.userAgent,
      ...sessionData
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  updateActivity(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  destroySession(sessionId) {
    this.sessions.delete(sessionId);
  }

  getUserSessions(username) {
    return Array.from(this.sessions.entries())
      .filter(([_, session]) => session.username === username)
      .map(([id, session]) => ({
        id,
        ...session
      }));
  }

  getAllActiveSessions() {
    return Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      username: session.username,
      created: session.created,
      lastActivity: session.lastActivity,
      ip: session.ip
    }));
  }

  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const [id, session] of this.sessions.entries()) {
        if (now - session.lastActivity > maxAge) {
          this.sessions.delete(id);
        }
      }
    }, 60 * 60 * 1000); // Run every hour
  }
}

export const sessionManager = new SessionManager();

export default {
  userManager,
  sessionManager
};
