# Security Features Documentation

**Complete security system for Tillerstead Admin Panel**

## 🛡️ Security Features Overview

The admin panel now includes enterprise-grade security features to protect your website and sensitive data.

### Features Implemented

1. ✅ **Rate Limiting** - Prevent brute force attacks
2. ✅ **Two-Factor Authentication (2FA)** - Extra account security layer
3. ✅ **Role-Based Access Control (RBAC)** - Granular permissions
4. ✅ **Audit Logging** - Track all admin activities
5. ✅ **API Key Management** - Secure programmatic access
6. ✅ **IP Whitelist/Blacklist** - Control access by IP address
7. ✅ **Brute Force Protection** - Automatic lockout after failed attempts
8. ✅ **Security Headers** - Helmet.js protection
9. ✅ **Session Security** - HTTP-only, secure cookies

---

## 📦 Installation

### 1. Install New Dependencies

```bash
npm install
```

New packages added:
- `helmet` (^8.0.0) - Security headers
- `express-rate-limit` (^7.1.5) - Rate limiting
- `speakeasy` (^2.0.0) - 2FA TOTP generation
- `qrcode` (^1.5.3) - QR code generation for 2FA

### 2. Start Admin Server

```bash
npm run admin
```

The server will start with enhanced security enabled automatically.

---

## 🔐 Security Dashboard

Access the security dashboard at:
```
http://localhost:3001/security
```

### Dashboard Sections

1. **Overview** - Real-time security metrics
2. **Two-Factor Auth** - Enable/disable 2FA
3. **Audit Logs** - View all admin activities
4. **API Keys** - Create and manage API keys
5. **IP Filter** - Whitelist/blacklist IP addresses
6. **User Roles** - View role permissions

---

## 🔒 Two-Factor Authentication (2FA)

### Setup Process

1. Navigate to Security Dashboard → Two-Factor Auth
2. Click "Enable 2FA"
3. Scan QR code with authenticator app (Google Authenticator, Authy, etc.)
4. Enter verification code
5. **SAVE BACKUP CODES** - Store these safely!

### Login with 2FA

1. Enter username and password
2. System prompts for 2FA code
3. Enter 6-digit code from authenticator app
4. Access granted

### Backup Codes

- 10 single-use backup codes generated
- Use if you lose access to authenticator
- Regenerate codes from Security Dashboard
- Store in secure location (password manager, safe)

### Disable 2FA

1. Go to Security Dashboard
2. Click "Disable 2FA"
3. Enter current 2FA code to confirm

---

## 🚦 Rate Limiting

Automatic protection against abuse:

### Limits Applied

| Endpoint | Limit | Window |
|----------|-------|--------|
| Login attempts | 5 requests | 15 minutes |
| General API | 100 requests | 15 minutes |
| File modifications | 30 requests | 1 minute |

### Behavior

- Exceeding limit returns HTTP 429 (Too Many Requests)
- Wait for window to expire
- Successful requests don't count toward limit

---

## 🔨 Brute Force Protection

Enhanced login security:

### Features

- **Max Attempts**: 5 failed logins per 15 minutes
- **Lockout Duration**: 15 minutes
- **IP-Based Tracking**: Tracks by IP address
- **Auto-Reset**: Successful login clears attempts

### Lockout Behavior

When locked out:
```json
{
  "error": "Account temporarily locked",
  "unlockTime": "2026-01-23T15:30:00.000Z",
  "remainingTime": "12 minutes"
}
```

---

## 📋 Audit Logging

All admin activities are logged automatically.

### Log Locations

```
logs/audit.log
```

### Log Entry Format

```json
{
  "timestamp": "2026-01-23T14:30:00.000Z",
  "event": "login_success",
  "user": "admin",
  "ip": "192.168.1.100",
  "details": { "method": "POST" },
  "severity": "low"
}
```

### Severity Levels

- **Low**: Normal operations (login, file read)
- **Medium**: Modifications (file write, user created)
- **High**: Sensitive actions (config change, file delete)
- **Critical**: Security events (data breach attempt)

### Events Tracked

- Login success/failure
- Logout
- File read/write/delete
- Config changes
- User management
- Permission denied
- 2FA enable/disable
- API key creation/revocation
- IP filter changes

### View Logs

Security Dashboard → Audit Logs

Filters available:
- All Events
- Login Events
- File Operations
- High Severity Only

---

## 🔑 API Key Management

Create secure API keys for programmatic access.

### Create API Key

1. Security Dashboard → API Keys
2. Click "Create New API Key"
3. Enter descriptive name
4. **COPY KEY IMMEDIATELY** - Won't be shown again!

### Key Format

```
ts_<64-character-hex-string>
```

Example:
```
ts_a1b2c3d4e5f6...
```

### Using API Keys

Include in request headers:

```bash
curl -H "X-API-Key: ts_your_key_here" \
  http://localhost:3001/api/endpoint
```

### Key Tracking

Dashboard shows:
- Key name
- Created date
- Last used date
- Usage count

### Revoke Keys

Click "Revoke" button next to key in dashboard.

---

## 🌐 IP Address Filtering

Control access by IP address.

### Whitelist Mode

When whitelist has entries:
- **Only** whitelisted IPs can access admin panel
- All other IPs blocked
- Useful for restricting to office/home IP

### Blacklist Mode

When whitelist is empty:
- All IPs allowed except blacklisted
- Use to block specific bad actors

### Add IP to Whitelist

1. Security Dashboard → IP Filter → Whitelist
2. Enter IP address (e.g., `192.168.1.100`)
3. Click "Add"

### Add IP to Blacklist

1. Security Dashboard → IP Filter → Blacklist
2. Enter IP address
3. Click "Add"

### Remove IP

Click "×" button next to IP in list.

---

## 👥 Role-Based Access Control (RBAC)

Granular permission system for multi-user environments.

### Built-in Roles

#### Admin
- **Permissions**: All (`*`)
- **Description**: Full system access
- Can do everything

#### Editor
- **Permissions**:
  - `content:read`
  - `content:write`
  - `calculator:read`
  - `calculator:write`
- **Description**: Can edit content and calculators
- Cannot change settings or manage users

#### Viewer
- **Permissions**:
  - `content:read`
  - `calculator:read`
  - `settings:read`
- **Description**: Read-only access
- Cannot make any changes

### Permission Format

```
<category>:<action>
```

Examples:
- `content:read`
- `content:write`
- `calculator:*` (all calculator permissions)
- `*` (all permissions)

### Assign Role to User

Currently configured in code. To add users and roles:

```javascript
// In auth-enhanced.js
roleManager.assignRole('username', 'editor');
```

Future enhancement: UI for user/role management.

---

## 🔧 Security Headers

Automatic security headers via Helmet.js:

### Headers Applied

- **Content-Security-Policy**: Prevent XSS attacks
- **Strict-Transport-Security**: Force HTTPS
- **X-Content-Type-Options**: Prevent MIME sniffing
- **X-Frame-Options**: Prevent clickjacking
- **Referrer-Policy**: Control referrer information

### CSP Directives

```javascript
{
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"],
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  connectSrc: ["'self'"],
  objectSrc: ["'none'"],
  frameSrc: ["'none'"]
}
```

---

## 🔐 Session Security

Enhanced session management:

### Configuration

```javascript
{
  secret: process.env.SESSION_SECRET,
  name: 'tillerstead.sid',
  cookie: {
    secure: true,        // HTTPS only in production
    httpOnly: true,      // No JavaScript access
    maxAge: 86400000,    // 24 hours
    sameSite: 'strict',  // CSRF protection
    path: '/admin'       // Limit scope
  },
  rolling: true          // Extend on activity
}
```

### Session Features

- Auto-extends on activity (rolling sessions)
- Expires after 24 hours of inactivity
- HTTP-only cookies (can't be stolen by XSS)
- Secure cookies in production (HTTPS only)
- CSRF protection via SameSite

---

## 🛠️ Advanced Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# Session secret (REQUIRED in production)
SESSION_SECRET=your-random-secret-here

# Admin port
ADMIN_PORT=3001

# Node environment
NODE_ENV=production
```

### Generate Secure Session Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Production Checklist

- [ ] Change default admin password
- [ ] Set SESSION_SECRET environment variable
- [ ] Enable 2FA for all admin accounts
- [ ] Configure IP whitelist if needed
- [ ] Review audit logs regularly
- [ ] Enable HTTPS (set NODE_ENV=production)
- [ ] Restrict file system access
- [ ] Set up automated log backups
- [ ] Configure firewall rules
- [ ] Set up intrusion detection

---

## 📊 Security Monitoring

### Real-Time Metrics

Security Dashboard shows:
- Login attempts (24h)
- Failed logins (24h)
- Active sessions
- API key count
- Whitelisted/blacklisted IPs
- High severity events (7d)
- Suspicious activity
- Blocked attempts

### High-Severity Alerts

Events logged to console:
```
🚨 SECURITY EVENT: {
  timestamp: "...",
  event: "login_locked",
  severity: "high",
  ...
}
```

### Regular Review

Recommended schedule:
- **Daily**: Check high-severity logs
- **Weekly**: Review all audit logs
- **Monthly**: Audit API keys and IP filters
- **Quarterly**: Review user roles and permissions

---

## 🐛 Troubleshooting

### Can't Login

**Problem**: "Too many login attempts"
**Solution**: Wait 15 minutes or check audit logs for your IP

**Problem**: "2FA code invalid"
**Solution**: 
- Ensure device time is synchronized
- Try backup code
- Regenerate codes if needed

### Session Expires

**Problem**: "Unauthorized" after period of inactivity
**Solution**: Session expires after 24 hours - log in again

### API Key Not Working

**Problem**: "Invalid API key"
**Solution**:
- Verify key is correct (case-sensitive)
- Check if key was revoked
- Ensure header is `X-API-Key` (exact casing)

### IP Blocked

**Problem**: "Access denied from this IP"
**Solution**:
- Check blacklist for your IP
- If using whitelist, add your IP
- Contact admin to update IP filters

---

## 🔄 API Reference

### Security Endpoints

#### Get Security Overview
```
GET /api/security/overview
```

#### Setup 2FA
```
POST /api/auth/2fa/setup
```

#### Enable 2FA
```
POST /api/auth/2fa/enable
Body: { "token": "123456" }
```

#### Disable 2FA
```
POST /api/auth/2fa/disable
Body: { "token": "123456" }
```

#### Get Audit Logs
```
GET /api/security/audit?filter=all
Filters: all, login, file, high
```

#### Create API Key
```
POST /api/security/api-keys
Body: { "name": "Integration Key", "permissions": [] }
```

#### Revoke API Key
```
DELETE /api/security/api-keys/:hash
```

#### Add to Whitelist
```
POST /api/security/ip-filter/whitelist
Body: { "ip": "192.168.1.100" }
```

#### Add to Blacklist
```
POST /api/security/ip-filter/blacklist
Body: { "ip": "10.0.0.50" }
```

---

## 📝 Change Log

### Version 2.0.0 (Current)

**New Features:**
- Two-factor authentication (TOTP)
- Rate limiting on all endpoints
- Brute force protection
- Comprehensive audit logging
- API key management
- IP whitelist/blacklist
- Role-based access control
- Security dashboard UI
- Enhanced session security
- Security headers (Helmet.js)

**Security Improvements:**
- Input validation and sanitization
- Path traversal protection
- CSRF protection via SameSite cookies
- XSS protection via CSP
- Automated security monitoring

---

## 🆘 Support

For security issues or questions:

1. Check audit logs in Security Dashboard
2. Review this documentation
3. Check environment configuration
4. Contact system administrator

**Report Security Vulnerabilities:**
If you discover a security vulnerability, please report it privately rather than creating a public issue.

---

## 📚 Resources

### Recommended Tools

**2FA Authenticator Apps:**
- Google Authenticator (iOS/Android)
- Authy (iOS/Android/Desktop)
- Microsoft Authenticator (iOS/Android)
- 1Password (with TOTP support)

**Password Managers:**
- 1Password
- Bitwarden
- LastPass
- Dashlane

**Security Monitoring:**
- Fail2ban (for IP blocking)
- OSSEC (intrusion detection)
- Suricata (network security monitoring)

### Further Reading

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated:** January 23, 2026
**Version:** 2.0.0
