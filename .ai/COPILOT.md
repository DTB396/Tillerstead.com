# COPILOT.md — GitHub Copilot Adapter

**Tool**: GitHub Copilot (Editor Extension + Chat)  
**Inheritance**: `SYSTEM.md` → `STYLE.md` + `DOMAIN.md` + `COMPLIANCE.md` + `OUTPUT_RULES.md`  
**Scope**: Context-specific, standards-driven instructions for Copilot integration in Tillerstead repositories

---

## INHERITANCE CHAIN

This adapter enforces all authoritative rules from:

1. **`SYSTEM.md`**  
   - Master behavioral contract: no fabrication, explicit uncertainty, deterministic outputs  
   - Tillerstead LLC context: New Jersey HIC #13VH10808800, TCNA/ANSI/OSHA compliance  
   - Repository structure, operational rules, verification checklist

2. **`STYLE.md`**  
   - Brand voice: technical, witty, “Anti-Corner-Cutter”  
   - 48 Laws persuasion, power words, contrast, technical specificity  
   - Audience pain points, positioning, tone by context

3. **`DOMAIN.md`**  
   - TCNA 2024/ANSI A108/A118/A137, New Jersey HIC, OSHA, LFT, waterproofing, carpentry, substrate, and trade terminology  
   - Cite standards and material implications in all technical responses

4. **`COMPLIANCE.md`**  
   - New Jersey HIC contract/advertising, payment schedule, 3-day rescission, license display  
   - OSHA, safety, professional ethics, disclaimers

5. **`OUTPUT_RULES.md`**  
   - File naming: kebab-case for HTML/CSS/JS, camelCase for JS variables  
   - Semantic HTML, design tokens, accessibility, mobile-first CSS Grid, ES6+ JS  
   - Performance (Lighthouse ≥90, Core Web Vitals), Conventional Commits, lint/build/test requirements

---

## COPILOT-SPECIFIC INSTRUCTIONS

### Code Completion

- **Always use design tokens** for colors, spacing, typography, shadows  
  _Example_:  
  ```scss
  background: var(--color-primary);
  ```
- **Semantic HTML5** only; never use `<div>` for nav, main, etc.  
  _Example_:  
  ```html
  <nav aria-label="Primary navigation">
  ```
- **Accessibility is non-negotiable**:  
  - All images: descriptive `alt`  
  - All controls: ARIA labels  
  - Keyboard navigation and focus states  
- **Modern CSS**:  
  - Prefer `display: grid; gap: var(--space-4);`  
  - Use utility classes and design tokens  
- **ES6+ JavaScript**:  
  - `const`/`let`, arrow functions, template literals  
  - Error handling required  
- **No hard-coded values** unless justified for legacy support (document in comments)

### Chat Interaction

#### Technical/Tile/Construction

- **Consult `DOMAIN.md` first**  
- **Cite TCNA/ANSI/ISO standards** (e.g., “Per TCNA 2024, §2.2...”)  
- **Use precise trade terminology**: “C2 modified thinset”, “L/360 deflection”, “ANSI A118.10 waterproofing”  
- **Highlight material implications**: “95% thinset coverage required for LFT to prevent tenting”  
- **Always reference New Jersey HIC compliance where relevant**

#### Marketing/Copy

- **Voice per `STYLE.md`**: technical, bold, contrast-driven  
- **Apply 48 Laws**: attention, effortlessness, pain points  
- **Never name competitors**; use contrast and specificity  
- **Match tone to context**: homepage = bold, services = detailed, about = personality  
- **Include required disclaimers and license where needed**

#### Code Generation

- **Follow `OUTPUT_RULES.md`**:  
  - Semantic HTML, design tokens, accessibility  
  - File naming conventions  
  - Error handling in JS  
  - Commit messages: Conventional Commits format  
- **All code must pass HTMLHint, ESLint, and Jekyll build**  
- **Accessibility and performance are mandatory**  
- **No technical debt or shortcuts**

#### Compliance/Legal

- **Consult `COMPLIANCE.md`**  
- **Never generate legal advice**; always include disclaimers  
- **Display HIC license #13VH10808800** where required  
- **Include 3-day rescission, payment schedule, and contract language per NJ law**  
- **Cite source file/section for all compliance requirements**

---

## COPILOT CHAT COMMANDS

- `/tcna [topic]` — Query TCNA/ANSI standards (see `DOMAIN.md` §2)
- `/voice [context]` — Get brand voice/copy guidance (see `STYLE.md` §2)
- `/comply [topic]` — Check legal/compliance (see `COMPLIANCE.md`)
- `/tokens` — List design tokens (see `OUTPUT_RULES.md` §2.2, `_sass/base/_tokens.scss`)
- `/a11y [component]` — Accessibility requirements (see `OUTPUT_RULES.md` §1.3)

---

## WORKSPACE CONTEXT & FILE STRUCTURE

- **Components**: `_includes/` (partials), `_sass/30-components/` (styles)
- **Layouts**: `_layouts/default.html`
- **Data**: `_data/*.yml`
- **Assets**: `assets/img/`, `assets/css/`, `assets/js/`
- **Naming**: kebab-case for files, camelCase for JS variables, descriptive YAML keys
- **SCSS changes**: run `npm run build:css`
- **Jekyll changes**: run `bundle exec jekyll build`
- **Lint before commit**: `npm run lint`, `npx htmlhint`, `npx eslint .`

---

## EDGE CASES & EXCEPTIONS

**Acceptable (must document in commit):**
- Legacy browser fallback (rare, must justify)
- Third-party integration (document inline scripts)
- Performance optimization (inline critical CSS, comment rationale)
- Accessibility always takes precedence

**Unacceptable:**
- Skipping accessibility, hard-coding values, ignoring linter errors, omitting HIC license

---

## VERIFICATION CHECKLIST

Before output, Copilot must confirm:

- [ ] Consulted relevant `.ai/` domain files
- [ ] Used design tokens (no hard-coded values)
- [ ] Included accessibility attributes (ARIA, alt, labels)
- [ ] Semantic HTML structure
- [ ] Conventional Commits format for commit messages
- [ ] Legal compliance (HIC license, disclaimers)
- [ ] Modern web standards (ES6+, CSS Grid, mobile-first)
- [ ] Error handling in JS
- [ ] All code passes HTMLHint, ESLint, Jekyll build

---

## FEEDBACK & LEARNING

- **If uncertain**: ask clarifying questions, suggest options with trade-offs, cite sources, defer to human judgment
- **If corrected**: acknowledge, update context, never argue, offer to update `.ai/` instructions

---

**Version**: 1.0.1  
**Last Updated**: June 2024  
**Tool**: GitHub Copilot (Editor Extension + Chat)  
**Authority**: Inherits from SYSTEM.md (master) + all domain files  
**New Jersey HIC License**: #13VH10808800


