<#
.SYNOPSIS
  Copilot-assisted workflow to diagnose and fix broken mobile nav drawer patterns
  in static/Jekyll sites (or similar). Safe: read-first, then guided edits.

.USAGE
  pwsh -File .\scripts\copilot-nav-fix.ps1 -RepoName "tillerstead" -Paths @("_includes/header.html","_includes/footer.html","assets/css/style.scss")
  pwsh -File .\scripts\copilot-nav-fix.ps1 -RepoName "faithfrontier" -Paths @("_includes/header.html","assets/css/style.scss","assets/js/main.js")

.NOTES
  You can run this in either repo. It generates:
   - .ai/reports/nav-audit.md
   - .ai/prompts/copilot_nav_fix_prompt.md
   - optional patch plan with file targets
#>

param(
  [Parameter(Mandatory=$true)]
  [string]$RepoName,

  [Parameter(Mandatory=$true)]
  [string[]]$Paths,

  [string]$OutDir = ".ai",
  [switch]$NoPrompts
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Ensure-Dir([string]$p) {
  if (-not (Test-Path $p)) { New-Item -ItemType Directory -Path $p | Out-Null }
}

function Read-FileSafe([string]$path) {
  if (-not (Test-Path $path)) { return $null }
  return Get-Content -Raw -Encoding UTF8 $path
}

function Find-NavSignals([string]$text) {
  if (-not $text) { return ,@() }
  $signals = @(
    "nav", "drawer", "menu", "hamburger", "aria-expanded", "aria-controls",
    "data-nav", "data-drawer", "offcanvas", "overlay", "backdrop",
    "z-index", "position: fixed", "transform", "translate", "inert", "aria-modal"
  )
  $hits = @()
  foreach ($s in $signals) {
    if ($text -match [regex]::Escape($s)) { $hits += $s }
  }
  $unique = @($hits | Sort-Object -Unique)
  return ,$unique
}

Ensure-Dir $OutDir
Ensure-Dir (Join-Path $OutDir "reports")
if (-not $NoPrompts) { Ensure-Dir (Join-Path $OutDir "prompts") }

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$reportPath = Join-Path $OutDir "reports/nav-audit.md"

$sections = @()
$sections += "# Mobile Nav Audit — $RepoName"
$sections += ""
$sections += "**Generated:** $timestamp"
$sections += ""
$sections += "## Files scanned"
foreach ($p in $Paths) {
  $sections += "- $p"
}

$sections += ""
$sections += "## Findings (signal-based)"
foreach ($p in $Paths) {
  $content = Read-FileSafe $p
  if (-not $content) {
    $sections += ""
    $sections += "### $p"
    $sections += "_Missing file (skipped)_"
    continue
  }
  $hits = Find-NavSignals $content
  $sections += ""
  $sections += "### $p"
  if ($hits -and $hits.Count -gt 0) { 
    $sections += "**Signals:** " + ($hits -join ", ")
  } else { 
    $sections += "_No obvious nav/drawer signals found_" 
  }
}

$sections += ""
$sections += "## Standard fix checklist (apply to both repos)"
$sections += @(
  "- **Single source of truth state:** one toggle controls open/close; no duplicate toggles.",
  "- **Overlay/backdrop:** `position: fixed; inset: 0;` and above page content (stacking context safe).",
  "- **Drawer panel:** fixed, transforms from offscreen, sized for mobile.",
  "- **Z-index & stacking context:** avoid parent transforms on header wrappers; ensure overlay/drawer in top stacking context. (MDN stacking context guidance.)",
  "- **Scroll lock:** when open, prevent body scroll (`overflow: hidden`).",
  "- **A11y:** button with `aria-expanded` + `aria-controls`; drawer uses dialog-like semantics if modal; focus management + ESC to close. (WAI-ARIA dialog pattern.)"
)

$sections -join "`n" | Set-Content -Encoding UTF8 $reportPath
Write-Host "Wrote audit: $reportPath"

if (-not $NoPrompts) {
  $promptPath = Join-Path $OutDir "prompts/copilot_nav_fix_prompt.md"

  $prompt = @()
  $prompt += "# Copilot Task — Fix Broken Mobile Nav Drawer ($RepoName)"
  $prompt += ""
  $prompt += "You are refactoring the mobile navigation drawer for a static/Jekyll site."
  $prompt += ""
  $prompt += "## Goal"
  $prompt += "- Mobile: nav items are inside a **drawer** (off-canvas) with backdrop overlay."
  $prompt += "- Desktop: horizontal nav visible and aligned."
  $prompt += "- No layout regressions; no duplicate menus."
  $prompt += "- Accessibility: keyboard + screen readers behave correctly."
  $prompt += ""
  $prompt += "## Constraints"
  $prompt += "- Do not add heavy frameworks."
  $prompt += "- Prefer plain JS + semantic HTML."
  $prompt += "- Keep styles scoped; avoid global breaking changes."
  $prompt += ""
  $prompt += "## Files to edit (only if needed)"
  foreach ($p in $Paths) {
    $prompt += "- $p"
  }
  $prompt += ""
  $prompt += "## Required implementation details"
  $prompt += ""
  $prompt += "1) **Toggle button**"
  $prompt += "   - Button with type=button, class=nav-toggle, aria-expanded=false, aria-controls=mobile-drawer"
  $prompt += "   - Updates aria-expanded on open/close."
  $prompt += ""
  $prompt += "2) **Backdrop overlay**"
  $prompt += "   - position: fixed; inset: 0;"
  $prompt += "   - Click backdrop closes drawer."
  $prompt += ""
  $prompt += "3) **Drawer panel**"
  $prompt += "   - position: fixed; top: 0; right: 0; height: 100dvh; width: min(90vw, 360px);"
  $prompt += "   - Uses transform: translateX(100%) when closed; translateX(0) when open."
  $prompt += ""
  $prompt += "4) **Z-index/stacking-context hardening**"
  $prompt += "   - Avoid putting drawer under elements with transforms; place overlay + drawer as direct children of body or the highest layout container."
  $prompt += "   - Use a consistent high z-index on overlay + drawer."
  $prompt += ""
  $prompt += "5) **A11y & behavior**"
  $prompt += "   - ESC closes drawer."
  $prompt += "   - When open: lock page scroll; restore on close."
  $prompt += "   - Initial focus moves into drawer; focus is trapped while open OR at minimum returns to toggle on close."
  $prompt += "   - Use WAI-ARIA dialog pattern semantics if the drawer is modal (recommended)."
  $prompt += ""
  $prompt += "## Output required"
  $prompt += ""
  $prompt += "- Provide a minimal diff-like patch for each edited file."
  $prompt += "- Explain why each change fixes the symptom (overlay behind content, drawer not opening, scroll bleed, focus loss)."
  $prompt += "- Ensure the desktop menu remains unchanged."

  $prompt -join "`n" | Set-Content -Encoding UTF8 $promptPath
  Write-Host "Wrote Copilot prompt: $promptPath"
}

Write-Host "`nNext: open .ai/reports/nav-audit.md and feed .ai/prompts/copilot_nav_fix_prompt.md to Copilot CLI."
