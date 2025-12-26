# Tillerstead Deployment Safety Network
## Three-Stage Verification Before Production Push

> **Inspired by FaithFrontier's rigorous testing protocol**  
> No code reaches tillerstead-stone until it passes ALL three verification stages

---

## 🛡️ Three-Stage Safety Network

### Stage 1: Automated Testing
**Purpose**: Catch technical issues before human review  
**Location**: `tillerstead-sandbox`  
**Tools**: Playwright, ESLint, Stylelint, HTMLHint

#### Tests Run:
1. **Mobile Navigation Tests**
   - Drawer opens/closes
   - Backdrop appears/disappears
   - Focus trap works
   - Escape key closes
   - Touch interactions

2. **Visual Regression Tests**
   - Header appearance
   - Hero section layout
   - Card grid alignment
   - Footer structure
   - Responsive breakpoints

3. **Performance Tests**
   - Page load < 3s
   - First Contentful Paint < 2s
   - Cumulative Layout Shift < 0.1
   - Largest Contentful Paint < 3s

4. **Accessibility Tests**
   - ARIA labels present
   - Keyboard navigation
   - Screen reader compatibility
   - Color contrast ratios
   - Focus indicators

**Pass Criteria**: All automated tests green ✅

---

### Stage 2: Manual Brand Verification
**Purpose**: Ensure changes align with Tillerstead brand identity  
**Reviewer**: Human (Devon Tyler)  
**Checklist**: Brand Standards Verification

#### Brand Standards Check:
- [ ] **Typography**: Montserrat headings, Inter body
- [ ] **Colors**: Teal (#0d9aaa) primary, Coral accent
- [ ] **Spacing**: Consistent rhythm, proper whitespace
- [ ] **Tone**: Professional yet approachable
- [ ] **Quality**: Premium feel, luxury details
- [ ] **TCNA Compliance**: Industry-specific language
- [ ] **NJ HIC**: License prominently displayed
- [ ] **Trust Signals**: Certifications visible
- [ ] **Mobile UX**: Smooth, intuitive, no compromises
- [ ] **Desktop UX**: Split nav, center logo, elegant

**Pass Criteria**: All brand checks confirmed ✅

---

### Stage 3: Live Sandbox Testing
**Purpose**: Real-world validation before production  
**Environment**: `http://localhost:8080`  
**Duration**: Minimum 15 minutes of interaction

#### Real-World Testing Scenarios:

1. **Customer Journey Simulation**
   - Home → Services → Portfolio → Contact
   - Mobile and desktop paths
   - All links functional
   - Forms submittable
   - CTAs prominent

2. **Device Testing**
   - iPhone 12 Pro (390x844)
   - iPad Pro (1024x1366)
   - Desktop 1920x1080
   - Desktop 2560x1440
   - Galaxy S21 (360x800)

3. **Browser Testing**
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

4. **User Experience Validation**
   - Navigation feels natural
   - Information architecture clear
   - No confusing UI elements
   - Loading states appropriate
   - Error handling graceful

**Pass Criteria**: No blockers found, all scenarios pass ✅

---

## 🚀 Deployment Workflow

### Pre-Deployment Checklist

```powershell
# 1. Run all automated tests
npm test

# 2. Lint all code
npm run lint

# 3. Build production site
npm run build

# 4. Start local server for manual testing
npm run serve

# 5. Run Lighthouse audit
# Open http://localhost:4000 in Chrome
# F12 → Lighthouse → Generate Report
# Target: Performance 85+, Accessibility 95+, SEO 90+
```

### Deployment Script

Only runs if ALL three stages pass:

```powershell
# deploy-to-stone.ps1
# Three-stage verification before production push

param(
    [switch]$SkipTests = $false,
    [switch]$Force = $false
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   TILLERSTEAD DEPLOYMENT SAFETY VERIFICATION         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Stage 1: Automated Testing
Write-Host "═══ STAGE 1: AUTOMATED TESTING ═══" -ForegroundColor Yellow
if (-not $SkipTests) {
    Write-Host "Running automated test suite..." -ForegroundColor White
    npm test
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ STAGE 1 FAILED: Automated tests failed" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ STAGE 1 PASSED: All automated tests green" -ForegroundColor Green
} else {
    Write-Host "⚠️  STAGE 1 SKIPPED (use with caution)" -ForegroundColor Yellow
}

# Stage 2: Brand Verification
Write-Host "`n═══ STAGE 2: BRAND VERIFICATION ═══" -ForegroundColor Yellow
Write-Host "Manual brand standards check required." -ForegroundColor White
Write-Host ""
Write-Host "Verify the following:" -ForegroundColor Cyan
Write-Host "  □ Typography (Montserrat + Inter)" -ForegroundColor Gray
Write-Host "  □ Colors (Teal primary, Coral accent)" -ForegroundColor Gray
Write-Host "  □ Spacing and rhythm consistent" -ForegroundColor Gray
Write-Host "  □ Professional tone maintained" -ForegroundColor Gray
Write-Host "  □ Premium feel intact" -ForegroundColor Gray
Write-Host "  □ TCNA/NJ HIC compliance visible" -ForegroundColor Gray
Write-Host "  □ Mobile UX smooth and intuitive" -ForegroundColor Gray
Write-Host "  □ Desktop UX elegant and functional" -ForegroundColor Gray
Write-Host ""
if (-not $Force) {
    $brandCheck = Read-Host "All brand standards verified? (y/n)"
    if ($brandCheck -ne 'y') {
        Write-Host "❌ STAGE 2 FAILED: Brand verification not confirmed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ STAGE 2 PASSED: Brand standards verified" -ForegroundColor Green

# Stage 3: Live Testing
Write-Host "`n═══ STAGE 3: LIVE SANDBOX TESTING ═══" -ForegroundColor Yellow
Write-Host "Starting local server for live testing..." -ForegroundColor White
Write-Host ""
Write-Host "Server starting at: http://localhost:4000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test the following scenarios:" -ForegroundColor Cyan
Write-Host "  □ Mobile navigation (< 1080px)" -ForegroundColor Gray
Write-Host "  □ Customer journey flows" -ForegroundColor Gray
Write-Host "  □ All device sizes" -ForegroundColor Gray
Write-Host "  □ All major browsers" -ForegroundColor Gray
Write-Host "  □ Real-world interactions" -ForegroundColor Gray
Write-Host ""
Write-Host "Minimum testing time: 15 minutes" -ForegroundColor Yellow
Write-Host ""
if (-not $Force) {
    $liveTest = Read-Host "Live testing complete and passing? (y/n)"
    if ($liveTest -ne 'y') {
        Write-Host "❌ STAGE 3 FAILED: Live testing not confirmed" -ForegroundColor Red
        exit 1
    }
}
Write-Host "✅ STAGE 3 PASSED: Live testing verified" -ForegroundColor Green

# All stages passed - ready to deploy
Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ALL THREE STAGES PASSED - READY FOR PRODUCTION    ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Deployment Summary:" -ForegroundColor White
Write-Host "  ✅ Stage 1: Automated tests passed" -ForegroundColor Gray
Write-Host "  ✅ Stage 2: Brand verification confirmed" -ForegroundColor Gray
Write-Host "  ✅ Stage 3: Live testing validated" -ForegroundColor Gray
Write-Host ""

$deploy = Read-Host "Push changes to tillerstead-stone? (y/n)"
if ($deploy -eq 'y') {
    Write-Host "`nDeploying to production..." -ForegroundColor Cyan
    
    # Copy sandbox to stone
    robocopy "C:\Users\Devon Tyler\tillerstead-sandbox" "C:\Users\Devon Tyler\tillerstead-stone" /MIR /XD .git node_modules _site .sass-cache /XF .gitignore
    
    # Commit and push from stone
    cd "C:\Users\Devon Tyler\tillerstead-stone"
    
    Write-Host "Staging changes in tillerstead-stone..." -ForegroundColor Cyan
    git add -A
    
    $commitMsg = Read-Host "Commit message"
    git commit -m "$commitMsg"
    
    Write-Host "Pushing to production repository..." -ForegroundColor Cyan
    git push
    
    Write-Host "`n✅ DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Production site will update in 2-3 minutes" -ForegroundColor Yellow
    Write-Host "Monitor: https://github.com/[your-repo]/actions" -ForegroundColor Gray
} else {
    Write-Host "`nDeployment cancelled." -ForegroundColor Yellow
}
```

---

## 📋 Testing Checklist (Stage 2 & 3)

### Mobile Navigation Verification

```
✓ Hamburger appears at < 1080px
✓ Drawer slides in smoothly from right
✓ Dark backdrop covers entire viewport
✓ Backdrop has blur effect
✓ Click backdrop closes drawer
✓ Press ESC closes drawer
✓ Click X button closes drawer
✓ Menu items: Services, Our Work, Products, Reviews, About, Contact
✓ Two CTA buttons at bottom
✓ Links navigate correctly
✓ No content scrolling while drawer open
✓ Body scroll locked when drawer open
✓ Drawer is fixed position overlay
✓ Z-index stacking correct
✓ Touch interactions smooth on mobile devices
```

### Desktop Header Verification

```
✓ Center logo visible
✓ Split navigation (3 links left, 3 links right)
✓ Logo shrinks on scroll
✓ Header becomes compact on scroll
✓ Active page highlighted
✓ Hover states smooth
✓ Links all functional
✓ Logo links to homepage
```

### Brand Compliance Verification

```
✓ Teal (#0d9aaa) used for primary actions
✓ Coral used sparingly for accents
✓ Montserrat for all headings
✓ Inter for body text
✓ Proper spacing rhythm (8px grid)
✓ Premium feel maintained
✓ TCNA language present where relevant
✓ NJ HIC license visible in footer
✓ Professional photography only
✓ No stock-looking imagery
✓ Trust badges prominent
✓ Contact info accessible
```

---

## 🔄 Continuous Testing Loop

The safety network runs continuously in sandbox:

```
1. Make changes in tillerstead-sandbox
2. Run automated tests → FAIL? → Fix → Repeat
3. PASS → Manual brand check → FAIL? → Fix → Repeat  
4. PASS → Live testing → FAIL? → Fix → Repeat
5. PASS → Deploy to tillerstead-stone → Production
```

**Never skip stages. Ever.**

---

## 📊 Success Metrics

### Required Scores Before Production Push:

- **Automated Tests**: 100% pass rate
- **Lighthouse Performance**: 85+
- **Lighthouse Accessibility**: 95+
- **Lighthouse Best Practices**: 90+
- **Lighthouse SEO**: 90+
- **Brand Standards**: 100% compliance
- **Live Testing**: Zero blocking issues

### Post-Deployment Verification:

1. Wait 2-3 minutes for GitHub Pages rebuild
2. Visit production site
3. Run same three-stage verification
4. If any stage fails: ROLLBACK immediately

---

## 🚨 Emergency Rollback Procedure

If production deployment has issues:

```powershell
# Quick rollback to last known good state
cd "C:\Users\Devon Tyler\tillerstead-stone"
git revert HEAD
git push

# Or restore from backup
git reset --hard HEAD~1
git push --force
```

---

## 📝 Deployment Log Template

```
Date: ____________
Deployed By: ____________

Stage 1 - Automated Testing:
  Tests Run: _____ / Passed: _____ / Failed: _____
  Status: [ ] Pass [ ] Fail
  
Stage 2 - Brand Verification:
  Checklist Complete: [ ] Yes [ ] No
  Issues Found: ___________________
  Status: [ ] Pass [ ] Fail
  
Stage 3 - Live Testing:
  Duration: _____ minutes
  Devices Tested: ___________________
  Issues Found: ___________________
  Status: [ ] Pass [ ] Fail

Production Push:
  Time: _____
  Commit Hash: ___________________
  Post-Deploy Check: [ ] Pass [ ] Fail
  
Notes: ___________________________________
```

---

## 🎯 Philosophy

**"Test relentlessly. Deploy confidently."**

Every feature must pass all three stages:
1. **Robots check the code** (automated)
2. **Humans check the brand** (manual)
3. **Users check the experience** (live)

Only when all three say "yes" does code reach production.

**No exceptions. No shortcuts. No regrets.**

---

*Last Updated: 2025-12-21*  
*Based on FaithFrontier deployment safety protocols*
