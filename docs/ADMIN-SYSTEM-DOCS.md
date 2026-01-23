# Tillerstead Admin Panel - Complete System Documentation

## 🎯 Overview

A full-featured admin panel backend dashboard with login access for managing calculators and website content online. Built with Node.js/Express backend, secure authentication, and modern responsive UI.

## 📦 What's Included

### Backend Components
- **Express Server** - RESTful API with authentication
- **Session Management** - Secure cookie-based sessions
- **Password Security** - bcrypt hashing (10 rounds)
- **Auto-Backup System** - Timestamped backups before saves
- **YAML Parser** - Full support for Jekyll data files
- **File Security** - Path traversal protection

### Frontend Components
- **Login Page** - Modern gradient design with form validation
- **Dashboard** - Overview with stats and quick links
- **Calculator Editor** - Manage tile/layout/joint/trowel presets
- **Content Editor** - YAML file editor with live preview
- **Settings Manager** - Direct _config.yml editing
- **Feature Toggles** - Visual switches for site features
- **Toast Notifications** - Success/error feedback

### File Structure
```
admin/
├── server.js                 # Express backend (470 lines)
├── generate-password.js      # Password hash generator
├── README.md                 # Full documentation
├── .env.example             # Environment template
├── .gitignore               # Git exclusions
└── public/                  # Frontend assets
    ├── login.html           # Login interface (170 lines)
    ├── dashboard.html       # Main dashboard (290 lines)
    ├── admin-styles.css     # Complete UI styles (700 lines)
    └── admin-app.js         # Frontend logic (400 lines)

ADMIN-QUICKSTART.md          # Quick start guide
start-admin.ps1              # PowerShell startup script
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

Installs: express, express-session, bcrypt, js-yaml, nodemon

### 2. Start Admin Server

**Development mode (auto-restart):**
```bash
npm run admin:dev
```

**Production mode:**
```bash
npm run admin
```

**Or use the PowerShell script:**
```powershell
.\start-admin.ps1
.\start-admin.ps1 -Port 8080 -Env production
```

### 3. Access Dashboard

Open http://localhost:3001/login

**Default Credentials:**
- Username: `admin`
- Password: `tillerstead2026`

⚠️ **CHANGE IMMEDIATELY!**

## 🔐 Security Features

✅ **Password Hashing** - bcrypt with 10 salt rounds  
✅ **Session Management** - HTTP-only cookies, 24hr expiration  
✅ **Path Traversal Protection** - Validates all file paths  
✅ **YAML Validation** - Prevents syntax errors  
✅ **Auto-Backup** - Every save creates timestamped backup  
✅ **CSRF Ready** - Session-based auth (add CSRF tokens for production)

### Change Password

Generate new hash:
```bash
node admin/generate-password.js
```

Update `admin/server.js`:
```javascript
const ADMIN_USERS = {
  admin: {
    username: 'admin',
    passwordHash: 'YOUR_NEW_HASH'
  }
};
```

## 📊 Features Breakdown

### 1. Calculator Configuration
Edit all calculator presets from `assets/js/tools.js`:

- **Tile Presets** (14 presets)
  - Mosaic (1x1, 2x2 sheets)
  - Standard (3x6 subway, 4x4, 6x6, 12x12)
  - Large Format (12x24, 24x24, 24x48)
  - Planks (6x24, 8x48, 12x48)
  - Custom sizes

- **Layout Patterns** (7 patterns)
  - Straight/Stacked (10% waste)
  - 1/3 Offset LFT-safe (12% waste)
  - 50% Brick (15% waste)
  - Diagonal (18% waste)
  - Herringbone (25% waste)
  - Mosaic sheets (12% waste)

- **Joint Widths** (5 presets)
  - 1/16" minimum
  - 1/8" rectified
  - 3/16" calibrated
  - 1/4" rustic
  - Custom

- **Trowel Sizes** (6 sizes)
  - 3/16" V-notch
  - 1/4" × 1/4" square
  - 1/4" × 3/8" square
  - 1/2" × 1/2" square
  - 3/4" U-notch @ 45°
  - 3/4" U-notch @ 30°

### 2. Website Content Editor

Edit YAML data files:

| File | Content |
|------|---------|
| `services.yml` | Service descriptions, icons, points, URLs |
| `portfolio.yml` | Project showcases with images |
| `faq.yml` | FAQ questions and answers |
| `reviews.yml` | Customer testimonials |
| `products.yml` | Product listings |
| `home.yml` | Homepage content blocks |
| `navigation.yml` | Site navigation structure |

Features:
- Syntax validation before save
- Auto-backup on every change
- Real-time file list
- Code editor with monospace font

### 3. Site Settings Manager

Direct editing of `_config.yml`:
- Site title, description, URL
- Jekyll configuration
- Plugin settings
- Build options
- Custom variables

⚠️ Requires Jekyll restart after changes

### 4. Feature Toggles

Visual on/off switches for:

| Toggle | Controls |
|--------|----------|
| Premium Features | Advanced animations, micro-interactions |
| PWA Features | Offline support, install prompt |
| SEO Enhancements | Schema markup, meta tags |
| Analytics | Google Analytics tracking |
| Contact Forms | Form submission endpoints |
| Calculators | All calculator tools |

## 🌐 API Reference

### Authentication

**POST /api/auth/login**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**POST /api/auth/logout**  
Destroys session

**GET /api/auth/status**  
Returns: `{ authenticated: true, username: "admin" }`

### Calculator Config

**GET /api/calculators/config**  
Returns extracted presets from tools.js

**PUT /api/calculators/config**
```json
{
  "presets": {
    "tilePresets": "...",
    "layoutPresets": "...",
    "jointPresets": "...",
    "trowelPresets": "..."
  }
}
```

### Website Content

**GET /api/content/files**  
Returns list of YAML files with metadata

**GET /api/content/file/:filename**
```json
{
  "filename": "services.yml",
  "content": "services:\n  - id: tile\n    ...",
  "parsed": { "services": [...] }
}
```

**PUT /api/content/file/:filename**
```json
{
  "content": "updated YAML content"
}
```

### Site Settings

**GET /api/settings**
```json
{
  "config": { "title": "Tillerstead", ... },
  "raw": "title: Tillerstead\n..."
}
```

**PUT /api/settings**
```json
{
  "content": "updated _config.yml content"
}
```

## 🛠 Development

### Run Both Servers Simultaneously

```bash
# Terminal 1: Admin panel
npm run admin:dev

# Terminal 2: Jekyll site
npm run dev:watch
```

Access:
- **Admin:** http://localhost:3001
- **Website:** http://localhost:4000

### Adding New Features

1. **Add API Route** in `admin/server.js`:
```javascript
app.get('/api/my-feature', requireAuth, async (req, res) => {
  // Your logic
  res.json({ data: 'result' });
});
```

2. **Add UI Section** in `admin/public/dashboard.html`:
```html
<div id="view-myfeature" class="view">
  <!-- Your interface -->
</div>
```

3. **Add Handler** in `admin/public/admin-app.js`:
```javascript
async function loadMyFeature() {
  const response = await fetch('/api/my-feature');
  const data = await response.json();
  // Update UI
}
```

4. **Add Styles** in `admin/public/admin-styles.css`

## 📋 Production Checklist

Before deploying to production:

- [ ] Change default password
- [ ] Set `SESSION_SECRET` environment variable
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS/SSL
- [ ] Add firewall rules (restrict to VPN/trusted IPs)
- [ ] Consider adding 2FA
- [ ] Move users to database (PostgreSQL/MongoDB)
- [ ] Add rate limiting (express-rate-limit)
- [ ] Set up monitoring (PM2, logs)
- [ ] Configure reverse proxy (nginx)
- [ ] Add CSRF protection
- [ ] Set proper CORS headers
- [ ] Enable compression
- [ ] Add audit logging

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't login | Check credentials, clear cookies |
| Port in use | Change port in server.js or stop other process |
| Changes not showing | Rebuild Jekyll, hard refresh browser |
| Module not found | Run `npm install` |
| Permission errors | Check file permissions on _data/ directory |

## 📈 Future Enhancements

Possible additions:
- Multi-user support with roles (admin, editor, viewer)
- Database integration (PostgreSQL)
- Real-time preview of changes
- Image upload and management
- Audit log of all changes
- Email notifications on changes
- Two-factor authentication
- API key management
- Scheduled content publishing
- Content version history
- Bulk operations
- Export/import functionality

## 📄 License

Part of Tillerstead.com project. All rights reserved.

## 🆘 Support

For issues:
1. Check [ADMIN-QUICKSTART.md](ADMIN-QUICKSTART.md)
2. Check [admin/README.md](admin/README.md)
3. Review server logs
4. Contact development team

---

**Built with ❤️ for Tillerstead - Professional Tile Installation**

Version 1.0.0 | Last Updated: January 2026
