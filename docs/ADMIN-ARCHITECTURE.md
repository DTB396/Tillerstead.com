# Tillerstead Admin Panel - System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TILLERSTEAD ADMIN PANEL                       │
│                     Complete Backend Dashboard System                │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────┐    ┌──────────────────────────────────────┐  │
│  │   Login Page    │    │        Admin Dashboard               │  │
│  │   (login.html)  │───▶│      (dashboard.html)               │  │
│  │                 │    │                                      │  │
│  │  • Username     │    │  ┌───────────┐  ┌──────────────┐   │  │
│  │  • Password     │    │  │ Dashboard │  │ Calculators  │   │  │
│  │  • Remember Me  │    │  │  View     │  │   Config     │   │  │
│  │  • Auth Check   │    │  └───────────┘  └──────────────┘   │  │
│  └─────────────────┘    │                                      │  │
│                          │  ┌───────────┐  ┌──────────────┐   │  │
│  ┌─────────────────┐    │  │  Content  │  │   Settings   │   │  │
│  │  admin-app.js   │───▶│  │  Editor   │  │   Manager    │   │  │
│  │                 │    │  └───────────┘  └──────────────┘   │  │
│  │  • Navigation   │    │                                      │  │
│  │  • API Calls    │    │  ┌───────────┐  ┌──────────────┐   │  │
│  │  • State Mgmt   │    │  │  Feature  │  │    Stats     │   │  │
│  │  • Toasts       │    │  │  Toggles  │  │   Display    │   │  │
│  └─────────────────┘    │  └───────────┘  └──────────────┘   │  │
│                          │                                      │  │
│  ┌─────────────────┐    └──────────────────────────────────────┘  │
│  │admin-styles.css │                                                │
│  │  • Responsive   │                                                │
│  │  • Modern UI    │                                                │
│  │  • Animations   │                                                │
│  └─────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP/JSON
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                          MIDDLEWARE LAYER                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Express.js Server                           │  │
│  │                    (admin/server.js)                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Session       │  │  Body Parser    │  │  Static Files   │   │
│  │   Middleware    │  │   Middleware    │  │   Middleware    │   │
│  │                 │  │                 │  │                 │   │
│  │  • Cookie Store │  │  • JSON Parser  │  │  • /public/     │   │
│  │  • 24hr Expire  │  │  • URL Encoded  │  │  • /assets/     │   │
│  │  • HTTP-only    │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │             Authentication Middleware                        │   │
│  │  • requireAuth() - Protects all /api/* routes              │   │
│  │  • Session validation                                        │   │
│  │  • 401 responses for unauthorized                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ Function Calls
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                           API ROUTES LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/auth/*          Authentication Routes                  │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  POST   /login       ─▶ Validate credentials, create session│   │
│  │  POST   /logout      ─▶ Destroy session                     │   │
│  │  GET    /status      ─▶ Check authentication status         │   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/calculators/*   Calculator Configuration Routes        │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  GET    /config      ─▶ Extract presets from tools.js      │   │
│  │  PUT    /config      ─▶ Update presets in tools.js         │   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/content/*       Content Management Routes              │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  GET    /files       ─▶ List all _data/*.yml files         │   │
│  │  GET    /file/:name  ─▶ Read YAML file content             │   │
│  │  PUT    /file/:name  ─▶ Update YAML file + backup          │   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │ /api/settings        Site Settings Routes                   │    │
│  ├────────────────────────────────────────────────────────────┤    │
│  │  GET    /settings    ─▶ Read _config.yml                   │   │
│  │  PUT    /settings    ─▶ Update _config.yml + backup        │   │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ File I/O
                                    │
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA/FILE LAYER                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐   ┌──────────────────┐   ┌───────────────┐  │
│  │  Calculator Data │   │  Website Content │   │ Site Settings │  │
│  ├──────────────────┤   ├──────────────────┤   ├───────────────┤  │
│  │ assets/js/       │   │ _data/           │   │ _config.yml   │  │
│  │   tools.js       │   │   services.yml   │   │               │  │
│  │                  │   │   portfolio.yml  │   │ Features:     │  │
│  │ Contains:        │   │   faq.yml        │   │  • Title      │  │
│  │  • TILE_PRESETS  │   │   reviews.yml    │   │  • URL        │  │
│  │  • LAYOUT_PRESETS│   │   products.yml   │   │  • Plugins    │  │
│  │  • JOINT_PRESETS │   │   home.yml       │   │  • Build cfg  │  │
│  │  • TROWEL_PRESETS│   │   navigation.yml │   │               │  │
│  └──────────────────┘   └──────────────────┘   └───────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    Backup System                              │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │  Auto-creates timestamped backups before every save:         │  │
│  │  • services.yml.backup.1737652800000                         │  │
│  │  • _config.yml.backup.1737652800000                          │  │
│  │  • tools.js.backup.1737652800000                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ Password Hashing       ─▶  bcrypt (10 salt rounds)              │
│  ✓ Session Management     ─▶  express-session (HTTP-only cookies)  │
│  ✓ Path Traversal Guard   ─▶  Validates all file paths             │
│  ✓ YAML Validation        ─▶  Prevents syntax errors               │
│  ✓ Auto-Backup            ─▶  Before every destructive operation   │
│  ✓ Authentication Check   ─▶  requireAuth middleware               │
│  ✓ Session Expiration     ─▶  24 hour timeout                      │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        DEPLOYMENT FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Developer Action          │  System Response                       │
│  ──────────────────────────┼─────────────────────────────────────  │
│                             │                                        │
│  1. npm install            │  Install dependencies                  │
│  2. npm run admin:verify   │  Check installation                    │
│  3. npm run admin          │  Start Express server (port 3001)      │
│  4. Open login page        │  Serve login.html                      │
│  5. Enter credentials      │  Validate with bcrypt                  │
│  6. Create session         │  Set HTTP-only cookie                  │
│  7. Access dashboard       │  Serve dashboard.html                  │
│  8. Edit content           │  Load YAML from _data/                 │
│  9. Save changes           │  Backup → Validate → Write             │
│  10. View changes          │  Rebuild Jekyll (manual)               │
│                             │                                        │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                     TECHNOLOGY STACK                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Backend:                   Frontend:                                │
│  • Node.js (>=18)          • Vanilla JavaScript (ES6+)             │
│  • Express.js 4.18         • Modern CSS3 (Grid, Flexbox)           │
│  • express-session 1.17    • HTML5                                  │
│  • bcrypt 5.1              • Fetch API                              │
│  • js-yaml 4.1             • CSS Variables                          │
│  • fs/promises (Node API)  • Responsive Design                      │
│                                                                      │
│  Development:               Security:                                │
│  • nodemon 3.0             • Password Hashing                       │
│  • PowerShell scripts      • Session Cookies                        │
│  • Verification tools      • Path Validation                        │
│                            • YAML Sanitization                       │
└─────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════
                         SYSTEM STATISTICS
═══════════════════════════════════════════════════════════════════════

  Total Files Created:        12 files
  Total Lines of Code:        2,030+ lines
  Backend Code:              470 lines (server.js)
  Frontend HTML:             460 lines (login + dashboard)
  Frontend JavaScript:       400 lines (admin-app.js)
  CSS Styles:                700 lines (admin-styles.css)
  
  API Endpoints:             11 routes
  Security Features:         7 layers
  Documentation Files:       4 guides
  Supported Data Files:      All _data/*.yml files
  
═══════════════════════════════════════════════════════════════════════
