/**
 * Tillerstead Admin Panel Backend
 * Express server with authentication and API for managing calculators & website content
 */

import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import yaml from 'js-yaml';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.ADMIN_PORT || 3001;

// Admin credentials (in production, use environment variables and proper DB)
const ADMIN_USERS = {
  admin: {
    username: 'admin',
    // Default password: 'tillerstead2026' - CHANGE THIS!
    passwordHash: '$2b$10$K8OvMmzY5bD5x6FpN3rJNurKWn2VNx9.EoEQPV9zWqPGUoKnE8WDi'
  }
};

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'tillerstead-admin-secret-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// ============================================
// AUTHENTICATION MIDDLEWARE
// ============================================

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
}

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  const user = ADMIN_USERS[username];
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  req.session.userId = username;
  res.json({ success: true, username });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ authenticated: true, username: req.session.userId });
  } else {
    res.json({ authenticated: false });
  }
});

// ============================================
// CALCULATOR API ROUTES
// ============================================

// Get calculator configuration from tools.js
app.get('/api/calculators/config', requireAuth, async (req, res) => {
  try {
    const toolsPath = path.join(__dirname, '..', 'assets', 'js', 'tools.js');
    const toolsContent = await fs.readFile(toolsPath, 'utf8');
    
    // Extract constants from tools.js
    const config = extractCalculatorConfig(toolsContent);
    res.json(config);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update calculator configuration
app.put('/api/calculators/config', requireAuth, async (req, res) => {
  try {
    const { presets } = req.body;
    const toolsPath = path.join(__dirname, '..', 'assets', 'js', 'tools.js');
    let toolsContent = await fs.readFile(toolsPath, 'utf8');
    
    // Update the constants in tools.js
    toolsContent = updateCalculatorConfig(toolsContent, presets);
    
    // Backup original file
    const backupPath = `${toolsPath}.backup.${Date.now()}`;
    await fs.copyFile(toolsPath, backupPath);
    
    // Write updated content
    await fs.writeFile(toolsPath, toolsContent, 'utf8');
    
    res.json({ success: true, message: 'Calculator configuration updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// WEBSITE CONTENT API ROUTES
// ============================================

// List all data files
app.get('/api/content/files', requireAuth, async (req, res) => {
  try {
    const dataDir = path.join(__dirname, '..', '_data');
    const files = await fs.readdir(dataDir);
    const ymlFiles = files.filter(f => f.endsWith('.yml'));
    
    const fileList = await Promise.all(ymlFiles.map(async (filename) => {
      const filePath = path.join(dataDir, filename);
      const stats = await fs.stat(filePath);
      return {
        name: filename,
        path: filename,
        size: stats.size,
        modified: stats.mtime
      };
    }));
    
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get content file
app.get('/api/content/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', '_data', filename);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..', '_data'))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    const data = yaml.load(content);
    
    res.json({
      filename,
      content,
      parsed: data
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content file
app.put('/api/content/file/:filename', requireAuth, async (req, res) => {
  try {
    const { filename } = req.params;
    const { content } = req.body;
    const filePath = path.join(__dirname, '..', '_data', filename);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(path.join(__dirname, '..', '_data'))) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Validate YAML
    try {
      yaml.load(content);
    } catch (yamlError) {
      return res.status(400).json({ error: 'Invalid YAML syntax: ' + yamlError.message });
    }
    
    // Backup original file
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copyFile(filePath, backupPath);
    
    // Write updated content
    await fs.writeFile(filePath, content, 'utf8');
    
    res.json({ success: true, message: 'Content file updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// SITE SETTINGS / TOGGLES API
// ============================================

// Get site configuration
app.get('/api/settings', requireAuth, async (req, res) => {
  try {
    const configPath = path.join(__dirname, '..', '_config.yml');
    const content = await fs.readFile(configPath, 'utf8');
    const config = yaml.load(content);
    
    res.json({ config, raw: content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update site configuration
app.put('/api/settings', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    const configPath = path.join(__dirname, '..', '_config.yml');
    
    // Validate YAML
    try {
      yaml.load(content);
    } catch (yamlError) {
      return res.status(400).json({ error: 'Invalid YAML syntax: ' + yamlError.message });
    }
    
    // Backup original file
    const backupPath = `${configPath}.backup.${Date.now()}`;
    await fs.copyFile(configPath, backupPath);
    
    // Write updated content
    await fs.writeFile(configPath, content, 'utf8');
    
    res.json({ success: true, message: 'Site configuration updated. Restart Jekyll to apply changes.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractCalculatorConfig(toolsContent) {
  const config = {
    tilePresets: [],
    layoutPresets: [],
    jointPresets: [],
    trowelPresets: []
  };
  
  // Extract TILE_PRESETS array
  const tileMatch = toolsContent.match(/const TILE_PRESETS = \[([\s\S]*?)\];/);
  if (tileMatch) {
    config.tilePresets = tileMatch[1];
  }
  
  // Extract LAYOUT_PRESETS array
  const layoutMatch = toolsContent.match(/const LAYOUT_PRESETS = \[([\s\S]*?)\];/);
  if (layoutMatch) {
    config.layoutPresets = layoutMatch[1];
  }
  
  // Extract JOINT_PRESETS array
  const jointMatch = toolsContent.match(/const JOINT_PRESETS = \[([\s\S]*?)\];/);
  if (jointMatch) {
    config.jointPresets = jointMatch[1];
  }
  
  // Extract TROWEL_PRESETS array
  const trowelMatch = toolsContent.match(/const TROWEL_PRESETS = \[([\s\S]*?)\];/);
  if (trowelMatch) {
    config.trowelPresets = trowelMatch[1];
  }
  
  return config;
}

function updateCalculatorConfig(toolsContent, presets) {
  let updated = toolsContent;
  
  if (presets.tilePresets) {
    updated = updated.replace(
      /const TILE_PRESETS = \[[\s\S]*?\];/,
      `const TILE_PRESETS = ${presets.tilePresets};`
    );
  }
  
  if (presets.layoutPresets) {
    updated = updated.replace(
      /const LAYOUT_PRESETS = \[[\s\S]*?\];/,
      `const LAYOUT_PRESETS = ${presets.layoutPresets};`
    );
  }
  
  if (presets.jointPresets) {
    updated = updated.replace(
      /const JOINT_PRESETS = \[[\s\S]*?\];/,
      `const JOINT_PRESETS = ${presets.jointPresets};`
    );
  }
  
  if (presets.trowelPresets) {
    updated = updated.replace(
      /const TROWEL_PRESETS = \[[\s\S]*?\];/,
      `const TROWEL_PRESETS = ${presets.trowelPresets};`
    );
  }
  
  return updated;
}

// ============================================
// SERVE ADMIN PANEL HTML
// ============================================

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log(`\n🔧 Tillerstead Admin Panel`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Login at http://localhost:${PORT}/login`);
  console.log(`📊 Dashboard at http://localhost:${PORT}`);
  console.log(`\n⚠️  Default credentials:`);
  console.log(`   Username: admin`);
  console.log(`   Password: tillerstead2026`);
  console.log(`   CHANGE THESE IMMEDIATELY!\n`);
});
