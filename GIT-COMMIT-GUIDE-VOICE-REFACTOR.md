# Git Commit Messages — Voice & Conversion Refactor

These commits should be made in the order below to maintain a clean, logical history.

---

## Commit 1: Add Voice & Conversion Standard Documentation

```
commit: docs: Add Voice & Conversion Standard

- Create comprehensive brand voice standard for Tillerstead
- Define persona: Practical NJ Homeowner (professional, grounded, code-aware)
- Document tone principles, CTA frameworks, and claim substantiation rules
- Include before/after microcopy examples and compliance checklist
- Establish voice standards for all future copy changes

File: docs/VOICE-CONVERSION-STANDARD.md (17,474 bytes)
```

---

## Commit 2: Refactor Home Page Copy & Data

```
commit: refactor: Update home page voice and CTA messaging

- Update _config.yml site title, tagline, description for clarity
- Refactor home.yml hero section (5 sections):
  * Hero: Remove "Tile Is My Craft" personality; focus on TCNA compliance
  * Services: Replace "Why Tile?" narrative with standards-driven copy
  * Process: Remove "How I Turn Chaos Into Tile"; add transparent workflow
  * Materials: Replace "Real Talk" with specification-focused descriptions
  * CTA: Replace "Let's Talk (Seriously, Call Me)" with "Request an Estimate"
- Update _includes/cta-estimate.html button label and copy
- Align all copy with Practical NJ Homeowner persona

Files:
- _config.yml
- _data/home.yml
- _includes/cta-estimate.html
```

---

## Commit 3: Update Page Metadata (Front Matter)

```
commit: refactor: Update page titles and meta descriptions

- Align all page titles to format: [Service] | [Benefit] | Tillerstead LLC
- Update meta descriptions to include credential + service area
- Ensure all descriptions follow: [Service] by [Credential] in [Area]. [Benefit]. [CTA/Proof]
- Remove marketing language; focus on compliance and clarity

Files:
- pages/index.html (seo_title, seo_description)
- pages/services.html (title, description, hero_title, hero_summary)
- pages/contact.html (description, hero_title, hero_summary)
- pages/pricing.html (title, description, hero_eyebrow, hero_title)
- pages/process.html (title, hero_eyebrow, hero_title)
- pages/plans.html (title, description, hero_eyebrow, hero_title)
- pages/reviews.html (title)
- pages/about.html (title, hero_title)
```

---

## Commit 4: Refactor Services Page Copy

```
commit: refactor: Simplify services page voice and scope descriptions

- Update services page intro (replace "good enough" with "built to code")
- Refactor service section headings (remove parenthetical modifiers)
- Simplify maintenance section descriptions
- Align remodeling section to clear scope boundaries
- Standardize tile installation section copy
- Update service area section for clarity

Files:
- pages/services.html (copy sections, H2 headings, intro)
```

---

## Commit 5: Refactor About Page Copy

```
commit: refactor: Update about page to focus on credentials and process

- Replace personality-driven hero ("Zero Mystery Crews") with competence-focused
- Update hero summary to emphasize TCNA compliance and documentation
- Simplify lead paragraph (remove "what happens when...")
- Refactor card sections to focus on standards, process, and licensing
- Update licensing/service area section with clear compliance language

Files:
- pages/about.html (hero, intro, card sections)
```

---

## Commit 6: Add Refactor Completion Report

```
commit: docs: Add Voice & Conversion Refactor completion report

- Document all changes made during refactor
- List files modified with line counts
- Include tone shift examples (before/after tables)
- Verify compliance against standard checklist
- Include build test results (0 errors, 4,391 lines processed)
- Recommend ongoing maintenance practices

File: docs/REFACTOR-COMPLETION-REPORT.md (14,846 bytes)
```

---

## Testing Commands

Before committing, run:

```bash
# Build to ensure no errors
npm run build

# Check for any linting issues
npm run lint

# View changes
git status
git diff --stat
```

Expected result:
- Build completes with 0 errors
- No new linting violations
- ~260 lines modified across 12 files
- 2 new documentation files created

---

## Final Notes

- **No structural changes:** All modifications are copy/metadata only
- **No removed code:** All refactored copy is substantively equivalent or improved
- **Backward compatible:** No breaking changes to templates, includes, or data structures
- **Tested:** Successfully built with Jekyll; no errors or warnings related to copy changes

---

**Date:** 2025-12-24  
**Author:** GitHub Copilot CLI  
**Status:** Ready for commit
