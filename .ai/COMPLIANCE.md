# COMPLIANCE.md — Legal, Ethical & Safety Boundaries (Deployment-Friendly)

---

**Inheritance**: `SYSTEM.md` → `COMPLIANCE.md`
**Scope**: Legal mandates, ethical constraints, safety protocols, and AI content boundaries
**Applies to**: Public website content, marketing copy, estimates/templates, educational content, and AI-generated text

## Primary Authorities (NJ / Federal / Standards)

* **NJ Consumer Fraud Act (CFA)**: *N.J.S.A. 56:8-1 et seq.*
* **NJ Home Improvement Contractors Act (HICA)**: *N.J.S.A. 56:8-136 et seq.*
* **NJ Home Improvement Practices Regulations**: *N.J.A.C. 13:45A-16 et seq.* *(verify exact subsection when quoting contract terms)*
* **OSHA Construction Safety**: 29 CFR 1926 (incl. silica 1926.1153)
* **TCNA Handbook / ANSI A108/A118/A136.1** (tile standards)
* **EPA RRP**: 40 CFR 745 (lead-safe renovations where applicable)
* **ADA**: 2010 Standards (where applicable to project scope)

---

## 1) Purpose

This document prevents illegal, deceptive, or unsafe output—**without blocking unrelated deployments**.

**Compliance must do two things:**

1. **Protect users and the business** (law/safety/truth-in-advertising).
2. **Help deployments succeed** by proposing edits when content fails checks.

**Rule of thumb**: If content changes are unrelated to regulated claims (e.g., blog formatting, nav links, spelling fixes), compliance should **warn, not block**.

---

## 2) Enforcement Model (What Blocks vs What Warns)

All checks fall into one of three severities:

### A. BLOCKER (must block publish)

Block only when there’s a real risk of illegality, deception, or serious safety harm.

**Examples (Blockers):**

* False license/certification claims (or missing license number in ads where required)
* Fabricated testimonials/reviews
* Guaranteed outcomes (“100% waterproof”, “guaranteed to increase value”)
* Unsafe instructions presented as safe (e.g., silica dust cutting without PPE/controls)
* Illegal guidance (evading permits, bypassing safety rules)
* Medical/health claims

### B. REQUIRED (must be fixed before release *only if the page is in a regulated category*)

These are mandatory **only** when the page is:

* an advertisement/marketing page,
* a proposal/estimate template,
* a service page intended to solicit paid work,
* or a page that includes safety-sensitive how-to guidance.

**Examples (Required in regulated contexts):**

* HIC license disclosure on marketing/ads/service pages
* Clear disclaimers on DIY/safety content
* No misleading price/time promises

### C. RECOMMENDED (never blocks)

Best practices that improve professionalism and reduce dispute risk—**warnings only**.

**Examples (Recommended):**

* Adding photo-permission reminders
* Adding “unforeseen conditions” estimate note
* Accessibility-friendly language and options

---

## 3) Page Classification (So Compliance Knows When To Enforce)

Every page should be treated as one of the following:

1. **MARKETING** (service pages, landing pages, ads, promotional posts)
2. **ESTIMATE/CONTRACT TEMPLATE** (proposal text, contract clauses, pricing tables)
3. **EDUCATIONAL/DIY** (how-to, guides, tutorials)
4. **GENERAL** (mission, about, photo galleries, blog reflections, site updates)

**Default classification = GENERAL** unless the content clearly markets services, quotes pricing, or provides DIY instruction.

---

## 4) NJ HIC Disclosures (Only When Applicable)

### Business Identity (use in MARKETING + ESTIMATE/CONTRACT contexts)

* **Legal Business Name**: Tillerstead LLC
* **NJ HIC Registration Number**: **13VH10808800**
* **Trade Scope**: Carpentry, Ceramic Tile, Waterproofing *(ensure scope matches what you actually offer/are registered for)*

**Marketing Disclosure (recommended placement)**
Include on service pages, landing pages, and ad copy footers:

> Licensed New Jersey Home Improvement Contractor (HIC) #13VH10808800 — Tillerstead LLC

---

## 5) Contract / Estimate Requirements (Templates Only)

When generating contracts or estimates intended for signature, include (at minimum):

* Contractor legal name + business address + phone
* Prominent HIC registration number
* Detailed scope of work
* Itemized pricing and allowances
* Start date and substantial completion target (or clearly stated scheduling method)
* Payment schedule tied to milestones
* Change order process (written, priced, signed)
* Warranty terms (what’s covered / excluded)
* Dispute handling process
* Cancellation / rescission notice where required under NJ home improvement rules
  *(If you include a rescission clause, quote from your verified template language—do not freestyle statutory wording.)*

---

## 6) Advertising & Marketing Rules (MARKETING Only)

### Required

* No false/misleading claims
* Include HIC number where required/appropriate
* Do not claim certifications you don’t hold

### Prohibited (Blockers)

* “Lowest prices guaranteed” (unless you have a documented policy)
* “Fastest in New Jersey” (unless substantiated)
* “100% waterproof guarantee”
* Comparative claims without evidence
* Fake reviews/testimonials
* Stock photos presented as your work

### Allowed (if true)

* “TCNA/ANSI-aligned installation methods” *(don’t imply certification—just method alignment)*
* “Written estimates provided” *(only if operationally true)*

---

## 7) Safety & DIY Content Rules (EDUCATIONAL/DIY Only)

If the content teaches methods that can create hazard (silica dust, demolition, lead, electrical, structural), it must include:

* PPE/controls callouts (silica, ventilation, eye protection)
* A “know your limits / hire a pro” disclaimer

### DIY Disclaimer (safe default)

> Educational content only. Construction work can create serious safety and property risks. Follow manufacturer instructions, applicable codes, and safety standards. If you’re not qualified, hire a licensed professional.

---

## 8) Environmental & Lead/Asbestos (When Older Homes or Demo Is Mentioned)

If the content references work that disturbs painted surfaces or older flooring:

* Mention lead-safe practices / EPA RRP applicability
* Recommend testing when suspect materials are present (lead/asbestos)

Keep it factual; avoid giving “how to bypass” steps.

---

## 9) Data Privacy & Photo Permissions (All Contexts)

* Don’t publish client addresses, identifying details, invoices, or private messages
* Don’t publish jobsite photos for marketing without permission
* Blur plates, faces, house numbers, and identifying details when unsure

---

## 10) Warranty & Insurance Statements (Truth-Only)

Only state warranty duration and insurance coverage if accurate and current.

If you publish warranty language:

* Define coverage clearly (workmanship vs manufacturer materials)
* Define exclusions (impact damage, maintenance failures, unauthorized repairs)

---

## 11) AI Content Rules (Applies Everywhere)

### Hard Prohibitions (Blockers)

* Fabricated reviews/testimonials
* False claims about licenses/certifications
* “Guaranteed” results
* Legal advice presented as counsel
* Medical/health claims

### Required Disclaimers (Context-Based)

* **Pricing/estimates**: “Prices vary by site conditions/material selections.”
* **DIY/how-to**: educational + safety disclaimer (see §7)

---

## 12) Deployment Rule: Compliance Must Help Fix Failures

When a compliance check fails, the enforcement mechanism must output:

1. **Severity** (BLOCKER / REQUIRED / RECOMMENDED)
2. **Exact failing text snippet** (or file + line range)
3. **Why it fails** (one sentence)
4. **A proposed patch** (replacement text that passes)
5. **The minimal-change option** (smallest edit to unblock)

**No “just block” behavior is acceptable** unless it’s a BLOCKER.

---

## 13) Minimal Compliance Checklist (Fast + Practical)

### For MARKETING pages

* [ ] HIC # appears somewhere appropriate
* [ ] No guarantees / no fake reviews / no unprovable superlatives
* [ ] No claims of certifications unless verified

### For EDUCATIONAL/DIY pages

* [ ] DIY safety disclaimer present
* [ ] Safety hazards mentioned where relevant (silica, PPE, ventilation)

### For ESTIMATE/CONTRACT templates

* [ ] Business identity + HIC #
* [ ] Scope, pricing, dates/scheduling method, change orders, warranty
* [ ] Uses verified cancellation language from your approved template

### For GENERAL pages

* [ ] No privacy leaks
* [ ] No false claims
  *(Never block GENERAL unless it trips a BLOCKER rule.)*

---

**Version**: 2.0.0 (deployment-friendly)
**Last Updated**: 2026-01-02
**Owner**: Tillerstead LLC Compliance Controls

---

