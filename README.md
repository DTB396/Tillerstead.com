# Tillerstead.com

A fast, client-safe static site for Tillerstead LLC, built with Jekyll and a handcrafted design system. The repo is tuned for long-term maintainability, SEO, and straightforward authoring by developers or content editors.

## At a Glance
- **Platform:** Jekyll static site with custom layouts and includes—no third-party themes.
- **Styling:** SCSS sources in [`src/scss`](src/scss) compiled to [`assets/css`](assets/css).
- **Content:** Markdown posts and pages in [`_posts`](./_posts) and [`pages`](./pages) with data-driven sections in [`_data`](./_data).
- **Templates:** Layouts and shared fragments live in [`_layouts`](./_layouts) and [`_includes`](./_includes).
- **Performance & SEO:** Minified CSS, sitemap, robots directives, and tightly written meta data in [`_config.yml`](./_config.yml) and [`manifest.webmanifest`](./manifest.webmanifest).
- **Deployment:** Suitable for static hosting (Netlify/GitHub Pages); build artifacts live in `_site/` when generated.

## Prerequisites
- **Ruby & Bundler** for Jekyll (`bundle install`).
- **Node.js & npm** for tooling (`npm install`).
- **Sass** and **Sharp** are installed via `npm install`; no global installs required.

## Getting Started
1. Install dependencies:
   - `bundle install`
   - `npm install`
2. Build CSS once:
   - `npm run build:css`
3. Start a local site:
   - `bundle exec jekyll serve`
4. Visit `http://127.0.0.1:4000` to preview.

## Development Workflow
- **Style changes:** Edit `src/scss/theme.scss` (and partials) then run `npm run watch:css` during development or `npm run build:css` for a one-off build.
- **Content updates:** Add or edit Markdown files in `_posts/` for dated content or `pages/` for evergreen pages. Use `_data/` YAML/JSON for repeatable content blocks.
- **Templates:** Modify `_layouts/` for page-level wrappers and `_includes/` for reusable fragments (headers, footers, CTAs).
- **Images:** Use `npm run images:webp` to generate WebP variants in-place under `assets/`.

## Quality & Linting
- Run `npm run lint` before committing to check JavaScript, HTML, and front-end conventions.
- Use `npm run format` to apply Prettier formatting across the project.
- The `build` script keeps compiled CSS compressed for fast page loads.

## SEO & Accessibility Practices
- Page metadata defaults live in `_config.yml`; keep titles, descriptions, and keyword lists relevant to South Jersey property services.
- Prefer semantic HTML in `_layouts/` and `_includes/` for accessibility; linting flags common ARIA issues.
- Keep image alt text descriptive and leverage WebP output for performance.

## Production Build
- Generate a full site (including CSS compilation) with:
  ```sh
  npm run build:site
  ```
- The built site appears in `_site/` and is ready to deploy to any static host (Netlify config is available in `netlify.toml`).

## Project Structure
```
assets/           # Compiled and static assets (CSS, images, fonts)
src/scss/         # Source SCSS for the design system
_includes/        # Reusable HTML partials (navigation, footer, CTAs)
_layouts/         # Page and post layout templates
_posts/           # Blog or update entries (Markdown)
pages/            # Standalone pages (Markdown/HTML)
_data/            # YAML/JSON data powering dynamic sections
scripts/          # Utility scripts (e.g., image conversion)
test/             # Automated tests or fixtures
```

## Contributing
1. Create a feature branch.
2. Keep commits focused and linted (`npm run lint`).
3. Open a pull request with a clear summary and testing notes.

## License
This project is licensed under the MIT License; see [`LICENSE`](LICENSE) for details.
