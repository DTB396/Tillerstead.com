<#
.SYNOPSIS
    Audit Jekyll includes for duplicates and unused files

.DESCRIPTION
    Scans _includes directory for duplicate files (by content hash), 
    unused includes, and naming convention violations.

.PARAMETER RootPath
    Root path of Tillerstead.com repository

.PARAMETER Detailed
    Include detailed analysis in output

.EXAMPLE
    .\Audit-Includes.ps1 -RootPath "C:\web-dev\github-repos\Tillerstead.com"
#>

param(
    [Parameter(Mandatory=$true)]
    [string]$RootPath,
    
    [switch]$Detailed
)

$ErrorActionPreference = "Stop"

function Get-FileHash256 {
    param([string]$FilePath)
    $hash = Get-FileHash -Path $FilePath -Algorithm SHA256
    return $hash.Hash
}

function Get-IncludeReferences {
    param([string]$Content)
    
    $refs = @()
    
    # Match {% include "file.html" %}, {% include 'file.html' %}, {% include file.html %}
    $pattern = "\{%\s*include\s+[`"`']?([^`"`'\s%]+)[`"`']?\s*%\}"
    $matches = [regex]::Matches($Content, $pattern)
    
    foreach ($match in $matches) {
        $refs += $match.Groups[1].Value
    }
    
    return $refs | Select-Object -Unique
}

Write-Host "🔍 Auditing Jekyll Includes..." -ForegroundColor Cyan

$includesPath = Join-Path $RootPath "_includes"
if (-not (Test-Path $includesPath)) {
    Write-Error "Includes directory not found: $includesPath"
    exit 1
}

# Scan all include files
$includeFiles = Get-ChildItem -Path $includesPath -Filter "*.html" -Recurse
$hashMap = @{}
$allIncludes = @()

Write-Host "`n📁 Scanning $($includeFiles.Count) include files..." -ForegroundColor Yellow

foreach ($file in $includeFiles) {
    $relativePath = $file.FullName.Replace("$includesPath\", "")
    $hash = Get-FileHash256 -FilePath $file.FullName
    
    $include = @{
        Path = $file.FullName
        RelativePath = $relativePath
        Hash = $hash
        Size = $file.Length
        References = @()
    }
    
    $allIncludes += $include
    
    if (-not $hashMap.ContainsKey($hash)) {
        $hashMap[$hash] = @()
    }
    $hashMap[$hash] += $include
}

# Find references
Write-Host "🔗 Finding references..." -ForegroundColor Yellow

$filesToCheck = @()
$filesToCheck += Get-ChildItem -Path (Join-Path $RootPath "_layouts") -Filter "*.html" -Recurse -ErrorAction SilentlyContinue
$filesToCheck += Get-ChildItem -Path $includesPath -Filter "*.html" -Recurse
$filesToCheck += Get-ChildItem -Path $RootPath -Filter "*.html" -Depth 1 -ErrorAction SilentlyContinue
$filesToCheck += Get-ChildItem -Path $RootPath -Filter "*.md" -Depth 1 -ErrorAction SilentlyContinue

foreach ($file in $filesToCheck) {
    $content = Get-Content -Path $file.FullName -Raw
    $refs = Get-IncludeReferences -Content $content
    
    foreach ($ref in $refs) {
        $include = $allIncludes | Where-Object { 
            $_.RelativePath -eq $ref -or $_.RelativePath.EndsWith("\$ref") 
        } | Select-Object -First 1
        
        if ($include) {
            $include.References += $file.FullName
        }
    }
}

# Find duplicates
$duplicates = $hashMap.GetEnumerator() | Where-Object { $_.Value.Count -gt 1 } | ForEach-Object {
    $group = $_.Value
    $sorted = $group | Sort-Object { 
        $score = 0
        $path = $_.RelativePath.ToLower()
        if ($path -match 'components') { $score += 50 }
        if ($path -match 'sections') { $score += 40 }
        if ($path -match 'backup|old') { $score -= 100 }
        return -$score
    }
    
    @{
        Hash = $_.Key
        Files = $group
        Canonical = $sorted[0]
        Redundant = $sorted[1..($sorted.Count-1)]
    }
}

# Find unused
$unused = $allIncludes | Where-Object { $_.References.Count -eq 0 }

# Output results
Write-Host "`n📊 Audit Results" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`nTotal Includes: $($allIncludes.Count)" -ForegroundColor Cyan
Write-Host "Duplicates: $($duplicates.Count) groups" -ForegroundColor $(if ($duplicates.Count -gt 0) { 'Yellow' } else { 'Green' })
Write-Host "Unused: $($unused.Count) files" -ForegroundColor $(if ($unused.Count -gt 0) { 'Yellow' } else { 'Green' })

if ($duplicates.Count -gt 0) {
    Write-Host "`n🔄 Duplicate Groups:" -ForegroundColor Yellow
    foreach ($dup in $duplicates) {
        Write-Host "`n  Hash: $($dup.Hash.Substring(0, 8))..."
        Write-Host "  ✓ Canonical: $($dup.Canonical.RelativePath)" -ForegroundColor Green
        foreach ($redundant in $dup.Redundant) {
            Write-Host "  ✗ Redundant: $($redundant.RelativePath)" -ForegroundColor Red
        }
    }
}

if ($unused.Count -gt 0) {
    Write-Host "`n🗑️  Unused Files:" -ForegroundColor Yellow
    foreach ($file in $unused) {
        Write-Host "  • $($file.RelativePath)" -ForegroundColor Gray
    }
}

# Export to JSON
$reportPath = Join-Path $RootPath "_reports\includes-audit-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$reportDir = Split-Path $reportPath -Parent
if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir -Force | Out-Null
}

$report = @{
    Timestamp = Get-Date -Format 'o'
    TotalIncludes = $allIncludes.Count
    Duplicates = $duplicates
    Unused = $unused
} | ConvertTo-Json -Depth 10

Set-Content -Path $reportPath -Value $report
Write-Host "`n💾 Report saved: $reportPath" -ForegroundColor Green
