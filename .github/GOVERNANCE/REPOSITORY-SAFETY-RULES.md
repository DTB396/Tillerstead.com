# Repository Safety & Governance Rules

**Effective Date:** December 21, 2025  
**Applies To:** tillerstead-sandbox, tillerstead-stone, faithfrontier-sandbox, faithfrontier-stone

---

## Core Principles

1. **Sandbox = Testing Ground** — All experimental work, automation, and untested changes happen here first.
2. **Stone = Production** — Only tested, verified (3x minimum), high-quality code goes to stone repos.
3. **No Direct Stone Edits** — Never make changes directly in stone repos unless emergency hotfix.
4. **Protection Over Speed** — Guardrails prevent broken code from reaching production while maintaining development velocity.

---

## Mandatory Workflow

```
sandbox (test 3x) → verify → manual promotion → stone (production)
```

### Development Cycle

1. **Work in sandbox:**
   - Make all changes in `-sandbox` repos
   - Test thoroughly (minimum 3 verification passes)
   - Run build, lint, accessibility checks
   - Manual QA on mobile + desktop

2. **Verify before promotion:**

   ```powershell
   cd tillerstead-sandbox
   npm run build
   npm run build:css
   # Manual testing + verification
   ```

3. **Promote to stone (manual only):**

   ```powershell
   # From sandbox directory
   git remote add stone git@github.com:xtx33/tillerstead-stone.git
   git push stone main
   ```

4. **Never push directly to stone:**
   - Stone repos should have branch protection
   - All changes flow sandbox → stone
   - Stone is always stable, deployable

---

## Pre-Commit Safeguards

### Sandbox Repos (.github/hooks/pre-commit)

- ✅ Allow all commits
- ✅ Run basic syntax checks
- ✅ Warning on large file additions
- ⚠️ Reminder: "Testing in sandbox - verify 3x before stone"

### Stone Repos (.github/hooks/pre-commit)

- ❌ Block direct commits (require --no-verify override for emergencies)
- ✅ Require commit message referencing sandbox verification
- ✅ Run full build + test suite
- ✅ Check for common errors (console.logs, debugger statements, TODO comments)
- ⚠️ Force confirmation: "Are you promoting tested code from sandbox?"

---

## Git Remote Structure

Each sandbox should have two remotes:

```bash
origin  → sandbox repo (default push)
stone   → production repo (manual promotion only)
```

**Check remotes:**

```powershell
git remote -v
```

**Expected output (sandbox):**

```
origin  git@github.com:xtx33/tillerstead-sandbox.git (fetch)
origin  git@github.com:xtx33/tillerstead-sandbox.git (push)
stone   git@github.com:xtx33/tillerstead-stone.git (fetch)
stone   git@github.com:xtx33/tillerstead-stone.git (push)
```

---

## Protection Mechanisms

### 1. Branch Protection (GitHub Settings - Stone Repos)

- ✅ Require pull request reviews (optional but recommended)
- ✅ Require status checks to pass
- ✅ Prevent force pushes
- ✅ Prevent branch deletion

### 2. Local Git Hooks

Pre-commit hooks warn/block based on repo type:

- **Sandbox:** Warn, allow
- **Stone:** Block, require explicit override

### 3. PowerShell Guards (Optional)

Helper scripts that check:

```powershell
# Safe push wrapper
function Safe-Push {
    $repoPath = (Get-Location).Path
    if ($repoPath -like "*-stone*") {
        Write-Warning "⚠️  STONE REPO DETECTED"
        Write-Warning "Have you verified this code 3x in sandbox?"
        $confirm = Read-Host "Type 'PROMOTE' to continue"
        if ($confirm -ne "PROMOTE") {
            Write-Error "Push cancelled. Test in sandbox first."
            return
        }
    }
    git push @args
}
```

### 4. Copilot CLI Context Awareness

When working in terminal:

- Tool always checks current working directory
- Warns if operations target stone repos
- Suggests sandbox-first workflow
- Refuses destructive operations on stone without explicit confirmation

---

## Emergency Hotfix Protocol

If production (stone) has critical bug:

1. **Assess severity** — Is this user-impacting?
2. **Quick fix in stone** (if truly urgent):
   ```powershell
   cd tillerstead-stone
   # Make minimal fix
   git commit -m "HOTFIX: [description] - bypassing sandbox for emergency"
   git push --no-verify
   ```
3. **Immediately backport to sandbox:**
   ```powershell
   cd tillerstead-sandbox
   git cherry-pick <hotfix-commit-sha>
   git push origin main
   ```

---

## Compliance Checklist

Before every stone promotion:

- [ ] Code tested 3x in sandbox
- [ ] Build succeeds (`npm run build`)
- [ ] CSS compiles (`npm run build:css`)
- [ ] Mobile + desktop manually verified
- [ ] No console errors in browser
- [ ] Accessibility checks pass
- [ ] Links work, images load
- [ ] Navigation functional (mobile drawer)
- [ ] Footer readable (contrast)
- [ ] Git commit references sandbox work

---

## Repo Naming Convention

| Type    | Pattern     | Purpose              | Domain        |
| ------- | ----------- | -------------------- | ------------- |
| Sandbox | `*-sandbox` | Development, testing | Local/preview |
| Stone   | `*-stone`   | Production, stable   | Live DNS      |

---

## Questions & Clarifications

**Q: What if I need to work fast?**  
A: Work in sandbox as fast as you want. Just verify 3x before stone.

**Q: Can I commit broken code to sandbox?**  
A: Yes! Sandbox is for experimentation. Break things, learn, fix.

**Q: What if I accidentally push to stone?**  
A: Immediately test the live site. If broken, revert commit or hotfix. Then backport fix to sandbox.

**Q: How do I know which repo I'm in?**  
A: Check terminal prompt, run `pwd` or `git remote -v`. Add repo name to PS1 prompt.

---

## Enforcement

- These rules are **mandatory** for all repos under Faith Frontier and Tillerstead projects
- Violations risk production outages and user trust
- When in doubt: **sandbox first, stone later**

---

**Maintained by:** Devon Tyler  
**Repository Stewardship:** Faith Frontier Trust  
**Last Updated:** 2025-12-21

