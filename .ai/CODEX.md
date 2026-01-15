# CODEX.md — Codex Agent Adapter for Tillerstead

**Tool**: Codex-based agents (Cursor, Replit, autonomous AI)  
**Inheritance**: `SYSTEM.md` → `STYLE.md` + `DOMAIN.md` + `COMPLIANCE.md` + `OUTPUT_RULES.md`  
**Purpose**: Authoritative context and operational rules for autonomous coding agents with repository and execution access

---

## INHERITANCE CHAIN

This adapter enforces all rules from:

1. **`SYSTEM.md`** — Master behavioral contract, project context, and operational guardrails
2. **`STYLE.md`** — Brand voice, persuasive copy, and positioning (48 Laws, TCNA/New Jersey HIC authority)
3. **`DOMAIN.md`** — TCNA 2024 standards, New Jersey HIC compliance, technical best practices
4. **`COMPLIANCE.md`** — Legal, accessibility, and consumer protection requirements
5. **`OUTPUT_RULES.md`** — Code quality, naming, formatting, and commit conventions

**Reference each file for full requirements. This adapter is agent-specific.**

---

## AUTONOMOUS AGENT OPERATION

Codex agents differ from conversational assistants:

- **Full repository access**: Read/write, multi-file, and cross-component changes
- **Command execution**: Build, test, lint, preview, and deploy
- **Autonomous workflows**: Multi-step, context-aware, and self-verifying
- **Larger changesets**: Refactors, features, and integrations

**Implications**:
- **Higher risk**: Must avoid breaking builds or introducing regressions
- **Contextual awareness**: Always read current state and dependencies before acting
- **Testing is mandatory**: All changes must be verified before commit
- **Rollback readiness**: Be prepared to revert or isolate changes

---

## AGENT OPERATIONAL RULES

### Pre-Action Checklist

**Before modifying any file:**
1. Read the current file and all dependencies—never assume structure.
2. Validate design tokens and CSS variables exist before referencing.
3. Review related includes, layouts, and data files.
4. Consult `OUTPUT_RULES.md` for naming, structure, and standards.

**Before running any command:**
1. Confirm command syntax (check `package.json` and scripts).
2. Understand side effects (file changes, dependency installs).
3. Verify working directory and environment.
4. Ensure all dependencies are installed (`node_modules/`, Ruby gems).

### Multi-File/Feature Changes

1. **Plan**: List all files and dependencies to be modified.
2. **Order**: Data (`_data/*.yml`) → Components (`_includes/*.html`) → Styles (`_sass/**/*.scss`) → Integration (`_layouts/*.html`, `pages/*.html`).
3. **Test incrementally**: Build and lint after each logical group.
4. **Atomic commits**: Group related changes in a single, descriptive commit.

**Example**:  
_Adding a testimonial section:_
- Create `_data/testimonials.yml` (sample data, descriptive keys)
- Add `_includes/testimonial-card.html` (semantic, accessible markup)
- Style in `_sass/30-components/_testimonial-card.scss` (use tokens)
- Integrate in `_layouts/home.html`
- Compile CSS (`npm run build:css`), build site (`bundle exec jekyll build`), lint (`npm run lint`)
- Commit: `feat(home): add testimonial section with star ratings`

### Build & Lint Workflow

```bash
# SCSS → CSS
npm run build:css

# Jekyll build
bundle exec jekyll build

# Lint all code
npm run lint

# Preview
bundle exec jekyll serve
# Visit http://localhost:4000
```

**Critical**: Always recompile CSS after SCSS changes.

---

## TASK DECOMPOSITION & EXECUTION

### Feature Implementation

1. Break down into data, component, style, and integration steps.
2. Identify all dependencies (design tokens, assets, includes).
3. Sequence: Data → Component → Styles → Integration.
4. Plan and document testing for each step.
5. Use Conventional Commits for all messages.

### Refactoring

1. Read and understand all affected code.
2. Identify all usages and dependencies.
3. Plan migration path (incremental or atomic).
4. Preserve all existing features and accessibility.
5. Update documentation/tests as needed.
6. Commit with clear, scope-specific message.

---

## ERROR HANDLING & RECOVERY

- **Build fails**: Read errors, isolate recent changes, fix incrementally, document the fix.
- **Styles missing**: Confirm CSS compilation, check file paths and `<link>` tags, clear browser cache, verify specificity.
- **Lint errors**: Read and fix all errors, rerun linter, never commit with unresolved issues.

---

## TESTING & VERIFICATION

**Before commit, agent must verify:**
- [ ] Jekyll build passes (`bundle exec jekyll build`)
- [ ] CSS compiles (`npm run build:css`)
- [ ] Linters pass (`npm run lint`)
- [ ] Visual check at `localhost:4000`
- [ ] Accessibility (WCAG 2.1 AA, ARIA, color contrast, keyboard nav)
- [ ] Responsive (320px, 768px, 1024px+)
- [ ] Cross-browser (Chrome, Safari, Firefox)
- [ ] No sensitive data or credentials in code or commit

---

## COMMIT CONVENTIONS

**Format**:
```
<type>(<scope>): <subject>

<body>

<footer>
```
- **Types**: feat, fix, refactor, style, docs, perf, test, chore
- **Scope**: Component, feature, or technical area (e.g., `(hero)`, `(portfolio)`)
- **Subject**: Imperative, ≤72 chars, no period
- **Body**: What/why, not how; reference issues if relevant
- **Footer**: BREAKING CHANGE, closes issues, co-authors

**Example**:
```
feat(portfolio): add filterable portfolio grid

- Add _data/portfolio.yml with project metadata
- Create portfolio-card component with lightbox
- Style grid using design tokens
- Update navigation

Lighthouse: 92 Performance, 100 Accessibility.
```

---

## HUMAN COLLABORATION

- **Ask clarifying questions** when uncertain.
- **Summarize changes** and test results after each task.
- **Pause for review** before major refactors, deletions, or schema changes.
- **Report errors** with context and attempted fixes.

---

## SECURITY, COMPLIANCE & INTEGRITY

- Never commit sensitive data, credentials, or client info.
- Never delete files or run destructive commands without explicit confirmation.
- Always check `.gitignore` and sanitize all user-facing content.
- Follow OWASP and New Jersey HIC/TCNA standards for security and compliance.
- Optimize assets and prevent unnecessary bloat.

---

## EDGE CASES & CONFLICTS

- **Instruction conflicts**: SYSTEM.md > COMPLIANCE.md > STYLE.md > OUTPUT_RULES.md > agent preference. Flag conflicts to human.
- **Dependency changes**: Never auto-update; document, test, and commit separately.
- **Non-standard requests**: Gently push back if violating OUTPUT_RULES.md; explain and offer alternatives.

---

## FINAL VERIFICATION CHECKLIST

- [ ] SYSTEM.md and all domain files consulted
- [ ] OUTPUT_RULES.md conventions enforced (naming, structure, standards)
- [ ] Build and lint pass
- [ ] Visual, accessibility, and responsive checks complete
- [ ] Commit message follows Conventional Commits
- [ ] No sensitive data or non-compliant code
- [ ] All related files and references updated

---

**Version**: 1.0.0  
**Last Updated**: December 20, 2025  
**Tool**: Codex-based agents (Cursor, Replit, autonomous)  
**Authority**: SYSTEM.md + all domain files  
**Key Capability**: Repository access, command execution, autonomous operation, TCNA/New Jersey HIC compliance


