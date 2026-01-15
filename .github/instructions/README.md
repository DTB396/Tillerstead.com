# Legacy Instructions Directory

> ⚠️ **DEPRECATED: All AI governance is now centralized in [`/.ai/`](../../.ai/).**
>
> This directory contains **legacy instruction files**. All authoritative rules, technical standards, and operational guidance are maintained in the centralized AI governance system:
>
> - [`/.ai/SYSTEM.md`](../../.ai/SYSTEM.md): Master behavioral contract, project context, and operational rules
> - [`/.ai/STYLE.md`](../../.ai/STYLE.md): Brand voice, persuasion, and copywriting standards (48 Laws, TCNA/New Jersey HIC positioning)
> - [`/.ai/DOMAIN.md`](../../.ai/DOMAIN.md): Technical authority, TCNA 2024, New Jersey HIC compliance, and trade expertise
> - [`/.ai/COMPLIANCE.md`](../../.ai/COMPLIANCE.md): Legal boundaries, New Jersey Consumer Fraud Act, accessibility, and regulatory requirements
> - [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md): Code quality, naming, formatting, and asset standards
> - [`/.ai/COPILOT.md`](../../.ai/COPILOT.md): GitHub Copilot adaptation (inherits all above)
> - [`/.ai/GPT.md`](../../.ai/GPT.md): ChatGPT adaptation
> - [`/.ai/CODEX.md`](../../.ai/CODEX.md): Autonomous agent adaptation
>
> **Reference [`/.ai/README.md`](../../.ai/README.md) for complete governance and implementation details.**

---

## Migration Status

### ❌ **DEPRECATED FILES** (Superseded by `/.ai/`)

| Legacy File                         | Migrated To                                         | Status     |
| ----------------------------------- | --------------------------------------------------- | ---------- |
| `tcna-nj-hic-trade-expert.md`       | [`/.ai/DOMAIN.md`](../../.ai/DOMAIN.md)             | Deprecated |
| `copy-voice-persuasion-strategy.md` | [`/.ai/STYLE.md`](../../.ai/STYLE.md)               | Deprecated |
| `quality-standards.instructions.md` | [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md) | Deprecated |

> **Do not update or reference these files.** They are retained for historical context only. All technical, legal, and operational changes must be made in the `/.ai/` structure.

### ✅ **SUPPLEMENTAL FILES** (Active, Reference `/.ai/`)

| File                       | Purpose                         | References                                                                                 |
| -------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------ |
| `QA_CHECKLIST.md`          | Manual QA procedures            | [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md)                                        |
| `accessibility-tools.md`   | Accessibility tooling & context | [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md)                                        |
| `build-troubleshooting.md` | Troubleshooting & build process | [`/.ai/OUTPUT_RULES.md`](../../.ai/OUTPUT_RULES.md), [`/.ai/CODEX.md`](../../.ai/CODEX.md) |

> **Supplemental files** provide human-driven QA and troubleshooting. They must reference and comply with the centralized `/.ai/` rules.

---

## Why Centralize Governance?

The legacy system suffered from:

- **Duplication:** Redundant or conflicting rules across files
- **Ambiguity:** No clear hierarchy or precedence
- **Gaps:** Incomplete or tool-specific guidance
- **Maintenance risk:** Updates required in multiple places

**The `/.ai/` structure delivers:**

- **Single source of truth:** All rules, standards, and procedures in one place
- **Explicit hierarchy:** SYSTEM.md → domain/quality/compliance → tool adapters
- **Technical authority:** TCNA/New Jersey HIC standards, legal compliance, and accessibility
- **Easy maintenance:** Update once, propagate everywhere

---

## Contributor Guidance

### Human Developers

1. **Start with [`/.ai/README.md`](../../.ai/README.md)** for governance and standards.
2. **Ignore deprecated files**—do not reference or update legacy instructions.
3. **Use supplemental files** for manual QA and troubleshooting, ensuring all procedures align with `/.ai/` rules.
4. **Make all technical, legal, and copy changes in `/.ai/`**.

### AI Tool Configuration

- **GitHub Copilot:** Use [`/.ai/COPILOT.md`](../../.ai/COPILOT.md)
- **ChatGPT:** Use [`/.ai/GPT.md`](../../.ai/GPT.md)
- **Autonomous Agents:** Use [`/.ai/CODEX.md`](../../.ai/CODEX.md)
- **Never reference `.github/instructions/`**—this directory is deprecated.

---

## Timeline

- **2025-12-20:** Centralized governance launched in `/.ai/`
- **2025-12-20:** Legacy files marked as deprecated
- **Future:** This directory will be archived or removed after full migration

---

## Questions?

- For governance, standards, and implementation: [`/.ai/README.md`](../../.ai/README.md)
- For technical implementation: [`docs/AI-GOVERNANCE-IMPLEMENTATION.md`](../../docs/AI-GOVERNANCE-IMPLEMENTATION.md)

---

**All content, links, and procedures must comply with TCNA 2024, New Jersey HIC, and accessibility standards as defined in `/.ai/`.**

