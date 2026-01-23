# Quick Start Guide - Tillerstead Admin Panel

Get your admin dashboard running in 3 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

This installs Express, bcrypt, and other required packages.

## Step 2: Start the Admin Server

```bash
npm run admin
```

You should see:

```
🔧 Tillerstead Admin Panel
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server running on http://localhost:3001
🔐 Login at http://localhost:3001/login
📊 Dashboard at http://localhost:3001

⚠️  Default credentials:
   Username: admin
   Password: tillerstead2026
   CHANGE THESE IMMEDIATELY!
```

## Step 3: Access Admin Panel

1. Open http://localhost:3001/login in your browser
2. Login with:
   - **Username:** `admin`
   - **Password:** `tillerstead2026`
3. You'll be redirected to the dashboard

## Step 4: Change Default Password (IMPORTANT!)

Run the password generator:

```bash
node admin/generate-password.js
```

Follow the prompts to generate a new password hash, then update `admin/server.js`.

## What You Can Do

✅ **Edit Calculator Settings**
- Tile presets (sizes, types)
- Layout patterns (brick, herringbone, diagonal)
- Joint widths
- Trowel sizes and coverage rates

✅ **Manage Website Content**
- Services descriptions
- Portfolio projects
- FAQ entries
- Customer reviews
- Product listings

✅ **Configure Site Settings**
- Edit _config.yml
- Update site metadata
- Configure Jekyll settings

✅ **Toggle Features**
- Enable/disable premium animations
- PWA features on/off
- SEO enhancements
- Analytics tracking
- Contact forms
- Calculator tools

## Running Both Servers

Run the admin panel alongside your Jekyll site:

```bash
# Terminal 1: Admin Panel
npm run admin

# Terminal 2: Jekyll Site
npm run dev:watch
```

Now you have:
- Admin panel at http://localhost:3001
- Public website at http://localhost:4000

## Troubleshooting

**"Port already in use"**
- Stop other processes using port 3001
- Or change the port in `admin/server.js`

**"Cannot find module"**
- Run `npm install` from the project root

**Changes not showing**
- YAML files: Rebuild Jekyll
- _config.yml: Restart Jekyll completely
- Calculator config: Hard refresh browser (Ctrl+F5)

## Security Reminder

⚠️ The default password is for development only. Change it before deploying to production!

## Need Help?

See the full documentation: [admin/README.md](admin/README.md)

---

**Happy administrating! 🚀**
