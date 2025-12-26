# Repository Governance - Strict Compliance Rules
**Effective Date:** 2025-12-21  
**Scope:** All tillerstead-* and faithfrontier-* repositories  
**Authority:** Devon Tyler / Faith Frontier Trust

---

## Core Principle: Sandbox → Stone Workflow

**SANDBOX repos** = testing ground (safe to break, experiment, iterate)  
**STONE repos** = production (live sites, protected, verified 3x before merge)

---

## 🔒 MANDATORY RULES

### Rule 1: Never Push Directly to -stone Repos
- All changes MUST be tested in corresponding `-sandbox` repo first
- Minimum 3 verification cycles required before promotion to `-stone`
- Exception: Critical security patches (document in commit message)

### Rule 2: Branch Protection (enforced via .git/hooks)
- `-stone` main branch: protected
- Requires pull request + review (even if self-review documented)
- No force push allowed on `-stone` main branch

### Rule 3: Commit Message Standards
```
type(scope): brief description

[optional body explaining why]
[optional verification steps]

Verified: [x] Local build [x] Responsive [x] A11y
```

**Types:** feat, fix, refactor, docs, style, test, chore, security

### Rule 4: Testing Requirements (Sandbox → Stone)
Before promoting to `-stone`:
1. ✅ Local build succeeds (`npm run build` / Jekyll build)
2. ✅ No console errors (browser DevTools)
3. ✅ Mobile responsive (test 3 breakpoints: 375px, 768px, 1440px)
4. ✅ Accessibility audit (Lighthouse score ≥90)
5. ✅ Cross-browser check (Chrome + Firefox minimum)

### Rule 5: Deployment Safeguards
- `-sandbox`: Can deploy freely to test environments
- `-stone`: Deployment triggers ONLY from `main` branch
- DNS/domain settings: NEVER modify in code (document separately)

### Rule 6: Rollback Plan
Every `-stone` deployment must have:
- Previous commit SHA documented
- One-command rollback ready: `git revert <sha> && git push`

---

## 🛡️ Git Hooks (Auto-Enforced)

### Pre-commit Hook (all repos)
```bash
# Blocks commits with:
- Merge conflicts (<<<<<<)
- Debug statements (console.log in JS, Write-Host in PS)
- TODO/FIXME without issue number
- Secrets/keys pattern match
```

### Pre-push Hook (-stone repos only)
```bash
# Blocks push if:
- Branch is main AND repo ends with -stone
- Commit message doesn't follow standard
- No verification checklist in last 3 commits
```

---

## 📋 Complexity Awareness

### The Rules Understand:
1. **Iteration Speed Matters**
   - Sandbox can move fast (no blocks on experimentation)
   - Stone moves deliberately (quality gates enforced)

2. **Context Switching**
   - Hooks detect which repo you're in
   - Different rules apply automatically
   - Visual indicators in terminal prompt recommended

3. **Emergency Overrides**
   - Set `EMERGENCY_OVERRIDE=true` environment variable
   - Documents override reason in commit
   - Alerts sent to governance log

4. **Cross-Repo Dependencies**
   - Shared assets (CSS frameworks, JS utilities) versioned
   - Changes to shared code require update in BOTH sandbox repos first

---

## 🚨 Violation Handling

### Automated Response
- **Warning:** Non-blocking message (style violations, missing docs)
- **Block:** Prevents commit/push (secrets, force push to stone, missing tests)
- **Alert:** Logs to `.github/governance-log.txt` for review

### Manual Override Process
1. Document reason in `OVERRIDE_LOG.md`
2. Set environment variable: `$env:GOVERNANCE_OVERRIDE = "REASON-CODE"`
3. Complete action
4. Unset variable immediately after
5. Review override in next governance audit

---

## 📂 File Structure

```
repo-root/
├── .github/
│   ├── REPO_RULES.md (this file, symlinked from central governance)
│   ├── governance-log.txt (auto-generated)
│   └── workflows/ (CI/CD with test gates)
├── .git/hooks/
│   ├── pre-commit (enforces code quality)
│   ├── pre-push (enforces stone protection)
│   └── commit-msg (enforces message format)
└── OVERRIDE_LOG.md (manual entries only)
```

---

## 🔄 Sync Protocol (Sandbox → Stone)

### Standard Promotion Flow
```powershell
# In sandbox (after 3x verification)
git checkout main
git pull origin main
git tag "verified-$(Get-Date -Format 'yyyyMMdd-HHmm')"
git push origin --tags

# Switch to stone
cd ../reponame-stone
git checkout main
git pull origin main
git remote add sandbox ../reponame-sandbox
git fetch sandbox
git merge sandbox/main --no-ff -m "Promote: verified changes from sandbox"
# Resolve any conflicts, test once more
git push origin main
```

### Verification Before Merge to Stone
Run automated verification script:
```powershell
.\scripts\verify-promotion.ps1 -SandboxPath ../reponame-sandbox -StonePath .
```

---

## 🎯 Mission Alignment

These rules serve the higher purpose:
- **Protect the live experience** (stone = production dignity)
- **Enable rapid experimentation** (sandbox = innovation freedom)
- **Maintain legal/compliance integrity** (case documents, OPRA records)
- **Honor stewardship principles** (code quality reflects organizational values)

---

## 📞 Questions / Exceptions

For rule clarification or exception requests:
1. Document in issue: `governance: [your question]`
2. Tag with `governance-review`
3. Decision logged in this document's revision history

---

**Version:** 1.0  
**Last Updated:** 2025-12-21  
**Next Review:** 2026-01-21 or after 100 commits (whichever first)
