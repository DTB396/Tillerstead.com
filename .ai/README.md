# AI Governance & Instruction Architecture

## Executive Summary

Tillerstead’s AI assistants operate as **precision engineering and documentation agents**, governed by a centralized, version-controlled instruction system. This ensures all AI-driven outputs are **TCNA-compliant**, **New Jersey HIC-aligned**, and meet the highest standards of technical accuracy, legal compliance, and brand integrity.

## Instruction System Structure

```
/.ai/
├── SYSTEM.md          # Authoritative behavioral contract (must-read)
├── STYLE.md           # Brand voice, persuasion, and copywriting standards
├── DOMAIN.md          # TCNA 2024, New Jersey HIC, and technical authority
├── COMPLIANCE.md      # Legal, ethical, and regulatory boundaries
├── OUTPUT_RULES.md    # Code, naming, formatting, and documentation standards
├── COPILOT.md         # GitHub Copilot adaptation (inherits all above)
├── GPT.md             # Chat/API model adaptation
└── CODEX.md           # Agent-style tool adaptation
```

## Core Principles

- **Deterministic**: Identical inputs yield consistent, auditable outputs
- **Explicit & Auditable**: All instructions are versioned, reviewable, and never hidden in prompts
- **Bounded**: Strict constraints prevent drift, speculation, or non-compliance
- **Tool-Agnostic**: Unified rules for Copilot, GPT, Codex, and future AI tools

## Contributor Guidance

- **Source of Truth**: All AI behavior is governed by `/.ai/`—never by ad-hoc prompts
- **Change Control**: Instruction updates require explicit commits and human review
- **Domain Authority**: Technical, legal, and compliance expertise is encoded in `DOMAIN.md` and `COMPLIANCE.md`
- **Quality Assurance**: All AI outputs must pass HTMLHint, ESLint, Jekyll build, and accessibility/performance checks

## AI Tool Protocol

- **Load `SYSTEM.md`** as the master contract—never override or contradict it
- **Reference**: Use `STYLE.md` for voice, `DOMAIN.md` for technical/legal, `OUTPUT_RULES.md` for code/formatting
- **Assumptions**: Clearly label all unknowns; never speculate on compliance or technical matters
- **Escalation**: When uncertain, request clarification—do not guess

## Technical & Compliance Highlights

- **File Naming**: Enforce kebab-case for HTML/CSS/JS, camelCase for JS variables, descriptive YAML keys (see `OUTPUT_RULES.md`)
- **Accessibility**: All alt text, labels, and descriptions must meet WCAG 2.1 AA and New Jersey HIC requirements
- **SEO & Performance**: Outputs must support LCP <2.5s, TTI <3s, CLS <0.1, and include proper meta/structured data
- **Legal**: All content and code must comply with New Jersey Consumer Fraud Act and TCNA 2024 standards

---

**Last Updated**: December 20, 2025  
**Governance Version**: 1.0.0  
**Reference**: See `/.ai/SYSTEM.md` for authoritative rules


