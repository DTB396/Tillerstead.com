# Admin & Security Features - Quick Reference

## 🎯 What's New

### Security Features Added
- ✅ Two-Factor Authentication (2FA)
- ✅ Rate Limiting & Brute Force Protection
- ✅ Audit Logging (tracks all admin actions)
- ✅ API Key Management
- ✅ IP Whitelist/Blacklist
- ✅ Role-Based Access Control (RBAC)
- ✅ Enhanced Session Security
- ✅ Security Headers (Helmet.js)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

New packages installed:
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `speakeasy` - 2FA TOTP codes
- `qrcode` - QR code generation

### 2. Verify Installation
```bash
node admin/verify-security.js
```

### 3. Start Admin Server
```bash
npm run admin
```

### 4. Access Security Dashboard
```
http://localhost:3001/security
```

## 🔐 Essential Setup Tasks

### Change Default Password
```bash
node admin/generate-password.js
```
Then update `admin/server.js` with new hash.

### Enable 2FA (Recommended)
1. Go to Security Dashboard
2. Click "Enable 2FA"
3. Scan QR code with authenticator app
4. Enter code to verify
5. **Save backup codes securely!**

### Set Session Secret (Production)
Create `.env` file:
```bash
SESSION_SECRET=<random-64-char-hex-string>
NODE_ENV=production
```

Generate random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Security Dashboard Features

### Overview Tab
- Real-time security metrics
- Login attempts tracking
- Failed login monitoring
- High-severity event alerts

### Two-Factor Auth Tab
- Enable/disable 2FA
- Regenerate backup codes
- View 2FA status

### Audit Logs Tab
- View all admin activities
- Filter by event type
- High-severity event filtering
- Tracks: logins, file changes, config updates

### API Keys Tab
- Create API keys for programmatic access
- Track key usage
- Revoke keys

### IP Filter Tab
- Whitelist trusted IPs
- Blacklist malicious IPs
- Dual-mode operation

### User Roles Tab
- View available roles (Admin, Editor, Viewer)
- See permission breakdown
- Future: Assign roles to users

## 🛡️ Security Features Explained

### Rate Limiting
Prevents abuse:
- **Login**: 5 attempts per 15 minutes
- **General API**: 100 requests per 15 minutes
- **File Mods**: 30 requests per minute

Exceeding limits returns HTTP 429 error.

### Brute Force Protection
- 5 failed login attempts → 15-minute lockout
- Tracks by IP address
- Auto-resets on successful login

### Audit Logging
All actions logged to `logs/audit.log`:
```json
{
  "timestamp": "2026-01-23T14:30:00.000Z",
  "event": "login_success",
  "user": "admin",
  "ip": "192.168.1.100",
  "severity": "low"
}
```

Severity levels: low, medium, high, critical

### API Keys
Secure programmatic access:
```bash
curl -H "X-API-Key: ts_your_key" http://localhost:3001/api/endpoint
```

### IP Filtering
**Whitelist mode** (when whitelist has entries):
- Only whitelisted IPs can access

**Blacklist mode** (when whitelist empty):
- All IPs except blacklisted can access

### Role-Based Access
Three built-in roles:
- **Admin**: Full access (`*`)
- **Editor**: Content + calculators
- **Viewer**: Read-only

## 📁 New Files Added

```
admin/
  security.js                 - Security middleware & utilities
  auth-enhanced.js            - 2FA and RBAC implementation
  verify-security.js          - Setup verification script
  public/
    security.html             - Security dashboard UI
    security-app.js           - Security dashboard logic

config/                       - Auto-created for API keys
logs/                         - Auto-created for audit logs
SECURITY-GUIDE.md             - Complete documentation
ADMIN-SECURITY-QUICK.md       - This file
```

## 🔧 Configuration

### server.js Changes
Enhanced with:
- Security middleware integration
- 2FA verification endpoints
- Audit logging on all routes
- Security API endpoints
- Rate limiting on auth routes

### package.json Changes
New dependencies:
```json
{
  "helmet": "^8.0.0",
  "express-rate-limit": "^7.1.5",
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3"
}
```

## 🎯 Common Tasks

### Enable 2FA
1. Security Dashboard → Two-Factor Auth
2. "Enable 2FA" button
3. Scan QR code with Google Authenticator/Authy
4. Enter verification code
5. Save 10 backup codes

### View Audit Logs
1. Security Dashboard → Audit Logs
2. Select filter (All, Login, File Ops, High Severity)
3. Review recent activities

### Create API Key
1. Security Dashboard → API Keys
2. "Create New API Key"
3. Enter name (e.g., "Integration Key")
4. **Copy key immediately** (won't show again)

### Whitelist Your IP
1. Security Dashboard → IP Filter
2. Enter your IP in Whitelist field
3. Click "Add"
4. Only whitelisted IPs can now access

### Check Security Status
```bash
curl http://localhost:3001/api/security/overview
```

## 🐛 Troubleshooting

### "Too many login attempts"
Wait 15 minutes or check audit logs for your IP.

### "Invalid 2FA code"
- Sync device time
- Try backup code
- Regenerate codes if needed

### "Access denied from this IP"
- Check if your IP is blacklisted
- If using whitelist, add your IP

### Session expired
Sessions expire after 24 hours. Log in again.

## 📚 Documentation

Full documentation: **SECURITY-GUIDE.md**

Covers:
- Detailed feature explanations
- API reference
- Production deployment checklist
- Security monitoring
- Troubleshooting guide

## ✅ Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Set SESSION_SECRET environment variable
- [ ] Enable 2FA for all admin accounts
- [ ] Configure IP whitelist (if needed)
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Review audit logs regularly
- [ ] Set up log backups
- [ ] Test 2FA recovery process
- [ ] Document backup code storage location

## 🆘 Quick Help

**Start admin server:**
```bash
npm run admin
```

**Verify security setup:**
```bash
node admin/verify-security.js
```

**Generate password hash:**
```bash
node admin/generate-password.js
```

**View real-time logs:**
```bash
tail -f logs/audit.log
```

**Check server status:**
```bash
curl http://localhost:3001/api/auth/check
```

---

**Created:** January 23, 2026  
**Version:** 2.0.0  
**For:** Tillerstead Admin Panel
