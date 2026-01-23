# Tillerstead Admin Panel

Backend dashboard portal for managing calculators and website content online.

## Features

- 🔐 **Secure Authentication** - Password-protected admin access
- 🧮 **Calculator Management** - Edit tile presets, layouts, joints, trowel sizes
- 📝 **Content Editor** - Edit YAML data files (services, portfolio, FAQs, reviews)
- ⚙️ **Site Settings** - Configure Jekyll _config.yml
- 🎛️ **Feature Toggles** - Enable/disable site features with simple switches
- 💾 **Auto-Backup** - Automatic backups before saving changes
- 🎨 **Modern UI** - Clean, responsive dashboard interface

## Installation

### 1. Install Dependencies

From the project root:

```bash
npm install
```

This installs:
- `express` - Web server framework
- `express-session` - Session management
- `bcrypt` - Password hashing
- `js-yaml` - YAML parsing
- `nodemon` - Auto-restart during development

### 2. Start the Admin Server

```bash
npm run admin
```

Or with auto-restart during development:

```bash
npm run admin:dev
```

The admin panel will be available at:
- **URL:** http://localhost:3001
- **Login:** http://localhost:3001/login
- **Dashboard:** http://localhost:3001

## Default Credentials

⚠️ **CHANGE THESE IMMEDIATELY!**

- **Username:** `admin`
- **Password:** `tillerstead2026`

## Changing the Password

To generate a new password hash:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_NEW_PASSWORD', 10, (e, h) => console.log(h));"
```

Then update the `passwordHash` in [admin/server.js](admin/server.js):

```javascript
const ADMIN_USERS = {
  admin: {
    username: 'admin',
    passwordHash: 'YOUR_NEW_HASH_HERE'
  }
};
```

## Usage Guide

### Calculator Configuration

1. Navigate to **Calculator Config** from the dashboard
2. View and edit presets for:
   - Tile sizes (mosaic, subway, planks, large format)
   - Layout patterns (straight, brick, herringbone, diagonal)
   - Joint widths (1/16", 1/8", 3/16", custom)
   - Trowel sizes (with coverage rates)
3. Click **Save All Changes** to update `assets/js/tools.js`

### Website Content Editing

1. Navigate to **Website Content**
2. Select a YAML file from the list:
   - `services.yml` - Service descriptions
   - `portfolio.yml` - Portfolio projects
   - `faq.yml` - FAQ questions and answers
   - `reviews.yml` - Customer testimonials
   - `products.yml` - Product listings
3. Edit the YAML content in the editor
4. Click **Save File** to update

### Site Settings

1. Navigate to **Site Settings**
2. Edit `_config.yml` directly in the editor
3. Click **Save Settings**
4. **Restart Jekyll** for changes to take effect

### Feature Toggles

1. Navigate to **Feature Toggles**
2. Toggle features on/off:
   - Premium animations
   - PWA features
   - SEO enhancements
   - Analytics
   - Contact forms
   - Calculators
3. Click **Save Toggle Settings**

## Security Considerations

### For Development

- Default setup uses session cookies
- Sessions expire after 24 hours
- Password is hashed with bcrypt (10 rounds)

### For Production

1. **Change default password immediately**
2. **Set environment variables:**
   ```bash
   export SESSION_SECRET="your-random-secret-key"
   export ADMIN_PORT=3001
   export NODE_ENV=production
   ```
3. **Use HTTPS** - Enable SSL/TLS
4. **Consider additional auth** - Add 2FA or SSO
5. **Restrict access** - Use firewall rules or VPN
6. **Use a database** - Replace in-memory users with PostgreSQL/MongoDB
7. **Add rate limiting** - Prevent brute force attacks

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/status` - Check auth status

### Calculators
- `GET /api/calculators/config` - Get calculator configuration
- `PUT /api/calculators/config` - Update calculator configuration

### Content
- `GET /api/content/files` - List all data files
- `GET /api/content/file/:filename` - Get file content
- `PUT /api/content/file/:filename` - Update file content

### Settings
- `GET /api/settings` - Get site configuration
- `PUT /api/settings` - Update site configuration

## File Structure

```
admin/
├── server.js              # Express backend server
├── public/                # Frontend assets
│   ├── login.html        # Login page
│   ├── dashboard.html    # Main admin dashboard
│   ├── admin-styles.css  # Dashboard styles
│   └── admin-app.js      # Frontend JavaScript
└── README.md             # This file
```

## Backup System

All edits automatically create timestamped backups:

- `_data/services.yml.backup.1737652800000`
- `_config.yml.backup.1737652800000`
- `assets/js/tools.js.backup.1737652800000`

Backups are created before every save operation.

## Troubleshooting

### Can't Login

- Check credentials (default: admin / tillerstead2026)
- Clear browser cookies
- Check server console for errors

### Changes Not Appearing

- For YAML files: Rebuild Jekyll (`npm run build`)
- For _config.yml: **Restart Jekyll completely**
- For calculator config: Hard refresh browser (Ctrl+F5)

### Server Won't Start

- Check port 3001 is available
- Ensure dependencies are installed (`npm install`)
- Check Node.js version (requires >=18.0.0)

## Development

### Adding New Features

1. **Add API route** in `server.js`
2. **Add UI section** in `dashboard.html`
3. **Add handler** in `admin-app.js`
4. **Add styles** in `admin-styles.css`

### Testing

Run the admin server alongside Jekyll:

```bash
# Terminal 1: Admin server
npm run admin:dev

# Terminal 2: Jekyll site
npm run dev:watch
```

## License

Part of the Tillerstead.com project. All rights reserved.

## Support

For issues or questions, contact the development team.
