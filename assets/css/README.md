# Tillerstead.com CSS/SCSS Workflow

**Edit only `main.scss` and the partials in `_sass/`.**

- All site styles are managed through `assets/css/main.scss`, which imports modular partials from the `_sass/` directory.
- Do not edit compiled CSS files (`main.css`, `style.css`) directly. They are generated from SCSS.
- Design tokens and variables should live in `_sass/00-settings/` and be imported at the top of `main.scss`.
- If you need to add new styles, create or update a partial in `_sass/` and import it in `main.scss`.
- Legacy or experimental CSS files have been removed for clarity and maintainability.

**Build process:**
- SCSS is compiled to compressed CSS as configured in `_config.yml`.
- Only reference the compiled `main.css` in your site templates.

---

For questions, see the comments at the top of `main.scss` or contact the site maintainer.
