# Configuration Files Reference

This document provides an overview of all configuration files in the Tillerstead.com project.

---

## 📁 Configuration Files

### **Git Configuration**

#### `.gitignore`
**Purpose:** Specifies files and directories that Git should ignore.

**Key Exclusions:**
- Build artifacts (`_site/`, `dist/`, `build/`)
- Dependencies (`node_modules/`, `vendor/`)
- Sensitive files (`.env`, `*.pem`, `*.key`)
- Temporary files (`*.bak`, `*.tmp`, `*.log`)
- OS files (`.DS_Store`, `Thumbs.db`)

**Security:** Never commit environment files, private keys, or sensitive data.

#### `.gitattributes`
**Purpose:** Defines Git attributes for path normalization.

**Settings:**
- LF line endings for most files (cross-platform consistency)
- CRLF for Windows-specific files (`.ps1`, `.bat`, `.cmd`)
- Binary handling for images and fonts

---

### **Ruby / Jekyll Configuration**

#### `Gemfile`
**Purpose:** Defines Ruby dependencies for Jekyll.

**Key Dependencies:**
- `jekyll` (~> 4.3) - Static site generator
- `github-pages` - GitHub Pages compatibility
- Jekyll plugins (sitemap, feed, SEO tag, paginate)

**Ruby Version:** >= 3.2, < 3.5 (updated for Ruby 3.4 compatibility)

**Groups:**
- `:jekyll_plugins` - Jekyll extensions
- `:development` - Dev-only gems (watch, bundler)

#### `_config.yml`
**Purpose:** Jekyll site configuration.

**Key Sections:**
1. **Site Identity:**
   - Title, tagline, description
   - URL and timezone
   - Business information (HIC license, contact)

2. **Build Settings:**
   - Permalink structure: `pretty`
   - Encoding: UTF-8
   - Markdown: Kramdown with Rouge highlighting
   - Strict front matter and Liquid variables

3. **Plugins:**
   - jekyll-sitemap (automatic sitemap generation)
   - jekyll-feed (RSS/Atom feed)
   - jekyll-seo-tag (SEO meta tags)
   - jekyll-paginate (blog pagination)

4. **SEO & Keywords:**
   - Primary service keywords (TCNA, South Jersey, etc.)
   - Location-based keywords (Atlantic County, Ocean County)
   - Long-tail keywords for organic search

5. **Social & Schema:**
   - Open Graph and Twitter Card settings
   - Schema.org structured data (LocalBusiness)
   - Social media links

6. **Exclusions:**
   - Build artifacts
   - Configuration files
   - Backup and temporary files

---

### **Node.js / NPM Configuration**

#### `package.json`
**Purpose:** Node.js project configuration and scripts.

**Key Scripts:**
- `npm run build` - Build CSS + Jekyll site
- `npm run dev` - Development server with watch
- `npm run lint` - Lint JavaScript and CSS
- `npm run test` - Run Playwright E2E tests
- `npm run admin` - Start admin server
- `npm run verify` - Full verification (lint + build + test)

**Dependencies:**
- **Production:** express, bcrypt, helmet (admin server)
- **Development:** eslint, stylelint, playwright (testing)
- **Build Tools:** sass, sharp, imagemin (optimization)

**Engines:** Node.js >= 18.0.0

#### `.npmrc`
**Purpose:** NPM configuration.

**Settings:**
- `save-exact=true` - No version ranges (security)
- `audit-level=moderate` - Security audit threshold
- `engine-strict=true` - Enforce Node version
- `fund=false` - Disable funding messages

---

### **Code Quality Configuration**

#### `.eslintrc.json`
**Purpose:** JavaScript linting rules.

**Configuration:**
- Extends: `eslint:recommended`
- Environment: Browser + ES2021
- Rules:
  - 2-space indentation
  - Single quotes (with escape allowance)
  - Semicolons required (warning)
  - No trailing spaces
  - Console allowed (for transparency)

**Overrides:**
- Node.js scripts: Allow Node globals
- Assets: Ignored from linting

#### `.stylelintrc.json`
**Purpose:** CSS/SCSS linting rules.

**Configuration:**
- Extends: `stylelint-config-standard-scss`
- BEM class naming pattern
- Custom property namespacing
- Modern color functions
- Max nesting depth: 3
- No ID selectors

**Rules:**
- `alpha-value-notation: percentage`
- `color-function-notation: modern`
- `selector-max-id: 0` (no IDs)

#### `.htmlhintrc`
**Purpose:** HTML validation rules.

**Rules:**
- Require DOCTYPE, title, alt attributes
- No duplicate IDs or attributes
- Semantic tags (nav, header, footer)
- Inline script/style warnings

#### `.editorconfig`
**Purpose:** Cross-editor consistency.

**Settings:**
- UTF-8 encoding
- LF line endings (except Windows scripts)
- 2-space indentation
- Trim trailing whitespace
- Insert final newline

**File-Specific:**
- PowerShell: CRLF, 4-space indent
- Markdown: Preserve trailing spaces
- Binary files: No trailing whitespace trimming

#### `.prettierrc`
**Purpose:** Code formatting configuration.

**Settings:**
- 100 character line width
- 2-space indentation
- Single quotes for JS
- Trailing commas (ES5)
- LF line endings

**Overrides:**
- Markdown: 80 char width, wrap always
- HTML: 120 char width
- YAML: Double quotes

---

### **Testing Configuration**

#### `playwright.config.js`
**Purpose:** End-to-end testing configuration.

**Settings:**
- Base URL: http://127.0.0.1:4000
- Timeout: 30s
- Retries: 2 (CI), 0 (local)
- Browsers: Chromium, Firefox, WebKit
- Screenshots and videos on failure

#### `.pa11yci.json`
**Purpose:** Accessibility testing configuration.

**Settings:**
- WCAG 2.1 AA standard
- Specific page URLs to test
- Ignored rules (if any)

---

### **Build Configuration**

#### `netlify.toml`
**Purpose:** Netlify deployment configuration.

**Settings:**
- Build command
- Publish directory
- Environment variables
- Headers and redirects

---

## 🔧 Configuration Best Practices

### **Security**
1. Never commit `.env` files
2. Use `.gitignore` for sensitive files
3. Keep dependencies updated (`npm audit`)
4. Use exact versions in production

### **Performance**
1. Enable incremental builds in development only
2. Exclude unnecessary files from Jekyll
3. Use CSS/JS minification in production
4. Optimize images before committing

### **Maintainability**
1. Document custom configuration
2. Use standard tools where possible
3. Keep configs DRY (don't repeat yourself)
4. Version control all config files

### **Consistency**
1. Use `.editorconfig` for all editors
2. Enforce linting rules in CI
3. Run Prettier before commits
4. Use pre-commit hooks

---

## 📝 Configuration Hierarchy

1. **Git** - Version control and file handling
2. **Editor** - Code style and formatting
3. **Language** - Ruby, Node.js versions
4. **Framework** - Jekyll, Express settings
5. **Build** - Compilation and optimization
6. **Quality** - Linting and testing
7. **Deploy** - Production settings

---

## 🚀 Quick Start

### **First Time Setup**
```bash
# Install Ruby dependencies
bundle install

# Install Node dependencies
npm ci

# Build the site
npm run build

# Start development server
npm run dev
```

### **Daily Development**
```bash
# Watch for changes
npm run dev:watch

# Lint code
npm run lint

# Format code
npm run format

# Run tests
npm test
```

### **Before Commit**
```bash
# Full verification
npm run verify

# Or manually:
npm run lint
npm run build
npm test
```

---

## 🔄 Configuration Updates

When updating configurations:

1. **Test locally first** - Never commit untested changes
2. **Document changes** - Update this file
3. **Check compatibility** - Ensure all tools work together
4. **Run full verification** - `npm run verify`
5. **Commit with clear message** - Explain why the change was made

---

## 📚 Additional Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Stylelint Rules](https://stylelint.io/user-guide/rules/)
- [EditorConfig](https://editorconfig.org/)
- [Prettier Options](https://prettier.io/docs/en/options.html)

---

**Last Updated:** 2026-01-23

**Maintained By:** Tillerstead Development Team
