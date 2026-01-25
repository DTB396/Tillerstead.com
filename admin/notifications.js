/**
 * Email Notification System
 * Send email alerts for security events and admin actions
 */

import nodemailer from 'nodemailer';

// ==
// EMAIL CONFIGURATION
// ==

class EmailNotifier {
  constructor() {
    this.transporter = null;
    this.from = process.env.EMAIL_FROM || 'noreply@tillerstead.com';
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@tillerstead.com';
    this.enabled = process.env.EMAIL_ENABLED === 'true';
    
    if (this.enabled) {
      this.initializeTransporter();
    }
  }

  initializeTransporter() {
    // Configure for production email service
    if (process.env.SMTP_HOST) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
    } else {
      // Development: Use ethereal email
      this.createTestAccount();
    }
  }

  async createTestAccount() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log('📧 Test email account created:', testAccount.user);
    } catch (error) {
      console.error('Failed to create test email account:', error);
    }
  }

  async send(to, subject, html, text) {
    if (!this.enabled || !this.transporter) {
      console.log('📧 Email disabled. Would send:', subject);
      return null;
    }

    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        text,
        html
      });

      console.log('📧 Email sent:', info.messageId);
      
      // For test accounts, log preview URL
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return info;
    } catch (error) {
      console.error('Failed to send email:', error);
      return null;
    }
  }

  // ==
  // NOTIFICATION TEMPLATES
  // ==

  async notifyLoginFailure(username, ip, failedAttempts) {
    const subject = `🚨 Failed Login Attempt - ${username}`;
    const html = `
      <h2>Failed Login Attempt Detected</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Failed Attempts:</strong> ${failedAttempts}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      ${failedAttempts >= 5 ? '<p style="color: red;"><strong>⚠️ Account will be locked after 5 failed attempts</strong></p>' : ''}
      <hr>
      <p>If this wasn't you, please secure your account immediately.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notifyAccountLocked(username, ip, unlockTime) {
    const subject = `🔒 Account Locked - ${username}`;
    const html = `
      <h2>Account Temporarily Locked</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Locked Until:</strong> ${new Date(unlockTime).toLocaleString()}</p>
      <p><strong>Reason:</strong> Too many failed login attempts</p>
      <hr>
      <p>The account will be automatically unlocked after 15 minutes.</p>
      <p>If this wasn't you, please investigate immediately.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notifyNewUser(newUser, createdBy) {
    const subject = `👤 New User Created - ${newUser.username}`;
    const html = `
      <h2>New Admin User Created</h2>
      <p><strong>Username:</strong> ${newUser.username}</p>
      <p><strong>Email:</strong> ${newUser.email}</p>
      <p><strong>Role:</strong> ${newUser.role}</p>
      <p><strong>Created By:</strong> ${createdBy}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This user now has access to the admin panel.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notifyUserDeleted(username, deletedBy) {
    const subject = `🗑️ User Deleted - ${username}`;
    const html = `
      <h2>Admin User Deleted</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Deleted By:</strong> ${deletedBy}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This user no longer has access to the admin panel.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notify2FAEnabled(username) {
    const subject = `🔐 Two-Factor Authentication Enabled - ${username}`;
    const html = `
      <h2>2FA Enabled</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p>Two-factor authentication has been enabled for your account.</p>
      <p>You will now need to enter a code from your authenticator app when logging in.</p>
      <hr>
      <p>If you didn't enable 2FA, please contact an administrator immediately.</p>
    `;

    const user = await this.getUserEmail(username);
    if (user) {
      await this.send(user.email, subject, html);
    }
  }

  async notify2FADisabled(username) {
    const subject = `⚠️ Two-Factor Authentication Disabled - ${username}`;
    const html = `
      <h2>2FA Disabled</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p style="color: orange;">Two-factor authentication has been disabled for your account.</p>
      <p>Your account is now less secure. We recommend re-enabling 2FA.</p>
      <hr>
      <p>If you didn't disable 2FA, please contact an administrator immediately.</p>
    `;

    const user = await this.getUserEmail(username);
    if (user) {
      await this.send(user.email, subject, html);
    }
  }

  async notifyPasswordChanged(username) {
    const subject = `🔑 Password Changed - ${username}`;
    const html = `
      <h2>Password Changed</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <p>Your password has been successfully changed.</p>
      <hr>
      <p>If you didn't change your password, please contact an administrator immediately and secure your account.</p>
    `;

    const user = await this.getUserEmail(username);
    if (user) {
      await this.send(user.email, subject, html);
    }
  }

  async notifyPasswordReset(username, resetLink) {
    const subject = `🔑 Password Reset Request`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>A password reset was requested for your account.</p>
      <p><strong>Username:</strong> ${username}</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a></p>
      <p>Or copy this link: ${resetLink}</p>
      <hr>
      <p>If you didn't request a password reset, please ignore this email.</p>
    `;

    const user = await this.getUserEmail(username);
    if (user) {
      await this.send(user.email, subject, html);
    }
  }

  async notifyHighSeverityEvent(event) {
    const subject = `🚨 High Severity Security Event`;
    const html = `
      <h2>High Severity Security Event Detected</h2>
      <p><strong>Event:</strong> ${event.event}</p>
      <p><strong>User:</strong> ${event.user}</p>
      <p><strong>IP:</strong> ${event.ip}</p>
      <p><strong>Severity:</strong> ${event.severity}</p>
      <p><strong>Time:</strong> ${new Date(event.timestamp).toLocaleString()}</p>
      <p><strong>Details:</strong></p>
      <pre>${JSON.stringify(event.details, null, 2)}</pre>
      <hr>
      <p>Please review the audit logs and take appropriate action if necessary.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notifyAPIKeyCreated(keyName, createdBy) {
    const subject = `🔑 API Key Created - ${keyName}`;
    const html = `
      <h2>New API Key Created</h2>
      <p><strong>Key Name:</strong> ${keyName}</p>
      <p><strong>Created By:</strong> ${createdBy}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This key now has programmatic access to the admin panel.</p>
      <p>Monitor its usage in the security dashboard.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  async notifyIPBlacklisted(ip, addedBy) {
    const subject = `🚫 IP Address Blacklisted - ${ip}`;
    const html = `
      <h2>IP Address Added to Blacklist</h2>
      <p><strong>IP Address:</strong> ${ip}</p>
      <p><strong>Added By:</strong> ${addedBy}</p>
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      <hr>
      <p>This IP address is now blocked from accessing the admin panel.</p>
    `;

    await this.send(this.adminEmail, subject, html);
  }

  // Helper to get user email (would integrate with user manager)
  async getUserEmail(username) {
    // This would integrate with your user management system
    // For now, return admin email
    return { email: this.adminEmail };
  }
}

export const emailNotifier = new EmailNotifier();

// ==
// IN-APP NOTIFICATIONS
// ==

class InAppNotifier {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 100;
  }

  add(type, title, message, metadata = {}) {
    const notification = {
      id: Date.now() + Math.random(),
      type, // success, warning, error, info
      title,
      message,
      metadata,
      timestamp: new Date().toISOString(),
      read: false
    };

    this.notifications.unshift(notification);

    // Keep only recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }

    return notification;
  }

  getAll(unreadOnly = false) {
    if (unreadOnly) {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
  }

  delete(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clear() {
    this.notifications = [];
  }
}

export const inAppNotifier = new InAppNotifier();

export default {
  emailNotifier,
  inAppNotifier
};
