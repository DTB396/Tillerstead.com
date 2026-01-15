# Tillerstead.com

> **📋 REPOSITORY INDEX:** See [`INDEX.md`](INDEX.md) for complete navigation and file guide.
>
> **⚠️ IMPORTANT:** This repository powers a **Jekyll-based static site generator**. **All changes require a rebuild to take effect.**
>
> ```bash
> npm run build    # Run after EVERY file edit to update the site
> ```
>
> **Homepage issues?** See [BUILD_HELP.md](BUILD_HELP.md) or run `cat BUILD_CHEATSHEET.txt` for troubleshooting.

---

## About Tillerstead LLC

Tillerstead LLC is a New Jersey-licensed home improvement contractor (New Jersey HIC #13VH10808800) specializing in tile, bath, and remodeling. Our work is governed by TCNA 2024 standards and full New Jersey HIC compliance, ensuring technical precision, transparency, and lasting value—contrasting sharply with industry shortcuts.

- **Technical Authority:** All methods, materials, and documentation reflect TCNA and ANSI A108/A118 standards.
- **Compliance:** All site content, contracts, and communications adhere to the New Jersey Consumer Fraud Act and accessibility best practices (see [`_data/compliance.yml`](./_data/compliance.yml)).
- **Transparency:** Every process is documented for client clarity and regulatory audit.

---

## Technology Stack

- **Frontend:** HTML5, CSS3 (SCSS), ES6+ JavaScript
- **Site Generator:** Custom Jekyll (vendored in `vendor/gems/jekyll`)
- **Package Manager:** npm (dev dependencies only)
- **Deployment:** GitHub Pages / Netlify
- **CI/CD:** GitHub Actions

---

## Quick Start

1. **Install dependencies:**
   ```sh
   npm ci
   ```
2. **Build CSS:**
   ```sh
   npm run build:css
   ```
3. **Build the site:**
   ```sh
   npm run build
   ```
4. **Start local server:**
   ```sh
   npm run dev
   ```
   Visit [http://127.0.0.1:4000](http://127.0.0.1:4000) to preview.

---

## Ruby Environment (Windows)

- Install [RubyInstaller 3.1+ with MSYS2](https://rubyinstaller.org/downloads/). Select option 3 to run `ridk install` for DevKit and build tools.
- From PowerShell in the project root:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/activate-ruby.ps1
  ```
  This ensures the Ruby toolchain is on `PATH` for the vendored Jekyll executable.
- If Ruby is in a non-standard directory:
  ```powershell
  powershell -ExecutionPolicy Bypass -File scripts/activate-ruby.ps1 -RubyRoot 'D:\Tools\Ruby32-x64'
  ```
- Re-run the activation script in every new PowerShell session.

---

## Local & Codespaces Development

- **Codespaces:** Auto-builds a dev container with Ruby 3.2 and Node 20. Dependencies install via `npm ci`.
- **Local:** Install Ruby 3.2 and Node 20, then run `npm ci`.
- **Dev server:** `npm run dev` compiles assets, builds `_site`, and serves at `http://127.0.0.1:4000`.
- **Build:** `npm run build` compiles CSS and runs the vendored Jekyll build.
- **Test:** `npm run test` rebuilds and checks internal links/assets for compliance and accessibility.

---

## Authoring & Workflow

- **Design tokens:** Edit `_sass/base/_tokens.scss`
- **Component styles:** Edit `_sass/components/_theme.scss`
- **Content:** Add/edit Markdown in `_posts/` (dated) or `pages/` (evergreen). Use `_data/` YAML/JSON for repeatable blocks.
- **Templates:** Modify `_layouts/` (wrappers) and `_includes/` (partials).
- **Images:** Use `npm run images:webp` to generate WebP variants in `assets/`. All images must have descriptive, standards-compliant alt text (see OUTPUT_RULES.md).

---

## Quality, Linting & Compliance

- **Lint all:** `npm run lint` (JS, HTML, SCSS, front-end conventions)
- **SCSS:** `npm run lint:css` (validate), `npm run lint:css:fix` (auto-fix)
- **Format:** `npm run format` (Prettier)
- **Accessibility:** All content and code must pass accessibility checks (see COMPLIANCE.md).
- **Build:** CSS is compressed for performance; all output is validated for SEO and legal compliance.

---

## SEO & Accessibility

- **Metadata:** Defaults in `_config.yml`—keep titles, descriptions, and keywords specific to South Jersey property services.
- **Semantic HTML:** Required in all layouts/includes for accessibility (see STYLE.md).
- **Alt text:** All images require descriptive, context-specific alt text (see \_data/compliance.yml).
- **WebP:** Use WebP for optimal performance.

---

## Production & Automation

- **Build for deploy:**
  ```sh
  npm run build
  ```
  Output appears in `_site/` for static hosting (Netlify config in `netlify.toml`).
- **CI:** `.github/workflows/ci.yml` runs lint/test on every push/PR and uploads `_site` as an artifact.
- **Pages/Previews:** `.github/workflows/pages.yml` builds for production and publishes preview deployments for PRs.

---

## Project Structure

```
assets/           # Compiled/static assets (CSS, images, fonts)
_sass/            # SCSS sources (tokens, components, utilities)
_includes/        # HTML partials (nav, footer, CTAs)
_layouts/         # Page/post layout templates
_posts/           # Blog/update entries (Markdown)
pages/            # Standalone pages (Markdown/HTML)
_data/            # YAML/JSON powering dynamic sections
scripts/          # Utility scripts (e.g., image conversion)
test/             # Automated tests/fixtures
```

---

## Contributing

1. Create a feature branch.
2. Keep commits focused and linted (`npm run lint`).
3. Open a pull request with a clear summary and testing notes.
4. All contributions must comply with TCNA, New Jersey HIC, and project style/compliance rules (see `.ai/`).

---

## License

MIT License. See [`LICENSE`](LICENSE) for details.

---

**References:**

- [TCNA Handbook 2024](https://www.tcnatile.com/handbook/)
- [New Jersey Consumer Fraud Act](https://www.njconsumeraffairs.gov/Statutes/consumerfraudact.pdf)
- [Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

> **For all technical, legal, and compliance questions, consult the `.ai/` directory and `_data/compliance.yml`.**  
> **All site changes are subject to automated linting, accessibility, and regulatory review.**

